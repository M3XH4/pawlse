<?php

use App\Models\ContactMessage;
use App\Models\User;
use App\Notifications\ContactMessageReceivedNotification;
use Illuminate\Contracts\Notifications\Dispatcher;
use Illuminate\Contracts\Notifications\Factory;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\ChannelManager;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

test('public visitor can submit contact message and notification is sent', function () {
    Notification::fake();

    $response = $this->post(route('contact.store'), [
        'name' => 'Maria Clara',
        'email' => 'maria@example.com',
        'phone' => '09171234567',
        'category' => 'general',
        'subject' => 'Inquiry about shelter visit hours',
        'message' => 'Hello, I would like to ask if your shelter is open for visitors this coming Saturday morning.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $response->assertInertiaFlash('toast');

    $this->assertDatabaseHas('contact_messages', [
        'name' => 'Maria Clara',
        'email' => 'maria@example.com',
        'phone' => '09171234567',
        'category' => 'general',
        'subject' => 'Inquiry about shelter visit hours',
        'status' => 'unread',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'contact_message_submitted',
    ]);

    Notification::assertSentOnDemand(
        ContactMessageReceivedNotification::class,
        function (ContactMessageReceivedNotification $notification, array $channels, AnonymousNotifiable $notifiable) {
            return $notifiable->routes['mail'] === (config('mail.from.address') ?: 'hello@pawlse.org')
                && $notification->contactMessage->email === 'maria@example.com';
        }
    );
});

test('authenticated user attaches user_id to contact message', function () {
    Notification::fake();

    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('contact.store'), [
        'name' => $user->name,
        'email' => $user->email,
        'category' => 'volunteer',
        'subject' => 'Question regarding volunteer weekend schedule',
        'message' => 'I would like to check if I can participate in the Sunday feeding route this week.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('contact_messages', [
        'user_id' => $user->id,
        'email' => $user->email,
        'category' => 'volunteer',
    ]);
});

test('submitting contact message requires valid data', function () {
    $response = $this->post(route('contact.store'), [
        'name' => '',
        'email' => 'not-an-email',
        'category' => 'invalid-category',
        'subject' => '',
        'message' => 'short',
    ]);

    $response->assertSessionHasErrors(['name', 'email', 'category', 'subject', 'message']);
});

test('boundary validation enforces message limits and accepts valid categories', function () {
    // Exactly 9 chars message should fail (min: 10)
    $responseUnderMin = $this->post(route('contact.store'), [
        'name' => 'Test User',
        'email' => 'user@example.com',
        'category' => 'general',
        'subject' => 'Valid Subject',
        'message' => str_repeat('a', 9),
    ]);
    $responseUnderMin->assertSessionHasErrors(['message']);

    // Over 3000 chars message should fail (max: 3000)
    $responseOverMax = $this->post(route('contact.store'), [
        'name' => 'Test User',
        'email' => 'user@example.com',
        'category' => 'general',
        'subject' => 'Valid Subject',
        'message' => str_repeat('a', 3001),
    ]);
    $responseOverMax->assertSessionHasErrors(['message']);

    // Over 255 chars subject should fail
    $responseOverSubject = $this->post(route('contact.store'), [
        'name' => 'Test User',
        'email' => 'user@example.com',
        'category' => 'general',
        'subject' => str_repeat('b', 256),
        'message' => 'This is a valid message length.',
    ]);
    $responseOverSubject->assertSessionHasErrors(['subject']);

    // Test all valid categories succeed
    $validCategories = ['general', 'adoption', 'volunteer', 'donation', 'shelter_visit', 'partnership', 'other'];
    foreach ($validCategories as $category) {
        $response = $this->post(route('contact.store'), [
            'name' => 'Valid User',
            'email' => 'valid@example.com',
            'category' => $category,
            'subject' => "Testing category {$category}",
            'message' => 'This is a valid test message for QA verification.',
        ]);
        $response->assertSessionHasNoErrors();
    }
});

test('notification mail generates correct headers, subject, and reply-to', function () {
    $contactMessage = ContactMessage::factory()->create([
        'name' => 'Juan Luna',
        'email' => 'juan@example.com',
        'phone' => '09181234567',
        'category' => 'adoption',
        'subject' => 'Inquiring about adopting Luna the dog',
        'message' => 'I would love to adopt Luna and meet her this weekend.',
    ]);

    $notification = new ContactMessageReceivedNotification($contactMessage);
    $mailMessage = $notification->toMail((object) []);

    expect($mailMessage->subject)->toContain('[PAWLSE Contact] Adoption Inquiry: Inquiring about adopting Luna the dog')
        ->and($mailMessage->replyTo)->toHaveCount(1)
        ->and($mailMessage->replyTo[0])->toBe(['juan@example.com', 'Juan Luna'])
        ->and($mailMessage->introLines)->toContain('• **Name:** Juan Luna')
        ->and($mailMessage->introLines)->toContain('• **Email:** juan@example.com')
        ->and($mailMessage->introLines)->toContain('• **Phone:** 09181234567');
});

test('contact submission remains resilient and saves to database even if mail server fails', function () {
    $channelManager = Mockery::mock(ChannelManager::class);
    $channelManager->shouldReceive('route')->andReturnSelf();
    $channelManager->shouldReceive('notify')->andThrow(new RuntimeException('Connection to SMTP server timed out'));
    app()->instance(Dispatcher::class, $channelManager);
    app()->instance(Factory::class, $channelManager);

    Log::shouldReceive('warning')
        ->once()
        ->withArgs(function ($message) {
            return str_contains($message, 'Failed to dispatch contact message email notification');
        });

    $response = $this->post(route('contact.store'), [
        'name' => 'Offline SMTP User',
        'email' => 'smtp-test@example.com',
        'category' => 'donation',
        'subject' => 'In-kind pet food donation',
        'message' => 'We have 5 sacks of adult dog food to deliver to your shelter.',
    ]);

    // Should NOT crash with 500
    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $response->assertInertiaFlash('toast');

    // Message must still be safely stored in the database
    $this->assertDatabaseHas('contact_messages', [
        'email' => 'smtp-test@example.com',
        'subject' => 'In-kind pet food donation',
    ]);
});

test('rate limiting protects contact endpoint from automated spam flooding', function () {
    Notification::fake();

    // 5 attempts allowed in a minute
    for ($i = 0; $i < 5; $i++) {
        $response = $this->post(route('contact.store'), [
            'name' => "User {$i}",
            'email' => "user{$i}@example.com",
            'category' => 'general',
            'subject' => 'Spam throttle test',
            'message' => 'Checking rate limit threshold.',
        ]);
        $response->assertSessionHasNoErrors();
    }

    // 6th attempt should be blocked with 429 Too Many Requests
    $response = $this->post(route('contact.store'), [
        'name' => 'Spammer',
        'email' => 'spammer@example.com',
        'category' => 'general',
        'subject' => 'Spam overflow',
        'message' => 'This should trigger rate limiting.',
    ]);

    $response->assertStatus(429);
});

test('home page and about page render successfully with contact sections', function () {
    $homeResponse = $this->get(route('home'));
    $homeResponse->assertOk();

    $aboutResponse = $this->get(route('about'));
    $aboutResponse->assertOk();
});

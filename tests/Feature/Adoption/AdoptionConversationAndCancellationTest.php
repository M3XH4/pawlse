<?php

use App\Enums\AdoptionApplicationStatus;
use App\Enums\Role;
use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\ShelterAnimal;
use App\Models\User;
use App\Notifications\AdoptionApplicationMessageNotification;
use App\Notifications\AdoptionApplicationStatusUpdatedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('admin can request additional info and email applicant with track link', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->syncRoles([Role::Admin]);

    $animal = ShelterAnimal::factory()->create();
    $application = AdoptionApplication::factory()->create([
        'user_id' => null,
        'shelter_animal_id' => $animal->id,
        'status' => AdoptionApplicationStatus::Pending,
        'email' => 'applicant@example.com',
        'full_name' => 'Jane Doe',
    ]);

    $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.messages.store', $application), [
            'message' => 'Please upload a photo of your fenced backyard.',
            'request_info' => true,
        ])
        ->assertRedirect(route('account.admin.adoption-management'));

    $application->refresh();
    expect($application->status)->toBe(AdoptionApplicationStatus::NeedsInfo)
        ->and($application->messages)->toHaveCount(1)
        ->and($application->messages->first()->sender_type)->toBe('admin')
        ->and($application->messages->first()->message)->toBe('Please upload a photo of your fenced backyard.');

    Notification::assertSentOnDemand(
        AdoptionApplicationStatusUpdatedNotification::class,
        function (AdoptionApplicationStatusUpdatedNotification $notification, array $channels, AnonymousNotifiable $notifiable) use ($application): bool {
            $mail = $notification->toMail($notifiable);
            $ref = 'ADP-'.str_pad((string) $application->id, 5, '0', STR_PAD_LEFT);

            return ($notifiable->routes['mail'] ?? null) === 'applicant@example.com'
                && str_contains($mail->actionUrl, $ref)
                && str_contains($mail->actionUrl, 'applicant%40example.com');
        }
    );
});

test('public applicant on track page can reply with requirement images and transition needs_info back to pending', function () {
    Notification::fake();
    Storage::fake('public');

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->syncRoles([Role::Admin]);

    $animal = ShelterAnimal::factory()->create();
    $application = AdoptionApplication::factory()->create([
        'user_id' => null,
        'shelter_animal_id' => $animal->id,
        'status' => AdoptionApplicationStatus::NeedsInfo,
        'email' => 'applicant@example.com',
        'full_name' => 'Jane Doe',
    ]);

    $ref = 'ADP-'.str_pad((string) $application->id, 5, '0', STR_PAD_LEFT);
    $photo = UploadedFile::fake()->image('backyard-fence.jpg', 600, 400);

    $this->post(route('track.adoption-applications.messages.store', $application), [
        'reference' => $ref,
        'email' => 'applicant@example.com',
        'message' => 'Here is the photo of our fenced yard.',
        'attachments' => [$photo],
    ])->assertRedirect();

    $application->refresh();
    expect($application->status)->toBe(AdoptionApplicationStatus::Pending)
        ->and($application->messages)->toHaveCount(1);

    $savedMsg = $application->messages->first();
    expect($savedMsg->sender_type)->toBe('user')
        ->and($savedMsg->attachments)->toHaveCount(1);

    Storage::disk('public')->assertExists($savedMsg->attachments[0]['path']);

    Notification::assertSentTo($admin, AdoptionApplicationMessageNotification::class);
});

test('public user with mismatched email cannot reply or cancel adoption application', function () {
    $animal = ShelterAnimal::factory()->create();
    $application = AdoptionApplication::factory()->create([
        'user_id' => null,
        'shelter_animal_id' => $animal->id,
        'status' => AdoptionApplicationStatus::Pending,
        'email' => 'owner@example.com',
    ]);

    $ref = 'ADP-'.str_pad((string) $application->id, 5, '0', STR_PAD_LEFT);

    $this->post(route('track.adoption-applications.messages.store', $application), [
        'reference' => $ref,
        'email' => 'intruder@example.com',
        'message' => 'Unauthorized reply',
    ])->assertForbidden();

    $this->post(route('track.adoption-applications.cancel', $application), [
        'reference' => $ref,
        'email' => 'intruder@example.com',
    ])->assertForbidden();
});

test('admin rejecting an application emails the reason and displays it on the track page', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->syncRoles([Role::Admin]);

    $animal = ShelterAnimal::factory()->create();
    $application = AdoptionApplication::factory()->create([
        'user_id' => null,
        'shelter_animal_id' => $animal->id,
        'status' => AdoptionApplicationStatus::Pending,
        'email' => 'rejected@example.com',
    ]);

    $reason = 'Landlord does not allow large dogs in the apartment.';

    $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.update-status', $application), [
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ])
        ->assertRedirect(route('account.admin.adoption-management'));

    Notification::assertSentOnDemand(
        AdoptionApplicationStatusUpdatedNotification::class,
        function (AdoptionApplicationStatusUpdatedNotification $notification, array $channels, AnonymousNotifiable $notifiable) use ($reason): bool {
            $html = (string) $notification->toMail($notifiable)->render();

            return ($notifiable->routes['mail'] ?? null) === 'rejected@example.com'
                && str_contains($html, $reason);
        }
    );

    $ref = 'ADP-'.str_pad((string) $application->id, 5, '0', STR_PAD_LEFT);

    $this->get(route('track', ['reference' => $ref, 'email' => 'rejected@example.com']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('track')
            ->where('item.status', 'rejected')
            ->where('item.rejection_reason', $reason)
        );
});

test('applicant can cancel scheduled adoption application from dashboard or track page and admin sees cancelled status', function () {
    Notification::fake();

    $user = User::factory()->create(['role' => Role::User->value]);
    $user->syncRoles([Role::User]);

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->syncRoles([Role::Admin]);

    $animal = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Pending]);
    $application = AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'shelter_animal_id' => $animal->id,
        'status' => AdoptionApplicationStatus::Scheduled,
        'email' => $user->email,
    ]);

    $this->actingAs($user)
        ->post(route('account.user.adoption-applications.cancel', $application))
        ->assertRedirect();

    expect($application->fresh()->status)->toBe(AdoptionApplicationStatus::Cancelled)
        ->and($animal->fresh()->status)->toBe(ShelterAnimalStatus::Available);

    // Visible on user dashboard
    $this->actingAs($user)
        ->get(route('account.user.adoption-applications'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('applications.0.id', $application->id)
            ->where('applications.0.status', 'cancelled')
        );

    // Visible on admin adoption management
    $this->actingAs($admin)
        ->get(route('account.admin.adoption-management'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('applications.0.id', $application->id)
            ->where('applications.0.status', 'cancelled')
        );

    // Guest cancellation via /track also works
    $guestAnimal = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);
    $guestApp = AdoptionApplication::factory()->create([
        'user_id' => null,
        'shelter_animal_id' => $guestAnimal->id,
        'status' => AdoptionApplicationStatus::Pending,
        'email' => 'guest-cancel@example.com',
    ]);
    $guestRef = 'ADP-'.str_pad((string) $guestApp->id, 5, '0', STR_PAD_LEFT);

    $this->post(route('track.adoption-applications.cancel', $guestApp), [
        'reference' => $guestRef,
        'email' => 'guest-cancel@example.com',
    ])->assertRedirect();

    expect($guestApp->fresh()->status)->toBe(AdoptionApplicationStatus::Cancelled);
});

test('authenticated applicant can view messages and reply from dashboard without using track page', function () {
    Notification::fake();
    Storage::fake('public');

    $user = User::factory()->create(['role' => Role::User->value]);
    $user->syncRoles([Role::User]);

    $otherUser = User::factory()->create(['role' => Role::User->value]);
    $otherUser->syncRoles([Role::User]);

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->syncRoles([Role::Admin]);

    $animal = ShelterAnimal::factory()->create();
    $application = AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'shelter_animal_id' => $animal->id,
        'status' => AdoptionApplicationStatus::NeedsInfo,
        'email' => $user->email,
        'full_name' => $user->name,
    ]);

    $application->messages()->create([
        'user_id' => $admin->id,
        'sender_type' => 'admin',
        'sender_name' => $admin->name,
        'message' => 'Please upload a photo of your pet area.',
        'attachments' => [],
    ]);

    $this->actingAs($user)
        ->get(route('account.user.adoption-applications', ['open' => $application->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/adoption-applications')
            ->where('openApplicationId', $application->id)
            ->where('applications.0.id', $application->id)
            ->where('applications.0.messages.0.message', 'Please upload a photo of your pet area.')
        );

    $photo = UploadedFile::fake()->image('pet-area.jpg', 600, 400);

    $this->actingAs($user)
        ->post(route('account.user.adoption-applications.messages.store', $application), [
            'message' => 'Here is our indoor pet area.',
            'attachments' => [$photo],
        ])
        ->assertRedirect();

    $application->refresh();
    expect($application->status)->toBe(AdoptionApplicationStatus::Pending)
        ->and($application->messages)->toHaveCount(2);

    $reply = $application->messages->last();
    expect($reply->sender_type)->toBe('user')
        ->and($reply->message)->toBe('Here is our indoor pet area.')
        ->and($reply->attachments)->toHaveCount(1);

    Storage::disk('public')->assertExists($reply->attachments[0]['path']);

    Notification::assertSentTo($admin, AdoptionApplicationMessageNotification::class);

    // Another authenticated user cannot reply to someone else's application
    $this->actingAs($otherUser)
        ->post(route('account.user.adoption-applications.messages.store', $application), [
            'message' => 'Unauthorized dashboard reply',
        ])
        ->assertForbidden();
});

test('coordinator notifications link registered applicants to dashboard sidebar instead of track page', function () {
    Notification::fake();

    $user = User::factory()->create(['role' => Role::User->value]);
    $user->syncRoles([Role::User]);

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->syncRoles([Role::Admin]);

    $animal = ShelterAnimal::factory()->create();
    $application = AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'shelter_animal_id' => $animal->id,
        'status' => AdoptionApplicationStatus::Pending,
        'email' => $user->email,
        'full_name' => $user->name,
    ]);

    $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.messages.store', $application), [
            'message' => 'Could you share a photo of your balcony?',
            'request_info' => true,
        ])
        ->assertRedirect(route('account.admin.adoption-management'));

    $expectedUrl = route('account.user.adoption-applications', ['open' => $application->id]);

    Notification::assertSentTo(
        $user,
        AdoptionApplicationStatusUpdatedNotification::class,
        function (AdoptionApplicationStatusUpdatedNotification $notification) use ($user, $expectedUrl): bool {
            $mail = $notification->toMail($user);
            $data = $notification->toArray($user);

            return $mail->actionUrl === $expectedUrl
                && $data['url'] === $expectedUrl;
        }
    );

    $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.messages.store', $application), [
            'message' => 'Follow-up question from coordinator.',
            'request_info' => false,
        ])
        ->assertRedirect(route('account.admin.adoption-management'));

    Notification::assertSentTo(
        $user,
        AdoptionApplicationMessageNotification::class,
        function (AdoptionApplicationMessageNotification $notification) use ($user, $expectedUrl): bool {
            $mail = $notification->toMail($user);
            $data = $notification->toArray($user);

            return $mail->actionUrl === $expectedUrl
                && $data['url'] === $expectedUrl;
        }
    );
});

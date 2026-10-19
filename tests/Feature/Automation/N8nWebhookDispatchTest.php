<?php

use App\Enums\Role;
use App\Events\VolunteerApplicationSubmittedEvent;
use App\Jobs\SendN8nWebhookJob;
use App\Models\User;
use App\Models\VolunteerApplication;
use App\Services\N8n\N8nService;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('n8n service computes hmac sha256 signature correctly', function () {
    $service = new N8nService;
    $secret = 'test-secret-key-123';
    $timestamp = 1700000000;
    $payload = json_encode(['event' => 'test.event'], JSON_UNESCAPED_SLASHES);

    $signature = $service->generateSignature($timestamp, $payload, $secret);
    $expected = hash_hmac('sha256', "{$timestamp}.{$payload}", $secret);

    expect($signature)->toBe($expected);
});

test('n8n service skips dispatch when disabled', function () {
    config(['n8n.enabled' => false]);
    Http::fake();

    $service = new N8nService;
    $result = $service->dispatch('volunteer.application.submitted', ['foo' => 'bar']);

    expect($result)->toBeTrue();
    Http::assertNothingSent();
});

test('n8n service dispatches webhook with signature headers when enabled', function () {
    config([
        'n8n.enabled' => true,
        'n8n.base_url' => 'http://localhost:5678',
        'n8n.webhook_secret' => 'test-secret',
        'n8n.webhooks.volunteer.application.submitted' => '/webhook/test-submitted',
    ]);

    Http::fake([
        'http://localhost:5678/webhook/test-submitted' => Http::response(['success' => true], 200),
    ]);

    $service = new N8nService;
    $result = $service->dispatch('volunteer.application.submitted', [
        'applicant_id' => 123,
    ]);

    expect($result)->toBeTrue();

    Http::assertSent(function ($request) {
        return $request->url() === 'http://localhost:5678/webhook/test-submitted'
            && $request->hasHeader('X-Pawlse-Event', 'volunteer.application.submitted')
            && $request->hasHeader('X-Pawlse-Event-Id')
            && $request->hasHeader('X-Pawlse-Signature')
            && str_starts_with($request->header('X-Pawlse-Signature')[0], 't=')
            && $request['data']['applicant_id'] === 123;
    });
});

test('submitting a volunteer application dispatches event and queued webhook job', function () {
    Queue::fake();
    Event::fake([VolunteerApplicationSubmittedEvent::class]);

    $user = User::factory()->create([
        'role' => Role::User->value,
    ]);

    $this->actingAs($user)->post(route('volunteer.apply'), [
        'fullName' => 'Jane Doe',
        'mobile' => '09123456789',
        'email' => 'jane@example.com',
        'address' => 'Iligan City',
        'role' => 'Foster Parent',
        'why' => 'I love rescuing animals.',
        'experience' => '3 years fostering',
    ])->assertRedirect();

    Event::assertDispatched(VolunteerApplicationSubmittedEvent::class, function ($event) {
        return $event->application->full_name === 'Jane Doe';
    });
});

test('volunteer application approval dispatches approval event and queued webhook job', function () {
    Queue::fake();

    $admin = User::factory()->admin()->create();
    $applicant = User::factory()->create([
        'role' => Role::User->value,
    ]);

    $application = VolunteerApplication::create([
        'user_id' => $applicant->id,
        'full_name' => 'John Volunteer',
        'mobile' => '09123456789',
        'email' => 'john@example.com',
        'address' => 'Iligan City',
        'role' => 'Feeding Volunteer',
        'why' => 'Helping animals',
        'status' => 'pending',
        'reference_number' => 'VOL-TEST-001',
    ]);

    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.approve', $application))
        ->assertRedirect();

    Queue::assertPushed(SendN8nWebhookJob::class, function ($job) use ($application) {
        return $job->event === 'volunteer.application.approved'
            && $job->data['application_id'] === $application->id;
    });
});

test('volunteer application rejection dispatches rejection event and queued webhook job', function () {
    Queue::fake();

    $admin = User::factory()->admin()->create();
    $applicant = User::factory()->create([
        'role' => Role::User->value,
    ]);

    $application = VolunteerApplication::create([
        'user_id' => $applicant->id,
        'full_name' => 'John Rejected',
        'mobile' => '09123456789',
        'email' => 'john.r@example.com',
        'address' => 'Iligan City',
        'role' => 'Feeding Volunteer',
        'why' => 'Helping animals',
        'status' => 'pending',
        'reference_number' => 'VOL-TEST-002',
    ]);

    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.reject', $application), [
            'rejection_reason' => 'Incomplete documents',
        ])
        ->assertRedirect();

    Queue::assertPushed(SendN8nWebhookJob::class, function ($job) use ($application) {
        return $job->event === 'volunteer.application.rejected'
            && $job->data['application_id'] === $application->id
            && $job->data['rejection_reason'] === 'Incomplete documents';
    });
});

test('send n8n webhook job executes dispatch via n8n service', function () {
    config([
        'n8n.enabled' => true,
        'n8n.base_url' => 'http://localhost:5678',
        'n8n.webhooks.test.event' => '/webhook/test',
    ]);

    Http::fake([
        'http://localhost:5678/webhook/test' => Http::response(['ok' => true], 200),
    ]);

    $job = new SendN8nWebhookJob('test.event', ['key' => 'value'], '/webhook/test');
    $service = new N8nService;

    $job->handle($service);

    Http::assertSent(function ($request) {
        return $request->url() === 'http://localhost:5678/webhook/test'
            && $request['data']['key'] === 'value';
    });
});

test('submitting a rescue report dispatches pet rescue webhook job', function () {
    Queue::fake();

    $this->post(route('pet-reports.store-rescue'), [
        'animal_type' => 'Dog',
        'location' => 'Pala-o, Iligan City',
        'contact_name' => 'Maria Caller',
        'contact_phone' => '09111222333',
    ])->assertRedirect();

    Queue::assertPushed(SendN8nWebhookJob::class, function ($job) {
        return $job->event === 'pet.rescue.submitted'
            && $job->data['animal_type'] === 'Dog'
            && $job->data['location'] === 'Pala-o, Iligan City';
    });
});

test('initiating a donation dispatches donation received webhook job', function () {
    Queue::fake();

    $this->post(route('donate.store-cash'), [
        'amount' => 500,
        'donor_name' => 'Generous Giver',
        'donor_email' => 'donor@example.com',
        'donor_mobile' => '09123456789',
        'payment_method' => 'gcash',
        'purpose' => 'Medical fund',
    ])->assertRedirect();

    Queue::assertPushed(SendN8nWebhookJob::class, function ($job) {
        return $job->event === 'donation.received'
            && $job->data['donor_name'] === 'Generous Giver'
            && $job->data['amount'] === 500.0;
    });
});

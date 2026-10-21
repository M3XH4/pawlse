<?php

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\User;
use App\Notifications\SubmissionEReceiptNotification;
use App\Notifications\VolunteerCertificateIssuedNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('public guest can register for an open approved event and receives e-receipt', function () {
    Notification::fake();

    $event = Event::factory()->create([
        'status' => 'open',
        'approval_status' => 'approved',
        'spots' => 10,
    ]);

    $response = $this->post(route('events.join', $event), [
        'join_as' => 'participant',
        'guest_name' => 'Maria Santos',
        'guest_email' => 'maria.santos@example.com',
        'guest_phone' => '09171234567',
    ]);

    $response->assertRedirect();

    $task = AssignedTask::where('guest_email', 'maria.santos@example.com')->first();
    expect($task)->not->toBeNull();
    expect($task->guest_name)->toBe('Maria Santos');
    expect($task->role)->toBe('Participant');
    expect($task->status)->toBe('pending');
    expect($event->fresh()->spots)->toBe(9);

    Notification::assertSentOnDemand(
        SubmissionEReceiptNotification::class,
        function ($notification, $channels, $notifiable) {
            return $notifiable->routes['mail'] === 'maria.santos@example.com';
        }
    );
});

test('admin can complete attendee attendance and issue certificate', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $event = Event::factory()->create(['status' => 'open', 'approval_status' => 'approved']);

    $task = AssignedTask::create([
        'event_id' => $event->id,
        'guest_name' => 'Pedro Penduko',
        'guest_email' => 'pedro@example.com',
        'role' => 'Participant',
        'status' => 'pending',
        'hours_logged' => 2.0,
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.events.attendees.complete', $task));

    $response->assertRedirect();
    $task->refresh();
    expect($task->status)->toBe('completed');

    $cert = Certificate::where('guest_email', 'pedro@example.com')->first();
    expect($cert)->not->toBeNull();
    expect($cert->role)->toBe('Participant');
    expect($cert->event_id)->toBe($event->id);

    Notification::assertSentOnDemand(
        VolunteerCertificateIssuedNotification::class,
        function ($notification, $channels, $notifiable) {
            return $notifiable->routes['mail'] === 'pedro@example.com';
        }
    );
});

test('admin can complete and issue certificates to all event attendees in bulk', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $event = Event::factory()->create(['status' => 'open', 'approval_status' => 'approved']);

    $user1 = User::factory()->create(['role' => Role::User->value]);
    $task1 = AssignedTask::create([
        'event_id' => $event->id,
        'user_id' => $user1->id,
        'role' => 'Participant',
        'status' => 'pending',
        'hours_logged' => 3.0,
    ]);

    $task2 = AssignedTask::create([
        'event_id' => $event->id,
        'guest_name' => 'Elena Cruz',
        'guest_email' => 'elena@example.com',
        'role' => 'Participant',
        'status' => 'pending',
        'hours_logged' => 3.0,
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.events.issue-certificates', $event));

    $response->assertRedirect();
    expect($task1->fresh()->status)->toBe('completed');
    expect($task2->fresh()->status)->toBe('completed');

    expect(Certificate::where('user_id', $user1->id)->count())->toBe(1);
    expect(Certificate::where('guest_email', 'elena@example.com')->count())->toBe(1);
});

test('registered user can view their certificates in user dashboard', function () {
    $user = User::factory()->create(['role' => Role::User->value]);
    $event = Event::factory()->create();

    Certificate::create([
        'certificate_number' => 'CERT-TEST-USER-1',
        'user_id' => $user->id,
        'event_id' => $event->id,
        'title' => 'Certificate of Participation',
        'role' => 'Participant',
        'issue_date' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('account.user.certificates'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/certificates')
            ->has('certificates.data', 1)
            ->where('certificates.data.0.certificate_number', 'CERT-TEST-USER-1')
        );
});

test('public user can view certificate via valid signed route', function () {
    $event = Event::factory()->create();

    $cert = Certificate::create([
        'certificate_number' => 'CERT-GUEST-99',
        'guest_name' => 'Guest Honoree',
        'guest_email' => 'guest@example.com',
        'event_id' => $event->id,
        'title' => 'Certificate of Participation',
        'role' => 'Participant',
        'issue_date' => now(),
    ]);

    $signedUrl = URL::signedRoute('certificates.public.show', ['certificate' => $cert->id]);

    $response = $this->get($signedUrl);

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public-certificate')
            ->where('certificate.certificate_number', 'CERT-GUEST-99')
            ->where('certificate.guest_name', 'Guest Honoree')
        );
});

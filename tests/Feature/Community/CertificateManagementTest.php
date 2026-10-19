<?php

use App\Models\AuditLog;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\User;
use App\Models\VolunteerApplication;
use App\Notifications\VolunteerCertificateIssuedNotification;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('admin can issue a certificate associated with an event', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();
    $event = Event::factory()->create([
        'title' => 'Stray Feeding Outreach 2026',
        'location' => 'Brgy. Pala-o, Iligan City',
        'date' => '2026-10-25',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.issue-certificate'), [
            'user_id' => $volunteer->id,
            'event_id' => $event->id,
            'title' => 'Certificate of Participation',
            'description' => 'For dedicated volunteer work during the outreach mission.',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('certificates', [
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'title' => 'Certificate of Participation',
        'description' => 'For dedicated volunteer work during the outreach mission.',
    ]);

    $certificate = Certificate::where('user_id', $volunteer->id)->first();
    expect($certificate)->not->toBeNull();
    expect($certificate->certificate_number)->toStartWith('CERT-'.date('Y').'-');

    Notification::assertSentTo($volunteer, VolunteerCertificateIssuedNotification::class, function ($notification) use ($certificate) {
        return $notification->certificate->id === $certificate->id;
    });

    expect(AuditLog::where('action', 'volunteer_certificate_issue')->exists())->toBeTrue();
});

test('admin can issue a manual certificate without an event', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.issue-certificate'), [
            'user_id' => $volunteer->id,
            'event_id' => null,
            'title' => 'Special Service Award',
            'description' => 'Recognition of tireless emergency rescue assistance.',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('certificates', [
        'user_id' => $volunteer->id,
        'event_id' => null,
        'title' => 'Special Service Award',
    ]);
});

test('certificate issuance fails validation with invalid input', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.issue-certificate'), [
            'user_id' => 999999, // non-existent user
            'title' => '', // missing title
        ]);

    $response->assertSessionHasErrors(['user_id', 'title']);
});

test('non-admin cannot issue a certificate', function () {
    $volunteer = User::factory()->volunteer()->create();
    $targetUser = User::factory()->create();

    $response = $this->actingAs($volunteer)
        ->post(route('account.admin.volunteer-management.issue-certificate'), [
            'user_id' => $targetUser->id,
            'title' => 'Unauthorized Certificate',
        ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('certificates', [
        'title' => 'Unauthorized Certificate',
    ]);
});

test('guest cannot issue a certificate', function () {
    $targetUser = User::factory()->create();

    $response = $this->post(route('account.admin.volunteer-management.issue-certificate'), [
        'user_id' => $targetUser->id,
        'title' => 'Guest Certificate',
    ]);

    $response->assertRedirect(route('login'));
});

test('guest cannot view volunteer certificates page', function () {
    $response = $this->get(route('account.volunteer.certificates'));
    $response->assertRedirect(route('login'));
});

test('volunteer can view their certificates list with eager-loaded relations and role', function () {
    $volunteer = User::factory()->volunteer()->create(['name' => 'Maria Santos']);
    $event = Event::factory()->create([
        'title' => 'Annual ISF Vaccination Drive',
        'location' => 'Iligan City Public Plaza',
        'date' => '2026-10-30',
    ]);

    VolunteerApplication::factory()->create([
        'user_id' => $volunteer->id,
        'role' => 'Foster Volunteer',
        'status' => 'approved',
    ]);

    $certificate = Certificate::factory()->create([
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'title' => 'Certificate of Recognition',
        'certificate_number' => 'CERT-2026-TEST01',
    ]);

    $response = $this->actingAs($volunteer)
        ->get(route('account.volunteer.certificates'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/certificates')
            ->has('certificates.data', 1)
            ->where('certificates.data.0.id', $certificate->id)
            ->where('certificates.data.0.certificate_number', 'CERT-2026-TEST01')
            ->where('certificates.data.0.event.title', 'Annual ISF Vaccination Drive')
            ->where('certificates.data.0.event.location', 'Iligan City Public Plaza')
            ->where('certificates.data.0.user.name', 'Maria Santos')
            ->where('defaultRole', 'Foster Volunteer')
        );
});

test('volunteer only sees their own certificates and cannot see others', function () {
    $volunteerA = User::factory()->volunteer()->create(['name' => 'Volunteer A']);
    $volunteerB = User::factory()->volunteer()->create(['name' => 'Volunteer B']);

    $certA = Certificate::factory()->create([
        'user_id' => $volunteerA->id,
        'title' => 'Certificate for A',
    ]);

    $certB = Certificate::factory()->create([
        'user_id' => $volunteerB->id,
        'title' => 'Certificate for B',
    ]);

    $response = $this->actingAs($volunteerA)
        ->get(route('account.volunteer.certificates'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/certificates')
            ->has('certificates.data', 1)
            ->where('certificates.data.0.id', $certA->id)
            ->where('certificates.data.0.title', 'Certificate for A')
        );
});

test('volunteer with no certificates receives empty state', function () {
    $volunteer = User::factory()->volunteer()->create();

    $response = $this->actingAs($volunteer)
        ->get(route('account.volunteer.certificates'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/certificates')
            ->has('certificates.data', 0)
            ->where('certificates.total', 0)
        );
});

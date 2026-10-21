<?php

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Models\Donation;
use App\Models\Event;
use App\Models\FeedingSponsorship;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\EventApprovalStatusUpdatedNotification;
use App\Notifications\EventPendingApprovalNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('creates an event as pending when created by regular admin', function () {
    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin->value);

    $response = $this->actingAs($admin)->post(route('account.admin.events.store'), [
        'title' => 'Community Rabies Vaccine Day',
        'category' => 'Medical',
        'date' => now()->addDays(5)->toDateString(),
        'time' => '09:00 AM',
        'location' => 'Iligan Plaza',
        'spots' => 50,
        'desc' => 'Free rabies vaccination for pets.',
    ]);

    $response->assertRedirect();
    $event = Event::where('title', 'Community Rabies Vaccine Day')->first();

    expect($event)->not->toBeNull();
    expect($event->approval_status)->toBe('pending');
    expect($event->status)->toBe('closed');
    expect($event->created_by)->toBe($admin->id);
    expect($event->approved_by)->toBeNull();
});

test('creates an event as approved when created by super admin', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->assignRole(Role::SuperAdmin->value);

    $response = $this->actingAs($superAdmin)->post(route('account.admin.events.store'), [
        'title' => 'Citywide Pet Parade',
        'category' => 'Social',
        'date' => now()->addDays(10)->toDateString(),
        'time' => '08:00 AM',
        'location' => 'City Hall Grounds',
        'spots' => -1,
        'desc' => 'Annual pet walk and seminar.',
    ]);

    $response->assertRedirect();
    $event = Event::where('title', 'Citywide Pet Parade')->first();

    expect($event)->not->toBeNull();
    expect($event->approval_status)->toBe('approved');
    expect($event->status)->toBe('open');
    expect($event->approved_by)->toBe($superAdmin->id);
    expect($event->approved_at)->not->toBeNull();
});

test('allows super admin to approve a pending event', function () {
    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->assignRole(Role::SuperAdmin->value);

    $event = Event::factory()->pending()->create(['created_by' => $admin->id]);

    $response = $this->actingAs($superAdmin)->post(route('account.admin.events.approve', $event));
    $response->assertRedirect();

    $event->refresh();
    expect($event->approval_status)->toBe('approved');
    expect($event->status)->toBe('open');
    expect($event->approved_by)->toBe($superAdmin->id);
    expect($event->approved_at)->not->toBeNull();
});

test('forbids regular admin from approving a pending event', function () {
    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin->value);

    $event = Event::factory()->pending()->create();

    $response = $this->actingAs($admin)->post(route('account.admin.events.approve', $event));
    $response->assertForbidden();

    $event->refresh();
    expect($event->approval_status)->toBe('pending');
});

test('allows super admin to reject a pending event with reason', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->assignRole(Role::SuperAdmin->value);

    $event = Event::factory()->pending()->create();

    $response = $this->actingAs($superAdmin)->post(route('account.admin.events.reject', $event), [
        'reason' => 'Schedule overlaps with major city festival.',
    ]);
    $response->assertRedirect();

    $event->refresh();
    expect($event->approval_status)->toBe('rejected');
    expect($event->status)->toBe('closed');
    expect($event->rejection_reason)->toBe('Schedule overlaps with major city festival.');
});

test('only displays approved and open events on public events page', function () {
    $approvedEvent = Event::factory()->create([
        'title' => 'Open Adoption Drive',
        'status' => 'open',
        'approval_status' => 'approved',
    ]);

    $pendingEvent = Event::factory()->pending()->create([
        'title' => 'Secret Pending Outreach',
    ]);

    $rejectedEvent = Event::factory()->rejected()->create([
        'title' => 'Denied Special Activity',
    ]);

    $response = $this->get(route('events'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('events')
        ->where('events.data', fn ($items) => collect($items)->contains('id', $approvedEvent->id) &&
            ! collect($items)->contains('id', $pendingEvent->id) &&
            ! collect($items)->contains('id', $rejectedEvent->id)
        )
    );
});

test('automatically approves sponsored feeding day event when donation is verified', function () {
    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin->value);

    $donation = Donation::create([
        'public_reference' => 'DON-TEST123',
        'donor_name' => 'Maria Santos',
        'donor_email' => 'maria@example.com',
        'anonymous' => false,
        'type' => DonationType::FeedingSponsorship->value,
        'amount' => 3000,
        'currency' => 'PHP',
        'status' => DonationStatus::PendingVerification->value,
    ]);

    Payment::create([
        'donation_id' => $donation->id,
        'method' => PaymentMethod::Paypal->value,
        'provider' => PaymentProvider::Paypal->value,
        'provider_transaction_id' => 'TXN-12345',
        'payment_reference' => 'PAY-TEST123',
        'amount' => 3000,
        'currency' => 'PHP',
        'status' => PaymentStatus::Pending->value,
    ]);

    FeedingSponsorship::create([
        'public_reference' => 'FS-TEST123',
        'donation_id' => $donation->id,
        'donor_name' => 'Maria Santos',
        'donor_email' => 'maria@example.com',
        'donor_mobile' => '09123456789',
        'preferred_date' => now()->addDays(7)->format('Y-m-d'),
        'occasion' => 'Graduation Blessing',
        'message' => 'Feeding all street cats',
        'amount' => 3000,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->post("/account/admin/donation-monitoring/donations/{$donation->id}/verify-cash");
    $response->assertRedirect();

    $event = Event::where('title', 'like', '%Maria Santos%')->first();
    expect($event)->not->toBeNull();
    expect($event->approval_status)->toBe('approved');
    expect($event->status)->toBe('open');
    expect($event->approved_by)->toBe($admin->id);
});

test('super admin dashboard includes pending events count in stats', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->assignRole(Role::SuperAdmin->value);

    Event::factory()->pending()->count(3)->create();

    $response = $this->actingAs($superAdmin)->get(route('account.super-admin.dashboard'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('super-admin/dashboard')
        ->where('stats.pending_events_count', 3)
    );
});

test('notifies super admins when admin submits an event for approval', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin->value);

    $superAdmin1 = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin1->assignRole(Role::SuperAdmin->value);

    $superAdmin2 = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin2->assignRole(Role::SuperAdmin->value);

    $response = $this->actingAs($admin)->post(route('account.admin.events.store'), [
        'title' => 'Vaccination Outreach Drive',
        'category' => 'Medical',
        'date' => now()->addDays(5)->toDateString(),
        'time' => '10:00 AM',
        'location' => 'Plaza Covered Court',
        'spots' => 30,
        'desc' => 'Comprehensive pet checkup and vaccination.',
    ]);

    $response->assertRedirect();
    $event = Event::where('title', 'Vaccination Outreach Drive')->first();

    Notification::assertSentTo([$superAdmin1, $superAdmin2], EventPendingApprovalNotification::class, function ($notification) use ($event) {
        return $notification->event->id === $event->id;
    });
});

test('notifies event creator when super admin approves or rejects the event', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin->value);

    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->assignRole(Role::SuperAdmin->value);

    $event = Event::factory()->pending()->create(['created_by' => $admin->id]);

    // Test approval notification
    $this->actingAs($superAdmin)->post(route('account.admin.events.approve', $event));
    Notification::assertSentTo($admin, EventApprovalStatusUpdatedNotification::class, function ($notification) use ($event) {
        return $notification->event->id === $event->id && $notification->status === 'approved';
    });

    // Test rejection notification
    $rejectedEvent = Event::factory()->pending()->create(['created_by' => $admin->id]);
    $this->actingAs($superAdmin)->post(route('account.admin.events.reject', $rejectedEvent), [
        'reason' => 'Date conflicts with shelter maintenance.',
    ]);
    Notification::assertSentTo($admin, EventApprovalStatusUpdatedNotification::class, function ($notification) use ($rejectedEvent) {
        return $notification->event->id === $rejectedEvent->id
            && $notification->status === 'rejected'
            && $notification->reason === 'Date conflicts with shelter maintenance.';
    });
});

test('allows super admin to access event management page with isSuperAdmin prop', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->assignRole(Role::SuperAdmin->value);

    Event::factory()->pending()->create(['title' => 'Pending Review Event']);

    $response = $this->actingAs($superAdmin)->get(route('account.admin.events'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/events')
        ->where('isSuperAdmin', true)
        ->where('basePath', '/account/admin/events')
        ->has('events.data', 1)
    );
});

test('allows super admin to access super admin event management page within super-admin layout', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->assignRole(Role::SuperAdmin->value);

    Event::factory()->pending()->create(['title' => 'Community Rabies Vaccine']);

    $response = $this->actingAs($superAdmin)->get(route('account.super-admin.events'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('super-admin/events')
        ->where('isSuperAdmin', true)
        ->where('basePath', '/account/super-admin/events')
        ->has('events.data', 1)
    );
});

test('allows super admin to approve and reject events via super admin routes', function () {
    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->assignRole(Role::SuperAdmin->value);

    $event = Event::factory()->pending()->create(['created_by' => $admin->id]);

    $response = $this->actingAs($superAdmin)->post(route('account.super-admin.events.approve', $event));
    $response->assertRedirect();

    $event->refresh();
    expect($event->approval_status)->toBe('approved');
    expect($event->status)->toBe('open');
    expect($event->approved_by)->toBe($superAdmin->id);

    $anotherEvent = Event::factory()->pending()->create(['created_by' => $admin->id]);
    $rejectResponse = $this->actingAs($superAdmin)->post(route('account.super-admin.events.reject', $anotherEvent), [
        'reason' => 'Schedule conflict.',
    ]);
    $rejectResponse->assertRedirect();

    $anotherEvent->refresh();
    expect($anotherEvent->approval_status)->toBe('rejected');
    expect($anotherEvent->rejection_reason)->toBe('Schedule conflict.');
});

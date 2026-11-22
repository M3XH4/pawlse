<?php

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\Partner;
use App\Models\PartnerFoodPickup;
use App\Models\User;
use App\Notifications\VolunteerTaskAssignedNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('super admin can flag a food supply partner as providing daily food', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->syncRoles([Role::SuperAdmin]);

    $partner = Partner::factory()->foodSupply()->create([
        'name' => 'Greenwich',
        'provides_daily_food' => false,
    ]);

    $response = $this->actingAs($superAdmin)
        ->post(route('account.super-admin.partners.update', $partner), [
            '_method' => 'PUT',
            'name' => 'Greenwich',
            'category' => 'food_supply',
            'provides_daily_food' => true,
            'daily_food_notes' => '1-day shelf life prepared food',
            'is_active' => true,
            'is_featured' => true,
            'is_emergency' => false,
            'display_order' => 1,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('partners', [
        'id' => $partner->id,
        'provides_daily_food' => true,
        'daily_food_notes' => '1-day shelf life prepared food',
    ]);
});

test('admin can schedule a daily food pickup and manually assign a volunteer', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);
    $volunteer->syncRoles([Role::Volunteer]);

    $greenwich = Partner::factory()->dailyFood()->create(['name' => 'Greenwich']);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.food-pickups.store'), [
            'partner_id' => $greenwich->id,
            'pickup_date' => '2026-11-22',
            'assigned_volunteer_id' => $volunteer->id,
            'food_summary' => 'Prepared pasta and rice trays (1-day shelf life)',
        ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $pickup = PartnerFoodPickup::query()->where('partner_id', $greenwich->id)->first();
    expect($pickup)->not->toBeNull();
    expect($pickup->status)->toBe(PartnerFoodPickup::StatusAssigned);
    expect($pickup->assigned_volunteer_id)->toBe($volunteer->id);

    $this->assertDatabaseHas('assigned_tasks', [
        'user_id' => $volunteer->id,
        'partner_food_pickup_id' => $pickup->id,
        'status' => 'pending',
    ]);

    Notification::assertSentTo($volunteer, VolunteerTaskAssignedNotification::class);
});

test('non-daily food partners cannot be scheduled for daily food pickups', function () {
    $admin = User::factory()->admin()->create();
    $ricePartner = Partner::factory()->foodSupply()->create([
        'name' => 'House of Rice',
        'provides_daily_food' => false,
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.food-pickups.store'), [
            'partner_id' => $ricePartner->id,
            'pickup_date' => '2026-11-22',
        ]);

    $response->assertSessionHasErrors('partner_id');
    expect(PartnerFoodPickup::count())->toBe(0);
});

test('duplicate daily food pickup for the same partner and date is rejected', function () {
    $admin = User::factory()->admin()->create();
    $greenwich = Partner::factory()->dailyFood()->create(['name' => 'Greenwich']);

    PartnerFoodPickup::factory()->create([
        'partner_id' => $greenwich->id,
        'pickup_date' => '2026-11-22',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.food-pickups.store'), [
            'partner_id' => $greenwich->id,
            'pickup_date' => '2026-11-22',
        ]);

    $response->assertSessionHasErrors('pickup_date');
    expect(PartnerFoodPickup::count())->toBe(1);
});

test('admin can manually assign a volunteer to an existing pending food pickup', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);
    $volunteer->syncRoles([Role::Volunteer]);

    $pickup = PartnerFoodPickup::factory()->create([
        'status' => PartnerFoodPickup::StatusPending,
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.food-pickups.assign', $pickup), [
            'assigned_volunteer_id' => $volunteer->id,
        ]);

    $response->assertRedirect();
    $pickup->refresh();

    expect($pickup->status)->toBe(PartnerFoodPickup::StatusAssigned);
    expect($pickup->assigned_volunteer_id)->toBe($volunteer->id);

    Notification::assertSentTo($volunteer, VolunteerTaskAssignedNotification::class);
});

test('assigned volunteer sees the pickup task and can confirm it has been fetched', function () {
    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);
    $volunteer->syncRoles([Role::Volunteer]);

    $greenwich = Partner::factory()->dailyFood()->create(['name' => 'Greenwich']);
    $pickup = PartnerFoodPickup::factory()->create([
        'partner_id' => $greenwich->id,
        'assigned_volunteer_id' => $volunteer->id,
        'status' => PartnerFoodPickup::StatusAssigned,
    ]);

    $task = AssignedTask::factory()->create([
        'user_id' => $volunteer->id,
        'event_id' => null,
        'partner_food_pickup_id' => $pickup->id,
        'role' => 'Daily Food Pickup Carrier',
        'status' => 'pending',
    ]);

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.assigned-tasks'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/assigned-tasks')
            ->has('tasks.data', 1)
            ->where('tasks.data.0.partner_food_pickup.partner.name', 'Greenwich')
        );

    $confirmResponse = $this->actingAs($volunteer)
        ->post(route('account.volunteer.assigned-tasks.confirm-fetched', $task), [
            'volunteer_notes' => 'Picked up 3 boxes from Greenwich at 11:15 AM.',
        ]);

    $confirmResponse->assertRedirect();
    $pickup->refresh();

    expect($pickup->status)->toBe(PartnerFoodPickup::StatusFetched);
    expect($pickup->fetched_at)->not->toBeNull();
    expect($pickup->volunteer_notes)->toBe('Picked up 3 boxes from Greenwich at 11:15 AM.');
});

test('a volunteer cannot confirm another volunteers food pickup task', function () {
    $volunteerA = User::factory()->create(['role' => Role::Volunteer->value]);
    $volunteerA->syncRoles([Role::Volunteer]);

    $volunteerB = User::factory()->create(['role' => Role::Volunteer->value]);
    $volunteerB->syncRoles([Role::Volunteer]);

    $pickup = PartnerFoodPickup::factory()->create([
        'assigned_volunteer_id' => $volunteerA->id,
        'status' => PartnerFoodPickup::StatusAssigned,
    ]);

    $task = AssignedTask::factory()->create([
        'user_id' => $volunteerA->id,
        'event_id' => null,
        'partner_food_pickup_id' => $pickup->id,
        'role' => 'Daily Food Pickup Carrier',
        'status' => 'pending',
    ]);

    $this->actingAs($volunteerB)
        ->post(route('account.volunteer.assigned-tasks.confirm-fetched', $task))
        ->assertForbidden();

    expect($pickup->fresh()->status)->toBe(PartnerFoodPickup::StatusAssigned);
});

test('cancelling an unfetched pickup task resets pickup to pending, but fetched tasks cannot be cancelled', function () {
    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);
    $volunteer->syncRoles([Role::Volunteer]);

    $pickup = PartnerFoodPickup::factory()->create([
        'assigned_volunteer_id' => $volunteer->id,
        'status' => PartnerFoodPickup::StatusAssigned,
    ]);

    $task = AssignedTask::factory()->create([
        'user_id' => $volunteer->id,
        'event_id' => null,
        'partner_food_pickup_id' => $pickup->id,
        'role' => 'Daily Food Pickup Carrier',
        'status' => 'pending',
    ]);

    $this->actingAs($volunteer)
        ->delete(route('account.volunteer.assigned-tasks.cancel', $task))
        ->assertRedirect();

    $pickup->refresh();
    expect($pickup->status)->toBe(PartnerFoodPickup::StatusPending);
    expect($pickup->assigned_volunteer_id)->toBeNull();
    expect(AssignedTask::find($task->id))->toBeNull();

    // Now test fetched task cannot be cancelled
    $fetchedPickup = PartnerFoodPickup::factory()->create([
        'pickup_date' => '2026-11-23',
        'assigned_volunteer_id' => $volunteer->id,
        'status' => PartnerFoodPickup::StatusFetched,
        'fetched_at' => now(),
    ]);

    $fetchedTask = AssignedTask::factory()->create([
        'user_id' => $volunteer->id,
        'event_id' => null,
        'partner_food_pickup_id' => $fetchedPickup->id,
        'role' => 'Daily Food Pickup Carrier',
        'status' => 'pending',
    ]);

    $this->actingAs($volunteer)
        ->delete(route('account.volunteer.assigned-tasks.cancel', $fetchedTask))
        ->assertRedirect();

    expect(AssignedTask::find($fetchedTask->id))->not->toBeNull();
});

test('admin can mark a daily food pickup as completed or missed', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);
    $volunteer->syncRoles([Role::Volunteer]);

    // 1. Completed flow
    $fetchedPickup = PartnerFoodPickup::factory()->create([
        'pickup_date' => '2026-11-22',
        'assigned_volunteer_id' => $volunteer->id,
        'status' => PartnerFoodPickup::StatusFetched,
        'fetched_at' => now(),
    ]);

    $completedTask = AssignedTask::factory()->create([
        'user_id' => $volunteer->id,
        'event_id' => null,
        'partner_food_pickup_id' => $fetchedPickup->id,
        'role' => 'Daily Food Pickup Carrier',
        'status' => 'pending',
        'hours_logged' => 0,
    ]);

    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.food-pickups.status', $fetchedPickup), [
            'status' => 'completed',
            'hours_logged' => 1.5,
            'admin_notes' => 'Delivered to shelter kitchen.',
        ])
        ->assertRedirect();

    $fetchedPickup->refresh();
    $completedTask->refresh();

    expect($fetchedPickup->status)->toBe(PartnerFoodPickup::StatusCompleted);
    expect($fetchedPickup->completed_at)->not->toBeNull();
    expect($completedTask->status)->toBe('completed');
    expect((float) $completedTask->hours_logged)->toBe(1.5);

    // 2. Missed flow
    $missedPickup = PartnerFoodPickup::factory()->create([
        'pickup_date' => '2026-11-23',
        'assigned_volunteer_id' => $volunteer->id,
        'status' => PartnerFoodPickup::StatusAssigned,
    ]);

    $missedTask = AssignedTask::factory()->create([
        'user_id' => $volunteer->id,
        'event_id' => null,
        'partner_food_pickup_id' => $missedPickup->id,
        'role' => 'Daily Food Pickup Carrier',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.food-pickups.status', $missedPickup), [
            'status' => 'missed',
            'admin_notes' => 'Volunteer could not make it before store closing.',
        ])
        ->assertRedirect();

    $missedPickup->refresh();
    $missedTask->refresh();

    expect($missedPickup->status)->toBe(PartnerFoodPickup::StatusMissed);
    expect($missedPickup->missed_at)->not->toBeNull();
    expect($missedTask->status)->toBe('cancelled');
});

test('visiting volunteer management auto-creates today pending pickup for daily food partners so admin only needs to assign a volunteer', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);
    $volunteer->syncRoles([Role::Volunteer]);

    $greenwich = Partner::factory()->dailyFood()->create(['name' => 'Greenwich']);

    $this->actingAs($admin)
        ->get(route('account.admin.volunteer-management'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/volunteer-management')
            ->has('todayFoodPickups', 1)
            ->where('todayFoodPickups.0.partner.name', 'Greenwich')
            ->where('todayFoodPickups.0.status', PartnerFoodPickup::StatusPending)
        );

    // Scheduling with a volunteer for that same date smoothly assigns the existing pending pickup
    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.food-pickups.store'), [
            'partner_id' => $greenwich->id,
            'pickup_date' => now()->toDateString(),
            'assigned_volunteer_id' => $volunteer->id,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $pickup = PartnerFoodPickup::query()
        ->where('partner_id', $greenwich->id)
        ->whereDate('pickup_date', now()->toDateString())
        ->first();

    expect($pickup)->not->toBeNull();
    expect($pickup->status)->toBe(PartnerFoodPickup::StatusAssigned);
    expect($pickup->assigned_volunteer_id)->toBe($volunteer->id);
    Notification::assertSentTo($volunteer, VolunteerTaskAssignedNotification::class);
});

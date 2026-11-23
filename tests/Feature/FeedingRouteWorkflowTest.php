<?php

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\FeedingDistributionLog;
use App\Models\FeedingSchedule;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('public events page shows joined volunteer count and team roster on feeding schedules', function () {
    $volunteer = User::factory()->create(['role' => Role::Volunteer->value, 'name' => 'Maria Santos']);
    $volunteer->assignRole(Role::Volunteer->value);

    $schedule = FeedingSchedule::factory()->create([
        'zone' => 'Downtown Market Circuit',
        'volunteers' => 5,
        'status' => 'active',
    ]);

    AssignedTask::create([
        'user_id' => $volunteer->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Recorder',
        'status' => 'pending',
    ]);

    $this->get(route('events'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events')
            ->where('feedingSchedules.data.0.joined_volunteers_count', 1)
            ->where('feedingSchedules.data.0.assigned_tasks.0.role', 'Recorder')
            ->where('feedingSchedules.data.0.assigned_tasks.0.user.name', 'Maria Santos')
        );
});

test('admin can assign a volunteer as recorder and manage feeding route lifecycle', function () {
    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin->value);

    $recorder = User::factory()->create(['role' => Role::Volunteer->value]);
    $recorder->assignRole(Role::Volunteer->value);

    $carrier = User::factory()->create(['role' => Role::Volunteer->value]);
    $carrier->assignRole(Role::Volunteer->value);

    $schedule = FeedingSchedule::factory()->create([
        'zone' => 'North Harbor Zone',
        'status' => 'active',
        'execution_status' => FeedingSchedule::ExecutionScheduled,
    ]);

    // Admin assigns Recorder
    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.assign'), [
            'user_id' => $recorder->id,
            'feeding_schedule_id' => $schedule->id,
            'role' => 'Recorder',
        ])
        ->assertRedirect();

    AssignedTask::create([
        'user_id' => $carrier->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Food Carrier',
        'status' => 'pending',
    ]);

    // Recorder cannot log food before route starts
    $this->actingAs($recorder)
        ->post(route('account.volunteer.feeding-schedules.distributions.store', $schedule), [
            'street_or_stop' => 'Harbor Pier 2',
            'food_type' => 'Dry Kibble',
            'food_packs_distributed' => 10,
            'strays_fed' => 8,
        ])
        ->assertRedirect();

    expect(FeedingDistributionLog::count())->toBe(0);

    // Joined volunteer starts the feeding route
    $this->actingAs($recorder)
        ->post(route('account.volunteer.feeding-schedules.start', $schedule))
        ->assertRedirect();

    $schedule->refresh();
    expect($schedule->execution_status)->toBe(FeedingSchedule::ExecutionInProgress);
    expect($schedule->started_by_user_id)->toBe($recorder->id);

    // Non-recorder volunteer cannot record food distributions
    $this->actingAs($carrier)
        ->post(route('account.volunteer.feeding-schedules.distributions.store', $schedule), [
            'street_or_stop' => 'Harbor Pier 2',
            'food_type' => 'Dry Kibble',
            'food_packs_distributed' => 5,
            'strays_fed' => 4,
        ])
        ->assertForbidden();

    // Assigned Recorder logs street food distribution
    $this->actingAs($recorder)
        ->post(route('account.volunteer.feeding-schedules.distributions.store', $schedule), [
            'street_or_stop' => 'Harbor Pier 2',
            'food_type' => 'Dry Kibble',
            'food_packs_distributed' => 12,
            'strays_fed' => 9,
            'notes' => 'Distributed along the dockside.',
        ])
        ->assertRedirect();

    $schedule->refresh();
    expect($schedule->total_food_distributed)->toBe(12);
    expect(FeedingDistributionLog::count())->toBe(1);

    // Complete the feeding route
    $this->actingAs($recorder)
        ->post(route('account.volunteer.feeding-schedules.complete', $schedule))
        ->assertRedirect();

    $schedule->refresh();
    expect($schedule->execution_status)->toBe(FeedingSchedule::ExecutionCompleted);
    expect($schedule->completed_by_user_id)->toBe($recorder->id);

    // Admin can reset the route for the next run
    $this->actingAs($admin)
        ->post(route('account.admin.feeding-schedules.reset', $schedule))
        ->assertRedirect();

    expect($schedule->fresh()->execution_status)->toBe(FeedingSchedule::ExecutionScheduled);
});

test('admin can view field groups, update a member role, and remove a member from the group', function () {
    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin->value);

    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);
    $volunteer->assignRole(Role::Volunteer->value);

    $schedule = FeedingSchedule::factory()->create([
        'zone' => 'East Market Route',
        'status' => 'active',
    ]);

    $task = AssignedTask::create([
        'user_id' => $volunteer->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Food Carrier',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->get(route('account.admin.volunteer-management'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('fieldGroups.0.name', 'East Market Route')
            ->where('fieldGroups.0.members_count', 1)
            ->where('fieldGroups.0.has_lead', false)
        );

    // Promote member to Route Lead
    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.groups.update-role', $task), [
            'role' => 'Route Lead',
        ])
        ->assertRedirect();

    expect($task->fresh()->role)->toBe('Route Lead');

    // Remove member from group
    $this->actingAs($admin)
        ->delete(route('account.admin.volunteer-management.groups.remove-member', $task))
        ->assertRedirect();

    expect(AssignedTask::find($task->id))->toBeNull();
});

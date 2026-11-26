<?php

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\Certificate;
use App\Models\Donation;
use App\Models\Event;
use App\Models\FeedingDistributionLog;
use App\Models\FeedingSchedule;
use App\Models\FeedingSponsorship;
use App\Models\GroupMessage;
use App\Models\User;
use App\Models\VolunteerInjuryReport;
use App\Notifications\VolunteerInjuryReportedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role as SpatieRole;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    foreach (Role::cases() as $role) {
        SpatieRole::firstOrCreate(['name' => $role->value, 'guard_name' => 'web']);
    }

    $eventsManage = Permission::firstOrCreate(['name' => 'events.manage', 'guard_name' => 'web']);
    $assignTasks = Permission::firstOrCreate(['name' => 'volunteers.assign_tasks', 'guard_name' => 'web']);
    SpatieRole::findByName(Role::Admin->value)->givePermissionTo([$eventsManage, $assignTasks]);
    SpatieRole::findByName(Role::SuperAdmin->value)->givePermissionTo([$eventsManage, $assignTasks]);
});

function createUserWithRole(Role $role): User
{
    $user = User::factory()->create([
        'role' => $role->value,
        'email_verified_at' => now(),
    ]);
    $user->assignRole($role->value);

    return $user;
}

it('allows a route lead to complete a feeding route with individual hours, no-show, and data-preserving disband', function (): void {
    $lead = createUserWithRole(Role::Volunteer);
    $recorder = createUserWithRole(Role::Volunteer);
    $absentMember = createUserWithRole(Role::Volunteer);

    $schedule = FeedingSchedule::query()->create([
        'zone' => 'Zone A - Market',
        'day' => 'Saturday',
        'time' => '08:00 AM',
        'volunteers' => 5,
        'strays' => 20,
        'status' => 'active',
        'execution_status' => FeedingSchedule::ExecutionInProgress,
        'started_at' => now()->subHour(),
        'started_by_user_id' => $lead->id,
    ]);

    $leadTask = AssignedTask::query()->create([
        'user_id' => $lead->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Route Lead',
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    $recorderTask = AssignedTask::query()->create([
        'user_id' => $recorder->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Recorder',
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    $absentTask = AssignedTask::query()->create([
        'user_id' => $absentMember->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Feeder',
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    FeedingDistributionLog::query()->create([
        'feeding_schedule_id' => $schedule->id,
        'recorded_by_user_id' => $recorder->id,
        'assigned_task_id' => $recorderTask->id,
        'street_or_stop' => 'Main Market St',
        'food_type' => 'Dry Kibble',
        'food_packs_distributed' => 10,
        'strays_fed' => 14,
        'recorded_at' => now(),
    ]);

    GroupMessage::query()->create([
        'group_type' => 'feeding',
        'group_id' => $schedule->id,
        'user_id' => $lead->id,
        'message' => 'Meet at the market entrance.',
    ]);

    $response = $this->actingAs($lead)->post(
        route('account.volunteer.feeding-schedules.complete', $schedule),
        [
            'attendees' => [
                ['task_id' => $leadTask->id, 'attended' => true, 'hours_logged' => 3.5],
                ['task_id' => $recorderTask->id, 'attended' => true, 'hours_logged' => 2.5],
                ['task_id' => $absentTask->id, 'attended' => false, 'hours_logged' => 2.0],
            ],
        ]
    );

    $response->assertRedirect();

    $schedule->refresh();
    expect($schedule->execution_status)->toBe(FeedingSchedule::ExecutionCompleted);
    expect($schedule->disbanded_at)->not->toBeNull();

    $leadTask->refresh();
    $recorderTask->refresh();
    $absentTask->refresh();

    expect($leadTask->status)->toBe(AssignedTask::STATUS_COMPLETED);
    expect((float) $leadTask->hours_logged)->toBe(3.5);
    expect($recorderTask->status)->toBe(AssignedTask::STATUS_COMPLETED);
    expect((float) $recorderTask->hours_logged)->toBe(2.5);
    expect($absentTask->status)->toBe(AssignedTask::STATUS_NO_SHOW);
    expect((float) $absentTask->hours_logged)->toBe(0.0);

    // Preserved distribution logs and chat messages after disbanding
    expect(FeedingDistributionLog::query()->where('feeding_schedule_id', $schedule->id)->count())->toBe(1);
    expect(GroupMessage::query()->where('group_type', 'feeding')->where('group_id', $schedule->id)->count())->toBe(1);
});

it('never issues certificates or hours to no-show event attendees and disbands the event group', function (): void {
    $admin = createUserWithRole(Role::Admin);
    $lead = createUserWithRole(Role::Volunteer);
    $absent = createUserWithRole(Role::Volunteer);

    $event = Event::query()->create([
        'title' => 'Community Vaccination Drive',
        'category' => 'Medical',
        'date' => now()->toDateString(),
        'time' => '09:00 AM',
        'location' => 'City Park',
        'desc' => 'Outreach event',
        'status' => 'open',
        'approval_status' => 'approved',
        'created_by' => $admin->id,
    ]);

    $leadTask = AssignedTask::query()->create([
        'user_id' => $lead->id,
        'event_id' => $event->id,
        'role' => 'Route Lead',
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    $absentTask = AssignedTask::query()->create([
        'user_id' => $absent->id,
        'event_id' => $event->id,
        'role' => 'Participant',
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    // Route Lead completes event with individual attendance
    $this->actingAs($lead)->post(
        route('account.volunteer.events.complete', $event),
        [
            'attendees' => [
                ['task_id' => $leadTask->id, 'attended' => true, 'hours_logged' => 4.5],
                ['task_id' => $absentTask->id, 'attended' => false, 'hours_logged' => 0],
            ],
        ]
    )->assertRedirect();

    $event->refresh();
    expect($event->status)->toBe('closed');
    expect($event->disbanded_at)->not->toBeNull();

    // Admin issues certificates; only attended member receives one
    $this->actingAs($admin)->post(
        route('account.admin.events.issue-certificates', $event)
    )->assertRedirect();

    expect(Certificate::query()->where('event_id', $event->id)->where('user_id', $lead->id)->exists())->toBeTrue();
    expect(Certificate::query()->where('event_id', $event->id)->where('user_id', $absent->id)->exists())->toBeFalse();
});

it('enforces group chat authorization, highlights admin messages, and locks chat after disbanding', function (): void {
    $admin = createUserWithRole(Role::Admin);
    $member = createUserWithRole(Role::Volunteer);
    $outsider = createUserWithRole(Role::Volunteer);

    $schedule = FeedingSchedule::query()->create([
        'zone' => 'Zone B - Harbor',
        'day' => 'Sunday',
        'time' => '07:00 AM',
        'volunteers' => 4,
        'strays' => 15,
        'status' => 'active',
        'execution_status' => FeedingSchedule::ExecutionInProgress,
    ]);

    AssignedTask::query()->create([
        'user_id' => $member->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Recorder',
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    // Outsider is blocked
    $this->actingAs($outsider)
        ->getJson("/account/field-groups/feeding/{$schedule->id}/messages")
        ->assertForbidden();

    // Member can send a message
    $this->actingAs($member)
        ->postJson("/account/field-groups/feeding/{$schedule->id}/messages", [
            'message' => 'On my way with kibble!',
        ])
        ->assertCreated()
        ->assertJsonPath('message.sender.is_admin', false)
        ->assertJsonPath('message.sender.group_role', 'Recorder');

    // Admin can send a highlighted message
    $this->actingAs($admin)
        ->postJson("/account/field-groups/feeding/{$schedule->id}/messages", [
            'message' => 'Please check the alley behind Pier 2.',
        ])
        ->assertCreated()
        ->assertJsonPath('message.sender.is_admin', true);

    // Disband the group
    $schedule->update(['disbanded_at' => now()]);

    // Posting is rejected once disbanded
    $this->actingAs($member)
        ->postJson("/account/field-groups/feeding/{$schedule->id}/messages", [
            'message' => 'Late message',
        ])
        ->assertStatus(422);

    // Reading preserved messages still works
    $this->actingAs($member)
        ->getJson("/account/field-groups/feeding/{$schedule->id}/messages")
        ->assertOk()
        ->assertJsonPath('group.is_disbanded', true)
        ->assertJsonCount(2, 'messages');
});

it('sends an SOS injury alert from group chat notifying the field medic, route lead, and admins', function (): void {
    Notification::fake();

    $admin = createUserWithRole(Role::Admin);
    $lead = createUserWithRole(Role::Volunteer);
    $medic = createUserWithRole(Role::Volunteer);
    $feeder = createUserWithRole(Role::Volunteer);

    $schedule = FeedingSchedule::query()->create([
        'zone' => 'Zone C - Riverside',
        'day' => 'Monday',
        'time' => '06:30 AM',
        'volunteers' => 4,
        'strays' => 12,
        'status' => 'active',
        'execution_status' => FeedingSchedule::ExecutionInProgress,
    ]);

    AssignedTask::query()->create([
        'user_id' => $lead->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Route Lead',
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    AssignedTask::query()->create([
        'user_id' => $medic->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Field Medic',
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    AssignedTask::query()->create([
        'user_id' => $feeder->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Feeder',
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    $this->actingAs($feeder)
        ->postJson("/account/field-groups/feeding/{$schedule->id}/sos", [
            'incident_type' => 'animal_bite',
            'severity' => 'moderate',
            'location' => 'Riverside Bridge',
            'description' => 'Volunteer bitten on hand while feeding.',
        ])
        ->assertCreated()
        ->assertJsonPath('notified_count', 3);

    expect(VolunteerInjuryReport::query()->where('user_id', $feeder->id)->exists())->toBeTrue();
    expect(GroupMessage::query()->where('group_type', 'feeding')->where('group_id', $schedule->id)->where('message', 'like', '[SOS ALERT%')->exists())->toBeTrue();

    Notification::assertSentTo([$medic, $lead, $admin], VolunteerInjuryReportedNotification::class);
    Notification::assertNotSentTo($feeder, VolunteerInjuryReportedNotification::class);
});

it('deducts food inventory, updates linked feeding sponsorship totals, and exports mission summary CSV', function (): void {
    $recorder = createUserWithRole(Role::Volunteer);

    $donation = Donation::query()->create([
        'public_reference' => 'DON-1001',
        'donor_name' => 'Maria Santos',
        'donor_email' => 'maria@example.com',
        'type' => 'feeding_sponsorship',
        'amount' => 2500,
        'status' => 'confirmed',
    ]);

    $sponsorship = FeedingSponsorship::query()->create([
        'public_reference' => 'SPON-1001',
        'donation_id' => $donation->id,
        'donor_name' => 'Maria Santos',
        'donor_email' => 'maria@example.com',
        'donor_mobile' => '09171234567',
        'preferred_date' => now()->toDateString(),
        'occasion' => 'Birthday Feeding',
        'amount' => 2500,
        'status' => 'confirmed',
    ]);

    $schedule = FeedingSchedule::query()->create([
        'zone' => 'Zone D - Plaza',
        'day' => 'Tuesday',
        'time' => '08:00 AM',
        'volunteers' => 3,
        'strays' => 20,
        'food_packs_allocated' => 30,
        'feeding_sponsorship_id' => $sponsorship->id,
        'status' => 'active',
        'execution_status' => FeedingSchedule::ExecutionInProgress,
    ]);

    AssignedTask::query()->create([
        'user_id' => $recorder->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Recorder',
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    $this->actingAs($recorder)->post(
        route('account.volunteer.feeding-schedules.distributions.store', $schedule),
        [
            'street_or_stop' => 'Plaza Fountain',
            'food_type' => 'Dry Kibble',
            'food_packs_distributed' => 12,
            'strays_fed' => 18,
        ]
    )->assertRedirect();

    $sponsorship->refresh();
    expect($sponsorship->packs_distributed)->toBe(12);
    expect($sponsorship->strays_fed)->toBe(18);

    // Summary JSON shows remaining packs & sponsorship impact
    $this->actingAs($recorder)
        ->getJson("/account/field-groups/feeding/{$schedule->id}/summary")
        ->assertOk()
        ->assertJsonPath('feeding.total_food_packs_distributed', 12)
        ->assertJsonPath('feeding.remaining_packs', 18)
        ->assertJsonPath('feeding.sponsorship.public_reference', 'SPON-1001');

    // CSV export succeeds
    $this->actingAs($recorder)
        ->get("/account/field-groups/feeding/{$schedule->id}/summary/export")
        ->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

it('prevents lowering group member limit below current member count and supports disbanding from group settings', function (): void {
    $admin = createUserWithRole(Role::Admin);
    $memberA = createUserWithRole(Role::Volunteer);
    $memberB = createUserWithRole(Role::Volunteer);

    $schedule = FeedingSchedule::query()->create([
        'zone' => 'Zone E - Central',
        'day' => 'Friday',
        'time' => '09:00 AM',
        'volunteers' => 4,
        'strays' => 15,
        'status' => 'active',
        'execution_status' => FeedingSchedule::ExecutionInProgress,
    ]);

    $taskA = AssignedTask::query()->create([
        'user_id' => $memberA->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Route Lead',
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    $taskB = AssignedTask::query()->create([
        'user_id' => $memberB->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Feeder',
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    // 2 members exist -> adjusting limit to 1 must fail validation
    $this->actingAs($admin)->post(
        route('account.admin.volunteer-management.groups.settings', ['type' => 'feeding', 'id' => $schedule->id]),
        ['quota' => 1]
    )->assertSessionHasErrors('quota');

    expect($schedule->fresh()->volunteers)->toBe(4);

    // Adjusting limit to 2 (equal to current members) or 6 succeeds
    $this->actingAs($admin)->post(
        route('account.admin.volunteer-management.groups.settings', ['type' => 'feeding', 'id' => $schedule->id]),
        ['quota' => 2]
    )->assertSessionHasNoErrors();

    expect($schedule->fresh()->volunteers)->toBe(2);

    // Disbanding via the group disband endpoint finalizes attendance and sets disbanded_at
    $this->actingAs($admin)->post(
        route('account.admin.volunteer-management.groups.disband', ['type' => 'feeding', 'id' => $schedule->id]),
        [
            'attendees' => [
                ['task_id' => $taskA->id, 'attended' => true, 'hours_logged' => 2.0],
                ['task_id' => $taskB->id, 'attended' => false, 'hours_logged' => 0],
            ],
        ]
    )->assertRedirect();

    expect($schedule->fresh()->disbanded_at)->not->toBeNull();
    expect($taskA->fresh()->status)->toBe(AssignedTask::STATUS_COMPLETED);
    expect($taskB->fresh()->status)->toBe(AssignedTask::STATUS_NO_SHOW);
});

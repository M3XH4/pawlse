<?php

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\FeedingSchedule;
use App\Models\User;
use App\Models\VolunteerInjuryReport;
use App\Notifications\VolunteerInjuryReportedNotification;
use App\Notifications\VolunteerMedicalAidUpdatedNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('volunteer can view injury reports page and submit a field injury report', function () {
    Notification::fake();
    Storage::fake('public');

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin->value);

    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);
    $volunteer->assignRole(Role::Volunteer->value);

    $schedule = FeedingSchedule::factory()->create();
    $task = AssignedTask::create([
        'user_id' => $volunteer->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Feeder',
        'status' => 'pending',
    ]);

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.injury-reports'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/injury-reports')
            ->has('recentTasks', 1)
        );

    $response = $this->actingAs($volunteer)->post(route('account.volunteer.injury-reports.store'), [
        'assigned_task_id' => $task->id,
        'incident_type' => 'animal_bite',
        'severity' => 'moderate',
        'body_part' => 'Left Hand',
        'location' => 'Public Market Corner',
        'incident_occurred_at' => now()->subHour()->format('Y-m-d H:i:s'),
        'description' => 'Bitten by a startled stray dog while placing food.',
        'first_aid_applied' => true,
        'first_aid_notes' => 'Washed with soap and clean water.',
        'photo' => UploadedFile::fake()->image('wound.jpg'),
    ]);

    $response->assertRedirect();

    $report = VolunteerInjuryReport::query()->where('user_id', $volunteer->id)->first();
    expect($report)->not->toBeNull();
    expect($report->status)->toBe(VolunteerInjuryReport::StatusReported);
    expect($report->assigned_task_id)->toBe($task->id);
    expect($report->photo_path)->not->toBeNull();

    Storage::disk('public')->assertExists($report->photo_path);
    Notification::assertSentTo($admin, VolunteerInjuryReportedNotification::class);
});

test('non-volunteer user cannot access volunteer injury reports', function () {
    $user = User::factory()->create(['role' => Role::User->value]);
    $user->assignRole(Role::User->value);

    $this->actingAs($user)
        ->get(route('account.volunteer.injury-reports'))
        ->assertForbidden();
});

test('admin can initiate medical aid and confirm completion for a volunteer injury report', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin->value);

    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);
    $volunteer->assignRole(Role::Volunteer->value);

    $report = VolunteerInjuryReport::factory()->create([
        'user_id' => $volunteer->id,
        'status' => VolunteerInjuryReport::StatusReported,
    ]);

    // Cannot confirm before initiating medical aid
    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.injuries.confirm-aid', $report), [
            'confirmation_notes' => 'Premature confirmation.',
        ])
        ->assertRedirect();

    expect($report->fresh()->status)->toBe(VolunteerInjuryReport::StatusReported);

    // Initiate medical aid
    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.injuries.initiate-aid', $report), [
            'medical_aid_type' => 'anti_rabies_tetanus',
            'medical_facility' => 'City Animal Bite Center',
            'medical_aid_notes' => 'Proceed to City Bite Center for anti-rabies vaccine.',
        ])
        ->assertRedirect();

    $report->refresh();
    expect($report->status)->toBe(VolunteerInjuryReport::StatusMedicalAidInitiated);
    expect($report->initiated_by_user_id)->toBe($admin->id);
    expect($report->medical_facility)->toBe('City Animal Bite Center');
    Notification::assertSentTo($volunteer, VolunteerMedicalAidUpdatedNotification::class);

    // Confirm medical aid
    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.injuries.confirm-aid', $report), [
            'confirmation_notes' => 'Volunteer completed vaccination and is resting.',
        ])
        ->assertRedirect();

    $report->refresh();
    expect($report->status)->toBe(VolunteerInjuryReport::StatusConfirmed);
    expect($report->confirmed_by_user_id)->toBe($admin->id);
    expect($report->confirmed_at)->not->toBeNull();
});

test('admin can log injury report on behalf of a volunteer with field medic and volunteer sees team group', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin->value);

    $volunteer = User::factory()->create(['role' => Role::Volunteer->value, 'name' => 'Alex Cruz']);
    $volunteer->assignRole(Role::Volunteer->value);

    $medic = User::factory()->create(['role' => Role::Volunteer->value, 'name' => 'Dr. Jamie Reyes']);
    $medic->assignRole(Role::Volunteer->value);

    $schedule = FeedingSchedule::factory()->create(['zone' => 'Harbor Route']);
    AssignedTask::create([
        'user_id' => $volunteer->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Food Carrier',
        'status' => 'pending',
    ]);
    AssignedTask::create([
        'user_id' => $medic->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Field Medic',
        'status' => 'pending',
    ]);

    // Volunteer dashboard shows their team group and medic teammate
    $this->actingAs($volunteer)
        ->get(route('account.volunteer.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/dashboard')
            ->has('myFieldTeams', 1)
            ->where('myFieldTeams.0.group_name', 'Harbor Route')
            ->where('myFieldTeams.0.my_role', 'Food Carrier')
            ->has('myFieldTeams.0.members', 2)
        );

    // Admin logs injury report on behalf of volunteer and initiates medical aid with the field medic
    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.injuries.store'), [
            'user_id' => $volunteer->id,
            'incident_type' => 'animal_bite',
            'severity' => 'moderate',
            'body_part' => 'Right Calf',
            'location' => 'Harbor Route Stop 3',
            'incident_occurred_at' => now()->format('Y-m-d H:i:s'),
            'description' => 'Volunteer was bitten during feeding.',
            'assigned_medic_user_id' => $medic->id,
            'initiate_aid_now' => true,
            'medical_aid_type' => 'onsite_first_aid',
            'medical_facility' => 'On-Site Field Medic Team',
            'medical_aid_notes' => 'Field Medic Jamie Reyes dispatched to treat wound.',
        ])
        ->assertRedirect();

    $report = VolunteerInjuryReport::query()->where('user_id', $volunteer->id)->first();
    expect($report)->not->toBeNull();
    expect($report->status)->toBe(VolunteerInjuryReport::StatusMedicalAidInitiated);
    expect($report->assigned_medic_user_id)->toBe($medic->id);
    Notification::assertSentTo($volunteer, VolunteerMedicalAidUpdatedNotification::class);
});

test('volunteer injury reports can be filtered by search, status, severity, incident type, and sort order', function () {
    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);
    $volunteer->assignRole(Role::Volunteer->value);

    $biteReport = VolunteerInjuryReport::factory()->create([
        'user_id' => $volunteer->id,
        'incident_type' => 'animal_bite',
        'severity' => 'severe',
        'status' => VolunteerInjuryReport::StatusReported,
        'location' => 'Public Market Gate',
        'description' => 'Deep dog bite near market entrance.',
        'created_at' => now()->subDays(2),
    ]);

    $sprainReport = VolunteerInjuryReport::factory()->create([
        'user_id' => $volunteer->id,
        'incident_type' => 'fall_or_sprain',
        'severity' => 'minor',
        'status' => VolunteerInjuryReport::StatusConfirmed,
        'location' => 'Shelter Courtyard',
        'description' => 'Twisted ankle while carrying supplies.',
        'created_at' => now()->subDay(),
    ]);

    // Filter by status, severity, and incident_type
    $this->actingAs($volunteer)
        ->get(route('account.volunteer.injury-reports', [
            'status' => VolunteerInjuryReport::StatusConfirmed,
            'severity' => 'minor',
            'incident_type' => 'fall_or_sprain',
        ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/injury-reports')
            ->has('reports.data', 1)
            ->where('reports.data.0.id', $sprainReport->id)
            ->where('filters.status', VolunteerInjuryReport::StatusConfirmed)
            ->where('filters.severity', 'minor')
            ->where('filters.incident_type', 'fall_or_sprain')
        );

    // Filter by search with #ID
    $this->actingAs($volunteer)
        ->get(route('account.volunteer.injury-reports', ['search' => "#{$biteReport->id}"]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('reports.data', 1)
            ->where('reports.data.0.id', $biteReport->id)
        );

    // Sort oldest first
    $this->actingAs($volunteer)
        ->get(route('account.volunteer.injury-reports', ['sort' => 'oldest']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('reports.data', 2)
            ->where('reports.data.0.id', $biteReport->id)
            ->where('filters.sort', 'oldest')
        );
});

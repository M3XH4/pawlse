<?php

use App\Enums\ShelterAnimalStatus;
use App\Models\AssignedTask;
use App\Models\Badge;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\FeedingSchedule;
use App\Models\FosterParent;
use App\Models\FosterPlacement;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\UserBadge;
use App\Models\VolunteerApplication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected from volunteer home dashboard', function () {
    $this->get(route('account.volunteer.index'))
        ->assertRedirect(route('login'));
});

test('non-volunteers cannot access volunteer home dashboard', function (string $state) {
    $user = User::factory()->{$state}()->create();

    $this->actingAs($user)
        ->get(route('account.volunteer.index'))
        ->assertForbidden();
})->with(['user', 'admin', 'superAdmin']);

test('authenticated volunteer can view volunteer home dashboard with expected props', function () {
    $volunteer = User::factory()->volunteer()->create();

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/dashboard')
            ->has('volunteerSummary')
            ->has('impactTier')
            ->has('stats')
            ->has('activeMissions')
            ->has('readinessChecklist')
            ->has('recentBadges')
            ->has('upcomingEvents')
            ->has('shelterPulse')
            ->has('communityVolunteersPulse')
            ->has('urgentSosAlerts')
            ->has('recentMilestones')
            ->has('latestBlogs')
            ->has('blogCategories')
            ->where('volunteerMapEnabled', true)
        );
});

test('volunteer dashboard accurately aggregates stats, impact tier, and isolates other volunteers data', function () {
    $volunteer = User::factory()->volunteer()->create();
    $otherVolunteer = User::factory()->volunteer()->create();

    VolunteerApplication::create([
        'user_id' => $volunteer->id,
        'full_name' => $volunteer->name,
        'email' => $volunteer->email,
        'mobile' => '09171234567',
        'address' => 'Cebu City',
        'role' => 'Rescue Team',
        'why' => 'Want to help strays',
        'status' => 'approved',
        'reference_number' => 'VOL-TEST-001',
    ]);

    $event = Event::factory()->create([
        'title' => 'Weekend Adoption Drive',
        'date' => now()->addDays(5)->toDateString(),
        'time' => '09:00 AM',
        'location' => 'Main Shelter',
        'category' => 'adoption',
        'spots' => 10,
    ]);

    $feeding = FeedingSchedule::create([
        'zone' => 'North Park Zone',
        'day' => 'Saturday',
        'time' => '07:00 AM',
        'status' => 'active',
    ]);

    // Pending task for this volunteer
    AssignedTask::create([
        'user_id' => $volunteer->id,
        'feeding_schedule_id' => $feeding->id,
        'role' => 'Feeder',
        'status' => 'pending',
    ]);

    // Completed task for this volunteer (6 hours -> 60 + 15 = 75 pts -> Paws Helper)
    AssignedTask::create([
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'role' => 'Event Helper',
        'status' => 'completed',
        'hours_logged' => 6.0,
    ]);

    // Task for another volunteer (must not leak)
    AssignedTask::create([
        'user_id' => $otherVolunteer->id,
        'event_id' => $event->id,
        'role' => 'Event Helper',
        'status' => 'pending',
        'hours_logged' => 12.0,
    ]);

    $badge = Badge::create([
        'slug' => 'first-shift',
        'audience' => Badge::AUDIENCE_VOLUNTEER,
        'category' => 'milestones',
        'tier' => 'bronze',
        'name' => 'First Shift',
        'description' => 'Completed your first volunteer shift.',
        'task_label' => 'Complete 1 task',
        'metric_key' => 'completed_tasks',
        'target_value' => 1,
        'xp_reward' => 50,
        'is_active' => true,
    ]);

    UserBadge::create([
        'user_id' => $volunteer->id,
        'badge_id' => $badge->id,
        'progress_value' => 1,
        'unlocked_at' => now(),
        'is_pinned' => true,
    ]);

    Certificate::create([
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'title' => 'Volunteer Appreciation',
        'certificate_number' => 'CERT-VOL-100',
        'role' => 'Rescue Team',
        'issue_date' => now()->toDateString(),
    ]);

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/dashboard')
            ->where('volunteerSummary.role', 'Rescue Team')
            ->where('volunteerSummary.reference_number', 'VOL-TEST-001')
            ->where('impactTier.name', 'Paws Helper')
            ->where('impactTier.score', 75)
            ->where('stats.pendingTasksCount', 1)
            ->where('stats.completedTasksCount', 1)
            ->where('stats.totalHours', 6)
            ->where('stats.badgesCount', 1)
            ->where('stats.certificatesCount', 1)
            ->has('activeMissions', 1)
            ->where('activeMissions.0.kind', 'feeding')
            ->where('activeMissions.0.title', 'North Park Zone')
            ->has('recentBadges', 1)
            ->where('recentBadges.0.name', 'First Shift')
            ->where('readinessChecklist.hasCompletedMission', true)
            ->where('readinessChecklist.hasEarnedBadge', true)
            ->where('readinessChecklist.hasFosterOrCertificate', true)
            ->has('recentMilestones', 3)
            ->where('upcomingEvents.0.is_joined', true)
            ->has('shelterPulse.urgencyLabel')
        );
});

test('volunteer dashboard displays active foster spotlight when volunteering as foster parent', function () {
    $volunteer = User::factory()->volunteer()->create();
    $admin = User::factory()->admin()->create();

    $fosterParent = FosterParent::factory()->create([
        'user_id' => $volunteer->id,
        'status' => 'approved',
        'capacity' => 2,
        'approved_at' => now(),
    ]);

    $animal = ShelterAnimal::factory()->create([
        'name' => 'Mochi',
        'breed' => 'Aspin',
        'status' => ShelterAnimalStatus::Foster,
    ]);

    FosterPlacement::factory()->create([
        'shelter_animal_id' => $animal->id,
        'foster_parent_id' => $fosterParent->id,
        'foster_parent_user_id' => $volunteer->id,
        'assigned_by' => $admin->id,
        'status' => 'active',
        'start_date' => now()->subDays(4)->toDateString(),
        'expected_review_date' => now()->addDay()->toDateString(),
        'care_instructions' => 'Feed twice daily.',
    ]);

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/dashboard')
            ->where('volunteerSummary.is_approved_foster', true)
            ->where('stats.activeFosterCount', 1)
            ->where('fosterSpotlight.pet_name', 'Mochi')
            ->where('fosterSpotlight.breed', 'Aspin')
            ->where('fosterSpotlight.days_in_care', 4)
            ->where('fosterSpotlight.is_review_near_or_overdue', true)
        );
});

test('volunteer dashboard reflects disabled volunteer_map_enabled setting', function () {
    $volunteer = User::factory()->volunteer()->create();

    SystemSetting::setValue('system_settings', [
        'volunteer_map_enabled' => false,
    ]);

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/dashboard')
            ->where('volunteerMapEnabled', false)
        );
});

test('volunteer dashboard surfaces urgent unassigned sos alerts, community pulse, and rescue quick-status flags', function () {
    $volunteer = User::factory()->volunteer()->create();
    User::factory()->volunteer()->create();

    // Unassigned SOS report (should appear in urgentSosAlerts)
    $unassignedSos = PetReport::create([
        'type' => 'sos',
        'animal_type' => 'dog',
        'location' => 'Iligan Plaza',
        'status' => 'pending',
    ]);

    // Assigned rescue report for this volunteer (should NOT appear in urgentSosAlerts, SHOULD have can_update_rescue)
    $assignedRescue = PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'cat',
        'location' => 'Tibanga',
        'status' => 'assigned',
        'assigned_volunteer_id' => $volunteer->id,
    ]);

    AssignedTask::create([
        'user_id' => $volunteer->id,
        'pet_report_id' => $assignedRescue->id,
        'role' => 'Rescue Team',
        'status' => 'pending',
    ]);

    AssignedTask::create([
        'user_id' => $volunteer->id,
        'role' => 'Feeder',
        'status' => 'completed',
        'hours_logged' => 3.5,
    ]);

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/dashboard')
            ->where('communityVolunteersPulse.activeVolunteersCount', 2)
            ->where('communityVolunteersPulse.monthlyHoursLogged', 3.5)
            ->where('communityVolunteersPulse.monthlyMissionsCompleted', 1)
            ->has('urgentSosAlerts', 1)
            ->where('urgentSosAlerts.0.id', $unassignedSos->id)
            ->where('urgentSosAlerts.0.location', 'Iligan Plaza')
            ->has('activeMissions', 1)
            ->where('activeMissions.0.kind', 'rescue')
            ->where('activeMissions.0.pet_report_id', $assignedRescue->id)
            ->where('activeMissions.0.can_update_rescue', true)
        );
});

test('volunteer assigned tasks can be filtered by search, type, and sort order', function () {
    $volunteer = User::factory()->volunteer()->create();

    $event = Event::factory()->create([
        'title' => 'Weekend Adoption Drive',
        'location' => 'Main Plaza',
    ]);

    $feeding = FeedingSchedule::create([
        'zone' => 'Harbor Feeding Zone',
        'day' => 'Sunday',
        'time' => '06:00 AM',
        'status' => 'active',
    ]);

    $eventTask = AssignedTask::create([
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'role' => 'Booth Helper',
        'status' => AssignedTask::STATUS_PENDING,
        'created_at' => now()->subDays(2),
    ]);

    $feedingTask = AssignedTask::create([
        'user_id' => $volunteer->id,
        'feeding_schedule_id' => $feeding->id,
        'role' => 'Route Feeder',
        'status' => AssignedTask::STATUS_PENDING,
        'created_at' => now()->subDay(),
    ]);

    // Filter by type=feeding
    $this->actingAs($volunteer)
        ->get(route('account.volunteer.assigned-tasks', ['type' => 'feeding']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/assigned-tasks')
            ->has('tasks.data', 1)
            ->where('tasks.data.0.id', $feedingTask->id)
            ->where('filters.type', 'feeding')
        );

    // Filter by search matching event title
    $this->actingAs($volunteer)
        ->get(route('account.volunteer.assigned-tasks', ['search' => 'Adoption']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('tasks.data', 1)
            ->where('tasks.data.0.id', $eventTask->id)
            ->where('filters.search', 'Adoption')
        );

    // Sort oldest first
    $this->actingAs($volunteer)
        ->get(route('account.volunteer.assigned-tasks', ['sort' => 'oldest']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('tasks.data', 2)
            ->where('tasks.data.0.id', $eventTask->id)
            ->where('filters.sort', 'oldest')
        );
});

test('volunteer participation history can be filtered by search, type, status, and sort order', function () {
    $volunteer = User::factory()->volunteer()->create();

    $event = Event::factory()->create([
        'title' => 'Community Spay Clinic',
        'location' => 'City Hall',
    ]);

    $rescue = PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'dog',
        'name' => 'Buddy',
        'location' => 'Downtown',
        'status' => 'resolved',
    ]);

    $completedEventTask = AssignedTask::create([
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'role' => 'Clinic Assistant',
        'status' => AssignedTask::STATUS_COMPLETED,
        'hours_logged' => 4.0,
        'created_at' => now()->subDays(3),
    ]);

    $noShowRescueTask = AssignedTask::create([
        'user_id' => $volunteer->id,
        'pet_report_id' => $rescue->id,
        'role' => 'Rescue Transporter',
        'status' => AssignedTask::STATUS_NO_SHOW,
        'hours_logged' => 0.0,
        'created_at' => now()->subDay(),
    ]);

    // Filter by status=no_show
    $this->actingAs($volunteer)
        ->get(route('account.volunteer.participation-history', ['status' => AssignedTask::STATUS_NO_SHOW]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/participation-history')
            ->has('history.data', 1)
            ->where('history.data.0.id', $noShowRescueTask->id)
            ->where('filters.status', AssignedTask::STATUS_NO_SHOW)
        );

    // Filter by type=event and search=Clinic
    $this->actingAs($volunteer)
        ->get(route('account.volunteer.participation-history', ['type' => 'event', 'search' => 'Clinic']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('history.data', 1)
            ->where('history.data.0.id', $completedEventTask->id)
            ->where('filters.type', 'event')
            ->where('filters.search', 'Clinic')
        );

    // Sort oldest first
    $this->actingAs($volunteer)
        ->get(route('account.volunteer.participation-history', ['sort' => 'oldest']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('history.data', 2)
            ->where('history.data.0.id', $completedEventTask->id)
            ->where('filters.sort', 'oldest')
        );
});

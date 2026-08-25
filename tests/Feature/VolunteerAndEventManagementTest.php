<?php

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\Event;
use App\Models\FeedingSchedule;
use App\Models\User;
use App\Models\VolunteerApplication;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('a user can apply to become a volunteer', function () {
    $user = User::factory()->create(['role' => Role::User->value]);

    $response = $this->actingAs($user)
        ->post(route('volunteer.apply'), [
            'fullName' => 'John Doe',
            'mobile' => '09123456789',
            'email' => 'john@example.com',
            'address' => 'Iligan City',
            'role' => 'Food Carrier',
            'why' => 'I love helping strays.',
            'experience' => 'Fed street dogs before.',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('volunteer_applications', [
        'user_id' => $user->id,
        'full_name' => 'John Doe',
        'status' => 'pending',
    ]);
});

test('admin can approve a volunteer application and user gains role', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create(['role' => Role::User->value]);

    $application = VolunteerApplication::factory()->create([
        'user_id' => $user->id,
        'full_name' => 'John Doe',
        'status' => 'pending',
        'reference_number' => 'VOL-123456',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.approve', $application));

    $response->assertRedirect();
    $this->assertDatabaseHas('volunteer_applications', [
        'id' => $application->id,
        'status' => 'approved',
    ]);

    $user->refresh();
    expect($user->role)->toBe(Role::Volunteer->value);
    expect($user->hasRole(Role::Volunteer->value))->toBeTrue();
});

test('admin can reject a volunteer application with reason', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create(['role' => Role::User->value]);

    $application = VolunteerApplication::factory()->create([
        'user_id' => $user->id,
        'status' => 'pending',
        'reference_number' => 'VOL-123456',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.reject', $application), [
            'rejection_reason' => 'Insufficient availability details.',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('volunteer_applications', [
        'id' => $application->id,
        'status' => 'rejected',
        'rejection_reason' => 'Insufficient availability details.',
    ]);
});

test('approved user can switch their role to volunteer and switch back to user dashboard', function () {
    $user = User::factory()->create(['role' => Role::User->value]);

    VolunteerApplication::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'reference_number' => 'VOL-123456',
    ]);

    // Test switch to volunteer
    $response = $this->actingAs($user)
        ->get(route('volunteer.switch'));

    $response->assertRedirect(route('account.volunteer.index'));
    $user->refresh();
    expect($user->role)->toBe(Role::Volunteer->value);

    // Test switch back to user
    $response = $this->actingAs($user)
        ->get(route('volunteer.switch-user'));

    $response->assertRedirect(route('account.user.index'));
    $user->refresh();
    expect($user->role)->toBe(Role::User->value);
});

test('user can view volunteer onboarding status inside user dashboard', function () {
    $user = User::factory()->create(['role' => Role::User->value]);

    $response = $this->actingAs($user)
        ->get(route('account.user.volunteer-status'));

    $response->assertOk();
});

test('admin can manage events and feeding schedules', function () {
    $admin = User::factory()->admin()->create();

    // 1. Create Event
    $response = $this->actingAs($admin)
        ->post(route('account.admin.events.store'), [
            'title' => 'Vaccination Campaign',
            'category' => 'Medical',
            'date' => now()->addDays(2)->toDateString(),
            'time' => '10:00 AM',
            'location' => 'Pala-o Market',
            'spots' => 10,
            'desc' => 'Rabies shots for dogs.',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('events', [
        'title' => 'Vaccination Campaign',
        'spots' => 10,
    ]);

    $event = Event::query()->first();

    // 2. Toggle Status
    $this->actingAs($admin)
        ->post(route('account.admin.events.toggle', $event));
    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'status' => 'closed',
    ]);

    // 3. Create Feeding Route
    $this->actingAs($admin)
        ->post(route('account.admin.feeding-schedules.store'), [
            'zone' => 'Tibanga Zone A',
            'day' => 'Every Monday',
            'time' => '5:00 PM',
            'volunteers' => 5,
            'strays' => 20,
        ]);

    $this->assertDatabaseHas('feeding_schedules', [
        'zone' => 'Tibanga Zone A',
        'strays' => 20,
    ]);
});

test('volunteer can join an event and feeding route', function () {
    $volunteer = User::factory()->volunteer()->create();
    $event = Event::factory()->create(['status' => 'open', 'spots' => 5]);
    $schedule = FeedingSchedule::factory()->create(['status' => 'active']);

    // Join event
    $response = $this->actingAs($volunteer)
        ->post(route('events.join', $event));

    $response->assertRedirect();
    $this->assertDatabaseHas('assigned_tasks', [
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'status' => 'pending',
    ]);

    $event->refresh();
    expect($event->spots)->toBe(4);

    // Join feeding route
    $response = $this->actingAs($volunteer)
        ->post(route('feeding-schedules.join', $schedule));

    $response->assertRedirect();
    $this->assertDatabaseHas('assigned_tasks', [
        'user_id' => $volunteer->id,
        'feeding_schedule_id' => $schedule->id,
        'status' => 'pending',
    ]);
});

test('admin can assign tasks and complete them', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();
    $event = Event::factory()->create();

    // Assign
    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.assign'), [
            'user_id' => $volunteer->id,
            'event_id' => $event->id,
            'role' => 'Feeding Lead',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('assigned_tasks', [
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'role' => 'Feeding Lead',
        'status' => 'pending',
    ]);

    $task = AssignedTask::query()->first();

    // Complete
    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.update-task-status', $task), [
            'status' => 'completed',
            'hours_logged' => 4.5,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('assigned_tasks', [
        'id' => $task->id,
        'status' => 'completed',
        'hours_logged' => 4.5,
    ]);
});

test('admin can manually issue certificate to a volunteer', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.issue-certificate'), [
            'user_id' => $volunteer->id,
            'title' => 'Outstanding Caregiver Award',
            'description' => 'For extreme commitment to strays.',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('certificates', [
        'user_id' => $volunteer->id,
        'title' => 'Outstanding Caregiver Award',
    ]);
});

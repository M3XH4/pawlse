<?php

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\Event;
use App\Models\PetReport;
use App\Models\User;
use App\Models\VolunteerApplication;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

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

test('volunteer application validates required fields', function () {
    $user = User::factory()->create(['role' => Role::User->value]);

    $response = $this->actingAs($user)
        ->post(route('volunteer.apply'), [
            'fullName' => '',
            'mobile' => '',
            'email' => 'not-an-email',
            'address' => '',
            'role' => '',
            'why' => '',
        ]);

    $response->assertSessionHasErrors(['fullName', 'mobile', 'email', 'address', 'role', 'why']);
});

test('admin can view volunteer management dashboard with applications, volunteers, and tasks', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();

    VolunteerApplication::factory()->create([
        'user_id' => $volunteer->id,
        'status' => 'approved',
        'full_name' => 'Jane Smith',
    ]);

    $response = $this->actingAs($admin)
        ->get(route('account.admin.volunteer-management'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/volunteer-management')
            ->has('applications.data')
            ->has('volunteers.data')
            ->has('tasks.data')
        );
});

test('admin can approve a volunteer application and user gains volunteer role', function () {
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

test('admin can manually assign task to volunteer for an event and decrement spots', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();
    $event = Event::factory()->create(['spots' => 10]);

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

    $event->refresh();
    expect($event->spots)->toBe(9);
});

test('admin cannot assign volunteer to the same activity twice', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();
    $event = Event::factory()->create();

    AssignedTask::factory()->create([
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'role' => 'Helper',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.assign'), [
            'user_id' => $volunteer->id,
            'event_id' => $event->id,
            'role' => 'Feeding Lead',
        ]);

    $response->assertSessionHasErrors(['task_target']);
});

test('admin cannot assign task without selecting an event or feeding schedule', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.assign'), [
            'user_id' => $volunteer->id,
            'role' => 'Helper',
        ]);

    $response->assertSessionHasErrors(['task_target']);
});

test('admin can update task status to completed and log hours', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();
    $event = Event::factory()->create();

    $task = AssignedTask::factory()->create([
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'role' => 'Feeding Lead',
        'status' => 'pending',
    ]);

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

test('cancelling a task restores event spots count', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();
    $event = Event::factory()->create(['spots' => 4]);

    $task = AssignedTask::factory()->create([
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.update-task-status', $task), [
            'status' => 'cancelled',
        ]);

    $response->assertRedirect();
    $event->refresh();
    expect($event->spots)->toBe(5);
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

test('volunteer can view their profile details', function () {
    $volunteer = User::factory()->volunteer()->create();

    VolunteerApplication::factory()->create([
        'user_id' => $volunteer->id,
        'status' => 'approved',
        'full_name' => 'Jane Volunteer',
        'mobile' => '09999999999',
        'address' => 'Iligan City',
        'role' => 'Recorder',
        'why' => 'I want to document strays.',
    ]);

    $response = $this->actingAs($volunteer)
        ->get(route('account.volunteer.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/profile-information')
            ->has('profile')
            ->where('profile.full_name', 'Jane Volunteer')
        );
});

test('volunteer can update their profile details', function () {
    $volunteer = User::factory()->volunteer()->create();

    $application = VolunteerApplication::factory()->create([
        'user_id' => $volunteer->id,
        'status' => 'approved',
        'full_name' => 'Jane Volunteer',
    ]);

    $response = $this->actingAs($volunteer)
        ->post(route('account.volunteer.profile.update'), [
            'fullName' => 'Jane Updated',
            'mobile' => '09111111111',
            'address' => 'New Address',
            'experience' => 'Updated experience',
        ]);

    $response->assertRedirect();

    $application->refresh();
    expect($application->full_name)->toBe('Jane Updated');
    expect($application->mobile)->toBe('09111111111');
    expect($application->address)->toBe('New Address');
    expect($application->experience)->toBe('Updated experience');

    $volunteer->refresh();
    expect($volunteer->name)->toBe('Jane Updated');
});

test('volunteer can update status of their assigned rescue report', function () {
    $volunteer = User::factory()->volunteer()->create();
    $report = PetReport::factory()->create([
        'assigned_volunteer_id' => $volunteer->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($volunteer)
        ->post(route('account.volunteer.rescue-reports.update-status', $report), [
            'status' => 'resolved',
        ]);

    $response->assertRedirect();

    $report->refresh();
    expect($report->status)->toBe('resolved');
});

test('volunteer cannot update status of another volunteer assigned rescue report', function () {
    $volunteer1 = User::factory()->volunteer()->create();
    $volunteer2 = User::factory()->volunteer()->create();
    $report = PetReport::factory()->create([
        'assigned_volunteer_id' => $volunteer2->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($volunteer1)
        ->post(route('account.volunteer.rescue-reports.update-status', $report), [
            'status' => 'resolved',
        ]);

    $response->assertStatus(403);

    $report->refresh();
    expect($report->status)->toBe('pending');
});

<?php

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\Event;
use App\Models\FeedingSchedule;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('public users can browse events and feeding schedules', function () {
    Event::factory()->count(3)->create();
    FeedingSchedule::factory()->count(2)->create();

    $response = $this->get(route('events'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events')
            ->has('events.data', 3)
            ->has('feedingSchedules.data', 2)
            ->has('filters')
        );
});

test('users can filter events by category and search term', function () {
    Event::factory()->create(['title' => 'Vaccination Caravan', 'category' => 'Medical']);
    Event::factory()->create(['title' => 'Puppy Adoption Day', 'category' => 'Adoption']);

    $response = $this->get(route('events', [
        'search' => 'Vaccination',
        'category' => 'Medical',
    ]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events')
            ->has('events.data', 1)
            ->where('events.data.0.title', 'Vaccination Caravan')
        );
});

test('volunteer can join an open event and decrement available spots', function () {
    $volunteer = User::factory()->volunteer()->create();
    $event = Event::factory()->create(['status' => 'open', 'spots' => 15]);

    $response = $this->actingAs($volunteer)
        ->post(route('events.join', $event));

    $response->assertRedirect();
    $this->assertDatabaseHas('assigned_tasks', [
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'status' => 'pending',
    ]);

    $event->refresh();
    expect($event->spots)->toBe(14);
});

test('volunteer cannot join a closed event', function () {
    $volunteer = User::factory()->volunteer()->create();
    $event = Event::factory()->create(['status' => 'closed', 'spots' => 10]);

    $response = $this->actingAs($volunteer)
        ->post(route('events.join', $event));

    $response->assertRedirect();
    $this->assertDatabaseMissing('assigned_tasks', [
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
    ]);

    $event->refresh();
    expect($event->spots)->toBe(10);
});

test('volunteer cannot join a fully booked event with zero spots', function () {
    $volunteer = User::factory()->volunteer()->create();
    $event = Event::factory()->create(['status' => 'open', 'spots' => 0]);

    $response = $this->actingAs($volunteer)
        ->post(route('events.join', $event));

    $response->assertRedirect();
    $this->assertDatabaseMissing('assigned_tasks', [
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
    ]);
});

test('volunteer cannot join the same event twice', function () {
    $volunteer = User::factory()->volunteer()->create();
    $event = Event::factory()->create(['status' => 'open', 'spots' => 10]);

    AssignedTask::factory()->create([
        'user_id' => $volunteer->id,
        'event_id' => $event->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($volunteer)
        ->post(route('events.join', $event));

    $response->assertRedirect();
    expect(AssignedTask::where('user_id', $volunteer->id)->where('event_id', $event->id)->count())->toBe(1);
});

test('unauthenticated user is redirected to login when joining event', function () {
    $event = Event::factory()->create(['status' => 'open']);

    $response = $this->post(route('events.join', $event));

    $response->assertRedirect(route('login'));
});

test('regular non-volunteer user cannot join event directly', function () {
    $user = User::factory()->create(['role' => Role::User->value]);
    $event = Event::factory()->create(['status' => 'open']);

    $response = $this->actingAs($user)
        ->post(route('events.join', $event));

    $response->assertRedirect(route('home'));
    $response->assertSessionHasErrors(['error']);
});

test('volunteer can join an active feeding schedule route', function () {
    $volunteer = User::factory()->volunteer()->create();
    $schedule = FeedingSchedule::factory()->create(['status' => 'active']);

    $response = $this->actingAs($volunteer)
        ->post(route('feeding-schedules.join', $schedule));

    $response->assertRedirect();
    $this->assertDatabaseHas('assigned_tasks', [
        'user_id' => $volunteer->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Food Carrier',
        'status' => 'pending',
    ]);
});

test('volunteer cannot join an inactive feeding schedule route', function () {
    $volunteer = User::factory()->volunteer()->create();
    $schedule = FeedingSchedule::factory()->create(['status' => 'closed']);

    $response = $this->actingAs($volunteer)
        ->post(route('feeding-schedules.join', $schedule));

    $response->assertRedirect();
    $this->assertDatabaseMissing('assigned_tasks', [
        'user_id' => $volunteer->id,
        'feeding_schedule_id' => $schedule->id,
    ]);
});

test('volunteer cannot join the same feeding schedule route twice', function () {
    $volunteer = User::factory()->volunteer()->create();
    $schedule = FeedingSchedule::factory()->create(['status' => 'active']);

    AssignedTask::factory()->create([
        'user_id' => $volunteer->id,
        'feeding_schedule_id' => $schedule->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($volunteer)
        ->post(route('feeding-schedules.join', $schedule));

    $response->assertRedirect();
    expect(AssignedTask::where('user_id', $volunteer->id)->where('feeding_schedule_id', $schedule->id)->count())->toBe(1);
});

test('admin can view admin events management dashboard', function () {
    $admin = User::factory()->admin()->create();
    Event::factory()->count(2)->create();
    FeedingSchedule::factory()->count(2)->create();

    $response = $this->actingAs($admin)
        ->get(route('account.admin.events'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/events')
            ->has('events.data', 2)
            ->has('feedingSchedules.data', 2)
            ->has('filters')
        );
});

test('admin can create a new event with validation', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->post(route('account.admin.events.store'), [
            'title' => 'Annual Rabies Drive',
            'category' => 'Medical',
            'date' => now()->addDays(5)->toDateString(),
            'time' => '08:00 AM - 12:00 PM',
            'location' => 'City Plaza',
            'spots' => 30,
            'desc' => 'Free rabies shots for pets.',
            'keywords' => ['rabies', 'free', 'medical'],
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('events', [
        'title' => 'Annual Rabies Drive',
        'category' => 'Medical',
        'spots' => 30,
        'status' => 'open',
    ]);
});

test('admin can update an existing event', function () {
    $admin = User::factory()->admin()->create();
    $event = Event::factory()->create([
        'title' => 'Old Event Title',
        'spots' => 10,
    ]);

    $response = $this->actingAs($admin)
        ->put(route('account.admin.events.update', $event), [
            'title' => 'Updated Event Title',
            'category' => 'Social',
            'date' => now()->addDays(10)->toDateString(),
            'time' => '02:00 PM - 05:00 PM',
            'location' => 'Main Auditorium',
            'spots' => 25,
            'desc' => 'Updated description.',
        ]);

    $response->assertRedirect();
    $event->refresh();
    expect($event->title)->toBe('Updated Event Title');
    expect($event->spots)->toBe(25);
});

test('admin can toggle event status between open and closed', function () {
    $admin = User::factory()->admin()->create();
    $event = Event::factory()->create(['status' => 'open']);

    // 1. Toggle to closed
    $response = $this->actingAs($admin)
        ->post(route('account.admin.events.toggle', $event));

    $response->assertRedirect();
    $event->refresh();
    expect($event->status)->toBe('closed');

    // 2. Toggle back to open
    $this->actingAs($admin)
        ->post(route('account.admin.events.toggle', $event));

    $event->refresh();
    expect($event->status)->toBe('open');
});

test('admin can delete an event', function () {
    $admin = User::factory()->admin()->create();
    $event = Event::factory()->create();

    $response = $this->actingAs($admin)
        ->delete(route('account.admin.events.destroy', $event));

    $response->assertRedirect();
    $this->assertSoftDeleted('events', [
        'id' => $event->id,
    ]);
});

test('admin can create, update, and delete feeding schedule routes', function () {
    $admin = User::factory()->admin()->create();

    // 1. Create Feeding Route
    $response = $this->actingAs($admin)
        ->post(route('account.admin.feeding-schedules.store'), [
            'zone' => 'Pala-o Zone 1',
            'day' => 'Every Saturday',
            'time' => '06:00 AM',
            'volunteers' => 4,
            'strays' => 25,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('feeding_schedules', [
        'zone' => 'Pala-o Zone 1',
        'volunteers' => 4,
    ]);

    $schedule = FeedingSchedule::where('zone', 'Pala-o Zone 1')->first();

    // 2. Update Route
    $this->actingAs($admin)
        ->put(route('account.admin.feeding-schedules.update', $schedule), [
            'zone' => 'Pala-o Zone 1 (Updated)',
            'day' => 'Every Sunday',
            'time' => '07:00 AM',
            'volunteers' => 6,
            'strays' => 30,
            'status' => 'active',
        ]);

    $schedule->refresh();
    expect($schedule->zone)->toBe('Pala-o Zone 1 (Updated)');
    expect($schedule->volunteers)->toBe(6);

    // 3. Delete Route
    $this->actingAs($admin)
        ->delete(route('account.admin.feeding-schedules.destroy', $schedule));

    $this->assertDatabaseMissing('feeding_schedules', [
        'id' => $schedule->id,
    ]);
});

test('non-admin user cannot access admin event management routes', function () {
    $user = User::factory()->create(['role' => Role::User->value]);

    $response = $this->actingAs($user)
        ->get(route('account.admin.events'));

    $response->assertStatus(403);
});

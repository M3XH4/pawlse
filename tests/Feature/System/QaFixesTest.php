<?php

use App\Enums\Role;
use App\Models\AdoptionApplication;
use App\Models\AdoptionApplicationFile;
use App\Models\BlogPost;
use App\Models\FeedingSchedule;
use App\Models\FosterParent;
use App\Models\RehomingRequest;
use App\Models\ShelterAnimal;
use App\Models\User;
use App\Models\VolunteerApplication;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('joinFeedingRoute enforces route capacity and respects specialization', function () {
    $user = User::factory()->create(['role' => Role::Volunteer->value]);
    $user->assignRole(Role::Volunteer);

    VolunteerApplication::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'role' => 'Medic Volunteer',
    ]);

    $schedule = FeedingSchedule::query()->create([
        'zone' => 'Pala-o Zone',
        'day' => 'Monday',
        'time' => '7:00 AM',
        'volunteers' => 1,
        'strays' => 5,
        'status' => 'active',
    ]);

    // First volunteer joins with their specialized role
    $response = $this->actingAs($user)
        ->post(route('feeding-schedules.join', $schedule));

    $response->assertRedirect();
    $this->assertDatabaseHas('assigned_tasks', [
        'user_id' => $user->id,
        'feeding_schedule_id' => $schedule->id,
        'role' => 'Medic Volunteer',
    ]);

    // Second volunteer tries to join the route, but capacity is 1
    $secondUser = User::factory()->create(['role' => Role::Volunteer->value]);
    $secondUser->assignRole(Role::Volunteer);

    $secondResponse = $this->actingAs($secondUser)
        ->post(route('feeding-schedules.join', $schedule));

    $secondResponse->assertRedirect();
    $this->assertDatabaseMissing('assigned_tasks', [
        'user_id' => $secondUser->id,
        'feeding_schedule_id' => $schedule->id,
    ]);
});

test('volunteer switch routes do not mutate role on GET requests', function () {
    $user = User::factory()->create(['role' => Role::User->value]);
    $user->assignRole(Role::User);

    VolunteerApplication::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
    ]);

    // GET request must NOT switch role
    $response = $this->actingAs($user)->get(route('volunteer.switch'));
    $response->assertRedirect();
    $this->assertEquals(Role::User->value, $user->fresh()->role);

    // POST request switches role to volunteer
    $postResponse = $this->actingAs($user)->post(route('volunteer.switch'));
    $postResponse->assertRedirect(route('account.volunteer.index'));
    $this->assertEquals(Role::Volunteer->value, $user->fresh()->role);

    // GET on switch-user must NOT revert role
    $getUserResponse = $this->actingAs($user)->get(route('volunteer.switch-user'));
    $getUserResponse->assertRedirect();
    $this->assertEquals(Role::Volunteer->value, $user->fresh()->role);

    // POST on switch-user reverts role to user
    $postUserResponse = $this->actingAs($user)->post(route('volunteer.switch-user'));
    $postUserResponse->assertRedirect(route('account.user.index'));
    $this->assertEquals(Role::User->value, $user->fresh()->role);
});

test('blog management handles direct file uploads for featured image', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin);

    $file = UploadedFile::fake()->image('article-banner.jpg', 600, 400);

    $response = $this->actingAs($admin)->post(route('account.admin.blog-management.store'), [
        'title' => 'Caring for Stray Puppies',
        'category' => 'rescue_story',
        'summary' => 'Comprehensive guide on health and wellness.',
        'content' => 'Lorem ipsum dolor sit amet article content.',
        'featured_image' => $file,
        'status' => 'published',
    ]);

    $response->assertRedirect();
    $post = BlogPost::where('title', 'Caring for Stray Puppies')->firstOrFail();
    $this->assertNotNull($post->featured_image);
    $this->assertStringContainsString('/storage/blog/', $post->featured_image);
});

test('rehoming surrender intake supports custom admitted_at date', function () {
    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin);

    $rehoming = RehomingRequest::factory()->create([
        'status' => 'pending',
        'species' => 'dog',
        'gender' => 'female',
        'animal_name' => 'Bella',
    ]);

    $customDate = '2026-01-15';

    $response = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.rehoming-requests.intake', $rehoming), [
            'intake_notes' => 'Received from owner after clinic clearance',
            'admitted_at' => $customDate,
        ]);

    $response->assertRedirect();
    $animal = ShelterAnimal::where('name', 'Bella')->firstOrFail();
    $this->assertEquals('2026-01-15', $animal->admitted_at->toDateString());
});

test('user adoption applications index eager loads files relation', function () {
    $user = User::factory()->create(['role' => Role::User->value]);
    $user->assignRole(Role::User);

    $animal = ShelterAnimal::factory()->create();
    $application = AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'shelter_animal_id' => $animal->id,
    ]);

    AdoptionApplicationFile::factory()->create([
        'adoption_application_id' => $application->id,
    ]);

    $response = $this->actingAs($user)->get(route('account.user.adoption-applications'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/adoption-applications')
            ->has('applications', 1)
            ->has('applications.0.files', 1)
        );
});

test('foster care dashboard renders appropriate component depending on route context', function () {
    $volunteer = User::factory()->volunteer()->create();
    FosterParent::factory()->create([
        'user_id' => $volunteer->id,
        'status' => 'approved',
    ]);

    $admin = User::factory()->admin()->create();
    FosterParent::factory()->create([
        'user_id' => $admin->id,
        'status' => 'approved',
    ]);

    // Accessed via volunteer route -> renders volunteer component
    $volunteerResponse = $this->actingAs($volunteer)->get(route('account.volunteer.foster-care'));
    $volunteerResponse->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/foster-care')
            ->where('theme', 'volunteer')
            ->where('isAdmin', false)
        );

    // Accessed via admin route -> renders admin component
    $adminResponse = $this->actingAs($admin)->get(route('account.admin.my-foster-pets'));
    $adminResponse->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/my-foster-pets')
            ->where('theme', 'admin')
            ->where('isAdmin', true)
        );
});

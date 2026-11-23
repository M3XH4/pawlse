<?php

use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\AssignedTask;
use App\Models\BlogPost;
use App\Models\BlogPostReaction;
use App\Models\Donation;
use App\Models\Event;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use App\Models\ShelterVisit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to login when accessing user home dashboard', function () {
    $this->get(route('account.user.index'))
        ->assertRedirect(route('login'));
});

test('authenticated verified users land on user dashboard from dashboard redirect', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('account.user.index'));

    $this->actingAs($user)
        ->get(route('account.user.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/dashboard')
            ->has('latestBlogs')
            ->has('blogCategories')
            ->has('featuredPets')
            ->has('upcomingEvents')
            ->has('recentActivities')
            ->has('communityPulse.careSustainability')
            ->has('missingAlerts')
            ->has('gettingStarted')
            ->has('volunteerInvite')
            ->has('stats')
        );
});

test('user dashboard displays published generalized blogs and excludes unpublished posts', function () {
    $user = User::factory()->create();

    $featuredPost = BlogPost::factory()->featured()->create([
        'title' => 'Featured Community Story',
        'published_at' => now()->subDay(),
    ]);

    $latestPost = BlogPost::factory()->create([
        'title' => 'Latest Rescue Update',
        'published_at' => now(),
    ]);

    BlogPost::factory()->draft()->create(['title' => 'Draft Story']);
    BlogPost::factory()->pending()->create(['title' => 'Pending Story']);
    BlogPost::factory()->rejected()->create(['title' => 'Rejected Story']);

    BlogPostReaction::create([
        'blog_post_id' => $featuredPost->id,
        'user_id' => $user->id,
        'reaction_type' => 'heart',
    ]);

    $this->actingAs($user)
        ->get(route('account.user.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/dashboard')
            ->has('latestBlogs', 2)
            ->where('latestBlogs.0.id', $featuredPost->id)
            ->where('latestBlogs.0.is_featured', true)
            ->where('latestBlogs.0.reaction_summary.total', 1)
            ->where('latestBlogs.0.user_reactions', ['heart'])
            ->where('latestBlogs.1.id', $latestPost->id)
        );
});

test('user dashboard shows only available adoptable pets and upcoming approved events', function () {
    $user = User::factory()->create();

    $availablePet = ShelterAnimal::factory()->create([
        'name' => 'Bantay',
        'status' => ShelterAnimalStatus::Available,
    ]);

    ShelterAnimal::factory()->create([
        'name' => 'Adopted Pet',
        'status' => ShelterAnimalStatus::Adopted,
    ]);

    $upcomingEvent = Event::factory()->create([
        'title' => 'Weekend Adoption Fair',
        'approval_status' => 'approved',
        'status' => 'open',
        'date' => now()->addDays(5)->toDateString(),
    ]);

    Event::factory()->create([
        'title' => 'Past Event',
        'approval_status' => 'approved',
        'status' => 'open',
        'date' => now()->subDays(5)->toDateString(),
    ]);

    $this->actingAs($user)
        ->get(route('account.user.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/dashboard')
            ->has('featuredPets', 1)
            ->where('featuredPets.0.id', $availablePet->id)
            ->where('featuredPets.0.name', 'Bantay')
            ->has('upcomingEvents', 1)
            ->where('upcomingEvents.0.id', $upcomingEvent->id)
            ->where('upcomingEvents.0.title', 'Weekend Adoption Fair')
        );
});

test('user dashboard includes community pulse, urgent missing alerts, getting started, and volunteer invite', function () {
    $user = User::factory()->create();

    ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Adopted]);
    ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    PetReport::factory()->create([
        'type' => 'rescue',
        'status' => 'pending',
    ]);

    $activeMissing = PetReport::factory()->create([
        'name' => 'Missing Brownie',
        'type' => 'missing',
        'status' => 'pending',
        'location' => 'Tibanga, Iligan City',
    ]);

    PetReport::factory()->create([
        'name' => 'Reunited Dog',
        'type' => 'missing',
        'status' => 'reunited',
    ]);

    BlogPost::factory()->create([
        'author_id' => $user->id,
        'status' => 'published',
    ]);

    $this->actingAs($user)
        ->get(route('account.user.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/dashboard')
            ->where('communityPulse.petsAdoptedCount', 1)
            ->where('communityPulse.petsAvailableCount', 1)
            ->where('communityPulse.activeRescuesCount', 1)
            ->has('missingAlerts', 1)
            ->where('missingAlerts.0.id', $activeMissing->id)
            ->where('missingAlerts.0.name', 'Missing Brownie')
            ->where('gettingStarted.hasSharedStory', true)
            ->where('volunteerInvite.isVolunteer', false)
        );
});

test('user dashboard stats and recent activities are scoped to the authenticated user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $pet = ShelterAnimal::factory()->create();
    $event = Event::factory()->create([
        'approval_status' => 'approved',
        'status' => 'open',
        'date' => now()->addDays(3)->toDateString(),
    ]);

    AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'shelter_animal_id' => $pet->id,
    ]);
    AdoptionApplication::factory()->create([
        'user_id' => $otherUser->id,
        'shelter_animal_id' => $pet->id,
    ]);

    PetReport::factory()->create(['user_id' => $user->id, 'type' => 'rescue']);
    PetReport::factory()->create(['user_id' => $user->id, 'type' => 'missing']);
    PetReport::factory()->create(['user_id' => $otherUser->id, 'type' => 'rescue']);

    Donation::factory()->create(['user_id' => $user->id]);
    ShelterVisit::factory()->create(['user_id' => $user->id]);
    AssignedTask::factory()->create(['user_id' => $user->id, 'event_id' => $event->id]);

    $this->actingAs($user)
        ->get(route('account.user.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/dashboard')
            ->where('stats.adoptionApplicationsCount', 1)
            ->where('stats.rescueReportsCount', 1)
            ->where('stats.missingReportsCount', 1)
            ->where('stats.donationsCount', 1)
            ->where('stats.shelterVisitsCount', 1)
            ->where('stats.joinedEventsCount', 1)
            ->has('recentActivities', 3)
        );
});

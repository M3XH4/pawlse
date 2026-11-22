<?php

use App\Enums\DonationStatus;
use App\Models\AssignedTask;
use App\Models\Badge;
use App\Models\Certificate;
use App\Models\Donation;
use App\Models\PetReport;
use App\Models\User;
use App\Notifications\BadgeUnlockedNotification;
use Database\Seeders\BadgeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('users can view their badges and achievements page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('account.user.achievements'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/achievements')
            ->has('badges', 24)
            ->where('summary.total_count', 24)
            ->where('summary.unlocked_count', 0)
            ->where('summary.rank_title', 'Paw Newcomer')
        );
});

test('volunteers can view their badges and achievements page', function () {
    $volunteer = User::factory()->volunteer()->create();

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.achievements'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/achievements')
            ->has('badges', 25)
            ->where('summary.total_count', 25)
            ->where('summary.unlocked_count', 0)
            ->where('summary.rank_title', 'Field Recruit')
        );
});

test('standard users cannot access volunteer achievements page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('account.volunteer.achievements'))
        ->assertForbidden();
});

test('user activity automatically unlocks progressive badges, awards xp, and sends notifications', function () {
    $user = User::factory()->create();

    PetReport::factory()->create([
        'user_id' => $user->id,
        'type' => 'rescue',
        'is_duplicate' => false,
        'status' => 'pending',
    ]);

    Donation::factory()->count(3)->create([
        'user_id' => $user->id,
        'status' => DonationStatus::Verified->value,
    ]);

    // Unlocks: user-first-rescue (50) + user-kindness-giver (75) + user-heartfelt-supporter (150) = 275 XP
    $this->actingAs($user)
        ->get(route('account.user.achievements'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/achievements')
            ->where('summary.unlocked_count', 3)
            ->where('summary.total_xp', 275)
            ->where('summary.rank_title', 'Compassionate Ally')
            ->where('summary.newly_unlocked_count', 3)
        );

    expect($user->notifications()->where('type', BadgeUnlockedNotification::class)->count())->toBe(3);
});

test('volunteer activity unlocks progressive task, hour, and certificate badges', function () {
    $volunteer = User::factory()->volunteer()->create();

    AssignedTask::factory()->create([
        'user_id' => $volunteer->id,
        'event_id' => null,
        'feeding_schedule_id' => null,
        'status' => 'completed',
        'hours_logged' => 20,
    ]);

    Certificate::factory()->create([
        'user_id' => $volunteer->id,
    ]);

    // Unlocks: field-recruit (50) + hours-5 (75) + hours-10 (150) + hours-20 (300) + first-recognition (75) = 650 XP
    $this->actingAs($volunteer)
        ->get(route('account.volunteer.achievements'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/achievements')
            ->where('summary.unlocked_count', 5)
            ->where('summary.total_xp', 650)
            ->where('summary.rank_title', 'Stray Helper')
        );
});

test('users can pin up to 3 unlocked badges and cannot pin locked badges', function () {
    (new BadgeSeeder)->run();
    $user = User::factory()->create();

    // Unlock 4+ user badges via activity
    PetReport::factory()->count(5)->create([
        'user_id' => $user->id,
        'is_duplicate' => false,
        'status' => 'pending',
    ]);
    Donation::factory()->count(5)->create([
        'user_id' => $user->id,
        'status' => DonationStatus::Verified->value,
    ]);

    // Sync via page visit
    $this->actingAs($user)->get(route('account.user.achievements'))->assertOk();

    $unlockedSlugs = [
        'user-first-rescue',
        'user-street-guardian',
        'user-kindness-giver',
        'user-sustaining-patron',
    ];
    $badges = Badge::whereIn('slug', $unlockedSlugs)->get()->keyBy('slug');
    $lockedBadge = Badge::where('slug', 'user-forever-home')->firstOrFail();

    // Cannot pin locked badge
    $this->actingAs($user)
        ->post(route('account.user.achievements.pin', $lockedBadge))
        ->assertRedirect();

    expect($user->userBadges()->where('badge_id', $lockedBadge->id)->value('is_pinned'))->toBeFalsy();

    // Pin 3 unlocked badges
    foreach (array_slice($unlockedSlugs, 0, 3) as $slug) {
        $this->actingAs($user)
            ->post(route('account.user.achievements.pin', $badges[$slug]))
            ->assertRedirect();
    }

    expect($user->userBadges()->where('is_pinned', true)->count())->toBe(3);

    // 4th pin is rejected
    $this->actingAs($user)
        ->post(route('account.user.achievements.pin', $badges['user-sustaining-patron']))
        ->assertRedirect();

    expect($user->userBadges()->where('is_pinned', true)->count())->toBe(3);

    // Unpin one
    $this->actingAs($user)
        ->post(route('account.user.achievements.pin', $badges['user-first-rescue']))
        ->assertRedirect();

    expect($user->userBadges()->where('is_pinned', true)->count())->toBe(2);
});

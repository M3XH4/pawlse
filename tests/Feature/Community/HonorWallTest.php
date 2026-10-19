<?php

use App\Models\CommunityHonor;
use App\Models\Partner;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('donation page returns honor wall props including community honors, partners, and metrics', function () {
    $this->seed(RoleSeeder::class);

    // Create a public honor
    $publicHonor = CommunityHonor::create([
        'name' => 'Miguel Burton',
        'category' => 'donor',
        'tier' => 'platinum',
        'role_title' => 'Feeding Supporter',
        'description' => 'Has supported ISF feeding activities for approximately one year.',
        'badges' => ['Feeding Supporter', 'Recurring Supporter'],
        'initials' => 'MB',
        'is_featured' => true,
        'is_public' => true,
        'display_order' => 1,
    ]);

    // Create a partner
    $partner = Partner::create([
        'name' => 'Dr. E Veterinary Clinic',
        'slug' => 'dr-e-vet-test',
        'category' => 'veterinary',
        'badge_title' => 'FREQUENTLY CONTACTED BY ISF',
        'badges' => ['Emergency Response'],
        'short_description' => 'Primary veterinary clinic in Iligan City.',
        'is_active' => true,
        'is_featured' => true,
        'display_order' => 1,
    ]);

    $response = $this->get(route('donate'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('donate')
        ->has('communityHonors')
        ->has('partners')
        ->has('recognitionMetrics')
        ->where('defaultTab', 'cash')
    );
});

test('honor wall only includes public and non-deleted community honors', function () {
    $this->seed(RoleSeeder::class);

    // 1. Public honor
    $public = CommunityHonor::create([
        'name' => 'Public Honoree',
        'category' => 'donor',
        'role_title' => 'Major Donor',
        'is_public' => true,
        'badges' => ['Recurring Supporter'],
        'display_order' => 1,
    ]);

    // 2. Private honor (is_public = false)
    $private = CommunityHonor::create([
        'name' => 'Private Supporter',
        'category' => 'donor',
        'role_title' => 'Anonymous Patron',
        'is_public' => false,
        'badges' => ['Kind Heart'],
        'display_order' => 2,
    ]);

    // 3. Soft-deleted honor
    $deleted = CommunityHonor::create([
        'name' => 'Archived Supporter',
        'category' => 'volunteer',
        'role_title' => 'Former Volunteer',
        'is_public' => true,
        'badges' => ['Core Volunteer'],
        'display_order' => 3,
    ]);
    $deleted->delete();

    $response = $this->get(route('donate'));
    $response->assertOk();

    $response->assertInertia(function (Assert $page) {
        $honors = $page->toArray()['props']['communityHonors'];
        $names = collect($honors)->pluck('name')->all();

        expect($names)->toContain('Public Honoree');
        expect($names)->not->toContain('Private Supporter');
        expect($names)->not->toContain('Archived Supporter');
    });
});

test('visiting donate with tab query parameter selects honor wall tab', function () {
    $this->seed(RoleSeeder::class);

    $response = $this->get(route('donate', ['tab' => 'honor']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('donate')
        ->where('defaultTab', 'honor')
    );
});

test('honor wall recognizes donors, volunteers, and sponsors with appropriate badges and featured status', function () {
    $this->seed(RoleSeeder::class);

    // Featured Donor
    CommunityHonor::create([
        'name' => 'Councilor Derreck Siao',
        'category' => 'donor',
        'role_title' => 'Recurring Supporter',
        'description' => 'Thank you for your continued support for animals under ISF care.',
        'badges' => ['Recurring Supporter'],
        'is_featured' => true,
        'is_public' => true,
        'display_order' => 1,
    ]);

    // Volunteer
    CommunityHonor::create([
        'name' => 'Maria Santos',
        'category' => 'volunteer',
        'role_title' => 'Core Volunteer',
        'description' => 'Led over 30 street rescue operations in Iligan.',
        'badges' => ['Core Volunteer', 'Rescue Lead'],
        'is_featured' => false,
        'is_public' => true,
        'display_order' => 2,
    ]);

    $response = $this->get(route('donate'));
    $response->assertOk();

    $response->assertInertia(function (Assert $page) {
        $honors = collect($page->toArray()['props']['communityHonors']);

        $derreck = $honors->firstWhere('name', 'Councilor Derreck Siao');
        expect($derreck)->not->toBeNull();
        expect($derreck['is_featured'])->toBeTrue();
        expect($derreck['category'])->toBe('donor');
        expect($derreck['badges'])->toContain('Recurring Supporter');

        $maria = $honors->firstWhere('name', 'Maria Santos');
        expect($maria)->not->toBeNull();
        expect($maria['is_featured'])->toBeFalse();
        expect($maria['category'])->toBe('volunteer');
        expect($maria['badges'])->toContain('Core Volunteer');
    });
});

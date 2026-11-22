<?php

use App\Models\FeedingSchedule;
use App\Models\PetReport;
use App\Models\SystemSetting;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('super admin can toggle volunteer_map_enabled in system settings', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)
        ->post(route('account.super-admin.system-settings.update'), [
            'app_name' => 'PAWLSE',
            'contact_email' => 'support@pawlse.test',
            'contact_phone' => '09123456789',
            'registration_enabled' => true,
            'maintenance_mode' => false,
            'volunteer_map_enabled' => false,
        ])
        ->assertRedirect();

    $settings = SystemSetting::getValue('system_settings', []);
    expect($settings['volunteer_map_enabled'])->toBeFalse();

    $this->actingAs($superAdmin)
        ->post(route('account.super-admin.system-settings.update'), [
            'app_name' => 'PAWLSE',
            'contact_email' => 'support@pawlse.test',
            'contact_phone' => '09123456789',
            'registration_enabled' => true,
            'maintenance_mode' => false,
            'volunteer_map_enabled' => true,
        ])
        ->assertRedirect();

    $settings = SystemSetting::getValue('system_settings', []);
    expect($settings['volunteer_map_enabled'])->toBeTrue();
});

test('volunteer dashboard pages reflect volunteerMapEnabled system setting', function () {
    $volunteer = User::factory()->volunteer()->create();

    SystemSetting::setValue('system_settings', ['volunteer_map_enabled' => false]);

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.assigned-tasks'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/assigned-tasks')
            ->where('volunteerMapEnabled', false)
        );

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.rescue-reports'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/rescue-reports')
            ->where('volunteerMapEnabled', false)
        );

    SystemSetting::setValue('system_settings', ['volunteer_map_enabled' => true]);

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.assigned-tasks'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('volunteer/assigned-tasks')
            ->where('volunteerMapEnabled', true)
        );
});

test('volunteer can fetch active feeding routes and rescue or sos pins when map is enabled', function () {
    $volunteer = User::factory()->volunteer()->create();

    FeedingSchedule::factory()->create([
        'zone' => 'Zone A: Public Market',
        'latitude' => 8.22865,
        'longitude' => 124.2412,
        'status' => 'active',
    ]);

    FeedingSchedule::factory()->create([
        'zone' => 'Zone Z: Closed Route',
        'latitude' => 8.23,
        'longitude' => 124.24,
        'status' => 'closed',
    ]);

    PetReport::factory()->create([
        'type' => 'sos',
        'status' => 'pending',
        'urgency' => 'high',
        'animal_type' => 'Dog',
        'location' => '8.231000, 124.242000 (Near Plaza)',
        'is_duplicate' => false,
    ]);

    PetReport::factory()->create([
        'type' => 'rescue',
        'status' => 'assigned',
        'animal_type' => 'Cat',
        'location' => 'Barangay Tibanga',
        'latitude' => 8.2415,
        'longitude' => 124.2448,
        'assigned_volunteer_id' => $volunteer->id,
        'is_duplicate' => false,
    ]);

    PetReport::factory()->create([
        'type' => 'sos',
        'status' => 'resolved',
        'animal_type' => 'Dog',
        'location' => '8.235, 124.245',
        'is_duplicate' => false,
    ]);

    $response = $this->actingAs($volunteer)
        ->getJson(route('account.volunteer.map-pins'))
        ->assertOk()
        ->assertJsonCount(1, 'feeding_routes')
        ->assertJsonCount(2, 'reports');

    expect($response->json('feeding_routes.0.title'))->toBe('Zone A: Public Market')
        ->and($response->json('reports.0.category'))->toBeIn(['sos', 'rescue']);
});

test('volunteer map pins endpoint returns 403 when disabled in system settings', function () {
    $volunteer = User::factory()->volunteer()->create();

    SystemSetting::setValue('system_settings', ['volunteer_map_enabled' => false]);

    $this->actingAs($volunteer)
        ->getJson(route('account.volunteer.map-pins'))
        ->assertForbidden();
});

test('non-volunteers cannot access volunteer map pins endpoint', function () {
    $user = User::factory()->create();

    $this->getJson(route('account.volunteer.map-pins'))
        ->assertUnauthorized();

    $this->actingAs($user)
        ->getJson(route('account.volunteer.map-pins'))
        ->assertForbidden();
});

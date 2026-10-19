<?php

use App\Models\AdoptionApplication;
use App\Models\Donation;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('admin dashboard overview page works and returns correct statistics and activities', function () {
    // 1. Create an admin user
    $admin = User::factory()->admin()->create();

    // 2. Seed some data
    PetReport::factory()->count(3)->create(['status' => 'pending']);
    PetReport::factory()->count(2)->create(['status' => 'resolved']);

    $animal = ShelterAnimal::create([
        'name' => 'Fluffy',
        'type' => 'cat',
        'age' => '1 Year',
    ]);

    AdoptionApplication::create([
        'user_id' => User::factory()->user()->create()->id,
        'shelter_animal_id' => $animal->id,
        'status' => 'pending',
        'full_name' => 'John Doe',
        'address' => '123 Main St',
        'phone' => '1234567890',
        'email' => 'john@example.com',
        'birth_date' => '1995-01-01',
        'company' => 'Google',
        'status_marital' => 'Single',
        'pronouns' => 'He/Him',
        'adoption_source' => ['Social Media'],
        'adopted_before' => false,
        'emergency_name' => 'Jane Doe',
        'emergency_relationship' => 'Sister',
        'emergency_phone' => '0987654321',
        'emergency_email' => 'jane@example.com',
        'adoption_preference' => 'Cat',
        'residence_type' => 'House',
        'is_renting' => false,
        'moving_plan' => 'None',
        'lives_with' => ['Family'],
        'has_allergies' => false,
        'daily_care_handler' => 'Me',
        'expenses_handler' => 'Me',
        'emergency_handler' => 'Me',
        'hours_alone' => '2',
        'introduction_plan' => 'Slowly',
        'family_support' => true,
        'current_pets' => false,
        'past_pets' => false,
        'preferred_date' => '2026-09-01',
        'preferred_time' => '10:00:00',
        'can_visit_shelter' => true,
    ]);

    Donation::create([
        'public_reference' => 'REF123',
        'donor_name' => 'Alice',
        'donor_email' => 'alice@example.com',
        'type' => 'cash',
        'amount' => 500,
        'status' => 'verified',
    ]);

    // 3. Make request
    $response = $this->actingAs($admin)
        ->get(route('account.admin.dashboard'));

    // 4. Assert responses and page props
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->has('stats')
            ->has('recentActivities')
            ->where('stats.rescues.total', 5)
            ->where('stats.rescues.pending', 3)
            ->where('stats.adoptions.total', 1)
            ->where('stats.donations.total_amount', 500)
        );
});

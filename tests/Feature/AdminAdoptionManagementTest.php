<?php

use App\Enums\AdoptionApplicationStatus;
use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\AnimalDonationNeed;
use App\Models\ShelterAnimal;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('admins can view adoption management page', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('account.admin.adoption-management'));

    $response->assertOk();
});

test('non-admins cannot view adoption management page', function () {
    $user = User::factory()->user()->create();

    $response = $this->actingAs($user)->get(route('account.admin.adoption-management'));

    $response->assertStatus(403);
});

test('admin can schedule an interview for application', function () {
    $admin = User::factory()->admin()->create();
    $application = AdoptionApplication::factory()->create(['status' => AdoptionApplicationStatus::Pending]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.update-status', $application), [
            'status' => 'scheduled',
            'notes' => 'Scheduling interview next week.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('account.admin.adoption-management'));

    $application->refresh();
    expect($application->status)->toBe(AdoptionApplicationStatus::Scheduled);
    expect($application->notes)->toBe('Scheduling interview next week.');
    expect($application->shelterAnimal->status)->toBe(ShelterAnimalStatus::Pending);
});

test('admin can approve an application', function () {
    $admin = User::factory()->admin()->create();
    $application = AdoptionApplication::factory()->create(['status' => AdoptionApplicationStatus::Scheduled]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.update-status', $application), [
            'status' => 'approved',
            'notes' => 'Approved after interview.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('account.admin.adoption-management'));

    $application->refresh();
    expect($application->status)->toBe(AdoptionApplicationStatus::Approved);
    expect($application->shelterAnimal->status)->toBe(ShelterAnimalStatus::Adopted);
});

test('admin can reject an application with reason', function () {
    $admin = User::factory()->admin()->create();
    $application = AdoptionApplication::factory()->create(['status' => AdoptionApplicationStatus::Pending]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.update-status', $application), [
            'status' => 'rejected',
            'rejection_reason' => 'Yard is not secured.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('account.admin.adoption-management'));

    $application->refresh();
    expect($application->status)->toBe(AdoptionApplicationStatus::Rejected);
    expect($application->rejection_reason)->toBe('Yard is not secured.');
});

test('admin can add a new shelter pet', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.pets.store'), [
            'name' => 'Rocky',
            'type' => 'dog',
            'breed' => 'German Shepherd',
            'age' => '3 yrs',
            'ageCategory' => 'adult',
            'gender' => 'male',
            'color' => 'Black & Tan',
            'behavior' => 'Friendly and high energy',
            'story' => 'Rescued from stray state.',
            'vaccinated' => 1,
            'admittedAt' => '2026-08-01',
            'photo' => UploadedFile::fake()->image('rocky.jpg'),
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('account.admin.adoption-management'));

    $this->assertDatabaseHas('shelter_animals', [
        'name' => 'Rocky',
        'type' => 'dog',
        'breed' => 'German Shepherd',
        'status' => ShelterAnimalStatus::Available->value,
    ]);

    $pet = ShelterAnimal::where('name', 'Rocky')->first();
    expect($pet->photo_url)->not->toBeNull();
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $pet->photo_url));
});

test('admin can add a new shelter pet with initial wishlist needs', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.pets.store'), [
            'name' => 'Max',
            'type' => 'dog',
            'breed' => 'Golden Retriever',
            'age' => '1 yr',
            'ageCategory' => 'young',
            'gender' => 'male',
            'color' => 'Golden',
            'behavior' => 'Playful and gentle',
            'story' => 'Found wandering in the neighborhood.',
            'vaccinated' => 1,
            'admittedAt' => '2026-08-10',
            'initial_needs' => [
                ['item' => 'Puppy Kibble', 'quantity' => '2 bags', 'priority' => 'High'],
                ['item' => 'Anti-Rabies Vaccine', 'quantity' => '1 vial', 'priority' => 'Urgent'],
            ],
        ]);

    $response->assertSessionHasNoErrors();
    $pet = ShelterAnimal::where('name', 'Max')->first();
    expect($pet)->not->toBeNull();
    expect($pet->needs)->toHaveCount(2);

    $this->assertDatabaseHas('animal_donation_needs', [
        'shelter_animal_id' => $pet->id,
        'item' => 'Puppy Kibble',
        'quantity' => '2 bags',
        'priority' => 'High',
        'status' => 'open',
    ]);
});

test('admin can add, update and delete a wishlist need for an existing shelter pet', function () {
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create(['name' => 'Bella']);

    // 1. Add need
    $addResponse = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.pets.needs.store', $pet), [
            'item' => 'Cat Carrier',
            'quantity' => '1 unit',
            'priority' => 'High',
            'status' => 'open',
        ]);

    $addResponse->assertSessionHasNoErrors();
    $this->assertDatabaseHas('animal_donation_needs', [
        'shelter_animal_id' => $pet->id,
        'item' => 'Cat Carrier',
        'quantity' => '1 unit',
        'priority' => 'High',
        'status' => 'open',
    ]);

    $need = AnimalDonationNeed::where('item', 'Cat Carrier')->first();

    // 2. Update need
    $updateResponse = $this->actingAs($admin)
        ->put(route('account.admin.adoption-management.needs.update', $need), [
            'item' => 'Heavy Duty Cat Carrier',
            'quantity' => '2 units',
            'priority' => 'Urgent',
            'status' => 'fulfilled',
        ]);

    $updateResponse->assertSessionHasNoErrors();
    $need->refresh();
    expect($need->item)->toBe('Heavy Duty Cat Carrier');
    expect($need->quantity)->toBe('2 units');
    expect($need->priority)->toBe('Urgent');
    expect($need->status)->toBe('fulfilled');

    // 3. Delete need
    $deleteResponse = $this->actingAs($admin)
        ->delete(route('account.admin.adoption-management.needs.destroy', $need));

    $deleteResponse->assertSessionHasNoErrors();
    $this->assertDatabaseMissing('animal_donation_needs', [
        'id' => $need->id,
    ]);
});

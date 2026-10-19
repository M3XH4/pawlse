<?php

use App\Enums\AnimalType;
use App\Enums\ShelterAnimalStatus;
use App\Models\AnimalMedicalRecord;
use App\Models\FosterParent;
use App\Models\FosterPlacement;
use App\Models\ShelterAnimal;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admins can view animal master records page with pagination and status bar', function () {
    $admin = User::factory()->admin()->create();

    ShelterAnimal::factory()->count(15)->create([
        'status' => ShelterAnimalStatus::Available,
    ]);

    $response = $this->actingAs($admin)->get(route('account.admin.animal-records'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/animal-records')
        ->has('animals.data', 12)
        ->where('animals.total', 15)
        ->where('animals.current_page', 1)
        ->has('statusBar', fn (Assert $bar) => $bar
            ->where('total', 15)
            ->where('available', 15)
            ->etc()
        )
        ->has('filters')
        ->has('locationsList')
    );
});

test('non-admins cannot view animal master records page', function () {
    $user = User::factory()->user()->create();

    $response = $this->actingAs($user)->get(route('account.admin.animal-records'));

    $response->assertForbidden();
});

test('admin can search animal records by name, breed, microchip, or id', function () {
    $admin = User::factory()->admin()->create();

    $targetAnimal = ShelterAnimal::factory()->create([
        'name' => 'Zeus Unique Hound',
        'breed' => 'Doberman Pinscher',
        'microchip_id' => '985123456789012',
    ]);

    ShelterAnimal::factory()->count(5)->create(['name' => 'Normal Pet']);

    // Search by name
    $response = $this->actingAs($admin)->get(route('account.admin.animal-records', ['search' => 'Zeus']));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/animal-records')
        ->where('animals.total', 1)
        ->where('animals.data.0.name', 'Zeus Unique Hound')
    );

    // Search by microchip
    $response = $this->actingAs($admin)->get(route('account.admin.animal-records', ['search' => '985123456789012']));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('animals.total', 1)
        ->where('animals.data.0.id', $targetAnimal->id)
    );

    // Search by formatted code #ANM-XXXX
    $code = '#ANM-'.str_pad((string) $targetAnimal->id, 4, '0', STR_PAD_LEFT);
    $response = $this->actingAs($admin)->get(route('account.admin.animal-records', ['search' => $code]));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('animals.total', 1)
        ->where('animals.data.0.id', $targetAnimal->id)
    );
});

test('admin can filter animal records by species and status', function () {
    $admin = User::factory()->admin()->create();

    ShelterAnimal::factory()->count(3)->create([
        'type' => AnimalType::Dog,
        'status' => ShelterAnimalStatus::Available,
    ]);

    ShelterAnimal::factory()->count(2)->create([
        'type' => AnimalType::Cat,
        'status' => ShelterAnimalStatus::Adopted,
    ]);

    $response = $this->actingAs($admin)->get(route('account.admin.animal-records', [
        'species' => 'cat',
        'status' => 'adopted',
    ]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('animals.total', 2)
        ->where('animals.data.0.type', 'cat')
        ->where('animals.data.0.status', 'adopted')
    );
});

test('admin can register a new animal master record', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('account.admin.animal-records.store'), [
        'name' => 'Barnaby',
        'type' => 'dog',
        'breed' => 'Golden Retriever Mix',
        'age' => '2 years',
        'ageCategory' => 'young',
        'gender' => 'male',
        'color' => 'Golden Cream',
        'weight' => '22 kg',
        'microchip_id' => '985000111222333',
        'current_location' => 'Main Shelter - Ward 3',
        'status' => 'available',
        'behavior' => 'Gentle with other pets and children',
        'special_needs' => 'Hypoallergenic diet',
        'story' => 'Found wandering near the central park, rescued by volunteer.',
        'vaccinated' => true,
        'admittedAt' => '2026-05-10',
        'intake_type' => 'rescue',
        'rescue_date' => '2026-05-09',
        'rescue_location' => 'Central City Park',
        'rescue_story' => 'Rescued during rain storm near park fountain.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('shelter_animals', [
        'name' => 'Barnaby',
        'breed' => 'Golden Retriever Mix',
        'microchip_id' => '985000111222333',
        'current_location' => 'Main Shelter - Ward 3',
        'status' => ShelterAnimalStatus::Available,
        'vaccinated' => true,
        'rescue_location' => 'Central City Park',
    ]);
});

test('admin can update an animal master record including status, location, adoption, and deceased notes', function () {
    $admin = User::factory()->admin()->create();
    $animal = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Available,
        'current_location' => 'Kennel 1',
    ]);

    // Update to Adopted
    $response = $this->actingAs($admin)->put(route('account.admin.animal-records.update', $animal), [
        'name' => $animal->name,
        'type' => $animal->type->value,
        'breed' => $animal->breed,
        'age' => $animal->age,
        'ageCategory' => $animal->age_category->value,
        'gender' => $animal->gender->value,
        'status' => 'adopted',
        'current_location' => 'Adopted Family Home in Quezon City',
        'admittedAt' => $animal->admitted_at->format('Y-m-d'),
        'adoption_date' => '2026-06-15',
        'adopter_name' => 'Sarah Connor',
        'adopter_phone' => '09171234567',
        'adopter_email' => 'sarah@example.com',
        'adoption_notes' => 'Passed home inspection with flying colors.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $animal->refresh();
    expect($animal->status)->toBe(ShelterAnimalStatus::Adopted);
    expect($animal->adopter_name)->toBe('Sarah Connor');
    expect($animal->adoption_date->format('Y-m-d'))->toBe('2026-06-15');

    // Update to Deceased with memorial notes
    $deceasedResponse = $this->actingAs($admin)->put(route('account.admin.animal-records.update', $animal), [
        'name' => $animal->name,
        'type' => $animal->type->value,
        'breed' => $animal->breed,
        'age' => $animal->age,
        'ageCategory' => $animal->age_category->value,
        'gender' => $animal->gender->value,
        'status' => 'deceased',
        'current_location' => 'Sanctuary Memorial Garden',
        'admittedAt' => $animal->admitted_at->format('Y-m-d'),
        'deceased_at' => '2026-07-20',
        'deceased_notes' => 'Passed peacefully of old age surrounded by staff.',
    ]);

    $deceasedResponse->assertSessionHasNoErrors();
    $animal->refresh();
    expect($animal->status)->toBe(ShelterAnimalStatus::Deceased);
    expect($animal->deceased_at->format('Y-m-d'))->toBe('2026-07-20');
    expect($animal->deceased_notes)->toContain('Passed peacefully');
});

test('admin can log a vaccination record for an animal and updates animal vaccinated flag', function () {
    $admin = User::factory()->admin()->create();
    $animal = ShelterAnimal::factory()->create(['vaccinated' => false]);

    $response = $this->actingAs($admin)->post(route('account.admin.animal-records.medical.store', $animal), [
        'record_type' => 'vaccination',
        'title' => 'Rabies Vaccine 3-Year Booster',
        'performed_date' => '2026-05-01',
        'next_due_date' => '2027-05-01',
        'veterinarian' => 'Dr. Maria Santos, DVM',
        'batch_number' => 'RAB-2026-99',
        'dosage' => '1.0 ml SQ',
        'status' => 'completed',
        'notes' => 'Tolerated well, no adverse reactions.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('animal_medical_records', [
        'shelter_animal_id' => $animal->id,
        'record_type' => 'vaccination',
        'title' => 'Rabies Vaccine 3-Year Booster',
        'batch_number' => 'RAB-2026-99',
        'status' => 'completed',
    ]);

    $animal->refresh();
    expect($animal->vaccinated)->toBeTrue();
});

test('admin can delete a medical record', function () {
    $admin = User::factory()->admin()->create();
    $animal = ShelterAnimal::factory()->create();
    $record = AnimalMedicalRecord::factory()->create([
        'shelter_animal_id' => $animal->id,
        'title' => 'Temporary Checkup',
    ]);

    $response = $this->actingAs($admin)->delete(route('account.admin.animal-records.medical.destroy', $record));

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertSoftDeleted('animal_medical_records', [
        'id' => $record->id,
    ]);
});

test('admin can archive/delete an animal record', function () {
    $admin = User::factory()->admin()->create();
    $animal = ShelterAnimal::factory()->create(['name' => 'To Be Archived']);

    $response = $this->actingAs($admin)->delete(route('account.admin.animal-records.destroy', $animal));

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertSoftDeleted('shelter_animals', [
        'id' => $animal->id,
    ]);
});

test('computed location resolves foster parent location when animal is fostered', function () {
    $admin = User::factory()->admin()->create();

    $fosterUser = User::factory()->volunteer()->create(['name' => 'Jane Foster']);
    $fosterParent = FosterParent::create([
        'user_id' => $fosterUser->id,
        'status' => 'approved',
        'capacity' => 2,
        'location' => 'Makati City Center',
    ]);

    $animal = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Foster,
        'current_location' => null,
    ]);

    FosterPlacement::create([
        'shelter_animal_id' => $animal->id,
        'foster_parent_id' => $fosterParent->id,
        'foster_parent_user_id' => $fosterUser->id,
        'status' => 'active',
        'start_date' => now()->toDateString(),
    ]);

    $response = $this->actingAs($admin)->get(route('account.admin.animal-records'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('animals.data.0.current_location', 'Foster Home (Makati City Center)')
        ->where('animals.data.0.foster.is_active', true)
        ->where('animals.data.0.foster.parent_name', 'Jane Foster')
    );
});

<?php

use App\Enums\ShelterAnimalStatus;
use App\Models\AnimalMedicalRecord;
use App\Models\ShelterAnimal;
use Inertia\Testing\AssertableInertia as Assert;

test('adopt index page renders with available pets and master records', function () {
    $pet = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Available,
        'weight' => '14 kg',
        'microchip_id' => 'MC-987654321',
    ]);

    AnimalMedicalRecord::create([
        'shelter_animal_id' => $pet->id,
        'record_type' => 'vaccination',
        'title' => 'Rabies Vaccine',
        'performed_date' => now()->subMonth(),
        'status' => 'completed',
    ]);

    $response = $this->get(route('adopt'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('adopt')
        ->has('pets')
        ->where('pets.0.id', $pet->id)
        ->where('pets.0.weight', '14 kg')
        ->where('pets.0.microchip_id', 'MC-987654321')
        ->has('pets.0.medical_records', 1)
    );
});

test('adopt show page renders specific pet profile with full medical records', function () {
    $pet = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Available,
        'name' => 'Barnaby',
        'breed' => 'Golden Retriever Mix',
    ]);

    $response = $this->get(route('adopt.show', $pet));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('adopt/show')
        ->has('pet')
        ->where('pet.name', 'Barnaby')
        ->where('pet.breed', 'Golden Retriever Mix')
        ->where('pet.status', 'available')
    );
});

test('animals overview page renders all animals including treatment and foster care', function () {
    $availablePet = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Available,
        'name' => 'Kookie',
    ]);

    $treatmentPet = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Treatment,
        'name' => 'Max',
    ]);

    $response = $this->get(route('animals.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('animals/index')
        ->has('animals')
        ->has('counts')
        ->where('counts.treatment', 1)
    );
});

test('profile page renders unavailable pets with their proper master record status', function () {
    $treatmentPet = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Treatment,
        'name' => 'Rusty',
    ]);

    $response = $this->get(route('animals.show', $treatmentPet));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('adopt/show')
        ->has('pet')
        ->where('pet.name', 'Rusty')
        ->where('pet.status', 'treatment')
    );
});

test('full profile and adopt catalog include multiple gallery photos, before/after photos, and rescued tag', function () {
    $pet = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Available,
        'name' => 'Luna Gallery',
        'photo_url' => '/storage/pet_photos/luna-main.jpg',
        'gallery_photos' => [
            '/storage/pet_photos/luna-2.jpg',
            '/storage/pet_photos/luna-3.jpg',
        ],
        'before_photo_url' => '/storage/pet_photos/luna-before.jpg',
        'after_photo_url' => '/storage/pet_photos/luna-after.jpg',
        'intake_type' => 'rescue',
        'rescue_location' => 'Pala-o Market',
    ]);

    $response = $this->get(route('adopt.show', $pet));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('adopt/show')
        ->where('pet.id', $pet->id)
        ->where('pet.is_rescued', true)
        ->where('pet.rescued_tag', 'Rescued • In Shelter Care')
        ->where('pet.before_photo_url', '/storage/pet_photos/luna-before.jpg')
        ->where('pet.after_photo_url', '/storage/pet_photos/luna-after.jpg')
        ->has('pet.photos', 3)
        ->has('pet.gallery_photos', 2)
    );
});

test('homepage returns null for beforeImg and afterImg when animal has no transformation photos and includes multiple photos', function () {
    $petWithoutBeforeAfter = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Available,
        'name' => 'NoTransformPet',
        'photo_url' => '/storage/pet_photos/main.jpg',
        'gallery_photos' => ['/storage/pet_photos/extra1.jpg'],
        'before_photo_url' => null,
        'after_photo_url' => null,
        'intake_type' => 'rescue',
    ]);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->has('pets', 1)
        ->where('pets.0.id', $petWithoutBeforeAfter->id)
        ->where('pets.0.beforeImg', null)
        ->where('pets.0.afterImg', null)
        ->where('pets.0.is_rescued', true)
        ->where('pets.0.rescued_tag', 'Rescued • In Shelter Care')
        ->has('pets.0.photos', 2)
    );
});

test('animals overview supports rescued_shelter filter from homepage load more rescues link', function () {
    ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Available,
        'name' => 'RescuedAvailable',
        'intake_type' => 'rescue',
    ]);

    ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Treatment,
        'name' => 'RescuedTreatment',
        'intake_type' => 'rescue',
    ]);

    ShelterAnimal::factory()->adopted()->create([
        'name' => 'AlreadyAdopted',
        'intake_type' => 'rescue',
    ]);

    $response = $this->get(route('animals.index', ['status' => 'rescued_shelter']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('animals/index')
        ->where('filters.status', 'rescued_shelter')
        ->where('counts.rescued_shelter', 2)
        ->where('counts.all', 3)
    );
});

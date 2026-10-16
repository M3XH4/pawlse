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
    );
});

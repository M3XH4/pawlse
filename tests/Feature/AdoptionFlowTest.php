<?php

use App\Enums\AdoptionApplicationStatus;
use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\ShelterAnimal;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('authenticated user can submit adoption application with files', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    $response = $this->actingAs($user)->post(route('adopt.apply'), [
        'pet_id' => $pet->id,
        'fullName' => 'John Doe',
        'address' => '123 Main St, Iligan City',
        'phone' => '+639123456789',
        'email' => 'john@example.com',
        'birthDate' => '1995-05-15',
        'occupation' => 'Software Engineer',
        'company' => 'Google',
        'socialMedia' => 'facebook.com/johndoe',
        'status' => 'Single',
        'pronouns' => 'He/Him',
        'adoptionSource' => ['Social Media', 'Website'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'Jane Doe',
        'emergencyRelationship' => 'Sister',
        'emergencyPhone' => '+639987654321',
        'emergencyEmail' => 'jane@example.com',

        'adoptionPreference' => 'Dog',
        'residenceType' => 'House',
        'isRenting' => 'No',
        'movingPlan' => 'Bring the dog with me.',
        'livesWith' => ['Partner'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Myself',
        'expensesHandler' => 'Myself',
        'emergencyHandler' => 'Myself',
        'hoursAlone' => '2 hours',
        'introductionPlan' => 'Introduce slowly on leash.',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'Yes',

        'uploadedId' => UploadedFile::fake()->image('id.jpg'),
        'frontHouse' => UploadedFile::fake()->image('house.jpg'),

        'preferredDate' => now()->addDays(2)->format('Y-m-d'),
        'preferredTime' => '14:30',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('account.user.adoption-applications'));

    $this->assertDatabaseHas('adoption_applications', [
        'user_id' => $user->id,
        'shelter_animal_id' => $pet->id,
        'full_name' => 'John Doe',
        'status' => AdoptionApplicationStatus::Pending->value,
    ]);

    $app = AdoptionApplication::first();
    expect($app->files)->toHaveCount(2);

    foreach ($app->files as $file) {
        Storage::disk('public')->assertExists($file->path);
    }
});

test('user cannot submit adoption application for already adopted pet', function () {
    $user = User::factory()->create();
    $adoptedPet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Adopted]);

    $response = $this->actingAs($user)->post(route('adopt.apply'), [
        'pet_id' => $adoptedPet->id,
        'fullName' => 'Jane Smith',
        'address' => '456 Oak St',
        'phone' => '09123456789',
        'email' => 'jane@example.com',
        'birthDate' => '1996-01-01',
        'company' => 'Pawlse',
        'status' => 'Single',
        'pronouns' => 'She/Her',
        'adoptionSource' => ['Social Media'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'Alice Smith',
        'emergencyRelationship' => 'Mother',
        'emergencyPhone' => '09876543210',
        'emergencyEmail' => 'alice@example.com',
        'adoptionPreference' => 'Cat',
        'residenceType' => 'Apartment',
        'isRenting' => 'No',
        'movingPlan' => 'Keep pet',
        'livesWith' => ['Self'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Self',
        'expensesHandler' => 'Self',
        'emergencyHandler' => 'Self',
        'hoursAlone' => '4 hours',
        'introductionPlan' => 'Gradual',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'No',
        'preferredDate' => now()->addDays(2)->format('Y-m-d'),
        'preferredTime' => '10:00',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasErrors(['pet_id']);
});

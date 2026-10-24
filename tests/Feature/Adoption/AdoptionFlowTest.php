<?php

use App\Enums\AdoptionApplicationStatus;
use App\Enums\Role;
use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\ShelterAnimal;
use App\Models\User;
use App\Notifications\AdoptionApplicationStatusUpdatedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
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

test('user can submit adoption application with 12-hour formatted preferred time like 09:00 AM', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    $response = $this->actingAs($user)->post(route('adopt.apply'), [
        'pet_id' => $pet->id,
        'fullName' => 'Jane Morning',
        'address' => '789 Sunrise Blvd, Iligan City',
        'phone' => '+639123456788',
        'email' => 'jane.morning@example.com',
        'birthDate' => '1998-08-20',
        'occupation' => 'Teacher',
        'company' => 'STI',
        'socialMedia' => 'instagram.com/janemorning',
        'status' => 'Single',
        'pronouns' => 'She/Her',
        'adoptionSource' => ['Website'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'Sam Morning',
        'emergencyRelationship' => 'Brother',
        'emergencyPhone' => '+639987654320',
        'emergencyEmail' => 'sam@example.com',

        'adoptionPreference' => 'Dog',
        'residenceType' => 'House',
        'isRenting' => 'No',
        'movingPlan' => 'None',
        'livesWith' => ['Self'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Myself',
        'expensesHandler' => 'Myself',
        'emergencyHandler' => 'Myself',
        'hoursAlone' => '1 hour',
        'introductionPlan' => 'Gentle meeting.',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'No',

        'uploadedId' => UploadedFile::fake()->image('id.jpg'),

        'preferredDate' => now()->addDays(3)->format('Y-m-d'),
        'preferredTime' => '09:00 AM',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('account.user.adoption-applications'));

    $this->assertDatabaseHas('adoption_applications', [
        'user_id' => $user->id,
        'shelter_animal_id' => $pet->id,
        'full_name' => 'Jane Morning',
        'preferred_time' => '09:00:00',
    ]);
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

test('public guest user can submit adoption application and is redirected to track page', function () {
    Storage::fake('public');

    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    $response = $this->post(route('adopt.apply'), [
        'pet_id' => $pet->id,
        'fullName' => 'Guest Adopter',
        'address' => 'Palao, Iligan City',
        'phone' => '+639123456780',
        'email' => 'guest@example.com',
        'birthDate' => '1998-08-20',
        'occupation' => 'Freelancer',
        'company' => '',
        'socialMedia' => '',
        'status' => 'Single',
        'pronouns' => 'They/Them',
        'adoptionSource' => ['Website'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'Emergency Friend',
        'emergencyRelationship' => 'Friend',
        'emergencyPhone' => '+639987654320',
        'emergencyEmail' => 'friend@example.com',

        'adoptionPreference' => 'Cat',
        'residenceType' => 'Apartment',
        'isRenting' => 'No',
        'movingPlan' => 'Relocate with pet',
        'livesWith' => ['Alone'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Myself',
        'expensesHandler' => 'Myself',
        'emergencyHandler' => 'Myself',
        'hoursAlone' => '1 hour',
        'introductionPlan' => 'Slow introduction',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'No',

        'uploadedId' => UploadedFile::fake()->image('id.jpg'),

        'preferredDate' => now()->addDays(3)->format('Y-m-d'),
        'preferredTime' => '10:00',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasNoErrors();
    $app = AdoptionApplication::where('email', 'guest@example.com')->first();
    $ref = 'ADP-'.str_pad((string) $app->id, 5, '0', STR_PAD_LEFT);
    $response->assertRedirect(route('adopt.track', ['reference' => $ref, 'email' => 'guest@example.com']));

    $this->assertDatabaseHas('adoption_applications', [
        'user_id' => null,
        'email' => 'guest@example.com',
        'full_name' => 'Guest Adopter',
        'status' => AdoptionApplicationStatus::Pending->value,
    ]);
});

test('public user can track their specific application by reference number and email', function () {
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);
    $app = AdoptionApplication::factory()->create([
        'shelter_animal_id' => $pet->id,
        'user_id' => null,
        'email' => 'tracking@example.com',
        'status' => AdoptionApplicationStatus::Pending,
    ]);

    $ref = 'ADP-'.str_pad((string) $app->id, 5, '0', STR_PAD_LEFT);

    $response = $this->get(route('adopt.track', ['reference' => $ref, 'email' => 'tracking@example.com']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('adopt/track')
        ->where('searchedReference', $ref)
        ->where('searchedEmail', 'tracking@example.com')
        ->has('applications', 1)
        ->where('applications.0.id', $app->id)
    );
});

test('public user cannot track application with mismatched email or reference', function () {
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);
    $app = AdoptionApplication::factory()->create([
        'shelter_animal_id' => $pet->id,
        'user_id' => null,
        'email' => 'tracking@example.com',
        'status' => AdoptionApplicationStatus::Pending,
    ]);

    $ref = 'ADP-'.str_pad((string) $app->id, 5, '0', STR_PAD_LEFT);

    // Mismatched email
    $response = $this->get(route('adopt.track', ['reference' => $ref, 'email' => 'wrong@example.com']));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('adopt/track')
        ->has('applications', 0)
    );

    // Missing reference number (email only)
    $response2 = $this->get(route('adopt.track', ['email' => 'tracking@example.com']));
    $response2->assertOk();
    $response2->assertInertia(fn ($page) => $page
        ->component('adopt/track')
        ->has('applications', 0)
    );
});

test('authenticated user visiting track without query params is redirected to their dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('adopt.track'));

    $response->assertRedirect(route('account.user.adoption-applications'));
});

test('applicant can update and resubmit a rejected application', function () {
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);
    $app = AdoptionApplication::factory()->create([
        'shelter_animal_id' => $pet->id,
        'user_id' => null,
        'email' => 'resubmit@example.com',
        'status' => AdoptionApplicationStatus::Rejected,
        'rejection_reason' => 'Need more information regarding moving plan',
    ]);

    $response = $this->post(route('adopt.resubmit', $app), [
        'fullName' => 'Updated Name',
        'address' => 'Updated Address',
        'phone' => '+639123456788',
        'email' => 'resubmit@example.com',
        'birthDate' => '1995-01-01',
        'company' => 'New Company',
        'status' => 'Single',
        'pronouns' => 'He/Him',
        'adoptionSource' => ['Website'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'Updated Contact',
        'emergencyRelationship' => 'Sibling',
        'emergencyPhone' => '+639987654322',
        'emergencyEmail' => 'contact@example.com',
        'adoptionPreference' => 'Cat',
        'residenceType' => 'House',
        'isRenting' => 'No',
        'movingPlan' => 'Detailed moving plan included',
        'livesWith' => ['Alone'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Myself',
        'expensesHandler' => 'Myself',
        'emergencyHandler' => 'Myself',
        'hoursAlone' => '2 hours',
        'introductionPlan' => 'Detailed introduction',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'No',
        'preferredDate' => now()->addDays(2)->format('Y-m-d'),
        'preferredTime' => '11:00',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasNoErrors();
    $ref = 'ADP-'.str_pad((string) $app->id, 5, '0', STR_PAD_LEFT);
    $response->assertRedirect(route('adopt.track', ['reference' => $ref, 'email' => 'resubmit@example.com']));

    $app->refresh();
    expect($app->status)->toBe(AdoptionApplicationStatus::Pending);
    expect($app->rejection_reason)->toBeNull();
    expect($app->full_name)->toBe('Updated Name');
});

test('applicant can upload government ID as PDF document', function () {
    Storage::fake('public');

    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    $response = $this->post(route('adopt.apply'), [
        'pet_id' => $pet->id,
        'fullName' => 'PDF Uploader',
        'address' => 'Tubod, Iligan City',
        'phone' => '+639123456781',
        'email' => 'pdfuser@example.com',
        'birthDate' => '1992-04-10',
        'status' => 'Single',
        'pronouns' => 'He/Him',
        'adoptionSource' => ['Website'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'Emergency Person',
        'emergencyRelationship' => 'Brother',
        'emergencyPhone' => '+639987654323',
        'emergencyEmail' => 'brother@example.com',
        'adoptionPreference' => 'Dog',
        'residenceType' => 'House',
        'isRenting' => 'No',
        'movingPlan' => 'Stay here',
        'livesWith' => ['Alone'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Myself',
        'expensesHandler' => 'Myself',
        'emergencyHandler' => 'Myself',
        'hoursAlone' => '3 hours',
        'introductionPlan' => 'Slow introduction',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'No',

        'uploadedId' => UploadedFile::fake()->create('national_id.pdf', 500, 'application/pdf'),

        'preferredDate' => now()->addDays(2)->format('Y-m-d'),
        'preferredTime' => '10:00',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasNoErrors();
    $app = AdoptionApplication::where('email', 'pdfuser@example.com')->first();
    expect($app)->not->toBeNull();
    expect($app->files)->toHaveCount(1);
    expect($app->files->first()->original_filename)->toBe('national_id.pdf');
    expect($app->files->first()->mime_type)->toBe('application/pdf');
});

test('application rejects future birth dates', function () {
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    $response = $this->post(route('adopt.apply'), [
        'pet_id' => $pet->id,
        'fullName' => 'Future Baby',
        'address' => 'Iligan City',
        'phone' => '+639123456782',
        'email' => 'future@example.com',
        'birthDate' => now()->addYear()->format('Y-m-d'),
        'status' => 'Single',
        'pronouns' => 'He/Him',
        'adoptionSource' => ['Website'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'Emergency Person',
        'emergencyRelationship' => 'Mother',
        'emergencyPhone' => '+639987654324',
        'emergencyEmail' => 'mother@example.com',
        'adoptionPreference' => 'Cat',
        'residenceType' => 'House',
        'isRenting' => 'No',
        'movingPlan' => 'Stay here',
        'livesWith' => ['Alone'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Myself',
        'expensesHandler' => 'Myself',
        'emergencyHandler' => 'Myself',
        'hoursAlone' => '1 hour',
        'introductionPlan' => 'Care',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'No',
        'uploadedId' => UploadedFile::fake()->image('id.jpg'),
        'preferredDate' => now()->addDays(2)->format('Y-m-d'),
        'preferredTime' => '10:00',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasErrors(['birthDate']);
});

test('cannot resubmit application if pet was already adopted by another applicant', function () {
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Adopted]);
    $app = AdoptionApplication::factory()->create([
        'shelter_animal_id' => $pet->id,
        'user_id' => null,
        'email' => 'blocked@example.com',
        'status' => AdoptionApplicationStatus::Rejected,
        'rejection_reason' => 'Another applicant was approved and matched for this pet.',
    ]);

    $response = $this->post(route('adopt.resubmit', $app), [
        'fullName' => 'Blocked Name',
        'address' => 'Updated Address',
        'phone' => '+639123456789',
        'email' => 'blocked@example.com',
        'birthDate' => '1995-01-01',
        'status' => 'Single',
        'pronouns' => 'He/Him',
        'adoptionSource' => ['Website'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'Contact',
        'emergencyRelationship' => 'Friend',
        'emergencyPhone' => '+639987654321',
        'emergencyEmail' => 'friend@example.com',
        'adoptionPreference' => 'Dog',
        'residenceType' => 'House',
        'isRenting' => 'No',
        'movingPlan' => 'Stay here',
        'livesWith' => ['Alone'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Myself',
        'expensesHandler' => 'Myself',
        'emergencyHandler' => 'Myself',
        'hoursAlone' => '2 hours',
        'introductionPlan' => 'Intro',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'No',
        'preferredDate' => now()->addDays(2)->format('Y-m-d'),
        'preferredTime' => '10:00',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasErrors(['error']);
    $app->refresh();
    expect($app->status)->toBe(AdoptionApplicationStatus::Rejected);
});

test('guest applicant receives notification and email with direct track link when status updated by admin', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin);
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);
    $app = AdoptionApplication::factory()->create([
        'shelter_animal_id' => $pet->id,
        'user_id' => null,
        'email' => 'guest_notify@example.com',
        'status' => AdoptionApplicationStatus::Pending,
    ]);

    $response = $this->actingAs($admin)->post(
        route('account.admin.adoption-management.update-status', $app),
        [
            'status' => 'scheduled',
            'notes' => 'Looking forward to meeting you!',
        ]
    );

    $response->assertRedirect(route('account.admin.adoption-management'));

    Notification::assertSentOnDemand(
        AdoptionApplicationStatusUpdatedNotification::class,
        function ($notification, $channels, $notifiable) use ($app) {
            $routes = $notifiable->routes['mail'] ?? null;
            $data = $notification->toArray($notifiable);
            $expectedTrackUrl = route('track', [
                'reference' => 'ADP-'.str_pad((string) $app->id, 5, '0', STR_PAD_LEFT),
                'email' => 'guest_notify@example.com',
            ]);

            return $routes === 'guest_notify@example.com' && $data['url'] === $expectedTrackUrl;
        }
    );
});

test('user cannot submit duplicate adoption application for the same pet', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'shelter_animal_id' => $pet->id,
        'email' => $user->email,
        'status' => AdoptionApplicationStatus::Pending,
    ]);

    $response = $this->actingAs($user)->post(route('adopt.apply'), [
        'pet_id' => $pet->id,
        'fullName' => $user->name,
        'address' => '123 Main St, Iligan City',
        'phone' => '+639123456789',
        'email' => $user->email,
        'birthDate' => '1995-05-15',
        'occupation' => 'Engineer',
        'company' => 'Pawlse',
        'socialMedia' => 'facebook.com/user',
        'status' => 'Single',
        'pronouns' => 'He/Him',
        'adoptionSource' => ['Website'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'Jane Doe',
        'emergencyRelationship' => 'Sister',
        'emergencyPhone' => '+639987654321',
        'emergencyEmail' => 'jane@example.com',
        'adoptionPreference' => 'Dog',
        'residenceType' => 'House',
        'isRenting' => 'No',
        'movingPlan' => 'None',
        'livesWith' => ['Self'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Myself',
        'expensesHandler' => 'Myself',
        'emergencyHandler' => 'Myself',
        'hoursAlone' => '2 hours',
        'introductionPlan' => 'Gentle intro.',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'No',
        'uploadedId' => UploadedFile::fake()->image('id.jpg'),
        'preferredDate' => now()->addDays(2)->format('Y-m-d'),
        'preferredTime' => '14:30',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasErrors(['pet_id']);
    expect(AdoptionApplication::where('shelter_animal_id', $pet->id)->count())->toBe(1);
});

test('guest cannot submit duplicate adoption application for the same pet with matching email', function () {
    Storage::fake('public');

    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    AdoptionApplication::factory()->create([
        'user_id' => null,
        'shelter_animal_id' => $pet->id,
        'email' => 'duplicate.guest@example.com',
        'status' => AdoptionApplicationStatus::Pending,
    ]);

    $response = $this->post(route('adopt.apply'), [
        'pet_id' => $pet->id,
        'fullName' => 'Guest Two',
        'address' => '456 Second St, Iligan City',
        'phone' => '+639123456781',
        'email' => 'duplicate.guest@example.com',
        'birthDate' => '1996-06-16',
        'occupation' => 'Designer',
        'company' => 'Pawlse',
        'socialMedia' => 'instagram.com/guest',
        'status' => 'Single',
        'pronouns' => 'They/Them',
        'adoptionSource' => ['Social Media'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'Friend',
        'emergencyRelationship' => 'Friend',
        'emergencyPhone' => '+639987654322',
        'emergencyEmail' => 'friend@example.com',
        'adoptionPreference' => 'Dog',
        'residenceType' => 'House',
        'isRenting' => 'No',
        'movingPlan' => 'None',
        'livesWith' => ['Self'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Myself',
        'expensesHandler' => 'Myself',
        'emergencyHandler' => 'Myself',
        'hoursAlone' => '1 hour',
        'introductionPlan' => 'Slow intro.',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'No',
        'uploadedId' => UploadedFile::fake()->image('id.jpg'),
        'preferredDate' => now()->addDays(3)->format('Y-m-d'),
        'preferredTime' => '10:00',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasErrors(['pet_id']);
    expect(AdoptionApplication::where('shelter_animal_id', $pet->id)->count())->toBe(1);
});

test('adopt index provides has_applied indicator for pets the user has already applied for', function () {
    $user = User::factory()->create();
    $appliedPet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);
    $otherPet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'shelter_animal_id' => $appliedPet->id,
        'status' => AdoptionApplicationStatus::Pending,
    ]);

    $response = $this->actingAs($user)->get(route('adopt'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('adopt')
        ->has('pets', 2)
        ->where('pets.0.has_applied', fn ($val) => true)
    );
});

test('user can submit an application for a different pet even if they have an existing pending application', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $petA = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);
    $petB = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'shelter_animal_id' => $petA->id,
        'status' => AdoptionApplicationStatus::Pending,
    ]);

    $response = $this->actingAs($user)->post(route('adopt.apply'), [
        'pet_id' => $petB->id,
        'fullName' => 'John Doe',
        'address' => '123 Main St, Iligan City',
        'phone' => '+639123456789',
        'email' => $user->email,
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
        'preferredDate' => now()->addDays(2)->format('Y-m-d'),
        'preferredTime' => '14:30',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasNoErrors();
    expect(AdoptionApplication::where('shelter_animal_id', $petB->id)->count())->toBe(1);
    expect(AdoptionApplication::where('user_id', $user->id)->count())->toBe(2);
});

test('duplicate check is case-insensitive for email address', function () {
    Storage::fake('public');

    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    AdoptionApplication::factory()->create([
        'user_id' => null,
        'shelter_animal_id' => $pet->id,
        'email' => 'adopter@example.com',
        'status' => AdoptionApplicationStatus::Pending,
    ]);

    $response = $this->post(route('adopt.apply'), [
        'pet_id' => $pet->id,
        'fullName' => 'Case Test User',
        'address' => '789 Elm St',
        'phone' => '+639123456789',
        'email' => 'ADOPTER@EXAMPLE.COM',
        'birthDate' => '1995-05-15',
        'company' => 'Pawlse',
        'status' => 'Single',
        'pronouns' => 'He/Him',
        'adoptionSource' => ['Website'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'Emergency Jane',
        'emergencyRelationship' => 'Sister',
        'emergencyPhone' => '+639987654321',
        'emergencyEmail' => 'jane@example.com',
        'adoptionPreference' => 'Dog',
        'residenceType' => 'House',
        'isRenting' => 'No',
        'movingPlan' => 'None',
        'livesWith' => ['Self'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Myself',
        'expensesHandler' => 'Myself',
        'emergencyHandler' => 'Myself',
        'hoursAlone' => '2 hours',
        'introductionPlan' => 'Intro',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'No',
        'uploadedId' => UploadedFile::fake()->image('id.jpg'),
        'preferredDate' => now()->addDays(2)->format('Y-m-d'),
        'preferredTime' => '14:30',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasErrors(['pet_id']);
    expect(AdoptionApplication::where('shelter_animal_id', $pet->id)->count())->toBe(1);
});

test('user cannot apply for a pet if their previous application for that pet was already approved', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'shelter_animal_id' => $pet->id,
        'status' => AdoptionApplicationStatus::Approved,
    ]);

    $response = $this->actingAs($user)->post(route('adopt.apply'), [
        'pet_id' => $pet->id,
        'fullName' => 'Approved User',
        'address' => '123 Main St',
        'phone' => '+639123456789',
        'email' => $user->email,
        'birthDate' => '1995-05-15',
        'company' => 'Pawlse',
        'status' => 'Single',
        'pronouns' => 'He/Him',
        'adoptionSource' => ['Website'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'Jane',
        'emergencyRelationship' => 'Sister',
        'emergencyPhone' => '+639987654321',
        'emergencyEmail' => 'jane@example.com',
        'adoptionPreference' => 'Dog',
        'residenceType' => 'House',
        'isRenting' => 'No',
        'movingPlan' => 'None',
        'livesWith' => ['Self'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Myself',
        'expensesHandler' => 'Myself',
        'emergencyHandler' => 'Myself',
        'hoursAlone' => '2 hours',
        'introductionPlan' => 'Intro',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'No',
        'uploadedId' => UploadedFile::fake()->image('id.jpg'),
        'preferredDate' => now()->addDays(2)->format('Y-m-d'),
        'preferredTime' => '14:30',
        'canVisitShelter' => 'Yes',
    ]);

    $response->assertSessionHasErrors(['pet_id' => 'You have already adopted or been approved to adopt this pet.']);
});

<?php

use App\Enums\AdoptionApplicationStatus;
use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\AnimalDonationNeed;
use App\Models\FosterParent;
use App\Models\FosterPlacement;
use App\Models\RehomingRequest;
use App\Models\ShelterAnimal;
use App\Models\ShelterVisit;
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

test('admin can add a new wishlist need for a pet (add changes)', function () {
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create(['name' => 'Bella']);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.pets.needs.store', $pet), [
            'item' => 'Kitten Milk Replacer',
            'quantity' => '3 cans',
            'priority' => 'High',
            'status' => 'open',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('animal_donation_needs', [
        'shelter_animal_id' => $pet->id,
        'item' => 'Kitten Milk Replacer',
        'quantity' => '3 cans',
        'priority' => 'High',
        'status' => 'open',
    ]);
});

test('admin can save changes to an existing wishlist need (save changes)', function () {
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create(['name' => 'Charlie']);
    $need = AnimalDonationNeed::factory()->create([
        'shelter_animal_id' => $pet->id,
        'item' => 'Kibble',
        'quantity' => '1 bag',
        'priority' => 'Medium',
        'status' => 'open',
    ]);

    $response = $this->actingAs($admin)
        ->put(route('account.admin.adoption-management.needs.update', $need), [
            'item' => 'Premium Kibble 10kg',
            'quantity' => '5 bags',
            'priority' => 'Urgent',
            'status' => 'open',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $need->refresh();
    expect($need->item)->toBe('Premium Kibble 10kg');
    expect($need->quantity)->toBe('5 bags');
    expect($need->priority)->toBe('Urgent');
    expect($need->status)->toBe('open');
});

test('admin can toggle a wishlist need status between open and fulfilled via checkmark', function () {
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create(['name' => 'Luna']);
    $need = AnimalDonationNeed::factory()->create([
        'shelter_animal_id' => $pet->id,
        'item' => 'Deworming Tablet',
        'quantity' => '2 doses',
        'priority' => 'Urgent',
        'status' => 'open',
    ]);

    // 1. Checkmark toggle: open -> fulfilled
    $response = $this->actingAs($admin)
        ->put(route('account.admin.adoption-management.needs.update', $need), [
            'item' => $need->item,
            'quantity' => $need->quantity,
            'priority' => $need->priority,
            'status' => 'fulfilled',
        ]);

    $response->assertSessionHasNoErrors();
    $need->refresh();
    expect($need->status)->toBe('fulfilled');

    // 2. Checkmark toggle: fulfilled -> open
    $response2 = $this->actingAs($admin)
        ->put(route('account.admin.adoption-management.needs.update', $need), [
            'item' => $need->item,
            'quantity' => $need->quantity,
            'priority' => $need->priority,
            'status' => 'open',
        ]);

    $response2->assertSessionHasNoErrors();
    $need->refresh();
    expect($need->status)->toBe('open');
});

test('admin can toggle checkmark and save changes on a need with lowercase priority such as urgent', function () {
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create(['name' => 'Coco']);
    // Seeded needs often have lowercase 'urgent' from NeedPriority::Urgent->value
    $need = AnimalDonationNeed::create([
        'shelter_animal_id' => $pet->id,
        'item' => 'Kitten Formula',
        'quantity' => '3 cans',
        'priority' => 'urgent',
        'status' => 'open',
    ]);

    // 1. Checkmark toggle should succeed even if priority is lowercase 'urgent'
    $toggleResponse = $this->actingAs($admin)
        ->put(route('account.admin.adoption-management.needs.update', $need), [
            'item' => $need->item,
            'quantity' => $need->quantity,
            'priority' => 'urgent',
            'status' => 'fulfilled',
        ]);

    $toggleResponse->assertSessionHasNoErrors();
    $need->refresh();
    expect($need->status)->toBe('fulfilled');
    expect($need->priority)->toBe('Urgent');

    // 2. Save changes should accept lowercase or uppercase and normalize to Urgent
    $saveResponse = $this->actingAs($admin)
        ->put(route('account.admin.adoption-management.needs.update', $need), [
            'item' => 'Premium Kitten Formula',
            'quantity' => '5 cans',
            'priority' => 'urgent',
            'status' => 'open',
        ]);

    $saveResponse->assertSessionHasNoErrors();
    $need->refresh();
    expect($need->item)->toBe('Premium Kitten Formula');
    expect($need->priority)->toBe('Urgent');
    expect($need->status)->toBe('open');
});

test('admin can delete a wishlist need', function () {
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create(['name' => 'Milo']);
    $need = AnimalDonationNeed::factory()->create([
        'shelter_animal_id' => $pet->id,
        'item' => 'Chew Toy',
        'quantity' => '1 pc',
    ]);

    $response = $this->actingAs($admin)
        ->delete(route('account.admin.adoption-management.needs.destroy', $need));

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseMissing('animal_donation_needs', [
        'id' => $need->id,
    ]);
});

test('wishlist need validation fails when required fields are missing or invalid', function () {
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create();

    // 1. Missing item and quantity
    $response = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.pets.needs.store', $pet), [
            'item' => '',
            'quantity' => '',
            'priority' => 'InvalidPriority',
            'status' => 'invalid_status',
        ]);

    $response->assertSessionHasErrors(['item', 'quantity', 'priority', 'status']);

    // 2. Update with invalid priority and status
    $need = AnimalDonationNeed::factory()->create(['shelter_animal_id' => $pet->id]);
    $updateResponse = $this->actingAs($admin)
        ->put(route('account.admin.adoption-management.needs.update', $need), [
            'item' => 'Valid Item',
            'quantity' => '1 unit',
            'priority' => 'NotAValidPriority',
            'status' => 'not_open_or_fulfilled',
        ]);

    $updateResponse->assertSessionHasErrors(['priority', 'status']);
});

test('non-admin cannot add, update or delete wishlist needs', function () {
    $user = User::factory()->user()->create();
    $pet = ShelterAnimal::factory()->create();
    $need = AnimalDonationNeed::factory()->create(['shelter_animal_id' => $pet->id]);

    $this->actingAs($user)
        ->post(route('account.admin.adoption-management.pets.needs.store', $pet), [
            'item' => 'Leash',
            'quantity' => '1 pc',
            'priority' => 'Low',
            'status' => 'open',
        ])
        ->assertStatus(403);

    $this->actingAs($user)
        ->put(route('account.admin.adoption-management.needs.update', $need), [
            'item' => 'Updated Leash',
            'quantity' => '2 pcs',
            'priority' => 'High',
            'status' => 'fulfilled',
        ])
        ->assertStatus(403);

    $this->actingAs($user)
        ->delete(route('account.admin.adoption-management.needs.destroy', $need))
        ->assertStatus(403);
});

test('approving an application automatically rejects competing applications for the same animal', function () {
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    $appApproved = AdoptionApplication::factory()->create([
        'shelter_animal_id' => $pet->id,
        'status' => AdoptionApplicationStatus::Scheduled,
        'full_name' => 'Alice Green',
    ]);

    $appCompeting1 = AdoptionApplication::factory()->create([
        'shelter_animal_id' => $pet->id,
        'status' => AdoptionApplicationStatus::Pending,
        'full_name' => 'Bob Brown',
    ]);

    $appCompeting2 = AdoptionApplication::factory()->create([
        'shelter_animal_id' => $pet->id,
        'status' => AdoptionApplicationStatus::Scheduled,
        'full_name' => 'Charlie White',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.update-status', $appApproved), [
            'status' => 'approved',
            'notes' => 'Alice was a perfect match.',
        ]);

    $response->assertSessionHasNoErrors();

    $pet->refresh();
    expect($pet->status)->toBe(ShelterAnimalStatus::Adopted);
    expect($pet->adopter_name)->toBe('Alice Green');

    $appApproved->refresh();
    expect($appApproved->status)->toBe(AdoptionApplicationStatus::Approved);

    $appCompeting1->refresh();
    expect($appCompeting1->status)->toBe(AdoptionApplicationStatus::Rejected);
    expect($appCompeting1->rejection_reason)->toContain('Another applicant was approved');

    $appCompeting2->refresh();
    expect($appCompeting2->status)->toBe(AdoptionApplicationStatus::Rejected);
    expect($appCompeting2->rejection_reason)->toContain('Another applicant was approved');
});

test('rejecting a previously approved application rolls back animal status to available and clears adopter details', function () {
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Adopted,
        'adopter_name' => 'Dave Miller',
        'adopter_email' => 'dave@example.com',
        'adopter_phone' => '1234567890',
        'adoption_date' => now()->toDateString(),
    ]);

    $application = AdoptionApplication::factory()->create([
        'shelter_animal_id' => $pet->id,
        'status' => AdoptionApplicationStatus::Approved,
        'full_name' => 'Dave Miller',
        'email' => 'dave@example.com',
        'phone' => '1234567890',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.update-status', $application), [
            'status' => 'rejected',
            'rejection_reason' => 'Adopter decided to relocate and cancelled adoption before pickup.',
        ]);

    $response->assertSessionHasNoErrors();

    $pet->refresh();
    expect($pet->status)->toBe(ShelterAnimalStatus::Available);
    expect($pet->adopter_name)->toBeNull();
    expect($pet->adopter_email)->toBeNull();
    expect($pet->adopter_phone)->toBeNull();
    expect($pet->adoption_date)->toBeNull();
});

test('admin can intake a rehoming request directly into shelter master records', function () {
    $admin = User::factory()->admin()->create();
    $rehoming = RehomingRequest::factory()->create([
        'animal_name' => 'Milo',
        'species' => 'Dog',
        'breed' => 'Golden Retriever',
        'gender' => 'Male',
        'age' => '2 years',
        'status' => 'reviewed',
        'reason' => 'Moving abroad',
        'description' => 'Friendly dog',
        'health_notes' => 'Up to date with rabies shots',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.rehoming-requests.intake', $rehoming), [
            'intake_notes' => 'Admitted to Kennel B4.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('account.admin.adoption-management'));

    $rehoming->refresh();
    expect($rehoming->status)->toBe('shelter_intake');
    expect($rehoming->admin_notes)->toContain('Pet successfully admitted to shelter');

    $this->assertDatabaseHas('shelter_animals', [
        'name' => 'Milo',
        'breed' => 'Golden Retriever',
        'status' => ShelterAnimalStatus::Available->value,
    ]);
});

test('post-adoption follow-up validates pet is adopted and auto-queues next follow-up date', function () {
    $admin = User::factory()->admin()->create();
    $petAdopted = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Adopted]);
    $petAvailable = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    // 1. Should fail on non-adopted pet
    $failResponse = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.post-adoption-follow-ups.store'), [
            'shelter_animal_id' => $petAvailable->id,
            'follow_up_date' => now()->toDateString(),
            'method' => 'call',
            'status' => 'completed',
            'pet_condition' => 'Good',
            'notes' => 'Tried to follow up.',
        ]);

    $failResponse->assertSessionHasErrors(['shelter_animal_id']);

    // 2. Succeed on adopted pet and auto-queue next follow-up
    $nextDate = now()->addMonths(3)->toDateString();
    $successResponse = $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.post-adoption-follow-ups.store'), [
            'shelter_animal_id' => $petAdopted->id,
            'follow_up_date' => now()->toDateString(),
            'method' => 'video',
            'status' => 'completed',
            'pet_condition' => 'Excellent',
            'notes' => 'Video call showed dog happy in backyard.',
            'next_follow_up_date' => $nextDate,
        ]);

    $successResponse->assertSessionHasNoErrors();

    // Verify original completed follow up
    $this->assertDatabaseHas('post_adoption_follow_ups', [
        'shelter_animal_id' => $petAdopted->id,
        'method' => 'video',
        'status' => 'completed',
        'pet_condition' => 'Excellent',
    ]);

    // Verify auto-scheduled subsequent follow up
    $this->assertDatabaseHas('post_adoption_follow_ups', [
        'shelter_animal_id' => $petAdopted->id,
        'status' => 'scheduled',
    ]);
});

test('ending a foster placement with adopted status automatically populates foster parent adopter details', function () {
    $admin = User::factory()->admin()->create();
    $fosterUser = User::factory()->create([
        'name' => 'Fiona Foster',
        'email' => 'fiona@example.com',
        'phone' => '09123456789',
    ]);
    $fosterParent = FosterParent::factory()->create([
        'user_id' => $fosterUser->id,
        'status' => 'approved',
    ]);
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Foster]);
    $placement = FosterPlacement::factory()->create([
        'shelter_animal_id' => $pet->id,
        'foster_parent_id' => $fosterParent->id,
        'foster_parent_user_id' => $fosterUser->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('account.admin.foster-management.end', $placement), [
            'end_reason' => 'Foster-to-adopt finalized with family.',
            'target_status' => 'adopted',
        ]);

    $response->assertSessionHasNoErrors();

    $pet->refresh();
    expect($pet->status)->toBe(ShelterAnimalStatus::Adopted);
    expect($pet->adopter_name)->toBe('Fiona Foster');
    expect($pet->adopter_email)->toBe('fiona@example.com');
    expect($pet->adopter_phone)->toBe('09123456789');
    expect($pet->adoption_date)->not->toBeNull();
});

test('shelter visits slot enforces capacity limit', function () {
    $date = now()->next('Wednesday')->toDateString();
    $slot = 'Morning (9:00 AM - 12:00 PM)';

    // Pre-book 8 visitors for this slot
    ShelterVisit::factory()->create([
        'preferred_date' => $date,
        'preferred_time_slot' => $slot,
        'number_of_visitors' => 8,
        'status' => 'confirmed',
    ]);

    // Try to book 5 more visitors (8 + 5 = 13 > 10) -> should fail with error
    $response = $this->post(route('shelter-visits.store'), [
        'full_name' => 'George Lucas',
        'contact_number' => '09887766554',
        'email' => 'george@example.com',
        'preferred_date' => $date,
        'preferred_time_slot' => $slot,
        'number_of_visitors' => 5,
        'purpose' => 'Shelter Tour',
    ]);

    $response->assertSessionHasErrors(['preferred_time_slot']);
});

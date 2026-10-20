<?php

use App\Enums\AnimalType;
use App\Enums\ShelterAnimalStatus;
use App\Models\AnimalMedicalRecord;
use App\Models\FosterParent;
use App\Models\FosterPlacement;
use App\Models\ShelterAnimal;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

test('admin can search animal records by name, breed, color, or id', function () {
    $admin = User::factory()->admin()->create();

    $targetAnimal = ShelterAnimal::factory()->create([
        'name' => 'Zeus Unique Hound',
        'breed' => 'Doberman Pinscher',
        'color' => 'Brindle Brown',
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

    // Search by color
    $response = $this->actingAs($admin)->get(route('account.admin.animal-records', ['search' => 'Brindle Brown']));
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

test('admin can log an injury record with severity and treatment plan, updating animal status to treatment', function () {
    $admin = User::factory()->admin()->create();
    $animal = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Available,
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.animal-records.medical.store', $animal), [
        'record_type' => 'injury',
        'title' => 'Fractured Right Forelimb',
        'performed_date' => '2026-06-10',
        'next_due_date' => '2026-07-10',
        'veterinarian' => 'Dr. Maria Santos, DVM',
        'dosage' => 'Meloxicam 0.1mg/kg PO SID',
        'severity' => 'severe',
        'treatment_plan' => 'Splint applied, restrict kennel activity 4 weeks, change bandage weekly.',
        'status' => 'under_treatment',
        'update_animal_status' => 'treatment',
        'notes' => 'Hit by vehicle before rescue. Animal is calm.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('animal_medical_records', [
        'shelter_animal_id' => $animal->id,
        'record_type' => 'injury',
        'title' => 'Fractured Right Forelimb',
        'severity' => 'severe',
        'treatment_plan' => 'Splint applied, restrict kennel activity 4 weeks, change bandage weekly.',
        'status' => 'under_treatment',
    ]);

    $animal->refresh();
    expect($animal->status)->toBe(ShelterAnimalStatus::Treatment);
});

test('admin can log a disease or illness record with quarantine status', function () {
    $admin = User::factory()->admin()->create();
    $animal = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Available,
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.animal-records.medical.store', $animal), [
        'record_type' => 'disease',
        'title' => 'Canine Parvovirus',
        'performed_date' => '2026-06-11',
        'veterinarian' => 'Dr. Cruz, DVM',
        'severity' => 'critical',
        'treatment_plan' => 'IV fluids, antiemetics, broad-spectrum antibiotics, strict isolation.',
        'status' => 'active',
        'update_animal_status' => 'quarantine',
        'notes' => 'Confirmed via antigen rapid test. Transferred to isolation ward immediately.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('animal_medical_records', [
        'shelter_animal_id' => $animal->id,
        'record_type' => 'disease',
        'title' => 'Canine Parvovirus',
        'severity' => 'critical',
        'status' => 'active',
    ]);

    $animal->refresh();
    expect($animal->status)->toBe(ShelterAnimalStatus::Quarantine);
});

test('admin can update a medical record and mark an injury or disease as resolved', function () {
    $admin = User::factory()->admin()->create();
    $animal = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Treatment,
    ]);

    $record = AnimalMedicalRecord::factory()->create([
        'shelter_animal_id' => $animal->id,
        'record_type' => 'injury',
        'title' => 'Deep Bite Wound on Left Shoulder',
        'performed_date' => '2026-06-01',
        'severity' => 'moderate',
        'status' => 'under_treatment',
    ]);

    $response = $this->actingAs($admin)->put(route('account.admin.animal-records.medical.update', $record), [
        'status' => 'resolved',
        'notes' => 'Wound completely epithelialized and healed. Stitches removed.',
        'update_animal_status' => 'available',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $record->refresh();
    expect($record->status)->toBe('resolved');
    expect($record->notes)->toContain('Wound completely epithelialized');

    $animal->refresh();
    expect($animal->status)->toBe(ShelterAnimalStatus::Available);
});

test('animal master record inertia response includes injuries and active conditions and excludes microchip', function () {
    $admin = User::factory()->admin()->create();
    $animal = ShelterAnimal::factory()->create([
        'name' => 'Rusty Recovery',
        'status' => ShelterAnimalStatus::Treatment,
    ]);

    AnimalMedicalRecord::factory()->create([
        'shelter_animal_id' => $animal->id,
        'record_type' => 'injury',
        'title' => 'Sprained Ankle',
        'severity' => 'mild',
        'status' => 'active',
        'performed_date' => now()->toDateString(),
    ]);

    $response = $this->actingAs($admin)->get(route('account.admin.animal-records'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/animal-records')
        ->where('animals.data.0.id', $animal->id)
        ->where('animals.data.0.has_active_condition', true)
        ->where('animals.data.0.active_condition_title', 'Sprained Ankle')
        ->where('animals.data.0.active_condition_type', 'injury')
        ->where('animals.data.0.active_condition_severity', 'mild')
        ->where('animals.data.0.medical_history.conditions_count', 1)
        ->where('animals.data.0.medical_history.active_conditions_count', 1)
        ->missing('animals.data.0.microchip_id')
    );
});

test('admin can register an animal with multiple gallery photos and rescued tag is computed', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $primaryPhoto = UploadedFile::fake()->image('primary.jpg');
    $galleryPhoto1 = UploadedFile::fake()->image('gallery1.jpg');
    $galleryPhoto2 = UploadedFile::fake()->image('gallery2.jpg');

    $response = $this->actingAs($admin)->post(route('account.admin.animal-records.store'), [
        'name' => 'Milo MultiPhoto',
        'type' => 'dog',
        'breed' => 'Aspin',
        'age' => '1 yr',
        'ageCategory' => 'young',
        'gender' => 'male',
        'status' => 'available',
        'admittedAt' => '2026-06-01',
        'intake_type' => 'rescue',
        'rescue_location' => 'Tibanga Highway',
        'photo' => $primaryPhoto,
        'gallery_photos' => [$galleryPhoto1, $galleryPhoto2],
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $animal = ShelterAnimal::where('name', 'Milo MultiPhoto')->firstOrFail();
    expect($animal->photo_url)->not->toBeNull();
    expect($animal->gallery_photos)->toBeArray()->toHaveCount(2);
    expect($animal->all_photos)->toHaveCount(3);
    expect($animal->is_rescued)->toBeTrue();
    expect($animal->rescued_tag)->toBe('Rescued • In Shelter Care');
});

test('admin can update animal gallery photos by retaining some, adding new ones, and clearing before/after photos', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $animal = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Available,
        'photo_url' => '/storage/pet_photos/main.jpg',
        'gallery_photos' => [
            '/storage/pet_photos/old1.jpg',
            '/storage/pet_photos/old2.jpg',
        ],
        'before_photo_url' => '/storage/pet_photos/before.jpg',
        'after_photo_url' => '/storage/pet_photos/after.jpg',
    ]);

    $newGalleryFile = UploadedFile::fake()->image('new_gallery.jpg');

    $response = $this->actingAs($admin)->put(route('account.admin.animal-records.update', $animal), [
        'name' => $animal->name,
        'type' => $animal->type->value,
        'breed' => $animal->breed,
        'age' => $animal->age,
        'ageCategory' => $animal->age_category->value,
        'gender' => $animal->gender->value,
        'status' => 'available',
        'admittedAt' => $animal->admitted_at->format('Y-m-d'),
        'retained_gallery_photos' => ['/storage/pet_photos/old1.jpg'],
        'gallery_photos' => [$newGalleryFile],
        'remove_before_photo' => true,
        'remove_after_photo' => true,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $animal->refresh();
    expect($animal->gallery_photos)->toBeArray()->toHaveCount(2);
    expect($animal->gallery_photos)->toContain('/storage/pet_photos/old1.jpg');
    expect($animal->gallery_photos)->not->toContain('/storage/pet_photos/old2.jpg');
    expect($animal->before_photo_url)->toBeNull();
    expect($animal->after_photo_url)->toBeNull();
});

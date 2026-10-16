<?php

use App\Enums\AdoptionApplicationStatus;
use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\PostAdoptionFollowUp;
use App\Models\ShelterAnimal;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('admin can record post-adoption follow-up check-in', function () {
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Adopted,
        'adopter_name' => 'John Doe',
        'adopter_phone' => '09123456789',
        'adoption_date' => now()->subMonth(),
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.post-adoption-follow-ups.store'), [
        'shelter_animal_id' => $pet->id,
        'follow_up_date' => now()->format('Y-m-d'),
        'method' => 'chat',
        'status' => 'completed',
        'pet_condition' => 'Excellent',
        'notes' => 'Pet has adjusted very well to new home, eating normally, active with children.',
        'next_follow_up_date' => now()->addMonth()->format('Y-m-d'),
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('account.admin.adoption-management'));

    $this->assertDatabaseHas('post_adoption_follow_ups', [
        'shelter_animal_id' => $pet->id,
        'method' => 'chat',
        'pet_condition' => 'Excellent',
        'status' => 'completed',
        'conducted_by' => $admin->id,
    ]);
});

test('admin can record post-adoption follow-up with photo proof', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Adopted,
    ]);

    $file = UploadedFile::fake()->image('happy_pet.jpg', 600, 600);

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.post-adoption-follow-ups.store'), [
        'shelter_animal_id' => $pet->id,
        'follow_up_date' => now()->format('Y-m-d'),
        'method' => 'home_visit',
        'status' => 'completed',
        'pet_condition' => 'Good',
        'notes' => 'In-person home visit verified spacious yard and clean living area.',
        'photo' => $file,
    ]);

    $response->assertSessionHasNoErrors();

    $followUp = PostAdoptionFollowUp::where('shelter_animal_id', $pet->id)->first();
    expect($followUp)->not->toBeNull();
    expect($followUp->photo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($followUp->photo_path);
});

test('post-adoption follow-up validation ensures required attributes', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.post-adoption-follow-ups.store'), [
        'shelter_animal_id' => '',
        'follow_up_date' => '',
        'method' => 'invalid-method',
        'status' => '',
        'pet_condition' => '',
        'notes' => '',
    ]);

    $response->assertSessionHasErrors(['shelter_animal_id', 'follow_up_date', 'method', 'status', 'pet_condition', 'notes']);
});

test('approving application populates adopter details on shelter animal for post-adoption tracking', function () {
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Pending]);
    $application = AdoptionApplication::factory()->create([
        'shelter_animal_id' => $pet->id,
        'full_name' => 'Carlos Mendoza',
        'phone' => '09998887777',
        'email' => 'carlos@example.com',
        'status' => AdoptionApplicationStatus::Scheduled,
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.update-status', $application), [
        'status' => 'approved',
        'notes' => 'Application approved.',
    ]);

    $response->assertSessionHasNoErrors();
    $pet->refresh();
    expect($pet->status)->toBe(ShelterAnimalStatus::Adopted);
    expect($pet->adopter_name)->toBe('Carlos Mendoza');
    expect($pet->adopter_phone)->toBe('09998887777');
    expect($pet->adopter_email)->toBe('carlos@example.com');
    expect($pet->adoption_date)->not->toBeNull();
});

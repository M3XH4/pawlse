<?php

use App\Models\RehomingRequest;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('public user can submit a rehoming assistance request with image', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('rescue_pup.jpg', 600, 600);

    $response = $this->post(route('rehoming-requests.store'), [
        'full_name' => 'Ana Reyes',
        'contact_number' => '09171234567',
        'email' => 'ana@example.com',
        'animal_name' => 'Charlie',
        'species' => 'Dog',
        'breed' => 'Aspin',
        'gender' => 'Male',
        'age' => '1 year',
        'current_location' => 'Iligan City',
        'reason' => 'Relocating / Moving',
        'health_notes' => 'Complete 5-in-1 vaccines',
        'description' => 'Gentle and friendly with other dogs',
        'photo' => $file,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('rehoming_requests', [
        'full_name' => 'Ana Reyes',
        'animal_name' => 'Charlie',
        'species' => 'Dog',
        'gender' => 'Male',
        'current_location' => 'Iligan City',
        'status' => 'pending',
    ]);

    $rehoming = RehomingRequest::where('animal_name', 'Charlie')->first();
    expect($rehoming)->not->toBeNull();
    expect($rehoming->photo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($rehoming->photo_path);
});

test('rehoming request validates required fields', function () {
    $response = $this->post(route('rehoming-requests.store'), [
        'full_name' => '',
        'contact_number' => '',
        'email' => 'invalid-email',
        'animal_name' => '',
        'species' => '',
        'current_location' => '',
        'reason' => '',
    ]);

    $response->assertSessionHasErrors(['full_name', 'contact_number', 'email', 'animal_name', 'species', 'current_location', 'reason']);
});

test('admin can update rehoming assistance status and notes', function () {
    $admin = User::factory()->admin()->create();
    $rehoming = RehomingRequest::factory()->create([
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.rehoming-requests.update-status', $rehoming), [
        'status' => 'posted',
        'admin_notes' => 'Cross-posted to ISF official Facebook page.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('account.admin.adoption-management'));

    $rehoming->refresh();
    expect($rehoming->status)->toBe('posted');
    expect($rehoming->admin_notes)->toBe('Cross-posted to ISF official Facebook page.');
    expect($rehoming->reviewed_by)->toBe($admin->id);
});

test('admin can mark rehoming request as home found', function () {
    $admin = User::factory()->admin()->create();
    $rehoming = RehomingRequest::factory()->create([
        'status' => 'posted',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.rehoming-requests.update-status', $rehoming), [
        'status' => 'home_found',
        'admin_notes' => 'Adopter finalized via community lead.',
    ]);

    $response->assertSessionHasNoErrors();
    $rehoming->refresh();
    expect($rehoming->status)->toBe('home_found');
});

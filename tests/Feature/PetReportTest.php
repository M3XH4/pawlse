<?php

use App\Enums\Role;
use App\Models\PetReport;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    Storage::fake('public');
});

test('guest can submit a rescue report manually', function () {
    $response = $this->post('/pet-reports/rescue', [
        'mode' => 'Manual Entry',
        'animal_type' => 'Dog',
        'breed' => 'German Shepherd',
        'age_category' => 'Adult',
        'gender' => 'Male',
        'name' => 'Buddy',
        'description' => 'Spotted an injured dog near the park.',
        'location' => '8.228000, 124.245000 (Current Location)',
        'contact_name' => 'Guest User',
        'contact_phone' => '09123456789',
        'contact_email' => 'guest@example.com',
        'images' => [
            UploadedFile::fake()->image('dog.jpg'),
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('pet_reports', [
        'type' => 'rescue',
        'animal_type' => 'Dog',
        'breed' => 'German Shepherd',
        'contact_name' => 'Guest User',
        'status' => 'pending',
        'is_duplicate' => false,
    ]);

    $report = PetReport::first();
    expect($report->photos)->toHaveCount(1);
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $report->photos->first()->path));
});

test('guest can submit a missing pet report', function () {
    $response = $this->post('/pet-reports/missing', [
        'petName' => 'Luna',
        'petType' => 'Cat',
        'breed' => 'Siamese',
        'color' => 'White/Gray',
        'lastSeenLocation' => 'Tibanga Highway',
        'lastSeenDate' => '2026-08-25',
        'description' => 'Siamese cat missing since yesterday.',
        'contactName' => 'Jane Owner',
        'contactPhone' => '09123456780',
        'contactEmail' => 'jane@example.com',
        'distinguishingFeatures' => 'Blue eyes, collar with name tag.',
        'images' => [
            UploadedFile::fake()->image('cat.jpg'),
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('pet_reports', [
        'type' => 'missing',
        'name' => 'Luna',
        'animal_type' => 'Cat',
        'breed' => 'Siamese',
        'color' => 'White/Gray',
        'contact_name' => 'Jane Owner',
        'is_duplicate' => false,
    ]);
});

test('guest can submit an SOS emergency report', function () {
    $response = $this->post('/pet-reports/sos', [
        'situationType' => 'Severe Injury',
        'animalType' => 'Dog',
        'location' => '8.228500, 124.246000',
        'urgency' => 'high',
        'description' => 'Dog hit by car, bleeding heavily.',
        'contactName' => 'Good Samaritan',
        'contactPhone' => '09234567890',
        'images' => [
            UploadedFile::fake()->image('sos_dog.jpg'),
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('pet_reports', [
        'type' => 'sos',
        'situation_type' => 'Severe Injury',
        'animal_type' => 'Dog',
        'urgency' => 'high',
        'is_duplicate' => false,
    ]);
});

test('authenticated user reports are linked to their account', function () {
    $user = User::factory()->create(['role' => Role::User->value]);

    $response = $this->actingAs($user)->post('/pet-reports/sos', [
        'situationType' => 'Aggressive Stray',
        'animalType' => 'Dog',
        'location' => 'Pala-o Market',
        'urgency' => 'medium',
        'description' => 'Aggressive stray dog chasing pedestrians.',
        'images' => [
            UploadedFile::fake()->image('aggressive.jpg'),
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('pet_reports', [
        'type' => 'sos',
        'user_id' => $user->id,
        'contact_name' => $user->name,
        'contact_email' => $user->email,
    ]);
});

test('duplicate reports are automatically flagged based on coordinates and location matching', function () {
    // 1. Create original report
    $original = PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'Dog',
        'breed' => 'Aspin',
        'location' => '8.228000, 124.245000',
        'description' => 'Stray dog roaming around.',
        'status' => 'pending',
        'is_duplicate' => false,
    ]);

    // 2. Submit second report nearby (approx 100 meters away, which is <= 0.5km)
    $response = $this->post('/pet-reports/rescue', [
        'mode' => 'Manual Entry',
        'animal_type' => 'Dog',
        'breed' => 'Aspin',
        'description' => 'Saw same stray dog.',
        'location' => '8.228500, 124.245500', // Nearby
        'contact_name' => 'Second Reporter',
        'contact_phone' => '09333333333',
    ]);

    $response->assertRedirect();

    // Check that it gets flagged as duplicate
    $duplicate = PetReport::where('id', '!=', $original->id)->first();
    expect($duplicate)->not->toBeNull();
    expect($duplicate->is_duplicate)->toBeTrue();
    expect($duplicate->duplicate_of_id)->toBe($original->id);
    expect($duplicate->status)->toBe('duplicate');

    // 3. Submit report with substring match on location text without coordinates
    $originalText = PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'Cat',
        'breed' => 'Puspin',
        'location' => 'Tibanga Highway',
        'description' => 'Cute kitten.',
        'status' => 'pending',
        'is_duplicate' => false,
    ]);

    $response2 = $this->post('/pet-reports/rescue', [
        'mode' => 'Manual Entry',
        'animal_type' => 'Cat',
        'breed' => 'Puspin',
        'description' => 'Kitten at Jollibee.',
        'location' => 'Tibanga Highway near Jollibee', // Substring match
        'contact_name' => 'Third Reporter',
        'contact_phone' => '09444444444',
    ]);

    $response2->assertRedirect();
    $duplicateText = PetReport::orderBy('id', 'desc')->first();
    expect($duplicateText->is_duplicate)->toBeTrue();
    expect($duplicateText->duplicate_of_id)->toBe($originalText->id);
    expect($duplicateText->status)->toBe('duplicate');
});

test('admin can view, filter, and paginate reports on the dashboard', function () {
    $admin = User::factory()->admin()->create();

    // Create 15 reports
    PetReport::factory()->count(15)->create([
        'type' => 'rescue',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->get('/account/admin/rescue-management');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/rescue-management')
        ->has('reports.data', 10) // Pagination limit is 10
        ->has('stats')
        ->where('reports.total', 15)
    );
});

test('admin can assign a volunteer to a report and status propagates', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);

    $report = PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'Dog',
        'location' => '8.228000, 124.245000',
        'description' => 'Injured dog.',
        'status' => 'pending',
    ]);

    // Assign volunteer
    $response = $this->actingAs($admin)->post("/account/admin/rescue-management/{$report->id}/assign", [
        'volunteer_id' => $volunteer->id,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('pet_reports', [
        'id' => $report->id,
        'assigned_volunteer_id' => $volunteer->id,
        'status' => 'assigned',
    ]);

    // Verify task created in assigned_tasks
    $this->assertDatabaseHas('assigned_tasks', [
        'user_id' => $volunteer->id,
        'pet_report_id' => $report->id,
        'role' => 'Rescue Responder (Rescue)',
        'status' => 'pending',
    ]);

    // Propagate status change: mark report as resolved
    $response2 = $this->actingAs($admin)->post("/account/admin/rescue-management/{$report->id}/status", [
        'status' => 'resolved',
    ]);

    $response2->assertRedirect();
    // Task should automatically update to completed
    $this->assertDatabaseHas('assigned_tasks', [
        'pet_report_id' => $report->id,
        'status' => 'completed',
    ]);
});

test('user can view their own reports history page', function () {
    $user = User::factory()->create(['role' => Role::User->value]);
    $otherUser = User::factory()->create(['role' => Role::User->value]);

    PetReport::create([
        'user_id' => $user->id,
        'type' => 'rescue',
        'animal_type' => 'Cat',
        'location' => 'Orchard',
        'status' => 'pending',
    ]);

    PetReport::create([
        'user_id' => $otherUser->id,
        'type' => 'missing',
        'animal_type' => 'Dog',
        'location' => 'Zone 3',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($user)->get('/account/user/rescue-reports');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('user/rescue-reports')
        ->has('reports.data', 1)
        ->where('reports.data.0.animal_type', 'Cat')
    );
});

test('volunteer can view assigned rescue reports', function () {
    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);

    $report = PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'Dog',
        'location' => 'Pala-o',
        'status' => 'assigned',
        'assigned_volunteer_id' => $volunteer->id,
    ]);

    $response = $this->actingAs($volunteer)->get('/account/volunteer/rescue-reports?status=assigned');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('volunteer/rescue-reports')
        ->has('reports.data', 1)
        ->where('reports.data.0.id', $report->id)
    );
});

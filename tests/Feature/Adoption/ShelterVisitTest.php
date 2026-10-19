<?php

use App\Models\ShelterAnimal;
use App\Models\ShelterVisit;
use App\Models\User;

test('public user can submit a shelter visit request', function () {
    $pet = ShelterAnimal::factory()->create();

    $response = $this->post(route('shelter-visits.store'), [
        'full_name' => 'Maria Santos',
        'contact_number' => '09123456789',
        'email' => 'maria@example.com',
        'preferred_date' => now()->addDays(3)->format('Y-m-d'),
        'preferred_time_slot' => 'Morning (9:00 AM - 12:00 PM)',
        'number_of_visitors' => 2,
        'purpose' => 'Meet Adoptable Animals',
        'shelter_animal_id' => $pet->id,
        'additional_notes' => 'Interested in meeting this pet.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('shelter_visits', [
        'full_name' => 'Maria Santos',
        'contact_number' => '09123456789',
        'email' => 'maria@example.com',
        'number_of_visitors' => 2,
        'purpose' => 'Meet Adoptable Animals',
        'shelter_animal_id' => $pet->id,
        'status' => 'pending',
    ]);
});

test('submitting shelter visit requires valid data', function () {
    $response = $this->post(route('shelter-visits.store'), [
        'full_name' => '',
        'contact_number' => '',
        'preferred_date' => '',
        'number_of_visitors' => 0,
        'purpose' => '',
    ]);

    $response->assertSessionHasErrors(['full_name', 'contact_number', 'preferred_date', 'number_of_visitors', 'purpose']);
});

test('admin can confirm a shelter visit request', function () {
    $admin = User::factory()->admin()->create();
    $visit = ShelterVisit::factory()->create([
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.shelter-visits.update-status', $visit), [
        'status' => 'confirmed',
        'confirmed_date' => now()->addDays(3)->format('Y-m-d'),
        'confirmed_time_slot' => 'Morning (9:00 AM - 12:00 PM)',
        'admin_notes' => 'Confirmed via phone call with visitor.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('account.admin.adoption-management'));

    $visit->refresh();
    expect($visit->status)->toBe('confirmed');
    expect($visit->confirmed_time_slot)->toBe('Morning (9:00 AM - 12:00 PM)');
    expect($visit->admin_notes)->toBe('Confirmed via phone call with visitor.');
    expect($visit->confirmed_by)->toBe($admin->id);
});

test('admin can complete or cancel a shelter visit', function () {
    $admin = User::factory()->admin()->create();
    $visit = ShelterVisit::factory()->create([
        'status' => 'confirmed',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.shelter-visits.update-status', $visit), [
        'status' => 'completed',
        'admin_notes' => 'Visitor completed adoption inquiry tour.',
    ]);

    $response->assertSessionHasNoErrors();
    $visit->refresh();
    expect($visit->status)->toBe('completed');
});

test('submitting shelter visit respects maximum visitor capacity per slot', function () {
    $date = now()->addDays(5)->format('Y-m-d');
    $slot = 'Morning (9:00 AM - 12:00 PM)';

    // Existing booking with 8 visitors
    ShelterVisit::factory()->create([
        'preferred_date' => $date,
        'preferred_time_slot' => $slot,
        'number_of_visitors' => 8,
        'status' => 'confirmed',
    ]);

    // Attempting to book 3 visitors (8 + 3 = 11 > 10)
    $response = $this->post(route('shelter-visits.store'), [
        'full_name' => 'John Overcapacity',
        'contact_number' => '09123456789',
        'preferred_date' => $date,
        'preferred_time_slot' => $slot,
        'number_of_visitors' => 3,
        'purpose' => 'Shelter Tour',
    ]);

    $response->assertSessionHasErrors(['preferred_time_slot']);
});

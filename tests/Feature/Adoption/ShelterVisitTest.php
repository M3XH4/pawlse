<?php

use App\Models\AdoptionApplication;
use App\Models\ShelterAnimal;
use App\Models\ShelterVisit;
use App\Models\SystemSetting;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('public user can submit a shelter visit request', function () {
    $pet = ShelterAnimal::factory()->create();
    $validDate = now()->next('Tuesday')->format('Y-m-d');

    $response = $this->post(route('shelter-visits.store'), [
        'full_name' => 'Maria Santos',
        'contact_number' => '09123456789',
        'email' => 'maria@example.com',
        'preferred_date' => $validDate,
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
        'email' => '',
        'preferred_date' => '',
        'number_of_visitors' => 0,
        'purpose' => '',
    ]);

    $response->assertSessionHasErrors(['full_name', 'contact_number', 'email', 'preferred_date', 'number_of_visitors', 'purpose']);
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
    $date = now()->next('Thursday')->format('Y-m-d');
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
        'email' => 'john@example.com',
        'preferred_date' => $date,
        'preferred_time_slot' => $slot,
        'number_of_visitors' => 3,
        'purpose' => 'Shelter Tour',
    ]);

    $response->assertSessionHasErrors(['preferred_time_slot']);
});

test('submitting shelter visit rejects closed days like Sunday', function () {
    $sunday = now()->next('Sunday')->format('Y-m-d');

    $response = $this->post(route('shelter-visits.store'), [
        'full_name' => 'Sunday Visitor',
        'contact_number' => '09123456789',
        'email' => 'sunday@example.com',
        'preferred_date' => $sunday,
        'preferred_time_slot' => 'Morning (9:00 AM - 12:00 PM)',
        'number_of_visitors' => 2,
        'purpose' => 'Shelter Tour',
    ]);

    $response->assertSessionHasErrors(['preferred_date']);
});

test('admin can update shelter visit configuration settings', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.shelter-visits.settings'), [
        'max_visitors_per_slot' => 15,
        'max_visitors_per_booking' => 8,
        'closed_days' => ['Sunday', 'Monday'],
        'blackout_dates' => ['2026-12-25'],
        'is_accepting_visits' => true,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('account.admin.adoption-management'));

    $settings = SystemSetting::getValue('shelter_visit_settings');
    expect($settings['max_visitors_per_slot'])->toBe(15);
    expect($settings['closed_days'])->toContain('Monday');
});

test('authenticated user can view and cancel their shelter visits in user dashboard', function () {
    $user = User::factory()->create(['email' => 'visitor_user@example.com']);
    $visit = ShelterVisit::factory()->create([
        'user_id' => null,
        'email' => 'visitor_user@example.com',
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->get(route('account.user.shelter-visits'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('user/shelter-visits')
            ->has('visits', 1)
            ->where('visits.0.id', $visit->id)
        );

    $this->actingAs($user)
        ->post(route('account.user.shelter-visits.cancel', $visit))
        ->assertRedirect();

    expect($visit->fresh()->status)->toBe('cancelled');
});

test('capacity check accounts for visits rescheduled via confirmed_date and confirmed_time_slot', function () {
    $originalDate = now()->next('Wednesday')->format('Y-m-d');
    $rescheduledDate = now()->next('Thursday')->format('Y-m-d');
    $slot = 'Afternoon (1:00 PM - 4:00 PM)';

    // Visit originally requested for Wednesday, but confirmed by admin for Thursday Afternoon with 9 visitors
    ShelterVisit::factory()->create([
        'preferred_date' => $originalDate,
        'preferred_time_slot' => 'Morning (9:00 AM - 12:00 PM)',
        'confirmed_date' => $rescheduledDate,
        'confirmed_time_slot' => $slot,
        'number_of_visitors' => 9,
        'status' => 'confirmed',
    ]);

    // Attempting to book 2 visitors for Thursday Afternoon (9 + 2 = 11 > 10)
    $response = $this->post(route('shelter-visits.store'), [
        'full_name' => 'Rescheduled Slot Visitor',
        'contact_number' => '09123456789',
        'email' => 'rescheduled@example.com',
        'preferred_date' => $rescheduledDate,
        'preferred_time_slot' => $slot,
        'number_of_visitors' => 2,
        'purpose' => 'Meet Adoptable Animals',
    ]);

    $response->assertSessionHasErrors(['preferred_time_slot']);
});

test('public tracking resolves VIS- reference without colliding with adoption application of same numeric ID', function () {
    $email = 'tracker@example.com';

    $app = AdoptionApplication::factory()->create([
        'email' => $email,
    ]);

    $visit = ShelterVisit::factory()->create([
        'email' => $email,
        'status' => 'confirmed',
        'preferred_date' => now()->addDays(2)->format('Y-m-d'),
        'confirmed_date' => now()->addDays(5)->format('Y-m-d'),
        'confirmed_time_slot' => 'Afternoon (1:00 PM - 4:00 PM)',
    ]);

    $visitRef = 'VIS-'.str_pad((string) $visit->id, 5, '0', STR_PAD_LEFT);

    $response = $this->get(route('track', [
        'reference' => $visitRef,
        'email' => $email,
    ]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('track')
            ->where('item.category', 'shelter_visit')
            ->where('item.reference', $visitRef)
            ->where('item.status_label', 'Visit Confirmed')
        );
});

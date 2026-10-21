<?php

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\PetReport;
use App\Models\User;
use App\Notifications\RescueStatusUpdatedNotification;
use App\Notifications\SubmissionEReceiptNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('guest can access public missing pet tracking page', function () {
    $response = $this->get(route('missing.track'));
    $response->assertOk();
});

test('guest can query tracking page with email to view submitted missing reports', function () {
    $report = PetReport::create([
        'type' => 'missing',
        'status' => 'pending',
        'name' => 'Charlie',
        'animal_type' => 'Dog',
        'breed' => 'Golden Retriever',
        'location' => 'Iligan City Plaza',
        'contact_name' => 'John Doe',
        'contact_phone' => '09123456789',
        'contact_email' => 'johndoe@example.com',
    ]);

    $response = $this->get(route('missing.track', ['email' => 'johndoe@example.com']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('track')
        ->where('searchedEmail', 'johndoe@example.com')
        ->where('item.category', 'missing')
        ->where('item.id', $report->id)
    );
});

test('guest missing report submission dispatches e-receipt with missing tracking link', function () {
    Notification::fake();

    $response = $this->post(route('pet-reports.store-missing'), [
        'petName' => 'Milo',
        'petType' => 'Cat',
        'breed' => 'Persian',
        'lastSeenLocation' => 'Barangay Tubod',
        'lastSeenDate' => '2026-08-25',
        'contactName' => 'Jane Reporter',
        'contactPhone' => '09187654321',
        'contactEmail' => 'jane@example.com',
    ]);

    $response->assertRedirect();

    $report = PetReport::where('name', 'Milo')->firstOrFail();
    $expectedRef = 'MIS-'.str_pad((string) $report->id, 5, '0', STR_PAD_LEFT);

    Notification::assertSentOnDemand(SubmissionEReceiptNotification::class, function ($notification, $channels, $notifiable) use ($expectedRef) {
        $expectedUrl = route('track', ['reference' => $expectedRef, 'email' => 'jane@example.com']);

        return $notification->actionUrl === $expectedUrl &&
            $notification->actionText === 'Track Missing Pet Alert';
    });
});

test('admin status update sends notification with tracking link to guest contact email', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => Role::Admin->value]);

    $report = PetReport::create([
        'type' => 'missing',
        'status' => 'pending',
        'name' => 'Simba',
        'animal_type' => 'Cat',
        'location' => 'Tibanga',
        'contact_name' => 'Guest Owner',
        'contact_phone' => '09123456789',
        'contact_email' => 'simbaowner@example.com',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.rescue-management.update-status', $report), [
        'status' => 'assigned',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('pet_reports', [
        'id' => $report->id,
        'status' => 'assigned',
    ]);

    $expectedRef = 'MIS-'.str_pad((string) $report->id, 5, '0', STR_PAD_LEFT);

    Notification::assertSentOnDemand(RescueStatusUpdatedNotification::class, function ($notification, $channels, $notifiable) use ($expectedRef) {
        $data = $notification->toArray($notifiable);
        $expectedUrl = route('track', ['reference' => $expectedRef, 'email' => 'simbaowner@example.com']);

        return $data['url'] === $expectedUrl &&
            $notifiable->routes['mail'] === 'simbaowner@example.com';
    });
});

test('volunteer can mark assigned missing report as resolved and notify reporter', function () {
    Notification::fake();

    $volunteer = User::factory()->create(['role' => Role::Volunteer->value]);

    $report = PetReport::create([
        'type' => 'missing',
        'status' => 'assigned',
        'name' => 'Rocky',
        'animal_type' => 'Dog',
        'location' => 'Pala-o Market',
        'contact_name' => 'Rocky Owner',
        'contact_phone' => '09123456789',
        'contact_email' => 'rocky@example.com',
        'assigned_volunteer_id' => $volunteer->id,
    ]);

    $task = AssignedTask::create([
        'user_id' => $volunteer->id,
        'pet_report_id' => $report->id,
        'role' => 'Missing Pet Searcher',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($volunteer)->post("/account/volunteer/rescue-reports/{$report->id}/status", [
        'status' => 'resolved',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('pet_reports', [
        'id' => $report->id,
        'status' => 'resolved',
    ]);

    $this->assertDatabaseHas('assigned_tasks', [
        'id' => $task->id,
        'status' => 'completed',
    ]);

    Notification::assertSentOnDemand(RescueStatusUpdatedNotification::class, function ($notification, $channels, $notifiable) {
        return $notifiable->routes['mail'] === 'rocky@example.com';
    });
});

test('guest reporter can mark their own missing pet as reunited', function () {
    $report = PetReport::create([
        'type' => 'missing',
        'status' => 'assigned',
        'name' => 'Bambi',
        'animal_type' => 'Dog',
        'location' => 'Zone 5',
        'contact_name' => 'Bambi Owner',
        'contact_phone' => '09123456789',
        'contact_email' => 'bambiowner@example.com',
    ]);

    $response = $this->post(route('missing.reunited', $report), [
        'email' => 'bambiowner@example.com',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('pet_reports', [
        'id' => $report->id,
        'status' => 'resolved',
    ]);
});

test('unauthorized person cannot mark another report as reunited', function () {
    $report = PetReport::create([
        'type' => 'missing',
        'status' => 'assigned',
        'name' => 'Bambi',
        'animal_type' => 'Dog',
        'location' => 'Zone 5',
        'contact_name' => 'Bambi Owner',
        'contact_phone' => '09123456789',
        'contact_email' => 'bambiowner@example.com',
    ]);

    $response = $this->post(route('missing.reunited', $report), [
        'email' => 'stranger@example.com',
    ]);

    $response->assertStatus(403);
});

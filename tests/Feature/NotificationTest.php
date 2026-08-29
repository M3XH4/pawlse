<?php

use App\Enums\AdoptionApplicationStatus;
use App\Models\AdoptionApplication;
use App\Models\Donation;
use App\Models\InKindDonation;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use App\Models\User;
use App\Models\VolunteerApplication;
use App\Notifications\AdoptionApplicationStatusUpdatedNotification;
use App\Notifications\AdoptionApplicationSubmittedNotification;
use App\Notifications\DonationVerifiedNotification;
use App\Notifications\RescueReportSubmittedNotification;
use App\Notifications\RescueStatusUpdatedNotification;
use App\Notifications\RescueTaskAssignedNotification;
use App\Notifications\VolunteerApplicationReviewedNotification;
use App\Notifications\VolunteerApplicationSubmittedNotification;
use App\Notifications\VolunteerCertificateIssuedNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('user can mark a notification as read', function () {
    $user = User::factory()->user()->create();
    $user->notify(new AdoptionApplicationSubmittedNotification(
        AdoptionApplication::factory()->create()
    ));

    $notification = $user->notifications()->first();
    expect($notification->read())->toBeFalse();

    $response = $this->actingAs($user)
        ->patch(route('account.notifications.read', $notification));

    $response->assertStatus(303);
    expect($notification->fresh()->read())->toBeTrue();
});

test('user cannot mark another users notification as read', function () {
    $userA = User::factory()->user()->create();
    $userB = User::factory()->user()->create();

    $userA->notify(new AdoptionApplicationSubmittedNotification(
        AdoptionApplication::factory()->create()
    ));

    $notification = $userA->notifications()->first();

    $response = $this->actingAs($userB)
        ->patch(route('account.notifications.read', $notification));

    $response->assertNotFound();
    expect($notification->fresh()->read())->toBeFalse();
});

test('user can mark all notifications as read', function () {
    $user = User::factory()->user()->create();
    $application = AdoptionApplication::factory()->create();

    $user->notify(new AdoptionApplicationSubmittedNotification($application));
    $user->notify(new AdoptionApplicationSubmittedNotification($application));

    expect($user->unreadNotifications()->count())->toBe(2);

    $response = $this->actingAs($user)
        ->patch(route('account.notifications.read-all'));

    $response->assertStatus(303);
    expect($user->fresh()->unreadNotifications()->count())->toBe(0);
});

test('user can delete a notification', function () {
    $user = User::factory()->user()->create();
    $user->notify(new AdoptionApplicationSubmittedNotification(
        AdoptionApplication::factory()->create()
    ));

    $notification = $user->notifications()->first();

    $response = $this->actingAs($user)
        ->delete(route('account.notifications.destroy', $notification));

    $response->assertStatus(303);
    expect($user->notifications()->count())->toBe(0);
});

test('user cannot delete another users notification', function () {
    $userA = User::factory()->user()->create();
    $userB = User::factory()->user()->create();

    $userA->notify(new AdoptionApplicationSubmittedNotification(
        AdoptionApplication::factory()->create()
    ));

    $notification = $userA->notifications()->first();

    $response = $this->actingAs($userB)
        ->delete(route('account.notifications.destroy', $notification));

    $response->assertNotFound();
    expect($userA->notifications()->count())->toBe(1);
});

test('user can clear all read notifications', function () {
    $user = User::factory()->user()->create();
    $application = AdoptionApplication::factory()->create();

    $user->notify(new AdoptionApplicationSubmittedNotification($application));
    $user->notify(new AdoptionApplicationSubmittedNotification($application));

    // Mark first notification as read
    $user->notifications()->first()->markAsRead();

    expect($user->readNotifications()->count())->toBe(1);
    expect($user->unreadNotifications()->count())->toBe(1);

    $response = $this->actingAs($user)
        ->delete(route('account.notifications.clear-all'));

    $response->assertStatus(303);
    expect($user->readNotifications()->count())->toBe(0);
    expect($user->unreadNotifications()->count())->toBe(1);
});

test('admin is notified when adoption application is submitted', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $user = User::factory()->user()->create();
    $pet = ShelterAnimal::factory()->create();

    $payload = [
        'pet_id' => $pet->id,
        'fullName' => 'Jane Doe',
        'address' => '123 Pet St',
        'phone' => '09123456789',
        'email' => 'jane@example.com',
        'birthDate' => '1995-05-15',
        'occupation' => 'Designer',
        'company' => 'Pawlse Inc',
        'socialMedia' => '@janedoe',
        'status' => 'Single',
        'pronouns' => 'she/her',
        'adoptionSource' => ['Social Media'],
        'adoptedBefore' => 'No',
        'emergencyName' => 'John Doe',
        'emergencyRelationship' => 'Brother',
        'emergencyPhone' => '09123456780',
        'emergencyEmail' => 'john@example.com',
        'adoptionPreference' => 'Indoor only',
        'residenceType' => 'House',
        'isRenting' => 'No',
        'movingPlan' => 'No plans to move',
        'livesWith' => ['Family'],
        'hasAllergies' => 'No',
        'dailyCareHandler' => 'Myself',
        'expensesHandler' => 'Myself',
        'emergencyHandler' => 'Myself',
        'hoursAlone' => '2-4 hours',
        'introductionPlan' => 'Slow introduction',
        'familySupport' => 'Yes',
        'currentPets' => 'No',
        'pastPets' => 'Yes',
        'uploadedId' => UploadedFile::fake()->image('id.jpg'),
        'preferredDate' => now()->addDays(2)->format('Y-m-d'),
        'preferredTime' => '10:00 AM',
        'canVisitShelter' => 'Yes',
    ];

    $this->actingAs($user)->post(route('adopt.apply'), $payload);

    Notification::assertSentTo($admin, AdoptionApplicationSubmittedNotification::class);
});

test('user is notified when adoption application status is updated', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $applicant = User::factory()->user()->create();
    $application = AdoptionApplication::factory()->create([
        'user_id' => $applicant->id,
        'status' => AdoptionApplicationStatus::Pending,
    ]);

    $this->actingAs($admin)
        ->post(route('account.admin.adoption-management.update-status', $application), [
            'status' => 'approved',
        ]);

    Notification::assertSentTo($applicant, AdoptionApplicationStatusUpdatedNotification::class);
});

test('admins are notified when a rescue report is submitted', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();

    $this->post(route('pet-reports.store-rescue'), [
        'animal_type' => 'Dog',
        'location' => 'Pala-o Market, Iligan City',
        'contact_name' => 'John Doe',
        'contact_phone' => '09123456789',
        'description' => 'Injured stray dog near the stall.',
    ]);

    Notification::assertSentTo($admin, RescueReportSubmittedNotification::class);
});

test('volunteer is notified when assigned to a rescue mission', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();
    $report = PetReport::factory()->create(['status' => 'pending']);

    $this->actingAs($admin)
        ->post(route('account.admin.rescue-management.assign', $report), [
            'volunteer_id' => $volunteer->id,
        ]);

    Notification::assertSentTo($volunteer, RescueTaskAssignedNotification::class);
});

test('reporter is notified when rescue status is updated', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $reporter = User::factory()->user()->create();
    $report = PetReport::factory()->create([
        'user_id' => $reporter->id,
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->post(route('account.admin.rescue-management.update-status', $report), [
            'status' => 'resolved',
        ]);

    Notification::assertSentTo($reporter, RescueStatusUpdatedNotification::class);
});

test('admin is notified when volunteer application is submitted', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $user = User::factory()->user()->create();

    $this->actingAs($user)->post(route('volunteer.apply'), [
        'fullName' => 'Volunteer Applicant',
        'mobile' => '09123456789',
        'email' => 'volunteer@example.com',
        'address' => 'Iligan City',
        'role' => 'Shelter Assistant',
        'why' => 'I love helping animals and want to contribute to the community.',
    ]);

    Notification::assertSentTo($admin, VolunteerApplicationSubmittedNotification::class);
});

test('user is notified when volunteer application is approved', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $user = User::factory()->user()->create();
    $application = VolunteerApplication::factory()->create([
        'user_id' => $user->id,
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.approve', $application));

    Notification::assertSentTo($user, VolunteerApplicationReviewedNotification::class);
});

test('volunteer is notified when a certificate is issued', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();

    $this->actingAs($admin)
        ->post(route('account.admin.volunteer-management.issue-certificate'), [
            'user_id' => $volunteer->id,
            'title' => 'Outstanding Rescue Volunteer of the Month',
            'description' => 'For dedicated service in stray animal rescue operations.',
        ]);

    Notification::assertSentTo($volunteer, VolunteerCertificateIssuedNotification::class);
});

test('donor is notified when in-kind donation is verified', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $donor = User::factory()->user()->create();
    $donation = Donation::factory()->create([
        'user_id' => $donor->id,
        'type' => 'in_kind',
        'status' => 'pending_verification',
    ]);
    InKindDonation::factory()->create(['donation_id' => $donation->id]);

    $this->actingAs($admin)
        ->post(route('account.admin.donation-monitoring.in-kind.verify', $donation), [
            'itemName' => 'Dog Food Kibble',
            'quantity' => 5,
            'unit' => 'bags',
            'category' => 'Food',
        ]);

    Notification::assertSentTo($donor, DonationVerifiedNotification::class);
});

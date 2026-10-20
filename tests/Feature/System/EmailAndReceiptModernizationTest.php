<?php

use App\Enums\AdoptionApplicationStatus;
use App\Models\AdoptionApplication;
use App\Models\Donation;
use App\Models\ShelterAnimal;
use App\Models\User;
use App\Notifications\AdoptionApplicationStatusUpdatedNotification;
use App\Notifications\DonationVerifiedNotification;
use App\Notifications\SubmissionEReceiptNotification;
use App\Notifications\VerifyEmailOtpNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('modernized otp email template renders Iligan Stray Feeders logo and 6-digit code', function () {
    $user = User::factory()->unverified()->create([
        'name' => 'Maria Santos',
        'email' => 'maria@example.com',
    ]);

    $notification = new VerifyEmailOtpNotification('654321', now()->addMinutes(10));
    $mail = $notification->toMail($user);
    $html = (string) $mail->render();

    expect($html)
        ->toContain('images/logo.png')
        ->toContain('Iligan Stray Feeders')
        ->toContain("Here's your code to verify your account")
        ->toContain('654321')
        ->toContain('maria@example.com');
});

test('modernized transactional notification email renders branded header and logo', function () {
    $user = User::factory()->user()->create([
        'name' => 'Carlo Mendoza',
        'email' => 'carlo@example.com',
    ]);
    $pet = ShelterAnimal::factory()->available()->create(['name' => 'Bantay']);
    $application = AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'shelter_animal_id' => $pet->id,
        'status' => AdoptionApplicationStatus::Approved,
    ]);

    $notification = new AdoptionApplicationStatusUpdatedNotification($application);
    $mail = $notification->toMail($user);
    $html = (string) $mail->render();

    expect($html)
        ->toContain('images/logo.png')
        ->toContain('PAWLSE')
        ->toContain('Iligan Stray Feeders')
        ->toContain('Hello there, Carlo Mendoza!')
        ->toContain('Bantay');
});

test('modernized e-receipt email renders Grab-inspired layout with logo, breakdown, and welfare impact route', function () {
    $donation = Donation::factory()->create([
        'public_reference' => 'DON-2026-9999',
        'donor_name' => 'Sofia Reyes',
        'donor_email' => 'sofia@example.com',
        'type' => 'cash',
        'amount' => 1500,
        'status' => 'completed',
        'purpose' => 'Emergency veterinary surgery and stray feeding route',
    ]);

    $notification = new DonationVerifiedNotification($donation);
    $mail = $notification->toMail($donation);
    $html = (string) $mail->render();

    expect($html)
        ->toContain('images/logo.png')
        ->toContain('Iligan Stray Feeders')
        ->toContain('Hope you know you saved a life today!')
        ->toContain('DON-2026-9999')
        ->toContain('1,500.00')
        ->toContain('Breakdown')
        ->toContain('Sofia Reyes');
});

test('submitting cash or in-kind donation with an email address automatically dispatches an e-receipt', function () {
    Notification::fake();

    $this->post(route('donate.store-cash'), [
        'amount' => 500,
        'donor_name' => 'Guest Supporter',
        'donor_email' => 'supporter@example.com',
        'donor_mobile' => '09171234567',
        'anonymous' => false,
        'payment_method' => 'gcash',
    ])->assertRedirect();

    Notification::assertSentOnDemand(
        SubmissionEReceiptNotification::class,
        function (SubmissionEReceiptNotification $notification, array $channels, AnonymousNotifiable $notifiable): bool {
            return ($notifiable->routes['mail'] ?? null) === 'supporter@example.com'
                && $notification->recipientEmail === 'supporter@example.com';
        }
    );
});

test('guest donor with email receives verified e-receipt when admin verifies cash donation', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $donation = Donation::factory()->create([
        'user_id' => null,
        'donor_name' => 'Guest Donor',
        'donor_email' => 'guestdonor@example.com',
        'type' => 'cash',
        'amount' => 1000,
        'status' => 'pending_verification',
    ]);

    $this->actingAs($admin)
        ->post(route('account.admin.donation-monitoring.verify-cash', $donation))
        ->assertRedirect();

    Notification::assertSentOnDemand(
        DonationVerifiedNotification::class,
        function (DonationVerifiedNotification $notification, array $channels, AnonymousNotifiable $notifiable) use ($donation): bool {
            return ($notifiable->routes['mail'] ?? null) === 'guestdonor@example.com'
                && $notification->donation->id === $donation->id;
        }
    );
});

test('submitting shelter visit, rehoming request, or rescue report with email dispatches e-receipt', function () {
    Notification::fake();

    $this->post(route('shelter-visits.store'), [
        'full_name' => 'Elena Cruz',
        'contact_number' => '09171112233',
        'email' => 'elena.visit@example.com',
        'preferred_date' => now()->addDays(3)->format('Y-m-d'),
        'preferred_time_slot' => '10:00 AM - 11:30 AM',
        'number_of_visitors' => 2,
        'purpose' => 'meet_adoptable_pets',
    ])->assertRedirect();

    Notification::assertSentOnDemand(
        SubmissionEReceiptNotification::class,
        fn (SubmissionEReceiptNotification $n, array $c, AnonymousNotifiable $notifiable) => ($notifiable->routes['mail'] ?? null) === 'elena.visit@example.com'
    );

    $this->post(route('pet-reports.store-rescue'), [
        'animal_type' => 'Cat',
        'location' => 'Tibanga, Iligan City',
        'contact_name' => 'Marco Polo',
        'contact_phone' => '09181234567',
        'contact_email' => 'marco.rescue@example.com',
        'description' => 'Kitten needing medical care.',
    ])->assertRedirect();

    Notification::assertSentOnDemand(
        SubmissionEReceiptNotification::class,
        fn (SubmissionEReceiptNotification $n, array $c, AnonymousNotifiable $notifiable) => ($notifiable->routes['mail'] ?? null) === 'marco.rescue@example.com'
    );
});

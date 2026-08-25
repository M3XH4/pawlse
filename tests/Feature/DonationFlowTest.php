<?php

use App\Enums\DonationStatus;
use App\Enums\PaymentStatus;
use App\Models\Donation;
use App\Models\Event;
use App\Models\FeedingSponsorship;
use App\Models\Payment;
use App\Models\User;

test('guest can initiate cash donation and get redirected to checkout', function () {
    $response = $this->post(route('donate.store-cash'), [
        'amount' => 1200,
        'donor_name' => 'John Doe',
        'donor_email' => 'johndoe@example.com',
        'donor_mobile' => '09123456789',
        'anonymous' => false,
        'payment_method' => 'gcash',
    ]);

    $donation = Donation::latest()->first();
    expect($donation)->not->toBeNull();
    expect($donation->amount)->toBe(1200);
    expect($donation->status)->toBe(DonationStatus::PendingPayment->value);
    expect($donation->user_id)->toBeNull();

    $response->assertRedirect(route('donate.checkout', $donation->public_reference));
});

test('guest can initiate sponsor feeding donation', function () {
    $response = $this->post(route('donate.store-sponsor'), [
        'fullName' => 'Sponsor Person',
        'email' => 'sponsor@example.com',
        'mobile' => '09172223333',
        'date' => now()->addDays(5)->format('Y-m-d'),
        'occasion' => 'My Birthday',
        'message' => 'Feeding stray cats and dogs!',
        'anonymous' => true,
        'payment_method' => 'maya',
    ]);

    $donation = Donation::latest()->first();
    expect($donation)->not->toBeNull();
    expect($donation->amount)->toBe(3500); // fixed sponsor price
    expect($donation->status)->toBe(DonationStatus::PendingPayment->value);

    $sponsorship = FeedingSponsorship::latest()->first();
    expect($sponsorship)->not->toBeNull();
    expect($sponsorship->donation_id)->toBe($donation->id);
    expect($sponsorship->occasion)->toBe('My Birthday');

    $response->assertRedirect(route('donate.checkout', $donation->public_reference));
});

test('authenticated user can view their donations on dashboard', function () {
    $user = User::factory()->create();

    $donation = Donation::create([
        'public_reference' => 'DON-TEST-123',
        'user_id' => $user->id,
        'donor_name' => $user->name,
        'donor_email' => $user->email,
        'anonymous' => false,
        'type' => 'cash',
        'amount' => 1500,
        'status' => DonationStatus::Completed->value,
    ]);

    $response = $this->actingAs($user)->get(route('account.user.donations'));
    $response->assertOk();
    $response->assertSee('DON-TEST-123');
});

test('simulating successful payment processes the donation and schedules event', function () {
    $donation = Donation::create([
        'public_reference' => 'DON-GATEWAY',
        'donor_name' => 'Jane Sponsor',
        'donor_email' => 'jane@example.com',
        'anonymous' => false,
        'type' => 'feeding_sponsorship',
        'amount' => 3500,
        'status' => DonationStatus::PendingPayment->value,
    ]);

    $payment = Payment::create([
        'donation_id' => $donation->id,
        'method' => 'gcash',
        'provider' => 'gcash',
        'amount' => 3500,
        'payment_reference' => 'PAY-TEST-GATEWAY',
        'status' => PaymentStatus::Pending->value,
    ]);

    $sponsorship = FeedingSponsorship::create([
        'public_reference' => 'FS-TEST-GATEWAY',
        'donation_id' => $donation->id,
        'donor_name' => 'Jane Sponsor',
        'donor_email' => 'jane@example.com',
        'donor_mobile' => '09111111111',
        'preferred_date' => '2026-09-01',
        'occasion' => 'Save strays',
        'amount' => 3500,
        'status' => 'pending',
    ]);

    $response = $this->post(route('donate.pay', $donation->public_reference), [
        'action' => 'success',
        'method' => 'gcash',
    ]);

    $donation->refresh();
    $payment->refresh();
    $sponsorship->refresh();

    expect($donation->status)->toBe(DonationStatus::Completed->value);
    expect($payment->status)->toBe(PaymentStatus::Verified->value);
    expect($sponsorship->status)->toBe('completed');

    // Confirm that a feeding event has been created automatically
    $event = Event::where('category', 'Feeding')->first();
    expect($event)->not->toBeNull();
    expect($event->title)->toContain('Jane Sponsor');
    expect($event->date->format('Y-m-d'))->toBe('2026-09-01');

    $response->assertRedirect(route('donate'));
});

<?php

use App\Enums\DonationStatus;
use App\Enums\PaymentStatus;
use App\Models\AnimalDonationNeed;
use App\Models\Donation;
use App\Models\Event;
use App\Models\FeedingSponsorship;
use App\Models\Payment;
use App\Models\ShelterAnimal;
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

test('guest can initiate cash donation without mobile and payment method', function () {
    $response = $this->post(route('donate.store-cash'), [
        'amount' => 1500,
        'donor_name' => 'Jane Doe',
        'donor_email' => 'janedoe@example.com',
        'anonymous' => false,
    ]);

    $donation = Donation::latest()->first();
    expect($donation)->not->toBeNull();
    expect($donation->amount)->toBe(1500);
    expect($donation->donor_mobile)->toBeNull();
    expect($donation->status)->toBe(DonationStatus::PendingPayment->value);

    $payment = Payment::where('donation_id', $donation->id)->first();
    expect($payment)->not->toBeNull();
    expect($payment->method)->toBe('gcash');

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

test('guest can initiate sponsor feeding donation without payment method and defaults to gcash', function () {
    $response = $this->post(route('donate.store-sponsor'), [
        'fullName' => 'Default Sponsor',
        'email' => 'defaultsponsor@example.com',
        'mobile' => '09173334444',
        'date' => now()->addDays(7)->format('Y-m-d'),
        'occasion' => 'Graduation Celebration',
    ]);

    $donation = Donation::where('donor_email', 'defaultsponsor@example.com')->first();
    expect($donation)->not->toBeNull();
    expect($donation->amount)->toBe(3500);

    $payment = Payment::where('donation_id', $donation->id)->first();
    expect($payment)->not->toBeNull();
    expect($payment->method)->toBe('gcash');

    $sponsorship = FeedingSponsorship::where('donation_id', $donation->id)->first();
    expect($sponsorship)->not->toBeNull();
    expect($sponsorship->occasion)->toBe('Graduation Celebration');

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

test('guest can schedule in-kind donation with required mobile and without quantity', function () {
    $response = $this->post(route('donate.store-inkind'), [
        'description' => '10 bags of adult dog kibble',
        'drop_off_date' => now()->addDays(2)->format('Y-m-d'),
        'donor_name' => 'Alice Donor',
        'donor_email' => 'alice@example.com',
        'donor_mobile' => '09123456789',
        'anonymous' => false,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $donation = Donation::where('donor_email', 'alice@example.com')->first();
    expect($donation)->not->toBeNull();
    expect($donation->donor_name)->toBe('Alice Donor');
    expect($donation->donor_mobile)->toBe('09123456789');

    $inKind = $donation->inKindDonation;
    expect($inKind)->not->toBeNull();
    expect($inKind->contact_person)->toBe('Alice Donor'); // defaulted to donor_name

    $response->assertSessionHasNoErrors();
});

test('in-kind donation fails when mobile number is missing', function () {
    $response = $this->post(route('donate.store-inkind'), [
        'description' => '5 cans cat food',
        'drop_off_date' => now()->addDays(1)->format('Y-m-d'),
        'donor_email' => 'bob@example.com',
    ]);

    $response->assertSessionHasErrors(['donor_mobile']);
});

test('guest can schedule in-kind donation linked to an animal donation need', function () {
    $animal = ShelterAnimal::factory()->create([
        'name' => 'Charlie',
    ]);
    $need = AnimalDonationNeed::factory()->create([
        'shelter_animal_id' => $animal->id,
        'item' => '5kg Puppy Kibble',
        'quantity' => '2 bags',
        'priority' => 'Urgent',
        'status' => 'open',
    ]);

    $response = $this->post(route('donate.store-inkind'), [
        'animal_donation_need_id' => $need->id,
        'description' => 'Pledging 2 bags of 5kg Puppy Kibble for Charlie',
        'quantity' => '2 bags',
        'drop_off_date' => now()->addDays(3)->format('Y-m-d'),
        'donor_name' => 'Carol Pledger',
        'donor_email' => 'carol@example.com',
        'donor_mobile' => '09170001111',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $donation = Donation::where('donor_email', 'carol@example.com')->first();
    expect($donation)->not->toBeNull();
    expect($donation->inKindDonation)->not->toBeNull();
    expect($donation->inKindDonation->animal_donation_need_id)->toBe($need->id);
    expect($donation->inKindDonation->quantity)->toBe('2 bags');
});

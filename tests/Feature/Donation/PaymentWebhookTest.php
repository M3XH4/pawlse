<?php

use App\Enums\DonationStatus;
use App\Enums\PaymentStatus;
use App\Models\CareSustainability;
use App\Models\Donation;
use App\Models\Event;
use App\Models\FeedingSponsorship;
use App\Models\Payment;
use Illuminate\Support\Facades\Config;

test('webhook rejects request when signature secret is configured and signature is invalid or missing', function () {
    Config::set('services.payment.webhook_secret', 'secret_key_12345');
    Config::set('services.payment.gateway_driver', 'standard');

    $payload = [
        'event' => 'payment.paid',
        'data' => [
            'id' => 'pay_123',
            'attributes' => [
                'reference_number' => 'DON-NONEXISTENT',
                'status' => 'paid',
                'amount' => 100000,
            ],
        ],
    ];

    // Missing signature header
    $response = $this->postJson(route('webhooks.payment'), $payload);
    $response->assertStatus(401);

    // Invalid signature header
    $response = $this->postJson(route('webhooks.payment'), $payload, [
        'x-signature' => 'invalid_signature_hash',
    ]);
    $response->assertStatus(401);
});

test('webhook returns 404 when referenced donation cannot be found', function () {
    Config::set('services.payment.webhook_secret', 'test_secret');
    $secret = 'test_secret';

    $payload = [
        'event' => 'payment.paid',
        'data' => [
            'id' => 'pay_abc',
            'attributes' => [
                'reference_number' => 'DON-UNKNOWN-404',
                'status' => 'paid',
                'amount' => 50000,
            ],
        ],
    ];

    $rawContent = json_encode($payload);
    $signature = hash_hmac('sha256', $rawContent, $secret);

    $response = $this->call(
        'POST',
        route('webhooks.payment'),
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_SIGNATURE' => $signature,
        ],
        $rawContent
    );

    $response->assertStatus(404);
});

test('webhook processes valid payment, updates sustainability timer, and marks donation completed', function () {
    Config::set('services.payment.webhook_secret', 'webhook_secret_xyz');
    $secret = 'webhook_secret_xyz';

    $donation = Donation::create([
        'public_reference' => 'DON-WH-SUCCESS',
        'donor_name' => 'Automated Gateway Donor',
        'donor_email' => 'gateway@example.com',
        'anonymous' => false,
        'type' => 'cash',
        'amount' => 2500,
        'status' => DonationStatus::PendingPayment->value,
    ]);

    $payment = Payment::create([
        'donation_id' => $donation->id,
        'method' => 'gcash',
        'provider' => 'paymongo',
        'amount' => 2500,
        'payment_reference' => 'PAY-WH-001',
        'status' => PaymentStatus::Pending->value,
    ]);

    $initialSustainability = CareSustainability::current();
    $initialFunds = (float) $initialSustainability->verified_funds;

    $payload = [
        'event' => 'payment.paid',
        'data' => [
            'id' => 'pay_test_999',
            'attributes' => [
                'reference_number' => $donation->public_reference,
                'status' => 'paid',
                'amount' => 250000,
            ],
        ],
    ];

    $rawContent = json_encode($payload);
    $signature = hash_hmac('sha256', $rawContent, $secret);

    $response = $this->call(
        'POST',
        route('webhooks.payment'),
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_SIGNATURE' => $signature,
        ],
        $rawContent
    );

    $response->assertOk();
    $response->assertJson(['success' => true]);

    $donation->refresh();
    $payment->refresh();

    expect($donation->status)->toBe(DonationStatus::Completed->value);
    expect($payment->status)->toBe('paid');
    expect($payment->provider_transaction_id)->toBe('pay_test_999');

    $updatedSustainability = CareSustainability::current();
    expect((float) $updatedSustainability->verified_funds)->toBe($initialFunds + 2500);
});

test('webhook automatically schedules feeding event for feeding sponsorship donation', function () {
    Config::set('services.payment.webhook_secret', 'feeding_secret');
    $secret = 'feeding_secret';

    $donation = Donation::create([
        'public_reference' => 'DON-WH-FEEDING',
        'donor_name' => 'Sponsor Hero',
        'donor_email' => 'hero@example.com',
        'anonymous' => false,
        'type' => 'feeding_sponsorship',
        'amount' => 3500,
        'status' => DonationStatus::PendingPayment->value,
    ]);

    $sponsorship = FeedingSponsorship::create([
        'public_reference' => 'FS-WH-FEEDING',
        'donation_id' => $donation->id,
        'donor_name' => 'Sponsor Hero',
        'donor_email' => 'hero@example.com',
        'donor_mobile' => '09191234567',
        'preferred_date' => '2026-10-15',
        'occasion' => 'Shelter Anniversary',
        'amount' => 3500,
        'status' => 'pending',
    ]);

    $payload = [
        'event' => 'payment.paid',
        'data' => [
            'id' => 'pay_feeding_event',
            'attributes' => [
                'reference_number' => $donation->public_reference,
                'status' => 'paid',
                'amount' => 350000,
            ],
        ],
    ];

    $rawContent = json_encode($payload);
    $signature = hash_hmac('sha256', $rawContent, $secret);

    $response = $this->call(
        'POST',
        route('webhooks.payment'),
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_SIGNATURE' => $signature,
        ],
        $rawContent
    );

    $response->assertOk();

    $donation->refresh();
    $sponsorship->refresh();

    expect($donation->status)->toBe(DonationStatus::Completed->value);
    expect($sponsorship->status)->toBe('completed');

    $event = Event::where('title', 'like', '%Sponsor Hero%')->first();
    expect($event)->not->toBeNull();
    expect($event->category)->toBe('Feeding');
    expect($event->date->format('Y-m-d'))->toBe('2026-10-15');
});

test('webhook handles failed payment event by marking payment and donation failed', function () {
    Config::set('services.payment.webhook_secret', null); // Open in testing without secret

    $donation = Donation::create([
        'public_reference' => 'DON-WH-FAIL',
        'donor_name' => 'Failed Buyer',
        'donor_email' => 'fail@example.com',
        'anonymous' => false,
        'type' => 'cash',
        'amount' => 1000,
        'status' => DonationStatus::PendingPayment->value,
    ]);

    $payment = Payment::create([
        'donation_id' => $donation->id,
        'method' => 'gcash',
        'provider' => 'paymongo',
        'amount' => 1000,
        'payment_reference' => 'PAY-WH-FAIL',
        'status' => PaymentStatus::Pending->value,
    ]);

    $payload = [
        'event' => 'payment.failed',
        'data' => [
            'id' => 'pay_failed_123',
            'attributes' => [
                'reference_number' => $donation->public_reference,
                'status' => 'failed',
                'amount' => 100000,
            ],
        ],
    ];

    $response = $this->postJson(route('webhooks.payment'), $payload);

    $response->assertOk();
    $donation->refresh();
    $payment->refresh();

    expect($donation->status)->toBe(DonationStatus::Rejected->value);
    expect($payment->status)->toBe(PaymentStatus::Failed->value);
});

<?php

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Models\Donation;
use App\Models\DonationAmountEditRequest;
use App\Models\User;
use App\Services\Donations\ReceiptOcrService;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;

test('receipt ocr parser extracts gcash reference number and amount received', function () {
    $ocrService = new ReceiptOcrService;

    $rawText = 'EA..Y S. +63 917 118 6213 Sent via GCash Amount Total Amount Sent Ref No. 1047 560 227022 279g (gc02e) 250.00 P250.OO Nov 22, 2026 6:21 PM';
    $parsed = $ocrService->parseReceiptText($rawText);

    expect($parsed['reference_no'])->toBe('1047 560 227022');
    expect($parsed['amount_received'])->toBe(250.0);
});

test('checkout extract-proof endpoint returns extracted reference and amount', function () {
    $donation = Donation::factory()->create([
        'public_reference' => 'DON-OCR-TEST01',
        'amount' => 500,
        'type' => DonationType::Cash->value,
        'status' => DonationStatus::PendingPayment->value,
    ]);

    $this->mock(ReceiptOcrService::class, function ($mock) {
        $mock->shouldReceive('extractFromPath')
            ->once()
            ->andReturn([
                'reference_no' => '1047 560 227022',
                'amount_received' => 250.0,
                'raw_text' => 'Ref No. 1047 560 227022 P250.00',
            ]);
    });

    $file = UploadedFile::fake()->image('gcash-receipt.jpg', 400, 800);

    $response = $this->postJson(route('donate.checkout.extract-proof', $donation->public_reference), [
        'proof' => $file,
    ]);

    $response->assertOk()
        ->assertJson([
            'reference_no' => '1047 560 227022',
            'amount_received' => 250.0,
        ]);
});

test('admin can request amount edit and only super admin can confirm it', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();
    $superAdmin = User::factory()->superAdmin()->create();

    $donation = Donation::factory()->create([
        'public_reference' => 'DON-EDIT-0001',
        'amount' => 500,
        'type' => DonationType::Cash->value,
        'status' => DonationStatus::PaymentProofSubmitted->value,
    ]);

    // Admin submits amount edit request
    $this->actingAs($admin)
        ->post(route('account.admin.donation-monitoring.request-amount-edit', $donation), [
            'requested_amount' => 250,
            'reason' => 'Receipt shows ₱250.00 instead of pledged ₱500.00.',
        ])
        ->assertSessionHasNoErrors();

    $editRequest = DonationAmountEditRequest::where('donation_id', $donation->id)->first();
    expect($editRequest)->not->toBeNull();
    expect($editRequest->status)->toBe('pending');
    expect((float) $editRequest->original_amount)->toBe(500.0);
    expect((float) $editRequest->requested_amount)->toBe(250.0);

    // Donation amount must remain unchanged until Super Admin confirms
    expect((float) $donation->fresh()->amount)->toBe(500.0);

    // Regular admin cannot confirm the edit
    $this->actingAs($admin)
        ->post(route('account.admin.donation-monitoring.amount-edit.confirm', $editRequest))
        ->assertForbidden();

    expect((float) $donation->fresh()->amount)->toBe(500.0);

    // Super Admin confirms the edit
    $this->actingAs($superAdmin)
        ->post(route('account.super-admin.donation-monitoring.amount-edit.confirm', $editRequest))
        ->assertSessionHasNoErrors();

    expect($editRequest->fresh()->status)->toBe('approved');
    expect((float) $donation->fresh()->amount)->toBe(250.0);
});

test('super admin can reject an amount edit request without changing donation amount', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();
    $superAdmin = User::factory()->superAdmin()->create();

    $donation = Donation::factory()->create([
        'public_reference' => 'DON-EDIT-0002',
        'amount' => 1000,
        'type' => DonationType::Cash->value,
        'status' => DonationStatus::PaymentProofSubmitted->value,
    ]);

    $editRequest = DonationAmountEditRequest::create([
        'donation_id' => $donation->id,
        'requested_by' => $admin->id,
        'original_amount' => 1000,
        'requested_amount' => 500,
        'reason' => 'Testing rejection',
        'status' => 'pending',
    ]);

    $this->actingAs($superAdmin)
        ->post(route('account.super-admin.donation-monitoring.amount-edit.reject', $editRequest))
        ->assertSessionHasNoErrors();

    expect($editRequest->fresh()->status)->toBe('rejected');
    expect((float) $donation->fresh()->amount)->toBe(1000.0);
});

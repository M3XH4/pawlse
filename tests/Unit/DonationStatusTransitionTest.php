<?php

use App\Donations\DonationStatusTransition;
use App\Enums\DonationStatus;

test('valid donation status transitions succeed', function () {
    expect(DonationStatusTransition::canTransition(
        DonationStatus::PendingPayment,
        DonationStatus::PaymentProofSubmitted
    ))->toBeTrue();

    expect(DonationStatusTransition::canTransition(
        DonationStatus::PendingVerification,
        DonationStatus::Verified
    ))->toBeTrue();

    expect(DonationStatusTransition::canTransition(
        DonationStatus::Verified,
        DonationStatus::Completed
    ))->toBeTrue();
});

test('invalid donation status transitions fail', function () {
    expect(DonationStatusTransition::canTransition(
        DonationStatus::PendingPayment,
        DonationStatus::Completed
    ))->toBeFalse();

    expect(DonationStatusTransition::canTransition(
        DonationStatus::Completed,
        DonationStatus::PendingPayment
    ))->toBeFalse();
});

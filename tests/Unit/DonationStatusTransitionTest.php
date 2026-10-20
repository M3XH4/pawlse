<?php

use App\Enums\DonationStatus;
use App\Exceptions\InvalidDonationTransitionException;
use App\Services\Donations\DonationStatusTransition;

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

test('assertCanTransition throws InvalidDonationTransitionException with user friendly explanation', function () {
    try {
        DonationStatusTransition::assertCanTransition(
            DonationStatus::Completed,
            DonationStatus::PendingPayment
        );
        $this->fail('Expected InvalidDonationTransitionException was not thrown.');
    } catch (InvalidDonationTransitionException $exception) {
        expect($exception)->toBeInstanceOf(InvalidArgumentException::class);
        expect($exception->getUserFriendlyMessage())
            ->toContain('Completed')
            ->toContain('Pending Payment')
            ->toContain('Please refresh the page');
    }
});

<?php

namespace App\Donations;

use App\Enums\DonationStatus;
use InvalidArgumentException;

final class DonationStatusTransition
{
    /**
     * @var array<string, list<DonationStatus>>
     */
    private const ALLOWED = [
        DonationStatus::PendingPayment->value => [
            DonationStatus::PaymentProofSubmitted,
        ],
        DonationStatus::PaymentProofSubmitted->value => [
            DonationStatus::PendingVerification,
        ],
        DonationStatus::PendingVerification->value => [
            DonationStatus::Verified,
            DonationStatus::Rejected,
        ],
        DonationStatus::Verified->value => [
            DonationStatus::Completed,
        ],
        DonationStatus::Rejected->value => [
            DonationStatus::PaymentProofResubmitted,
        ],
        DonationStatus::PaymentProofResubmitted->value => [
            DonationStatus::PendingVerification,
        ],
        DonationStatus::Completed->value => [],
    ];

    public static function assertCanTransition(DonationStatus $from, DonationStatus $to): void
    {
        if (! self::canTransition($from, $to)) {
            throw new InvalidArgumentException("Cannot transition donation from {$from->value} to {$to->value}.");
        }
    }

    public static function canTransition(DonationStatus $from, DonationStatus $to): bool
    {
        return in_array($to, self::ALLOWED[$from->value] ?? [], true);
    }
}

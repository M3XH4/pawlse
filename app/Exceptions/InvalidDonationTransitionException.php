<?php

namespace App\Exceptions;

use App\Enums\DonationStatus;
use InvalidArgumentException;

class InvalidDonationTransitionException extends InvalidArgumentException
{
    public function __construct(
        string $message = '',
        public readonly ?DonationStatus $fromStatus = null,
        public readonly ?DonationStatus $toStatus = null,
    ) {
        parent::__construct($message);
    }

    public static function fromTransition(DonationStatus $from, DonationStatus $to): self
    {
        $fromLabel = self::statusLabel($from);
        $toLabel = self::statusLabel($to);

        return new self(
            message: "Cannot transition donation from {$from->value} to {$to->value}. This donation is currently {$fromLabel} and cannot be moved directly to {$toLabel}.",
            fromStatus: $from,
            toStatus: $to,
        );
    }

    public function getUserFriendlyMessage(): string
    {
        if ($this->fromStatus && $this->toStatus) {
            $fromLabel = self::statusLabel($this->fromStatus);
            $toLabel = self::statusLabel($this->toStatus);

            return "This donation status update could not be completed because a donation marked as '{$fromLabel}' cannot be changed directly to '{$toLabel}'. Please refresh the page to see the current status and follow the next verification step.";
        }

        return 'This donation status update could not be completed because the requested status change is not allowed from its current state. Please refresh the page and try again.';
    }

    private static function statusLabel(DonationStatus $status): string
    {
        return match ($status) {
            DonationStatus::PendingPayment => 'Pending Payment',
            DonationStatus::PaymentProofSubmitted => 'Payment Proof Submitted',
            DonationStatus::PendingVerification => 'Pending Verification',
            DonationStatus::Verified => 'Verified',
            DonationStatus::Rejected => 'Rejected',
            DonationStatus::PaymentProofResubmitted => 'Payment Proof Resubmitted',
            DonationStatus::Completed => 'Completed',
        };
    }
}

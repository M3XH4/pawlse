<?php

namespace App\Enums;

enum DonationStatus: string
{
    case PendingPayment = 'pending_payment';
    case PaymentProofSubmitted = 'payment_proof_submitted';
    case PendingVerification = 'pending_verification';
    case Verified = 'verified';
    case Completed = 'completed';
    case Rejected = 'rejected';
    case PaymentProofResubmitted = 'payment_proof_resubmitted';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return list<self>
     */
    public static function publiclyVisible(): array
    {
        return [self::Verified, self::Completed];
    }
}

<?php

namespace App\Enums;

enum AuditAction: string
{
    case DonationCreated = 'donation_created';
    case PaymentProofSubmitted = 'payment_proof_submitted';
    case PaymentVerified = 'payment_verified';
    case PaymentRejected = 'payment_rejected';
    case ResubmissionRequested = 'resubmission_requested';
    case DonationUpdated = 'donation_updated';
    case SponsorshipCreated = 'sponsorship_created';
    case InKindSubmitted = 'in_kind_submitted';
    case NotesAdded = 'notes_added';
    case WebhookProcessed = 'webhook_processed';
    case StatusChanged = 'status_changed';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

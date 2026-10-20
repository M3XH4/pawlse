<?php

namespace App\Notifications;

use App\Models\Donation;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DonationProofSubmittedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public ?Donation $donation = null) {}

    public function toMail(object $notifiable): MailMessage
    {
        $ref = $this->donation?->public_reference ?? 'PAWLSE-DONATION';
        $donor = $this->donation?->anonymous ? 'Anonymous' : ($this->donation?->donor_name ?: 'Supporter');
        $amount = $this->donation?->amount ? '₱'.number_format((float) $this->donation->amount, 2) : 'Submitted Proof';

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Reference', 'value' => $ref],
                ['label' => 'Donor', 'value' => $donor],
                ['label' => 'Amount', 'value' => $amount],
            ],
            actionText: 'Verify Payment Proof',
            level: 'primary',
            categoryBadge: 'PAYMENT PROOF UPLOADED',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $ref = $this->donation?->public_reference ?? 'PAWLSE';
        $donor = $this->donation?->anonymous ? 'Anonymous' : ($this->donation?->donor_name ?: 'A donor');

        return [
            'title' => 'Donation Proof Uploaded',
            'message' => "{$donor} uploaded payment proof for donation (Ref: {$ref}) awaiting verification.",
            'description' => "Payment proof uploaded for Ref: {$ref}.",
            'url' => route('account.admin.donation-monitoring'),
            'icon' => 'donation',
            'category' => 'donation',
            'donation_id' => $this->donation?->id,
        ];
    }
}

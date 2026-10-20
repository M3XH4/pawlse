<?php

namespace App\Notifications;

use App\Models\Donation;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DonationResubmissionRequestedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(
        public ?Donation $donation = null,
        public ?string $reason = null,
    ) {}

    public function toMail(object $notifiable): MailMessage
    {
        $ref = $this->donation?->public_reference ?? 'PAWLSE-REF';

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Reference Number', 'value' => $ref],
                ['label' => 'Action Required', 'value' => 'Re-upload clear payment receipt'],
            ],
            actionText: 'Re-submit Payment Proof',
            level: 'primary',
            categoryBadge: 'ACTION REQUIRED',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $ref = $this->donation?->public_reference ?? 'PAWLSE';

        return [
            'title' => 'Donation Proof Resubmission Requested',
            'message' => "Please re-upload a clearer payment receipt for donation Ref: {$ref}.".($this->reason ? " Note: {$this->reason}" : ''),
            'description' => "Proof resubmission requested for Ref: {$ref}.",
            'url' => $this->donation ? route('donate.checkout', $this->donation->public_reference) : route('donate'),
            'icon' => 'donation',
            'category' => 'donation',
            'donation_id' => $this->donation?->id,
        ];
    }
}

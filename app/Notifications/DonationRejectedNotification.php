<?php

namespace App\Notifications;

use App\Models\Donation;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DonationRejectedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public Donation $donation, public ?string $reason = null) {}

    public function toMail(object $notifiable): MailMessage
    {
        $summary = [
            ['label' => 'Reference Number', 'value' => (string) $this->donation->public_reference],
            ['label' => 'Status', 'value' => 'Verification Unsuccessful'],
        ];

        if ($this->reason) {
            $summary[] = ['label' => 'Reviewer Note', 'value' => $this->reason];
        }

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: $summary,
            actionText: 'Track Donation Status',
            level: 'error',
            categoryBadge: "DONATION UPDATE ({$this->donation->public_reference})",
            actionUrl: route('track', [
                'reference' => $this->donation->public_reference,
                'email' => $this->donation->donor_email,
            ]),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $url = $this->donation->user_id
            ? route('account.user.donations')
            : route('track', [
                'reference' => $this->donation->public_reference,
                'email' => $this->donation->donor_email,
            ]);

        return [
            'title' => "Donation Payment Unsuccessful ({$this->donation->public_reference})",
            'message' => "Payment for donation (Ref: {$this->donation->public_reference}) was unsuccessful.".($this->reason ? " Reason: {$this->reason}" : ''),
            'description' => "Unsuccessful donation payment (Ref: {$this->donation->public_reference}).",
            'url' => $url,
            'icon' => 'donation',
            'category' => 'donation',
            'donation_id' => $this->donation->id,
        ];
    }
}

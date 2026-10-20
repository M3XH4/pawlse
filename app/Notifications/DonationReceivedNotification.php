<?php

namespace App\Notifications;

use App\Models\Donation;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DonationReceivedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public Donation $donation) {}

    public function toMail(object $notifiable): MailMessage
    {
        $donor = $this->donation->anonymous ? 'Anonymous' : ($this->donation->donor_name ?: 'Donor');
        $type = ucfirst($this->donation->type instanceof \BackedEnum ? $this->donation->type->value : ($this->donation->type ?? 'donation'));
        $details = $this->donation->amount
            ? '₱'.number_format((float) $this->donation->amount, 2)
            : 'In-kind supplies';

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Reference', 'value' => (string) $this->donation->public_reference],
                ['label' => 'Donor', 'value' => $donor],
                ['label' => 'Contribution', 'value' => $details],
                ['label' => 'Type', 'value' => str_replace('_', ' ', $type)],
            ],
            actionText: 'Review in Donation Monitoring',
            level: 'primary',
            categoryBadge: 'NEW DONATION',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $donor = $this->donation->anonymous ? 'Anonymous' : ($this->donation->donor_name ?: 'Donor');
        $type = ucfirst($this->donation->type instanceof \BackedEnum ? $this->donation->type->value : ($this->donation->type ?? 'donation'));

        $details = $this->donation->amount
            ? '₱'.number_format((float) $this->donation->amount)
            : 'In-kind supplies';

        return [
            'title' => "{$type} Donation Received",
            'message' => "{$type} donation of {$details} received from {$donor} (Ref: {$this->donation->public_reference}).",
            'description' => "{$type} donation ({$details}) from {$donor}.",
            'url' => route('account.admin.donation-monitoring'),
            'icon' => 'donation',
            'category' => 'donation',
            'donation_id' => $this->donation->id,
        ];
    }
}

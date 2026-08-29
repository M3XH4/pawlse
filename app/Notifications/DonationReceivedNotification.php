<?php

namespace App\Notifications;

use App\Models\Donation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DonationReceivedNotification extends Notification
{
    use Queueable;

    public function __construct(public Donation $donation) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $donor = $this->donation->anonymous ? 'Anonymous' : ($this->donation->donor_name ?: 'Donor');
        $type = ucfirst($this->donation->type ?? 'donation');

        $details = $this->donation->amount
            ? '₱'.number_format($this->donation->amount)
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

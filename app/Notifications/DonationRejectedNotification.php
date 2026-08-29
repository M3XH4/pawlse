<?php

namespace App\Notifications;

use App\Models\Donation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DonationRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(public Donation $donation, public ?string $reason = null) {}

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
        return [
            'title' => 'Donation Payment Unsuccessful',
            'message' => "Payment for donation (Ref: {$this->donation->public_reference}) was unsuccessful.".($this->reason ? " Reason: {$this->reason}" : ''),
            'description' => "Unsuccessful donation payment (Ref: {$this->donation->public_reference}).",
            'url' => route('account.user.donations'),
            'icon' => 'donation',
            'category' => 'donation',
            'donation_id' => $this->donation->id,
        ];
    }
}

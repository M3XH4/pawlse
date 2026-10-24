<?php

namespace App\Notifications;

use App\Models\Donation;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DonationVerifiedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public Donation $donation) {}

    public function toMail(object $notifiable): MailMessage
    {
        return SubmissionEReceiptNotification::forDonation($this->donation, 'verified')
            ->toMail($notifiable);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $type = ucfirst($this->donation->type instanceof \BackedEnum ? $this->donation->type->value : ($this->donation->type ?? 'donation'));
        $details = $this->donation->amount
            ? '₱'.number_format((float) $this->donation->amount)
            : 'in-kind supplies';

        return [
            'title' => 'Donation Verified',
            'message' => "Your {$type} donation of {$details} (Ref: {$this->donation->public_reference}) has been verified.",
            'description' => "Verified {$type} donation (Ref: {$this->donation->public_reference}).",
            'url' => route('account.user.donations'),
            'icon' => 'donation',
            'category' => 'donation',
            'donation_id' => $this->donation->id,
        ];
    }
}

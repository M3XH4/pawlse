<?php

namespace App\Notifications;

use Carbon\CarbonInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyEmailOtpNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $otp,
        public CarbonInterface $expiresAt,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $timezone = config('app.timezone', 'UTC');
        $formattedExpiry = $this->expiresAt->timezone($timezone)->format('g:i A (T)');
        $recipientName = $notifiable->name ?? 'Valued Member';

        return (new MailMessage)
            ->subject('Your Pawlse Verification Code: '.$this->otp)
            ->greeting("Hello {$recipientName},")
            ->line('Welcome to **Pawlse** — the community platform connecting animal rescues, loving pet adoptions, and volunteer care.')
            ->line('To complete your account verification and ensure the security of your profile, please use the following 6-digit verification code:')
            ->line('## **'.$this->otp.'**')
            ->line('**Security & Verification Details:**')
            ->line("• **Validity:** This code will expire at **{$formattedExpiry}** (10-minute window).")
            ->line('• **Security Alert:** For your protection, never share this code with anyone. Pawlse staff will never ask for your one-time code.')
            ->line('• **Assistance:** If you did not create an account on Pawlse, no further action is required and you can safely ignore this message.')
            ->salutation("Warm regards,\nThe Pawlse Community & Security Team");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'expires_at' => $this->expiresAt->toISOString(),
        ];
    }
}

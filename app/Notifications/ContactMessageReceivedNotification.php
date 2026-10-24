<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContactMessageReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public ContactMessage $contactMessage,
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
        $categoryLabel = match ($this->contactMessage->category) {
            'adoption' => 'Adoption Inquiry',
            'volunteer' => 'Volunteer Question',
            'donation' => 'Donation & Sponsorship',
            'shelter_visit' => 'Shelter Visit Request',
            'partnership' => 'Partnership & Collaboration',
            'other' => 'Other Inquiry',
            default => 'General Inquiry',
        };

        return (new MailMessage)
            ->subject("[PAWLSE Contact] {$categoryLabel}: {$this->contactMessage->subject}")
            ->greeting('Hello PAWLSE Team,')
            ->line('You have received a new contact inquiry from the website.')
            ->line('**Sender Details:**')
            ->line("• **Name:** {$this->contactMessage->name}")
            ->line("• **Email:** {$this->contactMessage->email}")
            ->line('• **Phone:** '.($this->contactMessage->phone ?: 'Not provided'))
            ->line("• **Category:** {$categoryLabel}")
            ->line("• **Subject:** {$this->contactMessage->subject}")
            ->line('**Message:**')
            ->line($this->contactMessage->message)
            ->replyTo($this->contactMessage->email, $this->contactMessage->name)
            ->salutation("PAWLSE Notification System\nIligan Stray Feeders");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Contact Message',
            'message' => "{$this->contactMessage->name} sent a message: {$this->contactMessage->subject}",
            'contact_message_id' => $this->contactMessage->id,
            'email' => $this->contactMessage->email,
            'category' => $this->contactMessage->category,
        ];
    }
}

<?php

namespace App\Notifications;

use App\Models\Event;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventPendingApprovalNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public Event $event) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $creatorName = $this->event->creator?->name ?? 'An Administrator';

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Event Title', 'value' => (string) $this->event->title],
                ['label' => 'Category', 'value' => (string) $this->event->category],
                ['label' => 'Date & Time', 'value' => "{$this->event->date} {$this->event->time}"],
                ['label' => 'Location', 'value' => (string) $this->event->location],
                ['label' => 'Submitted By', 'value' => $creatorName],
            ],
            actionText: 'Review & Approve Event',
            actionUrl: route('account.super-admin.events', ['approval_status' => 'pending']),
            level: 'warning',
            categoryBadge: 'NEW EVENT PENDING APPROVAL',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $creatorName = $this->event->creator?->name ?? 'An administrator';
        $message = "New event '{$this->event->title}' submitted by {$creatorName} is awaiting Super Admin approval.";

        return [
            'title' => 'Event Awaiting Approval',
            'message' => $message,
            'description' => $message,
            'url' => route('account.super-admin.events', ['approval_status' => 'pending']),
            'icon' => 'calendar',
            'category' => 'event',
            'event_id' => $this->event->id,
            'approval_status' => 'pending',
        ];
    }
}

<?php

namespace App\Notifications;

use App\Models\Event;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventApprovalStatusUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(
        public Event $event,
        public string $status,
        public ?string $reason = null,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $isApproved = $this->status === 'approved';
        $statusLabel = $isApproved ? 'Approved & Published' : 'Rejected';

        $summaryItems = [
            ['label' => 'Event Title', 'value' => (string) $this->event->title],
            ['label' => 'Status', 'value' => $statusLabel],
        ];

        if (! $isApproved && $this->reason) {
            $summaryItems[] = ['label' => 'Reason', 'value' => (string) $this->reason];
        }

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: $summaryItems,
            actionText: 'View Events',
            actionUrl: route('account.admin.events'),
            level: $isApproved ? 'success' : 'danger',
            categoryBadge: $isApproved ? 'EVENT APPROVED' : 'EVENT REJECTED',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $isApproved = $this->status === 'approved';
        $title = $isApproved ? 'Community Event Approved' : 'Community Event Rejected';
        $message = $isApproved
            ? "Your event '{$this->event->title}' has been approved by Super Admin and is now open."
            : "Your event '{$this->event->title}' was rejected.".($this->reason ? " Reason: {$this->reason}" : '');

        return [
            'title' => $title,
            'message' => $message,
            'description' => $message,
            'url' => route('account.admin.events'),
            'icon' => 'calendar',
            'category' => 'event',
            'event_id' => $this->event->id,
            'approval_status' => $this->status,
            'reason' => $this->reason,
        ];
    }
}

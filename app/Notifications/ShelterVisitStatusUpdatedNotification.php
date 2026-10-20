<?php

namespace App\Notifications;

use App\Models\ShelterVisit;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ShelterVisitStatusUpdatedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public ShelterVisit $visit) {}

    public function toMail(object $notifiable): MailMessage
    {
        $date = $this->visit->confirmed_date ? $this->visit->confirmed_date->format('M d, Y') : $this->visit->preferred_date->format('M d, Y');
        $slot = $this->visit->confirmed_time_slot ?: ($this->visit->preferred_time_slot ?: 'Scheduled Slot');

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Visitor Name', 'value' => (string) $this->visit->full_name],
                ['label' => 'Scheduled Date', 'value' => $date],
                ['label' => 'Time Slot', 'value' => $slot],
                ['label' => 'Status', 'value' => strtoupper((string) $this->visit->status)],
            ],
            actionText: 'View Visit Details',
            level: $this->visit->status === 'confirmed' ? 'success' : ($this->visit->status === 'cancelled' ? 'error' : 'primary'),
            categoryBadge: 'SHELTER VISIT UPDATE',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $status = ucfirst($this->visit->status);
        $date = $this->visit->confirmed_date ? $this->visit->confirmed_date->format('M d, Y') : $this->visit->preferred_date->format('M d, Y');
        $slot = $this->visit->confirmed_time_slot ?: ($this->visit->preferred_time_slot ?: 'Scheduled Slot');

        $message = match ($this->visit->status) {
            'confirmed' => "Your shelter visit has been confirmed for {$date} during {$slot}.",
            'completed' => "Thank you for visiting the shelter on {$date}! We hope you had a meaningful experience.",
            'cancelled' => "Your shelter visit for {$date} has been cancelled.".($this->visit->admin_notes ? " Reason: {$this->visit->admin_notes}" : ''),
            default => "Your shelter visit request status has been updated to {$status}.",
        };

        return [
            'title' => "Shelter Visit {$status}",
            'message' => $message,
            'description' => $message,
            'url' => route('account.user.notifications'),
            'icon' => 'calendar',
            'category' => 'visit',
            'visit_id' => $this->visit->id,
            'status' => $this->visit->status,
        ];
    }
}

<?php

namespace App\Notifications;

use App\Models\ShelterVisit;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ShelterVisitStatusUpdatedNotification extends Notification
{
    use Queueable;

    public function __construct(public ShelterVisit $visit) {}

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

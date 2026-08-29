<?php

namespace App\Notifications;

use App\Models\PetReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class RescueTaskAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(public PetReport $report) {}

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
        $type = ucfirst($this->report->type ?? 'rescue');

        return [
            'title' => "Rescue Mission Assigned: {$type}",
            'message' => "You have been assigned to respond to a {$this->report->animal_type} report at {$this->report->location}.",
            'description' => "Rescue assignment at {$this->report->location}.",
            'url' => route('account.volunteer.rescue-reports'),
            'icon' => 'task',
            'category' => 'rescue',
            'report_id' => $this->report->id,
        ];
    }
}

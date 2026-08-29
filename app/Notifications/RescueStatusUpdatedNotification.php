<?php

namespace App\Notifications;

use App\Models\PetReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class RescueStatusUpdatedNotification extends Notification
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
        $status = ucfirst($this->report->status ?? 'updated');
        $type = ucfirst($this->report->type ?? 'rescue');

        $url = $this->report->type === 'missing'
            ? route('account.user.missing-found')
            : route('account.user.rescue-reports');

        return [
            'title' => "{$type} Report Status: {$status}",
            'message' => "Your report for the {$this->report->animal_type} at {$this->report->location} is now marked as {$status}.",
            'description' => "Report at {$this->report->location} is now {$status}.",
            'url' => $url,
            'icon' => 'rescue',
            'category' => 'rescue',
            'report_id' => $this->report->id,
            'status' => $this->report->status,
        ];
    }
}

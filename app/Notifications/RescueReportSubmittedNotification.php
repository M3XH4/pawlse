<?php

namespace App\Notifications;

use App\Models\PetReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class RescueReportSubmittedNotification extends Notification
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
        $isSos = ($this->report->type === 'sos');

        $title = $isSos ? 'SOS Emergency Report Filed' : "{$type} Report Filed";
        $message = "New {$this->report->animal_type} {$this->report->type} report filed at {$this->report->location}.";

        return [
            'title' => $title,
            'message' => $message,
            'description' => $message,
            'url' => route('account.admin.rescue-management'),
            'icon' => 'rescue',
            'category' => 'rescue',
            'report_id' => $this->report->id,
            'type' => $this->report->type,
        ];
    }
}

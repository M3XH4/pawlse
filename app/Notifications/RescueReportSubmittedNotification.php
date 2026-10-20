<?php

namespace App\Notifications;

use App\Models\PetReport;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RescueReportSubmittedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public PetReport $report) {}

    public function toMail(object $notifiable): MailMessage
    {
        $isSos = ($this->report->type === 'sos');

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Report Type', 'value' => strtoupper((string) ($this->report->type ?? 'rescue'))],
                ['label' => 'Animal', 'value' => (string) $this->report->animal_type],
                ['label' => 'Location', 'value' => (string) $this->report->location],
                ['label' => 'Reporter', 'value' => (string) ($this->report->contact_name ?: 'Community Reporter')],
            ],
            actionText: 'Open Rescue Management',
            level: $isSos ? 'error' : 'primary',
            categoryBadge: $isSos ? 'SOS EMERGENCY REPORT' : 'RESCUE / MISSING REPORT',
        );
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

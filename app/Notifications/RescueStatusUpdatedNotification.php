<?php

namespace App\Notifications;

use App\Models\PetReport;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RescueStatusUpdatedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public PetReport $report) {}

    public function toMail(object $notifiable): MailMessage
    {
        $status = strtoupper((string) ($this->report->status ?? 'updated'));

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Animal', 'value' => (string) $this->report->animal_type],
                ['label' => 'Location', 'value' => (string) $this->report->location],
                ['label' => 'Updated Status', 'value' => $status],
            ],
            actionText: 'Track My Report',
            level: in_array(strtolower($status), ['resolved', 'rescued', 'found'], true) ? 'success' : 'primary',
            categoryBadge: 'RESCUE STATUS UPDATE',
        );
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

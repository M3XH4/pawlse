<?php

namespace App\Notifications;

use App\Models\PetReport;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RescueTaskAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public PetReport $report) {}

    public function toMail(object $notifiable): MailMessage
    {
        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Mission Type', 'value' => strtoupper((string) ($this->report->type ?? 'rescue'))],
                ['label' => 'Animal', 'value' => (string) $this->report->animal_type],
                ['label' => 'Location', 'value' => (string) $this->report->location],
            ],
            actionText: 'Open Rescue Mission',
            level: 'primary',
            categoryBadge: 'RESCUE DISPATCH',
        );
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

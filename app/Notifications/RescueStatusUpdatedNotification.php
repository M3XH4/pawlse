<?php

namespace App\Notifications;

use App\Models\PetReport;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RescueStatusUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public PetReport $report) {}

    public function toMail(object $notifiable): MailMessage
    {
        $status = strtoupper((string) ($this->report->status ?? 'updated'));
        $isMissing = $this->report->type === 'missing';
        $prefix = match ($this->report->type) {
            'missing' => 'MIS',
            'sos' => 'SOS',
            default => 'RES',
        };
        $ref = $prefix.'-'.str_pad((string) $this->report->id, 5, '0', STR_PAD_LEFT);
        $actionUrl = route('track', ['reference' => $ref, 'email' => $this->report->contact_email]);

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Reference Number', 'value' => $ref],
                ['label' => $isMissing ? 'Pet Name' : 'Animal', 'value' => (string) ($this->report->name ?: $this->report->animal_type)],
                ['label' => 'Location', 'value' => (string) $this->report->location],
                ['label' => 'Updated Status', 'value' => $status],
            ],
            actionText: $isMissing ? 'Track My Missing Pet' : 'Track My Report',
            actionUrl: $actionUrl,
            level: in_array(strtolower($status), ['resolved', 'rescued', 'found'], true) ? 'success' : 'primary',
            categoryBadge: $isMissing ? 'MISSING PET STATUS UPDATE' : 'RESCUE STATUS UPDATE',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $status = ucfirst($this->report->status ?? 'updated');
        $type = ucfirst($this->report->type ?? 'rescue');
        $prefix = match ($this->report->type) {
            'missing' => 'MIS',
            'sos' => 'SOS',
            default => 'RES',
        };
        $ref = $prefix.'-'.str_pad((string) $this->report->id, 5, '0', STR_PAD_LEFT);

        $url = $this->report->user_id
            ? ($this->report->type === 'missing' ? route('account.user.missing-found') : route('account.user.rescue-reports'))
            : route('track', ['reference' => $ref, 'email' => $this->report->contact_email]);

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

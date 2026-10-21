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
        $ref = 'VIS-'.str_pad((string) $this->visit->id, 5, '0', STR_PAD_LEFT);
        $date = $this->visit->confirmed_date ? $this->visit->confirmed_date->format('M d, Y') : $this->visit->preferred_date->format('M d, Y');
        $slot = $this->visit->confirmed_time_slot ?: ($this->visit->preferred_time_slot ?: 'Scheduled Slot');

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Visit Reference', 'value' => $ref],
                ['label' => 'Visitor Name', 'value' => (string) $this->visit->full_name],
                ['label' => 'Scheduled Date', 'value' => $date],
                ['label' => 'Time Slot', 'value' => $slot],
                ['label' => 'Status', 'value' => strtoupper((string) $this->visit->status)],
            ],
            actionText: 'Track Shelter Visit Status',
            level: $this->visit->status === 'confirmed' ? 'success' : ($this->visit->status === 'cancelled' ? 'error' : 'primary'),
            categoryBadge: "SHELTER VISIT ({$ref})",
            actionUrl: route('track', [
                'reference' => $ref,
                'email' => $this->visit->email,
            ]),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $ref = 'VIS-'.str_pad((string) $this->visit->id, 5, '0', STR_PAD_LEFT);
        $status = ucfirst($this->visit->status);
        $date = $this->visit->confirmed_date ? $this->visit->confirmed_date->format('M d, Y') : $this->visit->preferred_date->format('M d, Y');
        $slot = $this->visit->confirmed_time_slot ?: ($this->visit->preferred_time_slot ?: 'Scheduled Slot');

        $message = match ($this->visit->status) {
            'confirmed' => "Your shelter visit (Ref: {$ref}) has been confirmed for {$date} during {$slot}.",
            'completed' => "Thank you for visiting the shelter (Ref: {$ref}) on {$date}! We hope you had a meaningful experience.",
            'cancelled' => "Your shelter visit (Ref: {$ref}) for {$date} has been cancelled.".($this->visit->admin_notes ? " Reason: {$this->visit->admin_notes}" : ''),
            default => "Your shelter visit request (Ref: {$ref}) status has been updated to {$status}.",
        };

        $url = $this->visit->user_id
            ? route('account.user.shelter-visits')
            : route('track', [
                'reference' => $ref,
                'email' => $this->visit->email,
            ]);

        return [
            'title' => "Shelter Visit {$status} ({$ref})",
            'message' => $message,
            'description' => $message,
            'url' => $url,
            'icon' => 'event',
            'category' => 'visit',
            'visit_id' => $this->visit->id,
            'status' => $this->visit->status,
        ];
    }
}

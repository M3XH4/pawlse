<?php

namespace App\Notifications;

use App\Models\VolunteerApplication;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VolunteerApplicationSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public VolunteerApplication $application) {}

    public function toMail(object $notifiable): MailMessage
    {
        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Reference', 'value' => (string) ($this->application->reference_number ?: 'VOL-'.$this->application->id)],
                ['label' => 'Applicant', 'value' => (string) $this->application->full_name],
                ['label' => 'Role', 'value' => (string) $this->application->role],
            ],
            actionText: 'Review Volunteer Application',
            level: 'primary',
            categoryBadge: 'NEW VOLUNTEER APPLICANT',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Volunteer Application Submitted',
            'message' => "Volunteer application submitted by {$this->application->full_name} for role {$this->application->role}.",
            'description' => "Volunteer application from {$this->application->full_name}.",
            'url' => route('account.admin.volunteer-management'),
            'icon' => 'volunteer',
            'category' => 'volunteer',
            'application_id' => $this->application->id,
        ];
    }
}

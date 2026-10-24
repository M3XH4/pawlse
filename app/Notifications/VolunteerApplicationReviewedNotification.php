<?php

namespace App\Notifications;

use App\Models\VolunteerApplication;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VolunteerApplicationReviewedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public VolunteerApplication $application) {}

    public function toMail(object $notifiable): MailMessage
    {
        $approved = ($this->application->status === 'approved');
        $summary = [
            ['label' => 'Reference', 'value' => (string) ($this->application->reference_number ?: 'VOL-'.$this->application->id)],
            ['label' => 'Volunteer Role', 'value' => (string) $this->application->role],
            ['label' => 'Status', 'value' => $approved ? 'APPROVED' : 'NOT APPROVED'],
        ];

        if ($this->application->rejection_reason) {
            $summary[] = ['label' => 'Coordinator Note', 'value' => $this->application->rejection_reason];
        }

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: $summary,
            actionText: $approved ? 'Open Volunteer Dashboard' : 'View Application Status',
            level: $approved ? 'success' : 'error',
            categoryBadge: 'VOLUNTEER APPLICATION',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $approved = ($this->application->status === 'approved');

        $title = $approved
            ? 'Volunteer Application Approved'
            : 'Volunteer Application Rejected';

        $message = $approved
            ? 'Your volunteer application has been approved. You may now access your volunteer dashboard.'
            : 'Your volunteer application was not approved.'.($this->application->rejection_reason ? " Reason: {$this->application->rejection_reason}" : '');

        $url = $approved
            ? route('account.volunteer.index')
            : route('account.user.volunteer-status');

        return [
            'title' => $title,
            'message' => $message,
            'description' => $message,
            'url' => $url,
            'icon' => 'volunteer',
            'category' => 'volunteer',
            'application_id' => $this->application->id,
            'status' => $this->application->status,
        ];
    }
}

<?php

namespace App\Notifications;

use App\Models\VolunteerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class VolunteerApplicationReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(public VolunteerApplication $application) {}

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

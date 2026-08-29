<?php

namespace App\Notifications;

use App\Models\VolunteerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class VolunteerApplicationSubmittedNotification extends Notification
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

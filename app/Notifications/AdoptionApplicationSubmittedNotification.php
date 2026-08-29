<?php

namespace App\Notifications;

use App\Models\AdoptionApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AdoptionApplicationSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(public AdoptionApplication $application) {}

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
        $petName = $this->application->shelterAnimal?->name ?? 'Shelter Pet';

        return [
            'title' => 'Adoption Application Submitted',
            'message' => "Adoption application submitted for {$petName} by {$this->application->full_name}.",
            'description' => "Application for {$petName} submitted by {$this->application->full_name}.",
            'url' => route('account.admin.adoption-management'),
            'icon' => 'adoption',
            'category' => 'adoption',
            'application_id' => $this->application->id,
        ];
    }
}

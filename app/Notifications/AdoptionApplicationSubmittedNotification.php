<?php

namespace App\Notifications;

use App\Models\AdoptionApplication;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdoptionApplicationSubmittedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public AdoptionApplication $application) {}

    public function toMail(object $notifiable): MailMessage
    {
        $petName = $this->application->shelterAnimal?->name ?? 'Shelter Pet';

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Applicant', 'value' => (string) $this->application->full_name],
                ['label' => 'Pet Applied For', 'value' => $petName],
                ['label' => 'Contact Email', 'value' => (string) $this->application->email],
            ],
            actionText: 'Review Adoption Application',
            level: 'primary',
            categoryBadge: 'NEW ADOPTION APPLICATION',
        );
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

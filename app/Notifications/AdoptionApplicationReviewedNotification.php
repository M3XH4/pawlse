<?php

namespace App\Notifications;

use App\Models\AdoptionApplication;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdoptionApplicationReviewedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public ?AdoptionApplication $application = null) {}

    public function toMail(object $notifiable): MailMessage
    {
        $petName = $this->application?->shelterAnimal?->name ?? 'Shelter Pet';
        $status = $this->application?->status?->value ?? 'reviewed';

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Pet Applied For', 'value' => $petName],
                ['label' => 'Review Status', 'value' => strtoupper($status)],
            ],
            actionText: 'View My Application Status',
            level: $status === 'approved' ? 'success' : ($status === 'rejected' ? 'error' : 'primary'),
            categoryBadge: 'ADOPTION REVIEW',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $petName = $this->application?->shelterAnimal?->name ?? 'selected pet';
        $status = $this->application?->status?->value ?? 'reviewed';

        return [
            'title' => 'Adoption Application Reviewed',
            'message' => "Your adoption application for {$petName} has been {$status}.",
            'description' => "Adoption application for {$petName} is {$status}.",
            'url' => route('account.user.adoption-applications'),
            'icon' => 'adoption',
            'category' => 'adoption',
            'application_id' => $this->application?->id,
        ];
    }
}

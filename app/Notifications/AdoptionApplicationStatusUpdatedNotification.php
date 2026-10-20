<?php

namespace App\Notifications;

use App\Models\AdoptionApplication;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdoptionApplicationStatusUpdatedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public AdoptionApplication $application) {}

    public function toMail(object $notifiable): MailMessage
    {
        $petName = $this->application->shelterAnimal?->name ?? 'selected pet';
        $status = $this->application->status?->value ?? 'updated';
        $level = match ($status) {
            'approved' => 'success',
            'rejected' => 'error',
            default => 'primary',
        };

        $summary = [
            ['label' => 'Pet Applied For', 'value' => $petName],
            ['label' => 'Application Status', 'value' => strtoupper($status)],
        ];

        if ($this->application->rejection_reason) {
            $summary[] = ['label' => 'Coordinator Note', 'value' => $this->application->rejection_reason];
        }

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: $summary,
            actionText: 'View My Adoption Application',
            level: $level,
            categoryBadge: 'ADOPTION UPDATE',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $petName = $this->application->shelterAnimal?->name ?? 'selected pet';
        $status = $this->application->status?->value ?? 'updated';

        $title = match ($status) {
            'approved' => 'Adoption Application Approved',
            'rejected' => 'Adoption Application Rejected',
            'scheduled' => 'Adoption Interview Scheduled',
            default => 'Adoption Application Status Updated',
        };

        $message = match ($status) {
            'approved' => "Your adoption application for {$petName} has been approved.",
            'rejected' => "Your adoption application for {$petName} was not approved.".($this->application->rejection_reason ? " Reason: {$this->application->rejection_reason}" : ''),
            'scheduled' => "Your adoption interview for {$petName} has been scheduled.",
            default => "The status of your adoption application for {$petName} is {$status}.",
        };

        return [
            'title' => $title,
            'message' => $message,
            'description' => $message,
            'url' => route('account.user.adoption-applications'),
            'icon' => 'adoption',
            'category' => 'adoption',
            'application_id' => $this->application->id,
            'status' => $status,
        ];
    }
}

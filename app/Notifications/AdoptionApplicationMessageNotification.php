<?php

namespace App\Notifications;

use App\Models\AdoptionApplication;
use App\Models\AdoptionApplicationMessage;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdoptionApplicationMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(
        public AdoptionApplication $application,
        public AdoptionApplicationMessage $applicationMessage,
        public bool $forAdmin = false,
    ) {}

    public function toMail(object $notifiable): MailMessage
    {
        $petName = $this->application->shelterAnimal?->name ?? 'selected pet';
        $ref = 'ADP-'.str_pad((string) $this->application->id, 5, '0', STR_PAD_LEFT);
        $attachmentCount = count($this->applicationMessage->attachments ?? []);

        $summary = [
            ['label' => 'Reference Number', 'value' => $ref],
            ['label' => 'Pet Applied For', 'value' => $petName],
            ['label' => 'From', 'value' => $this->applicationMessage->sender_name],
        ];

        if ($this->applicationMessage->message) {
            $summary[] = ['label' => 'Message', 'value' => $this->applicationMessage->message];
        }

        if ($attachmentCount > 0) {
            $summary[] = ['label' => 'Attachments', 'value' => "{$attachmentCount} file(s) attached"];
        }

        $actionUrl = $this->forAdmin
            ? route('account.admin.adoption-management')
            : route('track', [
                'reference' => $ref,
                'email' => $this->application->email,
            ]);

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: $summary,
            actionText: $this->forAdmin ? 'Open Adoption Management' : 'Reply on Tracking Page',
            level: 'primary',
            categoryBadge: "ADOPTION MESSAGE ({$ref})",
            actionUrl: $actionUrl,
            recipientNameOverride: $this->forAdmin ? null : $this->application->full_name,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $petName = $this->application->shelterAnimal?->name ?? 'selected pet';
        $ref = 'ADP-'.str_pad((string) $this->application->id, 5, '0', STR_PAD_LEFT);

        if ($this->forAdmin) {
            $title = "Applicant Replied ({$ref})";
            $message = "{$this->application->full_name} replied on adoption application {$ref} for {$petName}.";
            $url = route('account.admin.adoption-management');
        } else {
            $title = "New Message on Application ({$ref})";
            $message = $this->applicationMessage->message
                ? "Coordinator message on {$ref}: {$this->applicationMessage->message}"
                : "Our adoption coordinator sent an update on {$ref} for {$petName}.";
            $url = route('track', [
                'reference' => $ref,
                'email' => $this->application->email,
            ]);
        }

        return [
            'title' => $title,
            'message' => $message,
            'description' => $message,
            'url' => $url,
            'icon' => 'adoption',
            'category' => 'adoption',
            'application_id' => $this->application->id,
        ];
    }
}

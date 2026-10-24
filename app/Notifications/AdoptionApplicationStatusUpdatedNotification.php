<?php

namespace App\Notifications;

use App\Models\AdoptionApplication;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdoptionApplicationStatusUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public AdoptionApplication $application) {}

    public function toMail(object $notifiable): MailMessage
    {
        $petName = $this->application->shelterAnimal?->name ?? 'selected pet';
        $status = $this->application->status?->value ?? 'updated';
        $ref = 'ADP-'.str_pad((string) $this->application->id, 5, '0', STR_PAD_LEFT);
        $level = match ($status) {
            'approved' => 'success',
            'rejected' => 'error',
            default => 'primary',
        };

        $summary = [
            ['label' => 'Reference Number', 'value' => $ref],
            ['label' => 'Pet Applied For', 'value' => $petName],
            ['label' => 'Application Status', 'value' => strtoupper($status)],
        ];

        if ($this->application->rejection_reason) {
            $summary[] = ['label' => 'Coordinator Note', 'value' => $this->application->rejection_reason];
        }

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: $summary,
            actionText: 'Track Application Status',
            level: $level,
            categoryBadge: "ADOPTION UPDATE ({$ref})",
            actionUrl: route('track', [
                'reference' => $ref,
                'email' => $this->application->email,
            ]),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $petName = $this->application->shelterAnimal?->name ?? 'selected pet';
        $status = $this->application->status?->value ?? 'updated';
        $ref = 'ADP-'.str_pad((string) $this->application->id, 5, '0', STR_PAD_LEFT);

        $title = match ($status) {
            'approved' => "Adoption Application Approved ({$ref})",
            'rejected' => "Adoption Application Rejected ({$ref})",
            'scheduled' => "Adoption Interview Scheduled ({$ref})",
            default => "Adoption Application Update ({$ref})",
        };

        $message = match ($status) {
            'approved' => "Your adoption application for {$petName} (Ref: {$ref}) has been approved.",
            'rejected' => "Your adoption application for {$petName} (Ref: {$ref}) was not approved.".($this->application->rejection_reason ? " Reason: {$this->application->rejection_reason}" : ''),
            'scheduled' => "Your adoption interview for {$petName} (Ref: {$ref}) has been scheduled.",
            default => "The status of your adoption application for {$petName} (Ref: {$ref}) is {$status}.",
        };

        $url = $this->application->user_id
            ? route('account.user.adoption-applications')
            : route('track', [
                'reference' => $ref,
                'email' => $this->application->email,
            ]);

        return [
            'title' => $title,
            'message' => $message,
            'description' => $message,
            'url' => $url,
            'icon' => 'adoption',
            'category' => 'adoption',
            'application_id' => $this->application->id,
            'status' => $status,
        ];
    }
}

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

        $statusDisplay = match ($status) {
            'needs_info' => 'ADDITIONAL INFO NEEDED',
            'cancelled' => 'CANCELLED BY APPLICANT',
            default => strtoupper($status),
        };

        $summary = [
            ['label' => 'Reference Number', 'value' => $ref],
            ['label' => 'Pet Applied For', 'value' => $petName],
            ['label' => 'Application Status', 'value' => $statusDisplay],
        ];

        if ($status === 'rejected' && $this->application->rejection_reason) {
            $summary[] = ['label' => 'Rejection Reason', 'value' => $this->application->rejection_reason];
        } elseif ($status === 'needs_info' && $this->application->notes) {
            $summary[] = ['label' => 'Coordinator Request', 'value' => $this->application->notes];
        } elseif ($this->application->rejection_reason) {
            $summary[] = ['label' => 'Coordinator Note', 'value' => $this->application->rejection_reason];
        }

        $actionText = $status === 'needs_info'
            ? 'Reply & Upload Requirements'
            : 'Track Application Status';

        $actionUrl = $this->application->user_id !== null
            ? route('account.user.adoption-applications', ['open' => $this->application->id])
            : route('track', [
                'reference' => $ref,
                'email' => $this->application->email,
            ]);

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: $summary,
            actionText: $actionText,
            level: $level,
            categoryBadge: "ADOPTION UPDATE ({$ref})",
            actionUrl: $actionUrl,
            recipientNameOverride: $this->application->full_name,
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
            'needs_info' => "Additional Details Needed ({$ref})",
            'cancelled' => "Adoption Application Cancelled ({$ref})",
            default => "Adoption Application Update ({$ref})",
        };

        $message = match ($status) {
            'approved' => "Your adoption application for {$petName} (Ref: {$ref}) has been approved.",
            'rejected' => "Your adoption application for {$petName} (Ref: {$ref}) was not approved.".($this->application->rejection_reason ? " Reason: {$this->application->rejection_reason}" : ''),
            'scheduled' => "Your adoption interview for {$petName} (Ref: {$ref}) has been scheduled.",
            'needs_info' => "Our adoption coordinator requested additional information or requirement photos for {$petName} (Ref: {$ref}).".($this->application->notes ? " Note: {$this->application->notes}" : ''),
            'cancelled' => "Your adoption application for {$petName} (Ref: {$ref}) has been cancelled.",
            default => "The status of your adoption application for {$petName} (Ref: {$ref}) is {$status}.",
        };

        $url = $this->application->user_id !== null
            ? route('account.user.adoption-applications', ['open' => $this->application->id])
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

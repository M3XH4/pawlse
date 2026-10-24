<?php

namespace App\Notifications;

use App\Models\FosterCareUpdate;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FosterCareUpdateAcknowledgedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public FosterCareUpdate $update) {}

    public function toMail(object $notifiable): MailMessage
    {
        $petName = $this->update->shelterAnimal?->name ?? 'Foster Pet';

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Foster Pet', 'value' => $petName],
                ['label' => 'Report Title', 'value' => (string) $this->update->title],
            ],
            actionText: 'View Foster Care Portal',
            level: 'success',
            categoryBadge: 'CARE REPORT ACKNOWLEDGED',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $petName = $this->update->shelterAnimal?->name ?? 'Foster Pet';
        $adminNotes = $this->update->admin_notes ? ": \"{$this->update->admin_notes}\"" : '.';

        return [
            'title' => "Care Report Reviewed: {$petName}",
            'message' => "An administrator has reviewed your update for {$petName}{$adminNotes}",
            'description' => "Care report for {$petName} has been reviewed by the shelter team.",
            'url' => route('account.volunteer.foster-care'),
            'icon' => 'task',
            'category' => 'foster',
            'update_id' => $this->update->id,
            'animal_id' => $this->update->shelter_animal_id,
        ];
    }
}

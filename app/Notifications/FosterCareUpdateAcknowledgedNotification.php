<?php

namespace App\Notifications;

use App\Models\FosterCareUpdate;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FosterCareUpdateAcknowledgedNotification extends Notification
{
    use Queueable;

    public function __construct(public FosterCareUpdate $update) {}

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

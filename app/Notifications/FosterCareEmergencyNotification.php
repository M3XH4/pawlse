<?php

namespace App\Notifications;

use App\Models\FosterCareUpdate;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FosterCareEmergencyNotification extends Notification
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
        $parentName = $this->update->user?->name ?? 'Foster Parent';

        return [
            'title' => "Foster Care Alert: {$petName} ({$this->update->urgency})",
            'message' => "{$parentName} submitted an urgent update: '{$this->update->title}'. Immediate coordinator review recommended.",
            'description' => "Foster alert for {$petName}: {$this->update->title}",
            'url' => route('account.admin.foster-management'),
            'icon' => 'rescue',
            'category' => 'foster_alert',
            'update_id' => $this->update->id,
            'animal_id' => $this->update->shelter_animal_id,
        ];
    }
}

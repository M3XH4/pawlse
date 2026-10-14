<?php

namespace App\Notifications;

use App\Models\FosterPlacement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FosterPlacementAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(public FosterPlacement $placement) {}

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
        $petName = $this->placement->shelterAnimal?->name ?? 'a shelter pet';

        return [
            'title' => 'Foster Pet Assigned',
            'message' => "You have been assigned to foster {$petName}. Please review care instructions and follow-up dates.",
            'description' => "Assigned to foster {$petName}.",
            'url' => route('account.volunteer.foster-care'),
            'icon' => 'adoption',
            'category' => 'foster',
            'placement_id' => $this->placement->id,
            'animal_id' => $this->placement->shelter_animal_id,
        ];
    }
}

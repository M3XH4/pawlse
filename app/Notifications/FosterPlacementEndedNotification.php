<?php

namespace App\Notifications;

use App\Models\FosterPlacement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FosterPlacementEndedNotification extends Notification
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
            'title' => 'Foster Placement Concluded',
            'message' => "The foster care placement for {$petName} has ended. Reason: {$this->placement->end_reason}",
            'description' => "Foster placement for {$petName} concluded.",
            'url' => route('account.volunteer.foster-care'),
            'icon' => 'certificate',
            'category' => 'foster',
            'placement_id' => $this->placement->id,
            'animal_id' => $this->placement->shelter_animal_id,
        ];
    }
}

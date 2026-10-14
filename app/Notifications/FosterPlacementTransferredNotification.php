<?php

namespace App\Notifications;

use App\Models\FosterPlacement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FosterPlacementTransferredNotification extends Notification
{
    use Queueable;

    public function __construct(
        public FosterPlacement $placement,
        public string $type = 'incoming' // 'incoming' or 'outgoing'
    ) {}

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

        if ($this->type === 'outgoing') {
            return [
                'title' => 'Foster Pet Placement Transferred',
                'message' => "Care of {$petName} has been transferred to another approved foster home. Reason: {$this->placement->transfer_reason}",
                'description' => "Care of {$petName} has been transferred.",
                'url' => route('account.volunteer.foster-care'),
                'icon' => 'task',
                'category' => 'foster',
                'placement_id' => $this->placement->id,
                'animal_id' => $this->placement->shelter_animal_id,
            ];
        }

        return [
            'title' => 'Incoming Foster Pet Transferred to You',
            'message' => "You have received {$petName} via foster transfer. Reason: {$this->placement->transfer_reason}",
            'description' => "Received {$petName} via foster transfer.",
            'url' => route('account.volunteer.foster-care'),
            'icon' => 'adoption',
            'category' => 'foster',
            'placement_id' => $this->placement->id,
            'animal_id' => $this->placement->shelter_animal_id,
        ];
    }
}

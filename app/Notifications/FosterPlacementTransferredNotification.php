<?php

namespace App\Notifications;

use App\Models\FosterPlacement;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FosterPlacementTransferredNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(
        public FosterPlacement $placement,
        public string $type = 'incoming' // 'incoming' or 'outgoing'
    ) {}

    public function toMail(object $notifiable): MailMessage
    {
        $petName = $this->placement->shelterAnimal?->name ?? 'a shelter pet';

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Foster Pet', 'value' => $petName],
                ['label' => 'Transfer Type', 'value' => strtoupper($this->type)],
                ['label' => 'Reason', 'value' => (string) ($this->placement->transfer_reason ?: 'Coordinator transfer')],
            ],
            actionText: 'View Foster Care Portal',
            level: 'primary',
            categoryBadge: 'FOSTER TRANSFER',
        );
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

<?php

namespace App\Notifications;

use App\Models\FosterPlacement;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FosterPlacementAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public FosterPlacement $placement) {}

    public function toMail(object $notifiable): MailMessage
    {
        $petName = $this->placement->shelterAnimal?->name ?? 'a shelter pet';

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Foster Pet', 'value' => $petName],
                ['label' => 'Status', 'value' => 'ACTIVE FOSTER PLACEMENT'],
            ],
            actionText: 'Open Foster Care Portal',
            level: 'success',
            categoryBadge: 'FOSTER CARE PLACEMENT',
        );
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

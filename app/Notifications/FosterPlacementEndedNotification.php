<?php

namespace App\Notifications;

use App\Models\FosterPlacement;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FosterPlacementEndedNotification extends Notification
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
                ['label' => 'Conclusion Reason', 'value' => (string) ($this->placement->end_reason ?: 'Completed')],
            ],
            actionText: 'Open Foster Care Portal',
            level: 'primary',
            categoryBadge: 'FOSTER PLACEMENT CONCLUDED',
        );
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

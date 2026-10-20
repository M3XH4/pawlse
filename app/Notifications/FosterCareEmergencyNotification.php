<?php

namespace App\Notifications;

use App\Models\FosterCareUpdate;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FosterCareEmergencyNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public FosterCareUpdate $update) {}

    public function toMail(object $notifiable): MailMessage
    {
        $petName = $this->update->shelterAnimal?->name ?? 'Foster Pet';
        $parentName = $this->update->user?->name ?? 'Foster Parent';

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Foster Pet', 'value' => $petName],
                ['label' => 'Foster Parent', 'value' => $parentName],
                ['label' => 'Urgency', 'value' => strtoupper((string) $this->update->urgency)],
            ],
            actionText: 'Review Foster Alert Immediately',
            level: 'error',
            categoryBadge: 'URGENT FOSTER ALERT',
        );
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

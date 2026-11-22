<?php

namespace App\Notifications;

use App\Models\AssignedTask;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VolunteerTaskAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public AssignedTask $task) {}

    public function toMail(object $notifiable): MailMessage
    {
        $targetName = $this->resolveTargetName();

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Activity / Route', 'value' => $targetName],
                ['label' => 'Assigned Role', 'value' => (string) $this->task->role],
            ],
            actionText: 'View Assigned Tasks',
            level: 'primary',
            categoryBadge: 'VOLUNTEER ASSIGNMENT',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $targetName = $this->resolveTargetName();

        return [
            'title' => 'Volunteer Task Assigned',
            'message' => "You have been assigned the role of {$this->task->role} for {$targetName}.",
            'description' => "Assigned as {$this->task->role} for {$targetName}.",
            'url' => route('account.volunteer.assigned-tasks'),
            'icon' => 'task',
            'category' => 'task',
            'task_id' => $this->task->id,
        ];
    }

    protected function resolveTargetName(): string
    {
        $this->task->loadMissing(['event', 'feedingSchedule', 'partnerFoodPickup.partner']);

        if ($this->task->event !== null) {
            return $this->task->event->title;
        }

        if ($this->task->feedingSchedule !== null) {
            return 'Feeding Route Zone '.$this->task->feedingSchedule->zone;
        }

        if ($this->task->partnerFoodPickup !== null) {
            $partnerName = $this->task->partnerFoodPickup->partner?->name ?? 'Partner';
            $pickupDate = $this->task->partnerFoodPickup->pickup_date?->format('M d, Y') ?? 'Today';

            return "Daily Food Pickup — {$partnerName} ({$pickupDate})";
        }

        return 'Activity';
    }
}

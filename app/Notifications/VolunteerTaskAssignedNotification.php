<?php

namespace App\Notifications;

use App\Models\AssignedTask;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VolunteerTaskAssignedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public AssignedTask $task) {}

    public function toMail(object $notifiable): MailMessage
    {
        $targetName = $this->task->event?->title
            ?? ($this->task->feedingSchedule ? 'Feeding Route Zone '.$this->task->feedingSchedule->zone : 'Activity');

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
        $targetName = $this->task->event?->title
            ?? ($this->task->feedingSchedule ? 'Feeding Route Zone '.$this->task->feedingSchedule->zone : 'Activity');

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
}

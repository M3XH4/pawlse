<?php

namespace App\Notifications;

use App\Models\AssignedTask;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class VolunteerTaskAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(public AssignedTask $task) {}

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

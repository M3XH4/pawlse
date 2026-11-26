<?php

namespace App\Services;

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Event;
use App\Models\FeedingSchedule;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class FieldGroupLifecycleService
{
    /**
     * Check if a user is an Admin or Super Admin.
     */
    public function isAdmin(User $user): bool
    {
        return in_array($user->role, [Role::Admin->value, Role::SuperAdmin->value], true)
            || $user->hasRole([Role::Admin->value, Role::SuperAdmin->value]);
    }

    /**
     * Check if a user is a Route Lead (or Team Lead) for the given group.
     */
    public function isGroupLead(User $user, string $groupType, int $groupId): bool
    {
        $column = $groupType === 'feeding' ? 'feeding_schedule_id' : 'event_id';

        $task = AssignedTask::query()
            ->where('user_id', $user->id)
            ->where($column, $groupId)
            ->whereIn('status', [AssignedTask::STATUS_PENDING, AssignedTask::STATUS_COMPLETED])
            ->first();

        if (! $task) {
            return false;
        }

        return str_contains(strtolower((string) $task->role), 'lead');
    }

    /**
     * Check if a user can access a field group's chat (active/past member or Admin/SuperAdmin).
     */
    public function canAccessGroupChat(User $user, string $groupType, int $groupId): bool
    {
        if (! in_array($groupType, ['feeding', 'event'], true)) {
            return false;
        }

        if ($this->isAdmin($user)) {
            return true;
        }

        $column = $groupType === 'feeding' ? 'feeding_schedule_id' : 'event_id';

        return AssignedTask::query()
            ->where('user_id', $user->id)
            ->where($column, $groupId)
            ->whereIn('status', [
                AssignedTask::STATUS_PENDING,
                AssignedTask::STATUS_COMPLETED,
                AssignedTask::STATUS_NO_SHOW,
            ])
            ->exists();
    }

    /**
     * Finalize per-member attendance and individual hours for a Feeding Schedule and disband the group.
     *
     * @param  array<int, array{task_id: int, attended: bool, hours_logged?: float|int|string|null}>|null  $attendees
     * @return array{completed_count: int, no_show_count: int}
     */
    public function completeAndDisbandFeedingSchedule(
        FeedingSchedule $schedule,
        User $actor,
        ?array $attendees = null
    ): array {
        return DB::transaction(function () use ($schedule, $actor, $attendees): array {
            $tasks = AssignedTask::query()
                ->where('feeding_schedule_id', $schedule->id)
                ->whereIn('status', [AssignedTask::STATUS_PENDING, AssignedTask::STATUS_COMPLETED, AssignedTask::STATUS_NO_SHOW])
                ->get()
                ->keyBy('id');

            $stats = $this->applyAttendanceUpdates($tasks, $actor, $attendees);

            $schedule->update([
                'execution_status' => FeedingSchedule::ExecutionCompleted,
                'completed_at' => now(),
                'completed_by_user_id' => $actor->id,
                'disbanded_at' => now(),
            ]);

            AuditLog::log(
                'feeding_route_completed',
                "{$actor->name} completed & disbanded feeding route '{$schedule->zone}' ({$stats['completed_count']} attended, {$stats['no_show_count']} no-show)"
            );

            return $stats;
        });
    }

    /**
     * Finalize per-member attendance and individual hours for an Event and disband the group.
     *
     * @param  array<int, array{task_id: int, attended: bool, hours_logged?: float|int|string|null}>|null  $attendees
     * @return array{completed_count: int, no_show_count: int, tasks: Collection<int, AssignedTask>}
     */
    public function completeAndDisbandEvent(
        Event $event,
        User $actor,
        ?array $attendees = null
    ): array {
        return DB::transaction(function () use ($event, $actor, $attendees): array {
            $tasks = AssignedTask::with('user')
                ->where('event_id', $event->id)
                ->whereIn('status', [AssignedTask::STATUS_PENDING, AssignedTask::STATUS_COMPLETED, AssignedTask::STATUS_NO_SHOW])
                ->get()
                ->keyBy('id');

            $stats = $this->applyAttendanceUpdates($tasks, $actor, $attendees);

            $event->update([
                'status' => 'closed',
                'disbanded_at' => now(),
            ]);

            AuditLog::log(
                'event_completed_disbanded',
                "{$actor->name} completed & disbanded event '{$event->title}' ({$stats['completed_count']} attended, {$stats['no_show_count']} no-show)"
            );

            return [
                'completed_count' => $stats['completed_count'],
                'no_show_count' => $stats['no_show_count'],
                'tasks' => $tasks->fresh(),
            ];
        });
    }

    /**
     * Apply attendance status and individual hours to a collection of group tasks.
     *
     * @param  Collection<int, AssignedTask>  $tasks
     * @param  array<int, array{task_id: int, attended: bool, hours_logged?: float|int|string|null}>|null  $attendees
     * @return array{completed_count: int, no_show_count: int}
     */
    private function applyAttendanceUpdates(Collection $tasks, User $actor, ?array $attendees): array
    {
        $now = now();
        $completedCount = 0;
        $noShowCount = 0;

        if ($attendees !== null) {
            $attendeeMap = collect($attendees)->keyBy(fn (array $row): int => (int) $row['task_id']);

            foreach ($tasks as $task) {
                $entry = $attendeeMap->get($task->id);
                $attended = $entry !== null
                    ? (bool) $entry['attended']
                    : $task->status !== AssignedTask::STATUS_NO_SHOW;

                if ($attended) {
                    $rawHours = $entry['hours_logged'] ?? null;
                    $hours = ($rawHours !== null && $rawHours !== '')
                        ? max(0.0, (float) $rawHours)
                        : $task->resolveAutomaticHours();

                    $task->update([
                        'status' => AssignedTask::STATUS_COMPLETED,
                        'hours_logged' => $hours,
                        'completed_at' => $task->completed_at ?? $now,
                        'attendance_marked_by' => $actor->id,
                        'attendance_marked_at' => $now,
                    ]);
                    $completedCount++;
                } else {
                    $task->update([
                        'status' => AssignedTask::STATUS_NO_SHOW,
                        'hours_logged' => 0.00,
                        'completed_at' => null,
                        'attendance_marked_by' => $actor->id,
                        'attendance_marked_at' => $now,
                    ]);
                    $noShowCount++;
                }
            }

            return [
                'completed_count' => $completedCount,
                'no_show_count' => $noShowCount,
            ];
        }

        foreach ($tasks as $task) {
            if ($task->status === AssignedTask::STATUS_NO_SHOW) {
                $noShowCount++;

                continue;
            }

            $hours = (float) $task->hours_logged > 0
                ? (float) $task->hours_logged
                : $task->resolveAutomaticHours();

            $task->update([
                'status' => AssignedTask::STATUS_COMPLETED,
                'hours_logged' => $hours,
                'completed_at' => $task->completed_at ?? $now,
                'attendance_marked_by' => $task->attendance_marked_by ?? $actor->id,
                'attendance_marked_at' => $task->attendance_marked_at ?? $now,
            ]);
            $completedCount++;
        }

        return [
            'completed_count' => $completedCount,
            'no_show_count' => $noShowCount,
        ];
    }
}

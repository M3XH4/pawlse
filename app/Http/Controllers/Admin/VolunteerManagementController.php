<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AssignedTask;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\FeedingSchedule;
use App\Models\User;
use App\Models\VolunteerApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class VolunteerManagementController extends Controller
{
    /**
     * Display a listing of volunteer applications, volunteers, and assigned tasks.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $statusFilter = $request->input('status', 'All');

        // 1. Volunteer Applications
        $applicationsQuery = VolunteerApplication::with('user')
            ->when($statusFilter !== 'All', function ($query) use ($statusFilter) {
                $query->where('status', $statusFilter);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%");
                });
            });

        $applications = $applicationsQuery->latest()->paginate(10, ['*'], 'apps_page')->withQueryString();

        // 2. Active Volunteers list
        $volunteersQuery = User::query()
            ->where('role', Role::Volunteer->value)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });

        $volunteers = $volunteersQuery->latest()->paginate(10, ['*'], 'vols_page')->withQueryString();

        // 3. Assigned Tasks
        $tasksQuery = AssignedTask::with(['user', 'event', 'feedingSchedule'])
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('event', function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%");
                })->orWhereHas('feedingSchedule', function ($q) use ($search) {
                    $q->where('zone', 'like', "%{$search}%");
                });
            });

        $tasks = $tasksQuery->latest()->paginate(10, ['*'], 'tasks_page')->withQueryString();

        // Get dropdown lists for manuals assignments
        $allEvents = Event::query()->where('status', 'open')->latest()->get();
        $allSchedules = FeedingSchedule::query()->where('status', 'active')->latest()->get();

        return Inertia::render('admin/volunteer-management', [
            'applications' => $applications,
            'volunteers' => $volunteers,
            'tasks' => $tasks,
            'events' => $allEvents,
            'feedingSchedules' => $allSchedules,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Approve a volunteer application.
     */
    public function approve(Request $request, VolunteerApplication $application): RedirectResponse
    {
        $application->update([
            'status' => 'approved',
        ]);

        $user = $application->user;
        $user->forceFill([
            'role' => Role::Volunteer->value,
        ])->save();

        $user->syncRoles([Role::Volunteer]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Application for {$application->full_name} has been approved.",
        ]);

        return redirect()->back();
    }

    /**
     * Reject a volunteer application.
     */
    public function reject(Request $request, VolunteerApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        $application->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Application for {$application->full_name} has been rejected.",
        ]);

        return redirect()->back();
    }

    /**
     * Manually assign a task to a volunteer.
     */
    public function assignTask(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'event_id' => ['nullable', 'exists:events,id'],
            'feeding_schedule_id' => ['nullable', 'exists:feeding_schedules,id'],
            'role' => ['required', 'string', 'max:255'],
        ]);

        $eventId = $validated['event_id'] ?? null;
        $feedingScheduleId = $validated['feeding_schedule_id'] ?? null;

        if (empty($eventId) && empty($feedingScheduleId)) {
            return redirect()->back()->withErrors([
                'task_target' => 'Please select either an Event or a Feeding Route.',
            ]);
        }

        // Check if already assigned to this event/schedule
        $alreadyAssigned = AssignedTask::query()
            ->where('user_id', $validated['user_id'])
            ->when(! empty($eventId), function ($q) use ($eventId) {
                $q->where('event_id', $eventId);
            })
            ->when(! empty($feedingScheduleId), function ($q) use ($feedingScheduleId) {
                $q->where('feeding_schedule_id', $feedingScheduleId);
            })
            ->exists();

        if ($alreadyAssigned) {
            return redirect()->back()->withErrors([
                'task_target' => 'This volunteer is already assigned to this activity.',
            ]);
        }

        AssignedTask::query()->create([
            'user_id' => $validated['user_id'],
            'event_id' => $eventId ?: null,
            'feeding_schedule_id' => $feedingScheduleId ?: null,
            'role' => $validated['role'],
            'status' => 'pending',
        ]);

        // If event is limited spots, decrement it
        if (! empty($eventId)) {
            $event = Event::query()->find($eventId);
            if ($event && $event->spots !== null) {
                $event->decrement('spots');
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Task successfully assigned to the volunteer.',
        ]);

        return redirect()->back();
    }

    /**
     * Update the status of an assigned task.
     */
    public function updateTaskStatus(Request $request, AssignedTask $task): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:completed,cancelled,pending'],
            'hours_logged' => ['nullable', 'numeric', 'min:0', 'max:999'],
        ]);

        $previousStatus = $task->status;

        $task->update([
            'status' => $validated['status'],
            'hours_logged' => $validated['hours_logged'] ?? $task->hours_logged,
        ]);

        // If status was changed to cancelled and it was an event, restore spots
        if ($validated['status'] === 'cancelled' && $previousStatus !== 'cancelled' && $task->event_id !== null) {
            $event = $task->event;
            if ($event !== null && $event->spots !== null) {
                $event->increment('spots');
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Task status updated successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Manually issue a certificate to a volunteer.
     */
    public function issueCertificate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'event_id' => ['nullable', 'exists:events,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $certificateNumber = 'CERT-'.date('Y').'-'.Str::upper(Str::random(6));

        Certificate::query()->create([
            'user_id' => $validated['user_id'],
            'event_id' => $validated['event_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'issue_date' => now()->toDateString(),
            'certificate_number' => $certificateNumber,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Certificate issued successfully.',
        ]);

        return redirect()->back();
    }
}

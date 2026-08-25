<?php

namespace App\Http\Controllers;

use App\Models\AssignedTask;
use App\Models\Certificate;
use App\Models\VolunteerApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VolunteerDashboardController extends Controller
{
    /**
     * Show volunteer status dashboard.
     */
    public function status(Request $request): Response
    {
        $user = $request->user();

        $application = VolunteerApplication::query()
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        // Calculate statistics
        $totalHours = AssignedTask::query()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->sum('hours_logged');

        $completedTasksCount = AssignedTask::query()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();

        $pendingTasksCount = AssignedTask::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        return Inertia::render('volunteer/volunteer-status', [
            'application' => $application ? [
                'status' => $application->status,
                'role' => $application->role,
                'reference_number' => $application->reference_number,
                'created_at' => $application->created_at->toDateString(),
            ] : null,
            'stats' => [
                'total_hours' => (float) $totalHours,
                'completed_tasks_count' => $completedTasksCount,
                'pending_tasks_count' => $pendingTasksCount,
            ],
        ]);
    }

    /**
     * Show active assigned tasks.
     */
    public function assignedTasks(Request $request): Response
    {
        $user = $request->user();

        $tasks = AssignedTask::with(['event', 'feedingSchedule'])
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->paginate(5);

        return Inertia::render('volunteer/assigned-tasks', [
            'tasks' => $tasks,
        ]);
    }

    /**
     * Show participation history.
     */
    public function participationHistory(Request $request): Response
    {
        $user = $request->user();

        $history = AssignedTask::with(['event', 'feedingSchedule'])
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->latest()
            ->paginate(5);

        return Inertia::render('volunteer/participation-history', [
            'history' => $history,
        ]);
    }

    /**
     * Show certificates.
     */
    public function certificates(Request $request): Response
    {
        $user = $request->user();

        $certificates = Certificate::with('event')
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(5);

        return Inertia::render('volunteer/certificates', [
            'certificates' => $certificates,
        ]);
    }

    /**
     * Show volunteer status dashboard inside user panel.
     */
    public function userStatus(Request $request): Response
    {
        $user = $request->user();

        $application = VolunteerApplication::query()
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        return Inertia::render('user/volunteer-status', [
            'application' => $application ? [
                'status' => $application->status,
                'role' => $application->role,
                'reference_number' => $application->reference_number,
                'created_at' => $application->created_at->toDateString(),
                'rejection_reason' => $application->rejection_reason,
            ] : null,
        ]);
    }
}

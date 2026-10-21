<?php

namespace App\Http\Controllers;

use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Certificate;
use App\Models\FosterParent;
use App\Models\VolunteerApplication;
use Illuminate\Http\RedirectResponse;
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
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [strtolower((string) $user->email)]);
            })
            ->latest()
            ->first();

        $fosterParent = FosterParent::where('user_id', $user->id)->first();

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
            'fosterParent' => $fosterParent ? [
                'id' => $fosterParent->id,
                'status' => $fosterParent->status,
                'capacity' => $fosterParent->capacity,
                'location' => $fosterParent->location,
                'pet_preference' => $fosterParent->pet_preference,
                'housing_type' => $fosterParent->housing_type,
                'notes' => $fosterParent->notes,
                'approved_at' => $fosterParent->approved_at ? $fosterParent->approved_at->toDateString() : null,
                'created_at' => $fosterParent->created_at ? $fosterParent->created_at->toDateString() : null,
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

        $tasks = AssignedTask::with(['event', 'feedingSchedule', 'petReport'])
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->paginate(5);

        return Inertia::render('volunteer/assigned-tasks', [
            'tasks' => $tasks,
        ]);
    }

    /**
     * Cancel an active assigned task.
     */
    public function cancelTask(Request $request, AssignedTask $task): RedirectResponse
    {
        $user = $request->user();

        if ($task->user_id !== $user->id) {
            abort(403);
        }

        if ($task->status !== 'pending') {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Only pending task assignments can be cancelled.',
            ]);

            return redirect()->back();
        }

        if ($task->event_id !== null) {
            $event = $task->event;
            if ($event !== null && $event->spots !== null) {
                $event->increment('spots');
            }
        }

        if ($task->pet_report_id !== null) {
            $report = $task->petReport;
            if ($report !== null && $report->assigned_volunteer_id === $user->id) {
                $report->update([
                    'assigned_volunteer_id' => null,
                    'status' => 'pending',
                ]);
            }
        }

        $taskTitle = $task->event?->title ?? $task->feedingSchedule?->zone ?? ($task->petReport ? 'Rescue #'.$task->petReport->id : 'Assignment');
        $task->delete();

        AuditLog::log('volunteer_cancel_task', "Cancelled volunteer task assignment for '{$taskTitle}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Task assignment cancelled successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Show participation history.
     */
    public function participationHistory(Request $request): Response
    {
        $user = $request->user();

        $history = AssignedTask::with(['event', 'feedingSchedule', 'petReport'])
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->latest()
            ->paginate(5);

        return Inertia::render('volunteer/participation-history', [
            'history' => $history,
        ]);
    }

    /**
     * Show certificates for volunteer dashboard.
     */
    public function certificates(Request $request): Response
    {
        $user = $request->user();

        $latestApplication = $user->volunteerApplications()->latest()->first();
        $volunteerRole = $latestApplication?->role ?? 'Volunteer';

        $certificates = Certificate::with(['event', 'user'])
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(guest_email) = ?', [strtolower((string) $user->email)]);
            })
            ->latest()
            ->paginate(5);

        return Inertia::render('volunteer/certificates', [
            'certificates' => $certificates,
            'defaultRole' => $volunteerRole,
        ]);
    }

    /**
     * Show certificates inside user dashboard.
     */
    public function userCertificates(Request $request): Response
    {
        $user = $request->user();

        $certificates = Certificate::with(['event', 'user'])
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(guest_email) = ?', [strtolower((string) $user->email)]);
            })
            ->latest()
            ->paginate(5);

        return Inertia::render('user/certificates', [
            'certificates' => $certificates,
            'defaultRole' => 'Participant',
        ]);
    }

    /**
     * Show volunteer status dashboard inside user panel.
     */
    public function userStatus(Request $request): Response
    {
        $user = $request->user();

        $application = VolunteerApplication::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [strtolower((string) $user->email)]);
            })
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

    /**
     * Show volunteer profile details.
     */
    public function profile(Request $request): Response
    {
        $user = $request->user();

        $application = VolunteerApplication::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [strtolower((string) $user->email)]);
            })
            ->latest()
            ->first();

        return Inertia::render('volunteer/profile-information', [
            'profile' => $application ? [
                'full_name' => $application->full_name,
                'mobile' => $application->mobile,
                'email' => $application->email,
                'address' => $application->address,
                'role' => $application->role,
                'why' => $application->why,
                'experience' => $application->experience,
                'foster_capacity' => $application->foster_capacity,
                'foster_preference' => $application->foster_preference,
                'foster_needs' => $application->foster_needs,
                'medic_experience' => $application->medic_experience,
                'medic_certifications' => $application->medic_certifications,
                'transport_has_license' => (bool) $application->transport_has_license,
                'created_at' => $application->created_at->toDateString(),
            ] : null,
        ]);
    }

    /**
     * Update volunteer profile details.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'fullName' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:5000'],
        ]);

        $application = VolunteerApplication::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [strtolower((string) $user->email)]);
            })
            ->latest()
            ->first();

        if ($application !== null) {
            $application->update([
                'full_name' => $validated['fullName'],
                'mobile' => $validated['mobile'],
                'address' => $validated['address'],
                'experience' => $validated['experience'] ?? null,
            ]);
        }

        if ($user->name !== $validated['fullName']) {
            $user->update([
                'name' => $validated['fullName'],
            ]);
        }

        AuditLog::log('volunteer_profile_update', 'Updated volunteer profile details');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Volunteer profile updated successfully.',
        ]);

        return redirect()->back();
    }
}

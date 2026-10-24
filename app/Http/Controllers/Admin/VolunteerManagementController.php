<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Events\VolunteerApplicationApprovedEvent;
use App\Events\VolunteerApplicationRejectedEvent;
use App\Http\Controllers\Controller;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\FeedingSchedule;
use App\Models\FosterParent;
use App\Models\User;
use App\Models\VolunteerApplication;
use App\Notifications\VolunteerApplicationReviewedNotification;
use App\Notifications\VolunteerCertificateIssuedNotification;
use App\Notifications\VolunteerTaskAssignedNotification;
use App\Support\EReceiptDispatcher;
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

        // 2. Active Volunteers list
        $volunteersQuery = User::query()
            ->where('role', Role::Volunteer->value)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });

        // 3. Assigned Tasks
        $tasksQuery = AssignedTask::with(['user', 'event', 'feedingSchedule', 'petReport'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($outer) use ($search) {
                    $outer->where('guest_name', 'like', "%{$search}%")
                        ->orWhere('guest_email', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('event', function ($q) use ($search) {
                            $q->where('title', 'like', "%{$search}%");
                        })
                        ->orWhereHas('feedingSchedule', function ($q) use ($search) {
                            $q->where('zone', 'like', "%{$search}%");
                        })
                        ->orWhereHas('petReport', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                                ->orWhere('animal_type', 'like', "%{$search}%")
                                ->orWhere('location', 'like', "%{$search}%");
                        });
                });
            });

        return Inertia::render('admin/volunteer-management', [
            'applications' => fn () => $applicationsQuery->latest()->paginate(10, ['*'], 'apps_page')->withQueryString(),
            'volunteers' => fn () => $volunteersQuery->latest()->paginate(10, ['*'], 'vols_page')->withQueryString(),
            'allVolunteers' => fn () => User::query()
                ->where('role', Role::Volunteer->value)
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role']),
            'allRecipients' => fn () => User::query()
                ->where(function ($query) {
                    $query->where('role', Role::Volunteer->value)
                        ->orWhereHas('assignedTasks', function ($q) {
                            $q->whereNotNull('event_id');
                        });
                })
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role']),
            'tasks' => fn () => $tasksQuery->latest()->paginate(10, ['*'], 'tasks_page')->withQueryString(),
            'events' => fn () => Event::query()->where('approval_status', 'approved')->latest()->get(),
            'feedingSchedules' => fn () => FeedingSchedule::query()->where('status', 'active')->latest()->get(),
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

        $user->notify(new VolunteerApplicationReviewedNotification($application));

        if ($application->role === 'Foster Volunteer') {
            FosterParent::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'status' => 'approved',
                    'capacity' => $application->foster_capacity ?? 2,
                    'location' => $application->address,
                    'pet_preference' => $application->foster_preference ?? 'both',
                    'notes' => trim(($application->foster_preference ? 'Preference: '.ucfirst($application->foster_preference).'. ' : '').($application->foster_needs ?? '')),
                    'approved_by' => auth()->id(),
                    'approved_at' => now(),
                ]
            );
        }

        VolunteerApplicationApprovedEvent::dispatch($application);

        AuditLog::log('volunteer_application_approve', "Approved volunteer application for {$application->full_name}");

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

        $application->user?->notify(new VolunteerApplicationReviewedNotification($application));

        VolunteerApplicationRejectedEvent::dispatch($application);

        AuditLog::log('volunteer_application_reject', "Rejected volunteer application for {$application->full_name}");

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

        $task = AssignedTask::query()->create([
            'user_id' => $validated['user_id'],
            'event_id' => $eventId ?: null,
            'feeding_schedule_id' => $feedingScheduleId ?: null,
            'role' => $validated['role'],
            'status' => 'pending',
        ]);

        $assignedUser = User::find($validated['user_id']);
        $assignedUser?->notify(new VolunteerTaskAssignedNotification($task));

        AuditLog::log('volunteer_task_assign', "Assigned volunteer role '{$validated['role']}' to volunteer {$assignedUser?->name}");

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

        AuditLog::log('volunteer_task_status_update', "Updated status of assigned task ID {$task->id} to {$validated['status']}");

        // If status was changed to cancelled and it was an event, restore spots
        if ($validated['status'] === 'cancelled' && $previousStatus !== 'cancelled' && $task->event_id !== null) {
            $event = $task->event;
            if ($event !== null && $event->spots !== null) {
                $event->increment('spots');
            }
        }

        // If status was changed to completed and it was an event, automatically issue & email certificate if not already issued
        if ($validated['status'] === 'completed' && $task->event_id !== null) {
            $task->loadMissing(['event', 'user']);
            $event = $task->event;

            if ($event !== null) {
                $existingCertQuery = Certificate::query()->where('event_id', $event->id);
                if ($task->user_id !== null) {
                    $existingCertQuery->where('user_id', $task->user_id);
                } else {
                    $existingCertQuery->whereRaw('LOWER(guest_email) = ?', [strtolower((string) $task->guest_email)]);
                }

                if (! $existingCertQuery->exists()) {
                    do {
                        $certificateNumber = 'CERT-'.date('Y').'-'.Str::upper(Str::random(6));
                    } while (Certificate::where('certificate_number', $certificateNumber)->exists());

                    $roleLabel = $task->role ?: 'Participant';
                    $isParticipant = strtolower($roleLabel) === 'participant';

                    $certificate = Certificate::query()->create([
                        'user_id' => $task->user_id,
                        'event_id' => $event->id,
                        'role' => $roleLabel,
                        'guest_name' => $task->guest_name,
                        'guest_email' => $task->guest_email,
                        'title' => $isParticipant
                            ? "Certificate of Participation — {$event->title}"
                            : "Certificate of Volunteer Service — {$event->title}",
                        'description' => $isParticipant
                            ? "For active community participation and support during {$event->title} held at {$event->location}."
                            : "For dedicated volunteer service as {$roleLabel} during {$event->title} held at {$event->location}.",
                        'issue_date' => now()->toDateString(),
                        'certificate_number' => $certificateNumber,
                    ]);

                    $recipientEmail = $task->user?->email ?? $task->guest_email;
                    EReceiptDispatcher::sendToUserAndEmail(
                        $task->user,
                        $recipientEmail,
                        new VolunteerCertificateIssuedNotification($certificate)
                    );
                }
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $validated['status'] === 'completed' && $task->event_id !== null
                ? 'Task completed and official certificate issued & emailed!'
                : 'Task status updated successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Manually issue a certificate to a volunteer or event participant.
     */
    public function issueCertificate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'event_id' => ['nullable', 'exists:events,id'],
            'role' => ['nullable', 'string', 'max:100'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $issuedUser = User::findOrFail($validated['user_id']);

        if (! empty($validated['event_id'])) {
            $alreadyExists = Certificate::query()
                ->where('user_id', $issuedUser->id)
                ->where('event_id', $validated['event_id'])
                ->exists();

            if ($alreadyExists) {
                Inertia::flash('toast', [
                    'type' => 'warning',
                    'message' => "A certificate for this event has already been issued to {$issuedUser->name}.",
                ]);

                return redirect()->back();
            }
        }

        $resolvedRole = $validated['role'] ?? null;
        if (! $resolvedRole && ! empty($validated['event_id'])) {
            $resolvedRole = AssignedTask::query()
                ->where('user_id', $issuedUser->id)
                ->where('event_id', $validated['event_id'])
                ->value('role');
        }
        if (! $resolvedRole) {
            $userRole = $issuedUser->role instanceof Role ? $issuedUser->role->value : (string) $issuedUser->role;
            if ($userRole === Role::Volunteer->value) {
                $resolvedRole = $issuedUser->volunteerApplications()->latest()->value('role') ?? 'Volunteer';
            } else {
                $resolvedRole = 'Participant';
            }
        }

        do {
            $certificateNumber = 'CERT-'.date('Y').'-'.Str::upper(Str::random(6));
        } while (Certificate::where('certificate_number', $certificateNumber)->exists());

        $certificate = Certificate::query()->create([
            'user_id' => $validated['user_id'],
            'event_id' => $validated['event_id'] ?? null,
            'role' => $resolvedRole,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'issue_date' => now()->toDateString(),
            'certificate_number' => $certificateNumber,
        ]);

        EReceiptDispatcher::sendToUserAndEmail(
            $issuedUser,
            $issuedUser->email,
            new VolunteerCertificateIssuedNotification($certificate)
        );

        AuditLog::log('volunteer_certificate_issue', "Issued certificate '{$validated['title']}' to {$issuedUser->name} ({$resolvedRole})");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Certificate issued and emailed successfully.',
        ]);

        return redirect()->back();
    }
}

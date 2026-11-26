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
use App\Models\Partner;
use App\Models\PartnerFoodPickup;
use App\Models\User;
use App\Models\VolunteerApplication;
use App\Models\VolunteerInjuryReport;
use App\Notifications\VolunteerApplicationReviewedNotification;
use App\Notifications\VolunteerCertificateIssuedNotification;
use App\Notifications\VolunteerMedicalAidUpdatedNotification;
use App\Notifications\VolunteerTaskAssignedNotification;
use App\Services\FieldGroupLifecycleService;
use App\Support\EReceiptDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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
        $tasksQuery = AssignedTask::with(['user', 'event', 'feedingSchedule', 'petReport', 'partnerFoodPickup.partner'])
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
                        })
                        ->orWhereHas('partnerFoodPickup.partner', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            });

        // 4. Daily Partner Food Pickups (auto-ensure today's pickup exists for active daily food partners)
        $dailyFoodPartners = Partner::query()
            ->active()
            ->dailyFood()
            ->orderBy('name')
            ->get(['id', 'name', 'address', 'operating_hours', 'daily_food_notes']);

        $todayDate = now()->toDateString();
        foreach ($dailyFoodPartners as $dailyPartner) {
            PartnerFoodPickup::query()->firstOrCreate(
                [
                    'partner_id' => $dailyPartner->id,
                    'pickup_date' => $todayDate,
                ],
                [
                    'status' => PartnerFoodPickup::StatusPending,
                    'food_summary' => $dailyPartner->daily_food_notes ?? 'Daily shelter food (1-day shelf life)',
                ]
            );
        }

        $foodPickupsQuery = PartnerFoodPickup::with(['partner', 'assignedVolunteer', 'assignedBy'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($outer) use ($search) {
                    $outer->where('food_summary', 'like', "%{$search}%")
                        ->orWhereHas('partner', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('assignedVolunteer', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            });

        $injuryReportsQuery = VolunteerInjuryReport::with([
            'user:id,name,email,phone',
            'assignedTask.event:id,title',
            'assignedTask.feedingSchedule:id,zone',
            'assignedTask.petReport:id,name,animal_type,location',
            'initiatedBy:id,name',
            'confirmedBy:id,name',
            'assignedMedic:id,name,phone',
        ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($outer) use ($search) {
                    $outer->where('description', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('incident_type', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            });

        $currentUser = $request->user();
        $isSuperAdmin = $currentUser ? $currentUser->isSuperAdmin() : false;
        $isSuperAdminPath = $request->is('account/super-admin/*');
        $view = $isSuperAdminPath ? 'super-admin/volunteer-management' : 'admin/volunteer-management';
        $basePath = $isSuperAdminPath ? '/account/super-admin/volunteer-management' : '/account/admin/volunteer-management';

        return Inertia::render($view, [
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
            'foodPickups' => fn () => $foodPickupsQuery->latest('pickup_date')->latest('id')->paginate(10, ['*'], 'pickups_page')->withQueryString(),
            'todayFoodPickups' => fn () => PartnerFoodPickup::with(['partner', 'assignedVolunteer'])
                ->whereDate('pickup_date', $todayDate)
                ->orderBy('id')
                ->get(),
            'dailyFoodPartners' => $dailyFoodPartners,
            'foodPickupStats' => fn () => [
                'today_total' => PartnerFoodPickup::query()->whereDate('pickup_date', now()->toDateString())->count(),
                'awaiting_verification' => PartnerFoodPickup::query()->where('status', PartnerFoodPickup::StatusFetched)->count(),
                'completed' => PartnerFoodPickup::query()->where('status', PartnerFoodPickup::StatusCompleted)->count(),
                'missed' => PartnerFoodPickup::query()->where('status', PartnerFoodPickup::StatusMissed)->count(),
            ],
            'events' => fn () => Event::query()->where('approval_status', 'approved')->latest()->get(),
            'issuedEventIdsByUser' => fn () => (object) Certificate::query()
                ->whereNotNull('event_id')
                ->get(['user_id', 'event_id'])
                ->groupBy('user_id')
                ->map(fn (Collection $certs) => $certs->pluck('event_id')->map(fn ($id) => (int) $id)->unique()->values()->all())
                ->all(),
            'feedingSchedules' => fn () => FeedingSchedule::query()->where('status', 'active')->latest()->get(),
            'injuryReports' => fn () => $injuryReportsQuery->latest()->paginate(10, ['*'], 'injuries_page')->withQueryString(),
            'injuryStats' => fn () => [
                'reported' => VolunteerInjuryReport::query()->where('status', VolunteerInjuryReport::StatusReported)->count(),
                'medical_aid_initiated' => VolunteerInjuryReport::query()->where('status', VolunteerInjuryReport::StatusMedicalAidInitiated)->count(),
                'confirmed' => VolunteerInjuryReport::query()->where('status', VolunteerInjuryReport::StatusConfirmed)->count(),
            ],
            'incidentTypes' => VolunteerInjuryReport::INCIDENT_TYPES,
            'severities' => VolunteerInjuryReport::SEVERITIES,
            'medicalAidTypes' => VolunteerInjuryReport::MEDICAL_AID_TYPES,
            'fieldMedicsAndLeads' => fn () => $this->resolveFieldMedicsAndLeads(),
            'fieldGroups' => fn () => $this->resolveFieldGroups(),
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
            'isSuperAdmin' => $isSuperAdmin,
            'basePath' => $basePath,
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

        $hoursLogged = $validated['hours_logged'] ?? null;
        if ($validated['status'] === 'completed' && $hoursLogged === null) {
            $hoursLogged = $task->resolveAutomaticHours();
        }

        $task->update([
            'status' => $validated['status'],
            'hours_logged' => $hoursLogged ?? $task->hours_logged,
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

    /**
     * Create a daily partner food pickup entry and optionally assign a volunteer.
     */
    public function storeFoodPickup(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'partner_id' => ['required', 'exists:partners,id'],
            'pickup_date' => ['required', 'date'],
            'assigned_volunteer_id' => ['nullable', 'exists:users,id'],
            'food_summary' => ['nullable', 'string', 'max:255'],
        ]);

        $partner = Partner::query()
            ->active()
            ->dailyFood()
            ->find($validated['partner_id']);

        if (! $partner) {
            return redirect()->back()->withErrors([
                'partner_id' => 'Selected partner is not an active daily food partner.',
            ]);
        }

        $existingPickup = PartnerFoodPickup::query()
            ->where('partner_id', $partner->id)
            ->whereDate('pickup_date', $validated['pickup_date'])
            ->first();

        if ($existingPickup) {
            if (
                $existingPickup->status === PartnerFoodPickup::StatusPending
                && $existingPickup->assigned_volunteer_id === null
                && ! empty($validated['assigned_volunteer_id'])
            ) {
                if (! empty($validated['food_summary'])) {
                    $existingPickup->update(['food_summary' => $validated['food_summary']]);
                }

                $this->assignPickupToVolunteer($existingPickup, (int) $validated['assigned_volunteer_id'], (int) $request->user()->id);

                Inertia::flash('toast', [
                    'type' => 'success',
                    'message' => 'Volunteer assigned to existing daily pickup.',
                ]);

                return redirect()->back();
            }

            return redirect()->back()->withErrors([
                'pickup_date' => 'A daily food pickup for this partner and date already exists.',
            ]);
        }

        $pickup = PartnerFoodPickup::query()->create([
            'partner_id' => $partner->id,
            'pickup_date' => $validated['pickup_date'],
            'status' => PartnerFoodPickup::StatusPending,
            'food_summary' => $validated['food_summary'] ?: ($partner->daily_food_notes ?? 'Daily shelter food (1-day shelf life)'),
        ]);

        if (! empty($validated['assigned_volunteer_id'])) {
            $this->assignPickupToVolunteer($pickup, (int) $validated['assigned_volunteer_id'], (int) $request->user()->id);
        } else {
            AuditLog::log('partner_food_pickup_create', "Created daily food pickup for {$partner->name} on {$validated['pickup_date']}");
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => ! empty($validated['assigned_volunteer_id'])
                ? 'Daily food pickup scheduled and volunteer assigned.'
                : 'Daily food pickup scheduled successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Manually assign or reassign a volunteer to a daily partner food pickup.
     */
    public function assignFoodPickupVolunteer(Request $request, PartnerFoodPickup $pickup): RedirectResponse
    {
        $validated = $request->validate([
            'assigned_volunteer_id' => ['required', 'exists:users,id'],
        ]);

        if (in_array($pickup->status, [PartnerFoodPickup::StatusCompleted, PartnerFoodPickup::StatusMissed], true)) {
            return redirect()->back()->withErrors([
                'assigned_volunteer_id' => 'Cannot assign a volunteer to a pickup that is already completed or missed.',
            ]);
        }

        $this->assignPickupToVolunteer($pickup, (int) $validated['assigned_volunteer_id'], (int) $request->user()->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Volunteer assigned to daily food pickup.',
        ]);

        return redirect()->back();
    }

    /**
     * Mark a daily partner food pickup as completed or missed.
     */
    public function updateFoodPickupStatus(Request $request, PartnerFoodPickup $pickup): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:completed,missed'],
            'hours_logged' => ['nullable', 'numeric', 'min:0', 'max:24'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $hours = $validated['hours_logged'] ?? 1.00;

        if ($validated['status'] === PartnerFoodPickup::StatusCompleted) {
            $pickup->update([
                'status' => PartnerFoodPickup::StatusCompleted,
                'completed_at' => now(),
                'missed_at' => null,
                'admin_notes' => $validated['admin_notes'] ?? $pickup->admin_notes,
            ]);

            AssignedTask::query()
                ->where('partner_food_pickup_id', $pickup->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'completed',
                    'hours_logged' => $hours,
                ]);

            AuditLog::log('partner_food_pickup_complete', "Marked food pickup ID {$pickup->id} as completed");
        } else {
            $pickup->update([
                'status' => PartnerFoodPickup::StatusMissed,
                'missed_at' => now(),
                'completed_at' => null,
                'admin_notes' => $validated['admin_notes'] ?? $pickup->admin_notes,
            ]);

            AssignedTask::query()
                ->where('partner_food_pickup_id', $pickup->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'cancelled',
                ]);

            AuditLog::log('partner_food_pickup_missed', "Marked food pickup ID {$pickup->id} as missed");
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $validated['status'] === PartnerFoodPickup::StatusCompleted
                ? 'Food pickup verified as completed.'
                : 'Food pickup marked as missed.',
        ]);

        return redirect()->back();
    }

    /**
     * Assign a pickup to a volunteer, create an AssignedTask, and send notification.
     */
    private function assignPickupToVolunteer(PartnerFoodPickup $pickup, int $volunteerId, int $adminId): void
    {
        AssignedTask::query()
            ->where('partner_food_pickup_id', $pickup->id)
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);

        $pickup->update([
            'assigned_volunteer_id' => $volunteerId,
            'assigned_by' => $adminId,
            'status' => PartnerFoodPickup::StatusAssigned,
        ]);

        $task = AssignedTask::query()->create([
            'user_id' => $volunteerId,
            'partner_food_pickup_id' => $pickup->id,
            'role' => 'Daily Food Pickup Carrier',
            'status' => 'pending',
            'hours_logged' => 0.00,
        ]);

        $volunteer = User::query()->find($volunteerId);
        $volunteer?->notify(new VolunteerTaskAssignedNotification($task));

        $pickup->loadMissing('partner');
        AuditLog::log('partner_food_pickup_assign', "Assigned volunteer {$volunteer?->name} to daily food pickup for {$pickup->partner?->name}");
    }

    /**
     * Initiate medical aid for a reported volunteer field injury.
     */
    public function initiateMedicalAid(Request $request, VolunteerInjuryReport $injuryReport): RedirectResponse
    {
        if ($injuryReport->status !== VolunteerInjuryReport::StatusReported) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Medical aid can only be initiated for newly reported injuries.',
            ]);

            return redirect()->back();
        }

        $validated = $request->validate([
            'medical_aid_type' => ['required', 'string', Rule::in(array_keys(VolunteerInjuryReport::MEDICAL_AID_TYPES))],
            'medical_facility' => ['nullable', 'string', 'max:255'],
            'medical_aid_notes' => ['required', 'string', 'max:1500'],
            'assigned_medic_user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $admin = $request->user();

        $injuryReport->update([
            'status' => VolunteerInjuryReport::StatusMedicalAidInitiated,
            'medical_aid_type' => $validated['medical_aid_type'],
            'medical_facility' => $validated['medical_facility'] ?? null,
            'medical_aid_notes' => $validated['medical_aid_notes'],
            'assigned_medic_user_id' => $validated['assigned_medic_user_id'] ?? $injuryReport->assigned_medic_user_id,
            'initiated_by_user_id' => $admin?->id,
            'medical_aid_initiated_at' => now(),
        ]);

        $injuryReport->loadMissing('user');
        $injuryReport->user?->notify(new VolunteerMedicalAidUpdatedNotification($injuryReport));

        AuditLog::log(
            'volunteer_medical_aid_initiated',
            "Initiated medical aid ({$validated['medical_aid_type']}) for volunteer {$injuryReport->user?->name} (Injury Report #{$injuryReport->id})"
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Medical aid initiated and volunteer notified.',
        ]);

        return redirect()->back();
    }

    /**
     * Confirm that medical aid for a volunteer field injury has been completed/verified.
     */
    public function confirmMedicalAid(Request $request, VolunteerInjuryReport $injuryReport): RedirectResponse
    {
        if ($injuryReport->status !== VolunteerInjuryReport::StatusMedicalAidInitiated) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Medical aid must be initiated before it can be confirmed.',
            ]);

            return redirect()->back();
        }

        $validated = $request->validate([
            'confirmation_notes' => ['nullable', 'string', 'max:1500'],
        ]);

        $admin = $request->user();

        $injuryReport->update([
            'status' => VolunteerInjuryReport::StatusConfirmed,
            'confirmed_by_user_id' => $admin?->id,
            'confirmed_at' => now(),
            'confirmation_notes' => $validated['confirmation_notes'] ?? null,
        ]);

        $injuryReport->loadMissing('user');
        $injuryReport->user?->notify(new VolunteerMedicalAidUpdatedNotification($injuryReport));

        AuditLog::log(
            'volunteer_medical_aid_confirmed',
            "Confirmed medical aid completion for volunteer {$injuryReport->user?->name} (Injury Report #{$injuryReport->id})"
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Medical aid confirmed and case closed.',
        ]);

        return redirect()->back();
    }

    /**
     * Allow an admin/super-admin to log a field injury report on behalf of a volunteer.
     */
    public function storeInjuryReport(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'incident_type' => ['required', 'string', Rule::in(array_keys(VolunteerInjuryReport::INCIDENT_TYPES))],
            'severity' => ['required', 'string', Rule::in(array_keys(VolunteerInjuryReport::SEVERITIES))],
            'body_part' => ['nullable', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:255'],
            'incident_occurred_at' => ['required', 'date'],
            'description' => ['required', 'string', 'max:2000'],
            'first_aid_applied' => ['boolean'],
            'first_aid_notes' => ['nullable', 'string', 'max:1000'],
            'assigned_medic_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'initiate_aid_now' => ['boolean'],
            'medical_aid_type' => ['nullable', 'required_if:initiate_aid_now,true', 'string', Rule::in(array_keys(VolunteerInjuryReport::MEDICAL_AID_TYPES))],
            'medical_facility' => ['nullable', 'string', 'max:255'],
            'medical_aid_notes' => ['nullable', 'required_if:initiate_aid_now,true', 'string', 'max:1500'],
        ]);

        $admin = $request->user();
        $initiateAidNow = (bool) ($validated['initiate_aid_now'] ?? false);

        $report = VolunteerInjuryReport::query()->create([
            'user_id' => $validated['user_id'],
            'incident_type' => $validated['incident_type'],
            'severity' => $validated['severity'],
            'body_part' => $validated['body_part'] ?? null,
            'location' => $validated['location'] ?? null,
            'incident_occurred_at' => $validated['incident_occurred_at'],
            'description' => $validated['description'],
            'first_aid_applied' => (bool) ($validated['first_aid_applied'] ?? false),
            'first_aid_notes' => $validated['first_aid_notes'] ?? null,
            'assigned_medic_user_id' => $validated['assigned_medic_user_id'] ?? null,
            'status' => $initiateAidNow
                ? VolunteerInjuryReport::StatusMedicalAidInitiated
                : VolunteerInjuryReport::StatusReported,
            'medical_aid_type' => $initiateAidNow ? ($validated['medical_aid_type'] ?? null) : null,
            'medical_facility' => $initiateAidNow ? ($validated['medical_facility'] ?? null) : null,
            'medical_aid_notes' => $initiateAidNow ? ($validated['medical_aid_notes'] ?? null) : null,
            'initiated_by_user_id' => $initiateAidNow ? $admin?->id : null,
            'medical_aid_initiated_at' => $initiateAidNow ? now() : null,
        ]);

        $report->loadMissing('user');
        if ($initiateAidNow) {
            $report->user?->notify(new VolunteerMedicalAidUpdatedNotification($report));
        }

        AuditLog::log(
            'volunteer_injury_logged_by_admin',
            "Admin {$admin?->name} logged a {$report->severity} {$report->incident_type} injury report for volunteer {$report->user?->name} (#{$report->id})"
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $initiateAidNow
                ? 'Injury report logged and medical aid initiated for volunteer.'
                : 'Injury report logged for volunteer.',
        ]);

        return redirect()->back();
    }

    /**
     * Resolve volunteers currently in the field with Medic/Lead roles or certified medic applications.
     *
     * @return array<int, array<string, mixed>>
     */
    private function resolveFieldMedicsAndLeads(): array
    {
        $activeFieldTasks = AssignedTask::query()
            ->with(['user:id,name,email,phone', 'feedingSchedule:id,zone', 'event:id,title'])
            ->where('status', 'pending')
            ->where(function ($query) {
                $query->whereRaw('LOWER(role) like ?', ['%medic%'])
                    ->orWhereRaw('LOWER(role) like ?', ['%lead%']);
            })
            ->get();

        $results = [];

        foreach ($activeFieldTasks as $task) {
            if (! $task->user) {
                continue;
            }
            $location = $task->feedingSchedule?->zone ?? $task->event?->title ?? 'Active Field Duty';
            $results[$task->user->id] = [
                'id' => $task->user->id,
                'name' => $task->user->name,
                'phone' => $task->user->phone,
                'role' => $task->role,
                'assignment' => $location,
                'in_field' => true,
            ];
        }

        $medicApplications = VolunteerApplication::query()
            ->with('user:id,name,email,phone')
            ->where('status', 'approved')
            ->where(function ($query) {
                $query->whereRaw('LOWER(role) like ?', ['%medic%'])
                    ->orWhereNotNull('medic_certifications');
            })
            ->get();

        foreach ($medicApplications as $app) {
            if (! $app->user || isset($results[$app->user->id])) {
                continue;
            }
            $results[$app->user->id] = [
                'id' => $app->user->id,
                'name' => $app->user->name,
                'phone' => $app->user->phone,
                'role' => $app->role ?: 'Field Medic',
                'assignment' => 'On-Call Certified Medic',
                'in_field' => false,
            ];
        }

        return array_values($results);
    }

    /**
     * Update a group member's assigned role on a Feeding Route or Event.
     */
    public function updateGroupMemberRole(Request $request, AssignedTask $task): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'max:100'],
        ]);

        $oldRole = $task->role;
        $task->update([
            'role' => $validated['role'],
        ]);

        $task->loadMissing(['user', 'feedingSchedule', 'event']);
        $groupName = $task->feedingSchedule?->zone ?? $task->event?->title ?? "Task #{$task->id}";

        AuditLog::log(
            'volunteer_group_role_updated',
            "Updated {$task->user?->name}'s role in '{$groupName}' from '{$oldRole}' to '{$validated['role']}'"
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Updated {$task->user?->name}'s role to {$validated['role']}.",
        ]);

        return redirect()->back();
    }

    /**
     * Remove a volunteer from a Feeding Route or Event group.
     */
    public function removeGroupMember(Request $request, AssignedTask $task): RedirectResponse
    {
        $task->loadMissing(['user', 'feedingSchedule', 'event']);
        $memberName = $task->user?->name ?? $task->guest_name ?? 'Volunteer';
        $groupName = $task->feedingSchedule?->zone ?? $task->event?->title ?? "Task #{$task->id}";

        if ($task->event && $task->event->spots !== null) {
            $task->event->increment('spots');
        }

        $task->delete();

        AuditLog::log(
            'volunteer_group_member_removed',
            "Removed {$memberName} from field group '{$groupName}'"
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$memberName} removed from {$groupName}.",
        ]);

        return redirect()->back();
    }

    /**
     * Adjust a Field Group's member capacity (quota), preventing lowering below the current member count.
     */
    public function updateGroupSettings(Request $request, string $type, int $id): RedirectResponse
    {
        if (! in_array($type, ['feeding', 'event'], true)) {
            abort(404);
        }

        $validated = $request->validate([
            'quota' => ['nullable', 'integer', 'min:1', 'max:500'],
        ]);

        $column = $type === 'feeding' ? 'feeding_schedule_id' : 'event_id';
        $currentMembersCount = AssignedTask::query()
            ->where($column, $id)
            ->whereIn('status', [AssignedTask::STATUS_PENDING, AssignedTask::STATUS_COMPLETED])
            ->count();

        $newQuota = $validated['quota'] ?? null;

        if ($newQuota !== null && $newQuota < $currentMembersCount) {
            return redirect()->back()->withErrors([
                'quota' => "Cannot adjust member limit to {$newQuota} because this group already has {$currentMembersCount} assigned member(s). Remove a member first.",
            ]);
        }

        if ($type === 'feeding') {
            $schedule = FeedingSchedule::query()->findOrFail($id);
            $schedule->update([
                'volunteers' => $newQuota ?? 0,
            ]);
            $groupName = $schedule->zone;
        } else {
            $event = Event::query()->findOrFail($id);
            $event->update([
                'spots' => $newQuota !== null ? max(0, $newQuota - $currentMembersCount) : null,
            ]);
            $groupName = $event->title;
        }

        $limitLabel = $newQuota !== null ? (string) $newQuota : 'Unlimited';
        AuditLog::log('volunteer_group_settings_updated', "Updated member limit for '{$groupName}' to {$limitLabel}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Updated member limit for '{$groupName}' to {$limitLabel}.",
        ]);

        return redirect()->back();
    }

    /**
     * Finalize member attendance & hours and disband a Field Group while preserving all data.
     */
    public function disbandGroup(
        Request $request,
        string $type,
        int $id,
        FieldGroupLifecycleService $lifecycleService
    ): RedirectResponse {
        if (! in_array($type, ['feeding', 'event'], true)) {
            abort(404);
        }

        $validated = $request->validate([
            'attendees' => ['nullable', 'array'],
            'attendees.*.task_id' => ['required', 'integer'],
            'attendees.*.attended' => ['required', 'boolean'],
            'attendees.*.hours_logged' => ['nullable', 'numeric', 'min:0', 'max:24'],
        ]);

        if ($type === 'feeding') {
            $schedule = FeedingSchedule::query()->findOrFail($id);
            $stats = $lifecycleService->completeAndDisbandFeedingSchedule(
                $schedule,
                $request->user(),
                $validated['attendees'] ?? null
            );
            $groupName = $schedule->zone;
        } else {
            $event = Event::query()->findOrFail($id);
            $stats = $lifecycleService->completeAndDisbandEvent(
                $event,
                $request->user(),
                $validated['attendees'] ?? null
            );
            $groupName = $event->title;
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Disbanded '{$groupName}' ({$stats['completed_count']} attended, {$stats['no_show_count']} no-show). All logs and chat history preserved.",
        ]);

        return redirect()->back();
    }

    /**
     * Build unified Field Groups from active and disbanded Feeding Routes and approved Events.
     *
     * @return array<int, array<string, mixed>>
     */
    private function resolveFieldGroups(): array
    {
        $feedingGroups = FeedingSchedule::query()
            ->where('status', 'active')
            ->with([
                'assignedTasks' => fn ($q) => $q->whereIn('status', [
                    AssignedTask::STATUS_PENDING,
                    AssignedTask::STATUS_COMPLETED,
                    AssignedTask::STATUS_NO_SHOW,
                ])
                    ->with('user:id,name,email,phone,avatar_path')
                    ->orderBy('created_at'),
            ])
            ->latest()
            ->get()
            ->map(fn (FeedingSchedule $schedule): array => $this->formatFieldGroup(
                id: $schedule->id,
                type: 'feeding',
                name: $schedule->zone,
                schedule: "{$schedule->day} • {$schedule->time}",
                quota: (int) $schedule->volunteers,
                executionStatus: $schedule->execution_status ?? 'scheduled',
                disbandedAt: $schedule->disbanded_at?->toIso8601String(),
                totalFoodDistributed: (int) ($schedule->total_food_distributed ?? 0),
                tasks: $schedule->assignedTasks,
            ));

        $eventGroups = Event::query()
            ->where('approval_status', 'approved')
            ->where(function ($q): void {
                $q->whereDate('date', '>=', now()->toDateString())
                    ->orWhereNotNull('disbanded_at');
            })
            ->with([
                'assignedTasks' => fn ($q) => $q->whereIn('status', [
                    AssignedTask::STATUS_PENDING,
                    AssignedTask::STATUS_COMPLETED,
                    AssignedTask::STATUS_NO_SHOW,
                ])
                    ->with('user:id,name,email,phone,avatar_path')
                    ->orderBy('created_at'),
            ])
            ->orderByDesc('date')
            ->get()
            ->map(fn (Event $event): array => $this->formatFieldGroup(
                id: $event->id,
                type: 'event',
                name: $event->title,
                schedule: ($event->date?->format('M d, Y') ?? '').($event->time ? " • {$event->time}" : ''),
                quota: $event->spots !== null && $event->spots > 0 ? (int) $event->spots + $event->assignedTasks->count() : 0,
                executionStatus: $event->status,
                disbandedAt: $event->disbanded_at?->toIso8601String(),
                totalFoodDistributed: 0,
                tasks: $event->assignedTasks,
            ));

        return $feedingGroups->concat($eventGroups)->values()->all();
    }

    /**
     * @param  Collection<int, AssignedTask>  $tasks
     * @return array<string, mixed>
     */
    private function formatFieldGroup(
        int $id,
        string $type,
        string $name,
        string $schedule,
        int $quota,
        ?string $executionStatus,
        ?string $disbandedAt,
        int $totalFoodDistributed,
        $tasks,
    ): array {
        $members = $tasks
            ->filter(fn (AssignedTask $t): bool => $t->user !== null)
            ->map(function (AssignedTask $t): array {
                $roleLower = strtolower((string) $t->role);

                return [
                    'task_id' => $t->id,
                    'user_id' => $t->user_id,
                    'name' => $t->user->name,
                    'email' => $t->user->email,
                    'phone' => $t->user->phone,
                    'avatar_path' => $t->user->avatar_path,
                    'role' => $t->role,
                    'status' => $t->status,
                    'hours_logged' => (float) $t->hours_logged,
                    'is_lead' => str_contains($roleLower, 'lead'),
                    'is_recorder' => str_contains($roleLower, 'recorder'),
                    'is_medic' => str_contains($roleLower, 'medic'),
                ];
            })
            ->sortBy(function (array $m): int {
                if ($m['is_lead']) {
                    return 0;
                }
                if ($m['is_medic']) {
                    return 1;
                }
                if ($m['is_recorder']) {
                    return 2;
                }

                return 3;
            })
            ->values();

        return [
            'id' => $id,
            'type' => $type,
            'name' => $name,
            'schedule' => $schedule,
            'quota' => $quota,
            'execution_status' => $executionStatus,
            'is_disbanded' => $disbandedAt !== null,
            'disbanded_at' => $disbandedAt,
            'total_food_distributed' => $totalFoodDistributed,
            'total_hours_logged' => round($members->sum('hours_logged'), 2),
            'completed_count' => $members->where('status', AssignedTask::STATUS_COMPLETED)->count(),
            'no_show_count' => $members->where('status', AssignedTask::STATUS_NO_SHOW)->count(),
            'members_count' => $members->count(),
            'has_lead' => $members->contains('is_lead', true),
            'has_recorder' => $members->contains('is_recorder', true),
            'has_medic' => $members->contains('is_medic', true),
            'members' => $members->all(),
        ];
    }
}

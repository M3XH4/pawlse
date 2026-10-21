<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\FeedingSchedule;
use App\Models\User;
use App\Notifications\EventApprovalStatusUpdatedNotification;
use App\Notifications\EventPendingApprovalNotification;
use App\Notifications\VolunteerCertificateIssuedNotification;
use App\Support\EReceiptDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventManagementController extends Controller
{
    /**
     * Display a listing of all events and feeding routes for admin.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $category = $request->input('category', 'All');
        $approvalStatus = $request->input('approval_status', 'All');

        // Events Query
        $eventsQuery = Event::query()
            ->when($category !== 'All', function ($query) use ($category) {
                $query->where('category', $category);
            })
            ->when($approvalStatus !== 'All', function ($query) use ($approvalStatus) {
                $query->where('approval_status', $approvalStatus);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('desc', 'like', "%{$search}%");
                });
            });

        $events = $eventsQuery->withCount('assignedTasks')
            ->with(['assignedTasks.user', 'certificates', 'approvedBy:id,name', 'creator:id,name'])
            ->latest()
            ->paginate(10, ['*'], 'events_page')
            ->withQueryString()
            ->through(function (Event $event) {
                $event->setAttribute('approved_by_user', $event->relationLoaded('approvedBy') ? $event->getRelation('approvedBy') : null);

                return $event;
            });

        // Feeding Schedules Query
        $feedingQuery = FeedingSchedule::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('zone', 'like', "%{$search}%")
                        ->orWhere('day', 'like', "%{$search}%");
                });
            });

        $feedingSchedules = $feedingQuery->withCount('assignedTasks')
            ->with(['assignedTasks.user'])
            ->latest()
            ->paginate(10, ['*'], 'feeding_page')
            ->withQueryString();

        $currentUser = $request->user();
        $isSuperAdmin = $currentUser ? $currentUser->isSuperAdmin() : false;
        $isSuperAdminPath = $request->is('account/super-admin/*');
        $view = $isSuperAdminPath ? 'super-admin/events' : 'admin/events';
        $basePath = $isSuperAdminPath ? '/account/super-admin/events' : '/account/admin/events';

        return Inertia::render($view, [
            'events' => $events,
            'feedingSchedules' => $feedingSchedules,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'approval_status' => $approvalStatus,
            ],
            'isSuperAdmin' => $isSuperAdmin,
            'basePath' => $basePath,
        ]);
    }

    /**
     * Store a newly created event.
     */
    public function storeEvent(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:Feeding,Medical,Social,Adoption'],
            'date' => ['required', 'date'],
            'time' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'spots' => ['nullable', 'integer', 'min:-1'],
            'desc' => ['required', 'string', 'max:5000'],
            'keywords' => ['nullable', 'array'],
            'img' => ['nullable', 'string', 'max:500'],
        ]);

        // Default image fallback
        if (empty($validated['img'])) {
            $validated['img'] = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800';
        }

        $user = $request->user();
        $isSuperAdmin = $user ? $user->isSuperAdmin() : false;

        $approvalStatus = $isSuperAdmin ? 'approved' : 'pending';
        $approvedBy = $isSuperAdmin ? $user->id : null;
        $approvedAt = $isSuperAdmin ? now() : null;

        $event = Event::query()->create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'date' => $validated['date'],
            'time' => $validated['time'],
            'location' => $validated['location'],
            'spots' => $validated['spots'] === -1 ? null : $validated['spots'],
            'desc' => $validated['desc'],
            'keywords' => $validated['keywords'] ?? [],
            'img' => $validated['img'],
            'status' => $isSuperAdmin ? 'open' : 'closed', // Only approved events are open
            'approval_status' => $approvalStatus,
            'approved_by' => $approvedBy,
            'approved_at' => $approvedAt,
            'created_by' => $user?->id,
        ]);

        if (! $isSuperAdmin) {
            $superAdmins = User::where('role', Role::SuperAdmin->value)
                ->orWhereHas('roles', fn ($q) => $q->where('name', Role::SuperAdmin->value))
                ->get();

            foreach ($superAdmins as $superAdmin) {
                $superAdmin->notify(new EventPendingApprovalNotification($event));
            }
        }

        AuditLog::log('event_create', "Created event '{$validated['title']}' with approval status '{$approvalStatus}'");

        $message = $isSuperAdmin
            ? 'Event created and published successfully.'
            : 'Event created and submitted for Super Admin approval.';

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message,
        ]);

        return redirect()->back();
    }

    /**
     * Update the specified event.
     */
    public function updateEvent(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:Feeding,Medical,Social,Adoption'],
            'date' => ['required', 'date'],
            'time' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'spots' => ['nullable', 'integer', 'min:-1'],
            'desc' => ['required', 'string', 'max:5000'],
            'keywords' => ['nullable', 'array'],
            'img' => ['nullable', 'string', 'max:500'],
        ]);

        if (empty($validated['img'])) {
            $validated['img'] = $event->img;
        }

        $event->update([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'date' => $validated['date'],
            'time' => $validated['time'],
            'location' => $validated['location'],
            'spots' => $validated['spots'] === -1 ? null : $validated['spots'],
            'desc' => $validated['desc'],
            'keywords' => $validated['keywords'] ?? [],
            'img' => $validated['img'],
        ]);

        AuditLog::log('event_update', "Updated event '{$validated['title']}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Event updated successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Approve the specified event (Super Admin only).
     */
    public function approveEvent(Request $request, Event $event): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->isSuperAdmin(), 403, 'Unauthorized. Super Admin privilege is required to approve events.');

        $event->update([
            'approval_status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
            'status' => 'open',
            'rejection_reason' => null,
        ]);

        AuditLog::log('event_approve', "Super Admin {$user->name} approved event '{$event->title}' (ID: {$event->id})");

        if ($event->creator) {
            $event->creator->notify(new EventApprovalStatusUpdatedNotification($event, 'approved'));
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Event approved successfully and is now active.',
        ]);

        return redirect()->back();
    }

    /**
     * Reject the specified event (Super Admin only).
     */
    public function rejectEvent(Request $request, Event $event): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->isSuperAdmin(), 403, 'Unauthorized. Super Admin privilege is required to reject events.');

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $event->update([
            'approval_status' => 'rejected',
            'status' => 'closed',
            'rejection_reason' => $validated['reason'] ?? null,
        ]);

        AuditLog::log('event_reject', "Super Admin {$user->name} rejected event '{$event->title}' (ID: {$event->id})");

        if ($event->creator) {
            $event->creator->notify(new EventApprovalStatusUpdatedNotification($event, 'rejected', $validated['reason'] ?? null));
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Event marked as rejected.',
        ]);

        return redirect()->back();
    }

    /**
     * Toggle status of the specified event.
     */
    public function toggleEventStatus(Request $request, Event $event): RedirectResponse
    {
        if ($event->approval_status !== 'approved') {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Pending or rejected events cannot be opened until approved by a Super Admin.',
            ]);

            return redirect()->back();
        }

        $newStatus = $event->status === 'open' ? 'closed' : 'open';
        $event->update(['status' => $newStatus]);

        AuditLog::log('event_status_toggle', "Toggled status of event ID {$event->id} to {$newStatus}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Event is now {$newStatus}.",
        ]);

        return redirect()->back();
    }

    /**
     * Remove the specified event.
     */
    public function destroyEvent(Request $request, Event $event): RedirectResponse
    {
        $event->delete();

        AuditLog::log('event_delete', "Deleted event '{$event->title}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Event deleted successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Store a newly created feeding schedule route.
     */
    public function storeFeedingSchedule(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'zone' => ['required', 'string', 'max:255'],
            'day' => ['required', 'string', 'max:255'],
            'time' => ['required', 'string', 'max:255'],
            'volunteers' => ['required', 'integer', 'min:0'],
            'strays' => ['required', 'integer', 'min:0'],
        ]);

        FeedingSchedule::query()->create($validated);

        AuditLog::log('feeding_route_create', "Created feeding route zone '{$validated['zone']}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Feeding route created successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Update the specified feeding schedule route.
     */
    public function updateFeedingSchedule(Request $request, FeedingSchedule $schedule): RedirectResponse
    {
        $validated = $request->validate([
            'zone' => ['required', 'string', 'max:255'],
            'day' => ['required', 'string', 'max:255'],
            'time' => ['required', 'string', 'max:255'],
            'volunteers' => ['required', 'integer', 'min:0'],
            'strays' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'string', 'in:active,closed'],
        ]);

        $schedule->update($validated);

        AuditLog::log('feeding_route_update', "Updated feeding route zone '{$validated['zone']}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Feeding route updated successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Remove the specified feeding schedule route.
     */
    public function destroyFeedingSchedule(Request $request, FeedingSchedule $schedule): RedirectResponse
    {
        $schedule->delete();

        AuditLog::log('feeding_route_delete', "Deleted feeding route zone '{$schedule->zone}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Feeding route deleted successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Mark an individual event attendee (volunteer, registered user, or public guest) as completed and issue their certificate.
     */
    public function completeAttendee(Request $request, AssignedTask $task): RedirectResponse
    {
        $event = $task->event;
        if (! $event) {
            abort(404, 'Associated event not found.');
        }

        $hours = $request->input('hours_logged');
        $defaultHours = strtolower((string) $task->role) === 'participant' ? 2.0 : 4.0;
        $resolvedHours = $hours !== null ? (float) $hours : ((float) $task->hours_logged > 0 ? (float) $task->hours_logged : $defaultHours);

        $task->update([
            'status' => 'completed',
            'hours_logged' => $resolvedHours,
        ]);

        $issued = $this->issueCertificateForTask($event, $task);
        $recipientName = $task->user?->name ?? $task->guest_name ?? 'Attendee';

        AuditLog::log('event_attendee_complete', "Completed attendance & issued certificate for '{$recipientName}' in event '{$event->title}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $issued
                ? "Attendance completed and certificate issued & emailed to {$recipientName}!"
                : "Attendance completed for {$recipientName} (certificate was already issued).",
        ]);

        return redirect()->back();
    }

    /**
     * Bulk complete attendance & issue certificates to all active/completed attendees of an event.
     */
    public function issueEventCertificates(Request $request, Event $event): RedirectResponse
    {
        $tasks = AssignedTask::with('user')
            ->where('event_id', $event->id)
            ->whereIn('status', ['pending', 'completed'])
            ->get();

        if ($tasks->isEmpty()) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => 'There are no registered attendees for this event yet.',
            ]);

            return redirect()->back();
        }

        $issuedCount = 0;

        foreach ($tasks as $task) {
            if ($task->status !== 'completed') {
                $defaultHours = strtolower((string) $task->role) === 'participant' ? 2.0 : 4.0;
                $task->update([
                    'status' => 'completed',
                    'hours_logged' => (float) $task->hours_logged > 0 ? $task->hours_logged : $defaultHours,
                ]);
            }

            if ($this->issueCertificateForTask($event, $task)) {
                $issuedCount++;
            }
        }

        AuditLog::log('event_bulk_certificates_issue', "Issued {$issuedCount} certificate(s) for event '{$event->title}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $issuedCount > 0
                ? "Successfully issued and emailed {$issuedCount} certificate(s) to event attendees!"
                : 'All attendees for this event have already been issued their certificates.',
        ]);

        return redirect()->back();
    }

    /**
     * Issue and email an official certificate for a specific event attendee task if not already issued.
     */
    protected function issueCertificateForTask(Event $event, AssignedTask $task): bool
    {
        $task->loadMissing('user');

        $existingQuery = Certificate::query()->where('event_id', $event->id);
        if ($task->user_id !== null) {
            $existingQuery->where('user_id', $task->user_id);
        } elseif (! empty($task->guest_email)) {
            $existingQuery->whereRaw('LOWER(guest_email) = ?', [strtolower((string) $task->guest_email)]);
        } else {
            return false;
        }

        if ($existingQuery->exists()) {
            return false;
        }

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

        return true;
    }
}

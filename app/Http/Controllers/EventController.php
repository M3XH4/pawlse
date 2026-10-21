<?php

namespace App\Http\Controllers;

use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\FeedingSchedule;
use App\Models\User;
use App\Models\VolunteerApplication;
use App\Notifications\SubmissionEReceiptNotification;
use App\Support\EReceiptDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    /**
     * Display a listing of events and feeding schedules.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $category = $request->input('category', 'All');

        // Fetch events with search & category filters and pagination (approved & open only)
        $eventsQuery = Event::query()
            ->where('approval_status', 'approved')
            ->where('status', 'open')
            ->when($category !== 'All', function ($query) use ($category) {
                $query->where('category', $category);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('desc', 'like', "%{$search}%");
                });
            });

        $events = $eventsQuery->latest()->paginate(6, ['*'], 'events_page')->withQueryString();

        // Fetch feeding schedules with search and pagination
        $feedingQuery = FeedingSchedule::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('zone', 'like', "%{$search}%")
                        ->orWhere('day', 'like', "%{$search}%");
                });
            });

        $feedingSchedules = $feedingQuery->latest()->paginate(6, ['*'], 'feeding_page')->withQueryString();

        // Get user joined status for both events and schedules
        $user = $request->user();
        $joinedEventIds = [];
        $joinedScheduleIds = [];
        $joinedEventRoles = [];

        if ($user !== null) {
            $userTasks = AssignedTask::query()
                ->where('user_id', $user->id)
                ->whereIn('status', ['pending', 'completed'])
                ->get();

            $joinedEventIds = $userTasks->whereNotNull('event_id')->pluck('event_id')->values()->toArray();
            $joinedScheduleIds = $userTasks->whereNotNull('feeding_schedule_id')->pluck('feeding_schedule_id')->values()->toArray();

            foreach ($userTasks->whereNotNull('event_id') as $task) {
                $joinedEventRoles[$task->event_id] = $task->role;
            }
        }

        // Check if an event is requested via query param (?event=ID or ?id=ID) for sharing
        $sharedEventId = $request->input('event') ?? $request->input('id');
        $sharedEvent = null;
        if ($sharedEventId) {
            $sharedEvent = Event::find($sharedEventId);
        }

        return Inertia::render('events', [
            'events' => $events,
            'feedingSchedules' => $feedingSchedules,
            'filters' => [
                'search' => $search,
                'category' => $category,
            ],
            'joinedEventIds' => $joinedEventIds,
            'joinedScheduleIds' => $joinedScheduleIds,
            'joinedEventRoles' => $joinedEventRoles,
            'sharedEvent' => $sharedEvent,
        ])->withViewData([
            'sharedEvent' => $sharedEvent,
        ]);
    }

    /**
     * Join an event as a participant or volunteer.
     */
    public function joinEvent(Request $request, Event $event): RedirectResponse
    {
        $user = $request->user();
        $guestName = null;
        $guestEmail = null;
        $guestPhone = null;

        if ($user === null) {
            if (! $request->filled('guest_email') && ! $request->filled('guest_name')) {
                return redirect()->guest(route('login'));
            }

            $validatedGuest = $request->validate([
                'guest_name' => ['required', 'string', 'max:255'],
                'guest_email' => ['required', 'email', 'max:255'],
                'guest_phone' => ['nullable', 'string', 'max:50'],
            ]);

            $guestName = trim($validatedGuest['guest_name']);
            $guestEmail = strtolower(trim($validatedGuest['guest_email']));
            $guestPhone = ! empty($validatedGuest['guest_phone']) ? trim($validatedGuest['guest_phone']) : null;
            $role = 'Participant';

            // If a registered account matches this email, link it so it also appears in their dashboard
            $matchedUser = User::whereRaw('LOWER(email) = ?', [$guestEmail])->first();
        } else {
            $matchedUser = $user;
            $joinAs = $request->input('join_as', $user->hasRole('volunteer') ? 'volunteer' : 'participant');

            if ($joinAs === 'volunteer') {
                if (! $user->hasRole('volunteer')) {
                    Inertia::flash('toast', [
                        'type' => 'error',
                        'message' => 'Only approved volunteers can join events in a volunteer role. You can join as a participant instead.',
                    ]);

                    return redirect()->back();
                }

                $app = VolunteerApplication::query()
                    ->where('user_id', $user->id)
                    ->first();
                $role = $app ? $app->role : 'Volunteer Helper';
            } else {
                $role = 'Participant';
            }
        }

        $createdTask = null;

        try {
            DB::transaction(function () use ($event, $matchedUser, $guestName, $guestEmail, $guestPhone, $role, &$createdTask) {
                /** @var Event|null $lockedEvent */
                $lockedEvent = Event::query()->where('id', $event->id)->lockForUpdate()->first();

                if (! $lockedEvent || $lockedEvent->status !== 'open' || $lockedEvent->approval_status !== 'approved') {
                    throw new \RuntimeException('You could not join this event because it is not currently open for registration. Please browse our other open community events.');
                }

                $alreadyJoinedQuery = AssignedTask::query()
                    ->where('event_id', $lockedEvent->id)
                    ->whereIn('status', ['pending', 'completed']);

                if ($matchedUser !== null) {
                    $alreadyJoinedQuery->where('user_id', $matchedUser->id);
                } else {
                    $alreadyJoinedQuery->whereRaw('LOWER(guest_email) = ?', [$guestEmail]);
                }

                if ($alreadyJoinedQuery->lockForUpdate()->exists()) {
                    throw new \RuntimeException('You have already registered for this event.');
                }

                if ($lockedEvent->spots !== null && $lockedEvent->spots <= 0) {
                    throw new \RuntimeException('You could not join this event because all participant spots are now filled. Please check back later or join another upcoming event.');
                }

                $createdTask = AssignedTask::query()->create([
                    'user_id' => $matchedUser?->id,
                    'guest_name' => $matchedUser ? null : $guestName,
                    'guest_email' => $matchedUser ? null : $guestEmail,
                    'guest_phone' => $matchedUser ? null : $guestPhone,
                    'event_id' => $lockedEvent->id,
                    'role' => $role,
                    'status' => 'pending',
                ]);

                if ($lockedEvent->spots !== null) {
                    $lockedEvent->decrement('spots');
                }

                $actorLabel = $matchedUser ? "User '{$matchedUser->name}'" : "Guest '{$guestName}' ({$guestEmail})";
                AuditLog::log('event_join', "{$actorLabel} joined event '{$lockedEvent->title}' as {$role}");
            });
        } catch (\RuntimeException $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $e->getMessage(),
            ]);

            return redirect()->back();
        }

        if ($createdTask instanceof AssignedTask) {
            $recipientName = $matchedUser?->name ?? $guestName ?? 'Community Participant';
            $recipientEmail = $matchedUser?->email ?? $guestEmail ?? '';

            if ($recipientEmail !== '') {
                EReceiptDispatcher::sendToUserAndEmail(
                    $matchedUser,
                    $recipientEmail,
                    SubmissionEReceiptNotification::forEventRegistration(
                        $event,
                        $createdTask,
                        $recipientName,
                        $recipientEmail,
                        $guestPhone
                    )
                );
            }
        }

        $successMsg = $user === null
            ? "You are registered for {$event->title}! A confirmation e-receipt has been sent to {$guestEmail}."
            : ($role === 'Participant'
                ? 'Successfully joined the event as a participant! Confirmation details have been sent to your email.'
                : 'Successfully joined the event as a volunteer! Confirmation details have been sent to your email.');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $successMsg,
        ]);

        return redirect()->back();
    }

    /**
     * Leave / Cancel attendance for an event.
     */
    public function leaveEvent(Request $request, Event $event): RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        try {
            DB::transaction(function () use ($event, $user) {
                /** @var Event|null $lockedEvent */
                $lockedEvent = Event::query()->where('id', $event->id)->lockForUpdate()->first();

                $task = AssignedTask::query()
                    ->where('user_id', $user->id)
                    ->where('event_id', $event->id)
                    ->where('status', 'pending')
                    ->lockForUpdate()
                    ->first();

                if (! $task) {
                    throw new \RuntimeException('You are not currently registered for this event or attendance has already been completed.');
                }

                $task->delete();

                if ($lockedEvent && $lockedEvent->spots !== null) {
                    $lockedEvent->increment('spots');
                }

                AuditLog::log('event_leave', "User '{$user->name}' cancelled attendance for event '{$lockedEvent?->title}'");
            });
        } catch (\RuntimeException $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $e->getMessage(),
            ]);

            return redirect()->back();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Successfully cancelled your event participation.',
        ]);

        return redirect()->back();
    }

    /**
     * Join a feeding schedule route (volunteers only).
     */
    public function joinFeedingRoute(Request $request, FeedingSchedule $schedule): RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        if (! $user->hasRole('volunteer')) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Only approved volunteers can join feeding schedules. Please apply as a volunteer to participate in feeding routes.',
            ]);

            return redirect()->back();
        }

        $requestedRole = $request->validate([
            'role' => ['nullable', 'string', 'max:100'],
        ])['role'] ?? null;

        try {
            DB::transaction(function () use ($schedule, $user, $requestedRole) {
                /** @var FeedingSchedule|null $lockedSchedule */
                $lockedSchedule = FeedingSchedule::query()->where('id', $schedule->id)->lockForUpdate()->first();

                if (! $lockedSchedule || $lockedSchedule->status !== 'active') {
                    throw new \RuntimeException('You could not join this feeding route because it is currently inactive. Please select an active feeding route instead.');
                }

                $alreadyJoined = AssignedTask::query()
                    ->where('user_id', $user->id)
                    ->where('feeding_schedule_id', $lockedSchedule->id)
                    ->whereIn('status', ['pending', 'completed'])
                    ->lockForUpdate()
                    ->exists();

                if ($alreadyJoined) {
                    throw new \RuntimeException('You have already joined this feeding route. You can check your schedule in your Assigned Tasks tab.');
                }

                // Check capacity limit if volunteer quota is defined
                if ($lockedSchedule->volunteers > 0) {
                    $activeVolunteersCount = AssignedTask::query()
                        ->where('feeding_schedule_id', $lockedSchedule->id)
                        ->whereIn('status', ['pending', 'completed'])
                        ->lockForUpdate()
                        ->count();

                    if ($activeVolunteersCount >= $lockedSchedule->volunteers) {
                        throw new \RuntimeException('You could not join this feeding route because all volunteer slots for this zone are full. Please choose another feeding route or day.');
                    }
                }

                $volunteerRole = $requestedRole
                    ?? VolunteerApplication::query()
                        ->where('user_id', $user->id)
                        ->where('status', 'approved')
                        ->value('role')
                    ?? 'Food Carrier';

                AssignedTask::query()->create([
                    'user_id' => $user->id,
                    'feeding_schedule_id' => $lockedSchedule->id,
                    'role' => $volunteerRole,
                    'status' => 'pending',
                ]);

                AuditLog::log('volunteer_join_feeding_route', "Joined feeding route zone '{$lockedSchedule->zone}' on {$lockedSchedule->day} as {$volunteerRole}");
            });
        } catch (\RuntimeException $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $e->getMessage(),
            ]);

            return redirect()->back();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Successfully joined the feeding route!',
        ]);

        return redirect()->back();
    }

    /**
     * Leave a feeding schedule route.
     */
    public function leaveFeedingRoute(Request $request, FeedingSchedule $schedule): RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        try {
            DB::transaction(function () use ($schedule, $user) {
                $task = AssignedTask::query()
                    ->where('user_id', $user->id)
                    ->where('feeding_schedule_id', $schedule->id)
                    ->where('status', 'pending')
                    ->lockForUpdate()
                    ->first();

                if (! $task) {
                    throw new \RuntimeException('You are not currently assigned to this feeding route.');
                }

                $task->delete();

                AuditLog::log('volunteer_leave_feeding_route', "Left feeding route zone '{$schedule->zone}' on {$schedule->day}");
            });
        } catch (\RuntimeException $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $e->getMessage(),
            ]);

            return redirect()->back();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Successfully left the feeding route.',
        ]);

        return redirect()->back();
    }

    /**
     * Show joined events on user dashboard tab.
     */
    public function userJoinedEvents(Request $request): Response
    {
        $user = $request->user();

        $tasks = AssignedTask::with('event')
            ->where('user_id', $user->id)
            ->whereNotNull('event_id')
            ->whereIn('status', ['pending', 'completed'])
            ->latest()
            ->paginate(8);

        $certificatesByEvent = Certificate::query()
            ->where('user_id', $user->id)
            ->whereNotNull('event_id')
            ->pluck('id', 'event_id')
            ->toArray();

        return Inertia::render('user/joined-events', [
            'tasks' => $tasks,
            'certificatesByEvent' => $certificatesByEvent,
        ]);
    }

    /**
     * Render a signed public certificate view for email recipients (including public guests).
     */
    public function showPublicCertificate(Request $request, Certificate $certificate): Response
    {
        $certificate->load(['event', 'user']);

        return Inertia::render('public-certificate', [
            'certificate' => $certificate,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Event;
use App\Models\FeedingSchedule;
use App\Models\VolunteerApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        // Fetch events with search & category filters and pagination
        $eventsQuery = Event::query()
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

        if ($user !== null) {
            $joinedEventIds = AssignedTask::query()
                ->where('user_id', $user->id)
                ->whereNotNull('event_id')
                ->whereIn('status', ['pending', 'completed'])
                ->pluck('event_id')
                ->toArray();

            $joinedScheduleIds = AssignedTask::query()
                ->where('user_id', $user->id)
                ->whereNotNull('feeding_schedule_id')
                ->whereIn('status', ['pending', 'completed'])
                ->pluck('feeding_schedule_id')
                ->toArray();
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
        ]);
    }

    /**
     * Join an event.
     */
    public function joinEvent(Request $request, Event $event): RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        if (! $user->hasRole('volunteer')) {
            return redirect()->route('home')->withErrors([
                'error' => 'Only approved volunteers can join events directly.',
            ]);
        }

        // Check if event is open
        if ($event->status !== 'open') {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This event is closed and cannot be joined.',
            ]);

            return redirect()->back();
        }

        // Check if already joined
        $alreadyJoined = AssignedTask::query()
            ->where('user_id', $user->id)
            ->where('event_id', $event->id)
            ->exists();

        if ($alreadyJoined) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'You have already joined this event.',
            ]);

            return redirect()->back();
        }

        // Check spots limit
        if ($event->spots !== null && $event->spots <= 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This event is fully booked.',
            ]);

            return redirect()->back();
        }

        // Get user's preferred volunteer role
        $app = VolunteerApplication::query()
            ->where('user_id', $user->id)
            ->first();
        $role = $app ? $app->role : 'Helper';

        AssignedTask::query()->create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'role' => $role,
            'status' => 'pending',
        ]);

        if ($event->spots !== null) {
            $event->decrement('spots');
        }

        AuditLog::log('volunteer_join_event', "Joined event '{$event->title}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Successfully joined the event!',
        ]);

        return redirect()->back();
    }

    /**
     * Join a feeding schedule route.
     */
    public function joinFeedingRoute(Request $request, FeedingSchedule $schedule): RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        if (! $user->hasRole('volunteer')) {
            return redirect()->route('home')->withErrors([
                'error' => 'Only approved volunteers can join feeding routes directly.',
            ]);
        }

        // Check if route is active
        if ($schedule->status !== 'active') {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This feeding route is inactive.',
            ]);

            return redirect()->back();
        }

        // Check if already joined
        $alreadyJoined = AssignedTask::query()
            ->where('user_id', $user->id)
            ->where('feeding_schedule_id', $schedule->id)
            ->exists();

        if ($alreadyJoined) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'You have already joined this feeding route.',
            ]);

            return redirect()->back();
        }

        AssignedTask::query()->create([
            'user_id' => $user->id,
            'feeding_schedule_id' => $schedule->id,
            'role' => 'Food Carrier',
            'status' => 'pending',
        ]);

        AuditLog::log('volunteer_join_feeding_route', "Joined feeding route zone '{$schedule->zone}' on {$schedule->day}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Successfully joined the feeding route!',
        ]);

        return redirect()->back();
    }
}

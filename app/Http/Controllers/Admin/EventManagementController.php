<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\FeedingSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        // Events Query
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

        $events = $eventsQuery->latest()->paginate(10, ['*'], 'events_page')->withQueryString();

        // Feeding Schedules Query
        $feedingQuery = FeedingSchedule::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('zone', 'like', "%{$search}%")
                        ->orWhere('day', 'like', "%{$search}%");
                });
            });

        $feedingSchedules = $feedingQuery->latest()->paginate(10, ['*'], 'feeding_page')->withQueryString();

        return Inertia::render('admin/events', [
            'events' => $events,
            'feedingSchedules' => $feedingSchedules,
            'filters' => [
                'search' => $search,
                'category' => $category,
            ],
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

        Event::query()->create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'date' => $validated['date'],
            'time' => $validated['time'],
            'location' => $validated['location'],
            'spots' => $validated['spots'] === -1 ? null : $validated['spots'],
            'desc' => $validated['desc'],
            'keywords' => $validated['keywords'] ?? [],
            'img' => $validated['img'],
            'status' => 'open',
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Event created successfully.',
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

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Event updated successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Toggle status of the specified event.
     */
    public function toggleEventStatus(Request $request, Event $event): RedirectResponse
    {
        $newStatus = $event->status === 'open' ? 'closed' : 'open';
        $event->update(['status' => $newStatus]);

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

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Feeding route deleted successfully.',
        ]);

        return redirect()->back();
    }
}

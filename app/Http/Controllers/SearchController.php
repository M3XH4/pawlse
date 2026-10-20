<?php

namespace App\Http\Controllers;

use App\Enums\ShelterAnimalStatus;
use App\Models\BlogPost;
use App\Models\Event;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    /**
     * Handle multi-resource global search.
     */
    public function index(Request $request): Response
    {
        $query = trim((string) $request->input('q', ''));

        if ($query === '') {
            return Inertia::render('search', [
                'query' => '',
                'results' => [
                    'pets' => [],
                    'events' => [],
                    'articles' => [],
                    'reports' => [],
                ],
                'counts' => [
                    'total' => 0,
                    'pets' => 0,
                    'events' => 0,
                    'articles' => 0,
                    'reports' => 0,
                ],
            ]);
        }

        // 1. Search Pets
        $pets = ShelterAnimal::query()
            ->where('status', ShelterAnimalStatus::Available)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('breed', 'like', "%{$query}%")
                    ->orWhere('story', 'like', "%{$query}%")
                    ->orWhere('behavior', 'like', "%{$query}%");
            })
            ->latest()
            ->take(8)
            ->get()
            ->map(function (ShelterAnimal $pet) {
                return [
                    'id' => $pet->id,
                    'name' => $pet->name,
                    'type' => $pet->type?->value ?? 'Dog',
                    'breed' => $pet->breed ?? 'Mixed Breed',
                    'age' => $pet->age ?? '1 year',
                    'photo' => $pet->photo_url ?: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800',
                    'story' => $pet->story ?? 'Rescued and waiting for a loving home.',
                    'url' => route('adopt.show', $pet->id),
                ];
            });

        // 2. Search Events
        $events = Event::query()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('desc', 'like', "%{$query}%")
                    ->orWhere('location', 'like', "%{$query}%")
                    ->orWhere('category', 'like', "%{$query}%");
            })
            ->latest()
            ->take(6)
            ->get()
            ->map(function (Event $event) {
                $eventDate = $event->date ?? $event->event_date;

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'category' => $event->category ?? 'Community',
                    'date' => $eventDate ? (is_string($eventDate) ? $eventDate : $eventDate->format('M d, Y')) : 'Upcoming',
                    'time' => $event->time ?? '9:00 AM - 4:00 PM',
                    'location' => $event->location ?? 'Iligan City',
                    'img' => $event->img ?: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600',
                    'url' => route('events').'?event='.$event->id,
                ];
            });

        // 3. Search Articles / Blog Posts
        $articles = BlogPost::query()
            ->where('status', BlogPost::STATUS_PUBLISHED)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('excerpt', 'like', "%{$query}%")
                    ->orWhere('content', 'like', "%{$query}%");
            })
            ->latest('published_at')
            ->take(6)
            ->get()
            ->map(function (BlogPost $post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'excerpt' => $post->excerpt,
                    'category' => BlogPost::CATEGORIES[$post->category] ?? ucfirst($post->category),
                    'date' => $post->published_at ? $post->published_at->format('M d, Y') : $post->created_at->format('M d, Y'),
                    'featured_image' => $post->featured_image_url ?: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=600',
                    'url' => route('blog.show', $post->slug),
                ];
            });

        // 4. Search Pet Reports (Missing / Rescues)
        $reports = PetReport::query()
            ->where(function ($q) use ($query) {
                $q->where('pet_name', 'like', "%{$query}%")
                    ->orWhere('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhere('location', 'like', "%{$query}%")
                    ->orWhere('breed', 'like', "%{$query}%");
            })
            ->latest()
            ->take(6)
            ->get()
            ->map(function (PetReport $report) {
                return [
                    'id' => $report->id,
                    'pet_name' => $report->pet_name ?? $report->name ?? 'Pet Report',
                    'type' => $report->type ?? 'missing',
                    'breed' => $report->breed ?? 'Unknown',
                    'location' => $report->location ?? $report->location_address ?? 'Iligan City',
                    'photo_url' => $report->photo_url ?: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800',
                    'status' => $report->status ?? 'active',
                    'url' => route('missing'),
                ];
            });

        $petsCount = $pets->count();
        $eventsCount = $events->count();
        $articlesCount = $articles->count();
        $reportsCount = $reports->count();

        return Inertia::render('search', [
            'query' => $query,
            'results' => [
                'pets' => $pets,
                'events' => $events,
                'articles' => $articles,
                'reports' => $reports,
            ],
            'counts' => [
                'total' => $petsCount + $eventsCount + $articlesCount + $reportsCount,
                'pets' => $petsCount,
                'events' => $eventsCount,
                'articles' => $articlesCount,
                'reports' => $reportsCount,
            ],
        ]);
    }
}

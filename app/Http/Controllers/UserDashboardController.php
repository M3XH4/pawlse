<?php

namespace App\Http\Controllers;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\Role;
use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\AssignedTask;
use App\Models\BlogPost;
use App\Models\CareSustainability;
use App\Models\Donation;
use App\Models\Event;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use App\Models\ShelterVisit;
use App\Models\UserBadge;
use App\Models\VolunteerApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserDashboardController extends Controller
{
    /**
     * Display the user's home dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $sessionId = $request->session()->getId();

        // 1. Latest & featured generalized blog posts for the top carousel
        $blogPosts = BlogPost::query()
            ->with(['author:id,name,role,avatar_path', 'shelterAnimal:id,name,type,breed,photo_url'])
            ->published()
            ->orderByDesc('is_featured')
            ->latest('published_at')
            ->take(12)
            ->get();

        $reactionSummaries = BlogPost::loadReactionSummaries($blogPosts, $user?->id, $sessionId);

        $latestBlogs = $blogPosts
            ->map(function (BlogPost $post) use ($reactionSummaries): array {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'category' => $post->category,
                    'category_label' => BlogPost::CATEGORIES[$post->category] ?? Str::headline($post->category),
                    'summary' => $post->summary ?: Str::limit(strip_tags((string) $post->content), 140),
                    'featured_image' => $post->featured_image,
                    'reading_time_minutes' => $post->reading_time_minutes ?? 3,
                    'is_featured' => (bool) $post->is_featured,
                    'published_at' => $post->published_at?->toIso8601String(),
                    'views_count' => (int) $post->views_count,
                    'author' => $post->author ? [
                        'id' => $post->author->id,
                        'name' => $post->author->name,
                        'role' => $post->author->role,
                    ] : null,
                    'shelter_animal' => $post->shelterAnimal ? [
                        'id' => $post->shelterAnimal->id,
                        'name' => $post->shelterAnimal->name,
                        'type' => $post->shelterAnimal->type?->value ?? (string) $post->shelterAnimal->type,
                        'breed' => $post->shelterAnimal->breed,
                        'photo_url' => $post->shelterAnimal->photo_url,
                    ] : null,
                    'reaction_summary' => $reactionSummaries['counts'][$post->id] ?? $post->reaction_counts,
                    'user_reactions' => $reactionSummaries['userReactions'][$post->id] ?? [],
                ];
            })
            ->values();

        // 2. Featured available adoptable pets
        $featuredPets = ShelterAnimal::query()
            ->where('status', ShelterAnimalStatus::Available)
            ->latest()
            ->take(4)
            ->get()
            ->map(function (ShelterAnimal $pet): array {
                $type = $pet->type instanceof \BackedEnum ? (string) $pet->type->value : (string) ($pet->type ?? 'Pet');
                $gender = $pet->gender instanceof \BackedEnum ? (string) $pet->gender->value : (string) ($pet->gender ?? 'Unknown');

                return [
                    'id' => $pet->id,
                    'name' => $pet->name,
                    'type' => ucfirst($type),
                    'breed' => $pet->breed ?: 'Mixed Breed',
                    'age' => $pet->age ?: 'Young',
                    'gender' => ucfirst($gender),
                    'photo_url' => $pet->photo_url,
                    'story' => Str::limit((string) ($pet->story ?: 'Waiting for a loving forever home.'), 90),
                ];
            })
            ->values();

        // 3. Personal activity counts
        $adoptionApplicationsCount = AdoptionApplication::query()
            ->where('user_id', $user->id)
            ->count();

        $activeAdoptionApplicationsCount = AdoptionApplication::query()
            ->where('user_id', $user->id)
            ->whereIn('status', [
                AdoptionApplicationStatus::Pending,
                AdoptionApplicationStatus::Scheduled,
            ])
            ->count();

        $rescueReportsCount = PetReport::query()
            ->where('user_id', $user->id)
            ->whereIn('type', ['rescue', 'sos'])
            ->count();

        $missingReportsCount = PetReport::query()
            ->where('user_id', $user->id)
            ->where('type', 'missing')
            ->count();

        $donationsCount = Donation::query()
            ->where('user_id', $user->id)
            ->count();

        $joinedEventsCount = AssignedTask::query()
            ->where('user_id', $user->id)
            ->whereNotNull('event_id')
            ->count();

        $shelterVisitsCount = ShelterVisit::query()
            ->where('user_id', $user->id)
            ->count();

        $badgesCount = UserBadge::query()
            ->where('user_id', $user->id)
            ->count();

        // 4. Recent personal activity feed (up to 4 items)
        $recentApplications = AdoptionApplication::query()
            ->with('shelterAnimal:id,name')
            ->where('user_id', $user->id)
            ->latest()
            ->take(2)
            ->get()
            ->map(function (AdoptionApplication $app): array {
                $statusVal = $app->status instanceof \BackedEnum ? (string) $app->status->value : (string) $app->status;
                $petName = $app->shelterAnimal?->name ?? 'a shelter pet';

                return [
                    'id' => 'adoption-'.$app->id,
                    'kind' => 'adoption',
                    'title' => "Adoption application for {$petName}",
                    'status' => ucfirst(str_replace('_', ' ', $statusVal)),
                    'date' => $app->created_at?->toIso8601String(),
                    'href' => '/account/user/adoption-applications',
                    'timestamp' => $app->created_at?->timestamp ?? 0,
                ];
            });

        $recentReports = PetReport::query()
            ->where('user_id', $user->id)
            ->latest()
            ->take(2)
            ->get()
            ->map(function (PetReport $report): array {
                $statusVal = $report->status instanceof \BackedEnum ? (string) $report->status->value : (string) $report->status;
                $isMissing = $report->type === 'missing';

                return [
                    'id' => 'report-'.$report->id,
                    'kind' => $isMissing ? 'missing' : 'rescue',
                    'title' => $isMissing
                        ? 'Missing pet report'.($report->name ? ": {$report->name}" : '')
                        : 'Rescue report'.($report->location ? " at {$report->location}" : ''),
                    'status' => ucfirst(str_replace('_', ' ', $statusVal)),
                    'date' => $report->created_at?->toIso8601String(),
                    'href' => $isMissing ? '/account/user/missing-found' : '/account/user/rescue-reports',
                    'timestamp' => $report->created_at?->timestamp ?? 0,
                ];
            });

        $recentActivities = $recentApplications
            ->concat($recentReports)
            ->sortByDesc('timestamp')
            ->take(4)
            ->map(fn (array $item): array => collect($item)->except('timestamp')->all())
            ->values();

        // 5. Upcoming community events
        $upcomingEvents = Event::query()
            ->upcoming()
            ->take(3)
            ->get()
            ->map(fn (Event $event): array => [
                'id' => $event->id,
                'title' => $event->title,
                'date' => $event->date?->format('M d, Y'),
                'time' => $event->time,
                'location' => $event->location ?: 'Pawlse Shelter',
                'type' => $event->type ? Str::headline((string) $event->type) : 'Community Event',
            ])
            ->values();

        // 6. Shelter & Community Impact Pulse
        $sustainability = CareSustainability::current()->toPublicArray();
        $communityPulse = [
            'petsAdoptedCount' => ShelterAnimal::query()->where('status', ShelterAnimalStatus::Adopted)->count(),
            'petsAvailableCount' => ShelterAnimal::query()->where('status', ShelterAnimalStatus::Available)->count(),
            'activeRescuesCount' => PetReport::query()
                ->whereIn('type', ['rescue', 'sos'])
                ->whereIn('status', ['pending', 'assigned', 'in_progress'])
                ->count(),
            'careSustainability' => [
                'estDays' => $sustainability['est_days'],
                'urgencyStatus' => $sustainability['urgency_status'],
                'urgencyLabel' => $sustainability['urgency_label'],
                'resourceCategory' => $sustainability['resource_category'],
            ],
        ];

        // 7. Urgent Missing Pet Alerts
        $missingAlerts = PetReport::query()
            ->with('photos')
            ->where('type', 'missing')
            ->whereNotIn('status', ['duplicate', 'cancelled', 'reunited', 'resolved'])
            ->latest('id')
            ->take(3)
            ->get()
            ->map(function (PetReport $report): array {
                $species = $report->animal_type ?? $report->species ?? 'Pet';
                $speciesVal = $species instanceof \BackedEnum ? (string) $species->value : (string) $species;
                $photoPath = $report->photos->first()?->path;
                $photoUrl = $photoPath
                    ? (Str::startsWith($photoPath, ['http://', 'https://', '/']) ? $photoPath : '/storage/'.ltrim($photoPath, '/'))
                    : null;

                return [
                    'id' => $report->id,
                    'name' => $report->name ?: 'Missing Pet',
                    'species' => ucfirst($speciesVal),
                    'breed' => $report->breed ?: 'Mixed Breed',
                    'location' => $report->location ?: 'Iligan City',
                    'photo_url' => $photoUrl,
                    'reported_at' => $report->created_at?->diffForHumans() ?: 'Recently',
                ];
            })
            ->values();

        // 8. Getting Started / Next Steps & Volunteer Invite
        $hasSharedStory = BlogPost::query()->where('author_id', $user->id)->exists();
        $volunteerAppStatus = VolunteerApplication::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->value('status');
        $volunteerAppStatusVal = $volunteerAppStatus instanceof \BackedEnum
            ? (string) $volunteerAppStatus->value
            : ($volunteerAppStatus ? (string) $volunteerAppStatus : null);

        return Inertia::render('user/dashboard', [
            'latestBlogs' => $latestBlogs,
            'blogCategories' => BlogPost::CATEGORIES,
            'featuredPets' => $featuredPets,
            'upcomingEvents' => $upcomingEvents,
            'recentActivities' => $recentActivities,
            'communityPulse' => $communityPulse,
            'missingAlerts' => $missingAlerts,
            'gettingStarted' => [
                'hasSubmittedApplicationOrReport' => $adoptionApplicationsCount > 0 || $rescueReportsCount > 0 || $missingReportsCount > 0,
                'hasJoinedEvent' => $joinedEventsCount > 0,
                'hasEarnedBadge' => $badgesCount > 0,
                'hasSharedStory' => $hasSharedStory,
            ],
            'volunteerInvite' => [
                'isVolunteer' => $user->hasRole(Role::Volunteer->value),
                'applicationStatus' => $volunteerAppStatusVal,
                'isFosterParent' => $user->isApprovedFosterParent(),
            ],
            'stats' => [
                'adoptionApplicationsCount' => $adoptionApplicationsCount,
                'activeAdoptionApplicationsCount' => $activeAdoptionApplicationsCount,
                'rescueReportsCount' => $rescueReportsCount,
                'missingReportsCount' => $missingReportsCount,
                'donationsCount' => $donationsCount,
                'joinedEventsCount' => $joinedEventsCount,
                'shelterVisitsCount' => $shelterVisitsCount,
                'badgesCount' => $badgesCount,
            ],
        ]);
    }
}

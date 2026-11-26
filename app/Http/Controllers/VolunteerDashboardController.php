<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Badge;
use App\Models\BlogPost;
use App\Models\CareSustainability;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\FeedingDistributionLog;
use App\Models\FeedingSchedule;
use App\Models\FosterParent;
use App\Models\FosterPlacement;
use App\Models\PartnerFoodPickup;
use App\Models\PetReport;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\UserBadge;
use App\Models\VolunteerApplication;
use App\Models\VolunteerInjuryReport;
use App\Services\FieldGroupLifecycleService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VolunteerDashboardController extends Controller
{
    /**
     * Display the volunteer home dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $sessionId = $request->session()->getId();

        $application = VolunteerApplication::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [strtolower((string) $user->email)]);
            })
            ->latest()
            ->first();

        $fosterParent = FosterParent::where('user_id', $user->id)->first();

        $pendingTasksQuery = AssignedTask::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending');

        $pendingTasksCount = (clone $pendingTasksQuery)->count();
        $completedTasksCount = AssignedTask::query()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();
        $totalHours = (float) AssignedTask::query()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->sum('hours_logged');

        $pendingTasks = (clone $pendingTasksQuery)
            ->with([
                'event.assignedTasks' => fn ($q) => $q->whereIn('status', ['pending', 'completed'])->with('user:id,name,avatar_path'),
                'feedingSchedule.assignedTasks' => fn ($q) => $q->whereIn('status', ['pending', 'completed'])->with('user:id,name,avatar_path'),
                'petReport',
                'partnerFoodPickup.partner',
            ])
            ->latest()
            ->get();

        $myFieldTeams = $pendingTasks
            ->filter(fn (AssignedTask $task): bool => $task->feedingSchedule !== null || $task->event !== null)
            ->map(function (AssignedTask $task) use ($user): array {
                $isFeeding = $task->feedingSchedule !== null;
                $groupName = $isFeeding
                    ? $task->feedingSchedule->zone
                    : $task->event->title;
                $scheduleText = $isFeeding
                    ? "{$task->feedingSchedule->day} • {$task->feedingSchedule->time}"
                    : (($task->event->date?->format('M d, Y') ?? '').($task->event->time ? " • {$task->event->time}" : ''));
                $rosterCollection = $isFeeding
                    ? $task->feedingSchedule->assignedTasks
                    : $task->event->assignedTasks;

                $members = $rosterCollection
                    ->filter(fn (AssignedTask $m): bool => $m->user !== null)
                    ->map(function (AssignedTask $m) use ($user): array {
                        $roleLower = strtolower((string) $m->role);

                        return [
                            'id' => $m->id,
                            'user_id' => $m->user_id,
                            'name' => $m->user->name,
                            'avatar_path' => $m->user->avatar_path,
                            'role' => $m->role,
                            'is_me' => $m->user_id === $user->id,
                            'is_medic' => str_contains($roleLower, 'medic'),
                            'is_lead' => str_contains($roleLower, 'lead'),
                            'is_recorder' => str_contains($roleLower, 'recorder'),
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
                    ->values()
                    ->all();

                return [
                    'task_id' => $task->id,
                    'group_type' => $isFeeding ? 'Feeding Route Team' : 'Event Team',
                    'group_type_key' => $isFeeding ? 'feeding' : 'event',
                    'group_id' => $isFeeding ? $task->feeding_schedule_id : $task->event_id,
                    'group_name' => $groupName,
                    'schedule' => $scheduleText,
                    'execution_status' => $isFeeding ? ($task->feedingSchedule->execution_status ?? 'scheduled') : null,
                    'is_disbanded' => $isFeeding ? $task->feedingSchedule->isDisbanded() : $task->event->isDisbanded(),
                    'my_role' => $task->role,
                    'members' => $members,
                ];
            })
            ->values();

        $activeMissions = $pendingTasks
            ->take(4)
            ->map(fn (AssignedTask $task): array => $this->formatActiveMission($task))
            ->values();

        $taskBreakdown = [
            'rescueCount' => $pendingTasks->whereNotNull('pet_report_id')->count(),
            'foodPickupCount' => $pendingTasks->whereNotNull('partner_food_pickup_id')->count(),
            'feedingCount' => $pendingTasks->whereNotNull('feeding_schedule_id')->count(),
            'eventCount' => $pendingTasks->whereNotNull('event_id')->count(),
        ];

        $activeFosterPlacements = FosterPlacement::with(['shelterAnimal'])
            ->where('foster_parent_user_id', $user->id)
            ->where('status', 'active')
            ->latest('start_date')
            ->get();

        $firstPlacement = $activeFosterPlacements->first();
        $fosterSpotlight = $firstPlacement?->shelterAnimal ? [
            'id' => $firstPlacement->id,
            'pet_name' => $firstPlacement->shelterAnimal->name,
            'pet_type' => $firstPlacement->shelterAnimal->type?->value ?? (string) $firstPlacement->shelterAnimal->type,
            'breed' => $firstPlacement->shelterAnimal->breed ?: 'Mixed Breed',
            'photo_url' => $firstPlacement->shelterAnimal->photo_url,
            'days_in_care' => $firstPlacement->start_date ? max(0, (int) abs($firstPlacement->start_date->diffInDays(now()))) : 0,
            'care_instructions' => $firstPlacement->care_instructions,
            'expected_review_date' => $firstPlacement->expected_review_date?->format('M d, Y'),
            'is_review_near_or_overdue' => $firstPlacement->expected_review_date
                ? $firstPlacement->expected_review_date->diffInDays(now(), false) >= -3
                : false,
        ] : null;

        $badgesCount = UserBadge::query()
            ->where('user_id', $user->id)
            ->whereNotNull('unlocked_at')
            ->whereHas('badge', fn ($q) => $q->where('audience', Badge::AUDIENCE_VOLUNTEER))
            ->count();

        $recentBadges = UserBadge::with('badge')
            ->where('user_id', $user->id)
            ->whereNotNull('unlocked_at')
            ->whereHas('badge', fn ($q) => $q->where('audience', Badge::AUDIENCE_VOLUNTEER))
            ->orderByDesc('is_pinned')
            ->latest('unlocked_at')
            ->take(3)
            ->get()
            ->map(fn (UserBadge $ub): array => [
                'id' => $ub->badge->id,
                'name' => $ub->badge->name,
                'description' => $ub->badge->description,
                'tier' => $ub->badge->tier,
                'is_pinned' => (bool) $ub->is_pinned,
                'image_path' => $ub->badge->image_path,
                'unlocked_at' => $ub->unlocked_at?->toDateString(),
            ])
            ->values();

        $certificatesCount = Certificate::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(guest_email) = ?', [strtolower((string) $user->email)]);
            })
            ->count();

        $assignedRescuesCount = PetReport::query()
            ->where('assigned_volunteer_id', $user->id)
            ->whereIn('status', ['pending', 'assigned', 'in_progress'])
            ->count();

        $joinedEventIds = AssignedTask::query()
            ->where('user_id', $user->id)
            ->whereNotNull('event_id')
            ->pluck('event_id')
            ->all();

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
                'type' => $event->category ? Str::headline((string) $event->category) : 'Volunteer Event',
                'spots' => $event->spots,
                'is_joined' => in_array($event->id, $joinedEventIds, true),
            ])
            ->values();

        $sustainability = CareSustainability::current()->toPublicArray();
        $shelterPulse = [
            'estDays' => $sustainability['est_days'],
            'urgencyStatus' => $sustainability['urgency_status'],
            'urgencyLabel' => $sustainability['urgency_label'],
            'resourceCategory' => $sustainability['resource_category'],
        ];

        $recentMilestones = $this->getRecentMilestones($user);

        $communityVolunteersPulse = [
            'activeVolunteersCount' => User::query()->where('role', Role::Volunteer->value)->count(),
            'monthlyHoursLogged' => (float) AssignedTask::query()
                ->where('status', 'completed')
                ->whereBetween('updated_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->sum('hours_logged'),
            'monthlyMissionsCompleted' => AssignedTask::query()
                ->where('status', 'completed')
                ->whereBetween('updated_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->count(),
        ];

        $urgentSosAlerts = PetReport::query()
            ->where('type', 'sos')
            ->whereNull('assigned_volunteer_id')
            ->whereIn('status', ['pending', 'in_progress'])
            ->latest()
            ->take(3)
            ->get()
            ->map(fn (PetReport $report): array => [
                'id' => $report->id,
                'animal_type' => ucfirst((string) ($report->animal_type ?? $report->species ?? 'Animal')),
                'location' => $report->location ?: ($report->landmark ?: 'Location pending'),
                'reported_at' => $report->created_at?->diffForHumans() ?? 'Just now',
            ])
            ->values();

        $blogPosts = BlogPost::query()
            ->with(['author:id,name,role,avatar_path', 'shelterAnimal:id,name,type,breed,photo_url'])
            ->published()
            ->orderByDesc('is_featured')
            ->latest('published_at')
            ->take(6)
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

        $injuryReportsQuery = VolunteerInjuryReport::query()
            ->where('user_id', $user->id);

        $injuryReportsSummary = [
            'total' => (clone $injuryReportsQuery)->count(),
            'openCount' => (clone $injuryReportsQuery)
                ->whereIn('status', [VolunteerInjuryReport::StatusReported, VolunteerInjuryReport::StatusMedicalAidInitiated])
                ->count(),
            'recentReports' => (clone $injuryReportsQuery)
                ->latest()
                ->take(3)
                ->get()
                ->map(fn (VolunteerInjuryReport $report): array => [
                    'id' => $report->id,
                    'incident_type' => $report->incident_type,
                    'incident_label' => VolunteerInjuryReport::INCIDENT_TYPES[$report->incident_type] ?? $report->incident_type,
                    'severity' => $report->severity,
                    'status' => $report->status,
                    'medical_aid_type' => $report->medical_aid_type,
                    'incident_occurred_at' => $report->incident_occurred_at?->toIso8601String(),
                ])
                ->values(),
        ];

        return Inertia::render('volunteer/dashboard', [
            'volunteerSummary' => [
                'role' => $application?->role ?? 'Volunteer',
                'reference_number' => $application?->reference_number,
                'member_since' => ($application?->created_at ?? $user->created_at)?->format('M Y'),
                'is_approved_foster' => $user->isApprovedFosterParent(),
                'foster_status' => $fosterParent?->status,
            ],
            'impactTier' => $this->resolveImpactTier($totalHours, $completedTasksCount),
            'stats' => [
                'pendingTasksCount' => $pendingTasksCount,
                'completedTasksCount' => $completedTasksCount,
                'totalHours' => $totalHours,
                'activeFosterCount' => $activeFosterPlacements->count(),
                'assignedRescuesCount' => $assignedRescuesCount,
                'badgesCount' => $badgesCount,
                'certificatesCount' => $certificatesCount,
                'taskBreakdown' => $taskBreakdown,
            ],
            'activeMissions' => $activeMissions,
            'fosterSpotlight' => $fosterSpotlight,
            'readinessChecklist' => [
                'hasProfile' => $application !== null || filled($user->name),
                'hasCompletedMission' => $completedTasksCount > 0,
                'hasEarnedBadge' => $badgesCount > 0,
                'hasFosterOrCertificate' => $user->isApprovedFosterParent() || $certificatesCount > 0,
            ],
            'recentBadges' => $recentBadges,
            'upcomingEvents' => $upcomingEvents,
            'shelterPulse' => $shelterPulse,
            'communityVolunteersPulse' => $communityVolunteersPulse,
            'urgentSosAlerts' => $urgentSosAlerts,
            'recentMilestones' => $recentMilestones,
            'latestBlogs' => $latestBlogs,
            'blogCategories' => BlogPost::CATEGORIES,
            'volunteerMapEnabled' => $this->isVolunteerMapEnabled(),
            'injuryReportsSummary' => $injuryReportsSummary,
            'myFieldTeams' => $myFieldTeams,
        ]);
    }

    /**
     * Compute the volunteer's current impact tier and progress toward the next tier.
     *
     * @return array<string, mixed>
     */
    private function resolveImpactTier(float $totalHours, int $completedTasksCount): array
    {
        $score = (int) round($totalHours * 10) + ($completedTasksCount * 15);

        $tiers = [
            ['name' => 'Newcomer', 'min' => 0],
            ['name' => 'Paws Helper', 'min' => 50],
            ['name' => 'Shelter Champion', 'min' => 150],
            ['name' => 'Rescue Hero', 'min' => 350],
        ];

        $currentIndex = 0;
        foreach ($tiers as $index => $tier) {
            if ($score >= $tier['min']) {
                $currentIndex = $index;
            }
        }

        $currentTier = $tiers[$currentIndex];
        $nextTier = $tiers[$currentIndex + 1] ?? null;

        if ($nextTier === null) {
            return [
                'name' => $currentTier['name'],
                'score' => $score,
                'nextTierName' => null,
                'pointsToNext' => 0,
                'progressPercent' => 100,
            ];
        }

        $range = max(1, $nextTier['min'] - $currentTier['min']);
        $progress = (int) min(100, max(0, round((($score - $currentTier['min']) / $range) * 100)));

        return [
            'name' => $currentTier['name'],
            'score' => $score,
            'nextTierName' => $nextTier['name'],
            'pointsToNext' => max(0, $nextTier['min'] - $score),
            'progressPercent' => $progress,
        ];
    }

    /**
     * Build a compact chronological feed of recent completed tasks, badges, and certificates.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getRecentMilestones(User $user): array
    {
        $completedTasks = AssignedTask::with(['event', 'feedingSchedule', 'petReport', 'partnerFoodPickup.partner'])
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->latest('updated_at')
            ->take(3)
            ->get()
            ->map(function (AssignedTask $task): array {
                $label = $task->event?->title
                    ?? $task->feedingSchedule?->zone
                    ?? ($task->partnerFoodPickup?->partner ? 'Pickup: '.$task->partnerFoodPickup->partner->name : null)
                    ?? ($task->petReport ? 'Rescue #'.$task->petReport->id : ($task->role ?: 'Volunteer Shift'));

                return [
                    'id' => 'task-'.$task->id,
                    'kind' => 'task',
                    'title' => "Completed {$label}",
                    'meta' => $task->hours_logged ? "{$task->hours_logged}h logged" : 'Completed shift',
                    'date' => $task->updated_at?->diffForHumans() ?? 'Recently',
                    'timestamp' => $task->updated_at?->timestamp ?? 0,
                    'href' => route('account.volunteer.participation-history'),
                ];
            });

        $earnedBadges = UserBadge::with('badge')
            ->where('user_id', $user->id)
            ->whereNotNull('unlocked_at')
            ->whereHas('badge', fn ($q) => $q->where('audience', Badge::AUDIENCE_VOLUNTEER))
            ->latest('unlocked_at')
            ->take(3)
            ->get()
            ->map(fn (UserBadge $ub): array => [
                'id' => 'badge-'.$ub->id,
                'kind' => 'badge',
                'title' => "Unlocked {$ub->badge->name}",
                'meta' => 'Volunteer Badge',
                'date' => $ub->unlocked_at?->diffForHumans() ?? 'Recently',
                'timestamp' => $ub->unlocked_at?->timestamp ?? 0,
                'href' => route('account.volunteer.achievements'),
            ]);

        $certificates = Certificate::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(guest_email) = ?', [strtolower((string) $user->email)]);
            })
            ->latest()
            ->take(3)
            ->get()
            ->map(fn (Certificate $cert): array => [
                'id' => 'cert-'.$cert->id,
                'kind' => 'certificate',
                'title' => $cert->title ?: 'Service Certificate Issued',
                'meta' => $cert->certificate_number,
                'date' => $cert->created_at?->diffForHumans() ?? 'Recently',
                'timestamp' => $cert->created_at?->timestamp ?? 0,
                'href' => route('account.volunteer.certificates'),
            ]);

        return $completedTasks
            ->concat($earnedBadges)
            ->concat($certificates)
            ->sortByDesc('timestamp')
            ->take(4)
            ->map(fn (array $item): array => collect($item)->except('timestamp')->all())
            ->values()
            ->all();
    }

    /**
     * Format a pending AssignedTask into a concise mission card payload.
     *
     * @return array<string, mixed>
     */
    private function formatActiveMission(AssignedTask $task): array
    {
        if ($task->partnerFoodPickup !== null) {
            $pickup = $task->partnerFoodPickup;

            return [
                'id' => $task->id,
                'kind' => 'food_pickup',
                'kindLabel' => 'Partner Food Pickup',
                'title' => $pickup->partner?->name ?? 'Partner Food Pickup',
                'subtitle' => $pickup->food_summary ?: ($pickup->partner?->address ?? 'Scheduled daily pickup'),
                'schedule' => $pickup->pickup_date?->format('M d, Y') ?? 'Today',
                'status' => ucfirst((string) $pickup->status),
                'href' => route('account.volunteer.assigned-tasks'),
                'can_confirm_pickup' => in_array($pickup->status, [
                    PartnerFoodPickup::StatusPending,
                    PartnerFoodPickup::StatusAssigned,
                ], true),
            ];
        }

        if ($task->petReport !== null) {
            $report = $task->petReport;
            $animalLabel = $report->animal_type ?? $report->species ?? 'Animal';

            return [
                'id' => $task->id,
                'kind' => 'rescue',
                'kindLabel' => 'Rescue Dispatch',
                'title' => ($report->name ?: $report->pet_name ?: ucfirst((string) $animalLabel).' Rescue')." (#{$report->id})",
                'subtitle' => $report->location ?: ($report->landmark ?: 'Field rescue assignment'),
                'schedule' => $report->created_at?->diffForHumans() ?? 'Active',
                'status' => ucfirst(str_replace('_', ' ', (string) ($report->status ?? 'assigned'))),
                'href' => route('account.volunteer.rescue-reports'),
                'pet_report_id' => $report->id,
                'can_update_rescue' => $report->assigned_volunteer_id === $task->user_id && $report->status === 'assigned',
            ];
        }

        if ($task->feedingSchedule !== null) {
            $schedule = $task->feedingSchedule;

            return [
                'id' => $task->id,
                'kind' => 'feeding',
                'kindLabel' => 'Feeding Route',
                'title' => $schedule->zone ?: 'Community Feeding Zone',
                'subtitle' => trim("{$schedule->day} • {$schedule->time}"),
                'schedule' => $schedule->day ?: 'Scheduled',
                'status' => 'Assigned',
                'href' => route('account.volunteer.assigned-tasks'),
            ];
        }

        $event = $task->event;

        return [
            'id' => $task->id,
            'kind' => 'event',
            'kindLabel' => 'Shelter Event',
            'title' => $event?->title ?? ($task->role ?: 'Volunteer Assignment'),
            'subtitle' => $event?->location ?: 'Pawlse Shelter',
            'schedule' => $event?->date ? $event->date->format('M d, Y') : 'Upcoming',
            'status' => 'Pending',
            'href' => route('account.volunteer.assigned-tasks'),
        ];
    }

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

        $query = AssignedTask::with([
            'event.assignedTasks' => function ($query) {
                $query->whereIn('status', ['pending', 'completed'])
                    ->with('user:id,name,avatar_path')
                    ->orderBy('created_at');
            },
            'feedingSchedule.startedBy:id,name',
            'feedingSchedule.completedBy:id,name',
            'feedingSchedule.assignedTasks' => function ($query) {
                $query->whereIn('status', ['pending', 'completed'])
                    ->with('user:id,name,avatar_path')
                    ->orderBy('created_at');
            },
            'feedingSchedule.distributionLogs' => function ($query) {
                $query->with('recordedBy:id,name')
                    ->latest('recorded_at');
            },
            'petReport',
            'partnerFoodPickup.partner',
        ])
            ->where('user_id', $user->id)
            ->where('status', 'pending');

        $filters = $this->applyAssignedTaskFilters($query, $request);

        $tasks = $query->paginate(5)->withQueryString();

        return Inertia::render('volunteer/assigned-tasks', [
            'tasks' => $tasks,
            'filters' => $filters,
            'volunteerMapEnabled' => $this->isVolunteerMapEnabled(),
            'foodTypes' => FeedingDistributionLog::FOOD_TYPES,
        ]);
    }

    /**
     * Return active feeding routes and rescue/SOS report pins for the volunteer Leaflet map.
     */
    public function mapPins(Request $request): JsonResponse
    {
        if (! $this->isVolunteerMapEnabled()) {
            return response()->json([
                'message' => 'Volunteer operations map is currently disabled by the administrator.',
            ], 403);
        }

        $user = $request->user();

        $feedingRoutes = FeedingSchedule::query()
            ->where('status', 'active')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderBy('zone')
            ->get()
            ->map(fn (FeedingSchedule $schedule): array => [
                'id' => 'feeding-'.$schedule->id,
                'record_id' => $schedule->id,
                'category' => 'feeding_route',
                'title' => $schedule->zone,
                'latitude' => (float) $schedule->latitude,
                'longitude' => (float) $schedule->longitude,
                'day' => $schedule->day,
                'time' => $schedule->time,
                'volunteers' => $schedule->volunteers,
                'strays' => $schedule->strays,
                'status' => $schedule->status,
            ])
            ->values();

        $reports = PetReport::with(['photos'])
            ->whereIn('type', ['rescue', 'sos'])
            ->whereIn('status', ['pending', 'assigned', 'in_progress'])
            ->where('is_duplicate', false)
            ->latest()
            ->get()
            ->map(function (PetReport $report) use ($user): ?array {
                $coords = $report->getCoordinates();
                if ($coords === null) {
                    return null;
                }

                $firstPhoto = $report->photos->first();

                return [
                    'id' => 'report-'.$report->id,
                    'record_id' => $report->id,
                    'category' => $report->type === 'sos' ? 'sos' : 'rescue',
                    'title' => $report->name ?: ucfirst((string) $report->animal_type).' '.($report->type === 'sos' ? 'SOS Alert' : 'Rescue Report'),
                    'latitude' => $coords['lat'],
                    'longitude' => $coords['lng'],
                    'type' => $report->type,
                    'status' => $report->status,
                    'urgency' => $report->urgency,
                    'situation_type' => $report->situation_type,
                    'animal_type' => $report->animal_type,
                    'breed' => $report->breed,
                    'color' => $report->color,
                    'location' => $report->location,
                    'description' => $report->description,
                    'is_assigned_to_me' => $report->assigned_volunteer_id === $user->id,
                    'photo_path' => $firstPhoto?->path,
                    'created_at' => $report->created_at?->diffForHumans(),
                ];
            })
            ->filter()
            ->values();

        return response()->json([
            'feeding_routes' => $feedingRoutes,
            'reports' => $reports,
        ]);
    }

    /**
     * Check whether the volunteer operations map feature is enabled in system settings.
     */
    protected function isVolunteerMapEnabled(): bool
    {
        $settings = SystemSetting::getValue('system_settings', []);

        return (bool) ($settings['volunteer_map_enabled'] ?? true);
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

        if ($task->partner_food_pickup_id !== null) {
            $pickup = $task->partnerFoodPickup;
            if ($pickup !== null && $pickup->status === PartnerFoodPickup::StatusFetched) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'Cannot cancel a food pickup that has already been marked as fetched.',
                ]);

                return redirect()->back();
            }

            if ($pickup !== null && $pickup->assigned_volunteer_id === $user->id) {
                $pickup->update([
                    'assigned_volunteer_id' => null,
                    'status' => PartnerFoodPickup::StatusPending,
                ]);
            }
        }

        $taskTitle = $task->event?->title
            ?? $task->feedingSchedule?->zone
            ?? ($task->partnerFoodPickup?->partner ? 'Food Pickup: '.$task->partnerFoodPickup->partner->name : null)
            ?? ($task->petReport ? 'Rescue #'.$task->petReport->id : 'Assignment');
        $task->delete();

        AuditLog::log('volunteer_cancel_task', "Cancelled volunteer task assignment for '{$taskTitle}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Task assignment cancelled successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Confirm that an assigned daily partner food pickup has been fetched by the volunteer.
     */
    public function confirmFoodPickupFetched(Request $request, AssignedTask $task): RedirectResponse
    {
        $user = $request->user();

        if ($task->user_id !== $user->id) {
            abort(403);
        }

        $task->loadMissing('partnerFoodPickup.partner');
        $pickup = $task->partnerFoodPickup;

        if ($pickup === null || $task->status !== 'pending') {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This task is not an active food pickup assignment.',
            ]);

            return redirect()->back();
        }

        if ($pickup->status === PartnerFoodPickup::StatusFetched) {
            Inertia::flash('toast', [
                'type' => 'info',
                'message' => 'This food pickup has already been confirmed as fetched.',
            ]);

            return redirect()->back();
        }

        if (in_array($pickup->status, [PartnerFoodPickup::StatusCompleted, PartnerFoodPickup::StatusMissed], true)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This food pickup has already been finalized by an administrator.',
            ]);

            return redirect()->back();
        }

        $validated = $request->validate([
            'volunteer_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $pickup->update([
            'status' => PartnerFoodPickup::StatusFetched,
            'fetched_at' => now(),
            'volunteer_notes' => $validated['volunteer_notes'] ?? $pickup->volunteer_notes,
        ]);

        $partnerName = $pickup->partner?->name ?? 'Partner';
        AuditLog::log('partner_food_pickup_fetched', "Volunteer {$user->name} confirmed food pickup fetched from {$partnerName} (Pickup ID {$pickup->id})");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Confirmed! Food pickup from {$partnerName} marked as fetched.",
        ]);

        return redirect()->back();
    }

    /**
     * Start a feeding route run (available to volunteers joined to the route).
     */
    public function startFeedingRoute(Request $request, FeedingSchedule $schedule): RedirectResponse
    {
        $user = $request->user();

        $assignedTask = AssignedTask::query()
            ->where('user_id', $user->id)
            ->where('feeding_schedule_id', $schedule->id)
            ->whereIn('status', ['pending', 'completed'])
            ->first();

        if (! $assignedTask) {
            abort(403, 'You must be joined to this feeding route to start it.');
        }

        if ($schedule->execution_status === FeedingSchedule::ExecutionInProgress) {
            Inertia::flash('toast', [
                'type' => 'info',
                'message' => 'This feeding route is already in progress.',
            ]);

            return redirect()->back();
        }

        if ($schedule->execution_status === FeedingSchedule::ExecutionCompleted) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => 'This feeding route run is already completed. An admin can reset it for the next run.',
            ]);

            return redirect()->back();
        }

        $schedule->update([
            'execution_status' => FeedingSchedule::ExecutionInProgress,
            'started_at' => now(),
            'started_by_user_id' => $user->id,
        ]);

        AuditLog::log('feeding_route_started', "Volunteer {$user->name} started feeding route '{$schedule->zone}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Feeding route '{$schedule->zone}' is now In Progress!",
        ]);

        return redirect()->back();
    }

    /**
     * Complete a feeding route run (available to volunteers joined to the route),
     * record individual member attendance & hours, and disband the active group while preserving data.
     */
    public function completeFeedingRoute(
        Request $request,
        FeedingSchedule $schedule,
        FieldGroupLifecycleService $lifecycleService
    ): RedirectResponse {
        $user = $request->user();

        $assignedTask = AssignedTask::query()
            ->where('user_id', $user->id)
            ->where('feeding_schedule_id', $schedule->id)
            ->whereIn('status', [AssignedTask::STATUS_PENDING, AssignedTask::STATUS_COMPLETED])
            ->first();

        if (! $assignedTask) {
            abort(403, 'You must be joined to this feeding route to complete it.');
        }

        if ($schedule->execution_status !== FeedingSchedule::ExecutionInProgress) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Only an in-progress feeding route can be marked as completed.',
            ]);

            return redirect()->back();
        }

        $validated = $request->validate([
            'attendees' => ['nullable', 'array'],
            'attendees.*.task_id' => ['required', 'integer'],
            'attendees.*.attended' => ['required', 'boolean'],
            'attendees.*.hours_logged' => ['nullable', 'numeric', 'min:0', 'max:24'],
        ]);

        $attendees = $validated['attendees'] ?? null;
        if ($attendees !== null && ! $lifecycleService->isGroupLead($user, 'feeding', $schedule->id)) {
            abort(403, 'Only a Route Lead or Admin can submit individual attendance records.');
        }

        $stats = $lifecycleService->completeAndDisbandFeedingSchedule($schedule, $user, $attendees);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Feeding route '{$schedule->zone}' completed & group disbanded ({$stats['completed_count']} attended, {$stats['no_show_count']} no-show). History preserved.",
        ]);

        return redirect()->back();
    }

    /**
     * Complete an event group (available to an Event Route Lead / Team Lead),
     * record individual member attendance & hours, and disband the active group while preserving data.
     */
    public function completeEventGroup(
        Request $request,
        Event $event,
        FieldGroupLifecycleService $lifecycleService
    ): RedirectResponse {
        $user = $request->user();

        if (! $lifecycleService->isGroupLead($user, 'event', $event->id)) {
            abort(403, 'Only a Route Lead or Team Lead can complete this event group.');
        }

        $validated = $request->validate([
            'attendees' => ['nullable', 'array'],
            'attendees.*.task_id' => ['required', 'integer'],
            'attendees.*.attended' => ['required', 'boolean'],
            'attendees.*.hours_logged' => ['nullable', 'numeric', 'min:0', 'max:24'],
        ]);

        $stats = $lifecycleService->completeAndDisbandEvent($event, $user, $validated['attendees'] ?? null);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Event '{$event->title}' completed & group disbanded ({$stats['completed_count']} attended, {$stats['no_show_count']} no-show). History preserved.",
        ]);

        return redirect()->back();
    }

    /**
     * Record street-level food distribution on an active feeding route (Recorders / Route Leads only).
     */
    public function recordFeedingDistribution(Request $request, FeedingSchedule $schedule): RedirectResponse
    {
        $user = $request->user();

        $assignedTask = AssignedTask::query()
            ->where('user_id', $user->id)
            ->where('feeding_schedule_id', $schedule->id)
            ->whereIn('status', ['pending', 'completed'])
            ->first();

        if (! $assignedTask) {
            abort(403, 'You are not assigned to this feeding route.');
        }

        $normalizedRole = strtolower((string) $assignedTask->role);
        if (! str_contains($normalizedRole, 'recorder') && ! str_contains($normalizedRole, 'route lead')) {
            abort(403, 'Only volunteers assigned as Recorder or Route Lead can record street food distributions.');
        }

        if ($schedule->execution_status !== FeedingSchedule::ExecutionInProgress) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Start the feeding route first before recording street food distributions.',
            ]);

            return redirect()->back();
        }

        $validated = $request->validate([
            'street_or_stop' => ['required', 'string', 'max:255'],
            'food_type' => ['required', 'string', Rule::in(FeedingDistributionLog::FOOD_TYPES)],
            'food_packs_distributed' => ['required', 'integer', 'min:1', 'max:1000'],
            'strays_fed' => ['required', 'integer', 'min:0', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($schedule, $user, $assignedTask, $validated): void {
            FeedingDistributionLog::query()->create([
                'feeding_schedule_id' => $schedule->id,
                'recorded_by_user_id' => $user->id,
                'assigned_task_id' => $assignedTask->id,
                'street_or_stop' => $validated['street_or_stop'],
                'food_type' => $validated['food_type'],
                'food_packs_distributed' => $validated['food_packs_distributed'],
                'strays_fed' => $validated['strays_fed'],
                'notes' => $validated['notes'] ?? null,
                'recorded_at' => now(),
            ]);

            $schedule->increment('total_food_distributed', (int) $validated['food_packs_distributed']);

            if ($schedule->feeding_sponsorship_id !== null) {
                $schedule->loadMissing('feedingSponsorship');
                $schedule->feedingSponsorship?->increment('packs_distributed', (int) $validated['food_packs_distributed']);
                $schedule->feedingSponsorship?->increment('strays_fed', (int) $validated['strays_fed']);
            }
        });

        AuditLog::log(
            'feeding_distribution_recorded',
            "Recorder {$user->name} logged {$validated['food_packs_distributed']} {$validated['food_type']} pack(s) at {$validated['street_or_stop']} on route '{$schedule->zone}'"
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Recorded {$validated['food_packs_distributed']} food pack(s) distributed at {$validated['street_or_stop']}.",
        ]);

        return redirect()->back();
    }

    /**
     * Show participation history.
     */
    public function participationHistory(Request $request): Response
    {
        $user = $request->user();
        $status = trim((string) $request->input('status', ''));
        $allowedStatuses = [AssignedTask::STATUS_COMPLETED, AssignedTask::STATUS_NO_SHOW];

        $query = AssignedTask::with(['event', 'feedingSchedule', 'petReport', 'partnerFoodPickup.partner'])
            ->where('user_id', $user->id);

        if (in_array($status, $allowedStatuses, true)) {
            $query->where('status', $status);
        } else {
            $status = '';
            $query->whereIn('status', $allowedStatuses);
        }

        $filters = $this->applyAssignedTaskFilters($query, $request);
        $filters['status'] = $status;

        $history = $query->paginate(5)->withQueryString();

        return Inertia::render('volunteer/participation-history', [
            'history' => $history,
            'filters' => $filters,
        ]);
    }

    /**
     * Apply search, task type, and sort filters to an AssignedTask query.
     *
     * @param  Builder<AssignedTask>  $query
     * @return array{search: string, type: string, sort: string}
     */
    private function applyAssignedTaskFilters(Builder $query, Request $request): array
    {
        $search = trim((string) $request->input('search', ''));
        $type = trim((string) $request->input('type', ''));
        $sort = $request->input('sort') === 'oldest' ? 'oldest' : 'latest';

        if ($search !== '') {
            $like = "%{$search}%";
            $query->where(function (Builder $q) use ($like) {
                $q->where('role', 'like', $like)
                    ->orWhereHas('event', function (Builder $eventQuery) use ($like) {
                        $eventQuery->where('title', 'like', $like)
                            ->orWhere('location', 'like', $like);
                    })
                    ->orWhereHas('feedingSchedule', function (Builder $feedingQuery) use ($like) {
                        $feedingQuery->where('zone', 'like', $like);
                    })
                    ->orWhereHas('petReport', function (Builder $petQuery) use ($like) {
                        $petQuery->where('name', 'like', $like)
                            ->orWhere('animal_type', 'like', $like)
                            ->orWhere('location', 'like', $like);
                    })
                    ->orWhereHas('partnerFoodPickup.partner', function (Builder $partnerQuery) use ($like) {
                        $partnerQuery->where('name', 'like', $like);
                    });
            });
        }

        $typeColumnMap = [
            'event' => 'event_id',
            'feeding' => 'feeding_schedule_id',
            'rescue' => 'pet_report_id',
            'food_pickup' => 'partner_food_pickup_id',
        ];

        if (array_key_exists($type, $typeColumnMap)) {
            $query->whereNotNull($typeColumnMap[$type]);
        } else {
            $type = '';
        }

        if ($sort === 'oldest') {
            $query->oldest();
        } else {
            $query->latest();
        }

        return [
            'search' => $search,
            'type' => $type,
            'sort' => $sort,
        ];
    }

    /**
     * Show certificates for volunteer dashboard.
     */
    public function certificates(Request $request): Response
    {
        $user = $request->user();

        $latestApplication = $user->volunteerApplications()->latest()->first();
        $volunteerRole = $latestApplication?->role ?? 'Volunteer';

        return Inertia::render('volunteer/certificates', [
            ...$this->queryUserCertificates($request, $user),
            'defaultRole' => $volunteerRole,
        ]);
    }

    /**
     * Show certificates inside user dashboard.
     */
    public function userCertificates(Request $request): Response
    {
        return Inertia::render('user/certificates', [
            ...$this->queryUserCertificates($request, $request->user()),
            'defaultRole' => 'Participant',
        ]);
    }

    /**
     * Query, filter, and paginate certificates belonging to a user.
     *
     * @return array{
     *     certificates: LengthAwarePaginator<int, Certificate>,
     *     filters: array{search: string, role: string, year: string, sort: string},
     *     filterOptions: array{roles: list<string>, years: list<string>}
     * }
     */
    private function queryUserCertificates(Request $request, User $user): array
    {
        $search = trim((string) $request->input('search', ''));
        $role = trim((string) $request->input('role', ''));
        $year = trim((string) $request->input('year', ''));
        $sort = $request->input('sort') === 'oldest' ? 'oldest' : 'latest';

        $baseQuery = Certificate::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(guest_email) = ?', [strtolower((string) $user->email)]);
            });

        $roles = (clone $baseQuery)
            ->whereNotNull('role')
            ->where('role', '!=', '')
            ->distinct()
            ->orderBy('role')
            ->pluck('role')
            ->values()
            ->all();

        $years = (clone $baseQuery)
            ->whereNotNull('issue_date')
            ->pluck('issue_date')
            ->map(fn ($date) => $date->format('Y'))
            ->unique()
            ->sortDesc()
            ->values()
            ->all();

        $query = (clone $baseQuery)->with(['event', 'user']);

        if ($search !== '') {
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->where('title', 'like', $like)
                    ->orWhere('certificate_number', 'like', $like)
                    ->orWhere('role', 'like', $like)
                    ->orWhere('description', 'like', $like)
                    ->orWhereHas('event', function ($eventQuery) use ($like) {
                        $eventQuery->where('title', 'like', $like)
                            ->orWhere('location', 'like', $like);
                    });
            });
        }

        if ($role !== '' && $role !== 'all') {
            $query->where('role', $role);
        }

        if ($year !== '' && $year !== 'all' && preg_match('/^\d{4}$/', $year)) {
            $query->whereYear('issue_date', $year);
        }

        $query = $sort === 'oldest' ? $query->oldest() : $query->latest();

        $certificates = $query->paginate(5)->withQueryString();

        return [
            'certificates' => $certificates,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'year' => $year,
                'sort' => $sort,
            ],
            'filterOptions' => [
                'roles' => $roles,
                'years' => $years,
            ],
        ];
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
                'submitted_human' => $application->created_at->diffForHumans(),
                'full_name' => $application->full_name,
                'email' => $application->email,
                'mobile' => $application->mobile,
                'address' => $application->address,
                'why' => $application->why,
                'experience' => $application->experience,
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

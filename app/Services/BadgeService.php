<?php

namespace App\Services;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\DonationStatus;
use App\Models\AdoptionApplication;
use App\Models\AssignedTask;
use App\Models\Badge;
use App\Models\BlogPost;
use App\Models\BlogPostReaction;
use App\Models\Certificate;
use App\Models\Donation;
use App\Models\FosterCareUpdate;
use App\Models\FosterPlacement;
use App\Models\PetReport;
use App\Models\ShelterVisit;
use App\Models\User;
use App\Models\UserBadge;
use App\Notifications\BadgeUnlockedNotification;
use Database\Seeders\BadgeSeeder;
use Illuminate\Support\Collection;

class BadgeService
{
    /**
     * Collect real-time activity metrics for a user and audience.
     *
     * @return array<string, int>
     */
    public function collectMetrics(User $user, string $audience): array
    {
        if ($audience === Badge::AUDIENCE_VOLUNTEER) {
            return [
                'completed_tasks_count' => AssignedTask::query()
                    ->where('user_id', $user->id)
                    ->where('status', 'completed')
                    ->count(),
                'logged_hours_total' => (int) floor((float) AssignedTask::query()
                    ->where('user_id', $user->id)
                    ->where('status', 'completed')
                    ->sum('hours_logged')),
                'resolved_rescues_count' => PetReport::query()
                    ->where('assigned_volunteer_id', $user->id)
                    ->where('status', 'resolved')
                    ->count(),
                'completed_feeding_tasks_count' => AssignedTask::query()
                    ->where('user_id', $user->id)
                    ->whereNotNull('feeding_schedule_id')
                    ->where('status', 'completed')
                    ->count(),
                'completed_event_tasks_count' => AssignedTask::query()
                    ->where('user_id', $user->id)
                    ->whereNotNull('event_id')
                    ->where('status', 'completed')
                    ->count(),
                'foster_updates_count' => FosterCareUpdate::query()
                    ->where('user_id', $user->id)
                    ->count(),
                'foster_placements_count' => FosterPlacement::query()
                    ->where('foster_parent_user_id', $user->id)
                    ->count(),
                'certificates_count' => Certificate::query()
                    ->where('user_id', $user->id)
                    ->count(),
            ];
        }

        return [
            'rescue_reports_count' => PetReport::query()
                ->where('user_id', $user->id)
                ->where('is_duplicate', false)
                ->whereNotIn('status', ['duplicate', 'cancelled'])
                ->count(),
            'adoption_applications_count' => AdoptionApplication::query()
                ->where('user_id', $user->id)
                ->count(),
            'approved_adoptions_count' => AdoptionApplication::query()
                ->where('user_id', $user->id)
                ->where('status', AdoptionApplicationStatus::Approved->value)
                ->count(),
            'verified_donations_count' => Donation::query()
                ->where('user_id', $user->id)
                ->whereIn('status', [
                    DonationStatus::Verified->value,
                    DonationStatus::Completed->value,
                ])
                ->count(),
            'confirmed_visits_count' => ShelterVisit::query()
                ->where('user_id', $user->id)
                ->whereIn('status', ['confirmed', 'completed'])
                ->count(),
            'joined_events_count' => AssignedTask::query()
                ->where('user_id', $user->id)
                ->whereNotNull('event_id')
                ->count(),
            'published_stories_count' => BlogPost::query()
                ->where('author_id', $user->id)
                ->where('status', BlogPost::STATUS_PUBLISHED)
                ->count(),
            'missing_found_reports_count' => PetReport::query()
                ->where('user_id', $user->id)
                ->whereIn('type', ['missing', 'found'])
                ->count(),
            'story_reactions_count' => BlogPostReaction::query()
                ->where('user_id', $user->id)
                ->count(),
        ];
    }

    /**
     * Evaluate and persist badge progress & unlocks for a user.
     *
     * @return Collection<int, Badge> Newly unlocked badges
     */
    public function syncForUser(User $user, string $audience, bool $notifyOnUnlock = true): Collection
    {
        if (Badge::query()->forAudience($audience)->doesntExist()) {
            (new BadgeSeeder)->run();
        }

        $badges = Badge::query()
            ->active()
            ->forAudience($audience)
            ->orderBy('sort_order')
            ->get();

        $metrics = $this->collectMetrics($user, $audience);

        $existing = UserBadge::query()
            ->where('user_id', $user->id)
            ->whereIn('badge_id', $badges->pluck('id'))
            ->get()
            ->keyBy('badge_id');

        $newlyUnlocked = collect();

        foreach ($badges as $badge) {
            $rawMetric = $metrics[$badge->metric_key] ?? 0;
            $progress = min($badge->target_value, max(0, (int) $rawMetric));
            $record = $existing->get($badge->id);
            $wasUnlocked = $record?->unlocked_at !== null;
            $shouldUnlock = $progress >= $badge->target_value;

            if ($record === null) {
                $record = UserBadge::create([
                    'user_id' => $user->id,
                    'badge_id' => $badge->id,
                    'progress_value' => $progress,
                    'unlocked_at' => $shouldUnlock ? now() : null,
                    'is_pinned' => false,
                ]);
            } else {
                $updates = ['progress_value' => $progress];
                if (! $wasUnlocked && $shouldUnlock) {
                    $updates['unlocked_at'] = now();
                }
                $record->update($updates);
            }

            if (! $wasUnlocked && $shouldUnlock) {
                $newlyUnlocked->push($badge);
                if ($notifyOnUnlock) {
                    $user->notify(new BadgeUnlockedNotification($badge));
                }
            }
        }

        return $newlyUnlocked;
    }

    /**
     * Build the full achievements payload for Inertia pages.
     *
     * @return array<string, mixed>
     */
    public function getDashboardPayload(User $user, string $audience): array
    {
        $newlyUnlocked = $this->syncForUser($user, $audience);

        $badges = Badge::query()
            ->active()
            ->forAudience($audience)
            ->orderBy('sort_order')
            ->get();

        $userBadges = UserBadge::query()
            ->where('user_id', $user->id)
            ->whereIn('badge_id', $badges->pluck('id'))
            ->get()
            ->keyBy('badge_id');

        $newlyUnlockedIds = $newlyUnlocked->pluck('id')->all();

        $items = $badges->map(function (Badge $badge) use ($userBadges, $newlyUnlockedIds): array {
            /** @var UserBadge|null $ub */
            $ub = $userBadges->get($badge->id);
            $progress = $ub?->progress_value ?? 0;
            $target = max(1, $badge->target_value);
            $isUnlocked = $ub?->unlocked_at !== null;
            $percentage = $isUnlocked ? 100 : (int) min(99, floor(($progress / $target) * 100));

            $imagePath = $badge->image_path && file_exists(public_path(ltrim($badge->image_path, '/')))
                ? $badge->image_path
                : null;

            return [
                'id' => $badge->id,
                'slug' => $badge->slug,
                'audience' => $badge->audience,
                'category' => $badge->category,
                'tier' => $badge->tier,
                'name' => $badge->name,
                'description' => $badge->description,
                'task_label' => $badge->task_label,
                'progress_value' => $progress,
                'target_value' => $target,
                'percentage' => $percentage,
                'xp_reward' => $badge->xp_reward,
                'image_path' => $imagePath,
                'is_unlocked' => $isUnlocked,
                'is_newly_unlocked' => in_array($badge->id, $newlyUnlockedIds, true),
                'unlocked_at' => $ub?->unlocked_at?->toIso8601String(),
                'unlocked_at_formatted' => $ub?->unlocked_at?->format('M j, Y'),
                'is_pinned' => (bool) ($ub?->is_pinned ?? false),
            ];
        })->values();

        $unlockedItems = $items->where('is_unlocked', true);
        $totalXp = (int) $unlockedItems->sum('xp_reward');
        $rankInfo = $this->resolveRank($audience, $totalXp);

        $nextUp = $items
            ->where('is_unlocked', false)
            ->sortByDesc('percentage')
            ->take(2)
            ->values();

        return [
            'badges' => $items->all(),
            'nextUp' => $nextUp->all(),
            'summary' => [
                'unlocked_count' => $unlockedItems->count(),
                'total_count' => $items->count(),
                'total_xp' => $totalXp,
                'rank_title' => $rankInfo['title'],
                'next_rank_title' => $rankInfo['next_title'],
                'next_rank_xp' => $rankInfo['next_xp'],
                'pinned_count' => $items->where('is_pinned', true)->count(),
                'newly_unlocked_count' => count($newlyUnlockedIds),
            ],
        ];
    }

    /**
     * Resolve rank title and next milestone from total Impact XP.
     *
     * @return array{title: string, next_title: ?string, next_xp: ?int}
     */
    protected function resolveRank(string $audience, int $totalXp): array
    {
        $tiers = $audience === Badge::AUDIENCE_VOLUNTEER
            ? [
                ['xp' => 0, 'title' => 'Field Recruit'],
                ['xp' => 250, 'title' => 'Stray Helper'],
                ['xp' => 750, 'title' => 'Rescue Ranger'],
                ['xp' => 1500, 'title' => 'Shelter Champion'],
                ['xp' => 2500, 'title' => 'PAWLSE Legend'],
            ]
            : [
                ['xp' => 0, 'title' => 'Paw Newcomer'],
                ['xp' => 200, 'title' => 'Compassionate Ally'],
                ['xp' => 600, 'title' => 'Rescue Supporter'],
                ['xp' => 1200, 'title' => 'Shelter Champion'],
                ['xp' => 2000, 'title' => 'Guardian Angel'],
            ];

        $current = $tiers[0];
        $next = null;

        foreach ($tiers as $index => $tier) {
            if ($totalXp >= $tier['xp']) {
                $current = $tier;
                $next = $tiers[$index + 1] ?? null;
            }
        }

        return [
            'title' => $current['title'],
            'next_title' => $next['title'] ?? null,
            'next_xp' => $next['xp'] ?? null,
        ];
    }
}

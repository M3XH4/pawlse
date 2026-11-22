<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\UserBadge;
use App\Services\BadgeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AchievementsController extends Controller
{
    public const MAX_PINNED_BADGES = 3;

    public function __construct(public BadgeService $badgeService) {}

    /**
     * Display the user's badges and achievements page.
     */
    public function userIndex(Request $request): Response
    {
        $payload = $this->badgeService->getDashboardPayload(
            $request->user(),
            Badge::AUDIENCE_USER,
        );

        return Inertia::render('user/achievements', $payload);
    }

    /**
     * Display the volunteer's badges and achievements page.
     */
    public function volunteerIndex(Request $request): Response
    {
        $payload = $this->badgeService->getDashboardPayload(
            $request->user(),
            Badge::AUDIENCE_VOLUNTEER,
        );

        return Inertia::render('volunteer/achievements', $payload);
    }

    /**
     * Toggle pinning an unlocked badge to the user's showcase.
     */
    public function togglePin(Request $request, Badge $badge): RedirectResponse
    {
        $user = $request->user();

        $userBadge = UserBadge::query()
            ->where('user_id', $user->id)
            ->where('badge_id', $badge->id)
            ->first();

        if ($userBadge === null || ! $userBadge->isUnlocked()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Only unlocked badges can be pinned to your showcase.',
            ]);

            return redirect()->back();
        }

        if (! $userBadge->is_pinned) {
            $pinnedCount = UserBadge::query()
                ->where('user_id', $user->id)
                ->where('is_pinned', true)
                ->whereHas('badge', fn ($query) => $query->where('audience', $badge->audience))
                ->count();

            if ($pinnedCount >= self::MAX_PINNED_BADGES) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'You can pin up to '.self::MAX_PINNED_BADGES.' badges at a time. Unpin one first.',
                ]);

                return redirect()->back();
            }
        }

        $nextPinned = ! $userBadge->is_pinned;
        $userBadge->update(['is_pinned' => $nextPinned]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $nextPinned
                ? "Pinned \"{$badge->name}\" to your showcase!"
                : "Removed \"{$badge->name}\" from your showcase.",
        ]);

        return redirect()->back();
    }
}

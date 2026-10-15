<?php

namespace App\Http\Controllers;

use App\Models\CommunityHonor;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HonorController extends Controller
{
    /**
     * Display the Community Recognition / Honor page.
     */
    public function index(Request $request): Response
    {
        $allHonors = CommunityHonor::public()
            ->orderBy('display_order')
            ->get();

        $recognizedSupporters = $allHonors->where('is_featured', true)->values();
        $communitySupporters = $allHonors->where('category', 'community_supporter')->values();
        $donors = $allHonors->where('category', 'donor')->values();
        $volunteers = $allHonors->where('category', 'volunteer')->values();
        $sponsors = $allHonors->where('category', 'sponsor')->values();

        $volunteerStats = SystemSetting::getValue('community_honor_stats', [
            'core_members_count' => 15,
            'active_volunteers_count' => null,
            'on_call_volunteers_count' => null,
            'meals_served_display' => '12k+',
            'pets_rescued_display' => '450+',
            'adoptions_display' => '85+',
            'active_zones_display' => '15',
        ]);

        $badgesCatalog = [
            [
                'name' => 'First Volunteer Activity',
                'description' => 'Participated in their first ISF volunteer activity',
                'color' => 'bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-300',
                'icon' => 'Sparkles',
            ],
            [
                'name' => 'Feeding Volunteer',
                'description' => 'Actively participated in ISF feeding activities',
                'color' => 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300',
                'icon' => 'Heart',
            ],
            [
                'name' => 'Rescue Supporter',
                'description' => 'Supported ISF rescue operations and field care',
                'color' => 'bg-blue-500/10 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-300',
                'icon' => 'Shield',
            ],
            [
                'name' => 'Event Volunteer',
                'description' => 'Volunteered at an ISF outreach or pet adoption event',
                'color' => 'bg-purple-500/10 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-300',
                'icon' => 'Calendar',
            ],
            [
                'name' => 'Dedicated Volunteer',
                'description' => 'Recognized for sustained and exceptional volunteer contribution',
                'color' => 'bg-orange-500/10 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-300',
                'icon' => 'Award',
            ],
            [
                'name' => 'Foster Support',
                'description' => 'Provided temporary home or fostering support for rescued pets',
                'color' => 'bg-rose-500/10 text-rose-700 border-rose-300 dark:bg-rose-950/30 dark:text-rose-300',
                'icon' => 'Home',
            ],
            [
                'name' => 'Recurring Donor',
                'description' => 'Provides ongoing financial or supplies support to ISF operations',
                'color' => 'bg-teal-500/10 text-teal-700 border-teal-300 dark:bg-teal-950/30 dark:text-teal-300',
                'icon' => 'Gift',
            ],
            [
                'name' => 'Community Supporter',
                'description' => 'A valued member of the ISF community and advocacy network',
                'color' => 'bg-cyan-500/10 text-cyan-700 border-cyan-300 dark:bg-cyan-950/30 dark:text-cyan-300',
                'icon' => 'Users',
            ],
        ];

        return Inertia::render('honor', [
            'allHonors' => $allHonors,
            'recognizedSupporters' => $recognizedSupporters,
            'communitySupporters' => $communitySupporters,
            'donors' => $donors,
            'volunteers' => $volunteers,
            'sponsors' => $sponsors,
            'volunteerStats' => $volunteerStats,
            'badgesCatalog' => $badgesCatalog,
        ]);
    }
}

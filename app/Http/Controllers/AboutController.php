<?php

namespace App\Http\Controllers;

use App\Models\CommunityHonor;
use App\Models\Partner;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    /**
     * Display the About page with partners and community support network.
     */
    public function index(Request $request): Response
    {
        $veterinaryPartners = Partner::active()
            ->veterinary()
            ->orderBy('display_order')
            ->take(6)
            ->get();

        $foodSupplyPartners = Partner::active()
            ->foodSupply()
            ->orderBy('display_order')
            ->take(6)
            ->get();

        $collaboratorPartners = Partner::active()
            ->where('category', 'collaborator')
            ->orderBy('display_order')
            ->get();

        $sponsorPartners = Partner::active()
            ->where('category', 'sponsor')
            ->orderBy('display_order')
            ->get();

        $featuredSupporters = CommunityHonor::public()
            ->whereIn('name', ['Miguel Burton', 'Councilor Derreck Siao', 'Leilani Fernandez'])
            ->orderBy('display_order')
            ->get();

        if ($featuredSupporters->isEmpty()) {
            $featuredSupporters = CommunityHonor::public()
                ->orderBy('display_order')
                ->take(3)
                ->get();
        }

        $stats = SystemSetting::getValue('community_honor_stats', [
            'meals_served_display' => '12k+',
            'pets_rescued_display' => '450+',
            'adoptions_display' => '85+',
            'active_zones_display' => '15',
        ]);

        return Inertia::render('about', [
            'veterinaryPartners' => $veterinaryPartners,
            'foodSupplyPartners' => $foodSupplyPartners,
            'collaboratorPartners' => $collaboratorPartners,
            'sponsorPartners' => $sponsorPartners,
            'featuredSupporters' => $featuredSupporters,
            'networkStats' => $stats,
        ]);
    }
}

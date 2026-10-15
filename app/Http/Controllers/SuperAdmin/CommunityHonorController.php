<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CommunityHonor;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommunityHonorController extends Controller
{
    /**
     * Display Community Honor & Supporter Management list.
     */
    public function index(Request $request): Response
    {
        $query = CommunityHonor::withTrashed();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('role_title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        $honors = $query->orderBy('display_order')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => CommunityHonor::count(),
            'donors' => CommunityHonor::where('category', 'donor')->count(),
            'volunteers' => CommunityHonor::where('category', 'volunteer')->count(),
            'supporters' => CommunityHonor::where('category', 'community_supporter')->count(),
            'sponsors' => CommunityHonor::where('category', 'sponsor')->count(),
        ];

        $recognitionMetrics = SystemSetting::getValue('community_honor_stats', [
            'core_members_count' => 15,
            'active_volunteers_count' => 42,
            'on_call_volunteers_count' => 28,
            'meals_served_display' => '12k+',
            'pets_rescued_display' => '450+',
            'adoptions_display' => '85+',
            'active_zones_display' => '15',
        ]);

        return Inertia::render('super-admin/community-honor', [
            'honors' => $honors,
            'stats' => $stats,
            'recognitionMetrics' => $recognitionMetrics,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * Store new community supporter or honoree.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:donor,volunteer,sponsor,community_supporter'],
            'tier' => ['nullable', 'string', 'max:50'],
            'role_title' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'badges' => ['nullable', 'array'],
            'badges.*' => ['string', 'max:50'],
            'initials' => ['nullable', 'string', 'max:10'],
            'avatar_url' => ['nullable', 'string', 'max:500'],
            'is_featured' => ['boolean'],
            'is_public' => ['boolean'],
            'display_order' => ['integer', 'min:0'],
        ]);

        $honor = CommunityHonor::create($validated);

        AuditLog::log('honor_create', "Added community honor: {$honor->name} ({$honor->role_title})");

        return redirect()->back()->with('success', 'Community honoree added successfully.');
    }

    /**
     * Update community supporter or honoree.
     */
    public function update(Request $request, CommunityHonor $communityHonor): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:donor,volunteer,sponsor,community_supporter'],
            'tier' => ['nullable', 'string', 'max:50'],
            'role_title' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'badges' => ['nullable', 'array'],
            'badges.*' => ['string', 'max:50'],
            'initials' => ['nullable', 'string', 'max:10'],
            'avatar_url' => ['nullable', 'string', 'max:500'],
            'is_featured' => ['boolean'],
            'is_public' => ['boolean'],
            'display_order' => ['integer', 'min:0'],
        ]);

        $communityHonor->update($validated);

        AuditLog::log('honor_update', "Updated community honor: {$communityHonor->name}");

        return redirect()->back()->with('success', 'Community honor updated successfully.');
    }

    /**
     * Delete community supporter.
     */
    public function destroy(CommunityHonor $communityHonor): RedirectResponse
    {
        $name = $communityHonor->name;
        $communityHonor->delete();

        AuditLog::log('honor_delete', "Archived community honor: {$name}");

        return redirect()->back()->with('success', "Community honor {$name} removed.");
    }

    /**
     * Update recognition volunteer counts and stats.
     */
    public function updateStats(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'core_members_count' => ['required', 'integer', 'min:0'],
            'active_volunteers_count' => ['nullable', 'integer', 'min:0'],
            'on_call_volunteers_count' => ['nullable', 'integer', 'min:0'],
            'meals_served_display' => ['required', 'string', 'max:50'],
            'pets_rescued_display' => ['required', 'string', 'max:50'],
            'adoptions_display' => ['required', 'string', 'max:50'],
            'active_zones_display' => ['required', 'string', 'max:50'],
        ]);

        SystemSetting::setValue('community_honor_stats', $validated);

        AuditLog::log('honor_metrics_update', 'Updated community recognition & volunteer impact metrics');

        return redirect()->back()->with('success', 'Recognition metrics updated successfully.');
    }
}

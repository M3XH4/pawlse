<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Partner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PartnerManagementController extends Controller
{
    /**
     * Display Partner Management list with filters and stats.
     */
    public function index(Request $request): Response
    {
        $query = Partner::withTrashed();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('badge_title', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('status')) {
            if ($request->input('status') === 'active') {
                $query->whereNull('deleted_at')->where('is_active', true);
            } elseif ($request->input('status') === 'inactive') {
                $query->whereNull('deleted_at')->where('is_active', false);
            } elseif ($request->input('status') === 'archived') {
                $query->onlyTrashed();
            }
        }

        $partners = $query->orderBy('display_order')
            ->orderBy('id', 'desc')
            ->paginate(12)
            ->withQueryString();

        $stats = [
            'total' => Partner::count(),
            'veterinary' => Partner::where('category', 'veterinary')->count(),
            'food_supply' => Partner::where('category', 'food_supply')->count(),
            'emergency' => Partner::where('is_emergency', true)->count(),
            'archived' => Partner::onlyTrashed()->count(),
        ];

        return Inertia::render('super-admin/partner-management', [
            'partners' => $partners,
            'stats' => $stats,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    /**
     * Store a newly created Partner in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:veterinary,food_supply,collaborator,sponsor,audit,accounting'],
            'badge_title' => ['nullable', 'string', 'max:100'],
            'badges' => ['nullable', 'array'],
            'badges.*' => ['string', 'max:50'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'website_url' => ['nullable', 'url', 'max:255'],
            'social_url' => ['nullable', 'url', 'max:255'],
            'operating_hours' => ['nullable', 'string', 'max:255'],
            'services' => ['nullable', 'array'],
            'services.*' => ['string', 'max:100'],
            'image' => ['nullable', 'image', 'max:4096'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'logo_url' => ['nullable', 'string', 'max:100'],
            'is_emergency' => ['boolean'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'display_order' => ['integer', 'min:0'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('partners', 'public');
            $validated['image_url'] = '/storage/'.$path;
        }

        $validated['slug'] = Str::slug($validated['name']).'-'.Str::random(5);

        $partner = Partner::create($validated);

        AuditLog::log('partner_create', "Created partner {$partner->name} ({$partner->category})");

        return redirect()->back()->with('success', 'Partner added successfully.');
    }

    /**
     * Update the specified Partner.
     */
    public function update(Request $request, Partner $partner): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:veterinary,food_supply,collaborator,sponsor,audit,accounting'],
            'badge_title' => ['nullable', 'string', 'max:100'],
            'badges' => ['nullable', 'array'],
            'badges.*' => ['string', 'max:50'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'website_url' => ['nullable', 'url', 'max:255'],
            'social_url' => ['nullable', 'url', 'max:255'],
            'operating_hours' => ['nullable', 'string', 'max:255'],
            'services' => ['nullable', 'array'],
            'services.*' => ['string', 'max:100'],
            'image' => ['nullable', 'image', 'max:4096'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'logo_url' => ['nullable', 'string', 'max:100'],
            'is_emergency' => ['boolean'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'display_order' => ['integer', 'min:0'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('partners', 'public');
            $validated['image_url'] = '/storage/'.$path;
        }

        $partner->update($validated);

        AuditLog::log('partner_update', "Updated partner {$partner->name} details");

        return redirect()->back()->with('success', 'Partner updated successfully.');
    }

    /**
     * Soft delete partner.
     */
    public function destroy(Partner $partner): RedirectResponse
    {
        $partnerName = $partner->name;
        $partner->delete();

        AuditLog::log('partner_delete', "Archived partner {$partnerName}");

        return redirect()->back()->with('success', "Partner {$partnerName} archived successfully.");
    }

    /**
     * Restore soft-deleted partner.
     */
    public function restore(int $id): RedirectResponse
    {
        $partner = Partner::withTrashed()->findOrFail($id);
        $partner->restore();

        AuditLog::log('partner_restore', "Restored partner {$partner->name}");

        return redirect()->back()->with('success', "Partner {$partner->name} restored successfully.");
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(Partner $partner): RedirectResponse
    {
        $partner->update(['is_active' => ! $partner->is_active]);

        AuditLog::log('partner_status_toggle', "Toggled status for partner {$partner->name} to ".($partner->is_active ? 'active' : 'inactive'));

        return redirect()->back()->with('success', 'Partner status updated.');
    }
}

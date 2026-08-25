<?php

namespace App\Http\Controllers\Donations;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DonationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403, 'Unauthorized');
        }

        $query = Donation::query()
            ->where('user_id', $user->id)
            ->with(['payments', 'inKindDonation', 'feedingSponsorship']);

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('public_reference', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%")
                    ->orWhere('donor_name', 'like', "%{$search}%");
            });
        }

        // Filter Type
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter Status
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $donations = $query->latest('id')
            ->paginate(5)
            ->withQueryString();

        $totalDonated = Donation::query()
            ->where('user_id', $user->id)
            ->whereIn('status', ['completed', 'verified'])
            ->sum('amount');

        $inKindCount = Donation::query()
            ->where('user_id', $user->id)
            ->where('type', 'in_kind')
            ->count();

        return Inertia::render('user/donations', [
            'donations' => $donations,
            'filters' => $request->only(['search', 'type', 'status']),
            'stats' => [
                'totalCash' => (int) $totalDonated,
                'inKindCount' => $inKindCount,
                'totalCount' => Donation::query()->where('user_id', $user->id)->count(),
            ],
        ]);
    }
}

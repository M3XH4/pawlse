<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AdoptionApplication;
use App\Models\Donation;
use App\Models\PetReport;
use App\Models\User;
use App\Models\VolunteerApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin overview dashboard.
     */
    public function index(Request $request): Response
    {
        // 1. Gather Key Metrics
        $totalRescues = PetReport::count();
        $pendingRescues = PetReport::where('status', 'pending')->count();
        $totalAdoptions = AdoptionApplication::count();
        $pendingAdoptions = AdoptionApplication::where('status', 'pending')->count();

        $totalDonationsCash = Donation::where('type', 'cash')
            ->where('status', 'verified')
            ->sum('amount');

        $inKindDonationsCount = Donation::where('type', 'in-kind')
            ->where('status', 'verified')
            ->count();

        $activeVolunteers = User::where('role', Role::Volunteer->value)->count();
        $pendingVolunteers = VolunteerApplication::where('status', 'pending')->count();

        $stats = [
            'rescues' => [
                'total' => $totalRescues,
                'pending' => $pendingRescues,
            ],
            'adoptions' => [
                'total' => $totalAdoptions,
                'pending' => $pendingAdoptions,
            ],
            'donations' => [
                'total_amount' => $totalDonationsCash,
                'in_kind_count' => $inKindDonationsCount,
            ],
            'volunteers' => [
                'active' => $activeVolunteers,
                'pending' => $pendingVolunteers,
            ],
        ];

        // 2. Fetch recent records to build a chronological timeline
        $recentActivities = [];

        // Recent Rescues
        $recentRescues = PetReport::latest()->limit(4)->get();
        foreach ($recentRescues as $report) {
            $recentActivities[] = [
                'id' => 'rescue-'.$report->id,
                'type' => 'rescue',
                'description' => sprintf(
                    'New %s report submitted at %s (%s)',
                    ucfirst($report->type),
                    $report->location,
                    ucfirst($report->status)
                ),
                'time' => $report->created_at?->diffForHumans() ?? 'Just now',
                'timestamp' => $report->created_at?->timestamp ?? 0,
                'url' => route('account.admin.rescue-management'),
                'status' => $report->status,
            ];
        }

        // Recent Adoptions
        $recentAdoptions = AdoptionApplication::with('shelterAnimal')->latest()->limit(4)->get();
        foreach ($recentAdoptions as $app) {
            $animalName = $app->shelterAnimal ? $app->shelterAnimal->name : 'a pet';
            $statusVal = $app->status instanceof \BackedEnum ? $app->status->value : $app->status;
            $recentActivities[] = [
                'id' => 'adoption-'.$app->id,
                'type' => 'adoption',
                'description' => sprintf(
                    '%s applied to adopt %s (%s)',
                    $app->full_name,
                    $animalName,
                    ucfirst($statusVal)
                ),
                'time' => $app->created_at?->diffForHumans() ?? 'Just now',
                'timestamp' => $app->created_at?->timestamp ?? 0,
                'url' => route('account.admin.adoption-management'),
                'status' => $statusVal,
            ];
        }

        // Recent Donations
        $recentDonations = Donation::latest()->limit(4)->get();
        foreach ($recentDonations as $donation) {
            $desc = $donation->type === 'cash'
                ? sprintf('%s donated %s %s (%s)', $donation->donor_name, $donation->amount, $donation->currency, ucfirst($donation->status))
                : sprintf('%s submitted In-Kind donation (%s)', $donation->donor_name, ucfirst($donation->status));

            $recentActivities[] = [
                'id' => 'donation-'.$donation->id,
                'type' => 'donation',
                'description' => $desc,
                'time' => $donation->created_at?->diffForHumans() ?? 'Just now',
                'timestamp' => $donation->created_at?->timestamp ?? 0,
                'url' => route('account.admin.donation-monitoring'),
                'status' => $donation->status,
            ];
        }

        // Recent Volunteers
        $recentVolunteers = VolunteerApplication::latest()->limit(4)->get();
        foreach ($recentVolunteers as $vol) {
            $recentActivities[] = [
                'id' => 'volunteer-'.$vol->id,
                'type' => 'volunteer',
                'description' => sprintf(
                    '%s submitted volunteer application (%s)',
                    $vol->full_name,
                    ucfirst($vol->status)
                ),
                'time' => $vol->created_at?->diffForHumans() ?? 'Just now',
                'timestamp' => $vol->created_at?->timestamp ?? 0,
                'url' => route('account.admin.volunteer-management'),
                'status' => $vol->status,
            ];
        }

        // Sort by timestamp DESC
        usort($recentActivities, function ($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        // Limit to 8 activities
        $recentActivities = array_slice($recentActivities, 0, 8);

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentActivities' => $recentActivities,
        ]);
    }
}

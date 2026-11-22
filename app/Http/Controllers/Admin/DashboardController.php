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
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin overview dashboard.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => Inertia::defer(fn (): array => $this->getDashboardStats()),
            'recentActivities' => Inertia::defer(fn (): array => $this->getRecentActivities()),
        ]);
    }

    /**
     * Gather key admin dashboard metrics.
     *
     * @return array<string, mixed>
     */
    private function getDashboardStats(): array
    {
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

        return [
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
    }

    /**
     * Fetch recent records to build a chronological timeline.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getRecentActivities(): array
    {
        $recentActivities = [];

        // Recent Rescues
        $recentRescues = PetReport::latest()->limit(4)->get();
        foreach ($recentRescues as $report) {
            $recentActivities[] = [
                'id' => 'rescue-'.$report->id,
                'type' => 'rescue',
                'description' => sprintf(
                    'New %s report submitted at %s (%s)',
                    $this->formatReportType($report->type),
                    $report->location,
                    $this->formatStatusLabel($report->status)
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
                    $this->formatStatusLabel($statusVal)
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
                ? sprintf('%s donated %s %s (%s)', $donation->donor_name, $donation->amount, $donation->currency, $this->formatStatusLabel($donation->status))
                : sprintf('%s submitted In-Kind donation (%s)', $donation->donor_name, $this->formatStatusLabel($donation->status));

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
                    $this->formatStatusLabel($vol->status)
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
        return array_slice($recentActivities, 0, 8);
    }

    private function formatStatusLabel(?string $status): string
    {
        return Str::headline((string) $status);
    }

    private function formatReportType(?string $type): string
    {
        $normalized = strtolower(trim((string) $type));
        if ($normalized === 'sos') {
            return 'SOS';
        }

        return Str::headline((string) $type);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AdoptionApplication;
use App\Models\Donation;
use App\Models\PetReport;
use App\Models\User;
use App\Models\VolunteerApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportsAnalyticsController extends Controller
{
    /**
     * Display reports and analytics.
     */
    public function index(Request $request): Response
    {
        $validDonationStatuses = [DonationStatus::Verified->value, DonationStatus::Completed->value];

        $computeData = function () use ($validDonationStatuses) {
            $now = now();
            $currentYear = $now->year;

            // 1. Monthly Data (Current Year) - 3 queries instead of 36
            $startOfYear = $now->copy()->startOfYear();
            $endOfYear = $now->copy()->endOfYear();

            $yearRescues = PetReport::whereBetween('created_at', [$startOfYear, $endOfYear])
                ->select('created_at')
                ->get()
                ->groupBy(fn ($item) => (int) $item->created_at->format('n'));

            $yearAdoptions = AdoptionApplication::whereBetween('created_at', [$startOfYear, $endOfYear])
                ->select('created_at')
                ->get()
                ->groupBy(fn ($item) => (int) $item->created_at->format('n'));

            $yearDonations = Donation::whereBetween('created_at', [$startOfYear, $endOfYear])
                ->whereIn('status', $validDonationStatuses)
                ->select('created_at', 'amount')
                ->get()
                ->groupBy(fn ($item) => (int) $item->created_at->format('n'));

            $monthlyRescues = [];
            $monthlyAdoptions = [];
            $monthlyDonations = [];
            $months = [];

            for ($m = 1; $m <= 12; $m++) {
                $months[] = date('F', mktime(0, 0, 0, $m, 1));
                $monthlyRescues[] = isset($yearRescues[$m]) ? $yearRescues[$m]->count() : 0;
                $monthlyAdoptions[] = isset($yearAdoptions[$m]) ? $yearAdoptions[$m]->count() : 0;
                $monthlyDonations[] = isset($yearDonations[$m]) ? (float) $yearDonations[$m]->sum('amount') : 0.0;
            }

            // 2. Weekly Data (Last 8 Weeks) - 3 queries instead of 24
            $startOfWeeks = $now->copy()->subWeeks(7)->startOfWeek();
            $endOfWeeks = $now->copy()->endOfWeek();

            $weeksRescues = PetReport::whereBetween('created_at', [$startOfWeeks, $endOfWeeks])
                ->select('created_at')
                ->get();

            $weeksAdoptions = AdoptionApplication::whereBetween('created_at', [$startOfWeeks, $endOfWeeks])
                ->select('created_at')
                ->get();

            $weeksDonations = Donation::whereBetween('created_at', [$startOfWeeks, $endOfWeeks])
                ->whereIn('status', $validDonationStatuses)
                ->select('created_at', 'amount')
                ->get();

            $weeklyRescues = [];
            $weeklyAdoptions = [];
            $weeklyDonations = [];
            $weeks = [];

            for ($w = 7; $w >= 0; $w--) {
                $subWeek = $now->copy()->subWeeks($w);
                $startOfWeek = $subWeek->copy()->startOfWeek();
                $endOfWeek = $subWeek->copy()->endOfWeek();
                $weeks[] = 'Wk '.$subWeek->format('W');

                $weeklyRescues[] = $weeksRescues->filter(fn ($r) => $r->created_at >= $startOfWeek && $r->created_at <= $endOfWeek)->count();
                $weeklyAdoptions[] = $weeksAdoptions->filter(fn ($a) => $a->created_at >= $startOfWeek && $a->created_at <= $endOfWeek)->count();
                $weeklyDonations[] = (float) $weeksDonations->filter(fn ($d) => $d->created_at >= $startOfWeek && $d->created_at <= $endOfWeek)->sum('amount');
            }

            // 3. Yearly Data (Last 3 Years) - 3 queries instead of 9
            $startOf3Years = $now->copy()->subYears(2)->startOfYear();
            $endOf3Years = $now->copy()->endOfYear();

            $yearsRescues = PetReport::whereBetween('created_at', [$startOf3Years, $endOf3Years])
                ->select('created_at')
                ->get()
                ->groupBy(fn ($item) => (int) $item->created_at->format('Y'));

            $yearsAdoptions = AdoptionApplication::whereBetween('created_at', [$startOf3Years, $endOf3Years])
                ->select('created_at')
                ->get()
                ->groupBy(fn ($item) => (int) $item->created_at->format('Y'));

            $yearsDonations = Donation::whereBetween('created_at', [$startOf3Years, $endOf3Years])
                ->whereIn('status', $validDonationStatuses)
                ->select('created_at', 'amount')
                ->get()
                ->groupBy(fn ($item) => (int) $item->created_at->format('Y'));

            $yearlyRescues = [];
            $yearlyAdoptions = [];
            $yearlyDonations = [];
            $years = [];

            for ($y = 2; $y >= 0; $y--) {
                $yr = $currentYear - $y;
                $years[] = (string) $yr;
                $yearlyRescues[] = isset($yearsRescues[$yr]) ? $yearsRescues[$yr]->count() : 0;
                $yearlyAdoptions[] = isset($yearsAdoptions[$yr]) ? $yearsAdoptions[$yr]->count() : 0;
                $yearlyDonations[] = isset($yearsDonations[$yr]) ? (float) $yearsDonations[$yr]->sum('amount') : 0.0;
            }

            // 4. Summaries
            $summary = [
                'rescues' => [
                    'total' => PetReport::count(),
                    'resolved' => PetReport::where('status', 'resolved')->count(),
                    'pending' => PetReport::where('status', 'pending')->count(),
                    'duplicate' => PetReport::where('is_duplicate', true)->count(),
                ],
                'adoptions' => [
                    'total' => AdoptionApplication::count(),
                    'approved' => AdoptionApplication::where('status', 'approved')->count(),
                    'rejected' => AdoptionApplication::where('status', 'rejected')->count(),
                    'pending' => AdoptionApplication::where('status', 'pending')->count(),
                ],
                'donations' => [
                    'total_cash' => (float) Donation::where('type', DonationType::Cash->value)->whereIn('status', $validDonationStatuses)->sum('amount'),
                    'current_month_cash' => (float) Donation::where('type', DonationType::Cash->value)
                        ->whereIn('status', $validDonationStatuses)
                        ->whereYear('created_at', $currentYear)
                        ->whereMonth('created_at', $now->month)
                        ->sum('amount'),
                    'total_cash_count' => Donation::where('type', DonationType::Cash->value)->whereIn('status', $validDonationStatuses)->count(),
                    'total_inkind_count' => Donation::whereIn('type', [DonationType::InKind->value, 'in-kind'])->whereIn('status', $validDonationStatuses)->count(),
                ],
                'volunteers' => [
                    'total' => User::where('role', Role::Volunteer->value)->count(),
                    'pending_apps' => VolunteerApplication::where('status', 'pending')->count(),
                ],
            ];

            return [
                'months' => $months,
                'weeks' => $weeks,
                'years' => $years,
                'animalBreakdown' => [
                    'cats' => PetReport::whereRaw('LOWER(animal_type) = ?', ['cat'])->count(),
                    'dogs' => PetReport::whereRaw('LOWER(animal_type) = ?', ['dog'])->count(),
                    'others' => PetReport::whereRaw('LOWER(animal_type) NOT IN (?, ?)', ['cat', 'dog'])->count(),
                ],
                'donationBreakdown' => [
                    'cash' => Donation::where('type', DonationType::Cash->value)->whereIn('status', $validDonationStatuses)->count(),
                    'inkind' => Donation::whereIn('type', [DonationType::InKind->value, 'in-kind'])->whereIn('status', $validDonationStatuses)->count(),
                    'sponsor' => Donation::whereIn('type', [DonationType::FeedingSponsorship->value, 'sponsor'])->whereIn('status', $validDonationStatuses)->count(),
                ],
                'monthly' => [
                    'rescues' => $monthlyRescues,
                    'adoptions' => $monthlyAdoptions,
                    'donations' => $monthlyDonations,
                ],
                'weekly' => [
                    'rescues' => $weeklyRescues,
                    'adoptions' => $weeklyAdoptions,
                    'donations' => $weeklyDonations,
                ],
                'yearly' => [
                    'rescues' => $yearlyRescues,
                    'adoptions' => $yearlyAdoptions,
                    'donations' => $yearlyDonations,
                ],
                'summary' => $summary,
            ];
        };

        $data = app()->runningUnitTests()
            ? $computeData()
            : Cache::remember('admin_reports_analytics_data', 120, $computeData);

        return Inertia::render('admin/reports-analytics', $data);
    }

    /**
     * Export reports data as a standard CSV compatible with Excel.
     */
    public function export(Request $request): StreamedResponse
    {
        $type = $request->input('type', 'summary');
        $fileName = 'pawlse_'.$type.'_report_'.date('Ymd_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$fileName.'"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($type) {
            $file = fopen('php://output', 'w');

            // Add Excel UTF-8 BOM
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            if ($type === 'summary') {
                fputcsv($file, ['PAWLSE ANIMAL WELFARE PLATFORM OVERVIEW SUMMARY REPORT']);
                fputcsv($file, ['Exported Date', date('Y-m-d H:i:s')]);
                fputcsv($file, []);

                fputcsv($file, ['Metric Category', 'Metric Name', 'Count/Value']);
                fputcsv($file, ['Rescues', 'Total Rescue Reports', PetReport::count()]);
                fputcsv($file, ['Rescues', 'Pending Rescues', PetReport::where('status', 'pending')->count()]);
                fputcsv($file, ['Rescues', 'Resolved Rescues', PetReport::where('status', 'resolved')->count()]);

                fputcsv($file, ['Adoptions', 'Total Applications', AdoptionApplication::count()]);
                fputcsv($file, ['Adoptions', 'Approved Applications', AdoptionApplication::where('status', 'approved')->count()]);
                fputcsv($file, ['Adoptions', 'Pending Applications', AdoptionApplication::where('status', 'pending')->count()]);

                fputcsv($file, ['Donations', 'Total Cash Donations (PHP)', Donation::where('type', DonationType::Cash->value)->whereIn('status', [DonationStatus::Verified->value, DonationStatus::Completed->value])->sum('amount')]);
                fputcsv($file, ['Donations', 'Verified In-Kind Donations', Donation::whereIn('type', [DonationType::InKind->value, 'in-kind'])->whereIn('status', [DonationStatus::Verified->value, DonationStatus::Completed->value])->count()]);

                fputcsv($file, ['Volunteers', 'Active Volunteers Count', User::where('role', Role::Volunteer->value)->count()]);
                fputcsv($file, ['Volunteers', 'Pending Applications Count', VolunteerApplication::where('status', 'pending')->count()]);
                fputcsv($file, []);

                // Write Monthly Breakdown for current year
                fputcsv($file, ['MONTH-BY-MONTH SUMMARY BREAKDOWN ('.now()->year.')']);
                fputcsv($file, ['Month', 'Rescues Count', 'Adoptions Count', 'Donation Amount (PHP)']);
                for ($m = 1; $m <= 12; $m++) {
                    $monthName = date('F', mktime(0, 0, 0, $m, 1));
                    $rescues = PetReport::whereYear('created_at', now()->year)->whereMonth('created_at', $m)->count();
                    $adoptions = AdoptionApplication::whereYear('created_at', now()->year)->whereMonth('created_at', $m)->count();
                    $donations = Donation::whereYear('created_at', now()->year)->whereMonth('created_at', $m)->whereIn('status', [DonationStatus::Verified->value, DonationStatus::Completed->value])->sum('amount');
                    fputcsv($file, [$monthName, $rescues, $adoptions, (float) $donations]);
                }

            } elseif ($type === 'rescues') {
                fputcsv($file, ['PAWLSE DETAILED RESCUES REPORT']);
                fputcsv($file, ['Exported Date', date('Y-m-d H:i:s')]);
                fputcsv($file, []);

                fputcsv($file, ['Report ID', 'Type', 'Animal Type', 'Breed', 'Location', 'Status', 'Date Reported', 'Urgency']);
                $reports = PetReport::latest()->get();
                foreach ($reports as $report) {
                    fputcsv($file, [
                        $report->id,
                        $report->type,
                        $report->animal_type,
                        $report->breed ?? 'Unknown',
                        $report->location,
                        $report->status,
                        $report->created_at->format('Y-m-d H:i:s'),
                        $report->urgency ?? 'N/A',
                    ]);
                }

            } elseif ($type === 'adoptions') {
                fputcsv($file, ['PAWLSE DETAILED ADOPTION APPLICATIONS REPORT']);
                fputcsv($file, ['Exported Date', date('Y-m-d H:i:s')]);
                fputcsv($file, []);

                fputcsv($file, ['Application ID', 'Applicant Name', 'Email', 'Phone', 'Address', 'Status', 'Preferred Date', 'Date Applied']);
                $apps = AdoptionApplication::latest()->get();
                foreach ($apps as $app) {
                    $statusVal = $app->status instanceof \BackedEnum ? $app->status->value : $app->status;
                    fputcsv($file, [
                        $app->id,
                        $app->full_name,
                        $app->email,
                        $app->phone,
                        $app->address,
                        $statusVal,
                        $app->preferred_date,
                        $app->created_at->format('Y-m-d H:i:s'),
                    ]);
                }

            } elseif ($type === 'donations') {
                fputcsv($file, ['PAWLSE DETAILED DONATIONS REPORT']);
                fputcsv($file, ['Exported Date', date('Y-m-d H:i:s')]);
                fputcsv($file, []);

                fputcsv($file, ['Donation ID', 'Donor Name', 'Donor Email', 'Type', 'Amount (PHP)', 'Status', 'Date Submitted']);
                $donations = Donation::latest()->get();
                foreach ($donations as $donation) {
                    $typeVal = $donation->type instanceof \BackedEnum ? $donation->type->value : (string) $donation->type;
                    $statusVal = $donation->status instanceof \BackedEnum ? $donation->status->value : (string) $donation->status;
                    fputcsv($file, [
                        $donation->id,
                        $donation->donor_name,
                        $donation->donor_email,
                        $typeVal,
                        $donation->amount ?? 0,
                        $statusVal,
                        $donation->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            } elseif ($type === 'volunteers') {
                fputcsv($file, ['PAWLSE VOLUNTEER APPLICATIONS REPORT']);
                fputcsv($file, ['Exported Date', date('Y-m-d H:i:s')]);
                fputcsv($file, []);

                fputcsv($file, ['Reference', 'Full Name', 'Email', 'Mobile', 'Preferred Role', 'Status', 'Date Applied']);
                $apps = VolunteerApplication::latest()->get();
                foreach ($apps as $app) {
                    fputcsv($file, [
                        $app->reference_number,
                        $app->full_name,
                        $app->email,
                        $app->mobile,
                        $app->role,
                        $app->status,
                        $app->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

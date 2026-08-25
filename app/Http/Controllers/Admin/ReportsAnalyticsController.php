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
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportsAnalyticsController extends Controller
{
    /**
     * Display reports and analytics.
     */
    public function index(Request $request): Response
    {
        // 1. Monthly Data (Current Year)
        $monthlyRescues = [];
        $monthlyAdoptions = [];
        $monthlyDonations = [];
        $months = [];

        for ($m = 1; $m <= 12; $m++) {
            $monthName = date('F', mktime(0, 0, 0, $m, 1));
            $months[] = $monthName;
            $monthlyRescues[] = PetReport::whereYear('created_at', now()->year)->whereMonth('created_at', $m)->count();
            $monthlyAdoptions[] = AdoptionApplication::whereYear('created_at', now()->year)->whereMonth('created_at', $m)->count();
            $monthlyDonations[] = (float) Donation::whereYear('created_at', now()->year)->whereMonth('created_at', $m)->where('status', 'verified')->sum('amount');
        }

        // 2. Weekly Data (Last 8 Weeks)
        $weeklyRescues = [];
        $weeklyAdoptions = [];
        $weeklyDonations = [];
        $weeks = [];

        for ($w = 7; $w >= 0; $w--) {
            $startOfWeek = now()->subWeeks($w)->startOfWeek();
            $endOfWeek = now()->subWeeks($w)->endOfWeek();
            $label = 'Wk '.now()->subWeeks($w)->format('W');

            $weeks[] = $label;
            $weeklyRescues[] = PetReport::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count();
            $weeklyAdoptions[] = AdoptionApplication::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count();
            $weeklyDonations[] = (float) Donation::whereBetween('created_at', [$startOfWeek, $endOfWeek])->where('status', 'verified')->sum('amount');
        }

        // 3. Yearly Data (Last 3 Years)
        $yearlyRescues = [];
        $yearlyAdoptions = [];
        $yearlyDonations = [];
        $years = [];

        for ($y = 2; $y >= 0; $y--) {
            $year = now()->year - $y;
            $years[] = (string) $year;
            $yearlyRescues[] = PetReport::whereYear('created_at', $year)->count();
            $yearlyAdoptions[] = AdoptionApplication::whereYear('created_at', $year)->count();
            $yearlyDonations[] = (float) Donation::whereYear('created_at', $year)->where('status', 'verified')->sum('amount');
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
                'total_cash' => (float) Donation::where('type', 'cash')->where('status', 'verified')->sum('amount'),
                'total_cash_count' => Donation::where('type', 'cash')->where('status', 'verified')->count(),
                'total_inkind_count' => Donation::where('type', 'in-kind')->where('status', 'verified')->count(),
            ],
            'volunteers' => [
                'total' => User::where('role', Role::Volunteer->value)->count(),
                'pending_apps' => VolunteerApplication::where('status', 'pending')->count(),
            ],
        ];

        return Inertia::render('admin/reports-analytics', [
            'months' => $months,
            'weeks' => $weeks,
            'years' => $years,
            'animalBreakdown' => [
                'cats' => PetReport::whereRaw('LOWER(animal_type) = ?', ['cat'])->count(),
                'dogs' => PetReport::whereRaw('LOWER(animal_type) = ?', ['dog'])->count(),
                'others' => PetReport::whereRaw('LOWER(animal_type) NOT IN (?, ?)', ['cat', 'dog'])->count(),
            ],
            'donationBreakdown' => [
                'cash' => Donation::where('type', 'cash')->where('status', 'verified')->count(),
                'inkind' => Donation::where('type', 'in-kind')->where('status', 'verified')->count(),
                'sponsor' => Donation::where('type', 'sponsor')->where('status', 'verified')->count(),
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
        ]);
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

                fputcsv($file, ['Donations', 'Total Cash Donations (PHP)', Donation::where('type', 'cash')->where('status', 'verified')->sum('amount')]);
                fputcsv($file, ['Donations', 'Verified In-Kind Donations', Donation::where('type', 'in-kind')->where('status', 'verified')->count()]);

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
                    $donations = Donation::whereYear('created_at', now()->year)->whereMonth('created_at', $m)->where('status', 'verified')->sum('amount');
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
                    fputcsv($file, [
                        $donation->id,
                        $donation->donor_name,
                        $donation->donor_email,
                        $donation->type,
                        $donation->amount ?? 0,
                        $donation->status,
                        $donation->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

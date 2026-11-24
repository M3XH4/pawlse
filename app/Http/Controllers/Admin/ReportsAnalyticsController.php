<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AdoptionApplication;
use App\Models\Donation;
use App\Models\PetReport;
use App\Models\User;
use App\Models\VolunteerApplication;
use App\Services\AnalyticsReportService;
use Carbon\CarbonInterface;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportsAnalyticsController extends Controller
{
    public function __construct(public AnalyticsReportService $reportService) {}

    /**
     * Display reports and analytics.
     */
    public function index(Request $request): Response
    {
        $period = (string) $request->query('period', '30d');
        $startDate = $request->query('start_date') ? (string) $request->query('start_date') : null;
        $endDate = $request->query('end_date') ? (string) $request->query('end_date') : null;
        $forceRefresh = $request->boolean('refresh');

        [$start, $end, $prevStart, $prevEnd, $interval, $periodLabel] = $this->reportService->resolvePeriods(
            $period,
            $startDate,
            $endDate,
        );

        $cacheKey = sprintf(
            'admin_reports_analytics_%s_%s_%s',
            $period,
            $start->format('Ymd'),
            $end->format('Ymd')
        );

        $computeData = fn (): array => $this->buildAdminAnalyticsPayload(
            $period,
            $start,
            $end,
            $prevStart,
            $prevEnd,
            $periodLabel,
        );

        if ($forceRefresh) {
            Cache::forget($cacheKey);
        }

        $data = (app()->runningUnitTests() || $forceRefresh)
            ? $computeData()
            : Cache::remember($cacheKey, 120, $computeData);

        return Inertia::render('admin/reports-analytics', $data);
    }

    /**
     * Render a modern, print-ready executive PDF report for Admin analytics.
     */
    public function exportPdf(Request $request): View
    {
        $period = (string) $request->query('period', '30d');
        $startDate = $request->query('start_date') ? (string) $request->query('start_date') : null;
        $endDate = $request->query('end_date') ? (string) $request->query('end_date') : null;
        $section = (string) $request->query('section', 'all');

        if (! in_array($section, ['all', 'rescues', 'adoptions', 'donations', 'operations'], true)) {
            $section = 'all';
        }

        [$start, $end, $prevStart, $prevEnd, $interval, $periodLabel] = $this->reportService->resolvePeriods(
            $period,
            $startDate,
            $endDate,
        );

        $analytics = $this->buildAdminAnalyticsPayload(
            $period,
            $start,
            $end,
            $prevStart,
            $prevEnd,
            $periodLabel,
        );

        $tables = $this->reportService->getRecentPdfTables($start, $end);
        $brand = $this->reportService->resolveBrandAssets();
        $user = $request->user();

        $trendSeries = [];
        foreach ($analytics['months'] as $idx => $monthName) {
            $trendSeries[] = [
                'label' => substr($monthName, 0, 3),
                'primary' => $analytics['monthly']['rescues'][$idx] ?? 0,
                'secondary' => $analytics['monthly']['adoptions'][$idx] ?? 0,
                'amount' => $analytics['monthly']['donations'][$idx] ?? 0.0,
            ];
        }

        $animalDonut = $this->reportService->prepareDonutChart([
            ['name' => 'Cats', 'value' => $analytics['animalBreakdown']['cats']],
            ['name' => 'Dogs', 'value' => $analytics['animalBreakdown']['dogs']],
            ['name' => 'Others', 'value' => $analytics['animalBreakdown']['others']],
        ], ['#0D9488', '#3B82F6', '#64748B']);

        $donationDonut = $this->reportService->prepareDonutChart([
            ['name' => 'Cash', 'value' => $analytics['donationBreakdown']['cash']],
            ['name' => 'In-Kind', 'value' => $analytics['donationBreakdown']['inkind']],
            ['name' => 'Sponsorships', 'value' => $analytics['donationBreakdown']['sponsor']],
        ], ['#F59E0B', '#8B5CF6', '#EC4899']);

        $shelterDonut = $this->reportService->prepareDonutChart(
            $analytics['shelterCensus']['status_breakdown'],
            ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#F43F5E', '#64748B']
        );

        $sectionTitleMap = [
            'all' => 'Executive Shelter & Operations Report',
            'rescues' => 'Rescue & Emergency Response Report',
            'adoptions' => 'Adoptions & Placement Pipeline Report',
            'donations' => 'Financial Donations & Sustainability Report',
            'operations' => 'Shelter Census, Foster & Field Ops Report',
        ];

        return view('reports.pdf-report', [
            'roleScope' => 'admin',
            'reportTitle' => $sectionTitleMap[$section],
            'reportSubtitle' => 'Comprehensive operational intelligence, animal welfare census, and financial accountability summary.',
            'section' => $section,
            'autoprint' => $request->boolean('autoprint'),
            'brand' => $brand,
            'meta' => [
                'report_id' => 'ADM-'.now()->format('Ymd-His').'-'.strtoupper(Str::random(4)),
                'generated_by' => $user?->name ?? 'Shelter Administrator',
                'generated_role' => 'Shelter Administrator',
                'generated_at' => now()->format('F d, Y • g:i A'),
                'period_label' => $periodLabel,
                'date_range' => $start->format('M d, Y').' – '.$end->format('M d, Y'),
            ],
            'analytics' => $analytics,
            'tables' => $tables,
            'charts' => [
                'trendSeries' => $trendSeries,
                'animalDonut' => $animalDonut,
                'donationDonut' => $donationDonut,
                'shelterDonut' => $shelterDonut,
            ],
            'csvUrl' => route('account.admin.reports-analytics.export', [
                'type' => $section === 'all' ? 'full' : $section,
            ]),
        ]);
    }

    /**
     * Export reports data as a standard CSV compatible with Excel.
     */
    public function export(Request $request): StreamedResponse
    {
        $type = (string) $request->input('type', 'summary');
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

            $validDonationStatuses = [DonationStatus::Verified->value, DonationStatus::Completed->value];

            if ($type === 'summary' || $type === 'full') {
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

                fputcsv($file, ['Donations', 'Total Cash Donations (PHP)', Donation::where('type', DonationType::Cash->value)->whereIn('status', $validDonationStatuses)->sum('amount')]);
                fputcsv($file, ['Donations', 'Verified In-Kind Donations', Donation::whereIn('type', [DonationType::InKind->value, 'in-kind'])->whereIn('status', $validDonationStatuses)->count()]);

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
                    $donations = Donation::whereYear('created_at', now()->year)->whereMonth('created_at', $m)->whereIn('status', $validDonationStatuses)->sum('amount');
                    fputcsv($file, [$monthName, $rescues, $adoptions, (float) $donations]);
                }

                if ($type === 'full') {
                    fputcsv($file, []);
                    $this->writeOperationsCsvSection($file);
                }
            } elseif ($type === 'operations') {
                fputcsv($file, ['PAWLSE SHELTER OPERATIONS, FOSTER & FIELD IMPACT REPORT']);
                fputcsv($file, ['Exported Date', date('Y-m-d H:i:s')]);
                fputcsv($file, []);
                $this->writeOperationsCsvSection($file);
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

    /**
     * Build the full Admin analytics payload including legacy chart series and expanded operations telemetry.
     *
     * @return array<string, mixed>
     */
    protected function buildAdminAnalyticsPayload(
        string $period,
        CarbonInterface $start,
        CarbonInterface $end,
        CarbonInterface $prevStart,
        CarbonInterface $prevEnd,
        string $periodLabel,
    ): array {
        $validDonationStatuses = [DonationStatus::Verified->value, DonationStatus::Completed->value];
        $now = now();
        $currentYear = $now->year;

        // 1. Monthly Data (Current Year)
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

        // 2. Weekly Data (Last 8 Weeks)
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

        // 3. Yearly Data (Last 3 Years)
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

        // 4. Overall Summaries
        $summary = [
            'rescues' => [
                'total' => PetReport::count(),
                'resolved' => PetReport::where('status', 'resolved')->count(),
                'pending' => PetReport::where('status', 'pending')->count(),
                'assigned' => PetReport::where('status', 'assigned')->count(),
                'duplicate' => PetReport::where('is_duplicate', true)->count(),
            ],
            'adoptions' => [
                'total' => AdoptionApplication::count(),
                'approved' => AdoptionApplication::where('status', AdoptionApplicationStatus::Approved->value)->count(),
                'rejected' => AdoptionApplication::where('status', AdoptionApplicationStatus::Rejected->value)->count(),
                'pending' => AdoptionApplication::where('status', AdoptionApplicationStatus::Pending->value)->count(),
                'scheduled' => AdoptionApplication::where('status', AdoptionApplicationStatus::Scheduled->value)->count(),
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
                'total_sponsor_amount' => (float) Donation::whereIn('type', [DonationType::FeedingSponsorship->value, 'sponsor'])
                    ->whereIn('status', $validDonationStatuses)
                    ->sum('amount'),
            ],
            'volunteers' => [
                'total' => User::where('role', Role::Volunteer->value)->count(),
                'pending_apps' => VolunteerApplication::where('status', 'pending')->count(),
            ],
        ];

        // 5. Period-Scoped KPIs & Period-over-Period Growth Deltas
        $periodRescues = PetReport::whereBetween('created_at', [$start, $end])->count();
        $prevRescues = PetReport::whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $periodRescuesResolved = PetReport::whereBetween('created_at', [$start, $end])->where('status', 'resolved')->count();

        $periodAdoptions = AdoptionApplication::whereBetween('created_at', [$start, $end])->count();
        $prevAdoptions = AdoptionApplication::whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $periodAdoptionsApproved = AdoptionApplication::whereBetween('created_at', [$start, $end])
            ->where('status', AdoptionApplicationStatus::Approved->value)
            ->count();

        $periodCash = (float) Donation::whereBetween('created_at', [$start, $end])
            ->whereIn('status', $validDonationStatuses)
            ->sum('amount');
        $prevCash = (float) Donation::whereBetween('created_at', [$prevStart, $prevEnd])
            ->whereIn('status', $validDonationStatuses)
            ->sum('amount');

        $operations = $this->reportService->getShelterOperationsMetrics($start, $end);

        return [
            'period' => $period,
            'dateRange' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
                'label' => $periodLabel,
            ],
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
            'kpis' => [
                'period_rescues' => $periodRescues,
                'period_rescues_resolved' => $periodRescuesResolved,
                'rescues_delta' => $this->reportService->calculateDelta($periodRescues, $prevRescues),
                'period_adoptions' => $periodAdoptions,
                'period_adoptions_approved' => $periodAdoptionsApproved,
                'adoptions_delta' => $this->reportService->calculateDelta($periodAdoptions, $prevAdoptions),
                'period_donations_amount' => $periodCash,
                'donations_delta' => $this->reportService->calculateDelta($periodCash, $prevCash),
            ],
            'adminInsights' => $this->reportService->getAdminScopeAnalytics($start, $end),
            ...$operations,
        ];
    }

    /**
     * Write expanded Shelter, Foster, Volunteer, and Sustainability rows to an open CSV stream.
     *
     * @param  resource  $file
     */
    protected function writeOperationsCsvSection($file): void
    {
        $ops = $this->reportService->getShelterOperationsMetrics(now()->subDays(29)->startOfDay(), now()->endOfDay());
        $census = $ops['shelterCensus'];
        $foster = $ops['fosterMetrics'];
        $volunteer = $ops['volunteerImpact'];
        $community = $ops['communityMetrics'];
        $sustainability = $ops['inventorySustainability']['sustainability'];

        fputcsv($file, ['SHELTER CENSUS & OPERATIONS BREAKDOWN']);
        fputcsv($file, ['Section', 'Metric', 'Value']);
        fputcsv($file, ['Shelter Census', 'Total Shelter Animals', $census['total']]);
        fputcsv($file, ['Shelter Census', 'Available for Adoption', $census['available']]);
        fputcsv($file, ['Shelter Census', 'Adopted', $census['adopted']]);
        fputcsv($file, ['Shelter Census', 'In Foster', $census['foster']]);
        fputcsv($file, ['Shelter Census', 'Under Treatment / Quarantine', $census['treatment'] + $census['quarantine']]);
        fputcsv($file, ['Shelter Census', 'Vaccination Rate (%)', $census['vaccination_rate'].'%']);
        fputcsv($file, ['Foster Network', 'Active Foster Placements', $foster['active_placements']]);
        fputcsv($file, ['Foster Network', 'Approved Foster Parents', $foster['approved_parents']]);
        fputcsv($file, ['Foster Network', 'Capacity Utilization (%)', $foster['utilization_rate'].'%']);
        fputcsv($file, ['Volunteer Impact (30d)', 'Hours Logged', $volunteer['hours_logged']]);
        fputcsv($file, ['Volunteer Impact (30d)', 'Completed Feeding Routes', $volunteer['feeding_routes_completed']]);
        fputcsv($file, ['Volunteer Impact (30d)', 'Strays Fed', $volunteer['strays_fed']]);
        fputcsv($file, ['Volunteer Impact (30d)', 'Food Packs Distributed', $volunteer['food_packs_distributed']]);
        fputcsv($file, ['Volunteer Impact (30d)', 'Certificates Issued', $volunteer['certificates_issued']]);
        fputcsv($file, ['Community & Support', 'Open Help Desk Tickets', $community['help_desk_open']]);
        fputcsv($file, ['Community & Support', 'Approved Events', $community['events_approved']]);
        fputcsv($file, ['Care Sustainability', 'Estimated Runway (Days)', $sustainability['est_days']]);
        fputcsv($file, ['Care Sustainability', 'Urgency Status', $sustainability['urgency_status']]);
        fputcsv($file, ['Inventory', 'Low Stock Items Count', $ops['inventorySustainability']['low_stock_count']]);
    }
}

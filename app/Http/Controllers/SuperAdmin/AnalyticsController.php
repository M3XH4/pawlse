<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Enums\DonationStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AdoptionApplication;
use App\Models\AiPredictionLog;
use App\Models\AnimalDonationNeed;
use App\Models\AnimalMedicalRecord;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Backup;
use App\Models\BlogPost;
use App\Models\BlogPostReaction;
use App\Models\Certificate;
use App\Models\CommunityHonor;
use App\Models\ContactMessage;
use App\Models\Donation;
use App\Models\DonationAmountEditRequest;
use App\Models\FeedingDistributionLog;
use App\Models\FeedingSponsorship;
use App\Models\HelpDeskTicket;
use App\Models\IdempotencyRecord;
use App\Models\InKindDonation;
use App\Models\LoginAttempt;
use App\Models\Partner;
use App\Models\PartnerFoodPickup;
use App\Models\Payment;
use App\Models\PaymentWebhookEvent;
use App\Models\PetReport;
use App\Models\PostAdoptionFollowUp;
use App\Models\RehomingRequest;
use App\Models\ResourceFile;
use App\Models\ShelterVisit;
use App\Models\User;
use App\Models\UserBadge;
use App\Models\VolunteerApplication;
use App\Models\VolunteerInjuryReport;
use App\Services\AnalyticsReportService;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalyticsController extends Controller
{
    public function __construct(public AnalyticsReportService $reportService) {}

    /**
     * Return rich aggregated analytics data for the given period with comparisons.
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json($this->buildAnalyticsPayload($request));
    }

    /**
     * Render a modern, print-ready executive PDF intelligence & audit report for Super-Admin.
     */
    public function exportPdf(Request $request): View
    {
        $payload = $this->buildAnalyticsPayload($request);
        $period = (string) $request->query('period', '30d');
        $startDate = $request->query('start_date') ? (string) $request->query('start_date') : null;
        $endDate = $request->query('end_date') ? (string) $request->query('end_date') : null;
        $section = (string) $request->query('section', 'all');

        if (! in_array($section, ['all', 'operations', 'financials', 'security', 'ai', 'ecosystem'], true)) {
            $section = 'all';
        }

        [$start, $end, $prevStart, $prevEnd, $interval, $periodLabel] = $this->reportService->resolvePeriods(
            $period,
            $startDate,
            $endDate,
        );

        $tables = $this->reportService->getRecentPdfTables($start, $end);
        $brand = $this->reportService->resolveBrandAssets();
        $user = $request->user();

        $trendSeries = array_map(fn (array $pt) => [
            'label' => $pt['label'],
            'primary' => $pt['rescues'],
            'secondary' => $pt['adoptions'],
            'tertiary' => $pt['users'],
            'amount' => $pt['donations_amount'],
        ], array_slice($payload['timeline'], -12));

        $roleDonut = $this->reportService->prepareDonutChart(
            $payload['role_breakdown'],
            ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6']
        );

        $paymentDonut = $this->reportService->prepareDonutChart(
            $payload['payment_methods'],
            ['#06B6D4', '#10B981', '#6366F1', '#F59E0B', '#EC4899']
        );

        $aiDonut = $this->reportService->prepareDonutChart(
            $payload['ai_breakdown'],
            ['#10B981', '#F43F5E', '#64748B']
        );

        $sectionTitles = [
            'all' => 'Executive System Intelligence & Audit Report',
            'operations' => 'Super-Admin Rescue & Shelter Operations Report',
            'financials' => 'Super-Admin Donations, Revenue & Sustainability Report',
            'security' => 'Super-Admin Security Posture & Audit Trail Report',
            'ai' => 'Super-Admin AI Telemetry & Validation Report',
            'ecosystem' => 'Super-Admin Ecosystem, Infrastructure & Governance Report',
        ];

        return view('reports.pdf-report', [
            'roleScope' => 'super-admin',
            'reportTitle' => $sectionTitles[$section],
            'reportSubtitle' => 'Platform-wide telemetry covering operations, revenue channels, security posture, AI accuracy, and governance.',
            'section' => $section,
            'autoprint' => $request->boolean('autoprint'),
            'brand' => $brand,
            'meta' => [
                'report_id' => 'SYS-'.now()->format('Ymd-His').'-'.strtoupper(Str::random(4)),
                'generated_by' => $user?->name ?? 'Super Administrator',
                'generated_role' => 'Super Administrator',
                'generated_at' => now()->format('F d, Y • g:i A'),
                'period_label' => $periodLabel,
                'date_range' => $start->format('M d, Y').' – '.$end->format('M d, Y'),
            ],
            'analytics' => $payload,
            'tables' => $tables,
            'charts' => [
                'trendSeries' => $trendSeries,
                'roleDonut' => $roleDonut,
                'paymentDonut' => $paymentDonut,
                'aiDonut' => $aiDonut,
            ],
            'csvUrl' => route('account.super-admin.analytics.export', array_filter([
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ])),
        ]);
    }

    /**
     * Export the comprehensive or section-scoped analytics report as a CSV download.
     */
    public function export(Request $request): StreamedResponse
    {
        $type = (string) $request->query('type', 'full');
        if (! in_array($type, ['full', 'operations', 'financials', 'security', 'ai', 'ecosystem'], true)) {
            $type = 'full';
        }

        $payload = $this->buildAnalyticsPayload($request);
        $period = $payload['period'];
        $dateRange = $payload['date_range'];
        $stats = $payload['stats'];
        $deltas = $payload['deltas'];
        $ecosystem = $payload['ecosystem'];
        $governance = $payload['governance'];
        $ops = $payload['operations_deep_dive'];
        $fin = $payload['financial_deep_dive'];
        $sec = $payload['security_posture'];
        $secExtras = $payload['security_extras'];
        $infra = $payload['infrastructure'];
        $plat = $payload['platform_ecosystem'];
        $aiPerf = $payload['ai_feature_performance'];
        $aiExtras = $payload['ai_telemetry_extras'];

        $titles = [
            'full' => '=== PAWLSE SUPER-ADMIN FULL EXECUTIVE ANALYTICS CSV ===',
            'operations' => '=== PAWLSE SUPER-ADMIN RESCUE, CLINICAL & OPERATIONS CSV ===',
            'financials' => '=== PAWLSE SUPER-ADMIN FINANCIALS, GATEWAYS & SPONSORSHIPS CSV ===',
            'security' => '=== PAWLSE SUPER-ADMIN SECURITY POSTURE & AUDIT TRAIL CSV ===',
            'ai' => '=== PAWLSE SUPER-ADMIN AI TELEMETRY & CALIBRATION CSV ===',
            'ecosystem' => '=== PAWLSE SUPER-ADMIN ECOSYSTEM, PARTNERS & GOVERNANCE CSV ===',
        ];

        $rows = [
            [$titles[$type]],
            ['Generated At', now()->toDateTimeString()],
            ['Period Selected', strtoupper((string) $period)],
            ['Date Range', $dateRange['start'].' to '.$dateRange['end']],
            [],
        ];

        if ($type === 'full') {
            $rows[] = ['=== 1. EXECUTIVE SUMMARY & KPIS ==='];
            $rows[] = ['Metric', 'Current Value', 'Delta / Context'];
            $rows[] = ['New Registered Users', $stats['users'], $deltas['users'].'% vs previous'];
            $rows[] = ['Rescue / Missing Reports', $stats['rescue_reports'], $deltas['rescues'].'% vs previous ('.$stats['rescue_resolution_rate'].'% resolved)'];
            $rows[] = ['Adoption Applications', $stats['adoptions'], $deltas['adoptions'].'% vs previous ('.$stats['adoption_approval_rate'].'% approved)'];
            $rows[] = ['Total Verified Donations (PHP)', number_format((float) $stats['donations_amount'], 2, '.', ''), $deltas['donations_amount'].'% vs previous'];
            $rows[] = ['Suspicious Login Alerts', $stats['suspicious_logins'], $deltas['suspicious_logins'].'% vs previous ('.$stats['login_success_rate'].'% login success)'];
            $rows[] = ['AI Predictions Processed', $stats['ai_predictions'], $deltas['ai_predictions'].'% vs previous ('.$stats['ai_accuracy_rate'].'% accuracy)'];
            $rows[] = ['Composite Platform Health Score', $stats['health_score'].'/100', $stats['audit_events'].' audit events'];
            $rows[] = [];
        }

        if (in_array($type, ['full', 'operations'], true)) {
            $rows[] = ['=== RESCUE, CLINICAL & FIELD OPERATIONS ==='];
            $rows[] = ['Category', 'Metric', 'Value'];
            $rows[] = ['Dispatch SLA', 'Critical / High Unresolved Reports', $ops['kpis']['critical_pending_sos']];
            $rows[] = ['Dispatch SLA', 'Average Rescue Resolution (Hours)', $ops['kpis']['avg_resolution_hours']];
            $rows[] = ['Clinical Care', 'Medical Records Logged', $ops['kpis']['medical_records_count']];
            $rows[] = ['Community Flow', 'Shelter Visits (Completed / Total)', $ops['kpis']['shelter_visits_completed'].' / '.$ops['kpis']['shelter_visits_count']];
            $rows[] = ['Community Flow', 'Rehoming Requests Submitted', $ops['kpis']['rehoming_requests_count']];
            $rows[] = ['Adoption Care', 'Post-Adoption Follow-Ups', $ops['kpis']['follow_ups_count']];
            $rows[] = ['Field Tasks', 'Assigned Tasks Completed', $ops['kpis']['assigned_tasks_completed'].' / '.$ops['kpis']['assigned_tasks_total'].' ('.$ops['kpis']['task_completion_rate'].'%)'];
            $rows[] = ['Field Outreach', 'Strays Fed / Packs Distributed', $ops['kpis']['strays_fed_period'].' / '.$ops['kpis']['food_packs_distributed']];
            $rows[] = ['Shelter Census', 'Total Animals / Vaccination Rate', $ecosystem['shelterCensus']['total'].' / '.$ecosystem['shelterCensus']['vaccination_rate'].'%'];
            foreach ($payload['rescue_status_breakdown'] as $rs) {
                $rows[] = ['Rescue Status', $rs['name'], $rs['value']];
            }
            foreach ($payload['animal_type_breakdown'] as $at) {
                $rows[] = ['Animal Species', $at['name'], $at['value']];
            }
            foreach ($ecosystem['topRescueLocations'] as $loc) {
                $rows[] = ['Rescue Hotspot', $loc['location'], $loc['total'].' reports ('.$loc['resolution_rate'].'% resolved)'];
            }
            $rows[] = [];
        }

        if (in_array($type, ['full', 'financials'], true)) {
            $rows[] = ['=== FINANCIALS, SPONSORSHIPS & PAYMENT GATEWAYS ==='];
            $rows[] = ['Metric', 'Value', 'Additional Detail'];
            $rows[] = ['Unique Verified Donors', $fin['kpis']['unique_donors'], 'Largest Gift: PHP '.number_format((float) $fin['kpis']['largest_donation'], 2, '.', '')];
            $rows[] = ['Pending Donation Reviews', $fin['kpis']['pending_verification_count'], 'Pending Amount: PHP '.number_format((float) $fin['kpis']['pending_verification_amount'], 2, '.', '')];
            $rows[] = ['Feeding Sponsorships', $fin['kpis']['sponsorships_count'], 'Total: PHP '.number_format((float) $fin['kpis']['sponsorships_amount'], 2, '.', '')];
            $rows[] = ['In-Kind Contributions', $fin['kpis']['in_kind_count'], $fin['kpis']['in_kind_units'].' pledged item units'];
            $rows[] = ['Pending Amount Edit Requests', $fin['kpis']['pending_amount_edits'], $fin['kpis']['active_animal_needs'].' open animal needs'];
            $rows[] = [];
            $rows[] = ['Gateway Method', 'Transactions', 'Total Volume (PHP)', 'Avg Gift (PHP)', 'Share (%)'];
            foreach ($fin['channel_performance'] as $ch) {
                $rows[] = [
                    $ch['method'],
                    $ch['count'],
                    number_format((float) $ch['total_amount'], 2, '.', ''),
                    number_format((float) $ch['avg_amount'], 2, '.', ''),
                    $ch['share_pct'].'%',
                ];
            }
            $rows[] = [];
            $rows[] = ['Reference', 'Donor', 'Type', 'Amount (PHP)', 'Status', 'Logged'];
            foreach ($fin['recent_donations'] as $don) {
                $rows[] = [
                    $don['reference'],
                    $don['donor_name'],
                    $don['type'],
                    number_format((float) $don['amount'], 2, '.', ''),
                    $don['status'],
                    $don['time'],
                ];
            }
            $rows[] = [];
        }

        if (in_array($type, ['full', 'security'], true)) {
            $rows[] = ['=== SECURITY POSTURE, 2FA & INFRASTRUCTURE ==='];
            $rows[] = ['Control / Metric', 'Value', 'Detail'];
            $rows[] = ['Login Success Rate', $stats['login_success_rate'].'%', $stats['suspicious_logins'].' suspicious alerts'];
            $rows[] = ['Verified User Accounts', $sec['verified_users'].' / '.$sec['total_users'], $sec['email_verification_rate'].'% verification rate'];
            $rows[] = ['Staff 2FA Enforcement', $sec['staff_2fa_enabled'].' / '.$sec['staff_total'], $sec['staff_2fa_rate'].'% adoption ('.$sec['users_2fa_enabled'].' users total)'];
            $rows[] = ['Idempotency Replay Guards', $secExtras['idempotency_guards_count'], $infra['webhook_events_processed'].'/'.$infra['webhook_events_total'].' payment webhooks processed'];
            $rows[] = ['Backup Storage Footprint', $infra['backups_total_size_mb'].' MB', $infra['backups_completed'].' completed / '.$infra['backups_failed'].' failed'];
            $rows[] = [];
            $rows[] = ['Flagged IP Address', 'Failed / Flagged Attempts', 'Suspicious Count', 'Last Seen'];
            foreach ($sec['top_suspicious_ips'] as $ip) {
                $rows[] = [$ip['ip_address'], $ip['attempts_count'], $ip['suspicious_count'], $ip['last_seen']];
            }
            $rows[] = [];
            $rows[] = ['Actor Name', 'Email', 'Role', 'Audit Actions', 'Last Active'];
            foreach ($payload['top_audit_actors'] as $actor) {
                $rows[] = [$actor['name'], $actor['email'], $actor['role'], $actor['actions_count'], $actor['last_action']];
            }
            $rows[] = [];
        }

        if (in_array($type, ['full', 'ai'], true)) {
            $rows[] = ['=== AI TELEMETRY & MODEL CALIBRATION ==='];
            $rows[] = ['Metric', 'Value', 'Context'];
            $rows[] = ['Total AI Predictions', $stats['ai_predictions'], $aiExtras['evaluated_count'].' evaluated / '.$aiExtras['pending_review_count'].' pending review'];
            $rows[] = ['Verified Accuracy Rate', $stats['ai_accuracy_rate'].'%', $aiExtras['inaccurate_count'].' flagged inaccurate'];
            $rows[] = ['Mean Confidence / High-Conf (>=80%)', $stats['ai_avg_confidence'].'%', $aiExtras['high_confidence_rate'].'% high-confidence share'];
            $rows[] = [];
            $rows[] = ['Feature Pipeline', 'Predictions', 'Avg Confidence (%)', 'Evaluated', 'Verified Accuracy (%)'];
            foreach ($aiPerf as $feat) {
                $rows[] = [
                    $feat['feature'],
                    $feat['total'],
                    $feat['avg_confidence'].'%',
                    $feat['evaluated_count'],
                    $feat['accuracy_rate'] !== null ? $feat['accuracy_rate'].'%' : 'Pending',
                ];
            }
            $rows[] = [];
            $rows[] = ['Confidence Bracket', 'Predictions Count'];
            foreach ($aiExtras['confidence_buckets'] as $bucket) {
                $rows[] = [$bucket['name'], $bucket['value']];
            }
            $rows[] = [];
        }

        if (in_array($type, ['full', 'ecosystem'], true)) {
            $rows[] = ['=== ECOSYSTEM, PARTNERS & GOVERNANCE ==='];
            $rows[] = ['Domain', 'Metric', 'Value'];
            $rows[] = ['Partner Network', 'Active Partners (Total)', $plat['partners_active'].' ('.$plat['partners_total'].')'];
            $rows[] = ['Partner Network', 'Daily Food / Emergency Partners', $plat['partners_daily_food'].' / '.$plat['partners_emergency']];
            $rows[] = ['Partner Pickups', 'Completed / Total in Window', $plat['food_pickups_completed'].' / '.$plat['food_pickups_total']];
            $rows[] = ['Resource Library', 'Active Guides / Total Downloads', $plat['resources_active'].' / '.$plat['resources_total_downloads']];
            $rows[] = ['Community', 'Community Honors / Published Blogs', $plat['community_honors'].' / '.$plat['blog_posts_published']];
            $rows[] = ['Community', 'Contact Inquiries (Unread / Period)', $plat['contact_messages_unread'].' / '.$plat['contact_messages_period']];
            $rows[] = ['Gamification', 'Certificates Issued / Badges Unlocked', $plat['certificates_issued_period'].' / '.$plat['badges_awarded_period']];
            $rows[] = ['Governance', 'Pending Events / Blogs / Escalated Tickets', $governance['pending_events'].' / '.$governance['pending_blogs'].' / '.$governance['escalated_tickets']];
            $rows[] = ['Care Runway', 'Estimated Runway Days', $ecosystem['inventorySustainability']['sustainability']['est_days'].' Days ('.$ecosystem['inventorySustainability']['sustainability']['urgency_status'].')'];
            $rows[] = [];
            $rows[] = ['Top Volunteer', 'Email', 'Tasks Completed', 'Hours Logged'];
            foreach ($ecosystem['volunteerImpact']['top_volunteers'] as $vol) {
                $rows[] = [$vol['name'], $vol['email'], $vol['tasks_count'], $vol['total_hours']];
            }
        }

        $filename = 'pawlse_super_admin_'.$type.'_'.$period.'_'.now()->format('Y_m_d_His').'.csv';

        return new StreamedResponse(function () use ($rows): void {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }

    // ── Core Aggregator ───────────────────────────────────────────────────────

    /**
     * Build the full Super-Admin analytics payload for JSON API and PDF export.
     *
     * @return array<string, mixed>
     */
    protected function buildAnalyticsPayload(Request $request): array
    {
        $period = (string) $request->query('period', '30d');
        $startDate = $request->query('start_date') ? (string) $request->query('start_date') : null;
        $endDate = $request->query('end_date') ? (string) $request->query('end_date') : null;

        [$start, $end, $prevStart, $prevEnd, $interval, $periodLabel] = $this->reportService->resolvePeriods(
            $period,
            $startDate,
            $endDate,
        );

        $validDonationStatuses = [DonationStatus::Verified->value, DonationStatus::Completed->value];

        // ── 1. Summary Metrics & Period-over-Period Deltas ─────────────────────
        $currentUsers = User::whereBetween('created_at', [$start, $end])->count();
        $prevUsers = User::whereBetween('created_at', [$prevStart, $prevEnd])->count();

        $currentRescues = PetReport::whereBetween('created_at', [$start, $end])->count();
        $prevRescues = PetReport::whereBetween('created_at', [$prevStart, $prevEnd])->count();

        $currentAdoptions = AdoptionApplication::whereBetween('created_at', [$start, $end])->count();
        $prevAdoptions = AdoptionApplication::whereBetween('created_at', [$prevStart, $prevEnd])->count();

        $currentDonationsAmount = (float) Donation::whereBetween('created_at', [$start, $end])
            ->whereIn('status', $validDonationStatuses)
            ->sum('amount');
        $prevDonationsAmount = (float) Donation::whereBetween('created_at', [$prevStart, $prevEnd])
            ->whereIn('status', $validDonationStatuses)
            ->sum('amount');

        $currentDonationsCount = Donation::whereBetween('created_at', [$start, $end])->count();
        $currentVerifiedDonationsCount = Donation::whereBetween('created_at', [$start, $end])
            ->whereIn('status', $validDonationStatuses)
            ->count();
        $avgDonationAmount = $currentVerifiedDonationsCount > 0
            ? round($currentDonationsAmount / $currentVerifiedDonationsCount, 2)
            : 0;

        $currentSuspiciousLogins = LoginAttempt::where('is_suspicious', true)
            ->whereBetween('created_at', [$start, $end])
            ->count();
        $prevSuspiciousLogins = LoginAttempt::where('is_suspicious', true)
            ->whereBetween('created_at', [$prevStart, $prevEnd])
            ->count();

        $totalLoginAttempts = LoginAttempt::whereBetween('created_at', [$start, $end])->count();
        $successfulLogins = LoginAttempt::where('status', 'success')
            ->whereBetween('created_at', [$start, $end])
            ->count();
        $loginSuccessRate = $totalLoginAttempts > 0
            ? round(($successfulLogins / $totalLoginAttempts) * 100, 1)
            : 100.0;

        $resolvedRescues = PetReport::whereBetween('created_at', [$start, $end])
            ->where('status', 'resolved')
            ->count();
        $rescueResolutionRate = $currentRescues > 0
            ? round(($resolvedRescues / $currentRescues) * 100, 1)
            : 0.0;

        $approvedAdoptions = AdoptionApplication::whereBetween('created_at', [$start, $end])
            ->where('status', 'approved')
            ->count();
        $adoptionApprovalRate = $currentAdoptions > 0
            ? round(($approvedAdoptions / $currentAdoptions) * 100, 1)
            : 0.0;

        $currentAiLogs = AiPredictionLog::whereBetween('created_at', [$start, $end])->count();
        $prevAiLogs = AiPredictionLog::whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $aiAccurate = AiPredictionLog::whereBetween('created_at', [$start, $end])
            ->where('is_accurate', true)
            ->count();
        $aiEvaluated = AiPredictionLog::whereBetween('created_at', [$start, $end])
            ->whereNotNull('is_accurate')
            ->count();
        $aiAccuracyRate = $aiEvaluated > 0
            ? round(($aiAccurate / $aiEvaluated) * 100, 1)
            : 95.0;

        $aiAvgConfidence = (float) (AiPredictionLog::whereBetween('created_at', [$start, $end])
            ->whereNotNull('confidence')
            ->avg('confidence') ?? 0);
        if ($aiAvgConfidence <= 1.0 && $aiAvgConfidence > 0) {
            $aiAvgConfidence = round($aiAvgConfidence * 100, 1);
        } else {
            $aiAvgConfidence = round($aiAvgConfidence, 1);
        }

        $backupsCount = Backup::whereBetween('created_at', [$start, $end])->count();
        $successfulBackups = Backup::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->count();

        // ── 2. Composite Health Score (0 - 100) ───────────────────────────────
        $healthScore = $this->calculateHealthScore(
            $loginSuccessRate,
            $currentSuspiciousLogins,
            $aiAccuracyRate,
            $rescueResolutionRate,
            $backupsCount,
            $successfulBackups
        );

        $stats = [
            'users' => $currentUsers,
            'donations_amount' => $currentDonationsAmount,
            'donations_count' => $currentDonationsCount,
            'avg_donation_amount' => $avgDonationAmount,
            'rescue_reports' => $currentRescues,
            'rescue_resolution_rate' => $rescueResolutionRate,
            'adoptions' => $currentAdoptions,
            'adoption_approval_rate' => $adoptionApprovalRate,
            'volunteers' => VolunteerApplication::whereBetween('created_at', [$start, $end])->count(),
            'active_volunteers' => User::where('role', Role::Volunteer->value)->count(),
            'ai_predictions' => $currentAiLogs,
            'ai_accuracy_rate' => $aiAccuracyRate,
            'ai_avg_confidence' => $aiAvgConfidence,
            'suspicious_logins' => $currentSuspiciousLogins,
            'login_success_rate' => $loginSuccessRate,
            'audit_events' => AuditLog::whereBetween('created_at', [$start, $end])->count(),
            'backups' => $backupsCount,
            'health_score' => $healthScore,
        ];

        $deltas = [
            'users' => $this->calculateDelta($currentUsers, $prevUsers),
            'rescues' => $this->calculateDelta($currentRescues, $prevRescues),
            'adoptions' => $this->calculateDelta($currentAdoptions, $prevAdoptions),
            'donations_amount' => $this->calculateDelta($currentDonationsAmount, $prevDonationsAmount),
            'suspicious_logins' => $this->calculateDelta($currentSuspiciousLogins, $prevSuspiciousLogins),
            'ai_predictions' => $this->calculateDelta($currentAiLogs, $prevAiLogs),
        ];

        // ── 3. Time Series Data ──────────────────────────────────────────────
        $timeline = $this->buildMasterTimeline($start, $end, $interval);
        $loginSeries = $this->buildLoginTimeline($start, $end, $interval);
        $aiSeries = $this->buildAiTimeline($start, $end, $interval);

        // ── 4. Categorical Breakdowns ─────────────────────────────────────────
        $roleBreakdown = User::select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')->get()
            ->map(fn ($r) => ['name' => ucfirst(str_replace('_', ' ', $r->role)), 'value' => (int) $r->count])
            ->values()
            ->all();

        $reportTypeBreakdown = PetReport::whereBetween('created_at', [$start, $end])
            ->select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')->get()
            ->map(fn ($r) => ['name' => ucfirst($r->type), 'value' => (int) $r->count])
            ->values()
            ->all();

        $animalTypeBreakdown = PetReport::whereBetween('created_at', [$start, $end])
            ->select('animal_type', DB::raw('COUNT(*) as count'))
            ->groupBy('animal_type')->get()
            ->map(fn ($r) => ['name' => ucfirst($r->animal_type ?: 'Unknown'), 'value' => (int) $r->count])
            ->values()
            ->all();

        $rescueStatusBreakdown = PetReport::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')->get()
            ->map(fn ($r) => ['name' => ucfirst($r->status), 'value' => (int) $r->count])
            ->values()
            ->all();

        $urgencyBreakdown = PetReport::whereBetween('created_at', [$start, $end])
            ->whereNotNull('urgency')
            ->select('urgency', DB::raw('COUNT(*) as count'))
            ->groupBy('urgency')->get()
            ->map(fn ($r) => ['name' => ucfirst($r->urgency), 'value' => (int) $r->count])
            ->values()
            ->all();

        $donationTypeBreakdown = Donation::whereBetween('created_at', [$start, $end])
            ->select('type', DB::raw('COUNT(*) as count'), DB::raw('SUM(CASE WHEN amount IS NOT NULL THEN amount ELSE 0 END) as total_amount'))
            ->groupBy('type')->get()
            ->map(fn ($d) => [
                'name' => ucfirst(str_replace(['-', '_'], ' ', $d->type)),
                'value' => (int) $d->count,
                'amount' => (float) $d->total_amount,
            ])
            ->values()
            ->all();

        $donationStatusBreakdown = Donation::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')->get()
            ->map(fn ($d) => ['name' => ucfirst(str_replace('_', ' ', $d->status)), 'value' => (int) $d->count])
            ->values()
            ->all();

        $paymentMethods = Payment::whereBetween('created_at', [$start, $end])
            ->select('method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total_amount'))
            ->groupBy('method')->get()
            ->map(fn ($p) => [
                'name' => strtoupper($p->method ?: 'Direct / Cash'),
                'value' => (int) $p->count,
                'amount' => (float) $p->total_amount,
            ])
            ->values()
            ->all();

        $aiInaccurate = AiPredictionLog::whereBetween('created_at', [$start, $end])
            ->where('is_accurate', false)
            ->count();
        $aiUnverified = AiPredictionLog::whereBetween('created_at', [$start, $end])
            ->whereNull('is_accurate')
            ->count();
        $aiBreakdown = [
            ['name' => 'Accurate', 'value' => $aiAccurate],
            ['name' => 'Inaccurate', 'value' => $aiInaccurate],
            ['name' => 'Pending Verification', 'value' => $aiUnverified],
        ];

        $aiFeatureBreakdown = AiPredictionLog::whereBetween('created_at', [$start, $end])
            ->select('feature', DB::raw('COUNT(*) as count'))
            ->groupBy('feature')->get()
            ->map(fn ($f) => ['name' => ucfirst(str_replace('_', ' ', $f->feature)), 'value' => (int) $f->count])
            ->values()
            ->all();

        $auditActionBreakdown = AuditLog::whereBetween('created_at', [$start, $end])
            ->select('action', DB::raw('COUNT(*) as count'))
            ->groupBy('action')->get()
            ->map(fn ($a) => ['name' => ucfirst(str_replace('_', ' ', $a->action)), 'value' => (int) $a->count])
            ->values()
            ->all();

        // ── 5. Actionable Data Tables ─────────────────────────────────────────
        $topAuditActors = AuditLog::with('user')
            ->whereBetween('created_at', [$start, $end])
            ->select('user_id', DB::raw('COUNT(*) as actions_count'), DB::raw('MAX(created_at) as last_action_at'))
            ->groupBy('user_id')
            ->orderByDesc('actions_count')
            ->limit(5)
            ->get()
            ->map(function ($row) {
                return [
                    'user_id' => $row->user_id,
                    'name' => $row->user ? $row->user->name : 'System / Automated',
                    'email' => $row->user ? $row->user->email : 'system@pawlse.internal',
                    'role' => $row->user ? ucfirst(str_replace('_', ' ', $row->user->role)) : 'System',
                    'actions_count' => (int) $row->actions_count,
                    'last_action' => Carbon::parse($row->last_action_at)->diffForHumans(),
                ];
            })
            ->values()
            ->all();

        $recentSecurityEvents = LoginAttempt::with('user')
            ->whereBetween('created_at', [$start, $end])
            ->where(function ($q) {
                $q->where('is_suspicious', true)->orWhere('status', 'failed');
            })
            ->latest()
            ->limit(6)
            ->get()
            ->map(function ($attempt) {
                return [
                    'id' => $attempt->id,
                    'email' => $attempt->email ?? ($attempt->user ? $attempt->user->email : 'Unknown'),
                    'ip_address' => $attempt->ip_address ?? '0.0.0.0',
                    'status' => $attempt->status,
                    'is_suspicious' => (bool) $attempt->is_suspicious,
                    'time' => $attempt->created_at->diffForHumans(),
                ];
            })
            ->values()
            ->all();

        // ── 6. Expanded Ecosystem & Governance Telemetry ──────────────────────
        $ecosystem = $this->reportService->getShelterOperationsMetrics($start, $end);
        $governance = $this->reportService->getGovernanceMetrics();

        // ── 7. Deep System Security, Infrastructure, Partners & AI Matrix ─────
        $totalAllUsers = User::count();
        $verifiedUsersCount = User::whereNotNull('email_verified_at')->count();
        $staffTotal = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->count();
        $staff2faEnabled = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])
            ->whereNotNull('two_factor_confirmed_at')
            ->count();
        $users2faEnabled = User::whereNotNull('two_factor_confirmed_at')->count();

        $topSuspiciousIps = LoginAttempt::whereBetween('created_at', [$start, $end])
            ->where(function ($q) {
                $q->where('is_suspicious', true)->orWhere('status', 'failed');
            })
            ->whereNotNull('ip_address')
            ->select(
                'ip_address',
                DB::raw('COUNT(*) as attempts_count'),
                DB::raw('SUM(CASE WHEN is_suspicious = 1 THEN 1 ELSE 0 END) as suspicious_count'),
                DB::raw('MAX(created_at) as last_seen_at')
            )
            ->groupBy('ip_address')
            ->orderByDesc('attempts_count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'ip_address' => $row->ip_address,
                'attempts_count' => (int) $row->attempts_count,
                'suspicious_count' => (int) $row->suspicious_count,
                'last_seen' => Carbon::parse($row->last_seen_at)->diffForHumans(),
            ])
            ->values()
            ->all();

        $securityPosture = [
            'total_users' => $totalAllUsers,
            'verified_users' => $verifiedUsersCount,
            'email_verification_rate' => $totalAllUsers > 0 ? round(($verifiedUsersCount / $totalAllUsers) * 100, 1) : 100.0,
            'staff_total' => $staffTotal,
            'staff_2fa_enabled' => $staff2faEnabled,
            'staff_2fa_rate' => $staffTotal > 0 ? round(($staff2faEnabled / $staffTotal) * 100, 1) : 0.0,
            'users_2fa_enabled' => $users2faEnabled,
            'top_suspicious_ips' => $topSuspiciousIps,
        ];

        $backupsCompletedAll = Backup::where('status', 'completed')->count();
        $backupsFailedAll = Backup::where('status', '!=', 'completed')->count();
        $backupsTotalBytes = (int) Backup::where('status', 'completed')->sum('size');

        $webhookTotal = PaymentWebhookEvent::whereBetween('created_at', [$start, $end])->count();
        $webhookProcessed = PaymentWebhookEvent::whereBetween('created_at', [$start, $end])
            ->whereNotNull('processed_at')
            ->count();

        $infrastructure = [
            'backups_completed' => $backupsCompletedAll,
            'backups_failed' => $backupsFailedAll,
            'backups_total_size_mb' => round($backupsTotalBytes / (1024 * 1024), 2),
            'webhook_events_total' => $webhookTotal,
            'webhook_events_processed' => $webhookProcessed,
            'webhook_events_pending' => max(0, $webhookTotal - $webhookProcessed),
        ];

        $platformEcosystem = [
            'partners_active' => Partner::where('is_active', true)->count(),
            'partners_total' => Partner::count(),
            'partners_daily_food' => Partner::where('is_active', true)->where('provides_daily_food', true)->count(),
            'partners_emergency' => Partner::where('is_active', true)->where('is_emergency', true)->count(),
            'food_pickups_total' => PartnerFoodPickup::whereBetween('created_at', [$start, $end])->count(),
            'food_pickups_completed' => PartnerFoodPickup::whereBetween('created_at', [$start, $end])
                ->where('status', 'completed')
                ->count(),
            'resources_active' => ResourceFile::where('is_active', true)->count(),
            'resources_total_downloads' => (int) ResourceFile::sum('download_count'),
            'top_resources' => ResourceFile::where('is_active', true)
                ->orderByDesc('download_count')
                ->limit(5)
                ->get(['id', 'title', 'category', 'file_type', 'download_count'])
                ->map(fn ($res) => [
                    'title' => $res->title,
                    'category' => ucfirst(str_replace('_', ' ', (string) ($res->category ?? 'Guide'))),
                    'file_type' => strtoupper((string) ($res->file_type ?? 'PDF')),
                    'download_count' => (int) $res->download_count,
                ])
                ->values()
                ->all(),
            'community_honors' => CommunityHonor::count(),
            'contact_messages_total' => ContactMessage::count(),
            'contact_messages_period' => ContactMessage::whereBetween('created_at', [$start, $end])->count(),
            'contact_messages_unread' => ContactMessage::whereIn('status', ['unread', 'new', 'pending'])->count(),
            'blog_posts_published' => BlogPost::where('status', 'published')->count(),
            'blog_reactions_period' => BlogPostReaction::whereBetween('created_at', [$start, $end])->count(),
            'certificates_issued_period' => Certificate::whereBetween('created_at', [$start, $end])->count(),
            'badges_awarded_period' => UserBadge::whereBetween('created_at', [$start, $end])->count(),
            'help_desk_status_breakdown' => HelpDeskTicket::whereBetween('created_at', [$start, $end])
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get()
                ->map(fn ($h) => ['name' => ucfirst(str_replace('_', ' ', (string) $h->status)), 'value' => (int) $h->count])
                ->values()
                ->all(),
        ];

        $aiLogsPeriod = AiPredictionLog::whereBetween('created_at', [$start, $end])
            ->select('id', 'feature', 'confidence', 'is_accurate', 'created_at')
            ->latest()
            ->get();

        $aiFeaturePerformance = $aiLogsPeriod
            ->groupBy('feature')
            ->map(function ($logs, $feature) {
                $total = $logs->count();
                $avgConf = $this->normalizeConfidenceAverage($logs->whereNotNull('confidence')->avg('confidence'));

                $evaluated = $logs->whereNotNull('is_accurate');
                $accurate = $evaluated->where('is_accurate', true)->count();
                $accuracyRate = $evaluated->count() > 0
                    ? round(($accurate / $evaluated->count()) * 100, 1)
                    : null;

                return [
                    'feature' => ucfirst(str_replace('_', ' ', (string) $feature)),
                    'total' => $total,
                    'avg_confidence' => $avgConf,
                    'accuracy_rate' => $accuracyRate,
                    'evaluated_count' => $evaluated->count(),
                ];
            })
            ->values()
            ->all();

        $pulseInsights = $this->buildPulseInsights($start, $end, $stats, $timeline);
        $operationsDeepDive = $this->buildOperationsDeepDive($start, $end);
        $financialDeepDive = $this->buildFinancialDeepDive($start, $end, $validDonationStatuses, $paymentMethods);
        $securityExtras = $this->buildSecurityAuditExtras($start, $end, $interval);
        $aiTelemetryExtras = $this->buildAiTelemetryExtras($aiLogsPeriod);

        return [
            'period' => $period,
            'date_range' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
                'label' => $periodLabel,
            ],
            'stats' => $stats,
            'deltas' => $deltas,
            'timeline' => $timeline,
            'login_series' => $loginSeries,
            'ai_series' => $aiSeries,
            'role_breakdown' => $roleBreakdown,
            'report_type_breakdown' => $reportTypeBreakdown,
            'animal_type_breakdown' => $animalTypeBreakdown,
            'rescue_status_breakdown' => $rescueStatusBreakdown,
            'urgency_breakdown' => $urgencyBreakdown,
            'donation_type_breakdown' => $donationTypeBreakdown,
            'donation_status_breakdown' => $donationStatusBreakdown,
            'payment_methods' => $paymentMethods,
            'ai_breakdown' => $aiBreakdown,
            'ai_feature_breakdown' => $aiFeatureBreakdown,
            'audit_action_breakdown' => $auditActionBreakdown,
            'top_audit_actors' => $topAuditActors,
            'recent_security_events' => $recentSecurityEvents,
            'ecosystem' => $ecosystem,
            'governance' => $governance,
            'top_rescue_locations' => $ecosystem['topRescueLocations'],
            'top_volunteers' => $ecosystem['volunteerImpact']['top_volunteers'],
            'security_posture' => $securityPosture,
            'infrastructure' => $infrastructure,
            'platform_ecosystem' => $platformEcosystem,
            'ai_feature_performance' => $aiFeaturePerformance,
            'pulse_insights' => $pulseInsights,
            'operations_deep_dive' => $operationsDeepDive,
            'financial_deep_dive' => $financialDeepDive,
            'security_extras' => $securityExtras,
            'ai_telemetry_extras' => $aiTelemetryExtras,
        ];
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Calculate percentage change between current and previous values.
     */
    protected function calculateDelta(float|int $current, float|int $previous): float
    {
        return $this->reportService->calculateDelta($current, $previous);
    }

    /**
     * Compute composite platform health score (0 - 100).
     */
    protected function calculateHealthScore(
        float $loginSuccessRate,
        int $suspiciousLogins,
        float $aiAccuracyRate,
        float $rescueResolutionRate,
        int $backupsCount,
        int $successfulBackups
    ): int {
        $score = 100.0;

        if ($loginSuccessRate < 90) {
            $score -= (90 - $loginSuccessRate) * 0.8;
        }
        if ($suspiciousLogins > 0) {
            $score -= min($suspiciousLogins * 3, 15);
        }

        if ($aiAccuracyRate < 80) {
            $score -= (80 - $aiAccuracyRate) * 0.3;
        }

        if ($backupsCount > 0 && $successfulBackups < $backupsCount) {
            $score -= 10;
        }

        return (int) max(10, min(100, round($score)));
    }

    /**
     * Build unified timeline containing users, rescues, adoptions, and donations.
     *
     * @return array<int, array{label: string, users: int, rescues: int, adoptions: int, donations_amount: float, donations_count: int}>
     */
    protected function buildMasterTimeline(CarbonInterface $start, CarbonInterface $end, string $interval): array
    {
        $points = $this->generateIntervalSlots($start, $end, $interval);

        $users = User::whereBetween('created_at', [$start, $end])->select('created_at')->get();
        $rescues = PetReport::whereBetween('created_at', [$start, $end])->select('created_at')->get();
        $adoptions = AdoptionApplication::whereBetween('created_at', [$start, $end])->select('created_at')->get();
        $donations = Donation::whereBetween('created_at', [$start, $end])
            ->whereIn('status', [DonationStatus::Verified->value, DonationStatus::Completed->value])
            ->select('created_at', 'amount')
            ->get();

        $timeline = [];
        foreach ($points as $slot) {
            $slotStart = $slot['start'];
            $slotEnd = $slot['end'];

            $slotUsers = $users->filter(fn ($u) => $u->created_at >= $slotStart && $u->created_at <= $slotEnd)->count();
            $slotRescues = $rescues->filter(fn ($r) => $r->created_at >= $slotStart && $r->created_at <= $slotEnd)->count();
            $slotAdoptions = $adoptions->filter(fn ($a) => $a->created_at >= $slotStart && $a->created_at <= $slotEnd)->count();
            $slotDonations = $donations->filter(fn ($d) => $d->created_at >= $slotStart && $d->created_at <= $slotEnd);

            $timeline[] = [
                'label' => $slot['label'],
                'users' => $slotUsers,
                'rescues' => $slotRescues,
                'adoptions' => $slotAdoptions,
                'donations_amount' => (float) $slotDonations->sum('amount'),
                'donations_count' => $slotDonations->count(),
            ];
        }

        return $timeline;
    }

    /**
     * Build dual-line login timeline (success, failed, suspicious).
     *
     * @return array<int, array{label: string, success: int, failed: int, suspicious: int}>
     */
    protected function buildLoginTimeline(CarbonInterface $start, CarbonInterface $end, string $interval): array
    {
        $points = $this->generateIntervalSlots($start, $end, $interval);
        $attempts = LoginAttempt::whereBetween('created_at', [$start, $end])
            ->select('created_at', 'status', 'is_suspicious')
            ->get();

        $series = [];
        foreach ($points as $slot) {
            $slotStart = $slot['start'];
            $slotEnd = $slot['end'];

            $slotAttempts = $attempts->filter(fn ($a) => $a->created_at >= $slotStart && $a->created_at <= $slotEnd);

            $series[] = [
                'label' => $slot['label'],
                'success' => $slotAttempts->where('status', 'success')->count(),
                'failed' => $slotAttempts->where('status', 'failed')->count(),
                'suspicious' => $slotAttempts->where('is_suspicious', true)->count(),
            ];
        }

        return $series;
    }

    /**
     * Build AI predictions timeline (accurate vs inaccurate vs total).
     *
     * @return array<int, array{label: string, total: int, accurate: int, inaccurate: int}>
     */
    protected function buildAiTimeline(CarbonInterface $start, CarbonInterface $end, string $interval): array
    {
        $points = $this->generateIntervalSlots($start, $end, $interval);
        $aiLogs = AiPredictionLog::whereBetween('created_at', [$start, $end])
            ->select('created_at', 'is_accurate')
            ->get();

        $series = [];
        foreach ($points as $slot) {
            $slotStart = $slot['start'];
            $slotEnd = $slot['end'];

            $slotLogs = $aiLogs->filter(fn ($l) => $l->created_at >= $slotStart && $l->created_at <= $slotEnd);

            $series[] = [
                'label' => $slot['label'],
                'total' => $slotLogs->count(),
                'accurate' => $slotLogs->where('is_accurate', true)->count(),
                'inaccurate' => $slotLogs->where('is_accurate', false)->count(),
            ];
        }

        return $series;
    }

    /**
     * Generate discrete time-window slots for any date range and interval.
     *
     * @return array<int, array{label: string, start: Carbon, end: Carbon}>
     */
    protected function generateIntervalSlots(CarbonInterface $start, CarbonInterface $end, string $interval): array
    {
        $slots = [];

        if ($interval === 'day') {
            $current = $start->copy()->startOfDay();
            while ($current <= $end) {
                $slotEnd = $current->copy()->endOfDay();
                $slots[] = [
                    'label' => $current->format('M d'),
                    'start' => $current->copy(),
                    'end' => $slotEnd->min($end),
                ];
                $current->addDay();
            }
        } elseif ($interval === 'week') {
            $current = $start->copy()->startOfWeek();
            while ($current <= $end) {
                $slotEnd = $current->copy()->endOfWeek();
                $slots[] = [
                    'label' => 'Wk '.$current->format('W'),
                    'start' => $current->max($start),
                    'end' => $slotEnd->min($end),
                ];
                $current->addWeek();
            }
        } else {
            $current = $start->copy()->startOfMonth();
            while ($current <= $end) {
                $slotEnd = $current->copy()->endOfMonth();
                $slots[] = [
                    'label' => $current->format('M Y'),
                    'start' => $current->max($start),
                    'end' => $slotEnd->min($end),
                ];
                $current->addMonth();
            }
        }

        return $slots;
    }

    /**
     * Normalize AI confidence score average onto a 0-100 percentage scale.
     */
    protected function normalizeConfidenceAverage(float|int|null $rawAverage): float
    {
        $avg = (float) ($rawAverage ?? 0);
        if ($avg <= 1.0 && $avg > 0) {
            return round($avg * 100, 1);
        }

        return round($avg, 1);
    }

    /**
     * Build cross-module platform pulse metrics, health pillars, and peak window diagnostics.
     *
     * @param  array<string, mixed>  $stats
     * @param  array<int, array<string, mixed>>  $timeline
     * @return array<string, mixed>
     */
    protected function buildPulseInsights(
        CarbonInterface $start,
        CarbonInterface $end,
        array $stats,
        array $timeline,
    ): array {
        $peakSlot = collect($timeline)->sortByDesc(function (array $slot): int {
            return (int) $slot['users'] + (int) $slot['rescues'] + (int) $slot['adoptions'] + (int) $slot['donations_count'];
        })->first();

        $peakVolume = $peakSlot
            ? (int) $peakSlot['users'] + (int) $peakSlot['rescues'] + (int) $peakSlot['adoptions'] + (int) $peakSlot['donations_count']
            : 0;

        $healthPillars = [
            [
                'label' => 'Auth & Login Integrity',
                'score' => (float) $stats['login_success_rate'],
                'detail' => $stats['suspicious_logins'].' flagged alerts',
                'status' => $stats['login_success_rate'] >= 90 ? 'Healthy' : 'Monitor',
            ],
            [
                'label' => 'AI Validation Accuracy',
                'score' => (float) $stats['ai_accuracy_rate'],
                'detail' => $stats['ai_predictions'].' predictions • '.$stats['ai_avg_confidence'].'% conf',
                'status' => $stats['ai_accuracy_rate'] >= 80 ? 'Healthy' : 'Monitor',
            ],
            [
                'label' => 'Rescue Resolution SLA',
                'score' => (float) $stats['rescue_resolution_rate'],
                'detail' => $stats['rescue_reports'].' total reports in window',
                'status' => $stats['rescue_resolution_rate'] >= 60 ? 'Healthy' : 'Attention',
            ],
            [
                'label' => 'Adoption Approval Flow',
                'score' => (float) $stats['adoption_approval_rate'],
                'detail' => $stats['adoptions'].' applications reviewed',
                'status' => $stats['adoption_approval_rate'] >= 50 ? 'Healthy' : 'Monitor',
            ],
        ];

        return [
            'peak_label' => $peakSlot['label'] ?? 'N/A',
            'peak_volume' => $peakVolume,
            'total_platform_users' => User::count(),
            'active_volunteer_pool' => (int) $stats['active_volunteers'],
            'health_pillars' => $healthPillars,
            'engagement' => [
                'shelter_visits' => ShelterVisit::whereBetween('created_at', [$start, $end])->count(),
                'rehoming_requests' => RehomingRequest::whereBetween('created_at', [$start, $end])->count(),
                'certificates_issued' => Certificate::whereBetween('created_at', [$start, $end])->count(),
                'badges_awarded' => UserBadge::whereBetween('created_at', [$start, $end])->count(),
                'blog_posts_published' => BlogPost::whereBetween('created_at', [$start, $end])
                    ->where('status', 'published')
                    ->count(),
                'blog_reactions' => BlogPostReaction::whereBetween('created_at', [$start, $end])->count(),
            ],
        ];
    }

    /**
     * Build deep operational telemetry covering clinical care, visits, field tasks, and urgent dispatches.
     *
     * @return array<string, mixed>
     */
    protected function buildOperationsDeepDive(CarbonInterface $start, CarbonInterface $end): array
    {
        $resolvedReports = PetReport::whereBetween('created_at', [$start, $end])
            ->where('status', 'resolved')
            ->get(['created_at', 'updated_at']);

        $avgResolutionHours = $resolvedReports->count() > 0
            ? round($resolvedReports->avg(fn ($r) => max(0, $r->created_at->diffInMinutes($r->updated_at) / 60)), 1)
            : 0.0;

        $assignedTotal = AssignedTask::whereBetween('created_at', [$start, $end])->count();
        $assignedCompleted = AssignedTask::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->count();

        $medicalRecordsPeriod = AnimalMedicalRecord::whereBetween('created_at', [$start, $end])->count();
        $shelterVisitsPeriod = ShelterVisit::whereBetween('created_at', [$start, $end])->count();
        $shelterVisitsCompleted = ShelterVisit::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->count();

        $medicalTypeBreakdown = AnimalMedicalRecord::whereBetween('created_at', [$start, $end])
            ->select('record_type', DB::raw('COUNT(*) as count'))
            ->groupBy('record_type')
            ->get()
            ->map(fn ($m) => ['name' => ucfirst(str_replace('_', ' ', (string) $m->record_type)), 'value' => (int) $m->count])
            ->values()
            ->all();

        $taskStatusBreakdown = AssignedTask::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($t) => ['name' => ucfirst(str_replace('_', ' ', (string) $t->status)), 'value' => (int) $t->count])
            ->values()
            ->all();

        $visitStatusBreakdown = ShelterVisit::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($v) => ['name' => ucfirst(str_replace('_', ' ', (string) $v->status)), 'value' => (int) $v->count])
            ->values()
            ->all();

        $recentUrgentRescues = PetReport::whereBetween('created_at', [$start, $end])
            ->where('status', '!=', 'resolved')
            ->orderByRaw("CASE WHEN urgency = 'critical' THEN 0 WHEN urgency = 'high' THEN 1 WHEN type = 'sos' THEN 2 ELSE 3 END")
            ->latest()
            ->limit(6)
            ->get(['id', 'type', 'animal_type', 'location', 'urgency', 'status', 'created_at'])
            ->map(fn ($r) => [
                'id' => $r->id,
                'type' => strtoupper((string) $r->type),
                'animal_type' => ucfirst((string) ($r->animal_type ?: 'Animal')),
                'location' => (string) ($r->location ?: 'Unspecified'),
                'urgency' => ucfirst((string) ($r->urgency ?: 'normal')),
                'status' => ucfirst(str_replace('_', ' ', (string) $r->status)),
                'time' => $r->created_at->diffForHumans(),
            ])
            ->values()
            ->all();

        return [
            'kpis' => [
                'critical_pending_sos' => PetReport::where('status', '!=', 'resolved')
                    ->where(function ($q): void {
                        $q->where('type', 'sos')->orWhereIn('urgency', ['critical', 'high']);
                    })
                    ->count(),
                'avg_resolution_hours' => $avgResolutionHours,
                'medical_records_count' => $medicalRecordsPeriod,
                'shelter_visits_count' => $shelterVisitsPeriod,
                'shelter_visits_completed' => $shelterVisitsCompleted,
                'rehoming_requests_count' => RehomingRequest::whereBetween('created_at', [$start, $end])->count(),
                'follow_ups_count' => PostAdoptionFollowUp::whereBetween('created_at', [$start, $end])->count(),
                'assigned_tasks_total' => $assignedTotal,
                'assigned_tasks_completed' => $assignedCompleted,
                'task_completion_rate' => $assignedTotal > 0 ? round(($assignedCompleted / $assignedTotal) * 100, 1) : 0.0,
                'injury_reports_count' => VolunteerInjuryReport::whereBetween('created_at', [$start, $end])->count(),
                'strays_fed_period' => (int) FeedingDistributionLog::whereBetween('created_at', [$start, $end])->sum('strays_fed'),
                'food_packs_distributed' => (int) FeedingDistributionLog::whereBetween('created_at', [$start, $end])->sum('food_packs_distributed'),
                'food_pickups_completed' => PartnerFoodPickup::whereBetween('created_at', [$start, $end])->where('status', 'completed')->count(),
            ],
            'medical_type_breakdown' => $medicalTypeBreakdown,
            'task_status_breakdown' => $taskStatusBreakdown,
            'visit_status_breakdown' => $visitStatusBreakdown,
            'recent_urgent_rescues' => $recentUrgentRescues,
        ];
    }

    /**
     * Build deep financial analytics covering sponsorships, in-kind contributions, channel performance, and audits.
     *
     * @param  array<int, string>  $validDonationStatuses
     * @param  array<int, array<string, mixed>>  $paymentMethods
     * @return array<string, mixed>
     */
    protected function buildFinancialDeepDive(
        CarbonInterface $start,
        CarbonInterface $end,
        array $validDonationStatuses,
        array $paymentMethods,
    ): array {
        $verifiedDonations = Donation::whereBetween('created_at', [$start, $end])
            ->whereIn('status', $validDonationStatuses);

        $uniqueDonors = (clone $verifiedDonations)
            ->whereNotNull('donor_email')
            ->distinct('donor_email')
            ->count('donor_email');

        $largestDonation = (float) ((clone $verifiedDonations)->max('amount') ?? 0);

        $pendingDonationsQuery = Donation::whereBetween('created_at', [$start, $end])
            ->whereIn('status', [
                DonationStatus::PendingPayment->value,
                DonationStatus::PaymentProofSubmitted->value,
                DonationStatus::PendingVerification->value,
                DonationStatus::PaymentProofResubmitted->value,
            ]);

        $totalPaymentAmount = collect($paymentMethods)->sum('amount');
        $channelPerformance = collect($paymentMethods)->map(function (array $row) use ($totalPaymentAmount): array {
            $count = (int) $row['value'];
            $amount = (float) ($row['amount'] ?? 0);

            return [
                'method' => $row['name'],
                'count' => $count,
                'total_amount' => round($amount, 2),
                'avg_amount' => $count > 0 ? round($amount / $count, 2) : 0.0,
                'share_pct' => $totalPaymentAmount > 0 ? round(($amount / $totalPaymentAmount) * 100, 1) : 0.0,
            ];
        })->sortByDesc('total_amount')->values()->all();

        $inKindStatusBreakdown = InKindDonation::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => ['name' => ucfirst(str_replace('_', ' ', (string) $row->status)), 'value' => (int) $row->count])
            ->values()
            ->all();

        $recentDonations = Donation::whereBetween('created_at', [$start, $end])
            ->latest()
            ->limit(6)
            ->get(['id', 'public_reference', 'donor_name', 'anonymous', 'type', 'amount', 'status', 'created_at'])
            ->map(fn ($d) => [
                'id' => $d->id,
                'reference' => $d->public_reference ?? ('DON-'.$d->id),
                'donor_name' => $d->anonymous ? 'Anonymous Supporter' : ($d->donor_name ?: 'Community Donor'),
                'type' => ucfirst(str_replace(['-', '_'], ' ', (string) $d->type)),
                'amount' => (float) ($d->amount ?? 0),
                'status' => ucfirst(str_replace('_', ' ', (string) ($d->status instanceof \BackedEnum ? $d->status->value : $d->status))),
                'time' => $d->created_at->diffForHumans(),
            ])
            ->values()
            ->all();

        return [
            'kpis' => [
                'unique_donors' => $uniqueDonors,
                'largest_donation' => round($largestDonation, 2),
                'pending_verification_count' => (clone $pendingDonationsQuery)->count(),
                'pending_verification_amount' => round((float) (clone $pendingDonationsQuery)->sum('amount'), 2),
                'sponsorships_count' => FeedingSponsorship::whereBetween('created_at', [$start, $end])->count(),
                'sponsorships_amount' => round((float) FeedingSponsorship::whereBetween('created_at', [$start, $end])->sum('amount'), 2),
                'in_kind_count' => InKindDonation::whereBetween('created_at', [$start, $end])->count(),
                'in_kind_units' => (int) InKindDonation::whereBetween('created_at', [$start, $end])->sum('quantity'),
                'pending_amount_edits' => DonationAmountEditRequest::where('status', 'pending')->count(),
                'active_animal_needs' => AnimalDonationNeed::where('status', '!=', 'fulfilled')->count(),
            ],
            'channel_performance' => $channelPerformance,
            'in_kind_status_breakdown' => $inKindStatusBreakdown,
            'recent_donations' => $recentDonations,
        ];
    }

    /**
     * Build security & audit velocity, recent audit logs, backup run history, and idempotency guards.
     *
     * @return array<string, mixed>
     */
    protected function buildSecurityAuditExtras(CarbonInterface $start, CarbonInterface $end, string $interval): array
    {
        $points = $this->generateIntervalSlots($start, $end, $interval);
        $auditLogsWindow = AuditLog::whereBetween('created_at', [$start, $end])->get(['created_at']);

        $auditSeries = [];
        foreach ($points as $slot) {
            $slotStart = $slot['start'];
            $slotEnd = $slot['end'];

            $auditSeries[] = [
                'label' => $slot['label'],
                'events' => $auditLogsWindow->filter(fn ($a) => $a->created_at >= $slotStart && $a->created_at <= $slotEnd)->count(),
            ];
        }

        $recentAuditLogs = AuditLog::with('user')
            ->whereBetween('created_at', [$start, $end])
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'actor' => $log->user ? $log->user->name : 'System Automated',
                'role' => $log->user ? ucfirst(str_replace('_', ' ', (string) $log->user->role)) : 'System',
                'action' => ucfirst(str_replace('_', ' ', (string) $log->action)),
                'description' => Str::limit((string) $log->description, 90),
                'ip_address' => $log->ip_address ?? '—',
                'time' => $log->created_at->diffForHumans(),
            ])
            ->values()
            ->all();

        $backupHistory = Backup::latest()
            ->limit(6)
            ->get(['id', 'filename', 'disk', 'size', 'status', 'created_at'])
            ->map(fn ($b) => [
                'id' => $b->id,
                'filename' => $b->filename,
                'disk' => strtoupper((string) ($b->disk ?? 'local')),
                'size_mb' => round(((int) ($b->size ?? 0)) / (1024 * 1024), 2),
                'status' => ucfirst((string) $b->status),
                'created_at' => $b->created_at?->diffForHumans() ?? '—',
            ])
            ->values()
            ->all();

        return [
            'audit_series' => $auditSeries,
            'recent_audit_logs' => $recentAuditLogs,
            'backup_history' => $backupHistory,
            'idempotency_guards_count' => IdempotencyRecord::count(),
        ];
    }

    /**
     * Build AI confidence distribution buckets and recent prediction audit records.
     *
     * @param  Collection<int, AiPredictionLog>  $aiLogsPeriod
     * @return array<string, mixed>
     */
    protected function buildAiTelemetryExtras($aiLogsPeriod): array
    {
        $buckets = [
            '90–100%' => 0,
            '75–89%' => 0,
            '60–74%' => 0,
            'Under 60%' => 0,
        ];

        $highConfidenceCount = 0;
        $evaluatedCount = 0;
        $inaccurateCount = 0;

        foreach ($aiLogsPeriod as $log) {
            $conf = (float) ($log->confidence ?? 0);
            if ($conf <= 1.0 && $conf > 0) {
                $conf *= 100;
            }

            if ($conf >= 90) {
                $buckets['90–100%']++;
            } elseif ($conf >= 75) {
                $buckets['75–89%']++;
            } elseif ($conf >= 60) {
                $buckets['60–74%']++;
            } else {
                $buckets['Under 60%']++;
            }

            if ($conf >= 80) {
                $highConfidenceCount++;
            }

            if ($log->is_accurate !== null) {
                $evaluatedCount++;
                if ($log->is_accurate === false) {
                    $inaccurateCount++;
                }
            }
        }

        $total = $aiLogsPeriod->count();

        $confidenceBuckets = collect($buckets)->map(fn (int $val, string $name) => [
            'name' => $name,
            'value' => $val,
        ])->values()->all();

        $recentPredictions = $aiLogsPeriod->take(6)->map(function ($log): array {
            $conf = (float) ($log->confidence ?? 0);
            if ($conf <= 1.0 && $conf > 0) {
                $conf = round($conf * 100, 1);
            } else {
                $conf = round($conf, 1);
            }

            $statusLabel = 'Pending Review';
            if ($log->is_accurate === true) {
                $statusLabel = 'Accurate';
            } elseif ($log->is_accurate === false) {
                $statusLabel = 'Inaccurate';
            }

            return [
                'id' => $log->id,
                'feature' => ucfirst(str_replace('_', ' ', (string) $log->feature)),
                'confidence' => $conf,
                'status_label' => $statusLabel,
                'time' => $log->created_at?->diffForHumans() ?? '—',
            ];
        })->values()->all();

        return [
            'high_confidence_rate' => $total > 0 ? round(($highConfidenceCount / $total) * 100, 1) : 0.0,
            'evaluated_count' => $evaluatedCount,
            'inaccurate_count' => $inaccurateCount,
            'pending_review_count' => max(0, $total - $evaluatedCount),
            'confidence_buckets' => $confidenceBuckets,
            'recent_predictions' => $recentPredictions,
        ];
    }
}

<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AdoptionApplication;
use App\Models\AiPredictionLog;
use App\Models\AuditLog;
use App\Models\Backup;
use App\Models\Donation;
use App\Models\LoginAttempt;
use App\Models\Payment;
use App\Models\PetReport;
use App\Models\User;
use App\Models\VolunteerApplication;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalyticsController extends Controller
{
    /**
     * Return rich aggregated analytics data for the given period with comparisons.
     */
    public function index(Request $request): JsonResponse
    {
        $period = $request->query('period', '30d');
        [$start, $end, $prevStart, $prevEnd, $interval] = $this->resolvePeriods($period);

        // ── 1. Summary Metrics & Period-over-Period Deltas ─────────────────────
        $currentUsers = User::whereBetween('created_at', [$start, $end])->count();
        $prevUsers = User::whereBetween('created_at', [$prevStart, $prevEnd])->count();

        $currentRescues = PetReport::whereBetween('created_at', [$start, $end])->count();
        $prevRescues = PetReport::whereBetween('created_at', [$prevStart, $prevEnd])->count();

        $currentAdoptions = AdoptionApplication::whereBetween('created_at', [$start, $end])->count();
        $prevAdoptions = AdoptionApplication::whereBetween('created_at', [$prevStart, $prevEnd])->count();

        $currentDonationsAmount = (float) Donation::whereBetween('created_at', [$start, $end])
            ->where('status', 'verified')
            ->sum('amount');
        $prevDonationsAmount = (float) Donation::whereBetween('created_at', [$prevStart, $prevEnd])
            ->where('status', 'verified')
            ->sum('amount');

        $currentDonationsCount = Donation::whereBetween('created_at', [$start, $end])->count();
        $currentVerifiedDonationsCount = Donation::whereBetween('created_at', [$start, $end])
            ->where('status', 'verified')
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
            : 95.0; // baseline if un-evaluated

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
        // Role breakdown
        $roleBreakdown = User::select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')->get()
            ->map(fn ($r) => ['name' => ucfirst(str_replace('_', ' ', $r->role)), 'value' => (int) $r->count]);

        // Rescue report types
        $reportTypeBreakdown = PetReport::whereBetween('created_at', [$start, $end])
            ->select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')->get()
            ->map(fn ($r) => ['name' => ucfirst($r->type), 'value' => (int) $r->count]);

        // Animal types
        $animalTypeBreakdown = PetReport::whereBetween('created_at', [$start, $end])
            ->select('animal_type', DB::raw('COUNT(*) as count'))
            ->groupBy('animal_type')->get()
            ->map(fn ($r) => ['name' => ucfirst($r->animal_type ?: 'Unknown'), 'value' => (int) $r->count]);

        // Rescue status distribution
        $rescueStatusBreakdown = PetReport::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')->get()
            ->map(fn ($r) => ['name' => ucfirst($r->status), 'value' => (int) $r->count]);

        // Urgency / situation breakdown
        $urgencyBreakdown = PetReport::whereBetween('created_at', [$start, $end])
            ->whereNotNull('urgency')
            ->select('urgency', DB::raw('COUNT(*) as count'))
            ->groupBy('urgency')->get()
            ->map(fn ($r) => ['name' => ucfirst($r->urgency), 'value' => (int) $r->count]);

        // Donation types (Cash vs In-Kind)
        $donationTypeBreakdown = Donation::whereBetween('created_at', [$start, $end])
            ->select('type', DB::raw('COUNT(*) as count'), DB::raw('SUM(CASE WHEN amount IS NOT NULL THEN amount ELSE 0 END) as total_amount'))
            ->groupBy('type')->get()
            ->map(fn ($d) => [
                'name' => ucfirst(str_replace('-', ' ', $d->type)),
                'value' => (int) $d->count,
                'amount' => (float) $d->total_amount,
            ]);

        // Donation status breakdown
        $donationStatusBreakdown = Donation::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')->get()
            ->map(fn ($d) => ['name' => ucfirst($d->status), 'value' => (int) $d->count]);

        // Payment methods / providers
        $paymentMethods = Payment::whereBetween('created_at', [$start, $end])
            ->select('method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total_amount'))
            ->groupBy('method')->get()
            ->map(fn ($p) => [
                'name' => strtoupper($p->method ?: 'Direct / Cash'),
                'value' => (int) $p->count,
                'amount' => (float) $p->total_amount,
            ]);

        // AI accuracy breakdown
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

        // AI feature distribution
        $aiFeatureBreakdown = AiPredictionLog::whereBetween('created_at', [$start, $end])
            ->select('feature', DB::raw('COUNT(*) as count'))
            ->groupBy('feature')->get()
            ->map(fn ($f) => ['name' => ucfirst(str_replace('_', ' ', $f->feature)), 'value' => (int) $f->count]);

        // Audit action categories
        $auditActionBreakdown = AuditLog::whereBetween('created_at', [$start, $end])
            ->select('action', DB::raw('COUNT(*) as count'))
            ->groupBy('action')->get()
            ->map(fn ($a) => ['name' => ucfirst(str_replace('_', ' ', $a->action)), 'value' => (int) $a->count]);

        // ── 5. Actionable Data Tables ─────────────────────────────────────────
        // Top active admin / audit actors
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
            });

        // Recent security incidents / suspicious logins
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
            });

        return response()->json([
            'period' => $period,
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
        ]);
    }

    /**
     * Export the comprehensive analytics report as a CSV download.
     */
    public function export(Request $request): StreamedResponse
    {
        $period = $request->query('period', '30d');
        [$start, $end, $prevStart, $prevEnd] = $this->resolvePeriods($period);

        $rows = [
            ['=== PAWLSE SUPER-ADMIN ADVANCED ANALYTICS REPORT ==='],
            ['Generated At', now()->toDateTimeString()],
            ['Period Selected', strtoupper($period)],
            ['Date Range', $start->toDateString().' to '.$end->toDateString()],
            [],
            ['=== 1. EXECUTIVE SUMMARY & KPIS ==='],
            ['Metric', 'Current Period', 'Previous Period', 'Growth (%)'],
            ['New Registered Users', User::whereBetween('created_at', [$start, $end])->count(), User::whereBetween('created_at', [$prevStart, $prevEnd])->count(), $this->calculateDelta(User::whereBetween('created_at', [$start, $end])->count(), User::whereBetween('created_at', [$prevStart, $prevEnd])->count()).'%'],
            ['Rescue / Missing Reports', PetReport::whereBetween('created_at', [$start, $end])->count(), PetReport::whereBetween('created_at', [$prevStart, $prevEnd])->count(), $this->calculateDelta(PetReport::whereBetween('created_at', [$start, $end])->count(), PetReport::whereBetween('created_at', [$prevStart, $prevEnd])->count()).'%'],
            ['Adoption Applications', AdoptionApplication::whereBetween('created_at', [$start, $end])->count(), AdoptionApplication::whereBetween('created_at', [$prevStart, $prevEnd])->count(), $this->calculateDelta(AdoptionApplication::whereBetween('created_at', [$start, $end])->count(), AdoptionApplication::whereBetween('created_at', [$prevStart, $prevEnd])->count()).'%'],
            ['Total Verified Donations (PHP)', Donation::whereBetween('created_at', [$start, $end])->where('status', 'verified')->sum('amount'), Donation::whereBetween('created_at', [$prevStart, $prevEnd])->where('status', 'verified')->sum('amount'), $this->calculateDelta((float) Donation::whereBetween('created_at', [$start, $end])->where('status', 'verified')->sum('amount'), (float) Donation::whereBetween('created_at', [$prevStart, $prevEnd])->where('status', 'verified')->sum('amount')).'%'],
            ['Suspicious Login Alerts', LoginAttempt::where('is_suspicious', true)->whereBetween('created_at', [$start, $end])->count(), LoginAttempt::where('is_suspicious', true)->whereBetween('created_at', [$prevStart, $prevEnd])->count(), $this->calculateDelta(LoginAttempt::where('is_suspicious', true)->whereBetween('created_at', [$start, $end])->count(), LoginAttempt::where('is_suspicious', true)->whereBetween('created_at', [$prevStart, $prevEnd])->count()).'%'],
            ['AI Predictions Processed', AiPredictionLog::whereBetween('created_at', [$start, $end])->count(), AiPredictionLog::whereBetween('created_at', [$prevStart, $prevEnd])->count(), $this->calculateDelta(AiPredictionLog::whereBetween('created_at', [$start, $end])->count(), AiPredictionLog::whereBetween('created_at', [$prevStart, $prevEnd])->count()).'%'],
            ['Backups Created', Backup::whereBetween('created_at', [$start, $end])->count(), Backup::whereBetween('created_at', [$prevStart, $prevEnd])->count(), '-'],
            [],
            ['=== 2. RESCUE & SHELTER OPERATIONS ==='],
            ['Category', 'Metric / Type', 'Count'],
        ];

        // Rescue statuses
        $rescueStatuses = PetReport::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as count'))->groupBy('status')->get();
        foreach ($rescueStatuses as $rs) {
            $rows[] = ['Rescue Status', ucfirst($rs->status), $rs->count];
        }

        // Animal types
        $animalTypes = PetReport::whereBetween('created_at', [$start, $end])
            ->select('animal_type', DB::raw('COUNT(*) as count'))->groupBy('animal_type')->get();
        foreach ($animalTypes as $at) {
            $rows[] = ['Animal Species', ucfirst($at->animal_type ?: 'Unknown'), $at->count];
        }

        $rows[] = [];
        $rows[] = ['=== 3. FINANCIALS & PAYMENT GATEWAYS ==='];
        $rows[] = ['Payment Method / Type', 'Transactions', 'Total Amount (PHP)'];

        $payments = Payment::whereBetween('created_at', [$start, $end])
            ->select('method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total_amount'))
            ->groupBy('method')->get();
        foreach ($payments as $p) {
            $rows[] = [strtoupper($p->method ?: 'Direct / Cash'), $p->count, number_format((float) $p->total_amount, 2)];
        }

        $rows[] = [];
        $rows[] = ['=== 4. AUDIT TRAIL TOP ACTORS ==='];
        $rows[] = ['User ID', 'Name', 'Email', 'Role', 'Actions Recorded'];

        $topActors = AuditLog::with('user')
            ->whereBetween('created_at', [$start, $end])
            ->select('user_id', DB::raw('COUNT(*) as actions_count'))
            ->groupBy('user_id')
            ->orderByDesc('actions_count')
            ->limit(10)
            ->get();
        foreach ($topActors as $actor) {
            $rows[] = [
                $actor->user_id ?? 'N/A',
                $actor->user ? $actor->user->name : 'System Automated',
                $actor->user ? $actor->user->email : 'system@pawlse.internal',
                $actor->user ? ucfirst($actor->user->role) : 'System',
                $actor->actions_count,
            ];
        }

        $filename = 'pawlse_analytics_'.$period.'_'.now()->format('Y_m_d_His').'.csv';

        return new StreamedResponse(function () use ($rows) {
            $handle = fopen('php://output', 'w');
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Calculate percentage change between current and previous values.
     */
    protected function calculateDelta(float|int $current, float|int $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
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
        // Base score starts at 100
        $score = 100.0;

        // Security penalties
        if ($loginSuccessRate < 90) {
            $score -= (90 - $loginSuccessRate) * 0.8;
        }
        if ($suspiciousLogins > 0) {
            $score -= min($suspiciousLogins * 3, 15);
        }

        // AI performance (weight 15%)
        if ($aiAccuracyRate < 80) {
            $score -= (80 - $aiAccuracyRate) * 0.3;
        }

        // Backup reliability (weight 15%)
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
    protected function buildMasterTimeline(Carbon $start, Carbon $end, string $interval): array
    {
        $points = $this->generateIntervalSlots($start, $end, $interval);

        // Fetch records in range
        $users = User::whereBetween('created_at', [$start, $end])->select('created_at')->get();
        $rescues = PetReport::whereBetween('created_at', [$start, $end])->select('created_at')->get();
        $adoptions = AdoptionApplication::whereBetween('created_at', [$start, $end])->select('created_at')->get();
        $donations = Donation::whereBetween('created_at', [$start, $end])
            ->where('status', 'verified')
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
    protected function buildLoginTimeline(Carbon $start, Carbon $end, string $interval): array
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
    protected function buildAiTimeline(Carbon $start, Carbon $end, string $interval): array
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
    protected function generateIntervalSlots(Carbon $start, Carbon $end, string $interval): array
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
        } else { // month
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
     * Resolve start, end, previous start, previous end, and interval for a period string.
     *
     * @return array{Carbon, Carbon, Carbon, Carbon, string}
     */
    protected function resolvePeriods(string $period): array
    {
        $now = Carbon::now();

        return match ($period) {
            '7d', 'week' => [
                $now->copy()->subDays(6)->startOfDay(),
                $now->copy()->endOfDay(),
                $now->copy()->subDays(13)->startOfDay(),
                $now->copy()->subDays(7)->endOfDay(),
                'day',
            ],
            '90d', 'quarter' => [
                $now->copy()->subDays(89)->startOfDay(),
                $now->copy()->endOfDay(),
                $now->copy()->subDays(179)->startOfDay(),
                $now->copy()->subDays(90)->endOfDay(),
                'week',
            ],
            '1y', 'year' => [
                $now->copy()->subMonths(11)->startOfMonth(),
                $now->copy()->endOfDay(),
                $now->copy()->subMonths(23)->startOfMonth(),
                $now->copy()->subMonths(12)->endOfMonth(),
                'month',
            ],
            'all' => [
                $now->copy()->subYears(3)->startOfYear(),
                $now->copy()->endOfDay(),
                $now->copy()->subYears(6)->startOfYear(),
                $now->copy()->subYears(3)->endOfYear(),
                'month',
            ],
            default => [ // 30d / month
                $now->copy()->subDays(29)->startOfDay(),
                $now->copy()->endOfDay(),
                $now->copy()->subDays(59)->startOfDay(),
                $now->copy()->subDays(30)->endOfDay(),
                'day',
            ],
        };
    }
}

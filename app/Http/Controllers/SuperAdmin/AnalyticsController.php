<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AdoptionApplication;
use App\Models\AiPredictionLog;
use App\Models\Backup;
use App\Models\Donation;
use App\Models\LoginAttempt;
use App\Models\PetReport;
use App\Models\User;
use App\Models\VolunteerApplication;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalyticsController extends Controller
{
    /**
     * Return rich aggregated analytics data for the given period.
     *
     * @return JsonResponse
     */
    public function index(Request $request)
    {
        $period = $request->query('period', 'month');
        [$start, $end, $format, $labelFormat] = $this->resolvePeriod($period);

        // ── Summary stat cards ───────────────────────────────────────────────
        $stats = [
            'users' => User::whereBetween('created_at', [$start, $end])->count(),
            'backups' => Backup::whereBetween('created_at', [$start, $end])->count(),
            'ai_predictions' => AiPredictionLog::whereBetween('created_at', [$start, $end])->count(),
            'suspicious_logins' => LoginAttempt::where('is_suspicious', true)
                ->whereBetween('created_at', [$start, $end])->count(),
            'rescue_reports' => PetReport::whereBetween('created_at', [$start, $end])->count(),
            'adoptions' => AdoptionApplication::whereBetween('created_at', [$start, $end])->count(),
            'volunteers' => VolunteerApplication::whereBetween('created_at', [$start, $end])->count(),
            'donations' => Donation::whereBetween('created_at', [$start, $end])->count(),
        ];

        // ── Time-series: user registrations ──────────────────────────────────
        $userSeries = $this->buildSeries(
            User::whereBetween('created_at', [$start, $end])
                ->selectRaw("DATE_FORMAT(created_at, '$format') as label, COUNT(*) as count")
                ->groupBy('label')->orderBy('label')->get(),
            $start, $end, $format, $labelFormat
        );

        // ── Time-series: login attempts (success vs. failed) ─────────────────
        $loginSuccessRaw = LoginAttempt::whereBetween('created_at', [$start, $end])
            ->where('status', 'success')
            ->selectRaw("DATE_FORMAT(created_at, '$format') as label, COUNT(*) as count")
            ->groupBy('label')->orderBy('label')->get()->keyBy('label');

        $loginFailedRaw = LoginAttempt::whereBetween('created_at', [$start, $end])
            ->where('status', 'failed')
            ->selectRaw("DATE_FORMAT(created_at, '$format') as label, COUNT(*) as count")
            ->groupBy('label')->orderBy('label')->get()->keyBy('label');

        $loginSeries = $this->buildLoginSeries($start, $end, $format, $labelFormat, $loginSuccessRaw, $loginFailedRaw);

        // ── Time-series: rescue reports ───────────────────────────────────────
        $rescueSeries = $this->buildSeries(
            PetReport::whereBetween('created_at', [$start, $end])
                ->selectRaw("DATE_FORMAT(created_at, '$format') as label, COUNT(*) as count")
                ->groupBy('label')->orderBy('label')->get(),
            $start, $end, $format, $labelFormat
        );

        // ── Time-series: adoption applications ───────────────────────────────
        $adoptionSeries = $this->buildSeries(
            AdoptionApplication::whereBetween('created_at', [$start, $end])
                ->selectRaw("DATE_FORMAT(created_at, '$format') as label, COUNT(*) as count")
                ->groupBy('label')->orderBy('label')->get(),
            $start, $end, $format, $labelFormat
        );

        // ── Donut: user role breakdown ────────────────────────────────────────
        $roleBreakdown = User::select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')->get()
            ->map(fn ($r) => ['name' => ucfirst($r->role), 'value' => $r->count]);

        // ── Donut: rescue report types ────────────────────────────────────────
        $reportTypeBreakdown = PetReport::whereBetween('created_at', [$start, $end])
            ->select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')->get()
            ->map(fn ($r) => ['name' => ucfirst($r->type), 'value' => $r->count]);

        // ── AI prediction accuracy ────────────────────────────────────────────
        $aiAccurate = AiPredictionLog::whereBetween('created_at', [$start, $end])->where('is_accurate', true)->count();
        $aiInaccurate = AiPredictionLog::whereBetween('created_at', [$start, $end])->where('is_accurate', false)->count();
        $aiBreakdown = [
            ['name' => 'Accurate',   'value' => $aiAccurate],
            ['name' => 'Inaccurate', 'value' => $aiInaccurate],
        ];

        return response()->json([
            'period' => $period,
            'stats' => $stats,
            'user_series' => $userSeries,
            'login_series' => $loginSeries,
            'rescue_series' => $rescueSeries,
            'adoption_series' => $adoptionSeries,
            'role_breakdown' => $roleBreakdown,
            'report_type_breakdown' => $reportTypeBreakdown,
            'ai_breakdown' => $aiBreakdown,
        ]);
    }

    /**
     * Export the analytics data as a CSV download.
     */
    public function export(Request $request): StreamedResponse
    {
        $period = $request->query('period', 'month');
        [$start, $end] = $this->resolvePeriod($period);

        $rows = [
            ['=== Summary Metrics ==='],
            ['Metric', 'Count'],
            ['New Users',             User::whereBetween('created_at', [$start, $end])->count()],
            ['Backups Created',       Backup::whereBetween('created_at', [$start, $end])->count()],
            ['AI Predictions',        AiPredictionLog::whereBetween('created_at', [$start, $end])->count()],
            ['Suspicious Logins',     LoginAttempt::where('is_suspicious', true)->whereBetween('created_at', [$start, $end])->count()],
            ['Rescue Reports',        PetReport::whereBetween('created_at', [$start, $end])->count()],
            ['Adoption Applications', AdoptionApplication::whereBetween('created_at', [$start, $end])->count()],
            ['Volunteer Applications', VolunteerApplication::whereBetween('created_at', [$start, $end])->count()],
            ['Donations',             Donation::whereBetween('created_at', [$start, $end])->count()],
            [],
            ['=== User Role Breakdown ==='],
            ['Role', 'Count'],
        ];

        $roles = User::select('role', DB::raw('COUNT(*) as count'))->groupBy('role')->get();
        foreach ($roles as $r) {
            $rows[] = [ucfirst($r->role), $r->count];
        }

        $rows[] = [];
        $rows[] = ['=== Rescue Report Types ==='];
        $rows[] = ['Type', 'Count'];
        $types = PetReport::whereBetween('created_at', [$start, $end])
            ->select('type', DB::raw('COUNT(*) as count'))->groupBy('type')->get();
        foreach ($types as $t) {
            $rows[] = [ucfirst($t->type), $t->count];
        }

        $filename = 'analytics_'.$period.'_'.now()->format('Y_m_d_H_i_s').'.csv';

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
     * Build a zero-filled time-series array for the given period.
     *
     * @return array<int, array{label: string, count: int}>
     */
    protected function buildSeries(
        Collection $raw,
        Carbon $start,
        Carbon $end,
        string $format,
        string $labelFormat
    ): array {
        $keyed = $raw->keyBy('label');
        $series = [];
        foreach (CarbonPeriod::create($start, $this->periodStep($format), $end) as $date) {
            $key = $date->format($this->carbonFormat($format));
            $series[] = [
                'label' => $date->format($labelFormat),
                'count' => isset($keyed[$key]) ? (int) $keyed[$key]->count : 0,
            ];
        }

        return $series;
    }

    /**
     * Build a dual-series (success + failed) login array.
     *
     * @return array<int, array{label: string, success: int, failed: int}>
     */
    protected function buildLoginSeries(
        Carbon $start,
        Carbon $end,
        string $format,
        string $labelFormat,
        Collection $successRaw,
        Collection $failedRaw
    ): array {
        $series = [];
        foreach (CarbonPeriod::create($start, $this->periodStep($format), $end) as $date) {
            $key = $date->format($this->carbonFormat($format));
            $series[] = [
                'label' => $date->format($labelFormat),
                'success' => isset($successRaw[$key]) ? (int) $successRaw[$key]->count : 0,
                'failed' => isset($failedRaw[$key]) ? (int) $failedRaw[$key]->count : 0,
            ];
        }

        return $series;
    }

    /**
     * Resolve period start/end and format strings.
     *
     * @return array{Carbon, Carbon, string, string}
     */
    protected function resolvePeriod(string $period): array
    {
        $now = Carbon::now();

        return match ($period) {
            'week' => [
                $now->copy()->startOfWeek(),
                $now->copy()->endOfWeek(),
                '%Y-%m-%d',  // MySQL DATE_FORMAT
                'D',         // Carbon label format
            ],
            'year' => [
                $now->copy()->startOfYear(),
                $now->copy()->endOfYear(),
                '%Y-%m',
                'M Y',
            ],
            default => [  // month
                $now->copy()->startOfMonth(),
                $now->copy()->endOfMonth(),
                '%Y-%m-%d',
                'M d',
            ],
        };
    }

    /** Convert MySQL DATE_FORMAT string to PHP date() format for Carbon::format(). */
    protected function carbonFormat(string $mysqlFormat): string
    {
        return str_replace(['%Y', '%m', '%d'], ['Y', 'm', 'd'], $mysqlFormat);
    }

    /** CarbonPeriod step for a given format. */
    protected function periodStep(string $format): string
    {
        return $format === '%Y-%m' ? '1 month' : '1 day';
    }
}

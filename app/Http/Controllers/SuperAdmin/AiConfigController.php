<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AiPredictionLog;
use App\Models\AuditLog;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiConfigController extends Controller
{
    /**
     * Display AI Configuration screen.
     */
    public function index(Request $request): Response
    {
        $settings = SystemSetting::getValue('ai_settings', [
            'ai_enabled' => true,
            'ai_reporting_enabled' => true,
            'ai_identifying_enabled' => true,
            'ai_confidence_threshold' => 0.70,
            'ai_auto_validation' => false,
        ]);

        // Paginate logs
        $logs = AiPredictionLog::latest()
            ->paginate(10)
            ->through(function ($log) {
                return [
                    'id' => $log->id,
                    'feature' => $log->feature,
                    'input_data' => $log->input_data,
                    'output_data' => $log->output_data,
                    'confidence' => $log->confidence,
                    'is_accurate' => $log->is_accurate,
                    'created_at' => $log->created_at->toDateTimeString(),
                ];
            });

        // Compute AI statistics
        $totalRequests = AiPredictionLog::count();

        $avgConfidence = AiPredictionLog::whereNotNull('confidence')
            ->average('confidence') ?? 0;

        $accurateCount = AiPredictionLog::where('is_accurate', true)->count();
        $checkedCount = AiPredictionLog::whereNotNull('is_accurate')->count();
        $accuracyRate = $checkedCount > 0 ? ($accurateCount / $checkedCount) * 100 : 100;

        return Inertia::render('super-admin/ai-configuration', [
            'settings' => $settings,
            'logs' => $logs,
            'stats' => [
                'total_requests' => $totalRequests,
                'average_confidence' => round($avgConfidence, 4),
                'accuracy_rate' => round($accuracyRate, 2),
            ],
        ]);
    }

    /**
     * Update AI configuration parameters.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $request->validate([
            'ai_enabled' => ['required', 'boolean'],
            'ai_reporting_enabled' => ['required', 'boolean'],
            'ai_identifying_enabled' => ['required', 'boolean'],
            'ai_confidence_threshold' => ['required', 'numeric', 'min:0', 'max:1'],
            'ai_auto_validation' => ['required', 'boolean'],
        ]);

        SystemSetting::setValue('ai_settings', $request->only([
            'ai_enabled',
            'ai_reporting_enabled',
            'ai_identifying_enabled',
            'ai_confidence_threshold',
            'ai_auto_validation',
        ]));

        AuditLog::log('ai_settings_update', 'Updated AI Service Configurations');

        return redirect()->back()->with('success', 'AI Configuration updated successfully.');
    }

    /**
     * Calibrate prediction accuracy.
     */
    public function toggleAccuracy(Request $request, AiPredictionLog $log): RedirectResponse
    {
        $request->validate([
            'is_accurate' => ['nullable', 'boolean'],
        ]);

        $log->update([
            'is_accurate' => $request->is_accurate,
        ]);

        $accuracyStr = $request->is_accurate === null ? 'cleared' : ($request->is_accurate ? 'accurate' : 'inaccurate');
        AuditLog::log('ai_log_calibrate', "Calibrated AI prediction #{$log->id} as {$accuracyStr}");

        return redirect()->back()->with('success', 'Prediction calibrated successfully.');
    }
}

<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AiPredictionLog;
use App\Models\AuditLog;
use App\Models\PetReport;
use App\Models\SystemSetting;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class AiConfigController extends Controller
{
    /**
     * Display AI Configuration screen.
     */
    public function index(Request $request, AiService $aiService): Response
    {
        $settings = SystemSetting::getValue('ai_settings', [
            'ai_enabled' => true,
            'ai_reporting_enabled' => true,
            'ai_identifying_enabled' => true,
            'ai_confidence_threshold' => 0.70,
            'ai_auto_validation' => false,
        ]);

        $serviceHealth = $aiService->checkHealth(true);

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
            'service_health' => $serviceHealth,
            'logs' => $logs,
            'stats' => [
                'total_requests' => $totalRequests,
                'average_confidence' => round($avgConfidence, 4),
                'accuracy_rate' => round($accuracyRate, 2),
            ],
        ]);
    }

    /**
     * Quick toggle to enable or disable AI features globally.
     */
    public function toggleAiFeatures(Request $request): RedirectResponse
    {
        $request->validate([
            'enabled' => ['nullable', 'boolean'],
        ]);

        $settings = SystemSetting::getValue('ai_settings', [
            'ai_enabled' => true,
            'ai_reporting_enabled' => true,
            'ai_identifying_enabled' => true,
            'ai_confidence_threshold' => 0.70,
            'ai_auto_validation' => false,
        ]);

        $newState = $request->has('enabled')
            ? (bool) $request->boolean('enabled')
            : ! ((bool) ($settings['ai_enabled'] ?? true));

        $settings['ai_enabled'] = $newState;
        SystemSetting::setValue('ai_settings', $settings);

        Cache::forget('ai_service_health');

        $actionWord = $newState ? 'Enabled' : 'Disabled';
        AuditLog::log('ai_features_toggle', "{$actionWord} AI Features globally");

        return redirect()->back()->with(
            'success',
            $newState
                ? 'AI features have been enabled successfully.'
                : 'AI features have been disabled. Public AI report and identification boxes are now deactivated.'
        );
    }

    /**
     * Live health check endpoint for the AI microservice.
     */
    public function healthCheck(AiService $aiService): JsonResponse
    {
        $health = $aiService->checkHealth(true);

        return response()->json($health);
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

        Cache::forget('ai_service_health');

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

        if ($request->is_accurate !== null) {
            PetReport::where('ai_prediction_log_id', $log->id)
                ->where('ai_validation_status', 'pending')
                ->update([
                    'ai_validation_status' => $request->is_accurate ? 'approved' : 'rejected',
                ]);
        }

        $accuracyStr = $request->is_accurate === null ? 'cleared' : ($request->is_accurate ? 'accurate' : 'inaccurate');
        AuditLog::log('ai_log_calibrate', "Calibrated AI prediction #{$log->id} as {$accuracyStr}");

        return redirect()->back()->with('success', 'Prediction calibrated successfully.');
    }
}

<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class AiService
{
    /**
     * Check if the AI microservice is reachable and healthy.
     *
     * @return array{
     *     is_healthy: bool,
     *     status: string,
     *     status_label: string,
     *     url: string,
     *     latency_ms: int|null,
     *     device: string|null,
     *     classes_loaded: int|null,
     *     message: string,
     *     error: string|null,
     *     checked_at: string
     * }
     */
    public function checkHealth(bool $forceFresh = false): array
    {
        if ($forceFresh) {
            Cache::forget('ai_service_health');
        }

        return Cache::remember('ai_service_health', 15, function (): array {
            $url = (string) config('services.ai.url', 'http://127.0.0.1:8000');
            $startTime = microtime(true);

            try {
                $response = Http::timeout(2)
                    ->acceptJson()
                    ->withHeaders([
                        'X-Internal-Token' => (string) config('services.ai.secret'),
                    ])
                    ->get(rtrim($url, '/').'/health');

                $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

                if ($response->successful()) {
                    $data = $response->json();

                    return [
                        'is_healthy' => true,
                        'status' => 'healthy',
                        'status_label' => 'Online & Healthy',
                        'url' => $url,
                        'latency_ms' => $latencyMs,
                        'device' => $data['device'] ?? null,
                        'classes_loaded' => $data['classes_loaded'] ?? null,
                        'message' => 'AI microservice is reachable and operating normally.',
                        'error' => null,
                        'checked_at' => now()->toIso8601String(),
                    ];
                }

                return [
                    'is_healthy' => false,
                    'status' => 'unhealthy',
                    'status_label' => 'Service Error',
                    'url' => $url,
                    'latency_ms' => $latencyMs,
                    'device' => null,
                    'classes_loaded' => null,
                    'message' => 'AI service responded with HTTP status '.$response->status().'.',
                    'error' => 'HTTP '.$response->status(),
                    'checked_at' => now()->toIso8601String(),
                ];
            } catch (ConnectionException $e) {
                return [
                    'is_healthy' => false,
                    'status' => 'unreachable',
                    'status_label' => 'Unreachable / Offline',
                    'url' => $url,
                    'latency_ms' => null,
                    'device' => null,
                    'classes_loaded' => null,
                    'message' => 'Unable to connect to AI microservice at '.$url.'. The service is unreachable or not running.',
                    'error' => 'Connection refused or timed out',
                    'checked_at' => now()->toIso8601String(),
                ];
            } catch (Throwable $e) {
                return [
                    'is_healthy' => false,
                    'status' => 'unreachable',
                    'status_label' => 'Unavailable',
                    'url' => $url,
                    'latency_ms' => null,
                    'device' => null,
                    'classes_loaded' => null,
                    'message' => 'AI service is currently unavailable: '.$e->getMessage(),
                    'error' => $e->getMessage(),
                    'checked_at' => now()->toIso8601String(),
                ];
            }
        });
    }

    /**
     * Get computed status for AI features, including admin toggles and service health.
     *
     * @return array{
     *     enabled: bool,
     *     available: bool,
     *     reporting_enabled: bool,
     *     identifying_enabled: bool,
     *     reporting_active: bool,
     *     identifying_active: bool,
     *     reporting_disabled_reason: 'admin_disabled'|'service_unavailable'|null,
     *     identifying_disabled_reason: 'admin_disabled'|'service_unavailable'|null,
     *     reporting_message: string|null,
     *     identifying_message: string|null,
     *     health: array<string, mixed>
     * }
     */
    public function getAiFeatureStatus(bool $forceFresh = false): array
    {
        $settings = SystemSetting::getValue('ai_settings', [
            'ai_enabled' => true,
            'ai_reporting_enabled' => true,
            'ai_identifying_enabled' => true,
            'ai_confidence_threshold' => 0.70,
            'ai_auto_validation' => false,
        ]);

        $aiEnabled = (bool) ($settings['ai_enabled'] ?? true);
        $reportingEnabled = (bool) ($settings['ai_reporting_enabled'] ?? true);
        $identifyingEnabled = (bool) ($settings['ai_identifying_enabled'] ?? true);

        $health = $this->checkHealth($forceFresh);
        $isHealthy = (bool) ($health['is_healthy'] ?? false);

        $reportingActive = $aiEnabled && $reportingEnabled && $isHealthy;
        $identifyingActive = $aiEnabled && $identifyingEnabled && $isHealthy;

        // Determine reason and message for reporting box
        $reportingDisabledReason = null;
        $reportingMessage = null;

        if (! $isHealthy) {
            $reportingDisabledReason = 'service_unavailable';
            $reportingMessage = 'AI service is currently unavailable or unreachable. Please use Manual Entry to submit a rescue report.';
        } elseif (! $aiEnabled || ! $reportingEnabled) {
            $reportingDisabledReason = 'admin_disabled';
            $reportingMessage = 'AI reporting is currently disabled by the administrator. Please use Manual Entry to submit a rescue report.';
        }

        // Determine reason and message for identifying box
        $identifyingDisabledReason = null;
        $identifyingMessage = null;

        if (! $isHealthy) {
            $identifyingDisabledReason = 'service_unavailable';
            $identifyingMessage = 'AI service is currently unavailable or unreachable. AI animal identification is temporarily disabled.';
        } elseif (! $aiEnabled || ! $identifyingEnabled) {
            $identifyingDisabledReason = 'admin_disabled';
            $identifyingMessage = 'AI identification is currently disabled by the administrator.';
        }

        return [
            'enabled' => $aiEnabled,
            'available' => $isHealthy,
            'reporting_enabled' => $reportingEnabled,
            'identifying_enabled' => $identifyingEnabled,
            'reporting_active' => $reportingActive,
            'identifying_active' => $identifyingActive,
            'reporting_disabled_reason' => $reportingDisabledReason,
            'identifying_disabled_reason' => $identifyingDisabledReason,
            'reporting_message' => $reportingMessage,
            'identifying_message' => $identifyingMessage,
            'health' => $health,
        ];
    }
}

<?php

namespace App\Services\N8n;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class N8nService
{
    /**
     * Dispatch an automation webhook event to n8n.
     *
     * @param  string  $event  The event identifier (e.g., 'volunteer.application.submitted')
     * @param  array<string, mixed>  $data  The event payload data
     * @param  string|null  $customPath  Optional override path for the webhook
     */
    public function dispatch(string $event, array $data, ?string $customPath = null): bool
    {
        if (! config('n8n.enabled', false)) {
            Log::debug('n8n automation is disabled. Webhook skipped.', [
                'event' => $event,
            ]);

            return true;
        }

        $baseUrl = config('n8n.base_url', 'http://localhost:5678');
        $endpointPath = $customPath ?? config("n8n.webhooks.{$event}");

        if (empty($endpointPath)) {
            Log::warning("No n8n webhook endpoint configured for event: {$event}");

            return false;
        }

        $url = rtrim($baseUrl, '/').'/'.ltrim($endpointPath, '/');
        $eventId = (string) Str::uuid();
        $timestamp = now()->toIso8601String();
        $unixTimestamp = now()->timestamp;

        $payload = [
            'event_id' => $eventId,
            'event' => $event,
            'timestamp' => $timestamp,
            'source' => 'pawlse',
            'data' => $data,
        ];

        $jsonPayload = json_encode($payload, JSON_UNESCAPED_SLASHES);
        $secret = (string) config('n8n.webhook_secret', '');
        $signature = $this->generateSignature($unixTimestamp, $jsonPayload, $secret);

        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'X-Pawlse-Event' => $event,
            'X-Pawlse-Event-Id' => $eventId,
            'X-Pawlse-Timestamp' => (string) $unixTimestamp,
        ];

        if (! empty($signature)) {
            $headers['X-Pawlse-Signature'] = "t={$unixTimestamp},v1={$signature}";
        }

        $timeout = (int) config('n8n.timeout', 5);
        $retries = (int) config('n8n.retries', 3);

        try {
            Log::info("n8n webhook dispatching: {$event}", [
                'event_id' => $eventId,
                'endpoint' => $endpointPath,
            ]);

            $response = Http::timeout($timeout)
                ->retry($retries, 200, throw: false)
                ->withHeaders($headers)
                ->withBody($jsonPayload, 'application/json')
                ->post($url);

            if ($response->successful()) {
                Log::info("n8n webhook succeeded: {$event}", [
                    'event_id' => $eventId,
                    'status' => $response->status(),
                ]);

                return true;
            }

            Log::warning("n8n webhook responded with non-2xx status: {$event}", [
                'event_id' => $eventId,
                'status' => $response->status(),
            ]);

            return false;
        } catch (Exception $e) {
            Log::error("n8n webhook dispatch failed: {$event}", [
                'event_id' => $eventId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Generate an HMAC-SHA256 signature for the given payload and timestamp.
     */
    public function generateSignature(int|string $timestamp, string $payload, string $secret): string
    {
        if (empty($secret)) {
            return '';
        }

        return hash_hmac('sha256', "{$timestamp}.{$payload}", $secret);
    }
}

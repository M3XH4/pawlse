<?php

namespace App\Services;

use App\Models\User;
use App\Support\WebPushCrypto;
use Illuminate\Support\Facades\Http;
use Throwable;

class WebPushNotificationService
{
    public function isConfigured(): bool
    {
        $publicKey = config('services.webpush.public_key');
        $privateKey = config('services.webpush.private_key');

        return is_string($publicKey) && trim($publicKey) !== ''
            && is_string($privateKey) && trim($privateKey) !== '';
    }

    /**
     * Send a Web Push payload to every active subscription registered to the user.
     *
     * @param  array<string, mixed>  $payload
     * @return array{sent: int, failed: int, pruned: int}
     */
    public function sendToUser(User $user, array $payload): array
    {
        if (! $this->isConfigured()) {
            return ['sent' => 0, 'failed' => 0, 'pruned' => 0];
        }

        $subscriptions = $user->pushSubscriptions()->get();
        if ($subscriptions->isEmpty()) {
            return ['sent' => 0, 'failed' => 0, 'pruned' => 0];
        }

        $publicKey = (string) config('services.webpush.public_key');
        $privateKey = (string) config('services.webpush.private_key');
        $subject = (string) config('services.webpush.subject', 'mailto:support@iliganstrayfeeders.site');

        $encodedPayload = json_encode([
            'id' => (string) ($payload['id'] ?? uniqid('pawlse_', true)),
            'title' => (string) ($payload['title'] ?? config('app.name', 'PAWLSE')),
            'body' => (string) ($payload['description'] ?? $payload['body'] ?? 'You have a new update.'),
            'url' => (string) ($payload['url'] ?? '/account/user'),
            'icon' => '/images/pwa/icon-192x192.png',
            'badge' => '/images/pwa/icon-192x192.png',
            'category' => (string) ($payload['category'] ?? 'system'),
            'unreadCount' => (int) ($payload['unreadCount'] ?? 0),
            'suppressWhenVisible' => (bool) ($payload['suppressWhenVisible'] ?? $user->push_suppress_when_visible ?? true),
            'forceShow' => (bool) ($payload['forceShow'] ?? false),
        ], JSON_THROW_ON_ERROR);

        $sent = 0;
        $failed = 0;
        $pruned = 0;

        foreach ($subscriptions as $subscription) {
            if (! $subscription->public_key || ! $subscription->auth_token) {
                $subscription->delete();
                $pruned++;

                continue;
            }

            try {
                $encrypted = WebPushCrypto::encryptPayload(
                    $encodedPayload,
                    $subscription->public_key,
                    $subscription->auth_token,
                );

                $authorization = WebPushCrypto::createVapidAuthorizationHeader(
                    $subscription->endpoint,
                    $subject,
                    $publicKey,
                    $privateKey,
                );

                $response = Http::withHeaders([
                    'Authorization' => $authorization,
                    'Content-Encoding' => 'aes128gcm',
                    'TTL' => '86400',
                    'Urgency' => 'high',
                ])
                    ->withBody($encrypted['ciphertext'], 'application/octet-stream')
                    ->timeout(10)
                    ->post($subscription->endpoint);

                if ($response->successful()) {
                    $subscription->forceFill(['last_used_at' => now()])->saveQuietly();
                    $sent++;
                } elseif (in_array($response->status(), [404, 410], true)) {
                    $subscription->delete();
                    $pruned++;
                } else {
                    $failed++;
                }
            } catch (Throwable) {
                $failed++;
            }
        }

        return ['sent' => $sent, 'failed' => $failed, 'pruned' => $pruned];
    }
}

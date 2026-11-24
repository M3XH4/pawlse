<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use App\Models\SystemSetting;
use App\Services\WebPushNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    /**
     * Store or reassign a Web Push subscription strictly for the authenticated user.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $validated = $request->validate([
            'endpoint' => ['required', 'url:http,https', 'max:2048'],
            'keys' => ['required', 'array'],
            'keys.p256dh' => ['required', 'string', 'max:255'],
            'keys.auth' => ['required', 'string', 'max:255'],
            'contentEncoding' => ['nullable', 'string', 'max:32'],
            'isStandalone' => ['nullable', 'boolean'],
        ]);

        $endpoint = trim((string) $validated['endpoint']);
        $endpointHash = PushSubscription::hashEndpoint($endpoint);

        $subscription = PushSubscription::query()->updateOrCreate(
            ['endpoint_hash' => $endpointHash],
            [
                'user_id' => $user->getKey(),
                'endpoint' => $endpoint,
                'public_key' => trim((string) $validated['keys']['p256dh']),
                'auth_token' => trim((string) $validated['keys']['auth']),
                'content_encoding' => (string) ($validated['contentEncoding'] ?? 'aes128gcm'),
                'user_agent' => substr((string) ($request->userAgent() ?? ''), 0, 512) ?: null,
                'is_standalone' => (bool) ($validated['isStandalone'] ?? false),
                'last_used_at' => now(),
            ],
        );

        return response()->json([
            'subscribed' => true,
            'subscription_id' => $subscription->getKey(),
            'devices_count' => $user->pushSubscriptions()->count(),
        ]);
    }

    /**
     * Unlink the current device subscription (or all user subscriptions) on opt-out or sign-out.
     */
    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $validated = $request->validate([
            'endpoint' => ['nullable', 'url:http,https', 'max:2048'],
        ]);

        $query = PushSubscription::query()->where('user_id', $user->getKey());

        if (! empty($validated['endpoint'])) {
            $query->where('endpoint_hash', PushSubscription::hashEndpoint((string) $validated['endpoint']));
        }

        $deleted = $query->delete();

        return response()->json([
            'unsubscribed' => true,
            'deleted' => $deleted,
            'devices_count' => $user->pushSubscriptions()->count(),
        ]);
    }

    /**
     * Trigger a test push notification to the authenticated user's registered devices.
     */
    public function test(Request $request, WebPushNotificationService $webPushService): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $testAlertEnabled = (bool) (SystemSetting::getValue('system_settings')['push_test_alert_enabled'] ?? false);
        if (! $testAlertEnabled) {
            return response()->json([
                'message' => __('Push test alert is currently disabled in System Settings.'),
            ], 403);
        }

        if (! $webPushService->isConfigured()) {
            return response()->json([
                'message' => __('Web Push VAPID keys are not configured on the server yet.'),
            ], 503);
        }

        if (! $user->pushSubscriptions()->exists()) {
            return response()->json([
                'message' => __('No active phone or browser subscription is linked to your account yet.'),
            ], 422);
        }

        $dashboardUrl = match ($user->role) {
            'super-admin' => '/account/super-admin/dashboard',
            'admin' => '/account/admin/dashboard',
            'volunteer' => '/account/volunteer',
            default => '/account/user',
        };

        $result = $webPushService->sendToUser($user, [
            'id' => 'test-'.now()->timestamp,
            'title' => config('app.name', 'PAWLSE').' Notifications Active',
            'description' => __('Mobile push notifications are enabled for your account.'),
            'url' => $dashboardUrl,
            'category' => 'system',
            'unreadCount' => $user->unreadNotifications()->count(),
            'suppressWhenVisible' => false,
            'forceShow' => true,
        ]);

        return response()->json([
            'ok' => $result['sent'] > 0,
            ...$result,
        ]);
    }
}

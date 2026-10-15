<?php

namespace App\Services;

use App\Events\RealtimeDomainEventPushed;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class RealtimeEventBroadcaster
{
    private const CACHE_KEY = 'realtime_domain_events';

    private const MAX_EVENTS = 60;

    /**
     * Publish a real-time application domain event across SSE and WebSockets.
     *
     * @param  array<string, mixed>  $payload
     * @param  array<int, string>|null  $targetRoles
     */
    public static function publish(
        string $domain,
        string $action,
        string $title,
        string $message,
        array $payload = [],
        ?array $targetRoles = null,
        int|string|null $targetUserId = null,
    ): void {
        $event = [
            'id' => (string) Str::uuid(),
            'domain' => $domain,
            'action' => $action,
            'title' => $title,
            'message' => $message,
            'payload' => $payload,
            'targetRoles' => $targetRoles,
            'targetUserId' => $targetUserId !== null ? (string) $targetUserId : null,
            'timestamp' => microtime(true),
        ];

        // Store in cache for SSE stream consumers
        rescue(function () use ($event) {
            $events = Cache::get(self::CACHE_KEY, []);
            if (! is_array($events)) {
                $events = [];
            }
            $events[] = $event;
            if (count($events) > self::MAX_EVENTS) {
                $events = array_slice($events, -self::MAX_EVENTS);
            }
            Cache::put(self::CACHE_KEY, $events, 120);
        }, report: false);

        // Broadcast for WebSocket consumers (Laravel Echo / Reverb)
        rescue(function () use ($event) {
            event(new RealtimeDomainEventPushed($event));
        }, report: false);
    }

    /**
     * Retrieve events that occurred after the given microtime timestamp for the given user.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function getEventsSince(float $sinceTimestamp, ?User $user): array
    {
        $events = Cache::get(self::CACHE_KEY, []);
        if (! is_array($events) || empty($events)) {
            return [];
        }

        $userRole = $user?->role instanceof \BackedEnum ? $user->role->value : (string) ($user?->role ?? '');
        $userId = $user ? (string) $user->getKey() : null;

        return array_values(array_filter($events, function (array $ev) use ($sinceTimestamp, $userRole, $userId) {
            if (($ev['timestamp'] ?? 0) <= $sinceTimestamp) {
                return false;
            }

            // If a specific targetUserId is set, only that user receives it
            if (! empty($ev['targetUserId']) && $ev['targetUserId'] !== $userId) {
                return false;
            }

            // If targetRoles is set, only users with matching role receive it
            if (! empty($ev['targetRoles']) && is_array($ev['targetRoles'])) {
                if (! in_array($userRole, $ev['targetRoles'], true)) {
                    return false;
                }
            }

            return true;
        }));
    }
}

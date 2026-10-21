<?php

namespace App\Http\Controllers;

use App\Services\NotificationPayloadFormatter;
use App\Services\RealtimeEventBroadcaster;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserNotificationController extends Controller
{
    /**
     * Stream real-time notifications using Server-Sent Events (SSE).
     */
    public function stream(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        return response()->stream(function () use ($user) {
            if (function_exists('apache_setenv')) {
                @apache_setenv('no-gzip', '1');
            }
            @ini_set('zlib.output_compression', '0');
            @ini_set('implicit_flush', '1');
            if (! app()->runningUnitTests()) {
                while (ob_get_level() > 0) {
                    ob_end_flush();
                }

                // Explicitly save and close session so PHP-FPM process doesn't block other tabs/requests
                if (session()->isStarted()) {
                    session()->save();
                }
            }

            $unreadCount = $user->unreadNotifications()->count();
            $latestNotification = $user->notifications()->latest()->first();
            $seenIds = $user->notifications()->latest()->limit(100)->pluck('id')->all();
            $lastUnreadCount = $unreadCount;

            echo "retry: 3000\n\n";
            echo "event: init\n";
            echo 'data: '.json_encode([
                'unreadCount' => $unreadCount,
                'lastSeenId' => $latestNotification?->id,
                'timestamp' => now()->timestamp,
            ])."\n\n";
            @flush();

            if (app()->runningUnitTests()) {
                return;
            }

            $startTime = time();
            $maxExecutionSeconds = 25;
            $lastEventsTimestamp = microtime(true);

            while (time() - $startTime < $maxExecutionSeconds) {
                if (connection_aborted()) {
                    break;
                }

                // Check for real-time application domain events (adoptions, rescues, donations, volunteers, etc.)
                $appEvents = RealtimeEventBroadcaster::getEventsSince($lastEventsTimestamp, $user);
                if (! empty($appEvents)) {
                    $lastEventsTimestamp = microtime(true);
                    foreach ($appEvents as $appEvent) {
                        echo "event: app_event\n";
                        echo 'data: '.json_encode($appEvent)."\n\n";
                        @flush();
                    }
                }

                $user->unsetRelation('notifications');
                $user->unsetRelation('unreadNotifications');

                $newNotifications = $user->unreadNotifications()
                    ->when(! empty($seenIds), fn ($query) => $query->whereNotIn('id', $seenIds))
                    ->latest()
                    ->limit(10)
                    ->get();

                $currentUnread = $user->unreadNotifications()->count();

                if ($newNotifications->isNotEmpty()) {
                    foreach ($newNotifications as $notification) {
                        $seenIds[] = $notification->id;
                        echo "event: notification\n";
                        echo 'data: '.json_encode([
                            'notification' => NotificationPayloadFormatter::format($notification),
                            'unreadCount' => $currentUnread,
                        ])."\n\n";
                        @flush();
                    }
                    $lastUnreadCount = $currentUnread;
                } elseif ($currentUnread !== $lastUnreadCount) {
                    // Send instant count change update (e.g. marked read in another tab)
                    $lastUnreadCount = $currentUnread;
                    echo "event: ping\n";
                    echo 'data: '.json_encode([
                        'unreadCount' => $currentUnread,
                    ])."\n\n";
                    @flush();
                } else {
                    if ((time() - $startTime) % 10 === 0) {
                        echo "event: ping\n";
                        echo 'data: '.json_encode([
                            'unreadCount' => $currentUnread,
                        ])."\n\n";
                        @flush();
                    }
                }

                sleep(2);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Poll recent notifications and unread count (fallback or manual sync).
     */
    public function poll(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $notifications = $user->notifications()
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn (DatabaseNotification $notification): array => NotificationPayloadFormatter::format($notification))
            ->all();

        return response()->json([
            'unreadCount' => $user->unreadNotifications()->count(),
            'notifications' => $notifications,
        ]);
    }

    public function read(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        $user = $request->user();

        abort_unless(
            $user !== null
            && $notification->notifiable_type === $user::class
            && (string) $notification->notifiable_id === (string) $user->getKey(),
            404,
        );

        $notification->markAsRead();

        return back(303);
    }

    public function readAll(Request $request): RedirectResponse
    {
        $request->user()?->unreadNotifications()->update([
            'read_at' => now(),
        ]);

        return back(303);
    }

    /**
     * Mark all unread notifications for a specific visited dashboard tab as read.
     */
    public function readTab(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $tabPath = trim((string) $request->input('path', ''));
        if ($tabPath === '') {
            return response()->json([
                'marked' => 0,
                'unreadCount' => $user->unreadNotifications()->count(),
            ]);
        }

        $cleanTabPath = strtolower(rtrim(parse_url($tabPath, PHP_URL_PATH) ?? $tabPath, '/'));
        $marked = 0;

        foreach ($user->unreadNotifications as $notification) {
            $rawUrl = (string) ($notification->data['url'] ?? '');
            $cleanNotifPath = strtolower(rtrim(parse_url($rawUrl, PHP_URL_PATH) ?? $rawUrl, '/'));
            $category = strtolower((string) ($notification->data['category'] ?? $notification->data['icon'] ?? ''));

            $matches = false;
            if ($cleanNotifPath !== '' && ($cleanNotifPath === $cleanTabPath || str_starts_with($cleanNotifPath, $cleanTabPath.'/'))) {
                $matches = true;
            } elseif ($category !== '') {
                $matches = match ($category) {
                    'adoption', 'rehoming', 'visit', 'shelter_visit' => str_contains($cleanTabPath, 'adoption'),
                    'rescue' => str_contains($cleanTabPath, 'rescue') || str_contains($cleanTabPath, 'missing-found'),
                    'donation' => str_contains($cleanTabPath, 'donation'),
                    'foster' => str_contains($cleanTabPath, 'foster'),
                    'task' => str_contains($cleanTabPath, 'task'),
                    'volunteer' => str_contains($cleanTabPath, 'volunteer'),
                    'event' => str_contains($cleanTabPath, 'event'),
                    'ticket', 'help_desk' => str_contains($cleanTabPath, 'help-desk'),
                    'story', 'blog' => str_contains($cleanTabPath, 'stories') || str_contains($cleanTabPath, 'blog'),
                    'certificate', 'honor' => str_contains($cleanTabPath, 'certificate') || str_contains($cleanTabPath, 'community-honor'),
                    'security' => str_contains($cleanTabPath, 'security'),
                    default => false,
                };
            }

            if ($matches) {
                $notification->markAsRead();
                $marked++;
            }
        }

        return response()->json([
            'marked' => $marked,
            'unreadCount' => $user->unreadNotifications()->count(),
        ]);
    }

    public function destroy(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        $user = $request->user();

        abort_unless(
            $user !== null
            && $notification->notifiable_type === $user::class
            && (string) $notification->notifiable_id === (string) $user->getKey(),
            404,
        );

        $notification->delete();

        return back(303);
    }

    public function clearAll(Request $request): RedirectResponse
    {
        $request->user()?->readNotifications()->delete();

        return back(303);
    }
}

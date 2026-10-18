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
            $seenIds = $latestNotification ? [$latestNotification->id] : [];
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
            $maxExecutionSeconds = 15;
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
                    ->where('created_at', '>=', now()->subMinutes(5))
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

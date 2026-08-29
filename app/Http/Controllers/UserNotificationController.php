<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class UserNotificationController extends Controller
{
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

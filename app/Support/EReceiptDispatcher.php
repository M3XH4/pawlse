<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Notifications\Notification as BaseNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class EReceiptDispatcher
{
    /**
     * Dispatch a notification to an email address via the mail channel.
     */
    public static function sendToEmail(?string $email, BaseNotification $notification): void
    {
        $cleanEmail = is_string($email) ? trim($email) : '';
        if ($cleanEmail === '' || ! filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
            return;
        }

        try {
            Notification::route('mail', $cleanEmail)->notify($notification);
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch e-receipt email notification: '.$e->getMessage(), [
                'email' => $cleanEmail,
                'notification' => $notification::class,
            ]);
        }
    }

    /**
     * Dispatch a notification to a User (database + mail) and/or fallback/custom email address.
     */
    public static function sendToUserAndEmail(?User $user, ?string $email, BaseNotification $notification): void
    {
        $cleanEmail = is_string($email) ? trim($email) : '';

        if ($user) {
            try {
                $user->notify($notification);
            } catch (\Throwable $e) {
                Log::warning('Failed to dispatch user notification: '.$e->getMessage(), [
                    'user_id' => $user->id,
                    'notification' => $notification::class,
                ]);
            }

            if ($cleanEmail !== '' && strcasecmp($cleanEmail, (string) $user->email) !== 0) {
                self::sendToEmail($cleanEmail, $notification);
            }

            return;
        }

        self::sendToEmail($cleanEmail, $notification);
    }
}

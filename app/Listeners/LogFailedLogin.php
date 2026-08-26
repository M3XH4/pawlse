<?php

namespace App\Listeners;

use App\Models\LoginAttempt;
use Illuminate\Auth\Events\Failed;

class LogFailedLogin
{
    /**
     * Handle the event.
     */
    public function handle(Failed $event): void
    {
        $email = $event->credentials['email'] ?? null;
        $user = $event->user;
        $ip = request()->ip();

        // Heuristic: check if this IP has failed logins recently
        $thresholdTime = now()->subMinutes(10);
        $recentFailuresCount = LoginAttempt::where('ip_address', $ip)
            ->where('status', 'failed')
            ->where('created_at', '>=', $thresholdTime)
            ->count();

        $isUserNotFound = $user === null;
        $isSuspicious = ($recentFailuresCount >= 2) || $isUserNotFound;

        $attempt = LoginAttempt::create([
            'user_id' => $user?->id,
            'email' => $email,
            'ip_address' => $ip,
            'user_agent' => request()->userAgent(),
            'status' => 'failed',
            'is_suspicious' => $isSuspicious,
        ]);

        if ($recentFailuresCount >= 2) {
            LoginAttempt::where('ip_address', $ip)
                ->where('status', 'failed')
                ->where('created_at', '>=', $thresholdTime)
                ->update(['is_suspicious' => true]);
        }
    }
}

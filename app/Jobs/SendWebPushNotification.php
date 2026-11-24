<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\WebPushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendWebPushNotification implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $backoff = 10;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public int|string $userId,
        public array $payload,
        public int $unreadCount = 0,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(WebPushNotificationService $webPushService): void
    {
        if (! $webPushService->isConfigured()) {
            return;
        }

        $user = User::query()->find($this->userId);
        if (! $user instanceof User) {
            return;
        }

        $webPushService->sendToUser($user, [
            ...$this->payload,
            'unreadCount' => $this->unreadCount,
            'suppressWhenVisible' => (bool) ($user->push_suppress_when_visible ?? true),
        ]);
    }
}

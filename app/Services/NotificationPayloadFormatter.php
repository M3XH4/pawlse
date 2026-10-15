<?php

namespace App\Services;

use Illuminate\Notifications\DatabaseNotification;

class NotificationPayloadFormatter
{
    /**
     * @return array{
     *     id: string,
     *     title: string,
     *     description: string,
     *     time: string,
     *     url: string,
     *     icon: string,
     *     category: string,
     *     read: bool,
     *     readUrl: string,
     *     deleteUrl: string,
     *     createdAt: string|null
     * }
     */
    public static function format(DatabaseNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'title' => (string) ($notification->data['title'] ?? 'Notification'),
            'description' => (string) ($notification->data['message'] ?? $notification->data['description'] ?? ''),
            'time' => $notification->created_at?->diffForHumans() ?? '',
            'url' => (string) ($notification->data['url'] ?? url('/')),
            'icon' => (string) ($notification->data['icon'] ?? 'system'),
            'category' => (string) ($notification->data['category'] ?? $notification->data['icon'] ?? 'system'),
            'read' => $notification->read(),
            'readUrl' => route('account.notifications.read', $notification),
            'deleteUrl' => route('account.notifications.destroy', $notification),
            'createdAt' => $notification->created_at?->toIso8601String(),
        ];
    }
}

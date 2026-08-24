<?php

namespace App\Support;

class AdminNotifications
{
    /**
     * @return list<array{id: string, title: string, description: string, time: string, url: string, icon: string, read?: bool}>
     */
    public static function all(): array
    {
        return [
            [
                'id' => 'rescue-request-1',
                'title' => 'New Rescue Report',
                'description' => 'Emergency rescue needed in Tibanga area.',
                'time' => '5 minutes ago',
                'url' => route('account.admin.rescue-management'),
                'icon' => 'rescue',
            ],
            [
                'id' => 'adoption-application-1',
                'title' => 'Adoption Application',
                'description' => 'New adoption application pending review.',
                'time' => '20 minutes ago',
                'url' => route('account.admin.adoption-management'),
                'icon' => 'adoption',
            ],
            [
                'id' => 'ai-validation-1',
                'title' => 'AI Validation Needed',
                'description' => '3 reports awaiting AI validation.',
                'time' => '1 hour ago',
                'url' => route('account.admin.ai-validation'),
                'icon' => 'ai',
                'read' => true,
            ],
            [
                'id' => 'donation-received-1',
                'title' => 'Donation Received',
                'description' => 'New donation of ₱5,000 received.',
                'time' => '2 hours ago',
                'url' => route('account.admin.donation-monitoring'),
                'icon' => 'donation',
                'read' => true,
            ],
            [
                'id' => 'volunteer-signup-1',
                'title' => 'Volunteer Sign-up',
                'description' => 'A new volunteer registration is pending approval.',
                'time' => '3 hours ago',
                'url' => route('account.admin.volunteer-management'),
                'icon' => 'volunteer',
                'read' => true,
            ],
            [
                'id' => 'event-update-1',
                'title' => 'Event Update',
                'description' => 'An upcoming event schedule was modified.',
                'time' => 'Yesterday',
                'url' => route('account.admin.events'),
                'icon' => 'event',
                'read' => true,
            ],
        ];
    }

    public static function unreadCount(): int
    {
        return count(array_filter(self::all(), fn (array $notification): bool => ! ($notification['read'] ?? false)));
    }
}

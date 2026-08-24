<?php

namespace App\Support;

class DashboardNotifications
{
    /**
     * @return list<array{id: string, title: string, description: string, time: string, url: string, icon: string, read?: bool}>
     */
    public static function for(string $role): array
    {
        return match ($role) {
            'user' => self::user(),
            'volunteer' => self::volunteer(),
            'super-admin' => self::superAdmin(),
            default => AdminNotifications::all(),
        };
    }

    /**
     * @return list<array{id: string, title: string, description: string, time: string, url: string, icon: string, read?: bool}>
     */
    private static function user(): array
    {
        return [
            [
                'id' => 'user-adoption-1',
                'title' => 'Adoption update',
                'description' => 'Your application for Mango is now under review.',
                'time' => '12 minutes ago',
                'url' => route('account.user.adoption-applications'),
                'icon' => 'adoption',
            ],
            [
                'id' => 'user-rescue-1',
                'title' => 'Rescue report received',
                'description' => 'We received your Tibanga rescue report.',
                'time' => '1 hour ago',
                'url' => route('account.user.rescue-reports'),
                'icon' => 'rescue',
            ],
            [
                'id' => 'user-donation-1',
                'title' => 'Donation receipt',
                'description' => 'Your ₱500 donation receipt is ready.',
                'time' => 'Yesterday',
                'url' => route('account.user.donations'),
                'icon' => 'donation',
                'read' => true,
            ],
        ];
    }

    /**
     * @return list<array{id: string, title: string, description: string, time: string, url: string, icon: string, read?: bool}>
     */
    private static function volunteer(): array
    {
        return [
            [
                'id' => 'volunteer-task-1',
                'title' => 'New assigned task',
                'description' => 'Food Carrier shift for the Tibanga feeding drive.',
                'time' => '8 minutes ago',
                'url' => route('account.volunteer.assigned-tasks'),
                'icon' => 'task',
            ],
            [
                'id' => 'volunteer-event-1',
                'title' => 'Upcoming event',
                'description' => 'Community Feeding Drive starts this Saturday.',
                'time' => '2 hours ago',
                'url' => route('account.volunteer.participation-history'),
                'icon' => 'event',
            ],
            [
                'id' => 'volunteer-certificate-1',
                'title' => 'Certificate ready',
                'description' => 'Your April service certificate is available.',
                'time' => 'Yesterday',
                'url' => route('account.volunteer.certificates'),
                'icon' => 'certificate',
                'read' => true,
            ],
        ];
    }

    /**
     * @return list<array{id: string, title: string, description: string, time: string, url: string, icon: string, read?: bool}>
     */
    private static function superAdmin(): array
    {
        return [
            [
                'id' => 'super-admin-security-1',
                'title' => 'Security review',
                'description' => 'A privileged access change needs confirmation.',
                'time' => '15 minutes ago',
                'url' => route('account.super-admin.security-access'),
                'icon' => 'system',
            ],
            [
                'id' => 'super-admin-backup-1',
                'title' => 'Backup completed',
                'description' => 'Nightly system backup finished successfully.',
                'time' => '3 hours ago',
                'url' => route('account.super-admin.backup-restore'),
                'icon' => 'system',
                'read' => true,
            ],
        ];
    }
}

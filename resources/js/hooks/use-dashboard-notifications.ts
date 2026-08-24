import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { DashboardNotification } from '@/types/dashboard';

export function useDashboardNotifications() {
    const {
        dashboardNotifications = [],
        dashboardNotificationActions = null,
        adminNotifications = [],
    } = usePage().props;
    const notifications: DashboardNotification[] =
        dashboardNotifications.length > 0 ? dashboardNotifications : adminNotifications;
    const [optimisticReadIds, setOptimisticReadIds] = useState<string[]>([]);

    const isRead = (notification: DashboardNotification) =>
        notification.read === true || optimisticReadIds.includes(notification.id);

    const unreadCount = notifications.filter((notification) => !isRead(notification)).length;

    const markRead = (notification: DashboardNotification) => {
        setOptimisticReadIds((ids) =>
            ids.includes(notification.id) ? ids : [...ids, notification.id],
        );

        if (!notification.readUrl) {
            return;
        }

        router.patch(
            notification.readUrl,
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const markAllRead = () => {
        setOptimisticReadIds((ids) =>
            Array.from(new Set([...ids, ...notifications.map((notification) => notification.id)])),
        );

        if (!dashboardNotificationActions?.markAllReadUrl) {
            return;
        }

        router.patch(
            dashboardNotificationActions.markAllReadUrl,
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const openNotification = (notification: DashboardNotification) => {
        setOptimisticReadIds((ids) =>
            ids.includes(notification.id) ? ids : [...ids, notification.id],
        );

        if (!notification.readUrl || isRead(notification)) {
            router.visit(notification.url);

            return;
        }

        router.patch(
            notification.readUrl,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => router.visit(notification.url),
            },
        );
    };

    return {
        notifications,
        unreadCount,
        isRead,
        markRead,
        markAllRead,
        openNotification,
    };
}

import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { DashboardNotification, DashboardNotificationActions } from '@/types/dashboard';

export function useDashboardNotifications() {
    const {
        dashboardNotifications = [],
        dashboardNotificationActions = null,
        adminNotifications = [],
        unreadNotificationCount = 0,
    } = usePage().props as {
        dashboardNotifications?: DashboardNotification[];
        dashboardNotificationActions?: DashboardNotificationActions | null;
        adminNotifications?: DashboardNotification[];
        unreadNotificationCount?: number;
    };

    const initialNotifications: DashboardNotification[] =
        dashboardNotifications.length > 0 ? dashboardNotifications : adminNotifications;

    const [optimisticReadIds, setOptimisticReadIds] = useState<string[]>([]);
    const [deletedIds, setDeletedIds] = useState<string[]>([]);

    const notifications = initialNotifications.filter(
        (notification) => !deletedIds.includes(notification.id),
    );

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
            Array.from(new Set([...ids, ...notifications.map((n) => n.id)])),
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

    const deleteNotification = (notification: DashboardNotification) => {
        setDeletedIds((ids) => (ids.includes(notification.id) ? ids : [...ids, notification.id]));

        if (!notification.deleteUrl) {
            return;
        }

        router.delete(notification.deleteUrl, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const clearAllRead = () => {
        const readIds = notifications
            .filter((notification) => isRead(notification))
            .map((notification) => notification.id);

        setDeletedIds((ids) => Array.from(new Set([...ids, ...readIds])));

        if (!dashboardNotificationActions?.clearAllUrl) {
            return;
        }

        router.delete(dashboardNotificationActions.clearAllUrl, {
            preserveScroll: true,
            preserveState: true,
        });
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
        deleteNotification,
        clearAllRead,
        openNotification,
    };
}

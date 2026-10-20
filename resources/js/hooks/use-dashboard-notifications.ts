import { usePage } from '@inertiajs/react';
import { useEffect, useSyncExternalStore } from 'react';
import { notificationStore, isDashboardRoute } from '@/lib/notification-store';
import type { DashboardNotification, DashboardNotificationActions } from '@/types/dashboard';

export function useDashboardNotifications() {
    const page = usePage();
    const {
        dashboardRole = null,
        dashboardNotifications = [],
        dashboardNotificationActions = null,
        adminNotifications = [],
        unreadNotificationCount = 0,
        auth,
    } = page.props as {
        dashboardRole?: string | null;
        dashboardNotifications?: DashboardNotification[];
        dashboardNotificationActions?: DashboardNotificationActions | null;
        adminNotifications?: DashboardNotification[];
        unreadNotificationCount?: number;
        auth?: { user?: { id?: string | number } | null };
    };

    const userId = auth?.user?.id;
    const isDashboard = isDashboardRoute(page.url, dashboardRole);
    const sourceList = dashboardNotifications.length > 0 ? dashboardNotifications : adminNotifications;

    // Immediately seed the store on first render so notifications and badges load directly without waiting
    if (userId && isDashboard && notificationStore.getState().notifications.length === 0 && sourceList.length > 0) {
        notificationStore.initFromProps(
            userId,
            dashboardNotifications,
            adminNotifications,
            unreadNotificationCount,
            isDashboard,
        );
    }

    // Sync store with incoming Inertia page props
    useEffect(() => {
        notificationStore.initFromProps(
            userId,
            dashboardNotifications,
            adminNotifications,
            unreadNotificationCount,
            isDashboard,
        );
    }, [userId, dashboardNotifications, adminNotifications, unreadNotificationCount, isDashboard]);

    const state = useSyncExternalStore(
        (listener) => notificationStore.subscribe(listener),
        () => notificationStore.getState(),
        () => notificationStore.getState(),
    );

    const activeNotifications = state.notifications.filter(
        (notification) => !state.deletedIds.has(notification.id),
    );

    const isRead = (notification: DashboardNotification) =>
        notificationStore.isRead(notification);

    const markRead = (notification: DashboardNotification) =>
        notificationStore.markRead(notification);

    const markAllRead = () =>
        notificationStore.markAllRead(dashboardNotificationActions?.markAllReadUrl);

    const deleteNotification = (notification: DashboardNotification) =>
        notificationStore.deleteNotification(notification);

    const clearAllRead = () =>
        notificationStore.clearAllRead(dashboardNotificationActions?.clearAllUrl);

    const openNotification = (notification: DashboardNotification) =>
        notificationStore.openNotification(notification);

    const markTabRead = (path: string) =>
        notificationStore.markTabRead(path);

    return {
        notifications: activeNotifications,
        unreadCount: state.unreadCount,
        isRead,
        markRead,
        markAllRead,
        markTabRead,
        deleteNotification,
        clearAllRead,
        openNotification,
        isConnected: state.isConnected,
    };
}

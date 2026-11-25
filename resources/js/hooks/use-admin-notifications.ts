import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    getReadNotificationIds,
    markAllNotificationsRead,
    markNotificationRead,
} from '@/lib/admin-notifications';
import type { AdminNotification } from '@/types/admin';

export function useAdminNotifications() {
    const { adminNotifications = [] } = usePage().props;
    const [readIds, setReadIds] = useState<string[]>([]);

    useEffect(() => {
        setReadIds(getReadNotificationIds());
    }, []);

    const isRead = useCallback(
        (notification: AdminNotification) =>
            notification.read === true || readIds.includes(notification.id),
        [readIds],
    );

    const unreadCount = useMemo(
        () => adminNotifications.filter((notification) => !isRead(notification)).length,
        [adminNotifications, isRead],
    );

    const markRead = useCallback((id: string) => {
        markNotificationRead(id);
        setReadIds(getReadNotificationIds());
    }, []);

    const markAllRead = useCallback(() => {
        markAllNotificationsRead(adminNotifications.map((notification) => notification.id));
        setReadIds(getReadNotificationIds());
    }, [adminNotifications]);

    return {
        notifications: adminNotifications,
        unreadCount,
        isRead,
        markRead,
        markAllRead,
    };
}

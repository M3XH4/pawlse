import { router } from '@inertiajs/react';
import { playNotificationChime } from '@/lib/notification-chime';
import { syncDocumentTitle } from '@/lib/notification-title';
import { handleRealtimeAppEvent } from '@/lib/realtime-page-sync';
import { notificationMatchesPath } from '@/lib/tab-notification-matcher';
import type { DashboardNotification } from '@/types/dashboard';

export interface NotificationStoreState {
    notifications: DashboardNotification[];
    unreadCount: number;
    optimisticReadIds: Set<string>;
    deletedIds: Set<string>;
    isConnected: boolean;
}

type Listener = () => void;

/**
 * Checks whether the current path or role belongs to a dashboard route:
 * /account/user/*, /account/volunteer/*, /account/admin/*, /account/super-admin/*
 */
export function isDashboardRoute(url?: string, role?: string | null): boolean {
    if (role && ['user', 'volunteer', 'admin', 'super-admin'].includes(role)) {
        return true;
    }
    const path = url || (typeof window !== 'undefined' ? window.location.pathname : '');
    return /^\/account\/(user|volunteer|admin|super-admin)/.test(path);
}

class NotificationStore {
    private state: NotificationStoreState = {
        notifications: [],
        unreadCount: 0,
        optimisticReadIds: new Set(),
        deletedIds: new Set(),
        isConnected: false,
    };

    private listeners: Set<Listener> = new Set();
    private eventSource: EventSource | null = null;
    private pollTimer: ReturnType<typeof setInterval> | null = null;
    private titleObserver: MutationObserver | null = null;
    private isInitialized = false;
    private activeUserId: string | number | null = null;
    private isDashboardActive = false;

    public getState(): NotificationStoreState {
        return this.state;
    }

    public isDashboard(): boolean {
        return this.isDashboardActive;
    }

    public subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify(): void {
        for (const listener of this.listeners) {
            listener();
        }
    }

    public initFromProps(
        userId: string | number | null | undefined,
        dashboardNotifications: DashboardNotification[] = [],
        adminNotifications: DashboardNotification[] = [],
        unreadNotificationCount = 0,
        isDashboard = false,
    ): void {
        if (!userId || !isDashboard) {
            this.cleanup();
            this.state = {
                notifications: [],
                unreadCount: 0,
                optimisticReadIds: new Set(),
                deletedIds: new Set(),
                isConnected: false,
            };
            syncDocumentTitle(0);
            this.notify();
            return;
        }

        this.isDashboardActive = true;
        const sourceList =
            dashboardNotifications.length > 0 ? dashboardNotifications : adminNotifications;

        if (this.activeUserId !== userId || !this.isInitialized) {
            this.activeUserId = userId;
            this.isInitialized = true;

            this.state.notifications = sourceList;
            this.state.unreadCount = unreadNotificationCount;
            this.state.optimisticReadIds = new Set();
            this.state.deletedIds = new Set();

            syncDocumentTitle(this.state.unreadCount);
            this.setupRealtime(userId);
            this.setupTitleObserver();
            this.notify();
            return;
        }

        // Merge incoming props without overwriting real-time additions
        if (sourceList.length > 0) {
            const existingIds = new Set(this.state.notifications.map((n) => n.id));
            const merged = [...this.state.notifications];

            for (const item of sourceList) {
                if (!existingIds.has(item.id)) {
                    merged.push(item);
                }
            }

            this.state.notifications = merged;
        }

        // Only update unreadCount from server props if not currently modified by optimistic local actions
        if (this.state.optimisticReadIds.size === 0) {
            this.state.unreadCount = unreadNotificationCount;
            syncDocumentTitle(this.state.unreadCount);
        }

        this.notify();
    }

    public setupRealtime(userId: string | number): void {
        if (typeof window === 'undefined' || !this.isDashboardActive) {
            return;
        }

        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }

        // Support WebSocket listener if Laravel Echo is configured
        try {
            const windowWithEcho = window as unknown as {
                Echo?: {
                    private: (channel: string) => {
                        listen: (event: string, callback: (payload: { notification?: DashboardNotification; unreadCount?: number }) => void) => unknown;
                    };
                    channel: (channel: string) => {
                        listen: (event: string, callback: (payload: import('@/lib/realtime-page-sync').RealtimeAppEvent) => void) => unknown;
                    };
                };
            };
            if (windowWithEcho.Echo) {
                windowWithEcho.Echo.private(`users.${userId}`).listen('.notification.pushed', (data) => {
                    if (data?.notification) {
                        this.pushNotification(data.notification, data.unreadCount);
                    }
                });
                windowWithEcho.Echo.channel('app-realtime').listen('.app.event', (data) => {
                    if (data) {
                        handleRealtimeAppEvent(data);
                    }
                });
            }
        } catch {
            // Echo integration fallback
        }

        try {
            const streamUrl = '/account/notifications/stream';
            const es = new EventSource(streamUrl);
            this.eventSource = es;

            es.addEventListener('open', () => {
                this.state.isConnected = true;
                this.notify();
            });

            es.addEventListener('init', (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data) as { unreadCount?: number };
                    if (typeof data.unreadCount === 'number') {
                        this.state.unreadCount = data.unreadCount;
                        syncDocumentTitle(data.unreadCount);
                        this.notify();
                    }
                } catch {
                    // Ignore JSON parse errors
                }
            });

            es.addEventListener('notification', (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data) as {
                        notification?: DashboardNotification;
                        unreadCount?: number;
                    };

                    if (data.notification) {
                        this.pushNotification(data.notification, data.unreadCount);
                    }
                } catch {
                    // Ignore JSON parse errors
                }
            });

            es.addEventListener('app_event', (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data) as import('@/lib/realtime-page-sync').RealtimeAppEvent;
                    if (data?.domain) {
                        handleRealtimeAppEvent(data);
                    }
                } catch {
                    // Ignore JSON parse errors
                }
            });

            es.addEventListener('ping', (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data) as { unreadCount?: number };
                    if (typeof data.unreadCount === 'number') {
                        // Keep count aligned if no pending optimistic changes
                        if (this.state.optimisticReadIds.size === 0) {
                            this.state.unreadCount = data.unreadCount;
                            syncDocumentTitle(data.unreadCount);
                            this.notify();
                        }
                    }
                } catch {
                    // Ignore JSON parse errors
                }
            });

            es.addEventListener('error', () => {
                this.state.isConnected = false;
                this.notify();
                // EventSource will automatically retry in modern browsers.
                // In addition, start a lightweight poll fallback.
                this.startPollingFallback();
            });
        } catch {
            this.state.isConnected = false;
            this.startPollingFallback();
        }
    }

    private startPollingFallback(): void {
        if (this.pollTimer) {
            return;
        }

        this.pollTimer = setInterval(() => {
            void this.pollNotifications();
        }, 30000);
    }

    public async pollNotifications(): Promise<void> {
        if (typeof window === 'undefined' || !this.activeUserId) {
            return;
        }

        try {
            const response = await fetch('/account/notifications/poll', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                return;
            }

            const data = (await response.json()) as {
                unreadCount?: number;
                notifications?: DashboardNotification[];
            };

            if (typeof data.unreadCount === 'number' && this.state.optimisticReadIds.size === 0) {
                this.state.unreadCount = data.unreadCount;
                syncDocumentTitle(data.unreadCount);
            }

            if (Array.isArray(data.notifications) && data.notifications.length > 0) {
                const existingIds = new Set(this.state.notifications.map((n) => n.id));
                const newItems = data.notifications.filter((n) => !existingIds.has(n.id));

                if (newItems.length > 0) {
                    this.state.notifications = [...newItems, ...this.state.notifications];
                    for (const item of newItems) {
                        this.pushNotification(item, data.unreadCount, false);
                    }
                }
            }

            this.notify();
        } catch {
            // Network failure during background poll
        }
    }

    public pushNotification(
        notification: DashboardNotification,
        newUnreadCount?: number,
        showChime = false,
    ): void {
        if (!this.isDashboardActive) {
            return;
        }

        // Deduplicate notification
        const exists = this.state.notifications.some((n) => n.id === notification.id);
        if (!exists) {
            this.state.notifications = [notification, ...this.state.notifications];
        }

        // Increment unread count or set to given
        const updatedCount =
            typeof newUnreadCount === 'number'
                ? newUnreadCount
                : this.state.unreadCount + 1;

        this.state.unreadCount = updatedCount;
        syncDocumentTitle(updatedCount);
        this.notify();

        if (showChime) {
            playNotificationChime();
        }
    }

    private setupTitleObserver(): void {
        if (typeof document === 'undefined' || this.titleObserver) {
            return;
        }

        const titleEl = document.querySelector('title');
        if (!titleEl) {
            return;
        }

        let isSelfUpdating = false;

        this.titleObserver = new MutationObserver(() => {
            if (isSelfUpdating || !this.isDashboardActive) {
                return;
            }
            isSelfUpdating = true;
            syncDocumentTitle(this.state.unreadCount);
            isSelfUpdating = false;
        });

        this.titleObserver.observe(titleEl, {
            childList: true,
            characterData: true,
            subtree: true,
        });
    }

    public isRead(notification: DashboardNotification): boolean {
        return (
            notification.read === true ||
            this.state.optimisticReadIds.has(notification.id)
        );
    }

    public markRead(notification: DashboardNotification): void {
        if (this.isRead(notification)) {
            return;
        }

        this.state.optimisticReadIds.add(notification.id);
        this.state.unreadCount = Math.max(0, this.state.unreadCount - 1);
        syncDocumentTitle(this.state.unreadCount);
        this.notify();

        if (notification.readUrl) {
            router.patch(
                notification.readUrl,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                },
            );
        }
    }

    public markAllRead(markAllReadUrl?: string): void {
        for (const notif of this.state.notifications) {
            this.state.optimisticReadIds.add(notif.id);
        }

        this.state.unreadCount = 0;
        syncDocumentTitle(0);
        this.notify();

        if (markAllReadUrl) {
            router.patch(
                markAllReadUrl,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                },
            );
        }
    }

    public deleteNotification(notification: DashboardNotification): void {
        this.state.deletedIds.add(notification.id);

        if (!this.isRead(notification)) {
            this.state.unreadCount = Math.max(0, this.state.unreadCount - 1);
            syncDocumentTitle(this.state.unreadCount);
        }

        this.notify();

        if (notification.deleteUrl) {
            router.delete(notification.deleteUrl, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    }

    public clearAllRead(clearAllUrl?: string): void {
        for (const notif of this.state.notifications) {
            if (this.isRead(notif)) {
                this.state.deletedIds.add(notif.id);
            }
        }

        this.notify();

        if (clearAllUrl) {
            router.delete(clearAllUrl, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    }

    public openNotification(notification: DashboardNotification): void {
        this.markRead(notification);

        if (notification.url) {
            router.visit(notification.url);
        }
    }

    /**
     * Automatically mark all unread notifications matching a visited tab path as read.
     */
    public markTabRead(path: string): void {
        if (!path || !this.isDashboardActive) {
            return;
        }

        const cleanPath = path.split('?')[0].replace(/\/$/, '').toLowerCase();
        const isRoot = [
            '/account/user',
            '/account/volunteer',
            '/account/admin',
            '/account/admin/dashboard',
            '/account/super-admin',
            '/account/super-admin/dashboard',
        ].includes(cleanPath);

        if (isRoot) {
            return;
        }

        const toMark: string[] = [];
        for (const notif of this.state.notifications) {
            if (!this.isRead(notif) && notificationMatchesPath(cleanPath, notif)) {
                toMark.push(notif.id);
            }
        }

        if (toMark.length === 0) {
            return;
        }

        for (const id of toMark) {
            this.state.optimisticReadIds.add(id);
        }
        this.state.unreadCount = Math.max(0, this.state.unreadCount - toMark.length);
        syncDocumentTitle(this.state.unreadCount);
        this.notify();

        try {
            const csrfToken =
                typeof document !== 'undefined'
                    ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? ''
                    : '';

            fetch('/account/notifications/read-tab', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ path: cleanPath }),
            }).catch(() => {
                // Ignore background sync errors
            });
        } catch {
            // Ignore background sync errors
        }
    }

    public cleanup(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }

        if (this.titleObserver) {
            this.titleObserver.disconnect();
            this.titleObserver = null;
        }

        this.isInitialized = false;
        this.activeUserId = null;
        this.isDashboardActive = false;
    }
}

export const notificationStore = new NotificationStore();

if (typeof window !== 'undefined') {
    router.on('success', (event) => {
        const page = event.detail.page;
        const props = page.props as {
            auth?: { user?: { id?: string | number } | null };
            dashboardRole?: string | null;
            dashboardNotifications?: DashboardNotification[];
            adminNotifications?: DashboardNotification[];
            unreadNotificationCount?: number;
        };

        const userId = props.auth?.user?.id;
        const isDashboard = isDashboardRoute(page.url, props.dashboardRole);

        notificationStore.initFromProps(
            userId,
            props.dashboardNotifications,
            props.adminNotifications,
            props.unreadNotificationCount,
            isDashboard,
        );
    });
}

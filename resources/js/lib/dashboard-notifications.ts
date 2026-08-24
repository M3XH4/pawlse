import type { DashboardTheme } from '@/types/dashboard';

function storageKey(theme: DashboardTheme): string {
    return `dashboard-notifications-read:${theme}`;
}

export function getReadNotificationIds(theme: DashboardTheme): string[] {
    try {
        const stored = localStorage.getItem(storageKey(theme));

        return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
        return [];
    }
}

export function setReadNotificationIds(theme: DashboardTheme, ids: string[]): void {
    localStorage.setItem(storageKey(theme), JSON.stringify(ids));
}

export function markNotificationRead(theme: DashboardTheme, id: string): void {
    const readIds = new Set(getReadNotificationIds(theme));
    readIds.add(id);
    setReadNotificationIds(theme, [...readIds]);
}

export function markAllNotificationsRead(theme: DashboardTheme, ids: string[]): void {
    const readIds = new Set(getReadNotificationIds(theme));
    ids.forEach((id) => readIds.add(id));
    setReadNotificationIds(theme, [...readIds]);
}

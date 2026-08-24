const READ_STORAGE_KEY = 'admin-notifications-read';

export function getReadNotificationIds(): string[] {
    try {
        const stored = localStorage.getItem(READ_STORAGE_KEY);

        return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
        return [];
    }
}

export function setReadNotificationIds(ids: string[]): void {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids));
}

export function markNotificationRead(id: string): void {
    const readIds = new Set(getReadNotificationIds());
    readIds.add(id);
    setReadNotificationIds([...readIds]);
}

export function markAllNotificationsRead(ids: string[]): void {
    const readIds = new Set(getReadNotificationIds());
    ids.forEach((id) => readIds.add(id));
    setReadNotificationIds([...readIds]);
}

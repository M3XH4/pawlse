import type { DashboardNotification } from '@/types/dashboard';

/**
 * Normalize a URL or relative path into a lowercase pathname without trailing slash.
 */
export function normalizePath(urlOrPath: string): string {
    if (!urlOrPath) {
        return '';
    }
    try {
        if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
            const parsed = new URL(urlOrPath);
            return parsed.pathname.replace(/\/$/, '').toLowerCase();
        }
        return urlOrPath.split('?')[0].replace(/\/$/, '').toLowerCase();
    } catch {
        return urlOrPath.split('?')[0].replace(/\/$/, '').toLowerCase();
    }
}

/**
 * Checks if a single notification belongs to a dashboard nav item / tab.
 */
export function notificationMatchesTab(
    item: { href: string; match?: string; title?: string },
    notification: DashboardNotification,
): boolean {
    const itemPath = normalizePath(item.match || item.href);
    const notifPath = normalizePath(notification.url);

    // 1. Direct path match or child path match (avoiding matching root paths like /account/admin to all tabs)
    if (notifPath && itemPath) {
        if (notifPath === itemPath) {
            return true;
        }

        const isDashboardRoot = [
            '/account/user',
            '/account/volunteer',
            '/account/admin',
            '/account/admin/dashboard',
            '/account/super-admin',
            '/account/super-admin/dashboard',
        ].includes(itemPath);

        if (!isDashboardRoot && notifPath.startsWith(`${itemPath}/`)) {
            return true;
        }
    }

    // 2. Category / keyword fallback mapping
    const category = (notification.category || notification.icon || '').toLowerCase();
    const titleLower = (item.title || '').toLowerCase();

    if (category) {
        if (category === 'adoption') {
            if (itemPath.includes('adoption') || titleLower.includes('adoption')) {
                return true;
            }
        }
        if (category === 'visit' || category === 'shelter_visit') {
            if (
                itemPath.includes('shelter-visits') ||
                itemPath.includes('adoption-management') ||
                titleLower.includes('shelter visit')
            ) {
                return true;
            }
        }
        if (category === 'rehoming') {
            if (
                itemPath.includes('rehoming-requests') ||
                itemPath.includes('adoption-management') ||
                titleLower.includes('rehoming')
            ) {
                return true;
            }
        }
        if (category === 'rescue') {
            if (
                itemPath.includes('rescue') ||
                titleLower.includes('rescue') ||
                itemPath.includes('missing-found')
            ) {
                return true;
            }
        }
        if (category === 'donation') {
            if (itemPath.includes('donation') || titleLower.includes('donation')) {
                return true;
            }
        }
        if (category === 'foster') {
            if (itemPath.includes('foster') || titleLower.includes('foster')) {
                return true;
            }
        }
        if (category === 'task') {
            if (itemPath.includes('task') || titleLower.includes('task')) {
                return true;
            }
        }
        if (category === 'volunteer') {
            if (itemPath.includes('volunteer') || titleLower.includes('volunteer')) {
                return true;
            }
        }
        if (category === 'event') {
            if (itemPath.includes('event') || titleLower.includes('event')) {
                return true;
            }
        }
        if (category === 'ticket' || category === 'help_desk') {
            if (itemPath.includes('help-desk') || titleLower.includes('help desk')) {
                return true;
            }
        }
        if (category === 'story' || category === 'blog') {
            if (
                itemPath.includes('stories') ||
                itemPath.includes('blog') ||
                titleLower.includes('stories') ||
                titleLower.includes('blog')
            ) {
                return true;
            }
        }
        if (category === 'certificate' || category === 'honor') {
            if (
                itemPath.includes('certificate') ||
                itemPath.includes('community-honor') ||
                titleLower.includes('certificate') ||
                titleLower.includes('recognition')
            ) {
                return true;
            }
        }
        if (category === 'security') {
            if (itemPath.includes('security') || titleLower.includes('security')) {
                return true;
            }
        }
        if (category === 'backup') {
            if (itemPath.includes('backup') || titleLower.includes('backup')) {
                return true;
            }
        }
        if (category === 'audit') {
            if (itemPath.includes('audit') || titleLower.includes('audit')) {
                return true;
            }
        }
        if (category === 'resource' || category === 'file') {
            if (
                itemPath.includes('resources') ||
                titleLower.includes('resource') ||
                titleLower.includes('file')
            ) {
                return true;
            }
        }
        if (category === 'partner') {
            if (itemPath.includes('partner') || titleLower.includes('partner')) {
                return true;
            }
        }
        if (category === 'ai') {
            if (itemPath.includes('ai-') || titleLower.includes('ai')) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Returns the number of unread notifications matching the specified nav item / tab.
 */
export function getTabNotificationCount(
    item: { href: string; match?: string; title?: string },
    notifications: DashboardNotification[],
    isRead: (notification: DashboardNotification) => boolean,
): number {
    if (!notifications || notifications.length === 0) {
        return 0;
    }

    let count = 0;
    for (const notif of notifications) {
        if (!isRead(notif) && notificationMatchesTab(item, notif)) {
            count++;
        }
    }

    return count;
}

/**
 * Checks if a notification belongs to a specific URL path.
 */
export function notificationMatchesPath(
    path: string,
    notification: DashboardNotification,
): boolean {
    return notificationMatchesTab({ href: path, match: path }, notification);
}

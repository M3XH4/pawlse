/**
 * Removes any existing notification count prefix, e.g. "(3) " or "(99+) ".
 */
export function stripTitleBadge(title: string): string {
    return title.replace(/^\(\d+\+?\)\s*/, '').trim();
}

/**
 * Formats a document title with the unread notification badge.
 */
export function formatTitleWithBadge(baseTitle: string, unreadCount: number): string {
    const cleanTitle = stripTitleBadge(baseTitle);
    if (unreadCount > 0) {
        return `(${unreadCount}) ${cleanTitle}`;
    }
    return cleanTitle;
}

/**
 * Synchronizes the browser document title with the current unread count.
 */
export function syncDocumentTitle(unreadCount: number): void {
    if (typeof document === 'undefined') {
        return;
    }

    const currentTitle = document.title;
    const nextTitle = formatTitleWithBadge(currentTitle, unreadCount);

    if (currentTitle !== nextTitle) {
        document.title = nextTitle;
    }
}

import type { LucideIcon } from 'lucide-react';

export type DashboardTheme = 'user' | 'volunteer' | 'admin' | 'super-admin';

export type DashboardNotificationIcon =
    | 'rescue'
    | 'adoption'
    | 'ai'
    | 'donation'
    | 'volunteer'
    | 'event'
    | 'task'
    | 'certificate'
    | 'system';

export type DashboardNotification = {
    id: string;
    title: string;
    description: string;
    time: string;
    url: string;
    icon: DashboardNotificationIcon;
    read?: boolean;
    readUrl?: string;
};

export type DashboardNotificationActions = {
    markAllReadUrl: string;
};

export type DashboardNavItem = {
    title: string;
    href: string;
    match: string;
    icon: LucideIcon;
    badge?: number;
};

export type DashboardChrome = {
    greeting: string;
    dateLabel: string;
};

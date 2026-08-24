import type { LucideIcon } from 'lucide-react';
import {
    BarChart3,
    Bell,
    Calendar,
    FileText,
    Gift,
    Heart,
    LayoutGrid,
    Settings,
    Sparkles,
    User,
} from 'lucide-react';
import {
    accountSettings,
    adoptionManagement,
    aiValidation,
    dashboard,
    donationMonitoring,
    events,
    notifications,
    reportsAnalytics,
    rescueManagement,
    volunteerManagement,
} from '@/routes/account/admin';

export type AdminNavItem = {
    title: string;
    href: string;
    match: string;
    icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
    {
        title: 'Dashboard Overview',
        href: dashboard.url(),
        match: dashboard.url(),
        icon: LayoutGrid,
    },
    {
        title: 'Rescue Management',
        href: rescueManagement.url(),
        match: rescueManagement.url(),
        icon: FileText,
    },
    {
        title: 'AI Validation Panel',
        href: aiValidation.url(),
        match: aiValidation.url(),
        icon: Sparkles,
    },
    {
        title: 'Adoption Management',
        href: adoptionManagement.url(),
        match: adoptionManagement.url(),
        icon: Heart,
    },
    {
        title: 'Volunteer Management',
        href: volunteerManagement.url(),
        match: volunteerManagement.url(),
        icon: User,
    },
    {
        title: 'Donation Monitoring',
        href: donationMonitoring.url(),
        match: donationMonitoring.url(),
        icon: Gift,
    },
    {
        title: 'Event Management',
        href: events.url(),
        match: events.url(),
        icon: Calendar,
    },
    {
        title: 'Reports & Analytics',
        href: reportsAnalytics.url(),
        match: reportsAnalytics.url(),
        icon: BarChart3,
    },
    {
        title: 'Notifications',
        href: notifications.url(),
        match: notifications.url(),
        icon: Bell,
    },
    {
        title: 'Account Settings',
        href: accountSettings.url(),
        match: accountSettings.url(),
        icon: Settings,
    },
];

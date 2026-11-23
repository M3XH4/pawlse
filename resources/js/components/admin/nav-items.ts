import type { LucideIcon } from 'lucide-react';
import {
    BarChart3,
    Bell,
    Calendar,
    FileText,
    Gift,
    Heart,
    HeartHandshake,
    Home,
    LayoutGrid,
    LifeBuoy,
    Settings,
    Sparkles,
    User,
    PawPrint,
    Newspaper,
} from 'lucide-react';
import {
    accountSettings,
    adoptionManagement,
    aiValidation,
    animalRecords,
    blogManagement,
    dashboard,
    donationMonitoring,
    events,
    fosterManagement,
    myFosterPets,
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
    permission?: string | string[];
};

export const adminNavItems: AdminNavItem[] = [
    {
        title: 'Dashboard Overview',
        href: dashboard.url(),
        match: dashboard.url(),
        icon: LayoutGrid,
    },
    {
        title: 'Animal Master Records',
        href: animalRecords.url(),
        match: animalRecords.url(),
        icon: PawPrint,
        permission: 'pets.view',
    },
    {
        title: 'Rescue Management',
        href: rescueManagement.url(),
        match: rescueManagement.url(),
        icon: FileText,
        permission: 'rescues.view',
    },
    {
        title: 'AI Validation Panel',
        href: aiValidation.url(),
        match: aiValidation.url(),
        icon: Sparkles,
        permission: 'ai_validation.view',
    },
    {
        title: 'Adoption Management',
        href: adoptionManagement.url(),
        match: adoptionManagement.url(),
        icon: Heart,
        permission: ['adoptions.review', 'adoptions.manage'],
    },
    {
        title: 'Foster Home Management',
        href: fosterManagement.url(),
        match: fosterManagement.url(),
        icon: Home,
        permission: ['foster.view', 'foster.manage'],
    },
    {
        title: 'My Foster Pets',
        href: myFosterPets.url(),
        match: myFosterPets.url(),
        icon: HeartHandshake,
    },
    {
        title: 'Volunteer Management',
        href: volunteerManagement.url(),
        match: volunteerManagement.url(),
        icon: User,
        permission: 'volunteers.view',
    },
    {
        title: 'Donation Monitoring',
        href: donationMonitoring.url(),
        match: donationMonitoring.url(),
        icon: Gift,
        permission: 'donations.view',
    },
    {
        title: 'Event Management',
        href: events.url(),
        match: events.url(),
        icon: Calendar,
        permission: 'events.view',
    },
    {
        title: 'Blog Management',
        href: blogManagement.url(),
        match: blogManagement.url(),
        icon: Newspaper,
        permission: 'blogs.view',
    },
    {
        title: 'Reports & Analytics',
        href: reportsAnalytics.url(),
        match: reportsAnalytics.url(),
        icon: BarChart3,
        permission: 'analytics.view',
    },
    {
        title: 'Notifications',
        href: notifications.url(),
        match: notifications.url(),
        icon: Bell,
    },
    {
        title: 'Help Desk & Tickets',
        href: '/account/admin/help-desk',
        match: '/account/admin/help-desk',
        icon: LifeBuoy,
        permission: 'help_desk.view',
    },
    {
        title: 'Account Settings',
        href: accountSettings.url(),
        match: accountSettings.url(),
        icon: Settings,
    },
];

import type { LucideIcon } from 'lucide-react';
import {
    Archive,
    Award,
    BarChart3,
    Bookmark,
    ClipboardList,
    Clock,
    DatabaseBackup,
    FileSearch,
    FileText,
    FolderDown,
    Gift,
    Handshake,
    Heart,
    HeartHandshake,
    LayoutGrid,
    LifeBuoy,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
    Star,
    User,
    Users,
    Zap,
} from 'lucide-react';
import { adminNavItems } from '@/components/admin/nav-items';
import {
    userManagement,
    advancedAnalytics,
    aiConfiguration,
    archives,
    auditLogs,
    backupRestore,
    communityHonors,
    dashboard as superAdminDashboard,
    partners,
    resources,
    securityAccess,
    systemSettings,
    accountSettings as superAdminAccountSettings,
} from '@/routes/account/super-admin';
import {
    accountSettings as userAccountSettings,
    adoptionApplications,
    bookmark,
    donations,
    missingFound,
    rescueReports as userRescueReports,
} from '@/routes/account/user';
import {
    accountSettings as volunteerAccountSettings,
    assignedTasks,
    certificates,
    fosterCare,
    participationHistory,
    profile,
    rescueReports as volunteerRescueReports,
    status,
} from '@/routes/account/volunteer';
import type { DashboardNavItem, DashboardTheme } from '@/types/dashboard';

export type { DashboardNavItem };

export function navItem(
    title: string,
    href: string,
    icon: LucideIcon,
    match = href,
): DashboardNavItem {
    return { title, href, match, icon };
}

export const userNavItems: DashboardNavItem[] = [
    navItem('My Bookmarks', bookmark.url(), Bookmark),
    navItem('My Rescue Reports', userRescueReports.url(), FileText),
    navItem('My Adoption Applications', adoptionApplications.url(), Heart),
    navItem('My Donations', donations.url(), Gift),
    navItem('Missing/Found Reports', missingFound.url(), Search),
    navItem('Volunteer Status', '/account/user/volunteer-status', Zap),
    navItem('Help Desk & Support', '/account/user/help-desk', LifeBuoy),
    navItem('Account Settings', userAccountSettings.url(), Settings),
];

export const volunteerNavItems: DashboardNavItem[] = [
    navItem('Profile Information', profile.url(), User),
    navItem('Volunteer Status', status.url(), Zap),
    navItem('Assigned Tasks', assignedTasks.url(), ClipboardList),
    navItem('My Foster Pets', fosterCare.url(), HeartHandshake),
    navItem('Participation History', participationHistory.url(), Clock),
    navItem('Certificates & Recognition', certificates.url(), Award),
    navItem('My Rescue Reports', volunteerRescueReports.url(), FileText),
    navItem('Help Desk & Support', '/account/volunteer/help-desk', LifeBuoy),
    navItem('Account Settings', volunteerAccountSettings.url(), Settings),
    navItem('Switch to User Dashboard', '/volunteer/switch-user', User),
];

export const superAdminNavItems: DashboardNavItem[] = [
    navItem('System Overview', superAdminDashboard.url(), LayoutGrid),
    navItem('User Management', userManagement.url(), Users),
    navItem('Partner Management', partners.url(), Handshake),
    navItem('File & Resources', resources.url(), FolderDown),
    navItem('Community Recognition', communityHonors.url(), Award),
    navItem('Audit Logs', auditLogs.url(), FileSearch),
    navItem('Archives', archives.url(), Archive),
    navItem('Security & Access', securityAccess.url(), ShieldCheck),
    navItem('Advanced Analytics', advancedAnalytics.url(), BarChart3),
    navItem('Backup & Restore', backupRestore.url(), DatabaseBackup),
    navItem('AI Configuration', aiConfiguration.url(), Sparkles),
    navItem('Help Desk & Inquiries', '/account/super-admin/help-desk', LifeBuoy),
    navItem('System Settings', systemSettings.url(), Settings),
    navItem('Account Settings', superAdminAccountSettings.url(), Settings),
];

export const userNotificationsUrl = '/account/user/notifications';
export const volunteerNotificationsUrl = '/account/volunteer/notifications';
export const superAdminNotificationsUrl = '/account/super-admin/notifications';
export const adminNotificationsUrl = '/account/admin/notifications';

export const navItemsByTheme: Record<DashboardTheme, DashboardNavItem[]> = {
    user: userNavItems,
    volunteer: volunteerNavItems,
    admin: adminNavItems,
    'super-admin': superAdminNavItems,
};

export const notificationsHrefByTheme: Record<DashboardTheme, string> = {
    user: userNotificationsUrl,
    volunteer: volunteerNotificationsUrl,
    admin: adminNotificationsUrl,
    'super-admin': superAdminNotificationsUrl,
};

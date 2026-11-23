import type { LucideIcon } from 'lucide-react';
import {
    Archive,
    Award,
    BarChart3,
    Bell,
    Bookmark,
    Building2,
    Calendar,
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
    Home,
    LayoutGrid,
    LifeBuoy,
    MessageSquareQuote,
    Newspaper,
    PawPrint,
    RefreshCw,
    Search,
    ServerCog,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    Star,
    Trophy,
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
    rehomingRequests,
    rescueReports as userRescueReports,
    shelterVisits,
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
    method: 'get' | 'post' = 'get',
    as?: 'a' | 'button',
): DashboardNavItem {
    return { title, href, match, icon, method, as };
}

export const userNavItems: DashboardNavItem[] = [
    navItem('Home', '/account/user', Home),
    navItem('My Bookmarks', bookmark.url(), Bookmark),
    navItem('My Adoption Applications', adoptionApplications.url(), Heart),
    navItem('My Shelter Visits', shelterVisits.url(), Building2),
    navItem('My Rehoming Requests', rehomingRequests.url(), RefreshCw),
    navItem('My Rescue Reports', userRescueReports.url(), FileText),
    navItem('Missing/Found Reports', missingFound.url(), Search),
    navItem('My Donations', donations.url(), Gift),
    navItem('My Joined Events', '/account/user/joined-events', Calendar),
    navItem('My Certificates', '/account/user/certificates', Award),
    navItem('Badges & Achievements', '/account/user/achievements', Trophy),
    navItem('My Testimonials', '/account/user/stories', MessageSquareQuote),
    navItem('Volunteer Status', '/account/user/volunteer-status', Zap),
    navItem('Notifications', '/account/user/notifications', Bell),
    navItem('Help Desk & Support', '/account/user/help-desk', LifeBuoy),
    navItem('Account Settings', userAccountSettings.url(), Settings),
];

export const volunteerNavItems: DashboardNavItem[] = [
    navItem('Home', '/account/volunteer', Home),
    navItem('Profile Information', profile.url(), User),
    navItem('Volunteer Status', status.url(), Zap),
    navItem('Assigned Tasks', assignedTasks.url(), ClipboardList),
    navItem('My Foster Pets', fosterCare.url(), HeartHandshake),
    navItem('Participation History', participationHistory.url(), Clock),
    navItem('Certificates & Recognition', certificates.url(), Award),
    navItem('Badges & Achievements', '/account/volunteer/achievements', Trophy),
    navItem('My Rescue Reports', volunteerRescueReports.url(), FileText),
    navItem('Notifications', '/account/volunteer/notifications', Bell),
    navItem('Help Desk & Support', '/account/volunteer/help-desk', LifeBuoy),
    navItem('Account Settings', volunteerAccountSettings.url(), Settings),
];

export const superAdminNavItems: DashboardNavItem[] = [
    navItem('System Overview', superAdminDashboard.url(), LayoutGrid),
    navItem('User Management', userManagement.url(), Users),
    {
        title: 'Admin Controls',
        href: '#admin-controls',
        match: '/account/super-admin/admin-controls',
        icon: SlidersHorizontal,
        children: [
            navItem('Animal Master Records', '/account/super-admin/animal-records', PawPrint),
            navItem('Rescue Management', '/account/super-admin/rescue-management', FileText),
            navItem('AI Validation Panel', '/account/super-admin/ai-validation', Sparkles),
            navItem('Adoption Management', '/account/super-admin/adoption-management', Heart),
            navItem('Foster Home Management', '/account/super-admin/foster-management', Home),
            navItem('Volunteer Management', '/account/super-admin/volunteer-management', User),
            navItem('Donation Monitoring', '/account/super-admin/donation-monitoring', Gift),
            navItem('Event Management', '/account/super-admin/events', Calendar),
            navItem('Blog Management', '/account/super-admin/blog-management', Newspaper),
        ],
    },
    navItem('Partner Management', partners.url(), Handshake),
    navItem('File & Resources', resources.url(), FolderDown),
    navItem('Community Recognition', communityHonors.url(), Award),
    navItem('Audit Logs', auditLogs.url(), FileSearch),
    navItem('Archives', archives.url(), Archive),
    navItem('Security & Access', securityAccess.url(), ShieldCheck),
    navItem('Advanced Analytics', advancedAnalytics.url(), BarChart3),
    navItem('Backup & Restore', backupRestore.url(), DatabaseBackup),
    navItem('AI Configuration', aiConfiguration.url(), Sparkles),
    navItem('Notifications', '/account/super-admin/notifications', Bell),
    navItem('Help Desk & Inquiries', '/account/super-admin/help-desk', LifeBuoy),
    navItem('System Settings', systemSettings.url(), ServerCog),
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

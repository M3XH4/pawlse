import type { AdminNotification } from '@/types/admin';
import type { Auth } from '@/types/auth';
import type { WebPushSharedState } from '@/lib/push-notifications';
import type {
    DashboardChrome,
    DashboardNotification,
    DashboardNotificationActions,
    DashboardTheme,
} from '@/types/dashboard';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            dashboardRole: DashboardTheme | null;
            dashboardNotifications: DashboardNotification[];
            dashboardNotificationActions: DashboardNotificationActions | null;
            dashboardChrome: DashboardChrome | null;
            adminNotifications: AdminNotification[];
            adminChrome: DashboardChrome | null;
            unreadNotificationCount: number;
            webPush?: WebPushSharedState;
            [key: string]: unknown;
        };
    }
}

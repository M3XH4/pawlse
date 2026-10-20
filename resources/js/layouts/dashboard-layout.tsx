import { useEffect, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { DashboardContext } from '@/components/dashboard/dashboard-context';
import type { DashboardContextValue } from '@/components/dashboard/dashboard-context';
import { DashboardHeader } from '@/components/dashboard/header';
import {
    navItemsByTheme,
    notificationsHrefByTheme,
} from '@/components/dashboard/nav-items';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { useDashboardNotifications } from '@/hooks/use-dashboard-notifications';
import { dashboardThemes } from '@/lib/dashboard-theme';
import type { DashboardTheme } from '@/types/dashboard';

const COLLAPSED_STORAGE_KEY = 'dashboard-sidebar-collapsed';

export default function DashboardLayout({
    theme,
    children,
}: {
    theme: DashboardTheme;
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const config = dashboardThemes[theme];
    const page = usePage();
    const isMaintenanceMode = Boolean(page.props.isMaintenanceMode);
    const { markTabRead } = useDashboardNotifications();

    // Automatically mark all unread notifications matching the visited tab as read
    useEffect(() => {
        const path = page.url.split('?')[0];
        if (path) {
            markTabRead(path);
        }
    }, [page.url, markTabRead]);

    useEffect(() => {
        try {
            if (localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true') {
                setSidebarCollapsed(true);
            }
        } catch {
            // Ignore storage access errors
        }
    }, []);

    const contextValue = useMemo<DashboardContextValue>(
        () => ({
            theme,
            brandLabel: config.brandLabel,
            roleLabel: config.roleLabel,
            navItems: navItemsByTheme[theme],
            notificationsHref: notificationsHrefByTheme[theme],
        }),
        [config.brandLabel, config.roleLabel, theme],
    );

    useEffect(() => {
        if (!sidebarOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSidebarOpen(false);
            }
        };

        document.body.classList.add('overflow-hidden');
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.classList.remove('overflow-hidden');
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [sidebarOpen]);

    const toggleSidebarCollapsed = () => {
        setSidebarCollapsed((collapsed) => {
            const next = !collapsed;
            localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));

            return next;
        });
    };

    return (
        <DashboardContext.Provider value={contextValue}>
            <div
                data-dashboard-theme={theme}
                className="flex min-h-screen overflow-x-clip bg-[#F8FAFC] font-quicksand text-[#0B2340] antialiased transition-colors duration-200 dark:bg-[#020617] dark:text-[#F8FAFC]"
            >
                <div
                    className={`fixed inset-0 z-40 bg-[#0B2340]/50 transition-opacity duration-300 lg:hidden ${
                        sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                    aria-hidden={!sidebarOpen}
                    onClick={() => setSidebarOpen(false)}
                />

                <DashboardSidebar
                    open={sidebarOpen}
                    collapsed={sidebarCollapsed}
                    onClose={() => setSidebarOpen(false)}
                    onToggleCollapsed={toggleSidebarCollapsed}
                />

                <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                    <DashboardHeader
                        sidebarOpen={sidebarOpen}
                        onOpenSidebar={() => setSidebarOpen(true)}
                    />
                    {isMaintenanceMode && (
                        <div className="border-b border-amber-300/80 bg-amber-50 px-4 py-2 sm:px-6 lg:px-8 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 font-medium">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                                    </span>
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 dark:text-amber-400" />
                                    <span>
                                        <strong>Maintenance Mode is Active</strong> — Public visitors are redirected to the maintenance notice.
                                    </span>
                                </div>
                                {theme === 'super-admin' && (
                                    <Link
                                        href="/account/super-admin/system-settings"
                                        className="inline-flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 underline underline-offset-2 dark:text-amber-300 dark:hover:text-amber-100"
                                    >
                                        <span>Manage Settings</span>
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                    <main className="flex-1 px-4 pb-8 pt-3 sm:px-6 lg:px-8">{children}</main>
                </div>
            </div>
        </DashboardContext.Provider>
    );
}

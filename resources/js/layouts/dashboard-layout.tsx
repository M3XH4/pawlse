import { useEffect, useMemo, useState } from 'react';
import { DashboardContext } from '@/components/dashboard/dashboard-context';
import type { DashboardContextValue } from '@/components/dashboard/dashboard-context';
import { DashboardHeader } from '@/components/dashboard/header';
import {
    navItemsByTheme,
    notificationsHrefByTheme,
} from '@/components/dashboard/nav-items';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        () =>
            typeof window !== 'undefined' &&
            localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true',
    );
    const config = dashboardThemes[theme];

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
                className="flex min-h-screen overflow-x-hidden bg-[#F8FAFC] font-quicksand text-[#0B2340] antialiased transition-colors duration-200 dark:bg-[#020617] dark:text-[#F8FAFC]"
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
                    <main className="flex-1 px-4 pb-8 pt-3 sm:px-6 lg:px-8">{children}</main>
                </div>
            </div>
        </DashboardContext.Provider>
    );
}

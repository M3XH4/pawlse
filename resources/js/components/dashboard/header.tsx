import { Link, usePage } from '@inertiajs/react';
import { Bell, Home, Menu } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { NotificationDropdown } from '@/components/dashboard/notification-dropdown';
import { DashboardThemeToggle } from '@/components/dashboard/theme-toggle';
import { useDashboardNotifications } from '@/hooks/use-dashboard-notifications';
import { home } from '@/routes';

export function DashboardHeader({
    sidebarOpen,
    onOpenSidebar,
}: {
    sidebarOpen: boolean;
    onOpenSidebar: () => void;
}) {
    const { auth, dashboardChrome } = usePage().props;
    const { unreadCount } = useDashboardNotifications();
    const [panelOpen, setPanelOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    const firstName = auth.user?.name?.split(' ')[0] ?? 'there';
    const greeting = dashboardChrome?.greeting ?? 'Hello';
    const dateLabel = dashboardChrome?.dateLabel ?? '';

    useEffect(() => {
        if (!panelOpen) {
            return;
        }

        const onPointerDown = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setPanelOpen(false);
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setPanelOpen(false);
            }
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [panelOpen]);

    return (
        <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 px-4 py-2.5 backdrop-blur-sm transition-colors duration-200 dark:border-[#1E293B] dark:bg-[#0F172A]/95 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenSidebar}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] transition-colors hover:bg-[#E5E7EB] hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 lg:hidden dark:bg-[#1E293B] dark:text-[#94A3B8] dark:hover:bg-[#334155] dark:hover:text-[#F8FAFC]"
                        aria-label="Open navigation menu"
                        aria-expanded={sidebarOpen}
                        aria-controls="dashboard-sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="min-w-0">
                        <h1 className="truncate font-fredoka text-lg font-bold leading-tight tracking-tight text-[#0B2340] sm:text-xl dark:text-[#F8FAFC]">
                            {greeting}, {firstName}
                        </h1>
                        <p className="text-xs font-medium leading-tight text-[#64748B] dark:text-[#94A3B8] sm:text-sm">
                            {dateLabel}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <div className="relative" ref={panelRef}>
                        <button
                            type="button"
                            onClick={() => setPanelOpen((open) => !open)}
                            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]"
                            aria-label={
                                unreadCount > 0
                                    ? `Notifications, ${unreadCount} unread`
                                    : 'Notifications'
                            }
                            aria-expanded={panelOpen}
                            aria-haspopup="dialog"
                            aria-controls={panelId}
                        >
                            <Bell className="h-5 w-5" aria-hidden="true" />
                            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--dashboard-primary)] px-1 text-[10px] font-bold text-white">
                                {unreadCount}
                            </span>
                        </button>

                        <NotificationDropdown
                            id={panelId}
                            open={panelOpen}
                            onClose={() => setPanelOpen(false)}
                        />
                    </div>

                    <DashboardThemeToggle />

                    <Link
                        href={home()}
                        className="inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] px-3 text-sm font-bold text-white shadow-[0_6px_16px_var(--dashboard-primary-shadow)] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 focus-visible:ring-offset-2 sm:px-4 dark:focus-visible:ring-offset-[#0F172A]"
                    >
                        <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="hidden sm:inline">Back to Website</span>
                        <span className="sm:hidden">Home</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}

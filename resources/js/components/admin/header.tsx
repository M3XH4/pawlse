import { Link, usePage } from '@inertiajs/react';
import { useEffect, useId, useRef, useState } from 'react';
import { AdminNotificationPanel } from '@/components/admin/notification-panel';
import { AdminThemeToggle } from '@/components/admin/theme-toggle';
import { useAdminNotifications } from '@/hooks/use-admin-notifications';
import { Bell, Home, Menu } from 'lucide-react';
import { home } from '@/routes';

export function AdminHeader({
    sidebarOpen,
    onOpenSidebar,
}: {
    sidebarOpen: boolean;
    onOpenSidebar: () => void;
}) {
    const { auth, adminChrome } = usePage().props;
    const { unreadCount } = useAdminNotifications();
    const [panelOpen, setPanelOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    const adminName = auth.user?.name?.split(' ')[0] ?? 'Admin';
    const greeting = adminChrome?.greeting ?? 'Hello';
    const dateLabel = adminChrome?.dateLabel ?? '';

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
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] transition-colors hover:bg-[#E5E7EB] hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]/50 lg:hidden dark:bg-[#1E293B] dark:text-[#94A3B8] dark:hover:bg-[#334155] dark:hover:text-[#F8FAFC]"
                        aria-label="Open navigation menu"
                        aria-expanded={sidebarOpen}
                        aria-controls="admin-sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="min-w-0">
                        <h1 className="truncate font-fredoka text-lg font-bold leading-tight tracking-tight text-[#0B2340] sm:text-xl dark:text-[#F8FAFC]">
                            {greeting}, {adminName}
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
                            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]/50 dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]"
                            aria-label="Notifications"
                            aria-expanded={panelOpen}
                            aria-controls={panelId}
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 ? (
                                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            ) : null}
                        </button>

                        <AdminNotificationPanel
                            id={panelId}
                            open={panelOpen}
                            onClose={() => setPanelOpen(false)}
                        />
                    </div>

                    <AdminThemeToggle />

                    <Link
                        href={home()}
                        className="inline-flex h-9 items-center gap-2 rounded-full bg-[#FF8A00] px-3 text-sm font-bold text-white shadow-[0_6px_16px_rgba(255,138,0,0.28)] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]/50 focus-visible:ring-offset-2 sm:px-4 dark:focus-visible:ring-offset-[#0F172A]"
                    >
                        <Home className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Back to Website</span>
                        <span className="sm:hidden">Home</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}

import { Link, usePage } from '@inertiajs/react';
import { LogOut, Menu, Zap } from 'lucide-react';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { DashboardNavLink } from '@/components/dashboard/nav-link';
import { dashboardThemes } from '@/lib/dashboard-theme';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';

function initialsFromName(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

export function DashboardSidebar({
    open,
    collapsed,
    onClose,
    onToggleCollapsed,
}: {
    open: boolean;
    collapsed: boolean;
    onClose: () => void;
    onToggleCollapsed: () => void;
}) {
    const page = usePage();
    const { auth } = page.props;
    const { theme, brandLabel, roleLabel, navItems } = useDashboard();
    const currentUrl = page.url.split('?')[0] ?? page.url;
    const fallbackName = dashboardThemes[theme].fallbackName;
    const userName = auth.user?.name ?? fallbackName;
    const initials = initialsFromName(userName) || fallbackName.slice(0, 2).toUpperCase();

    const canSwitchToVolunteer = page.props.can_switch_to_volunteer as boolean;
    const displayedNavItems = [...navItems];
    if (theme === 'user' && canSwitchToVolunteer) {
        displayedNavItems.push({
            title: 'Volunteer Dashboard',
            href: '/volunteer/switch',
            match: '/volunteer/switch',
            icon: Zap,
        });
    }

    return (
        <aside
            id="dashboard-sidebar"
            data-collapsed={collapsed ? 'true' : 'false'}
            className={cn(
                'fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen w-[280px] shrink-0 flex-col overflow-hidden border-r border-[#E5E7EB] bg-white shadow-[4px_0_24px_rgba(15,23,42,0.06)] transition-[width,transform] duration-300 ease-out dark:border-[#1E293B] dark:bg-[#0F172A] dark:shadow-[4px_0_24px_rgba(0,0,0,0.35)] lg:sticky lg:top-0 lg:z-40 lg:h-screen lg:max-h-screen lg:self-start lg:translate-x-0 lg:shadow-[4px_0_24px_rgba(15,23,42,0.04)]',
                open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                collapsed && 'lg:w-[5.5rem]',
            )}
            aria-label={`${brandLabel} navigation`}
        >
            <div
                className={cn(
                    'flex w-[280px] items-center gap-3 px-5 py-6 transition-[padding,gap] duration-300 ease-out',
                    collapsed && 'lg:gap-0 lg:px-[calc((5.5rem-2.75rem)/2)]',
                )}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] transition-colors hover:bg-[#E5E7EB] hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 lg:hidden dark:bg-[#1E293B] dark:text-[#94A3B8] dark:hover:bg-[#334155] dark:hover:text-[#F8FAFC]"
                    aria-label="Close navigation menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <button
                    type="button"
                    onClick={onToggleCollapsed}
                    className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] transition-colors hover:bg-[#E5E7EB] hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 lg:flex dark:bg-[#1E293B] dark:text-[#94A3B8] dark:hover:bg-[#334155] dark:hover:text-[#F8FAFC]"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-expanded={!collapsed}
                    aria-controls="dashboard-sidebar"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div
                    className={cn(
                        'min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-out',
                        collapsed ? 'lg:max-w-0 lg:opacity-0' : 'max-w-[180px] opacity-100',
                    )}
                >
                    <p className="truncate font-fredoka text-lg font-bold leading-none tracking-wide text-[#0B2340] dark:text-[#F8FAFC]">
                        PAWLSE
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--dashboard-primary)]">
                        {brandLabel}
                    </p>
                </div>
            </div>

            <nav
                className={cn(
                    'w-[280px] flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 pb-4 transition-[padding] duration-300 ease-out',
                    collapsed && 'lg:px-0',
                )}
                aria-label={`${brandLabel} sections`}
            >
                {displayedNavItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <span key={item.href} onClick={onClose}>
                            <DashboardNavLink
                                href={item.href}
                                active={
                                    currentUrl === item.match ||
                                    currentUrl.startsWith(`${item.match}/`)
                                }
                                icon={<Icon className="h-5 w-5" strokeWidth={1.75} />}
                                collapsed={collapsed}
                            >
                                {item.title}
                            </DashboardNavLink>
                        </span>
                    );
                })}
            </nav>

            <div
                className={cn(
                    'w-[280px] border-t border-[#E5E7EB] px-5 py-5 transition-[padding] duration-300 ease-out dark:border-[#1E293B]',
                    collapsed && 'lg:px-0',
                )}
            >
                <div
                    className={cn(
                        'mb-4 flex items-center gap-3 transition-[padding,gap] duration-300 ease-out',
                        collapsed && 'lg:gap-0 lg:px-[calc((5.5rem-2.5rem)/2)]',
                    )}
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] text-sm font-bold text-white">
                        {initials}
                    </div>
                    <div
                        className={cn(
                            'min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-out',
                            collapsed ? 'lg:max-w-0 lg:opacity-0' : 'max-w-[160px] opacity-100',
                        )}
                    >
                        <p className="truncate text-sm font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            {userName}
                        </p>
                        <p className="truncate text-xs text-[#94A3B8]">{roleLabel}</p>
                    </div>
                </div>

                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    title="Sign Out"
                    className={cn(
                        'flex min-h-[44px] w-full items-center gap-3 rounded-xl px-1 py-2 text-sm font-semibold text-[#64748B] transition-[padding,gap,color] duration-300 ease-out hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]',
                        collapsed && 'lg:gap-0 lg:px-[calc((5.5rem-1.25rem)/2)]',
                    )}
                >
                    <LogOut className="h-5 w-5 shrink-0 text-[#94A3B8]" strokeWidth={1.75} />
                    <span
                        className={cn(
                            'overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-out',
                            collapsed ? 'lg:max-w-0 lg:opacity-0' : 'max-w-[120px] opacity-100',
                        )}
                    >
                        Sign Out
                    </span>
                </Link>
            </div>
        </aside>
    );
}

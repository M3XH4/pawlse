import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, Menu, User, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { DashboardNavLink } from '@/components/dashboard/nav-link';
import { useDashboardNotifications } from '@/hooks/use-dashboard-notifications';
import { usePermissions } from '@/hooks/use-permissions';
import { dashboardThemes } from '@/lib/dashboard-theme';
import { preparePushLogout } from '@/lib/push-notifications';
import { getTabNotificationCount } from '@/lib/tab-notification-matcher';
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
    const isFosterParent = Boolean(page.props.is_foster_parent);
    const { can, hasAnyPermission } = usePermissions();

    const { notifications, isRead } = useDashboardNotifications();

    const [badgeStyle, setBadgeStyle] = useState<'count' | 'dot' | 'none'>(() => {
        try {
            const stored = localStorage.getItem('pawlse_sidebar_notif_style');

            if (stored === 'count' || stored === 'dot' || stored === 'none') {
                return stored;
            }
        } catch {
            // Ignore storage read error
        }

        return ((auth.user as { sidebar_notification_style?: 'count' | 'dot' | 'none' })?.sidebar_notification_style) || 'count';
    });

    useEffect(() => {
        const serverPref = (auth.user as { sidebar_notification_style?: 'count' | 'dot' | 'none' })?.sidebar_notification_style;

        if (serverPref && (serverPref === 'count' || serverPref === 'dot' || serverPref === 'none')) {
            setBadgeStyle(serverPref);
        }
    }, [auth.user]);

    useEffect(() => {
        const handleStyleChange = (e: Event) => {
            const detail = (e as CustomEvent<string>).detail;

            if (detail === 'count' || detail === 'dot' || detail === 'none') {
                setBadgeStyle(detail);
            }
        };

        window.addEventListener('pawlse:sidebar-notif-style-changed', handleStyleChange);

        return () => {
            window.removeEventListener('pawlse:sidebar-notif-style-changed', handleStyleChange);
        };
    }, []);

    const isNavItemActive = (match: string) =>
        match === '/account/user' || match === '/account/volunteer'
            ? currentUrl === match
            : currentUrl === match || currentUrl.startsWith(`${match}/`);

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};

        for (const item of navItems) {
            if (item.children?.some((child) => isNavItemActive(child.match))) {
                initial[item.title] = true;
            }
        }

        return initial;
    });

    useEffect(() => {
        for (const item of navItems) {
            if (item.children?.some((child) => isNavItemActive(child.match))) {
                setOpenGroups((prev) => (prev[item.title] ? prev : { ...prev, [item.title]: true }));
            }
        }
    }, [currentUrl, navItems]);

    const toggleGroup = (title: string) => {
        if (collapsed) {
            onToggleCollapsed();
            setOpenGroups((prev) => ({ ...prev, [title]: true }));

            return;
        }

        setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    const displayedNavItems = navItems
        .map((item) => {
            if (theme === 'admin' && item.permission) {
                const allowed = Array.isArray(item.permission)
                    ? hasAnyPermission(item.permission)
                    : can(item.permission);

                if (!allowed) {
                    return null;
                }
            }

            if (item.title === 'My Foster Pets' && !isFosterParent) {
                if (theme === 'volunteer') {
                    return {
                        title: 'Apply to Foster',
                        href: '/account/volunteer/apply-foster',
                        match: '/account/volunteer/apply-foster',
                        icon: item.icon,
                    };
                }

                return null;
            }

            if (item.title === 'Volunteer Status' && theme === 'user' && canSwitchToVolunteer) {
                return null;
            }

            if (item.href === '/volunteer/switch-user') {
                return null;
            }

            return item;
        })
        .filter(Boolean) as typeof navItems;

    if (theme === 'user' && canSwitchToVolunteer) {
        displayedNavItems.push({
            title: 'Switch to Volunteer Dashboard',
            href: '/volunteer/switch',
            match: '/volunteer/switch',
            icon: Zap,
            method: 'post',
            as: 'button',
        });
    }

    if (theme === 'volunteer') {
        displayedNavItems.push({
            title: 'Switch to User Dashboard',
            href: '/volunteer/switch-user',
            match: '/volunteer/switch-user',
            icon: User,
            method: 'post',
            as: 'button',
        });
    }

    return (
        <aside
            id="dashboard-sidebar"
            data-collapsed={collapsed ? 'true' : 'false'}
            className={cn(
                'fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen w-[320px] shrink-0 flex-col overflow-hidden border-r border-[#E5E7EB] bg-white shadow-[4px_0_24px_rgba(15,23,42,0.06)] transition-[width,transform] duration-300 ease-out dark:border-[#1E293B] dark:bg-[#0F172A] dark:shadow-[4px_0_24px_rgba(0,0,0,0.35)] lg:sticky lg:top-0 lg:z-40 lg:h-screen lg:max-h-screen lg:self-start lg:translate-x-0 lg:shadow-[4px_0_24px_rgba(15,23,42,0.04)]',
                open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                collapsed && 'lg:w-[5.5rem]',
            )}
            aria-label={`${brandLabel} navigation`}
        >
            <div
                className={cn(
                    'flex w-[320px] items-center gap-3 px-5 py-6 transition-[padding,gap] duration-300 ease-out',
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
                        collapsed ? 'lg:max-w-0 lg:opacity-0' : 'max-w-[220px] opacity-100',
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
                    'w-[320px] flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 pb-4 transition-[padding] duration-300 ease-out',
                    collapsed && 'lg:px-0',
                )}
                aria-label={`${brandLabel} sections`}
            >
                {displayedNavItems.map((item) => {
                    const Icon = item.icon;
                    const badgeCount = getTabNotificationCount(item, notifications, isRead);

                    if (item.children && item.children.length > 0) {
                        const isGroupActive = item.children.some((child) =>
                            isNavItemActive(child.match),
                        );
                        const isOpen = Boolean(openGroups[item.title]);
                        const showGroupBadge =
                            badgeCount > 0 && badgeStyle !== 'none' && (!isOpen || collapsed);

                        return (
                            <div key={item.title} className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(item.title)}
                                    aria-expanded={isOpen && !collapsed}
                                    title={item.title}
                                    className={cn(
                                        'group relative flex min-h-[44px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-[padding,gap,color,background-color,box-shadow] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0F172A]',
                                        isGroupActive && (!isOpen || collapsed)
                                            ? 'bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] text-white shadow-[0_8px_24px_var(--dashboard-primary-shadow)]'
                                            : isGroupActive
                                              ? 'bg-[#F1F5F9] text-[#0B2340] dark:bg-[#1E293B] dark:text-[#F8FAFC]'
                                              : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0B2340] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]',
                                        collapsed && 'lg:gap-0 lg:px-[calc((5.5rem-1.25rem)/2)]',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-5 w-5 shrink-0 items-center justify-center',
                                            isGroupActive && (!isOpen || collapsed)
                                                ? 'text-white'
                                                : isGroupActive
                                                  ? 'text-[var(--dashboard-primary)]'
                                                  : 'text-[#94A3B8] group-hover:text-[#0B2340] dark:group-hover:text-[#F8FAFC]',
                                        )}
                                    >
                                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                                    </span>
                                    <span
                                        className={cn(
                                            'flex-1 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-out',
                                            collapsed ? 'lg:max-w-0 lg:opacity-0' : 'max-w-[190px] opacity-100',
                                            showGroupBadge && !collapsed && 'pr-6',
                                        )}
                                    >
                                        {item.title}
                                    </span>
                                    {!collapsed && (
                                        <ChevronDown
                                            className={cn(
                                                'h-4 w-4 shrink-0 transition-transform duration-200',
                                                isOpen ? 'rotate-180' : 'rotate-0',
                                                isGroupActive && !isOpen
                                                    ? 'text-white'
                                                    : 'text-[#94A3B8]',
                                            )}
                                            strokeWidth={2}
                                        />
                                    )}
                                    {showGroupBadge && (
                                        badgeStyle === 'count' ? (
                                            <span
                                                className={cn(
                                                    'absolute flex items-center justify-center rounded-full font-bold shadow-xs transition-all duration-200',
                                                    collapsed
                                                        ? 'top-1.5 right-3.5 h-4 min-w-4 px-1 text-[9px]'
                                                        : 'top-2.5 right-9 h-5 min-w-5 px-1.5 text-[10px]',
                                                    isGroupActive && (!isOpen || collapsed)
                                                        ? 'bg-white font-extrabold text-rose-600 ring-1 ring-white/40'
                                                        : 'bg-rose-500 text-white ring-2 ring-white dark:ring-[#0F172A]',
                                                )}
                                                title={`${badgeCount} unread notification${badgeCount > 1 ? 's' : ''}`}
                                                aria-label={`${badgeCount} unread notification${badgeCount > 1 ? 's' : ''}`}
                                            >
                                                {badgeCount > 99 ? '99+' : badgeCount}
                                            </span>
                                        ) : (
                                            <span
                                                className={cn(
                                                    'absolute animate-pulse rounded-full ring-2 transition-all duration-200',
                                                    collapsed
                                                        ? 'top-2 right-4 h-2 w-2'
                                                        : 'top-3 right-10 h-2.5 w-2.5',
                                                    isGroupActive && (!isOpen || collapsed)
                                                        ? 'bg-white ring-white/50'
                                                        : 'bg-rose-500 ring-white dark:ring-[#0F172A]',
                                                )}
                                                title={`${badgeCount} unread notification${badgeCount > 1 ? 's' : ''}`}
                                                aria-label="New notifications available"
                                            />
                                        )
                                    )}
                                </button>

                                {isOpen && !collapsed && (
                                    <div className="ml-6 space-y-1 border-l-2 border-[#E5E7EB] pl-2.5 py-1 dark:border-[#1E293B]">
                                        {item.children.map((child) => {
                                            const ChildIcon = child.icon;
                                            const childBadgeCount = getTabNotificationCount(
                                                child,
                                                notifications,
                                                isRead,
                                            );

                                            return (
                                                <span key={child.href} onClick={onClose} className="block">
                                                    <DashboardNavLink
                                                        href={child.href}
                                                        method={child.method}
                                                        as={child.as}
                                                        active={isNavItemActive(child.match)}
                                                        icon={<ChildIcon className="h-4 w-4" strokeWidth={1.75} />}
                                                        collapsed={false}
                                                        badgeStyle={badgeStyle}
                                                        badgeCount={childBadgeCount}
                                                    >
                                                        {child.title}
                                                    </DashboardNavLink>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <span key={item.href} onClick={onClose}>
                            <DashboardNavLink
                                href={item.href}
                                method={item.method}
                                as={item.as}
                                active={isNavItemActive(item.match)}
                                icon={<Icon className="h-5 w-5" strokeWidth={1.75} />}
                                collapsed={collapsed}
                                badgeStyle={badgeStyle}
                                badgeCount={badgeCount}
                            >
                                {item.title}
                            </DashboardNavLink>
                        </span>
                    );
                })}
            </nav>

            <div
                className={cn(
                    'w-[320px] border-t border-[#E5E7EB] px-5 py-5 transition-[padding] duration-300 ease-out dark:border-[#1E293B]',
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
                            collapsed ? 'lg:max-w-0 lg:opacity-0' : 'max-w-[200px] opacity-100',
                        )}
                    >
                        <p className="truncate text-sm font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            {userName}
                        </p>
                        <p className="truncate text-xs text-[#94A3B8]">{roleLabel}</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={async () => {
                        await preparePushLogout();
                        router.post(logout().url);
                    }}
                    title="Sign Out"
                    className={cn(
                        'flex min-h-[44px] w-full items-center gap-3 rounded-xl px-1 py-2 text-sm font-semibold text-[#64748B] transition-[padding,gap,color] duration-300 ease-out hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] cursor-pointer',
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
                </button>
            </div>
        </aside>
    );
}

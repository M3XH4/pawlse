import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function DashboardNavLink({
    href,
    active,
    icon,
    children,
    collapsed = false,
    method = 'get',
    as,
    badgeStyle = 'count',
    badgeCount = 0,
}: {
    href: string;
    active: boolean;
    icon: ReactNode;
    children: ReactNode;
    collapsed?: boolean;
    method?: 'get' | 'post';
    as?: 'a' | 'button';
    badgeStyle?: 'count' | 'dot' | 'none';
    badgeCount?: number;
}) {
    const hasBadge = badgeCount > 0 && badgeStyle !== 'none';

    return (
        <Link
            href={href}
            method={method}
            as={as || (method === 'post' ? 'button' : undefined)}
            title={typeof children === 'string' ? children : undefined}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'group relative flex min-h-[44px] items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-[padding,gap,color,background-color,box-shadow] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0F172A]',
                active
                    ? 'bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] text-white shadow-[0_8px_24px_var(--dashboard-primary-shadow)]'
                    : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0B2340] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]',
                collapsed && 'lg:gap-0 lg:px-[calc((5.5rem-1.25rem)/2)]',
            )}
        >
            <span
                className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center',
                    active
                        ? 'text-white'
                        : 'text-[#94A3B8] group-hover:text-[#0B2340] dark:group-hover:text-[#F8FAFC]',
                )}
            >
                {icon}
            </span>
            <span
                className={cn(
                    'overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-out',
                    collapsed ? 'lg:max-w-0 lg:opacity-0' : 'max-w-[170px] opacity-100',
                    hasBadge && !collapsed && 'pr-4',
                )}
            >
                {children}
            </span>

            {hasBadge && (
                badgeStyle === 'count' ? (
                    <span
                        className={cn(
                            'absolute flex items-center justify-center rounded-full font-bold shadow-xs transition-all duration-200',
                            collapsed
                                ? 'top-1.5 right-3.5 h-4 min-w-4 px-1 text-[9px]'
                                : 'top-2.5 right-3 h-5 min-w-5 px-1.5 text-[10px]',
                            active
                                ? 'bg-white text-rose-600 font-extrabold ring-1 ring-white/40'
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
                            'absolute rounded-full ring-2 transition-all duration-200 animate-pulse',
                            collapsed
                                ? 'top-2 right-4 h-2 w-2'
                                : 'top-3 right-3.5 h-2.5 w-2.5',
                            active
                                ? 'bg-white ring-white/50'
                                : 'bg-rose-500 ring-white dark:ring-[#0F172A]',
                        )}
                        title={`${badgeCount} unread notification${badgeCount > 1 ? 's' : ''}`}
                        aria-label="New notifications available"
                    />
                )
            )}
        </Link>
    );
}

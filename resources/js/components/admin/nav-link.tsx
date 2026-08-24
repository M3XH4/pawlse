import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export function AdminNavLink({
    href,
    active,
    icon,
    children,
    collapsed = false,
}: {
    href: string;
    active: boolean;
    icon: ReactNode;
    children: ReactNode;
    collapsed?: boolean;
}) {
    return (
        <Link
            href={href}
            title={typeof children === 'string' ? children : undefined}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'group flex min-h-[44px] items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-[padding,gap,color,background-color,box-shadow] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0F172A]',
                active
                    ? 'bg-gradient-to-r from-[#FF8A00] to-[#FF6B35] text-white shadow-[0_8px_24px_rgba(255,138,0,0.35)]'
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
                    collapsed ? 'lg:max-w-0 lg:opacity-0' : 'max-w-[180px] opacity-100',
                )}
            >
                {children}
            </span>
        </Link>
    );
}

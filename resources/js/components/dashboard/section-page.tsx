import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function DashboardCard({
    children,
    className,
    onClick,
    ...props
}: {
    children: ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLElement>;
} & React.HTMLAttributes<HTMLElement>) {
    return (
        <section
            onClick={onClick}
            className={cn(
                'min-w-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:border-[#1E293B] dark:bg-[#111827] dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)]',
                className,
            )}
            {...props}
        >
            {children}
        </section>
    );
}

export function DashboardSectionPage({
    title,
    description,
    badge,
    children,
}: {
    title: string;
    description: string;
    badge?: ReactNode;
    children?: ReactNode;
}) {
    return (
        <>
            <Head title={title} />

            <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 overflow-x-clip">
                <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_auto] sm:items-start sm:gap-x-6 sm:gap-y-1.5">
                    <h2 className="min-w-0 font-fredoka text-2xl sm:text-3xl font-bold tracking-tight text-[#0B2340] dark:text-[#F8FAFC]">
                        {title}
                    </h2>
                    {badge && (
                        <div className="order-3 pt-1 sm:order-none sm:pt-0 shrink-0 sm:row-span-2 sm:self-start">
                            {badge}
                        </div>
                    )}
                    <p className="order-2 sm:order-none text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                        {description}
                    </p>
                </div>

                {children ?? (
                    <DashboardCard>
                        <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                            No records are available in this section yet.
                        </p>
                    </DashboardCard>
                )}
            </div>
        </>
    );
}

export function DashboardMetricBadge({
    icon,
    label,
}: {
    icon?: ReactNode;
    label: string;
}) {
    return (
        <div className="inline-flex min-h-9 sm:min-h-10 items-center gap-1.5 sm:gap-2 self-start whitespace-nowrap shrink-0 rounded-full bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] px-3.5 sm:px-4 py-1 text-xs sm:text-sm font-bold text-white shadow-[0_6px_18px_var(--dashboard-primary-shadow)] [&>svg]:shrink-0">
            {icon}
            <span>{label}</span>
        </div>
    );
}

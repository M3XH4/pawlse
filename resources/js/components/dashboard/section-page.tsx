import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function DashboardCard({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                'rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:border-[#1E293B] dark:bg-[#111827] dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)]',
                className,
            )}
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

            <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="font-fredoka text-3xl font-bold tracking-tight text-[#0B2340] dark:text-[#F8FAFC]">
                            {title}
                        </h2>
                        <p className="mt-2 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                            {description}
                        </p>
                    </div>
                    {badge}
                </div>

                {children ?? (
                    <DashboardCard>
                        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                            This section is ready for your latest PAWLSE records.
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
        <div className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] px-4 text-sm font-bold text-white shadow-[0_8px_22px_var(--dashboard-primary-shadow)]">
            {icon}
            <span>{label}</span>
        </div>
    );
}

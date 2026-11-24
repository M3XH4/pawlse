import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function KpiGridSkeleton({
    count = 4,
    className,
}: {
    count?: number;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
                className,
            )}
            aria-busy="true"
            aria-label="Loading metrics"
        >
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                >
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-9 w-9 rounded-xl" />
                    </div>
                    <Skeleton className="mt-4 h-8 w-28" />
                    <Skeleton className="mt-2 h-3 w-36" />
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton({
    className,
    heightClass = 'h-[300px]',
}: {
    className?: string;
    heightClass?: string;
}) {
    return (
        <div
            className={cn(
                'w-full rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900',
                className,
            )}
            aria-busy="true"
            aria-label="Loading chart"
        >
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
            <div className={cn('flex items-end gap-3 pt-4', heightClass)}>
                {[45, 70, 55, 85, 60, 92, 68, 78, 52, 88].map((pct, index) => (
                    <Skeleton
                        key={index}
                        className="flex-1 rounded-t-lg"
                        style={{ height: `${pct}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

export function TableSkeleton({
    rows = 6,
    columns = 5,
    className,
}: {
    rows?: number;
    columns?: number;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900',
                className,
            )}
            aria-busy="true"
            aria-label="Loading table"
        >
            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <Skeleton key={colIdx} className="h-3.5 w-3/4" />
                    ))}
                </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: rows }).map((_, rowIdx) => (
                    <div
                        key={rowIdx}
                        className="grid items-center gap-4 px-5 py-4"
                        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                    >
                        {Array.from({ length: columns }).map((_, colIdx) => (
                            <Skeleton
                                key={colIdx}
                                className={cn(
                                    'h-4',
                                    colIdx === 0 ? 'w-4/5' : 'w-2/3',
                                )}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CardGridSkeleton({
    count = 6,
    columnsClass = 'sm:grid-cols-2 lg:grid-cols-3',
    className,
}: {
    count?: number;
    columnsClass?: string;
    className?: string;
}) {
    return (
        <div
            className={cn('grid gap-6', columnsClass, className)}
            aria-busy="true"
            aria-label="Loading cards"
        >
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
                >
                    <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    <div className="space-y-3 p-5">
                        <div className="flex items-center justify-between gap-2">
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-3/4" />
                        <div className="pt-2 flex gap-2">
                            <Skeleton className="h-9 flex-1 rounded-xl" />
                            <Skeleton className="h-9 w-24 rounded-xl" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ListTimelineSkeleton({
    rows = 5,
    className,
}: {
    rows?: number;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'divide-y divide-slate-100 rounded-2xl border border-slate-200/70 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900',
                className,
            )}
            aria-busy="true"
            aria-label="Loading activity list"
        >
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="flex items-start gap-3.5 p-4">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function DashboardHeaderSkeleton() {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
    );
}

export function FilterToolbarSkeleton() {
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="h-10 min-w-[220px] flex-1 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
    );
}

export function OverviewPageSkeleton() {
    return (
        <div className="space-y-6 py-2" aria-busy="true" aria-label="Loading overview">
            <DashboardHeaderSkeleton />
            <KpiGridSkeleton count={4} />
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="mt-2 h-3 w-64" />
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-100 p-4 dark:border-slate-800"
                                >
                                    <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-44" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <ListTimelineSkeleton rows={5} />
                </div>
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <Skeleton className="h-5 w-40" />
                        <div className="mt-5 space-y-4">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-36" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                    <Skeleton className="h-2 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <Skeleton className="h-5 w-36" />
                        <div className="mt-4 space-y-3">
                            <Skeleton className="h-3.5 w-full" />
                            <Skeleton className="h-3.5 w-5/6" />
                            <Skeleton className="h-3.5 w-4/5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AnalyticsPageSkeleton() {
    return (
        <div className="space-y-6 py-2" aria-busy="true" aria-label="Loading analytics">
            <DashboardHeaderSkeleton />
            <KpiGridSkeleton count={4} />
            <ChartSkeleton heightClass="h-72" />
            <div className="grid gap-6 lg:grid-cols-2">
                <ChartSkeleton heightClass="h-56" />
                <ChartSkeleton heightClass="h-56" />
            </div>
        </div>
    );
}

export function CardPageSkeleton() {
    return (
        <div className="space-y-6 py-2" aria-busy="true" aria-label="Loading cards">
            <DashboardHeaderSkeleton />
            <FilterToolbarSkeleton />
            <CardGridSkeleton count={6} />
        </div>
    );
}

export function NotificationsPageSkeleton() {
    return (
        <div className="space-y-6 py-2" aria-busy="true" aria-label="Loading notifications">
            <DashboardHeaderSkeleton />
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-8 w-24 rounded-full" />
                ))}
            </div>
            <ListTimelineSkeleton rows={7} />
        </div>
    );
}

export function FormPageSkeleton() {
    return (
        <div className="space-y-6 py-2" aria-busy="true" aria-label="Loading settings">
            <DashboardHeaderSkeleton />
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <Skeleton className="h-5 w-44" />
                        <Skeleton className="mt-2 h-3 w-64" />
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="space-y-2">
                                    <Skeleton className="h-3.5 w-24" />
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Skeleton className="h-10 w-32 rounded-xl" />
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <Skeleton className="h-5 w-36" />
                    <div className="mt-4 space-y-3">
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function DashboardPageSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('space-y-6 py-2', className)} aria-busy="true" aria-label="Loading page">
            <DashboardHeaderSkeleton />
            <FilterToolbarSkeleton />
            <TableSkeleton rows={6} columns={5} />
        </div>
    );
}

/**
 * Selects a skeleton layout that mirrors the target dashboard route being navigated to.
 */
export function DashboardRouteSkeleton({ targetPath }: { targetPath: string | null }) {
    const path = (targetPath || '').toLowerCase();

    if (path.endsWith('/dashboard')) {
        return <OverviewPageSkeleton />;
    }

    if (path.includes('reports-analytics') || path.includes('advanced-analytics')) {
        return <AnalyticsPageSkeleton />;
    }

    if (path.includes('/notifications')) {
        return <NotificationsPageSkeleton />;
    }

    if (
        path.includes('account-settings') ||
        path.includes('system-settings') ||
        path.includes('ai-configuration') ||
        path.includes('security-access') ||
        path.includes('backup-restore') ||
        path.includes('/profile') ||
        path.includes('volunteer-status') ||
        path.includes('help-desk')
    ) {
        return <FormPageSkeleton />;
    }

    if (
        path.includes('bookmark') ||
        path.includes('certificates') ||
        path.includes('achievements') ||
        path.includes('joined-events') ||
        path.includes('stories') ||
        path.includes('foster-care') ||
        path.includes('my-foster-pets') ||
        path.includes('/events') ||
        path.includes('community-honors') ||
        path.includes('partners') ||
        path.includes('resources') ||
        path.includes('blog-management')
    ) {
        return <CardPageSkeleton />;
    }

    return <DashboardPageSkeleton />;
}

export function FilteredContentSkeleton({
    isLoading,
    variant = 'table',
    rows = 6,
    columns = 5,
    cardCount = 6,
    columnsClass,
    className,
    children,
}: {
    isLoading: boolean;
    variant?: 'table' | 'cards' | 'list' | 'analytics';
    rows?: number;
    columns?: number;
    cardCount?: number;
    columnsClass?: string;
    className?: string;
    children: React.ReactNode;
}) {
    if (!isLoading) {
        return <>{children}</>;
    }

    if (variant === 'cards') {
        return <CardGridSkeleton count={cardCount} columnsClass={columnsClass} className={className} />;
    }

    if (variant === 'list') {
        return <ListTimelineSkeleton rows={rows} className={className} />;
    }

    if (variant === 'analytics') {
        return (
            <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
        );
    }

    return <TableSkeleton rows={rows} columns={columns} className={className} />;
}

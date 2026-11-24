import { Deferred, Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    BarChart3,
    Calendar,
    ChevronRight,
    ClipboardList,
    FileText,
    Gift,
    Heart,
    PlusCircle,
    Printer,
    Sparkles,
    UserCheck,
    Users,
} from 'lucide-react';
import { AdminCard } from '@/components/admin/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiGridSkeleton, ListTimelineSkeleton } from '@/components/ui/skeleton-presets';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import {
    rescueManagement,
    adoptionManagement,
    donationMonitoring,
    volunteerManagement,
    events,
    aiValidation,
    reportsAnalytics as adminReportsRoute,
} from '@/routes/account/admin';
import reportsAnalytics from '@/routes/account/admin/reports-analytics';

type Stats = {
    rescues: { total: number; pending: number };
    adoptions: { total: number; pending: number };
    donations: { total_amount: number; in_kind_count: number };
    volunteers: { active: number; pending: number };
};

type RecentActivity = {
    id: string;
    type: 'rescue' | 'adoption' | 'donation' | 'volunteer';
    description: string;
    time: string;
    url: string;
    status: string;
};

type DashboardProps = {
    stats?: Stats;
    recentActivities?: RecentActivity[];
};

export default function AdminDashboard({ stats, recentActivities }: DashboardProps) {
    const { auth } = usePage().props;
    const user = auth.user;
    const { can } = usePermissions();
    const canViewAnalytics = can('analytics.view');
    const canExportAnalytics = can('analytics.export');

    const quickActions = [
        {
            title: 'Rescue Management',
            description: 'Assign volunteers and update status',
            href: rescueManagement.url(),
            icon: FileText,
            color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            pending: stats?.rescues.pending,
        },
        {
            title: 'Adoption Applications',
            description: 'Review pending adoption requests',
            href: adoptionManagement.url(),
            icon: Heart,
            color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
            pending: stats?.adoptions.pending,
        },
        {
            title: 'Verify Donations',
            description: 'Monitor cash and verify in-kind items',
            href: donationMonitoring.url(),
            icon: Gift,
            color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
            title: 'Volunteer Approvals',
            description: 'Review and approve new volunteers',
            href: volunteerManagement.url(),
            icon: UserCheck,
            color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
            pending: stats?.volunteers.pending,
        },
        {
            title: 'Event Management',
            description: 'Post and update events/schedules',
            href: events.url(),
            icon: Calendar,
            color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        },
        {
            title: 'AI Validation Panel',
            description: 'Verify reports using AI models',
            href: aiValidation.url(),
            icon: Sparkles,
            color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
        },
    ];

    // Helper to render activity item icon
    const getActivityIcon = (type: RecentActivity['type']) => {
        switch (type) {
            case 'rescue':
                return <FileText className="h-4 w-4" />;
            case 'adoption':
                return <Heart className="h-4 w-4" />;
            case 'donation':
                return <Gift className="h-4 w-4" />;
            case 'volunteer':
                return <Users className="h-4 w-4" />;
        }
    };

    const getActivityColor = (type: RecentActivity['type']) => {
        switch (type) {
            case 'rescue':
                return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
            case 'adoption':
                return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400';
            case 'donation':
                return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
            case 'volunteer':
                return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
        }
    };

    return (
        <>
            <Head title="Dashboard Overview" />

            <div className="space-y-6 sm:space-y-8 min-w-0 overflow-x-clip">
                {/* Greeting Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-fredoka text-3xl font-bold tracking-tight text-[#0B2340] dark:text-[#F8FAFC]">
                            Hello, {user?.name ?? 'Admin'}!
                        </h1>
                        <p className="mt-2 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                            Here is what is happening across the PAWLSE network today.
                        </p>
                    </div>
                    {(canViewAnalytics || canExportAnalytics) && (
                        <div className="flex flex-wrap items-center gap-2.5">
                            {canViewAnalytics && (
                                <Link
                                    href={adminReportsRoute.url()}
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-[#0B2340] shadow-xs transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                                >
                                    <BarChart3 className="h-4 w-4 text-teal-600" />
                                    Reports &amp; Analytics
                                </Link>
                            )}
                            {canExportAnalytics && (
                                <a
                                    href={reportsAnalytics.pdf.url({ query: { autoprint: 1 } })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:opacity-95"
                                >
                                    <Printer className="h-4 w-4" />
                                    Export PDF Report
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Metrics Grid */}
                <Deferred data="stats" fallback={<KpiGridSkeleton count={4} />}>
                    {stats && (
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 min-w-0">
                            {/* Rescues Metric */}
                            <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 truncate">Rescues</span>
                                    <div className="rounded-xl bg-emerald-50 p-2 sm:p-2.5 text-emerald-600 shrink-0 dark:bg-emerald-950/20 dark:text-emerald-400">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                </div>
                                <div className="mt-2.5 sm:mt-4">
                                    <h3 className="font-fredoka text-2xl sm:text-3xl font-bold text-paw-navy dark:text-white">
                                        {stats.rescues.total}
                                    </h3>
                                    <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs">
                                        {stats.rescues.pending > 0 ? (
                                            <>
                                                <span className="rounded-full bg-rose-50 px-2 py-0.5 font-bold text-rose-600 whitespace-nowrap dark:bg-rose-950/20 dark:text-rose-400">
                                                    {stats.rescues.pending} Pending
                                                </span>
                                                <span className="text-gray-400 leading-tight">requires attention</span>
                                            </>
                                        ) : (
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                All rescues assigned
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Adoptions Metric */}
                            <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 truncate">Adoptions</span>
                                    <div className="rounded-xl bg-rose-50 p-2 sm:p-2.5 text-rose-600 shrink-0 dark:bg-rose-950/20 dark:text-rose-400">
                                        <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                </div>
                                <div className="mt-2.5 sm:mt-4">
                                    <h3 className="font-fredoka text-2xl sm:text-3xl font-bold text-paw-navy dark:text-white">
                                        {stats.adoptions.total}
                                    </h3>
                                    <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs">
                                        {stats.adoptions.pending > 0 ? (
                                            <>
                                                <span className="rounded-full bg-rose-50 px-2 py-0.5 font-bold text-rose-600 whitespace-nowrap dark:bg-rose-950/20 dark:text-rose-400">
                                                    {stats.adoptions.pending} Pending
                                                </span>
                                                <span className="text-gray-400 leading-tight">applications</span>
                                            </>
                                        ) : (
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                No pending adoptions
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Donations Metric */}
                            <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 truncate">Donations (PHP)</span>
                                    <div className="rounded-xl bg-amber-50 p-2 sm:p-2.5 text-amber-600 shrink-0 dark:bg-amber-950/20 dark:text-amber-400">
                                        <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                </div>
                                <div className="mt-2.5 sm:mt-4">
                                    <h3 className="font-fredoka text-lg sm:text-2xl font-bold text-paw-navy dark:text-white truncate">
                                        ₱{stats.donations.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </h3>
                                    <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs">
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-600 whitespace-nowrap dark:bg-amber-950/20 dark:text-amber-400">
                                            {stats.donations.in_kind_count} Verified In-Kind
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Volunteers Metric */}
                            <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 truncate">Volunteers</span>
                                    <div className="rounded-xl bg-blue-50 p-2 sm:p-2.5 text-blue-600 shrink-0 dark:bg-blue-950/20 dark:text-blue-400">
                                        <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                </div>
                                <div className="mt-2.5 sm:mt-4">
                                    <h3 className="font-fredoka text-2xl sm:text-3xl font-bold text-paw-navy dark:text-white">
                                        {stats.volunteers.active}
                                    </h3>
                                    <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs">
                                        {stats.volunteers.pending > 0 ? (
                                            <>
                                                <span className="rounded-full bg-rose-50 px-2 py-0.5 font-bold text-rose-600 whitespace-nowrap dark:bg-rose-950/20 dark:text-rose-400">
                                                    {stats.volunteers.pending} Pending
                                                </span>
                                                <span className="text-gray-400 font-medium leading-tight">applications</span>
                                            </>
                                        ) : (
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                No pending volunteers
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Deferred>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 min-w-0 gap-6 lg:grid-cols-3">
                    {/* Left Column: Quick Actions & Operations */}
                    <div className="min-w-0 space-y-6 lg:col-span-2">
                        {/* Quick Actions Panel */}
                        <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div>
                                <h2 className="font-fredoka text-xl font-bold tracking-wide text-paw-navy dark:text-white">
                                    Quick Operations
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Primary actions to manage shelter tasks and reports
                                </p>
                            </div>
                            <hr className="my-4 border-gray-100 dark:border-slate-800" />
                            <div className="grid grid-cols-1 min-w-0 gap-3 sm:gap-4 sm:grid-cols-2">
                                {quickActions.map((action, i) => (
                                    <Link
                                        key={i}
                                        href={action.href}
                                        className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-gray-150 p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-250 hover:bg-gray-50/50 dark:border-slate-900 dark:hover:border-slate-750 dark:hover:bg-slate-800/40"
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <div className={cn('rounded-xl p-2.5 sm:p-3 shrink-0', action.color)}>
                                                <action.icon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-bold text-paw-navy dark:text-white flex items-center gap-1.5 flex-wrap">
                                                    <span className="truncate">{action.title}</span>
                                                    {action.pending && action.pending > 0 ? (
                                                        <span
                                                            title={`${action.pending} pending items awaiting review`}
                                                            className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-black text-white"
                                                        >
                                                            {action.pending}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {action.description}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity Timeline */}
                        <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-fredoka text-xl font-bold tracking-wide text-paw-navy dark:text-white">
                                        Recent Activity
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Real-time activities across all departments
                                    </p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    Timeline Feed
                                </span>
                            </div>
                            <hr className="my-4 border-gray-100 dark:border-slate-800" />
                            
                            <Deferred data="recentActivities" fallback={<ListTimelineSkeleton rows={5} className="border-0 shadow-none" />}>
                                {!recentActivities || recentActivities.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-gray-500">
                                        No activity logged in the database yet.
                                    </div>
                                ) : (
                                    <div className="flow-root">
                                        <ul className="relative">
                                            {recentActivities.slice(0, 5).map((activity, idx, arr) => {
                                                const isLast = idx === arr.length - 1;

                                                return (
                                                    <li key={activity.id} className="relative">
                                                        {!isLast && (
                                                            <span
                                                                className="absolute left-[17px] top-[34px] -bottom-[8px] w-0.5 -translate-x-1/2 bg-gray-100 dark:bg-slate-800"
                                                                aria-hidden="true"
                                                            />
                                                        )}
                                                        <div className={cn('relative flex items-center space-x-3.5', !isLast && 'pb-6')}>
                                                            <div className="relative z-10 flex shrink-0">
                                                                <span className={cn('flex h-8.5 w-8.5 items-center justify-center rounded-xl ring-4 ring-white dark:ring-slate-900 shadow-xs', getActivityColor(activity.type))}>
                                                                    {getActivityIcon(activity.type)}
                                                                </span>
                                                            </div>
                                                            <div className="flex min-w-0 flex-1 items-center justify-between space-x-4">
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                        {activity.description}
                                                                    </p>
                                                                </div>
                                                                <div className="shrink-0 whitespace-nowrap text-right text-xs text-gray-400 dark:text-gray-500">
                                                                    <time>{activity.time}</time>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </Deferred>
                        </div>
                    </div>

                    {/* Right Column: Platform Summaries & Stats */}
                    <div className="min-w-0 space-y-6">
                        {/* Shelter Statistics Overview */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div>
                                <h2 className="font-fredoka text-xl font-bold tracking-wide text-paw-navy dark:text-white">
                                    Platform Breakdown
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Important metrics summary
                                </p>
                            </div>
                            <hr className="my-4 border-gray-100 dark:border-slate-800" />
                            
                            <Deferred
                                data="stats"
                                fallback={
                                    <div className="space-y-4">
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
                                }
                            >
                                {stats && (
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span className="text-gray-600 dark:text-gray-400">Rescue Status: Assigned / Total</span>
                                                <span className="text-emerald-600 dark:text-emerald-400">
                                                    {stats.rescues.total - stats.rescues.pending} / {stats.rescues.total}
                                                </span>
                                            </div>
                                            <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-slate-900">
                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                                                    style={{
                                                        width: `${stats.rescues.total > 0 ? ((stats.rescues.total - stats.rescues.pending) / stats.rescues.total) * 100 : 0}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span className="text-gray-600 dark:text-gray-400">Adoptions: Completed / Applied</span>
                                                <span className="text-rose-600 dark:text-rose-400">
                                                    {stats.adoptions.total - stats.adoptions.pending} / {stats.adoptions.total}
                                                </span>
                                            </div>
                                            <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-slate-900">
                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
                                                    style={{
                                                        width: `${stats.adoptions.total > 0 ? ((stats.adoptions.total - stats.adoptions.pending) / stats.adoptions.total) * 100 : 0}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span className="text-gray-600 dark:text-gray-400">Volunteers: Active / Total Applied</span>
                                                <span className="text-blue-600 dark:text-blue-400">
                                                    {stats.volunteers.active} / {stats.volunteers.active + stats.volunteers.pending}
                                                </span>
                                            </div>
                                            <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-slate-900">
                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                                                    style={{
                                                        width: `${(stats.volunteers.active + stats.volunteers.pending) > 0 ? (stats.volunteers.active / (stats.volunteers.active + stats.volunteers.pending)) * 100 : 0}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Deferred>
                        </div>

                        {/* Quick Tips or Reminders */}
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-6 dark:border-emerald-950/20 dark:bg-emerald-950/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold">
                                    <AlertCircle className="h-5 w-5" />
                                    <h3 className="font-fredoka text-lg font-bold">Operational Tips</h3>
                                </div>
                                <span className="rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    Protocols
                                </span>
                            </div>
                            <hr className="my-3.5 border-emerald-200/50 dark:border-emerald-950/40" />
                            <ul className="space-y-3 text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    <div>
                                        <strong className="text-emerald-950 dark:text-emerald-200">Rescue Cases:</strong> Check location coordinates and coordinate with volunteers nearby.
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    <div>
                                        <strong className="text-emerald-950 dark:text-emerald-200">Adoptions:</strong> Make sure emergency contact phone numbers are active before schedule approvals.
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    <div>
                                        <strong className="text-emerald-950 dark:text-emerald-200">Inventory Check:</strong> Verify dropped off items in In-Kind monitoring and update stock levels.
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    <div>
                                        <strong className="text-emerald-950 dark:text-emerald-200">Volunteer Dispatch:</strong> Confirm field availability and log completed mission hours post-event.
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    <div>
                                        <strong className="text-emerald-950 dark:text-emerald-200">AI Validation:</strong> Review high-confidence stray sightings and merge duplicate citizen reports.
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    <div>
                                        <strong className="text-emerald-950 dark:text-emerald-200">Data Integrity:</strong> Regularly export monthly summary backups and review pending audits.
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

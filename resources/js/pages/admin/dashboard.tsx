import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Calendar,
    ChevronRight,
    ClipboardList,
    FileText,
    Gift,
    Heart,
    PlusCircle,
    Sparkles,
    UserCheck,
    Users,
} from 'lucide-react';
import { AdminCard } from '@/components/admin/card';
import { cn } from '@/lib/utils';
import {
    rescueManagement,
    adoptionManagement,
    donationMonitoring,
    volunteerManagement,
    events,
    aiValidation,
} from '@/routes/account/admin';

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
    stats: Stats;
    recentActivities: RecentActivity[];
};

export default function AdminDashboard({ stats, recentActivities }: DashboardProps) {
    const { auth } = usePage().props;
    const user = auth.user;

    const quickActions = [
        {
            title: 'Rescue Management',
            description: 'Assign volunteers and update status',
            href: rescueManagement.url(),
            icon: FileText,
            color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            pending: stats.rescues.pending,
        },
        {
            title: 'Adoption Applications',
            description: 'Review pending adoption requests',
            href: adoptionManagement.url(),
            icon: Heart,
            color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
            pending: stats.adoptions.pending,
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
            pending: stats.volunteers.pending,
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

            <div className="space-y-8">
                {/* Greeting Section */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-fredoka text-3xl font-black tracking-wide text-paw-navy dark:text-white">
                            Hello, {user?.name ?? 'Admin'}!
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Here is what is happening across the PAWLSE network today.
                        </p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Rescues Metric */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Rescues</span>
                            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                                <FileText className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-fredoka text-3xl font-bold text-paw-navy dark:text-white">
                                {stats.rescues.total}
                            </h3>
                            <div className="mt-2 flex items-center gap-1.5 text-xs">
                                {stats.rescues.pending > 0 ? (
                                    <>
                                        <span className="rounded-full bg-rose-50 px-2 py-0.5 font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                                            {stats.rescues.pending} Pending
                                        </span>
                                        <span className="text-gray-400">requires attention</span>
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
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Adoptions</span>
                            <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                                <Heart className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-fredoka text-3xl font-bold text-paw-navy dark:text-white">
                                {stats.adoptions.total}
                            </h3>
                            <div className="mt-2 flex items-center gap-1.5 text-xs">
                                {stats.adoptions.pending > 0 ? (
                                    <>
                                        <span className="rounded-full bg-rose-50 px-2 py-0.5 font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                                            {stats.adoptions.pending} Pending
                                        </span>
                                        <span className="text-gray-400">applications</span>
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
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Donations (PHP)</span>
                            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                                <Gift className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-fredoka text-2xl font-bold text-paw-navy dark:text-white">
                                ₱{stats.donations.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <div className="mt-2 flex items-center gap-1.5 text-xs">
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                                    {stats.donations.in_kind_count} Verified In-Kind
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Volunteers Metric */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Volunteers</span>
                            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-fredoka text-3xl font-bold text-paw-navy dark:text-white">
                                {stats.volunteers.active}
                            </h3>
                            <div className="mt-2 flex items-center gap-1.5 text-xs">
                                {stats.volunteers.pending > 0 ? (
                                    <>
                                        <span className="rounded-full bg-rose-50 px-2 py-0.5 font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                                            {stats.volunteers.pending} Pending
                                        </span>
                                        <span className="text-gray-400 font-medium">applications</span>
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

                {/* Main Content Layout */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column: Quick Actions & Operations */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Quick Actions Panel */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div>
                                <h2 className="font-fredoka text-xl font-bold tracking-wide text-paw-navy dark:text-white">
                                    Quick Operations
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Primary actions to manage shelter tasks and reports
                                </p>
                            </div>
                            <hr className="my-4 border-gray-100 dark:border-slate-800" />
                            <div className="grid gap-4 sm:grid-cols-2">
                                {quickActions.map((action, i) => (
                                    <Link
                                        key={i}
                                        href={action.href}
                                        className="group flex items-center justify-between rounded-2xl border border-gray-150 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-250 hover:bg-gray-50/50 dark:border-slate-850 dark:hover:border-slate-750 dark:hover:bg-slate-800/40"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn('rounded-xl p-3', action.color)}>
                                                <action.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-paw-navy dark:text-white flex items-center gap-1.5">
                                                    {action.title}
                                                    {action.pending && action.pending > 0 ? (
                                                        <span className="flex h-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white">
                                                            {action.pending}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {action.description}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity Timeline */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
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
                            
                            {recentActivities.length === 0 ? (
                                <div className="py-12 text-center text-sm text-gray-500">
                                    No activity logged in the database yet.
                                </div>
                            ) : (
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        {recentActivities.map((activity, idx) => (
                                            <li key={activity.id}>
                                                <div className="relative pb-8">
                                                    {idx !== recentActivities.length - 1 ? (
                                                        <span
                                                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100 dark:bg-slate-850"
                                                            aria-hidden="true"
                                                        />
                                                    ) : null}
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className={cn('flex h-8.5 w-8.5 items-center justify-center rounded-xl shadow-xs', getActivityColor(activity.type))}>
                                                                {getActivityIcon(activity.type)}
                                                            </span>
                                                        </div>
                                                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                    {activity.description}
                                                                </p>
                                                            </div>
                                                            <div className="whitespace-nowrap text-right text-xs text-gray-400 dark:text-gray-500">
                                                                <time>{activity.time}</time>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Platform Summaries & Stats */}
                    <div className="space-y-6">
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
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-gray-600 dark:text-gray-400">Rescue Status: Assigned / Total</span>
                                        <span className="text-emerald-600 dark:text-emerald-400">
                                            {stats.rescues.total - stats.rescues.pending} / {stats.rescues.total}
                                        </span>
                                    </div>
                                    <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-slate-850">
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
                                    <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-slate-850">
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
                                    <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-slate-850">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                                            style={{
                                                width: `${(stats.volunteers.active + stats.volunteers.pending) > 0 ? (stats.volunteers.active / (stats.volunteers.active + stats.volunteers.pending)) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tips or Reminders */}
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-6 dark:border-emerald-950/20 dark:bg-emerald-950/5">
                            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold">
                                <AlertCircle className="h-5 w-5" />
                                <h3>Operational Tips</h3>
                            </div>
                            <ul className="mt-3 list-disc pl-4 text-xs space-y-2 text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
                                <li><strong>Rescue Cases:</strong> Check location coordinates and coordinate with volunteers nearby.</li>
                                <li><strong>Adoptions:</strong> Make sure emergency contact phone numbers are active before schedule approvals.</li>
                                <li><strong>Inventory Check:</strong> Verify dropped off items in In-Kind monitoring and update stock levels.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

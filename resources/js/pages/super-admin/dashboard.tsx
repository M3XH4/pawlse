import { Head, Link, usePage } from '@inertiajs/react';
import {
    DatabaseBackup,
    FileSearch,
    HardDrive,
    ShieldAlert,
    Users,
    Activity,
    Settings,
    Sparkles,
    UserCheck,
    ChevronRight,
} from 'lucide-react';
import {
    DashboardCard,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { cn } from '@/lib/utils';
import {
    userManagement,
    auditLogs,
    archives,
    securityAccess,
    backupRestore,
    aiConfiguration,
    systemSettings,
} from '@/routes/account/super-admin';

type Stats = {
    total_users: number;
    total_admins: number;
    total_volunteers: number;
    total_audit_logs: number;
    backups_count: number;
    recent_alarms: number;
    database_size: string;
};

type RecentActivity = {
    id: number;
    user_name: string;
    action: string;
    description: string;
    time: string;
    ip_address: string;
};

type DashboardProps = {
    stats: Stats;
    recentActivities: RecentActivity[];
};

export default function SuperAdminDashboard({ stats, recentActivities }: DashboardProps) {
    const { auth } = usePage().props;
    const user = auth.user;

    const quickActions = [
        {
            title: 'User Management',
            description: 'Manage roles and system permissions',
            href: userManagement.url(),
            icon: Users,
            color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        },
        {
            title: 'Audit Logs',
            description: 'Inspect admin action history trail',
            href: auditLogs.url(),
            icon: FileSearch,
            color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
            title: 'System Archives',
            description: 'Review and restore soft-deleted items',
            href: archives.url(),
            icon: HardDrive,
            color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        },
        {
            title: 'Security & Logins',
            description: 'Track login history and suspicious attempts',
            href: securityAccess.url(),
            icon: ShieldAlert,
            color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            badge: stats.recent_alarms > 0 ? `${stats.recent_alarms} Suspicious` : null,
        },
        {
            title: 'Backup & Restore',
            description: 'Generate database backups and restore',
            href: backupRestore.url(),
            icon: DatabaseBackup,
            color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        },
        {
            title: 'AI Configurations',
            description: 'Update confidence thresholds and features',
            href: aiConfiguration.url(),
            icon: Sparkles,
            color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
        },
        {
            title: 'System Settings',
            description: 'Update global details and maintenance mode',
            href: systemSettings.url(),
            icon: Settings,
            color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
        },
    ];

    return (
        <DashboardSectionPage
            title="System Overview"
            description="Overview of PAWLSE platform administration and operational integrity"
        >
            <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* User Card */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total System Users</span>
                            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-fredoka text-3xl font-bold text-slate-850 dark:text-white">
                                {stats.total_users}
                            </h3>
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats.total_admins} Admins</span>
                                <span>•</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.total_volunteers} Volunteers</span>
                            </div>
                        </div>
                    </div>

                    {/* Database Card */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Database Capacity</span>
                            <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400">
                                <HardDrive className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-fredoka text-3xl font-bold text-slate-850 dark:text-white">
                                {stats.database_size}
                            </h3>
                            <div className="mt-2 text-xs text-gray-400 font-medium">
                                Database type: {import.meta.env.VITE_DB_CONNECTION || 'MySQL'}
                            </div>
                        </div>
                    </div>

                    {/* Backups Card */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Saved Backups</span>
                            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600 dark:bg-violet-950/20 dark:text-violet-400">
                                <DatabaseBackup className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-fredoka text-3xl font-bold text-slate-850 dark:text-white">
                                {stats.backups_count} Completed
                            </h3>
                            <div className="mt-2 text-xs text-gray-400 font-medium">
                                Backups are safely stored in local disk
                            </div>
                        </div>
                    </div>

                    {/* Alarms Card */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Security Threats (24h)</span>
                            <div className={cn(
                                'rounded-xl p-2.5',
                                stats.recent_alarms > 0
                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                            )}>
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className={cn(
                                'font-fredoka text-3xl font-bold',
                                stats.recent_alarms > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-850 dark:text-white'
                            )}>
                                {stats.recent_alarms} Suspicious
                            </h3>
                            <div className="mt-2 text-xs text-gray-400 font-medium">
                                {stats.recent_alarms > 0 ? 'Review suspicious login attempts immediately' : 'No suspicious login attempts'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid layout */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column: Quick Operations */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div>
                                <h2 className="font-fredoka text-xl font-bold tracking-wide text-slate-800 dark:text-white">
                                    Administration Console
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Primary tabs to manage PAWLSE backend configurations and security logs
                                </p>
                            </div>
                            <hr className="my-4 border-gray-100 dark:border-slate-800" />
                            <div className="grid gap-4 sm:grid-cols-2">
                                {quickActions.map((action, i) => (
                                    <Link
                                        key={i}
                                        href={action.href}
                                        className="group flex items-center justify-between rounded-2xl border border-gray-150 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-250 hover:bg-gray-55/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/40"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn('rounded-xl p-3', action.color)}>
                                                <action.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                                    {action.title}
                                                    {action.badge ? (
                                                        <span className="flex h-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white">
                                                            {action.badge}
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
                    </div>

                    {/* Right Column: Audit Timeline */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-fredoka text-xl font-bold tracking-wide text-slate-800 dark:text-white">
                                        Recent Operations
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Chronological trail of admin actions
                                    </p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    Live Logs
                                </span>
                            </div>
                            <hr className="my-4 border-gray-100 dark:border-slate-800" />
                            
                            {recentActivities.length === 0 ? (
                                <div className="py-12 text-center text-sm text-gray-500">
                                    No administrative actions logged yet.
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
                                                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-600 shadow-xs dark:bg-slate-800 dark:text-slate-400">
                                                                <Activity className="h-4 w-4" />
                                                            </span>
                                                        </div>
                                                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-800 dark:text-white">
                                                                    {activity.user_name}
                                                                </p>
                                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                                                                    {activity.description}
                                                                </p>
                                                            </div>
                                                            <div className="whitespace-nowrap text-right text-[10px] text-gray-400 dark:text-gray-500">
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
                </div>
            </div>
        </DashboardSectionPage>
    );
}

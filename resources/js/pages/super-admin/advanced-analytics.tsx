import { useState, useEffect, useCallback } from 'react';
import {
    BarChart3, Download, Users, DatabaseBackup, Sparkles,
    ShieldAlert, Heart, PawPrint, UserCheck, Gift, RefreshCw,
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, ComposedChart, Line,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type Period = 'month' | 'week' | 'year';

interface SeriesPoint { label: string; count: number }
interface LoginPoint  { label: string; success: number; failed: number }
interface PieSlice    { name: string; value: number }

interface Stats {
    users: number;
    backups: number;
    ai_predictions: number;
    suspicious_logins: number;
    rescue_reports: number;
    adoptions: number;
    volunteers: number;
    donations: number;
}

interface AnalyticsData {
    period: Period;
    stats: Stats;
    user_series: SeriesPoint[];
    login_series: LoginPoint[];
    rescue_series: SeriesPoint[];
    adoption_series: SeriesPoint[];
    role_breakdown: PieSlice[];
    report_type_breakdown: PieSlice[];
    ai_breakdown: PieSlice[];
}

// ── Palette ───────────────────────────────────────────────────────────────────

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
    label, value, icon: Icon, color,
}: { label: string; value: number | string; icon: React.ElementType; color: string }) {
    return (
        <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
                <div className={cn('rounded-xl p-2 text-white', color)}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <p className="mt-3 font-fredoka text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 font-fredoka text-base font-bold text-slate-800 dark:text-white">{title}</h3>
            {children}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SuperAdminAdvancedAnalytics() {
    const [period, setPeriod]   = useState<Period>('month');
    const [data, setData]       = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `/account/super-admin/analytics?period=${period}`;
            const res = await fetch(url, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
            setData(await res.json());
        } catch (e) {
            setError('Failed to load analytics data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleExport = () => {
        window.location.href = `/account/super-admin/analytics/export?period=${period}`;
    };

    const statCards = data ? [
        { label: 'New Users',           value: data.stats.users,             icon: Users,         color: 'bg-indigo-500' },
        { label: 'Rescue Reports',       value: data.stats.rescue_reports,    icon: PawPrint,      color: 'bg-emerald-500' },
        { label: 'Adoption Applications',value: data.stats.adoptions,         icon: Heart,         color: 'bg-rose-500' },
        { label: 'Volunteer Apps',       value: data.stats.volunteers,        icon: UserCheck,     color: 'bg-violet-500' },
        { label: 'Donations',            value: data.stats.donations,         icon: Gift,          color: 'bg-amber-500' },
        { label: 'AI Predictions',       value: data.stats.ai_predictions,    icon: Sparkles,      color: 'bg-cyan-500' },
        { label: 'Suspicious Logins',    value: data.stats.suspicious_logins, icon: ShieldAlert,   color: 'bg-red-500' },
        { label: 'Backups Created',      value: data.stats.backups,           icon: DatabaseBackup,color: 'bg-slate-500' },
    ] : [];

    return (
        <DashboardSectionPage
            title="Advanced Analytics"
            description="System-wide performance, adoption, rescue, and engagement trends"
            badge={<DashboardMetricBadge icon={<BarChart3 className="h-4 w-4" />} label="Analytics" />}
        >
            {/* ── Toolbar ── */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
                {(['week', 'month', 'year'] as Period[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={cn(
                            'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                            period === p
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700',
                        )}
                    >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                ))}

                <button
                    onClick={fetchData}
                    className="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>

                <button
                    onClick={handleExport}
                    className="ml-auto flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
            </div>

            {/* ── Error / Loading ── */}
            {error && (
                <DashboardCard>
                    <p className="text-sm text-red-500">{error}</p>
                </DashboardCard>
            )}

            {loading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-800" />
                    ))}
                </div>
            )}

            {!loading && data && (
                <div className="space-y-6">
                    {/* ── Stat Cards ── */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((card) => (
                            <StatCard key={card.label} {...card} />
                        ))}
                    </div>

                    {/* ── Row 1: User registrations + Login activity ── */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <ChartCard title="User Registrations Over Time">
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={data.user_series} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                                    <defs>
                                        <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="count" name="Users" stroke="#6366f1" fill="url(#userGrad)" strokeWidth={2} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Login Attempts (Success vs. Failed)">
                            <ResponsiveContainer width="100%" height={220}>
                                <ComposedChart data={data.login_series} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Bar dataKey="success" name="Success" fill="#10b981" radius={[3, 3, 0, 0]} />
                                    <Line type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>

                    {/* ── Row 2: Rescue + Adoptions ── */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <ChartCard title="Rescue Reports Submitted">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.rescue_series} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Reports" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Adoption Applications Over Time">
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={data.adoption_series} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                                    <defs>
                                        <linearGradient id="adoptGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="count" name="Applications" stroke="#f43f5e" fill="url(#adoptGrad)" strokeWidth={2} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>

                    {/* ── Row 3: Donut charts ── */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        <ChartCard title="User Role Breakdown">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={data.role_breakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {data.role_breakdown.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Rescue Report Types">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={data.report_type_breakdown.length ? data.report_type_breakdown : [{ name: 'No data', value: 1 }]}
                                        cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {(data.report_type_breakdown.length ? data.report_type_breakdown : [{ name: 'No data', value: 1 }]).map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="AI Prediction Accuracy">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={data.ai_breakdown.every(d => d.value === 0)
                                            ? [{ name: 'No data', value: 1 }]
                                            : data.ai_breakdown}
                                        cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                </div>
            )}
        </DashboardSectionPage>
    );
}

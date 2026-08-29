import { useState, useEffect, useCallback } from 'react';
import {
    BarChart3,
    Download,
    Users,
    DatabaseBackup,
    Sparkles,
    ShieldAlert,
    ShieldCheck,
    Heart,
    PawPrint,
    UserCheck,
    Gift,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Activity,
    CreditCard,
    Cpu,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Coins,
    Shield,
    AlertCircle,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    ComposedChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '90d' | '1y' | 'all';
type ActiveTab = 'overview' | 'operations' | 'financials' | 'security' | 'ai';

interface TimelinePoint {
    label: string;
    users: number;
    rescues: number;
    adoptions: number;
    donations_amount: number;
    donations_count: number;
}

interface LoginPoint {
    label: string;
    success: number;
    failed: number;
    suspicious: number;
}

interface AiPoint {
    label: string;
    total: number;
    accurate: number;
    inaccurate: number;
}

interface BreakdownItem {
    name: string;
    value: number;
    amount?: number;
}

interface AuditActor {
    user_id: number | null;
    name: string;
    email: string;
    role: string;
    actions_count: number;
    last_action: string;
}

interface SecurityEvent {
    id: number;
    email: string;
    ip_address: string;
    status: string;
    is_suspicious: boolean;
    time: string;
}

interface Stats {
    users: number;
    donations_amount: number;
    donations_count: number;
    avg_donation_amount: number;
    rescue_reports: number;
    rescue_resolution_rate: number;
    adoptions: number;
    adoption_approval_rate: number;
    volunteers: number;
    active_volunteers: number;
    ai_predictions: number;
    ai_accuracy_rate: number;
    ai_avg_confidence: number;
    suspicious_logins: number;
    login_success_rate: number;
    audit_events: number;
    backups: number;
    health_score: number;
}

interface Deltas {
    users: number;
    rescues: number;
    adoptions: number;
    donations_amount: number;
    suspicious_logins: number;
    ai_predictions: number;
}

interface AnalyticsData {
    period: Period;
    stats: Stats;
    deltas: Deltas;
    timeline: TimelinePoint[];
    login_series: LoginPoint[];
    ai_series: AiPoint[];
    role_breakdown: BreakdownItem[];
    report_type_breakdown: BreakdownItem[];
    animal_type_breakdown: BreakdownItem[];
    rescue_status_breakdown: BreakdownItem[];
    urgency_breakdown: BreakdownItem[];
    donation_type_breakdown: BreakdownItem[];
    donation_status_breakdown: BreakdownItem[];
    payment_methods: BreakdownItem[];
    ai_breakdown: BreakdownItem[];
    ai_feature_breakdown: BreakdownItem[];
    audit_action_breakdown: BreakdownItem[];
    top_audit_actors: AuditActor[];
    recent_security_events: SecurityEvent[];
}

// ── Palette ───────────────────────────────────────────────────────────────────

const PALETTE = {
    primary: '#6366f1',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    violet: '#8b5cf6',
    cyan: '#06b6d4',
    sky: '#0284c7',
    slate: '#64748b',
};

const PIE_COLORS = [
    '#6366f1',
    '#10b981',
    '#f59e0b',
    '#f43f5e',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
    '#14b8a6',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DeltaBadge({ delta, isInverse = false }: { delta: number; isInverse?: boolean }) {
    const isPositive = delta > 0;
    const isNeutral = delta === 0;

    // For security alerts, positive delta means more threats (bad)
    const isGood = isInverse ? !isPositive : isPositive;

    if (isNeutral) {
        return (
            <span className="inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                0.0%
            </span>
        );
    }

    return (
        <span
            className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold',
                isGood
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
            )}
        >
            {isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
            ) : (
                <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(delta)}%
        </span>
    );
}

function HighlightKpiCard({
    label,
    value,
    subValue,
    delta,
    icon: Icon,
    color,
    isInverse = false,
}: {
    label: string;
    value: string | number;
    subValue?: string;
    delta?: number;
    icon: React.ElementType;
    color: string;
    isInverse?: boolean;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
                <div>
                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                        {label}
                    </span>
                    <p className="mt-2 font-fredoka text-3xl font-bold text-slate-900 dark:text-white">
                        {value}
                    </p>
                </div>
                <div className={cn('rounded-xl p-3 shadow-inner text-white', color)}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs dark:border-slate-800/80">
                {delta !== undefined ? (
                    <div className="flex items-center gap-1.5">
                        <DeltaBadge delta={delta} isInverse={isInverse} />
                        <span className="text-gray-400">vs prev period</span>
                    </div>
                ) : (
                    <span className="text-gray-400">Active metrics</span>
                )}
                {subValue && (
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {subValue}
                    </span>
                )}
            </div>
        </div>
    );
}

function ChartCard({
    title,
    subtitle,
    children,
    action,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action}
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="rounded-xl border border-gray-200 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
            <p className="mb-1.5 font-bold text-slate-800 dark:text-slate-100">{label}</p>
            <div className="space-y-1">
                {payload.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-4 text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-300">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
                            />
                            {entry.name}:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                            {typeof entry.value === 'number' && entry.name.toLowerCase().includes('amount')
                                ? formatCurrency(entry.value)
                                : formatNumber(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function SuperAdminAdvancedAnalytics() {
    const [period, setPeriod] = useState<Period>('30d');
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `/account/super-admin/analytics?period=${period}`;
            const res = await fetch(url, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            setData(await res.json());
        } catch (e) {
            setError('Failed to load advanced analytics data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleExport = () => {
        window.location.href = `/account/super-admin/analytics/export?period=${period}`;
    };

    const periodOptions: { key: Period; label: string }[] = [
        { key: '7d', label: 'Last 7 Days' },
        { key: '30d', label: 'Last 30 Days' },
        { key: '90d', label: 'Last 90 Days' },
        { key: '1y', label: '1 Year' },
        { key: 'all', label: 'All Time' },
    ];

    const tabs: { key: ActiveTab; label: string; icon: React.ElementType }[] = [
        { key: 'overview', label: 'Platform Pulse', icon: Activity },
        { key: 'operations', label: 'Rescue & Operations', icon: PawPrint },
        { key: 'financials', label: 'Donations & Revenue', icon: Coins },
        { key: 'security', label: 'Security & Audit Logs', icon: Shield },
        { key: 'ai', label: 'AI & Automation', icon: Cpu },
    ];

    return (
        <DashboardSectionPage
            title="Advanced Analytics & System Telemetry"
            description="Deep system intelligence, operational workflows, donation analytics, security posture, and AI metrics"
            badge={<DashboardMetricBadge icon={<BarChart3 className="h-4 w-4" />} label="Super Admin Intelligence" />}
        >
            {/* ── Control Header ── */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Period Selector */}
                <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-gray-100/80 p-1 dark:bg-slate-800/80">
                    {periodOptions.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key)}
                            className={cn(
                                'rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all',
                                period === p.key
                                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
                    >
                        <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                        Refresh
                    </button>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export Full CSV
                    </button>
                </div>
            </div>

            {/* ── Error Banner ── */}
            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* ── Loading Skeleton ── */}
            {loading && !data && (
                <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-800" />
                        ))}
                    </div>
                    <div className="h-80 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-800" />
                </div>
            )}

            {/* ── Main Data View ── */}
            {data && (
                <div className="space-y-6">
                    {/* ── Top Executive KPI Cards ── */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <HighlightKpiCard
                            label="Total Verified Donations"
                            value={formatCurrency(data.stats.donations_amount)}
                            subValue={`${data.stats.donations_count} donations`}
                            delta={data.deltas.donations_amount}
                            icon={Coins}
                            color="bg-emerald-500"
                        />

                        <HighlightKpiCard
                            label="Rescue Operations"
                            value={`${data.stats.rescue_reports} reports`}
                            subValue={`${data.stats.rescue_resolution_rate}% resolved`}
                            delta={data.deltas.rescues}
                            icon={PawPrint}
                            color="bg-indigo-500"
                        />

                        <HighlightKpiCard
                            label="New Users & Adoptions"
                            value={`${data.stats.users} Users`}
                            subValue={`${data.stats.adoptions} apps (${data.stats.adoption_approval_rate}% approved)`}
                            delta={data.deltas.users}
                            icon={Users}
                            color="bg-violet-500"
                        />

                        <HighlightKpiCard
                            label="Security & AI Telemetry"
                            value={`${data.stats.ai_accuracy_rate}% AI Acc.`}
                            subValue={`${data.stats.suspicious_logins} security alerts`}
                            delta={data.deltas.suspicious_logins}
                            isInverse={true}
                            icon={ShieldAlert}
                            color={data.stats.suspicious_logins > 0 ? 'bg-amber-500' : 'bg-cyan-500'}
                        />
                    </div>

                    {/* ── System Health & Navigation Tabs ── */}
                    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
                        {/* Tab Switcher */}
                        <div className="flex flex-wrap items-center gap-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={cn(
                                            'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all',
                                            isActive
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Health Score Pill */}
                        <div className="flex items-center gap-3 self-start rounded-xl border border-gray-150 bg-gray-50/80 px-3.5 py-1.5 lg:self-auto dark:border-slate-800 dark:bg-slate-800/50">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                System Vitality:
                            </span>
                            <div className="flex items-center gap-1.5 font-fredoka font-bold text-slate-800 dark:text-white">
                                <span
                                    className={cn(
                                        'h-2.5 w-2.5 rounded-full animate-pulse',
                                        data.stats.health_score >= 85
                                            ? 'bg-emerald-500'
                                            : data.stats.health_score >= 70
                                              ? 'bg-amber-500'
                                              : 'bg-rose-500',
                                    )}
                                />
                                {data.stats.health_score}/100
                            </div>
                        </div>
                    </div>

                    {/* ════════════════════════════════════════════════════════════ */}
                    {/* TAB 1: PLATFORM PULSE (OVERVIEW)                            */}
                    {/* ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Main Master Activity Chart */}
                            <ChartCard
                                title="Platform Activity Trends"
                                subtitle="Unified volume trend across user registrations, rescues, and adoptions"
                            >
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={data.timeline} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                        <defs>
                                            <linearGradient id="userColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={PALETTE.primary} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={PALETTE.primary} stopOpacity={0.0} />
                                            </linearGradient>
                                            <linearGradient id="rescueColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={PALETTE.emerald} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={PALETTE.emerald} stopOpacity={0.0} />
                                            </linearGradient>
                                            <linearGradient id="adoptColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={PALETTE.rose} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={PALETTE.rose} stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                                        <Area
                                            type="monotone"
                                            dataKey="users"
                                            name="New Users"
                                            stroke={PALETTE.primary}
                                            strokeWidth={2}
                                            fill="url(#userColor)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="rescues"
                                            name="Rescues & Reports"
                                            stroke={PALETTE.emerald}
                                            strokeWidth={2}
                                            fill="url(#rescueColor)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="adoptions"
                                            name="Adoption Apps"
                                            stroke={PALETTE.rose}
                                            strokeWidth={2}
                                            fill="url(#adoptColor)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            {/* Tri-Donut Grid */}
                            <div className="grid gap-6 lg:grid-cols-3">
                                <ChartCard title="User Community Breakdown" subtitle="Distribution by account role">
                                    <ResponsiveContainer width="100%" height={210}>
                                        <PieChart>
                                            <Pie
                                                data={data.role_breakdown}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {data.role_breakdown.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="Pet Report Classifications" subtitle="Rescue vs. Missing vs. SOS">
                                    <ResponsiveContainer width="100%" height={210}>
                                        <PieChart>
                                            <Pie
                                                data={
                                                    data.report_type_breakdown.length
                                                        ? data.report_type_breakdown
                                                        : [{ name: 'No data', value: 1 }]
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {(data.report_type_breakdown.length
                                                    ? data.report_type_breakdown
                                                    : [{ name: 'No data', value: 1 }]
                                                ).map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="Payment Channels" subtitle="Verified transaction providers">
                                    <ResponsiveContainer width="100%" height={210}>
                                        <PieChart>
                                            <Pie
                                                data={
                                                    data.payment_methods.length
                                                        ? data.payment_methods
                                                        : [{ name: 'Direct/Cash', value: 1 }]
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {(data.payment_methods.length
                                                    ? data.payment_methods
                                                    : [{ name: 'Direct/Cash', value: 1 }]
                                                ).map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[(i + 4) % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════ */}
                    {/* TAB 2: RESCUE & SHELTER OPERATIONS                          */}
                    {/* ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'operations' && (
                        <div className="space-y-6">
                            <div className="grid gap-6 lg:grid-cols-2">
                                <ChartCard
                                    title="Rescue Submissions Timeline"
                                    subtitle="Incoming pet reports submitted over the selected period"
                                >
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={data.timeline} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar
                                                dataKey="rescues"
                                                name="Rescue Reports"
                                                fill={PALETTE.emerald}
                                                radius={[6, 6, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard
                                    title="Adoption Applications Flow"
                                    subtitle="Adoption requests submitted by community members"
                                >
                                    <ResponsiveContainer width="100%" height={240}>
                                        <AreaChart data={data.timeline} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                            <defs>
                                                <linearGradient id="adoptArea" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={PALETTE.rose} stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor={PALETTE.rose} stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="adoptions"
                                                name="Adoption Applications"
                                                stroke={PALETTE.rose}
                                                strokeWidth={2}
                                                fill="url(#adoptArea)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-3">
                                <ChartCard title="Animal Species Distribution" subtitle="Dogs vs. Cats vs. Others">
                                    <ResponsiveContainer width="100%" height={210}>
                                        <PieChart>
                                            <Pie
                                                data={
                                                    data.animal_type_breakdown.length
                                                        ? data.animal_type_breakdown
                                                        : [{ name: 'No data', value: 1 }]
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {data.animal_type_breakdown.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="Rescue Status Breakdown" subtitle="Current status in dispatch lifecycle">
                                    <ResponsiveContainer width="100%" height={210}>
                                        <PieChart>
                                            <Pie
                                                data={
                                                    data.rescue_status_breakdown.length
                                                        ? data.rescue_status_breakdown
                                                        : [{ name: 'No data', value: 1 }]
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {data.rescue_status_breakdown.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[(i + 3) % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="SOS Urgency Levels" subtitle="Severity of reported emergencies">
                                    <ResponsiveContainer width="100%" height={210}>
                                        <PieChart>
                                            <Pie
                                                data={
                                                    data.urgency_breakdown.length
                                                        ? data.urgency_breakdown
                                                        : [{ name: 'Normal / Non-SOS', value: 1 }]
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {data.urgency_breakdown.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[(i + 5) % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════ */}
                    {/* TAB 3: FINANCIALS & DONATIONS                               */}
                    {/* ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'financials' && (
                        <div className="space-y-6">
                            <ChartCard
                                title="Donation Collection Velocity (PHP ₱)"
                                subtitle="Verified monetary funds raised across the period"
                            >
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={data.timeline} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                                        <defs>
                                            <linearGradient id="donationGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={PALETTE.emerald} stopOpacity={0.45} />
                                                <stop offset="95%" stopColor={PALETTE.emerald} stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                            tickFormatter={(val) => `₱${(val / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="donations_amount"
                                            name="Amount (PHP)"
                                            stroke={PALETTE.emerald}
                                            strokeWidth={2.5}
                                            fill="url(#donationGrad)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <div className="grid gap-6 lg:grid-cols-3">
                                <ChartCard title="Donation Types" subtitle="Monetary cash vs. In-Kind donations">
                                    <ResponsiveContainer width="100%" height={210}>
                                        <PieChart>
                                            <Pie
                                                data={
                                                    data.donation_type_breakdown.length
                                                        ? data.donation_type_breakdown
                                                        : [{ name: 'Cash', value: 1 }]
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {data.donation_type_breakdown.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="Payment Channels" subtitle="GCash, Maya, Bank, Stripe, Cash">
                                    <ResponsiveContainer width="100%" height={210}>
                                        <PieChart>
                                            <Pie
                                                data={
                                                    data.payment_methods.length
                                                        ? data.payment_methods
                                                        : [{ name: 'Direct', value: 1 }]
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {data.payment_methods.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="Donation Verification Status" subtitle="Verified vs Pending review">
                                    <ResponsiveContainer width="100%" height={210}>
                                        <PieChart>
                                            <Pie
                                                data={
                                                    data.donation_status_breakdown.length
                                                        ? data.donation_status_breakdown
                                                        : [{ name: 'Verified', value: 1 }]
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {data.donation_status_breakdown.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[(i + 4) % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════ */}
                    {/* TAB 4: SECURITY & AUDIT LOGS                                */}
                    {/* ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="grid gap-6 lg:grid-cols-2">
                                <ChartCard
                                    title="Authentication Flow (Success vs Failed)"
                                    subtitle="Tracking brute-force and suspicious login trends"
                                >
                                    <ResponsiveContainer width="100%" height={250}>
                                        <ComposedChart data={data.login_series} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                            <Bar
                                                dataKey="success"
                                                name="Successful Logins"
                                                fill={PALETTE.emerald}
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="failed"
                                                name="Failed Logins"
                                                stroke={PALETTE.rose}
                                                strokeWidth={2.5}
                                                dot={false}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="suspicious"
                                                name="Flagged Suspicious"
                                                stroke={PALETTE.amber}
                                                strokeWidth={2}
                                                strokeDasharray="4 4"
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard
                                    title="Audit Trail Categories"
                                    subtitle="Actions performed by staff and administrative users"
                                >
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={
                                                    data.audit_action_breakdown.length
                                                        ? data.audit_action_breakdown
                                                        : [{ name: 'No events', value: 1 }]
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={85}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {data.audit_action_breakdown.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            {/* Tables: Top Audit Actors & Security Incident Alerts */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                        Top Administrative Actors
                                    </h3>
                                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                        Staff with the most recorded actions in the audit trail
                                    </p>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                    <th className="pb-2 font-semibold">User</th>
                                                    <th className="pb-2 font-semibold">Role</th>
                                                    <th className="pb-2 font-semibold text-right">Actions</th>
                                                    <th className="pb-2 font-semibold text-right">Last Active</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                {data.top_audit_actors.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="py-4 text-center text-gray-400">
                                                            No audit events recorded for this period
                                                        </td>
                                                    </tr>
                                                )}
                                                {data.top_audit_actors.map((actor, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                                                        <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                                                            <div>{actor.name}</div>
                                                            <div className="text-[10px] text-gray-400">{actor.email}</div>
                                                        </td>
                                                        <td className="py-2.5">
                                                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                                                                {actor.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 text-right font-bold text-slate-700 dark:text-slate-300">
                                                            {formatNumber(actor.actions_count)}
                                                        </td>
                                                        <td className="py-2.5 text-right text-gray-400">
                                                            {actor.last_action}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                        Recent Security Alerts & Incidents
                                    </h3>
                                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                        Flagged suspicious logins and repeated failed attempts
                                    </p>

                                    <div className="space-y-2.5">
                                        {data.recent_security_events.length === 0 && (
                                            <div className="py-8 text-center text-xs text-gray-400">
                                                No security alerts detected in this period 🎉
                                            </div>
                                        )}
                                        {data.recent_security_events.map((evt) => (
                                            <div
                                                key={evt.id}
                                                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className={cn(
                                                            'rounded-lg p-1.5 text-white',
                                                            evt.is_suspicious ? 'bg-rose-500' : 'bg-amber-500',
                                                        )}
                                                    >
                                                        <ShieldAlert className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {evt.email}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">IP: {evt.ip_address}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span
                                                        className={cn(
                                                            'inline-block rounded-md px-2 py-0.5 text-[10px] font-bold',
                                                            evt.is_suspicious
                                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
                                                        )}
                                                    >
                                                        {evt.is_suspicious ? 'Suspicious' : 'Failed'}
                                                    </span>
                                                    <p className="mt-0.5 text-[10px] text-gray-400">{evt.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════ */}
                    {/* TAB 5: AI TELEMETRY & AUTOMATION                            */}
                    {/* ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'ai' && (
                        <div className="space-y-6">
                            <div className="grid gap-6 lg:grid-cols-3">
                                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                        AI Precision Index
                                    </h3>
                                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                        Human-verified classification accuracy
                                    </p>

                                    <div className="mt-6 flex flex-col items-center justify-center">
                                        <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-indigo-100 dark:border-slate-800">
                                            <div className="text-center">
                                                <span className="font-fredoka text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                                    {data.stats.ai_accuracy_rate}%
                                                </span>
                                                <span className="block text-[10px] font-semibold text-gray-400 uppercase">
                                                    Accuracy
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center gap-4 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                                <span className="text-gray-500">Confidence: {data.stats.ai_avg_confidence}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <ChartCard
                                    title="AI Predictions Timeline"
                                    subtitle="Model requests executed by automated classification pipelines"
                                >
                                    <ResponsiveContainer width="100%" height={210}>
                                        <AreaChart data={data.ai_series} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                            <defs>
                                                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={PALETTE.cyan} stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor={PALETTE.cyan} stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="total"
                                                name="AI Predictions"
                                                stroke={PALETTE.cyan}
                                                strokeWidth={2}
                                                fill="url(#aiGrad)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="AI Prediction Verification" subtitle="Human feedback validation split">
                                    <ResponsiveContainer width="100%" height={210}>
                                        <PieChart>
                                            <Pie
                                                data={
                                                    data.ai_breakdown.every((d) => d.value === 0)
                                                        ? [{ name: 'Baseline 100%', value: 1 }]
                                                        : data.ai_breakdown
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                <Cell fill={PALETTE.emerald} />
                                                <Cell fill={PALETTE.rose} />
                                                <Cell fill={PALETTE.slate} />
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </DashboardSectionPage>
    );
}


import {
    BarChart3,
    Download,
    Users,
    DatabaseBackup,
    ShieldAlert,
    ShieldCheck,
    PawPrint,
    UserCheck,
    RefreshCw,
    Activity,
    Cpu,
    ArrowUpRight,
    ArrowDownRight,
    Coins,
    Shield,
    AlertCircle,
    Printer,
    HeartHandshake,
    Package,
    MapPin,
    FileSpreadsheet,
    Handshake,
    FolderDown,
    FileText,
    Clock,
    Stethoscope,
    CalendarCheck2,
    Award,
    MessageSquareText,
    Sparkles,
    CheckCircle2,
    Gift,
    Wrench,
    Eye,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
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
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { ChartSkeleton, KpiGridSkeleton } from '@/components/ui/skeleton-presets';
import { cn, formatPillLabel } from '@/lib/utils';
import superAdminAnalytics from '@/routes/account/super-admin/analytics';

// ── Types ─────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom';
type ActiveTab = 'overview' | 'operations' | 'financials' | 'security' | 'ai' | 'ecosystem' | 'exports';

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

interface EcosystemData {
    shelterCensus: {
        total: number;
        available: number;
        pending: number;
        adopted: number;
        foster: number;
        treatment: number;
        quarantine: number;
        deceased: number;
        vaccinated_count: number;
        vaccination_rate: number;
        avg_adoption_days: number;
        status_breakdown: BreakdownItem[];
    };
    fosterMetrics: {
        active_placements: number;
        completed_placements: number;
        approved_parents: number;
        total_capacity: number;
        utilization_rate: number;
    };
    volunteerImpact: {
        active_volunteers: number;
        pending_applications: number;
        hours_logged: number;
        completed_tasks: number;
        feeding_routes_completed: number;
        strays_fed: number;
        food_packs_distributed: number;
        partner_pickups_completed: number;
        injury_reports_active: number;
        certificates_issued: number;
        top_volunteers: { name: string; email: string; tasks_count: number; total_hours: number }[];
    };
    communityMetrics: {
        events_approved: number;
        events_pending: number;
        shelter_visits_confirmed: number;
        shelter_visits_pending: number;
        help_desk_open: number;
        help_desk_escalated: number;
        help_desk_resolved_period: number;
        help_desk_avg_resolution_hours: number;
    };
    inventorySustainability: {
        total_items: number;
        low_stock_count: number;
        low_stock_items: { id: number; name: string; quantity: number; min_threshold: number; unit: string; category: string }[];
        sustainability: {
            verified_funds: number;
            daily_cost: number;
            est_days: number;
            urgency_status: string;
            urgency_label: string;
        };
    };
    topRescueLocations: { location: string; total: number; resolved: number; resolution_rate: number }[];
}

interface GovernanceData {
    pending_events: number;
    pending_blogs: number;
    pending_ai_validations: number;
    escalated_tickets: number;
    archived_records_total: number;
    latest_backup_at: string;
    latest_backup_file: string;
    total_audit_logs: number;
}

interface SecurityPostureData {
    total_users: number;
    verified_users: number;
    email_verification_rate: number;
    staff_total: number;
    staff_2fa_enabled: number;
    staff_2fa_rate: number;
    users_2fa_enabled: number;
    top_suspicious_ips: { ip_address: string; attempts_count: number; suspicious_count: number; last_seen: string }[];
}

interface InfrastructureData {
    backups_completed: number;
    backups_failed: number;
    backups_total_size_mb: number;
    webhook_events_total: number;
    webhook_events_processed: number;
    webhook_events_pending: number;
}

interface PlatformEcosystemData {
    partners_active: number;
    partners_total: number;
    partners_daily_food: number;
    partners_emergency: number;
    food_pickups_total?: number;
    food_pickups_completed?: number;
    resources_active: number;
    resources_total_downloads: number;
    top_resources?: { title: string; category: string; file_type: string; download_count: number }[];
    community_honors: number;
    contact_messages_total: number;
    contact_messages_period: number;
    contact_messages_unread?: number;
    blog_posts_published?: number;
    blog_reactions_period?: number;
    certificates_issued_period?: number;
    badges_awarded_period?: number;
    help_desk_status_breakdown?: BreakdownItem[];
}

interface AiFeaturePerf {
    feature: string;
    total: number;
    avg_confidence: number;
    accuracy_rate: number | null;
    evaluated_count: number;
}

interface PulseInsightsData {
    peak_label: string;
    peak_volume: number;
    total_platform_users: number;
    active_volunteer_pool: number;
    health_pillars: { label: string; score: number; detail: string; status: string }[];
    engagement: {
        shelter_visits: number;
        rehoming_requests: number;
        certificates_issued: number;
        badges_awarded: number;
        blog_posts_published: number;
        blog_reactions: number;
    };
}

interface OperationsDeepDiveData {
    kpis: {
        critical_pending_sos: number;
        avg_resolution_hours: number;
        medical_records_count: number;
        shelter_visits_count: number;
        shelter_visits_completed: number;
        rehoming_requests_count: number;
        follow_ups_count: number;
        assigned_tasks_total: number;
        assigned_tasks_completed: number;
        task_completion_rate: number;
        injury_reports_count: number;
        strays_fed_period: number;
        food_packs_distributed: number;
        food_pickups_completed: number;
    };
    medical_type_breakdown: BreakdownItem[];
    task_status_breakdown: BreakdownItem[];
    visit_status_breakdown: BreakdownItem[];
    recent_urgent_rescues: {
        id: number;
        type: string;
        animal_type: string;
        location: string;
        urgency: string;
        status: string;
        time: string;
    }[];
}

interface FinancialDeepDiveData {
    kpis: {
        unique_donors: number;
        largest_donation: number;
        pending_verification_count: number;
        pending_verification_amount: number;
        sponsorships_count: number;
        sponsorships_amount: number;
        in_kind_count: number;
        in_kind_units: number;
        pending_amount_edits: number;
        active_animal_needs: number;
    };
    channel_performance: {
        method: string;
        count: number;
        total_amount: number;
        avg_amount: number;
        share_pct: number;
    }[];
    in_kind_status_breakdown: BreakdownItem[];
    recent_donations: {
        id: number;
        reference: string;
        donor_name: string;
        type: string;
        amount: number;
        status: string;
        time: string;
    }[];
}

interface SecurityExtrasData {
    audit_series: { label: string; events: number }[];
    recent_audit_logs: {
        id: number;
        actor: string;
        role: string;
        action: string;
        description: string;
        ip_address: string;
        time: string;
    }[];
    backup_history: {
        id: number;
        filename: string;
        disk: string;
        size_mb: number;
        status: string;
        created_at: string;
    }[];
    idempotency_guards_count: number;
}

interface AiTelemetryExtrasData {
    high_confidence_rate: number;
    evaluated_count: number;
    inaccurate_count: number;
    pending_review_count: number;
    confidence_buckets: BreakdownItem[];
    recent_predictions: {
        id: number;
        feature: string;
        confidence: number;
        status_label: string;
        time: string;
    }[];
}

interface AnalyticsData {
    period: Period;
    date_range?: { start: string; end: string; label: string };
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
    ecosystem?: EcosystemData;
    governance?: GovernanceData;
    security_posture?: SecurityPostureData;
    infrastructure?: InfrastructureData;
    platform_ecosystem?: PlatformEcosystemData;
    ai_feature_performance?: AiFeaturePerf[];
    pulse_insights?: PulseInsightsData;
    operations_deep_dive?: OperationsDeepDiveData;
    financial_deep_dive?: FinancialDeepDiveData;
    security_extras?: SecurityExtrasData;
    ai_telemetry_extras?: AiTelemetryExtrasData;
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

function getIsoDateOffset(daysOffset = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatReadableDate(dateStr?: string): string {
    if (!dateStr) {
        return '';
    }

    const parts = dateStr.split('-').map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        return dateStr;
    }

    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatReadableDateRange(start?: string, end?: string): string {
    if (!start || !end) {
        return 'Active filter scope';
    }

    return `${formatReadableDate(start)} – ${formatReadableDate(end)}`;
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
    if (!active || !payload || !payload.length) {
return null;
}

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
    const [todayIso] = useState(() => getIsoDateOffset(0));
    const [period, setPeriod] = useState<Period>('30d');
    const [customStart, setCustomStart] = useState(() => getIsoDateOffset(-29));
    const [customEnd, setCustomEnd] = useState(() => getIsoDateOffset(0));
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Real-Time Polling & Live Status State
    const [isLiveMode, setIsLiveMode] = useState(true);
    const [pollIntervalSeconds] = useState(30);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isSilentUpdating, setIsSilentUpdating] = useState(false);
    const [secondsAgo, setSecondsAgo] = useState(0);

    const buildQueryParams = useCallback(() => {
        const params = new URLSearchParams({ period });

        if (period === 'custom' && customStart && customEnd) {
            params.set('start_date', customStart);
            params.set('end_date', customEnd);
        }

        return params;
    }, [period, customStart, customEnd]);

    const fetchAnalytics = useCallback(async (silent = false) => {
        if (period === 'custom' && (!customStart || !customEnd)) {
            return;
        }

        if (!silent) {
            setLoading(true);
        } else {
            setIsSilentUpdating(true);
        }

        setError(null);

        try {
            const url = `/account/super-admin/analytics?${buildQueryParams().toString()}`;
            const res = await fetch(url, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            setData(await res.json());
            setLastUpdated(new Date());
            setSecondsAgo(0);
        } catch {
            if (!silent) {
                setError('Failed to load advanced analytics data. Please try again.');
            }
        } finally {
            setLoading(false);
            setIsSilentUpdating(false);
        }
    }, [period, customStart, customEnd, buildQueryParams]);

    // Initial load and period changes
    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchAnalytics(false);
        }, 0);

        return () => window.clearTimeout(timer);
    }, [fetchAnalytics]);

    // Real-time automatic background polling
    useEffect(() => {
        if (!isLiveMode) {
            return;
        }

        const interval = setInterval(() => {
            fetchAnalytics(true);
        }, pollIntervalSeconds * 1000);

        return () => clearInterval(interval);
    }, [isLiveMode, pollIntervalSeconds, fetchAnalytics]);

    // Seconds-ago live counter ticker
    useEffect(() => {
        const ticker = setInterval(() => {
            setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
        }, 1000);

        return () => clearInterval(ticker);
    }, [lastUpdated]);

    const handleExport = (type: 'full' | 'operations' | 'financials' | 'security' | 'ai' | 'ecosystem' = 'full') => {
        const query: Record<string, string> = { period, type };

        if (period === 'custom' && customStart && customEnd) {
            query.start_date = customStart;
            query.end_date = customEnd;
        }

        window.location.assign(superAdminAnalytics.export.url({ query }));
    };

    const handleExportPdf = (
        section: 'all' | 'operations' | 'financials' | 'security' | 'ai' | 'ecosystem' = 'all',
        autoprint = true,
    ) => {
        const query: Record<string, string | number> = { period, section };

        if (autoprint) {
            query.autoprint = 1;
        }

        if (period === 'custom' && customStart && customEnd) {
            query.start_date = customStart;
            query.end_date = customEnd;
        }

        window.open(superAdminAnalytics.pdf.url({ query }), '_blank', 'noopener,noreferrer');
    };

    const periodOptions: { key: Period; label: string }[] = [
        { key: '7d', label: '7 Days' },
        { key: '30d', label: '30 Days' },
        { key: '90d', label: '90 Days' },
        { key: '1y', label: '1 Year' },
        { key: 'all', label: 'All Time' },
        { key: 'custom', label: 'Custom' },
    ];

    const tabs: { key: ActiveTab; label: string; icon: React.ElementType }[] = [
        { key: 'overview', label: 'Platform Pulse', icon: Activity },
        { key: 'operations', label: 'Operations', icon: PawPrint },
        { key: 'financials', label: 'Financials', icon: Coins },
        { key: 'security', label: 'Security & Audit', icon: Shield },
        { key: 'ai', label: 'AI Telemetry', icon: Cpu },
        { key: 'ecosystem', label: 'Ecosystem & Gov', icon: HeartHandshake },
        { key: 'exports', label: 'PDF & CSV Exports', icon: Printer },
    ];

    return (
        <DashboardSectionPage
            title="Advanced Analytics & System Telemetry"
            description="Deep system intelligence, operational workflows, donation analytics, security posture, AI metrics, and ecosystem governance"
            badge={<DashboardMetricBadge icon={<BarChart3 className="h-4 w-4" />} label="Super Admin Intelligence" />}
        >
            {/* ── Control Header ── */}
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* Period Selector (Single Line) */}
                <div className="inline-flex shrink-0 flex-nowrap items-center gap-1 overflow-x-auto rounded-2xl bg-gray-100/80 p-1 dark:bg-slate-800/80">
                    {periodOptions.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key)}
                            className={cn(
                                'whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                                period === p.key
                                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Live + Icon-Only Refresh Pill (Last, Single Line) */}
                <div className="inline-flex shrink-0 flex-nowrap items-center gap-2 self-start whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-2xs lg:self-auto dark:border-slate-800 dark:bg-slate-900">
                    <button
                        type="button"
                        onClick={() => setIsLiveMode(!isLiveMode)}
                        className="flex items-center gap-2 cursor-pointer focus:outline-hidden"
                        title={isLiveMode ? 'Live real-time polling enabled (click to pause)' : 'Real-time paused (click to resume)'}
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            {isLiveMode && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            )}
                            <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', isLiveMode ? 'bg-emerald-500' : 'bg-gray-400')}></span>
                        </span>
                        <span className="font-bold text-gray-700 dark:text-gray-200">
                            {isLiveMode ? 'Live (30s)' : 'Paused'}
                        </span>
                    </button>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {isSilentUpdating ? 'Syncing...' : secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <button
                        type="button"
                        onClick={() => fetchAnalytics(false)}
                        disabled={loading || isSilentUpdating}
                        aria-label="Refresh analytics"
                        title="Refresh analytics"
                        className="inline-flex items-center justify-center rounded-lg p-1 text-gray-600 transition-colors hover:bg-gray-100 hover:text-indigo-600 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-slate-800 cursor-pointer"
                    >
                        <RefreshCw className={cn('h-3.5 w-3.5', (loading || isSilentUpdating) && 'animate-spin text-indigo-500')} />
                    </button>
                </div>
            </div>

            {/* Custom Date Range Selector */}
            {period === 'custom' && (
                <div className="mb-6 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/60 via-white to-violet-50/50 p-4 shadow-2xs dark:border-indigo-900/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/20">
                    <div className="grid items-end gap-4 md:grid-cols-[1fr_1fr_auto]">
                        <ModernDatePicker
                            label="Start Date"
                            value={customStart}
                            onChange={setCustomStart}
                            maxDate={customEnd || todayIso}
                            variant="input"
                            allowPast={true}
                            showPresets={true}
                            presets={[
                                { label: '7 Days Ago', value: getIsoDateOffset(-6) },
                                { label: '30 Days Ago', value: getIsoDateOffset(-29) },
                                { label: '90 Days Ago', value: getIsoDateOffset(-89) },
                                { label: '1 Year Ago', value: getIsoDateOffset(-364) },
                            ]}
                            placeholder="Choose start date"
                        />
                        <ModernDatePicker
                            label="End Date"
                            value={customEnd}
                            onChange={setCustomEnd}
                            minDate={customStart || undefined}
                            maxDate={todayIso}
                            variant="input"
                            allowPast={true}
                            showPresets={true}
                            presets={[
                                { label: 'Today', value: todayIso },
                                { label: 'Yesterday', value: getIsoDateOffset(-1) },
                                { label: '7 Days Ago', value: getIsoDateOffset(-6) },
                                { label: '30 Days Ago', value: getIsoDateOffset(-29) },
                            ]}
                            placeholder="Choose end date"
                        />
                        <button
                            type="button"
                            onClick={() => fetchAnalytics(false)}
                            disabled={!customStart || !customEnd || loading}
                            className="inline-flex h-[46px] shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:disabled:bg-indigo-900/50 cursor-pointer"
                        >
                            Apply Range
                        </button>
                    </div>
                    {customStart && customEnd && (
                        <div className="mt-3 flex items-center justify-between border-t border-indigo-100/80 pt-2.5 text-[11px] text-gray-500 dark:border-indigo-900/40 dark:text-gray-400">
                            <span>
                                Active Custom Window:{' '}
                                <strong className="font-bold text-indigo-700 dark:text-indigo-300">
                                    {formatReadableDateRange(customStart, customEnd)}
                                </strong>
                            </span>
                            <span className="hidden sm:inline">Formatted in local calendar display</span>
                        </div>
                    )}
                </div>
            )}

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
                    <KpiGridSkeleton count={4} />
                    <ChartSkeleton heightClass="h-64" />
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

                    {/* ── Navigation Tabs (Single Line, No System Vitality) ── */}
                    <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto rounded-2xl border border-gray-200/80 bg-white p-2.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={cn(
                                        'flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer',
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800',
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {tab.label}
                                </button>
                            );
                        })}
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

                            {data.platform_ecosystem && data.security_posture && data.infrastructure && (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <HighlightKpiCard
                                        label="Partner Network"
                                        value={`${data.platform_ecosystem.partners_active} Active`}
                                        subValue={`${data.platform_ecosystem.partners_daily_food} daily food • ${data.platform_ecosystem.partners_emergency} emergency`}
                                        icon={Handshake}
                                        color="bg-teal-500"
                                    />
                                    <HighlightKpiCard
                                        label="Resource Library Reach"
                                        value={formatNumber(data.platform_ecosystem.resources_total_downloads)}
                                        subValue={`${data.platform_ecosystem.resources_active} active files • ${data.platform_ecosystem.community_honors} honors`}
                                        icon={FolderDown}
                                        color="bg-cyan-500"
                                    />
                                    <HighlightKpiCard
                                        label="Verified User Base"
                                        value={`${data.security_posture.email_verification_rate}%`}
                                        subValue={`${data.security_posture.verified_users}/${data.security_posture.total_users} verified • ${data.platform_ecosystem.contact_messages_period} inquiries`}
                                        icon={ShieldCheck}
                                        color="bg-indigo-500"
                                    />
                                    <HighlightKpiCard
                                        label="Backups & Webhooks"
                                        value={`${data.infrastructure.backups_total_size_mb} MB`}
                                        subValue={`${data.infrastructure.backups_completed} backups • ${data.infrastructure.webhook_events_processed}/${data.infrastructure.webhook_events_total} webhooks`}
                                        icon={DatabaseBackup}
                                        color="bg-violet-500"
                                    />
                                </div>
                            )}

                            {data.pulse_insights && (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                                    System Health Pillars ({data.stats.health_score}/100)
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Weighted diagnostic scores across security, AI, rescues &amp; adoptions
                                                </p>
                                            </div>
                                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                Peak: {data.pulse_insights.peak_label} ({data.pulse_insights.peak_volume} ops)
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {data.pulse_insights.health_pillars.map((pillar, idx) => (
                                                <div key={idx} className="space-y-1.5 rounded-xl bg-gray-50/80 p-3 dark:bg-slate-800/50">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">{pillar.label}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{pillar.score}%</span>
                                                            <span
                                                                className={cn(
                                                                    'rounded-md px-2 py-0.5 text-[10px] font-bold',
                                                                    pillar.status === 'Healthy'
                                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                                        : pillar.status === 'Monitor'
                                                                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                                                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
                                                                )}
                                                            >
                                                                {pillar.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
                                                            style={{ width: `${Math.min(100, Math.max(4, pillar.score))}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{pillar.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                            Cross-Module Community Engagement
                                        </h3>
                                        <p className="mt-0.5 mb-4 text-xs text-gray-500 dark:text-gray-400">
                                            Visits, rehoming applications, gamification &amp; storytelling in window ({formatNumber(data.pulse_insights.total_platform_users)} total users)
                                        </p>

                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Shelter Visits</div>
                                                <div className="mt-1 font-fredoka text-xl font-bold text-slate-900 dark:text-white">
                                                    {formatNumber(data.pulse_insights.engagement.shelter_visits)}
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Rehoming Requests</div>
                                                <div className="mt-1 font-fredoka text-xl font-bold text-slate-900 dark:text-white">
                                                    {formatNumber(data.pulse_insights.engagement.rehoming_requests)}
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Certificates Issued</div>
                                                <div className="mt-1 font-fredoka text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                                    {formatNumber(data.pulse_insights.engagement.certificates_issued)}
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Badges Unlocked</div>
                                                <div className="mt-1 font-fredoka text-xl font-bold text-amber-600 dark:text-amber-400">
                                                    {formatNumber(data.pulse_insights.engagement.badges_awarded)}
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Published Stories</div>
                                                <div className="mt-1 font-fredoka text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatNumber(data.pulse_insights.engagement.blog_posts_published)}
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Blog Reactions</div>
                                                <div className="mt-1 font-fredoka text-xl font-bold text-rose-600 dark:text-rose-400">
                                                    {formatNumber(data.pulse_insights.engagement.blog_reactions)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════ */}
                    {/* TAB 2: RESCUE & SHELTER OPERATIONS                          */}
                    {/* ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'operations' && (
                        <div className="space-y-6">
                            {data.operations_deep_dive && (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <HighlightKpiCard
                                        label="Critical / High Unresolved"
                                        value={data.operations_deep_dive.kpis.critical_pending_sos}
                                        subValue={`Avg resolution SLA: ${data.operations_deep_dive.kpis.avg_resolution_hours} hrs`}
                                        icon={Clock}
                                        color={data.operations_deep_dive.kpis.critical_pending_sos > 0 ? 'bg-rose-500' : 'bg-emerald-500'}
                                    />
                                    <HighlightKpiCard
                                        label="Clinical Medical Logs"
                                        value={data.operations_deep_dive.kpis.medical_records_count}
                                        subValue={`${data.operations_deep_dive.kpis.follow_ups_count} post-adoption follow-ups`}
                                        icon={Stethoscope}
                                        color="bg-indigo-500"
                                    />
                                    <HighlightKpiCard
                                        label="Shelter Visits & Rehoming"
                                        value={data.operations_deep_dive.kpis.shelter_visits_count}
                                        subValue={`${data.operations_deep_dive.kpis.shelter_visits_completed} completed • ${data.operations_deep_dive.kpis.rehoming_requests_count} rehoming`}
                                        icon={CalendarCheck2}
                                        color="bg-teal-500"
                                    />
                                    <HighlightKpiCard
                                        label="Field Task Completion"
                                        value={`${data.operations_deep_dive.kpis.task_completion_rate}%`}
                                        subValue={`${data.operations_deep_dive.kpis.assigned_tasks_completed}/${data.operations_deep_dive.kpis.assigned_tasks_total} tasks • ${data.operations_deep_dive.kpis.strays_fed_period} strays fed`}
                                        icon={Wrench}
                                        color="bg-amber-500"
                                    />
                                </div>
                            )}
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

                            {data.operations_deep_dive && (
                                <>
                                    <div className="grid gap-6 lg:grid-cols-2">
                                        <ChartCard title="Clinical &amp; Medical Activity Mix" subtitle="Recorded treatments, vaccinations, and diagnostics">
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart
                                                    data={
                                                        data.operations_deep_dive.medical_type_breakdown.length
                                                            ? data.operations_deep_dive.medical_type_breakdown
                                                            : [{ name: 'No records', value: 0 }]
                                                    }
                                                    margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="value" name="Medical Logs" fill={PALETTE.primary} radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartCard>

                                        <ChartCard title="Assigned Field Task Status" subtitle="Volunteer & responder dispatch execution states">
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart
                                                    data={
                                                        data.operations_deep_dive.task_status_breakdown.length
                                                            ? data.operations_deep_dive.task_status_breakdown
                                                            : [{ name: 'No tasks', value: 0 }]
                                                    }
                                                    margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="value" name="Tasks" fill={PALETTE.amber} radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartCard>
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-2">
                                        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                            <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                                Active &amp; Priority Rescue Dispatch Queue
                                            </h3>
                                            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                                Open SOS and rescue incidents ranked by urgency ({data.operations_deep_dive.kpis.injury_reports_count} injury reports in window)
                                            </p>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead>
                                                        <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                            <th className="py-2 px-3">Type / Species</th>
                                                            <th className="py-2 px-3">Location</th>
                                                            <th className="py-2 px-3">Urgency</th>
                                                            <th className="py-2 px-3 text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                        {data.operations_deep_dive.recent_urgent_rescues.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="py-6 px-3 text-center font-semibold text-emerald-600">
                                                                    All period rescue reports are resolved
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            data.operations_deep_dive.recent_urgent_rescues.map((r) => (
                                                                <tr key={r.id}>
                                                                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                                                                        {r.type} • {r.animal_type}
                                                                    </td>
                                                                    <td className="py-2.5 px-3 text-gray-500">{r.location}</td>
                                                                    <td className="py-2.5 px-3">
                                                                        <span
                                                                            className={cn(
                                                                                'inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold',
                                                                                r.urgency === 'Critical' || r.urgency === 'High'
                                                                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
                                                                            )}
                                                                        >
                                                                            {r.urgency}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-2.5 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                                                                        {r.status}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                            <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                                Top Volunteer Responders &amp; Field Feeding
                                            </h3>
                                            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                                {data.operations_deep_dive.kpis.food_packs_distributed} packs distributed • {data.operations_deep_dive.kpis.food_pickups_completed} partner pickups
                                            </p>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead>
                                                        <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                            <th className="py-2 px-3">Volunteer</th>
                                                            <th className="py-2 px-3 text-right">Tasks</th>
                                                            <th className="py-2 px-3 text-right">Hours Logged</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                        {(data.ecosystem?.volunteerImpact.top_volunteers ?? []).length === 0 ? (
                                                            <tr>
                                                                <td colSpan={3} className="py-6 px-3 text-center text-gray-400">
                                                                    No volunteer task hours logged in this period
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            (data.ecosystem?.volunteerImpact.top_volunteers ?? []).map((v, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="py-2.5 px-3">
                                                                        <div className="font-semibold text-slate-800 dark:text-slate-200">{v.name}</div>
                                                                        <div className="text-[10px] text-gray-400">{v.email}</div>
                                                                    </td>
                                                                    <td className="py-2.5 px-3 text-right font-bold">{v.tasks_count}</td>
                                                                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{v.total_hours} hrs</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════ */}
                    {/* TAB 3: FINANCIALS & DONATIONS                               */}
                    {/* ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'financials' && (
                        <div className="space-y-6">
                            {data.financial_deep_dive && (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <HighlightKpiCard
                                        label="Unique Verified Donors"
                                        value={formatNumber(data.financial_deep_dive.kpis.unique_donors)}
                                        subValue={`Largest single gift: ${formatCurrency(data.financial_deep_dive.kpis.largest_donation)}`}
                                        icon={Users}
                                        color="bg-emerald-500"
                                    />
                                    <HighlightKpiCard
                                        label="Feeding Sponsorships"
                                        value={formatCurrency(data.financial_deep_dive.kpis.sponsorships_amount)}
                                        subValue={`${data.financial_deep_dive.kpis.sponsorships_count} sponsorships booked`}
                                        icon={HeartHandshake}
                                        color="bg-indigo-500"
                                    />
                                    <HighlightKpiCard
                                        label="In-Kind Contributions"
                                        value={formatNumber(data.financial_deep_dive.kpis.in_kind_count)}
                                        subValue={`${formatNumber(data.financial_deep_dive.kpis.in_kind_units)} total item units pledged`}
                                        icon={Gift}
                                        color="bg-amber-500"
                                    />
                                    <HighlightKpiCard
                                        label="Pending Review Queue"
                                        value={formatCurrency(data.financial_deep_dive.kpis.pending_verification_amount)}
                                        subValue={`${data.financial_deep_dive.kpis.pending_verification_count} donations • ${data.financial_deep_dive.kpis.pending_amount_edits} amount edits`}
                                        icon={AlertCircle}
                                        color={data.financial_deep_dive.kpis.pending_verification_count > 0 ? 'bg-rose-500' : 'bg-cyan-500'}
                                    />
                                </div>
                            )}
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

                            {data.financial_deep_dive && (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                            Payment Gateway Performance Matrix
                                        </h3>
                                        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                            Transaction count, total PHP volume, average ticket &amp; channel share
                                        </p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                        <th className="py-2 px-3">Channel</th>
                                                        <th className="py-2 px-3 text-right">Txns</th>
                                                        <th className="py-2 px-3 text-right">Total Volume</th>
                                                        <th className="py-2 px-3 text-right">Avg Gift</th>
                                                        <th className="py-2 px-3 text-right">Share</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                    {data.financial_deep_dive.channel_performance.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="py-6 px-3 text-center text-gray-400">
                                                                No gateway payments recorded in this period
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        data.financial_deep_dive.channel_performance.map((ch, idx) => (
                                                            <tr key={idx}>
                                                                <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{ch.method}</td>
                                                                <td className="py-2.5 px-3 text-right font-semibold">{ch.count}</td>
                                                                <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{formatCurrency(ch.total_amount)}</td>
                                                                <td className="py-2.5 px-3 text-right text-gray-600 dark:text-gray-300">{formatCurrency(ch.avg_amount)}</td>
                                                                <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{ch.share_pct}%</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                            Recent Donation Ledger ({data.financial_deep_dive.kpis.active_animal_needs} Open Animal Needs)
                                        </h3>
                                        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                            Latest incoming cash &amp; in-kind donor submissions in this period
                                        </p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                        <th className="py-2 px-3">Reference / Donor</th>
                                                        <th className="py-2 px-3">Type</th>
                                                        <th className="py-2 px-3 text-right">Amount</th>
                                                        <th className="py-2 px-3 text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                    {data.financial_deep_dive.recent_donations.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="py-6 px-3 text-center text-gray-400">
                                                                No donations recorded for this period
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        data.financial_deep_dive.recent_donations.map((don) => (
                                                            <tr key={don.id}>
                                                                <td className="py-2.5 px-3">
                                                                    <div className="font-semibold text-slate-800 dark:text-slate-200">{don.donor_name}</div>
                                                                    <div className="text-[10px] text-gray-400">{don.reference} • {don.time}</div>
                                                                </td>
                                                                <td className="py-2.5 px-3 text-gray-500">{don.type}</td>
                                                                <td className="py-2.5 px-3 text-right font-bold text-slate-800 dark:text-white">
                                                                    {don.amount > 0 ? formatCurrency(don.amount) : 'In-Kind'}
                                                                </td>
                                                                <td className="py-2.5 px-3 text-right">
                                                                    <span className="inline-flex rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                                                                        {don.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {data.security_extras && (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <ChartCard
                                        title="Audit Event Velocity"
                                        subtitle="Volume of tracked staff & system audit trail records across period"
                                    >
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={data.security_extras.audit_series} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="events" name="Audit Events" fill={PALETTE.violet} radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartCard>

                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                            Recent Database Backup Runs
                                        </h3>
                                        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                            Snapshot storage footprint, target disk, and execution status
                                        </p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                        <th className="py-2 px-3">Snapshot File</th>
                                                        <th className="py-2 px-3">Disk</th>
                                                        <th className="py-2 px-3 text-right">Size</th>
                                                        <th className="py-2 px-3 text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                    {data.security_extras.backup_history.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="py-6 px-3 text-center text-gray-400">
                                                                No database backups recorded yet
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        data.security_extras.backup_history.map((b) => (
                                                            <tr key={b.id}>
                                                                <td className="py-2.5 px-3">
                                                                    <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">{b.filename}</div>
                                                                    <div className="text-[10px] text-gray-400">{b.created_at}</div>
                                                                </td>
                                                                <td className="py-2.5 px-3 text-gray-500">{b.disk}</td>
                                                                <td className="py-2.5 px-3 text-right font-semibold">{b.size_mb} MB</td>
                                                                <td className="py-2.5 px-3 text-right">
                                                                    <span
                                                                        className={cn(
                                                                            'inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold',
                                                                            b.status === 'Completed'
                                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
                                                                        )}
                                                                    >
                                                                        {b.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {data.security_extras && (
                                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                        Live System Audit Trail Feed
                                    </h3>
                                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                        Most recent administrative mutations and security-relevant events
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                    <th className="py-2 px-3">Actor</th>
                                                    <th className="py-2 px-3">Action</th>
                                                    <th className="py-2 px-3">Description</th>
                                                    <th className="py-2 px-3 text-right">IP / Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                {data.security_extras.recent_audit_logs.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="py-6 px-3 text-center text-gray-400">
                                                            No recent audit logs in this window
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    data.security_extras.recent_audit_logs.map((log) => (
                                                        <tr key={log.id}>
                                                            <td className="py-2.5 px-3">
                                                                <div className="font-semibold text-slate-800 dark:text-slate-200">{log.actor}</div>
                                                                <div className="text-[10px] text-gray-400">{log.role}</div>
                                                            </td>
                                                            <td className="py-2.5 px-3">
                                                                <span className="inline-flex rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                                                                    {log.action}
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">{log.description}</td>
                                                            <td className="py-2.5 px-3 text-right text-[11px] text-gray-400">
                                                                <div className="font-mono">{log.ip_address}</div>
                                                                <div>{log.time}</div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {data.ai_telemetry_extras && (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <ChartCard
                                        title="Confidence Score Calibration"
                                        subtitle="Distribution of AI predictions across confidence brackets"
                                    >
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={data.ai_telemetry_extras.confidence_buckets} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="value" name="Predictions" fill={PALETTE.cyan} radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartCard>

                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                            Recent AI Prediction Audit Feed
                                        </h3>
                                        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                            Latest model inferences with confidence scores and validation state
                                        </p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                        <th className="py-2 px-3">Feature</th>
                                                        <th className="py-2 px-3 text-right">Confidence</th>
                                                        <th className="py-2 px-3 text-right">Validation</th>
                                                        <th className="py-2 px-3 text-right">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                    {data.ai_telemetry_extras.recent_predictions.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="py-6 px-3 text-center text-gray-400">
                                                                No AI predictions logged in this period
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        data.ai_telemetry_extras.recent_predictions.map((pred) => (
                                                            <tr key={pred.id}>
                                                                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{pred.feature}</td>
                                                                <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{pred.confidence}%</td>
                                                                <td className="py-2.5 px-3 text-right">
                                                                    <span
                                                                        className={cn(
                                                                            'inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold',
                                                                            pred.status_label === 'Accurate'
                                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                                                : pred.status_label === 'Inaccurate'
                                                                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                                                                  : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300',
                                                                        )}
                                                                    >
                                                                        {pred.status_label}
                                                                    </span>
                                                                </td>
                                                                <td className="py-2.5 px-3 text-right text-gray-400">{pred.time}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════ */}
                    {/* TAB 4: SECURITY & AUDIT LOGS                                */}
                    {/* ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            {data.security_posture && (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <HighlightKpiCard
                                        label="Login Success Rate"
                                        value={`${data.stats.login_success_rate}%`}
                                        subValue={`${data.stats.suspicious_logins} flagged alerts`}
                                        icon={ShieldCheck}
                                        color="bg-emerald-500"
                                    />
                                    <HighlightKpiCard
                                        label="Staff 2FA Enforcement"
                                        value={`${data.security_posture.staff_2fa_rate}%`}
                                        subValue={`${data.security_posture.staff_2fa_enabled}/${data.security_posture.staff_total} staff • ${data.security_posture.users_2fa_enabled} users total`}
                                        icon={Shield}
                                        color="bg-indigo-500"
                                    />
                                    <HighlightKpiCard
                                        label="Verified User Base"
                                        value={`${data.security_posture.email_verification_rate}%`}
                                        subValue={`${data.security_posture.verified_users}/${data.security_posture.total_users} verified accounts`}
                                        icon={UserCheck}
                                        color="bg-cyan-500"
                                    />
                                    <HighlightKpiCard
                                        label="Audit & Idempotency"
                                        value={formatNumber(data.stats.audit_events)}
                                        subValue={`${data.security_extras?.idempotency_guards_count ?? 0} replay guards • ${data.infrastructure?.webhook_events_processed ?? 0} webhooks`}
                                        icon={DatabaseBackup}
                                        color="bg-violet-500"
                                    />
                                </div>
                            )}

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
                                                    <th className="py-2.5 px-3 font-semibold">User</th>
                                                    <th className="py-2.5 px-3 font-semibold">Role</th>
                                                    <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                                                    <th className="py-2.5 px-3 font-semibold text-right">Last Active</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                {data.top_audit_actors.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="py-4 px-3 text-center text-gray-400">
                                                            No audit events recorded for this period
                                                        </td>
                                                    </tr>
                                                )}
                                                {data.top_audit_actors.map((actor, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                                                        <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                                                            <div>{actor.name}</div>
                                                            <div className="text-[10px] text-gray-400">{actor.email}</div>
                                                        </td>
                                                        <td className="py-2.5 px-3 whitespace-nowrap">
                                                            <span className="inline-flex items-center whitespace-nowrap rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                                                                {formatPillLabel(actor.role)}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                                                            {formatNumber(actor.actions_count)}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right text-gray-400">
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

                            {data.security_posture && (
                                <div className="grid gap-6 lg:grid-cols-3">
                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                            Authentication &amp; 2FA Compliance
                                        </h3>
                                        <p className="mt-0.5 mb-4 text-xs text-gray-500 dark:text-gray-400">
                                            Account verification &amp; multi-factor posture
                                        </p>
                                        <div className="space-y-2.5 text-xs">
                                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                                <span className="font-semibold text-gray-600 dark:text-gray-300">Staff 2FA Adoption</span>
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                    {data.security_posture.staff_2fa_enabled} / {data.security_posture.staff_total} ({data.security_posture.staff_2fa_rate}%)
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                                <span className="font-semibold text-gray-600 dark:text-gray-300">All Users with 2FA</span>
                                                <span className="font-bold text-slate-800 dark:text-white">{data.security_posture.users_2fa_enabled}</span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                                <span className="font-semibold text-gray-600 dark:text-gray-300">Email Verification Rate</span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.security_posture.email_verification_rate}%</span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                                <span className="font-semibold text-gray-600 dark:text-gray-300">Login Success Rate</span>
                                                <span className="font-bold text-slate-800 dark:text-white">{data.stats.login_success_rate}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                            Top Flagged IP Addresses
                                        </h3>
                                        <p className="mt-0.5 mb-4 text-xs text-gray-500 dark:text-gray-400">
                                            IP sources generating failed or suspicious login attempts in this period
                                        </p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                        <th className="py-2 px-3">IP Address</th>
                                                        <th className="py-2 px-3 text-right">Failed / Flagged</th>
                                                        <th className="py-2 px-3 text-right">Suspicious</th>
                                                        <th className="py-2 px-3 text-right">Last Seen</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                    {data.security_posture.top_suspicious_ips.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="py-6 px-3 text-center text-emerald-600 font-semibold">
                                                                No suspicious IP activity recorded in this period
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        data.security_posture.top_suspicious_ips.map((ip, idx) => (
                                                            <tr key={idx}>
                                                                <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">{ip.ip_address}</td>
                                                                <td className="py-2.5 px-3 text-right font-semibold">{ip.attempts_count}</td>
                                                                <td className="py-2.5 px-3 text-right font-bold text-rose-600">{ip.suspicious_count}</td>
                                                                <td className="py-2.5 px-3 text-right text-gray-400">{ip.last_seen}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {data.security_extras && (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <ChartCard
                                        title="Audit Event Velocity"
                                        subtitle="Volume of tracked staff & system audit trail records across period"
                                    >
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={data.security_extras.audit_series} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="events" name="Audit Events" fill={PALETTE.violet} radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartCard>

                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                            Recent Database Backup Runs
                                        </h3>
                                        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                            Snapshot storage footprint, target disk, and execution status
                                        </p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                        <th className="py-2 px-3">Snapshot File</th>
                                                        <th className="py-2 px-3">Disk</th>
                                                        <th className="py-2 px-3 text-right">Size</th>
                                                        <th className="py-2 px-3 text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                    {data.security_extras.backup_history.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="py-6 px-3 text-center text-gray-400">
                                                                No database backups recorded yet
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        data.security_extras.backup_history.map((b) => (
                                                            <tr key={b.id}>
                                                                <td className="py-2.5 px-3">
                                                                    <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">{b.filename}</div>
                                                                    <div className="text-[10px] text-gray-400">{b.created_at}</div>
                                                                </td>
                                                                <td className="py-2.5 px-3 text-gray-500">{b.disk}</td>
                                                                <td className="py-2.5 px-3 text-right font-semibold">{b.size_mb} MB</td>
                                                                <td className="py-2.5 px-3 text-right">
                                                                    <span
                                                                        className={cn(
                                                                            'inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold',
                                                                            b.status === 'Completed'
                                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
                                                                        )}
                                                                    >
                                                                        {b.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {data.security_extras && (
                                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                        Live System Audit Trail Feed
                                    </h3>
                                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                        Most recent administrative mutations and security-relevant events
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                    <th className="py-2 px-3">Actor</th>
                                                    <th className="py-2 px-3">Action</th>
                                                    <th className="py-2 px-3">Description</th>
                                                    <th className="py-2 px-3 text-right">IP / Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                {data.security_extras.recent_audit_logs.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="py-6 px-3 text-center text-gray-400">
                                                            No recent audit logs in this window
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    data.security_extras.recent_audit_logs.map((log) => (
                                                        <tr key={log.id}>
                                                            <td className="py-2.5 px-3">
                                                                <div className="font-semibold text-slate-800 dark:text-slate-200">{log.actor}</div>
                                                                <div className="text-[10px] text-gray-400">{log.role}</div>
                                                            </td>
                                                            <td className="py-2.5 px-3">
                                                                <span className="inline-flex rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                                                                    {log.action}
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">{log.description}</td>
                                                            <td className="py-2.5 px-3 text-right text-[11px] text-gray-400">
                                                                <div className="font-mono">{log.ip_address}</div>
                                                                <div>{log.time}</div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {data.ai_telemetry_extras && (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <ChartCard
                                        title="Confidence Score Calibration"
                                        subtitle="Distribution of AI predictions across confidence brackets"
                                    >
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={data.ai_telemetry_extras.confidence_buckets} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="value" name="Predictions" fill={PALETTE.cyan} radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartCard>

                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                            Recent AI Prediction Audit Feed
                                        </h3>
                                        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                            Latest model inferences with confidence scores and validation state
                                        </p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                        <th className="py-2 px-3">Feature</th>
                                                        <th className="py-2 px-3 text-right">Confidence</th>
                                                        <th className="py-2 px-3 text-right">Validation</th>
                                                        <th className="py-2 px-3 text-right">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                    {data.ai_telemetry_extras.recent_predictions.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="py-6 px-3 text-center text-gray-400">
                                                                No AI predictions logged in this period
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        data.ai_telemetry_extras.recent_predictions.map((pred) => (
                                                            <tr key={pred.id}>
                                                                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{pred.feature}</td>
                                                                <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{pred.confidence}%</td>
                                                                <td className="py-2.5 px-3 text-right">
                                                                    <span
                                                                        className={cn(
                                                                            'inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold',
                                                                            pred.status_label === 'Accurate'
                                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                                                : pred.status_label === 'Inaccurate'
                                                                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                                                                  : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300',
                                                                        )}
                                                                    >
                                                                        {pred.status_label}
                                                                    </span>
                                                                </td>
                                                                <td className="py-2.5 px-3 text-right text-gray-400">{pred.time}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════ */}
                    {/* TAB 5: AI TELEMETRY & AUTOMATION                            */}
                    {/* ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'ai' && (
                        <div className="space-y-6">
                            {data.ai_telemetry_extras && (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <HighlightKpiCard
                                        label="Total AI Invocations"
                                        value={formatNumber(data.stats.ai_predictions)}
                                        subValue={`Mean confidence: ${data.stats.ai_avg_confidence}%`}
                                        icon={Cpu}
                                        color="bg-indigo-500"
                                    />
                                    <HighlightKpiCard
                                        label="Verified Model Accuracy"
                                        value={`${data.stats.ai_accuracy_rate}%`}
                                        subValue={`${data.ai_telemetry_extras.evaluated_count} human-evaluated logs`}
                                        icon={CheckCircle2}
                                        color="bg-emerald-500"
                                    />
                                    <HighlightKpiCard
                                        label="High-Confidence (>=80%)"
                                        value={`${data.ai_telemetry_extras.high_confidence_rate}%`}
                                        subValue="Strong prediction certainty share"
                                        icon={Sparkles}
                                        color="bg-cyan-500"
                                    />
                                    <HighlightKpiCard
                                        label="Validation Queue & Errors"
                                        value={formatNumber(data.ai_telemetry_extras.pending_review_count)}
                                        subValue={`${data.ai_telemetry_extras.inaccurate_count} flagged inaccurate`}
                                        icon={AlertCircle}
                                        color={data.ai_telemetry_extras.inaccurate_count > 0 ? 'bg-amber-500' : 'bg-violet-500'}
                                    />
                                </div>
                            )}

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

                            {data.ai_feature_performance && (
                                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                        AI Feature Performance Matrix
                                    </h3>
                                    <p className="mt-0.5 mb-4 text-xs text-gray-500 dark:text-gray-400">
                                        Execution volume, average model confidence, and human-verified accuracy by AI pipeline
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                    <th className="py-2.5 px-3">Feature Pipeline</th>
                                                    <th className="py-2.5 px-3 text-right">Predictions</th>
                                                    <th className="py-2.5 px-3 text-right">Avg Confidence</th>
                                                    <th className="py-2.5 px-3 text-right">Evaluated</th>
                                                    <th className="py-2.5 px-3 text-right">Verified Accuracy</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                {data.ai_feature_performance.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="py-6 px-3 text-center text-gray-400">
                                                            No AI predictions logged for this period
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    data.ai_feature_performance.map((feat, idx) => (
                                                        <tr key={idx}>
                                                            <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{feat.feature}</td>
                                                            <td className="py-2.5 px-3 text-right font-semibold">{formatNumber(feat.total)}</td>
                                                            <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{feat.avg_confidence}%</td>
                                                            <td className="py-2.5 px-3 text-right text-gray-500">{feat.evaluated_count}</td>
                                                            <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                                                                {feat.accuracy_rate !== null ? `${feat.accuracy_rate}%` : 'Pending'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {data.ai_telemetry_extras && (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <ChartCard
                                        title="Confidence Score Calibration"
                                        subtitle="Distribution of AI predictions across confidence brackets"
                                    >
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={data.ai_telemetry_extras.confidence_buckets} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="value" name="Predictions" fill={PALETTE.cyan} radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartCard>

                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                            Recent AI Prediction Audit Feed
                                        </h3>
                                        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                            Latest model inferences with confidence scores and validation state
                                        </p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                        <th className="py-2 px-3">Feature</th>
                                                        <th className="py-2 px-3 text-right">Confidence</th>
                                                        <th className="py-2 px-3 text-right">Validation</th>
                                                        <th className="py-2 px-3 text-right">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                    {data.ai_telemetry_extras.recent_predictions.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="py-6 px-3 text-center text-gray-400">
                                                                No AI predictions logged in this period
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        data.ai_telemetry_extras.recent_predictions.map((pred) => (
                                                            <tr key={pred.id}>
                                                                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{pred.feature}</td>
                                                                <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{pred.confidence}%</td>
                                                                <td className="py-2.5 px-3 text-right">
                                                                    <span
                                                                        className={cn(
                                                                            'inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold',
                                                                            pred.status_label === 'Accurate'
                                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                                                : pred.status_label === 'Inaccurate'
                                                                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                                                                  : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300',
                                                                        )}
                                                                    >
                                                                        {pred.status_label}
                                                                    </span>
                                                                </td>
                                                                <td className="py-2.5 px-3 text-right text-gray-400">{pred.time}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════ */}
                    {/* TAB 6: ECOSYSTEM & GOVERNANCE                               */}
                    {/* ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'ecosystem' && data.ecosystem && data.governance && (
                        <div className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <HighlightKpiCard
                                    label="Shelter Animal Census"
                                    value={data.ecosystem.shelterCensus.total}
                                    subValue={`${data.ecosystem.shelterCensus.available} available • ${data.ecosystem.shelterCensus.vaccination_rate}% vax`}
                                    icon={PawPrint}
                                    color="bg-teal-500"
                                />
                                <HighlightKpiCard
                                    label="Foster Utilization"
                                    value={`${data.ecosystem.fosterMetrics.utilization_rate}%`}
                                    subValue={`${data.ecosystem.fosterMetrics.active_placements}/${data.ecosystem.fosterMetrics.total_capacity} capacity`}
                                    icon={HeartHandshake}
                                    color="bg-indigo-500"
                                />
                                <HighlightKpiCard
                                    label="Care Sustainability"
                                    value={`${data.ecosystem.inventorySustainability.sustainability.est_days} Days`}
                                    subValue={data.ecosystem.inventorySustainability.sustainability.urgency_status}
                                    icon={Coins}
                                    color="bg-amber-500"
                                />
                                <HighlightKpiCard
                                    label="Field Volunteer Output"
                                    value={`${data.ecosystem.volunteerImpact.hours_logged} hrs`}
                                    subValue={`${data.ecosystem.volunteerImpact.strays_fed} strays fed • ${data.ecosystem.volunteerImpact.feeding_routes_completed} routes`}
                                    icon={UserCheck}
                                    color="bg-emerald-500"
                                />
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">
                                <ChartCard
                                    title="Shelter Animal Population Census"
                                    subtitle="Live distribution across adoption, foster, and clinical care"
                                >
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={data.ecosystem.shelterCensus.status_breakdown} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="value" name="Animals" fill={PALETTE.primary} radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                        Governance, SLA &amp; Infrastructure Queue
                                    </h3>
                                    <p className="mt-0.5 mb-4 text-xs text-gray-500 dark:text-gray-400">
                                        Pending approvals, support escalations, and archive/backup health
                                    </p>
                                    <div className="space-y-2.5 text-xs">
                                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">Pending Event Approvals</span>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.governance.pending_events}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">Pending Story / Blog Reviews</span>
                                            <span className="font-bold text-amber-600 dark:text-amber-400">{data.governance.pending_blogs}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">Escalated Help Desk Tickets</span>
                                            <span className="font-bold text-rose-600 dark:text-rose-400">{data.governance.escalated_tickets}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">Help Desk Avg Resolution SLA</span>
                                            <span className="font-bold text-slate-800 dark:text-white">{data.ecosystem.communityMetrics.help_desk_avg_resolution_hours} hrs</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">Soft-Deleted Archive Backlog</span>
                                            <span className="font-bold text-slate-800 dark:text-white">{data.governance.archived_records_total} records</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">Latest Completed Backup</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.governance.latest_backup_at}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="mb-1 flex items-center gap-2 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                        <MapPin className="h-4 w-4 text-indigo-500" />
                                        Top Rescue Hotspots
                                    </h3>
                                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                        Zones with highest rescue &amp; SOS dispatch volume
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                    <th className="py-2 px-3">Location</th>
                                                    <th className="py-2 px-3 text-right">Reports</th>
                                                    <th className="py-2 px-3 text-right">Resolution</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                {data.ecosystem.topRescueLocations.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="py-4 px-3 text-center text-gray-400">
                                                            No location data recorded in period
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    data.ecosystem.topRescueLocations.map((loc, idx) => (
                                                        <tr key={idx}>
                                                            <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{loc.location}</td>
                                                            <td className="py-2.5 px-3 text-right font-bold">{loc.total}</td>
                                                            <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{loc.resolution_rate}%</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="mb-1 flex items-center gap-2 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                        <Package className="h-4 w-4 text-rose-500" />
                                        Low-Stock Inventory Alerts ({data.ecosystem.inventorySustainability.low_stock_count})
                                    </h3>
                                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                        Critical shelter supplies at or below minimum threshold
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                    <th className="py-2 px-3">Item</th>
                                                    <th className="py-2 px-3">Category</th>
                                                    <th className="py-2 px-3 text-right">Stock / Min</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                {data.ecosystem.inventorySustainability.low_stock_items.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="py-4 px-3 text-center text-emerald-600 font-semibold">
                                                            All inventory supplies are adequately stocked
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    data.ecosystem.inventorySustainability.low_stock_items.map((item) => (
                                                        <tr key={item.id}>
                                                            <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{item.name}</td>
                                                            <td className="py-2.5 px-3 text-gray-500">{item.category}</td>
                                                            <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                                                                {item.quantity} / {item.min_threshold} {item.unit}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {data.infrastructure && data.platform_ecosystem && (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                            Infrastructure &amp; Payment Webhooks
                                        </h3>
                                        <p className="mt-0.5 mb-4 text-xs text-gray-500 dark:text-gray-400">
                                            Database backup footprint and payment webhook processing
                                        </p>
                                        <div className="space-y-2.5 text-xs">
                                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                                <span className="font-semibold text-gray-600 dark:text-gray-300">Total Completed Backup Size</span>
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.infrastructure.backups_total_size_mb} MB</span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                                <span className="font-semibold text-gray-600 dark:text-gray-300">Backups (Completed / Failed)</span>
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    {data.infrastructure.backups_completed} / {data.infrastructure.backups_failed}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                                <span className="font-semibold text-gray-600 dark:text-gray-300">Webhook Events Processed</span>
                                                <span className="font-bold text-emerald-600">{data.infrastructure.webhook_events_processed} / {data.infrastructure.webhook_events_total}</span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                                <span className="font-semibold text-gray-600 dark:text-gray-300">Pending Webhook Queue</span>
                                                <span className="font-bold text-amber-600">{data.infrastructure.webhook_events_pending}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                            Partners, Resources &amp; Community Honors
                                        </h3>
                                        <p className="mt-0.5 mb-4 text-xs text-gray-500 dark:text-gray-400">
                                            External partner coverage, downloadable guides, and public inquiries
                                        </p>
                                        <div className="space-y-2.5 text-xs">
                                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                                <span className="font-semibold text-gray-600 dark:text-gray-300">Active Partners (Total)</span>
                                                <span className="font-bold text-teal-600">{data.platform_ecosystem.partners_active} ({data.platform_ecosystem.partners_total})</span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                                <span className="font-semibold text-gray-600 dark:text-gray-300">Daily Food / Emergency Partners</span>
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    {data.platform_ecosystem.partners_daily_food} / {data.platform_ecosystem.partners_emergency}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                                <span className="font-semibold text-gray-600 dark:text-gray-300">Resource Downloads ({data.platform_ecosystem.resources_active} files)</span>
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatNumber(data.platform_ecosystem.resources_total_downloads)}</span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 dark:bg-slate-800/50">
                                                <span className="font-semibold text-gray-600 dark:text-gray-300">Community Honors / Contact Inquiries</span>
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    {data.platform_ecosystem.community_honors} / {data.platform_ecosystem.contact_messages_period}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {data.platform_ecosystem && (
                                <div className="space-y-6">
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <HighlightKpiCard
                                            label="Partner Food Pickups"
                                            value={data.platform_ecosystem.food_pickups_completed ?? 0}
                                            subValue={`${data.platform_ecosystem.food_pickups_total ?? 0} scheduled in window`}
                                            icon={Handshake}
                                            color="bg-teal-500"
                                        />
                                        <HighlightKpiCard
                                            label="Contact Inbox Volume"
                                            value={data.platform_ecosystem.contact_messages_period}
                                            subValue={`${data.platform_ecosystem.contact_messages_unread ?? 0} awaiting response`}
                                            icon={MessageSquareText}
                                            color="bg-amber-500"
                                        />
                                        <HighlightKpiCard
                                            label="Certificates & Badges"
                                            value={
                                                (data.platform_ecosystem.certificates_issued_period ?? 0) +
                                                (data.platform_ecosystem.badges_awarded_period ?? 0)
                                            }
                                            subValue={`${data.platform_ecosystem.certificates_issued_period ?? 0} certs • ${data.platform_ecosystem.badges_awarded_period ?? 0} badges`}
                                            icon={Award}
                                            color="bg-indigo-500"
                                        />
                                        <HighlightKpiCard
                                            label="Published Stories & Likes"
                                            value={data.platform_ecosystem.blog_posts_published ?? 0}
                                            subValue={`${data.platform_ecosystem.blog_reactions_period ?? 0} reactions in window`}
                                            icon={FileText}
                                            color="bg-rose-500"
                                        />
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-2">
                                        <ChartCard
                                            title="Help Desk SLA &amp; Ticket Status"
                                            subtitle="Support ticket volume by current resolution status"
                                        >
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart
                                                    data={
                                                        (data.platform_ecosystem.help_desk_status_breakdown?.length ?? 0) > 0
                                                            ? data.platform_ecosystem.help_desk_status_breakdown
                                                            : [{ name: 'No tickets', value: 0 }]
                                                    }
                                                    margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="value" name="Tickets" fill={PALETTE.emerald} radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartCard>

                                        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                            <h3 className="mb-1 font-fredoka text-base font-bold text-slate-900 dark:text-white">
                                                Top Downloaded Resource Guides
                                            </h3>
                                            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                                Most accessed public welfare &amp; emergency manuals
                                            </p>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead>
                                                        <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                            <th className="py-2 px-3">Guide Title</th>
                                                            <th className="py-2 px-3">Category / Format</th>
                                                            <th className="py-2 px-3 text-right">Downloads</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                                        {(data.platform_ecosystem.top_resources ?? []).length === 0 ? (
                                                            <tr>
                                                                <td colSpan={3} className="py-6 px-3 text-center text-gray-400">
                                                                    No active resource files published
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            (data.platform_ecosystem.top_resources ?? []).map((res, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{res.title}</td>
                                                                    <td className="py-2.5 px-3 text-gray-500">
                                                                        {res.category} • {res.file_type}
                                                                    </td>
                                                                    <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                                                                        {formatNumber(res.download_count)}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════ */}
                    {/* TAB 7: PDF & CSV EXPORTS                                    */}
                    {/* ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'exports' && (
                        <div className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <HighlightKpiCard
                                    label="Selected Window"
                                    value={period === 'custom' ? 'Custom Range' : (data.date_range?.label ?? period.toUpperCase())}
                                    subValue={formatReadableDateRange(data.date_range?.start, data.date_range?.end)}
                                    icon={CalendarCheck2}
                                    color="bg-indigo-500"
                                />
                                <HighlightKpiCard
                                    label="Financial Records Ready"
                                    value={formatCurrency(data.stats.donations_amount)}
                                    subValue={`${data.stats.donations_count} donations • ${data.payment_methods.length} gateways`}
                                    icon={Coins}
                                    color="bg-emerald-500"
                                />
                                <HighlightKpiCard
                                    label="Operations & AI Dataset"
                                    value={formatNumber(data.stats.rescue_reports + data.stats.ai_predictions)}
                                    subValue={`${data.stats.rescue_reports} rescues • ${data.stats.ai_predictions} AI logs`}
                                    icon={Activity}
                                    color="bg-cyan-500"
                                />
                                <HighlightKpiCard
                                    label="Security & Audit Events"
                                    value={formatNumber(data.stats.audit_events)}
                                    subValue={`${data.stats.suspicious_logins} alerts • ${data.stats.backups} backups`}
                                    icon={ShieldCheck}
                                    color="bg-violet-500"
                                />
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">
                            {/* Executive PDF Reports */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                        <Printer className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-fredoka text-xl font-bold text-slate-900 dark:text-white">
                                            Executive PDF Reports
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Branded A4 reports with embedded logos, vector charts, and full telemetry
                                        </p>
                                    </div>
                                </div>
                                <hr className="my-4 border-gray-100 dark:border-slate-800" />

                                <div className="space-y-3">
                                    {(
                                        [
                                            { key: 'all', title: 'Complete Executive Intelligence PDF', desc: 'All KPIs, trends, security, AI, ecosystem & transaction logs' },
                                            { key: 'operations', title: 'Rescue & Shelter Operations PDF', desc: 'Rescue volume, species split, adoption pipeline & case logs' },
                                            { key: 'financials', title: 'Donations, Revenue & Sustainability PDF', desc: 'Payment gateways, Care runway & verified donations' },
                                            { key: 'security', title: 'Security Posture & Audit Trail PDF', desc: '2FA compliance, flagged IPs, top actors & security events' },
                                            { key: 'ai', title: 'AI Telemetry & Validation PDF', desc: 'Model precision, feature performance matrix & verification split' },
                                            { key: 'ecosystem', title: 'Ecosystem, Infrastructure & Governance PDF', desc: 'Partners, backups, webhooks, foster capacity & inventory alerts' },
                                        ] as const
                                    ).map((item) => (
                                        <div
                                            key={item.key}
                                            className="flex flex-col gap-3 rounded-xl border border-gray-100 p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"
                                        >
                                            <div>
                                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</div>
                                                <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.desc}</div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleExportPdf(item.key, false)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 cursor-pointer"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Preview
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleExportPdf(item.key, true)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-xs transition hover:opacity-95 cursor-pointer"
                                                >
                                                    <Printer className="h-3.5 w-3.5" />
                                                    Export PDF
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Excel / CSV Exports */}
                            <div className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                                            <FileSpreadsheet className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="font-fredoka text-xl font-bold text-slate-900 dark:text-white">
                                                Excel / CSV Export
                                            </h2>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Download period-scoped system telemetry in spreadsheet format ({data.date_range?.label ?? period.toUpperCase()})
                                            </p>
                                        </div>
                                    </div>
                                    <hr className="my-4 border-gray-100 dark:border-slate-800" />

                                    <div className="space-y-3">
                                        {(
                                            [
                                                {
                                                    key: 'full',
                                                    title: 'Full Executive Analytics CSV',
                                                    desc: 'All KPIs, operations, payment channels, security posture, AI & ecosystem tables',
                                                },
                                                {
                                                    key: 'operations',
                                                    title: 'Rescue, Clinical & Field Operations CSV',
                                                    desc: 'Rescue status, SLA hours, medical records, field tasks, census & hotspots',
                                                },
                                                {
                                                    key: 'financials',
                                                    title: 'Donations, Gateways & Sponsorships CSV',
                                                    desc: 'Payment channel performance, sponsorships, in-kind units & recent ledger',
                                                },
                                                {
                                                    key: 'security',
                                                    title: 'Security Posture, 2FA & Audit Trail CSV',
                                                    desc: '2FA compliance, flagged IPs, backup storage, webhooks & top audit actors',
                                                },
                                                {
                                                    key: 'ai',
                                                    title: 'AI Telemetry & Validation Matrix CSV',
                                                    desc: 'Per-feature prediction accuracy, confidence brackets & evaluation backlog',
                                                },
                                                {
                                                    key: 'ecosystem',
                                                    title: 'Ecosystem, Partners & Governance CSV',
                                                    desc: 'Partner coverage, resource downloads, Care runway & top field volunteers',
                                                },
                                            ] as const
                                        ).map((csv) => (
                                            <button
                                                key={csv.key}
                                                type="button"
                                                onClick={() => handleExport(csv.key)}
                                                className="flex w-full items-center justify-between rounded-xl border border-gray-100 p-3.5 text-left transition-colors hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800/40 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <FileText className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                            {csv.title}
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                                            {csv.desc}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                    <Download className="h-3.5 w-3.5" />
                                                    CSV
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 rounded-xl border border-indigo-100/70 bg-indigo-50/50 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/20">
                                    <div className="flex gap-2 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                                        <ShieldAlert className="h-4 w-4 shrink-0" />
                                        <span>Executive Data Notice</span>
                                    </div>
                                    <p className="mt-1 text-[10px] leading-relaxed text-indigo-800/80 dark:text-indigo-300/80">
                                        Super-Admin exports include security logs, IP diagnostics, and financial totals. Store downloaded files securely.
                                    </p>
                                </div>
                            </div>
                        </div>
                        </div>
                    )}
                </div>
            )}
        </DashboardSectionPage>
    );
}


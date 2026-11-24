import { Head, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Download,
    ExternalLink,
    FileSpreadsheet,
    FileText,
    Gift,
    Heart,
    HeartHandshake,
    MapPin,
    Package,
    PawPrint,
    Percent,
    Printer,
    RefreshCw,
    ShieldAlert,
    Target,
    TrendingUp,
    Users,
    Utensils,
} from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import { reportsAnalytics as reportsAnalyticsRoute } from '@/routes/account/admin';
import reportsAnalytics from '@/routes/account/admin/reports-analytics';

type Dataset = {
    rescues: number[];
    adoptions: number[];
    donations: number[];
};

type Summary = {
    rescues: { total: number; resolved: number; pending: number; assigned?: number; duplicate: number };
    adoptions: { total: number; approved: number; rejected: number; pending: number; scheduled?: number };
    donations: {
        total_cash: number;
        current_month_cash?: number;
        total_cash_count: number;
        total_inkind_count: number;
        total_sponsor_amount?: number;
    };
    volunteers: { total: number; pending_apps: number };
};

type Breakdown = {
    cats: number;
    dogs: number;
    others: number;
};

type DonationBreakdown = {
    cash: number;
    inkind: number;
    sponsor: number;
};

type Kpis = {
    period_rescues: number;
    period_rescues_resolved: number;
    rescues_delta: number;
    period_adoptions: number;
    period_adoptions_approved: number;
    adoptions_delta: number;
    period_donations_amount: number;
    donations_delta: number;
};

type ShelterCensus = {
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
    species_breakdown: { name: string; value: number }[];
    status_breakdown: { name: string; value: number }[];
};

type FosterMetrics = {
    active_placements: number;
    completed_placements: number;
    approved_parents: number;
    total_capacity: number;
    utilization_rate: number;
};

type VolunteerImpact = {
    active_volunteers: number;
    pending_applications: number;
    hours_logged: number;
    completed_tasks: number;
    feeding_routes_completed: number;
    strays_fed: number;
    food_packs_distributed: number;
    partner_pickups_completed: number;
    injury_reports_active: number;
    injury_reports_period: number;
    certificates_issued: number;
    top_volunteers: { name: string; email: string; tasks_count: number; total_hours: number }[];
};

type CommunityMetrics = {
    events_total: number;
    events_approved: number;
    events_pending: number;
    shelter_visits_pending: number;
    shelter_visits_confirmed: number;
    rehoming_pending: number;
    rehoming_intaken: number;
    blogs_published: number;
    blogs_pending: number;
    help_desk_open: number;
    help_desk_escalated: number;
    help_desk_resolved_period: number;
    help_desk_avg_resolution_hours: number;
};

type InventorySustainability = {
    total_items: number;
    low_stock_count: number;
    low_stock_items: {
        id: number;
        name: string;
        quantity: number;
        min_threshold: number;
        unit: string;
        category: string;
    }[];
    sustainability: {
        verified_funds: number;
        daily_cost: number;
        est_days: number;
        urgency_status: string;
        urgency_label: string;
        formatted_endpoint: string;
    };
};

type RescueHotspot = {
    location: string;
    total: number;
    resolved: number;
    resolution_rate: number;
};

type NameValue = { name: string; value: number };

type AdminInsights = {
    animalCare: {
        medical_records_total: number;
        medical_records_period: number;
        active_treatments: number;
        upcoming_due_medical: number;
        medical_type_breakdown: NameValue[];
        open_wishlist_needs: number;
        fulfilled_wishlist_needs: number;
        urgent_wishlist_needs: number;
        age_breakdown: NameValue[];
        gender_breakdown: NameValue[];
    };
    rescueFunnel: {
        status_breakdown: NameValue[];
        type_breakdown: NameValue[];
        urgency_breakdown: NameValue[];
        ai_validation_pending: number;
        ai_validation_approved: number;
        ai_validation_rejected: number;
    };
    adoptionPipeline: {
        stages: NameValue[];
        visits_pending: number;
        visits_confirmed: number;
        visits_total_visitors: number;
        rehoming_pending: number;
        rehoming_intaken: number;
        follow_ups_total: number;
        follow_ups_period: number;
        follow_ups_due_soon: number;
    };
    fosterVolunteerOps: {
        foster_updates_period: number;
        foster_updates_unacknowledged: number;
        foster_updates_urgent: number;
        pickups_pending: number;
        pickups_completed_period: number;
        pickups_missed_period: number;
        injuries_open: number;
        injuries_confirmed_period: number;
        volunteer_roles: NameValue[];
    };
    donationsAndSupport: {
        pending_donation_reviews: number;
        rejected_donations: number;
        pending_amount_edit_requests: number;
        total_inventory_units: number;
        expiring_batches_30d: number;
        expired_batches_with_stock: number;
        blogs_published: number;
        blogs_pending: number;
        blogs_total_views: number;
        blogs_total_shares: number;
        help_desk_priorities: NameValue[];
        events_upcoming_spots: number;
        event_registrations_period: number;
    };
};

type ReportsProps = {
    period?: string;
    dateRange?: { start: string; end: string; label: string };
    months: string[];
    weeks: string[];
    years: string[];
    monthly: Dataset;
    weekly: Dataset;
    yearly: Dataset;
    summary: Summary;
    animalBreakdown: Breakdown;
    donationBreakdown: DonationBreakdown;
    kpis?: Kpis;
    shelterCensus?: ShelterCensus;
    fosterMetrics?: FosterMetrics;
    volunteerImpact?: VolunteerImpact;
    communityMetrics?: CommunityMetrics;
    inventorySustainability?: InventorySustainability;
    topRescueLocations?: RescueHotspot[];
    adminInsights?: AdminInsights;
};

type TimeFilter = 'weekly' | 'monthly' | 'yearly';
type ActiveTab = 'overview' | 'shelter' | 'field' | 'exports';
type PeriodKey = '7d' | '30d' | '90d' | '1y' | 'all';

function DeltaBadge({ delta }: { delta?: number }) {
    if (delta === undefined || delta === 0) {
        return <span className="text-[11px] font-semibold text-gray-400">0.0%</span>;
    }

    const positive = delta > 0;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold',
                positive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400',
            )}
        >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
        </span>
    );
}

export default function ReportsAnalytics({
    period = '30d',
    months,
    weeks,
    years,
    monthly,
    weekly,
    yearly,
    summary,
    animalBreakdown,
    donationBreakdown,
    kpis,
    shelterCensus,
    fosterMetrics,
    volunteerImpact,
    communityMetrics,
    inventorySustainability,
    topRescueLocations = [],
    adminInsights,
}: ReportsProps) {
    const { can } = usePermissions();
    const canExportReports = can('analytics.export');
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>((period as PeriodKey) || '30d');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const chartFilter: TimeFilter =
        selectedPeriod === '7d' ? 'weekly' : selectedPeriod === 'all' ? 'yearly' : 'monthly';

    const buildQuery = (overrides?: Record<string, string | number | boolean>) => ({
        period: selectedPeriod,
        ...overrides,
    });

    const applyPeriod = (nextPeriod: PeriodKey, refresh = false) => {
        setSelectedPeriod(nextPeriod);
        setIsRefreshing(true);

        const query: Record<string, string | number> = { period: nextPeriod };

        if (refresh) {
            query.refresh = 1;
        }

        router.get(reportsAnalyticsRoute.url({ query }), {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsRefreshing(false),
        });
    };

    const openPdfReport = (section: 'all' | 'rescues' | 'adoptions' | 'donations' | 'operations' = 'all', autoprint = true) => {
        const url = reportsAnalytics.pdf.url({
            query: buildQuery({
                section,
                ...(autoprint ? { autoprint: 1 } : {}),
            }),
        });
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const getActiveDataset = () => {
        switch (chartFilter) {
            case 'weekly':
                return { data: weekly, labels: weeks };
            case 'yearly':
                return { data: yearly, labels: years };
            case 'monthly':
            default:
                return { data: monthly, labels: months };
        }
    };

    const { data: activeData, labels: activeLabels } = getActiveDataset();

    const chartData = activeLabels.map((label, index) => ({
        name: chartFilter === 'yearly' ? label : chartFilter === 'weekly' ? label : label.substring(0, 3),
        Rescues: activeData.rescues[index] ?? 0,
        Adoptions: activeData.adoptions[index] ?? 0,
        Donations: activeData.donations[index] ?? 0,
    }));

    const animalPieData = [
        { name: 'Cats', value: animalBreakdown.cats, color: '#10B981' },
        { name: 'Dogs', value: animalBreakdown.dogs, color: '#3B82F6' },
        { name: 'Others', value: animalBreakdown.others, color: '#6B7280' },
    ].filter((item) => item.value > 0);

    const donationPieData = [
        { name: 'Cash', value: donationBreakdown.cash, color: '#F59E0B' },
        { name: 'In-Kind', value: donationBreakdown.inkind, color: '#8B5CF6' },
        { name: 'Sponsorships', value: donationBreakdown.sponsor, color: '#EC4899' },
    ].filter((item) => item.value > 0);

    const rescueResolutionRate =
        summary.rescues.total > 0 ? Math.round((summary.rescues.resolved / summary.rescues.total) * 100) : 0;

    const adoptionApprovalRate =
        summary.adoptions.total > 0 ? Math.round((summary.adoptions.approved / summary.adoptions.total) * 100) : 0;

    const averageDonation =
        summary.donations.total_cash_count > 0
            ? Math.round(summary.donations.total_cash / summary.donations.total_cash_count)
            : 0;

    const donationGoal = 50000;
    const currentMonthDonation = summary.donations.current_month_cash ?? summary.donations.total_cash;
    const currentDonationProgress = Math.min(Math.round((currentMonthDonation / donationGoal) * 100), 100);

    const periodOptions: { key: PeriodKey; label: string }[] = [
        { key: '7d', label: '7 Days' },
        { key: '30d', label: '30 Days' },
        { key: '90d', label: '90 Days' },
        { key: '1y', label: '1 Year' },
        { key: 'all', label: 'All Time' },
    ];

    const tabs: { key: ActiveTab; label: string; icon: React.ElementType }[] = [
        { key: 'overview', label: 'Overview & Trends', icon: BarChart3 },
        { key: 'shelter', label: 'Shelter & Foster', icon: PawPrint },
        { key: 'field', label: 'Field Ops & Community', icon: Utensils },
        { key: 'exports', label: 'PDF & CSV Exports', icon: Printer },
    ];

    return (
        <>
            <Head title="Reports & Analytics" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="font-fredoka text-3xl font-bold tracking-tight text-[#0B2340] dark:text-[#F8FAFC]">
                            Reports &amp; Analytics
                        </h1>
                        <p className="mt-1.5 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                            Analyze rescues, adoptions, shelter census, foster utilization, sustainability, and export executive reports.
                        </p>
                    </div>

                    <div className="flex w-full lg:w-auto shrink-0 items-center justify-between gap-2 min-w-0">
                        {/* Reporting Window Selector */}
                        <div className="inline-flex flex-1 min-w-0 lg:flex-initial items-center rounded-xl bg-gray-100 p-1 overflow-x-auto hide-scrollbar dark:bg-slate-800">
                            {periodOptions.map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => applyPeriod(opt.key)}
                                    className={cn(
                                        'shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs font-bold transition-all cursor-pointer',
                                        selectedPeriod === opt.key
                                            ? 'bg-white text-paw-navy shadow-xs dark:bg-slate-900 dark:text-white'
                                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => applyPeriod(selectedPeriod, true)}
                            disabled={isRefreshing}
                            aria-label="Refresh"
                            className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 sm:px-3 py-2 text-xs font-bold text-gray-700 shadow-xs transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:bg-slate-800 cursor-pointer"
                        >
                            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin text-teal-600')} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Top Executive KPI Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 min-w-0">
                    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-w-0 flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="rounded-xl bg-emerald-50 p-2 sm:p-3 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 shrink-0">
                                    <Percent className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <DeltaBadge delta={kpis?.rescues_delta} />
                            </div>
                            <div className="mt-2.5 sm:mt-3">
                                <span className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                                    Rescue Resolution
                                </span>
                                <h3 className="font-fredoka text-xl sm:text-2xl font-bold text-paw-navy dark:text-white mt-0.5 leading-tight">
                                    {rescueResolutionRate}%
                                </h3>
                            </div>
                        </div>
                        <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {summary.rescues.resolved} of {summary.rescues.total} resolved ({kpis?.period_rescues ?? 0} in window).
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-w-0 flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="rounded-xl bg-rose-50 p-2 sm:p-3 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 shrink-0">
                                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <DeltaBadge delta={kpis?.adoptions_delta} />
                            </div>
                            <div className="mt-2.5 sm:mt-3">
                                <span className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                                    Adoption Success
                                </span>
                                <h3 className="font-fredoka text-xl sm:text-2xl font-bold text-paw-navy dark:text-white mt-0.5 leading-tight">
                                    {adoptionApprovalRate}%
                                </h3>
                            </div>
                        </div>
                        <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {summary.adoptions.approved} of {summary.adoptions.total} approved ({kpis?.period_adoptions ?? 0} in window).
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-w-0 flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="rounded-xl bg-amber-50 p-2 sm:p-3 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 shrink-0">
                                    <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <DeltaBadge delta={kpis?.donations_delta} />
                            </div>
                            <div className="mt-2.5 sm:mt-3">
                                <span className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                                    Avg Cash Donation
                                </span>
                                <h3 className="font-fredoka text-xl sm:text-2xl font-bold text-paw-navy dark:text-white mt-0.5 leading-tight">
                                    ₱{averageDonation.toLocaleString()}
                                </h3>
                            </div>
                        </div>
                        <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            ₱{(kpis?.period_donations_amount ?? summary.donations.total_cash).toLocaleString()} raised in period.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-w-0 flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="rounded-xl bg-blue-50 p-2 sm:p-3 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 shrink-0">
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                            </div>
                            <div className="mt-2.5 sm:mt-3">
                                <span className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                                    Active Volunteers
                                </span>
                                <h3 className="font-fredoka text-xl sm:text-2xl font-bold text-paw-navy dark:text-white mt-0.5 leading-tight">
                                    {summary.volunteers.total}
                                </h3>
                            </div>
                        </div>
                        <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {volunteerImpact ? `${volunteerImpact.hours_logged} hrs logged • ` : ''}
                            {summary.volunteers.pending_apps} pending applications.
                        </p>
                    </div>
                </div>

                {/* Section Navigation Tabs */}
                <div className="flex flex-nowrap items-center gap-2 overflow-x-auto hide-scrollbar rounded-2xl border border-gray-100 bg-white p-2.5 sm:p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer',
                                    isActive
                                        ? 'bg-teal-600 text-white shadow-xs'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800',
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: OVERVIEW & TRENDS */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                            Rescues vs Adoptions
                                        </h3>
                                        <p className="text-[11px] text-gray-500">Comparative operational volume trends</p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        {chartFilter.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mb-3 text-xs font-semibold">
                                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#10B981] shrink-0" />
                                        Rescues Reported
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#F43F5E] shrink-0" />
                                        Adoptions Applied
                                    </span>
                                </div>
                                <div className="h-64 sm:h-72 w-full text-slate-800 dark:text-slate-200">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRescues" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorAdoptions" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#94A3B8" interval="preserveStartEnd" />
                                            <YAxis width={28} fontSize={10} tickLine={false} axisLine={false} stroke="#94A3B8" allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                    color: '#0F172A',
                                                }}
                                                labelStyle={{ fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="Rescues" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRescues)" name="Rescues Reported" />
                                            <Area type="monotone" dataKey="Adoptions" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAdoptions)" name="Adoptions Applied" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                            Cash Raised (PHP)
                                        </h3>
                                        <p className="text-[11px] text-gray-500">Verified donation revenue levels</p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                        PHP ₱
                                    </span>
                                </div>
                                <div className="h-64 sm:h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.85} />
                                                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.95} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#94A3B8" interval="preserveStartEnd" />
                                            <YAxis width={42} fontSize={10} tickLine={false} axisLine={false} stroke="#94A3B8" tickFormatter={(v) => `₱${v >= 1000 ? v / 1000 + 'k' : v}`} />
                                            <Tooltip
                                                formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, 'Raised']}
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                    color: '#0F172A',
                                                }}
                                                labelStyle={{ fontWeight: 'bold' }}
                                            />
                                            <Bar dataKey="Donations" fill="url(#colorDonations)" radius={[6, 6, 0, 0]} name="Donation Total" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown Widgets */}
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-amber-500" />
                                        <h4 className="text-sm font-bold text-paw-navy dark:text-white">Monthly Fundraising Target</h4>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Goal vs actual progress (PHP)</p>
                                    <div className="mt-6 flex items-baseline gap-2">
                                        <span className="font-fredoka text-3xl font-bold text-paw-navy dark:text-white">
                                            ₱{currentMonthDonation.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-gray-400 font-semibold">/ ₱{donationGoal.toLocaleString()}</span>
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-gray-500">Target Progress</span>
                                            <span className="text-amber-600">{currentDonationProgress}%</span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-slate-800">
                                            <div
                                                className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                                                style={{ width: `${currentDonationProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-4 text-xs text-gray-500 dark:text-gray-400">
                                    {currentDonationProgress >= 100
                                        ? 'Target reached! Platform operations funded for the month.'
                                        : `₱${Math.max(0, donationGoal - currentMonthDonation).toLocaleString()} remaining to reach monthly target.`}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-paw-navy dark:text-white">Rescue Animal Distribution</h4>
                                    <p className="text-xs text-gray-500 mt-1">Classification of cases by species</p>
                                    {animalPieData.length === 0 ? (
                                        <div className="h-40 flex items-center justify-center text-xs text-gray-400">No rescues recorded</div>
                                    ) : (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="h-32 w-32 shrink-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={animalPieData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={3} dataKey="value">
                                                            {animalPieData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => [`${value} cases`, 'Animal']} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="space-y-2 text-xs font-semibold shrink-0">
                                                {animalPieData.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                        <span className="text-gray-600 dark:text-gray-400">{item.name}:</span>
                                                        <span className="text-gray-800 dark:text-white">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="border-t border-gray-100 dark:border-slate-800 pt-4 text-[10px] text-gray-400">
                                    Based on categorized active and resolved reports.
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-paw-navy dark:text-white">Donation Types Breakdown</h4>
                                    <p className="text-xs text-gray-500 mt-1">Contributions split by method</p>
                                    {donationPieData.length === 0 ? (
                                        <div className="h-40 flex items-center justify-center text-xs text-gray-400">No donations verified</div>
                                    ) : (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="h-32 w-32 shrink-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={donationPieData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={3} dataKey="value">
                                                            {donationPieData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => [`${value} times`, 'Donations']} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="space-y-2 text-xs font-semibold shrink-0">
                                                {donationPieData.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                        <span className="text-gray-600 dark:text-gray-400">{item.name}:</span>
                                                        <span className="text-gray-800 dark:text-white">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="border-t border-gray-100 dark:border-slate-800 pt-4 text-[10px] text-gray-400">
                                    Based on verified cash contributions and item dropoffs.
                                </div>
                            </div>
                        </div>

                        {/* Operational Breakdowns */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
                            <div>
                                <h2 className="font-fredoka text-xl font-bold tracking-wide text-paw-navy dark:text-white">
                                    Operational Breakdowns
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Summary data points collected across rescues, adoptions, and contributions
                                </p>
                            </div>
                            <hr className="border-gray-100 dark:border-slate-800" />
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-paw-navy dark:text-white flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-emerald-600" />
                                        Rescues Summary
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b border-gray-100 pb-1.5 dark:border-slate-800">
                                            <span className="text-gray-500">Total Rescue Cases</span>
                                            <span className="font-bold text-gray-800 dark:text-white">{summary.rescues.total}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-1.5 dark:border-slate-800">
                                            <span className="text-gray-500">Resolved Cases</span>
                                            <span className="font-bold text-emerald-600">{summary.rescues.resolved}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-1.5 dark:border-slate-800">
                                            <span className="text-gray-500">Pending Cases</span>
                                            <span className="font-bold text-amber-600">{summary.rescues.pending}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Duplicate Submissions</span>
                                            <span className="font-bold text-rose-600">{summary.rescues.duplicate}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-paw-navy dark:text-white flex items-center gap-2">
                                        <Heart className="h-4 w-4 text-rose-600" />
                                        Adoptions Summary
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b border-gray-100 pb-1.5 dark:border-slate-800">
                                            <span className="text-gray-500">Total Applications</span>
                                            <span className="font-bold text-gray-800 dark:text-white">{summary.adoptions.total}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-1.5 dark:border-slate-800">
                                            <span className="text-gray-500">Approved Adoptions</span>
                                            <span className="font-bold text-emerald-600">{summary.adoptions.approved}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-1.5 dark:border-slate-800">
                                            <span className="text-gray-500">Pending Adoptions</span>
                                            <span className="font-bold text-amber-600">{summary.adoptions.pending}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Rejected Applications</span>
                                            <span className="font-bold text-rose-600">{summary.adoptions.rejected}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-paw-navy dark:text-white flex items-center gap-2">
                                        <Gift className="h-4 w-4 text-amber-600" />
                                        Donations &amp; Support
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b border-gray-100 pb-1.5 dark:border-slate-800">
                                            <span className="text-gray-500">Total Cash Raised</span>
                                            <span className="font-bold text-gray-800 dark:text-white">₱{summary.donations.total_cash.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-1.5 dark:border-slate-800">
                                            <span className="text-gray-500">Sponsorship Funds</span>
                                            <span className="font-bold text-indigo-600">₱{(summary.donations.total_sponsor_amount ?? 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-1.5 dark:border-slate-800">
                                            <span className="text-gray-500">Verified In-Kind</span>
                                            <span className="font-bold text-purple-600">{summary.donations.total_inkind_count} Items</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Active Responders</span>
                                            <span className="font-bold text-blue-600">{summary.volunteers.total}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {adminInsights && (
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-w-0">
                                    <h3 className="font-fredoka text-lg font-bold text-paw-navy dark:text-white">
                                        Adoption Pipeline Stages
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">
                                        Application flow plus shelter visits, rehoming &amp; follow-ups
                                    </p>
                                    <div className="h-56 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={adminInsights.adoptionPipeline.stages} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                <XAxis dataKey="name" fontSize={10} interval="preserveStartEnd" />
                                                <YAxis width={28} fontSize={10} allowDecimals={false} />
                                                <Tooltip />
                                                <Bar dataKey="value" name="Applications" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-center text-xs dark:border-slate-800">
                                        <div>
                                            <div className="text-gray-400 font-semibold">Visits Pending</div>
                                            <div className="font-bold text-paw-navy dark:text-white">{adminInsights.adoptionPipeline.visits_pending}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 font-semibold">Rehoming Queue</div>
                                            <div className="font-bold text-paw-navy dark:text-white">{adminInsights.adoptionPipeline.rehoming_pending}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 font-semibold">Follow-Ups Due (14d)</div>
                                            <div className="font-bold text-teal-600">{adminInsights.adoptionPipeline.follow_ups_due_soon}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-w-0">
                                    <h3 className="font-fredoka text-lg font-bold text-paw-navy dark:text-white">
                                        Rescue Urgency &amp; Admin Queues
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">
                                        Incident severity, AI validation queue, and pending donation reviews
                                    </p>
                                    <div className="h-56 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={
                                                    adminInsights.rescueFunnel.urgency_breakdown.length > 0
                                                        ? adminInsights.rescueFunnel.urgency_breakdown
                                                        : adminInsights.rescueFunnel.status_breakdown
                                                }
                                                margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                <XAxis dataKey="name" fontSize={10} interval="preserveStartEnd" />
                                                <YAxis width={28} fontSize={10} allowDecimals={false} />
                                                <Tooltip />
                                                <Bar dataKey="value" name="Reports" fill="#10B981" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-center text-xs dark:border-slate-800">
                                        <div>
                                            <div className="text-gray-400 font-semibold">AI Validation Pending</div>
                                            <div className="font-bold text-amber-600">{adminInsights.rescueFunnel.ai_validation_pending}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 font-semibold">Donations to Verify</div>
                                            <div className="font-bold text-indigo-600">{adminInsights.donationsAndSupport.pending_donation_reviews}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 font-semibold">Amount Edit Req.</div>
                                            <div className="font-bold text-rose-600">{adminInsights.donationsAndSupport.pending_amount_edit_requests}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: SHELTER & FOSTER */}
                {activeTab === 'shelter' && shelterCensus && fosterMetrics && inventorySustainability && (
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Shelter Census</span>
                                <p className="mt-2 font-fredoka text-3xl font-bold text-paw-navy dark:text-white">{shelterCensus.total}</p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {shelterCensus.available} available • {shelterCensus.adopted} adopted
                                </p>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Vaccination Coverage</span>
                                <p className="mt-2 font-fredoka text-3xl font-bold text-emerald-600">{shelterCensus.vaccination_rate}%</p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {shelterCensus.vaccinated_count} vaccinated • Avg {shelterCensus.avg_adoption_days}d to adopt
                                </p>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Foster Capacity</span>
                                <p className="mt-2 font-fredoka text-3xl font-bold text-indigo-600">{fosterMetrics.utilization_rate}%</p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {fosterMetrics.active_placements} active / {fosterMetrics.total_capacity} total slots ({fosterMetrics.approved_parents} homes)
                                </p>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Care Sustainability</span>
                                <p className="mt-2 font-fredoka text-3xl font-bold text-amber-600">
                                    {inventorySustainability.sustainability.est_days} Days
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Status: <strong>{inventorySustainability.sustainability.urgency_status}</strong> • ₱{inventorySustainability.sustainability.daily_cost.toLocaleString()}/day
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-w-0">
                                <h3 className="font-fredoka text-lg font-bold text-paw-navy dark:text-white">
                                    Shelter Animal Population by Status
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">Distribution across adoption, foster, and clinical care</p>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={shelterCensus.status_breakdown} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="name" fontSize={10} interval="preserveStartEnd" />
                                            <YAxis width={28} fontSize={10} allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="value" name="Animals" fill="#0D9488" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-fredoka text-lg font-bold text-paw-navy dark:text-white flex items-center gap-2">
                                            <Package className="h-4 w-4 text-rose-500" />
                                            Low-Stock Inventory Watchlist
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {inventorySustainability.low_stock_count} of {inventorySustainability.total_items} items at or below minimum threshold
                                        </p>
                                    </div>
                                    {inventorySustainability.low_stock_count > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                                            <AlertTriangle className="h-3 w-3" />
                                            Restock Needed
                                        </span>
                                    )}
                                </div>

                                {inventorySustainability.low_stock_items.length === 0 ? (
                                    <div className="py-12 text-center text-xs font-semibold text-emerald-600">
                                        All shelter supplies are safely above minimum stock thresholds.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                    <th className="py-2 px-2">Item</th>
                                                    <th className="py-2 px-2">Category</th>
                                                    <th className="py-2 px-2 text-right">Stock / Min</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                                                {inventorySustainability.low_stock_items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="py-2.5 px-2 font-bold text-gray-800 dark:text-gray-200">{item.name}</td>
                                                        <td className="py-2.5 px-2 text-gray-500">{item.category}</td>
                                                        <td className="py-2.5 px-2 text-right font-bold text-rose-600">
                                                            {item.quantity} / {item.min_threshold} {item.unit}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {adminInsights && (
                            <div className="grid gap-6 lg:grid-cols-3">
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="font-fredoka text-base font-bold text-paw-navy dark:text-white">
                                        Animal Medical &amp; Wishlist Care
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">Clinical records &amp; pet supply needs</p>
                                    <div className="space-y-2.5 text-xs">
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Medical Records (Period / Total)</span>
                                            <span className="font-bold text-gray-800 dark:text-white">
                                                {adminInsights.animalCare.medical_records_period} / {adminInsights.animalCare.medical_records_total}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Active Ongoing Treatments</span>
                                            <span className="font-bold text-rose-600">{adminInsights.animalCare.active_treatments}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Upcoming Due Medical (14d)</span>
                                            <span className="font-bold text-amber-600">{adminInsights.animalCare.upcoming_due_medical}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Open Wishlist Needs</span>
                                            <span className="font-bold text-indigo-600">
                                                {adminInsights.animalCare.open_wishlist_needs} ({adminInsights.animalCare.urgent_wishlist_needs} urgent)
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Fulfilled Wishlist Needs</span>
                                            <span className="font-bold text-emerald-600">{adminInsights.animalCare.fulfilled_wishlist_needs}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="font-fredoka text-base font-bold text-paw-navy dark:text-white">
                                        Foster Care Logs &amp; Batch Expiry
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">Foster parent updates &amp; supply shelf-life</p>
                                    <div className="space-y-2.5 text-xs">
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Foster Updates Logged (Period)</span>
                                            <span className="font-bold text-gray-800 dark:text-white">{adminInsights.fosterVolunteerOps.foster_updates_period}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Unacknowledged Care Updates</span>
                                            <span className="font-bold text-amber-600">{adminInsights.fosterVolunteerOps.foster_updates_unacknowledged}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Urgent Unreviewed Foster Logs</span>
                                            <span className="font-bold text-rose-600">{adminInsights.fosterVolunteerOps.foster_updates_urgent}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Total Inventory Units On Hand</span>
                                            <span className="font-bold text-teal-600">{adminInsights.donationsAndSupport.total_inventory_units.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Expiring Batches (30d / Expired)</span>
                                            <span className="font-bold text-rose-600">
                                                {adminInsights.donationsAndSupport.expiring_batches_30d} / {adminInsights.donationsAndSupport.expired_batches_with_stock}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="font-fredoka text-base font-bold text-paw-navy dark:text-white">
                                        Shelter Demographics
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">Age group &amp; gender distribution</p>
                                    <div className="space-y-3 text-xs">
                                        <div>
                                            <div className="mb-1.5 font-bold uppercase tracking-wider text-gray-400">Age Categories</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {adminInsights.animalCare.age_breakdown.length === 0 ? (
                                                    <span className="text-gray-400">No records</span>
                                                ) : (
                                                    adminInsights.animalCare.age_breakdown.map((item, idx) => (
                                                        <span key={idx} className="rounded-full bg-teal-50 px-2.5 py-1 font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                                                            {item.name}: {item.value}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                                            <div className="mb-1.5 font-bold uppercase tracking-wider text-gray-400">Gender Split</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {adminInsights.animalCare.gender_breakdown.length === 0 ? (
                                                    <span className="text-gray-400">No records</span>
                                                ) : (
                                                    adminInsights.animalCare.gender_breakdown.map((item, idx) => (
                                                        <span key={idx} className="rounded-full bg-indigo-50 px-2.5 py-1 font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                                                            {item.name}: {item.value}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: FIELD OPS & COMMUNITY */}
                {activeTab === 'field' && volunteerImpact && communityMetrics && (
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Volunteer Hours</span>
                                <p className="mt-2 font-fredoka text-3xl font-bold text-paw-navy dark:text-white">
                                    {volunteerImpact.hours_logged} hrs
                                </p>
                                <p className="mt-1 text-xs text-gray-500">{volunteerImpact.completed_tasks} completed tasks</p>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Strays Fed</span>
                                <p className="mt-2 font-fredoka text-3xl font-bold text-emerald-600">
                                    {volunteerImpact.strays_fed.toLocaleString()}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {volunteerImpact.food_packs_distributed} packs • {volunteerImpact.feeding_routes_completed} routes
                                </p>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Community Engagement</span>
                                <p className="mt-2 font-fredoka text-3xl font-bold text-indigo-600">
                                    {communityMetrics.events_approved} Events
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {communityMetrics.shelter_visits_confirmed} visits • {volunteerImpact.certificates_issued} certs issued
                                </p>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Help Desk SLA</span>
                                <p className="mt-2 font-fredoka text-3xl font-bold text-amber-600">
                                    {communityMetrics.help_desk_avg_resolution_hours}h
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {communityMetrics.help_desk_open} open • {communityMetrics.help_desk_resolved_period} resolved
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <h3 className="font-fredoka text-lg font-bold text-paw-navy dark:text-white flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-teal-600" />
                                    Top Rescue Hotspots
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">Locations with the highest report volume in selected window</p>
                                {topRescueLocations.length === 0 ? (
                                    <div className="py-10 text-center text-xs text-gray-400">No rescue location data in this period.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {topRescueLocations.map((loc, idx) => (
                                            <div key={idx} className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs font-semibold">
                                                    <span className="text-gray-800 dark:text-gray-200">{loc.location}</span>
                                                    <span className="text-gray-500">
                                                        {loc.total} cases • <strong className="text-emerald-600">{loc.resolution_rate}% resolved</strong>
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-slate-800">
                                                    <div
                                                        className="h-2 rounded-full bg-teal-500"
                                                        style={{ width: `${Math.max(8, loc.resolution_rate)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <h3 className="font-fredoka text-lg font-bold text-paw-navy dark:text-white flex items-center gap-2">
                                    <HeartHandshake className="h-4 w-4 text-indigo-600" />
                                    Top Volunteer Contributors
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">Highest logged field hours and completed assignments</p>
                                {volunteerImpact.top_volunteers.length === 0 ? (
                                    <div className="py-10 text-center text-xs text-gray-400">No volunteer task hours logged in this period.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                                    <th className="py-2 px-2">Volunteer</th>
                                                    <th className="py-2 px-2 text-right">Tasks</th>
                                                    <th className="py-2 px-2 text-right">Hours</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                                                {volunteerImpact.top_volunteers.map((v, idx) => (
                                                    <tr key={idx}>
                                                        <td className="py-2.5 px-2">
                                                            <div className="font-bold text-gray-800 dark:text-gray-200">{v.name}</div>
                                                            <div className="text-[10px] text-gray-400">{v.email}</div>
                                                        </td>
                                                        <td className="py-2.5 px-2 text-right font-semibold">{v.tasks_count}</td>
                                                        <td className="py-2.5 px-2 text-right font-bold text-teal-600">{v.total_hours}h</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {adminInsights && (
                            <div className="grid gap-6 lg:grid-cols-3">
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="font-fredoka text-base font-bold text-paw-navy dark:text-white">
                                        Food Pickups &amp; Field Safety
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">Partner food logistics &amp; volunteer injury aid</p>
                                    <div className="space-y-2.5 text-xs">
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Pickups Completed (Period)</span>
                                            <span className="font-bold text-emerald-600">{adminInsights.fosterVolunteerOps.pickups_completed_period}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Pickups Pending / Assigned</span>
                                            <span className="font-bold text-amber-600">{adminInsights.fosterVolunteerOps.pickups_pending}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Missed Pickups (Period)</span>
                                            <span className="font-bold text-rose-600">{adminInsights.fosterVolunteerOps.pickups_missed_period}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Open Field Injury Reports</span>
                                            <span className="font-bold text-rose-600">{adminInsights.fosterVolunteerOps.injuries_open}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Confirmed Injury Aid (Period)</span>
                                            <span className="font-bold text-teal-600">{adminInsights.fosterVolunteerOps.injuries_confirmed_period}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="font-fredoka text-base font-bold text-paw-navy dark:text-white">
                                        Events, Blogs &amp; Community
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">Outreach attendance &amp; editorial reach</p>
                                    <div className="space-y-2.5 text-xs">
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Event Signups (Period)</span>
                                            <span className="font-bold text-indigo-600">{adminInsights.donationsAndSupport.event_registrations_period}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Upcoming Event Capacity</span>
                                            <span className="font-bold text-gray-800 dark:text-white">{adminInsights.donationsAndSupport.events_upcoming_spots} spots</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Published / Pending Blogs</span>
                                            <span className="font-bold text-gray-800 dark:text-white">
                                                {adminInsights.donationsAndSupport.blogs_published} / {adminInsights.donationsAndSupport.blogs_pending}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                                            <span className="text-gray-500">Total Blog Views</span>
                                            <span className="font-bold text-teal-600">{adminInsights.donationsAndSupport.blogs_total_views.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Total Blog Shares</span>
                                            <span className="font-bold text-emerald-600">{adminInsights.donationsAndSupport.blogs_total_shares.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <h3 className="font-fredoka text-base font-bold text-paw-navy dark:text-white">
                                        Volunteer Roles &amp; Ticket Priorities
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">Applicant preferences &amp; open support urgency</p>
                                    <div className="space-y-3 text-xs">
                                        <div>
                                            <div className="mb-1.5 font-bold uppercase tracking-wider text-gray-400">Volunteer Role Demand</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {adminInsights.fosterVolunteerOps.volunteer_roles.length === 0 ? (
                                                    <span className="text-gray-400">No applications yet</span>
                                                ) : (
                                                    adminInsights.fosterVolunteerOps.volunteer_roles.map((r, idx) => (
                                                        <span key={idx} className="rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                                            {r.name}: {r.value}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                                            <div className="mb-1.5 font-bold uppercase tracking-wider text-gray-400">Open Help Desk by Priority</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {adminInsights.donationsAndSupport.help_desk_priorities.length === 0 ? (
                                                    <span className="text-emerald-600 font-semibold">No open tickets</span>
                                                ) : (
                                                    adminInsights.donationsAndSupport.help_desk_priorities.map((p, idx) => (
                                                        <span key={idx} className="rounded-full bg-amber-50 px-2.5 py-1 font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                                            {p.name}: {p.value}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: PDF & CSV EXPORTS */}
                {activeTab === 'exports' && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* PDF Export Studio */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400">
                                        <Printer className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-fredoka text-xl font-bold text-paw-navy dark:text-white">
                                            Executive PDF Reports
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            Branded A4 reports with embedded PAWLSE &amp; ISF logos, vector charts, and full tables
                                        </p>
                                    </div>
                                </div>
                                <hr className="my-4 border-gray-100 dark:border-slate-800" />

                                {!canExportReports ? (
                                    <div className="rounded-xl bg-amber-50 p-4 text-xs font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                                        Your account does not currently have the <code>analytics.export</code> permission.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(
                                            [
                                                { key: 'all', title: 'Complete Executive Report PDF', desc: 'All KPIs, charts, shelter census, sustainability & logs' },
                                                { key: 'rescues', title: 'Rescues & Emergency Report PDF', desc: 'Rescue volume trends, species split & incident logs' },
                                                { key: 'adoptions', title: 'Adoptions Pipeline Report PDF', desc: 'Approval rates, trend charts & applicant logs' },
                                                { key: 'donations', title: 'Donations & Sustainability PDF', desc: 'Revenue breakdown, Care runway & verified contributions' },
                                                { key: 'operations', title: 'Shelter, Foster & Field Ops PDF', desc: 'Animal census, foster utilization, feeding & inventory alerts' },
                                            ] as const
                                        ).map((item) => (
                                            <div
                                                key={item.key}
                                                className="flex flex-col gap-3 rounded-xl border border-gray-100 p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"
                                            >
                                                <div>
                                                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.title}</div>
                                                    <div className="text-[11px] text-gray-500">{item.desc}</div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => openPdfReport(item.key, false)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 cursor-pointer"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        Preview
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openPdfReport(item.key, true)}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-teal-700 cursor-pointer"
                                                    >
                                                        <Printer className="h-3 w-3" />
                                                        PDF
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CSV / Excel Export */}
                        {canExportReports && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                                            <FileSpreadsheet className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="font-fredoka text-xl font-bold text-paw-navy dark:text-white">
                                                Excel / CSV Export
                                            </h2>
                                            <p className="text-xs text-gray-500">
                                                UTF-8 structured CSV spreadsheets compatible with Excel and Google Sheets
                                            </p>
                                        </div>
                                    </div>
                                    <hr className="my-4 border-gray-100 dark:border-slate-800" />

                                    <div className="space-y-2.5">
                                        {(
                                            [
                                                { type: 'full', label: 'Complete Executive Summary + Operations CSV', icon: Activity, color: 'text-teal-500' },
                                                { type: 'summary', label: 'Overview Summary Report CSV', icon: FileText, color: 'text-blue-500' },
                                                { type: 'operations', label: 'Shelter Census, Foster & Field Ops CSV', icon: PawPrint, color: 'text-indigo-500' },
                                                { type: 'rescues', label: 'Detailed Rescues Log CSV', icon: FileText, color: 'text-emerald-500' },
                                                { type: 'adoptions', label: 'Detailed Adoptions Log CSV', icon: Heart, color: 'text-rose-500' },
                                                { type: 'donations', label: 'Detailed Donations Log CSV', icon: Gift, color: 'text-amber-500' },
                                                { type: 'volunteers', label: 'Volunteer Applications Log CSV', icon: Users, color: 'text-cyan-500' },
                                            ] as const
                                        ).map((csv) => (
                                            <a
                                                key={csv.type}
                                                href={reportsAnalytics.export.url({ query: { type: csv.type } })}
                                                className="flex items-center justify-between rounded-xl border border-gray-100 p-3 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <csv.icon className={cn('h-4 w-4', csv.color)} />
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{csv.label}</span>
                                                </div>
                                                <Download className="h-4 w-4 text-gray-400" />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 rounded-xl bg-blue-50/50 p-4 dark:bg-slate-950/20 border border-blue-100/50 dark:border-blue-900/20">
                                    <div className="flex gap-2 text-blue-800 dark:text-blue-400 text-xs font-bold">
                                        <ShieldAlert className="h-4 w-4 shrink-0" />
                                        <span>Data Security Notice</span>
                                    </div>
                                    <p className="text-[10px] text-blue-800/75 dark:text-blue-400/70 mt-1 leading-relaxed">
                                        Exports contain sensitive donor and reporter contact details. Handle downloads in strict compliance with platform privacy policies.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

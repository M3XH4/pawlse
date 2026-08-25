import { Head } from '@inertiajs/react';
import {
    BarChart3,
    Download,
    FileSpreadsheet,
    FileText,
    Gift,
    Heart,
    Percent,
    ShieldAlert,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import reportsAnalytics from '@/routes/account/admin/reports-analytics';

type Dataset = {
    rescues: number[];
    adoptions: number[];
    donations: number[];
};

type Summary = {
    rescues: { total: number; resolved: number; pending: number; duplicate: number };
    adoptions: { total: number; approved: number; rejected: number; pending: number };
    donations: { total_cash: number; total_cash_count: number; total_inkind_count: number };
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

type ReportsProps = {
    months: string[];
    weeks: string[];
    years: string[];
    monthly: Dataset;
    weekly: Dataset;
    yearly: Dataset;
    summary: Summary;
    animalBreakdown: Breakdown;
    donationBreakdown: DonationBreakdown;
};

type TimeFilter = 'weekly' | 'monthly' | 'yearly';

export default function ReportsAnalytics({
    months,
    weeks,
    years,
    monthly,
    weekly,
    yearly,
    summary,
    animalBreakdown,
    donationBreakdown,
}: ReportsProps) {
    const [filter, setFilter] = useState<TimeFilter>('monthly');

    // Get current dataset based on filter
    const getActiveDataset = () => {
        switch (filter) {
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

    // Map parallel arrays into unified objects for Recharts
    const chartData = activeLabels.map((label, index) => ({
        name: filter === 'weekly' ? label : label.substring(0, 3),
        Rescues: activeData.rescues[index] ?? 0,
        Adoptions: activeData.adoptions[index] ?? 0,
        Donations: activeData.donations[index] ?? 0,
    }));

    // Data for Animal Rescue Breakdown (Pie)
    const animalPieData = [
        { name: 'Cats', value: animalBreakdown.cats, color: '#10B981' },
        { name: 'Dogs', value: animalBreakdown.dogs, color: '#3B82F6' },
        { name: 'Others', value: animalBreakdown.others, color: '#6B7280' },
    ].filter((item) => item.value > 0);

    // Data for Donation Type Breakdown (Pie)
    const donationPieData = [
        { name: 'Cash', value: donationBreakdown.cash, color: '#F59E0B' },
        { name: 'In-Kind', value: donationBreakdown.inkind, color: '#8B5CF6' },
        { name: 'Sponsorships', value: donationBreakdown.sponsor, color: '#EC4899' },
    ].filter((item) => item.value > 0);

    // Calculate rates
    const rescueResolutionRate = summary.rescues.total > 0
        ? Math.round((summary.rescues.resolved / summary.rescues.total) * 100)
        : 0;

    const adoptionApprovalRate = summary.adoptions.total > 0
        ? Math.round((summary.adoptions.approved / summary.adoptions.total) * 100)
        : 0;

    const averageDonation = summary.donations.total_cash_count > 0
        ? Math.round(summary.donations.total_cash / summary.donations.total_cash_count)
        : 0;

    // Goal calculation (Target is PHP 50,000 monthly)
    const donationGoal = 50000;
    const currentDonationProgress = Math.min(
        Math.round((summary.donations.total_cash / donationGoal) * 100),
        100
    );

    return (
        <>
            <Head title="Reports & Analytics" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-fredoka text-3xl font-black tracking-wide text-paw-navy dark:text-white">
                            Reports &amp; Analytics
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Analyze platform activities, track rescues, monitor donations, and export reports.
                        </p>
                    </div>

                    {/* Time Frame Filter Buttons */}
                    <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-slate-800">
                        {(
                            [
                                { value: 'weekly', label: 'Weekly' },
                                { value: 'monthly', label: 'Monthly' },
                                { value: 'yearly', label: 'Yearly' },
                            ] as const
                        ).map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setFilter(opt.value)}
                                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                                    filter === opt.value
                                        ? 'bg-white text-paw-navy shadow-xs dark:bg-slate-900 dark:text-white'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-250'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics / KPIs Section */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Resolution Rate */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                                <Percent className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rescue Resolution</span>
                                <h3 className="font-fredoka text-2xl font-bold text-paw-navy dark:text-white mt-0.5">
                                    {rescueResolutionRate}%
                                </h3>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            {summary.rescues.resolved} cases resolved out of {summary.rescues.total} total cases.
                        </p>
                    </div>

                    {/* Adoption Approval Rate */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-rose-50 p-3 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Adoption Success</span>
                                <h3 className="font-fredoka text-2xl font-bold text-paw-navy dark:text-white mt-0.5">
                                    {adoptionApprovalRate}%
                                </h3>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            {summary.adoptions.approved} applications approved out of {summary.adoptions.total} total.
                        </p>
                    </div>

                    {/* Average Donation */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                                <Gift className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Cash Donation</span>
                                <h3 className="font-fredoka text-2xl font-bold text-paw-navy dark:text-white mt-0.5">
                                    ₱{averageDonation.toLocaleString()}
                                </h3>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            From {summary.donations.total_cash_count} unique cash contributions.
                        </p>
                    </div>

                    {/* Total Operational Volunteers */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Volunteers</span>
                                <h3 className="font-fredoka text-2xl font-bold text-paw-navy dark:text-white mt-0.5">
                                    {summary.volunteers.total}
                                </h3>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            With {summary.volunteers.pending_apps} pending applications awaiting review.
                        </p>
                    </div>
                </div>

                {/* Analytical Charts Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Rescues vs Adoptions Comparative Chart (Area Chart) */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    Rescues vs Adoptions
                                </h3>
                                <p className="text-[11px] text-gray-500">Comparative operational volume trends</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-850 dark:text-slate-350">
                                Interactive Trend
                            </span>
                        </div>
                        <div className="h-72 w-full text-slate-800 dark:text-slate-200">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="#94A3B8" />
                                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#94A3B8" />
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
                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                    <Area type="monotone" dataKey="Rescues" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRescues)" name="Rescues Reported" />
                                    <Area type="monotone" dataKey="Adoptions" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAdoptions)" name="Adoptions Approved" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Cash Donations Raised (Bar Chart) */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    Cash Raised (PHP)
                                </h3>
                                <p className="text-[11px] text-gray-500">Cash donation levels received</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-850 dark:text-slate-350">
                                Interactive Bar
                            </span>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#D97706" stopOpacity={0.95} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="#94A3B8" />
                                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#94A3B8" tickFormatter={(v) => `₱${v >= 1000 ? (v / 1000) + 'k' : v}`} />
                                    <Tooltip
                                        formatter={(value: any) => [`₱${value.toLocaleString()}`, 'Raised']}
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

                {/* Additional Interactive Breakdowns Section */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Goal Tracker Widget */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-amber-500" />
                                <h4 className="text-sm font-bold text-paw-navy dark:text-white">Monthly Fundraising Target</h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Goal vs actual progress (PHP)</p>
                            
                            <div className="mt-6 flex items-baseline gap-2">
                                <span className="font-fredoka text-3xl font-bold text-paw-navy dark:text-white">
                                    ₱{summary.donations.total_cash.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-400 font-semibold">/ ₱{donationGoal.toLocaleString()}</span>
                            </div>
                            
                            {/* Visual Progress Bar */}
                            <div className="mt-4">
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="text-gray-550">Target Progress</span>
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

                        <div className="mt-6 border-t border-gray-50 dark:border-slate-850 pt-4 text-xs text-gray-500 dark:text-gray-400">
                            {currentDonationProgress >= 100 
                                ? '🎉 Target reached! Platform operations funded for the month.'
                                : `₱${(donationGoal - summary.donations.total_cash).toLocaleString()} remaining to fund platform operations.`}
                        </div>
                    </div>

                    {/* Animal Rescues Pie Breakdown */}
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
                                                <Pie
                                                    data={animalPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={25}
                                                    outerRadius={45}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
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
                        <div className="border-t border-gray-50 dark:border-slate-850 pt-4 text-[10px] text-gray-400">
                            Based on categorized active and resolved reports.
                        </div>
                    </div>

                    {/* Donation Channels Pie Breakdown */}
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
                                                <Pie
                                                    data={donationPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={25}
                                                    outerRadius={45}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
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
                        <div className="border-t border-gray-50 dark:border-slate-850 pt-4 text-[10px] text-gray-400">
                            Based on verified cash contributions and item dropoffs.
                        </div>
                    </div>
                </div>

                {/* Lower Layout: Summaries and Exports */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left & Mid Column: Status Report Breakdown */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2 space-y-6">
                        <div>
                            <h2 className="font-fredoka text-xl font-bold tracking-wide text-paw-navy dark:text-white">
                                Operational Breakdowns
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Summary data points collected from the database
                            </p>
                        </div>
                        <hr className="border-gray-100 dark:border-slate-800" />
                        
                        <div className="grid gap-6 sm:grid-cols-2">
                            {/* Rescues Summary */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-paw-navy dark:text-white flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-emerald-600" />
                                    Rescues Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b border-gray-55 pb-1.5 dark:border-slate-800">
                                        <span className="text-gray-550">Total Rescue Cases</span>
                                        <span className="font-bold text-gray-800 dark:text-white">{summary.rescues.total}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-55 pb-1.5 dark:border-slate-800">
                                        <span className="text-gray-550">Resolved Cases</span>
                                        <span className="font-bold text-emerald-600">{summary.rescues.resolved}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-55 pb-1.5 dark:border-slate-800">
                                        <span className="text-gray-550">Pending Cases</span>
                                        <span className="font-bold text-amber-600">{summary.rescues.pending}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-550">Duplicate Submissions</span>
                                        <span className="font-bold text-rose-650">{summary.rescues.duplicate}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Adoptions Summary */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-paw-navy dark:text-white flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-rose-600" />
                                    Adoptions Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b border-gray-55 pb-1.5 dark:border-slate-800">
                                        <span className="text-gray-550">Total Applications</span>
                                        <span className="font-bold text-gray-800 dark:text-white">{summary.adoptions.total}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-55 pb-1.5 dark:border-slate-800">
                                        <span className="text-gray-550">Approved Adoptions</span>
                                        <span className="font-bold text-emerald-600">{summary.adoptions.approved}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-55 pb-1.5 dark:border-slate-800">
                                        <span className="text-gray-550">Pending Adoptions</span>
                                        <span className="font-bold text-amber-600">{summary.adoptions.pending}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-550">Rejected Applications</span>
                                        <span className="font-bold text-rose-650">{summary.adoptions.rejected}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Donations & Volunteers Summary */}
                            <div className="space-y-4 sm:col-span-2">
                                <h4 className="text-sm font-bold text-paw-navy dark:text-white flex items-center gap-2">
                                    <Gift className="h-4 w-4 text-amber-600" />
                                    Donations &amp; Support Summary
                                </h4>
                                <div className="grid gap-4 sm:grid-cols-3 text-sm">
                                    <div className="rounded-xl bg-gray-50/50 p-4 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-850">
                                        <div className="text-xs text-gray-400 dark:text-gray-550 font-bold uppercase tracking-wider">Total Cash Raised</div>
                                        <div className="font-fredoka text-xl font-bold text-paw-navy dark:text-white mt-1">
                                            ₱{summary.donations.total_cash.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-gray-50/50 p-4 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-850">
                                        <div className="text-xs text-gray-400 dark:text-gray-550 font-bold uppercase tracking-wider">In-Kind Donations</div>
                                        <div className="font-fredoka text-xl font-bold text-paw-navy dark:text-white mt-1">
                                            {summary.donations.total_inkind_count} Items
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-gray-50/50 p-4 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-850">
                                        <div className="text-xs text-gray-400 dark:text-gray-550 font-bold uppercase tracking-wider">Active Force</div>
                                        <div className="font-fredoka text-xl font-bold text-paw-navy dark:text-white mt-1">
                                            {summary.volunteers.total} Responders
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Excel / Report Export Options */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                                <h2 className="font-fredoka text-xl font-bold tracking-wide text-paw-navy dark:text-white">
                                    Excel / CSV Export
                                </h2>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                                Download structured database logs directly into CSV spreadsheet format compatible with Microsoft Excel and Google Sheets.
                            </p>
                            <hr className="my-4 border-gray-100 dark:border-slate-800" />
                            
                            <div className="space-y-3">
                                {/* Summary Export */}
                                <a
                                    href={reportsAnalytics.export.url({ query: { type: 'summary' } })}
                                    className="flex items-center justify-between rounded-xl border border-gray-100 p-3 hover:bg-gray-50 dark:border-slate-850 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <FileText className="h-4.5 w-4.5 text-blue-500" />
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Overview Summary Report</span>
                                    </div>
                                    <Download className="h-4 w-4 text-gray-400" />
                                </a>

                                {/* Rescues Export */}
                                <a
                                    href={reportsAnalytics.export.url({ query: { type: 'rescues' } })}
                                    className="flex items-center justify-between rounded-xl border border-gray-100 p-3 hover:bg-gray-50 dark:border-slate-850 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <FileText className="h-4.5 w-4.5 text-emerald-500" />
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Detailed Rescues Log</span>
                                    </div>
                                    <Download className="h-4 w-4 text-gray-400" />
                                </a>

                                {/* Adoptions Export */}
                                <a
                                    href={reportsAnalytics.export.url({ query: { type: 'adoptions' } })}
                                    className="flex items-center justify-between rounded-xl border border-gray-100 p-3 hover:bg-gray-50 dark:border-slate-850 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Heart className="h-4.5 w-4.5 text-rose-500" />
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Detailed Adoptions Log</span>
                                    </div>
                                    <Download className="h-4 w-4 text-gray-400" />
                                </a>

                                {/* Donations Export */}
                                <a
                                    href={reportsAnalytics.export.url({ query: { type: 'donations' } })}
                                    className="flex items-center justify-between rounded-xl border border-gray-100 p-3 hover:bg-gray-50 dark:border-slate-850 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Gift className="h-4.5 w-4.5 text-amber-500" />
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Detailed Donations Log</span>
                                    </div>
                                    <Download className="h-4 w-4 text-gray-400" />
                                </a>
                            </div>
                        </div>

                        <div className="mt-6 rounded-xl bg-blue-50/50 p-4 dark:bg-slate-950/20 border border-blue-100/50 dark:border-blue-900/20">
                            <div className="flex gap-2 text-blue-800 dark:text-blue-400 text-xs font-bold">
                                <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                                <span>Data Security Notice</span>
                            </div>
                            <p className="text-[10px] text-blue-800/75 dark:text-blue-400/70 mt-1 leading-relaxed">
                                Excel exports contain sensitive donor and reporter contact details. Handle downloads in strict compliance with platform privacy policies.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, Search, Filter,
    Globe, HelpCircle
} from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';
import { DashboardPagination } from '@/components/dashboard/pagination';
import { ModernSelect } from '@/components/ui/modern-select';
import { FilteredContentSkeleton } from '@/components/ui/skeleton-presets';
import { useFilteredSectionLoading } from '@/hooks/use-inertia-loading';

interface LoginAttemptRecord {
    id: number;
    user_name: string | null;
    email: string | null;
    ip_address: string;
    user_agent: string;
    status: 'success' | 'failed';
    is_suspicious: boolean;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface SecurityAccessProps {
    logs: {
        data: LoginAttemptRecord[];
        links: PaginationLink[];
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        suspicious?: string;
    };
    stats: {
        success_count: number;
        failed_count: number;
        suspicious_count: number;
        unique_ips: number;
    };
}

export default function SecurityAccess({ logs, filters, stats }: SecurityAccessProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [suspiciousOnly, setSuspiciousOnly] = useState(filters.suspicious === 'true');

    // Handle searching with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                applyFilters();
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const isFiltering = useFilteredSectionLoading();

    const applyFilters = (overrides = {}) => {
        router.get(
            '/account/super-admin/security-access',
            {
                search: searchTerm,
                status: selectedStatus,
                suspicious: suspiciousOnly ? 'true' : '',
                ...overrides
            },
            { preserveState: true }
        );
    };

    const handleStatusChange = (val: string) => {
        setSelectedStatus(val);
        applyFilters({ status: val });
    };

    const handleSuspiciousChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSuspiciousOnly(e.target.checked);
        applyFilters({ suspicious: e.target.checked ? 'true' : '' });
    };

    return (
        <DashboardSectionPage
            title="Security & Access"
            description="Audit security trails, login logs, failed authorization attempts, and heuristic indicators"
        >
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                            <span className="block text-[11px] sm:text-xs font-semibold text-gray-500 leading-snug">Successful Logins</span>
                            <h3 className="font-fredoka text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 text-emerald-600">{stats.success_count}</h3>
                        </div>
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500 shrink-0" />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                            <span className="block text-[11px] sm:text-xs font-semibold text-gray-500 leading-snug">Failed Attempts</span>
                            <h3 className="font-fredoka text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 text-amber-500">{stats.failed_count}</h3>
                        </div>
                        <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 shrink-0" />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                            <span className="block text-[11px] sm:text-xs font-semibold text-gray-500 leading-snug">Suspicious Logins</span>
                            <h3 className="font-fredoka text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 text-rose-600">{stats.suspicious_count}</h3>
                        </div>
                        <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500 shrink-0" />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                            <span className="block text-[11px] sm:text-xs font-semibold text-gray-500 leading-snug">Unique IPs</span>
                            <h3 className="font-fredoka text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 text-slate-800 dark:text-white">{stats.unique_ips}</h3>
                        </div>
                        <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500 shrink-0" />
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row lg:items-center lg:justify-between min-w-0">
                        {/* Search */}
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by email or IP address..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-900 dark:bg-slate-900 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between gap-2.5 w-full lg:w-auto min-w-0">
                            {/* Status Filter */}
                            <div className="flex-1 sm:flex-initial min-w-0 sm:min-w-[150px]">
                                <ModernSelect
                                    size="sm"
                                    searchable={false}
                                    value={selectedStatus}
                                    onChange={handleStatusChange}
                                    options={[
                                        { value: '', label: 'All Statuses' },
                                        { value: 'success', label: 'Success' },
                                        { value: 'failed', label: 'Failed' },
                                    ]}
                                />
                            </div>

                            {/* Suspicious Checkbox */}
                            <label
                                htmlFor="suspicious"
                                className="inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl border border-rose-200/80 bg-rose-50/50 px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs font-bold text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 cursor-pointer whitespace-nowrap"
                            >
                                <input
                                    type="checkbox"
                                    id="suspicious"
                                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                    checked={suspiciousOnly}
                                    onChange={handleSuspiciousChange}
                                />
                                <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span>Suspicious Only</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <FilteredContentSkeleton isLoading={isFiltering} variant="table" rows={6} columns={6}>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Email Entered</th>
                                    <th className="px-6 py-4">IP Address</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Suspicious?</th>
                                    <th className="px-6 py-4">User Agent</th>
                                    <th className="px-6 py-4">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-slate-900 dark:border-slate-900">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                                            No access log records found.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr 
                                            key={log.id} 
                                            className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/20 ${
                                                log.is_suspicious ? 'bg-rose-50/30 dark:bg-rose-950/5' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                {log.user_name || 'Guest / Unauthenticated'}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono">{log.email || 'N/A'}</td>
                                            <td className="px-6 py-4 text-xs font-mono">{log.ip_address}</td>
                                            <td className="px-6 py-4">
                                                {log.status === 'success' ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                                        <ShieldCheck className="h-4 w-4" />
                                                        Success
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-bold">
                                                        <AlertCircle className="h-4 w-4" />
                                                        Failed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.is_suspicious ? (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950/20 dark:text-rose-400">
                                                        <ShieldAlert className="h-3.5 w-3.5" />
                                                        Suspicious
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs max-w-xs truncate" title={log.user_agent}>
                                                {log.user_agent}
                                            </td>
                                            <td className="px-6 py-4 text-xs">{log.created_at}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    </FilteredContentSkeleton>

                    <DashboardPagination
                        links={logs.links}
                        total={logs.total}
                        count={logs.data.length}
                        itemName="logs"
                    />
                </div>
            </div>
        </DashboardSectionPage>
    );
}

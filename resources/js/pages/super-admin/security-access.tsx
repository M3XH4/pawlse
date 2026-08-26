import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, Search, Filter,
    Globe, HelpCircle
} from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';

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

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStatus(e.target.value);
        applyFilters({ status: e.target.value });
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500">Successful Logins</span>
                            <h3 className="font-fredoka text-2xl font-bold mt-1 text-emerald-600">{stats.success_count}</h3>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500">Failed Attempts</span>
                            <h3 className="font-fredoka text-2xl font-bold mt-1 text-amber-500">{stats.failed_count}</h3>
                        </div>
                        <AlertCircle className="h-6 w-6 text-amber-500" />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500">Suspicious Logins</span>
                            <h3 className="font-fredoka text-2xl font-bold mt-1 text-rose-600">{stats.suspicious_count}</h3>
                        </div>
                        <ShieldAlert className="h-6 w-6 text-rose-500" />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500">Unique IP Addresses</span>
                            <h3 className="font-fredoka text-2xl font-bold mt-1 text-slate-800 dark:text-white">{stats.unique_ips}</h3>
                        </div>
                        <Globe className="h-6 w-6 text-indigo-500" />
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by email or IP address..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <select
                                    className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white w-full"
                                    value={selectedStatus}
                                    onChange={handleStatusChange}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="success">Success</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                        </div>

                        {/* Suspicious Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="suspicious"
                                className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                                checked={suspiciousOnly}
                                onChange={handleSuspiciousChange}
                            />
                            <label htmlFor="suspicious" className="text-xs font-bold text-rose-600 flex items-center gap-1 cursor-pointer">
                                <ShieldAlert className="h-4 w-4" />
                                Suspicious Attacks Only
                            </label>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
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
                            <tbody className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-slate-850 dark:border-slate-850">
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

                    {/* Pagination */}
                    {logs.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4 dark:border-slate-850 dark:bg-slate-900">
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Showing <span className="font-medium">{logs.data.length}</span> logs out of <span className="font-medium">{logs.total}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
                                        {logs.links.map((link, idx) => (
                                            <button
                                                key={idx}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                                className={`relative inline-flex items-center px-4 py-2 text-xs font-semibold ${
                                                    link.active
                                                        ? 'z-10 bg-indigo-600 text-white'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-slate-800'
                                                } ${idx === 0 ? 'rounded-l-md' : ''} ${
                                                    idx === logs.links.length - 1 ? 'rounded-r-md' : ''
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardSectionPage>
    );
}

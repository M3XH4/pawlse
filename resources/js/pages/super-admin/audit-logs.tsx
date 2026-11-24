import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { FileSearch, Search, Activity, Terminal } from 'lucide-react';
import { DashboardSectionPage } from '@/components/dashboard/section-page';
import { DashboardPagination } from '@/components/dashboard/pagination';
import { useResponsiveViewMode, ViewModeToggle } from '@/components/dashboard/view-mode-toggle';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { ModernSelect } from '@/components/ui/modern-select';
import { FilteredContentSkeleton } from '@/components/ui/skeleton-presets';
import { useFilteredSectionLoading } from '@/hooks/use-inertia-loading';
import { formatPillLabel } from '@/lib/utils';

interface AuditLogRecord {
    id: number;
    user_name: string;
    user_role?: string;
    action: string;
    description: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AuditLogProps {
    logs: {
        data: AuditLogRecord[];
        links: PaginationLink[];
        total: number;
    };
    users: Array<{ id: number; name: string; role: string }>;
    actions: string[];
    filters: {
        search?: string;
        role?: string;
        user_id?: string;
        action?: string;
        date_from?: string;
        date_to?: string;
    };
    stats: {
        total_logs: number;
        unique_users: number;
        system_logs: number;
    };
}

export default function AuditLogs({ logs, users, actions, filters, stats }: AuditLogProps) {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [selectedUser, setSelectedUser] = useState(filters.user_id || '');
    const [selectedAction, setSelectedAction] = useState(filters.action || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Handle searching with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                applyFilters({ search: searchTerm });
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const applyFilters = (overrides = {}) => {
        router.get(
            '/account/super-admin/audit-logs',
            {
                search: searchTerm,
                role: selectedRole,
                user_id: selectedUser,
                action: selectedAction,
                date_from: dateFrom,
                date_to: dateTo,
                ...overrides
            },
            { preserveState: true }
        );
    };

    const handleRoleChange = (val: string) => {
        setSelectedRole(val);
        applyFilters({ role: val });
    };

    const [viewMode, setViewMode] = useResponsiveViewMode('pawlse-sa-audit-logs-view');
    const isFiltering = useFilteredSectionLoading();

    const handleUserChange = (val: string) => {
        setSelectedUser(val);
        applyFilters({ user_id: val });
    };

    const handleActionChange = (val: string) => {
        setSelectedAction(val);
        applyFilters({ action: val });
    };

    const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateFrom(e.target.value);
        applyFilters({ date_from: e.target.value });
    };

    const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateTo(e.target.value);
        applyFilters({ date_to: e.target.value });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRole('');
        setSelectedUser('');
        setSelectedAction('');
        setDateFrom('');
        setDateTo('');
        router.get('/account/super-admin/audit-logs', {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <DashboardSectionPage
            title="Audit Logs"
            description="Trace and inspect all actions and setting modifications across the system"
        >
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                    <div className="col-span-2 sm:col-span-1 rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                            <span className="block text-[11px] sm:text-xs font-semibold text-gray-500 truncate">Total Audit Logs</span>
                            <h3 className="font-fredoka text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 text-slate-800 dark:text-white">{stats.total_logs}</h3>
                        </div>
                        <div className="shrink-0 rounded-xl bg-indigo-50 p-2 sm:p-2.5 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                            <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                            <span className="block text-[11px] sm:text-xs font-semibold text-gray-500 leading-snug">Active Operators</span>
                            <h3 className="font-fredoka text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 text-slate-800 dark:text-white">{stats.unique_users}</h3>
                        </div>
                        <div className="shrink-0 rounded-xl bg-emerald-50 p-2 sm:p-2.5 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                            <Terminal className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                            <span className="block text-[11px] sm:text-xs font-semibold text-gray-500 leading-snug">Guest / System</span>
                            <h3 className="font-fredoka text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 text-slate-800 dark:text-white">{stats.system_logs}</h3>
                        </div>
                        <div className="shrink-0 rounded-xl bg-amber-50 p-2 sm:p-2.5 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                            <FileSearch className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
                        {/* Search */}
                        <div className="relative col-span-2 md:col-span-3 min-w-0">
                            <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search logs by action, description, IP address, user name or email..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-900 dark:bg-slate-900 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Role Filter */}
                        <div className="min-w-0">
                            <label className="block text-[11px] sm:text-xs font-semibold text-gray-500 mb-1">Filter by Role</label>
                            <ModernSelect
                                size="sm"
                                searchable={false}
                                value={selectedRole}
                                onChange={handleRoleChange}
                                options={[
                                    { value: '', label: 'All Roles' },
                                    { value: 'super-admin', label: 'Super Admin' },
                                    { value: 'admin', label: 'Admin' },
                                    { value: 'volunteer', label: 'Volunteer' },
                                    { value: 'user', label: 'User' },
                                    { value: 'system', label: 'System / Guest' },
                                ]}
                            />
                        </div>

                        {/* User Filter */}
                        <div className="min-w-0">
                            <label className="block text-[11px] sm:text-xs font-semibold text-gray-500 mb-1">Filter by User</label>
                            <ModernSelect
                                size="sm"
                                value={selectedUser}
                                onChange={handleUserChange}
                                options={[
                                    { value: '', label: 'All Users' },
                                    { value: 'system', label: 'System / Guest' },
                                    ...users.map((user) => ({
                                        value: String(user.id),
                                        label: `${user.name} (${user.role})`,
                                    })),
                                ]}
                            />
                        </div>

                        {/* Action Type Filter */}
                        <div className="col-span-2 sm:col-span-1 min-w-0">
                            <label className="block text-[11px] sm:text-xs font-semibold text-gray-500 mb-1">Filter by Action</label>
                            <ModernSelect
                                size="sm"
                                value={selectedAction}
                                onChange={handleActionChange}
                                options={[
                                    { value: '', label: 'All Actions' },
                                    ...actions.map((act) => ({
                                        value: act,
                                        label: act,
                                    })),
                                ]}
                            />
                        </div>

                        {/* Date From */}
                        <div className="min-w-0">
                            <ModernDatePicker
                                label="Date From"
                                allowPast={true}
                                maxDate={todayIso}
                                value={dateFrom}
                                onChange={(date) => {
                                    setDateFrom(date);
                                    if (dateTo && date > dateTo) {
                                        setDateTo(date);
                                        applyFilters({ date_from: date, date_to: date });
                                    } else {
                                        applyFilters({ date_from: date });
                                    }
                                }}
                                placeholder="From date..."
                            />
                        </div>

                        {/* Date To */}
                        <div className="min-w-0">
                            <ModernDatePicker
                                label="Date To"
                                allowPast={true}
                                minDate={dateFrom || undefined}
                                maxDate={todayIso}
                                value={dateTo}
                                onChange={(date) => {
                                    if (dateFrom && date < dateFrom) {
                                        return;
                                    }
                                    setDateTo(date);
                                    applyFilters({ date_to: date });
                                }}
                                placeholder="To date..."
                            />
                        </div>

                        {/* Reset Filters */}
                        <div className="col-span-2 sm:col-span-1 flex items-end min-w-0">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="w-full py-2 text-xs sm:text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/30 rounded-xl transition duration-150 cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audit Logs Table / Cards */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6 dark:border-slate-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                            Audit Trail ({logs.total})
                        </span>
                        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                    </div>

                    <FilteredContentSkeleton
                        isLoading={isFiltering}
                        variant={viewMode === 'cards' ? 'cards' : 'table'}
                        rows={6}
                        columns={5}
                    >
                    {viewMode === 'table' && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Role</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Action Type</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">IP Address</th>
                                    <th className="px-6 py-4">Browser Info</th>
                                    <th className="px-6 py-4">Logged At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-slate-900 dark:border-slate-900">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                                            No audit trail logs recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                {log.user_name}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium whitespace-nowrap">
                                                {log.user_role === 'super-admin' && (
                                                    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-950/20 dark:text-red-400">
                                                        Super Admin
                                                    </span>
                                                )}
                                                {log.user_role === 'admin' && (
                                                    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 ring-1 ring-inset ring-purple-600/20 dark:bg-purple-950/20 dark:text-purple-400">
                                                        Admin
                                                    </span>
                                                )}
                                                {log.user_role === 'volunteer' && (
                                                    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/20 dark:text-emerald-400">
                                                        Volunteer
                                                    </span>
                                                )}
                                                {log.user_role === 'user' && (
                                                    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/20 dark:text-indigo-400">
                                                        User
                                                    </span>
                                                )}
                                                {(log.user_role === 'system' || !log.user_role) && (
                                                    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-gray-50 px-2 py-0.5 text-xs font-bold text-gray-700 ring-1 ring-inset ring-gray-600/20 dark:bg-gray-800/20 dark:text-gray-400">
                                                        System / Guest
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center whitespace-nowrap rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-950/20 dark:text-blue-400">
                                                    {formatPillLabel(log.action)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium max-w-xs truncate" title={log.description}>
                                                {log.description}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono">{log.ip_address}</td>
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
                    )}

                    {viewMode === 'cards' && (
                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                        {logs.data.length === 0 ? (
                            <div className="px-6 py-10 text-center text-sm text-gray-400">
                                No audit trail logs recorded yet.
                            </div>
                        ) : (
                            logs.data.map((log) => (
                                <div key={log.id} className="p-4 space-y-2 hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-white">{log.user_name}</span>
                                            <span className="inline-flex items-center whitespace-nowrap rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                                                {formatPillLabel(log.action)}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-gray-400">{log.created_at}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-slate-300">{log.description}</p>
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 pt-1">
                                        <span className="font-mono">{log.ip_address}</span>
                                        <span>{formatPillLabel(log.user_role || 'system')}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    )}
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

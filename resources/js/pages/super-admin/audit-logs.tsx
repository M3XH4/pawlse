import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { FileSearch, Search, Activity, Terminal } from 'lucide-react';
import { DashboardSectionPage } from '@/components/dashboard/section-page';

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

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRole(e.target.value);
        applyFilters({ role: e.target.value });
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUser(e.target.value);
        applyFilters({ user_id: e.target.value });
    };

    const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAction(e.target.value);
        applyFilters({ action: e.target.value });
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
        router.get('/account/super-admin/audit-logs', {}, { preserveState: false });
    };

    return (
        <DashboardSectionPage
            title="Audit Logs"
            description="Trace and inspect all actions and setting modifications across the system"
        >
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500">Total Audit Logs</span>
                            <h3 className="font-fredoka text-2xl font-bold mt-1 text-slate-800 dark:text-white">{stats.total_logs}</h3>
                        </div>
                        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                            <Activity className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500">Active Registered Operators</span>
                            <h3 className="font-fredoka text-2xl font-bold mt-1 text-slate-800 dark:text-white">{stats.unique_users}</h3>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                            <Terminal className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500">Guest / System Actions</span>
                            <h3 className="font-fredoka text-2xl font-bold mt-1 text-slate-800 dark:text-white">{stats.system_logs}</h3>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                            <FileSearch className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
                        {/* Search */}
                        <div className="relative col-span-1 md:col-span-3">
                            <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search logs by action, description, IP address, user name or email..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Filter by Role</label>
                            <select
                                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                value={selectedRole}
                                onChange={handleRoleChange}
                            >
                                <option value="">All Roles</option>
                                <option value="super-admin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="volunteer">Volunteer</option>
                                <option value="user">User</option>
                                <option value="system">System / Guest</option>
                            </select>
                        </div>

                        {/* User Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Filter by User</label>
                            <select
                                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                value={selectedUser}
                                onChange={handleUserChange}
                            >
                                <option value="">All Users</option>
                                <option value="system">System / Guest</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Action Type Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Filter by Action</label>
                            <select
                                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                value={selectedAction}
                                onChange={handleActionChange}
                            >
                                <option value="">All Actions</option>
                                {actions.map(act => (
                                    <option key={act} value={act}>{act}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Date From</label>
                            <input
                                type="date"
                                className="w-full pl-3 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                value={dateFrom}
                                onChange={handleDateFromChange}
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Date To</label>
                            <input
                                type="date"
                                className="w-full pl-3 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                value={dateTo}
                                onChange={handleDateToChange}
                            />
                        </div>

                        {/* Reset Filters */}
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="w-full py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/30 rounded-xl transition duration-150 cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Action Type</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">IP Address</th>
                                    <th className="px-6 py-4">Browser Info</th>
                                    <th className="px-6 py-4">Logged At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-slate-850 dark:border-slate-850">
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
                                            <td className="px-6 py-4 text-xs font-medium">
                                                {log.user_role === 'super-admin' && (
                                                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-950/20 dark:text-red-400">
                                                        Super Admin
                                                    </span>
                                                )}
                                                {log.user_role === 'admin' && (
                                                    <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 ring-1 ring-inset ring-purple-600/20 dark:bg-purple-950/20 dark:text-purple-400">
                                                        Admin
                                                    </span>
                                                )}
                                                {log.user_role === 'volunteer' && (
                                                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/20 dark:text-emerald-400">
                                                        Volunteer
                                                    </span>
                                                )}
                                                {log.user_role === 'user' && (
                                                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/20 dark:text-indigo-400">
                                                        User
                                                    </span>
                                                )}
                                                {(log.user_role === 'system' || !log.user_role) && (
                                                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-bold text-gray-700 ring-1 ring-inset ring-gray-600/20 dark:bg-gray-800/20 dark:text-gray-400">
                                                        System / Guest
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-950/20 dark:text-blue-400">
                                                    {log.action}
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
                                                className={`relative inline-flex items-center px-4 py-2 text-xs font-semibold cursor-pointer ${
                                                    link.active
                                                        ? 'z-10 bg-indigo-600 text-white font-bold'
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

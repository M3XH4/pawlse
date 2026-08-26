import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { 
    Users, Plus, Search, Filter, Edit2, Trash2, X, Check, Clock, ShieldAlert,
    AlertCircle, RotateCcw
} from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';
import { toast } from 'sonner';

interface UserRecord {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified_at: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface UserManagementProps {
    users: {
        data: UserRecord[];
        links: PaginationLink[];
        total: number;
    };
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
    roles: string[];
    stats: {
        total: number;
        admins: number;
        volunteers: number;
        unverified: number;
    };
}

export default function UserManagement({ users, filters, roles, stats }: UserManagementProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        verified: true
    });

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
            '/account/super-admin/user-management',
            {
                search: searchTerm,
                role: selectedRole,
                status: selectedStatus,
                ...overrides
            },
            { preserveState: true }
        );
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRole(e.target.value);
        applyFilters({ role: e.target.value });
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStatus(e.target.value);
        applyFilters({ status: e.target.value });
    };

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        setData({
            name: '',
            email: '',
            password: '',
            role: 'user',
            verified: true
        });
        setShowModal(true);
    };

    const openEditModal = (user: UserRecord) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            verified: !!user.email_verified_at
        });
        setShowModal(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            put(`/account/super-admin/user-management/${editingUser.id}`, {
                onSuccess: () => {
                    toast.success('User updated successfully.');
                    setShowModal(false);
                    reset();
                },
                onError: () => {
                    toast.error('Failed to update user.');
                }
            });
        } else {
            post('/account/super-admin/user-management', {
                onSuccess: () => {
                    toast.success('User created successfully.');
                    setShowModal(false);
                    reset();
                },
                onError: () => {
                    toast.error('Failed to create user.');
                }
            });
        }
    };

    const handleDeleteUser = (user: UserRecord) => {
        if (confirm(`Are you sure you want to archive user ${user.name}?`)) {
            router.delete(`/account/super-admin/user-management/${user.id}`, {
                onSuccess: () => toast.success('User archived successfully.'),
                onError: (err: any) => toast.error(err.error || 'Failed to archive user.')
            });
        }
    };

    return (
        <DashboardSectionPage
            title="User Management"
            description="Inspect and manage all user accounts, assign roles, and handle verification status"
        >
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Total Users</span>
                            <Users className="h-5 w-5 text-indigo-500" />
                        </div>
                        <h3 className="font-fredoka text-2xl font-bold mt-2 text-slate-800 dark:text-white">{stats.total}</h3>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Administrators</span>
                            <Users className="h-5 w-5 text-rose-500" />
                        </div>
                        <h3 className="font-fredoka text-2xl font-bold mt-2 text-slate-800 dark:text-white">{stats.admins}</h3>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Volunteers</span>
                            <Users className="h-5 w-5 text-emerald-500" />
                        </div>
                        <h3 className="font-fredoka text-2xl font-bold mt-2 text-slate-800 dark:text-white">{stats.volunteers}</h3>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Unverified Emails</span>
                            <Users className="h-5 w-5 text-amber-500" />
                        </div>
                        <h3 className="font-fredoka text-2xl font-bold mt-2 text-slate-800 dark:text-white">{stats.unverified}</h3>
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
                                    placeholder="Search users by name or email..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Role Filter */}
                            <div className="relative">
                                <select
                                    className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                    value={selectedRole}
                                    onChange={handleRoleChange}
                                >
                                    <option value="">All Roles</option>
                                    {roles.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Verification status Filter */}
                            <div className="relative">
                                <select
                                    className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                    value={selectedStatus}
                                    onChange={handleStatusChange}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="verified">Verified</option>
                                    <option value="unverified">Unverified</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 transition"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add User</span>
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Email Status</th>
                                    <th className="px-6 py-4">Created At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-slate-850 dark:border-slate-850">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                                            No system users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${
                                                    user.role === 'super-admin'
                                                        ? 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/20 dark:text-rose-400'
                                                        : user.role === 'admin'
                                                        ? 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-950/20 dark:text-violet-400'
                                                        : user.role === 'volunteer'
                                                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/20 dark:text-emerald-400'
                                                        : 'bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.email_verified_at ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                                        <Check className="h-4.5 w-4.5" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-bold">
                                                        <Clock className="h-4.5 w-4.5" />
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs">{user.created_at}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400"
                                                        title="Edit User"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="text-rose-600 hover:text-rose-900 dark:hover:text-rose-400"
                                                        title="Archive User"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4 dark:border-slate-850 dark:bg-slate-900">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => users.links[0].url && router.visit(users.links[0].url)}
                                    disabled={!users.links[0].url}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => users.links[users.links.length - 1].url && router.visit(users.links[users.links.length - 1].url)}
                                    disabled={!users.links[users.links.length - 1].url}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Showing <span className="font-medium">{users.data.length}</span> records
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
                                        {users.links.map((link, idx) => (
                                            <button
                                                key={idx}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                                className={`relative inline-flex items-center px-4 py-2 text-xs font-semibold ${
                                                    link.active
                                                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 dark:text-gray-300 dark:ring-slate-800'
                                                } ${idx === 0 ? 'rounded-l-md' : ''} ${
                                                    idx === users.links.length - 1 ? 'rounded-r-md' : ''
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

            {/* Modal Dialog */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border dark:border-slate-850">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-fredoka text-lg font-bold text-slate-800 dark:text-white">
                                {editingUser ? 'Edit User details' : 'Add New User'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Password {editingUser && <span className="text-gray-400 font-normal">(leave empty to keep unchanged)</span>}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    placeholder={editingUser ? '••••••••' : ''}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Assigned Role</label>
                                <select
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                >
                                    {roles.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                {errors.role && <p className="mt-1 text-xs text-rose-500">{errors.role}</p>}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="verified"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={data.verified}
                                    onChange={(e) => setData('verified', e.target.checked)}
                                />
                                <label htmlFor="verified" className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                    Mark Email as Verified
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-850">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-250 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    {editingUser ? 'Save changes' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardSectionPage>
    );
}

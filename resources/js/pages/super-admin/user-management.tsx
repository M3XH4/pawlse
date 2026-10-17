import React, { useState, useEffect, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Users, Plus, Search, Filter, Edit2, Trash2, X, Check, Clock, ShieldAlert,
    AlertCircle, RotateCcw, ShieldCheck, Shield, Key, Lock, CheckCircle2,
    ChevronDown, ChevronRight, Sparkles, UserCheck, Layers, HelpCircle,
    Sliders, CheckSquare, Square, RefreshCw, AlertTriangle
} from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

interface UserRecord {
    id: number;
    name: string;
    email: string;
    role: string;
    roles: string[];
    direct_permissions: string[];
    all_permissions: string[];
    email_verified_at: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface RoleDetail {
    id: number;
    name: string;
    permissions: string[];
    users_count: number;
    is_system: boolean;
}

interface PermissionItem {
    name: string;
    description: string;
}

interface PermissionCategory {
    category: string;
    permissions: PermissionItem[];
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
        tab?: string;
    };
    roles: string[];
    roles_detail: RoleDetail[];
    permission_catalog: PermissionCategory[];
    stats: {
        total: number;
        admins: number;
        volunteers: number;
        unverified: number;
        total_roles: number;
        total_permissions: number;
    };
}

export default function UserManagement({
    users,
    filters,
    roles,
    roles_detail = [],
    permission_catalog = [],
    stats
}: UserManagementProps) {
    // Active Tab: 'users' | 'roles-permissions'
    const [activeTab, setActiveTab] = useState<'users' | 'roles-permissions'>(
        filters.tab === 'roles-permissions' ? 'roles-permissions' : 'users'
    );

    // Filters for users
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    // Sidebar Drawer State for User Edit/Create
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

    // Permission search filter inside drawer
    const [drawerPermissionSearch, setDrawerPermissionSearch] = useState('');
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

    // Role Permission Matrix state (for Roles & Permissions tab)
    const [selectedMatrixRole, setSelectedMatrixRole] = useState<string>(
        roles_detail[0]?.name || 'admin'
    );
    const [matrixPermissions, setMatrixPermissions] = useState<string[]>([]);
    const [isSavingRolePerms, setIsSavingRolePerms] = useState(false);

    // New Custom Role Modal
    const [showNewRoleModal, setShowNewRoleModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
    const [isCreatingRole, setIsCreatingRole] = useState(false);

    // User Form
    const { data, setData, post, put, reset, errors, processing } = useForm<{
        name: string;
        email: string;
        password: string;
        role: string;
        verified: boolean;
        permissions: string[];
    }>({
        name: '',
        email: '',
        password: '',
        role: 'user',
        verified: true,
        permissions: []
    });

    // Keep matrixPermissions synced when changing selected matrix role
    useEffect(() => {
        const found = roles_detail.find(r => r.name === selectedMatrixRole);
        if (found) {
            setMatrixPermissions([...found.permissions]);
        }
    }, [selectedMatrixRole, roles_detail]);

    // Handle searching with debounce for users
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
                tab: activeTab,
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

    const handleTabChange = (tab: 'users' | 'roles-permissions') => {
        setActiveTab(tab);
        router.get(
            '/account/super-admin/user-management',
            {
                search: searchTerm,
                role: selectedRole,
                status: selectedStatus,
                tab: tab
            },
            { preserveState: true }
        );
    };

    // Open Drawer for Create
    const openCreateDrawer = () => {
        setEditingUser(null);
        reset();
        setData({
            name: '',
            email: '',
            password: '',
            role: 'user',
            verified: true,
            permissions: []
        });
        setDrawerPermissionSearch('');
        // expand all categories by default
        const initExpanded: Record<string, boolean> = {};
        permission_catalog.forEach(cat => { initExpanded[cat.category] = true; });
        setOpenCategories(initExpanded);
        setIsDrawerOpen(true);
    };

    // Open Drawer for Edit
    const openEditDrawer = (user: UserRecord) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role || 'user',
            verified: !!user.email_verified_at,
            permissions: user.direct_permissions || []
        });
        setDrawerPermissionSearch('');
        const initExpanded: Record<string, boolean> = {};
        permission_catalog.forEach(cat => { initExpanded[cat.category] = true; });
        setOpenCategories(initExpanded);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setEditingUser(null);
        reset();
    };

    // Toggle a direct permission for the user inside the drawer
    const toggleUserPermission = (permissionName: string) => {
        const current = data.permissions || [];
        if (current.includes(permissionName)) {
            setData('permissions', current.filter(p => p !== permissionName));
        } else {
            setData('permissions', [...current, permissionName]);
        }
    };

    // Select or Clear all permissions in a category inside the drawer
    const toggleCategoryPermissions = (categoryPerms: PermissionItem[], selectAll: boolean) => {
        const permNames = categoryPerms.map(p => p.name);
        const current = data.permissions || [];
        if (selectAll) {
            const combined = Array.from(new Set([...current, ...permNames]));
            setData('permissions', combined);
        } else {
            setData('permissions', current.filter(p => !permNames.includes(p)));
        }
    };

    // Active role permissions for the selected role in the drawer
    const currentRolePermissions = useMemo(() => {
        const found = roles_detail.find(r => r.name === data.role);
        return found ? found.permissions : [];
    }, [data.role, roles_detail]);

    // Handle Form Submit from Sidebar Drawer
    const handleUserFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            put(`/account/super-admin/user-management/${editingUser.id}`, {
                onSuccess: () => {
                    toast.success(`User '${data.name}' updated successfully.`);
                    closeDrawer();
                },
                onError: () => {
                    toast.error('Failed to update user. Please check form errors.');
                }
            });
        } else {
            post('/account/super-admin/user-management', {
                onSuccess: () => {
                    toast.success(`User '${data.name}' created successfully.`);
                    closeDrawer();
                },
                onError: () => {
                    toast.error('Failed to create user. Please check form errors.');
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

    // Role Permission Matrix Handlers
    const toggleMatrixPermission = (permissionName: string) => {
        if (matrixPermissions.includes(permissionName)) {
            setMatrixPermissions(prev => prev.filter(p => p !== permissionName));
        } else {
            setMatrixPermissions(prev => [...prev, permissionName]);
        }
    };

    const toggleMatrixCategory = (categoryPerms: PermissionItem[], selectAll: boolean) => {
        const permNames = categoryPerms.map(p => p.name);
        if (selectAll) {
            setMatrixPermissions(prev => Array.from(new Set([...prev, ...permNames])));
        } else {
            setMatrixPermissions(prev => prev.filter(p => !permNames.includes(p)));
        }
    };

    const handleSaveRolePermissions = () => {
        setIsSavingRolePerms(true);
        router.put(
            `/account/super-admin/roles/${selectedMatrixRole}/permissions`,
            { permissions: matrixPermissions },
            {
                onSuccess: () => {
                    toast.success(`Permissions for role '${selectedMatrixRole}' updated successfully.`);
                    setIsSavingRolePerms(false);
                },
                onError: () => {
                    toast.error('Failed to update role permissions.');
                    setIsSavingRolePerms(false);
                }
            }
        );
    };

    const handleCreateCustomRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;

        setIsCreatingRole(true);
        router.post(
            '/account/super-admin/roles',
            {
                name: newRoleName,
                permissions: newRolePermissions
            },
            {
                onSuccess: () => {
                    toast.success(`Custom role '${newRoleName}' created successfully.`);
                    setShowNewRoleModal(false);
                    setNewRoleName('');
                    setNewRolePermissions([]);
                    setIsCreatingRole(false);
                },
                onError: (err: any) => {
                    toast.error(err.name || 'Failed to create custom role.');
                    setIsCreatingRole(false);
                }
            }
        );
    };

    const handleDeleteCustomRole = (roleName: string) => {
        if (confirm(`Are you sure you want to delete role '${roleName}'?`)) {
            router.delete(`/account/super-admin/roles/${roleName}`, {
                onSuccess: () => toast.success(`Role '${roleName}' deleted successfully.`),
                onError: (err: any) => toast.error(err.error || 'Failed to delete role.')
            });
        }
    };

    const getRoleBadgeClasses = (roleName: string) => {
        switch (roleName) {
            case 'super-admin':
                return 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/30 dark:text-rose-400';
            case 'admin':
                return 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-950/30 dark:text-violet-400';
            case 'volunteer':
                return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/30 dark:text-emerald-400';
            default:
                return 'bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    return (
        <DashboardSectionPage
            title="User & Access Control"
            description="Inspect system accounts, configure role-based access policies, and manage permissions with precision"
        >
            <div className="space-y-6">
                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 dark:border-slate-800">
                    <button
                        onClick={() => handleTabChange('users')}
                        className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors ${
                            activeTab === 'users'
                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        <span>User Accounts</span>
                        <span className="ml-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-slate-800 dark:text-gray-300">
                            {stats.total}
                        </span>
                    </button>

                    <button
                        onClick={() => handleTabChange('roles-permissions')}
                        className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors ${
                            activeTab === 'roles-permissions'
                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Roles & Permissions</span>
                        <span className="ml-1.5 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                            {stats.total_roles} Roles
                        </span>
                    </button>
                </div>

                {/* ===================== TAB 1: USERS LIST ===================== */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">Total Users</span>
                                    <Users className="h-5 w-5 text-indigo-500" />
                                </div>
                                <h3 className="font-fredoka text-2xl font-bold mt-2 text-slate-800 dark:text-white">{stats.total}</h3>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">Administrators</span>
                                    <Shield className="h-5 w-5 text-rose-500" />
                                </div>
                                <h3 className="font-fredoka text-2xl font-bold mt-2 text-slate-800 dark:text-white">{stats.admins}</h3>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">Volunteers</span>
                                    <UserCheck className="h-5 w-5 text-emerald-500" />
                                </div>
                                <h3 className="font-fredoka text-2xl font-bold mt-2 text-slate-800 dark:text-white">{stats.volunteers}</h3>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">Unverified Accounts</span>
                                    <Clock className="h-5 w-5 text-amber-500" />
                                </div>
                                <h3 className="font-fredoka text-2xl font-bold mt-2 text-slate-800 dark:text-white">{stats.unverified}</h3>
                            </div>
                        </div>

                        {/* Filters & Actions Bar */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                                    {/* Search */}
                                    <div className="relative flex-1">
                                        <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users by name or email address..."
                                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-850 dark:text-white"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    {/* Role Filter */}
                                    <div className="relative">
                                        <select
                                            className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-850 dark:text-white"
                                            value={selectedRole}
                                            onChange={handleRoleChange}
                                        >
                                            <option value="">All Roles</option>
                                            {roles.map(r => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Verification Status Filter */}
                                    <div className="relative">
                                        <select
                                            className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-850 dark:text-white"
                                            value={selectedStatus}
                                            onChange={handleStatusChange}
                                        >
                                            <option value="">All Verification</option>
                                            <option value="verified">Verified Only</option>
                                            <option value="unverified">Unverified Only</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={openCreateDrawer}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-indigo-500 transition"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add User</span>
                                </button>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
                                    <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Assigned Role</th>
                                            <th className="px-6 py-4">Direct Permissions</th>
                                            <th className="px-6 py-4">Email Status</th>
                                            <th className="px-6 py-4">Created Date</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-slate-800 dark:border-slate-800">
                                        {users.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                                                    <Users className="mx-auto h-8 w-8 text-gray-300 mb-2 dark:text-gray-600" />
                                                    No system users found matching the selected criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            users.data.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 dark:text-white">{user.name}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${getRoleBadgeClasses(user.role)}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.direct_permissions && user.direct_permissions.length > 0 ? (
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/30 dark:text-emerald-300">
                                                                <Key className="h-3 w-3" />
                                                                {user.direct_permissions.length} Custom Grants
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Role Default ({user.all_permissions?.length || 0})</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.email_verified_at ? (
                                                            <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                                                                <Check className="h-4 w-4" />
                                                                Verified
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                                                                <Clock className="h-4 w-4" />
                                                                Unverified
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">{user.created_at}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => openEditDrawer(user)}
                                                                className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 dark:text-indigo-400 transition"
                                                                title="Edit user & permissions"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user)}
                                                                className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-rose-400 transition"
                                                                title="Archive user"
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

                            {/* Mobile Cards View */}
                            <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800">
                                {users.data.length === 0 ? (
                                    <div className="px-6 py-12 text-center text-sm text-gray-400">
                                        <Users className="mx-auto h-8 w-8 text-gray-300 mb-2 dark:text-gray-600" />
                                        No system users found matching the selected criteria.
                                    </div>
                                ) : (
                                    users.data.map((user) => (
                                        <div key={user.id} className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shrink-0">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                                                    </div>
                                                </div>

                                                <span className={`inline-flex shrink-0 items-center rounded-lg px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${getRoleBadgeClasses(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs bg-gray-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Permissions</span>
                                                    {user.direct_permissions && user.direct_permissions.length > 0 ? (
                                                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center gap-1">
                                                            <Key className="h-3 w-3" /> {user.direct_permissions.length} Grants
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Default ({user.all_permissions?.length || 0})</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 block text-right">Email Status</span>
                                                    {user.email_verified_at ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                                            <Check className="h-3.5 w-3.5" /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-bold">
                                                            <Clock className="h-3.5 w-3.5" /> Unverified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-[11px] text-gray-400 font-medium">Joined {user.created_at}</span>

                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => openEditDrawer(user)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:text-indigo-300 transition flex items-center gap-1"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-400 transition"
                                                        title="Archive user"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {users.links.length > 3 && (
                                <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                                    <div className="flex flex-1 justify-between sm:hidden">
                                        <button
                                            onClick={() => users.links[0].url && router.visit(users.links[0].url)}
                                            disabled={!users.links[0].url}
                                            className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => {
                                                const nextUrl = users.links[users.links.length - 1]?.url;
                                                if (nextUrl) {
                                                    router.visit(nextUrl);
                                                }
                                            }}
                                            disabled={!users.links[users.links.length - 1]?.url}
                                            className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Showing <span className="font-semibold text-gray-900 dark:text-white">{users.data.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{users.total}</span> users
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
                                                {users.links.map((link, idx) => (
                                                    <button
                                                        key={idx}
                                                        disabled={!link.url}
                                                        onClick={() => link.url && router.visit(link.url)}
                                                        className={`relative inline-flex items-center px-3.5 py-1.5 text-xs font-bold ${
                                                            link.active
                                                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline-2'
                                                                : 'text-gray-900 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:ring-slate-800 dark:hover:bg-slate-800'
                                                        } ${idx === 0 ? 'rounded-l-lg' : ''} ${
                                                            idx === users.links.length - 1 ? 'rounded-r-lg' : ''
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
                )}

                {/* ===================== TAB 2: ROLES & PERMISSIONS ===================== */}
                {activeTab === 'roles-permissions' && (
                    <div className="space-y-6">
                        {/* Roles Header Stats */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">Total System Roles</span>
                                    <ShieldCheck className="h-5 w-5 text-indigo-500" />
                                </div>
                                <h3 className="font-fredoka text-2xl font-bold mt-2 text-slate-800 dark:text-white">{stats.total_roles}</h3>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">Total Permissions</span>
                                    <Key className="h-5 w-5 text-emerald-500" />
                                </div>
                                <h3 className="font-fredoka text-2xl font-bold mt-2 text-slate-800 dark:text-white">{stats.total_permissions}</h3>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">Security Modules</span>
                                    <Layers className="h-5 w-5 text-violet-500" />
                                </div>
                                <h3 className="font-fredoka text-2xl font-bold mt-2 text-slate-800 dark:text-white">{permission_catalog.length}</h3>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">Admins & Elevated Roles</span>
                                    <Lock className="h-5 w-5 text-rose-500" />
                                </div>
                                <h3 className="font-fredoka text-2xl font-bold mt-2 text-slate-800 dark:text-white">{stats.admins}</h3>
                            </div>
                        </div>

                        {/* Roles Catalog Cards */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                                <div>
                                    <h3 className="font-fredoka text-xl font-bold text-slate-800 dark:text-white">Platform Roles</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Configured access roles and their assigned permission scope</p>
                                </div>
                                <button
                                    onClick={() => setShowNewRoleModal(true)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Create Custom Role</span>
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {roles_detail.map((r) => {
                                    const isSelected = selectedMatrixRole === r.name;
                                    return (
                                        <div
                                            key={r.id}
                                            onClick={() => setSelectedMatrixRole(r.name)}
                                            className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                                                isSelected
                                                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/20'
                                                    : 'border-gray-200 bg-gray-50/40 hover:border-gray-300 dark:border-slate-800 dark:bg-slate-850/40'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${getRoleBadgeClasses(r.name)}`}>
                                                    {r.name}
                                                </span>
                                                {r.is_system ? (
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">System</span>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCustomRole(r.name);
                                                        }}
                                                        className="text-rose-500 hover:text-rose-700 p-1 rounded-md"
                                                        title="Delete custom role"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    <span>Active Users:</span>
                                                    <span className="font-bold text-gray-900 dark:text-white">{r.users_count}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    <span>Permissions:</span>
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{r.permissions.length}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                <span>{isSelected ? 'Configuring Matrix' : 'Click to Configure'}</span>
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Permission Matrix Editor for Selected Role */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-100 dark:border-slate-800">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-fredoka text-xl font-bold text-slate-800 dark:text-white">
                                            Permission Scope for <span className="text-indigo-600 dark:text-indigo-400 capitalize">{selectedMatrixRole}</span>
                                        </h3>
                                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                            {matrixPermissions.length} enabled
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Toggle capabilities assigned to accounts with this role
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const allPermNames: string[] = [];
                                            permission_catalog.forEach(cat => cat.permissions.forEach(p => allPermNames.push(p.name)));
                                            setMatrixPermissions(allPermNames);
                                        }}
                                        className="text-xs font-bold text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-gray-300 dark:text-gray-700">|</span>
                                    <button
                                        type="button"
                                        onClick={() => setMatrixPermissions([])}
                                        className="text-xs font-bold text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={handleSaveRolePermissions}
                                        disabled={isSavingRolePerms}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition"
                                    >
                                        {isSavingRolePerms ? (
                                            <Spinner size="xs" showProgress label="Saving..." />
                                        ) : (
                                            <>
                                                <Check className="h-3.5 w-3.5" />
                                                <span>Save Permissions</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Categorized Permissions Grid */}
                            <div className="space-y-6 pt-6">
                                {permission_catalog.map((category) => {
                                    const catPermNames = category.permissions.map(p => p.name);
                                    const allChecked = catPermNames.every(p => matrixPermissions.includes(p));
                                    const someChecked = catPermNames.some(p => matrixPermissions.includes(p)) && !allChecked;

                                    return (
                                        <div key={category.category} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 dark:border-slate-800 dark:bg-slate-850/40">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Layers className="h-4 w-4 text-indigo-500" />
                                                    <h4 className="font-fredoka text-base font-bold text-slate-800 dark:text-white">
                                                        {category.category}
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-gray-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border dark:border-slate-700">
                                                        {catPermNames.filter(p => matrixPermissions.includes(p)).length}/{category.permissions.length}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleMatrixCategory(category.permissions, !allChecked)}
                                                    className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                                                >
                                                    {allChecked ? 'Deselect Category' : 'Select Category'}
                                                </button>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {category.permissions.map((perm) => {
                                                    const isChecked = matrixPermissions.includes(perm.name);
                                                    return (
                                                        <label
                                                            key={perm.name}
                                                            onClick={() => toggleMatrixPermission(perm.name)}
                                                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                                                isChecked
                                                                    ? 'bg-white border-indigo-300 shadow-2xs dark:bg-slate-900 dark:border-indigo-600'
                                                                    : 'bg-white/60 border-gray-200 hover:border-gray-300 dark:bg-slate-900/40 dark:border-slate-800'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => {}}
                                                                className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="text-xs font-bold text-gray-900 dark:text-white">
                                                                    {perm.name}
                                                                </div>
                                                                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                                                    {perm.description}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ===================== SIDEBAR DRAWER (USER EDIT / CREATE) ===================== */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-end">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeDrawer}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Sliding Drawer Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl h-full bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col z-10 border-l border-gray-200 dark:border-gray-800"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/40">
                                <div>
                                    <span className="text-[10px] font-black text-paw-orange uppercase tracking-widest block mb-1">
                                        {editingUser ? 'User Account Management' : 'Add Platform Account'}
                                    </span>
                                    <h3 className="text-2xl font-black text-paw-navy dark:text-white">
                                        {editingUser ? editingUser.name : 'Create New User'}
                                    </h3>
                                    {editingUser && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                                            {editingUser.email}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={closeDrawer}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    <X size={22} className="text-gray-500" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <form onSubmit={handleUserFormSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
                                <div className="flex-1 p-6 space-y-7 overflow-y-auto">
                                    {/* SECTION 1: Personal & Account Details */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Users size={14} /> Profile & Credentials
                                        </h4>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Johnathan Doe"
                                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-850 dark:text-white"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                />
                                                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="e.g. user@pawlse.test"
                                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-850 dark:text-white"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                />
                                                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                    Password {editingUser && <span className="text-gray-400 font-normal">(leave blank to keep unchanged)</span>}
                                                </label>
                                                <input
                                                    type="password"
                                                    required={!editingUser}
                                                    placeholder={editingUser ? '••••••••' : 'Enter strong password'}
                                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-850 dark:text-white"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                />
                                                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-850/30 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        id="drawer_verified"
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={data.verified}
                                                        onChange={(e) => setData('verified', e.target.checked)}
                                                    />
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                            Mark Email as Verified
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                                            Allows instant access without requiring OTP confirmation
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 2: Role Selection */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <ShieldCheck size={14} /> Assigned Role
                                        </h4>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {roles.map((roleOption) => {
                                                const isSelected = data.role === roleOption;
                                                return (
                                                    <div
                                                        key={roleOption}
                                                        onClick={() => setData('role', roleOption)}
                                                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                                                            isSelected
                                                                ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500 dark:border-indigo-500 dark:bg-indigo-950/30'
                                                                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-slate-800 dark:bg-slate-900'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="roleSelection"
                                                            checked={isSelected}
                                                            onChange={() => {}}
                                                            className="mt-1 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <div>
                                                            <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${getRoleBadgeClasses(roleOption)}`}>
                                                                {roleOption}
                                                            </span>
                                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                                                {roleOption === 'super-admin'
                                                                    ? 'Full root system privileges'
                                                                    : roleOption === 'admin'
                                                                    ? 'Shelter operations & moderation'
                                                                    : roleOption === 'volunteer'
                                                                    ? 'Rescue & task operations'
                                                                    : 'Standard community user'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* SECTION 3: Custom Permissions & Direct Overrides */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Key size={14} /> Direct Permissions & Custom Overrides
                                                </h4>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Permissions inherited from role <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.role}</span> are automatically active.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Permission Search Filter */}
                                        <div className="relative">
                                            <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Filter permissions..."
                                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-850 dark:text-white"
                                                value={drawerPermissionSearch}
                                                onChange={(e) => setDrawerPermissionSearch(e.target.value)}
                                            />
                                        </div>

                                        {/* Categorized Permissions List */}
                                        <div className="space-y-3">
                                            {permission_catalog.map((cat) => {
                                                const filteredPerms = cat.permissions.filter(p =>
                                                    p.name.toLowerCase().includes(drawerPermissionSearch.toLowerCase()) ||
                                                    p.description.toLowerCase().includes(drawerPermissionSearch.toLowerCase())
                                                );

                                                if (filteredPerms.length === 0) return null;

                                                const isExpanded = openCategories[cat.category] !== false;
                                                const catPermNames = filteredPerms.map(p => p.name);
                                                const allDirect = catPermNames.every(p => data.permissions?.includes(p));

                                                return (
                                                    <div key={cat.category} className="rounded-xl border border-gray-100 bg-gray-50/40 dark:border-slate-800 dark:bg-slate-850/30 overflow-hidden">
                                                        <div
                                                            onClick={() => setOpenCategories(prev => ({ ...prev, [cat.category]: !isExpanded }))}
                                                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-slate-800/40 transition"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                                                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                                    {cat.category}
                                                                </span>
                                                                <span className="text-[10px] font-semibold text-gray-400">
                                                                    ({filteredPerms.length})
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleCategoryPermissions(filteredPerms, !allDirect)}
                                                                    className="text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                                                                >
                                                                    {allDirect ? 'Clear All' : 'Grant All'}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="p-3 pt-0 grid gap-2">
                                                                {filteredPerms.map((perm) => {
                                                                    const isInherited = currentRolePermissions.includes(perm.name);
                                                                    const isDirect = data.permissions?.includes(perm.name);
                                                                    const isGranted = isInherited || isDirect;

                                                                    return (
                                                                        <label
                                                                            key={perm.name}
                                                                            onClick={() => toggleUserPermission(perm.name)}
                                                                            className={`flex items-start justify-between gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                                                                isDirect
                                                                                    ? 'bg-emerald-50/60 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800'
                                                                                    : isInherited
                                                                                    ? 'bg-indigo-50/30 border-indigo-200/60 dark:bg-indigo-950/10 dark:border-indigo-900/40'
                                                                                    : 'bg-white border-gray-200 hover:border-gray-300 dark:bg-slate-900 dark:border-slate-800'
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-start gap-2.5">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isGranted}
                                                                                    onChange={() => {}}
                                                                                    className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                />
                                                                                <div>
                                                                                    <div className="font-bold text-gray-900 dark:text-white">
                                                                                        {perm.name}
                                                                                    </div>
                                                                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                                                                        {perm.description}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div>
                                                                                {isDirect ? (
                                                                                    <span className="inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                                                        Direct Override
                                                                                    </span>
                                                                                ) : isInherited ? (
                                                                                    <span className="inline-flex items-center rounded-md bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                                                                        Inherited
                                                                                    </span>
                                                                                ) : null}
                                                                            </div>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Drawer Footer Actions */}
                                <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-800/60 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeDrawer}
                                        className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-xs"
                                    >
                                        {processing ? (
                                            <Spinner
                                                size="xs"
                                                showProgress
                                                label={editingUser ? 'Saving Changes...' : 'Creating Account...'}
                                            />
                                        ) : (
                                            <span>{editingUser ? 'Save User Changes' : 'Create Account'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ===================== NEW CUSTOM ROLE MODAL ===================== */}
            <AnimatePresence>
                {showNewRoleModal && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNewRoleModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border dark:border-slate-800 z-10"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-fredoka text-lg font-bold text-slate-800 dark:text-white">
                                    Create New Custom Role
                                </h3>
                                <button
                                    onClick={() => setShowNewRoleModal(false)}
                                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateCustomRole} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Role Name / Identifier
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. coordinator, outreach-manager"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-850 dark:text-white"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Role name will be converted to lowercase slug identifier.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewRoleModal(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreatingRole}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition"
                                    >
                                        {isCreatingRole ? (
                                            <Spinner size="xs" showProgress label="Creating Role..." />
                                        ) : (
                                            <span>Create Role</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardSectionPage>
    );
}


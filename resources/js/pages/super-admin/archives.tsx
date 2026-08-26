import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    Archive, RotateCcw, Trash2, Search, Filter, AlertTriangle, Users, Heart,
    FileText, Calendar
} from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';
import { toast } from 'sonner';

interface TrashedRecord {
    id: number;
    type: 'user' | 'pet' | 'event' | 'rescue' | 'adoption' | 'volunteer';
    title: string;
    subtitle: string | null;
    deleted_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ArchiveProps {
    items: {
        data: TrashedRecord[];
        links: PaginationLink[];
        total: number;
    };
    filters: {
        type?: string;
        search?: string;
    };
    stats: {
        total: number;
        users: number;
        pets: number;
        events: number;
        rescues: number;
        adoptions: number;
        volunteers: number;
    };
}

export default function Archives({ items, filters, stats }: ArchiveProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');

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
            '/account/super-admin/archives',
            {
                search: searchTerm,
                type: selectedType,
                ...overrides
            },
            { preserveState: true }
        );
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(e.target.value);
        applyFilters({ type: e.target.value });
    };

    const handleRestore = (item: TrashedRecord) => {
        if (confirm(`Are you sure you want to restore this ${item.type} record?`)) {
            router.post(`/account/super-admin/archives/${item.type}/${item.id}/restore`, {}, {
                onSuccess: () => toast.success('Record restored successfully.'),
                onError: () => toast.error('Failed to restore record.')
            });
        }
    };

    const handlePermanentDelete = (item: TrashedRecord) => {
        if (confirm(`WARNING: Are you sure you want to PERMANENTLY delete this ${item.type} record? This action CANNOT be undone.`)) {
            router.delete(`/account/super-admin/archives/${item.type}/${item.id}/force`, {
                onSuccess: () => toast.success('Record permanently deleted.'),
                onError: () => toast.error('Failed to delete record.')
            });
        }
    };

    return (
        <DashboardSectionPage
            title="System Archives"
            description="Manage soft-deleted system records. Restore items to their original status or permanently purge them"
        >
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500">Total Archives</span>
                            <h3 className="font-fredoka text-2xl font-bold mt-1 text-slate-800 dark:text-white">{stats.total}</h3>
                        </div>
                        <Archive className="h-6 w-6 text-gray-400" />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500">Archived Users</span>
                            <h3 className="font-fredoka text-2xl font-bold mt-1 text-slate-800 dark:text-white">{stats.users}</h3>
                        </div>
                        <Users className="h-6 w-6 text-indigo-400" />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500">Archived Pets</span>
                            <h3 className="font-fredoka text-2xl font-bold mt-1 text-slate-800 dark:text-white">{stats.pets}</h3>
                        </div>
                        <Heart className="h-6 w-6 text-rose-400" />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-500">Archived Reports</span>
                            <h3 className="font-fredoka text-2xl font-bold mt-1 text-slate-800 dark:text-white">{stats.rescues}</h3>
                        </div>
                        <FileText className="h-6 w-6 text-emerald-400" />
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search archived records..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Record Type Filter */}
                        <div className="relative">
                            <select
                                className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white w-full"
                                value={selectedType}
                                onChange={handleTypeChange}
                            >
                                <option value="all">All Record Types</option>
                                <option value="user">Users</option>
                                <option value="pet">Shelter Animals</option>
                                <option value="event">Events</option>
                                <option value="rescue">Rescue Reports</option>
                                <option value="adoption">Adoption Applications</option>
                                <option value="volunteer">Volunteer Applications</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Warning Alert */}
                <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-4 dark:border-amber-950/20 dark:bg-amber-950/5 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Archived Records Notice</h4>
                        <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-1 leading-relaxed">
                            Restoring items will automatically link their original relationships back. 
                            Performing a permanent delete will purge the raw row data completely, which is irreversible.
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4">Record Type</th>
                                    <th className="px-6 py-4">Name/Title</th>
                                    <th className="px-6 py-4">Details/Subtitle</th>
                                    <th className="px-6 py-4">Archived At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-slate-850 dark:border-slate-850">
                                {items.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                                            No archived items found.
                                        </td>
                                    </tr>
                                ) : (
                                    items.data.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${
                                                    item.type === 'user' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/10' :
                                                    item.type === 'pet' ? 'bg-rose-50 text-rose-700 ring-rose-600/10' :
                                                    item.type === 'event' ? 'bg-violet-50 text-violet-700 ring-violet-600/10' :
                                                    item.type === 'rescue' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                                                    'bg-amber-50 text-amber-700 ring-amber-600/10'
                                                }`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                {item.title}
                                            </td>
                                            <td className="px-6 py-4 text-xs">{item.subtitle}</td>
                                            <td className="px-6 py-4 text-xs">{item.deleted_at}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleRestore(item)}
                                                        className="text-emerald-600 hover:text-emerald-900 font-semibold text-xs flex items-center gap-1"
                                                        title="Restore record"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                        Restore
                                                    </button>
                                                    <button
                                                        onClick={() => handlePermanentDelete(item)}
                                                        className="text-rose-600 hover:text-rose-900 font-semibold text-xs flex items-center gap-1"
                                                        title="Delete permanently"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Purge
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
                    {items.links && items.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4 dark:border-slate-850 dark:bg-slate-900">
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Showing <span className="font-medium">{items.data.length}</span> archives out of <span className="font-medium">{items.total}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
                                        {items.links.map((link, idx) => (
                                            <button
                                                key={idx}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                                className={`relative inline-flex items-center px-4 py-2 text-xs font-semibold ${
                                                    link.active
                                                        ? 'z-10 bg-indigo-600 text-white'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-slate-800'
                                                } ${idx === 0 ? 'rounded-l-md' : ''} ${
                                                    idx === items.links.length - 1 ? 'rounded-r-md' : ''
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

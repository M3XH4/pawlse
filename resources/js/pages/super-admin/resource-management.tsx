import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    FolderDown, Plus, Search, Filter, Edit2, Trash2, X, Check, 
    RotateCcw, Download, FileText, ExternalLink, Image as ImageIcon,
    Upload, Sparkles, BookOpen, AlertCircle
} from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { usePermissions } from '@/hooks/use-permissions';

interface ResourceRecord {
    id: number;
    title: string;
    slug: string;
    category: string;
    badge?: string | null;
    description?: string | null;
    content?: string | null;
    file_path?: string | null;
    file_name?: string | null;
    file_size?: string | null;
    file_type?: string | null;
    external_url?: string | null;
    image_url?: string | null;
    download_count: number;
    is_featured: boolean;
    is_active: boolean;
    display_order: number;
    deleted_at?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ResourceManagementProps {
    resources: {
        data: ResourceRecord[];
        links: PaginationLink[];
        total: number;
        current_page: number;
    };
    stats: {
        total: number;
        downloads: number;
        boarding: number;
        guides: number;
        archived: number;
    };
    filters: {
        search?: string;
        category?: string;
        status?: string;
    };
}

export default function ResourceManagement({ resources, stats, filters }: ResourceManagementProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<ResourceRecord | null>(null);

    // Permission enforcement
    const { can } = usePermissions();
    const canCreateResource = can('resources.create');
    const canEditResource = can('resources.edit');
    const canDeleteResource = can('resources.delete');

    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        title: '',
        category: 'boarding',
        badge: '',
        description: '',
        content: '',
        file: null as File | null,
        file_name: '',
        file_type: 'pdf',
        external_url: '',
        image_url: '',
        is_featured: false,
        is_active: true,
        display_order: 0,
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (res: ResourceRecord) => {
        clearErrors();
        setEditingResource(res);
        setData({
            title: res.title,
            category: res.category,
            badge: res.badge || '',
            description: res.description || '',
            content: res.content || '',
            file: null,
            file_name: res.file_name || '',
            file_type: res.file_type || 'pdf',
            external_url: res.external_url || '',
            image_url: res.image_url || '',
            is_featured: res.is_featured,
            is_active: res.is_active,
            display_order: res.display_order,
        });
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setEditingResource(null);
        reset();
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/account/super-admin/resources', {
            search: search || undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, { preserveState: true });
    };

    const handleCategoryChange = (cat: string) => {
        setCategoryFilter(cat);
        router.get('/account/super-admin/resources', {
            search: search || undefined,
            category: cat !== 'all' ? cat : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, { preserveState: true });
    };

    const handleStatusChange = (st: string) => {
        setStatusFilter(st);
        router.get('/account/super-admin/resources', {
            search: search || undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            status: st !== 'all' ? st : undefined,
        }, { preserveState: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingResource) {
            router.put(`/account/super-admin/resources/${editingResource.id}`, data as any, {
                onSuccess: () => {
                    toast.success('Resource file updated successfully.');
                    closeModals();
                },
                onError: () => toast.error('Please check validation errors.')
            });
        } else {
            router.post('/account/super-admin/resources', data as any, {
                onSuccess: () => {
                    toast.success('Resource file added successfully.');
                    closeModals();
                },
                onError: () => toast.error('Please check validation errors.')
            });
        }
    };

    const handleToggleStatus = (res: ResourceRecord) => {
        router.patch(`/account/super-admin/resources/${res.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Status updated for "${res.title}".`),
        });
    };

    const handleDelete = (res: ResourceRecord) => {
        if (confirm(`Are you sure you want to archive resource "${res.title}"?`)) {
            router.delete(`/account/super-admin/resources/${res.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success(`Resource "${res.title}" archived.`),
            });
        }
    };

    const handleRestore = (res: ResourceRecord) => {
        router.post(`/account/super-admin/resources/${res.id}/restore`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Resource "${res.title}" restored.`),
        });
    };

    return (
        <DashboardSectionPage
            title="File & Resource Management"
            description="Manage pet care guides, boarding provider lists, medical protocol documents, and community download files"
        >
            <Head title="File & Resource Management | Super Admin" />

            <div className="space-y-6">
                {/* 1. Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black">
                            <FolderDown size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.total}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Total Files</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                            <Download size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.downloads}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Downloads</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.boarding}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Boarding Lists</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-black">
                            <FileText size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.guides}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Care Guides</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gray-500/10 text-gray-600 flex items-center justify-center font-black">
                            <RotateCcw size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.archived}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Archived</p>
                        </div>
                    </DashboardCard>
                </div>

                {/* 2. Control Bar */}
                <DashboardCard className="p-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:max-w-md flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search resources by title, badge, file name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-paw-orange"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-slate-800 text-white dark:bg-slate-700 text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors"
                            >
                                Search
                            </button>
                        </form>

                        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                            <select
                                value={categoryFilter}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="px-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold"
                            >
                                <option value="all">All Categories</option>
                                <option value="boarding">Boarding Lists</option>
                                <option value="insurance">Pet Insurance</option>
                                <option value="training">Pet Training</option>
                                <option value="memorial">Pet Memorial</option>
                                <option value="portrait">Pet Portraits</option>
                                <option value="emergency_protocol">Emergency Protocols</option>
                                <option value="care_guide">Care Guides</option>
                                <option value="audit_report">Audit Reports</option>
                                <option value="financial_audit">Financial Documents</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="px-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                                <option value="archived">Archived</option>
                            </select>

                            {canCreateResource && (
                                <button
                                    onClick={openCreateModal}
                                    className="px-4 py-2 rounded-xl bg-paw-orange text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-paw-orange/20 hover:bg-orange-600 transition-colors cursor-pointer"
                                >
                                    <Plus size={16} />
                                    <span>Add Resource</span>
                                </button>
                            )}
                        </div>
                    </div>
                </DashboardCard>

                {/* 3. Resources Table */}
                <DashboardCard className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50/80 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800 text-gray-500 uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="py-3 px-4">Resource Title</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Badge / Classification</th>
                                    <th className="py-3 px-4">File Info & Downloads</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                                {resources.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400">
                                            No resource files found.
                                        </td>
                                    </tr>
                                ) : (
                                    resources.data.map((res) => (
                                        <tr 
                                            key={res.id} 
                                            className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                                                res.deleted_at ? 'opacity-60 bg-rose-50/20' : ''
                                            }`}
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-gray-500">
                                                        {res.image_url ? (
                                                            <img src={res.image_url} alt={res.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <FileText size={18} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{res.title}</h4>
                                                        <p className="text-[11px] text-gray-400 line-clamp-1 max-w-xs">{res.description}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap min-w-[130px]">
                                                <span className="inline-flex items-center justify-center shrink-0 whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                                                    {res.category.replace('_', ' ')}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap min-w-[180px]">
                                                <span className="inline-flex items-center justify-center shrink-0 whitespace-nowrap px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-200/50 dark:border-amber-900/30">
                                                    {res.badge || 'Community Resource'}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4 space-y-0.5">
                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                    <span>{res.file_name || `${res.slug}.pdf`}</span>
                                                    <span className="text-[10px] text-gray-400 font-normal">({res.file_size || 'PDF'})</span>
                                                </p>
                                                <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                                                    <Download size={10} />
                                                    <span>{res.download_count} total downloads</span>
                                                </p>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                {res.deleted_at ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                                                        Archived
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleToggleStatus(res)}
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer uppercase transition-colors ${
                                                            res.is_active
                                                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                                        }`}
                                                    >
                                                        {res.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <a
                                                        href={`/resources/${res.id}/download`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                                                        title="Download / Test View File"
                                                    >
                                                        <Download size={15} />
                                                    </a>
                                                    {res.deleted_at ? (
                                                        canDeleteResource && (
                                                            <button
                                                                onClick={() => handleRestore(res)}
                                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                                                                title="Restore Resource"
                                                            >
                                                                <RotateCcw size={15} />
                                                            </button>
                                                        )
                                                    ) : (
                                                        <>
                                                            {canEditResource && (
                                                                <button
                                                                    onClick={() => openEditModal(res)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                                                                    title="Edit Resource"
                                                                >
                                                                    <Edit2 size={15} />
                                                                </button>
                                                            )}
                                                            {canDeleteResource && (
                                                                <button
                                                                    onClick={() => handleDelete(res)}
                                                                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                                                    title="Archive Resource"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            )}
                                                            {!canEditResource && !canDeleteResource && (
                                                                <span className="text-gray-400 italic text-[11px]">Read-only</span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {resources.links && resources.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-center gap-1">
                            {resources.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url || link.active}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                        link.active
                                            ? 'bg-paw-orange text-white'
                                            : link.url
                                            ? 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'
                                            : 'opacity-40 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </DashboardCard>
            </div>

            {/* Modal for Create / Edit Resource */}
            <AnimatePresence>
                {(isCreateModalOpen || editingResource) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={closeModals}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[32px] max-w-xl w-full shadow-2xl relative border border-gray-100 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden"
                        >
                            {/* Sticky Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-slate-800 shrink-0 relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs pr-14">
                                <button
                                    onClick={closeModals}
                                    className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <X size={20} />
                                </button>

                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/30">
                                    <FolderDown size={12} className="inline mr-1" />
                                    {data.category.replace('_', ' ')}
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-paw-navy dark:text-white">
                                    {editingResource ? 'Edit Resource File' : 'Add Resource File'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Upload or register downloadable pet care guides, contacts, and referral handbooks
                                </p>
                            </div>

                            {/* Scrollable Form Body with styled thin scrollbar */}
                            <form id="resource-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
                                <div>
                                    <label className="block text-gray-500 mb-1">Resource Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        placeholder="e.g. Pet Boarding - Cats"
                                    />
                                    {errors.title && <p className="text-red-500 mt-1">{errors.title}</p>}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">Category *</label>
                                        <select
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-bold"
                                        >
                                            <option value="boarding">Boarding Lists</option>
                                            <option value="insurance">Pet Insurance</option>
                                            <option value="training">Pet Training</option>
                                            <option value="memorial">Pet Memorial</option>
                                            <option value="portrait">Pet Portraits</option>
                                            <option value="emergency_protocol">Emergency Protocol</option>
                                            <option value="care_guide">General Care Guide</option>
                                            <option value="audit_report">Audit Report</option>
                                            <option value="financial_audit">Financial Document</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Badge Text</label>
                                        <input
                                            type="text"
                                            value={data.badge}
                                            onChange={(e) => setData('badge', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="COMMUNITY DIRECTORY"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-500 mb-1">Summary Description</label>
                                    <textarea
                                        rows={2}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        placeholder="Displayed on public directory cards"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-500 mb-1">Detailed Content / Instructions</label>
                                    <textarea
                                        rows={3}
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        placeholder="Detailed guide content or service instructions"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">File Name</label>
                                        <input
                                            type="text"
                                            value={data.file_name}
                                            onChange={(e) => setData('file_name', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="Cat-Boarding-Directory.pdf"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Image / Cover URL</label>
                                        <input
                                            type="text"
                                            value={data.image_url}
                                            onChange={(e) => setData('image_url', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="/images/resources/cat-boarding.jpg"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-500 mb-1">External Link (Optional)</label>
                                    <input
                                        type="url"
                                        value={data.external_url}
                                        onChange={(e) => setData('external_url', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 grid grid-cols-2 gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="rounded text-amber-500"
                                        />
                                        <span className="text-[11px] font-bold text-amber-600">Featured Resource</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded text-emerald-600"
                                        />
                                        <span className="text-[11px] font-bold text-emerald-600">Active Listing</span>
                                    </label>
                                </div>
                            </form>

                            {/* Sticky Footer */}
                            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/95 dark:bg-slate-850/95 backdrop-blur-xs shrink-0 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModals}
                                    className="px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-200/60 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="resource-modal-form"
                                    disabled={processing}
                                    className="px-6 py-2.5 rounded-xl bg-paw-orange hover:bg-orange-600 text-white font-black uppercase tracking-wider shadow-md shadow-paw-orange/20 cursor-pointer disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {processing && <Spinner size="xs" />}
                                    <span>{editingResource ? 'Update Resource' : 'Create Resource'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardSectionPage>
    );
}

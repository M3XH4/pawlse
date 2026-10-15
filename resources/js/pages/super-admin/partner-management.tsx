import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Handshake, Plus, Search, Filter, Edit2, Trash2, X, Check, 
    RotateCcw, Stethoscope, Package, AlertCircle, Phone, MapPin, 
    Clock, ExternalLink, ShieldAlert, Sparkles, Building2, Eye, EyeOff
} from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';
import { toast } from 'sonner';

interface PartnerRecord {
    id: number;
    name: string;
    slug: string;
    category: 'veterinary' | 'food_supply' | 'collaborator' | 'sponsor';
    badge_title?: string | null;
    badges?: string[] | null;
    short_description?: string | null;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
    website_url?: string | null;
    social_url?: string | null;
    operating_hours?: string | null;
    services?: string[] | null;
    image_url?: string | null;
    logo_url?: string | null;
    is_emergency: boolean;
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

interface PartnerManagementProps {
    partners: {
        data: PartnerRecord[];
        links: PaginationLink[];
        total: number;
        current_page: number;
    };
    stats: {
        total: number;
        veterinary: number;
        food_supply: number;
        emergency: number;
        archived: number;
    };
    filters: {
        search?: string;
        category?: string;
        status?: string;
    };
}

export default function PartnerManagement({ partners, stats, filters }: PartnerManagementProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<PartnerRecord | null>(null);

    // Form for Create / Edit
    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        name: '',
        category: 'veterinary' as 'veterinary' | 'food_supply' | 'collaborator' | 'sponsor',
        badge_title: '',
        badges_string: '',
        short_description: '',
        description: '',
        address: '',
        city: 'Iligan City',
        phone: '',
        email: '',
        website_url: '',
        operating_hours: '',
        services_string: '',
        image_url: '',
        logo_url: '',
        is_emergency: false,
        is_featured: false,
        is_active: true,
        display_order: 0,
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (partner: PartnerRecord) => {
        clearErrors();
        setEditingPartner(partner);
        setData({
            name: partner.name,
            category: partner.category,
            badge_title: partner.badge_title || '',
            badges_string: partner.badges ? partner.badges.join(', ') : '',
            short_description: partner.short_description || '',
            description: partner.description || '',
            address: partner.address || '',
            city: partner.city || 'Iligan City',
            phone: partner.phone || '',
            email: partner.email || '',
            website_url: partner.website_url || '',
            operating_hours: partner.operating_hours || '',
            services_string: partner.services ? partner.services.join(', ') : '',
            image_url: partner.image_url || '',
            logo_url: partner.logo_url || '',
            is_emergency: partner.is_emergency,
            is_featured: partner.is_featured,
            is_active: partner.is_active,
            display_order: partner.display_order,
        });
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setEditingPartner(null);
        reset();
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/account/super-admin/partners', {
            search: search || undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, { preserveState: true });
    };

    const handleCategoryChange = (cat: string) => {
        setCategoryFilter(cat);
        router.get('/account/super-admin/partners', {
            search: search || undefined,
            category: cat !== 'all' ? cat : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, { preserveState: true });
    };

    const handleStatusChange = (st: string) => {
        setStatusFilter(st);
        router.get('/account/super-admin/partners', {
            search: search || undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            status: st !== 'all' ? st : undefined,
        }, { preserveState: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const badges = data.badges_string.split(',').map(s => s.trim()).filter(Boolean);
        const services = data.services_string.split(',').map(s => s.trim()).filter(Boolean);

        const payload: any = {
            ...data,
            badges,
            services,
        };

        if (editingPartner) {
            router.put(`/account/super-admin/partners/${editingPartner.id}`, payload, {
                onSuccess: () => {
                    toast.success('Partner updated successfully.');
                    closeModals();
                },
                onError: () => toast.error('Please check validation errors.')
            });
        } else {
            router.post('/account/super-admin/partners', payload, {
                onSuccess: () => {
                    toast.success('Partner added successfully.');
                    closeModals();
                },
                onError: () => toast.error('Please check validation errors.')
            });
        }
    };

    const handleToggleStatus = (partner: PartnerRecord) => {
        router.patch(`/account/super-admin/partners/${partner.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Status updated for ${partner.name}.`),
        });
    };

    const handleDelete = (partner: PartnerRecord) => {
        if (confirm(`Are you sure you want to archive "${partner.name}"?`)) {
            router.delete(`/account/super-admin/partners/${partner.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success(`Partner "${partner.name}" archived.`),
            });
        }
    };

    const handleRestore = (partner: PartnerRecord) => {
        router.post(`/account/super-admin/partners/${partner.id}/restore`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Partner "${partner.name}" restored.`),
        });
    };

    return (
        <DashboardSectionPage
            title="Partner Management"
            description="Manage veterinary clinics, food and supply donors, corporate partners, and emergency animal care network"
        >
            <Head title="Partner Management | Super Admin" />

            <div className="space-y-6">
                {/* 1. Metric Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black">
                            <Handshake size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.total}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Total Partners</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                            <Stethoscope size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.veterinary}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Vet Clinics</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                            <Package size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.food_supply}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Food / Supplies</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-black">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.emergency}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Emergency Opts</p>
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

                {/* 2. Control Toolbar */}
                <DashboardCard className="p-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:max-w-md flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search partners by name, city, address..."
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
                            {/* Category Filter */}
                            <select
                                value={categoryFilter}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="px-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold"
                            >
                                <option value="all">All Categories</option>
                                <option value="veterinary">Veterinary Partners</option>
                                <option value="food_supply">Food & Supply Partners</option>
                                <option value="audit">Audit & Financial</option>
                                <option value="accounting">Accounting Partners</option>
                                <option value="collaborator">Collaborators</option>
                                <option value="sponsor">Sponsors</option>
                            </select>

                            {/* Status Filter */}
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

                            {/* Add Button */}
                            <button
                                onClick={openCreateModal}
                                className="px-4 py-2 rounded-xl bg-paw-orange text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-paw-orange/20 hover:bg-orange-600 transition-colors cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Add Partner</span>
                            </button>
                        </div>
                    </div>
                </DashboardCard>

                {/* 3. Partners Table */}
                <DashboardCard className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50/80 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800 text-gray-500 uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="py-3 px-4">Partner</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Contact Info</th>
                                    <th className="py-3 px-4">Badges & Flags</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                                {partners.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400">
                                            No partners found matching the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    partners.data.map((partner) => (
                                        <tr 
                                            key={partner.id} 
                                            className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                                                partner.deleted_at ? 'opacity-60 bg-rose-50/20' : ''
                                            }`}
                                        >
                                            {/* Partner Name & Image */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center font-black text-xs text-gray-600 dark:text-gray-300">
                                                        {partner.image_url ? (
                                                            <img src={partner.image_url} alt={partner.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{partner.logo_url || partner.name.substring(0, 2).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{partner.name}</h4>
                                                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                                            <MapPin size={11} className="text-[#FFAE33]" />
                                                            <span>{partner.city || 'Iligan City'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    partner.category === 'veterinary'
                                                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                                        : partner.category === 'food_supply'
                                                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                                }`}>
                                                    {partner.category.replace('_', ' ')}
                                                </span>
                                            </td>

                                            {/* Contact Info */}
                                            <td className="py-3 px-4 space-y-1">
                                                {partner.phone && (
                                                    <p className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300">
                                                        <Phone size={12} className="text-emerald-500" />
                                                        <span>{partner.phone}</span>
                                                    </p>
                                                )}
                                                {partner.operating_hours && (
                                                    <p className="flex items-center gap-1 text-[10px] text-gray-400">
                                                        <Clock size={11} className="text-amber-500" />
                                                        <span className="truncate max-w-[180px]">{partner.operating_hours}</span>
                                                    </p>
                                                )}
                                            </td>

                                            {/* Badges & Flags */}
                                            <td className="py-3 px-4">
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {partner.is_emergency && (
                                                        <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-300 text-[9px] font-black uppercase">
                                                            Emergency
                                                        </span>
                                                    )}
                                                    {partner.is_featured && (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[9px] font-black uppercase">
                                                            Featured
                                                        </span>
                                                    )}
                                                    {partner.badge_title && (
                                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-[9px] font-semibold">
                                                            {partner.badge_title}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3 px-4">
                                                {partner.deleted_at ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                                                        Archived
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleToggleStatus(partner)}
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer uppercase transition-colors ${
                                                            partner.is_active
                                                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                                        }`}
                                                        title="Click to toggle status"
                                                    >
                                                        {partner.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {partner.deleted_at ? (
                                                        <button
                                                            onClick={() => handleRestore(partner)}
                                                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                                                            title="Restore Partner"
                                                        >
                                                            <RotateCcw size={15} />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => openEditModal(partner)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                                                                title="Edit Partner"
                                                            >
                                                                <Edit2 size={15} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(partner)}
                                                                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                                                title="Archive Partner"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
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
                    {partners.links && partners.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-center gap-1">
                            {partners.links.map((link, idx) => (
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

            {/* Modal for Create / Edit Partner */}
            <AnimatePresence>
                {(isCreateModalOpen || editingPartner) && (
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
                            className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto"
                        >
                            <button
                                onClick={closeModals}
                                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-2xl font-black text-paw-navy dark:text-white mb-1">
                                {editingPartner ? 'Edit Partner' : 'Add New Partner'}
                            </h3>
                            <p className="text-xs text-gray-500 mb-6">
                                Provide partner details, contact options, emergency status, and categories
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">Partner Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="e.g. Dr. E Veterinary Clinic"
                                        />
                                        {errors.name && <p className="text-red-500 mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Category *</label>
                                        <select
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value as any)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-bold"
                                        >
                                            <option value="veterinary">Veterinary Partner</option>
                                            <option value="food_supply">Food & Supply Partner</option>
                                            <option value="audit">Audit & Financial Partner</option>
                                            <option value="accounting">Accounting Partner</option>
                                            <option value="collaborator">Collaborator</option>
                                            <option value="sponsor">Sponsor</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">Badge Title (Summary)</label>
                                        <input
                                            type="text"
                                            value={data.badge_title}
                                            onChange={(e) => setData('badge_title', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="e.g. Frequently Contacted by ISF"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Badges (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={data.badges_string}
                                            onChange={(e) => setData('badges_string', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="Emergency Response, Trusted Partner"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-500 mb-1">Short Description</label>
                                    <input
                                        type="text"
                                        value={data.short_description}
                                        onChange={(e) => setData('short_description', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        placeholder="One-line summary for cards"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-500 mb-1">Full Description</label>
                                    <textarea
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        placeholder="Detailed background or services"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">Address</label>
                                        <input
                                            type="text"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="e.g. Dao Hinaplanon Highway"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">City / Zone</label>
                                        <input
                                            type="text"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="Tambo, Iligan City"
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="+63 956 381 9018"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Operating Hours</label>
                                        <input
                                            type="text"
                                            value={data.operating_hours}
                                            onChange={(e) => setData('operating_hours', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="Mon - Sat: 8:00 AM – 7:00 PM"
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">Image URL / Path</label>
                                        <input
                                            type="text"
                                            value={data.image_url}
                                            onChange={(e) => setData('image_url', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="/images/partners/dr-e.jpg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Services (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={data.services_string}
                                            onChange={(e) => setData('services_string', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="Emergency, Vaccinations, Surgery"
                                        />
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 grid grid-cols-3 gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_emergency}
                                            onChange={(e) => setData('is_emergency', e.target.checked)}
                                            className="rounded text-red-600"
                                        />
                                        <span className="text-[11px] font-bold text-red-600">Emergency Contact</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="rounded text-amber-500"
                                        />
                                        <span className="text-[11px] font-bold text-amber-600">Featured (Top Banner)</span>
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

                                <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={closeModals}
                                        className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 rounded-xl bg-paw-orange hover:bg-orange-600 text-white font-black uppercase tracking-wider shadow-md shadow-paw-orange/20"
                                    >
                                        {editingPartner ? 'Update Partner' : 'Create Partner'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardSectionPage>
    );
}

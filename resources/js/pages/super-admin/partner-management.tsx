import React, { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Handshake, Plus, Search, Edit2, Trash2, X, Check, 
    RotateCcw, Stethoscope, Package, AlertCircle, Phone, MapPin, 
    Clock, ExternalLink, ShieldAlert, Sparkles, Building2,
    UploadCloud, Image as ImageIcon, ShieldCheck, Globe, Mail,
    FileText, CheckCircle2, ChevronRight, Info
} from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { usePermissions } from '@/hooks/use-permissions';

export type PartnerCategory = 'veterinary' | 'food_supply' | 'audit' | 'accounting' | 'collaborator' | 'sponsor';

interface PartnerRecord {
    id: number;
    name: string;
    slug: string;
    category: PartnerCategory;
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
        audit?: number;
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

    // Permission enforcement
    const { can } = usePermissions();
    const canCreatePartner = can('partners.create');
    const canEditPartner = can('partners.edit');
    const canDeletePartner = can('partners.delete');

    // Image Upload & Preview State
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showManualUrl, setShowManualUrl] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form for Create / Edit
    const { data, setData, processing, reset, errors, clearErrors } = useForm({
        name: '',
        category: 'veterinary' as PartnerCategory,
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
        image: null as File | null,
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
        setData('image', null);
        setImagePreview(null);
        setShowManualUrl(false);
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
            image: null,
            image_url: partner.image_url || '',
            logo_url: partner.logo_url || '',
            is_emergency: partner.is_emergency,
            is_featured: partner.is_featured,
            is_active: partner.is_active,
            display_order: partner.display_order,
        });
        setImagePreview(partner.image_url || null);
        setShowManualUrl(!partner.image_url?.startsWith('/storage/partners/'));
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setEditingPartner(null);
        setImagePreview(null);
        setShowManualUrl(false);
        reset();
    };

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (PNG, JPG, WEBP).');
            return;
        }
        if (file.size > 4 * 1024 * 1024) {
            toast.error('Image must be under 4MB.');
            return;
        }
        setData('image', file);
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleRemoveImage = () => {
        setData((prev) => ({ ...prev, image: null, image_url: '' }));
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCategorySelect = (cat: PartnerCategory) => {
        setData((prev) => ({
            ...prev,
            category: cat,
            // Automatically disable emergency contact for non-veterinary categories
            is_emergency: cat === 'veterinary' ? prev.is_emergency : false,
        }));
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
            is_emergency: data.category === 'veterinary' ? data.is_emergency : false,
        };

        if (editingPartner) {
            router.post(`/account/super-admin/partners/${editingPartner.id}`, {
                ...payload,
                _method: 'PUT',
            }, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Partner updated successfully.');
                    closeModals();
                },
                onError: () => toast.error('Please check validation errors.')
            });
        } else {
            router.post('/account/super-admin/partners', payload, {
                forceFormData: true,
                preserveScroll: true,
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

    // Category styling & labeling helpers
    const getCategoryBadgeClass = (category: PartnerCategory) => {
        switch (category) {
            case 'veterinary':
                return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40';
            case 'food_supply':
                return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40';
            case 'audit':
            case 'accounting':
                return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40';
            case 'collaborator':
                return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40';
            case 'sponsor':
                return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40';
            default:
                return 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300';
        }
    };

    const getCategoryIcon = (category: PartnerCategory) => {
        switch (category) {
            case 'veterinary':
                return <Stethoscope size={11} className="inline mr-1" />;
            case 'food_supply':
                return <Package size={11} className="inline mr-1" />;
            case 'audit':
            case 'accounting':
                return <ShieldCheck size={11} className="inline mr-1" />;
            case 'collaborator':
                return <Handshake size={11} className="inline mr-1" />;
            case 'sponsor':
                return <Sparkles size={11} className="inline mr-1" />;
            default:
                return null;
        }
    };

    // Category context dynamic text
    const isVet = data.category === 'veterinary';
    const isFood = data.category === 'food_supply';
    const isAudit = data.category === 'audit' || data.category === 'accounting';

    const getServicesLabel = () => {
        if (isVet) return 'Veterinary Services & Specialties (comma-separated)';
        if (isFood) return 'Provisions & Supplies Provided (comma-separated)';
        if (isAudit) return 'Audit Scope & Professional Services (comma-separated)';
        return 'Services or Collaboration Focus (comma-separated)';
    };

    const getServicesPlaceholder = () => {
        if (isVet) return 'Emergency Response, Minor/Major Surgery, Vaccinations, Confinement';
        if (isFood) return 'Kibble Bags, Rice Sacks, Canned Food, Vitamin Supplements, Feeding Bowls';
        if (isAudit) return 'Annual Financial Audit, Donation Fund Verification, NGO Tax Compliance, Disbursement Review';
        return 'Spay/Neuter Outreach, Community Feeding Support, Rescue Transport';
    };

    const getHoursLabel = () => {
        if (isVet) return 'Clinic Consultation Hours';
        if (isFood) return 'Store Hours or Supply Schedule';
        if (isAudit) return 'Office Business Hours';
        return 'Operating Hours / Office Schedule';
    };

    const getHoursPlaceholder = () => {
        if (isVet) return 'Mon - Sat: 8:00 AM – 7:00 PM | Sun: 9:00 AM – 3:00 PM';
        if (isFood) return 'Daily: 10:00 AM – 8:00 PM or Weekly Schedule';
        if (isAudit) return 'Mon - Fri: 8:30 AM – 5:30 PM';
        return 'Mon - Fri: 9:00 AM – 5:00 PM';
    };

    const getAddressLabel = () => {
        if (isVet) return 'Clinic Address';
        if (isFood) return 'Store / Supply Depot Address';
        if (isAudit) return 'Office Address / Suite';
        return 'Office / Physical Address';
    };

    const getBadgeTitlePlaceholder = () => {
        if (isVet) return 'e.g. FREQUENTLY CONTACTED BY ISF';
        if (isFood) return 'e.g. REGULAR FOOD SUPPORT';
        if (isAudit) return 'e.g. INDEPENDENT AUDITING PARTNER';
        return 'e.g. OFFICIAL SUPPORTER';
    };

    return (
        <DashboardSectionPage
            title="Partner Management"
            description="Manage veterinary clinics, food and supply donors, financial audit partners, and community welfare network"
        >
            <Head title="Partner Management | Super Admin" />

            <div className="space-y-6">
                {/* 1. Metric Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black shrink-0">
                            <Handshake size={20} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.total}</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase truncate">Total Partners</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black shrink-0">
                            <Stethoscope size={20} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.veterinary}</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase truncate">Vet Clinics</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black shrink-0">
                            <Package size={20} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.food_supply}</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase truncate">Food / Supplies</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.audit ?? 0}</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase truncate">Audit & Legal</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-black shrink-0">
                            <ShieldAlert size={20} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.emergency}</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase truncate">Emergency Opts</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gray-500/10 text-gray-600 flex items-center justify-center font-black shrink-0">
                            <RotateCcw size={20} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.archived}</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase truncate">Archived</p>
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
                            {canCreatePartner && (
                                <button
                                    onClick={openCreateModal}
                                    className="px-4 py-2 rounded-xl bg-paw-orange text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-paw-orange/20 hover:bg-orange-600 transition-colors cursor-pointer"
                                >
                                    <Plus size={16} />
                                    <span>Add Partner</span>
                                </button>
                            )}
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
                                                    <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center font-black text-xs text-gray-600 dark:text-gray-300 border border-gray-200/60 dark:border-slate-700/60">
                                                        {partner.image_url ? (
                                                            <ImageWithFallback 
                                                                src={partner.image_url} 
                                                                alt={partner.name} 
                                                                className="w-full h-full object-cover" 
                                                            />
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
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getCategoryBadgeClass(partner.category)}`}>
                                                    {getCategoryIcon(partner.category)}
                                                    {partner.category.replace('_', ' ')}
                                                </span>
                                            </td>

                                            {/* Contact Info */}
                                            <td className="py-3 px-4 space-y-1">
                                                {partner.phone && (
                                                    <p className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300">
                                                        <Phone size={12} className="text-emerald-500 shrink-0" />
                                                        <span>{partner.phone}</span>
                                                    </p>
                                                )}
                                                {partner.email && (
                                                    <p className="flex items-center gap-1 text-[10px] text-gray-500 truncate max-w-[180px]">
                                                        <Mail size={11} className="text-blue-500 shrink-0" />
                                                        <span className="truncate">{partner.email}</span>
                                                    </p>
                                                )}
                                                {partner.operating_hours && (
                                                    <p className="flex items-center gap-1 text-[10px] text-gray-400">
                                                        <Clock size={11} className="text-amber-500 shrink-0" />
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
                                                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
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
                                                        canDeletePartner && (
                                                            <button
                                                                onClick={() => handleRestore(partner)}
                                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                                                                title="Restore Partner"
                                                            >
                                                                <RotateCcw size={15} />
                                                            </button>
                                                        )
                                                    ) : (
                                                        <>
                                                            {canEditPartner && (
                                                                <button
                                                                    onClick={() => openEditModal(partner)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                                                                    title="Edit Partner"
                                                                >
                                                                    <Edit2 size={15} />
                                                                </button>
                                                            )}
                                                            {canDeletePartner && (
                                                                <button
                                                                    onClick={() => handleDelete(partner)}
                                                                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                                                    title="Archive Partner"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            )}
                                                            {!canEditPartner && !canDeletePartner && (
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm"
                        onClick={closeModals}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[32px] max-w-2xl w-full shadow-2xl relative border border-gray-100 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden"
                        >
                            {/* Sticky Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-slate-800 shrink-0 relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs pr-14">
                                <button
                                    onClick={closeModals}
                                    className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <X size={20} />
                                </button>

                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 ${getCategoryBadgeClass(data.category)}`}>
                                    {getCategoryIcon(data.category)}
                                    {data.category.replace('_', ' ')}
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-paw-navy dark:text-white">
                                    {editingPartner ? 'Edit Partner' : 'Add New Partner'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Configure partner details, branding, contacts, and verification status
                                </p>
                            </div>

                            {/* Scrollable Form Body with styled thin scrollbar */}
                            <form id="partner-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
                                {/* Basic Identification */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">Partner / Organization Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full px-3.5 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-paw-orange outline-none"
                                            placeholder={isAudit ? 'e.g. Valdez Accounting & Audit Partners, CPAs' : isFood ? 'e.g. House of Rice' : 'e.g. Dr. E Veterinary Clinic'}
                                        />
                                        {errors.name && <p className="text-red-500 mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Partner Category *</label>
                                        <select
                                            value={data.category}
                                            onChange={(e) => handleCategorySelect(e.target.value as PartnerCategory)}
                                            className="w-full px-3.5 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-bold focus:ring-2 focus:ring-paw-orange outline-none"
                                        >
                                            <option value="veterinary">🩺 Veterinary Partner</option>
                                            <option value="food_supply">📦 Food & Supply Partner</option>
                                            <option value="audit">🛡️ Audit & Financial Partner</option>
                                            <option value="accounting">📊 Accounting Partner</option>
                                            <option value="collaborator">🤝 Collaborator / LGU Partner</option>
                                            <option value="sponsor">✨ Benefactor / Sponsor</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Image Upload with Live Preview */}
                                <div>
                                    <label className="block text-gray-500 mb-1.5 flex items-center justify-between">
                                        <span>Partner Image / Logo (with Preview)</span>
                                        <button
                                            type="button"
                                            onClick={() => setShowManualUrl(!showManualUrl)}
                                            className="text-[11px] text-paw-orange hover:underline font-bold"
                                        >
                                            {showManualUrl ? 'Switch to File Upload' : 'Or Enter URL Manually'}
                                        </button>
                                    </label>

                                    {!showManualUrl ? (
                                        <div className="space-y-3">
                                            {/* Preview Box if image exists */}
                                            {imagePreview ? (
                                                <div className="relative rounded-2xl overflow-hidden border-2 border-paw-orange/40 bg-slate-50 dark:bg-slate-800/80 p-3 flex items-center gap-4">
                                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border border-gray-200 dark:border-slate-600">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Partner Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs mb-1">
                                                            <CheckCircle2 size={14} />
                                                            <span>Image Selected</span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 truncate">
                                                            {data.image ? data.image.name : (data.image_url || 'Current Partner Image')}
                                                        </p>
                                                        {data.image && (
                                                            <p className="text-[10px] text-gray-400">
                                                                {(data.image.size / 1024).toFixed(1)} KB
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                                                        >
                                                            Change
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveImage}
                                                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                                            title="Remove Image"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={handleDrop}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                                                        isDragging 
                                                            ? 'border-paw-orange bg-paw-orange/5 scale-[1.01]' 
                                                            : 'border-gray-300 dark:border-slate-700 hover:border-paw-orange/60 bg-gray-50/50 dark:bg-slate-800/40'
                                                    }`}
                                                >
                                                    <UploadCloud size={28} className="mx-auto text-paw-orange mb-2" />
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                        Click to upload or drag & drop partner photo
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        PNG, JPG, or WEBP (Max 4MB)
                                                    </p>
                                                </div>
                                            )}

                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                onChange={handleFileInputChange}
                                                className="hidden"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={data.image_url}
                                                onChange={(e) => {
                                                    setData('image_url', e.target.value);
                                                    setImagePreview(e.target.value || null);
                                                }}
                                                className="w-full px-3.5 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-paw-orange outline-none"
                                                placeholder="/images/partners/audit-partner.jpg or https://..."
                                            />
                                            {imagePreview && (
                                                <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                                    <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                                                    <span className="text-[11px] text-gray-500">Live URL Preview</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {errors.image && <p className="text-red-500 mt-1">{errors.image}</p>}
                                    {errors.image_url && <p className="text-red-500 mt-1">{errors.image_url}</p>}
                                </div>

                                {/* Badges & Summary */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">Badge Title (Card Summary Banner)</label>
                                        <input
                                            type="text"
                                            value={data.badge_title}
                                            onChange={(e) => setData('badge_title', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder={getBadgeTitlePlaceholder()}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Badges (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={data.badges_string}
                                            onChange={(e) => setData('badges_string', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder={isAudit ? 'Independent Financial Auditor, PRC-BOA Accredited' : 'Emergency Response, Trusted Partner'}
                                        />
                                    </div>
                                </div>

                                {/* Descriptions */}
                                <div>
                                    <label className="block text-gray-500 mb-1">Short Description (Summary for Cards)</label>
                                    <input
                                        type="text"
                                        value={data.short_description}
                                        onChange={(e) => setData('short_description', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        placeholder="One-line summary for partner cards and showcase headers"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-500 mb-1">Full Description</label>
                                    <textarea
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        placeholder="Detailed background, mission, facilities, or support scope"
                                    />
                                </div>

                                {/* Address & Location */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">{getAddressLabel()}</label>
                                        <input
                                            type="text"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder={isAudit ? 'Suite 302, Diocesan Pastoral Center, Lluch St.' : 'e.g. Dao Hinaplanon Highway'}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">City / Municipality</label>
                                        <input
                                            type="text"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="Tambo, Iligan City"
                                        />
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="grid sm:grid-cols-3 gap-3">
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
                                        <label className="block text-gray-500 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="partner@contact.ph"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">{getHoursLabel()}</label>
                                        <input
                                            type="text"
                                            value={data.operating_hours}
                                            onChange={(e) => setData('operating_hours', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder={getHoursPlaceholder()}
                                        />
                                    </div>
                                </div>

                                {/* Category-Fit Services / Scope & Website */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">{getServicesLabel()}</label>
                                        <input
                                            type="text"
                                            value={data.services_string}
                                            onChange={(e) => setData('services_string', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder={getServicesPlaceholder()}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Website or Audit Report Link</label>
                                        <input
                                            type="url"
                                            value={data.website_url}
                                            onChange={(e) => setData('website_url', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="https://iliganstrayfeeders.org/transparency"
                                        />
                                    </div>
                                </div>

                                {/* Category-Aware Toggles */}
                                <div className={`p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 grid gap-3 ${
                                    isVet ? 'grid-cols-3' : 'grid-cols-2'
                                }`}>
                                    {isVet && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_emergency}
                                                onChange={(e) => setData('is_emergency', e.target.checked)}
                                                className="rounded text-red-600 focus:ring-red-500"
                                            />
                                            <span className="text-[11px] font-bold text-red-600">Emergency Contact</span>
                                        </label>
                                    )}

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="rounded text-amber-500 focus:ring-amber-400"
                                        />
                                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Featured (Top Banner)</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Active Listing</span>
                                    </label>
                                </div>

                                {!isVet && (
                                    <p className="text-[10px] text-gray-400 italic flex items-center gap-1">
                                        <Info size={12} className="text-blue-500 shrink-0" />
                                        <span>Emergency triage flags are reserved exclusively for licensed veterinary clinics.</span>
                                    </p>
                                )}
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
                                    form="partner-modal-form"
                                    disabled={processing}
                                    className="px-6 py-2.5 rounded-xl bg-paw-orange hover:bg-orange-600 text-white font-black uppercase tracking-wider shadow-md shadow-paw-orange/20 cursor-pointer disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {processing && <Spinner size="xs" />}
                                    <span>{editingPartner ? 'Update Partner' : 'Create Partner'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardSectionPage>
    );
}

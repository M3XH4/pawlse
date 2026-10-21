import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Award, Plus, Search, Filter, Edit2, Trash2, X, Check, 
    RotateCcw, Heart, Users, Star, Gift, CheckCircle2, Sliders,
    Sparkles, ShieldCheck
} from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';

interface CommunityHonorRecord {
    id: number;
    name: string;
    category: 'donor' | 'volunteer' | 'sponsor' | 'community_supporter';
    tier?: string | null;
    role_title: string;
    description?: string | null;
    badges?: string[] | null;
    initials?: string | null;
    avatar_url?: string | null;
    is_featured: boolean;
    is_public: boolean;
    display_order: number;
    deleted_at?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface RecognitionMetrics {
    core_members_count: number;
    active_volunteers_count?: number | null;
    on_call_volunteers_count?: number | null;
    meals_served_display: string;
    pets_rescued_display: string;
    adoptions_display: string;
    active_zones_display: string;
}

interface CommunityHonorProps {
    honors: {
        data: CommunityHonorRecord[];
        links: PaginationLink[];
        total: number;
        current_page: number;
    };
    stats: {
        total: number;
        donors: number;
        volunteers: number;
        supporters: number;
        sponsors: number;
    };
    recognitionMetrics: RecognitionMetrics;
    filters: {
        search?: string;
        category?: string;
    };
}

export default function CommunityHonorManagement({ 
    honors, 
    stats, 
    recognitionMetrics, 
    filters 
}: CommunityHonorProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingHonor, setEditingHonor] = useState<CommunityHonorRecord | null>(null);
    const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);

    // Permission enforcement
    const { can } = usePermissions();
    const canCreateHonor = can('community_honor.create');
    const canEditHonor = can('community_honor.edit');
    const canDeleteHonor = can('community_honor.delete');

    // Honoree Form
    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        name: '',
        category: 'community_supporter' as 'donor' | 'volunteer' | 'sponsor' | 'community_supporter',
        tier: '',
        role_title: 'ISF Supporter',
        description: '',
        badges_string: '',
        initials: '',
        avatar_url: '',
        is_featured: false,
        is_public: true,
        display_order: 0,
    });

    // Metrics Form
    const metricsForm = useForm({
        core_members_count: recognitionMetrics?.core_members_count ?? 15,
        active_volunteers_count: recognitionMetrics?.active_volunteers_count ?? 42,
        on_call_volunteers_count: recognitionMetrics?.on_call_volunteers_count ?? 28,
        meals_served_display: recognitionMetrics?.meals_served_display ?? '12k+',
        pets_rescued_display: recognitionMetrics?.pets_rescued_display ?? '450+',
        adoptions_display: recognitionMetrics?.adoptions_display ?? '85+',
        active_zones_display: recognitionMetrics?.active_zones_display ?? '15',
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (item: CommunityHonorRecord) => {
        clearErrors();
        setEditingHonor(item);
        setData({
            name: item.name,
            category: item.category,
            tier: item.tier || '',
            role_title: item.role_title,
            description: item.description || '',
            badges_string: item.badges ? item.badges.join(', ') : '',
            initials: item.initials || '',
            avatar_url: item.avatar_url || '',
            is_featured: item.is_featured,
            is_public: item.is_public,
            display_order: item.display_order,
        });
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setEditingHonor(null);
        reset();
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/account/super-admin/community-honors', {
            search: search || undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
        }, { preserveState: true });
    };

    const handleCategoryChange = (cat: string) => {
        setCategoryFilter(cat);
        router.get('/account/super-admin/community-honors', {
            search: search || undefined,
            category: cat !== 'all' ? cat : undefined,
        }, { preserveState: true });
    };

    const handleHonoreeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const badges = data.badges_string.split(',').map(s => s.trim()).filter(Boolean);

        const payload = {
            ...data,
            badges,
        };

        if (editingHonor) {
            router.put(`/account/super-admin/community-honors/${editingHonor.id}`, payload, {
                onSuccess: () => {
                    toast.success('Community honoree updated.');
                    closeModals();
                },
                onError: () => toast.error('Please check validation errors.')
            });
        } else {
            router.post('/account/super-admin/community-honors', payload, {
                onSuccess: () => {
                    toast.success('Community honoree added.');
                    closeModals();
                },
                onError: () => toast.error('Please check validation errors.')
            });
        }
    };

    const handleMetricsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        metricsForm.post('/account/super-admin/community-honors/stats', {
            onSuccess: () => {
                toast.success('Recognition metrics updated successfully.');
                setIsMetricsModalOpen(false);
            },
            onError: () => toast.error('Failed to update metrics.')
        });
    };

    const handleDelete = (item: CommunityHonorRecord) => {
        if (confirm(`Remove "${item.name}" from public honor recognition?`)) {
            router.delete(`/account/super-admin/community-honors/${item.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success(`Removed "${item.name}".`),
            });
        }
    };

    return (
        <DashboardSectionPage
            title="Community Recognition & Honor Management"
            description="Manage recognized supporters, featured donors, volunteer recognition stats, and public achievement badges"
        >
            <Head title="Community Honors | Super Admin" />

            <div className="space-y-6">
                {/* 1. Metrics & Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                            <Award size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.total}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Recognized</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black">
                            <Gift size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.donors}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Donors</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black">
                            <Users size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.volunteers}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Volunteers</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                            <Heart size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{stats.supporters}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Supporters</p>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-black">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{recognitionMetrics?.core_members_count || 15}</span>
                            <p className="text-[11px] font-bold text-gray-400 uppercase">Core Members</p>
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
                                    placeholder="Search supporters by name, role, story..."
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
                                <option value="donor">Donors</option>
                                <option value="volunteer">Volunteers</option>
                                <option value="community_supporter">Community Supporters</option>
                                <option value="sponsor">Sponsors</option>
                            </select>

                            <button
                                onClick={() => setIsMetricsModalOpen(true)}
                                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <Sliders size={14} />
                                <span>Edit Metrics</span>
                            </button>

                            {canCreateHonor && (
                                <button
                                    onClick={openCreateModal}
                                    className="px-4 py-2 rounded-xl bg-paw-orange text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-paw-orange/20 hover:bg-orange-600 transition-colors cursor-pointer"
                                >
                                    <Plus size={16} />
                                    <span>Add Honoree</span>
                                </button>
                            )}
                        </div>
                    </div>
                </DashboardCard>

                {/* 3. Honorees Table */}
                <DashboardCard className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50/80 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800 text-gray-500 uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="py-3 px-4">Supporter / Honoree</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Role &amp; Contribution</th>
                                    <th className="py-3 px-4">Badges</th>
                                    <th className="py-3 px-4">Tier / Level</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                                {honors.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400">
                                            No community supporters found.
                                        </td>
                                    </tr>
                                ) : (
                                    honors.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-900 font-black text-xs flex items-center justify-center shrink-0">
                                                        {item.initials || item.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.name}</h4>
                                                        <p className="text-[11px] text-amber-600 dark:text-[#FFAE33]">{item.role_title}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap min-w-[130px]">
                                                <span className="inline-flex items-center justify-center shrink-0 whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                                                    {item.category.replace('_', ' ')}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4 max-w-xs">
                                                <p className="text-gray-600 dark:text-gray-400 text-[11px] line-clamp-2">
                                                    {item.description || 'Valued contributor to animal rescue.'}
                                                </p>
                                            </td>

                                            <td className="py-3 px-4 min-w-[170px]">
                                                <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                                    {item.badges && item.badges.length > 0 ? (
                                                        item.badges.map((b, i) => (
                                                            <span key={i} className="inline-flex items-center shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[9px] font-bold border border-blue-200/50 dark:border-blue-900/30">
                                                                {b}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-[10px]">None</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap min-w-[120px]">
                                                {item.tier ? (
                                                    <span className="inline-flex items-center justify-center shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                                                        {item.tier}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-[10px]">Standard</span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {canEditHonor && (
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                                                            title="Edit Supporter"
                                                        >
                                                            <Edit2 size={15} />
                                                        </button>
                                                    )}
                                                    {canDeleteHonor && (
                                                        <button
                                                            onClick={() => handleDelete(item)}
                                                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                                            title="Remove from Recognition"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                    {!canEditHonor && !canDeleteHonor && (
                                                        <span className="text-gray-400 italic text-[11px]">Read-only</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </DashboardCard>
            </div>

            {/* Modal for Create / Edit Honoree */}
            <AnimatePresence>
                {(isCreateModalOpen || editingHonor) && (
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
                            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto"
                        >
                            <button
                                onClick={closeModals}
                                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-2xl font-black text-paw-navy dark:text-white mb-1">
                                {editingHonor ? 'Edit Community Honoree' : 'Add Community Honoree'}
                            </h3>
                            <p className="text-xs text-gray-500 mb-6">
                                Recognize donors, recurring supporters, and dedicated rescue volunteers
                            </p>

                            <form onSubmit={handleHonoreeSubmit} className="space-y-4 text-xs font-semibold">
                                <div>
                                    <label className="block text-gray-500 mb-1">Supporter / Honoree Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        placeholder="e.g. Miguel Burton"
                                    />
                                    {errors.name && <p className="text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">Category *</label>
                                        <select
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value as any)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-bold"
                                        >
                                            <option value="donor">Donor</option>
                                            <option value="volunteer">Volunteer</option>
                                            <option value="community_supporter">Community Supporter</option>
                                            <option value="sponsor">Sponsor</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Tier / Recognition Level</label>
                                        <input
                                            type="text"
                                            value={data.tier}
                                            onChange={(e) => setData('tier', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="e.g. Platinum, Gold, Core"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-500 mb-1">Role / Honor Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.role_title}
                                        onChange={(e) => setData('role_title', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        placeholder="Feeding Supporter, Recurring Supporter, ISF Supporter"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-500 mb-1">Public Story / Contribution Description</label>
                                    <textarea
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        placeholder="Describe how they supported feeding drives or animal welfare"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 mb-1">Badges (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={data.badges_string}
                                            onChange={(e) => setData('badges_string', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="Recurring Donor, Feeding Volunteer"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Initials (Optional)</label>
                                        <input
                                            type="text"
                                            maxLength={5}
                                            value={data.initials}
                                            onChange={(e) => setData('initials', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="e.g. MB, CD"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 grid grid-cols-2 gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="rounded text-amber-500"
                                        />
                                        <span className="text-[11px] font-bold text-amber-600">Featured (Top Card)</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_public}
                                            onChange={(e) => setData('is_public', e.target.checked)}
                                            className="rounded text-emerald-600"
                                        />
                                        <span className="text-[11px] font-bold text-emerald-600">Public Display</span>
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
                                        {editingHonor ? 'Update Honoree' : 'Create Honoree'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal for Editing Volunteer & Recognition Metrics */}
            <AnimatePresence>
                {isMetricsModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMetricsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setIsMetricsModalOpen(false)}
                                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-2xl font-black text-paw-navy dark:text-white mb-1">
                                Update Recognition Metrics
                            </h3>
                            <p className="text-xs text-gray-500 mb-6">
                                Update the volunteer counts and impact numbers displayed on the Honor and About pages
                            </p>

                            <form onSubmit={handleMetricsSubmit} className="space-y-4 text-xs font-semibold">
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-gray-500 mb-1">Core Members</label>
                                        <input
                                            type="number"
                                            required
                                            value={metricsForm.data.core_members_count}
                                            onChange={(e) => metricsForm.setData('core_members_count', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Active Volunteers</label>
                                        <input
                                            type="number"
                                            value={metricsForm.data.active_volunteers_count || ''}
                                            onChange={(e) => metricsForm.setData('active_volunteers_count', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">On-Call Volunteers</label>
                                        <input
                                            type="number"
                                            value={metricsForm.data.on_call_volunteers_count || ''}
                                            onChange={(e) => metricsForm.setData('on_call_volunteers_count', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-gray-500 mb-1">Meals Served</label>
                                        <input
                                            type="text"
                                            required
                                            value={metricsForm.data.meals_served_display}
                                            onChange={(e) => metricsForm.setData('meals_served_display', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="12k+"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Pets Rescued</label>
                                        <input
                                            type="text"
                                            required
                                            value={metricsForm.data.pets_rescued_display}
                                            onChange={(e) => metricsForm.setData('pets_rescued_display', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="450+"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Adoptions</label>
                                        <input
                                            type="text"
                                            required
                                            value={metricsForm.data.adoptions_display}
                                            onChange={(e) => metricsForm.setData('adoptions_display', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="85+"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 mb-1">Active Zones</label>
                                        <input
                                            type="text"
                                            required
                                            value={metricsForm.data.active_zones_display}
                                            onChange={(e) => metricsForm.setData('active_zones_display', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="15"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsMetricsModalOpen(false)}
                                        className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={metricsForm.processing}
                                        className="px-6 py-2 rounded-xl bg-paw-orange hover:bg-orange-600 text-white font-black uppercase tracking-wider shadow-md shadow-paw-orange/20"
                                    >
                                        Save Metrics
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

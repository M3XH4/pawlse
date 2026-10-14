import React, { useState, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminCard } from '@/components/admin/card';
import { toast } from 'sonner';
import {
    Heart,
    HeartHandshake,
    Home,
    Search,
    Plus,
    ArrowRightLeft,
    XCircle,
    CheckCircle2,
    AlertTriangle,
    Clock,
    FileText,
    UserCheck,
    Users,
    Activity,
    Info,
    Calendar,
    Settings2,
    ShieldAlert,
    ChevronRight,
    MessageSquare,
    ExternalLink,
} from 'lucide-react';

interface PaginatedData<T> {
    data: T[];
    links: any[];
    total: number;
    current_page: number;
    last_page: number;
}

interface PlacementItem {
    id: number;
    shelter_animal_id: number;
    status: string;
    start_date: string | null;
    expected_review_date: string | null;
    end_date: string | null;
    care_instructions: string | null;
    medical_notes: string | null;
    dietary_requirements: string | null;
    special_needs: string | null;
    placement_notes: string | null;
    transfer_reason: string | null;
    end_reason: string | null;
    days_in_care: number;
    is_review_overdue: boolean;
    updates_count: number;
    unacknowledged_updates_count: number;
    pet: {
        id: number;
        name: string;
        type: string | null;
        breed: string;
        age: string;
        photo_url: string | null;
        status: string;
    } | null;
    foster_parent: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        avatar: string;
        role: string;
    } | null;
    assigned_by?: { id: number; name: string } | null;
    transferred_by?: { id: number; name: string } | null;
}

interface FosterParentItem {
    id: number;
    user_id: number;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    user_role: string;
    status: string;
    capacity: number;
    active_count: number;
    remaining_capacity: number;
    is_at_capacity: boolean;
    notes: string | null;
    approved_at: string | null;
    approver_name: string | null;
    active_pets: Array<{
        id: number;
        name: string;
        type: string | null;
        placement_id: number;
    }>;
}

interface AvailablePetItem {
    id: number;
    name: string;
    type: string | null;
    breed: string;
    age: string;
    photo_url: string | null;
    status: string;
    behavior: string;
    vaccinated: boolean;
}

interface EligibleUserItem {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface CareUpdateItem {
    id: number;
    foster_placement_id: number;
    shelter_animal_id: number;
    pet_name: string;
    pet_photo: string | null;
    author_name: string;
    author_email: string;
    update_type: string;
    urgency: string;
    title: string;
    notes: string;
    weight: string | null;
    feeding_notes: string | null;
    medication_notes: string | null;
    next_appointment_date: string | null;
    admin_notes: string | null;
    is_acknowledged: boolean;
    acknowledged_at: string | null;
    acknowledged_by_name: string | null;
    created_at: string;
}

interface AuditLogItem {
    id: number;
    action: string;
    description: string;
    user_name: string;
    created_at: string;
    metadata: any;
}

interface FosterManagementProps {
    metrics: {
        active_placements_count: number;
        available_pets_count: number;
        approved_foster_parents_count: number;
        parents_at_capacity_count: number;
        needs_attention_count: number;
    };
    placements: PaginatedData<PlacementItem>;
    fosterParents: FosterParentItem[];
    availablePets: AvailablePetItem[];
    eligibleUsers: EligibleUserItem[];
    careUpdates: CareUpdateItem[];
    auditLogs: AuditLogItem[];
    filters: {
        search: string;
        status: string;
    };
}

export default function FosterManagement({
    metrics,
    placements,
    fosterParents,
    availablePets,
    eligibleUsers,
    careUpdates,
    auditLogs,
    filters,
}: FosterManagementProps) {
    const [currentTab, setCurrentTab] = useState<'placements' | 'available_pets' | 'foster_parents' | 'care_updates' | 'history' | 'audit'>('placements');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Modals
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [showAuthorizeModal, setShowAuthorizeModal] = useState(false);
    const [showEditParentModal, setShowEditParentModal] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);
    const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
    const [selectedPlacement, setSelectedPlacement] = useState<PlacementItem | null>(null);
    const [selectedParent, setSelectedParent] = useState<FosterParentItem | null>(null);
    const [selectedUpdate, setSelectedUpdate] = useState<CareUpdateItem | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Assign Form State
    const [assignPetId, setAssignPetId] = useState<number | string>(availablePets.length > 0 ? availablePets[0].id : '');
    const [assignParentId, setAssignParentId] = useState<number | string>(
        fosterParents.find((p) => p.status === 'approved' && !p.is_at_capacity)?.id || '',
    );
    const [assignStartDate, setAssignStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [assignReviewDate, setAssignReviewDate] = useState(
        new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    );
    const [assignCareInstructions, setAssignCareInstructions] = useState('');
    const [assignMedicalNotes, setAssignMedicalNotes] = useState('');
    const [assignDietaryReqs, setAssignDietaryReqs] = useState('');
    const [assignSpecialNeeds, setAssignSpecialNeeds] = useState('');
    const [assignPlacementNotes, setAssignPlacementNotes] = useState('');

    // Transfer Form State
    const [transferDestinationId, setTransferDestinationId] = useState<number | string>('');
    const [transferReason, setTransferReason] = useState('');
    const [transferReviewDate, setTransferReviewDate] = useState('');
    const [transferUpdatedInstructions, setTransferUpdatedInstructions] = useState('');

    // End Placement Form State
    const [endReason, setEndReason] = useState('');
    const [endTargetStatus, setEndTargetStatus] = useState('available');

    // Authorize Parent Form State
    const [authUserId, setAuthUserId] = useState<number | string>(eligibleUsers.length > 0 ? eligibleUsers[0].id : '');
    const [authCapacity, setAuthCapacity] = useState(2);
    const [authNotes, setAuthNotes] = useState('');
    const [authStatus, setAuthStatus] = useState('approved');

    // Edit Parent Form State
    const [editCapacity, setEditCapacity] = useState(2);
    const [editStatus, setEditStatus] = useState('approved');
    const [editNotes, setEditNotes] = useState('');

    // Instructions Form State
    const [instCare, setInstCare] = useState('');
    const [instMedical, setInstMedical] = useState('');
    const [instDietary, setInstDietary] = useState('');
    const [instSpecial, setInstSpecial] = useState('');
    const [instReviewDate, setInstReviewDate] = useState('');

    // Acknowledge Form State
    const [adminResponseNotes, setAdminResponseNotes] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/account/admin/foster-management',
            { search: searchTerm, status: statusFilter },
            { preserveState: true, preserveScroll: true },
        );
    };

    const openAssignForPet = (pet: AvailablePetItem) => {
        setAssignPetId(pet.id);
        setShowAssignModal(true);
    };

    const openTransferModal = (placement: PlacementItem) => {
        setSelectedPlacement(placement);
        setTransferDestinationId('');
        setTransferReason('');
        setTransferReviewDate(placement.expected_review_date || '');
        setTransferUpdatedInstructions(placement.care_instructions || '');
        setShowTransferModal(true);
    };

    const openEndModal = (placement: PlacementItem) => {
        setSelectedPlacement(placement);
        setEndReason('');
        setEndTargetStatus('available');
        setShowEndModal(true);
    };

    const openEditParentModal = (parent: FosterParentItem) => {
        setSelectedParent(parent);
        setEditCapacity(parent.capacity);
        setEditStatus(parent.status);
        setEditNotes(parent.notes || '');
        setShowEditParentModal(true);
    };

    const openInstructionsModal = (placement: PlacementItem) => {
        setSelectedPlacement(placement);
        setInstCare(placement.care_instructions || '');
        setInstMedical(placement.medical_notes || '');
        setInstDietary(placement.dietary_requirements || '');
        setInstSpecial(placement.special_needs || '');
        setInstReviewDate(placement.expected_review_date || '');
        setShowInstructionsModal(true);
    };

    const openAcknowledgeModal = (update: CareUpdateItem) => {
        setSelectedUpdate(update);
        setAdminResponseNotes(update.admin_notes || 'Thank you for the update. Logged in clinical shelter records.');
        setShowAcknowledgeModal(true);
    };

    // Submissions
    const submitAssign = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(
            '/account/admin/foster-management/assign',
            {
                shelter_animal_id: assignPetId,
                foster_parent_id: assignParentId,
                start_date: assignStartDate,
                expected_review_date: assignReviewDate || null,
                care_instructions: assignCareInstructions || null,
                medical_notes: assignMedicalNotes || null,
                dietary_requirements: assignDietaryReqs || null,
                special_needs: assignSpecialNeeds || null,
                placement_notes: assignPlacementNotes || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowAssignModal(false);
                    toast.success('Shelter pet assigned to foster home successfully.');
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] as string || 'Failed to assign pet.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const submitTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlacement) return;
        setSubmitting(true);
        router.post(
            `/account/admin/foster-management/placements/${selectedPlacement.id}/transfer`,
            {
                destination_foster_parent_id: transferDestinationId,
                transfer_reason: transferReason,
                expected_review_date: transferReviewDate || null,
                updated_care_instructions: transferUpdatedInstructions || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowTransferModal(false);
                    toast.success('Pet transferred to new foster parent successfully.');
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] as string || 'Failed to transfer pet.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const submitEnd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlacement) return;
        setSubmitting(true);
        router.post(
            `/account/admin/foster-management/placements/${selectedPlacement.id}/end`,
            {
                end_reason: endReason,
                target_status: endTargetStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowEndModal(false);
                    toast.success('Foster placement ended successfully.');
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] as string || 'Failed to end placement.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const submitAuthorize = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(
            '/account/admin/foster-management/foster-parents',
            {
                user_id: authUserId,
                capacity: authCapacity,
                notes: authNotes || null,
                status: authStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowAuthorizeModal(false);
                    toast.success('Foster parent authorized successfully.');
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] as string || 'Failed to authorize foster parent.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const submitEditParent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedParent) return;
        setSubmitting(true);
        router.put(
            `/account/admin/foster-management/foster-parents/${selectedParent.id}`,
            {
                capacity: editCapacity,
                status: editStatus,
                notes: editNotes || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowEditParentModal(false);
                    toast.success('Foster parent updated successfully.');
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] as string || 'Failed to update foster parent.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const submitInstructions = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlacement) return;
        setSubmitting(true);
        router.post(
            `/account/admin/foster-management/placements/${selectedPlacement.id}/instructions`,
            {
                care_instructions: instCare || null,
                medical_notes: instMedical || null,
                dietary_requirements: instDietary || null,
                special_needs: instSpecial || null,
                expected_review_date: instReviewDate || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowInstructionsModal(false);
                    toast.success('Care instructions updated.');
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] as string || 'Failed to update instructions.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const submitAcknowledge = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUpdate) return;
        setSubmitting(true);
        router.post(
            `/account/admin/foster-management/updates/${selectedUpdate.id}/acknowledge`,
            {
                admin_notes: adminResponseNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowAcknowledgeModal(false);
                    toast.success('Care report response saved and sent.');
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] as string || 'Failed to respond to care update.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <AdminPageShell
            title="Foster Home Management"
            description="Authorize approved foster caretakers, place shelter animals in temporary home care, manage transfers, and monitor welfare updates."
        >
            <Head title="Foster Home Management - Admin" />

            {/* Overview Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <AdminCard className="p-4 border-l-4 border-l-paw-orange">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Placements</p>
                    <p className="mt-2 text-3xl font-black text-[#0B2340] dark:text-white">{metrics.active_placements_count}</p>
                    <p className="text-xs text-gray-500 mt-1">Shelter pets in foster care</p>
                </AdminCard>

                <AdminCard className="p-4 border-l-4 border-l-green-500">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Awaiting Foster</p>
                    <p className="mt-2 text-3xl font-black text-[#0B2340] dark:text-white">{metrics.available_pets_count}</p>
                    <p className="text-xs text-gray-500 mt-1">Available shelter animals</p>
                </AdminCard>

                <AdminCard className="p-4 border-l-4 border-l-blue-500">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Approved Homes</p>
                    <p className="mt-2 text-3xl font-black text-[#0B2340] dark:text-white">{metrics.approved_foster_parents_count}</p>
                    <p className="text-xs text-gray-500 mt-1">Verified foster parents</p>
                </AdminCard>

                <AdminCard className="p-4 border-l-4 border-l-purple-500">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">At Capacity</p>
                    <p className="mt-2 text-3xl font-black text-[#0B2340] dark:text-white">{metrics.parents_at_capacity_count}</p>
                    <p className="text-xs text-gray-500 mt-1">Homes with full slots</p>
                </AdminCard>

                <AdminCard className={`p-4 border-l-4 ${metrics.needs_attention_count > 0 ? 'border-l-red-500 bg-red-50/20' : 'border-l-gray-300'}`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                        <AlertTriangle size={14} className={metrics.needs_attention_count > 0 ? 'text-red-500' : 'text-gray-400'} />
                        Needs Attention
                    </p>
                    <p className="mt-2 text-3xl font-black text-[#0B2340] dark:text-white">{metrics.needs_attention_count}</p>
                    <p className="text-xs text-gray-500 mt-1">Reviews overdue / urgent alerts</p>
                </AdminCard>
            </div>

            {/* Action Bar & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowAssignModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-paw-orange text-white shadow-sm hover:bg-paw-orange/90 transition-colors"
                    >
                        <Plus size={16} /> Assign Shelter Pet to Foster
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowAuthorizeModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0B2340] dark:bg-gray-800 text-white shadow-sm hover:bg-opacity-90 transition-colors"
                    >
                        <UserCheck size={16} /> Authorize New Foster Parent
                    </button>
                </div>

                {/* Filter and Search */}
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search pet or foster parent..."
                            className="pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0B2340] dark:text-white w-64"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            router.get(
                                '/account/admin/foster-management',
                                { search: searchTerm, status: e.target.value },
                                { preserveState: true, preserveScroll: true },
                            );
                        }}
                        className="py-2 px-3 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0B2340] dark:text-white"
                    >
                        <option value="all">All Placement Statuses</option>
                        <option value="active">Active Placements</option>
                        <option value="transferred">Transferred</option>
                        <option value="ended">Ended / Concluded</option>
                    </select>
                </form>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap items-center gap-x-1 sm:gap-x-2 gap-y-1 border-b border-gray-200 dark:border-gray-800 pb-1 sm:pb-0">
                <button
                    type="button"
                    onClick={() => setCurrentTab('placements')}
                    className={`pb-2.5 sm:pb-3 px-3 sm:px-3.5 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                        currentTab === 'placements'
                            ? 'border-paw-orange text-paw-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    Active Placements ({placements.total})
                </button>
                <button
                    type="button"
                    onClick={() => setCurrentTab('available_pets')}
                    className={`pb-2.5 sm:pb-3 px-3 sm:px-3.5 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                        currentTab === 'available_pets'
                            ? 'border-paw-orange text-paw-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    Available Shelter Pets ({availablePets.length})
                </button>
                <button
                    type="button"
                    onClick={() => setCurrentTab('foster_parents')}
                    className={`pb-2.5 sm:pb-3 px-3 sm:px-3.5 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                        currentTab === 'foster_parents'
                            ? 'border-paw-orange text-paw-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    Foster Parents Directory ({fosterParents.length})
                </button>
                <button
                    type="button"
                    onClick={() => setCurrentTab('care_updates')}
                    className={`pb-2.5 sm:pb-3 px-3 sm:px-3.5 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        currentTab === 'care_updates'
                            ? 'border-paw-orange text-paw-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    Care Reports & Updates ({careUpdates.length})
                    {careUpdates.some((u) => !u.is_acknowledged && (u.urgency === 'critical' || u.urgency === 'high')) && (
                        <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => setCurrentTab('history')}
                    className={`pb-2.5 sm:pb-3 px-3 sm:px-3.5 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                        currentTab === 'history'
                            ? 'border-paw-orange text-paw-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    Placement Archive
                </button>
                <button
                    type="button"
                    onClick={() => setCurrentTab('audit')}
                    className={`pb-2.5 sm:pb-3 px-3 sm:px-3.5 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                        currentTab === 'audit'
                            ? 'border-paw-orange text-paw-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    Audit Trail ({auditLogs.length})
                </button>
            </div>

            {/* TAB 1: PLACEMENTS TABLE */}
            {currentTab === 'placements' && (
                <AdminCard className="overflow-hidden p-0 border border-gray-200 dark:border-gray-800">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 dark:bg-gray-900/60 uppercase font-bold text-gray-500 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="py-3.5 px-4">Pet Details</th>
                                    <th className="py-3.5 px-4">Foster Caretaker</th>
                                    <th className="py-3.5 px-4">Placement Timeline</th>
                                    <th className="py-3.5 px-4">Care Instructions & Health</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                                {placements.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400 font-bold">
                                            No foster placements matching criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    placements.data.map((placement) => (
                                        <tr key={placement.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700">
                                                        {placement.pet?.photo_url ? (
                                                            <img src={placement.pet.photo_url} alt={placement.pet.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center font-bold text-paw-orange">
                                                                {placement.pet?.name?.charAt(0) ?? 'P'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-[#0B2340] dark:text-white">
                                                            {placement.pet?.name}
                                                        </p>
                                                        <p className="text-gray-400 text-[11px]">
                                                            {placement.pet?.breed || placement.pet?.type} • {placement.pet?.age}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div>
                                                    <p className="font-bold text-[#0B2340] dark:text-white flex items-center gap-1.5">
                                                        {placement.foster_parent?.name}
                                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 uppercase">
                                                            {placement.foster_parent?.role}
                                                        </span>
                                                    </p>
                                                    <p className="text-gray-400 text-[11px]">{placement.foster_parent?.email}</p>
                                                    {placement.foster_parent?.phone && (
                                                        <p className="text-gray-500 text-[11px]">{placement.foster_parent.phone}</p>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="space-y-0.5">
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        Started: <strong>{placement.start_date}</strong>
                                                    </p>
                                                    <p className="text-gray-400 text-[11px]">
                                                        {placement.days_in_care} days in foster care
                                                    </p>
                                                    {placement.expected_review_date && (
                                                        <p className={`text-[11px] font-semibold ${
                                                            placement.is_review_overdue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-500'
                                                        }`}>
                                                            Review: {placement.expected_review_date}
                                                            {placement.is_review_overdue && ' (Overdue)'}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 max-w-xs">
                                                <div className="truncate text-gray-600 dark:text-gray-300">
                                                    {placement.care_instructions || placement.medical_notes || 'Standard care'}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                                                    <span>{placement.updates_count} care logs</span>
                                                    {placement.unacknowledged_updates_count > 0 && (
                                                        <span className="text-red-500 font-bold">
                                                            • {placement.unacknowledged_updates_count} pending review
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                    placement.status === 'active'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                                                        : placement.status === 'transferred'
                                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                    {placement.status}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                    {placement.status === 'active' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => openTransferModal(placement)}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                                                                title="Transfer Pet to Another Foster Home"
                                                            >
                                                                <ArrowRightLeft size={13} className="inline mr-1" /> Transfer
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEndModal(placement)}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-700 hover:bg-gray-800 text-white transition-colors"
                                                                title="Conclude Foster Placement"
                                                            >
                                                                End
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openInstructionsModal(placement)}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                title="Edit Care Instructions & Follow-up Dates"
                                                            >
                                                                <Settings2 size={13} />
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
                    {placements.links && placements.links.length > 3 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-center gap-1">
                            {placements.links.map((link, idx) => {
                                if (link.url === null) {
                                    return (
                                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    );
                                }
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                            link.active ? 'bg-paw-orange text-white' : 'bg-white text-paw-navy hover:bg-paw-orange/10 border'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </AdminCard>
            )}

            {/* TAB 2: AVAILABLE SHELTER PETS */}
            {currentTab === 'available_pets' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availablePets.length === 0 ? (
                        <div className="col-span-full p-12 text-center text-gray-400 font-bold bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                            No shelter animals currently waiting for foster placement.
                        </div>
                    ) : (
                        availablePets.map((pet) => (
                            <AdminCard key={pet.id} className="p-4 flex flex-col justify-between border border-gray-200 dark:border-gray-800">
                                <div>
                                    <div className="relative h-44 w-full rounded-xl overflow-hidden bg-gray-100 mb-3 border border-gray-200 dark:border-gray-700">
                                        {pet.photo_url ? (
                                            <img src={pet.photo_url} alt={pet.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center font-bold text-2xl text-paw-orange">
                                                {pet.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-600 text-white shadow-sm">
                                            {pet.status}
                                        </span>
                                    </div>
                                    <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                        {pet.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-semibold mt-0.5">
                                        {pet.breed} • {pet.age} • {pet.type}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                                        {pet.behavior || 'Friendly, ready for temporary placement.'}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <span className="text-[11px] text-gray-400 font-medium">
                                        Vaccinated: {pet.vaccinated ? 'Yes' : 'Pending'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => openAssignForPet(pet)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-paw-orange text-white hover:bg-paw-orange/90 transition-colors"
                                    >
                                        <Plus size={14} /> Place in Foster
                                    </button>
                                </div>
                            </AdminCard>
                        ))
                    )}
                </div>
            )}

            {/* TAB 3: FOSTER PARENTS DIRECTORY */}
            {currentTab === 'foster_parents' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {fosterParents.map((parent) => (
                            <AdminCard key={parent.id} className="p-5 border border-gray-200 dark:border-gray-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={parent.avatar}
                                            alt={parent.name}
                                            className="h-12 w-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                                        />
                                        <div>
                                            <h4 className="font-bold text-sm text-[#0B2340] dark:text-white flex items-center gap-1.5">
                                                {parent.name}
                                            </h4>
                                            <p className="text-xs text-gray-400">{parent.email}</p>
                                            <span className="inline-block mt-1 text-[10px] uppercase font-black px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                                                Role: {parent.user_role}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => openEditParentModal(parent)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white border border-gray-200 dark:border-gray-700"
                                        title="Configure Capacity & Status"
                                    >
                                        <Settings2 size={15} />
                                    </button>
                                </div>

                                {/* Capacity Bar */}
                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                                        <span className="text-gray-500">Occupancy & Capacity:</span>
                                        <span className={`font-bold ${parent.is_at_capacity ? 'text-red-500' : 'text-paw-orange'}`}>
                                            {parent.active_count} / {parent.capacity} pets
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${parent.is_at_capacity ? 'bg-red-500' : 'bg-paw-orange'}`}
                                            style={{ width: `${Math.min(100, (parent.active_count / parent.capacity) * 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        {parent.remaining_capacity} available foster slot(s)
                                    </p>
                                </div>

                                {/* Currently Assigned Pets */}
                                <div className="mt-3">
                                    <p className="text-[11px] font-bold uppercase text-gray-400 mb-1.5">Currently Caring For:</p>
                                    {parent.active_pets.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No pets currently placed.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {parent.active_pets.map((p) => (
                                                <span
                                                    key={p.id}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-paw-orange/10 text-paw-orange text-xs font-bold"
                                                >
                                                    <Heart size={11} /> {p.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {parent.notes && (
                                    <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 italic">
                                        "{parent.notes}"
                                    </p>
                                )}
                            </AdminCard>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 4: CARE REPORTS & UPDATES */}
            {currentTab === 'care_updates' && (
                <div className="space-y-4">
                    {careUpdates.length === 0 ? (
                        <AdminCard className="p-12 text-center text-gray-400 font-bold">
                            No care reports or welfare updates recorded.
                        </AdminCard>
                    ) : (
                        <div className="space-y-3">
                            {careUpdates.map((update) => (
                                <AdminCard
                                    key={update.id}
                                    className={`p-5 border ${
                                        update.urgency === 'critical' || update.urgency === 'high'
                                            ? 'border-red-300 bg-red-50/20 dark:border-red-900'
                                            : 'border-gray-200 dark:border-gray-800'
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                                                update.urgency === 'critical'
                                                    ? 'bg-red-600 text-white'
                                                    : update.urgency === 'high'
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                            }`}>
                                                {update.update_type} • {update.urgency}
                                            </span>
                                            <h4 className="font-bold text-base text-[#0B2340] dark:text-white">
                                                {update.title}
                                            </h4>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 font-medium">
                                                {update.created_at}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => openAcknowledgeModal(update)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-paw-orange text-white hover:bg-paw-orange/90 transition-colors"
                                            >
                                                {update.is_acknowledged ? 'Edit Response' : 'Review & Respond'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 font-medium">
                                        <span>Pet: <strong>{update.pet_name}</strong></span>
                                        <span>Caretaker: <strong>{update.author_name}</strong> ({update.author_email})</span>
                                        {update.weight && <span>Weight: <strong>{update.weight}</strong></span>}
                                    </div>

                                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                        {update.notes}
                                    </p>

                                    {update.admin_notes && (
                                        <div className="mt-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 p-3 rounded-xl">
                                            <p className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                                                <CheckCircle2 size={14} /> Coordinator Response ({update.acknowledged_by_name || 'Admin'}):
                                            </p>
                                            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                                                {update.admin_notes}
                                            </p>
                                        </div>
                                    )}
                                </AdminCard>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 5: PLACEMENT ARCHIVE */}
            {currentTab === 'history' && (
                <AdminCard className="p-0 overflow-hidden border border-gray-200 dark:border-gray-800">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 dark:bg-gray-900/60 uppercase font-bold text-gray-500 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="py-3 px-4">Placement ID</th>
                                    <th className="py-3 px-4">Pet</th>
                                    <th className="py-3 px-4">Foster Parent</th>
                                    <th className="py-3 px-4">Start / End Dates</th>
                                    <th className="py-3 px-4">Status & Reason</th>
                                    <th className="py-3 px-4">Admin Responsible</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {placements.data.filter((p) => p.status !== 'active').length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-400 font-bold">
                                            No concluded or transferred placements in this view.
                                        </td>
                                    </tr>
                                ) : (
                                    placements.data.filter((p) => p.status !== 'active').map((p) => (
                                        <tr key={p.id}>
                                            <td className="py-3 px-4 font-mono font-bold">#{p.id}</td>
                                            <td className="py-3 px-4 font-bold">{p.pet?.name}</td>
                                            <td className="py-3 px-4">{p.foster_parent?.name}</td>
                                            <td className="py-3 px-4 text-gray-500">{p.start_date} → {p.end_date || 'Concluded'}</td>
                                            <td className="py-3 px-4">
                                                <span className="uppercase text-[10px] font-black px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 mr-2">
                                                    {p.status}
                                                </span>
                                                <span className="text-gray-500 italic">
                                                    {p.transfer_reason || p.end_reason || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">
                                                {p.transferred_by?.name || p.assigned_by?.name || 'Admin'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </AdminCard>
            )}

            {/* TAB 6: AUDIT TRAIL */}
            {currentTab === 'audit' && (
                <AdminCard className="p-0 overflow-hidden border border-gray-200 dark:border-gray-800">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 dark:bg-gray-900/60 uppercase font-bold text-gray-500 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="py-3 px-4">Timestamp</th>
                                    <th className="py-3 px-4">Action</th>
                                    <th className="py-3 px-4">Responsible Actor</th>
                                    <th className="py-3 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {auditLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-400 font-bold">
                                            No foster management audit logs recorded.
                                        </td>
                                    </tr>
                                ) : (
                                    auditLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="py-3 px-4 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                                                {log.created_at}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-paw-orange/10 text-paw-orange">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-[#0B2340] dark:text-white">
                                                {log.user_name}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                                                {log.description}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </AdminCard>
            )}

            {/* MODAL 1: ASSIGN PET TO FOSTER PARENT */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white flex items-center gap-2">
                                <Plus size={20} className="text-paw-orange" /> Assign Pet to Foster Care
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowAssignModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={submitAssign} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Select Available Shelter Pet *
                                </label>
                                <select
                                    required
                                    value={assignPetId}
                                    onChange={(e) => setAssignPetId(e.target.value)}
                                    className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                >
                                    {availablePets.length === 0 ? (
                                        <option value="">No available pets</option>
                                    ) : (
                                        availablePets.map((pet) => (
                                            <option key={pet.id} value={pet.id}>
                                                {pet.name} ({pet.breed} • {pet.age})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Select Approved Foster Parent *
                                </label>
                                <select
                                    required
                                    value={assignParentId}
                                    onChange={(e) => setAssignParentId(e.target.value)}
                                    className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                >
                                    <option value="">-- Choose Foster Caretaker --</option>
                                    {fosterParents.map((parent) => (
                                        <option
                                            key={parent.id}
                                            value={parent.id}
                                            disabled={parent.status !== 'approved' || parent.is_at_capacity}
                                        >
                                            {parent.name} ({parent.active_count}/{parent.capacity} pets) - {parent.status.toUpperCase()}
                                            {parent.is_at_capacity ? ' [AT CAPACITY]' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Placement Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={assignStartDate}
                                        onChange={(e) => setAssignStartDate(e.target.value)}
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Expected Review Date
                                    </label>
                                    <input
                                        type="date"
                                        value={assignReviewDate}
                                        onChange={(e) => setAssignReviewDate(e.target.value)}
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Care & Feeding Instructions
                                </label>
                                <textarea
                                    rows={2}
                                    value={assignCareInstructions}
                                    onChange={(e) => setAssignCareInstructions(e.target.value)}
                                    placeholder="Feeding schedule, routine handling, exercise requirements..."
                                    className="w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Medical Notes & Special Needs
                                </label>
                                <textarea
                                    rows={2}
                                    value={assignMedicalNotes}
                                    onChange={(e) => setAssignMedicalNotes(e.target.value)}
                                    placeholder="Medications, post-surgery recovery, allergies, behavioral notes..."
                                    className="w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || availablePets.length === 0}
                                    className="px-5 py-2 text-xs font-bold rounded-xl bg-paw-orange text-white hover:bg-paw-orange/90 transition-colors"
                                >
                                    {submitting ? 'Assigning...' : 'Confirm Assignment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: TRANSFER PET BETWEEN FOSTER HOMES */}
            {showTransferModal && selectedPlacement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white flex items-center gap-2">
                                    <ArrowRightLeft size={20} className="text-amber-500" /> Transfer Foster Pet
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Pet: <strong>{selectedPlacement.pet?.name}</strong> • Current Caretaker: <strong>{selectedPlacement.foster_parent?.name}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTransferModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={submitTransfer} className="mt-4 space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-200">
                                <strong>Safety Notice:</strong> Transferring will conclude the current placement under {selectedPlacement.foster_parent?.name} with historical archival, and initiate an active placement under the destination caretaker.
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Destination Foster Parent *
                                </label>
                                <select
                                    required
                                    value={transferDestinationId}
                                    onChange={(e) => setTransferDestinationId(e.target.value)}
                                    className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                >
                                    <option value="">-- Choose New Foster Parent --</option>
                                    {fosterParents
                                        .filter((p) => p.user_id !== selectedPlacement.foster_parent?.id)
                                        .map((parent) => (
                                            <option
                                                key={parent.id}
                                                value={parent.id}
                                                disabled={parent.status !== 'approved' || parent.is_at_capacity}
                                            >
                                                {parent.name} ({parent.active_count}/{parent.capacity} pets) - {parent.status.toUpperCase()}
                                                {parent.is_at_capacity ? ' [AT CAPACITY]' : ''}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Transfer Reason (Required) *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={transferReason}
                                    onChange={(e) => setTransferReason(e.target.value)}
                                    placeholder="Explain why this pet is being transferred (e.g. Caretaker traveling, specialized medical supervision required, compatibility adjustment)..."
                                    className="w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Updated Instructions / Transition Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={transferUpdatedInstructions}
                                    onChange={(e) => setTransferUpdatedInstructions(e.target.value)}
                                    placeholder="Care instructions for the incoming foster parent..."
                                    className="w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Next Progress Review Date
                                </label>
                                <input
                                    type="date"
                                    value={transferReviewDate}
                                    onChange={(e) => setTransferReviewDate(e.target.value)}
                                    className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowTransferModal(false)}
                                    className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !transferDestinationId}
                                    className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                                >
                                    {submitting ? 'Executing Transfer...' : 'Authorize & Execute Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: END PLACEMENT */}
            {showEndModal && selectedPlacement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                Conclude Foster Placement
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowEndModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={submitEnd} className="mt-4 space-y-4">
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                Concluding foster care for <strong>{selectedPlacement.pet?.name}</strong> under caretaker <strong>{selectedPlacement.foster_parent?.name}</strong>.
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Return Status for Shelter Animal *
                                </label>
                                <select
                                    required
                                    value={endTargetStatus}
                                    onChange={(e) => setEndTargetStatus(e.target.value)}
                                    className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                >
                                    <option value="available">Available (Returned to shelter for adoption)</option>
                                    <option value="adopted">Adopted (Adopted directly by foster or approved applicant)</option>
                                    <option value="pending">Pending (Under evaluation or scheduled review)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Reason for Concluding Placement *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={endReason}
                                    onChange={(e) => setEndReason(e.target.value)}
                                    placeholder="Explain conclusion reason (e.g. Completed rehabilitation, adoption finalized, returned to shelter facility)..."
                                    className="w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEndModal(false)}
                                    className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 text-xs font-bold rounded-xl bg-gray-800 hover:bg-black text-white transition-colors"
                                >
                                    {submitting ? 'Concluding...' : 'Confirm Placement Closure'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: AUTHORIZE FOSTER PARENT */}
            {showAuthorizeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white flex items-center gap-2">
                                <UserCheck size={20} className="text-paw-orange" /> Authorize Foster Parent
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowAuthorizeModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={submitAuthorize} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Select Eligible User (Volunteer or Admin) *
                                </label>
                                <select
                                    required
                                    value={authUserId}
                                    onChange={(e) => setAuthUserId(e.target.value)}
                                    className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                >
                                    {eligibleUsers.length === 0 ? (
                                        <option value="">All active volunteers & admins already authorized</option>
                                    ) : (
                                        eligibleUsers.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.email} • {u.role})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Max Capacity Limit *
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        required
                                        value={authCapacity}
                                        onChange={(e) => setAuthCapacity(parseInt(e.target.value, 10))}
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Initial Status
                                    </label>
                                    <select
                                        value={authStatus}
                                        onChange={(e) => setAuthStatus(e.target.value)}
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                    >
                                        <option value="approved">Approved</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Home Environment & Experience Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={authNotes}
                                    onChange={(e) => setAuthNotes(e.target.value)}
                                    placeholder="e.g. Experienced with medical convalescence, fenced backyard, prefers small dogs..."
                                    className="w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAuthorizeModal(false)}
                                    className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || eligibleUsers.length === 0}
                                    className="px-5 py-2 text-xs font-bold rounded-xl bg-paw-orange text-white hover:bg-paw-orange/90"
                                >
                                    {submitting ? 'Authorizing...' : 'Authorize Foster Parent'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 5: EDIT FOSTER PARENT CONFIGURATION */}
            {showEditParentModal && selectedParent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                    Configure Foster Parent
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">{selectedParent.name}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowEditParentModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={submitEditParent} className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Capacity Limit *
                                    </label>
                                    <input
                                        type="number"
                                        min={selectedParent.active_count || 1}
                                        max={20}
                                        required
                                        value={editCapacity}
                                        onChange={(e) => setEditCapacity(parseInt(e.target.value, 10))}
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Min {selectedParent.active_count} (currently active)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Status *
                                    </label>
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                    >
                                        <option value="approved">Approved</option>
                                        <option value="pending">Pending</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Notes & Restrictions
                                </label>
                                <textarea
                                    rows={3}
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="Preferences, housing notes, restrictions..."
                                    className="w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEditParentModal(false)}
                                    className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 text-xs font-bold rounded-xl bg-paw-orange text-white hover:bg-paw-orange/90"
                                >
                                    {submitting ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 6: UPDATE PLACEMENT CARE INSTRUCTIONS */}
            {showInstructionsModal && selectedPlacement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                    Edit Care Instructions & Follow-up
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {selectedPlacement.pet?.name} (Placement #{selectedPlacement.id})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowInstructionsModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={submitInstructions} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Care Instructions & Routines
                                </label>
                                <textarea
                                    rows={3}
                                    value={instCare}
                                    onChange={(e) => setInstCare(e.target.value)}
                                    placeholder="Handling notes, daily feeding routines, exercise needs..."
                                    className="w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Medical & Treatment Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={instMedical}
                                    onChange={(e) => setInstMedical(e.target.value)}
                                    placeholder="Prescriptions, wound care, veterinary follow-up..."
                                    className="w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Dietary Requirements
                                    </label>
                                    <input
                                        type="text"
                                        value={instDietary}
                                        onChange={(e) => setInstDietary(e.target.value)}
                                        placeholder="Specific brand or frequency"
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Expected Review Date
                                    </label>
                                    <input
                                        type="date"
                                        value={instReviewDate}
                                        onChange={(e) => setInstReviewDate(e.target.value)}
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowInstructionsModal(false)}
                                    className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 text-xs font-bold rounded-xl bg-paw-orange text-white hover:bg-paw-orange/90"
                                >
                                    {submitting ? 'Saving...' : 'Update Instructions'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 7: ACKNOWLEDGE / RESPOND TO CARE UPDATE */}
            {showAcknowledgeModal && selectedUpdate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                    Review Foster Care Update
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Pet: <strong>{selectedUpdate.pet_name}</strong> • Caretaker: <strong>{selectedUpdate.author_name}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAcknowledgeModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={submitAcknowledge} className="mt-4 space-y-4">
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-bold text-[#0B2340] dark:text-white">
                                    {selectedUpdate.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                    {selectedUpdate.notes}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Shelter Coordinator Response / Instructions *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={adminResponseNotes}
                                    onChange={(e) => setAdminResponseNotes(e.target.value)}
                                    placeholder="Enter response, veterinary guidance, or acknowledgement..."
                                    className="w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAcknowledgeModal(false)}
                                    className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 text-xs font-bold rounded-xl bg-paw-orange text-white hover:bg-paw-orange/90"
                                >
                                    {submitting ? 'Saving...' : 'Acknowledge & Notify Foster'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminPageShell>
    );
}

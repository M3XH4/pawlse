import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Heart,
    HeartHandshake,
    AlertTriangle,
    Calendar,
    Clock,
    FileText,
    Activity,
    Plus,
    CheckCircle2,
    ShieldAlert,
    PhoneCall,
    Sparkles,
    Info,
    ChevronDown,
    ChevronUp,
    Utensils,
    Pill,
    Scale,
    ExternalLink,
} from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';

interface FosterPetModel {
    id: number;
    name: string;
    type: string | null;
    breed: string;
    age: string;
    gender: string | null;
    color: string;
    behavior: string;
    vaccinated: boolean;
    photo_url: string | null;
    story: string;
}

interface CareUpdateModel {
    id: number;
    title: string;
    update_type: string;
    urgency: string;
    notes: string;
    weight: string | null;
    feeding_notes: string | null;
    medication_notes: string | null;
    next_appointment_date: string | null;
    admin_notes: string | null;
    is_acknowledged: boolean;
    created_at: string;
}

interface PlacementModel {
    id: number;
    status: string;
    start_date: string | null;
    expected_review_date: string | null;
    care_instructions: string | null;
    medical_notes: string | null;
    dietary_requirements: string | null;
    special_needs: string | null;
    placement_notes: string | null;
    days_in_care: number;
    is_review_near_or_overdue: boolean;
    pet: FosterPetModel | null;
    assigned_by?: { id: number; name: string } | null;
    recent_updates: CareUpdateModel[];
}

interface HistoryPlacementModel {
    id: number;
    status: string;
    start_date: string | null;
    end_date: string | null;
    transfer_reason: string | null;
    end_reason: string | null;
    pet: {
        id: number;
        name: string;
        type: string | null;
        breed: string;
        photo_url: string | null;
    } | null;
}

interface FosterParentProfile {
    id: number;
    status: string;
    capacity: number;
    active_count: number;
    remaining_capacity: number;
    notes: string | null;
    approved_at: string | null;
}

interface FosterCareViewProps {
    fosterParent: FosterParentProfile | null;
    activePlacements: PlacementModel[];
    historyPlacements: HistoryPlacementModel[];
    theme: 'admin' | 'volunteer';
    isAdmin?: boolean;
}

export function FosterCareView({
    fosterParent,
    activePlacements,
    historyPlacements,
    theme,
    isAdmin = false,
}: FosterCareViewProps) {
    const [selectedPlacement, setSelectedPlacement] = useState<PlacementModel | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isEmergency, setIsEmergency] = useState(false);
    const [expandedPlacementId, setExpandedPlacementId] = useState<number | null>(
        activePlacements.length > 0 ? activePlacements[0].id : null,
    );
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

    // Update Form State
    const [updateType, setUpdateType] = useState('routine');
    const [urgency, setUrgency] = useState('low');
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [weight, setWeight] = useState('');
    const [feedingNotes, setFeedingNotes] = useState('');
    const [medicationNotes, setMedicationNotes] = useState('');
    const [nextAppointmentDate, setNextAppointmentDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const openUpdateModal = (placement: PlacementModel, emergency = false) => {
        setSelectedPlacement(placement);
        setIsEmergency(emergency);
        setUpdateType(emergency ? 'emergency' : 'routine');
        setUrgency(emergency ? 'critical' : 'low');
        setTitle(emergency ? 'URGENT: Emergency Care Required' : 'Weekly Routine Update');
        setNotes('');
        setWeight('');
        setFeedingNotes('');
        setMedicationNotes('');
        setNextAppointmentDate('');
        setShowUpdateModal(true);
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlacement) return;

        setSubmitting(true);
        const routeName = isAdmin
            ? `/account/admin/my-foster-pets/${selectedPlacement.id}/updates`
            : `/account/volunteer/foster-care/${selectedPlacement.id}/updates`;

        router.post(
            routeName,
            {
                update_type: updateType,
                urgency,
                title,
                notes,
                weight: weight || null,
                feeding_notes: feedingNotes || null,
                medication_notes: medicationNotes || null,
                next_appointment_date: nextAppointmentDate || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowUpdateModal(false);
                    toast.success(
                        isEmergency
                            ? 'Emergency alert transmitted to shelter coordinators.'
                            : 'Care update submitted successfully.',
                    );
                },
                onError: (errors) => {
                    toast.error(
                        Object.values(errors)[0] as string || 'Failed to submit care update.',
                    );
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <DashboardSectionPage
            title="My Foster Pets"
            description={
                isAdmin
                    ? 'Admin Caretaker Portal • Record routine observations, care logs, and medical notes for pets in your personal foster care.'
                    : 'Monitor, record care logs, and submit routine observations or emergency alerts for animals in your foster care.'
            }
            badge={
                <div className="flex flex-wrap items-center gap-2">
                    {isAdmin && (
                        <a
                            href="/account/admin/foster-management"
                            className="text-xs font-black text-paw-orange hover:bg-paw-orange/20 bg-paw-orange/10 px-3 py-2 rounded-xl transition-colors"
                        >
                            ← Manage Shelter Placements
                        </a>
                    )}
                    <DashboardMetricBadge
                        icon={<HeartHandshake className="h-4 w-4" />}
                        label={`${activePlacements.length} Active Foster ${activePlacements.length === 1 ? 'Pet' : 'Pets'}`}
                    />
                </div>
            }
        >
            {/* Foster Parent Status Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <DashboardCard className="p-4 border-l-4 border-l-paw-orange">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Foster Care Status</p>
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                            fosterParent?.status === 'approved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                        }`}>
                            {fosterParent?.status ?? 'Approved'}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Authorized Caretaker</p>
                </DashboardCard>

                <DashboardCard className="p-4 border-l-4 border-l-blue-500">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Caretaker Capacity</p>
                    <p className="mt-2 text-2xl font-black text-[#0B2340] dark:text-white">
                        {activePlacements.length} <span className="text-sm font-semibold text-gray-400">/ {fosterParent?.capacity ?? 2} slots</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {fosterParent ? `${fosterParent.remaining_capacity} available capacity` : 'Configured capacity'}
                    </p>
                </DashboardCard>

                <DashboardCard className="p-4 border-l-4 border-l-purple-500">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Past Placements</p>
                    <p className="mt-2 text-2xl font-black text-[#0B2340] dark:text-white">{historyPlacements.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Pets successfully cared for</p>
                </DashboardCard>

                <DashboardCard className="p-4 border-l-4 border-l-red-500 bg-red-50/40 dark:bg-red-950/20">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
                        <PhoneCall size={14} /> Shelter Emergency Line
                    </p>
                    <p className="mt-1 text-sm font-black text-[#0B2340] dark:text-white">(063) 221-4563</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">24/7 Veterinary hotline available</p>
                </DashboardCard>
            </div>

            {/* Navigation Tabs */}
            <div className="w-full overflow-x-auto scrollbar-thin">
                <div className="flex min-w-full flex-nowrap items-center border-b border-gray-200 dark:border-gray-800 gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('current')}
                        className={`shrink-0 pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer -mb-px ${
                            activeTab === 'current'
                                ? 'border-paw-orange text-paw-orange'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Current Active Placements ({activePlacements.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className={`shrink-0 pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer -mb-px ${
                            activeTab === 'history'
                                ? 'border-paw-orange text-paw-orange'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Placement History ({historyPlacements.length})
                    </button>
                </div>
            </div>

            {/* Current Active Placements */}
            {activeTab === 'current' && (
                <div className="space-y-6">
                    {activePlacements.length === 0 ? (
                        <DashboardCard className="p-12 text-center text-gray-500">
                            <HeartHandshake className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={54} />
                            <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">No Active Foster Placements</h3>
                            <p className="text-sm mt-1 max-w-md mx-auto text-gray-500">
                                You currently have no shelter pets assigned to your foster home. When shelter administrators assign a pet to your care, it will appear here with instructions and health guidelines.
                            </p>
                        </DashboardCard>
                    ) : (
                        activePlacements.map((placement) => {
                            const isExpanded = expandedPlacementId === placement.id;
                            const pet = placement.pet;

                            return (
                                <DashboardCard key={placement.id} className="overflow-hidden border border-gray-200 dark:border-gray-800">
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gray-200 dark:border-gray-700">
                                                    {pet?.photo_url ? (
                                                        <img
                                                            src={pet.photo_url}
                                                            alt={pet.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-paw-orange/10 text-paw-orange font-bold text-xl">
                                                            {pet?.name?.charAt(0) ?? 'P'}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-fredoka text-2xl font-bold text-[#0B2340] dark:text-white">
                                                            {pet?.name}
                                                        </h3>
                                                        <span className="bg-paw-orange/15 text-paw-orange text-xs font-black uppercase px-2.5 py-0.5 rounded-full">
                                                            {pet?.breed || pet?.type || 'Pet'}
                                                        </span>
                                                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                                            {placement.days_in_care} days in foster
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 font-semibold">
                                                        <span><strong>Age:</strong> {pet?.age || 'Unknown'}</span>
                                                        <span><strong>Gender:</strong> {pet?.gender || 'N/A'}</span>
                                                        <span><strong>Color:</strong> {pet?.color || 'N/A'}</span>
                                                        <span><strong>Vaccinated:</strong> {pet?.vaccinated ? 'Yes' : 'Pending'}</span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-bold">
                                                        <span className="flex items-center gap-1 text-gray-500">
                                                            <Calendar size={14} /> Placed on: {placement.start_date}
                                                        </span>
                                                        {placement.expected_review_date && (
                                                            <span className={`flex items-center gap-1 ${
                                                                placement.is_review_near_or_overdue ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'
                                                            }`}>
                                                                <Clock size={14} /> Review date: {placement.expected_review_date}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                                                <button
                                                    type="button"
                                                    onClick={() => openUpdateModal(placement, false)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-paw-orange text-white shadow-sm hover:bg-paw-orange/90 transition-colors"
                                                >
                                                    <Plus size={14} /> Submit Care Log
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openUpdateModal(placement, true)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 text-white shadow-sm hover:bg-red-700 transition-colors"
                                                >
                                                    <AlertTriangle size={14} /> Report Concern / Emergency
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedPlacementId(isExpanded ? null : placement.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    {isExpanded ? 'Hide Details' : 'View Details'}
                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Placement Details */}
                                        {isExpanded && (
                                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                                        <h4 className="text-xs font-black uppercase text-gray-500 flex items-center gap-1.5 mb-2">
                                                            <Utensils size={14} className="text-paw-orange" /> Care & Dietary Instructions
                                                        </h4>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                                            {placement.care_instructions || placement.dietary_requirements || 'Standard nutritional schedule and clean water at all times.'}
                                                        </p>
                                                    </div>

                                                    <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                                        <h4 className="text-xs font-black uppercase text-gray-500 flex items-center gap-1.5 mb-2">
                                                            <Pill size={14} className="text-red-500" /> Medical & Special Needs
                                                        </h4>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                                            {placement.medical_notes || placement.special_needs || 'No active medical restrictions recorded.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Care Logs Timeline */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-bold text-[#0B2340] dark:text-white flex items-center gap-2">
                                                            <Activity size={16} className="text-paw-orange" /> Recent Care Logs & Coordinator Responses
                                                        </h4>
                                                        <span className="text-xs text-gray-500 font-semibold">
                                                            {placement.recent_updates.length} updates logged
                                                        </span>
                                                    </div>

                                                    {placement.recent_updates.length === 0 ? (
                                                        <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl text-center text-xs text-gray-500">
                                                            No routine updates logged for this placement yet. Click "Submit Care Log" above to record feeding, weight, or daily milestones.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {placement.recent_updates.map((update) => (
                                                                <div
                                                                    key={update.id}
                                                                    className={`p-4 rounded-xl border ${
                                                                        update.urgency === 'critical' || update.urgency === 'high'
                                                                            ? 'border-red-200 bg-red-50/30 dark:border-red-900/40 dark:bg-red-950/10'
                                                                            : 'border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-900/40'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                                                update.urgency === 'critical'
                                                                                    ? 'bg-red-600 text-white'
                                                                                    : update.urgency === 'high'
                                                                                    ? 'bg-orange-500 text-white'
                                                                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                                            }`}>
                                                                                {update.update_type} • {update.urgency}
                                                                            </span>
                                                                            <h5 className="font-bold text-sm text-[#0B2340] dark:text-white">
                                                                                {update.title}
                                                                            </h5>
                                                                        </div>
                                                                        <span className="text-xs text-gray-400 font-medium">
                                                                            {update.created_at}
                                                                        </span>
                                                                    </div>

                                                                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">
                                                                        {update.notes}
                                                                    </p>

                                                                    {(update.weight || update.feeding_notes || update.medication_notes) && (
                                                                        <div className="mt-2.5 flex flex-wrap gap-4 text-[11px] text-gray-500 font-semibold border-t border-gray-200/60 dark:border-gray-800/60 pt-2">
                                                                            {update.weight && <span>Weight: <strong>{update.weight}</strong></span>}
                                                                            {update.feeding_notes && <span>Feeding: <strong>{update.feeding_notes}</strong></span>}
                                                                            {update.medication_notes && <span>Meds: <strong>{update.medication_notes}</strong></span>}
                                                                        </div>
                                                                    )}

                                                                    {update.admin_notes && (
                                                                        <div className="mt-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 p-3 rounded-lg">
                                                                            <p className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 mb-1">
                                                                                <CheckCircle2 size={13} /> Shelter Coordinator Feedback:
                                                                            </p>
                                                                            <p className="text-xs text-blue-800 dark:text-blue-200">
                                                                                {update.admin_notes}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </DashboardCard>
                            );
                        })
                    )}
                </div>
            )}

            {/* Placement History */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {historyPlacements.length === 0 ? (
                        <DashboardCard className="p-8 text-center text-gray-500 font-bold">
                            <Clock className="mx-auto mb-2 text-gray-300" size={36} />
                            <p className="text-sm">No historical foster placements on record.</p>
                        </DashboardCard>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {historyPlacements.map((hist) => (
                                <DashboardCard key={hist.id} className="p-4 border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700">
                                            {hist.pet?.photo_url ? (
                                                <img src={hist.pet.photo_url} alt={hist.pet.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center font-bold text-paw-orange">
                                                    {hist.pet?.name?.charAt(0) ?? 'P'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                                    {hist.pet?.name}
                                                </h4>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                                    hist.status === 'transferred' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {hist.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{hist.pet?.breed || hist.pet?.type}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {hist.start_date} → {hist.end_date || 'Concluded'}
                                            </p>
                                            {(hist.transfer_reason || hist.end_reason) && (
                                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                                                    "{hist.transfer_reason || hist.end_reason}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </DashboardCard>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Submit Routine Update or Report Emergency Concern */}
            {showUpdateModal && selectedPlacement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white flex items-center gap-2">
                                    {isEmergency ? (
                                        <>
                                            <AlertTriangle className="text-red-500" size={20} /> Report Concern / Emergency
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="text-paw-orange" size={20} /> Submit Foster Care Update
                                        </>
                                    )}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    For <strong>{selectedPlacement.pet?.name}</strong> (Placement #{selectedPlacement.id})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowUpdateModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Update Category
                                    </label>
                                    <select
                                        value={updateType}
                                        onChange={(e) => setUpdateType(e.target.value)}
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                    >
                                        <option value="routine">Routine Check-in</option>
                                        <option value="medical">Medical / Health</option>
                                        <option value="behavioral">Behavioral Observation</option>
                                        <option value="emergency">Emergency / Injury</option>
                                        <option value="milestone">Milestone / Progress</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Urgency Level
                                    </label>
                                    <select
                                        value={urgency}
                                        onChange={(e) => setUrgency(e.target.value)}
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                    >
                                        <option value="low">Low (Routine log)</option>
                                        <option value="medium">Medium (Requires attention)</option>
                                        <option value="high">High (Urgent coordinator review)</option>
                                        <option value="critical">Critical (Immediate veterinary triage)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Subject / Summary Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Eating well, gaining weight, lethargy..."
                                    className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Observations & Detailed Notes *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Describe current condition, appetite, activity level, stool consistency, behavior, or symptoms..."
                                    className="w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Current Weight (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder="e.g. 4.5 kg"
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <ModernDatePicker
                                        label="Next Vet / Check-up Date"
                                        value={nextAppointmentDate}
                                        onChange={(date) => setNextAppointmentDate(date)}
                                        placeholder="Select appointment date..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Feeding & Medication Administered
                                </label>
                                <input
                                    type="text"
                                    value={feedingNotes}
                                    onChange={(e) => setFeedingNotes(e.target.value)}
                                    placeholder="e.g. 2 scoops dry food, antibiotic 50mg given with food"
                                    className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white"
                                />
                            </div>

                            {isEmergency && (
                                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-xs">
                                    <p className="font-bold flex items-center gap-1">
                                        <AlertTriangle size={14} /> Immediate Notice:
                                    </p>
                                    <p className="mt-0.5">
                                        Submitting this concern will notify all shelter administrators on duty. For severe distress, please immediately transport the pet to our partner clinic.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowUpdateModal(false)}
                                    className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-sm transition-colors ${
                                        isEmergency
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-paw-orange hover:bg-paw-orange/90'
                                    }`}
                                >
                                    {submitting ? 'Submitting...' : isEmergency ? 'Transmit Alert' : 'Submit Care Log'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardSectionPage>
    );
}

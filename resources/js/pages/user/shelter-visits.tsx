import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    Clock,
    Users,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Copy,
    Check,
    Plus,
    Sparkles,
    Heart,
    MessageSquareText,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatPillLabel } from '@/lib/utils';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import {
    ShelterVisitModal,
    type ShelterVisitSettings,
} from '@/components/adoption/shelter-visit-modal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useConfirmationModal } from '@/hooks/use-confirmation-modal';

interface ShelterVisitItem {
    id: number;
    full_name: string;
    contact_number: string;
    email: string;
    preferred_date: string;
    preferred_time_slot?: string | null;
    confirmed_date?: string | null;
    confirmed_time_slot?: string | null;
    number_of_visitors: number;
    purpose: string;
    additional_notes?: string | null;
    admin_notes?: string | null;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    created_at: string;
    shelter_animal?: {
        id: number;
        name: string;
        type?: string;
        breed?: string;
        photo_url?: string | null;
    } | null;
}

interface UserShelterVisitsProps {
    visits: ShelterVisitItem[];
    shelterVisitSettings?: ShelterVisitSettings;
}

export default function UserShelterVisits({
    visits = [],
    shelterVisitSettings,
}: UserShelterVisitsProps) {
    const { confirmModalProps, openConfirmModal } = useConfirmationModal();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const pendingCount = visits.filter((v) => v.status === 'pending').length;
    const confirmedCount = visits.filter((v) => v.status === 'confirmed').length;
    const completedCount = visits.filter((v) => v.status === 'completed').length;

    const filteredVisits = visits.filter((v) =>
        statusFilter === 'all' ? true : v.status === statusFilter,
    );

    const formatRef = (id: number) => `VIS-${String(id).padStart(5, '0')}`;

    const handleCopyRef = (id: number) => {
        const ref = formatRef(id);
        navigator.clipboard.writeText(ref);
        setCopiedId(id);
        toast.success(`Copied ${ref} to clipboard`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCancelVisit = (visit: ShelterVisitItem) => {
        const ref = formatRef(visit.id);
        openConfirmModal({
            title: 'Cancel Shelter Visit Request',
            description: `Are you sure you want to cancel your shelter visit request (${ref})?`,
            confirmText: 'Cancel Visit',
            variant: 'danger',
            onConfirm: () => {
                setCancellingId(visit.id);
                router.post(
                    `/account/user/shelter-visits/${visit.id}/cancel`,
                    {},
                    {
                        preserveScroll: true,
                        onFinish: () => setCancellingId(null),
                    },
                );
            },
        });
    };

    const getStatusBadge = (status: ShelterVisitItem['status']) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
                        <Clock size={12} /> Awaiting Confirmation
                    </span>
                );
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 size={12} /> Confirmed Schedule
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
                        <Sparkles size={12} /> Visit Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300">
                        <XCircle size={12} /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {formatPillLabel(status)}
                    </span>
                );
        }
    };

    return (
        <DashboardSectionPage
            title="My Shelter Visits"
            description="Manage your scheduled sanctuary visits, view confirmed time slots, and read coordinator updates."
            badge={
                <div className="flex flex-row items-center gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                    <DashboardMetricBadge
                        icon={<Building2 className="h-4 w-4" />}
                        label={`${pendingCount + confirmedCount} Active`}
                    />
                    <button
                        type="button"
                        onClick={() => setIsVisitModalOpen(true)}
                        className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-orange-500 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-600 cursor-pointer shrink-0"
                    >
                        <Plus size={16} /> Schedule Shelter Visit
                    </button>
                </div>
            }
        >
            {/* Summary Metrics */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-[#1E293B] dark:bg-[#111827]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        Total Requests
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{visits.length}</p>
                </div>
                <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-4 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/25">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        Pending Review
                    </p>
                    <p className="mt-1 text-2xl font-black text-amber-900 dark:text-amber-200">{pendingCount}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/25">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Confirmed Slots
                    </p>
                    <p className="mt-1 text-2xl font-black text-emerald-900 dark:text-emerald-200">{confirmedCount}</p>
                </div>
                <div className="rounded-2xl border border-blue-200/70 bg-blue-50/40 p-4 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/25">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                        Completed
                    </p>
                    <p className="mt-1 text-2xl font-black text-blue-900 dark:text-blue-200">{completedCount}</p>
                </div>
            </div>

            {/* Status Filter Pills */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
                {[
                    { key: 'all', label: 'All Visits', count: visits.length },
                    { key: 'pending', label: 'Pending', count: pendingCount },
                    { key: 'confirmed', label: 'Confirmed', count: confirmedCount },
                    { key: 'completed', label: 'Completed', count: completedCount },
                    {
                        key: 'cancelled',
                        label: 'Cancelled',
                        count: visits.filter((v) => v.status === 'cancelled').length,
                    },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setStatusFilter(tab.key)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                            statusFilter === tab.key
                                ? 'bg-slate-900 text-white shadow-xs dark:bg-paw-orange dark:text-white'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        {tab.label}
                        <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                statusFilter === tab.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                        >
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Visits List */}
            {filteredVisits.length === 0 ? (
                <DashboardCard className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-orange-500 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-400">
                        <Building2 className="h-8 w-8" />
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-slate-800 dark:text-white">
                        {visits.length === 0
                            ? 'No Shelter Visits Scheduled Yet'
                            : 'No Visits Matching This Filter'}
                    </h3>
                    <p className="mx-auto mb-6 max-w-md text-sm text-slate-500 dark:text-slate-400">
                        {visits.length === 0
                            ? 'Want to meet our rescued dogs and cats in person or drop off supplies? Book a shelter visit and track your confirmation right here.'
                            : 'Try switching to another status filter to view your other shelter visit records.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsVisitModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-colors hover:bg-orange-600 cursor-pointer"
                    >
                        <Calendar size={16} /> Book a Shelter Visit
                    </button>
                </DashboardCard>
            ) : (
                <div className="space-y-4">
                    {filteredVisits.map((visit) => {
                        const ref = formatRef(visit.id);
                        const effectiveDate = visit.confirmed_date || visit.preferred_date;
                        const effectiveSlot =
                            visit.confirmed_time_slot ||
                            visit.preferred_time_slot ||
                            'Standard Visiting Hours (9:00 AM – 5:00 PM)';
                        const canCancel =
                            visit.status === 'pending' || visit.status === 'confirmed';

                        return (
                            <DashboardCard key={visit.id} className="p-5 sm:p-6">
                                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center dark:border-slate-800">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => handleCopyRef(visit.id)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-bold text-slate-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-700 dark:hover:bg-orange-950/30 dark:hover:text-orange-300"
                                            title="Click to copy reference number"
                                        >
                                            {ref}
                                            {copiedId === visit.id ? (
                                                <Check size={12} className="text-emerald-600" />
                                            ) : (
                                                <Copy size={12} className="text-slate-400" />
                                            )}
                                        </button>
                                        <span className="text-xs font-medium text-slate-400">
                                            Requested on{' '}
                                            {new Date(visit.created_at).toLocaleDateString(
                                                'en-US',
                                                {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                },
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(visit.status)}
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                                        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            <Calendar size={13} className="text-orange-500" />
                                            {visit.confirmed_date
                                                ? 'Confirmed Visit Date'
                                                : 'Preferred Visit Date'}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                                            {effectiveDate
                                                ? new Date(effectiveDate).toLocaleDateString(
                                                      'en-US',
                                                      {
                                                          weekday: 'short',
                                                          month: 'short',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                      },
                                                  )
                                                : 'To be coordinated'}
                                        </p>
                                        {visit.confirmed_date &&
                                            visit.confirmed_date !== visit.preferred_date && (
                                                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                    Originally requested:{' '}
                                                    {new Date(
                                                        visit.preferred_date,
                                                    ).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            )}
                                    </div>

                                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                                        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            <Clock size={13} className="text-orange-500" />
                                            {visit.confirmed_time_slot
                                                ? 'Confirmed Time Slot'
                                                : 'Preferred Time Slot'}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                                            {effectiveSlot}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                                        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            <Users size={13} className="text-orange-500" />
                                            Purpose & Group Size
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                                            {visit.purpose}
                                        </p>
                                        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {visit.number_of_visitors}{' '}
                                            {visit.number_of_visitors === 1
                                                ? 'visitor'
                                                : 'visitors'}
                                        </p>
                                    </div>
                                </div>

                                {visit.shelter_animal && (
                                    <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-orange-100 bg-orange-50/50 px-3.5 py-2.5 text-xs text-orange-950 dark:border-orange-900/40 dark:bg-orange-950/25 dark:text-orange-200">
                                        <Heart
                                            size={14}
                                            className="shrink-0 text-orange-500"
                                        />
                                        <span>
                                            Animal of Interest:{' '}
                                            <strong className="font-bold">
                                                {visit.shelter_animal.name}
                                            </strong>
                                            {visit.shelter_animal.breed
                                                ? ` (${visit.shelter_animal.breed})`
                                                : ''}
                                        </span>
                                    </div>
                                )}

                                {visit.additional_notes && (
                                    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                                        <span className="font-bold text-slate-700 dark:text-slate-200">
                                            Your Note:{' '}
                                        </span>
                                        {visit.additional_notes}
                                    </div>
                                )}

                                {visit.admin_notes && (
                                    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50/70 p-3.5 text-xs text-sky-950 dark:border-sky-800/50 dark:bg-sky-950/30 dark:text-sky-200">
                                        <MessageSquareText
                                            size={15}
                                            className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400"
                                        />
                                        <div>
                                            <p className="font-bold text-sky-900 dark:text-sky-200">
                                                Shelter Coordinator Note
                                            </p>
                                            <p className="mt-0.5 text-sky-800 dark:text-sky-300 leading-relaxed">
                                                {visit.admin_notes}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {visit.status === 'confirmed' && (
                                    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                                        <CheckCircle2
                                            size={15}
                                            className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                                        />
                                        <div>
                                            <p className="font-bold text-emerald-900 dark:text-emerald-200">
                                                Your Visit is Confirmed!
                                            </p>
                                            <p className="mt-0.5 text-emerald-800 dark:text-emerald-300 leading-relaxed">
                                                Please present your reference code{' '}
                                                <strong>{ref}</strong> upon arrival at the
                                                Iligan Stray Feeders Sanctuary (Purok 13,
                                                Kiwalan, Iligan City).
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {canCancel && (
                                    <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3 dark:border-slate-800">
                                        <button
                                            type="button"
                                            disabled={cancellingId === visit.id}
                                            onClick={() => handleCancelVisit(visit)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 cursor-pointer dark:border-rose-800/60 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                        >
                                            <XCircle size={13} />
                                            {cancellingId === visit.id
                                                ? 'Cancelling...'
                                                : 'Cancel Visit Request'}
                                        </button>
                                    </div>
                                )}
                            </DashboardCard>
                        );
                    })}
                </div>
            )}

            <ShelterVisitModal
                isOpen={isVisitModalOpen}
                onClose={() => setIsVisitModalOpen(false)}
                settings={shelterVisitSettings}
            />

            <ConfirmationModal {...confirmModalProps} />
        </DashboardSectionPage>
    );
}

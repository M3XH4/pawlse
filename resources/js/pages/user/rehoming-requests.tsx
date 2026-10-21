import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    RefreshCw,
    Clock,
    CheckCircle2,
    XCircle,
    MapPin,
    Copy,
    Check,
    Plus,
    Heart,
    Stethoscope,
    MessageSquareText,
    Share2,
    Home,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { RehomingModal } from '@/components/adoption/rehoming-modal';

interface RehomingRequestItem {
    id: number;
    full_name: string;
    contact_number: string;
    email: string;
    animal_name: string;
    species: string;
    breed?: string | null;
    gender: string;
    age?: string | null;
    current_location: string;
    reason: string;
    health_notes?: string | null;
    description?: string | null;
    photo_url?: string | null;
    status: 'pending' | 'reviewed' | 'posted' | 'shelter_intake' | 'home_found' | 'declined';
    admin_notes?: string | null;
    created_at: string;
}

interface UserRehomingRequestsProps {
    rehomingRequests: RehomingRequestItem[];
}

export default function UserRehomingRequests({
    rehomingRequests = [],
}: UserRehomingRequestsProps) {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isRehomingModalOpen, setIsRehomingModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

    const pendingCount = rehomingRequests.filter((r) => r.status === 'pending').length;
    const activeScreeningCount = rehomingRequests.filter(
        (r) => r.status === 'reviewed' || r.status === 'posted',
    ).length;
    const placedCount = rehomingRequests.filter(
        (r) => r.status === 'shelter_intake' || r.status === 'home_found',
    ).length;

    const filteredRequests = rehomingRequests.filter((r) =>
        statusFilter === 'all' ? true : r.status === statusFilter,
    );

    const formatRef = (id: number) => `REH-${String(id).padStart(5, '0')}`;

    const handleCopyRef = (id: number) => {
        const ref = formatRef(id);
        navigator.clipboard.writeText(ref);
        setCopiedId(id);
        toast.success(`Copied ${ref} to clipboard`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleWithdrawRequest = (req: RehomingRequestItem) => {
        const ref = formatRef(req.id);
        if (
            !window.confirm(
                `Are you sure you want to withdraw your rehoming request (${ref}) for ${req.animal_name}?`,
            )
        ) {
            return;
        }

        setWithdrawingId(req.id);
        router.post(
            `/account/user/rehoming-requests/${req.id}/cancel`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setWithdrawingId(null),
            },
        );
    };

    const getStatusBadge = (status: RehomingRequestItem['status']) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                        <Clock size={12} /> Under Shelter Review
                    </span>
                );
            case 'reviewed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        <CheckCircle2 size={12} /> Reviewed by Coordinators
                    </span>
                );
            case 'posted':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        <Share2 size={12} /> Cross-Posted to Community
                    </span>
                );
            case 'shelter_intake':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <Home size={12} /> Admitted to Shelter Sanctuary
                    </span>
                );
            case 'home_found':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <Heart size={12} /> Permanent Home Found
                    </span>
                );
            case 'declined':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                        <XCircle size={12} /> Declined
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                        {status}
                    </span>
                );
        }
    };

    return (
        <DashboardSectionPage
            title="My Rehoming Requests"
            description="Track your community pet rehoming assistance requests, social cross-postings, and shelter intake updates."
            badge={
                <div className="flex flex-row items-center gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                    <DashboardMetricBadge
                        icon={<RefreshCw className="h-4 w-4" />}
                        label={`${pendingCount + activeScreeningCount} Active`}
                    />
                    <button
                        type="button"
                        onClick={() => setIsRehomingModalOpen(true)}
                        className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-sky-600 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-sky-700 cursor-pointer shrink-0"
                    >
                        <Plus size={16} /> Request Rehoming Assistance
                    </button>
                </div>
            }
        >
            {/* Summary Metrics */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Total Requests
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900">
                        {rehomingRequests.length}
                    </p>
                </div>
                <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-4 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                        Under Evaluation
                    </p>
                    <p className="mt-1 text-2xl font-black text-amber-900">{pendingCount}</p>
                </div>
                <div className="rounded-2xl border border-blue-200/70 bg-blue-50/40 p-4 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                        Reviewed / Posted
                    </p>
                    <p className="mt-1 text-2xl font-black text-blue-900">
                        {activeScreeningCount}
                    </p>
                </div>
                <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                        Safe Placement / Intake
                    </p>
                    <p className="mt-1 text-2xl font-black text-emerald-900">{placedCount}</p>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
                {[
                    { key: 'all', label: 'All Requests', count: rehomingRequests.length },
                    { key: 'pending', label: 'Pending', count: pendingCount },
                    {
                        key: 'reviewed',
                        label: 'Reviewed',
                        count: rehomingRequests.filter((r) => r.status === 'reviewed').length,
                    },
                    {
                        key: 'posted',
                        label: 'Cross-Posted',
                        count: rehomingRequests.filter((r) => r.status === 'posted').length,
                    },
                    {
                        key: 'shelter_intake',
                        label: 'Shelter Intake',
                        count: rehomingRequests.filter((r) => r.status === 'shelter_intake')
                            .length,
                    },
                    {
                        key: 'home_found',
                        label: 'Home Found',
                        count: rehomingRequests.filter((r) => r.status === 'home_found').length,
                    },
                    {
                        key: 'declined',
                        label: 'Declined',
                        count: rehomingRequests.filter((r) => r.status === 'declined').length,
                    },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setStatusFilter(tab.key)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                            statusFilter === tab.key
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {tab.label}
                        <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                statusFilter === tab.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <DashboardCard className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-600">
                        <RefreshCw className="h-8 w-8" />
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-slate-800">
                        {rehomingRequests.length === 0
                            ? 'No Rehoming Requests Submitted Yet'
                            : 'No Requests Matching This Filter'}
                    </h3>
                    <p className="mx-auto mb-6 max-w-md text-sm text-slate-500">
                        {rehomingRequests.length === 0
                            ? 'Need help finding a safe, screened adoptive family for a pet in your care? Submit a rehoming assistance request and monitor its progress here.'
                            : 'Try switching to another status filter to view your other rehoming requests.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsRehomingModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition-colors hover:bg-sky-700 cursor-pointer"
                    >
                        <RefreshCw size={16} /> Request Rehoming Assistance
                    </button>
                </DashboardCard>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((req) => {
                        const ref = formatRef(req.id);

                        return (
                            <DashboardCard key={req.id} className="p-5 sm:p-6">
                                <div className="flex flex-col gap-5 sm:flex-row">
                                    {/* Pet Image */}
                                    <div className="h-36 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 sm:h-36 sm:w-36">
                                        {req.photo_url ? (
                                            <ImageWithFallback
                                                src={req.photo_url}
                                                alt={req.animal_name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                                                <Heart size={28} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-start">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-extrabold text-slate-900">
                                                        {req.animal_name}
                                                    </h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyRef(req.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 cursor-pointer"
                                                        title="Click to copy reference number"
                                                    >
                                                        {ref}
                                                        {copiedId === req.id ? (
                                                            <Check
                                                                size={11}
                                                                className="text-emerald-600"
                                                            />
                                                        ) : (
                                                            <Copy
                                                                size={11}
                                                                className="text-slate-400"
                                                            />
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                                    {req.species}
                                                    {req.breed ? ` • ${req.breed}` : ''} •{' '}
                                                    {req.gender}
                                                    {req.age ? ` • ${req.age}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(req.status)}
                                            </div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <MapPin
                                                    size={14}
                                                    className="shrink-0 text-sky-600"
                                                />
                                                <span>
                                                    <strong className="text-slate-700">
                                                        Location:
                                                    </strong>{' '}
                                                    {req.current_location}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Clock
                                                    size={14}
                                                    className="shrink-0 text-sky-600"
                                                />
                                                <span>
                                                    <strong className="text-slate-700">
                                                        Reason:
                                                    </strong>{' '}
                                                    {req.reason}
                                                </span>
                                            </div>
                                        </div>

                                        {req.health_notes && (
                                            <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs text-slate-600">
                                                <Stethoscope
                                                    size={14}
                                                    className="mt-0.5 shrink-0 text-emerald-600"
                                                />
                                                <span>
                                                    <strong className="text-slate-700">
                                                        Health / Vaccines:
                                                    </strong>{' '}
                                                    {req.health_notes}
                                                </span>
                                            </div>
                                        )}

                                        {req.admin_notes && (
                                            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-xs text-sky-950">
                                                <MessageSquareText
                                                    size={15}
                                                    className="mt-0.5 shrink-0 text-sky-600"
                                                />
                                                <div>
                                                    <p className="font-bold text-sky-900">
                                                        Shelter Coordinator Update
                                                    </p>
                                                    <p className="mt-0.5 text-sky-800 leading-relaxed">
                                                        {req.admin_notes}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                                            <span className="text-[11px] font-medium text-slate-400">
                                                Submitted on{' '}
                                                {new Date(req.created_at).toLocaleDateString(
                                                    'en-US',
                                                    {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    },
                                                )}
                                            </span>

                                            {req.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    disabled={withdrawingId === req.id}
                                                    onClick={() => handleWithdrawRequest(req)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
                                                >
                                                    <XCircle size={13} />
                                                    {withdrawingId === req.id
                                                        ? 'Withdrawing...'
                                                        : 'Withdraw Request'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </DashboardCard>
                        );
                    })}
                </div>
            )}

            <RehomingModal
                isOpen={isRehomingModalOpen}
                onClose={() => setIsRehomingModalOpen(false)}
            />
        </DashboardSectionPage>
    );
}

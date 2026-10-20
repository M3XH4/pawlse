import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Gift, Heart, Calendar, Search, Filter, HelpCircle, EyeOff, ShieldCheck, CreditCard, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { SubmissionReceipt } from '@/components/donation/submission-receipt';

interface DonationRecord {
    id: number;
    public_reference: string;
    type: string;
    amount: number | null;
    currency: string;
    status: string;
    purpose: string | null;
    anonymous: boolean;
    created_at: string;
    in_kind_donation?: {
        description: string;
        quantity: string | null;
        drop_off_date: string | null;
    } | null;
    payments?: Array<{
        method: string;
        provider: string;
        status: string;
    }>;
}

interface UserDonationsProps {
    donations: {
        data: DonationRecord[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
    };
    filters: {
        search?: string;
        type?: string;
        status?: string;
    };
    stats: {
        totalCash: number;
        inKindCount: number;
        totalCount: number;
    };
}

export default function UserDonations({ donations, filters, stats }: UserDonationsProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedReceiptDonation, setSelectedReceiptDonation] = useState<DonationRecord | null>(null);

    // Debounce search term and submit filter queries
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                applyFilters();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const applyFilters = (typeOverride?: string, statusOverride?: string) => {
        router.get(
            '/account/user/donations',
            {
                search: searchTerm || undefined,
                type: typeOverride !== undefined ? typeOverride : selectedType || undefined,
                status: statusOverride !== undefined ? statusOverride : selectedStatus || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedType(val);
        applyFilters(val, undefined);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedStatus(val);
        applyFilters(undefined, val);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'verified':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'pending_payment':
            case 'pending_verification':
            case 'scheduled':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            case 'rejected':
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const formatType = (type: string) => {
        switch (type) {
            case 'cash':
                return 'Cash';
            case 'in_kind':
                return 'In-Kind';
            case 'feeding_sponsorship':
                return 'Sponsor Feeding';
            default:
                return type;
        }
    };

    return (
        <DashboardSectionPage
            title="My Donations"
            description="View your monetary and in-kind contribution history supporting animal rescues."
            badge={<DashboardMetricBadge icon={<Gift className="h-4 w-4" />} label={`${stats.totalCount} Contributions`} />}
        >
            {/* Stats Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <DashboardCard className="flex items-center gap-4">
                    <div className="p-4 bg-paw-orange/10 rounded-2xl text-paw-orange shrink-0">
                        <Heart size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Cash Donated</p>
                        <p className="text-2xl font-black text-[#0B2340] dark:text-white mt-0.5">
                            ₱{stats.totalCash.toLocaleString()}
                        </p>
                    </div>
                </DashboardCard>

                <DashboardCard className="flex items-center gap-4">
                    <div className="p-4 bg-paw-blue/10 rounded-2xl text-paw-blue shrink-0">
                        <Gift size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">In-Kind Drop-offs</p>
                        <p className="text-2xl font-black text-[#0B2340] dark:text-white mt-0.5">
                            {stats.inKindCount} Items
                        </p>
                    </div>
                </DashboardCard>

                <DashboardCard className="flex items-center gap-4">
                    <div className="p-4 bg-paw-green/10 rounded-2xl text-paw-green shrink-0">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Donor Standing</p>
                        <p className="text-2xl font-black text-[#0B2340] dark:text-white mt-0.5">
                            Verified Supporter
                        </p>
                    </div>
                </DashboardCard>
            </div>

            {/* Filter Section */}
            <DashboardCard className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-450 h-4 w-4" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Reference, Purpose or Donor name..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-250 dark:border-gray-800 bg-transparent rounded-xl text-sm outline-none focus:border-paw-orange font-bold text-[#0B2340] dark:text-white"
                        />
                    </div>

                    {/* Filter Type & Status */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <select
                                value={selectedType}
                                onChange={handleTypeChange}
                                className="w-full pl-3 pr-8 py-2 border border-gray-255 dark:border-gray-800 bg-white dark:bg-[#111827] rounded-xl text-sm font-bold outline-none focus:border-paw-orange appearance-none text-[#0B2340] dark:text-white min-w-[130px]"
                            >
                                <option value="">All Types</option>
                                <option value="cash">Cash</option>
                                <option value="in_kind">In-Kind</option>
                                <option value="feeding_sponsorship">Sponsor Feeding</option>
                            </select>
                            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Filter Status */}
                        <div className="relative flex-1 sm:flex-none">
                            <select
                                value={selectedStatus}
                                onChange={handleStatusChange}
                                className="w-full pl-3 pr-8 py-2 border border-gray-255 dark:border-gray-800 bg-white dark:bg-[#111827] rounded-xl text-sm font-bold outline-none focus:border-paw-orange appearance-none text-[#0B2340] dark:text-white min-w-[130px]"
                            >
                                <option value="">All Statuses</option>
                                <option value="completed">Completed</option>
                                <option value="verified">Verified</option>
                                <option value="pending_payment">Pending Payment</option>
                                <option value="pending_verification">Pending Verify</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="rejected">Rejected</option>
                                <option value="failed">Failed</option>
                            </select>
                            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </DashboardCard>

            {/* Donation List Card */}
            <DashboardCard className="p-0 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Reference</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Privacy</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">E-Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                            {donations.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-450 font-bold">
                                        No donations matched your search or filters.
                                    </td>
                                </tr>
                            ) : (
                                donations.data.map((donation) => (
                                    <tr key={donation.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-500 whitespace-nowrap">
                                            {new Date(donation.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 font-black text-[#0B2340] dark:text-white whitespace-nowrap">
                                            {donation.public_reference}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-paw-navy dark:text-[#CBD5E1]">
                                            <span className="flex items-center gap-1.5">
                                                {donation.type === 'cash' ? <CreditCard size={14} className="text-green-500" /> : <Gift size={14} className="text-paw-orange" />}
                                                {formatType(donation.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                            {donation.type === 'in_kind' && donation.in_kind_donation ? (
                                                donation.in_kind_donation.description
                                            ) : (
                                                donation.purpose || 'General Support'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-black text-paw-orange text-base whitespace-nowrap">
                                            {donation.type === 'in_kind' && donation.in_kind_donation ? (
                                                donation.in_kind_donation.quantity || '1 unit'
                                            ) : (
                                                `₱${Number(donation.amount || 0).toLocaleString()}`
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {donation.anonymous ? (
                                                <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 text-xs font-black px-2.5 py-1 rounded-full">
                                                    <EyeOff size={12} />
                                                    Anonymous
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400">Public</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-block text-xs font-black px-2.5 py-1 rounded-full capitalize ${getStatusColor(donation.status)}`}>
                                                {donation.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedReceiptDonation(donation)}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-paw-orange/10 px-3 py-1.5 text-xs font-black text-paw-orange transition-colors hover:bg-paw-orange hover:text-white cursor-pointer"
                                            >
                                                <FileText size={13} />
                                                View Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                    {donations.data.length === 0 ? (
                        <div className="text-center py-12 px-4 text-gray-450 font-bold">
                            No donations matched your search or filters.
                        </div>
                    ) : (
                        donations.data.map((donation) => (
                            <div key={donation.id} className="p-4 space-y-2.5 hover:bg-gray-50/30 dark:hover:bg-gray-900/5 transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="font-black text-sm text-[#0B2340] dark:text-white">
                                            {donation.public_reference}
                                        </span>
                                        <p className="text-xs font-bold text-gray-400 mt-0.5">
                                            {new Date(donation.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    <span className={`inline-block text-[10px] font-black px-2.5 py-1 rounded-full capitalize ${getStatusColor(donation.status)}`}>
                                        {donation.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-paw-navy dark:text-[#CBD5E1]">
                                            {donation.type === 'cash' ? <CreditCard size={13} className="text-green-500" /> : <Gift size={13} className="text-paw-orange" />}
                                            {formatType(donation.type)}
                                        </span>

                                        <span className="font-black text-paw-orange text-sm">
                                            {donation.type === 'in_kind' && donation.in_kind_donation ? (
                                                donation.in_kind_donation.quantity || '1 unit'
                                            ) : (
                                                `₱${Number(donation.amount || 0).toLocaleString()}`
                                            )}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                        {donation.type === 'in_kind' && donation.in_kind_donation ? (
                                            donation.in_kind_donation.description
                                        ) : (
                                            donation.purpose || 'General Support'
                                        )}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-xs pt-0.5">
                                    <span className="text-gray-400 font-medium">Privacy:</span>
                                    {donation.anonymous ? (
                                        <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                                            <EyeOff size={11} />
                                            Anonymous
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-gray-500">Public Donor</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {donations.total > 0 && donations.links.length > 3 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                        <span className="text-xs font-bold text-gray-450">
                            Showing {donations.data.length} of {donations.total} records
                        </span>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
                            {donations.links.map((link, idx) => {
                                // Skip prev/next labels translation details and render icon
                                const isPrev = link.label.includes('Previous');
                                const isNext = link.label.includes('Next');
                                
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        onClick={(e) => {
                                            if (!link.url) e.preventDefault();
                                        }}
                                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center border min-w-8 min-h-8 ${
                                            link.active
                                                ? 'bg-paw-orange text-white border-paw-orange shadow-md shadow-paw-orange/10'
                                                : link.url
                                                    ? 'bg-white dark:bg-[#111827] text-gray-600 dark:text-gray-300 border-gray-250 dark:border-gray-800 hover:border-paw-orange'
                                                    : 'bg-gray-100 dark:bg-gray-900 text-gray-400 border-transparent cursor-not-allowed'
                                        }`}
                                    >
                                        {isPrev ? <ChevronLeft size={14} /> : isNext ? <ChevronRight size={14} /> : link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </DashboardCard>

            {selectedReceiptDonation && (
                <SubmissionReceipt
                    isOpen={Boolean(selectedReceiptDonation)}
                    onClose={() => setSelectedReceiptDonation(null)}
                    title={
                        selectedReceiptDonation.status === 'completed' || selectedReceiptDonation.status === 'verified'
                            ? 'Hope you know you saved a life today!'
                            : 'Official Contribution E-Receipt'
                    }
                    subtitle={`${formatType(selectedReceiptDonation.type)} Contribution • Iligan Stray Feeders`}
                    referenceNumber={selectedReceiptDonation.public_reference}
                    type={
                        selectedReceiptDonation.status === 'completed' || selectedReceiptDonation.status === 'verified'
                            ? 'success'
                            : 'warning'
                    }
                    highlightLabel={selectedReceiptDonation.type === 'in_kind' ? 'Pledged Supplies' : 'Total Contributed'}
                    highlightValue={
                        selectedReceiptDonation.type === 'in_kind' && selectedReceiptDonation.in_kind_donation
                            ? selectedReceiptDonation.in_kind_donation.quantity || '1 unit'
                            : `₱${Number(selectedReceiptDonation.amount || 0).toLocaleString()}`
                    }
                    items={[
                        { label: 'Reference Number', value: selectedReceiptDonation.public_reference },
                        { label: 'Contribution Type', value: formatType(selectedReceiptDonation.type) },
                        {
                            label: selectedReceiptDonation.type === 'in_kind' ? 'Supplies / Quantity' : 'Amount Contributed',
                            value:
                                selectedReceiptDonation.type === 'in_kind' && selectedReceiptDonation.in_kind_donation
                                    ? `${selectedReceiptDonation.in_kind_donation.description} (${selectedReceiptDonation.in_kind_donation.quantity || '1 unit'})`
                                    : `₱${Number(selectedReceiptDonation.amount || 0).toLocaleString()}`,
                        },
                        {
                            label: 'Designated Purpose',
                            value:
                                selectedReceiptDonation.type === 'in_kind' && selectedReceiptDonation.in_kind_donation
                                    ? selectedReceiptDonation.in_kind_donation.description
                                    : selectedReceiptDonation.purpose || 'Veterinary care, rescue operations, and stray feeding support',
                        },
                        { label: 'Status', value: selectedReceiptDonation.status.replace('_', ' ').toUpperCase() },
                        { label: 'Privacy', value: selectedReceiptDonation.anonymous ? 'Anonymous Supporter' : 'Public Supporter' },
                    ]}
                    issuedAt={new Date(selectedReceiptDonation.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                    })}
                    footerMessage="Thank you for supporting Iligan Stray Feeders! This official receipt is logged in the PAWLSE Transparency Ledger."
                />
            )}
        </DashboardSectionPage>
    );
}

import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { 
    Heart, CreditCard, Gift, Users, Check, ArrowRight, ShieldCheck, X, 
    Copy, CheckCircle2, Smartphone, Filter, Calendar, Download, FileText, 
    TrendingUp, Plus, Upload, Clock, AlertCircle, Search, ChevronLeft, 
    ChevronRight, ArrowUpDown, RefreshCw, Layers, Boxes, Package, 
    AlertTriangle, CalendarDays, Edit2, Trash2, ShieldAlert, Sparkles,
    Eye, MapPin, XCircle, Printer, ExternalLink, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface DonationRecord {
    id: number;
    public_reference: string;
    donor_name: string;
    donor_email: string;
    donor_mobile: string | null;
    anonymous: boolean;
    type: string;
    amount: number | null;
    currency?: string;
    status: string;
    purpose: string | null;
    notes?: string | null;
    rejection_reason?: string | null;
    verified_at?: string | null;
    verified_by?: {
        name: string;
    } | null;
    created_at: string;
    in_kind_donation?: {
        description: string;
        quantity: string | null;
        drop_off_date: string | null;
        contact_person?: string | null;
        status?: string | null;
        need?: {
            item: string;
            animal?: {
                name: string;
            };
        } | null;
    } | null;
    payments?: Array<{
        method: string;
        provider: string;
        status: string;
        payment_reference: string | null;
        provider_transaction_id: string | null;
        amount?: number;
        proof?: {
            path: string;
            disk: string;
            original_filename: string;
        } | null;
    }>;
    proofs?: Array<{
        path: string;
        disk: string;
        original_filename: string;
    }>;
    feeding_sponsorship?: {
        preferred_date: string;
        occasion: string | null;
        message: string | null;
    } | null;
}

interface InventoryBatchData {
    id: number;
    batch_number: string;
    quantity: number;
    initial_quantity: number;
    expires_at: string | null;
    received_at: string | null;
    source: string | null;
    notes: string | null;
    status: 'good' | 'depleted' | 'expiring_soon' | 'expired';
    days_remaining: number | null;
}

interface InventoryItemData {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    category: string;
    min_threshold: number;
    storage_location: string | null;
    has_expiry: boolean;
    stock_status: 'in_stock' | 'low_stock' | 'expiring_soon' | 'expired' | 'out_of_stock';
    nearest_expiry: string | null;
    active_batches_count: number;
    expired_batches_count: number;
    expiring_soon_count: number;
    batches: InventoryBatchData[];
}

interface InventoryLog {
    id: number;
    item_name: string;
    category: string;
    action: string;
    quantity_changed: number;
    resulting_quantity: number;
    unit: string;
    reason: string | null;
    batch_info: string | null;
    performed_by: string;
    date: string;
}

interface InventoryStats {
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
    expiringSoonCount: number;
    expiredCount: number;
}

interface PaginatedData<T> {
    data: T[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    total: number;
    current_page?: number;
    last_page?: number;
}

interface DonationMonitoringProps {
    donations: PaginatedData<DonationRecord>;
    inventory: PaginatedData<InventoryItemData>;
    inventoryLogs: PaginatedData<InventoryLog>;
    inventoryStats?: InventoryStats;
    filters: {
        search?: string;
        type?: string;
        status?: string;
        inventory_search?: string;
        inventory_category?: string;
    };
    stats: {
        totalCash: number;
        pendingCashCount: number;
        pendingInKindCount: number;
    };
}

function TablePagination({
    links,
    total,
    count,
    itemName = 'records'
}: {
    links: Array<{ url: string | null; label: string; active: boolean }>;
    total: number;
    count: number;
    itemName?: string;
}) {
    if (total === 0 || links.length <= 3) return null;

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
            <span className="text-xs font-bold text-gray-450">
                Showing {count} of {total} {itemName}
            </span>
            
            <div className="flex items-center gap-1.5">
                {links.map((link, idx) => {
                    const isPrev = link.label.includes('Previous');
                    const isNext = link.label.includes('Next');
                    
                    return (
                        <Link
                            key={idx}
                            href={link.url || '#'}
                            disabled={!link.url}
                            preserveState
                            preserveScroll
                            onClick={(e) => {
                                if (!link.url) e.preventDefault();
                            }}
                            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center border min-w-8 min-h-8 ${
                                link.active
                                    ? 'bg-paw-navy text-white border-paw-navy'
                                    : link.url
                                        ? 'bg-white dark:bg-[#111827] text-gray-600 dark:text-gray-300 border-gray-250 dark:border-gray-800 hover:border-paw-navy'
                                        : 'bg-gray-100 dark:bg-gray-900 text-gray-400 border-transparent cursor-not-allowed'
                            }`}
                        >
                            {isPrev ? <ChevronLeft size={14} /> : isNext ? <ChevronRight size={14} /> : link.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default function DonationMonitoring({
    donations,
    inventory,
    inventoryLogs,
    inventoryStats,
    filters,
    stats
}: DonationMonitoringProps) {
    const [activeTab, setActiveTab] = useState<'donations' | 'inventory' | 'logs'>('donations');
    
    // Filters State
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [invSearchTerm, setInvSearchTerm] = useState(filters.inventory_search || '');
    const [invCategoryFilter, setInvCategoryFilter] = useState(filters.inventory_category || '');
    const [invStatusFilter, setInvStatusFilter] = useState('all');

    // Modals & Drawers
    const [selectedDonationDetails, setSelectedDonationDetails] = useState<DonationRecord | null>(null);
    const [selectedDonationReceipt, setSelectedDonationReceipt] = useState<DonationRecord | null>(null);
    const [verifyingCashDonation, setVerifyingCashDonation] = useState<DonationRecord | null>(null);
    const [verifyingInKind, setVerifyingInKind] = useState<DonationRecord | null>(null);
    const [rejectingDonation, setRejectingDonation] = useState<DonationRecord | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // Inventory Modals
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItemData | null>(null);
    const [addingBatchToItem, setAddingBatchToItem] = useState<InventoryItemData | null>(null);
    const [viewingBatchesItem, setViewingBatchesItem] = useState<InventoryItemData | null>(null);
    const [adjustingItem, setAdjustingItem] = useState<InventoryItemData | null>(null);
    const [adjustingBatchData, setAdjustingBatchData] = useState<{ batch: InventoryBatchData; item: InventoryItemData } | null>(null);

    // Form states
    const [verifyForm, setVerifyForm] = useState({
        itemName: '',
        quantity: 1,
        unit: 'pcs',
        category: 'Food',
        batch_number: '',
        expires_at: '',
        storage_location: '',
    });

    const [addItemForm, setAddItemForm] = useState({
        name: '',
        unit: 'pcs',
        category: 'Food',
        min_threshold: 5,
        storage_location: '',
        has_expiry: false,
        initial_quantity: 0,
        batch_number: '',
        expires_at: '',
        notes: '',
    });

    const [editItemForm, setEditItemForm] = useState({
        name: '',
        unit: 'pcs',
        category: 'Food',
        min_threshold: 5,
        storage_location: '',
        has_expiry: false,
    });

    const [addBatchForm, setAddBatchForm] = useState({
        quantity: 1,
        batch_number: '',
        expires_at: '',
        received_at: new Date().toISOString().split('T')[0],
        source: 'Direct Purchase / Restock',
        notes: '',
    });

    const [adjustBatchForm, setAdjustBatchForm] = useState({
        action_type: 'dispensed',
        quantity: 1,
        reason: 'Shelter feeding / animal care',
    });

    const [adjustForm, setAdjustForm] = useState({
        direction: 'add',
        quantity: 1,
        reason: '',
    });

    // Filtered Inventory items
    const filteredInventory = (inventory.data || []).filter((item) => {
        if (invStatusFilter === 'all') return true;
        if (invStatusFilter === 'expiring_soon') return item.stock_status === 'expiring_soon';
        if (invStatusFilter === 'expired') return item.stock_status === 'expired';
        if (invStatusFilter === 'low_stock') return item.stock_status === 'low_stock';
        if (invStatusFilter === 'out_of_stock') return item.stock_status === 'out_of_stock';
        if (invStatusFilter === 'in_stock') return item.stock_status === 'in_stock';
        return true;
    });

    // Sync filters on search term changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                applyFilters();
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (invSearchTerm !== (filters.inventory_search || '')) {
                applyFilters();
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [invSearchTerm]);

    const applyFilters = (typeVal?: string, statusVal?: string, invCat?: string) => {
        router.get(
            '/account/admin/donation-monitoring',
            {
                search: searchTerm || undefined,
                type: typeVal !== undefined ? typeVal : selectedType || undefined,
                status: statusVal !== undefined ? statusVal : selectedStatus || undefined,
                inventory_search: invSearchTerm || undefined,
                inventory_category: invCat !== undefined ? invCat : invCategoryFilter || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleVerifyClick = (donation: DonationRecord) => {
        setVerifyingInKind(donation);
        const desc = donation.in_kind_donation?.description || '';
        setVerifyForm({
            itemName: desc.split('-')[0].trim() || 'Shelter Supplies',
            quantity: 1,
            unit: 'pcs',
            category: 'Food',
            batch_number: 'DON-' + donation.public_reference.slice(-4),
            expires_at: '',
            storage_location: 'Main Storage Room',
        });
    };

    const submitVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyingInKind) return;

        router.post(`/account/admin/donation-monitoring/in-kind/${verifyingInKind.id}/verify`, verifyForm, {
            onSuccess: () => {
                setVerifyingInKind(null);
                toast.success('In-kind drop-off verified and inventory batch registered.');
            },
            onError: (err) => {
                Object.values(err).forEach(e => toast.error(e));
            }
        });
    };

    const submitVerifyCash = (donation: DonationRecord) => {
        router.post(`/account/admin/donation-monitoring/donations/${donation.id}/verify-cash`, {}, {
            onSuccess: () => {
                setVerifyingCashDonation(null);
                setSelectedDonationDetails(null);
                toast.success(`Donation ${donation.public_reference} verified and completed.`);
            },
            onError: (err) => {
                Object.values(err).forEach(e => toast.error(e));
            }
        });
    };

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingDonation) return;

        router.post(`/account/admin/donation-monitoring/donations/${rejectingDonation.id}/reject`, {
            reason: rejectReason || 'Payment/Drop-off rejected by administrator.'
        }, {
            onSuccess: () => {
                setRejectingDonation(null);
                setRejectReason('');
                setSelectedDonationDetails(null);
                toast.success(`Donation ${rejectingDonation.public_reference} has been rejected.`);
            },
            onError: (err) => {
                Object.values(err).forEach(e => toast.error(e));
            }
        });
    };

    const submitAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/account/admin/donation-monitoring/inventory', addItemForm, {
            onSuccess: () => {
                setShowAddItemModal(false);
                setAddItemForm({
                    name: '',
                    unit: 'pcs',
                    category: 'Food',
                    min_threshold: 5,
                    storage_location: '',
                    has_expiry: false,
                    initial_quantity: 0,
                    batch_number: '',
                    expires_at: '',
                    notes: '',
                });
                toast.success('New inventory item added successfully.');
            },
            onError: (err) => {
                Object.values(err).forEach(e => toast.error(e));
            }
        });
    };

    const submitEditItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        router.put(`/account/admin/donation-monitoring/inventory/${editingItem.id}`, editItemForm, {
            onSuccess: () => {
                setEditingItem(null);
                toast.success('Inventory item details updated.');
            },
            onError: (err) => {
                Object.values(err).forEach(e => toast.error(e));
            }
        });
    };

    const submitAddBatch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!addingBatchToItem) return;

        router.post(`/account/admin/donation-monitoring/inventory/${addingBatchToItem.id}/batches`, addBatchForm, {
            onSuccess: () => {
                setAddingBatchToItem(null);
                setAddBatchForm({
                    quantity: 1,
                    batch_number: '',
                    expires_at: '',
                    received_at: new Date().toISOString().split('T')[0],
                    source: 'Direct Purchase / Restock',
                    notes: '',
                });
                toast.success('New stock batch added to inventory.');
            },
            onError: (err) => {
                Object.values(err).forEach(e => toast.error(e));
            }
        });
    };

    const submitAdjustBatch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustingBatchData) return;

        router.post(`/account/admin/donation-monitoring/inventory/batches/${adjustingBatchData.batch.id}/adjust`, adjustBatchForm, {
            onSuccess: () => {
                setAdjustingBatchData(null);
                setViewingBatchesItem(null);
                setAdjustBatchForm({
                    action_type: 'dispensed',
                    quantity: 1,
                    reason: 'Shelter feeding / animal care',
                });
                toast.success('Batch stock adjusted successfully.');
            },
            onError: (err) => {
                Object.values(err).forEach(e => toast.error(e));
            }
        });
    };

    const submitAdjust = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustingItem) return;

        const change = adjustForm.direction === 'add' ? adjustForm.quantity : -adjustForm.quantity;

        router.post(`/account/admin/donation-monitoring/inventory/${adjustingItem.id}/adjust`, {
            quantity_changed: change,
            reason: adjustForm.reason || (change > 0 ? 'Manual Stock Increase' : 'Manual Stock Reduction')
        }, {
            onSuccess: () => {
                setAdjustingItem(null);
                setAdjustForm({ direction: 'add', quantity: 1, reason: '' });
                toast.success('Inventory stock level adjusted.');
            },
            onError: (err) => {
                Object.values(err).forEach(e => toast.error(e));
            }
        });
    };

    const deleteInventoryItem = (item: InventoryItemData) => {
        if (confirm(`Are you sure you want to delete "${item.name}" and all its batch history?`)) {
            router.delete(`/account/admin/donation-monitoring/inventory/${item.id}`, {
                onSuccess: () => {
                    toast.success(`"${item.name}" removed from inventory.`);
                }
            });
        }
    };

    return (
        <AdminPageShell 
            title="Donation & Inventory Monitoring" 
            description="Manage donations, monitor monetary & physical drop-offs, track supply inventory, and manage stock batches."
        >
            <Head title="Admin Donation & Inventory Monitoring" />

            {/* Stats row */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-600 rounded-2xl">
                        <Heart size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Cash Received</p>
                        <h4 className="text-2xl font-black text-paw-navy dark:text-white mt-1">₱{stats.totalCash.toLocaleString()}</h4>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-2xl">
                        <Gift size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending In-Kind Drops</p>
                        <h4 className="text-2xl font-black text-paw-navy dark:text-white mt-1">{stats.pendingInKindCount} Drops</h4>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-2xl">
                        <CalendarDays size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expiring Soon (30d)</p>
                        <h4 className="text-2xl font-black text-paw-navy dark:text-white mt-1">
                            {inventoryStats?.expiringSoonCount ?? 0} Batches
                        </h4>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-2xl">
                        <AlertTriangle size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expired / Write-Off</p>
                        <h4 className="text-2xl font-black text-paw-navy dark:text-white mt-1">
                            {inventoryStats?.expiredCount ?? 0} Batches
                        </h4>
                    </div>
                </div>
            </div>

            {/* Tabs control */}
            <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-2 flex gap-2">
                <button
                    onClick={() => setActiveTab('donations')}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'donations' ? 'bg-paw-navy text-white' : 'text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-900/50'}`}
                >
                    Donation Records ({donations.total})
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'inventory' ? 'bg-paw-navy text-white' : 'text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-900/50'}`}
                >
                    In-Kind Inventory ({inventory.total})
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'logs' ? 'bg-paw-navy text-white' : 'text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-900/50'}`}
                >
                    Inventory Audit Logs ({inventoryLogs.total})
                </button>
            </div>

            {/* Active Tab Panel */}
            <div className="space-y-6">
                {/* DONATION RECORDS TAB */}
                {activeTab === 'donations' && (
                    <div className="space-y-6">
                        {/* Search & Filters */}
                        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by donor name, email or reference..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-paw-orange rounded-2xl outline-none font-bold text-sm text-paw-navy dark:text-white"
                                />
                            </div>

                            <div className="flex gap-4 w-full md:w-auto shrink-0">
                                <div className="relative flex-1 md:flex-none">
                                    <select
                                        value={selectedType}
                                        onChange={(e) => {
                                             const val = e.target.value;
                                             setSelectedType(val);
                                             applyFilters(val, undefined);
                                        }}
                                        className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-paw-orange rounded-2xl outline-none font-bold text-sm text-paw-navy dark:text-white appearance-none min-w-[140px]"
                                    >
                                        <option value="">All Types</option>
                                        <option value="cash">Cash</option>
                                        <option value="in_kind">In-Kind</option>
                                        <option value="feeding_sponsorship">Sponsor Feeding</option>
                                    </select>
                                    <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 pointer-events-none" />
                                </div>

                                <div className="relative flex-1 md:flex-none">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSelectedStatus(val);
                                            applyFilters(undefined, val);
                                        }}
                                        className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-paw-orange rounded-2xl outline-none font-bold text-sm text-paw-navy dark:text-white appearance-none min-w-[140px]"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="completed">Completed</option>
                                        <option value="verified">Verified</option>
                                        <option value="pending_payment">Pending Payment</option>
                                        <option value="pending_verification">Pending Verify</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Donations list */}
                        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <th className="px-6 py-4">Ref</th>
                                            <th className="px-6 py-4">Donor Details</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Value / Info</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                        {donations.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-12 text-gray-400 font-bold">
                                                    No donations registered or matching current filter inputs.
                                                </td>
                                            </tr>
                                        ) : (
                                            donations.data.map((donation) => {
                                                const isCompleted = donation.status === 'completed' || donation.status === 'verified';
                                                const isPendingVerify = donation.status === 'pending_verification';
                                                const isPendingPayment = donation.status === 'pending_payment';
                                                const isInKind = donation.type === 'in_kind';

                                                return (
                                                    <tr key={donation.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/5 transition-colors">
                                                        <td className="px-6 py-4 font-black text-paw-navy dark:text-white">
                                                            {donation.public_reference}
                                                        </td>

                                                        {/* Fixed Donor Name: no trailing '0' */}
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="font-black text-paw-navy dark:text-[#CBD5E1]">
                                                                    {donation.donor_name}
                                                                </span>
                                                                {Boolean(donation.anonymous) && (
                                                                    <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-100 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                                                                        Anon
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-400 font-bold">{donation.donor_email}</div>
                                                        </td>

                                                        <td className="px-6 py-4 capitalize font-bold text-gray-500">
                                                            {donation.type.replace('_', ' ')}
                                                        </td>

                                                        {/* Clean Value / Info without in-table drop-off badge */}
                                                        <td className="px-6 py-4">
                                                            {isInKind ? (
                                                                <div>
                                                                    <div className="font-black text-paw-navy dark:text-[#CBD5E1]">
                                                                        {donation.in_kind_donation?.description}
                                                                    </div>
                                                                    {donation.in_kind_donation?.need?.animal && (
                                                                        <div className="text-xs text-paw-orange font-bold flex items-center gap-1 mt-0.5">
                                                                            <Heart size={11} />
                                                                            <span>For: {donation.in_kind_donation.need.animal.name}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <div className="font-black text-paw-orange text-base">
                                                                        ₱{Number(donation.amount || 0).toLocaleString()}
                                                                    </div>
                                                                    {donation.purpose && (
                                                                        <div className="text-xs text-gray-400 font-bold">{donation.purpose}</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-4 text-xs font-bold text-gray-400">
                                                            {new Date(donation.created_at).toLocaleString()}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className={`inline-block text-xs font-black px-2.5 py-1 rounded-full capitalize ${
                                                                isCompleted
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                    : donation.status === 'rejected'
                                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                                            }`}>
                                                                {donation.status.replace('_', ' ')}
                                                            </span>
                                                        </td>

                                                        {/* Compact Action Buttons */}
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                                                {/* 1. View Details */}
                                                                <button
                                                                    onClick={() => setSelectedDonationDetails(donation)}
                                                                    className="p-2 bg-gray-100 hover:bg-paw-navy hover:text-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl transition-colors cursor-pointer"
                                                                    title="View Complete Donation Details"
                                                                >
                                                                    <Eye size={15} />
                                                                </button>

                                                                {/* 2. Official Receipt (Completed Donations) */}
                                                                {isCompleted && (
                                                                    <button
                                                                        onClick={() => setSelectedDonationReceipt(donation)}
                                                                        className="p-2 bg-gray-100 hover:bg-emerald-600 hover:text-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl transition-colors cursor-pointer"
                                                                        title="View & Print Official Receipt (OR)"
                                                                    >
                                                                        <FileText size={15} />
                                                                    </button>
                                                                )}

                                                                {/* 3. In-Kind: Verify & Receive into Inventory */}
                                                                {isInKind && !isCompleted && donation.status !== 'rejected' && (
                                                                    <button
                                                                        onClick={() => handleVerifyClick(donation)}
                                                                        className="p-2 bg-orange-50 hover:bg-paw-orange hover:text-white text-paw-orange dark:bg-orange-950/30 dark:text-orange-400 rounded-xl transition-colors cursor-pointer"
                                                                        title="Verify physical drop-off and add to stock batches"
                                                                    >
                                                                        <Gift size={15} />
                                                                    </button>
                                                                )}

                                                                {/* 4. Cash / Sponsorship: Verify Payment */}
                                                                {!isInKind && (isPendingVerify || isPendingPayment) && (
                                                                    <button
                                                                        onClick={() => setVerifyingCashDonation(donation)}
                                                                        className="p-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-xl transition-colors cursor-pointer"
                                                                        title="Verify Monetary Payment"
                                                                    >
                                                                        <CheckCircle2 size={15} />
                                                                    </button>
                                                                )}

                                                                {/* 5. Reject Donation */}
                                                                {!isCompleted && donation.status !== 'rejected' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setRejectingDonation(donation);
                                                                            setRejectReason('');
                                                                        }}
                                                                        className="p-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-500 dark:bg-red-950/30 dark:text-red-400 rounded-xl transition-colors cursor-pointer"
                                                                        title="Reject / Cancel Donation"
                                                                    >
                                                                        <XCircle size={15} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <TablePagination
                                links={donations.links}
                                total={donations.total}
                                count={donations.data.length}
                                itemName="donations"
                            />
                        </div>
                    </div>
                )}

                {/* INVENTORY MANAGEMENT TAB */}
                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        {/* Search, Category, Status Filters & Add Item button */}
                        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl flex-1">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        value={invSearchTerm}
                                        onChange={(e) => setInvSearchTerm(e.target.value)}
                                        placeholder="Search by name, location, or batch lot#..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-paw-orange rounded-2xl outline-none font-bold text-sm text-paw-navy dark:text-white"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <select
                                        value={invCategoryFilter}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setInvCategoryFilter(val);
                                            applyFilters(undefined, undefined, val);
                                        }}
                                        className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-paw-orange rounded-2xl outline-none font-bold text-xs text-paw-navy dark:text-white"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="Food">Food</option>
                                        <option value="Medicine">Medicine</option>
                                        <option value="Supplies">Supplies</option>
                                        <option value="Other">Other</option>
                                    </select>

                                    <select
                                        value={invStatusFilter}
                                        onChange={(e) => setInvStatusFilter(e.target.value)}
                                        className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-paw-orange rounded-2xl outline-none font-bold text-xs text-paw-navy dark:text-white"
                                    >
                                        <option value="all">All Stock Statuses</option>
                                        <option value="in_stock">In Stock (Good)</option>
                                        <option value="expiring_soon">Expiring Soon (30d)</option>
                                        <option value="expired">Expired</option>
                                        <option value="low_stock">Low Stock</option>
                                        <option value="out_of_stock">Out of Stock</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowAddItemModal(true)}
                                className="bg-paw-navy hover:bg-paw-orange text-white py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer w-full lg:w-auto justify-center shrink-0 shadow"
                            >
                                <Plus size={16} /> Add Inventory Item
                            </button>
                        </div>

                        {/* FULL-ON INVENTORY DATA TABLE */}
                        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <th className="px-6 py-4">Item & Location</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Total Stock</th>
                                            <th className="px-6 py-4">Batches & Expiry</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                        {filteredInventory.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-12 text-gray-400 font-bold">
                                                    No inventory items match current search or filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredInventory.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/5 transition-colors">
                                                    {/* Item Name & Storage Location */}
                                                    <td className="px-6 py-4">
                                                        <div className="font-black text-paw-navy dark:text-white text-base">{item.name}</div>
                                                        {item.storage_location ? (
                                                            <div className="flex items-center gap-1 text-xs text-gray-400 font-bold mt-0.5">
                                                                <MapPin size={12} className="text-paw-orange" />
                                                                <span>{item.storage_location}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-gray-300 font-bold">No location assigned</div>
                                                        )}
                                                    </td>

                                                    {/* Category */}
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-black uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                                                            {item.category}
                                                        </span>
                                                    </td>

                                                    {/* Total Stock */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className={`text-2xl font-black ${
                                                                item.quantity === 0 ? 'text-gray-400' :
                                                                item.quantity <= item.min_threshold ? 'text-amber-600' :
                                                                'text-paw-navy dark:text-white'
                                                            }`}>
                                                                {item.quantity}
                                                            </span>
                                                            <span className="text-xs font-bold text-gray-400 uppercase">{item.unit}</span>
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 font-bold">
                                                            Threshold: {item.min_threshold} {item.unit}
                                                        </div>
                                                    </td>

                                                    {/* Batches & Expiry */}
                                                    <td className="px-6 py-4">
                                                        {item.nearest_expiry ? (
                                                            <div>
                                                                <div className="text-xs font-black text-paw-navy dark:text-white flex items-center gap-1">
                                                                    <CalendarDays size={13} className="text-paw-orange" />
                                                                    <span>Next Exp: {item.nearest_expiry}</span>
                                                                </div>
                                                                <div className="text-[11px] text-gray-400 font-bold mt-0.5">
                                                                    {item.active_batches_count} active {item.active_batches_count === 1 ? 'batch' : 'batches'}
                                                                    {item.expired_batches_count > 0 && (
                                                                        <span className="text-red-500 font-black ml-1">({item.expired_batches_count} expired!)</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <span className="text-xs text-gray-400 font-bold">
                                                                    {item.has_expiry ? 'No expiry set' : 'Non-perishable'}
                                                                </span>
                                                                <div className="text-[11px] text-gray-400 font-bold mt-0.5">
                                                                    {item.active_batches_count} active {item.active_batches_count === 1 ? 'batch' : 'batches'}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase ${
                                                            item.stock_status === 'out_of_stock' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                                                            item.stock_status === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' :
                                                            item.stock_status === 'expiring_soon' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                                                            item.stock_status === 'low_stock' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' :
                                                            'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                                                        }`}>
                                                            {item.stock_status === 'out_of_stock' && <AlertCircle size={12} />}
                                                            {item.stock_status === 'expired' && <ShieldAlert size={12} />}
                                                            {item.stock_status === 'expiring_soon' && <Clock size={12} />}
                                                            {item.stock_status === 'low_stock' && <AlertTriangle size={12} />}
                                                            {item.stock_status === 'in_stock' && <ShieldCheck size={12} />}
                                                            {item.stock_status.replace('_', ' ')}
                                                        </span>
                                                    </td>

                                                    {/* Action Buttons */}
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                onClick={() => setViewingBatchesItem(item)}
                                                                className="p-2 bg-gray-100 hover:bg-paw-navy hover:text-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl transition-colors cursor-pointer"
                                                                title="View and Manage Batches & Expiry"
                                                            >
                                                                <Boxes size={15} />
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setAddingBatchToItem(item);
                                                                    setAddBatchForm({
                                                                        quantity: 1,
                                                                        batch_number: 'LOT-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900),
                                                                        expires_at: '',
                                                                        received_at: new Date().toISOString().split('T')[0],
                                                                        source: 'Direct Purchase / Restock',
                                                                        notes: '',
                                                                    });
                                                                }}
                                                                className="p-2 bg-gray-100 hover:bg-paw-orange hover:text-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl transition-colors cursor-pointer"
                                                                title="Receive New Batch"
                                                            >
                                                                <Plus size={15} />
                                                            </button>

                                                            <button
                                                                onClick={() => setAdjustingItem(item)}
                                                                className="p-2 bg-gray-100 hover:bg-paw-navy hover:text-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl transition-colors cursor-pointer"
                                                                title="Adjust Stock Level"
                                                            >
                                                                <ArrowUpDown size={15} />
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setEditingItem(item);
                                                                    setEditItemForm({
                                                                        name: item.name,
                                                                        unit: item.unit,
                                                                        category: item.category,
                                                                        min_threshold: item.min_threshold,
                                                                        storage_location: item.storage_location || '',
                                                                        has_expiry: item.has_expiry,
                                                                    });
                                                                }}
                                                                className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl transition-colors cursor-pointer"
                                                                title="Edit Item Details"
                                                            >
                                                                <Edit2 size={15} />
                                                            </button>

                                                            <button
                                                                onClick={() => deleteInventoryItem(item)}
                                                                className="p-2 bg-gray-100 hover:bg-red-500 hover:text-white dark:bg-gray-800 text-gray-400 rounded-xl transition-colors cursor-pointer"
                                                                title="Delete Item"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Inventory Pagination */}
                            <TablePagination
                                links={inventory.links}
                                total={inventory.total}
                                count={filteredInventory.length}
                                itemName="inventory items"
                            />
                        </div>
                    </div>
                )}

                {/* INVENTORY AUDIT LOGS TAB */}
                {activeTab === 'logs' && (
                    <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/20">
                            <h3 className="font-black text-paw-navy dark:text-white text-lg">Inventory Transaction Logs</h3>
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                                <Clock size={14} /> Tracking stock movements and batch history in real-time
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Item Name</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Batch Lot#</th>
                                        <th className="px-6 py-4">Changed</th>
                                        <th className="px-6 py-4">Final Stock</th>
                                        <th className="px-6 py-4">Reason / Details</th>
                                        <th className="px-6 py-4">Performed By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                    {(inventoryLogs.data || []).length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12 text-gray-400 font-bold">
                                                No stock adjustment transactions logged yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        (inventoryLogs.data || []).map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/5 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-500 whitespace-nowrap">{log.date}</td>
                                                <td className="px-6 py-4 font-bold text-paw-navy dark:text-white">{log.item_name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block text-xs font-black px-2.5 py-0.5 rounded-full uppercase ${
                                                        log.action === 'donation_received' 
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                                                            : log.action === 'expired_writeoff'
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                                : log.quantity_changed > 0 
                                                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                                                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                    }`}>
                                                        {log.action.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                                    {log.batch_info || 'N/A'}
                                                </td>
                                                <td className={`px-6 py-4 font-black ${log.quantity_changed > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {log.quantity_changed > 0 ? '+' : ''}{log.quantity_changed} {log.unit}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-650">{log.resulting_quantity} {log.unit}</td>
                                                <td className="px-6 py-4 font-bold text-gray-500 max-w-xs truncate">{log.reason || 'N/A'}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-gray-400">{log.performed_by}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Audit Logs Pagination */}
                        <TablePagination
                            links={inventoryLogs.links}
                            total={inventoryLogs.total}
                            count={(inventoryLogs.data || []).length}
                            itemName="audit logs"
                        />
                    </div>
                )}
            </div>

            {/* DONATION DETAILS DRAWER / MODAL */}
            {selectedDonationDetails && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div onClick={() => setSelectedDonationDetails(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 max-w-2xl w-full relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start pb-4 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <span className="text-[10px] font-black text-paw-orange uppercase tracking-widest block">Donation Overview</span>
                                <h3 className="text-2xl font-black text-paw-navy dark:text-white flex items-center gap-2">
                                    <span>{selectedDonationDetails.public_reference}</span>
                                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full capitalize ${
                                        selectedDonationDetails.status === 'completed' || selectedDonationDetails.status === 'verified'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                                            : selectedDonationDetails.status === 'rejected'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                    }`}>
                                        {selectedDonationDetails.status.replace('_', ' ')}
                                    </span>
                                </h3>
                            </div>
                            <button onClick={() => setSelectedDonationDetails(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="py-6 space-y-6">
                            {/* Donor Info Card */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-150 dark:border-gray-700">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Donor Information</span>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="font-bold text-gray-400 text-xs">Donor Name</div>
                                        <div className="font-black text-paw-navy dark:text-white flex items-center gap-1.5">
                                            <span>{selectedDonationDetails.donor_name}</span>
                                            {Boolean(selectedDonationDetails.anonymous) && (
                                                <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 px-2 py-0.2 rounded-full font-black">
                                                    Anonymous
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-400 text-xs">Email Address</div>
                                        <div className="font-bold text-paw-navy dark:text-gray-300">{selectedDonationDetails.donor_email}</div>
                                    </div>
                                    {selectedDonationDetails.donor_mobile && (
                                        <div>
                                            <div className="font-bold text-gray-400 text-xs">Mobile Contact</div>
                                            <div className="font-bold text-paw-navy dark:text-gray-300">{selectedDonationDetails.donor_mobile}</div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-bold text-gray-400 text-xs">Date Submitted</div>
                                        <div className="font-bold text-paw-navy dark:text-gray-300">{new Date(selectedDonationDetails.created_at).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* In-Kind Details Card */}
                            {selectedDonationDetails.type === 'in_kind' && (
                                <div className="bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl p-4 border border-orange-200 dark:border-orange-900/30 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-paw-orange uppercase tracking-widest block">In-Kind Drop-off Schedule & Details</span>
                                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                            selectedDonationDetails.status === 'completed' || selectedDonationDetails.status === 'verified'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                                                : selectedDonationDetails.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                        }`}>
                                            {selectedDonationDetails.status === 'completed' || selectedDonationDetails.status === 'verified' ? (
                                                <><CheckCircle2 size={12} /> Drop-Off Received & Stocked</>
                                            ) : selectedDonationDetails.status === 'rejected' ? (
                                                <><XCircle size={12} /> Drop-off Cancelled</>
                                            ) : (
                                                <><Clock size={12} /> Awaiting Drop-Off</>
                                            )}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="col-span-2">
                                            <div className="font-bold text-gray-400 text-xs">Item Description</div>
                                            <div className="font-black text-paw-navy dark:text-white text-base">{selectedDonationDetails.in_kind_donation?.description}</div>
                                        </div>
                                        {selectedDonationDetails.in_kind_donation?.need?.animal && (
                                            <div>
                                                <div className="font-bold text-gray-400 text-xs">Dedicated Animal</div>
                                                <div className="font-black text-paw-orange flex items-center gap-1">
                                                    <Heart size={14} /> {selectedDonationDetails.in_kind_donation.need.animal.name}
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-bold text-gray-400 text-xs">Scheduled Drop-off Date</div>
                                            <div className="font-black text-paw-navy dark:text-white flex items-center gap-1">
                                                <Calendar size={14} className="text-paw-orange" />
                                                <span>{selectedDonationDetails.in_kind_donation?.drop_off_date || 'Not set'}</span>
                                            </div>
                                        </div>
                                        {selectedDonationDetails.in_kind_donation?.contact_person && (
                                            <div>
                                                <div className="font-bold text-gray-400 text-xs">Drop-off Contact Person</div>
                                                <div className="font-bold text-paw-navy dark:text-gray-300">{selectedDonationDetails.in_kind_donation.contact_person}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Monetary / Cash Details */}
                            {selectedDonationDetails.type !== 'in_kind' && (
                                <div className="bg-green-50/50 dark:bg-green-950/20 rounded-2xl p-4 border border-green-200 dark:border-green-900/30 space-y-3">
                                    <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest block">Payment & Contribution Details</span>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="font-bold text-gray-400 text-xs">Total Amount</div>
                                            <div className="font-black text-2xl text-green-600">₱{Number(selectedDonationDetails.amount || 0).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-400 text-xs">Purpose</div>
                                            <div className="font-bold text-paw-navy dark:text-gray-300">{selectedDonationDetails.purpose || 'General Funding'}</div>
                                        </div>
                                        {selectedDonationDetails.feeding_sponsorship && (
                                            <div className="col-span-2 border-t border-green-100 dark:border-green-900/40 pt-2">
                                                <div className="font-bold text-gray-400 text-xs">Feeding Sponsorship Date</div>
                                                <div className="font-black text-paw-navy dark:text-white">
                                                    {selectedDonationDetails.feeding_sponsorship.preferred_date} {selectedDonationDetails.feeding_sponsorship.occasion ? `(${selectedDonationDetails.feeding_sponsorship.occasion})` : ''}
                                                </div>
                                                {selectedDonationDetails.feeding_sponsorship.message && (
                                                    <div className="text-xs text-gray-500 italic mt-1">"{selectedDonationDetails.feeding_sponsorship.message}"</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason if applicable */}
                            {selectedDonationDetails.rejection_reason && (
                                <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-4 border border-red-200 dark:border-red-900 text-sm">
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block mb-1">Rejection Reason</span>
                                    <p className="text-red-700 dark:text-red-300 font-bold">{selectedDonationDetails.rejection_reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Action Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex gap-2">
                                {(selectedDonationDetails.status === 'completed' || selectedDonationDetails.status === 'verified') && (
                                    <button
                                        onClick={() => {
                                            setSelectedDonationReceipt(selectedDonationDetails);
                                        }}
                                        className="px-4 py-2.5 bg-paw-navy hover:bg-paw-orange text-white rounded-xl font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Printer size={14} /> Print Official Receipt
                                    </button>
                                )}

                                {selectedDonationDetails.type === 'in_kind' && selectedDonationDetails.status !== 'completed' && selectedDonationDetails.status !== 'rejected' && (
                                    <button
                                        onClick={() => {
                                            handleVerifyClick(selectedDonationDetails);
                                        }}
                                        className="px-4 py-2.5 bg-paw-orange hover:bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Gift size={14} /> Verify & Receive into Inventory
                                    </button>
                                )}

                                {selectedDonationDetails.type !== 'in_kind' && selectedDonationDetails.status !== 'completed' && selectedDonationDetails.status !== 'rejected' && (
                                    <button
                                        onClick={() => submitVerifyCash(selectedDonationDetails)}
                                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <CheckCircle2 size={14} /> Verify Cash Payment
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedDonationDetails(null)}
                                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* OFFICIAL SHELTER DONATION RECEIPT (OR) MODAL */}
            {selectedDonationReceipt && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div onClick={() => setSelectedDonationReceipt(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white rounded-[32px] p-8 max-w-lg w-full relative z-10 shadow-2xl text-gray-900">
                        {/* Printable Receipt Card */}
                        <div id="printable-receipt" className="border-2 border-dashed border-gray-300 rounded-3xl p-6 bg-amber-50/20">
                            <div className="text-center pb-4 border-b border-gray-200">
                                <div className="text-xl font-black text-paw-navy uppercase tracking-wider flex items-center justify-center gap-1">
                                    🐾 PAWLSE ANIMAL SHELTER
                                </div>
                                <p className="text-[11px] text-gray-500 font-bold">Official Donation & Supply Contribution Acknowledgment</p>
                                <div className="text-xs font-mono font-black text-paw-orange mt-1">
                                    RECEIPT NO: {selectedDonationReceipt.public_reference}
                                </div>
                            </div>

                            <div className="py-4 space-y-3 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-bold">Date Issued:</span>
                                    <span className="font-bold text-gray-900">{new Date(selectedDonationReceipt.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-bold">Received From:</span>
                                    <span className="font-black text-paw-navy">
                                        {selectedDonationReceipt.anonymous ? 'Anonymous Supporter' : selectedDonationReceipt.donor_name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-bold">Contribution Type:</span>
                                    <span className="font-bold text-gray-900 uppercase">{selectedDonationReceipt.type.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between items-baseline border-t border-b border-gray-200 py-2.5">
                                    <span className="text-gray-600 font-black">Value / Items Received:</span>
                                    <span className="text-base font-black text-paw-navy">
                                        {selectedDonationReceipt.type === 'in_kind'
                                            ? selectedDonationReceipt.in_kind_donation?.description
                                            : `₱${Number(selectedDonationReceipt.amount || 0).toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-bold">Designated Purpose:</span>
                                    <span className="font-bold text-gray-700">{selectedDonationReceipt.purpose || 'General Animal Welfare'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-bold">Status:</span>
                                    <span className="font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-[10px] uppercase">
                                        Verified & Completed
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 text-center">
                                <div className="text-[10px] text-gray-400 font-bold">Thank you for extending kindness and saving lives!</div>
                                <div className="text-[9px] text-gray-400 italic mt-0.5">Pawlse Shelter Non-Profit Foundation</div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <button
                                onClick={() => {
                                    window.print();
                                }}
                                className="flex-1 bg-paw-navy hover:bg-paw-orange text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Printer size={15} /> Print / Save PDF
                            </button>
                            <button
                                onClick={() => setSelectedDonationReceipt(null)}
                                className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VERIFY CASH CONFIRMATION MODAL */}
            {verifyingCashDonation && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div onClick={() => setVerifyingCashDonation(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl">
                        <h3 className="text-2xl font-black text-paw-navy dark:text-white mb-2">Verify Cash Donation</h3>
                        <p className="text-xs text-gray-400 font-bold mb-6">
                            Confirm verification of payment for <span className="text-paw-orange font-black">{verifyingCashDonation.public_reference}</span> (₱{Number(verifyingCashDonation.amount || 0).toLocaleString()} from {verifyingCashDonation.donor_name}).
                        </p>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setVerifyingCashDonation(null)}
                                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => submitVerifyCash(verifyingCashDonation)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                            >
                                Confirm Verification
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REJECT DONATION MODAL */}
            {rejectingDonation && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div onClick={() => setRejectingDonation(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl">
                        <h3 className="text-2xl font-black text-paw-navy dark:text-white mb-2">Reject Donation</h3>
                        <p className="text-xs text-gray-400 font-bold mb-4">
                            Ref: <span className="text-paw-orange font-black">{rejectingDonation.public_reference}</span> ({rejectingDonation.donor_name})
                        </p>

                        <form onSubmit={submitReject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Reason for Rejection *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    placeholder="e.g. Unverified deposit slip, No show on scheduled drop-off date"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRejectingDonation(null)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Reject Donation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VERIFY IN-KIND MODAL WITH BATCH & EXPIRY */}
            {verifyingInKind && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div onClick={() => setVerifyingInKind(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 max-w-lg w-full relative z-10 shadow-2xl">
                        <h3 className="text-2xl font-black text-paw-navy dark:text-white mb-2">Verify & Receive In-Kind Drop-off</h3>
                        <p className="text-xs text-gray-500 font-bold mb-6">
                            Receive into inventory from donation: <span className="text-paw-orange font-black">{verifyingInKind.public_reference}</span>
                        </p>

                        <form onSubmit={submitVerify} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Item Stock Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={verifyForm.itemName}
                                    onChange={(e) => setVerifyForm({ ...verifyForm, itemName: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    placeholder="e.g. Puppy Kibble (5kg)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Quantity Received *</label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={verifyForm.quantity}
                                        onChange={(e) => setVerifyForm({ ...verifyForm, quantity: parseInt(e.target.value) || 1 })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Unit *</label>
                                    <input
                                        type="text"
                                        required
                                        value={verifyForm.unit}
                                        onChange={(e) => setVerifyForm({ ...verifyForm, unit: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                        placeholder="e.g. bags, cans, pcs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Category *</label>
                                    <select
                                        value={verifyForm.category}
                                        onChange={(e) => setVerifyForm({ ...verifyForm, category: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    >
                                        <option value="Food">Food / Feed</option>
                                        <option value="Medicine">Medicine / Healthcare</option>
                                        <option value="Supplies">Supplies / Bedding</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Storage Location</label>
                                    <input
                                        type="text"
                                        value={verifyForm.storage_location}
                                        onChange={(e) => setVerifyForm({ ...verifyForm, storage_location: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                        placeholder="e.g. Pantry Shelf B"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Batch Lot # (Optional)</label>
                                    <input
                                        type="text"
                                        value={verifyForm.batch_number}
                                        onChange={(e) => setVerifyForm({ ...verifyForm, batch_number: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                        placeholder="Auto-generated if empty"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Expiry Date (If Any)</label>
                                    <input
                                        type="date"
                                        value={verifyForm.expires_at}
                                        onChange={(e) => setVerifyForm({ ...verifyForm, expires_at: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setVerifyingInKind(null)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-paw-orange text-white hover:bg-orange-600 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Verify & Receive
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD ITEM MODAL */}
            {showAddItemModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div onClick={() => setShowAddItemModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 max-w-lg w-full relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-black text-paw-navy dark:text-white mb-2">Add New Inventory Item</h3>
                        <p className="text-xs text-gray-400 font-bold mb-6">Create a new tracked inventory product profile.</p>

                        <form onSubmit={submitAddItem} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Item Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={addItemForm.name}
                                    onChange={(e) => setAddItemForm({ ...addItemForm, name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    placeholder="e.g. Puppy Kibble (Beef)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Category *</label>
                                    <select
                                        value={addItemForm.category}
                                        onChange={(e) => setAddItemForm({ ...addItemForm, category: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    >
                                        <option value="Food">Food / Feed</option>
                                        <option value="Medicine">Medicine / Healthcare</option>
                                        <option value="Supplies">Supplies / Bedding</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Unit of Measure *</label>
                                    <input
                                        type="text"
                                        required
                                        value={addItemForm.unit}
                                        onChange={(e) => setAddItemForm({ ...addItemForm, unit: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                        placeholder="e.g. kg, bags, cans, vials"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Low Stock Alert Threshold</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={addItemForm.min_threshold}
                                        onChange={(e) => setAddItemForm({ ...addItemForm, min_threshold: parseInt(e.target.value) || 0 })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Storage Location</label>
                                    <input
                                        type="text"
                                        value={addItemForm.storage_location}
                                        onChange={(e) => setAddItemForm({ ...addItemForm, storage_location: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                        placeholder="e.g. Clinic Fridge A"
                                    />
                                </div>
                            </div>

                            {/* Initial Batch Setup */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                                <div className="text-xs font-black text-paw-orange uppercase tracking-wider">Initial Stock Batch (Optional)</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase">Initial Quantity</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={addItemForm.initial_quantity}
                                            onChange={(e) => setAddItemForm({ ...addItemForm, initial_quantity: parseInt(e.target.value) || 0 })}
                                            className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase">Batch / Lot #</label>
                                        <input
                                            type="text"
                                            value={addItemForm.batch_number}
                                            onChange={(e) => setAddItemForm({ ...addItemForm, batch_number: e.target.value })}
                                            className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                            placeholder="e.g. LOT-001"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Batch Expiry Date</label>
                                    <input
                                        type="date"
                                        value={addItemForm.expires_at}
                                        onChange={(e) => setAddItemForm({ ...addItemForm, expires_at: e.target.value })}
                                        className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddItemModal(false)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-paw-navy text-white hover:bg-paw-orange py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Create Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT ITEM DETAILS MODAL */}
            {editingItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div onClick={() => setEditingItem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl">
                        <h3 className="text-2xl font-black text-paw-navy dark:text-white mb-2">Edit Item Details</h3>
                        <p className="text-xs text-gray-400 font-bold mb-6">Updating: <span className="text-paw-orange font-black">{editingItem.name}</span></p>

                        <form onSubmit={submitEditItem} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Item Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editItemForm.name}
                                    onChange={(e) => setEditItemForm({ ...editItemForm, name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Category</label>
                                    <select
                                        value={editItemForm.category}
                                        onChange={(e) => setEditItemForm({ ...editItemForm, category: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    >
                                        <option value="Food">Food</option>
                                        <option value="Medicine">Medicine</option>
                                        <option value="Supplies">Supplies</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Unit</label>
                                    <input
                                        type="text"
                                        required
                                        value={editItemForm.unit}
                                        onChange={(e) => setEditItemForm({ ...editItemForm, unit: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Min Alert Threshold</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={editItemForm.min_threshold}
                                        onChange={(e) => setEditItemForm({ ...editItemForm, min_threshold: parseInt(e.target.value) || 0 })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Storage Location</label>
                                    <input
                                        type="text"
                                        value={editItemForm.storage_location}
                                        onChange={(e) => setEditItemForm({ ...editItemForm, storage_location: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-paw-navy text-white hover:bg-paw-orange py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD BATCH MODAL */}
            {addingBatchToItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div onClick={() => setAddingBatchToItem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl">
                        <h3 className="text-2xl font-black text-paw-navy dark:text-white mb-2">Receive Stock Batch</h3>
                        <p className="text-xs text-gray-400 font-bold mb-6">Adding new batch to: <span className="text-paw-orange font-black">{addingBatchToItem.name}</span></p>

                        <form onSubmit={submitAddBatch} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">
                                        Quantity ({addingBatchToItem.unit}) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={addBatchForm.quantity}
                                        onChange={(e) => setAddBatchForm({ ...addBatchForm, quantity: parseInt(e.target.value) || 1 })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Batch / Lot #</label>
                                    <input
                                        type="text"
                                        value={addBatchForm.batch_number}
                                        onChange={(e) => setAddBatchForm({ ...addBatchForm, batch_number: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                        placeholder="Auto-generated"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={addBatchForm.expires_at}
                                        onChange={(e) => setAddBatchForm({ ...addBatchForm, expires_at: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Received Date</label>
                                    <input
                                        type="date"
                                        value={addBatchForm.received_at}
                                        onChange={(e) => setAddBatchForm({ ...addBatchForm, received_at: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Source / Supplier / Donor</label>
                                <input
                                    type="text"
                                    value={addBatchForm.source}
                                    onChange={(e) => setAddBatchForm({ ...addBatchForm, source: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    placeholder="e.g. Pet Care Supplier Co., In-Kind Donor"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setAddingBatchToItem(null)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-paw-orange text-white hover:bg-orange-600 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Add Batch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* BATCHES DRAWER / MODAL */}
            {viewingBatchesItem && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div onClick={() => setViewingBatchesItem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white dark:bg-gray-900 rounded-[36px] p-6 sm:p-8 max-w-3xl w-full relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <span className="text-[10px] font-black text-paw-orange uppercase tracking-widest block">Batch & Expiry Management</span>
                                <h3 className="text-2xl font-black text-paw-navy dark:text-white">{viewingBatchesItem.name}</h3>
                                <p className="text-xs text-gray-400 font-bold mt-0.5">
                                    Total Stock: <span className="text-paw-navy dark:text-white font-black">{viewingBatchesItem.quantity} {viewingBatchesItem.unit}</span> across {viewingBatchesItem.batches.length} recorded batches
                                </p>
                            </div>
                            <button
                                onClick={() => setViewingBatchesItem(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                            >
                                <X size={22} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Batches Table */}
                        <div className="py-6 space-y-4">
                            {viewingBatchesItem.batches.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <Boxes className="mx-auto text-gray-300 mb-2" size={36} />
                                    <p className="text-sm font-bold text-gray-400">No batches created for this item yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {viewingBatchesItem.batches.map((batch) => (
                                        <div
                                            key={batch.id}
                                            className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                                batch.status === 'expired'
                                                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                                                    : batch.status === 'expiring_soon'
                                                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                                                        : batch.quantity <= 0
                                                            ? 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 opacity-60'
                                                            : 'bg-white dark:bg-gray-800/70 border-gray-150 dark:border-gray-700'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-sm text-paw-navy dark:text-white">
                                                        {batch.batch_number}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                        batch.status === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                                        batch.status === 'expiring_soon' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                                                        batch.quantity <= 0 ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400' :
                                                        'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                                    }`}>
                                                        {batch.quantity <= 0 ? 'Depleted' :
                                                         batch.status === 'expired' ? 'Expired' :
                                                         batch.status === 'expiring_soon' ? 'Expiring Soon' : 'Good'}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
                                                    <div>
                                                        Stock: <span className="font-black text-paw-navy dark:text-white">{batch.quantity}</span> / {batch.initial_quantity} {viewingBatchesItem.unit}
                                                    </div>
                                                    {batch.expires_at ? (
                                                        <div className="flex items-center gap-1">
                                                            <CalendarDays size={12} className="text-paw-orange" />
                                                            <span>
                                                                Exp: {batch.expires_at}
                                                                {batch.days_remaining !== null && (
                                                                    <span className={`ml-1 font-black ${
                                                                        batch.days_remaining < 0 ? 'text-red-500' :
                                                                        batch.days_remaining <= 30 ? 'text-amber-600' : 'text-gray-400'
                                                                    }`}>
                                                                        ({batch.days_remaining < 0 ? `${Math.abs(batch.days_remaining)}d ago` : `${batch.days_remaining}d left`})
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span>No Expiry Date</span>
                                                    )}
                                                    {batch.source && <div>Source: {batch.source}</div>}
                                                </div>
                                            </div>

                                            {/* Batch Actions */}
                                            {batch.quantity > 0 && (
                                                <div className="flex items-center gap-2 self-end sm:self-center">
                                                    <button
                                                        onClick={() => {
                                                            setAdjustingBatchData({ batch, item: viewingBatchesItem });
                                                            setAdjustBatchForm({
                                                                action_type: 'dispensed',
                                                                quantity: 1,
                                                                reason: 'Shelter feeding / animal care',
                                                            });
                                                        }}
                                                        className="px-3 py-1.5 bg-paw-navy hover:bg-paw-orange text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                                                    >
                                                        Use / Dispense
                                                    </button>

                                                    {batch.status === 'expired' && (
                                                        <button
                                                            onClick={() => {
                                                                setAdjustingBatchData({ batch, item: viewingBatchesItem });
                                                                setAdjustBatchForm({
                                                                    action_type: 'expired_writeoff',
                                                                    quantity: batch.quantity,
                                                                    reason: 'Expired stock disposal',
                                                                });
                                                            }}
                                                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                                                        >
                                                            Write-off Expired
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => {
                                    setAddingBatchToItem(viewingBatchesItem);
                                    setAddBatchForm({
                                        quantity: 1,
                                        batch_number: 'LOT-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900),
                                        expires_at: '',
                                        received_at: new Date().toISOString().split('T')[0],
                                        source: 'Direct Purchase / Restock',
                                        notes: '',
                                    });
                                }}
                                className="px-4 py-2.5 bg-paw-orange text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <Plus size={14} /> Add Another Batch
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewingBatchesItem(null)}
                                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADJUST BATCH STOCK MODAL */}
            {adjustingBatchData && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div onClick={() => setAdjustingBatchData(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl">
                        <h3 className="text-2xl font-black text-paw-navy dark:text-white mb-2">Adjust Batch Stock</h3>
                        <p className="text-xs text-gray-400 font-bold mb-6">
                            Batch: <span className="text-paw-orange font-black">{adjustingBatchData.batch.batch_number}</span> of {adjustingBatchData.item.name} (Remaining: {adjustingBatchData.batch.quantity} {adjustingBatchData.item.unit})
                        </p>

                        <form onSubmit={submitAdjustBatch} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Action Type</label>
                                <select
                                    value={adjustBatchForm.action_type}
                                    onChange={(e) => setAdjustBatchForm({ ...adjustBatchForm, action_type: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                >
                                    <option value="dispensed">Dispensed / Used for Shelter Care</option>
                                    <option value="expired_writeoff">Expired Stock Write-Off / Disposal</option>
                                    <option value="damaged_writeoff">Damaged / Spoiled Disposal</option>
                                    <option value="adjustment">Audit Count Correction</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">
                                    Quantity to Deduct ({adjustingBatchData.item.unit}) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    max={adjustingBatchData.batch.quantity}
                                    value={adjustBatchForm.quantity}
                                    onChange={(e) => setAdjustBatchForm({ ...adjustBatchForm, quantity: parseInt(e.target.value) || 1 })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5">Reason / Notes *</label>
                                <input
                                    type="text"
                                    required
                                    value={adjustBatchForm.reason}
                                    onChange={(e) => setAdjustBatchForm({ ...adjustBatchForm, reason: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    placeholder="e.g. Fed to rescued puppies, Expired disposal"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setAdjustingBatchData(null)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-paw-navy text-white hover:bg-paw-orange py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Confirm Adjustment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* GENERAL FEFO STOCK ADJUST MODAL */}
            {adjustingItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div onClick={() => setAdjustingItem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl">
                        <h3 className="text-2xl font-black text-paw-navy dark:text-white mb-2">Adjust Supply Level</h3>
                        <p className="text-xs text-gray-450 font-bold mb-6">
                            Item: <span className="font-black text-paw-navy dark:text-white">{adjustingItem.name}</span> (Current Stock: {adjustingItem.quantity} {adjustingItem.unit})
                        </p>

                        <form onSubmit={submitAdjust} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-2">Adjustment Action</label>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-150 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustForm({ ...adjustForm, direction: 'add' })}
                                        className={`py-2 rounded-xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${adjustForm.direction === 'add' ? 'bg-paw-navy text-white' : 'text-gray-500'}`}
                                    >
                                        Add Stock
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAdjustForm({ ...adjustForm, direction: 'remove' })}
                                        className={`py-2 rounded-xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${adjustForm.direction === 'remove' ? 'bg-paw-navy text-white' : 'text-gray-500'}`}
                                    >
                                        Remove Stock (FEFO)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-2">
                                    Quantity ({adjustingItem.unit}) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    value={adjustForm.quantity}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) || 1 })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-2">Reason / Details *</label>
                                <input
                                    type="text"
                                    required
                                    value={adjustForm.reason}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:border-paw-orange text-paw-navy dark:text-white"
                                    placeholder="e.g. Distributed to shelter area, Expired stock"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setAdjustingItem(null)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-paw-navy text-white hover:bg-paw-orange py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Apply Change
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminPageShell>
    );
}

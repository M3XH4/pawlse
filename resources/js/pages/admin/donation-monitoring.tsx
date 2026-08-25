import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { 
    Heart, CreditCard, Gift, Users, Check, ArrowRight, ShieldCheck, X, 
    Copy, CheckCircle2, Smartphone, Filter, Calendar, Download, FileText, 
    TrendingUp, Plus, Upload, Clock, AlertCircle, Search, ChevronLeft, 
    ChevronRight, ArrowUpDown, RefreshCw, Layers
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
    status: string;
    purpose: string | null;
    created_at: string;
    in_kind_donation?: {
        description: string;
        quantity: string | null;
        drop_off_date: string | null;
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
    }>;
    feeding_sponsorship?: {
        preferred_date: string;
        occasion: string | null;
        message: string | null;
    } | null;
}

interface InventoryItem {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    category: string;
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
    performed_by: string;
    date: string;
}

interface DonationMonitoringProps {
    donations: {
        data: DonationRecord[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
    };
    inventory: InventoryItem[];
    inventoryLogs: InventoryLog[];
    filters: {
        search?: string;
        type?: string;
        status?: string;
        inventory_search?: string;
    };
    stats: {
        totalCash: number;
        pendingCashCount: number;
        pendingInKindCount: number;
    };
}

export default function DonationMonitoring({
    donations,
    inventory,
    inventoryLogs,
    filters,
    stats
}: DonationMonitoringProps) {
    const [activeTab, setActiveTab] = useState<'donations' | 'inventory' | 'logs'>('donations');
    
    // Filters State
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [invSearchTerm, setInvSearchTerm] = useState(filters.inventory_search || '');

    // Modals
    const [verifyingInKind, setVerifyingInKind] = useState<DonationRecord | null>(null);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);

    // Form inputs for modals
    const [verifyForm, setVerifyForm] = useState({
        itemName: '',
        quantity: 1,
        unit: 'pcs',
        category: 'Food'
    });

    const [addItemForm, setAddItemForm] = useState({
        name: '',
        quantity: 0,
        unit: 'pcs',
        category: 'Food'
    });

    const [adjustForm, setAdjustForm] = useState({
        direction: 'add', // 'add' or 'remove'
        quantity: 1,
        reason: ''
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

    const applyFilters = (typeVal?: string, statusVal?: string) => {
        router.get(
            '/account/admin/donation-monitoring',
            {
                search: searchTerm || undefined,
                type: typeVal !== undefined ? typeVal : selectedType || undefined,
                status: statusVal !== undefined ? statusVal : selectedStatus || undefined,
                inventory_search: invSearchTerm || undefined,
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

    const handleVerifyClick = (donation: DonationRecord) => {
        setVerifyingInKind(donation);
        
        // Auto-extract item name from description if possible
        const desc = donation.in_kind_donation?.description || '';
        let qty = 1;
        let unit = 'pcs';
        let category = 'Food';

        // Prefill forms helper
        setVerifyForm({
            itemName: desc.split('-')[0].trim() || 'Dog/Cat Food',
            quantity: qty,
            unit: unit,
            category: category
        });
    };

    const submitVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyingInKind) return;

        router.post(`/account/admin/donation-monitoring/in-kind/${verifyingInKind.id}/verify`, verifyForm, {
            onSuccess: () => {
                setVerifyingInKind(null);
                toast.success('In-kind donation verified and inventory updated.');
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
                setAddItemForm({ name: '', quantity: 0, unit: 'pcs', category: 'Food' });
                toast.success('New inventory item added successfully.');
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
            reason: adjustForm.reason
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

    return (
        <AdminPageShell 
            title="Donation Monitoring" 
            description="Manage monetary records, physical in-kind drop-offs, and shelter supply inventory."
        >
            <Head title="Admin Donation Monitoring" />

            {/* Stats row */}
            <div className="grid gap-6 md:grid-cols-3">
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
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-2xl">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Cash Payments</p>
                        <h4 className="text-2xl font-black text-paw-navy dark:text-white mt-1">{stats.pendingCashCount} Payments</h4>
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
            </div>

            {/* Tabs control */}
            <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-2 flex gap-2">
                <button
                    onClick={() => setActiveTab('donations')}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'donations' ? 'bg-paw-navy text-white' : 'text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-900/50'}`}
                >
                    Donation Records
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'inventory' ? 'bg-paw-navy text-white' : 'text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-900/50'}`}
                >
                    In-Kind Inventory ({inventory.length})
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'logs' ? 'bg-paw-navy text-white' : 'text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-900/50'}`}
                >
                    Inventory Audit Logs
                </button>
            </div>

            {/* Active Tab Panel */}
            <div className="space-y-6">
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
                                        onChange={handleTypeChange}
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
                                        onChange={handleStatusChange}
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
                                            <th className="px-6 py-4 text-center">Action</th>
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
                                            donations.data.map((donation) => (
                                                <tr key={donation.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/5 transition-colors">
                                                    <td className="px-6 py-4 font-black text-paw-navy dark:text-white">{donation.public_reference}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-paw-navy dark:text-[#CBD5E1]">
                                                            {donation.donor_name}
                                                            {donation.anonymous && <span className="ml-2 text-xs text-purple-600 bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded-full">Anon</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-400">{donation.donor_email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 capitalize font-bold text-gray-500">
                                                        {donation.type.replace('_', ' ')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {donation.type === 'in_kind' ? (
                                                            <div>
                                                                <div className="font-bold text-paw-navy dark:text-[#CBD5E1]">
                                                                    {donation.in_kind_donation?.description}
                                                                </div>
                                                                {donation.in_kind_donation?.need?.animal && (
                                                                    <div className="text-xs text-paw-orange font-bold">
                                                                        For: {donation.in_kind_donation.need.animal.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="font-black text-paw-orange text-base">₱{Number(donation.amount || 0).toLocaleString()}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-400">
                                                        {new Date(donation.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block text-xs font-black px-2.5 py-1 rounded-full capitalize ${
                                                            donation.status === 'completed' || donation.status === 'verified'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                : donation.status === 'rejected'
                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                                        }`}>
                                                            {donation.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {donation.type === 'in_kind' && donation.status === 'pending_verification' && (
                                                            <button
                                                                onClick={() => handleVerifyClick(donation)}
                                                                className="bg-paw-orange text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-orange-600 transition-all cursor-pointer"
                                                            >
                                                                Verify & Receive
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {donations.total > 0 && donations.links.length > 3 && (
                                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                                    <span className="text-xs font-bold text-gray-450">
                                        Showing {donations.data.length} of {donations.total} records
                                    </span>
                                    
                                    <div className="flex items-center gap-2">
                                        {donations.links.map((link, idx) => {
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
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        {/* Search & Actions bar */}
                        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1 w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    value={invSearchTerm}
                                    onChange={(e) => setInvSearchTerm(e.target.value)}
                                    placeholder="Search supply inventory..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-paw-orange rounded-2xl outline-none font-bold text-sm text-paw-navy dark:text-white"
                                />
                            </div>

                            <button
                                onClick={() => setShowAddItemModal(true)}
                                className="bg-paw-navy text-white py-2.5 px-5 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-paw-orange transition-all flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                            >
                                <Plus size={16} /> Add Inventory Item
                            </button>
                        </div>

                        {/* Inventory stock list */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {inventory.length === 0 ? (
                                <div className="col-span-full bg-white dark:bg-[#111827] border border-dashed rounded-3xl p-12 text-center text-gray-400 font-bold">
                                    No supply inventory items currently in stock. Add one above!
                                </div>
                            ) : (
                                inventory.map((item) => (
                                    <div key={item.id} className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-xs font-black uppercase bg-paw-orange/10 text-paw-orange px-2.5 py-1 rounded-full">
                                                    {item.category}
                                                </span>
                                                <span className="text-xs font-bold text-gray-400">ID: #{item.id}</span>
                                            </div>
                                            <h4 className="text-xl font-black text-paw-navy dark:text-white mb-2">{item.name}</h4>
                                            
                                            <div className="flex items-baseline gap-2 mb-6">
                                                <span className="text-4xl font-black text-paw-navy dark:text-white">
                                                    {item.quantity}
                                                </span>
                                                <span className="text-sm font-bold text-gray-450 uppercase">{item.unit}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setAdjustingItem(item)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-paw-navy text-paw-navy dark:text-[#CBD5E1] py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <ArrowUpDown size={14} /> Adjust Stock Level
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/20">
                            <h3 className="font-black text-paw-navy dark:text-white text-lg">Inventory Transaction Logs</h3>
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                                <Clock size={14} /> Tracking stock movements in real-time
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Item Name</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Changed</th>
                                        <th className="px-6 py-4">Final Stock</th>
                                        <th className="px-6 py-4">Reason / Details</th>
                                        <th className="px-6 py-4">Performed By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                    {inventoryLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-gray-400 font-bold">
                                                No stock adjustment transactions logged yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        inventoryLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/5 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-500 whitespace-nowrap">{log.date}</td>
                                                <td className="px-6 py-4 font-bold text-paw-navy dark:text-white">{log.item_name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block text-xs font-black px-2 py-0.5 rounded-full uppercase ${
                                                        log.action === 'donation_received' 
                                                            ? 'bg-blue-50 text-blue-700' 
                                                            : log.quantity_changed > 0 
                                                                ? 'bg-green-50 text-green-700' 
                                                                : 'bg-red-50 text-red-700'
                                                    }`}>
                                                        {log.action.replace('_', ' ')}
                                                    </span>
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
                    </div>
                )}
            </div>

            {/* VERIFY IN-KIND MODAL */}
            {verifyingInKind && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div onClick={() => setVerifyingInKind(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl">
                        <h3 className="text-2xl font-black text-paw-navy mb-4">Verify & Receive In-Kind Supply</h3>
                        <p className="text-sm text-gray-500 font-bold mb-6">
                            Update the stock supply with the drop-off items from reference: <span className="text-paw-orange font-black">{verifyingInKind.public_reference}</span>.
                        </p>

                        <form onSubmit={submitVerify} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Item Stock Name</label>
                                <input
                                    type="text"
                                    required
                                    value={verifyForm.itemName}
                                    onChange={(e) => setVerifyForm({ ...verifyForm, itemName: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-paw-orange"
                                    placeholder="e.g. Dog Kibble"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Quantity Received</label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={verifyForm.quantity}
                                        onChange={(e) => setVerifyForm({ ...verifyForm, quantity: parseInt(e.target.value) || 1 })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-paw-orange"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Unit</label>
                                    <input
                                        type="text"
                                        required
                                        value={verifyForm.unit}
                                        onChange={(e) => setVerifyForm({ ...verifyForm, unit: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-paw-orange"
                                        placeholder="e.g. kg, boxes"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Supply Category</label>
                                <select
                                    value={verifyForm.category}
                                    onChange={(e) => setVerifyForm({ ...verifyForm, category: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-paw-orange"
                                >
                                    <option value="Food">Food / Feed</option>
                                    <option value="Medicine">Medicine / Healthcare</option>
                                    <option value="Supplies">Bedding / Shelter Supplies</option>
                                    <option value="Other">Other Category</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setVerifyingInKind(null)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-paw-orange text-white hover:bg-orange-600 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Verify & Add
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
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl">
                        <h3 className="text-2xl font-black text-paw-navy mb-4">Add Inventory Item</h3>
                        <p className="text-sm text-gray-500 font-bold mb-6">Create a new supply item profile tracking category and unit metrics.</p>

                        <form onSubmit={submitAddItem} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    value={addItemForm.name}
                                    onChange={(e) => setAddItemForm({ ...addItemForm, name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-paw-orange"
                                    placeholder="e.g. Cat Kibble (Dry)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Initial Stock</label>
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        value={addItemForm.quantity}
                                        onChange={(e) => setAddItemForm({ ...addItemForm, quantity: parseInt(e.target.value) || 0 })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-paw-orange"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Unit</label>
                                    <input
                                        type="text"
                                        required
                                        value={addItemForm.unit}
                                        onChange={(e) => setAddItemForm({ ...addItemForm, unit: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-paw-orange"
                                        placeholder="e.g. kg, bags"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Category</label>
                                <select
                                    value={addItemForm.category}
                                    onChange={(e) => setAddItemForm({ ...addItemForm, category: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-paw-orange"
                                >
                                    <option value="Food">Food / Feed</option>
                                    <option value="Medicine">Medicine / Healthcare</option>
                                    <option value="Supplies">Bedding / Shelter Supplies</option>
                                    <option value="Other">Other Category</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddItemModal(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-paw-navy text-white hover:bg-paw-orange py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
                                >
                                    Create Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADJUST STOCK MODAL */}
            {adjustingItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div onClick={() => setAdjustingItem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl">
                        <h3 className="text-2xl font-black text-paw-navy mb-2">Adjust Supply Level</h3>
                        <p className="text-xs text-gray-450 font-bold mb-6">Item: <span className="font-black text-paw-navy">{adjustingItem.name}</span> (Current: {adjustingItem.quantity} {adjustingItem.unit})</p>

                        <form onSubmit={submitAdjust} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Adjustment Action</label>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-150">
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
                                        Remove Stock
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                                    Quantity ({adjustingItem.unit})
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    value={adjustForm.quantity}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) || 1 })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-paw-orange"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Reason / Details</label>
                                <input
                                    type="text"
                                    required
                                    value={adjustForm.reason}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-paw-orange"
                                    placeholder="e.g. Distributed to shelter area, Expired stock"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setAdjustingItem(null)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-2xl font-black text-sm uppercase cursor-pointer"
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

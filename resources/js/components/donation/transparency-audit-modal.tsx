import { AnimatePresence, motion } from 'motion/react';
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ModernSelect } from '@/components/ui/modern-select';
import {
    ShieldCheck,
    X,
    Calendar,
    Filter,
    Download,
    Heart,
    FileText,
    CheckCircle2,
    TrendingUp,
    Sparkles,
    Gift,
    Users,
    DollarSign,
    Search
} from 'lucide-react';

export interface AuditRecord {
    id: number;
    name?: string;
    donor_name: string;
    type: 'cash' | 'in_kind' | 'feeding_sponsorship' | string;
    type_label?: string;
    amount?: number | null;
    formatted_amount?: string | null;
    in_kind_quantity?: string | null;
    purpose: string;
    receipt: string;
    status: string;
    date: string;
    created_at: string;
    time?: string;
    year: number;
    month: number;
}

interface TransparencyAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    records?: AuditRecord[];
}

export function TransparencyAuditModal({
    isOpen,
    onClose,
    records = []
}: TransparencyAuditModalProps) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Filters
    const [periodFilter, setPeriodFilter] = useState<'all' | 'this_month' | 'last_month' | 'this_year'>('this_year');
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Available years from records
    const availableYears = useMemo(() => {
        const yearsSet = new Set<number>();
        yearsSet.add(currentYear);
        records.forEach((r) => {
            if (r.year) yearsSet.add(r.year);
        });
        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [records, currentYear]);

    // Handle Quick Period Filter selection
    const handlePeriodChange = (filter: 'all' | 'this_month' | 'last_month' | 'this_year') => {
        setPeriodFilter(filter);
        if (filter === 'all') {
            setSelectedMonth('all');
        } else if (filter === 'this_year') {
            setSelectedYear(currentYear);
            setSelectedMonth('all');
        } else if (filter === 'this_month') {
            setSelectedYear(currentYear);
            setSelectedMonth(currentMonth);
        } else if (filter === 'last_month') {
            const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            setSelectedYear(lastMonthYear);
            setSelectedMonth(lastMonth);
        }
    };

    // Filtered records
    const filteredRecords = useMemo(() => {
        return records.filter((record) => {
            // Type filter
            if (selectedType !== 'all') {
                if (selectedType === 'cash' && record.type !== 'cash') return false;
                if (selectedType === 'in_kind' && record.type !== 'in_kind') return false;
                if (selectedType === 'feeding_sponsorship' && record.type !== 'feeding_sponsorship') return false;
            }

            // Period quick pills
            if (periodFilter === 'this_year') {
                if (record.year !== selectedYear) return false;
            } else if (periodFilter === 'this_month') {
                if (record.year !== currentYear || record.month !== currentMonth) return false;
            } else if (periodFilter === 'last_month') {
                const targetMonth = currentMonth === 1 ? 12 : currentMonth - 1;
                const targetYear = currentMonth === 1 ? currentYear - 1 : currentYear;
                if (record.year !== targetYear || record.month !== targetMonth) return false;
            }

            // Specific Month dropdown filter
            if (selectedMonth !== 'all' && periodFilter === 'this_year') {
                if (record.month !== selectedMonth) return false;
            }

            // Year dropdown filter
            if (selectedYear && periodFilter !== 'all' && periodFilter !== 'this_month' && periodFilter !== 'last_month') {
                if (record.year !== selectedYear) return false;
            }

            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const donor = (record.donor_name || record.name || '').toLowerCase();
                const receipt = (record.receipt || '').toLowerCase();
                const purpose = (record.purpose || '').toLowerCase();
                return donor.includes(query) || receipt.includes(query) || purpose.includes(query);
            }

            return true;
        });
    }, [records, periodFilter, selectedYear, selectedMonth, selectedType, searchQuery, currentYear, currentMonth]);

    // Summary statistics for current filtered view
    const totalRecordsCount = filteredRecords.length;

    const totalAmount = useMemo(() => {
        return filteredRecords.reduce((sum, r) => {
            return sum + (r.amount ? Number(r.amount) : 0);
        }, 0);
    }, [filteredRecords]);

    // Dynamic Period Text
    const dynamicPeriodText = useMemo(() => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        if (periodFilter === 'all') return 'All Time Public Record';
        if (periodFilter === 'this_month') return `${monthNames[currentMonth - 1]} ${currentYear}`;
        if (periodFilter === 'last_month') {
            const lastM = currentMonth === 1 ? 12 : currentMonth - 1;
            const lastY = currentMonth === 1 ? currentYear - 1 : currentYear;
            return `${monthNames[lastM - 1]} ${lastY}`;
        }
        if (selectedMonth !== 'all') {
            return `${monthNames[Number(selectedMonth) - 1]} ${selectedYear}`;
        }
        return `All Months ${selectedYear}`;
    }, [periodFilter, selectedMonth, selectedYear, currentMonth, currentYear]);

    // CSV Export functionality
    const handleExport = () => {
        if (filteredRecords.length === 0) return;

        const headers = ['Receipt Ref', 'Date', 'Donor Name', 'Type', 'Amount (PHP)', 'In-Kind Quantity', 'Purpose / Usage', 'Status'];
        const csvRows = [
            headers.join(','),
            ...filteredRecords.map((r) => {
                const escapeCsv = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;
                return [
                    escapeCsv(r.receipt),
                    escapeCsv(r.date),
                    escapeCsv(r.donor_name || r.name),
                    escapeCsv(r.type_label || r.type),
                    escapeCsv(r.amount || 0),
                    escapeCsv(r.in_kind_quantity || 'N/A'),
                    escapeCsv(r.purpose),
                    escapeCsv(r.status)
                ].join(',');
            })
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `transparency-audit-${selectedYear}-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const monthsList = [
        { value: 'all', label: 'All Months' },
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#0B192C]/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white rounded-[24px] sm:rounded-[32px] md:rounded-[40px] max-w-5xl w-full max-h-[92vh] overflow-hidden relative z-10 shadow-2xl flex flex-col font-quicksand border-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Banner with Blue Ocean Gradient */}
                        <div className="bg-gradient-to-r from-[#0F263E] via-[#174668] to-[#0EA5E9] text-white p-4 sm:p-6 md:p-8 relative rounded-t-[24px] sm:rounded-t-[32px] md:rounded-t-[40px] shrink-0">
                            {/* Top row: Title and Close button */}
                            <div className="flex justify-between items-start gap-3 mb-3.5 sm:mb-6">
                                <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner shrink-0">
                                        <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
                                            Transparency Audit History
                                        </h2>
                                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white/80 tracking-wide mt-0.5">
                                            100% Accountability & Public Record
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                    aria-label="Close modal"
                                >
                                    <X size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                                </button>
                            </div>

                            {/* 3 Metric KPI Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 pt-0.5">
                                {/* Total Records Card */}
                                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-white/15 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white/80">
                                            Total Records
                                        </span>
                                        <span className="text-xs sm:text-sm">🐾</span>
                                    </div>
                                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                                        {totalRecordsCount}
                                    </div>
                                </div>

                                {/* Total Amount Card */}
                                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-white/15">
                                    <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white/80 mb-0.5 sm:mb-1">
                                        Total Amount
                                    </div>
                                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-white truncate">
                                        ₱{totalAmount.toLocaleString()}
                                    </div>
                                </div>

                                {/* Period Card */}
                                <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl px-3 py-2 sm:p-4 border border-white/15 flex items-center justify-between gap-2 sm:block">
                                    <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white/80 sm:mb-1 shrink-0">
                                        Period
                                    </div>
                                    <div className="text-xs sm:text-base md:text-lg font-black text-white truncate">
                                        {dynamicPeriodText}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Bar Controls */}
                        <div className="bg-white px-3.5 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
                            {/* Quick Period Buttons */}
                            <div className="flex flex-nowrap items-center gap-1 sm:gap-2 w-full sm:w-auto">
                                {(
                                    [
                                        { key: 'all', label: 'All Time' },
                                        { key: 'this_month', label: 'This Month' },
                                        { key: 'last_month', label: 'Last Month' },
                                        { key: 'this_year', label: 'This Year' },
                                    ] as const
                                ).map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => handlePeriodChange(tab.key)}
                                        className={`flex-1 sm:flex-initial justify-center px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
                                            periodFilter === tab.key
                                                ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/25 sm:scale-[1.02]'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Dropdowns and Export Action */}
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
                                {/* Year Picker */}
                                <div className="min-w-0 sm:min-w-[100px]">
                                    <ModernSelect
                                        size="sm"
                                        searchable={false}
                                        value={String(selectedYear)}
                                        onChange={(val) => {
                                            setSelectedYear(Number(val));
                                            setPeriodFilter('this_year');
                                        }}
                                        options={availableYears.map((yr) => ({
                                            value: String(yr),
                                            label: String(yr),
                                        }))}
                                    />
                                </div>

                                {/* Month Picker */}
                                <div className="min-w-0 sm:min-w-[140px]">
                                    <ModernSelect
                                        size="sm"
                                        searchable={false}
                                        value={String(selectedMonth)}
                                        onChange={(val) => {
                                            setSelectedMonth(val === 'all' ? 'all' : Number(val));
                                            setPeriodFilter('this_year');
                                        }}
                                        options={monthsList.map((m) => ({
                                            value: String(m.value),
                                            label: m.label,
                                        }))}
                                    />
                                </div>

                                {/* Type Picker */}
                                <div className="min-w-0 sm:min-w-[140px]">
                                    <ModernSelect
                                        size="sm"
                                        searchable={false}
                                        value={selectedType}
                                        onChange={(val) => setSelectedType(val)}
                                        options={[
                                            { value: 'all', label: 'All Types' },
                                            { value: 'cash', label: 'Cash Only' },
                                            { value: 'in_kind', label: 'In-Kind Only' },
                                            { value: 'feeding_sponsorship', label: 'Sponsor Feeding' },
                                        ]}
                                    />
                                </div>

                                {/* Export Button */}
                                <button
                                    onClick={handleExport}
                                    disabled={filteredRecords.length === 0}
                                    className="w-full sm:w-auto justify-center bg-[#1E293B] hover:bg-[#0F172A] disabled:opacity-50 text-white px-4 py-2 rounded-2xl text-xs md:text-sm font-black flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                                    title="Export filtered records as CSV"
                                >
                                    <Download size={14} />
                                    <span>Export</span>
                                </button>
                            </div>
                        </div>

                        {/* Audit Records List (Scrollable Area) */}
                        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 md:p-6 space-y-3 sm:space-y-4 bg-[#F8FAFC]">
                            {filteredRecords.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
                                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <FileText size={32} />
                                    </div>
                                    <h4 className="text-lg font-black text-gray-800 mb-1">No Public Records Found</h4>
                                    <p className="text-sm font-bold text-gray-400 max-w-md mx-auto">
                                        There are no verified donations matching your selected filter period ({dynamicPeriodText}).
                                    </p>
                                </div>
                            ) : (
                                filteredRecords.map((record) => {
                                    const isCash = record.type === 'cash';
                                    const isInKind = record.type === 'in_kind';
                                    const isSponsor = record.type === 'feeding_sponsorship';

                                    return (
                                        <motion.div
                                            key={record.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow relative"
                                        >
                                            {/* Top line: Donor Info & Type Badge on Left, Amount/Value on Right */}
                                            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                                                <div className="flex items-center gap-3.5">
                                                    {/* Heart Icon Circle */}
                                                    <div className="w-11 h-11 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
                                                        <Heart size={20} className="stroke-[2.5]" />
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center gap-2.5 flex-wrap">
                                                            <h4 className="font-black text-gray-900 text-base md:text-lg">
                                                                {record.donor_name || record.name || 'Anonymous Donor'}
                                                            </h4>

                                                            {/* Distinct Badges for Cash, In-Kind, and Sponsor Feeding */}
                                                            {isCash && (
                                                                <span className="bg-[#D1FAE5] text-[#065F46] font-black text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                                                                    Cash
                                                                </span>
                                                            )}
                                                            {isInKind && (
                                                                <span className="bg-[#DBEAFE] text-[#1E40AF] font-black text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                                                                    In-Kind
                                                                </span>
                                                            )}
                                                            {isSponsor && (
                                                                <span className="bg-[#FEF3C7] text-[#92400E] font-black text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                                                                    Sponsor Feeding
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-xs font-bold text-gray-400 mt-0.5">
                                                            {record.date}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Amount / In-Kind Quantity Display */}
                                                <div className="text-right ml-auto">
                                                    {record.amount ? (
                                                        <div className="text-2xl md:text-3xl font-black text-[#F59E0B] tracking-tight">
                                                            ₱{record.amount.toLocaleString()}
                                                        </div>
                                                    ) : (
                                                        <div className="text-lg md:text-xl font-black text-sky-600">
                                                            {record.in_kind_quantity || 'In-Kind Supplies'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* USAGE / PURPOSE Box */}
                                            <div className="bg-[#F8FAFC] rounded-2xl p-3.5 md:p-4 my-3 border border-[#F1F5F9]">
                                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                                    USAGE / PURPOSE
                                                </span>
                                                <p className="text-sm font-bold text-gray-700 leading-relaxed">
                                                    {record.purpose}
                                                </p>
                                            </div>

                                            {/* Metadata Footer: Receipt and Verified Status */}
                                            <div className="flex items-center justify-between pt-1 text-xs font-bold text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <FileText size={14} className="text-gray-400" />
                                                    <span>Receipt: {record.receipt}</span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-emerald-600 font-black">
                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                    <span>Verified</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex items-center justify-between gap-3 rounded-b-[24px] sm:rounded-b-[32px] md:rounded-b-[40px] shrink-0">
                            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-gray-500 min-w-0">
                                <span className="flex h-2.5 w-2.5 relative shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="leading-snug">Updated in real-time • Last sync: Just now</span>
                            </div>

                            <button
                                onClick={onClose}
                                className="bg-[#1E293B] hover:bg-[#0F172A] text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-colors cursor-pointer shadow-sm shrink-0"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

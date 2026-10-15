import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { 
    TrendingUp, AlertTriangle, Zap, Save, History, Plus, 
    ArrowUpRight, Clock, HelpCircle, CheckCircle2 
} from 'lucide-react';
import type { CareSustainabilityData, CareSustainabilityHistoryItem } from '@/types/care-sustainability';
import { useCareCountdown } from '@/hooks/use-care-countdown';
import { SustainabilityHistoryModal } from './sustainability-history-modal';

interface SustainabilityAdminTabProps {
    sustainability: CareSustainabilityData;
    history: CareSustainabilityHistoryItem[];
}

export function SustainabilityAdminTab({
    sustainability,
    history,
}: SustainabilityAdminTabProps) {
    const countdown = useCareCountdown(sustainability);

    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Form states
    const [verifiedFunds, setVerifiedFunds] = useState<string>(
        sustainability.verified_funds ? String(sustainability.verified_funds) : '4250'
    );
    const [dailyCost, setDailyCost] = useState<string>(
        sustainability.daily_cost ? String(sustainability.daily_cost) : '500'
    );
    const [resourceCategory, setResourceCategory] = useState<string>(
        sustainability.resource_category || 'General Animal Care'
    );
    const [updatedByName, setUpdatedByName] = useState<string>(
        sustainability.updated_by_name || 'ISF Admin'
    );
    const [calculationNotes, setCalculationNotes] = useState<string>(
        sustainability.calculation_notes || ''
    );

    // Thresholds
    const [thresholdStable, setThresholdStable] = useState<string>(
        String(sustainability.thresholds?.stable ?? 7)
    );
    const [thresholdNeedsSupport, setThresholdNeedsSupport] = useState<string>(
        String(sustainability.thresholds?.needs_support ?? 3)
    );
    const [thresholdUrgent, setThresholdUrgent] = useState<string>(
        String(sustainability.thresholds?.urgent ?? 1)
    );
    const [thresholdCritical, setThresholdCritical] = useState<string>(
        String(sustainability.thresholds?.critical ?? 0.25)
    );

    // Extend Timer Form
    const [extendAmount, setExtendAmount] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStatusTheme = () => {
        switch (countdown.urgencyStatus) {
            case 'STABLE':
                return {
                    badgeClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
                    timerColor: 'text-emerald-400',
                    badgeText: 'STABLE',
                };
            case 'NEEDS SUPPORT':
                return {
                    badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
                    timerColor: 'text-amber-400',
                    badgeText: 'NEEDS SUPPORT',
                };
            case 'URGENT':
                return {
                    badgeClass: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
                    timerColor: 'text-orange-400',
                    badgeText: 'URGENT',
                };
            case 'CRITICAL':
                return {
                    badgeClass: 'border-red-500/40 bg-red-500/10 text-red-400',
                    timerColor: 'text-[#ff5c5c]',
                    badgeText: 'CRITICAL',
                };
            case 'DEPLETED':
            default:
                return {
                    badgeClass: 'border-red-600/50 bg-red-950/40 text-red-400',
                    timerColor: 'text-[#ff5c5c]',
                    badgeText: 'DEPLETED',
                };
        }
    };

    const theme = getStatusTheme();

    const handleSaveAndRecalculate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            '/account/admin/donation-monitoring/sustainability/recalculate',
            {
                verified_funds: parseFloat(verifiedFunds) || 0,
                daily_cost: parseFloat(dailyCost) || 500,
                resource_category: resourceCategory,
                calculation_notes: calculationNotes,
                threshold_stable_days: parseFloat(thresholdStable) || 7,
                threshold_needs_support_days: parseFloat(thresholdNeedsSupport) || 3,
                threshold_urgent_days: parseFloat(thresholdUrgent) || 1,
                threshold_critical_days: parseFloat(thresholdCritical) || 0.25,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Care sustainability successfully recalculated!');
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    toast.error('Failed to recalculate: ' + Object.values(errors).join(', '));
                    setIsSubmitting(false);
                },
            }
        );
    };

    const handleSaveConfigOnly = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            '/account/admin/donation-monitoring/sustainability/config',
            {
                daily_cost: parseFloat(dailyCost) || 500,
                resource_category: resourceCategory,
                calculation_notes: calculationNotes,
                threshold_stable_days: parseFloat(thresholdStable) || 7,
                threshold_needs_support_days: parseFloat(thresholdNeedsSupport) || 3,
                threshold_urgent_days: parseFloat(thresholdUrgent) || 1,
                threshold_critical_days: parseFloat(thresholdCritical) || 0.25,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Care configuration saved successfully.');
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    toast.error('Failed to save config: ' + Object.values(errors).join(', '));
                    setIsSubmitting(false);
                },
            }
        );
    };

    const handleExtendTimer = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(extendAmount);
        if (!amt || amt <= 0) {
            toast.error('Please enter a valid donation amount to extend the timer.');
            return;
        }

        setIsSubmitting(true);

        router.post(
            '/account/admin/donation-monitoring/sustainability/extend',
            {
                amount: amt,
                notes: `Extended by admin with verified amount of ₱${amt.toLocaleString()}`,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Care timer extended by ₱${amt.toLocaleString()}!`);
                    setExtendAmount('');
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    toast.error('Failed to extend timer: ' + Object.values(errors).join(', '));
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            {/* Top Container */}
            <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
                            <TrendingUp size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-wider uppercase text-paw-navy dark:text-white">
                                Sustainability Calculation
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Admin-controlled care sustainability configuration
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowHistoryModal(true)}
                            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <History size={15} />
                            Calculation History ({history.length})
                        </button>

                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border ${theme.badgeClass}`}>
                            <AlertTriangle size={13} className="shrink-0" />
                            {theme.badgeText}
                        </span>
                    </div>
                </div>

                {/* CURRENT LIVE TIMER CARD */}
                <div className="mt-6 bg-[#0e141f] border border-gray-800 rounded-2xl p-6 text-center text-white relative overflow-hidden">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">
                        Current Live Timer
                    </p>
                    <div className={`flex items-center justify-center gap-2 sm:gap-4 whitespace-nowrap font-mono font-black ${theme.timerColor}`}>
                        <div className="flex flex-col items-center min-w-[50px] sm:min-w-[64px]">
                            <span className="text-3xl sm:text-5xl tracking-tight leading-none">{countdown.daysStr}</span>
                            <span className="text-xs sm:text-sm font-black text-gray-400 mt-1.5 uppercase">D</span>
                        </div>
                        <span className="text-2xl sm:text-4xl opacity-40 pb-4 leading-none">:</span>
                        <div className="flex flex-col items-center min-w-[50px] sm:min-w-[64px]">
                            <span className="text-3xl sm:text-5xl tracking-tight leading-none">{countdown.hoursStr}</span>
                            <span className="text-xs sm:text-sm font-black text-gray-400 mt-1.5 uppercase">H</span>
                        </div>
                        <span className="text-2xl sm:text-4xl opacity-40 pb-4 leading-none">:</span>
                        <div className="flex flex-col items-center min-w-[50px] sm:min-w-[64px]">
                            <span className="text-3xl sm:text-5xl tracking-tight leading-none">{countdown.minutesStr}</span>
                            <span className="text-xs sm:text-sm font-black text-gray-400 mt-1.5 uppercase">M</span>
                        </div>
                        <span className="text-2xl sm:text-4xl opacity-40 pb-4 leading-none">:</span>
                        <div className="flex flex-col items-center min-w-[50px] sm:min-w-[64px]">
                            <span className="text-3xl sm:text-5xl tracking-tight leading-none">{countdown.secondsStr}</span>
                            <span className="text-xs sm:text-sm font-black text-gray-400 mt-1.5 uppercase">S</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 font-medium">
                        Est. sustainability endpoint: <span className="text-gray-200 font-bold">{sustainability.formatted_endpoint}</span>
                    </p>
                </div>

                {/* CONFIGURATION FORM */}
                <form className="mt-8 space-y-6">
                    {/* Row 1: Funds and Daily Cost */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                                Verified Care Funds (₱)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={verifiedFunds}
                                onChange={(e) => setVerifiedFunds(e.target.value)}
                                placeholder="4250"
                                className="w-full px-4 py-3 bg-white dark:bg-[#0a0f18] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:border-paw-navy dark:focus:border-paw-orange transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                                Est. Daily Care Cost (₱)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={dailyCost}
                                onChange={(e) => setDailyCost(e.target.value)}
                                placeholder="500"
                                className="w-full px-4 py-3 bg-white dark:bg-[#0a0f18] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:border-paw-navy dark:focus:border-paw-orange transition-colors"
                            />
                        </div>
                    </div>

                    {/* Row 2: Resource Category and Updated By */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                                Resource Category
                            </label>
                            <input
                                type="text"
                                value={resourceCategory}
                                onChange={(e) => setResourceCategory(e.target.value)}
                                placeholder="General Animal Care"
                                className="w-full px-4 py-3 bg-white dark:bg-[#0a0f18] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:border-paw-navy dark:focus:border-paw-orange transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                                Updated By
                            </label>
                            <input
                                type="text"
                                value={updatedByName}
                                onChange={(e) => setUpdatedByName(e.target.value)}
                                placeholder="ISF Admin"
                                className="w-full px-4 py-3 bg-white dark:bg-[#0a0f18] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:border-paw-navy dark:focus:border-paw-orange transition-colors"
                            />
                        </div>
                    </div>

                    {/* Row 3: Calculation Notes */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                            Calculation Notes
                        </label>
                        <input
                            type="text"
                            value={calculationNotes}
                            onChange={(e) => setCalculationNotes(e.target.value)}
                            placeholder="Optional note about this update"
                            className="w-full px-4 py-3 bg-white dark:bg-[#0a0f18] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:border-paw-navy dark:focus:border-paw-orange transition-colors"
                        />
                    </div>

                    {/* Row 4: Urgency Thresholds (Days) */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
                            Urgency Thresholds (Days)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 bg-gray-50/80 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 rounded-2xl">
                                <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                                    Stable (≥)
                                </span>
                                <input
                                    type="number"
                                    step="any"
                                    value={thresholdStable}
                                    onChange={(e) => setThresholdStable(e.target.value)}
                                    placeholder="7"
                                    className="w-full px-3 py-1.5 bg-white dark:bg-[#0a0f18] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold"
                                />
                            </div>

                            <div className="p-3 bg-gray-50/80 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 rounded-2xl">
                                <span className="block text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                                    Needs Support (≥)
                                </span>
                                <input
                                    type="number"
                                    step="any"
                                    value={thresholdNeedsSupport}
                                    onChange={(e) => setThresholdNeedsSupport(e.target.value)}
                                    placeholder="3"
                                    className="w-full px-3 py-1.5 bg-white dark:bg-[#0a0f18] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold"
                                />
                            </div>

                            <div className="p-3 bg-gray-50/80 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 rounded-2xl">
                                <span className="block text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1">
                                    Urgent (≥)
                                </span>
                                <input
                                    type="number"
                                    step="any"
                                    value={thresholdUrgent}
                                    onChange={(e) => setThresholdUrgent(e.target.value)}
                                    placeholder="1"
                                    className="w-full px-3 py-1.5 bg-white dark:bg-[#0a0f18] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold"
                                />
                            </div>

                            <div className="p-3 bg-gray-50/80 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 rounded-2xl">
                                <span className="block text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                                    Critical (≥)
                                </span>
                                <input
                                    type="number"
                                    step="any"
                                    value={thresholdCritical}
                                    onChange={(e) => setThresholdCritical(e.target.value)}
                                    placeholder="0.25"
                                    className="w-full px-3 py-1.5 bg-white dark:bg-[#0a0f18] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleSaveAndRecalculate}
                            className="px-6 py-3.5 rounded-2xl bg-[#ff9800] hover:bg-[#f57c00] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 whitespace-nowrap transition-transform active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
                        >
                            <TrendingUp size={16} className="shrink-0" />
                            <span>Save & Recalculate</span>
                        </button>

                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleSaveConfigOnly}
                            className="px-6 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                        >
                            <Save size={16} className="shrink-0" />
                            <span>Save Config Only</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* EXTEND BY VERIFIED DONATION CARD */}
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-6 shadow-sm">
                <div className="space-y-1 mb-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Plus size={15} /> Extend By Verified Donation
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Only use after a donation has been fully verified as eligible for the care fund. This permanently extends the sustainability endpoint.
                    </p>
                </div>

                <form onSubmit={handleExtendTimer} className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <input
                            type="number"
                            step="any"
                            value={extendAmount}
                            onChange={(e) => setExtendAmount(e.target.value)}
                            placeholder="Verified amount (₱)"
                            className="w-full px-4 py-3 bg-white dark:bg-[#0e1622] border border-emerald-300 dark:border-emerald-800 rounded-2xl text-sm font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !extendAmount}
                        className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                        <TrendingUp size={15} />
                        Extend Timer
                    </button>
                </form>
            </div>

            {/* History Modal */}
            <SustainabilityHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                history={history}
            />
        </div>
    );
}

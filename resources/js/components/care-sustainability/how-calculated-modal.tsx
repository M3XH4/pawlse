import React from 'react';
import { X, Calculator, ShieldCheck, Heart, Sparkles, HelpCircle, ArrowRight, Activity, Clock } from 'lucide-react';
import { Link } from '@inertiajs/react';
import type { CareSustainabilityData } from '@/types/care-sustainability';

interface HowCalculatedModalProps {
    isOpen: boolean;
    onClose: () => void;
    data?: CareSustainabilityData | null;
    estDays?: string;
    urgencyStatus?: string;
}

export function HowCalculatedModal({
    isOpen,
    onClose,
    data,
    estDays = '0.0',
    urgencyStatus = 'DEPLETED',
}: HowCalculatedModalProps) {
    if (!isOpen) return null;

    const dailyCost = data?.daily_cost || 500;
    const verifiedFunds = data?.verified_funds || 0;
    const hoursRemaining = Math.max(0, Math.round(parseFloat(estDays) * 24));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-xl bg-white dark:bg-[#121824] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden text-gray-800 dark:text-gray-100 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-paw-orange/10 text-paw-orange flex items-center justify-center font-black">
                            <Calculator size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-paw-navy dark:text-white">How Care Time is Calculated</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">100% transparent shelter care sustainability metric</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* The core formula */}
                    <div className="bg-gradient-to-br from-paw-navy/5 via-paw-orange/5 to-transparent dark:from-paw-navy/20 dark:via-paw-orange/10 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800">
                        <p className="text-[11px] font-black uppercase tracking-wider text-paw-orange mb-1 flex items-center gap-1.5">
                            <Activity size={14} /> The Sustainability Equation
                        </p>
                        <div className="text-center py-3 bg-white dark:bg-[#0e141f] rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm font-mono text-sm sm:text-base font-bold text-paw-navy dark:text-white">
                            <span className="text-emerald-600 dark:text-emerald-400">Verified Care Funds (₱)</span>
                            <span className="text-gray-400 mx-2">÷</span>
                            <span className="text-paw-orange">Est. Daily Care Cost (₱/day)</span>
                            <span className="text-gray-400 mx-2">=</span>
                            <span className="text-red-500 dark:text-red-400 font-black">Days Remaining</span>
                        </div>
                    </div>

                    {/* Live figures */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Verified Funds</span>
                            <p className="text-lg font-black text-paw-navy dark:text-white">₱{verifiedFunds.toLocaleString()}</p>
                        </div>
                        <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Daily Care Rate</span>
                            <p className="text-lg font-black text-paw-orange">₱{dailyCost.toLocaleString()}<span className="text-xs font-normal text-gray-400">/day</span></p>
                        </div>
                        <div className="col-span-2 sm:col-span-1 p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Time Remaining</span>
                            <p className="text-lg font-black text-red-500 dark:text-red-400">{estDays} est. days</p>
                        </div>
                    </div>

                    {/* Daily Care Breakdown */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-emerald-500" /> What ₱{dailyCost.toLocaleString()} Covers Each Day
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                                <p className="font-bold text-paw-navy dark:text-white flex items-center gap-1.5">
                                    🍗 Nutrition & Feeding
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">High-protein meals and water supplies for all rescued stray animals.</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                                <p className="font-bold text-paw-navy dark:text-white flex items-center gap-1.5">
                                    🩺 Medical & Treatment
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">Vaccines, wound care, deworming, and emergency veterinary assistance.</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                                <p className="font-bold text-paw-navy dark:text-white flex items-center gap-1.5">
                                    🏡 Kennel Shelter & Sanitation
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">Clean bedding, regular disinfectant runs, and safe dry housing.</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                                <p className="font-bold text-paw-navy dark:text-white flex items-center gap-1.5">
                                    🚑 First Response Rescue
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">Vehicle fuel and rescue supplies to respond to community SOS reports.</p>
                            </div>
                        </div>
                    </div>

                    {/* How your donation extends it */}
                    <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-xs text-red-950 dark:text-red-200">
                        <p className="font-bold flex items-center gap-1.5 text-red-600 dark:text-red-400 mb-1">
                            <Clock size={14} /> Immediate Impact of Your Donation
                        </p>
                        <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                            Whenever a donation is verified, our system instantly converts every peso into shelter care time. 
                            A gift of <strong>₱50</strong> provides ~2.4 hours of care, <strong>₱250</strong> provides half a day, and <strong>₱500</strong> keeps the shelter running for an entire extra day!
                        </p>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl font-bold text-xs text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                    <Link
                        href="/donate"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-md shadow-red-500/20 flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <Heart size={14} className="fill-white" />
                        Donate to Extend Care
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

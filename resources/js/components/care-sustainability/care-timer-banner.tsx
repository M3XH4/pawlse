import React, { useState } from 'react';
import { AlertTriangle, Heart, HelpCircle, ArrowDown } from 'lucide-react';
import type { CareSustainabilityData } from '@/types/care-sustainability';
import { useCareCountdown } from '@/hooks/use-care-countdown';
import { HowCalculatedModal } from './how-calculated-modal';

interface CareTimerBannerProps {
    sustainability?: CareSustainabilityData | null;
    onScrollToDonate?: () => void;
}

export function CareTimerBanner({ sustainability, onScrollToDonate }: CareTimerBannerProps) {
    const [showModal, setShowModal] = useState(false);
    const countdown = useCareCountdown(sustainability);

    const getStatusTheme = () => {
        switch (countdown.urgencyStatus) {
            case 'STABLE':
                return {
                    badgeClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
                    timerColor: 'text-emerald-400',
                    labelColor: 'text-emerald-400',
                    barColor: 'bg-emerald-500',
                    badgeText: 'STABLE',
                };
            case 'NEEDS SUPPORT':
                return {
                    badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
                    timerColor: 'text-amber-400',
                    labelColor: 'text-amber-400',
                    barColor: 'bg-amber-500',
                    badgeText: 'NEEDS SUPPORT',
                };
            case 'URGENT':
                return {
                    badgeClass: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
                    timerColor: 'text-orange-400',
                    labelColor: 'text-orange-400',
                    barColor: 'bg-orange-500',
                    badgeText: 'URGENT',
                };
            case 'CRITICAL':
                return {
                    badgeClass: 'border-red-500/40 bg-red-500/10 text-red-400',
                    timerColor: 'text-[#ff5c5c]',
                    labelColor: 'text-[#ff5c5c]',
                    barColor: 'bg-red-500',
                    badgeText: 'CRITICAL',
                };
            case 'DEPLETED':
            default:
                return {
                    badgeClass: 'border-red-600/50 bg-red-950/40 text-red-400',
                    timerColor: 'text-[#ff5c5c]',
                    labelColor: 'text-[#ff5c5c]',
                    barColor: 'bg-red-600',
                    badgeText: 'DEPLETED',
                };
        }
    };

    const theme = getStatusTheme();

    const handleHelpExtend = () => {
        if (onScrollToDonate) {
            onScrollToDonate();
            return;
        }

        const donationSection = document.getElementById('donation-form') || document.getElementById('donation-options') || document.getElementById('donate-types');
        if (donationSection) {
            donationSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <div className="w-full bg-[#0d1522] border border-gray-800/80 rounded-3xl p-5 sm:p-6 shadow-xl text-white relative overflow-hidden font-quicksand my-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Left: Info & status badge */}
                    <div className="space-y-2">
                        <div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase border ${theme.badgeClass}`}>
                                <AlertTriangle size={12} className="shrink-0" />
                                {theme.badgeText}
                            </span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            Extend Their Care
                        </h4>
                        <p className="text-xs text-gray-400">
                            Estimated care time remaining
                        </p>
                    </div>

                    {/* Center: Live countdown digits */}
                    <div className="text-center flex flex-col items-center justify-center py-2 sm:py-0">
                        <div className={`flex items-center justify-center gap-1.5 sm:gap-2.5 whitespace-nowrap font-mono font-black ${theme.timerColor}`}>
                            <div className="flex flex-col items-center min-w-[38px] sm:min-w-[48px]">
                                <span className="text-2xl sm:text-3xl md:text-4xl tracking-tight leading-none">{countdown.daysStr}</span>
                                <span className="text-[10px] sm:text-xs font-black text-gray-400 mt-1 uppercase">D</span>
                            </div>
                            <span className="text-xl sm:text-2xl md:text-3xl opacity-40 pb-3 leading-none">:</span>
                            <div className="flex flex-col items-center min-w-[38px] sm:min-w-[48px]">
                                <span className="text-2xl sm:text-3xl md:text-4xl tracking-tight leading-none">{countdown.hoursStr}</span>
                                <span className="text-[10px] sm:text-xs font-black text-gray-400 mt-1 uppercase">H</span>
                            </div>
                            <span className="text-xl sm:text-2xl md:text-3xl opacity-40 pb-3 leading-none">:</span>
                            <div className="flex flex-col items-center min-w-[38px] sm:min-w-[48px]">
                                <span className="text-2xl sm:text-3xl md:text-4xl tracking-tight leading-none">{countdown.minutesStr}</span>
                                <span className="text-[10px] sm:text-xs font-black text-gray-400 mt-1 uppercase">M</span>
                            </div>
                            <span className="text-xl sm:text-2xl md:text-3xl opacity-40 pb-3 leading-none">:</span>
                            <div className="flex flex-col items-center min-w-[38px] sm:min-w-[48px]">
                                <span className="text-2xl sm:text-3xl md:text-4xl tracking-tight leading-none">{countdown.secondsStr}</span>
                                <span className="text-[10px] sm:text-xs font-black text-gray-400 mt-1 uppercase">S</span>
                            </div>
                        </div>
                        <span className={`text-[10px] sm:text-[11px] font-black tracking-widest uppercase mt-2 ${theme.labelColor}`}>
                            {countdown.urgencyLabel}
                        </span>
                    </div>

                    {/* Right: Sustainability status & action buttons */}
                    <div className="flex flex-col md:items-end justify-between space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <span>Care Sustainability</span>
                            <span className="text-white font-black">{countdown.estDays}d est.</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={handleHelpExtend}
                                className="inline-flex items-center gap-1.5 text-xs font-black text-red-500 hover:text-red-400 uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                <Heart size={14} className="fill-red-500" />
                                Help Extend This
                            </button>

                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                <HelpCircle size={14} />
                                How Calculated?
                            </button>
                        </div>

                        <p className="text-[10px] text-gray-500">
                            Last updated {sustainability?.last_updated_formatted || 'Recently'} · {sustainability?.resource_category || 'General Animal Care'} · Actual needs and expenses may vary
                        </p>
                    </div>
                </div>
            </div>

            {/* How Calculated Modal */}
            <HowCalculatedModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                data={sustainability}
                estDays={countdown.estDays}
                urgencyStatus={countdown.urgencyStatus}
            />
        </>
    );
}

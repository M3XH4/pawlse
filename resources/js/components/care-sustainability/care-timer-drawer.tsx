import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Heart, HelpCircle, ChevronLeft, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import type { CareSustainabilityData } from '@/types/care-sustainability';
import { useCareCountdown } from '@/hooks/use-care-countdown';
import { HowCalculatedModal } from './how-calculated-modal';

interface CareTimerDrawerProps {
    sustainability?: CareSustainabilityData | null;
}

const STORAGE_KEY = 'pawlse_care_timer_drawer_open';

export function CareTimerDrawer({ sustainability: propSustainability }: CareTimerDrawerProps = {}) {
    const { url } = usePage();
    const pageProps = usePage().props as { careSustainability?: CareSustainabilityData };
    const sustainability = propSustainability || pageProps.careSustainability;

    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                setIsOpen(saved === 'true');
            }
        } catch {
            // Ignore storage access errors
        }

        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue !== null) {
                setIsOpen(e.newValue === 'true');
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const toggleDrawer = (open: boolean) => {
        setIsOpen(open);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, String(open));
        }
    };

    const pathname = (url || '').split('?')[0].replace(/\/+$/, '') || '/';

    const excludedPaths = [
        '/sos',
        '/rescue',
        '/missing',
        '/volunteer',
        '/donate',
        '/checkout',
        '/account',
        '/settings',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
    ];

    const isExcluded = excludedPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

    if (isExcluded || !sustainability) {
        return null;
    }

    const countdown = useCareCountdown(sustainability);

    const getStatusTheme = () => {
        switch (countdown.urgencyStatus) {
            case 'STABLE':
                return {
                    badgeClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
                    dotClass: 'bg-emerald-400',
                    timerColor: 'text-emerald-400',
                    labelColor: 'text-emerald-400',
                    barColor: 'bg-emerald-500',
                    badgeText: 'STABLE',
                };
            case 'NEEDS SUPPORT':
                return {
                    badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
                    dotClass: 'bg-amber-400',
                    timerColor: 'text-amber-400',
                    labelColor: 'text-amber-400',
                    barColor: 'bg-amber-500',
                    badgeText: 'NEEDS SUPPORT',
                };
            case 'URGENT':
                return {
                    badgeClass: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
                    dotClass: 'bg-orange-400',
                    timerColor: 'text-orange-400',
                    labelColor: 'text-orange-400',
                    barColor: 'bg-orange-500',
                    badgeText: 'URGENT',
                };
            case 'CRITICAL':
                return {
                    badgeClass: 'border-red-500/40 bg-red-500/10 text-red-400',
                    dotClass: 'bg-red-400',
                    timerColor: 'text-[#ff5c5c]',
                    labelColor: 'text-[#ff5c5c]',
                    barColor: 'bg-red-500',
                    badgeText: 'CRITICAL',
                };
            case 'DEPLETED':
            default:
                return {
                    badgeClass: 'border-red-600/50 bg-red-950/40 text-red-400',
                    dotClass: 'bg-red-500',
                    timerColor: 'text-[#ff5c5c]',
                    labelColor: 'text-[#ff5c5c]',
                    barColor: 'bg-red-600',
                    badgeText: 'DEPLETED',
                };
        }
    };

    const theme = getStatusTheme();

    return (
        <>
            <div className="fixed bottom-6 left-4 sm:left-6 z-40 select-none">
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="expanded-drawer"
                            initial={{ x: -350, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -350, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="relative w-[340px] sm:w-[380px] bg-[#12161a] border border-gray-800/80 rounded-3xl p-6 shadow-2xl shadow-black/60 backdrop-blur-md text-white overflow-hidden"
                        >
                            {/* Hide / Collapse Chevron Tab */}
                            <button
                                onClick={() => toggleDrawer(false)}
                                title="Minimize care timer"
                                className="absolute top-4 right-4 w-7 h-7 rounded-xl bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Status Badge */}
                            <div className="mb-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border ${theme.badgeClass}`}>
                                    <AlertTriangle size={13} className="shrink-0" />
                                    {theme.badgeText}
                                </span>
                            </div>

                            {/* Headline & Subtitle */}
                            <h3 className="text-2xl font-black tracking-tight text-white font-quicksand">
                                Extend Their Care
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                Every verified contribution can help extend the estimated care period.
                            </p>

                            {/* Live Countdown Timer */}
                            <div className="mt-5 mb-1">
                                <div className={`flex items-center justify-start gap-1 sm:gap-2 whitespace-nowrap font-mono font-black ${theme.timerColor}`}>
                                    <div className="flex flex-col items-center min-w-[40px] sm:min-w-[46px]">
                                        <span suppressHydrationWarning className="text-2xl sm:text-3xl tracking-tight leading-none">{countdown.daysStr}</span>
                                        <span className="text-[10px] sm:text-xs font-black text-gray-400 mt-1 uppercase">D</span>
                                    </div>
                                    <span className="text-lg sm:text-2xl opacity-40 pb-3 leading-none">:</span>
                                    <div className="flex flex-col items-center min-w-[40px] sm:min-w-[46px]">
                                        <span suppressHydrationWarning className="text-2xl sm:text-3xl tracking-tight leading-none">{countdown.hoursStr}</span>
                                        <span className="text-[10px] sm:text-xs font-black text-gray-400 mt-1 uppercase">H</span>
                                    </div>
                                    <span className="text-lg sm:text-2xl opacity-40 pb-3 leading-none">:</span>
                                    <div className="flex flex-col items-center min-w-[40px] sm:min-w-[46px]">
                                        <span suppressHydrationWarning className="text-2xl sm:text-3xl tracking-tight leading-none">{countdown.minutesStr}</span>
                                        <span className="text-[10px] sm:text-xs font-black text-gray-400 mt-1 uppercase">M</span>
                                    </div>
                                    <span className="text-lg sm:text-2xl opacity-40 pb-3 leading-none">:</span>
                                    <div className="flex flex-col items-center min-w-[40px] sm:min-w-[46px]">
                                        <span suppressHydrationWarning className="text-2xl sm:text-3xl tracking-tight leading-none">{countdown.secondsStr}</span>
                                        <span className="text-[10px] sm:text-xs font-black text-gray-400 mt-1 uppercase">S</span>
                                    </div>
                                </div>
                                <p suppressHydrationWarning className={`text-[10px] sm:text-[11px] font-black tracking-widest uppercase mt-2 ${theme.labelColor}`}>
                                    {countdown.urgencyLabel}
                                </p>
                            </div>

                            {/* Care Sustainability Bar */}
                            <div className="mt-5 space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                    <span>Care Sustainability</span>
                                    <span suppressHydrationWarning>{countdown.estDays} est. days</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-800/90 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${theme.barColor} transition-all duration-500 rounded-full`}
                                        style={{ width: `${countdown.progressPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex items-center gap-4">
                                <Link
                                    href="/donate"
                                    className="px-6 py-2.5 rounded-full bg-[#ff3b4e] hover:bg-[#e63244] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    <Heart size={14} className="fill-white" />
                                    Donate
                                </Link>

                                <button
                                    onClick={() => setShowModal(true)}
                                    className="text-[11px] font-bold text-gray-400 hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <HelpCircle size={14} />
                                    How Calculated?
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="collapsed-drawer"
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleDrawer(true)}
                            className="flex items-center gap-2.5 px-4 py-3 bg-[#12161a] border border-gray-800 rounded-full shadow-2xl shadow-black/60 text-white cursor-pointer group"
                        >
                            <span className={`w-2.5 h-2.5 rounded-full ${theme.dotClass} animate-pulse`} />
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    Shelter Care Timer
                                </span>
                                <span suppressHydrationWarning className={`font-mono text-xs font-black ${theme.timerColor}`}>
                                    {countdown.fullTimer}
                                </span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-gray-800 group-hover:bg-[#ff3b4e] group-hover:text-white text-gray-400 flex items-center justify-center transition-colors ml-1">
                                <ChevronRight size={14} />
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>
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

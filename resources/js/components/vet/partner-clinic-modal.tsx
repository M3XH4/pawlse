import { Activity, ArrowLeft, Building2, Clock, ExternalLink, Mail, MapPin, Phone, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { buildClinicMapsUrl } from '@/components/vet/partner-clinic-card';
import type { PartnerClinicItem } from '@/components/vet/partner-clinic-card';

interface PartnerClinicModalProps {
    clinic: PartnerClinicItem | null;
    onClose: () => void;
}

type ClinicTab = 'overview' | 'contact' | 'services';

export function PartnerClinicModal({ clinic, onClose }: PartnerClinicModalProps) {
    const [activeTab, setActiveTab] = useState<ClinicTab>('overview');

    useEffect(() => {
        if (!clinic) {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [clinic, onClose]);

    const mapsUrl = clinic ? buildClinicMapsUrl(clinic) : '#';

    return (
        <AnimatePresence>
            {clinic && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        key={clinic.id}
                        initial={{ scale: 0.96, y: 18, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.96, y: 18, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="partner-clinic-modal-title"
                        className="bg-white dark:bg-slate-900 rounded-[26px] sm:rounded-[30px] max-w-2xl w-full shadow-2xl relative border-0 max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        {/* Top Full-Bleed Clinic Photo Hero Header (no bottom-left icon box) */}
                        <div className="relative h-44 sm:h-52 w-full shrink-0 overflow-hidden bg-slate-200 dark:bg-slate-800">
                            <ImageWithFallback
                                src={clinic.image_url || '/images/partners/dr-e.jpg'}
                                alt={clinic.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/20 to-transparent" />

                            {/* Top Controls: Back Pill + Close Button */}
                            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                                >
                                    <ArrowLeft size={13} />
                                    <span>Back</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close clinic modal"
                                    className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            {/* Bottom-Right Emergency Resource Badge */}
                            {clinic.is_emergency && (
                                <div className="absolute bottom-4 right-5 z-10">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                        <span>Emergency Resource</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Clinic Identity Header */}
                        <div className="px-6 sm:px-8 pt-5 pb-3 shrink-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2.5">
                                {clinic.badge_title || 'Veterinary Partner'}
                            </span>

                            <h3
                                id="partner-clinic-modal-title"
                                className="text-2xl sm:text-[26px] font-black text-paw-navy dark:text-white leading-tight"
                            >
                                {clinic.name}
                            </h3>

                            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                <MapPin size={14} className="text-slate-400 shrink-0" />
                                <span>{clinic.city || clinic.address || 'Iligan City'}</span>
                            </p>
                        </div>

                        {/* 3-Tab Navigation Bar (Full-Width Balanced Tabs) */}
                        <div className="px-5 sm:px-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setActiveTab('overview')}
                                className={`py-3 px-1.5 sm:px-3 text-[10px] sm:text-[11px] font-black uppercase tracking-wider inline-flex items-center justify-center gap-1 sm:gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                                    activeTab === 'overview'
                                        ? 'border-paw-orange text-paw-orange'
                                        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                <Building2 size={13} className="shrink-0" />
                                <span>Overview</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('contact')}
                                className={`py-3 px-1.5 sm:px-3 text-[10px] sm:text-[11px] font-black uppercase tracking-wider inline-flex items-center justify-center gap-1 sm:gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                                    activeTab === 'contact'
                                        ? 'border-paw-orange text-paw-orange'
                                        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                <MapPin size={13} className="shrink-0" />
                                <span>Contact &amp; Location</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('services')}
                                className={`py-3 px-1.5 sm:px-3 text-[10px] sm:text-[11px] font-black uppercase tracking-wider inline-flex items-center justify-center gap-1 sm:gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                                    activeTab === 'services'
                                        ? 'border-paw-orange text-paw-orange'
                                        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                <Activity size={13} className="shrink-0" />
                                <span>Services</span>
                            </button>
                        </div>

                        {/* Scrollable Tab Content Area */}
                        <div className="flex-1 overflow-y-auto modal-scroll-area px-6 sm:px-8 py-5">
                            {activeTab === 'overview' && (
                                <div className="space-y-5">
                                    <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-900/40 p-4 sm:p-5">
                                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                                            {clinic.description || clinic.short_description}
                                        </p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4 pt-1">
                                        <div>
                                            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                ISF Relationship
                                            </span>
                                            <span className="block text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                                                {clinic.is_featured ? 'Frequently Contacted' : 'Trusted Veterinary Resource'}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                Emergency
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 text-sm font-bold mt-1 ${clinic.is_emergency ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                <span className={`w-2 h-2 rounded-full ${clinic.is_emergency ? 'bg-red-500' : 'bg-slate-400'}`} />
                                                <span>{clinic.is_emergency ? 'Emergency Option' : 'Standard Clinic Hours'}</span>
                                            </span>
                                        </div>

                                        <div>
                                            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                Location
                                            </span>
                                            <span className="block text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                                                {clinic.city || 'Iligan City'}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                Operating Hours
                                            </span>
                                            <span className="block text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                                                {clinic.operating_hours || 'Call clinic to confirm hours'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="space-y-3.5">
                                    {clinic.address && (
                                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-4 flex items-start gap-3">
                                            <MapPin size={17} className="text-paw-orange shrink-0 mt-0.5" />
                                            <div>
                                                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Street Address
                                                </span>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                                                    {clinic.address}
                                                </p>
                                                {clinic.city && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        {clinic.city}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid sm:grid-cols-2 gap-3.5">
                                        {clinic.phone && (
                                            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-4 flex items-start gap-3">
                                                <Phone size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                        Phone Number
                                                    </span>
                                                    <a
                                                        href={`tel:${clinic.phone.replace(/[^0-9+]/g, '')}`}
                                                        className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 inline-block"
                                                    >
                                                        {clinic.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {clinic.email && (
                                            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-4 flex items-start gap-3">
                                                <Mail size={16} className="text-sky-500 shrink-0 mt-0.5" />
                                                <div className="min-w-0">
                                                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                        Email
                                                    </span>
                                                    <a
                                                        href={`mailto:${clinic.email}`}
                                                        className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:underline mt-0.5 block truncate"
                                                    >
                                                        {clinic.email}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {clinic.operating_hours && (
                                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-4 flex items-start gap-3">
                                            <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Clinic Hours
                                                </span>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                                                    {clinic.operating_hours}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'services' && (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                                            Available Veterinary Services
                                        </h4>
                                        {clinic.services && clinic.services.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {clinic.services.map((svc, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/50 text-xs font-bold text-emerald-800 dark:text-emerald-300"
                                                    >
                                                        {svc}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Contact the clinic directly to confirm available veterinary services and diagnostics.
                                            </p>
                                        )}
                                    </div>

                                    {clinic.short_description && (
                                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-4">
                                            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                                                Clinic Note
                                            </span>
                                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                                {clinic.short_description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sticky Footer: Single-row layout with Close on left; Maps and Call on right */}
                        <div className="px-4 sm:px-8 py-3.5 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/95 shrink-0 flex items-center justify-between gap-2 flex-nowrap">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-2.5 sm:px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
                            >
                                Close
                            </button>

                            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                                >
                                    <MapPin size={13} className="text-paw-orange shrink-0" />
                                    <span className="sm:hidden">Maps</span>
                                    <span className="hidden sm:inline">Open in Maps</span>
                                    <ExternalLink size={11} className="text-slate-400 hidden sm:inline shrink-0" />
                                </a>

                                {clinic.phone && (
                                    <a
                                        href={`tel:${clinic.phone.replace(/[^0-9+]/g, '')}`}
                                        className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] sm:text-xs font-bold inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shadow-md shadow-emerald-500/20 transition-colors"
                                    >
                                        <Phone size={13} className="shrink-0" />
                                        <span>Call {clinic.phone}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

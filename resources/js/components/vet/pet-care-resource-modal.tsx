import { ArrowLeft, CheckCircle2, Download, ExternalLink, FileText, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect } from 'react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { parseResourceContent, resolveResourceTheme } from '@/components/vet/pet-care-resource-theme';
import type { PetResourceItem } from '@/components/vet/pet-care-resource-theme';

interface PetCareResourceModalProps {
    resource: PetResourceItem | null;
    onClose: () => void;
}

export function PetCareResourceModal({ resource, onClose }: PetCareResourceModalProps) {
    useEffect(() => {
        if (!resource) {
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
    }, [resource, onClose]);

    const theme = resource ? resolveResourceTheme(resource) : null;
    const sections = resource ? parseResourceContent(resource.content) : [];
    const IconComponent = theme?.icon;

    const markSkipSplash = () => {
        try {
            localStorage.setItem('pawlse_skip_splash_until', String(Date.now() + 180000));
            sessionStorage.setItem('pawlse_splash_shown', '1');
        } catch {
            // Ignore storage errors in restricted contexts
        }
    };

    return (
        <AnimatePresence>
            {resource && theme && IconComponent && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.96, y: 18, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.96, y: 18, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pet-resource-modal-title"
                        className="bg-white dark:bg-slate-900 rounded-[26px] sm:rounded-[30px] max-w-2xl w-full shadow-2xl relative border-0 max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        {/* Top Full-Bleed Tinted Photo Hero Header */}
                        <div className="relative h-44 sm:h-52 w-full shrink-0 overflow-hidden bg-slate-200 dark:bg-slate-800">
                            <ImageWithFallback
                                src={resource.image_url || theme.fallbackImage}
                                alt={resource.title}
                                className="w-full h-full object-cover"
                            />
                            <div className={`absolute inset-0 ${theme.bannerTintClass}`} />
                            <div className={`absolute inset-0 bg-gradient-to-br ${theme.bannerGradientClass}`} />

                            {/* Top Controls: Back Pill + Close Button */}
                            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                                >
                                    <ArrowLeft size={13} />
                                    <span>Back to Vet Resources</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close resource modal"
                                    className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            {/* Bottom-Left Colored Icon Tile Tab */}
                            <div className={`absolute bottom-0 left-6 sm:left-8 ${theme.iconBgClass} rounded-t-2xl px-3.5 pt-3 pb-2 shadow-sm flex items-center justify-center`}>
                                <IconComponent size={22} className={theme.iconTextClass} strokeWidth={2.2} />
                            </div>
                        </div>

                        {/* Scrollable Body with Warm Amber Scrollbar */}
                        <div className="flex-1 overflow-y-auto modal-scroll-area px-6 sm:px-8 pt-5 pb-6 space-y-5">
                            {/* Title & Source Metadata Header */}
                            <div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 ${theme.badgeClass}`}>
                                    {resource.badge || 'Community Resource'}
                                </span>

                                <h3
                                    id="pet-resource-modal-title"
                                    className="text-2xl sm:text-[26px] font-black text-paw-navy dark:text-white leading-tight"
                                >
                                    {resource.title}
                                </h3>

                                <p className="text-sm font-semibold text-slate-400 dark:text-slate-400 mt-1">
                                    {theme.subtitle}
                                </p>

                                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1.5">
                                    <span>Source: </span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        {theme.sourceLabel}
                                    </span>
                                </p>
                            </div>

                            {/* Overview Section */}
                            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Overview
                                </h4>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                    {resource.description}
                                </p>
                            </div>

                            {/* Structured Resource Sections */}
                            {sections.map((section, idx) => (
                                <div
                                    key={`${section.heading}-${idx}`}
                                    className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${theme.accentDotClass}`} />
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                            {section.heading}
                                        </h4>
                                    </div>

                                    {section.kv.length > 0 && (
                                        <div className="grid sm:grid-cols-2 gap-2.5">
                                            {section.kv.map((item, kvIdx) => (
                                                <div
                                                    key={`${item.label}-${kvIdx}`}
                                                    className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 px-3.5 py-2.5"
                                                >
                                                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                        {item.label}
                                                    </span>
                                                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 leading-snug">
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {section.paragraphs.map((paragraph, pIdx) => (
                                        <p
                                            key={pIdx}
                                            className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
                                        >
                                            {paragraph}
                                        </p>
                                    ))}

                                    {section.bullets.length > 0 && (
                                        <ul className="space-y-2">
                                            {section.bullets.map((bullet, bIdx) => (
                                                <li
                                                    key={bIdx}
                                                    className="flex items-start gap-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100/90 dark:border-slate-800/80 px-3.5 py-2.5 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium"
                                                >
                                                    <CheckCircle2
                                                        size={15}
                                                        className={`shrink-0 mt-0.5 ${theme.checkIconClass}`}
                                                    />
                                                    <span>{bullet}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}

                            {/* ISF Community Transparency Box */}
                            <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 p-4 flex items-start gap-3">
                                <Info size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] sm:text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                                    Download the full <strong className="font-bold">ISF-templated PDF guide</strong> below to keep a printable copy complete with Iligan City partner veterinary contacts and care checklists.
                                </p>
                            </div>
                        </div>

                        {/* Sticky Footer with ISF PDF Preview & Download Actions */}
                        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/95 backdrop-blur-xs shrink-0 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                                    <FileText size={15} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px] sm:max-w-[240px]">
                                        {resource.file_name || `${resource.slug}.pdf`}
                                    </p>
                                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                        Official ISF Template • {resource.file_size || 'PDF'}
                                    </p>
                                </div>
                            </div>

                            <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-2.5">
                                <a
                                    href={`/resources/${resource.id}/preview`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={markSkipSplash}
                                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
                                >
                                    <ExternalLink size={13} />
                                    <span>Preview Guide</span>
                                </a>

                                <a
                                    href={`/resources/${resource.id}/download`}
                                    onClick={markSkipSplash}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-paw-orange hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-orange-500/20 transition-all"
                                >
                                    <Download size={14} />
                                    <span>Download PDF</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

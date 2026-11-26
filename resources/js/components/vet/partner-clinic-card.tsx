import { ChevronRight, MapPin, Phone } from 'lucide-react';
import React from 'react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

export interface PartnerClinicItem {
    id: number;
    name: string;
    slug: string;
    category: string;
    badge_title?: string | null;
    badges?: string[];
    short_description?: string | null;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    phone?: string | null;
    email?: string | null;
    website_url?: string | null;
    operating_hours?: string | null;
    services?: string[];
    image_url?: string | null;
    is_emergency: boolean;
    is_featured: boolean;
}

export function buildClinicMapsUrl(clinic: Pick<PartnerClinicItem, 'name' | 'address' | 'city' | 'latitude' | 'longitude'>): string {
    const queryParts = [clinic.name];

    if (clinic.city) {
        queryParts.push(clinic.city);
    } else {
        queryParts.push('Iligan City');
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts.join(', '))}`;
}

function getClinicBadgeStyle(clinic: PartnerClinicItem): string {
    if (clinic.is_featured) {
        return 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300';
    }

    if (clinic.badge_title?.toLowerCase().includes('emergency')) {
        return 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300';
    }

    return 'bg-sky-100/90 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300';
}

interface PartnerClinicCardProps {
    clinic: PartnerClinicItem;
    variant?: 'featured' | 'grid';
    onSelect: (clinic: PartnerClinicItem) => void;
}

export function PartnerClinicCard({ clinic, variant = 'grid', onSelect }: PartnerClinicCardProps) {
    const mapsUrl = buildClinicMapsUrl(clinic);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(clinic);
        }
    };

    if (variant === 'featured') {
        return (
            <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(clinic)}
                onKeyDown={handleKeyDown}
                className="group rounded-[26px] overflow-hidden border border-emerald-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_12px_36px_-14px_rgba(16,185,129,0.2)] dark:shadow-none hover:shadow-[0_20px_44px_-14px_rgba(16,185,129,0.28)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
                {/* Wide Top Photo Banner (no bottom-left icon box) */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <ImageWithFallback
                        src={clinic.image_url || '/images/partners/dr-e.jpg'}
                        alt={clinic.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/15 to-transparent" />

                    {/* Top-Right Status Badges */}
                    <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end">
                        {clinic.is_emergency && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                <span>Emergency Resource</span>
                            </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                            {clinic.badge_title || 'Frequently Contacted by ISF'}
                        </span>
                    </div>

                    {/* Subtle City Pill Bottom-Left */}
                    <div className="absolute bottom-3.5 left-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/55 backdrop-blur-xs text-white text-[11px] font-bold">
                        <MapPin size={12} className="text-[#FFAE33]" />
                        <span>{clinic.city || 'Iligan City'}</span>
                    </div>
                </div>

                {/* Clean White Body Below */}
                <div className="p-6 sm:px-8 sm:py-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-2 max-w-3xl">
                        <h3 className="text-2xl font-black text-paw-navy dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {clinic.name}
                        </h3>

                        {clinic.badge_title && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getClinicBadgeStyle(clinic)}`}>
                                {clinic.badge_title}
                            </span>
                        )}

                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                            {clinic.short_description || clinic.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 transition-colors">
                            <span>View Details</span>
                            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onSelect(clinic)}
            onKeyDown={handleKeyDown}
            className="group h-full bg-white dark:bg-slate-900 border border-slate-200/75 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-[0_8px_28px_-14px_rgba(15,23,42,0.14)] dark:shadow-none hover:shadow-[0_18px_36px_-14px_rgba(15,23,42,0.2)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
            <div>
                {/* Clean Photo Banner (no bottom-left icon box) */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <ImageWithFallback
                        src={clinic.image_url || '/images/partners/petmate.jpg'}
                        alt={clinic.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />

                    {clinic.is_emergency && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>Emergency</span>
                        </span>
                    )}
                </div>

                {/* Card Content Body */}
                <div className="px-6 pt-5 pb-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2.5 ${getClinicBadgeStyle(clinic)}`}>
                        {clinic.badge_title || 'Veterinary Resource'}
                    </span>

                    <h4 className="text-[17px] font-black text-paw-navy dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {clinic.name}
                    </h4>

                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        {clinic.city || 'Iligan City'}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed line-clamp-2">
                        {clinic.short_description || clinic.description}
                    </p>
                </div>
            </div>

            {/* Clean Footer Action Row */}
            <div className="px-6 pb-5 pt-2 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 transition-colors">
                    <span>View Details</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </span>

                <div className="flex items-center gap-1.5">
                    {clinic.phone && (
                        <a
                            href={`tel:${clinic.phone.replace(/[^0-9+]/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-500 text-slate-500 hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-600 dark:hover:text-white flex items-center justify-center transition-colors"
                            title={`Call ${clinic.name}`}
                            aria-label={`Call ${clinic.name}`}
                        >
                            <Phone size={13} />
                        </a>
                    )}
                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-amber-500 text-slate-500 hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-amber-500 dark:hover:text-white flex items-center justify-center transition-colors"
                        title={`Open ${clinic.name} in Google Maps`}
                        aria-label={`Open ${clinic.name} in Google Maps`}
                    >
                        <MapPin size={13} />
                    </a>
                </div>
            </div>
        </div>
    );
}

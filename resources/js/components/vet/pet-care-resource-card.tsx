import { ChevronRight, Download } from 'lucide-react';
import React from 'react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { resolveResourceTheme } from '@/components/vet/pet-care-resource-theme';
import type { PetResourceItem } from '@/components/vet/pet-care-resource-theme';

interface PetCareResourceCardProps {
    resource: PetResourceItem;
    onSelect: (resource: PetResourceItem) => void;
}

export function PetCareResourceCard({ resource, onSelect }: PetCareResourceCardProps) {
    const theme = resolveResourceTheme(resource);
    const IconComponent = theme.icon;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(resource);
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onSelect(resource)}
            onKeyDown={handleKeyDown}
            className="group h-full bg-white dark:bg-slate-900 border border-slate-200/75 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-[0_8px_28px_-14px_rgba(15,23,42,0.14)] dark:shadow-none hover:shadow-[0_18px_36px_-14px_rgba(15,23,42,0.2)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paw-orange"
        >
            <div>
                {/* Colored-Tint Photo Banner Header */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <ImageWithFallback
                        src={resource.image_url || theme.fallbackImage}
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 ${theme.bannerTintClass}`} />
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.bannerGradientClass}`} />

                    {/* Bottom-Left Colored Icon Tile Tab */}
                    <div className={`absolute bottom-0 left-5 ${theme.iconBgClass} rounded-t-2xl px-3 pt-2.5 pb-1.5 shadow-sm flex items-center justify-center`}>
                        <IconComponent size={19} className={theme.iconTextClass} strokeWidth={2.2} />
                    </div>
                </div>

                {/* Card Content Body */}
                <div className="px-6 pt-4 pb-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2.5 ${theme.badgeClass}`}>
                        {resource.badge || 'Community Resource'}
                    </span>

                    <h4 className="text-[17px] font-black text-paw-navy dark:text-white leading-snug group-hover:text-paw-orange dark:group-hover:text-[#FFAE33] transition-colors">
                        {resource.title}
                    </h4>

                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        {theme.subtitle}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed line-clamp-2">
                        {resource.description}
                    </p>
                </div>
            </div>

            {/* Clean Footer Action Row */}
            <div className="px-6 pb-5 pt-2 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-paw-orange group-hover:text-orange-600 transition-colors">
                    <span>View Details</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </span>

                <a
                    href={`/resources/${resource.id}/download`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/50 text-[10px] font-bold text-slate-500 hover:text-amber-700 dark:text-slate-400 dark:hover:text-amber-300 transition-colors"
                    title={`Download ${resource.title} ISF PDF Guide`}
                >
                    <Download size={11} />
                    <span>ISF PDF</span>
                </a>
            </div>
        </div>
    );
}

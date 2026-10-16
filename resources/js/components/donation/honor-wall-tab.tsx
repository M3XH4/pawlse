import React, { useState, useMemo } from 'react';
import { 
    Star, Heart, Users, Repeat, Utensils, Award, 
    Gift, Sparkles, Stethoscope, Search, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

export interface CommunityHonoree {
    id: number;
    name: string;
    category: 'donor' | 'volunteer' | 'sponsor' | 'community_supporter' | string;
    tier?: string | null;
    role_title: string;
    description?: string | null;
    badges: string[];
    initials?: string | null;
    avatar_url?: string | null;
    is_featured: boolean;
    display_order: number;
}

export interface PartnerShowcaseItem {
    id: number;
    name: string;
    slug?: string;
    category?: string;
    badge_title?: string | null;
    badges?: string[];
    short_description?: string | null;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
    website_url?: string | null;
    social_url?: string | null;
    operating_hours?: string | null;
    services?: string[];
    image_url?: string | null;
    logo_url?: string | null;
    is_emergency?: boolean;
    is_featured?: boolean;
}

export interface RecognitionMetricsData {
    core_members_count: number;
    active_volunteers_count?: number | null;
    on_call_volunteers_count?: number | null;
    meals_served_display: string;
    pets_rescued_display: string;
    adoptions_display: string;
    active_zones_display: string;
}

interface HonorWallTabProps {
    honors: CommunityHonoree[];
    partners?: PartnerShowcaseItem[];
    recognitionMetrics?: RecognitionMetricsData;
    onOpenAuditModal?: () => void;
    onSelectDonationTab?: (tab: 'cash' | 'inkind' | 'sponsor') => void;
}

// Decorative Paw watermark SVG
function PawWatermark({ className = 'text-amber-900/10' }: { className?: string }) {
    return (
        <svg 
            className={`w-7 h-7 pointer-events-none select-none ${className}`} 
            viewBox="0 0 24 24" 
            fill="currentColor"
        >
            <path d="M12 11c1.38 0 2.5-1.12 2.5-2.5S13.38 6 12 6s-2.5 1.12-2.5 2.5S10.62 11 12 11zm-5.5 1C7.88 12 9 10.88 9 9.5S7.88 7 6.5 7 4 8.12 4 9.5 5.12 12 6.5 12zm11 0c1.38 0 2.5-1.12 2.5-2.5S18.88 7 17.5 7 15 8.12 15 9.5s1.12 2.5 2.5 2.5zm-5.5 2.5c-2.48 0-4.5 1.79-4.5 4 0 1.55 1.05 2.89 2.59 3.59.57.26 1.25.41 1.91.41s1.34-.15 1.91-.41C15.45 20.39 16.5 19.05 16.5 17.5c0-2.21-2.02-4-4.5-4z"/>
        </svg>
    );
}

// Badge color & icon mapping
function getBadgeConfig(badgeName: string) {
    const lower = badgeName.toLowerCase();
    
    if (lower.includes('recurring')) {
        return {
            bg: 'bg-amber-100/90 text-amber-800 border-amber-200/60',
            icon: <Repeat size={12} className="shrink-0 text-amber-600" />
        };
    }
    if (lower.includes('feeding') || lower.includes('food')) {
        return {
            bg: 'bg-emerald-100/90 text-emerald-800 border-emerald-200/60',
            icon: <Utensils size={12} className="shrink-0 text-emerald-600" />
        };
    }
    if (lower.includes('community')) {
        return {
            bg: 'bg-purple-100/90 text-purple-800 border-purple-200/60',
            icon: <Users size={12} className="shrink-0 text-purple-600" />
        };
    }
    if (lower.includes('kind heart') || lower.includes('heart') || lower.includes('compassion')) {
        return {
            bg: 'bg-rose-100/90 text-rose-800 border-rose-200/60',
            icon: <Heart size={12} className="shrink-0 text-rose-600" />
        };
    }
    if (lower.includes('in-kind') || lower.includes('supply')) {
        return {
            bg: 'bg-sky-100/90 text-sky-800 border-sky-200/60',
            icon: <Gift size={12} className="shrink-0 text-sky-600" />
        };
    }
    if (lower.includes('long-time') || lower.includes('champion') || lower.includes('gold')) {
        return {
            bg: 'bg-yellow-100/90 text-yellow-900 border-yellow-300/60',
            icon: <Star size={12} className="shrink-0 text-yellow-600 fill-yellow-500/20" />
        };
    }
    if (lower.includes('vet') || lower.includes('medical') || lower.includes('clinic')) {
        return {
            bg: 'bg-blue-100/90 text-blue-800 border-blue-200/60',
            icon: <Stethoscope size={12} className="shrink-0 text-blue-600" />
        };
    }
    if (lower.includes('rescue') || lower.includes('lead') || lower.includes('volunteer')) {
        return {
            bg: 'bg-orange-100/90 text-orange-800 border-orange-200/60',
            icon: <Sparkles size={12} className="shrink-0 text-orange-600" />
        };
    }

    // Default neutral
    return {
        bg: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <Award size={12} className="shrink-0 text-gray-500" />
    };
}

export function HonorWallTab({
    honors = [],
    partners = [],
    recognitionMetrics,
    onOpenAuditModal,
    onSelectDonationTab
}: HonorWallTabProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeBadgeFilter, setActiveBadgeFilter] = useState<string | null>(null);

    // Filter featured supporters
    const featuredSupporters = useMemo(() => {
        return honors.filter(h => h.is_featured);
    }, [honors]);

    // Categories filter calculation
    const counts = useMemo(() => {
        const recurring = honors.filter(h => 
            (h.badges && h.badges.some(b => b.toLowerCase().includes('recurring'))) ||
            h.role_title.toLowerCase().includes('recurring')
        ).length;

        const donors = honors.filter(h => 
            h.category === 'donor' || 
            (h.badges && h.badges.some(b => b.toLowerCase().includes('donor') || b.toLowerCase().includes('feeding')))
        ).length;

        const volunteers = honors.filter(h => 
            h.category === 'volunteer' || 
            (h.badges && h.badges.some(b => b.toLowerCase().includes('volunteer') || b.toLowerCase().includes('rescue')))
        ).length;

        return {
            all: honors.length,
            recurring,
            donors,
            volunteers,
        };
    }, [honors]);

    // Filtered list for the supporters grid
    const filteredHonors = useMemo(() => {
        return honors.filter((item) => {
            // Category filter
            if (selectedCategory === 'recurring') {
                const isRecurring = (item.badges && item.badges.some(b => b.toLowerCase().includes('recurring'))) ||
                    item.role_title.toLowerCase().includes('recurring');
                if (!isRecurring) return false;
            } else if (selectedCategory === 'donor') {
                const isDonor = item.category === 'donor' || 
                    (item.badges && item.badges.some(b => b.toLowerCase().includes('donor') || b.toLowerCase().includes('feeding')));
                if (!isDonor) return false;
            } else if (selectedCategory === 'volunteer') {
                const isVolunteer = item.category === 'volunteer' || 
                    (item.badges && item.badges.some(b => b.toLowerCase().includes('volunteer') || b.toLowerCase().includes('rescue')));
                if (!isVolunteer) return false;
            }

            // Badge filter
            if (activeBadgeFilter) {
                const hasBadge = item.badges && item.badges.some(
                    b => b.toLowerCase().includes(activeBadgeFilter.toLowerCase())
                );
                if (!hasBadge) return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchName = item.name.toLowerCase().includes(query);
                const matchRole = item.role_title.toLowerCase().includes(query);
                const matchDesc = item.description?.toLowerCase().includes(query);
                const matchBadges = item.badges?.some(b => b.toLowerCase().includes(query));
                if (!matchName && !matchRole && !matchDesc && !matchBadges) {
                    return false;
                }
            }

            return true;
        });
    }, [honors, selectedCategory, activeBadgeFilter, searchQuery]);

    // Achievement badges catalogue
    const badgeCatalogue = [
        { name: 'RECURRING SUPPORTER', key: 'recurring', color: 'bg-amber-50 text-amber-800 border-amber-200' },
        { name: 'FEEDING SUPPORTER', key: 'feeding', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
        { name: 'COMMUNITY SUPPORTER', key: 'community', color: 'bg-purple-50 text-purple-800 border-purple-200' },
        { name: 'KIND HEART', key: 'kind heart', color: 'bg-rose-50 text-rose-800 border-rose-200' },
        { name: 'IN-KIND SUPPORTER', key: 'in-kind', color: 'bg-sky-50 text-sky-800 border-sky-200' },
        { name: 'LONG-TIME SUPPORTER', key: 'long-time', color: 'bg-yellow-50 text-yellow-900 border-yellow-300' }
    ];

    return (
        <div className="space-y-12 pb-10">
            {/* 1. Header / Hero Banner */}
            <div className="relative rounded-[28px] md:rounded-[36px] bg-gradient-to-br from-[#1a1c2e] via-[#20233b] to-[#12131f] text-white p-7 sm:p-10 text-center overflow-hidden shadow-xl shadow-paw-navy/15">
                {/* Background decorative faint paws in top-right */}
                <div className="absolute top-4 right-6 opacity-15 pointer-events-none select-none">
                    <PawWatermark className="text-white w-20 h-20" />
                </div>
                <div className="absolute bottom-3 left-6 opacity-10 pointer-events-none select-none">
                    <PawWatermark className="text-white w-14 h-14" />
                </div>

                <div className="relative z-10 max-w-2xl mx-auto space-y-3">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/20 text-[11px] font-black tracking-widest uppercase">
                        <Heart size={13} className="text-rose-400 fill-rose-400" />
                        PAWLSE COMMUNITY
                    </span>

                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-fredoka drop-shadow-sm">
                        Donor Honor Wall
                    </h2>

                    <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed font-medium max-w-xl mx-auto">
                        Celebrating the hearts who give hope, care, and second chances.
                        We deeply appreciate every supporter who helps Iligan Stray Feeders continue caring for animals in need.
                    </p>
                </div>
            </div>

            {/* 2. Featured Supporters Section */}
            {featuredSupporters.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-[1px] bg-amber-200/80 flex-1 max-w-[140px]" />
                        <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                            <Star size={15} className="fill-amber-400 text-amber-400" />
                            FEATURED SUPPORTERS
                            <Star size={15} className="fill-amber-400 text-amber-400" />
                        </h3>
                        <div className="h-[1px] bg-amber-200/80 flex-1 max-w-[140px]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {featuredSupporters.map((supporter) => (
                            <div
                                key={supporter.id}
                                className="relative rounded-[32px] bg-[#fffbf2] border-2 border-amber-200/70 p-8 shadow-lg shadow-amber-900/5 text-center flex flex-col justify-between hover:shadow-xl transition-all group"
                            >
                                {/* Top right paw watermark */}
                                <div className="absolute top-5 right-5 opacity-20">
                                    <PawWatermark className="text-amber-800" />
                                </div>

                                <div className="space-y-4">
                                    {/* Avatar with star badge */}
                                    <div className="relative inline-block mx-auto">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-amber-100 flex items-center justify-center">
                                            {supporter.avatar_url ? (
                                                <ImageWithFallback
                                                    src={supporter.avatar_url}
                                                    alt={supporter.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-2xl font-black text-amber-800">
                                                    {supporter.initials || supporter.name.substring(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        {/* Golden star badge */}
                                        <div 
                                            className="absolute -top-1 -right-1 w-7 h-7 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center shadow border-2 border-white"
                                            title="Featured Supporter"
                                        >
                                            <Star size={14} className="fill-slate-900" />
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xl font-black text-paw-navy">{supporter.name}</h4>
                                        <p className="text-xs font-black uppercase tracking-wider text-amber-600 mt-0.5">
                                            {supporter.role_title}
                                        </p>
                                    </div>

                                    {/* Badges pills */}
                                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                        {supporter.badges.map((b, i) => {
                                            const cfg = getBadgeConfig(b);
                                            return (
                                                <span
                                                    key={i}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${cfg.bg}`}
                                                >
                                                    {cfg.icon}
                                                    {b}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    {/* Appreciation quote */}
                                    {supporter.description && (
                                        <p className="text-xs sm:text-sm text-gray-600 italic font-medium leading-relaxed pt-2 px-2">
                                            "{supporter.description}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Category Filter Tabs & Search Bar (Full Width & In One Line) */}
            <div className="space-y-3.5 w-full pt-1">
                {/* 4 Pills in One Single Line Occupying Whole Parent Width */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
                    <button
                        type="button"
                        onClick={() => { setSelectedCategory('all'); setActiveBadgeFilter(null); }}
                        className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer text-center whitespace-nowrap ${
                            selectedCategory === 'all' && !activeBadgeFilter
                                ? 'bg-paw-orange text-white shadow-md shadow-paw-orange/25 scale-[1.01]'
                                : 'bg-white border border-gray-200/90 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-2xs'
                        }`}
                        title={`All Supporters (${counts.all})`}
                    >
                        <span>All Supporters</span>
                        <span className="shrink-0 font-black">({counts.all})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setSelectedCategory('recurring'); setActiveBadgeFilter(null); }}
                        className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer text-center whitespace-nowrap ${
                            selectedCategory === 'recurring'
                                ? 'bg-paw-orange text-white shadow-md shadow-paw-orange/25 scale-[1.01]'
                                : 'bg-white border border-gray-200/90 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-2xs'
                        }`}
                        title={`Recurring Supporters (${counts.recurring})`}
                    >
                        <span>Recurring</span>
                        <span className="shrink-0 font-black">({counts.recurring})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setSelectedCategory('donor'); setActiveBadgeFilter(null); }}
                        className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer text-center whitespace-nowrap ${
                            selectedCategory === 'donor'
                                ? 'bg-paw-orange text-white shadow-md shadow-paw-orange/25 scale-[1.01]'
                                : 'bg-white border border-gray-200/90 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-2xs'
                        }`}
                        title={`Major Donors (${counts.donors})`}
                    >
                        <span>Major Donors</span>
                        <span className="shrink-0 font-black">({counts.donors})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setSelectedCategory('volunteer'); setActiveBadgeFilter(null); }}
                        className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer text-center whitespace-nowrap ${
                            selectedCategory === 'volunteer'
                                ? 'bg-paw-orange text-white shadow-md shadow-paw-orange/25 scale-[1.01]'
                                : 'bg-white border border-gray-200/90 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-2xs'
                        }`}
                        title={`Active Volunteers (${counts.volunteers})`}
                    >
                        <span>Volunteers</span>
                        <span className="shrink-0 font-black">({counts.volunteers})</span>
                    </button>
                </div>

                {/* Sleek Search Bar (Full Width of Parent) */}
                <div className="relative w-full group">
                    <Search 
                        size={18} 
                        className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-paw-orange transition-colors pointer-events-none" 
                    />
                    <input
                        type="text"
                        placeholder="Search honorees by name, badge, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 sm:pl-12 pr-11 py-3 bg-slate-50/80 hover:bg-white focus:bg-white border border-gray-200 focus:border-paw-orange focus:ring-3 focus:ring-paw-orange/15 rounded-full text-xs sm:text-sm font-medium outline-none shadow-2xs transition-all placeholder:text-gray-400"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/80 transition-colors cursor-pointer"
                            title="Clear search"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {activeBadgeFilter && (
                    <div className="flex items-center justify-center gap-2 text-xs">
                        <span className="text-gray-500 font-medium">Filtered by badge:</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-bold shadow-xs">
                            {activeBadgeFilter}
                            <button
                                type="button"
                                onClick={() => setActiveBadgeFilter(null)}
                                className="hover:text-red-600 font-black cursor-pointer text-sm leading-none ml-0.5"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    </div>
                )}
            </div>

            {/* 4. Supporters Grid (1 col on mobile, 2 sm, 4 lg) */}
            <div>
                {filteredHonors.length === 0 ? (
                    <div className="bg-gray-50 rounded-3xl p-12 text-center max-w-md mx-auto">
                        <p className="text-sm font-bold text-gray-500">No supporters found matching your filters.</p>
                        <button
                            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setActiveBadgeFilter(null); }}
                            className="mt-3 text-xs font-black text-paw-orange underline uppercase cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredHonors.map((item) => (
                            <div
                                key={item.id}
                                className="relative rounded-[28px] bg-white border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-amber-200/80 transition-all text-center flex flex-col justify-between group"
                            >
                                {/* Top right paw prints watermark */}
                                <div className="absolute top-4 right-4 opacity-15 group-hover:opacity-30 transition-opacity">
                                    <PawWatermark className="text-amber-800" />
                                </div>

                                <div className="space-y-3">
                                    {/* Avatar */}
                                    <div className="relative inline-block mx-auto">
                                        <div className="w-18 h-18 rounded-full overflow-hidden border-3 border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                                            {item.avatar_url ? (
                                                <ImageWithFallback
                                                    src={item.avatar_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-lg font-black text-gray-700">
                                                    {item.initials || item.name.substring(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        {item.is_featured && (
                                            <div 
                                                className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center shadow border-2 border-white"
                                                title="Featured"
                                            >
                                                <Star size={12} className="fill-slate-900" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-black text-paw-navy text-base">{item.name}</h4>
                                        <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 mt-0.5">
                                            {item.role_title}
                                        </p>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                                        {item.badges.map((b, i) => {
                                            const cfg = getBadgeConfig(b);
                                            return (
                                                <span
                                                    key={i}
                                                    onClick={() => setActiveBadgeFilter(b)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer hover:scale-105 transition-transform ${cfg.bg}`}
                                                    title={`Filter by ${b}`}
                                                >
                                                    {cfg.icon}
                                                    {b}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    {/* Quote / Message */}
                                    {item.description && (
                                        <p className="text-xs text-gray-500 italic font-medium leading-relaxed pt-2 px-1">
                                            "{item.description}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 5. Achievement Badges (Feature iv) */}
            <div className="rounded-[32px] bg-slate-50/80 border border-slate-100 p-8 md:p-10 text-center space-y-5">
                <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
                        RECOGNITION BADGES
                    </h4>
                    <p className="text-xs text-gray-500 font-medium">
                        Click on any badge to filter honorees and supporters who earned it
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3 max-w-4xl mx-auto">
                    {badgeCatalogue.map((badge, idx) => {
                        const cfg = getBadgeConfig(badge.key);
                        const isSelected = activeBadgeFilter === badge.name;

                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveBadgeFilter(isSelected ? null : badge.name)}
                                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-black tracking-wider uppercase border transition-all cursor-pointer ${
                                    isSelected 
                                        ? 'bg-paw-navy text-white border-paw-navy shadow-md scale-105' 
                                        : `${badge.color} hover:scale-105 shadow-sm`
                                }`}
                            >
                                {cfg.icon}
                                <span>{badge.name}</span>
                            </button>
                        );
                    })}
                </div>

                <p className="text-[11px] text-gray-400 font-medium tracking-wide">
                    Badges are appreciation-based. They do not indicate financial rank or operational authority.
                </p>
            </div>

            {/* 6. Transparency & Appreciation Section (Feature v) */}
            <div className="relative rounded-[32px] md:rounded-[36px] bg-[#fffbf2] border-2 border-amber-200/80 p-8 md:p-12 text-center overflow-hidden shadow-sm">
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                        <Heart size={24} className="fill-amber-400 text-amber-500" />
                    </div>

                    <div>
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider inline-block mb-2">
                            ACCOUNTABILITY
                        </span>
                        <h4 className="text-xl md:text-2xl font-black text-paw-navy uppercase tracking-tight">
                            Transparency & Appreciation
                        </h4>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                        Every contribution matters. PAWLSE helps ISF recognize the people and organizations
                        supporting its animal welfare activities while respecting each supporter's preferred level
                        of public recognition.
                    </p>
                </div>
            </div>
        </div>
    );
}

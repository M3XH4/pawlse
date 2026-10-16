import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search, Sparkles, Heart, Share2, Clock, Calendar,
    Shield, Check, Copy, ArrowRight, Filter, Megaphone,
    Award, AlertCircle, FileText, ChevronRight, X,
    PawPrint, HeartHandshake, GraduationCap, Scale, Newspaper,
    Layers, Tag, Compass, Flame, TrendingUp, Star,
    Gavel, ShieldAlert, AlertTriangle, HeartCrack, ShieldCheck, BookOpen, CheckCircle2, Info
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { toast } from 'sonner';

interface BlogPostItem {
    id: number;
    title: string;
    slug: string;
    category: string;
    summary: string | null;
    content: string;
    featured_image: string | null;
    tags: string[] | null;
    reading_time_minutes: number;
    status: string;
    is_featured: boolean;
    views_count: number;
    shares_count: number;
    published_at: string | null;
    created_at: string;
    author?: {
        id: number;
        name: string;
        role: string;
    } | null;
    reaction_summary?: {
        heart: number;
        paws: number;
        celebrate: number;
        care: number;
        total: number;
    };
    user_reactions?: string[];
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface BlogIndexProps {
    posts: PaginatedData<BlogPostItem>;
    featuredPost: BlogPostItem | null;
    categories: Record<string, string>;
    categoryCounts: Record<string, number>;
    recentCampaigns: BlogPostItem[];
    filters: {
        category: string;
        search: string;
        tag: string;
    };
}

// Full colorful styling for every category tab
const CATEGORY_CONFIG: Record<string, {
    label: string;
    active: string;
    inactive: string;
    badgeActive: string;
    badgeInactive: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    cardBadge: string;
}> = {
    all: {
        label: 'All Posts',
        active: 'bg-paw-orange text-white shadow-lg shadow-paw-orange/30 border-paw-orange',
        inactive: 'bg-orange-50/90 dark:bg-orange-950/30 text-amber-900 dark:text-orange-300 border-orange-200 dark:border-orange-800/60 hover:bg-orange-100 hover:border-paw-orange',
        badgeActive: 'bg-white/25 text-white',
        badgeInactive: 'bg-orange-200/70 dark:bg-orange-900/50 text-orange-900 dark:text-orange-200',
        icon: Layers,
        cardBadge: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    rescue_story: {
        label: 'Rescue Stories',
        active: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 border-amber-500',
        inactive: 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 hover:border-amber-400',
        badgeActive: 'bg-white/25 text-white',
        badgeInactive: 'bg-amber-200/70 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200',
        icon: PawPrint,
        cardBadge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
    },
    adoption_success: {
        label: 'Adoptions',
        active: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border-emerald-600',
        inactive: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 hover:border-emerald-400',
        badgeActive: 'bg-white/25 text-white',
        badgeInactive: 'bg-emerald-200/70 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200',
        icon: HeartHandshake,
        cardBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    announcement: {
        label: 'Announcements',
        active: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-blue-600',
        inactive: 'bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 hover:border-blue-400',
        badgeActive: 'bg-white/25 text-white',
        badgeInactive: 'bg-blue-200/70 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200',
        icon: Megaphone,
        cardBadge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300',
    },
    community_awareness: {
        label: 'Awareness',
        active: 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border-purple-600',
        inactive: 'bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 hover:border-purple-400',
        badgeActive: 'bg-white/25 text-white',
        badgeInactive: 'bg-purple-200/70 dark:bg-purple-900/50 text-purple-900 dark:text-purple-200',
        icon: GraduationCap,
        cardBadge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300',
    },
    advocacy_campaign: {
        label: 'Advocacy',
        active: 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 border-rose-600',
        inactive: 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 hover:border-rose-400',
        badgeActive: 'bg-white/25 text-white',
        badgeInactive: 'bg-rose-200/70 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200',
        icon: Scale,
        cardBadge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
    },
    news_update: {
        label: 'Updates',
        active: 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 border-cyan-600',
        inactive: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60 hover:bg-cyan-100 hover:border-cyan-400',
        badgeActive: 'bg-white/25 text-white',
        badgeInactive: 'bg-cyan-200/70 dark:bg-cyan-900/50 text-cyan-900 dark:text-cyan-200',
        icon: Newspaper,
        cardBadge: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300',
    },
};

// Curated search suggestions for users who don't know what to search
const SEARCH_SUGGESTIONS = [
    { title: 'Animal Welfare Act (RA 8485 & RA 10631)', category: 'advocacy_campaign', query: 'RA 8485', icon: Scale },
    { title: 'Milo Flood Rescue Survival Story', category: 'rescue_story', query: 'Milo', icon: PawPrint },
    { title: 'Responsible Pet Ownership & Vaccinations', category: 'community_awareness', query: 'Vaccinations', icon: GraduationCap },
    { title: 'Bella Rehabilitation & Forever Home', category: 'adoption_success', query: 'Bella', icon: HeartHandshake },
    { title: 'Community Spay & Neuter (Kapon) Mission', category: 'announcement', query: 'Spay & Neuter', icon: Megaphone },
    { title: 'Weekly Stray Feeding Operations', category: 'news_update', query: 'Feeding Operations', icon: Newspaper },
];

const POPULAR_TAGS = ['Animal Welfare', 'Rescue', 'Kapon', 'Puppy Rescue', 'Forever Home', 'Feeding Operations'];

export default function BlogIndex({
    posts,
    featuredPost,
    categories,
    categoryCounts,
    recentCampaigns,
    filters,
}: BlogIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [shareModalPost, setShareModalPost] = useState<BlogPostItem | null>(null);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setIsSuggestionsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCategoryClick = (categoryKey: string) => {
        router.get('/blog', {
            category: categoryKey === 'all' ? undefined : categoryKey,
            search: search.trim() || undefined,
        }, { preserveState: true });
    };

    const handleSearchSubmit = (e?: React.FormEvent, customQuery?: string) => {
        if (e) e.preventDefault();
        const queryToUse = customQuery !== undefined ? customQuery : search;
        setIsSuggestionsOpen(false);
        router.get('/blog', {
            category: filters.category !== 'all' ? filters.category : undefined,
            search: queryToUse.trim() || undefined,
        }, { preserveState: true });
    };

    const handleSelectSuggestion = (query: string) => {
        setSearch(query);
        handleSearchSubmit(undefined, query);
    };

    const handleClearFilters = () => {
        setSearch('');
        router.get('/blog');
    };

    const handleReact = (e: React.MouseEvent, postId: number, reactionType: string = 'heart') => {
        e.preventDefault();
        e.stopPropagation();
        router.post(`/blog/${postId}/react`, {
            reaction_type: reactionType,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Reaction recorded!');
            },
        });
    };

    const handleOpenShare = (e: React.MouseEvent, post: BlogPostItem) => {
        e.preventDefault();
        e.stopPropagation();

        const shareUrl = `${window.location.origin}/blog/${post.slug}`;
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.summary || post.title,
                url: shareUrl,
            }).then(() => {
                router.post(`/blog/${post.id}/share`, {}, { preserveScroll: true });
            }).catch(() => {
                setShareModalPost(post);
            });
        } else {
            setShareModalPost(post);
        }
    };

    const handleCopyLink = (slug: string) => {
        const shareUrl = `${window.location.origin}/blog/${slug}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopiedUrl(true);
            toast.success('Link copied to clipboard!');
            if (shareModalPost) {
                router.post(`/blog/${shareModalPost.id}/share`, {}, { preserveScroll: true });
            }
            setTimeout(() => setCopiedUrl(false), 2000);
        });
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Recently';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    // Filter live post matches for combobox suggestions
    const matchingPosts = search.trim()
        ? posts.data.filter((p) =>
              p.title.toLowerCase().includes(search.toLowerCase()) ||
              (p.summary && p.summary.toLowerCase().includes(search.toLowerCase())) ||
              (p.tags && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
          ).slice(0, 4)
        : [];

    return (
        <div className="relative font-quicksand min-h-screen bg-paw-bg/40 dark:bg-gray-950 text-paw-navy dark:text-gray-100 flex flex-col">
            <Head title="Blog - News & Articles | PAWLSE" />
            <Header />

            <main className="flex-1 pb-24">
                {/* Hero Banner with Search Section Above */}
                <section className="relative overflow-visible bg-gradient-to-b from-paw-navy via-paw-navy/95 to-paw-navy text-white pt-10 pb-16 sm:pt-12 sm:pb-20 px-4 sm:px-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.18),transparent_55%)] pointer-events-none" />
                    
                    <div className="max-w-3xl mx-auto relative text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-paw-orange/20 border border-paw-orange/30 text-paw-yellow font-black text-[11px] uppercase tracking-widest mb-2.5">
                                <Megaphone size={13} className="animate-pulse text-paw-orange" />
                                News & Article Module
                            </span>
                            
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-fredoka text-white">
                                PAWLSE <span className="text-paw-orange">Stories & Updates</span>
                            </h1>

                            <p className="mt-2 text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
                                Heartfelt rescue stories, adoption milestones, animal welfare awareness, and official updates.
                            </p>
                        </motion.div>
                    </div>

                    {/* Search Bar - Positioned cleanly below title with Combobox Suggestions */}
                    <div ref={searchContainerRef} className="mt-6 max-w-xl mx-auto relative z-50 text-center">
                            <form onSubmit={(e) => handleSearchSubmit(e)} className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                                <input
                                    type="text"
                                    value={search}
                                    onFocus={() => setIsSuggestionsOpen(true)}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setIsSuggestionsOpen(true);
                                    }}
                                    placeholder="Search stories, campaigns (e.g. RA 8485, Milo, Kapon)..."
                                    className="w-full pl-11 pr-28 py-3 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-paw-orange focus:ring-2 focus:ring-paw-orange/30 text-xs sm:text-sm font-semibold transition shadow-xl"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            handleSearchSubmit(undefined, '');
                                        }}
                                        className="absolute right-22 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition cursor-pointer"
                                        title="Clear search"
                                    >
                                        <X size={15} />
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-paw-orange hover:bg-orange-600 text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
                                >
                                    Search
                                </button>
                            </form>

                            {/* Floating Combobox Suggestions Dropdown */}
                            <AnimatePresence>
                                {isSuggestionsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute left-0 right-0 top-full mt-2.5 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 text-left overflow-hidden z-[100] text-paw-navy dark:text-gray-100 p-5 max-h-[460px] overflow-y-auto"
                                    >
                                        {/* Live matching post results if user typed */}
                                        {search.trim() && matchingPosts.length > 0 && (
                                             <div className="mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                                                 <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-paw-orange mb-2 px-2">
                                                     <Sparkles size={12} /> Matching Articles
                                                 </div>
                                                 <div className="space-y-1">
                                                     {matchingPosts.map((mp) => {
                                                         const MetaIcon = CATEGORY_CONFIG[mp.category]?.icon || FileText;
                                                         return (
                                                             <Link
                                                                 key={mp.id}
                                                                 href={`/blog/${mp.slug}`}
                                                                 className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
                                                             >
                                                                 <div className="flex items-center gap-2.5 min-w-0">
                                                                     <div className="w-8 h-8 rounded-lg bg-paw-orange/10 text-paw-orange flex items-center justify-center shrink-0">
                                                                         <MetaIcon size={15} />
                                                                     </div>
                                                                     <div className="min-w-0">
                                                                         <p className="text-xs font-bold text-paw-navy dark:text-white truncate group-hover:text-paw-orange transition">
                                                                             {mp.title}
                                                                         </p>
                                                                         <p className="text-[10px] text-gray-400">
                                                                             {CATEGORY_CONFIG[mp.category]?.label || mp.category} • {formatDate(mp.published_at)}
                                                                         </p>
                                                                     </div>
                                                                 </div>
                                                                 <ArrowRight size={13} className="text-gray-400 group-hover:text-paw-orange group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                                                             </Link>
                                                         );
                                                     })}
                                                 </div>
                                             </div>
                                        )}

                                        {/* Suggested Search Topics */}
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2.5 px-2">
                                                <Compass size={13} /> Suggested Topics & Campaigns
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {SEARCH_SUGGESTIONS.map((sug, sIdx) => {
                                                    const IconComponent = sug.icon;
                                                    return (
                                                        <button
                                                            key={sIdx}
                                                            type="button"
                                                            onClick={() => handleSelectSuggestion(sug.query)}
                                                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left group w-full cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:bg-paw-orange group-hover:text-white flex items-center justify-center shrink-0 transition">
                                                                <IconComponent size={15} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-paw-orange transition truncate">
                                                                    {sug.title}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400">
                                                                    {CATEGORY_CONFIG[sug.category]?.label || 'Topic'}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Quick Popular Tags */}
                                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-1.5 px-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                                                <Tag size={11} /> Quick Tags:
                                            </span>
                                            {POPULAR_TAGS.map((tag, tIdx) => (
                                                <button
                                                    key={tIdx}
                                                    type="button"
                                                    onClick={() => handleSelectSuggestion(tag)}
                                                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-paw-orange/10 hover:text-paw-orange transition cursor-pointer"
                                                >
                                                    #{tag}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Quick Clickable Suggestions under search input */}
                            <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap text-xs text-gray-300 font-medium">
                                <span className="text-[11px] font-bold text-paw-yellow flex items-center gap-1">
                                    <Flame size={12} className="text-amber-400" /> Popular:
                                </span>
                                {['RA 8485', 'Milo Rescue', 'Spay & Neuter', 'Feeding Caravan', 'Bella'].map((term, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectSuggestion(term)}
                                        className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition border border-white/10 hover:border-paw-orange cursor-pointer"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                {/* Colorful, Full-Width Category Pills (Tabs) - Positioned Below Search Section & with z-index ABOVE the Hero Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-9 sm:-mt-10 relative z-20">
                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-2 sm:p-2.5 shadow-2xl border border-gray-100 dark:border-gray-800 w-full text-paw-navy dark:text-gray-100">
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5 w-full">
                            {/* All Posts Tab */}
                            {(() => {
                                const allCfg = CATEGORY_CONFIG['all'];
                                const AllIcon = allCfg.icon;
                                const isActive = !filters.category || filters.category === 'all';
                                return (
                                    <button
                                        type="button"
                                        onClick={() => handleCategoryClick('all')}
                                        className={`w-full min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wide transition border cursor-pointer shadow-xs ${
                                            isActive ? allCfg.active : allCfg.inactive
                                        }`}
                                    >
                                        <AllIcon size={15} className="shrink-0" />
                                        <span className="whitespace-nowrap">{allCfg.label}</span>
                                        <span className={`text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-0.5 ${
                                            isActive ? allCfg.badgeActive : allCfg.badgeInactive
                                        }`}>
                                            {categoryCounts['all'] ?? 0}
                                        </span>
                                    </button>
                                );
                            })()}

                            {/* Category Specific Tabs with Individual Vibrant Colors */}
                            {Object.entries(categories).map(([key, fullLabel]) => {
                                const cfg = CATEGORY_CONFIG[key] || {
                                    label: fullLabel,
                                    active: 'bg-paw-orange text-white border-paw-orange',
                                    inactive: 'bg-gray-100 text-gray-700 border-gray-200',
                                    badgeActive: 'bg-white/20 text-white',
                                    badgeInactive: 'bg-gray-200 text-gray-700',
                                    icon: FileText,
                                    cardBadge: 'bg-gray-100 text-gray-700 border-gray-200',
                                };
                                const IconComponent = cfg.icon;
                                const isActive = filters.category === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleCategoryClick(key)}
                                        className={`w-full min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wide transition border cursor-pointer shadow-xs ${
                                            isActive ? cfg.active : cfg.inactive
                                        }`}
                                    >
                                        <IconComponent size={15} className="shrink-0" />
                                        <span className="whitespace-nowrap">{cfg.label}</span>
                                        <span className={`text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-0.5 ${
                                            isActive ? cfg.badgeActive : cfg.badgeInactive
                                        }`}>
                                            {categoryCounts[key] ?? 0}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Active Filter Pill if search or category is active */}
                {(filters.category && filters.category !== 'all' || filters.search) && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filtered by:</span>
                        {filters.category && filters.category !== 'all' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-paw-orange/10 text-paw-orange border border-paw-orange/20">
                                {CATEGORY_CONFIG[filters.category]?.label || filters.category}
                            </span>
                        )}
                        {filters.search && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-paw-blue/10 text-paw-blue border border-paw-blue/20">
                                "{filters.search}"
                            </span>
                        )}
                        <button
                            onClick={handleClearFilters}
                            className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1 ml-2 cursor-pointer"
                        >
                            <X size={13} /> Reset Filters
                        </button>
                    </div>
                )}

                {/* Featured / Highlight Hero Card */}
                {featuredPost && (!filters.category || filters.category === 'all') && !filters.search && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 group hover:shadow-2xl transition duration-300">
                            <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden">
                                <ImageWithFallback
                                    src={featuredPost.featured_image || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80'}
                                    alt={featuredPost.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-paw-orange text-white shadow-lg flex items-center gap-1.5">
                                        <Sparkles size={13} /> Featured Story
                                    </span>
                                </div>
                            </div>

                            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mb-3">
                                        {(() => {
                                            const cfg = CATEGORY_CONFIG[featuredPost.category] || CATEGORY_CONFIG['news_update'];
                                            const FeaturedIcon = cfg.icon;
                                            return (
                                                <span className={`px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${cfg.cardBadge}`}>
                                                    <FeaturedIcon size={13} className="shrink-0" />
                                                    {cfg.label}
                                                </span>
                                            );
                                        })()}
                                        <span className="flex items-center gap-1">
                                            <Calendar size={13} />
                                            {formatDate(featuredPost.published_at)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={13} />
                                            {featuredPost.reading_time_minutes} min read
                                        </span>
                                    </div>

                                    <Link href={`/blog/${featuredPost.slug}`}>
                                        <h2 className="text-2xl sm:text-3xl font-black text-paw-navy dark:text-white leading-snug group-hover:text-paw-orange transition line-clamp-3">
                                            {featuredPost.title}
                                        </h2>
                                    </Link>

                                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium line-clamp-4">
                                        {featuredPost.summary || featuredPost.content.substring(0, 160) + '...'}
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => handleReact(e, featuredPost.id, 'heart')}
                                            className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 cursor-pointer"
                                            title="React Love"
                                        >
                                            <Heart size={14} className={featuredPost.user_reactions?.includes('heart') ? 'fill-rose-500 text-rose-500' : ''} />
                                            <span>{featuredPost.reaction_summary?.total ?? 0}</span>
                                        </button>

                                        <button
                                            onClick={(e) => handleOpenShare(e, featuredPost)}
                                            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-paw-navy dark:hover:text-white transition bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl cursor-pointer"
                                            title="Share Post"
                                        >
                                            <Share2 size={14} />
                                            <span>Share</span>
                                        </button>
                                    </div>

                                    <Link
                                        href={`/blog/${featuredPost.slug}`}
                                        className="inline-flex items-center gap-1.5 text-xs font-black text-paw-orange hover:text-orange-600 uppercase tracking-wider group-hover:translate-x-1 transition"
                                    >
                                        Read Story <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Main Articles Grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-paw-navy dark:text-white uppercase tracking-tight">
                                {filters.category && filters.category !== 'all'
                                    ? CATEGORY_CONFIG[filters.category]?.label || 'Articles'
                                    : 'Recent Articles & Feeds'}
                            </h2>
                            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">
                                Showing {posts.data.length} of {posts.total} published posts
                            </p>
                        </div>
                    </div>

                    {posts.data.length === 0 ? (
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm max-w-lg mx-auto">
                            <AlertCircle size={48} className="mx-auto text-paw-orange mb-4" />
                            <h3 className="text-xl font-black text-paw-navy dark:text-white">No articles found</h3>
                            <p className="text-sm font-medium text-gray-500 mt-2">
                                There are currently no published articles matching your criteria. Try adjusting your search or category filter.
                            </p>
                            <button
                                onClick={handleClearFilters}
                                className="mt-6 px-6 py-2.5 bg-paw-orange text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-orange-600 transition cursor-pointer"
                            >
                                View All Posts
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.data.map((post) => {
                                const cfg = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG['news_update'];
                                const PostIcon = cfg.icon;
                                const hasUserReacted = (post.user_reactions?.length ?? 0) > 0;
                                
                                return (
                                    <article
                                        key={post.id}
                                        className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between group"
                                    >
                                        <div>
                                            {/* Image container */}
                                            <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                <ImageWithFallback
                                                    src={post.featured_image || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80'}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                />
                                                <div className="absolute top-3 left-3">
                                                    <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-sm flex items-center gap-1.5 ${cfg.cardBadge}`}>
                                                        <PostIcon size={12} className="shrink-0" />
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                {post.is_featured && (
                                                    <div className="absolute top-3 right-3" title="Featured Story">
                                                        <span className="w-7 h-7 rounded-full bg-amber-500 text-white shadow-md flex items-center justify-center">
                                                            <Star size={13} className="fill-white text-white" />
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content body */}
                                            <div className="p-6">
                                                <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {formatDate(post.published_at)}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {post.reading_time_minutes} min read
                                                    </span>
                                                </div>

                                                <Link href={`/blog/${post.slug}`}>
                                                    <h3 className="text-xl font-black text-paw-navy dark:text-white line-clamp-2 group-hover:text-paw-orange transition leading-snug">
                                                        {post.title}
                                                    </h3>
                                                </Link>

                                                <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed font-medium">
                                                    {post.summary || post.content.substring(0, 120) + '...'}
                                                </p>

                                                {/* Tags */}
                                                {post.tags && post.tags.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                                        {post.tags.slice(0, 3).map((tag, tIdx) => (
                                                            <span
                                                                key={tIdx}
                                                                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card footer: Reactions & Share */}
                                        <div className="p-6 pt-0 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => handleReact(e, post.id, 'heart')}
                                                    className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
                                                        hasUserReacted
                                                            ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                                                            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100'
                                                    }`}
                                                    title="React to this story"
                                                >
                                                    <Heart size={13} className={hasUserReacted ? 'fill-white' : ''} />
                                                    <span>{post.reaction_summary?.total ?? 0}</span>
                                                </button>

                                                <button
                                                    onClick={(e) => handleOpenShare(e, post)}
                                                    className="p-1.5 rounded-xl text-gray-500 hover:text-paw-navy dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition cursor-pointer"
                                                    title="Share article"
                                                >
                                                    <Share2 size={14} />
                                                </button>
                                            </div>

                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="text-xs font-black text-paw-orange hover:text-orange-600 uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition"
                                            >
                                                Read <ArrowRight size={13} />
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {posts.links && posts.links.length > 3 && (
                        <div className="mt-12 flex justify-center items-center gap-1.5">
                            {posts.links.map((link, idx) => {
                                if (link.url === null) {
                                    return (
                                        <span
                                            key={idx}
                                            className="px-3.5 py-2 text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        className={`px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                                            link.active
                                                ? 'bg-paw-orange text-white shadow-md shadow-paw-orange/20'
                                                : 'bg-white dark:bg-gray-800 text-paw-navy dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Laws & Legal Awareness Section (Static Educational Knowledge Base) */}
                <section className="mt-20 border-t border-gray-200/70 dark:border-gray-800 pt-16 bg-gradient-to-b from-gray-50/70 via-white to-gray-50/50 dark:from-gray-900/40 dark:via-gray-950 dark:to-gray-950 px-4 sm:px-8 py-14 rounded-[2.5rem] max-w-7xl mx-auto shadow-xs border border-gray-100 dark:border-gray-800/80">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-black text-[11px] uppercase tracking-widest mb-3">
                            <Scale size={13} className="text-rose-500" />
                            Legal Awareness & Animal Protection
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-paw-navy dark:text-white leading-tight font-fredoka">
                            Know the Law: <span className="text-paw-orange">Protecting Our Companions</span>
                        </h2>
                        <p className="mt-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
                            Essential Philippine animal welfare laws, penalties for animal cruelty and abandonment, and citizen legal guidelines to help build a compassionate community.
                        </p>
                    </div>

                    {/* Key Laws Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {/* Law 1: RA 8485 & RA 10631 */}
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                                        Republic Act No. 8485 / 10631
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 flex items-center justify-center">
                                        <Scale size={18} />
                                    </div>
                                </div>
                                <h3 className="text-base font-black text-paw-navy dark:text-white mb-2">
                                    The Animal Welfare Act of the Philippines
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    Protects all animals from torture, neglect, maltreatment, and unnecessary killing. It establishes that animals have basic physiological needs and prohibits depriving them of adequate sustenance and clean shelter.
                                </p>
                            </div>
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-start gap-2 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                                    <Gavel size={14} className="shrink-0 mt-0.5" />
                                    <span>Penalty: 1 to 3 years imprisonment and fines up to ₱250,000.</span>
                                </div>
                            </div>
                        </div>

                        {/* Law 2: RA 9482 Anti-Rabies Act */}
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                                        Republic Act No. 9482
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center">
                                        <ShieldAlert size={18} />
                                    </div>
                                </div>
                                <h3 className="text-base font-black text-paw-navy dark:text-white mb-2">
                                    Anti-Rabies Act of 2007
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    Requires mandatory rabies vaccination for pet dogs and cats by 3 months of age and yearly thereafter. Mandates pet registration with local government units and bans allowing pets to roam unleashed outside private premises.
                                </p>
                            </div>
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-start gap-2 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                    <Gavel size={14} className="shrink-0 mt-0.5" />
                                    <span>Penalty: Fines for non-registration, refusal to vaccinate, plus liability for medical expenses if a bite occurs.</span>
                                </div>
                            </div>
                        </div>

                        {/* Law 3: Ban on Dog Meat Trade */}
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50">
                                        DA Admin Order & RA 8485
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 flex items-center justify-center">
                                        <AlertTriangle size={18} />
                                    </div>
                                </div>
                                <h3 className="text-base font-black text-paw-navy dark:text-white mb-2">
                                    Total Prohibition of Dog & Cat Meat Trade
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    Strict nationwide ban on the commercial trade, inter-provincial trafficking, slaughter, and sale of dogs and cats for human consumption. Vehicles caught transporting animals are subject to seizure and forfeiture.
                                </p>
                            </div>
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-start gap-2 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                                    <Gavel size={14} className="shrink-0 mt-0.5" />
                                    <span>Penalty: Criminal charges, vehicle confiscation, and permanent revocation of commercial licenses.</span>
                                </div>
                            </div>
                        </div>

                        {/* Law 4: Pet Abandonment Laws */}
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                                        RA 10631 Sec. 7
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 flex items-center justify-center">
                                        <HeartCrack size={18} />
                                    </div>
                                </div>
                                <h3 className="text-base font-black text-paw-navy dark:text-white mb-2">
                                    Pet Abandonment Is a Crime
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    Dumping domesticated pets on streets, vacant lots, public markets, or outside animal shelters is an unlawful abandonment punishable by law. Relinquishing ownership must follow humane transfer or adoption procedures.
                                </p>
                            </div>
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-start gap-2 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                    <Gavel size={14} className="shrink-0 mt-0.5" />
                                    <span>Penalty: Classified as direct animal maltreatment with mandatory fines and potential imprisonment.</span>
                                </div>
                            </div>
                        </div>

                        {/* Law 5: Five Freedoms of Animal Welfare */}
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                                        Universal Standard
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center">
                                        <ShieldCheck size={18} />
                                    </div>
                                </div>
                                <h3 className="text-base font-black text-paw-navy dark:text-white mb-2">
                                    The 5 Freedoms of Animal Welfare
                                </h3>
                                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                                    <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> 1. Freedom from hunger & thirst</li>
                                    <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> 2. Freedom from discomfort & weather</li>
                                    <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> 3. Freedom from pain, injury & disease</li>
                                    <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> 4. Freedom to express normal behavior</li>
                                    <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> 5. Freedom from fear and distress</li>
                                </ul>
                            </div>
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Guiding principle for all shelters, fosters, and pet guardians.</span>
                            </div>
                        </div>

                        {/* Law 6: Local Government & Barangay Pet Ordinances */}
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900/50">
                                        LGU Ordinances
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 flex items-center justify-center">
                                        <BookOpen size={18} />
                                    </div>
                                </div>
                                <h3 className="text-base font-black text-paw-navy dark:text-white mb-2">
                                    City Ordinances & Leash Laws
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    Local municipal councils enforce mandatory leashing in public parks, poop-scooping regulations, and maximum pet limits in high-density residences. Animal catchers must adhere to humane capture protocols without cruelty.
                                </p>
                            </div>
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-start gap-2 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                                    <Gavel size={14} className="shrink-0 mt-0.5" />
                                    <span>Penalty: Administrative citations, impounding fees, and mandatory community seminars.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Citizen Action Guide Box */}
                    <div className="bg-paw-navy text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
                            <Scale size={200} />
                        </div>
                        <div className="relative z-10 w-full">
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-paw-orange/20 border border-paw-orange/30 text-paw-yellow font-black text-[11px] uppercase tracking-wider mb-2">
                                <Info size={12} /> Citizen Action Guide
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black mb-2 font-fredoka">
                                Witnessed Animal Abuse or Neglect? Here's What to Do:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 text-xs">
                                <div className="bg-white/10 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-white/10">
                                    <span className="text-paw-orange font-black text-sm block mb-1.5 font-fredoka">Step 1: Document</span>
                                    <p className="text-gray-300 leading-relaxed">Take clear, discreet photos or videos with exact date, time, and address. Never put yourself in physical danger.</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-white/10">
                                    <span className="text-paw-orange font-black text-sm block mb-1.5 font-fredoka">Step 2: Barangay Report</span>
                                    <p className="text-gray-300 leading-relaxed">File a formal blotter with the Barangay Council or Lupon. Officials have a legal duty to investigate animal maltreatment.</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-white/10">
                                    <span className="text-paw-orange font-black text-sm block mb-1.5 font-fredoka">Step 3: Escalate</span>
                                    <p className="text-gray-300 leading-relaxed">Coordinate with the City Veterinary Office, local PNP station, or notify the PAWLSE rescue community for legal coordination.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Share Dialog Modal */}
            <AnimatePresence>
                {shareModalPost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShareModalPost(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 text-paw-navy dark:text-white"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-2xl bg-paw-orange/10 flex items-center justify-center text-paw-orange">
                                        <Share2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg">Share this Story</h3>
                                        <p className="text-xs text-gray-500 font-medium">Spread awareness and save more strays</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShareModalPost(null)}
                                    className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 line-clamp-2">
                                "{shareModalPost.title}"
                            </p>

                            <div className="space-y-3">
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/blog/' + shareModalPost.slug)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => router.post(`/blog/${shareModalPost.id}/share`, {}, { preserveScroll: true })}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#1877F2] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition"
                                >
                                    Share to Facebook
                                </a>

                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareModalPost.title)}&url=${encodeURIComponent(window.location.origin + '/blog/' + shareModalPost.slug)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => router.post(`/blog/${shareModalPost.id}/share`, {}, { preserveScroll: true })}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#000000] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition border border-gray-700"
                                >
                                    Share to X (Twitter)
                                </a>

                                <a
                                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareModalPost.title + ' ' + window.location.origin + '/blog/' + shareModalPost.slug)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => router.post(`/blog/${shareModalPost.id}/share`, {}, { preserveScroll: true })}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition"
                                >
                                    Share to WhatsApp
                                </a>

                                <button
                                    onClick={() => handleCopyLink(shareModalPost.slug)}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-paw-navy dark:text-white font-bold text-xs uppercase tracking-wider transition border border-gray-200 dark:border-gray-700 cursor-pointer"
                                >
                                    {copiedUrl ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    <span>{copiedUrl ? 'Copied to Clipboard!' : 'Copy Article Link'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}

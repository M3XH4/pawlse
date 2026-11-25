import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bookmark,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Heart,
    Newspaper,
    Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DashboardCard } from '@/components/dashboard/section-page';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useBookmarks } from '@/context/bookmark-context';
import { cn } from '@/lib/utils';

export interface DashboardBlogPost {
    id: number;
    title: string;
    slug: string;
    category: string;
    category_label: string;
    summary: string;
    featured_image: string | null;
    reading_time_minutes: number;
    is_featured: boolean;
    published_at: string | null;
    views_count: number;
    author: {
        id: number;
        name: string;
        role: string;
    } | null;
    shelter_animal: {
        id: number;
        name: string;
        type: string;
        breed: string | null;
        photo_url: string | null;
    } | null;
    reaction_summary: {
        heart: number;
        paws: number;
        celebrate: number;
        care: number;
        total: number;
    };
    user_reactions: string[];
}

const CATEGORY_BADGE_COLORS: Record<string, string> = {
    adoption_success: 'bg-emerald-500/90 text-white',
    rescue_story: 'bg-rose-500/90 text-white',
    community_awareness: 'bg-sky-500/90 text-white',
    advocacy_campaign: 'bg-violet-500/90 text-white',
    news_update: 'bg-amber-500/90 text-white',
    announcement: 'bg-indigo-500/90 text-white',
    testimonial: 'bg-teal-500/90 text-white',
};

function formatPublishedDate(value: string | null): string {
    if (!value) {
        return 'Recently';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return 'Recently';
    }

    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function BlogCarousel({
    posts,
    categories,
}: {
    posts: DashboardBlogPost[];
    categories: Record<string, string>;
}) {
    const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [itemsPerView, setItemsPerView] = useState<number>(3);
    const [isPaused, setIsPaused] = useState<boolean>(false);

    useEffect(() => {
        const updateItemsPerView = () => {
            if (window.innerWidth < 768) {
                setItemsPerView(1);
            } else if (window.innerWidth < 1280) {
                setItemsPerView(2);
            } else {
                setItemsPerView(3);
            }
        };

        updateItemsPerView();
        window.addEventListener('resize', updateItemsPerView);

        return () => window.removeEventListener('resize', updateItemsPerView);
    }, []);

    const availableCategories = useMemo(() => {
        const present = new Set(posts.map((post) => post.category));

        return Object.entries(categories).filter(([key]) => present.has(key));
    }, [posts, categories]);

    const filteredPosts = useMemo(() => {
        if (selectedCategory === 'all') {
            return posts;
        }

        return posts.filter((post) => post.category === selectedCategory);
    }, [posts, selectedCategory]);

    const maxIndex = Math.max(0, filteredPosts.length - itemsPerView);

    useEffect(() => {
        setCurrentIndex(0);
    }, [selectedCategory, itemsPerView]);

    useEffect(() => {
        if (isPaused || maxIndex <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 6500);

        return () => window.clearInterval(timer);
    }, [isPaused, maxIndex]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const toggleBookmark = (post: DashboardBlogPost) => {
        if (isBookmarked(post.id, 'blog')) {
            removeBookmark(post.id, 'blog');
        } else {
            addBookmark({
                id: post.id,
                type: 'blog',
                title: post.title,
                image: post.featured_image || undefined,
                data: {
                    slug: post.slug,
                    category: post.category,
                    summary: post.summary,
                    reading_time_minutes: post.reading_time_minutes,
                },
            });
        }
    };

    return (
        <DashboardCard
            className="overflow-hidden border-[#E2E8F0] p-5 sm:p-6 dark:border-[#1E293B]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Header Row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <Newspaper className="h-3.5 w-3.5" />
                        <span>Community Stories & Updates</span>
                    </div>
                    <h3 className="mt-2 font-fredoka text-2xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                        Latest Stories & Articles
                    </h3>
                    <p className="mt-1 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                        Catch up on rescue stories, adoption wins, and helpful pet care tips.
                    </p>
                </div>

                <div className="flex w-full sm:w-auto items-center justify-between gap-2">
                    <Link
                        href="/blog"
                        className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-[#0B2340] transition hover:border-emerald-400 hover:text-emerald-700 dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                    >
                        <span>Browse All Stories</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>

                    {filteredPosts.length > itemsPerView && (
                        <div className="flex shrink-0 items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handlePrev}
                                aria-label="Previous articles"
                                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#0B2340] transition hover:bg-[#F1F5F9] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:hover:bg-[#1E293B]"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                aria-label="Next articles"
                                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#0B2340] transition hover:bg-[#F1F5F9] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:hover:bg-[#1E293B]"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Filter Pills */}
            {availableCategories.length > 0 && (
                <div className="mt-4 flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                    <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            'shrink-0 whitespace-nowrap cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition',
                            selectedCategory === 'all'
                                ? 'bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] text-white shadow-sm'
                                : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:hover:bg-[#334155]',
                        )}
                    >
                        All Stories ({posts.length})
                    </button>
                    {availableCategories.map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedCategory(key)}
                            className={cn(
                                'shrink-0 whitespace-nowrap cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition',
                                selectedCategory === key
                                    ? 'bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] text-white shadow-sm'
                                    : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:hover:bg-[#334155]',
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Carousel Viewport */}
            {filteredPosts.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-6 py-12 text-center dark:border-[#334155] dark:bg-[#0F172A]/60">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Newspaper className="h-7 w-7" />
                    </div>
                    <h4 className="mt-4 font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                        No stories published yet
                    </h4>
                    <p className="mt-1 max-w-md text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                        Check back soon for new rescue updates and community tips, or share your own adoption experience!
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
                        >
                            <span>Visit Blog</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                            href="/account/user/stories"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#0B2340] transition hover:bg-[#F1F5F9] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
                        >
                            <span>Share Your Story</span>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="mt-5">
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{
                                transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)`,
                            }}
                        >
                            {filteredPosts.map((post) => {
                                const bookmarked = isBookmarked(post.id, 'blog');
                                const badgeClass =
                                    CATEGORY_BADGE_COLORS[post.category] ?? 'bg-slate-700/90 text-white';

                                return (
                                    <div
                                        key={post.id}
                                        className="shrink-0 px-2"
                                        style={{ width: `${100 / itemsPerView}%` }}
                                    >
                                        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-[#1E293B] dark:bg-[#0F172A] dark:hover:border-emerald-700/60">
                                            {/* Cover Image */}
                                            <div className="relative h-44 w-full overflow-hidden bg-[#E2E8F0] dark:bg-[#1E293B]">
                                                <ImageWithFallback
                                                    src={post.featured_image || '/images/placeholder-pet.jpg'}
                                                    alt={post.title}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                                                <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                                                    <span
                                                        className={cn(
                                                            'rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-sm',
                                                            badgeClass,
                                                        )}
                                                    >
                                                        {post.category_label}
                                                    </span>
                                                    {post.is_featured && (
                                                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-400 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow-sm">
                                                            <Sparkles className="h-3 w-3" />
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleBookmark(post)}
                                                    aria-label={
                                                        bookmarked ? `Remove ${post.title} from bookmarks` : `Bookmark ${post.title}`
                                                    }
                                                    className={cn(
                                                        'absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-sm backdrop-blur-md transition',
                                                        bookmarked
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-white/90 text-[#0B2340] hover:bg-white dark:bg-slate-900/80 dark:text-white',
                                                    )}
                                                >
                                                    <Bookmark
                                                        className="h-4 w-4"
                                                        fill={bookmarked ? 'currentColor' : 'none'}
                                                    />
                                                </button>
                                            </div>

                                            {/* Body */}
                                            <div className="flex flex-1 flex-col justify-between p-4">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatPublishedDate(post.published_at)}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {post.reading_time_minutes} min read
                                                        </span>
                                                    </div>

                                                    <Link
                                                        href={`/blog/${post.slug}`}
                                                        className="mt-2 block font-fredoka text-lg font-bold leading-snug text-[#0B2340] transition group-hover:text-emerald-700 line-clamp-2 dark:text-[#F8FAFC] dark:group-hover:text-emerald-300"
                                                    >
                                                        {post.title}
                                                    </Link>

                                                    <p className="mt-1.5 text-xs font-medium leading-relaxed text-[#64748B] line-clamp-2 dark:text-[#94A3B8]">
                                                        {post.summary}
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-3 dark:border-[#1E293B]">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                                        <span className="inline-flex items-center gap-1 text-rose-500">
                                                            <Heart className="h-3.5 w-3.5" fill="currentColor" />
                                                            <span>{post.reaction_summary?.total ?? 0}</span>
                                                        </span>
                                                        {post.author?.name && (
                                                            <span className="truncate max-w-[9rem]">
                                                                by {post.author.name}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <Link
                                                        href={`/blog/${post.slug}`}
                                                        className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 transition hover:gap-1.5 dark:text-emerald-400"
                                                    >
                                                        <span>Read Story</span>
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </article>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Slide Dots */}
                    {maxIndex > 0 && (
                        <div className="mt-4 flex items-center justify-center gap-1.5">
                            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setCurrentIndex(idx)}
                                    aria-label={`Go to slide ${idx + 1}`}
                                    className={cn(
                                        'h-2 cursor-pointer rounded-full transition-all',
                                        currentIndex === idx
                                            ? 'w-6 bg-emerald-600 dark:bg-emerald-400'
                                            : 'w-2 bg-[#CBD5E1] hover:bg-[#94A3B8] dark:bg-[#334155]',
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </DashboardCard>
    );
}

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Heart, Share2, Clock, Calendar, ArrowLeft, ArrowRight,
    Copy, Check, Shield, User, Tag, Sparkles, MessageSquareOff,
    CheckCircle2, ExternalLink, PawPrint, HeartHandshake,
    GraduationCap, Scale, Newspaper, Megaphone, PartyPopper,
    FileText, Star, MessageSquareQuote, AlertCircle
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
    rating?: number | null;
    shelter_animal?: {
        id: number;
        name: string;
        type: string;
        breed?: string | null;
        age?: string | null;
        gender?: string | null;
        color?: string | null;
        photo_url?: string | null;
        status?: string | null;
    } | null;
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

interface BlogShowProps {
    post: BlogPostItem;
    relatedPosts: BlogPostItem[];
    categories: Record<string, string>;
}

const CATEGORY_META: Record<string, { label: string; badgeBg: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
    testimonial: { label: 'Testimonial', badgeBg: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300', icon: MessageSquareQuote },
    rescue_story: { label: 'Rescue Story', badgeBg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300', icon: PawPrint },
    adoption_success: { label: 'Adoption Success', badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300', icon: HeartHandshake },
    announcement: { label: 'Announcement', badgeBg: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300', icon: Megaphone },
    community_awareness: { label: 'Community Awareness', badgeBg: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300', icon: GraduationCap },
    advocacy_campaign: { label: 'Advocacy Campaign', badgeBg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300', icon: Scale },
    news_update: { label: 'News & Updates', badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300', icon: Newspaper },
};

const REACTION_CONFIG: { type: 'heart' | 'paws' | 'celebrate' | 'care'; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; activeColor: string }[] = [
    { type: 'heart', label: 'Love', icon: Heart, activeColor: 'bg-rose-500 text-white border-rose-500' },
    { type: 'paws', label: 'Paw-some', icon: PawPrint, activeColor: 'bg-amber-500 text-white border-amber-500' },
    { type: 'celebrate', label: 'Celebrate', icon: PartyPopper, activeColor: 'bg-purple-500 text-white border-purple-500' },
    { type: 'care', label: 'Support', icon: HeartHandshake, activeColor: 'bg-blue-500 text-white border-blue-500' },
];

export default function BlogShow({
    post,
    relatedPosts,
    categories,
}: BlogShowProps) {
    const [copiedUrl, setCopiedUrl] = useState(false);

    const handleReact = (reactionType: string) => {
        router.post(`/blog/${post.id}/react`, {
            reaction_type: reactionType,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Reaction recorded!');
            },
        });
    };

    const handleShareNative = () => {
        const shareUrl = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.summary || post.title,
                url: shareUrl,
            }).then(() => {
                router.post(`/blog/${post.id}/share`, {}, { preserveScroll: true });
            }).catch(() => {
                handleCopyLink();
            });
        } else {
            handleCopyLink();
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopiedUrl(true);
            toast.success('Link copied to clipboard!');
            router.post(`/blog/${post.id}/share`, {}, { preserveScroll: true });
            setTimeout(() => setCopiedUrl(false), 2000);
        });
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Recently';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const meta = CATEGORY_META[post.category] || { label: post.category, badgeBg: 'bg-gray-100 text-gray-800', icon: FileText };
    const CategoryIcon = meta.icon;
    const userReactions = post.user_reactions || [];
    const reactionSummary = post.reaction_summary || { heart: 0, paws: 0, celebrate: 0, care: 0, total: 0 };

    return (
        <div className="relative font-quicksand min-h-screen bg-paw-bg/30 dark:bg-gray-950 text-paw-navy dark:text-gray-100 flex flex-col">
            <Head title={`${post.title} - PAWLSE Blog`} />
            <Header />

            <main className="flex-1 pb-24">
                {/* Top Breadcrumb & Return Bar */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-paw-orange transition group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
                        Back to All Stories
                    </Link>

                    {post.status !== 'published' && (
                        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900/60 p-4 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 shadow-xs">
                            <div className="flex items-center gap-2.5">
                                <Clock size={16} className="text-amber-600 shrink-0" />
                                <div>
                                    <span className="uppercase tracking-wider font-black text-amber-700 dark:text-amber-400 mr-1.5">
                                        Preview Mode:
                                    </span>
                                    <span>
                                        This article is currently <strong>{post.status === 'pending' ? 'Pending Admin Review' : post.status === 'rejected' ? 'Needs Revision' : post.status}</strong> and is not yet visible on the public feed.
                                    </span>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-200/70 dark:bg-amber-900/50 text-[10px] font-black uppercase tracking-wider shrink-0">
                                Unlisted
                            </span>
                        </div>
                    )}
                </div>

                {/* Article Header */}
                <article className="max-w-4xl mx-auto px-4 sm:px-6">
                    <header className="mb-8">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`px-3.5 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${meta.badgeBg}`}>
                                <CategoryIcon size={14} className="shrink-0" />
                                {meta.label}
                            </span>

                            <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                <Calendar size={13} />
                                {formatDate(post.published_at)}
                            </span>

                            <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                <Clock size={13} />
                                {post.reading_time_minutes} min read
                            </span>

                            {post.is_featured && (
                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
                                    <Star size={13} className="fill-amber-500 text-amber-500" /> Featured
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-paw-navy dark:text-white leading-tight">
                            {post.title}
                        </h1>

                        {/* Author Info */}
                        <div className="mt-6 flex items-center justify-between border-y border-gray-100 dark:border-gray-800 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-paw-orange/10 border-2 border-paw-orange flex items-center justify-center font-black text-paw-orange text-sm uppercase">
                                    {post.author?.name ? post.author.name.substring(0, 2) : 'PA'}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-paw-navy dark:text-white">
                                        {post.author?.name || 'PAWLSE Editorial Team'}
                                    </p>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {post.shelter_animal || post.rating ? 'Adoptive Parent & Community Story' : 'Official Organization Author'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleShareNative}
                                    className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Share2 size={14} />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.featured_image && (
                        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 mb-10 max-h-[480px]">
                            <ImageWithFallback
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Adopted Companion Card if linked */}
                    {post.shelter_animal && (
                        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border border-orange-200 dark:border-orange-900/40 rounded-3xl p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-center gap-5 shadow-sm">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-paw-orange shadow-md">
                                <ImageWithFallback
                                    src={post.shelter_animal.photo_url || post.featured_image || ''}
                                    alt={post.shelter_animal.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-paw-orange/15 text-paw-orange mb-1.5">
                                    <PawPrint size={13} />
                                    <span>Adopted Shelter Pet</span>
                                </div>
                                <h3 className="text-xl font-black text-paw-navy dark:text-white">
                                    Meet {post.shelter_animal.name}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1">
                                    {post.shelter_animal.type} {post.shelter_animal.breed ? `• ${post.shelter_animal.breed}` : ''} {post.shelter_animal.age ? `• ${post.shelter_animal.age}` : ''}
                                </p>
                                {post.rating && (
                                    <div className="flex items-center justify-center sm:justify-start gap-1 mt-2 text-amber-500 font-bold text-xs">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                size={14}
                                                className={s <= (post.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
                                            />
                                        ))}
                                        <span className="ml-1 text-gray-700 dark:text-gray-300 font-bold">
                                            {post.rating}.0 / 5 Adoption Rating
                                        </span>
                                    </div>
                                )}
                            </div>
                            <Link
                                href={`/animals/${post.shelter_animal.id}`}
                                className="px-4 py-2.5 rounded-xl bg-paw-orange hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-paw-orange/20 shrink-0"
                            >
                                View Pet Profile
                            </Link>
                        </div>
                    )}

                    {/* Standalone Community Testimonial Highlight if rating provided without a linked pet */}
                    {!post.shelter_animal && post.rating && (
                        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 dark:from-teal-950/20 dark:via-gray-900 dark:to-teal-950/20 border border-teal-200 dark:border-teal-900/40 rounded-3xl p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
                            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 flex items-center justify-center shrink-0">
                                <MessageSquareQuote size={28} />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-600/15 text-teal-700 dark:text-teal-300 mb-1.5">
                                    <Star size={13} className="fill-teal-600 text-teal-600" />
                                    <span>Community Review & Rating</span>
                                </div>
                                <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-amber-500 font-bold text-sm">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            size={16}
                                            className={s <= (post.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
                                        />
                                    ))}
                                    <span className="ml-1 text-gray-700 dark:text-gray-300 font-bold text-xs">
                                        {post.rating} / 5 Experience Rating
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Quote Box */}
                    {post.summary && (
                        <div className="bg-paw-orange/10 border-l-4 border-paw-orange p-6 rounded-r-3xl mb-10">
                            <p className="text-base sm:text-lg font-bold text-paw-navy dark:text-paw-orange leading-relaxed italic">
                                "{post.summary}"
                            </p>
                        </div>
                    )}

                    {/* Main Article Content */}
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 sm:p-12 shadow-xl border border-gray-100 dark:border-gray-800">
                        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                            {post.content.split('\n\n').map((paragraph, idx) => {
                                if (paragraph.startsWith('### ')) {
                                    return (
                                        <h3 key={idx} className="text-2xl font-black text-paw-navy dark:text-white pt-4 pb-1">
                                            {paragraph.replace('### ', '')}
                                        </h3>
                                    );
                                }
                                if (paragraph.startsWith('## ')) {
                                    return (
                                        <h2 key={idx} className="text-3xl font-black text-paw-navy dark:text-white pt-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                                            {paragraph.replace('## ', '')}
                                        </h2>
                                    );
                                }
                                if (paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                                    const items = paragraph.split('\n');
                                    return (
                                        <ul key={idx} className="space-y-2 my-4 list-disc pl-6 font-bold text-gray-700 dark:text-gray-300">
                                            {items.map((item, iIdx) => (
                                                <li key={iIdx} dangerouslySetInnerHTML={{ __html: item.replace(/^[-*\d.]+\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                            ))}
                                        </ul>
                                    );
                                }
                                return (
                                    <p
                                        key={idx}
                                        className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300"
                                        dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                    />
                                );
                            })}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Tags:</span>
                                {post.tags.map((tag, tIdx) => (
                                    <Link
                                        key={tIdx}
                                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-paw-orange/10 hover:text-paw-orange transition"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Interactive Engagement & Reaction Bar with Lucide Icons */}
                        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
                            <div className="text-center mb-6">
                                <h4 className="text-lg font-black text-paw-navy dark:text-white uppercase tracking-tight">
                                    React to this Article
                                </h4>
                                <p className="text-xs font-medium text-gray-500 mt-1">
                                    Share your feelings with the community! Click a reaction below:
                                </p>
                            </div>

                            {/* 4 Interactive Reactions with Lucide Icons */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                                {REACTION_CONFIG.map((r) => {
                                    const isReacted = userReactions.includes(r.type);
                                    const count = reactionSummary[r.type] ?? 0;
                                    const ReactionIcon = r.icon;

                                    return (
                                        <button
                                            key={r.type}
                                            onClick={() => handleReact(r.type)}
                                            className={`p-3.5 rounded-2xl border text-center transition transform active:scale-95 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                                                isReacted
                                                    ? `${r.activeColor} shadow-md`
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-paw-orange text-gray-700 dark:text-gray-200'
                                            }`}
                                        >
                                            <ReactionIcon size={22} className={isReacted ? 'text-white' : 'text-paw-navy dark:text-gray-200'} />
                                            <span className="text-xs font-black uppercase tracking-wider">{r.label}</span>
                                            <span className="text-xs font-bold opacity-80">{count}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Social Share Strip */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                                        Spread Awareness:
                                    </span>
                                    <span className="text-xs font-bold text-paw-orange">
                                        {post.shares_count} shares
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => router.post(`/blog/${post.id}/share`, {}, { preserveScroll: true })}
                                        className="px-3.5 py-2 rounded-xl bg-[#1877F2] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-sm"
                                    >
                                        Facebook
                                    </a>

                                    <a
                                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => router.post(`/blog/${post.id}/share`, {}, { preserveScroll: true })}
                                        className="px-3.5 py-2 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-sm"
                                    >
                                        X / Twitter
                                    </a>

                                    <a
                                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => router.post(`/blog/${post.id}/share`, {}, { preserveScroll: true })}
                                        className="px-3.5 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-sm"
                                    >
                                        WhatsApp
                                    </a>

                                    <button
                                        onClick={handleCopyLink}
                                        className="px-3.5 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-paw-navy dark:text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                        {copiedUrl ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* No Comments Notice per explicit user requirement */}
                        <div className="mt-8 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
                            <MessageSquareOff size={18} className="shrink-0 text-amber-600" />
                            <span>
                                <strong>Engagement Policy:</strong> In line with shelter community safety standards, public commenting is disabled to maintain a constructive and respectful atmosphere for advocacy and rescue stories.
                            </span>
                        </div>
                    </div>

                    {/* Call to action card */}
                    <div className="mt-12 bg-gradient-to-r from-paw-navy to-paw-blue text-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-paw-yellow block mb-2">
                                Help Us Make A Difference
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-black">
                                Inspired by this story?
                            </h3>
                            <p className="mt-2 text-sm text-gray-200 max-w-xl font-medium">
                                Your support funds urgent medical treatments, daily feeding routes, and humane shelter facilities in Iligan City.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <Link
                                href="/donate"
                                className="px-6 py-3.5 rounded-2xl bg-paw-orange hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-paw-orange/30"
                            >
                                Donate Now
                            </Link>
                            <Link
                                href="/volunteer"
                                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider transition border border-white/20"
                            >
                                Volunteer
                            </Link>
                        </div>
                    </div>

                    {/* Related Articles */}
                    {relatedPosts && relatedPosts.length > 0 && (
                        <div className="mt-16">
                            <h3 className="text-2xl font-black text-paw-navy dark:text-white uppercase tracking-tight mb-8">
                                Related Stories & Campaigns
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedPosts.map((rel) => {
                                    const relMeta = CATEGORY_META[rel.category] || { label: rel.category, badgeBg: 'bg-gray-100 text-gray-800', icon: FileText };
                                    const RelIcon = relMeta.icon;
                                    return (
                                        <article
                                            key={rel.id}
                                            className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition flex flex-col justify-between group"
                                        >
                                            <div>
                                                <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                    <ImageWithFallback
                                                        src={rel.featured_image || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80'}
                                                        alt={rel.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                    />
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${relMeta.badgeBg}`}>
                                                            <RelIcon size={11} className="shrink-0" />
                                                            {relMeta.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-5">
                                                    <Link href={`/blog/${rel.slug}`}>
                                                        <h4 className="text-base font-black text-paw-navy dark:text-white group-hover:text-paw-orange transition line-clamp-2 leading-snug">
                                                            {rel.title}
                                                        </h4>
                                                    </Link>
                                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                        {rel.summary || rel.content.substring(0, 90) + '...'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-5 pt-0 flex justify-end">
                                                <Link
                                                    href={`/blog/${rel.slug}`}
                                                    className="text-xs font-black text-paw-orange hover:text-orange-600 uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition"
                                                >
                                                    Read <ArrowRight size={12} />
                                                </Link>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </article>
            </main>

            <Footer />
        </div>
    );
}

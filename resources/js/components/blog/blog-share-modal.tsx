import { router } from '@inertiajs/react';
import {
    X,
    Share2,
    Copy,
    Check,
    Calendar,
    Mail,
    FileText,
    CheckCheck,
    Smartphone,
    User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import {
    FacebookIcon,
    TwitterXIcon,
    InstagramIcon,
    WhatsAppIcon,
    TelegramIcon,
} from '@/components/events/event-share-modal';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

export interface BlogSharePostItem {
    id: number;
    title: string;
    slug: string;
    category: string;
    summary: string | null;
    featured_image: string | null;
    published_at: string | null;
    created_at?: string;
    author?: {
        name: string;
    } | null;
    shelter_animal?: {
        photo_url?: string | null;
    } | null;
}

export interface BlogShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: BlogSharePostItem | null;
    categories?: Record<string, string>;
}

export function BlogShareModal({
    isOpen,
    onClose,
    post,
    categories = {},
}: BlogShareModalProps) {
    const [mounted, setMounted] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCaption, setCopiedCaption] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!mounted || typeof document === 'undefined') {
return null;
}

    const shareUrl =
        post && typeof window !== 'undefined'
            ? `${window.location.origin}/blog/${post.slug}`
            : '';

    const categoryLabel = post
        ? categories[post.category] || post.category.replace(/_/g, ' ')
        : '';

    const formattedDate = post
        ? (() => {
              const raw = post.published_at || post.created_at;

              if (!raw) {
return 'Recently';
}

              const d = new Date(raw);

              return Number.isNaN(d.getTime())
                  ? raw
                  : d.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    });
          })()
        : '';

    const detailLines = post
        ? [
              categoryLabel ? `• Category: ${categoryLabel}` : '',
              post.author?.name ? `• Author: ${post.author.name}` : '',
              formattedDate ? `• Published: ${formattedDate}` : '',
              post.summary ? `• Summary: ${post.summary}` : '',
          ].filter(Boolean)
        : [];

    const fullPost = post
        ? `📰 ${post.title}\n\n${detailLines.join('\n')}\n\nRead the full story here:\n${shareUrl}\n\n#IliganStrayFeeders #PAWLSE #CommunityStories`
        : '';

    const hasNativeShare =
        typeof navigator !== 'undefined' && typeof navigator.share === 'function';

    const trackShare = () => {
        if (!post) {
return;
}

        router.post(`/blog/${post.id}/share`, {}, { preserveScroll: true });
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopiedLink(true);
            toast.success('Article link copied to clipboard!');
            trackShare();
            setTimeout(() => setCopiedLink(false), 2500);
        } catch {
            toast.error('Failed to copy link.');
        }
    };

    const handleCopyCaption = async () => {
        try {
            await navigator.clipboard.writeText(fullPost);
            setCopiedCaption(true);
            toast.success('Article caption copied!', {
                description:
                    'Ready to paste into Instagram, Facebook, or group chats.',
            });
            trackShare();
            setTimeout(() => setCopiedCaption(false), 2500);
        } catch {
            toast.error('Failed to copy caption.');
        }
    };

    const handlePlatformShare = async (
        platform:
            | 'facebook'
            | 'twitter'
            | 'whatsapp'
            | 'telegram'
            | 'instagram'
            | 'email'
            | 'native',
    ) => {
        if (!post) {
return;
}

        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedFullPost = encodeURIComponent(fullPost);

        switch (platform) {
            case 'whatsapp': {
                window.open(
                    `https://api.whatsapp.com/send?text=${encodedFullPost}`,
                    '_blank',
                    'noopener,noreferrer',
                );
                toast.success('Opening WhatsApp...');
                trackShare();
                break;
            }

            case 'facebook': {
                try {
                    await navigator.clipboard.writeText(fullPost);
                    toast.success('Article details copied to clipboard!', {
                        description:
                            'Opening Facebook. Paste (Ctrl+V) into your post to include full details!',
                    });
                } catch {
                    toast.success('Opening Facebook share...');
                }

                window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
                    '_blank',
                    'width=650,height=550,noopener,noreferrer',
                );
                trackShare();
                break;
            }

            case 'twitter': {
                const tweetText = encodeURIComponent(
                    `📰 ${post.title}${post.summary ? ` — ${post.summary.slice(0, 120)}` : ''}`,
                );
                window.open(
                    `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodedUrl}&hashtags=Pawlse,IliganStrayFeeders`,
                    '_blank',
                    'width=650,height=550,noopener,noreferrer',
                );
                toast.success('Opening X (Twitter) share...');
                trackShare();
                break;
            }

            case 'telegram': {
                window.open(
                    `https://t.me/share/url?url=${encodedUrl}&text=${encodedFullPost}`,
                    '_blank',
                    'width=650,height=550,noopener,noreferrer',
                );
                toast.success('Opening Telegram...');
                trackShare();
                break;
            }

            case 'instagram': {
                try {
                    await navigator.clipboard.writeText(fullPost);
                    toast.success('Article details copied to clipboard!', {
                        description:
                            'Ready to paste into your Instagram caption, story, or DM.',
                    });
                    trackShare();
                } catch {
                    toast.error('Failed to copy article details.');
                }

                break;
            }

            case 'email': {
                const emailSubject = encodeURIComponent(post.title);
                const emailBody = encodeURIComponent(fullPost);
                window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
                toast.success('Opening your email composer...');
                trackShare();
                break;
            }

            case 'native': {
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: post.title,
                            text: fullPost,
                            url: shareUrl,
                        });
                        toast.success('Article shared successfully!');
                        trackShare();
                    } catch (err: unknown) {
                        if ((err as Error)?.name !== 'AbortError') {
                            await handleCopyCaption();
                        }
                    }
                } else {
                    await handleCopyCaption();
                }

                break;
            }
        }
    };

    const socialPlatforms = [
        {
            id: 'whatsapp',
            label: 'WhatsApp',
            icon: WhatsAppIcon,
            bgClass: 'bg-[#25D366] hover:bg-[#20bd5a] text-white',
            action: () => handlePlatformShare('whatsapp'),
        },
        {
            id: 'facebook',
            label: 'Facebook',
            icon: FacebookIcon,
            bgClass: 'bg-[#1877F2] hover:bg-[#1465d8] text-white',
            action: () => handlePlatformShare('facebook'),
        },
        {
            id: 'twitter',
            label: 'X / Twitter',
            icon: TwitterXIcon,
            bgClass: 'bg-black hover:bg-neutral-800 text-white',
            action: () => handlePlatformShare('twitter'),
        },
        {
            id: 'telegram',
            label: 'Telegram',
            icon: TelegramIcon,
            bgClass: 'bg-[#26A5E4] hover:bg-[#1e93cd] text-white',
            action: () => handlePlatformShare('telegram'),
        },
        {
            id: 'instagram',
            label: 'Instagram',
            icon: InstagramIcon,
            bgClass:
                'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white',
            action: () => handlePlatformShare('instagram'),
        },
        {
            id: 'email',
            label: 'Email',
            icon: ({ className }: { className?: string }) => (
                <Mail className={className} />
            ),
            bgClass: 'bg-slate-700 hover:bg-slate-800 text-white',
            action: () => handlePlatformShare('email'),
        },
    ];

    const previewImg =
        post?.featured_image ||
        post?.shelter_animal?.photo_url ||
        '/images/og-image.jpg';

    return createPortal(
        <AnimatePresence>
            {isOpen && post && (
                <div className="modal-scroll-area fixed inset-0 z-[300] overflow-y-auto font-quicksand">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-paw-navy/80 backdrop-blur-md"
                    />

                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 14 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 14 }}
                            transition={{
                                duration: 0.22,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative z-10 my-auto w-full max-w-lg overflow-hidden rounded-[28px] border-0 bg-white p-6 text-left shadow-2xl sm:max-w-xl sm:rounded-[36px] sm:p-8"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-paw-orange/15 text-paw-orange shadow-xs">
                                        <Share2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl leading-none font-black text-paw-navy">
                                            Share Article
                                        </h3>
                                        <p className="mt-1 text-xs font-bold text-gray-400">
                                            Spread awareness with the community
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="shrink-0 cursor-pointer rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-paw-navy active:scale-95"
                                    aria-label="Close share dialog"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Compact Article Preview Pill */}
                            <div className="my-4 flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-paw-bg/80 p-3">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-xs">
                                    <ImageWithFallback
                                        src={previewImg}
                                        alt={post.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    {categoryLabel && (
                                        <div className="mb-1 flex items-center gap-1.5">
                                            <span className="inline-flex items-center rounded-full bg-paw-orange/10 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-paw-orange uppercase">
                                                {categoryLabel}
                                            </span>
                                        </div>
                                    )}
                                    <h4 className="truncate text-sm font-black text-paw-navy sm:text-base pe-2">
                                        {post.title}
                                    </h4>
                                    <p className="mt-0.5 flex items-center gap-2 truncate text-xs font-bold text-gray-400">
                                        {post.author?.name && (
                                            <>
                                                <span className="flex items-center gap-1 truncate">
                                                    <User
                                                        size={12}
                                                        className="shrink-0 text-paw-orange"
                                                    />
                                                    <span className="truncate">
                                                        {post.author.name}
                                                    </span>
                                                </span>
                                                <span className="shrink-0">•</span>
                                            </>
                                        )}
                                        <span className="flex items-center gap-1 shrink-0">
                                            <Calendar
                                                size={12}
                                                className="shrink-0 text-paw-blue"
                                            />
                                            {formattedDate}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Social Share Icons Row */}
                            <div className="my-4">
                                <p className="mb-2.5 text-[11px] font-black tracking-widest text-gray-400 uppercase">
                                    Share Via
                                </p>
                                <div className="grid grid-cols-6 gap-2 text-center sm:gap-3">
                                    {socialPlatforms.map((platform) => {
                                        const IconComponent = platform.icon;

                                        return (
                                            <button
                                                key={platform.id}
                                                type="button"
                                                onClick={platform.action}
                                                className="group flex cursor-pointer flex-col items-center rounded-2xl p-1.5 transition-colors hover:bg-gray-50"
                                            >
                                                <div
                                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:shadow-md sm:h-13 sm:w-13 ${platform.bgClass}`}
                                                >
                                                    <IconComponent className="size-5 sm:size-6" />
                                                </div>
                                                <span className="mt-1.5 truncate text-[11px] font-bold text-gray-600 group-hover:text-paw-navy">
                                                    {
                                                        platform.label.split(
                                                            ' ',
                                                        )[0]
                                                    }
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Direct Link Copy Input Box */}
                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <label className="mb-1.5 block text-[11px] font-black tracking-widest text-gray-400 uppercase">
                                    Article Link
                                </label>
                                <div className="flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-gray-50/90 p-1.5">
                                    <input
                                        type="text"
                                        readOnly
                                        value={shareUrl}
                                        onFocus={(e) => e.target.select()}
                                        className="flex-1 truncate bg-transparent px-3 text-xs font-bold text-paw-navy outline-none select-all sm:text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black tracking-wider uppercase shadow-xs transition-all active:scale-95 ${
                                            copiedLink
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-paw-orange text-white hover:bg-orange-600'
                                        }`}
                                    >
                                        {copiedLink ? (
                                            <>
                                                <Check
                                                    size={14}
                                                    className="stroke-[3]"
                                                />
                                                <span>Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Secondary Quick Action: Copy Caption & Optional Device Share */}
                            <div className="mt-3 flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleCopyCaption}
                                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black tracking-wider uppercase transition-all ${
                                        copiedCaption
                                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                            : 'border-gray-200 text-gray-700 hover:border-paw-orange/40 hover:bg-paw-orange/5 hover:text-paw-navy'
                                    }`}
                                >
                                    {copiedCaption ? (
                                        <>
                                            <CheckCheck
                                                size={15}
                                                className="text-emerald-600"
                                            />
                                            <span>Caption Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileText
                                                size={15}
                                                className="shrink-0 text-paw-orange"
                                            />
                                            <span>Copy Full Caption</span>
                                        </>
                                    )}
                                </button>

                                {hasNativeShare && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePlatformShare('native')
                                        }
                                        className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-gray-200 px-4 py-2.5 text-xs font-black tracking-wider text-gray-700 uppercase transition-all hover:border-paw-orange/40 hover:bg-paw-orange/5 hover:text-paw-navy"
                                        title="Open native device share sheet"
                                    >
                                        <Smartphone
                                            size={15}
                                            className="text-paw-orange"
                                        />
                                        <span>Device</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

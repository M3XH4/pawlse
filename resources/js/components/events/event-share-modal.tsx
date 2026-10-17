import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Share2,
    Copy,
    Check,
    Calendar,
    Smartphone,
    Mail,
    FileText,
    CheckCheck,
    Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import {
    formatEventDate,
    buildEventPostContent,
    shareEvent,
} from '@/lib/event-utils';

export interface EventData {
    id: number;
    title: string;
    date: string;
    time?: string;
    location: string;
    category?: string;
    desc?: string;
    img?: string;
}

export interface EventShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventData | null;
}

export interface EventShareProps {
    event: EventData;
    variant?: 'button' | 'icon' | 'pill' | 'modal-button';
    className?: string;
    containerClassName?: string;
}

// Crisp Brand SVGs
export function FacebookIcon({ className = 'size-4' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

export function TwitterXIcon({ className = 'size-4' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

export function InstagramIcon({
    className = 'size-4',
}: {
    className?: string;
}) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
    );
}

export function WhatsAppIcon({ className = 'size-4' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
    );
}

export function TelegramIcon({ className = 'size-4' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.46c.537-.196 1.006.128.832.94z" />
        </svg>
    );
}

export function EventShareModal({
    isOpen,
    onClose,
    event,
}: EventShareModalProps) {
    const [mounted, setMounted] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCaption, setCopiedCaption] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on Escape key
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

    if (!mounted || typeof document === 'undefined') return null;

    const shareUrl =
        event && typeof window !== 'undefined'
            ? `${window.location.origin}/events?event=${event.id}`
            : '';
    const { fullPost } = event
        ? buildEventPostContent(event, shareUrl)
        : { fullPost: '' };
    const hasNativeShare =
        typeof navigator !== 'undefined' && !!navigator.share;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopiedLink(true);
            toast.success('Event link copied to clipboard!');
            setTimeout(() => setCopiedLink(false), 2500);
        } catch {
            toast.error('Failed to copy link.');
        }
    };

    const handleCopyCaption = async () => {
        try {
            await navigator.clipboard.writeText(fullPost);
            setCopiedCaption(true);
            toast.success('Event caption and hashtags copied!', {
                description:
                    'Ready to paste into Instagram, Facebook, or group chats.',
            });
            setTimeout(() => setCopiedCaption(false), 2500);
        } catch {
            toast.error('Failed to copy caption.');
        }
    };

    const handlePlatformShare = (
        platform:
            | 'facebook'
            | 'twitter'
            | 'whatsapp'
            | 'telegram'
            | 'instagram'
            | 'email'
            | 'calendar'
            | 'native',
    ) => {
        if (!event) return;
        shareEvent({ platform, event, customUrl: shareUrl });
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
            bgClass: 'bg-[#1877F2] hover:bg-[#156cdb] text-white',
            action: () => handlePlatformShare('facebook'),
        },
        {
            id: 'twitter',
            label: 'X (Twitter)',
            icon: TwitterXIcon,
            bgClass: 'bg-black hover:bg-neutral-800 text-white',
            action: () => handlePlatformShare('twitter'),
        },
        {
            id: 'telegram',
            label: 'Telegram',
            icon: TelegramIcon,
            bgClass: 'bg-[#229ED9] hover:bg-[#1f8fc4] text-white',
            action: () => handlePlatformShare('telegram'),
        },
        {
            id: 'instagram',
            label: 'Instagram',
            icon: InstagramIcon,
            bgClass:
                'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-95 text-white',
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

    return createPortal(
        <AnimatePresence>
            {isOpen && event && (
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

                    {/* Centering wrapper that allows full scrolling and prevents top clipping */}
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
                                            Share Event
                                        </h3>
                                        <p className="mt-1 text-xs font-bold text-gray-400">
                                            Invite friends and support community
                                            pets
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

                            {/* Compact Event Preview Pill */}
                            <div className="my-4 flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-paw-bg/80 p-3">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-xs">
                                    <ImageWithFallback
                                        src={event.img}
                                        alt={event.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-paw-orange/10 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-paw-orange uppercase">
                                            <Sparkles size={11} />
                                            {event.category || 'Event'}
                                        </span>
                                    </div>
                                    <h4 className="truncate text-sm font-black text-paw-navy sm:text-base">
                                        {event.title}
                                    </h4>
                                    <p className="mt-0.5 flex items-center gap-2 truncate text-xs font-bold text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar
                                                size={12}
                                                className="shrink-0 text-paw-orange"
                                            />
                                            {formatEventDate(
                                                event.date,
                                                'short',
                                            )}
                                        </span>
                                        {event.time && (
                                            <span>• {event.time}</span>
                                        )}
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
                                    Event Link
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

/**
 * EventShareButton: Drop-in replacement for the share button that triggers
 * the modern share modal instead of an awkward popover dropdown.
 */
export function EventShareButton({
    event,
    variant = 'button',
    className = '',
    containerClassName = '',
}: EventShareProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className={
                containerClassName ||
                (variant === 'modal-button' ? 'w-full' : 'inline-block')
            }
        >
            {variant === 'icon' ? (
                <button
                    type="button"
                    onClick={handleClick}
                    aria-label="Share event"
                    className={`flex cursor-pointer items-center justify-center rounded-2xl border border-gray-100 bg-white p-2.5 text-paw-navy shadow-md transition-all hover:border-paw-orange/30 hover:bg-paw-orange/10 hover:text-paw-orange hover:shadow-lg ${className}`}
                >
                    <Share2 size={16} />
                </button>
            ) : variant === 'pill' ? (
                <button
                    type="button"
                    onClick={handleClick}
                    className={`flex cursor-pointer items-center gap-2 rounded-full bg-paw-navy/5 px-4 py-2 text-xs font-black tracking-wider text-paw-navy uppercase transition-all hover:bg-paw-orange hover:text-white ${className}`}
                >
                    <Share2 size={14} />
                    <span>Share</span>
                </button>
            ) : variant === 'modal-button' ? (
                <button
                    type="button"
                    onClick={handleClick}
                    className={`flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-paw-navy/10 px-3.5 py-2 text-xs font-black tracking-wider text-paw-navy uppercase transition-all hover:border-paw-orange hover:bg-paw-orange/5 ${className}`}
                >
                    <Share2 size={16} className="shrink-0 text-paw-orange" />
                    <span>Share</span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2 text-xs font-black tracking-wider text-paw-navy uppercase shadow-xs transition-all hover:border-paw-orange/30 hover:bg-paw-orange/10 hover:text-paw-orange hover:shadow-sm ${className}`}
                >
                    <Share2 size={14} className="shrink-0 text-paw-orange" />
                    <span>Share</span>
                </button>
            )}

            {/* Dedicated Share Modal rendered via portal */}
            <EventShareModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                event={event}
            />
        </div>
    );
}

// Re-export as EventShareDropdown for backwards compatibility with any existing components
export { EventShareButton as EventShareDropdown };

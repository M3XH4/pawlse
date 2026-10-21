import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Share2,
    Copy,
    Check,
    Calendar,
    MapPin,
    Zap,
    Mail,
    FileText,
    CheckCheck,
    Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import {
    FacebookIcon,
    TwitterXIcon,
    InstagramIcon,
    WhatsAppIcon,
    TelegramIcon,
} from '@/components/events/event-share-modal';
import { MissingPetItem, buildMissingPetShareContent } from './types';

export { FacebookIcon, TwitterXIcon, InstagramIcon, WhatsAppIcon, TelegramIcon };

export interface MissingPetShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    pet: MissingPetItem | null;
}

export function MissingPetShareModal({
    isOpen,
    onClose,
    pet,
}: MissingPetShareModalProps) {
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
        pet && typeof window !== 'undefined'
            ? `${window.location.origin}/missing?pet=${pet.id}`
            : '';
    const { title, fullPost } = pet
        ? buildMissingPetShareContent(pet, shareUrl)
        : { title: '', fullPost: '' };

    const hasNativeShare =
        typeof navigator !== 'undefined' && typeof navigator.share === 'function';

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopiedLink(true);
            toast.success('Pet link copied to clipboard!');
            setTimeout(() => setCopiedLink(false), 2500);
        } catch {
            toast.error('Failed to copy link.');
        }
    };

    const handleCopyCaption = async () => {
        try {
            await navigator.clipboard.writeText(fullPost);
            setCopiedCaption(true);
            toast.success('Missing pet alert caption copied!', {
                description:
                    'Ready to paste into Instagram, Facebook, or group chats.',
            });
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
        if (!pet) return;

        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedFullPost = encodeURIComponent(fullPost);

        switch (platform) {
            case 'whatsapp': {
                const waUrl = `https://api.whatsapp.com/send?text=${encodedFullPost}`;
                window.open(waUrl, '_blank', 'noopener,noreferrer');
                toast.success('Opening WhatsApp...');
                break;
            }

            case 'facebook': {
                try {
                    await navigator.clipboard.writeText(fullPost);
                    toast.success('Alert text copied to clipboard!', {
                        description:
                            'Opening Facebook. Simply paste (Ctrl+V) into your post to include full details!',
                    });
                } catch {
                    toast.success('Opening Facebook share...');
                }
                const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                window.open(
                    fbUrl,
                    '_blank',
                    'width=650,height=550,noopener,noreferrer',
                );
                break;
            }

            case 'twitter': {
                const tweetText = encodeURIComponent(
                    `🚨 MISSING PET ALERT: Please help reunite ${pet.name}! Last seen at ${pet.lastSeen}. Every share helps bring them home. 🐾`,
                );
                const twUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodedUrl}&hashtags=Pawlse,MissingPet,IliganCity,HelpReunite`;
                window.open(
                    twUrl,
                    '_blank',
                    'width=650,height=550,noopener,noreferrer',
                );
                toast.success('Opening X (Twitter) share...');
                break;
            }

            case 'telegram': {
                const tgUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedFullPost}`;
                window.open(
                    tgUrl,
                    '_blank',
                    'width=650,height=550,noopener,noreferrer',
                );
                toast.success('Opening Telegram...');
                break;
            }

            case 'instagram': {
                try {
                    await navigator.clipboard.writeText(fullPost);
                    toast.success('Missing pet alert copied to clipboard!', {
                        description:
                            'Ready to paste into your Instagram caption, story, or DM.',
                    });
                } catch {
                    toast.error('Failed to copy alert details.');
                }
                break;
            }

            case 'email': {
                const emailSubject = encodeURIComponent(title);
                const emailBody = encodeURIComponent(
                    `${fullPost}\n\nPet Link: ${shareUrl}`,
                );
                window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
                toast.success('Opening your email composer...');
                break;
            }

            case 'native': {
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title,
                            text: `Please help find ${pet.name}! Last seen at ${pet.lastSeen}. Every share helps bring them home.`,
                            url: shareUrl,
                        });
                        toast.success('Alert shared successfully!');
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

    const isFound =
        pet?.status.toUpperCase() === 'FOUND' || pet?.rawStatus === 'resolved';

    return createPortal(
        <AnimatePresence>
            {isOpen && pet && (
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
                                            Share Missing Pet Alert
                                        </h3>
                                        <p className="mt-1 text-xs font-bold text-gray-400">
                                            Help reunite {pet.name} with their
                                            family
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

                            {/* Compact Pet Preview Pill */}
                            <div className="my-4 flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-paw-bg/80 p-3">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-xs">
                                    <ImageWithFallback
                                        src={pet.img}
                                        alt={pet.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-1.5 flex-wrap">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase ${
                                                isFound
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-red-500/10 text-red-600'
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    isFound
                                                        ? 'bg-emerald-500'
                                                        : 'bg-red-500 animate-pulse'
                                                }`}
                                            />
                                            {pet.status}
                                        </span>
                                        {pet.reward && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 uppercase tracking-wider">
                                                <Zap
                                                    size={10}
                                                    fill="currentColor"
                                                />
                                                Reward {pet.reward}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="truncate text-sm font-black text-paw-navy sm:text-base pe-2">
                                        {pet.name}
                                    </h4>
                                    <p className="mt-0.5 flex items-center gap-2 truncate text-xs font-bold text-gray-400">
                                        <span className="flex items-center gap-1 truncate">
                                            <MapPin
                                                size={12}
                                                className="shrink-0 text-paw-orange"
                                            />
                                            <span className="truncate">
                                                {pet.lastSeen}
                                            </span>
                                        </span>
                                        <span className="shrink-0">•</span>
                                        <span className="flex items-center gap-1 shrink-0">
                                            <Calendar
                                                size={12}
                                                className="shrink-0 text-paw-blue"
                                            />
                                            {pet.date}
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
                                    Pet Link
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

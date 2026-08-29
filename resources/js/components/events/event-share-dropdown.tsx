import React from 'react';
import {
    Share2,
    Copy,
    Calendar,
    Check,
    Smartphone,
    Globe
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { shareEvent } from '@/lib/event-utils';

export interface EventShareProps {
    event: {
        id: number;
        title: string;
        date: string;
        time?: string;
        location: string;
        category?: string;
        desc?: string;
        img?: string;
    };
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

export function InstagramIcon({ className = 'size-4' }: { className?: string }) {
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

export function EventShareDropdown({ event, variant = 'button', className = '', containerClassName = '' }: EventShareProps) {
    const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

    const handleShare = (
        platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'instagram' | 'copy' | 'calendar' | 'native',
        e: React.MouseEvent
    ) => {
        e.preventDefault();
        e.stopPropagation();
        shareEvent({ platform, event });
    };

    return (
        <div onClick={(e) => e.stopPropagation()} className={containerClassName || (variant === 'modal-button' ? 'w-full' : 'inline-block')}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {variant === 'icon' ? (
                        <button
                            type="button"
                            aria-label="Share event"
                            className={`p-2.5 rounded-2xl bg-white hover:bg-paw-orange/10 text-paw-navy hover:text-paw-orange border border-gray-100 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center ${className}`}
                        >
                            <Share2 size={16} />
                        </button>
                    ) : variant === 'pill' ? (
                        <button
                            type="button"
                            className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider bg-paw-navy/5 hover:bg-paw-orange hover:text-white text-paw-navy transition-all cursor-pointer flex items-center gap-2 ${className}`}
                        >
                            <Share2 size={14} />
                            <span>Share</span>
                        </button>
                    ) : variant === 'modal-button' ? (
                        <button
                            type="button"
                            className={`w-full h-12 py-2.5 px-3.5 rounded-2xl border-2 border-paw-navy/10 hover:border-paw-orange hover:bg-paw-orange/5 text-paw-navy font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${className}`}
                        >
                            <Share2 size={16} className="text-paw-orange shrink-0" />
                            <span>Share</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-paw-navy hover:text-paw-orange hover:bg-paw-orange/10 border border-gray-200/80 bg-white shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5 ${className}`}
                        >
                            <Share2 size={14} className="text-paw-orange shrink-0" />
                            <span>Share</span>
                        </button>
                    )}
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-64 p-2 rounded-2xl bg-white shadow-2xl border-2 border-gray-100 font-quicksand z-[200]"
                >
                    <DropdownMenuLabel className="px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-gray-400">
                        Share Event Post
                    </DropdownMenuLabel>

                    <DropdownMenuItem
                        onClick={(e) => handleShare('facebook', e)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-blue-50 focus:bg-blue-50 text-paw-navy hover:text-blue-600 transition-colors font-bold text-xs"
                    >
                        <div className="w-7 h-7 rounded-lg bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shrink-0">
                            <FacebookIcon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-paw-navy">Facebook</span>
                            <span className="text-[10px] text-gray-400 font-semibold">Copies post & opens share dialog</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={(e) => handleShare('twitter', e)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100 text-paw-navy transition-colors font-bold text-xs"
                    >
                        <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                            <TwitterXIcon className="size-3.5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-paw-navy">X (Twitter)</span>
                            <span className="text-[10px] text-gray-400 font-semibold">Post to your followers</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={(e) => handleShare('instagram', e)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-pink-50 focus:bg-pink-50 text-paw-navy hover:text-pink-600 transition-colors font-bold text-xs"
                    >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <InstagramIcon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-paw-navy">Instagram</span>
                            <span className="text-[10px] text-gray-400 font-semibold">Copy caption & details</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={(e) => handleShare('whatsapp', e)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-green-50 focus:bg-green-50 text-paw-navy hover:text-green-600 transition-colors font-bold text-xs"
                    >
                        <div className="w-7 h-7 rounded-lg bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                            <WhatsAppIcon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-paw-navy">WhatsApp</span>
                            <span className="text-[10px] text-gray-400 font-semibold">Send full post to chats</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={(e) => handleShare('telegram', e)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-sky-50 focus:bg-sky-50 text-paw-navy hover:text-sky-600 transition-colors font-bold text-xs"
                    >
                        <div className="w-7 h-7 rounded-lg bg-[#229ED9]/15 text-[#229ED9] flex items-center justify-center shrink-0">
                            <TelegramIcon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-paw-navy">Telegram</span>
                            <span className="text-[10px] text-gray-400 font-semibold">Broadcast to channels</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1 bg-gray-100" />

                    <DropdownMenuItem
                        onClick={(e) => handleShare('calendar', e)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-amber-50 focus:bg-amber-50 text-paw-navy hover:text-amber-700 transition-colors font-bold text-xs"
                    >
                        <div className="w-7 h-7 rounded-lg bg-paw-orange/15 text-paw-orange flex items-center justify-center shrink-0">
                            <Calendar size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-paw-navy">Google Calendar</span>
                            <span className="text-[10px] text-gray-400 font-semibold">Add event reminder</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={(e) => handleShare('copy', e)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gray-100 focus:bg-gray-100 text-paw-navy transition-colors font-bold text-xs"
                    >
                        <div className="w-7 h-7 rounded-lg bg-gray-100 text-paw-navy flex items-center justify-center shrink-0">
                            <Copy size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-paw-navy">Copy Full Post</span>
                            <span className="text-[10px] text-gray-400 font-semibold">Copy title, date, desc & link</span>
                        </div>
                    </DropdownMenuItem>

                    {hasNativeShare && (
                        <DropdownMenuItem
                            onClick={(e) => handleShare('native', e)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-paw-orange/10 focus:bg-paw-orange/10 text-paw-orange transition-colors font-bold text-xs mt-1"
                        >
                            <div className="w-7 h-7 rounded-lg bg-paw-orange text-white flex items-center justify-center shrink-0">
                                <Smartphone size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-paw-orange">Device Share Sheet</span>
                                <span className="text-[10px] text-paw-orange/70 font-semibold">Native OS sharing & image</span>
                            </div>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

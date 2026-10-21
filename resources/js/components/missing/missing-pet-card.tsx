import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Phone, Heart, Zap, CheckCircle2, Share2 } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useBookmarks } from '@/context/bookmark-context';
import { usePage, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { MissingPetItem } from './types';

export interface MissingPetCardProps {
    pet: MissingPetItem;
    onViewDetails: (pet: MissingPetItem) => void;
    onShare: (pet: MissingPetItem) => void;
    layout?: boolean;
    index?: number;
}

export function MissingPetCard({
    pet,
    onViewDetails,
    onShare,
    layout = true,
    index = 0,
}: MissingPetCardProps) {
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
    const auth = usePage().props.auth as { user?: any } | undefined;
    const isAuthenticated = !!auth?.user;

    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.info('Please log in to bookmark missing pets', {
                description: 'Create an account or log in to save alerts for missing pets and help reunite them with their families.',
                action: {
                    label: 'Log In',
                    onClick: () => router.visit('/login'),
                },
            });
            return;
        }

        if (isBookmarked(pet.id, 'missingPet')) {
            removeBookmark(pet.id, 'missingPet');
        } else {
            addBookmark({
                id: pet.id,
                type: 'missingPet',
                title: pet.name,
                image: pet.img,
                data: pet,
            });
        }
    };

    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare(pet);
    };

    const isFound = pet.status.toUpperCase() === 'FOUND' || pet.rawStatus === 'resolved';

    return (
        <motion.div
            layout={layout}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => onViewDetails(pet)}
            className="bg-white rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group border border-gray-100/80 cursor-pointer flex flex-col h-full"
        >
            <div className="relative h-64 overflow-hidden bg-gray-100 shrink-0">
                <ImageWithFallback
                    src={pet.img}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Status Badge with Live Pulse Dot */}
                <div
                    className={`absolute top-4 left-4 ${
                        isFound ? 'bg-emerald-600' : 'bg-red-600'
                    } text-white px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-md z-10`}
                >
                    <span className={`w-2 h-2 rounded-full ${isFound ? 'bg-white' : 'bg-white animate-pulse'}`} />
                    <span className="text-[10px] font-black tracking-wider uppercase">{pet.status}</span>
                </div>

                {/* Reward Badge */}
                {pet.reward && (
                    <div className="absolute top-4 right-4 bg-amber-400 text-paw-navy px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-white font-black text-[10px] tracking-wide z-10">
                        <Zap size={12} fill="currentColor" />
                        <span>REWARD {pet.reward}</span>
                    </div>
                )}

                {/* Pet Type & Breed Pill */}
                <div className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] bg-black/65 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border border-white/20 shadow-md z-10">
                    <span className="shrink-0">{pet.type}</span>
                    <span className="text-white/40 shrink-0">•</span>
                    <span className="truncate">{pet.breed}</span>
                </div>
            </div>

            <div className="p-7 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-center mb-3 gap-2">
                        <h3 className="min-w-0 flex-1 text-2xl font-black text-paw-navy uppercase tracking-tight truncate pe-2 group-hover:text-paw-orange transition-colors">
                            {pet.name}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                            {/* Share Button on Card */}
                            <button
                                type="button"
                                onClick={handleShareClick}
                                className="bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-paw-orange p-2.5 rounded-xl transition-all shadow-sm"
                                title="Share Missing Pet Alert"
                            >
                                <Share2 size={17} />
                            </button>

                            {/* Bookmark Button */}
                            <button
                                type="button"
                                onClick={handleBookmark}
                                className="bg-gray-50 p-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all group/bookmark"
                                title="Save Pet"
                            >
                                <Heart
                                    size={18}
                                    className={`transition-all ${
                                        isBookmarked(pet.id, 'missingPet')
                                            ? 'fill-red-500 text-red-500'
                                            : 'group-hover/bookmark:scale-110'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Quick Traits Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                            {pet.gender}
                        </span>
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                            {pet.age}
                        </span>
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                            {pet.size}
                        </span>
                    </div>

                    <div className="space-y-2.5 mb-6 text-xs font-bold text-gray-500">
                        <div className="flex items-center gap-2.5">
                            <MapPin size={16} className="text-paw-orange shrink-0" />
                            <span className="line-clamp-1">{pet.lastSeen}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Calendar size={16} className="text-paw-blue shrink-0" />
                            <span>{pet.date}</span>
                        </div>
                    </div>
                </div>

                <div>
                    {!isFound ? (
                        <button
                            type="button"
                            onClick={() => onViewDetails(pet)}
                            className="w-full bg-paw-navy hover:bg-paw-orange text-white py-3.5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg"
                        >
                            <Phone size={15} />
                            <span>VIEW DETAILS & CONTACT</span>
                        </button>
                    ) : (
                        <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 py-3.5 rounded-2xl font-black text-xs tracking-widest uppercase">
                            <CheckCircle2 size={16} />
                            PET REUNITED
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

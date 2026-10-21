import React, { useEffect } from 'react';
import {
    X,
    MapPin,
    Calendar,
    Phone,
    Mail,
    Facebook,
    PawPrint,
    FileText,
    Activity,
    User,
    Zap,
    AlertTriangle,
    Share2,
    Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { MissingPetItem } from './types';

export interface MissingPetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    pet: MissingPetItem | null;
    onShare: (pet: MissingPetItem) => void;
}

export function MissingPetDetailModal({
    isOpen,
    onClose,
    pet,
    onShare,
}: MissingPetDetailModalProps) {
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

    if (!isOpen || !pet) return null;

    const isFound = pet.status.toUpperCase() === 'FOUND' || pet.rawStatus === 'resolved';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.92, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.92, y: 20, opacity: 0 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white rounded-[3.5rem] max-w-4xl w-full shadow-2xl max-h-[92vh] overflow-hidden flex flex-col relative z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-8 md:p-10 border-b border-gray-100 shrink-0">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-6 items-center min-w-0">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-paw-orange/20 shrink-0 relative bg-gray-100">
                                    <ImageWithFallback
                                        src={pet.img}
                                        alt={pet.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="inline-flex items-center gap-2 bg-paw-blue/10 px-3 py-1.5 rounded-full mb-2 border border-paw-blue/20">
                                        <Search size={14} className="text-paw-blue" />
                                        <span className="text-[10px] font-black tracking-widest uppercase text-paw-blue">
                                            {pet.status}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-paw-navy truncate pe-2">
                                        {pet.name}
                                    </h3>
                                    <p className="text-sm font-bold text-gray-500 mt-1 truncate">
                                        {pet.type} • {pet.breed}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onShare(pet)}
                                    className="h-10 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-paw-orange flex items-center gap-2 font-black text-xs uppercase tracking-wider transition-colors shadow-sm"
                                    title="Share Missing Pet Alert"
                                >
                                    <Share2 size={16} />
                                    <span className="hidden sm:inline">Share</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-paw-navy transition-colors"
                                    title="Close (Esc)"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-8 md:p-10 overflow-y-auto contact-modal-scroll flex-1 space-y-8">
                        {/* Reward Banner */}
                        {pet.reward && (
                            <div className="bg-gradient-to-r from-paw-yellow via-orange-400 to-paw-orange rounded-3xl p-6 shadow-xl text-white">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                                            <Zap size={28} className="text-white" fill="currentColor" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white/80 uppercase tracking-widest">
                                                Reward Offered
                                            </p>
                                            <p className="text-3xl md:text-4xl font-black text-white">
                                                {pet.reward}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onShare(pet)}
                                        className="hidden sm:flex items-center gap-2 bg-white text-paw-orange px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-orange-50 shadow-md transition-all"
                                    >
                                        <Share2 size={14} />
                                        <span>Share & Help</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Pet Traits Grid */}
                        <div>
                            <h4 className="text-lg font-black text-paw-navy uppercase tracking-tight mb-4 flex items-center gap-2">
                                <PawPrint size={20} className="text-paw-orange" />
                                Pet Details
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-paw-orange/10 to-paw-orange/5 rounded-2xl p-4 border border-paw-orange/20">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Breed</p>
                                    <p className="text-sm font-black text-paw-navy truncate">{pet.breed}</p>
                                </div>
                                <div className="bg-gradient-to-br from-paw-blue/10 to-paw-blue/5 rounded-2xl p-4 border border-paw-blue/20">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Age</p>
                                    <p className="text-sm font-black text-paw-navy truncate">{pet.age}</p>
                                </div>
                                <div className="bg-gradient-to-br from-paw-green/10 to-paw-green/5 rounded-2xl p-4 border border-paw-green/20">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gender</p>
                                    <p className="text-sm font-black text-paw-navy truncate">{pet.gender}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-4 border border-purple-500/20">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Color</p>
                                    <p className="text-sm font-black text-paw-navy truncate">{pet.color}</p>
                                </div>
                                <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-2xl p-4 border border-pink-500/20">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Size</p>
                                    <p className="text-sm font-black text-paw-navy truncate">{pet.size}</p>
                                </div>
                                <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-2xl p-4 border border-red-500/20">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
                                    <p className="text-sm font-black text-paw-navy truncate">{pet.type}</p>
                                </div>
                            </div>
                        </div>

                        {/* Last Seen Information */}
                        <div>
                            <h4 className="text-lg font-black text-paw-navy uppercase tracking-tight mb-4 flex items-center gap-2">
                                <MapPin size={20} className="text-paw-orange" />
                                Last Seen Information
                            </h4>
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 border-2 border-gray-100 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-paw-orange/10 text-paw-orange flex items-center justify-center shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                                        <p className="text-lg font-black text-paw-navy mb-1">{pet.lastSeen}</p>
                                        {pet.lastSeenDetails && pet.lastSeenDetails !== pet.description && (
                                            <p className="text-sm font-bold text-gray-500 leading-relaxed">{pet.lastSeenDetails}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                                    <div className="w-12 h-12 rounded-2xl bg-paw-blue/10 text-paw-blue flex items-center justify-center shrink-0">
                                        <Calendar size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Date & Time</p>
                                        <p className="text-lg font-black text-paw-navy">{pet.exactDate}</p>
                                        <p className="text-sm font-bold text-gray-500">({pet.date})</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description & Features */}
                        <div>
                            <h4 className="text-lg font-black text-paw-navy uppercase tracking-tight mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-paw-orange" />
                                Description & Features
                            </h4>
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">General Description</p>
                                    <p className="text-sm font-bold text-paw-navy leading-relaxed">{pet.description}</p>
                                </div>
                                {pet.distinguishingFeatures && pet.distinguishingFeatures !== 'N/A' && pet.distinguishingFeatures !== 'None reported' && (
                                    <div className="bg-gradient-to-br from-paw-yellow/10 to-paw-yellow/5 rounded-2xl p-6 border-2 border-paw-yellow/20">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Distinguishing Features</p>
                                        <p className="text-sm font-bold text-paw-navy leading-relaxed">{pet.distinguishingFeatures}</p>
                                    </div>
                                )}
                                {pet.medicalConditions && pet.medicalConditions !== 'None' && (
                                    <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 border-2 border-red-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity size={16} className="text-red-500" />
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Medical Conditions</p>
                                        </div>
                                        <p className="text-sm font-bold text-paw-navy leading-relaxed">{pet.medicalConditions}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Owner Contact Information */}
                        <div>
                            <h4 className="text-lg font-black text-paw-navy uppercase tracking-tight mb-4 flex items-center gap-2">
                                <User size={20} className="text-paw-orange" />
                                Owner Contact Information
                            </h4>
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 border-2 border-gray-100">
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                                    <div className="w-14 h-14 rounded-2xl bg-paw-navy text-white flex items-center justify-center shrink-0">
                                        <User size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Owner / Contact Name</p>
                                        <p className="text-xl font-black text-paw-navy">{pet.owner.name}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {pet.owner.facebook && (
                                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                                <Facebook size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Facebook</p>
                                                <p className="text-sm font-bold text-paw-navy truncate">{pet.owner.facebook}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 rounded-xl bg-paw-green/10 text-paw-green flex items-center justify-center shrink-0">
                                            <Phone size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                                            <p className="text-sm font-bold text-paw-navy">{pet.owner.phone}</p>
                                        </div>
                                    </div>

                                    {pet.owner.email && pet.owner.email !== 'N/A' && (
                                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                                            <div className="w-10 h-10 rounded-xl bg-paw-orange/10 text-paw-orange flex items-center justify-center shrink-0">
                                                <Mail size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Email</p>
                                                <p className="text-sm font-bold text-paw-navy truncate">{pet.owner.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    {pet.owner.address && (
                                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                                            <div className="w-10 h-10 rounded-xl bg-paw-blue/10 text-paw-blue flex items-center justify-center shrink-0">
                                                <MapPin size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Address</p>
                                                <p className="text-sm font-bold text-paw-navy truncate">{pet.owner.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Safety Warning */}
                        <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-2">Safety Reminder</p>
                                    <p className="text-xs font-bold text-amber-700 leading-relaxed">
                                        Please verify the pet's distinguishing traits before arranging transfer. For personal safety, meet in public daylight locations. Report suspicious or fraudulent claims directly to the ISF rescue team.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 md:p-10 border-t border-gray-100 bg-gray-50 shrink-0">
                        <div className="flex flex-col sm:flex-row gap-3">
                            {!isFound ? (
                                <>
                                    <a
                                        href={`tel:${pet.owner.phone}`}
                                        className="flex-1 bg-paw-green text-white py-4 md:py-5 rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <Phone size={18} />
                                        CALL NOW
                                    </a>
                                    {pet.owner.email && pet.owner.email !== 'N/A' && (
                                        <a
                                            href={`mailto:${pet.owner.email}`}
                                            className="flex-1 bg-paw-orange text-white py-4 md:py-5 rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                                        >
                                            <Mail size={18} />
                                            SEND EMAIL
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => onShare(pet)}
                                        className="sm:w-auto px-6 bg-paw-navy text-white py-4 md:py-5 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-paw-orange transition-all shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <Share2 size={18} />
                                        <span>SHARE</span>
                                    </button>
                                </>
                            ) : (
                                <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 py-4 md:py-5 rounded-2xl font-black text-sm tracking-widest uppercase">
                                    <PawPrint size={18} />
                                    PET SAFELY REUNITED WITH FAMILY
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

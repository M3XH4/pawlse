import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    X, 
    Search, 
    Flame, 
    Package, 
    Pill, 
    Sparkles, 
    Gift, 
    Check, 
    ArrowRight, 
    RotateCcw, 
    Info, 
    ShieldCheck, 
    Clock, 
    MapPin, 
    ChevronDown, 
    ChevronUp
} from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

export interface WishlistNeed {
    id: number;
    item: string;
    quantity: string;
    priority: string;
    status: string;
}

export interface WishlistAnimal {
    id: number;
    name: string;
    type: string;
    age: string;
    photo: string;
    needs: WishlistNeed[];
}

interface InKindWishlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    wishlist: WishlistAnimal[];
    selectedNeedId?: string | number | null;
    onSelectNeed: (animal: WishlistAnimal, need: WishlistNeed) => void;
}

type TypeFilter = 'all' | 'dog' | 'cat';

export function InKindWishlistModal({
    isOpen,
    onClose,
    wishlist = [],
    selectedNeedId,
    onSelectNeed
}: InKindWishlistModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [urgentOnly, setUrgentOnly] = useState(false);
    const [showGuidelines, setShowGuidelines] = useState(false);

    // Close on Escape key and lock body scroll
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, onClose]);

    // Reset temporary states when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setTypeFilter('all');
            setUrgentOnly(false);
            setShowGuidelines(false);
        }
    }, [isOpen]);

    // Summary counts
    const counts = useMemo(() => {
        let totalItems = 0;
        let urgentCount = 0;
        let dogCount = 0;
        let catCount = 0;

        wishlist.forEach((animal) => {
            const animalType = (animal.type || '').toLowerCase();
            if (animalType.includes('dog')) dogCount++;
            if (animalType.includes('cat')) catCount++;

            animal.needs.forEach((need) => {
                totalItems++;
                if (need.priority?.toLowerCase() === 'urgent') {
                    urgentCount++;
                }
            });
        });

        return {
            totalAnimals: wishlist.length,
            totalItems,
            urgentCount,
            dogCount,
            catCount
        };
    }, [wishlist]);

    // Category detection helper
    const getCategoryInfo = (itemName: string) => {
        const lower = itemName.toLowerCase();

        if (/med|vit|vacc|syring|ointment|nexgard|antibiotic|deworm|gauze|bandage|iodine|alcohol/i.test(lower)) {
            return {
                label: 'Medical',
                icon: Pill,
                badgeBg: 'bg-teal-50 text-teal-700'
            };
        }
        if (/kibble|food|canned|treat|meat|milk|formula|puppy|kitten|beef|chicken|liver/i.test(lower)) {
            return {
                label: 'Food',
                icon: Package,
                badgeBg: 'bg-amber-50 text-amber-700'
            };
        }
        if (/towel|blanket|bed|cage|crate|pad|mat|cushion|cloth/i.test(lower)) {
            return {
                label: 'Bedding',
                icon: Sparkles,
                badgeBg: 'bg-purple-50 text-purple-700'
            };
        }
        return {
            label: 'Supplies',
            icon: Gift,
            badgeBg: 'bg-sky-50 text-sky-700'
        };
    };

    // Filter logic
    const filteredAnimals = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return wishlist
            .map((animal) => {
                const animalType = (animal.type || '').toLowerCase();
                const matchesType = 
                    typeFilter === 'all' ||
                    (typeFilter === 'dog' && animalType.includes('dog')) ||
                    (typeFilter === 'cat' && animalType.includes('cat'));

                if (!matchesType) return null;

                const matchingNeeds = animal.needs.filter((need) => {
                    const priorityLower = (need.priority || '').toLowerCase();
                    if (urgentOnly && priorityLower !== 'urgent') return false;

                    if (!query) return true;

                    return (
                        need.item.toLowerCase().includes(query) ||
                        animal.name.toLowerCase().includes(query) ||
                        priorityLower.includes(query) ||
                        animalType.includes(query)
                    );
                });

                if (matchingNeeds.length === 0) return null;

                return {
                    ...animal,
                    needs: matchingNeeds
                };
            })
            .filter((a): a is WishlistAnimal => a !== null);
    }, [wishlist, searchQuery, typeFilter, urgentOnly]);

    const hasActiveFilters = searchQuery !== '' || typeFilter !== 'all' || urgentOnly;

    const handleResetFilters = () => {
        setSearchQuery('');
        setTypeFilter('all');
        setUrgentOnly(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-paw-navy/75 backdrop-blur-sm transition-opacity"
                />

                {/* Main Modal Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col z-10 relative shadow-2xl overflow-hidden"
                >
                    {/* Compact Modern Header (Animals are the main focus!) */}
                    <div className="bg-paw-navy text-white px-5 py-3.5 sm:px-6 sm:py-4 shrink-0 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-paw-orange shrink-0">
                                <Gift size={20} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                                        Animal Wishlist & Supplies
                                    </h3>
                                    <span className="bg-paw-orange text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        {counts.totalItems} Items Needed
                                    </span>
                                    {counts.urgentCount > 0 && (
                                        <span className="bg-red-500/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                            <Flame size={10} /> {counts.urgentCount} Urgent
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-300 font-medium truncate mt-0.5 hidden sm:block">
                                    Select an item below to schedule an in-kind drop-off for our shelter animals
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowGuidelines(!showGuidelines)}
                                className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    showGuidelines ? 'bg-paw-orange text-white' : 'bg-white/10 text-gray-200 hover:bg-white/20'
                                }`}
                            >
                                <Info size={13} />
                                <span>Drop-Off Guidelines</span>
                                {showGuidelines ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                title="Close (Esc)"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Guidelines Drawer */}
                    <AnimatePresence>
                        {showGuidelines && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-amber-50 px-5 py-3 border-b border-amber-200/70 text-xs shrink-0 overflow-hidden"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-amber-800 shrink-0" />
                                        <span className="text-amber-900 font-semibold">Hours: 9:00 AM – 5:00 PM Daily</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-amber-800 shrink-0" />
                                        <span className="text-amber-900 font-semibold">Location: Shelter Intake Desk</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-amber-800 shrink-0" />
                                        <span className="text-amber-900 font-semibold">Accepted: Unopened food, unexpired meds</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Compact Filter & Search Toolbar */}
                    <div className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-50/80 border-b border-gray-100 shrink-0 flex flex-wrap items-center justify-between gap-2.5">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search items (kibble, vitamins) or animal..."
                                className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-paw-orange focus:ring-1 focus:ring-paw-orange transition-all placeholder:text-gray-400"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {/* Filter Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setTypeFilter('all')}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                                    typeFilter === 'all'
                                        ? 'bg-paw-navy text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                All Animals
                            </button>
                            <button
                                type="button"
                                onClick={() => setTypeFilter('dog')}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                                    typeFilter === 'dog'
                                        ? 'bg-paw-orange text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Dogs ({counts.dogCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setTypeFilter('cat')}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                                    typeFilter === 'cat'
                                        ? 'bg-paw-blue text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Cats ({counts.catCount})
                            </button>

                            <button
                                type="button"
                                onClick={() => setUrgentOnly(!urgentOnly)}
                                className={`text-[11px] font-black px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                                    urgentOnly
                                        ? 'bg-red-500 text-white'
                                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                                }`}
                            >
                                <Flame size={11} className={urgentOnly ? 'text-white' : 'text-red-500'} />
                                Urgent Only ({counts.urgentCount})
                            </button>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="text-[11px] font-bold text-gray-400 hover:text-paw-orange flex items-center gap-0.5 ml-1 transition-colors cursor-pointer"
                                >
                                    <RotateCcw size={11} /> Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Primary Content: Animals and their needs (Immediately visible!) */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                        {filteredAnimals.length === 0 ? (
                            <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl">
                                <div className="w-12 h-12 rounded-full bg-paw-orange/10 text-paw-orange flex items-center justify-center mx-auto mb-3">
                                    <Search size={22} />
                                </div>
                                <h4 className="text-base font-black text-paw-navy mb-1">No matching needs found</h4>
                                <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto mb-3">
                                    {hasActiveFilters 
                                        ? "No items match your active filters or search keywords."
                                        : "There are currently no open in-kind items listed in our registry."}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="bg-paw-navy text-white text-xs font-bold px-3.5 py-1.5 rounded-xl hover:bg-paw-orange transition-all cursor-pointer"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredAnimals.map((animal) => (
                                <div 
                                    key={animal.id} 
                                    className="bg-gray-50/70 rounded-2xl p-4 sm:p-5 transition-all"
                                >
                                    {/* Animal Info Header (No white borders!) */}
                                    <div className="flex items-center gap-3.5 mb-3.5">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-sm shrink-0 bg-gray-200">
                                            <ImageWithFallback
                                                src={animal.photo}
                                                alt={animal.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-base sm:text-lg font-black text-paw-navy truncate">
                                                    {animal.name}
                                                </h4>
                                                <span className="bg-paw-bg text-paw-navy text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    {animal.type || 'Rescue'} {animal.age ? `• ${animal.age}` : ''}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                Needs {animal.needs.length} item{animal.needs.length === 1 ? '' : 's'} for shelter care
                                            </p>
                                        </div>
                                    </div>

                                    {/* Needs Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                        {animal.needs.map((need) => {
                                            const category = getCategoryInfo(need.item);
                                            const CategoryIcon = category.icon;
                                            const isSelected = String(selectedNeedId) === String(need.id);
                                            const isUrgent = need.priority?.toLowerCase() === 'urgent';
                                            const isHigh = need.priority?.toLowerCase() === 'high';

                                            return (
                                                <div
                                                    key={need.id}
                                                    className={`rounded-xl p-3.5 transition-all flex flex-col justify-between ${
                                                        isSelected
                                                            ? 'bg-emerald-50 ring-2 ring-emerald-500 shadow-sm'
                                                            : 'bg-white shadow-sm hover:shadow hover:bg-orange-50/30'
                                                    }`}
                                                >
                                                    <div>
                                                        {/* Badges */}
                                                        <div className="flex items-center justify-between gap-1.5 mb-2">
                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${category.badgeBg}`}>
                                                                <CategoryIcon size={11} />
                                                                {category.label}
                                                            </span>

                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                isUrgent
                                                                    ? 'bg-red-100 text-red-700 animate-pulse'
                                                                    : isHigh
                                                                        ? 'bg-amber-100 text-amber-700'
                                                                        : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                                                                {need.priority}
                                                            </span>
                                                        </div>

                                                        {/* Item Title & Quantity */}
                                                        <h5 className="font-black text-paw-navy text-sm leading-snug mb-0.5">
                                                            {need.item}
                                                        </h5>
                                                        <p className="text-xs text-gray-500 font-bold mb-3">
                                                            Qty: <span className="text-paw-navy">{need.quantity}</span>
                                                        </p>
                                                    </div>

                                                    {/* Action button */}
                                                    <div>
                                                        {isSelected ? (
                                                            <div className="w-full bg-emerald-600 text-white py-1.5 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1">
                                                                <Check size={13} /> Pledged
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => onSelectNeed(animal, need)}
                                                                className="w-full bg-paw-orange hover:bg-orange-600 text-white py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                                                            >
                                                                <span>Pledge Item</span>
                                                                <ArrowRight size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Slim Footer */}
                    <div className="bg-gray-50 px-5 py-2.5 sm:px-6 flex items-center justify-between text-xs text-gray-500 shrink-0">
                        <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-medium">
                            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                            <span>Logged to Public Audit upon drop-off inspection</span>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-500 hover:text-paw-navy font-bold text-xs cursor-pointer py-1 px-2 rounded-lg hover:bg-gray-200/60 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

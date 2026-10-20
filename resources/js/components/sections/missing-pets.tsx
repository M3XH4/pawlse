import { Link, router, usePage } from '@inertiajs/react';
import { Search, MapPin, Calendar, Phone, MessageCircle, X, CheckCircle2, AlertTriangle, Zap, User, Heart, Plus, Mail, Facebook, PawPrint, FileText, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useBookmarks } from '@/context/bookmark-context';

const SEARCH_SUGGESTIONS = [
    { keyword: 'Bamba', type: 'name', category: 'Pet Name' },
    { keyword: 'Mimi', type: 'name', category: 'Pet Name' },
    { keyword: 'Sparky', type: 'name', category: 'Pet Name' },
    { keyword: 'Tambo', type: 'location', category: 'Location' },
    { keyword: 'Tibanga', type: 'location', category: 'Location' },
    { keyword: 'Suarez', type: 'location', category: 'Location' },
    { keyword: 'Plaza', type: 'location', category: 'Location' },
    { keyword: 'Dog', type: 'type', category: 'Animal Type' },
    { keyword: 'Cat', type: 'type', category: 'Animal Type' },
    { keyword: 'Market', type: 'location', category: 'Location' },
    { keyword: 'Heights', type: 'location', category: 'Location' },
    { keyword: '7-Eleven', type: 'location', category: 'Location' },
    { keyword: 'Poblacion', type: 'location', category: 'Location' }
];

interface MissingPetItem {
    id: number | string;
    name: string;
    type: string;
    breed: string;
    age: string;
    gender: string;
    color: string;
    size: string;
    status: string;
    lastSeen: string;
    lastSeenDetails: string;
    date: string;
    exactDate: string;
    reward: string | null;
    description: string;
    distinguishingFeatures: string;
    medicalConditions: string;
    img: string;
    statusColor: string;
    owner: {
        name: string;
        facebook: string;
        phone: string;
        email: string;
        address: string;
    };
}

export function MissingPets({ pets: propsPets }: { pets?: any[] }) {
    const petsList: MissingPetItem[] = (propsPets ?? []).map((p, idx) => ({
        id: p.id || idx,
        name: p.pet_name || 'Missing Pet',
        type: p.species || 'Dog',
        breed: p.breed || 'Mixed Breed',
        age: p.age || 'Young Adult',
        gender: p.gender || 'Unknown',
        color: p.color || 'Mixed',
        size: p.size || 'Medium',
        status: p.status === 'resolved' ? 'FOUND' : (p.status ? p.status.toUpperCase() : 'STILL SEARCHING'),
        lastSeen: p.last_seen_location || 'Iligan City',
        lastSeenDetails: p.description || 'Reported missing pet.',
        date: p.last_seen_date || 'Recently',
        exactDate: p.last_seen_date || 'Recently',
        reward: p.reward ? `₱${p.reward}` : null,
        description: p.description || 'No description provided.',
        distinguishingFeatures: p.distinguishing_features || 'N/A',
        medicalConditions: p.medical_conditions || 'None',
        img: p.photo_url || 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800',
        statusColor: p.status === 'resolved' ? 'bg-paw-green' : 'bg-red-500',
        owner: {
            name: p.contact_name || 'Pet Owner',
            facebook: 'Iligan Stray Feeders',
            phone: p.contact_number || '0912 345 6789',
            email: p.contact_email || 'help@iliganstrayfeeders.org',
            address: p.last_seen_location || 'Iligan City'
        }
    }));

    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [contactPet, setContactPet] = useState<MissingPetItem | null>(null);
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
    const auth = usePage().props.auth as { user?: any } | undefined;
    const user = auth?.user;
    const isAuthenticated = !!user;

    const handleBookmark = (e: React.MouseEvent, pet: MissingPetItem) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.info('Please log in to bookmark missing pets', {
                description: 'Create an account or log in to save alerts for missing pets and help reunite them with their families.',
                action: {
                    label: 'Log In',
                    onClick: () => router.visit('/login')
                }
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
                data: pet
            });
        }
    };

    const filteredSuggestions = useMemo(() => {
        // eslint-disable-next-line curly
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();

        return SEARCH_SUGGESTIONS.filter(
            s => s.keyword.toLowerCase().includes(query)
        ).slice(0, 6);
    }, [searchQuery]);

    const handleSuggestionClick = (keyword: string) => {
        setSearchQuery(keyword);
        setShowSuggestions(false);
    };

    const filteredPets = petsList.filter(pet => {
        const matchesFilter = filter === 'ALL' || pet.status === filter;
        const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pet.lastSeen.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pet.type.toLowerCase().includes(searchQuery.toLowerCase());
            
        return matchesFilter && matchesSearch;
    });

    return (
        <section className="py-24 bg-paw-bg relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full mb-6 border border-red-500/20">
                            <Search size={18} className="text-red-500" />
                            <span className="text-xs font-black tracking-widest uppercase text-red-500">Iligan Missing Pet Network</span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-paw-navy leading-tight italic">Help Them <span className="text-red-500 not-italic underline decoration-8 decoration-red-500/30 underline-offset-4">Return Home</span></h2>
                        <p className="text-lg text-gray-500 font-bold max-w-xl font-quicksand mt-4">Browse our database of reported missing and found pets. Every second counts in bringing them back to their families.</p>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or location..."
                                className="w-full md:w-[400px] bg-white p-5 rounded-2xl border-2 border-transparent focus:border-paw-blue outline-none transition-all font-bold shadow-xl"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            <Search size={24} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-200" />

                            <AnimatePresence>
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20"
                                    >
                                        <div className="p-4 bg-paw-bg border-b border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suggested Searches</p>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {filteredSuggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSuggestionClick(suggestion.keyword)}
                                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-paw-bg transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl ${suggestion.type === 'name' ? 'bg-paw-orange/10 text-paw-orange' :
                                                                suggestion.type === 'location' ? 'bg-paw-blue/10 text-paw-blue' :
                                                                    'bg-paw-green/10 text-paw-green'
                                                            }`}>
                                                            {suggestion.type === 'name' ? <User size={16} /> :
                                                                suggestion.type === 'location' ? <MapPin size={16} /> :
                                                                    <Search size={16} />}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-black text-paw-navy">{suggestion.keyword}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{suggestion.category}</p>
                                                        </div>
                                                    </div>
                                                    <Search size={16} className="text-gray-300 group-hover:text-paw-orange transition-colors" />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['ALL', 'STILL SEARCHING', 'FOUND', 'LAST SEEN'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md ${filter === f ? 'bg-paw-navy text-white scale-105' : 'bg-white text-paw-navy/60 hover:bg-gray-50'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Link
                        href="/missing"
                        className="bg-gradient-to-b from-white to-orange-50/30 rounded-[3rem] p-8 border-2 border-dashed border-paw-orange/40 flex flex-col items-center justify-center text-center gap-6 group hover:border-paw-orange hover:bg-orange-50/60 hover:scale-[1.02] hover:-translate-y-1 transition-all cursor-pointer shadow-sm hover:shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Emergency
                        </div>
                        <div className="w-20 h-20 bg-paw-orange/15 rounded-3xl text-paw-orange flex items-center justify-center group-hover:scale-110 group-hover:bg-paw-orange group-hover:text-white transition-all shadow-md group-hover:shadow-lg">
                            <Plus size={36} strokeWidth={3} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-paw-navy uppercase leading-none tracking-tight">REPORT MISSING</h3>
                            <p className="text-xs font-bold text-gray-500 leading-relaxed">Lost or spotted a pet?<br /><span className="text-paw-orange font-black">Broadcast an alert now →</span></p>
                        </div>
                    </Link>

                    <AnimatePresence mode="popLayout">
                        {filteredPets.map((pet, i) => (
                            <motion.div
                                key={pet.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setContactPet(pet)}
                                className="bg-white rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group border border-gray-100/80 cursor-pointer flex flex-col"
                            >
                                <div className="relative h-64 overflow-hidden bg-gray-100">
                                    <ImageWithFallback
                                        src={pet.img}
                                        alt={pet.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Status Badge with Live Pulse Dot */}
                                    <div className={`absolute top-4 left-4 ${pet.status === 'FOUND' ? 'bg-emerald-600' : 'bg-red-600'} text-white px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-md z-10`}>
                                        <span className={`w-2 h-2 rounded-full ${pet.status === 'FOUND' ? 'bg-white' : 'bg-white animate-pulse'}`} />
                                        <span className="text-[10px] font-black tracking-wider uppercase">{pet.status}</span>
                                    </div>

                                    {/* Reward Badge (Positioned at top right to avoid colliding with breed/species) */}
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
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-2xl font-black text-paw-navy uppercase italic tracking-tight truncate group-hover:text-paw-orange transition-colors">
                                                {pet.name}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={(e) => handleBookmark(e, pet)}
                                                className="bg-gray-50 p-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all group/bookmark shrink-0 ml-2"
                                                title="Save Pet"
                                            >
                                                <Heart
                                                    size={18}
                                                    className={`transition-all ${isBookmarked(pet.id, 'missingPet') ? 'fill-red-500 text-red-500' : 'group-hover/bookmark:scale-110'}`}
                                                />
                                            </button>
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
                                        {pet.status !== 'FOUND' ? (
                                            <button
                                                type="button"
                                                onClick={() => setContactPet(pet)}
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
                        ))}
                    </AnimatePresence>
                </div>

                {filteredPets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl">
                            <Search size={80} className="text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-paw-navy">No results found!</h3>
                        <p className="text-gray-500 font-bold max-w-md">Try adjusting your filters or search keywords to find the pet you are looking for.</p>
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            <AnimatePresence>
                {contactPet && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                        onClick={() => setContactPet(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3.5rem] max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-8 md:p-10 border-b border-gray-100 shrink-0">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-paw-orange/20 shrink-0">
                                            <ImageWithFallback
                                                src={contactPet.img}
                                                alt={contactPet.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="inline-flex items-center gap-2 bg-paw-blue/10 px-3 py-1.5 rounded-full mb-2 border border-paw-blue/20">
                                                <Search size={14} className="text-paw-blue" />
                                                <span className="text-[10px] font-black tracking-widest uppercase text-paw-blue">{contactPet.status}</span>
                                            </div>
                                            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-paw-navy">{contactPet.name}</h3>
                                            <p className="text-sm font-bold text-gray-500 mt-2">{contactPet.type} • {contactPet.breed}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setContactPet(null)}
                                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-paw-navy transition-colors shrink-0"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-8 md:p-10 overflow-y-auto contact-modal-scroll flex-1">
                                <div className="space-y-8">
                                    {/* Reward Banner */}
                                    {contactPet.reward && (
                                        <div className="bg-gradient-to-r from-paw-yellow via-orange-400 to-paw-orange rounded-2xl p-6 shadow-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                                    <Zap size={24} className="text-white" fill="currentColor" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-white/80 uppercase tracking-widest">Reward Offered</p>
                                                    <p className="text-3xl font-black text-white">{contactPet.reward}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pet Details */}
                                    <div>
                                        <h4 className="text-lg font-black text-paw-navy uppercase tracking-tight mb-4 flex items-center gap-2">
                                            <PawPrint size={20} className="text-paw-orange" />
                                            Pet Details
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="bg-gradient-to-br from-paw-orange/10 to-paw-orange/5 rounded-2xl p-4 border border-paw-orange/20">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Breed</p>
                                                <p className="text-sm font-black text-paw-navy">{contactPet.breed}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-paw-blue/10 to-paw-blue/5 rounded-2xl p-4 border border-paw-blue/20">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Age</p>
                                                <p className="text-sm font-black text-paw-navy">{contactPet.age}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-paw-green/10 to-paw-green/5 rounded-2xl p-4 border border-paw-green/20">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gender</p>
                                                <p className="text-sm font-black text-paw-navy">{contactPet.gender}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-4 border border-purple-500/20">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Color</p>
                                                <p className="text-sm font-black text-paw-navy">{contactPet.color}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-2xl p-4 border border-pink-500/20">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Size</p>
                                                <p className="text-sm font-black text-paw-navy">{contactPet.size}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-2xl p-4 border border-red-500/20">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
                                                <p className="text-sm font-black text-paw-navy">{contactPet.type}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Last Seen Information */}
                                    <div>
                                        <h4 className="text-lg font-black text-paw-navy uppercase tracking-tight mb-4 flex items-center gap-2">
                                            <MapPin size={20} className="text-paw-orange" />
                                            Last Seen Information
                                        </h4>
                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-paw-orange/10 text-paw-orange flex items-center justify-center shrink-0">
                                                    <MapPin size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                                                    <p className="text-lg font-black text-paw-navy mb-1">{contactPet.lastSeen}</p>
                                                    <p className="text-sm font-bold text-gray-500 leading-relaxed">{contactPet.lastSeenDetails}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-paw-blue/10 text-paw-blue flex items-center justify-center shrink-0">
                                                    <Calendar size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Date & Time</p>
                                                    <p className="text-lg font-black text-paw-navy">{contactPet.exactDate}</p>
                                                    <p className="text-sm font-bold text-gray-500">({contactPet.date})</p>
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
                                                <p className="text-sm font-bold text-paw-navy leading-relaxed">{contactPet.description}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-paw-yellow/10 to-paw-yellow/5 rounded-2xl p-6 border-2 border-paw-yellow/20">
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Distinguishing Features</p>
                                                <p className="text-sm font-bold text-paw-navy leading-relaxed">{contactPet.distinguishingFeatures}</p>
                                            </div>
                                            {contactPet.medicalConditions && (
                                                <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 border-2 border-red-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Activity size={16} className="text-red-500" />
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Medical Conditions</p>
                                                    </div>
                                                    <p className="text-sm font-bold text-paw-navy leading-relaxed">{contactPet.medicalConditions}</p>
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
                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100">
                                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                                                <div className="w-14 h-14 rounded-xl bg-paw-navy text-white flex items-center justify-center shrink-0">
                                                    <User size={28} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Owner Name</p>
                                                    <p className="text-xl font-black text-paw-navy">{contactPet.owner.name}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                                        <Facebook size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Facebook</p>
                                                        <p className="text-sm font-bold text-paw-navy truncate">{contactPet.owner.facebook}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                                    <div className="w-10 h-10 rounded-lg bg-paw-green/10 text-paw-green flex items-center justify-center shrink-0">
                                                        <Phone size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                                                        <p className="text-sm font-bold text-paw-navy">{contactPet.owner.phone}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                                    <div className="w-10 h-10 rounded-lg bg-paw-orange/10 text-paw-orange flex items-center justify-center shrink-0">
                                                        <Mail size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Email</p>
                                                        <p className="text-sm font-bold text-paw-navy truncate">{contactPet.owner.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                                    <div className="w-10 h-10 rounded-lg bg-paw-blue/10 text-paw-blue flex items-center justify-center shrink-0">
                                                        <MapPin size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Address</p>
                                                        <p className="text-sm font-bold text-paw-navy">{contactPet.owner.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Safety Warning */}
                                    <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-2">Safety Reminder</p>
                                                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                                                    Please verify the pet's details before claiming. For safety, meet in public locations if arranging a handover. Contact local authorities if you suspect any fraudulent activity.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 md:p-10 border-t border-gray-100 bg-gray-50 shrink-0">
                                <div className="flex gap-3">
                                    <a
                                        href={`tel:${contactPet.owner.phone}`}
                                        className="flex-1 bg-paw-green text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <Phone size={20} />
                                        CALL NOW
                                    </a>
                                    <a
                                        href={`mailto:${contactPet.owner.email}`}
                                        className="flex-1 bg-paw-orange text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <Mail size={20} />
                                        SEND EMAIL
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

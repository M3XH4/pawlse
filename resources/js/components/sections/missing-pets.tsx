import { Link } from '@inertiajs/react';
import { Search, MapPin, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo } from 'react';
import {
    MissingPetCard,
    MissingPetDetailModal,
    MissingPetShareModal,
    MissingPetItem,
} from '@/components/missing';

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
        rawStatus: p.status || 'pending',
        lastSeen: p.last_seen_location || 'Iligan City',
        lastSeenDetails: p.description || 'Reported missing pet.',
        date: p.last_seen_date || 'Recently',
        exactDate: p.exact_date || p.last_seen_date || 'Recently',
        reward: p.reward ? (String(p.reward).startsWith('₱') ? p.reward : `₱${p.reward}`) : null,
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
    const [sharingPet, setSharingPet] = useState<MissingPetItem | null>(null);

    const filteredSuggestions = useMemo(() => {
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
                            <MissingPetCard
                                key={pet.id}
                                pet={pet}
                                index={i}
                                onViewDetails={setContactPet}
                                onShare={setSharingPet}
                            />
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

            {/* Pet Detail Modal */}
            <MissingPetDetailModal
                isOpen={!!contactPet}
                onClose={() => setContactPet(null)}
                pet={contactPet}
                onShare={(pet) => {
                    setSharingPet(pet);
                }}
            />

            {/* Pet Share Modal */}
            <MissingPetShareModal
                isOpen={!!sharingPet}
                onClose={() => setSharingPet(null)}
                pet={sharingPet}
            />
        </section>
    );
}

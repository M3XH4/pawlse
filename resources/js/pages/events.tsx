/* eslint-disable @stylistic/brace-style */
/* eslint-disable curly */
import { router } from '@inertiajs/react';
import { Calendar, MapPin, Clock, Share2, CheckCircle2, Search, Plus, ChevronRight, X, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';


const EVENTS = [
    { id: 1, title: 'Feeding Day: Saray Route', category: 'Feeding', date: 'Feb 25, 2026', time: '8:00 AM', location: 'Saray Proper, Iligan City', img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800', spots: '12 spots left', desc: 'Join us for our weekly feeding route in Saray. We will be feeding over 50 strays in the area. Volunteers should wear comfortable shoes and the ISF official shirt.', keywords: ['feeding', 'saray', 'volunteer', 'strays', 'route'] },
    { id: 2, title: 'Stray Vaccination Drive', category: 'Medical', date: 'March 2, 2026', time: '9:00 AM', location: 'Pala-o Gym', img: 'https://images.unsplash.com/photo-1584132905271-512c958d674a?auto=format&fit=crop&q=80&w=800', spots: '5 spots left', desc: 'A collaboration with Iligan City Veterinary Office. We need volunteers to help with documentation and animal handling.', keywords: ['vaccination', 'medical', 'vet', 'health', 'pala-o', 'clinic'] },
    { id: 3, title: 'ISF Furparent Meetup', category: 'Social', date: 'March 8, 2026', time: '3:00 PM', location: 'Anahaw Amphitheater', img: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800', spots: 'Unlimited', desc: 'A casual meetup for all animal lovers in Iligan. Bring your pets, enjoy some music, and meet fellow rescuers!', keywords: ['meetup', 'social', 'furparent', 'pets', 'community', 'anahaw'] },
    { id: 4, title: 'Adoption Day: Pala-o', category: 'Adoption', date: 'March 15, 2026', time: '10:00 AM', location: 'Pala-o Market Square', img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800', spots: '8 spots left', desc: 'Meet our adoptable pets in person! Interested adopters can undergo screening on the spot.', keywords: ['adoption', 'adopt', 'pets', 'market', 'screening', 'pala-o'] },
];

const FEEDING_SCHEDULE = [
    { id: 'f1', zone: 'Zone 1: Saray Proper', day: 'Every Monday & Thursday', time: '7:00 AM', volunteers: 8, strays: 45, status: 'Active' },
    { id: 'f2', zone: 'Zone 2: Pala-o District', day: 'Every Tuesday & Friday', time: '6:30 AM', volunteers: 6, strays: 38, status: 'Active' },
    { id: 'f3', zone: 'Zone 3: Tibanga Highway', day: 'Every Wednesday & Saturday', time: '8:00 AM', volunteers: 10, strays: 62, status: 'Active' },
    { id: 'f4', zone: 'Zone 4: Tambacan Area', day: 'Every Monday & Thursday', time: '5:00 PM', volunteers: 5, strays: 30, status: 'Active' },
    { id: 'f5', zone: 'Zone 5: Mahayahay', day: 'Every Tuesday & Saturday', time: '7:30 AM', volunteers: 7, strays: 41, status: 'Active' },
    { id: 'f6', zone: 'Zone 6: Tubod Proper', day: 'Every Wednesday & Sunday', time: '6:00 AM', volunteers: 9, strays: 55, status: 'Active' },
    { id: 'f7', zone: 'Zone 7: Tipanoy', day: 'Every Friday & Sunday', time: '7:00 AM', volunteers: 4, strays: 28, status: 'Active' },
    { id: 'f8', zone: 'Zone 8: Palao Bridge', day: 'Every Monday & Friday', time: '5:30 PM', volunteers: 6, strays: 35, status: 'Active' },
];

const SEARCH_SUGGESTIONS = [
    { keyword: 'feeding', description: 'Feeding events and schedules' },
    { keyword: 'feeding schedule', description: 'View monthly feeding routes' },
    { keyword: 'feeding zone', description: 'Feeding zone schedules' },
    { keyword: 'medical', description: 'Medical and vaccination events' },
    { keyword: 'vaccination', description: 'Vaccination drives' },
    { keyword: 'adoption', description: 'Adoption events and meetups' },
    { keyword: 'social', description: 'Social gatherings and meetups' },
    { keyword: 'volunteer', description: 'Volunteer opportunities' },
    { keyword: 'saray', description: 'Events in Saray area' },
    { keyword: 'pala-o', description: 'Events in Pala-o area' },
    { keyword: 'meetup', description: 'Community meetups' },
    { keyword: 'furparent', description: 'Furparent events' },
];

export default function Events() {
    const navigate = router.visit;
    const [filter, setFilter] = useState('All');
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [joined, setJoined] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeTab, setActiveTab] = useState<'events' | 'feeding'>('events');
    const [showShareMenu, setShowShareMenu] = useState(false);

    // Filter suggestions based on search query
    const filteredSuggestions = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();

        return SEARCH_SUGGESTIONS.filter(
            s => s.keyword.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
        ).slice(0, 5);
    }, [searchQuery]);

    // Filter events based on search query
    const filteredEvents = useMemo(() => {
        let events = EVENTS.filter(e => filter === 'All' || e.category === filter);

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            events = events.filter(e =>
                e.title.toLowerCase().includes(query) ||
                e.category.toLowerCase().includes(query) ||
                e.location.toLowerCase().includes(query) ||
                e.keywords.some(k => k.toLowerCase().includes(query))
            );
        }

        return events;
    }, [filter, searchQuery]);

    // Filter feeding schedule based on search query
    const filteredFeedingSchedule = useMemo(() => {
        if (!searchQuery.trim()) return FEEDING_SCHEDULE;

        const query = searchQuery.toLowerCase();

        return FEEDING_SCHEDULE.filter(f =>
            f.zone.toLowerCase().includes(query) ||
            f.day.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const handleSuggestionClick = (keyword: string) => {
        setSearchQuery(keyword);
        setShowSuggestions(false);
    };

    const handleShare = async (event: any) => {
        const shareData = {
            title: event.title,
            text: `Join me at ${event.title} on ${event.date} at ${event.location}!`,
            url: window.location.href
        };

        // Try native Web Share API (works on mobile)
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success('Event shared successfully!');
            } catch (error) {
                // User cancelled or error occurred
                if ((error as Error).name !== 'AbortError') {
                    setShowShareMenu(true);
                }
            }
        } else {
            // Fallback: show custom share menu
            setShowShareMenu(true);
        }
    };

    const shareToSocialMedia = (platform: string, event: any) => {
        const text = `Join me at ${event.title} on ${event.date} at ${event.location}!`;
        const url = encodeURIComponent(window.location.href);
        const encodedText = encodeURIComponent(text);

        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodedText}%20${url}`;
                break;
            case 'messenger':
                shareUrl = `fb-messenger://share/?link=${url}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(`${text} ${window.location.href}`);
                toast.success('Link copied to clipboard!');
                setShowShareMenu(false);

                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
            toast.success('Opening share dialog...');
            setShowShareMenu(false);
        }
    };

    return (
        <div className="min-h-screen bg-paw-bg font-quicksand">
            <Header />

            <main className="py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-16 gap-6">
                        <div className="max-w-2xl">
                            <span className="text-paw-orange font-black uppercase tracking-widest text-xs md:text-sm mb-2 block">Mark Your Calendars</span>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-paw-navy mb-4 leading-tight">Upcoming Events</h1>
                            <p className="text-gray-500 font-bold text-sm sm:text-base md:text-lg leading-relaxed">
                                From feeding operations to medical drives, there are plenty of ways
                                to get involved and help the strays of Iligan.
                            </p>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    className="w-full pl-10 pr-10 py-4 bg-white rounded-2xl outline-none focus:border-paw-orange border-2 border-transparent transition-all shadow-xl shadow-paw-navy/5 font-bold"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setShowSuggestions(false);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-paw-orange transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                )}

                                {/* Search Suggestions Dropdown */}
                                <AnimatePresence>
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50"
                                        >
                                            {filteredSuggestions.map((suggestion, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSuggestionClick(suggestion.keyword)}
                                                    className="w-full px-4 py-3 text-left hover:bg-paw-orange/10 transition-colors border-b border-gray-100 last:border-0"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Search size={16} className="text-paw-orange shrink-0" />
                                                        <div>
                                                            <p className="font-black text-paw-navy text-sm">{suggestion.keyword}</p>
                                                            <p className="text-xs font-bold text-gray-500">{suggestion.description}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Tabs for Events vs Feeding Schedule */}
                    <div className="flex gap-4 mb-8 border-b-2 border-gray-200">
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`px-6 py-4 font-black text-lg transition-all relative ${activeTab === 'events'
                                ? 'text-paw-orange'
                                : 'text-gray-400 hover:text-paw-navy'
                                }`}
                        >
                            EVENT PROPER
                            {activeTab === 'events' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-paw-orange rounded-t-full"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('feeding')}
                            className={`px-6 py-4 font-black text-lg transition-all relative flex items-center gap-2 ${activeTab === 'feeding'
                                ? 'text-paw-orange'
                                : 'text-gray-400 hover:text-paw-navy'
                                }`}
                        >
                            <Utensils size={20} />
                            FEEDING SCHEDULE
                            {activeTab === 'feeding' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-paw-orange rounded-t-full"
                                />
                            )}
                        </button>
                    </div>

                    {/* Category Filters - Only show for Events tab */}
                    {activeTab === 'events' && (
                        <div className="flex gap-3 md:gap-4 mb-8 md:mb-12 overflow-x-auto pb-4 scrollbar-hide">
                            {['All', 'Feeding', 'Medical', 'Social', 'Adoption'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-5 py-2.5 md:px-8 md:py-3 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap ${filter === f ? 'bg-paw-orange text-white shadow-xl shadow-paw-orange/20 scale-105' : 'bg-white text-paw-navy hover:bg-paw-orange/10'}`}
                                >
                                    {f.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Events Section */}
                    {activeTab === 'events' && (
                        <>
                            {filteredEvents.length === 0 ? (
                                <div className="text-center py-20">
                                    <Search size={64} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-2xl font-black text-paw-navy mb-2">No Events Found</h3>
                                    <p className="text-gray-500 font-bold">
                                        Try adjusting your search or filter criteria
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                    {filteredEvents.map((event) => (
                                        <motion.div
                                            key={event.id}
                                            layoutId={`event-${event.id}`}
                                            whileHover={{ y: -10 }}
                                            onClick={() => setSelectedEvent(event)}
                                            className="bg-white rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl shadow-paw-navy/5 border-2 border-transparent hover:border-paw-orange/20 transition-all cursor-pointer group flex flex-col md:flex-row h-full"
                                        >
                                            <div className="md:w-2/5 aspect-[3/2] md:aspect-auto overflow-hidden shrink-0">
                                                <ImageWithFallback src={event.img} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            </div>
                                            <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-between flex-1">
                                                <div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="bg-paw-bg text-paw-navy px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{event.category}</span>
                                                        <span className="text-red-500 font-black text-[10px] uppercase tracking-widest">{event.spots}</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-paw-navy mb-4 leading-tight group-hover:text-paw-orange transition-colors">{event.title}</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                                                            <Calendar size={16} className="text-paw-orange" /> {event.date}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                                                            <MapPin size={16} className="text-paw-orange" /> {event.location}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-100">
                                                    <span className="text-paw-navy font-black text-xs uppercase tracking-widest flex items-center gap-2">More Info <ChevronRight size={14} /></span>
                                                    <div className="flex -space-x-2">
                                                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />)}
                                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-paw-orange flex items-center justify-center text-[10px] font-black text-white">+12</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Feeding Schedule Section */}
                    {activeTab === 'feeding' && (
                        <>
                            <div className="bg-gradient-to-br from-paw-orange to-paw-yellow rounded-[40px] p-8 md:p-12 text-white mb-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        <Utensils size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl md:text-4xl font-black">Monthly Feeding Schedule</h2>
                                        <p className="text-sm md:text-base font-bold text-white/90">Regular feeding routes across Iligan City</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                                        <p className="text-3xl font-black mb-1">{FEEDING_SCHEDULE.length}</p>
                                        <p className="text-xs font-bold text-white/80 uppercase tracking-widest">Active Zones</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                                        <p className="text-3xl font-black mb-1">{FEEDING_SCHEDULE.reduce((sum, f) => sum + f.strays, 0)}</p>
                                        <p className="text-xs font-bold text-white/80 uppercase tracking-widest">Strays Fed</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                                        <p className="text-3xl font-black mb-1">{FEEDING_SCHEDULE.reduce((sum, f) => sum + f.volunteers, 0)}</p>
                                        <p className="text-xs font-bold text-white/80 uppercase tracking-widest">Volunteers</p>
                                    </div>
                                </div>
                            </div>

                            {filteredFeedingSchedule.length === 0 ? (
                                <div className="text-center py-20">
                                    <Search size={64} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-2xl font-black text-paw-navy mb-2">No Feeding Schedule Found</h3>
                                    <p className="text-gray-500 font-bold">
                                        Try adjusting your search criteria
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredFeedingSchedule.map((feeding, idx) => (
                                        <motion.div
                                            key={feeding.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-white rounded-[32px] p-6 shadow-xl shadow-paw-navy/5 border-2 border-transparent hover:border-paw-orange/30 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 bg-paw-orange/10 rounded-2xl flex items-center justify-center">
                                                    <Utensils size={24} className="text-paw-orange" />
                                                </div>
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-widest">
                                                    {feeding.status}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-black text-paw-navy mb-2 leading-tight">{feeding.zone}</h3>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                                                    <Calendar size={16} className="text-paw-orange" />
                                                    {feeding.day}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                                                    <Clock size={16} className="text-paw-orange" />
                                                    {feeding.time}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-paw-orange mb-1">{feeding.strays}</p>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Strays</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-paw-blue mb-1">{feeding.volunteers}</p>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Volunteers</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => navigate('/volunteer', {
                                                    method: 'get',
                                                    data: {
                                                        type: 'feeding',
                                                        zone: feeding.zone,
                                                        day: feeding.day,
                                                        time: feeding.time,
                                                        volunteers: feeding.volunteers,
                                                        strays: feeding.strays,
                                                    },
                                                    preserveState: true,
                                                })}
                                                className="w-full mt-6 bg-paw-orange/10 text-paw-orange py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-paw-orange hover:text-white transition-all"
                                            >
                                                Join This Route
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Event Details Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setSelectedEvent(null);
                                setShowShareMenu(false);
                            }}
                            className="absolute inset-0 bg-paw-navy/80 backdrop-blur-md"
                        />
                        <motion.div
                            layoutId={`event-${selectedEvent.id}`}
                            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[20px] md:rounded-[40px] z-10 relative shadow-2xl"
                        >
                            <button
                                onClick={() => {
                                    setSelectedEvent(null);
                                    setShowShareMenu(false);
                                }}
                                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-20"
                            >
                                <X size={20} className="md:hidden" />
                                <X size={24} className="hidden md:block" />
                            </button>

                            <div className="grid md:grid-cols-2">
                                <div className="h-56 sm:h-64 md:h-full relative">
                                    <ImageWithFallback src={selectedEvent.img} alt={selectedEvent.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/90 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-full text-paw-orange font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl">
                                        {selectedEvent.category}
                                    </div>
                                </div>
                                <div className="p-5 sm:p-6 md:p-8 lg:p-12">
                                    {!joined ? (
                                        <>
                                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-paw-navy mb-4 md:mb-6 leading-tight">{selectedEvent.title}</h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                                                <div className="bg-paw-bg p-4 rounded-2xl">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                                    <p className="font-black text-paw-navy text-sm">{selectedEvent.date}</p>
                                                </div>
                                                <div className="bg-paw-bg p-4 rounded-2xl">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time</p>
                                                    <p className="font-black text-paw-navy text-sm">{selectedEvent.time}</p>
                                                </div>
                                                <div className="bg-paw-bg p-4 rounded-2xl sm:col-span-2">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                                                    <p className="font-black text-paw-navy text-sm">{selectedEvent.location}</p>
                                                </div>
                                            </div>

                                            <div className="mb-10">
                                                <h4 className="font-black text-paw-navy mb-3 uppercase tracking-widest text-xs">About this Event</h4>
                                                <p className="text-gray-500 font-bold leading-relaxed">{selectedEvent.desc}</p>
                                            </div>

                                            <div className="space-y-4">
                                                <button
                                                    onClick={() => {
                                                        navigate('/volunteer', {
                                                            method: 'get',
                                                            data: {
                                                                type: 'event',
                                                                zone: selectedEvent.zone,
                                                                day: selectedEvent.day,
                                                                time: selectedEvent.time,
                                                                volunteers: selectedEvent.volunteers,
                                                                strays: selectedEvent.strays,
                                                            },
                                                            preserveState: true,
                                                        });
                                                    }}
                                                    className="w-full bg-paw-orange text-white py-5 rounded-[24px] font-black text-xl hover:bg-orange-600 transition-all shadow-xl shadow-paw-orange/20 flex items-center justify-center gap-3"
                                                >
                                                    JOIN AS VOLUNTEER <Plus size={24} />
                                                </button>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => handleShare(selectedEvent)}
                                                        className="w-full py-5 rounded-[24px] border-2 border-paw-navy/10 font-black text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                                                    >
                                                        <Share2 size={20} /> SHARE EVENT
                                                    </button>

                                                    {/* Share Menu Dropdown */}
                                                    <AnimatePresence>
                                                        {showShareMenu && (
                                                            <>
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    onClick={() => setShowShareMenu(false)}
                                                                    className="fixed inset-0 z-[110]"
                                                                />
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: 10 }}
                                                                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden z-[120]"
                                                                >
                                                                    <div className="p-4">
                                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Share via</p>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <button
                                                                                onClick={() => shareToSocialMedia('facebook', selectedEvent)}
                                                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors"
                                                                            >
                                                                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">
                                                                                    f
                                                                                </div>
                                                                                <span className="font-black text-sm text-paw-navy">Facebook</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => shareToSocialMedia('twitter', selectedEvent)}
                                                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-sky-50 transition-colors"
                                                                            >
                                                                                <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-black">
                                                                                    𝕏
                                                                                </div>
                                                                                <span className="font-black text-sm text-paw-navy">Twitter</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => shareToSocialMedia('whatsapp', selectedEvent)}
                                                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors"
                                                                            >
                                                                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                                                                                    ⋯
                                                                                </div>
                                                                                <span className="font-black text-sm text-paw-navy">WhatsApp</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => shareToSocialMedia('copy', selectedEvent)}
                                                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                                                            >
                                                                                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-black text-xs">
                                                                                    📋
                                                                                </div>
                                                                                <span className="font-black text-sm text-paw-navy">Copy Link</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            </>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-green-600/10">
                                                <CheckCircle2 size={48} strokeWidth={3} />
                                            </div>
                                            <h2 className="text-4xl font-black text-paw-navy mb-4">You're In!</h2>
                                            <p className="text-gray-500 font-bold text-lg leading-relaxed mb-10">
                                                Thank you for volunteering! We've sent the details and meeting instructions to your email.
                                                See you there!
                                            </p>
                                            <button
                                                onClick={() => { setJoined(false); setSelectedEvent(null); setShowShareMenu(false); }}
                                                className="w-full bg-paw-navy text-white py-5 rounded-[24px] font-black text-xl"
                                            >
                                                BACK TO EVENTS
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}

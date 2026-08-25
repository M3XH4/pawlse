/* eslint-disable @stylistic/brace-style */
/* eslint-disable curly */
import { router, Link, usePage } from '@inertiajs/react';
import { Calendar, MapPin, Clock, Share2, CheckCircle2, Search, Plus, ChevronRight, X, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

interface PaginatedData<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface EventModel {
    id: number;
    title: string;
    category: string;
    date: string;
    time: string;
    location: string;
    img: string;
    spots: number | null;
    desc: string;
    keywords: string[] | null;
    status: string;
}

interface FeedingRouteModel {
    id: number;
    zone: string;
    day: string;
    time: string;
    volunteers: number;
    strays: number;
    status: string;
}

interface EventsProps {
    events: PaginatedData<EventModel>;
    feedingSchedules: PaginatedData<FeedingRouteModel>;
    filters: {
        search: string;
        category: string;
    };
    joinedEventIds: number[];
    joinedScheduleIds: number[];
    auth?: {
        user?: any;
    };
}

const SEARCH_SUGGESTIONS = [
    { keyword: 'feeding', description: 'Feeding events and schedules' },
    { keyword: 'medical', description: 'Medical and vaccination events' },
    { keyword: 'vaccination', description: 'Vaccination drives' },
    { keyword: 'adoption', description: 'Adoption events and meetups' },
    { keyword: 'social', description: 'Social gatherings and meetups' },
    { keyword: 'volunteer', description: 'Volunteer opportunities' },
];

export default function Events({ events, feedingSchedules, filters, joinedEventIds, joinedScheduleIds, auth }: EventsProps) {
    const user = auth?.user;
    const isVolunteer = user?.role === 'volunteer';

    const [filter, setFilter] = useState(filters.category || 'All');
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeTab, setActiveTab] = useState<'events' | 'feeding'>('events');
    const [showShareMenu, setShowShareMenu] = useState(false);

    // Apply search and filter routing
    const updateSearchAndFilter = (newSearch: string, newCategory: string) => {
        router.get('/events', {
            search: newSearch,
            category: newCategory,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCategoryChange = (cat: string) => {
        setFilter(cat);
        updateSearchAndFilter(searchQuery, cat);
    };

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        updateSearchAndFilter(val, filter);
    };

    const handleSuggestionClick = (keyword: string) => {
        setSearchQuery(keyword);
        setShowSuggestions(false);
        updateSearchAndFilter(keyword, filter);
    };

    // Filter suggestions based on search query
    const filteredSuggestions = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return SEARCH_SUGGESTIONS.filter(
            s => s.keyword.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
        ).slice(0, 5);
    }, [searchQuery]);

    const handleJoinEvent = (eventId: number) => {
        if (!user) {
            router.get('/login');
            return;
        }

        if (!isVolunteer) {
            router.get('/volunteer', {
                selectedEvent: events.data.find(e => e.id === eventId),
            });
            return;
        }

        router.post(`/events/${eventId}/join`, {}, {
            onSuccess: () => {
                setSelectedEvent(null);
            }
        });
    };

    const handleJoinFeeding = (scheduleId: number) => {
        if (!user) {
            router.get('/login');
            return;
        }

        if (!isVolunteer) {
            const feeding = feedingSchedules.data.find(f => f.id === scheduleId);
            router.get('/volunteer', {
                selectedEvent: {
                    type: 'feeding',
                    zone: feeding?.zone,
                    day: feeding?.day,
                    time: feeding?.time,
                    volunteers: feeding?.volunteers,
                    strays: feeding?.strays,
                },
            });
            return;
        }

        router.post(`/feeding-schedules/${scheduleId}/join`);
    };

    const handleShare = async (event: any) => {
        const shareData = {
            title: event.title,
            text: `Join me at ${event.title} on ${event.date} at ${event.location}!`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success('Event shared successfully!');
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    setShowShareMenu(true);
                }
            }
        } else {
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

    // Helper Pagination Component
    const Pagination = ({ links }: { links: any[] }) => {
        if (!links || links.length <= 3) return null;
        return (
            <div className="flex justify-center items-center gap-2 mt-12">
                {links.map((link, idx) => {
                    if (link.url === null) {
                        return (
                            <span
                                key={idx}
                                className="px-4 py-2 text-gray-400 bg-gray-100 rounded-xl text-sm font-bold cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }
                    return (
                        <Link
                            key={idx}
                            href={link.url}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                link.active
                                    ? 'bg-paw-orange text-white'
                                    : 'bg-white text-paw-navy hover:bg-paw-orange/10 border border-gray-200 shadow-sm'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        );
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
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    className="w-full pl-10 pr-10 py-4 bg-white rounded-2xl outline-none focus:border-paw-orange border-2 border-transparent transition-all shadow-xl shadow-paw-navy/5 font-bold"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => handleSearchChange('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-paw-orange transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                )}

                                <AnimatePresence>
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50 font-bold text-gray-700"
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

                    <div className="flex gap-4 mb-8 border-b-2 border-gray-200">
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`px-6 py-4 font-black text-lg transition-all relative cursor-pointer ${activeTab === 'events' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy'}`}
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
                            className={`px-6 py-4 font-black text-lg transition-all relative flex items-center gap-2 cursor-pointer ${activeTab === 'feeding' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy'}`}
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

                    {activeTab === 'events' && (
                        <div className="flex gap-3 md:gap-4 mb-8 md:mb-12 overflow-x-auto pb-4 scrollbar-hide">
                            {['All', 'Feeding', 'Medical', 'Social', 'Adoption'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => handleCategoryChange(f)}
                                    className={`px-5 py-2.5 md:px-8 md:py-3 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${filter === f ? 'bg-paw-orange text-white shadow-xl shadow-paw-orange/20 scale-105' : 'bg-white text-paw-navy hover:bg-paw-orange/10'}`}
                                >
                                    {f.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <>
                            {events.data.length === 0 ? (
                                <div className="text-center py-20">
                                    <Search size={64} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-2xl font-black text-paw-navy mb-2">No Events Found</h3>
                                    <p className="text-gray-500 font-bold">Try adjusting your search or filter criteria</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                        {events.data.map((event) => (
                                            <motion.div
                                                key={event.id}
                                                layoutId={`event-${event.id}`}
                                                whileHover={{ y: -5 }}
                                                onClick={() => setSelectedEvent(event)}
                                                className="bg-white rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl shadow-paw-navy/5 border-2 border-transparent hover:border-paw-orange/20 transition-all cursor-pointer group flex flex-col md:flex-row h-full"
                                            >
                                                <div className="md:w-2/5 aspect-[3/2] md:aspect-auto overflow-hidden shrink-0">
                                                    <ImageWithFallback src={event.img} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                </div>
                                                <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-between flex-1">
                                                    <div>
                                                        <div className="flex justify-between items-center mb-4">
                                                            <span className="bg-paw-bg text-paw-navy px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{event.category}</span>
                                                            <span className="text-red-500 font-black text-[10px] uppercase tracking-widest">
                                                                {event.spots === null ? 'Unlimited Spots' : `${event.spots} spots left`}
                                                            </span>
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
                                                        {joinedEventIds.includes(event.id) && (
                                                            <span className="bg-green-100 text-green-700 font-bold text-[10px] uppercase px-3 py-1 rounded-full">Joined</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <Pagination links={events.links} />
                                </>
                            )}
                        </>
                    )}

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
                            </div>

                            {feedingSchedules.data.length === 0 ? (
                                <div className="text-center py-20">
                                    <Search size={64} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-2xl font-black text-paw-navy mb-2">No Feeding Schedule Found</h3>
                                    <p className="text-gray-500 font-bold">Try adjusting your search criteria</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {feedingSchedules.data.map((feeding, idx) => {
                                            const isJoined = joinedScheduleIds.includes(feeding.id);
                                            return (
                                                <motion.div
                                                    key={feeding.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="bg-white rounded-[32px] p-6 shadow-xl shadow-paw-navy/5 border-2 border-transparent hover:border-paw-orange/30 transition-all flex flex-col justify-between"
                                                >
                                                    <div>
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
                                                                <Calendar size={16} className="text-paw-orange" /> {feeding.day}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                                                                <Clock size={16} className="text-paw-orange" /> {feeding.time}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 mb-4">
                                                            <div className="text-center">
                                                                <p className="text-2xl font-black text-paw-orange mb-1">{feeding.strays}</p>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Strays</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-2xl font-black text-paw-blue mb-1">{feeding.volunteers}</p>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Volunteers</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleJoinFeeding(feeding.id)}
                                                        disabled={isJoined}
                                                        className={`w-full mt-4 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all cursor-pointer ${
                                                            isJoined
                                                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                                : 'bg-paw-orange/10 text-paw-orange hover:bg-paw-orange hover:text-white'
                                                        }`}
                                                    >
                                                        {isJoined ? 'Joined Route' : 'Join This Route'}
                                                    </button>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                    <Pagination links={feedingSchedules.links} />
                                </>
                            )}
                        </>
                    )}
                </div>
            </main>

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
                                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-20 cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <div className="grid md:grid-cols-2">
                                <div className="h-56 sm:h-64 md:h-full relative">
                                    <ImageWithFallback src={selectedEvent.img} alt={selectedEvent.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/90 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-full text-paw-orange font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl">
                                        {selectedEvent.category}
                                    </div>
                                </div>
                                <div className="p-5 sm:p-6 md:p-8 lg:p-12">
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
                                        {joinedEventIds.includes(selectedEvent.id) ? (
                                            <div className="w-full bg-green-100 text-green-700 py-5 rounded-[24px] font-black text-xl flex items-center justify-center gap-3">
                                                ALREADY JOINED <CheckCircle2 size={24} />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleJoinEvent(selectedEvent.id)}
                                                className="w-full bg-paw-orange text-white py-5 rounded-[24px] font-black text-xl hover:bg-orange-600 transition-all shadow-xl shadow-paw-orange/20 flex items-center justify-center gap-3 cursor-pointer"
                                            >
                                                {isVolunteer ? 'JOIN EVENT' : 'JOIN AS VOLUNTEER'} <Plus size={24} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleShare(selectedEvent)}
                                            className="w-full py-5 rounded-[24px] border-2 border-paw-navy/10 font-black text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3 cursor-pointer"
                                        >
                                            <Share2 size={20} /> SHARE EVENT
                                        </button>
                                    </div>
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

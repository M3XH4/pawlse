/* eslint-disable @stylistic/brace-style */
/* eslint-disable curly */
import { router, Link, usePage, Head } from '@inertiajs/react';
import {
    Calendar,
    MapPin,
    Clock,
    Share2,
    CheckCircle2,
    Search,
    Plus,
    ChevronRight,
    X,
    Utensils,
    Bookmark,
    Star,
    ShieldPlus,
    Heart,
    Users,
    CalendarPlus,
    ExternalLink,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { EventShareDropdown } from '@/components/events/event-share-dropdown';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useBookmarks } from '@/context/BookmarkContext';
import {
    formatEventDate,
    formatEventTime,
    getEventDateBadge,
    generateGoogleCalendarUrl,
    shareEvent
} from '@/lib/event-utils';

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
    sharedEvent?: EventModel | null;
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

const categoryConfig: Record<string, { bg: string; text: string; badgeBg: string; icon: any }> = {
    Adoption: {
        bg: 'bg-paw-yellow',
        text: 'text-amber-700',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: Star
    },
    Medical: {
        bg: 'bg-paw-blue',
        text: 'text-blue-700',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: ShieldPlus
    },
    Feeding: {
        bg: 'bg-paw-orange',
        text: 'text-orange-700',
        badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Heart
    },
    Social: {
        bg: 'bg-paw-green',
        text: 'text-emerald-700',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: Users
    },
    Community: {
        bg: 'bg-paw-orange',
        text: 'text-orange-700',
        badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Heart
    },
};

export default function Events({ events, feedingSchedules, filters, joinedEventIds, joinedScheduleIds, auth }: EventsProps) {
    const user = auth?.user;
    const isVolunteer = user?.role === 'volunteer';
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

    const [filter, setFilter] = useState(filters.category || 'All');
    const [selectedEvent, setSelectedEvent] = useState<EventModel | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeTab, setActiveTab] = useState<'events' | 'feeding'>('events');

    // Handle initial deeplink if ?event=ID or ?id=ID is passed in URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const eventIdParam = params.get('event') || params.get('id');
            if (eventIdParam && events?.data) {
                const target = events.data.find(e => String(e.id) === eventIdParam);
                if (target) {
                    setSelectedEvent(target);
                }
            }
        }
    }, [events?.data]);

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
                selectedEvent: events.data.find(e => e.id === eventId) as any,
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

    const toggleBookmark = (e: React.MouseEvent, event: EventModel) => {
        e.stopPropagation();
        if (isBookmarked(event.id, 'event')) {
            removeBookmark(event.id, 'event');
        } else {
            addBookmark({
                id: event.id,
                type: 'event',
                title: event.title,
                image: event.img,
                data: event
            });
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
        <div className="min-h-screen bg-paw-bg font-quicksand selection:bg-paw-orange/20 selection:text-paw-orange">
            <Head title={selectedEvent ? `${selectedEvent.title} - Pawlse Events` : 'Upcoming Events & Drives - Pawlse'}>
                {selectedEvent ? (
                    <>
                        <meta name="description" content={selectedEvent.desc || `${selectedEvent.title} on ${selectedEvent.date} at ${selectedEvent.location}`} />
                        <meta property="og:title" content={`${selectedEvent.title} - Pawlse`} />
                        <meta property="og:description" content={`${formatEventDate(selectedEvent.date, 'weekday')} at ${selectedEvent.location} - ${selectedEvent.desc || ''}`} />
                        <meta property="og:image" content={selectedEvent.img} />
                        <meta property="og:url" content={typeof window !== 'undefined' ? `${window.location.origin}/events?event=${selectedEvent.id}` : ''} />
                        <meta name="twitter:card" content="summary_large_image" />
                        <meta name="twitter:title" content={`${selectedEvent.title} - Pawlse`} />
                        <meta name="twitter:description" content={`${formatEventDate(selectedEvent.date, 'weekday')} at ${selectedEvent.location} - ${selectedEvent.desc || ''}`} />
                        <meta name="twitter:image" content={selectedEvent.img} />
                    </>
                ) : (
                    <>
                        <meta name="description" content="Discover upcoming community animal rescue events, feeding operations, and free vaccination drives in Iligan City." />
                    </>
                )}
            </Head>

            <Header />

            <main className="py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-paw-orange/10 px-3.5 py-1.5 rounded-full mb-3 border border-paw-orange/20">
                                <Sparkles size={14} className="text-paw-orange" />
                                <span className="text-paw-orange font-black uppercase tracking-widest text-xs">Community Initiatives</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-paw-navy mb-4 leading-tight tracking-tight">
                                Upcoming <span className="text-paw-orange">Events</span> & Drives
                            </h1>
                            <p className="text-gray-500 font-bold text-sm sm:text-base md:text-lg leading-relaxed">
                                From feeding operations to free medical & vaccination drives, there are plenty of meaningful ways
                                to get involved and protect our furry friends in Iligan.
                            </p>
                        </div>

                        {/* Search Input with Autocomplete */}
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-84">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search events, locations, keywords..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    className="w-full pl-11 pr-10 py-3.5 md:py-4 bg-white rounded-2xl outline-none focus:border-paw-orange border-2 border-transparent transition-all shadow-xl shadow-paw-navy/5 font-bold text-sm text-paw-navy placeholder:text-gray-400"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => handleSearchChange('')}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-paw-orange transition-colors p-1"
                                    >
                                        <X size={16} />
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
                                                    className="w-full px-4 py-3 text-left hover:bg-paw-orange/10 transition-colors border-b border-gray-100 last:border-0 cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Search size={15} className="text-paw-orange shrink-0" />
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

                    {/* Section Switcher Tabs */}
                    <div className="flex gap-4 mb-8 border-b-2 border-gray-200">
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`px-6 py-4 font-black text-base md:text-lg transition-all relative cursor-pointer flex items-center gap-2 ${
                                activeTab === 'events' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy'
                            }`}
                        >
                            <Calendar size={20} />
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
                            className={`px-6 py-4 font-black text-base md:text-lg transition-all relative flex items-center gap-2 cursor-pointer ${
                                activeTab === 'feeding' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy'
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

                    {/* Category Filter Pills */}
                    {activeTab === 'events' && (
                        <div className="flex gap-2.5 md:gap-3 mb-8 md:mb-12 overflow-x-auto pb-4 scrollbar-hide">
                            {['All', 'Feeding', 'Medical', 'Social', 'Adoption'].map((f) => {
                                const isSelected = filter.toLowerCase() === f.toLowerCase();
                                return (
                                    <button
                                        key={f}
                                        onClick={() => handleCategoryChange(f)}
                                        className={`px-5 py-2.5 md:px-7 md:py-3 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer shadow-sm ${
                                            isSelected
                                                ? 'bg-paw-orange text-white shadow-xl shadow-paw-orange/25 scale-105'
                                                : 'bg-white text-paw-navy hover:bg-paw-orange/10 border border-gray-100 hover:border-paw-orange/30'
                                        }`}
                                    >
                                        {f.toUpperCase()}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Events Grid */}
                    {activeTab === 'events' && (
                        <>
                            {events.data.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                                    <Search size={56} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-2xl font-black text-paw-navy mb-2">No Events Found</h3>
                                    <p className="text-gray-500 font-bold max-w-md mx-auto">
                                        No upcoming events match your current filter or search criteria. Try choosing a different category or clearing search terms.
                                    </p>
                                    {(searchQuery || filter !== 'All') && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setFilter('All');
                                                updateSearchAndFilter('', 'All');
                                            }}
                                            className="mt-6 px-6 py-2.5 bg-paw-orange text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-orange-600 transition-colors"
                                        >
                                            Reset Filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
                                        {events.data.map((event) => {
                                            const dateBadge = getEventDateBadge(event.date);
                                            const formattedDate = formatEventDate(event.date, 'weekday');
                                            const formattedTime = formatEventTime(event.time);
                                            const isJoined = joinedEventIds.includes(event.id);
                                            const bookmarked = isBookmarked(event.id, 'event');
                                            const config = categoryConfig[event.category] || categoryConfig.Community;
                                            const CategoryIcon = config.icon || Heart;

                                            return (
                                                <motion.div
                                                    key={event.id}
                                                    layoutId={`event-${event.id}`}
                                                    whileHover={{ y: -6 }}
                                                    transition={{ duration: 0.2 }}
                                                    onClick={() => setSelectedEvent(event)}
                                                    className="bg-white rounded-[28px] md:rounded-[36px] overflow-hidden shadow-xl shadow-paw-navy/5 border-2 border-transparent hover:border-paw-orange/30 transition-all cursor-pointer group flex flex-col md:flex-row h-full relative"
                                                >
                                                    {/* Image & Badges Container */}
                                                    <div className="md:w-2/5 aspect-[16/10] md:aspect-auto overflow-hidden relative shrink-0 min-h-[220px] md:min-h-full bg-paw-bg">
                                                        <ImageWithFallback
                                                            src={event.img}
                                                            alt={event.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />

                                                        {/* Calendar Date Badge */}
                                                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/40 flex flex-col items-center justify-center min-w-[54px] z-10">
                                                            <span className="text-[10px] font-black text-paw-orange tracking-widest leading-tight uppercase">
                                                                {dateBadge.month}
                                                            </span>
                                                            <span className="text-xl font-black text-paw-navy leading-none">
                                                                {dateBadge.day}
                                                            </span>
                                                        </div>

                                                        {/* Bookmark Button */}
                                                        <button
                                                            onClick={(e) => toggleBookmark(e, event)}
                                                            aria-label="Bookmark event"
                                                            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl text-paw-navy shadow-md hover:bg-white transition-all z-10 group/btn cursor-pointer"
                                                        >
                                                            <Bookmark
                                                                size={16}
                                                                className={`transition-colors ${
                                                                    bookmarked
                                                                        ? 'fill-paw-orange text-paw-orange'
                                                                        : 'text-gray-600 group-hover/btn:text-paw-orange'
                                                                }`}
                                                            />
                                                        </button>

                                                        {/* Relative Time Badge */}
                                                        {dateBadge.relativeBadge && (
                                                            <div className="absolute bottom-3 left-3 bg-paw-navy/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md">
                                                                {dateBadge.relativeBadge}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Card Content */}
                                                    <div className="p-6 md:p-7 flex flex-col justify-between flex-1">
                                                        <div>
                                                            {/* Category & Spots Row */}
                                                            <div className="flex justify-between items-center mb-3.5 gap-2">
                                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${config.badgeBg}`}>
                                                                    <CategoryIcon size={12} className="shrink-0" />
                                                                    {event.category}
                                                                </span>

                                                                {event.spots === null ? (
                                                                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                                        Unlimited
                                                                    </span>
                                                                ) : event.spots <= 5 && event.spots > 0 ? (
                                                                    <span className="text-orange-700 bg-orange-100 border border-orange-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                                                                        🔥 {event.spots} spots left
                                                                    </span>
                                                                ) : event.spots === 0 ? (
                                                                    <span className="text-red-700 bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                                        Full
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-red-500 font-black text-[10px] uppercase tracking-wider">
                                                                        {event.spots} spots left
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Title */}
                                                            <h3 className="text-xl md:text-2xl font-black text-paw-navy mb-4 leading-snug group-hover:text-paw-orange transition-colors line-clamp-2">
                                                                {event.title}
                                                            </h3>

                                                            {/* Event Details (Fixed Date, Time, Location UI) */}
                                                            <div className="space-y-2.5">
                                                                <div className="flex items-center gap-2.5 text-gray-600 font-bold text-xs md:text-sm">
                                                                    <div className="w-6 h-6 rounded-lg bg-paw-orange/10 flex items-center justify-center shrink-0">
                                                                        <Calendar size={14} className="text-paw-orange" />
                                                                    </div>
                                                                    <span className="text-paw-navy font-black">{formattedDate}</span>
                                                                </div>

                                                                <div className="flex items-center gap-2.5 text-gray-600 font-bold text-xs md:text-sm">
                                                                    <div className="w-6 h-6 rounded-lg bg-paw-blue/10 flex items-center justify-center shrink-0">
                                                                        <Clock size={14} className="text-paw-blue" />
                                                                    </div>
                                                                    <span>{formattedTime}</span>
                                                                </div>

                                                                <div className="flex items-center gap-2.5 text-gray-600 font-bold text-xs md:text-sm">
                                                                    <div className="w-6 h-6 rounded-lg bg-paw-green/10 flex items-center justify-center shrink-0">
                                                                        <MapPin size={14} className="text-paw-green" />
                                                                    </div>
                                                                    <span className="line-clamp-1">{event.location}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Footer: More Info + Share Dropdown */}
                                                        <div className="mt-6 pt-5 border-t border-gray-100 flex justify-between items-center gap-3">
                                                            <span className="text-paw-navy group-hover:text-paw-orange transition-colors font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                                                                More Info
                                                                <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                                            </span>

                                                            <div className="flex items-center gap-2">
                                                                {isJoined && (
                                                                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1">
                                                                        <CheckCircle2 size={12} /> Joined
                                                                    </span>
                                                                )}

                                                                {/* Share Button & Dropdown */}
                                                                <EventShareDropdown event={event} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                    <Pagination links={events.links} />
                                </>
                            )}
                        </>
                    )}

                    {/* Feeding Schedules Tab */}
                    {activeTab === 'feeding' && (
                        <>
                            <div className="bg-gradient-to-br from-paw-orange to-paw-yellow rounded-[36px] p-8 md:p-12 text-white mb-8 shadow-xl shadow-paw-orange/15">
                                <div className="flex items-center gap-5 mb-3">
                                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                                        <Utensils size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">Monthly Feeding Schedule</h2>
                                        <p className="text-sm md:text-base font-bold text-white/90">Regular feeding routes across key zones in Iligan City</p>
                                    </div>
                                </div>
                            </div>

                            {feedingSchedules.data.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                                    <Search size={56} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-2xl font-black text-paw-navy mb-2">No Feeding Schedule Found</h3>
                                    <p className="text-gray-500 font-bold">Try adjusting your search criteria.</p>
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
                                                        className={`w-full mt-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
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

            {/* Event Details Expanded Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEvent(null)}
                            className="fixed inset-0 bg-paw-navy/80 backdrop-blur-md"
                        />
                        <motion.div
                            layoutId={`event-${selectedEvent.id}`}
                            className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[24px] md:rounded-[40px] z-10 relative shadow-2xl my-auto font-quicksand"
                        >
                            {/* Close Modal Button */}
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 bg-gray-100 hover:bg-gray-200 text-paw-navy rounded-full transition-colors z-20 cursor-pointer shadow-sm"
                            >
                                <X size={20} />
                            </button>

                            <div className="grid md:grid-cols-2">
                                {/* Modal Media Side */}
                                <div className="h-64 md:h-full min-h-[260px] relative bg-paw-bg">
                                    <ImageWithFallback
                                        src={selectedEvent.img}
                                        alt={selectedEvent.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-paw-orange font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                                        <Sparkles size={14} />
                                        {selectedEvent.category}
                                    </div>

                                    {/* Date Stamp */}
                                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-white/60 flex items-center gap-2.5">
                                        <Calendar size={18} className="text-paw-orange" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase leading-none">Event Date</span>
                                            <span className="text-xs font-black text-paw-navy">{formatEventDate(selectedEvent.date, 'weekday')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Content Side */}
                                <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-3 mb-3 pr-12 md:pr-14">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-paw-orange">
                                                Event Information
                                            </span>
                                            {selectedEvent.spots !== null && (
                                                <span className="text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap">
                                                    {selectedEvent.spots} Spots Left
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="text-2xl sm:text-3xl font-black text-paw-navy mb-6 leading-tight">
                                            {selectedEvent.title}
                                        </h2>

                                        {/* Formatted Date/Time/Location Info Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                            <div className="bg-paw-bg p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                                                 <div className="w-8 h-8 rounded-xl bg-paw-orange/10 flex items-center justify-center text-paw-orange shrink-0">
                                                     <Calendar size={16} />
                                                 </div>
                                                 <div>
                                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Date</p>
                                                     <p className="font-black text-paw-navy text-xs sm:text-sm">{formatEventDate(selectedEvent.date, 'full')}</p>
                                                 </div>
                                            </div>

                                            <div className="bg-paw-bg p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                                                 <div className="w-8 h-8 rounded-xl bg-paw-blue/10 flex items-center justify-center text-paw-blue shrink-0">
                                                     <Clock size={16} />
                                                 </div>
                                                 <div>
                                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Time</p>
                                                     <p className="font-black text-paw-navy text-xs sm:text-sm">{formatEventTime(selectedEvent.time)}</p>
                                                 </div>
                                            </div>

                                            <div className="bg-paw-bg p-4 rounded-2xl border border-gray-100 sm:col-span-2 flex items-start gap-3">
                                                 <div className="w-8 h-8 rounded-xl bg-paw-green/10 flex items-center justify-center text-paw-green shrink-0">
                                                     <MapPin size={16} />
                                                 </div>
                                                 <div>
                                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                                                     <p className="font-black text-paw-navy text-xs sm:text-sm">{selectedEvent.location}</p>
                                                 </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="mb-8">
                                            <h4 className="font-black text-paw-navy mb-2 uppercase tracking-widest text-xs">About this Event</h4>
                                            <p className="text-gray-500 font-bold text-sm leading-relaxed">{selectedEvent.desc}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        {joinedEventIds.includes(selectedEvent.id) ? (
                                            <div className="w-full bg-emerald-100 text-emerald-800 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 border border-emerald-200">
                                                <CheckCircle2 size={20} /> ALREADY JOINED THIS EVENT
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleJoinEvent(selectedEvent.id)}
                                                className="w-full bg-paw-orange text-white py-4 rounded-2xl font-black text-base hover:bg-orange-600 transition-all shadow-xl shadow-paw-orange/20 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                                            >
                                                <Plus size={20} />
                                                {isVolunteer ? 'JOIN EVENT' : 'JOIN AS VOLUNTEER'}
                                            </button>
                                        )}

                                        <div className="grid grid-cols-2 gap-3 items-center">
                                            {/* Google Calendar Link */}
                                            <button
                                                onClick={() => shareEvent({ platform: 'calendar', event: selectedEvent })}
                                                className="w-full h-12 py-2.5 px-3 rounded-2xl border-2 border-paw-navy/10 hover:border-paw-orange hover:bg-paw-orange/5 text-paw-navy font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                                            >
                                                <CalendarPlus size={16} className="text-paw-orange shrink-0" />
                                                <span>Add to Calendar</span>
                                            </button>

                                            {/* Share Button with Dropdown */}
                                            <EventShareDropdown
                                                event={selectedEvent}
                                                variant="modal-button"
                                                containerClassName="w-full h-full flex"
                                                className="w-full h-12"
                                            />
                                        </div>
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

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
    Sparkles,
    Trash2,
    Mail,
    User as UserIcon,
    Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { EventShareDropdown } from '@/components/events/event-share-dropdown';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useBookmarks } from '@/context/bookmark-context';
import {
    formatEventDate,
    formatEventTime,
    getEventDateBadge,
    generateGoogleCalendarUrl,
    shareEvent,
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
    joinedEventRoles?: Record<number, string>;
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

const categoryConfig: Record<
    string,
    { bg: string; text: string; badgeBg: string; icon: any }
> = {
    Adoption: {
        bg: 'bg-paw-yellow',
        text: 'text-amber-700',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: Star,
    },
    Medical: {
        bg: 'bg-paw-blue',
        text: 'text-blue-700',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: ShieldPlus,
    },
    Feeding: {
        bg: 'bg-paw-orange',
        text: 'text-orange-700',
        badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Heart,
    },
    Social: {
        bg: 'bg-paw-green',
        text: 'text-emerald-700',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: Users,
    },
    Community: {
        bg: 'bg-paw-orange',
        text: 'text-orange-700',
        badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Heart,
    },
};

export default function Events({
    events,
    feedingSchedules,
    filters,
    joinedEventIds,
    joinedScheduleIds,
    joinedEventRoles = {},
    auth,
}: EventsProps) {
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
                const target = events.data.find(
                    (e) => String(e.id) === eventIdParam,
                );
                if (target) {
                    setSelectedEvent(target);
                }
            }
        }
    }, [events?.data]);

    // Lock body scroll and close on Escape key when an event details modal is open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedEvent(null);
            }
        };

        if (selectedEvent) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [selectedEvent]);

    // Apply search and filter routing
    const updateSearchAndFilter = (newSearch: string, newCategory: string) => {
        router.get(
            '/events',
            {
                search: newSearch,
                category: newCategory,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
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
            (s) =>
                s.keyword.toLowerCase().includes(query) ||
                s.description.toLowerCase().includes(query),
        ).slice(0, 5);
    }, [searchQuery]);

    const [guestModalEvent, setGuestModalEvent] = useState<EventModel | null>(null);
    const [guestForm, setGuestForm] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);

    const handleJoinEvent = (
        eventId: number,
        joinAs: 'participant' | 'volunteer' = 'participant',
    ) => {
        if (!user) {
            if (joinAs === 'volunteer') {
                toast.info('Volunteering requires a volunteer account. Please sign in or register to join as a volunteer.');
                router.get('/volunteer');
                return;
            }
            const ev = events.data.find((e) => e.id === eventId) || selectedEvent;
            setGuestModalEvent(ev || null);
            return;
        }

        if (joinAs === 'volunteer' && !isVolunteer) {
            router.get('/volunteer', {
                selectedEvent: events.data.find((e) => e.id === eventId) as any,
            });
            return;
        }

        router.post(
            `/events/${eventId}/join`,
            { join_as: joinAs },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedEvent(null);
                },
            },
        );
    };

    const handleGuestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestModalEvent) return;
        if (!guestForm.name.trim() || !guestForm.email.trim()) {
            toast.error('Please enter your full name and valid email address.');
            return;
        }

        setIsSubmittingGuest(true);
        router.post(
            `/events/${guestModalEvent.id}/join`,
            {
                join_as: 'participant',
                guest_name: guestForm.name.trim(),
                guest_email: guestForm.email.trim(),
                guest_phone: guestForm.phone.trim() || undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmittingGuest(false);
                    setGuestModalEvent(null);
                    setSelectedEvent(null);
                    setGuestForm({ name: '', email: '', phone: '' });
                    toast.success('Registration confirmed! We sent your e-receipt to your email.');
                },
                onError: (errors) => {
                    setIsSubmittingGuest(false);
                    const firstError = Object.values(errors)[0];
                    toast.error(typeof firstError === 'string' ? firstError : 'Failed to register as guest.');
                },
            },
        );
    };

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: React.ReactNode;
        confirmText?: string;
        cancelText?: string;
        variant?: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {},
    });

    const handleLeaveEvent = (eventId: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Cancel Attendance',
            description: 'Are you sure you want to cancel your attendance for this event? Your spot will be released.',
            confirmText: 'Leave Event',
            variant: 'danger',
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                router.post(
                    `/events/${eventId}/leave`,
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedEvent(null);
                        },
                    },
                );
            },
        });
    };

    const handleJoinFeeding = (scheduleId: number) => {
        if (!user) {
            router.get('/login');
            return;
        }

        if (!isVolunteer) {
            setConfirmModal({
                isOpen: true,
                title: 'Volunteer Certification Required',
                description: 'Feeding routes require volunteer certification. Would you like to apply as a volunteer now?',
                confirmText: 'Apply as Volunteer',
                variant: 'info',
                onConfirm: () => {
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                    const feeding = feedingSchedules.data.find(
                        (f) => f.id === scheduleId,
                    );
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
                },
            });
            return;
        }

        router.post(
            `/feeding-schedules/${scheduleId}/join`,
            {},
            { preserveScroll: true },
        );
    };

    const handleLeaveFeeding = (scheduleId: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Leave Feeding Route',
            description: 'Are you sure you want to leave this scheduled feeding route?',
            confirmText: 'Leave Route',
            variant: 'danger',
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                router.post(
                    `/feeding-schedules/${scheduleId}/leave`,
                    {},
                    { preserveScroll: true },
                );
            },
        });
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
                data: event,
            });
        }
    };

    // Helper Pagination Component
    const Pagination = ({ links }: { links: any[] }) => {
        if (!links || links.length <= 3) return null;
        return (
            <div className="mt-12 flex items-center justify-center gap-2">
                {links.map((link, idx) => {
                    if (link.url === null) {
                        return (
                            <span
                                key={idx}
                                className="cursor-not-allowed rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-400"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }
                    return (
                        <Link
                            key={idx}
                            href={link.url}
                            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                                link.active
                                    ? 'bg-paw-orange text-white'
                                    : 'border border-gray-200 bg-white text-paw-navy shadow-sm hover:bg-paw-orange/10'
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
            <Head
                title={
                    selectedEvent
                        ? `${selectedEvent.title} - Pawlse Events`
                        : 'Upcoming Events & Drives - Pawlse'
                }
            >
                {selectedEvent ? (
                    <>
                        <meta
                            name="description"
                            content={
                                selectedEvent.desc ||
                                `${selectedEvent.title} on ${selectedEvent.date} at ${selectedEvent.location}`
                            }
                        />
                        <meta
                            property="og:title"
                            content={`${selectedEvent.title} - Pawlse`}
                        />
                        <meta
                            property="og:description"
                            content={`${formatEventDate(selectedEvent.date, 'weekday')} at ${selectedEvent.location} - ${selectedEvent.desc || ''}`}
                        />
                        <meta property="og:image" content={selectedEvent.img} />
                        <meta
                            property="og:url"
                            content={
                                typeof window !== 'undefined'
                                    ? `${window.location.origin}/events?event=${selectedEvent.id}`
                                    : ''
                            }
                        />
                        <meta
                            name="twitter:card"
                            content="summary_large_image"
                        />
                        <meta
                            name="twitter:title"
                            content={`${selectedEvent.title} - Pawlse`}
                        />
                        <meta
                            name="twitter:description"
                            content={`${formatEventDate(selectedEvent.date, 'weekday')} at ${selectedEvent.location} - ${selectedEvent.desc || ''}`}
                        />
                        <meta
                            name="twitter:image"
                            content={selectedEvent.img}
                        />
                    </>
                ) : (
                    <>
                        <meta
                            name="description"
                            content="Discover upcoming community animal rescue events, feeding operations, and free vaccination drives in Iligan City."
                        />
                    </>
                )}
            </Head>

            <Header />

            <main className="py-12 pb-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-10 flex flex-col items-start justify-between gap-6 md:mb-16 md:flex-row md:items-end">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-paw-orange/20 bg-paw-orange/10 px-3.5 py-1.5">
                                <Sparkles
                                    size={14}
                                    className="text-paw-orange"
                                />
                                <span className="text-xs font-black tracking-widest text-paw-orange uppercase">
                                    Community Initiatives
                                </span>
                            </div>
                            <h1 className="mb-4 text-3xl leading-tight font-black tracking-tight text-paw-navy sm:text-4xl md:text-5xl">
                                Upcoming{' '}
                                <span className="text-paw-orange">Events</span>{' '}
                                & Drives
                            </h1>
                            <p className="text-sm leading-relaxed font-bold text-gray-500 sm:text-base md:text-lg">
                                From feeding operations to free medical &
                                vaccination drives, there are plenty of
                                meaningful ways to get involved and protect our
                                furry friends in Iligan.
                            </p>
                        </div>

                        {/* Search Input with Autocomplete */}
                        <div className="flex w-full gap-4 md:w-auto">
                            <div className="relative flex-1 md:w-84">
                                <Search
                                    className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    placeholder="Search events, locations, keywords..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() =>
                                        setTimeout(
                                            () => setShowSuggestions(false),
                                            200,
                                        )
                                    }
                                    className="w-full rounded-2xl border-2 border-transparent bg-white py-3.5 pr-10 pl-11 text-sm font-bold text-paw-navy shadow-xl shadow-paw-navy/5 transition-all outline-none placeholder:text-gray-400 focus:border-paw-orange md:py-4"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => handleSearchChange('')}
                                        className="absolute top-1/2 right-3.5 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-paw-orange"
                                    >
                                        <X size={16} />
                                    </button>
                                )}

                                <AnimatePresence>
                                    {showSuggestions &&
                                        filteredSuggestions.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border-2 border-gray-100 bg-white font-bold text-gray-700 shadow-2xl"
                                            >
                                                {filteredSuggestions.map(
                                                    (suggestion, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() =>
                                                                handleSuggestionClick(
                                                                    suggestion.keyword,
                                                                )
                                                            }
                                                            className="w-full cursor-pointer border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-paw-orange/10"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Search
                                                                    size={15}
                                                                    className="shrink-0 text-paw-orange"
                                                                />
                                                                <div>
                                                                    <p className="text-sm font-black text-paw-navy">
                                                                        {
                                                                            suggestion.keyword
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs font-bold text-gray-500">
                                                                        {
                                                                            suggestion.description
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ),
                                                )}
                                            </motion.div>
                                        )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Section Switcher Tabs */}
                    <div className="mb-8 flex gap-4 border-b-2 border-gray-200">
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`relative flex cursor-pointer items-center gap-2 px-6 py-4 text-base font-black transition-all md:text-lg ${
                                activeTab === 'events'
                                    ? 'text-paw-orange'
                                    : 'text-gray-400 hover:text-paw-navy'
                            }`}
                        >
                            <Calendar size={20} />
                            EVENT PROPER
                            {activeTab === 'events' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute right-0 bottom-0 left-0 h-1 rounded-t-full bg-paw-orange"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('feeding')}
                            className={`relative flex cursor-pointer items-center gap-2 px-6 py-4 text-base font-black transition-all md:text-lg ${
                                activeTab === 'feeding'
                                    ? 'text-paw-orange'
                                    : 'text-gray-400 hover:text-paw-navy'
                            }`}
                        >
                            <Utensils size={20} />
                            FEEDING SCHEDULE
                            {activeTab === 'feeding' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute right-0 bottom-0 left-0 h-1 rounded-t-full bg-paw-orange"
                                />
                            )}
                        </button>
                    </div>

                    {/* Category Filter Pills */}
                    {activeTab === 'events' && (
                        <div className="scrollbar-hide mb-8 flex gap-2.5 overflow-x-auto pb-4 md:mb-12 md:gap-3">
                            {[
                                'All',
                                'Feeding',
                                'Medical',
                                'Social',
                                'Adoption',
                            ].map((f) => {
                                const isSelected =
                                    filter.toLowerCase() === f.toLowerCase();
                                return (
                                    <button
                                        key={f}
                                        onClick={() => handleCategoryChange(f)}
                                        className={`cursor-pointer rounded-2xl px-5 py-2.5 text-xs font-black whitespace-nowrap shadow-sm transition-all md:px-7 md:py-3 md:text-sm ${
                                            isSelected
                                                ? 'scale-105 bg-paw-orange text-white shadow-xl shadow-paw-orange/25'
                                                : 'border border-gray-100 bg-white text-paw-navy hover:border-paw-orange/30 hover:bg-paw-orange/10'
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
                                <div className="rounded-3xl border border-gray-100 bg-white p-8 py-20 text-center shadow-sm">
                                    <Search
                                        size={56}
                                        className="mx-auto mb-4 text-gray-300"
                                    />
                                    <h3 className="mb-2 text-2xl font-black text-paw-navy">
                                        No Events Found
                                    </h3>
                                    <p className="mx-auto max-w-md font-bold text-gray-500">
                                        No upcoming events match your current
                                        filter or search criteria. Try choosing
                                        a different category or clearing search
                                        terms.
                                    </p>
                                    {(searchQuery || filter !== 'All') && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setFilter('All');
                                                updateSearchAndFilter(
                                                    '',
                                                    'All',
                                                );
                                            }}
                                            className="mt-6 rounded-xl bg-paw-orange px-6 py-2.5 text-xs font-black tracking-wider text-white uppercase transition-colors hover:bg-orange-600"
                                        >
                                            Reset Filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8">
                                        {events.data.map((event) => {
                                            const dateBadge = getEventDateBadge(
                                                event.date,
                                            );
                                            const formattedDate =
                                                formatEventDate(
                                                    event.date,
                                                    'weekday',
                                                );
                                            const formattedTime =
                                                formatEventTime(event.time);
                                            const isJoined =
                                                joinedEventIds.includes(
                                                    event.id,
                                                );
                                            const bookmarked = isBookmarked(
                                                event.id,
                                                'event',
                                            );
                                            const config =
                                                categoryConfig[
                                                    event.category
                                                ] || categoryConfig.Community;
                                            const CategoryIcon =
                                                config.icon || Heart;

                                            return (
                                                <motion.div
                                                    key={event.id}
                                                    layoutId={`event-${event.id}`}
                                                    whileHover={{ y: -6 }}
                                                    transition={{
                                                        duration: 0.2,
                                                    }}
                                                    onClick={() =>
                                                        setSelectedEvent(event)
                                                    }
                                                    className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[28px] border-2 border-transparent bg-white shadow-xl shadow-paw-navy/5 transition-all hover:border-paw-orange/30 md:flex-row md:rounded-[36px]"
                                                >
                                                    {/* Image & Badges Container */}
                                                    <div className="relative aspect-[16/10] min-h-[220px] shrink-0 overflow-hidden bg-paw-bg md:aspect-auto md:min-h-full md:w-2/5">
                                                        <ImageWithFallback
                                                            src={event.img}
                                                            alt={event.title}
                                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />

                                                        {/* Calendar Date Badge */}
                                                        <div className="absolute top-4 left-4 z-10 flex min-w-[54px] flex-col items-center justify-center rounded-2xl border border-white/40 bg-white/95 p-2 shadow-lg backdrop-blur-md">
                                                            <span className="text-[10px] leading-tight font-black tracking-widest text-paw-orange uppercase">
                                                                {
                                                                    dateBadge.month
                                                                }
                                                            </span>
                                                            <span className="text-xl leading-none font-black text-paw-navy">
                                                                {dateBadge.day}
                                                            </span>
                                                        </div>

                                                        {/* Bookmark Button */}
                                                        <button
                                                            onClick={(e) =>
                                                                toggleBookmark(
                                                                    e,
                                                                    event,
                                                                )
                                                            }
                                                            aria-label="Bookmark event"
                                                            className="group/btn absolute top-4 right-4 z-10 cursor-pointer rounded-xl bg-white/90 p-2 text-paw-navy shadow-md backdrop-blur-sm transition-all hover:bg-white"
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
                                                            <div className="absolute bottom-3 left-3 rounded-xl bg-paw-navy/85 px-2.5 py-1 text-[10px] font-black tracking-wider text-white uppercase shadow-md backdrop-blur-sm">
                                                                {
                                                                    dateBadge.relativeBadge
                                                                }
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Card Content */}
                                                    <div className="flex flex-1 flex-col justify-between p-6 md:p-7">
                                                        <div>
                                                            {/* Category & Spots Row */}
                                                            <div className="mb-3.5 flex items-center justify-between gap-2">
                                                                <span
                                                                    className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1 text-[10px] font-black tracking-wider uppercase ${config.badgeBg}`}
                                                                >
                                                                    <CategoryIcon
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="shrink-0"
                                                                    />
                                                                    {
                                                                        event.category
                                                                    }
                                                                </span>

                                                                {event.spots ===
                                                                null ? (
                                                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-emerald-700 uppercase">
                                                                        Unlimited
                                                                    </span>
                                                                ) : event.spots <=
                                                                      5 &&
                                                                  event.spots >
                                                                      0 ? (
                                                                    <span className="animate-pulse rounded-full border border-orange-200 bg-orange-100 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-orange-700 uppercase">
                                                                        🔥{' '}
                                                                        {
                                                                            event.spots
                                                                        }{' '}
                                                                        spots
                                                                        left
                                                                    </span>
                                                                ) : event.spots ===
                                                                  0 ? (
                                                                    <span className="rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-red-700 uppercase">
                                                                        Full
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-black tracking-wider text-red-500 uppercase">
                                                                        {
                                                                            event.spots
                                                                        }{' '}
                                                                        spots
                                                                        left
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Title */}
                                                            <h3 className="mb-4 line-clamp-2 text-xl leading-snug font-black text-paw-navy transition-colors group-hover:text-paw-orange md:text-2xl">
                                                                {event.title}
                                                            </h3>

                                                            {/* Event Details (Fixed Date, Time, Location UI) */}
                                                            <div className="space-y-2.5">
                                                                <div className="flex items-center gap-2.5 text-xs font-bold text-gray-600 md:text-sm">
                                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-paw-orange/10">
                                                                        <Calendar
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="text-paw-orange"
                                                                        />
                                                                    </div>
                                                                    <span className="font-black text-paw-navy">
                                                                        {
                                                                            formattedDate
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2.5 text-xs font-bold text-gray-600 md:text-sm">
                                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-paw-blue/10">
                                                                        <Clock
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="text-paw-blue"
                                                                        />
                                                                    </div>
                                                                    <span>
                                                                        {
                                                                            formattedTime
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2.5 text-xs font-bold text-gray-600 md:text-sm">
                                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-paw-green/10">
                                                                        <MapPin
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="text-paw-green"
                                                                        />
                                                                    </div>
                                                                    <span className="line-clamp-1">
                                                                        {
                                                                            event.location
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Footer: More Info + Share Dropdown */}
                                                        <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
                                                            <span className="flex items-center gap-1.5 text-xs font-black tracking-widest text-paw-navy uppercase transition-colors group-hover:text-paw-orange">
                                                                More Info
                                                                <ChevronRight
                                                                    size={15}
                                                                    className="transition-transform group-hover:translate-x-1"
                                                                />
                                                            </span>

                                                            <div className="flex items-center gap-2">
                                                                {isJoined && (
                                                                    <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-800 uppercase">
                                                                        <CheckCircle2
                                                                            size={
                                                                                12
                                                                            }
                                                                        />{' '}
                                                                        {joinedEventRoles[
                                                                            event.id
                                                                        ] ===
                                                                        'Participant'
                                                                            ? 'Participant'
                                                                            : 'Volunteer'}
                                                                    </span>
                                                                )}

                                                                {/* Share Button & Dropdown */}
                                                                <EventShareDropdown
                                                                    event={
                                                                        event
                                                                    }
                                                                />
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
                            <div className="mb-8 rounded-[36px] bg-gradient-to-br from-paw-orange to-paw-yellow p-8 text-white shadow-xl shadow-paw-orange/15 md:p-12">
                                <div className="mb-3 flex items-center gap-5">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md md:h-16 md:w-16">
                                        <Utensils size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black sm:text-3xl md:text-4xl">
                                            Monthly Feeding Schedule
                                        </h2>
                                        <p className="text-sm font-bold text-white/90 md:text-base">
                                            Regular feeding routes across key
                                            zones in Iligan City
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {feedingSchedules.data.length === 0 ? (
                                <div className="rounded-3xl border border-gray-100 bg-white p-8 py-20 text-center shadow-sm">
                                    <Search
                                        size={56}
                                        className="mx-auto mb-4 text-gray-300"
                                    />
                                    <h3 className="mb-2 text-2xl font-black text-paw-navy">
                                        No Feeding Schedule Found
                                    </h3>
                                    <p className="font-bold text-gray-500">
                                        Try adjusting your search criteria.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {feedingSchedules.data.map(
                                            (feeding, idx) => {
                                                const isJoined =
                                                    joinedScheduleIds.includes(
                                                        feeding.id,
                                                    );
                                                return (
                                                    <motion.div
                                                        key={feeding.id}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            delay: idx * 0.05,
                                                        }}
                                                        className="flex flex-col justify-between rounded-[32px] border-2 border-transparent bg-white p-6 shadow-xl shadow-paw-navy/5 transition-all hover:border-paw-orange/30"
                                                    >
                                                        <div>
                                                            <div className="mb-4 flex items-start justify-between">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paw-orange/10">
                                                                    <Utensils
                                                                        size={
                                                                            24
                                                                        }
                                                                        className="text-paw-orange"
                                                                    />
                                                                </div>
                                                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black tracking-widest text-green-700 uppercase">
                                                                    {
                                                                        feeding.status
                                                                    }
                                                                </span>
                                                            </div>

                                                            <h3 className="mb-2 text-xl leading-tight font-black text-paw-navy">
                                                                {feeding.zone}
                                                            </h3>

                                                            <div className="mb-6 space-y-3">
                                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                                    <Calendar
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="text-paw-orange"
                                                                    />{' '}
                                                                    {
                                                                        feeding.day
                                                                    }
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                                    <Clock
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="text-paw-orange"
                                                                    />{' '}
                                                                    {
                                                                        feeding.time
                                                                    }
                                                                </div>
                                                            </div>

                                                            <div className="mb-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                                                                <div className="text-center">
                                                                    <p className="mb-1 text-2xl font-black text-paw-orange">
                                                                        {
                                                                            feeding.strays
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                                                                        Strays
                                                                    </p>
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="mb-1 text-2xl font-black text-paw-blue">
                                                                        {
                                                                            feeding.volunteers
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                                                                        Volunteers
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                if (isJoined) {
                                                                    handleLeaveFeeding(
                                                                        feeding.id,
                                                                    );
                                                                } else {
                                                                    handleJoinFeeding(
                                                                        feeding.id,
                                                                    );
                                                                }
                                                            }}
                                                            className={`mt-4 w-full cursor-pointer rounded-2xl py-3.5 text-xs font-black tracking-widest uppercase transition-all ${
                                                                isJoined
                                                                    ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                                                                    : isVolunteer
                                                                      ? 'bg-paw-orange/10 text-paw-orange hover:bg-paw-orange hover:text-white'
                                                                      : 'bg-gray-100 text-gray-500 hover:bg-paw-orange/10 hover:text-paw-orange'
                                                            }`}
                                                        >
                                                            {isJoined
                                                                ? 'Joined Route • Leave'
                                                                : isVolunteer
                                                                  ? 'Join This Route'
                                                                  : 'Join Route (Volunteers Only)'}
                                                        </button>
                                                    </motion.div>
                                                );
                                            },
                                        )}
                                    </div>
                                    <Pagination
                                        links={feedingSchedules.links}
                                    />
                                </>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Event Details Expanded Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="modal-scroll-area fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 sm:p-5 md:p-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setSelectedEvent(null)}
                            className="fixed inset-0 bg-paw-navy/80 backdrop-blur-md"
                        />

                        {/* Modal Dialog Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            transition={{
                                duration: 0.22,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative z-10 my-auto flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border-0 bg-white font-quicksand shadow-2xl md:max-h-[86vh] md:flex-row md:rounded-[36px]"
                        >
                            {/* Modal Media Side */}
                            <div className="relative h-56 shrink-0 overflow-hidden bg-paw-bg sm:h-64 md:h-auto md:w-5/12">
                                <ImageWithFallback
                                    src={selectedEvent.img}
                                    alt={selectedEvent.title}
                                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                />

                                {/* Subtle Gradient Overlays */}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

                                {/* Category Badge */}
                                <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-white/60 bg-white/95 px-3.5 py-1.5 text-xs font-black tracking-wider text-paw-orange uppercase shadow-lg backdrop-blur-md">
                                    <Sparkles size={13} />
                                    <span>{selectedEvent.category}</span>
                                </div>

                                {/* Date Stamp Badge */}
                                <div className="absolute right-4 bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paw-orange/15 text-paw-orange">
                                        <Calendar size={18} />
                                    </div>
                                    <div className="flex min-w-0 flex-col">
                                        <span className="mb-0.5 text-[10px] leading-none font-black tracking-widest text-gray-400 uppercase">
                                            Event Date
                                        </span>
                                        <span className="truncate text-xs font-black text-paw-navy">
                                            {formatEventDate(
                                                selectedEvent.date,
                                                'weekday',
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content Side */}
                            <div className="modal-scroll-area flex min-h-0 flex-1 flex-col justify-between overflow-y-auto bg-white p-5 sm:p-7 md:w-7/12 md:p-8">
                                <div>
                                    {/* Header Row: Information Tag + Spots Badge + Close Button */}
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="flex items-center gap-1.5 rounded-full bg-paw-orange/10 px-2.5 py-1 text-[11px] font-black tracking-widest text-paw-orange uppercase">
                                                <Sparkles size={12} />
                                                Event Information
                                            </span>
                                            {selectedEvent.spots !== null && (
                                                <span className="rounded-full border border-red-200/80 bg-red-50 px-2.5 py-0.5 text-[11px] font-black tracking-wider whitespace-nowrap text-red-600 uppercase">
                                                    {selectedEvent.spots} Spots
                                                    Left
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedEvent(null)
                                            }
                                            className="shrink-0 cursor-pointer rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-paw-navy active:scale-90"
                                            aria-label="Close modal"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Event Title */}
                                    <h2 className="mb-4 text-2xl leading-tight font-black tracking-tight text-paw-navy sm:text-3xl">
                                        {selectedEvent.title}
                                    </h2>

                                    {/* Date/Time/Location Info Cards */}
                                    <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                        <div className="flex items-start gap-3 rounded-2xl border border-gray-100/90 bg-paw-bg/70 p-3.5 transition-colors hover:bg-paw-bg">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-paw-orange/15 text-paw-orange">
                                                <Calendar size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="mb-0.5 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                    Date
                                                </p>
                                                <p className="truncate text-xs font-black text-paw-navy sm:text-sm">
                                                    {formatEventDate(
                                                        selectedEvent.date,
                                                        'full',
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 rounded-2xl border border-gray-100/90 bg-paw-bg/70 p-3.5 transition-colors hover:bg-paw-bg">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-paw-blue/15 text-paw-blue">
                                                <Clock size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="mb-0.5 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                    Time
                                                </p>
                                                <p className="truncate text-xs font-black text-paw-navy sm:text-sm">
                                                    {formatEventTime(
                                                        selectedEvent.time,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 rounded-2xl border border-gray-100/90 bg-paw-bg/70 p-3.5 transition-colors hover:bg-paw-bg sm:col-span-2">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-paw-green/15 text-paw-green">
                                                <MapPin size={16} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="mb-0.5 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                    Location
                                                </p>
                                                <p className="text-xs font-black text-paw-navy sm:text-sm">
                                                    {selectedEvent.location}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-6">
                                        <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-black tracking-widest text-paw-navy uppercase">
                                            About this Event
                                        </h4>
                                        <p className="text-xs leading-relaxed font-semibold text-gray-600 sm:text-sm">
                                            {selectedEvent.desc}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons Footer */}
                                <div className="mt-auto space-y-2.5 pt-2">
                                    {joinedEventIds.includes(
                                        selectedEvent.id,
                                    ) ? (
                                        <div className="space-y-2">
                                            <div className="flex w-full items-center justify-center gap-2 rounded-2xl border-0 bg-emerald-50 py-3 text-xs md:text-sm font-black text-emerald-800">
                                                <CheckCircle2
                                                    size={18}
                                                    className="text-emerald-600"
                                                />
                                                <span>
                                                    YOU ARE REGISTERED AS{' '}
                                                    {(
                                                        joinedEventRoles[
                                                            selectedEvent.id
                                                        ] || 'Participant'
                                                    ).toUpperCase()}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleLeaveEvent(
                                                        selectedEvent.id,
                                                    )
                                                }
                                                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                                            >
                                                <Trash2 size={14} />
                                                <span>Cancel Attendance / Leave Event</span>
                                            </button>
                                        </div>
                                    ) : selectedEvent.spots === 0 ? (
                                        <div className="flex w-full items-center justify-center rounded-2xl bg-gray-100 py-3.5 text-xs font-black text-gray-500 uppercase">
                                            This Event is Fully Booked
                                        </div>
                                    ) : isVolunteer ? (
                                        <div className="space-y-2">
                                            <p className="text-center text-[11px] font-bold text-gray-500">
                                                Choose how you want to join this event:
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleJoinEvent(
                                                            selectedEvent.id,
                                                            'volunteer',
                                                        )
                                                    }
                                                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-0 bg-paw-orange py-3 text-xs font-black tracking-wider text-white uppercase shadow-md shadow-paw-orange/20 transition-all hover:bg-orange-600 active:scale-[0.99]"
                                                >
                                                    <Plus size={16} />
                                                    <span>Join as Volunteer</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleJoinEvent(
                                                            selectedEvent.id,
                                                            'participant',
                                                        )
                                                    }
                                                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-2 border-paw-navy/20 bg-white py-3 text-xs font-black tracking-wider text-paw-navy uppercase transition-all hover:border-paw-navy hover:bg-paw-navy/5 active:scale-[0.99]"
                                                >
                                                    <CheckCircle2 size={16} />
                                                    <span>Join as Participant</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleJoinEvent(
                                                        selectedEvent.id,
                                                        'participant',
                                                    )
                                                }
                                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 border-transparent bg-paw-orange py-3.5 text-sm font-black tracking-wider text-white uppercase shadow-lg ring-0 shadow-paw-orange/20 transition-all outline-none hover:bg-orange-600 active:scale-[0.99]"
                                            >
                                                <Plus size={18} />
                                                <span>JOIN AS PARTICIPANT</span>
                                            </button>
                                            <div className="text-center">
                                                <Link
                                                    href="/volunteer"
                                                    className="text-[11px] font-bold text-gray-400 hover:text-paw-orange transition-colors"
                                                >
                                                    Want to help as a volunteer? Apply here →
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 items-center gap-2.5">
                                        {/* Google Calendar Link */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                shareEvent({
                                                    platform: 'calendar',
                                                    event: selectedEvent,
                                                })
                                            }
                                            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-paw-navy/10 px-3 py-2 text-xs font-black tracking-wider whitespace-nowrap text-paw-navy uppercase transition-all hover:border-paw-orange hover:bg-paw-orange/5 active:scale-[0.99]"
                                        >
                                            <CalendarPlus
                                                size={16}
                                                className="shrink-0 text-paw-orange"
                                            />
                                            <span>Add to Calendar</span>
                                        </button>

                                        {/* Share Button (triggers EventShareModal) */}
                                        <EventShareDropdown
                                            event={selectedEvent}
                                            variant="modal-button"
                                            containerClassName="w-full h-full flex"
                                            className="h-11 w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                description={confirmModal.description}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                variant={confirmModal.variant}
            />

            {/* Guest Participant Registration Modal */}
            <AnimatePresence>
                {guestModalEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paw-navy/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-paw-navy/10"
                        >
                            <div className="bg-gradient-to-r from-paw-orange to-amber-500 p-6 text-white relative">
                                <button
                                    type="button"
                                    onClick={() => setGuestModalEvent(null)}
                                    className="absolute top-4 right-4 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide backdrop-blur-sm">
                                    <Sparkles size={13} />
                                    Guest Registration
                                </span>
                                <h3 className="mt-3 text-xl font-black leading-tight text-white line-clamp-1">
                                    {guestModalEvent.title}
                                </h3>
                                <p className="mt-1 text-xs text-white/90">
                                    Join without an account. We'll email your e-receipt & completion certificate.
                                </p>
                            </div>

                            <form onSubmit={handleGuestSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-paw-navy/70 mb-1.5">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paw-navy/40" size={17} />
                                        <input
                                            type="text"
                                            required
                                            value={guestForm.name}
                                            onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                                            placeholder="e.g. Maria Santos"
                                            className="w-full rounded-2xl border-2 border-paw-navy/10 bg-paw-navy/5 py-2.5 pl-10 pr-4 text-sm font-semibold text-paw-navy placeholder-paw-navy/30 focus:border-paw-orange focus:bg-white focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-paw-navy/70 mb-1.5">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paw-navy/40" size={17} />
                                        <input
                                            type="email"
                                            required
                                            value={guestForm.email}
                                            onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                                            placeholder="you@example.com"
                                            className="w-full rounded-2xl border-2 border-paw-navy/10 bg-paw-navy/5 py-2.5 pl-10 pr-4 text-sm font-semibold text-paw-navy placeholder-paw-navy/30 focus:border-paw-orange focus:bg-white focus:outline-none transition-all"
                                        />
                                    </div>
                                    <p className="mt-1 text-[11px] text-gray-500">
                                        Certificate of Participation will be issued directly to this email.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-paw-navy/70 mb-1.5">
                                        Mobile Phone <span className="text-gray-400 font-normal lowercase">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paw-navy/40" size={17} />
                                        <input
                                            type="tel"
                                            value={guestForm.phone}
                                            onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                                            placeholder="e.g. 0917 123 4567"
                                            className="w-full rounded-2xl border-2 border-paw-navy/10 bg-paw-navy/5 py-2.5 pl-10 pr-4 text-sm font-semibold text-paw-navy placeholder-paw-navy/30 focus:border-paw-orange focus:bg-white focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setGuestModalEvent(null)}
                                        className="w-1/3 rounded-2xl border-2 border-gray-200 py-2.5 text-xs font-black uppercase tracking-wider text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingGuest}
                                        className="w-2/3 rounded-2xl bg-paw-orange py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-paw-orange/25 hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingGuest ? 'Registering...' : 'Confirm Registration'}
                                    </button>
                                </div>

                                <div className="text-center pt-2 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">
                                        Have an account?{' '}
                                        <Link href="/login" className="font-bold text-paw-orange hover:underline">
                                            Log in here
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}

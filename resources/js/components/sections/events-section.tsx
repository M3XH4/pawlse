import { Link, router, usePage } from '@inertiajs/react';
import { Calendar, MapPin, Clock, ArrowRight, Star, Heart, UserPlus, ShieldPlus, Plus, Mail, Phone, User, Bookmark, Sparkles, X, CheckCircle2, Trash2, CalendarPlus, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useBookmarks } from '@/context/bookmark-context';
import { getEventDateBadge, formatEventTime, formatEventDate, shareEvent } from '@/lib/event-utils';

interface EventsProps {
    events?: any[];
    joinedEventIds?: number[];
    joinedEventRoles?: Record<number, string>;
}


const defaultEvents = [
    {
        id: 1,
        title: 'Citywide Feeding Drive',
        date: 'SEP 22',
        time: '8:00 AM - 4:00 PM',
        location: 'Iligan City Public Plaza',
        type: 'Community',
        img: 'https://www.gccfcats.org/wp-content/uploads/2021/11/getting-started.jpg',
        icon: <Heart size={20} />,
        color: 'bg-paw-orange'
    },
    {
        id: 2,
        title: 'Free Vaccination Day',
        date: 'SEP 28',
        time: '9:00 AM - 5:00 PM',
        location: 'PAWLSE Main Shelter',
        type: 'Medical',
        img: 'https://animalfoundation.com/wp-content/uploads/2025/07/Vaccine_Photo.jpg',
        icon: <ShieldPlus size={20} />,
        color: 'bg-paw-blue'
    },
    {
        id: 3,
        title: 'Adopt-a-Friend Fair',
        date: 'OCT 05',
        time: '10:00 AM - 4:00 PM',
        location: 'Robinson Place Iligan',
        type: 'Adoption',
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvJySAm2UEZapxk2-ofEGZ8c2hqNVMHe7A7ZCIYcijpVzfogcsLuK9iw8&s=10',
        icon: <Star size={20} />,
        color: 'bg-paw-yellow'
    },
    {
        id: 4,
        title: 'Volunteer Orientation',
        date: 'OCT 12',
        time: '2:00 PM - 5:00 PM',
        location: 'Community Center',
        type: 'Training',
        img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&q=80',
        icon: <UserPlus size={20} />,
        color: 'bg-paw-green'
    }
];

const categoryColors: Record<string, string> = {
    Adoption: 'bg-paw-yellow',
    Medical: 'bg-paw-blue',
    Feeding: 'bg-paw-orange',
    Social: 'bg-paw-green',
    Community: 'bg-paw-orange',
    Training: 'bg-paw-green',
};

const categoryIcons: Record<string, any> = {
    Adoption: <Star size={20} />,
    Medical: <ShieldPlus size={20} />,
    Feeding: <Heart size={20} />,
    Social: <UserPlus size={20} />,
    Community: <Heart size={20} />,
    Training: <UserPlus size={20} />,
};

export function Events({
    events: propsEvents,
    joinedEventIds: propsJoinedEventIds = [],
    joinedEventRoles: propsJoinedEventRoles = {},
}: EventsProps) {
    const displayEvents = (propsEvents && propsEvents.length > 0) ? propsEvents.map((ev, idx) => {
        const cat = ev.category || ev.type || 'Community';

        return {
            id: ev.id || idx,
            title: ev.title,
            date: ev.date || 'Upcoming',
            time: ev.time || '9:00 AM - 4:00 PM',
            location: ev.location || 'Iligan City',
            type: cat,
            img: ev.img || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600',
            icon: categoryIcons[cat] || <Heart size={20} />,
            color: categoryColors[cat] || 'bg-paw-orange',
            spots: ev.spots ?? 20,
            desc: ev.desc || ev.description || 'Join us for this meaningful community pet initiative organized by Iligan Stray Feeders.'
        };
    }) : defaultEvents;

    const navigate = router.visit;
    const auth = usePage().props.auth as { user?: any } | undefined;
    const user = auth?.user;
    const isAuthenticated = !!user;
    const isVolunteer = user?.role === 'volunteer';

    const [joinedIds, setJoinedIds] = useState<number[]>(propsJoinedEventIds);
    const [joinedRoles, setJoinedRoles] = useState<Record<number, string>>(propsJoinedEventRoles);

    useEffect(() => {
        setJoinedIds(propsJoinedEventIds);
        setJoinedRoles(propsJoinedEventRoles);
    }, [propsJoinedEventIds, propsJoinedEventRoles]);

    const [bookingEvent, setBookingEvent] = useState<any | null>(null);
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

    const handleJoinEvent = (eventId: number, joinAs: 'participant' | 'volunteer' = 'participant') => {
        if (!isAuthenticated) {
            toast.info('Please log in to register for events', {
                description: 'Sign in to join community drives and track your attendance.',
                action: { label: 'Log In', onClick: () => navigate('/login') }
            });
            return;
        }

        if (joinAs === 'volunteer' && !isVolunteer) {
            router.get('/volunteer', {
                selectedEvent: displayEvents.find((e) => e.id === eventId) as any,
            });
            return;
        }

        setIsSubmittingBooking(true);
        router.post(
            `/events/${eventId}/join`,
            { join_as: joinAs },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setJoinedIds((prev) => [...prev, eventId]);
                    setJoinedRoles((prev) => ({ ...prev, [eventId]: joinAs }));
                    toast.success(`You have registered as ${joinAs} for this event!`);
                    setBookingEvent(null);
                    setIsSubmittingBooking(false);
                },
                onError: (errors) => {
                    setIsSubmittingBooking(false);
                    const msg = Object.values(errors)[0] as string || 'Could not register for this event.';
                    toast.error(msg);
                }
            }
        );
    };

    const handleLeaveEvent = (eventId: number) => {
        if (!confirm('Are you sure you want to cancel your attendance for this event? Your spot will be released.')) {
            return;
        }

        setIsSubmittingBooking(true);
        router.post(
            `/events/${eventId}/leave`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setJoinedIds((prev) => prev.filter((id) => id !== eventId));
                    setJoinedRoles((prev) => {
                        const next = { ...prev };
                        delete next[eventId];
                        return next;
                    });
                    toast.success('Your registration has been cancelled.');
                    setBookingEvent(null);
                    setIsSubmittingBooking(false);
                },
                onError: () => {
                    setIsSubmittingBooking(false);
                    toast.error('Failed to cancel attendance.');
                }
            }
        );
    };

    const handleBookmark = (e: React.MouseEvent, event: any) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.info('Please log in to bookmark events', {
                description: 'Create an account or log in to save your favorite events and access them anytime.',
                action: {
                    label: 'Log In',
                    onClick: () => navigate('/login')
                }
            });

            return;
        }

        if (isBookmarked(event.title, 'event')) {
            removeBookmark(event.title, 'event');
        } else {
            addBookmark({
                id: event.title,
                type: 'event',
                title: event.title,
                image: event.img,
                data: event
            });
        }
    };

    return (
        <>
            <AnimatePresence>
                {bookingEvent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 sm:p-5 md:p-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setBookingEvent(null)}
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
                                    src={bookingEvent.img}
                                    alt={bookingEvent.title}
                                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                />

                                {/* Subtle Gradient Overlays */}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

                                {/* Category Badge */}
                                <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-white/60 bg-white/95 px-3.5 py-1.5 text-xs font-black tracking-wider text-paw-orange uppercase shadow-lg backdrop-blur-md">
                                    <Sparkles size={13} />
                                    <span>{bookingEvent.type}</span>
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
                                            {formatEventDate(bookingEvent.date, 'weekday')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content Side */}
                            <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto bg-white p-5 sm:p-7 md:w-7/12 md:p-8">
                                <div>
                                    {/* Header Row: Information Tag + Spots Badge + Close Button */}
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="flex items-center gap-1.5 rounded-full bg-paw-orange/10 px-2.5 py-1 text-[11px] font-black tracking-widest text-paw-orange uppercase">
                                                <Sparkles size={12} />
                                                Event Information
                                            </span>
                                            {bookingEvent.spots !== undefined && (
                                                <span className="rounded-full border border-red-200/80 bg-red-50 px-2.5 py-0.5 text-[11px] font-black tracking-wider whitespace-nowrap text-red-600 uppercase">
                                                    {bookingEvent.spots || 20} Spots Left
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setBookingEvent(null)}
                                            className="shrink-0 cursor-pointer rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-paw-navy active:scale-90"
                                            aria-label="Close modal"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Event Title */}
                                    <h2 className="mb-4 text-2xl leading-tight font-black tracking-tight text-paw-navy sm:text-3xl">
                                        {bookingEvent.title}
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
                                                    {formatEventDate(bookingEvent.date, 'full')}
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
                                                    {formatEventTime(bookingEvent.time)}
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
                                                    {bookingEvent.location}
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
                                            {bookingEvent.desc || 'Join us for this meaningful community pet initiative organized by Iligan Stray Feeders.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons Footer */}
                                <div className="mt-auto space-y-2.5 pt-2">
                                    {joinedIds.includes(bookingEvent.id) ? (
                                        <div className="space-y-2">
                                            <div className="flex w-full items-center justify-center gap-2 rounded-2xl border-0 bg-emerald-50 py-3 text-xs md:text-sm font-black text-emerald-800">
                                                <CheckCircle2 size={18} className="text-emerald-600" />
                                                <span>
                                                    YOU ARE REGISTERED AS {(joinedRoles[bookingEvent.id] || 'Participant').toUpperCase()}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                disabled={isSubmittingBooking}
                                                onClick={() => handleLeaveEvent(bookingEvent.id)}
                                                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                                            >
                                                <Trash2 size={14} />
                                                <span>Cancel Attendance / Leave Event</span>
                                            </button>
                                        </div>
                                    ) : bookingEvent.spots === 0 ? (
                                        <div className="flex w-full items-center justify-center rounded-2xl bg-gray-100 py-3.5 text-xs font-black text-gray-500 uppercase">
                                            This Event is Fully Booked
                                        </div>
                                    ) : !isAuthenticated ? (
                                        <div className="space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => navigate('/login')}
                                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 border-transparent bg-paw-orange py-3.5 text-sm font-black tracking-wider text-white uppercase shadow-lg ring-0 shadow-paw-orange/20 transition-all outline-none hover:bg-orange-600 active:scale-[0.99]"
                                            >
                                                <User size={18} />
                                                <span>LOG IN TO REGISTER</span>
                                            </button>
                                            <div className="text-center">
                                                <Link
                                                    href="/register"
                                                    className="text-[11px] font-bold text-gray-400 hover:text-paw-orange transition-colors"
                                                >
                                                    Don't have an account? Sign up here →
                                                </Link>
                                            </div>
                                        </div>
                                    ) : isVolunteer ? (
                                        <div className="space-y-2">
                                            <p className="text-center text-[11px] font-bold text-gray-500">
                                                Choose how you want to join this event:
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    disabled={isSubmittingBooking}
                                                    onClick={() => handleJoinEvent(bookingEvent.id, 'volunteer')}
                                                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-0 bg-paw-orange py-3 text-xs font-black tracking-wider text-white uppercase shadow-md shadow-paw-orange/20 transition-all hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50"
                                                >
                                                    <Plus size={16} />
                                                    <span>Join as Volunteer</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isSubmittingBooking}
                                                    onClick={() => handleJoinEvent(bookingEvent.id, 'participant')}
                                                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-2 border-paw-navy/20 bg-white py-3 text-xs font-black tracking-wider text-paw-navy uppercase transition-all hover:border-paw-navy hover:bg-paw-navy/5 active:scale-[0.99] disabled:opacity-50"
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
                                                disabled={isSubmittingBooking}
                                                onClick={() => handleJoinEvent(bookingEvent.id, 'participant')}
                                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 border-transparent bg-paw-orange py-3.5 text-sm font-black tracking-wider text-white uppercase shadow-lg ring-0 shadow-paw-orange/20 transition-all outline-none hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50"
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

                                    {/* Calendar & Share row */}
                                    <div className="grid grid-cols-2 items-center gap-2.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => shareEvent({ platform: 'calendar', event: bookingEvent })}
                                            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-paw-navy/10 px-3 py-2 text-xs font-black tracking-wider whitespace-nowrap text-paw-navy uppercase transition-all hover:border-paw-orange hover:bg-paw-orange/5 active:scale-[0.99]"
                                        >
                                            <CalendarPlus size={16} className="shrink-0 text-paw-orange" />
                                            <span>Add to Calendar</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                                    await navigator.clipboard.writeText(`${window.location.origin}/events?event=${bookingEvent.id}`);
                                                    toast.success('Event link copied to clipboard!');
                                                }
                                            }}
                                            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-paw-navy/10 px-3 py-2 text-xs font-black tracking-wider whitespace-nowrap text-paw-navy uppercase transition-all hover:border-paw-orange hover:bg-paw-orange/5 active:scale-[0.99]"
                                        >
                                            <Share2 size={16} className="shrink-0 text-paw-blue" />
                                            <span>Share Event</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <section className="bg-paw-bg relative py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-paw-yellow/10 px-4 py-2 rounded-full mb-4 border border-paw-yellow/20">
                                <Calendar size={18} className="text-paw-yellow" />
                                <span className="text-xs font-black tracking-widest uppercase text-paw-yellow">Community Calendar</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black text-paw-navy leading-tight mb-4 italic">Upcoming <span className="text-paw-yellow not-italic underline decoration-8 decoration-paw-yellow/30 underline-offset-4">Events</span></h2>
                            <p className="text-lg text-gray-500 font-bold max-w-xl">Every event is a step closer to a stray-free Iligan. Join us in our mission to protect and love our furry friends.</p>
                        </div>
                        <Link
                            href="/events"
                            className="bg-white text-paw-navy px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-paw-navy hover:text-white transition-all shadow-xl flex items-center gap-3 border border-gray-100 shrink-0"
                        >
                            VIEW ALL EVENTS
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                        {displayEvents.map((event, i) => {
                            const dateBadge = getEventDateBadge(event.date);

                            return (
                                <motion.div
                                    key={event.id || event.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all group group-hover:-translate-y-2 flex flex-col h-full"
                                >
                                    <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
                                        <ImageWithFallback src={event.img} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className={`absolute top-4 left-4 ${event.color} text-white rounded-2xl shadow-lg flex flex-col items-center justify-center min-w-[56px] py-1.5 px-3`}>
                                            <span className="text-[10px] font-black tracking-widest leading-tight">{dateBadge.month}</span>
                                            <span className="text-xl font-black leading-none">{dateBadge.day}</span>
                                        </div>

                                        <button
                                            onClick={(e) => handleBookmark(e, event)}
                                            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl text-paw-navy shadow-lg hover:bg-white transition-all group/bookmark"
                                        >
                                            <Bookmark
                                                size={18}
                                                className={`transition-all ${isBookmarked(event.title, 'event') ? 'fill-paw-orange text-paw-orange' : 'group-hover/bookmark:text-paw-orange'}`}
                                            />
                                        </button>
                                    </div>
                                    <div className="p-8 flex flex-col justify-between flex-1">
                                        <div>
                                            <span className="text-[10px] font-black tracking-widest uppercase text-paw-blue mb-2 block italic">{event.type}</span>
                                            <h3 className="text-xl font-black text-paw-navy mb-4 group-hover:text-paw-orange transition-colors min-h-[3.5rem] line-clamp-2">{event.title}</h3>
                                            <div className="space-y-3 mb-8">
                                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                                    <Clock size={16} className="text-paw-yellow shrink-0" />
                                                    <span className="line-clamp-1">{event.time}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                                    <MapPin size={16} className="text-paw-orange shrink-0" />
                                                    <span className="line-clamp-1">{event.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setBookingEvent(event)}
                                            className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 mt-auto ${
                                                joinedIds.includes(event.id)
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                                    : 'bg-gray-50 text-paw-navy hover:bg-paw-navy hover:text-white group-hover:bg-paw-navy group-hover:text-white'
                                            }`}
                                        >
                                            {joinedIds.includes(event.id) ? (
                                                <>
                                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                                    REGISTERED (VIEW DETAILS)
                                                </>
                                            ) : (
                                                <>
                                                    BOOK MY SPOT
                                                    <ArrowRight size={14} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
}

import { router, usePage } from '@inertiajs/react';
import { Calendar, MapPin, Clock, ArrowRight, Star, Heart, UserPlus, ShieldPlus, Plus, Mail, Phone, User, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useBookmarks } from '../../context/BookmarkContext';


const events = [
    {
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

export function Events() {
    const navigate = router.visit;
    const auth = usePage().props.auth as { user?: any } | undefined;
    const user = auth?.user;
    const isAuthenticated = !!user;
    const [bookingEvent, setBookingEvent] = useState<typeof events[0] | null>(null);
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

    const handleBookmark = (e: React.MouseEvent, event: typeof events[0]) => {
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                        onClick={() => setBookingEvent(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3.5rem] p-10 md:p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-paw-yellow/10 px-4 py-2 rounded-full mb-4 border border-paw-yellow/20">
                                        <Calendar size={18} className="text-paw-yellow" />
                                        <span className="text-xs font-black tracking-widest uppercase text-paw-yellow">Event Registration</span>
                                    </div>
                                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-paw-navy mb-2">{bookingEvent.title}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-paw-orange" />
                                            {bookingEvent.date}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-paw-blue" />
                                            {bookingEvent.time}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-paw-green" />
                                            {bookingEvent.location}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setBookingEvent(null)}
                                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-paw-navy transition-colors shrink-0"
                                >
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>

                            <form className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Full Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter your full name"
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Contact Number</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="tel"
                                            placeholder="0917-XXX-XXXX"
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">I want to join as:</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { value: 'volunteer', label: 'Volunteer', icon: <UserPlus size={20} />, color: 'paw-green' },
                                            { value: 'participant', label: 'Participant', icon: <Heart size={20} />, color: 'paw-orange' },
                                            { value: 'donor', label: 'Donor/Sponsor', icon: <Star size={20} />, color: 'paw-yellow' },
                                            { value: 'observer', label: 'Observer', icon: <ShieldPlus size={20} />, color: 'paw-blue' }
                                        ].map((role) => (
                                            <label
                                                key={role.value}
                                                className="flex items-center gap-3 p-4 rounded-2xl border-2 border-gray-200 hover:border-paw-orange cursor-pointer transition-all group"
                                            >
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value={role.value}
                                                    className="w-5 h-5 accent-paw-orange"
                                                />
                                                <div className={`p-2 rounded-xl bg-${role.color}/10 text-${role.color} group-hover:bg-paw-orange/10 group-hover:text-paw-orange transition-colors`}>
                                                    {role.icon}
                                                </div>
                                                <span className="font-black text-sm text-paw-navy uppercase">{role.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Special Requests or Notes (Optional)</label>
                                    <textarea
                                        placeholder="Any dietary restrictions, accessibility needs, or questions..."
                                        rows={4}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-paw-orange text-white py-5 rounded-[2rem] font-black text-lg tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setBookingEvent(null);
                                        alert(`Thank you for registering for ${bookingEvent.title}! We'll send you a confirmation email shortly.`);
                                    }}
                                >
                                    <Calendar size={24} />
                                    CONFIRM REGISTRATION
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="bg-paw-bg relative py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-paw-yellow/10 px-4 py-2 rounded-full mb-6 border border-paw-yellow/20">
                                <Calendar size={18} className="text-paw-yellow" />
                                <span className="text-xs font-black tracking-widest uppercase text-paw-yellow">Community Calendar</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black text-paw-navy leading-tight mb-4 italic">Upcoming <span className="text-paw-yellow not-italic underline decoration-8 decoration-paw-yellow/30 underline-offset-4">Events</span></h2>
                            <p className="text-lg text-gray-500 font-bold max-w-xl">Every event is a step closer to a stray-free Iligan. Join us in our mission to protect and love our furry friends.</p>
                        </div>
                        <button
                            onClick={() => navigate('/events')}
                            className="bg-white text-paw-navy px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-gray-100"
                        >
                            VIEW ALL EVENTS
                            <ArrowRight size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {events.map((event, i) => (
                            <motion.div
                                key={event.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all group group-hover:-translate-y-2"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <ImageWithFallback src={event.img} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className={`absolute top-4 left-4 ${event.color} text-white rounded-2xl shadow-lg flex flex-col items-center justify-center min-w-[60px] py-[3px] px-[10px] py-[2px]`}>
                                        <span className="text-xs font-black tracking-widest">{event.date.split(' ')[0]}</span>
                                        <span className="text-xl font-black leading-none">{event.date.split(' ')[1]}</span>
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
                                <div className="p-8">
                                    <span className="text-[10px] font-black tracking-widest uppercase text-paw-blue mb-2 block italic">{event.type}</span>
                                    <h3 className="text-xl font-black text-paw-navy mb-4 group-hover:text-paw-orange transition-colors">{event.title}</h3>
                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                            <Clock size={16} className="text-paw-yellow" />
                                            {event.time}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                            <MapPin size={16} className="text-paw-orange" />
                                            {event.location}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setBookingEvent(event)}
                                        className="w-full bg-gray-50 text-paw-navy py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-paw-navy hover:text-white transition-all group-hover:bg-paw-navy group-hover:text-white flex items-center justify-center gap-2"
                                    >
                                        BOOK MY SPOT
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

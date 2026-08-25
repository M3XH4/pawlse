import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminCard } from '@/components/admin/card';
import { toast } from 'sonner';
import { Calendar, Utensils, Search, Filter, Plus, Edit, Trash, ToggleLeft, ToggleRight, X, Clock, MapPin, Heart, Users } from 'lucide-react';

interface PaginatedData<T> {
    data: T[];
    links: any[];
    total: number;
}

interface EventModel {
    id: number;
    title: string;
    category: string; // Feeding, Medical, Social, Adoption
    date: string;
    time: string;
    location: string;
    img: string | null;
    spots: number | null;
    desc: string;
    keywords: string[] | null;
    status: string; // open, closed
}

interface FeedingScheduleModel {
    id: number;
    zone: string;
    day: string;
    time: string;
    volunteers: number;
    strays: number;
    status: string; // active, closed
}

interface EventManagementProps {
    events: PaginatedData<EventModel>;
    feedingSchedules: PaginatedData<FeedingScheduleModel>;
    filters: {
        search: string;
        category: string;
    };
}

export default function EventManagement({
    events,
    feedingSchedules,
    filters
}: EventManagementProps) {
    const [activeTab, setActiveTab] = useState<'events' | 'feeding'>('events');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'All');

    // Event Modal state
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventModel | null>(null);
    const [eventTitle, setEventTitle] = useState('');
    const [eventCategory, setEventCategory] = useState('Feeding');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventSpots, setEventSpots] = useState('-1'); // -1 means unlimited
    const [eventDesc, setEventDesc] = useState('');
    const [eventImg, setEventImg] = useState('');

    // Feeding Route Modal state
    const [isFeedingModalOpen, setIsFeedingModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<FeedingScheduleModel | null>(null);
    const [feedingZone, setFeedingZone] = useState('');
    const [feedingDay, setFeedingDay] = useState('');
    const [feedingTime, setFeedingTime] = useState('');
    const [feedingVolunteers, setFeedingVolunteers] = useState('6');
    const [feedingStrays, setFeedingStrays] = useState('30');
    const [feedingStatus, setFeedingStatus] = useState('active');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/account/admin/events', {
            search: searchQuery,
            category: categoryFilter
        }, { preserveState: true });
    };

    const handleCategoryFilterChange = (cat: string) => {
        setCategoryFilter(cat);
        router.get('/account/admin/events', {
            search: searchQuery,
            category: cat
        }, { preserveState: true });
    };

    // Event CRUD submissions
    const openEventCreate = () => {
        setEditingEvent(null);
        setEventTitle('');
        setEventCategory('Feeding');
        setEventDate('');
        setEventTime('');
        setEventLocation('');
        setEventSpots('-1');
        setEventDesc('');
        setEventImg('');
        setIsEventModalOpen(true);
    };

    const openEventEdit = (event: EventModel) => {
        setEditingEvent(event);
        setEventTitle(event.title);
        setEventCategory(event.category);
        setEventDate(event.date ? event.date.substring(0, 10) : '');
        setEventTime(event.time);
        setEventLocation(event.location);
        setEventSpots(event.spots === null ? '-1' : String(event.spots));
        setEventDesc(event.desc);
        setEventImg(event.img || '');
        setIsEventModalOpen(true);
    };

    const handleEventSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            title: eventTitle,
            category: eventCategory,
            date: eventDate,
            time: eventTime,
            location: eventLocation,
            spots: parseInt(eventSpots) === -1 ? null : parseInt(eventSpots),
            desc: eventDesc,
            img: eventImg || null,
        };

        if (editingEvent) {
            router.put(`/account/admin/events/${editingEvent.id}`, payload, {
                onSuccess: () => {
                    toast.success('Event updated successfully.');
                    setIsEventModalOpen(false);
                }
            });
        } else {
            router.post('/account/admin/events', payload, {
                onSuccess: () => {
                    toast.success('Event created successfully.');
                    setIsEventModalOpen(false);
                }
            });
        }
    };

    const handleToggleEvent = (eventId: number) => {
        router.post(`/account/admin/events/${eventId}/toggle`, {}, {
            onSuccess: () => toast.success('Event status changed.')
        });
    };

    const handleDeleteEvent = (eventId: number) => {
        if (!confirm('Are you sure you want to delete this event? This will also remove volunteer associations.')) return;
        router.delete(`/account/admin/events/${eventId}`, {
            onSuccess: () => toast.success('Event deleted.')
        });
    };

    // Feeding CRUD submissions
    const openFeedingCreate = () => {
        setEditingSchedule(null);
        setFeedingZone('');
        setFeedingDay('');
        setFeedingTime('');
        setFeedingVolunteers('6');
        setFeedingStrays('30');
        setFeedingStatus('active');
        setIsFeedingModalOpen(true);
    };

    const openFeedingEdit = (schedule: FeedingScheduleModel) => {
        setEditingSchedule(schedule);
        setFeedingZone(schedule.zone);
        setFeedingDay(schedule.day);
        setFeedingTime(schedule.time);
        setFeedingVolunteers(String(schedule.volunteers));
        setFeedingStrays(String(schedule.strays));
        setFeedingStatus(schedule.status);
        setIsFeedingModalOpen(true);
    };

    const handleFeedingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            zone: feedingZone,
            day: feedingDay,
            time: feedingTime,
            volunteers: parseInt(feedingVolunteers),
            strays: parseInt(feedingStrays),
            status: feedingStatus
        };

        if (editingSchedule) {
            router.put(`/account/admin/feeding-schedules/${editingSchedule.id}`, payload, {
                onSuccess: () => {
                    toast.success('Feeding route updated.');
                    setIsFeedingModalOpen(false);
                }
            });
        } else {
            router.post('/account/admin/feeding-schedules', payload, {
                onSuccess: () => {
                    toast.success('Feeding route created.');
                    setIsFeedingModalOpen(false);
                }
            });
        }
    };

    const handleDeleteFeeding = (id: number) => {
        if (!confirm('Are you sure you want to delete this feeding schedule route?')) return;
        router.delete(`/account/admin/feeding-schedules/${id}`, {
            onSuccess: () => toast.success('Feeding route deleted.')
        });
    };

    // Pagination helper component
    const Pagination = ({ links }: { links: any[] }) => {
        if (!links || links.length <= 3) return null;
        return (
            <div className="flex justify-center items-center gap-1 mt-6">
                {links.map((link, idx) => {
                    if (link.url === null) return (
                        <span key={idx} className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-400 rounded-lg text-xs font-bold" dangerouslySetInnerHTML={{ __html: link.label }} />
                    );
                    return (
                        <Link
                            key={idx}
                            href={link.url}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                link.active ? 'bg-paw-orange text-white' : 'bg-white dark:bg-slate-900 text-paw-navy dark:text-gray-200 border dark:border-gray-800'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <Head title="Event Management" />
            <AdminPageShell title="Event Management">

                {/* Filters and search card */}
                <AdminCard className="p-4 mb-6">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search events proper or feeding zones..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-850 rounded-xl text-sm font-semibold outline-none border border-transparent focus:border-paw-orange dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Filter size={16} className="text-gray-400" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => handleCategoryFilterChange(e.target.value)}
                                className="px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border dark:border-gray-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none"
                            >
                                <option value="All">All Categories</option>
                                <option value="Feeding">Feeding</option>
                                <option value="Medical">Medical</option>
                                <option value="Social">Social</option>
                                <option value="Adoption">Adoption</option>
                            </select>
                            <button type="submit" className="px-5 py-2.5 bg-paw-orange text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600">
                                Search
                            </button>
                        </div>
                    </form>
                </AdminCard>

                {/* Tabs */}
                <div className="flex gap-2 border-b-2 border-gray-200 dark:border-gray-800 mb-6">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-6 py-4 font-black text-sm transition-all relative cursor-pointer ${
                            activeTab === 'events' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy'
                        }`}
                    >
                        Events ({events.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('feeding')}
                        className={`px-6 py-4 font-black text-sm transition-all relative cursor-pointer ${
                            activeTab === 'feeding' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy'
                        }`}
                    >
                        Feeding Schedules ({feedingSchedules.total})
                    </button>
                </div>

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <AdminCard className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">Events Proper</h3>
                            <button
                                onClick={openEventCreate}
                                className="flex items-center gap-1.5 px-4 py-2 bg-paw-orange text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-655 cursor-pointer"
                            >
                                <Plus size={14} /> Create Event
                            </button>
                        </div>

                        {events.data.length === 0 ? (
                            <p className="text-center text-gray-500 font-bold py-8">No events found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm font-semibold border-collapse">
                                    <thead>
                                        <tr className="border-b dark:border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="pb-3">Title</th>
                                            <th className="pb-3">Category</th>
                                            <th className="pb-3">Schedule</th>
                                            <th className="pb-3">Location</th>
                                            <th className="pb-3">Spots</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-850">
                                        {events.data.map((event) => (
                                            <tr key={event.id} className="text-gray-700 dark:text-gray-300">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        {event.img && <img src={event.img} className="w-10 h-10 object-cover rounded-lg border" />}
                                                        <div>
                                                            <p className="font-bold text-[#0B2340] dark:text-white">{event.title}</p>
                                                            <p className="text-xs text-gray-400 max-w-xs truncate">{event.desc}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 font-bold">{event.category}</td>
                                                <td className="py-4">
                                                    <p>{event.date}</p>
                                                    <p className="text-xs text-gray-400">{event.time}</p>
                                                </td>
                                                <td className="py-4 font-bold">{event.location}</td>
                                                <td className="py-4">
                                                    {event.spots === null ? 'Unlimited' : `${event.spots} left`}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                                        event.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {event.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleToggleEvent(event.id)}
                                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 rounded-lg cursor-pointer"
                                                            title={event.status === 'open' ? 'Close Event' : 'Open Event'}
                                                        >
                                                            {event.status === 'open' ? <ToggleRight className="text-green-600" /> : <ToggleLeft />}
                                                        </button>
                                                        <button
                                                            onClick={() => openEventEdit(event)}
                                                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteEvent(event.id)}
                                                            className="p-1.5 hover:bg-red-50 text-red-650 rounded-lg cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination links={events.links} />
                            </div>
                        )}
                    </AdminCard>
                )}

                {/* Feeding Schedules Tab */}
                {activeTab === 'feeding' && (
                    <AdminCard className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">Feeding Schedules & Zones</h3>
                            <button
                                onClick={openFeedingCreate}
                                className="flex items-center gap-1.5 px-4 py-2 bg-paw-orange text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-655 cursor-pointer"
                            >
                                <Plus size={14} /> Create Feeding Route
                            </button>
                        </div>

                        {feedingSchedules.data.length === 0 ? (
                            <p className="text-center text-gray-500 font-bold py-8">No feeding schedules found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm font-semibold border-collapse">
                                    <thead>
                                        <tr className="border-b dark:border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="pb-3">Zone Route</th>
                                            <th className="pb-3">Schedules</th>
                                            <th className="pb-3">Time</th>
                                            <th className="pb-3">Volunteers Needed</th>
                                            <th className="pb-3">Strays count</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-850">
                                        {feedingSchedules.data.map((schedule) => (
                                            <tr key={schedule.id} className="text-gray-700 dark:text-gray-300">
                                                <td className="py-4 font-bold text-[#0B2340] dark:text-white">{schedule.zone}</td>
                                                <td className="py-4 font-bold">{schedule.day}</td>
                                                <td className="py-4">{schedule.time}</td>
                                                <td className="py-4 font-bold text-paw-blue">{schedule.volunteers}</td>
                                                <td className="py-4 font-bold text-paw-orange">{schedule.strays}</td>
                                                <td className="py-4">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                                        schedule.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {schedule.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openFeedingEdit(schedule)}
                                                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFeeding(schedule.id)}
                                                            className="p-1.5 hover:bg-red-50 text-red-650 rounded-lg cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination links={feedingSchedules.links} />
                            </div>
                        )}
                    </AdminCard>
                )}

            </AdminPageShell>

            {/* Event Form Modal */}
            {isEventModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h3 className="font-fredoka text-xl font-bold mb-4 text-[#0B2340] dark:text-white">
                            {editingEvent ? 'Edit Event Proper' : 'Create Event Proper'}
                        </h3>
                        <form onSubmit={handleEventSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Event Title *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="E.g., Tibanga Rescue Outreach"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category *</label>
                                    <select
                                        required
                                        value={eventCategory}
                                        onChange={(e) => setEventCategory(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border dark:border-gray-800 text-sm font-semibold dark:text-white outline-none"
                                    >
                                        <option value="Feeding">Feeding</option>
                                        <option value="Medical">Medical</option>
                                        <option value="Social">Social</option>
                                        <option value="Adoption">Adoption</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Spots Limit (Or -1) *</label>
                                    <input
                                        required
                                        type="number"
                                        value={eventSpots}
                                        onChange={(e) => setEventSpots(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Date *</label>
                                    <input
                                        required
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Time *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="E.g., 9:00 AM - 12:00 PM"
                                        value={eventTime}
                                        onChange={(e) => setEventTime(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Location *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="E.g., Anahaw Amphitheatre, Iligan"
                                    value={eventLocation}
                                    onChange={(e) => setEventLocation(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Banner Image URL</label>
                                <input
                                    type="text"
                                    placeholder="Optional absolute image URL"
                                    value={eventImg}
                                    onChange={(e) => setEventImg(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description *</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Enter event outline, goals, stray headcount..."
                                    value={eventDesc}
                                    onChange={(e) => setEventDesc(e.target.value)}
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-850 rounded-xl outline-none focus:border-paw-orange border border-transparent font-semibold text-sm dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEventModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-paw-orange text-white hover:bg-orange-650 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                    {editingEvent ? 'Save Changes' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Feeding Route Modal */}
            {isFeedingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <h3 className="font-fredoka text-xl font-bold mb-4 text-[#0B2340] dark:text-white">
                            {editingSchedule ? 'Edit Feeding Route' : 'Create Feeding Route'}
                        </h3>
                        <form onSubmit={handleFeedingSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Zone / Area *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="E.g., Zone 1: Saray Proper"
                                    value={feedingZone}
                                    onChange={(e) => setFeedingZone(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Day/Days *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="E.g., Mon & Thurs"
                                        value={feedingDay}
                                        onChange={(e) => setFeedingDay(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Time *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="E.g., 6:30 AM"
                                        value={feedingTime}
                                        onChange={(e) => setFeedingTime(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Volunteers Needed *</label>
                                    <input
                                        required
                                        type="number"
                                        value={feedingVolunteers}
                                        onChange={(e) => setFeedingVolunteers(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Stray Count *</label>
                                    <input
                                        required
                                        type="number"
                                        value={feedingStrays}
                                        onChange={(e) => setFeedingStrays(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                            </div>

                            {editingSchedule && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Status *</label>
                                    <select
                                        value={feedingStatus}
                                        onChange={(e) => setFeedingStatus(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border dark:border-gray-800 text-sm font-semibold dark:text-white outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="closed">Closed / Inactive</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFeedingModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-paw-orange text-white hover:bg-orange-650 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                    {editingSchedule ? 'Save Changes' : 'Create Route'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

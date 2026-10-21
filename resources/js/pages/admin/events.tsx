import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminCard } from '@/components/admin/card';
import { toast } from 'sonner';
import {
    Calendar,
    Search,
    Filter,
    Plus,
    Edit,
    Trash,
    ToggleLeft,
    ToggleRight,
    X,
    Clock,
    MapPin,
    Users,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Check,
    Image as ImageIcon,
    ShieldCheck,
    Eye,
    Award,
} from 'lucide-react';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { ModernTimePicker } from '@/components/ui/modern-time-picker';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

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
    approval_status: 'pending' | 'approved' | 'rejected';
    approved_by?: number | null;
    approved_at?: string | null;
    rejection_reason?: string | null;
    created_by?: number | null;
    creator?: { id: number; name: string } | null;
    approved_by_user?: { id: number; name: string } | null;
    assigned_tasks_count?: number;
    assigned_tasks?: any[];
}

interface FeedingScheduleModel {
    id: number;
    zone: string;
    day: string;
    time: string;
    volunteers: number;
    strays: number;
    status: string; // active, closed
    assigned_tasks_count?: number;
    assigned_tasks?: any[];
}

interface EventManagementProps {
    events: PaginatedData<EventModel>;
    feedingSchedules: PaginatedData<FeedingScheduleModel>;
    filters: {
        search: string;
        category: string;
        approval_status?: string;
    };
    isSuperAdmin?: boolean;
    basePath?: string;
}

export default function EventManagement({
    events,
    feedingSchedules,
    filters,
    isSuperAdmin = false,
    basePath = '/account/admin/events',
}: EventManagementProps) {
    const feedingBasePath = basePath.replace(/\/events$/, '/feeding-schedules');
    const [activeTab, setActiveTab] = useState<'events' | 'feeding'>('events');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'All');
    const [approvalFilter, setApprovalFilter] = useState(filters.approval_status || 'All');

    // Attendees Roster Modal state
    const [viewingAttendeesEvent, setViewingAttendeesEvent] = useState<{
        id?: number;
        title: string;
        attendees: any[];
        isEvent?: boolean;
    } | null>(null);
    const [isIssuingAll, setIsIssuingAll] = useState(false);
    const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);

    const handleCompleteAttendee = (taskId: number) => {
        setCompletingTaskId(taskId);
        router.post(
            `${basePath}/attendees/${taskId}/complete`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCompletingTaskId(null);
                    toast.success('Attendee marked completed and certificate issued!');
                    setViewingAttendeesEvent((prev) =>
                        prev
                            ? {
                                  ...prev,
                                  attendees: prev.attendees.map((a) =>
                                      a.id === taskId ? { ...a, status: 'completed' } : a,
                                  ),
                              }
                            : null,
                    );
                },
                onError: () => {
                    setCompletingTaskId(null);
                    toast.error('Failed to complete attendee.');
                },
            },
        );
    };

    const handleCompleteAll = () => {
        if (!viewingAttendeesEvent?.id) return;
        setIsIssuingAll(true);
        router.post(
            `${basePath}/${viewingAttendeesEvent.id}/issue-certificates`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsIssuingAll(false);
                    toast.success('Completed all attendees and issued certificates!');
                    setViewingAttendeesEvent((prev) =>
                        prev
                            ? {
                                  ...prev,
                                  attendees: prev.attendees.map((a) => ({
                                      ...a,
                                      status: 'completed',
                                  })),
                              }
                            : null,
                    );
                },
                onError: () => {
                    setIsIssuingAll(false);
                    toast.error('Failed to issue certificates to all.');
                },
            },
        );
    };

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
    const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

    // Feeding Route Modal state
    const [isFeedingModalOpen, setIsFeedingModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<FeedingScheduleModel | null>(null);
    const [feedingZone, setFeedingZone] = useState('');
    const [feedingDay, setFeedingDay] = useState('');
    const [feedingTime, setFeedingTime] = useState('');
    const [feedingVolunteers, setFeedingVolunteers] = useState('6');
    const [feedingStrays, setFeedingStrays] = useState('30');
    const [feedingStatus, setFeedingStatus] = useState('active');
    const [isSubmittingFeeding, setIsSubmittingFeeding] = useState(false);

    // Rejection reason modal state
    const [rejectingEvent, setRejectingEvent] = useState<EventModel | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Confirmation Modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: React.ReactNode;
        confirmText?: string;
        cancelText?: string;
        variant?: 'danger' | 'warning' | 'info';
        isLoading?: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {},
    });

    const closeConfirmModal = () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(basePath, {
            search: searchQuery,
            category: categoryFilter,
            approval_status: approvalFilter,
        }, { preserveState: true });
    };

    const handleCategoryFilterChange = (cat: string) => {
        setCategoryFilter(cat);
        router.get(basePath, {
            search: searchQuery,
            category: cat,
            approval_status: approvalFilter,
        }, { preserveState: true });
    };

    const handleApprovalFilterChange = (status: string) => {
        setApprovalFilter(status);
        router.get(basePath, {
            search: searchQuery,
            category: categoryFilter,
            approval_status: status,
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
        setIsSubmittingEvent(true);

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
            router.put(`${basePath}/${editingEvent.id}`, payload, {
                onSuccess: () => {
                    toast.success('Event updated successfully.');
                    setIsEventModalOpen(false);
                },
                onFinish: () => setIsSubmittingEvent(false),
            });
        } else {
            router.post(basePath, payload, {
                onSuccess: () => {
                    setIsEventModalOpen(false);
                },
                onFinish: () => setIsSubmittingEvent(false),
            });
        }
    };

    const handleToggleEvent = (event: EventModel) => {
        if (event.approval_status !== 'approved') {
            toast.error('Pending or rejected events cannot be opened until approved by a Super Admin.');
            return;
        }

        router.post(`${basePath}/${event.id}/toggle`, {}, {
            onSuccess: () => toast.success('Event status changed.'),
        });
    };

    const handleDeleteEvent = (event: EventModel) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Community Event',
            description: (
                <div>
                    Are you sure you want to delete <strong className="text-gray-900 dark:text-white">"{event.title}"</strong>?
                    <p className="mt-2 text-xs text-red-500 font-semibold">
                        This will permanently remove the event and all associated volunteer sign-ups.
                    </p>
                </div>
            ),
            confirmText: 'Delete Event',
            variant: 'danger',
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isLoading: true }));
                router.delete(`${basePath}/${event.id}`, {
                    onSuccess: () => {
                        toast.success('Event deleted.');
                        closeConfirmModal();
                    },
                    onError: () => closeConfirmModal(),
                });
            },
        });
    };

    // Super Admin Event Approval
    const handleApproveEvent = (event: EventModel) => {
        setConfirmModal({
            isOpen: true,
            title: 'Approve & Publish Event',
            description: (
                <div>
                    Are you sure you want to approve <strong className="text-gray-900 dark:text-white">"{event.title}"</strong>?
                    <p className="mt-2 text-xs text-gray-500 font-normal">
                        This event will immediately be opened for public registration and displayed on community event boards.
                    </p>
                </div>
            ),
            confirmText: 'Approve & Publish',
            variant: 'info',
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isLoading: true }));
                router.post(`${basePath}/${event.id}/approve`, {}, {
                    onSuccess: () => {
                        toast.success('Event approved successfully.');
                        closeConfirmModal();
                    },
                    onError: () => closeConfirmModal(),
                });
            },
        });
    };

    // Super Admin Event Rejection
    const openRejectModal = (event: EventModel) => {
        setRejectingEvent(event);
        setRejectionReason('');
    };

    const handleConfirmReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingEvent) return;

        router.post(`${basePath}/${rejectingEvent.id}/reject`, {
            reason: rejectionReason,
        }, {
            onSuccess: () => {
                toast.success('Event marked as rejected.');
                setRejectingEvent(null);
            },
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
        setIsSubmittingFeeding(true);
        const payload = {
            zone: feedingZone,
            day: feedingDay,
            time: feedingTime,
            volunteers: parseInt(feedingVolunteers),
            strays: parseInt(feedingStrays),
            status: feedingStatus,
        };

        if (editingSchedule) {
            router.put(`${feedingBasePath}/${editingSchedule.id}`, payload, {
                onSuccess: () => {
                    toast.success('Feeding route updated.');
                    setIsFeedingModalOpen(false);
                },
                onFinish: () => setIsSubmittingFeeding(false),
            });
        } else {
            router.post(feedingBasePath, payload, {
                onSuccess: () => {
                    toast.success('Feeding route created.');
                    setIsFeedingModalOpen(false);
                },
                onFinish: () => setIsSubmittingFeeding(false),
            });
        }
    };

    const handleDeleteFeeding = (schedule: FeedingScheduleModel) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Feeding Route',
            description: (
                <div>
                    Are you sure you want to delete route for <strong className="text-gray-900 dark:text-white">"{schedule.zone}"</strong> ({schedule.day})?
                    <p className="mt-2 text-xs text-red-500 font-semibold">
                        This will remove scheduled volunteer assignments for this zone.
                    </p>
                </div>
            ),
            confirmText: 'Delete Route',
            variant: 'danger',
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isLoading: true }));
                router.delete(`${feedingBasePath}/${schedule.id}`, {
                    onSuccess: () => {
                        toast.success('Feeding route deleted.');
                        closeConfirmModal();
                    },
                    onError: () => closeConfirmModal(),
                });
            },
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                link.active ? 'bg-paw-orange text-white' : 'bg-white dark:bg-slate-900 text-paw-navy dark:text-gray-200 border dark:border-gray-800 hover:bg-gray-50'
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
            <AdminPageShell 
                title="Event Management"
                description="Create, schedule, and manage community outreach events, adoption drives, and feeding programs."
            >

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
                        <div className="flex flex-wrap items-center gap-3">
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

                            <select
                                value={approvalFilter}
                                onChange={(e) => handleApprovalFilterChange(e.target.value)}
                                className="px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border dark:border-gray-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none"
                            >
                                <option value="All">All Approvals</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending Review</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            <button type="submit" className="px-5 py-2.5 bg-paw-orange text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition cursor-pointer">
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
                            activeTab === 'events' ? 'text-paw-orange border-b-2 border-paw-orange -mb-[2px]' : 'text-gray-400 hover:text-paw-navy dark:hover:text-gray-200'
                        }`}
                    >
                        Events ({events.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('feeding')}
                        className={`px-6 py-4 font-black text-sm transition-all relative cursor-pointer ${
                            activeTab === 'feeding' ? 'text-paw-orange border-b-2 border-paw-orange -mb-[2px]' : 'text-gray-400 hover:text-paw-navy dark:hover:text-gray-200'
                        }`}
                    >
                        Feeding Schedules ({feedingSchedules.total})
                    </button>
                </div>

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <AdminCard className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">Events Proper</h3>
                                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                                    Browse scheduled community outreach events and monitor sign-ups.
                                </p>
                            </div>
                            <button
                                onClick={openEventCreate}
                                className="flex items-center gap-1.5 px-4 py-2 bg-paw-orange text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition shadow-md shadow-orange-500/20 cursor-pointer"
                            >
                                <Plus size={14} /> Create Event
                            </button>
                        </div>

                        {events.data.length === 0 ? (
                            <p className="text-center text-gray-500 font-bold py-12">No events found matching your criteria.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm font-semibold border-collapse">
                                    <thead>
                                        <tr className="border-b dark:border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="py-3 px-4 min-w-[220px]">Title</th>
                                            <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">Category</th>
                                            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Schedule</th>
                                            <th className="py-3 px-4 min-w-[180px]">Location</th>
                                            <th className="py-3 px-4 min-w-[90px] whitespace-nowrap">Spots</th>
                                            <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Attendees</th>
                                            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Approval</th>
                                            <th className="py-3 px-4 min-w-[90px] whitespace-nowrap">Status</th>
                                            <th className="py-3 px-4 text-right min-w-[170px] whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-850">
                                        {events.data.map((event) => (
                                            <tr key={event.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {event.img ? (
                                                            <img src={event.img} alt={event.title} className="w-11 h-11 object-cover rounded-xl border border-gray-100 dark:border-gray-800 shrink-0" />
                                                        ) : (
                                                            <div className="w-11 h-11 rounded-xl bg-paw-orange/10 text-paw-orange flex items-center justify-center shrink-0">
                                                                <Calendar size={18} />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-[#0B2340] dark:text-white truncate max-w-xs">{event.title}</p>
                                                            <p className="text-xs text-gray-400 truncate max-w-xs">{event.desc}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className="font-bold text-paw-navy dark:text-gray-200">
                                                        {event.category}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <p className="font-bold text-[#0B2340] dark:text-white">{event.date}</p>
                                                    <p className="text-xs text-gray-400">{event.time}</p>
                                                </td>
                                                <td className="py-4 px-4 font-bold text-xs max-w-[200px] truncate" title={event.location}>
                                                    {event.location}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {event.spots === null ? (
                                                        <span className="text-xs font-bold text-gray-500">Unlimited</span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-[#0B2340] dark:text-white">{event.spots} left</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewingAttendeesEvent({
                                                            id: event.id,
                                                            title: event.title,
                                                            attendees: (event as any).assigned_tasks || [],
                                                            isEvent: true,
                                                        })}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-paw-navy hover:border-paw-orange hover:bg-paw-orange/10 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200 transition-colors whitespace-nowrap shadow-xs"
                                                        title="Click to view full attendee roster"
                                                    >
                                                        <Users size={13} className="text-paw-orange shrink-0" />
                                                        <span>{(event as any).assigned_tasks_count || 0} Registered</span>
                                                    </button>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {event.approval_status === 'approved' && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60">
                                                            <CheckCircle2 size={12} /> Approved
                                                        </span>
                                                    )}
                                                    {event.approval_status === 'pending' && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60 animate-pulse">
                                                            <Clock size={12} /> Awaiting Approval
                                                        </span>
                                                    )}
                                                    {event.approval_status === 'rejected' && (
                                                        <span 
                                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60 cursor-help"
                                                            title={event.rejection_reason || 'Rejected by Super Admin'}
                                                        >
                                                            <XCircle size={12} /> Rejected
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                                        event.status === 'open' 
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' 
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                        {event.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right whitespace-nowrap">
                                                    <div className="flex justify-end items-center gap-1.5">
                                                        {/* Super Admin Quick Approval Actions */}
                                                        {isSuperAdmin && event.approval_status === 'pending' && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleApproveEvent(event)}
                                                                    className="p-1.5 hover:bg-emerald-50 text-emerald-600 dark:hover:bg-emerald-950/50 rounded-lg cursor-pointer transition"
                                                                    title="Approve Event"
                                                                >
                                                                    <Check size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openRejectModal(event)}
                                                                    className="p-1.5 hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer transition"
                                                                    title="Reject Event"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleEvent(event)}
                                                            disabled={event.approval_status !== 'approved'}
                                                            className={`p-1.5 rounded-lg transition ${
                                                                event.approval_status !== 'approved'
                                                                    ? 'opacity-40 cursor-not-allowed text-gray-400'
                                                                    : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 cursor-pointer'
                                                            }`}
                                                            title={
                                                                event.approval_status !== 'approved'
                                                                    ? 'Approval required before opening event'
                                                                    : event.status === 'open' ? 'Close Event' : 'Open Event'
                                                            }
                                                        >
                                                            {event.status === 'open' ? <ToggleRight className="text-green-600" size={18} /> : <ToggleLeft size={18} />}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEventEdit(event)}
                                                            className="p-1.5 hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-950/50 rounded-lg cursor-pointer transition"
                                                            title="Edit Event"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteEvent(event)}
                                                            className="p-1.5 hover:bg-red-50 text-red-600 dark:hover:bg-red-950/50 rounded-lg cursor-pointer transition"
                                                            title="Delete Event"
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
                            <div>
                                <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">Feeding Schedules & Zones</h3>
                                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                                    Manage regular feeding circuits, stray headcounts, and assigned volunteer routes.
                                </p>
                            </div>
                            <button
                                onClick={openFeedingCreate}
                                className="flex items-center gap-1.5 px-4 py-2 bg-paw-orange text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition shadow-md shadow-orange-500/20 cursor-pointer"
                            >
                                <Plus size={14} /> Create Feeding Route
                            </button>
                        </div>

                        {feedingSchedules.data.length === 0 ? (
                            <p className="text-center text-gray-500 font-bold py-12">No feeding schedules found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm font-semibold border-collapse">
                                    <thead>
                                        <tr className="border-b dark:border-gray-800 text-gray-400 text-xs uppercase tracking-wider font-bold">
                                            <th className="py-3 px-4 min-w-[180px]">Zone Route</th>
                                            <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">Schedule</th>
                                            <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">Time</th>
                                            <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Volunteers Needed</th>
                                            <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">Stray Count</th>
                                            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Joined Volunteers</th>
                                            <th className="py-3 px-4 min-w-[90px] whitespace-nowrap">Status</th>
                                            <th className="py-3 px-4 text-right min-w-[110px] whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-850">
                                        {feedingSchedules.data.map((schedule) => (
                                            <tr key={schedule.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                                                <td className="py-4 px-4 font-bold text-[#0B2340] dark:text-white">{schedule.zone}</td>
                                                <td className="py-4 px-4 font-bold">{schedule.day}</td>
                                                <td className="py-4 px-4 text-xs">{schedule.time}</td>
                                                <td className="py-4 px-4 font-bold text-paw-blue">{schedule.volunteers}</td>
                                                <td className="py-4 px-4 font-bold text-paw-orange">{schedule.strays}</td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewingAttendeesEvent({
                                                            id: schedule.id,
                                                            title: `Route: ${schedule.zone} (${schedule.day})`,
                                                            attendees: (schedule as any).assigned_tasks || [],
                                                            isEvent: false,
                                                        })}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-paw-navy hover:border-paw-orange hover:bg-paw-orange/10 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200 transition-colors shadow-xs whitespace-nowrap"
                                                        title="Click to view joined volunteers"
                                                    >
                                                        <Users size={13} className="text-paw-orange shrink-0" />
                                                        <span>{(schedule as any).assigned_tasks_count || 0} Joined</span>
                                                    </button>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                                        schedule.status === 'active' 
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' 
                                                            : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                                    }`}>
                                                        {schedule.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right whitespace-nowrap">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openFeedingEdit(schedule)}
                                                            className="p-1.5 hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-950/50 rounded-lg cursor-pointer transition"
                                                            title="Edit Route"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteFeeding(schedule)}
                                                            className="p-1.5 hover:bg-red-50 text-red-600 dark:hover:bg-red-950/50 rounded-lg cursor-pointer transition"
                                                            title="Delete Route"
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

            {/* Overhauled Event Form Modal */}
            {isEventModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isSubmittingEvent) {
                            setIsEventModalOpen(false);
                        }
                    }}
                >
                    <div className="bg-white dark:bg-slate-900 max-w-3xl w-full rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-2xl overflow-y-auto max-h-[90vh] transition-all">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-5 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-paw-orange/15 text-paw-orange flex items-center justify-center font-bold shrink-0">
                                    <Calendar size={22} />
                                </div>
                                <div>
                                    <h3 className="font-fredoka text-xl sm:text-2xl font-bold text-[#0B2340] dark:text-white">
                                        {editingEvent ? 'Edit Community Event' : 'Create Community Event'}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-semibold mt-0.5">
                                        Configure schedule, attendee capacity, location, and event outline.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEventModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Admin Approval Notice Banner */}
                        {!isSuperAdmin && !editingEvent && (
                            <div className="flex items-start gap-3 p-3.5 mt-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 rounded-2xl text-amber-800 dark:text-amber-200 text-xs">
                                <ShieldCheck size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                                <div>
                                    <p className="font-bold">Approval Workflow Active</p>
                                    <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                                        Your event will be submitted for Super Admin review and will be published to public schedules once approved.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleEventSubmit} className="space-y-5 mt-5">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Event Title *
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="E.g., Tibanga Rescue Outreach & Vaccination"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    className="w-full p-3.5 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white transition"
                                />
                            </div>

                            {/* Category & Spots Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Category *
                                    </label>
                                    <select
                                        required
                                        value={eventCategory}
                                        onChange={(e) => setEventCategory(e.target.value)}
                                        className="w-full p-3.5 bg-gray-50 dark:bg-slate-850 rounded-2xl border dark:border-gray-800 text-sm font-semibold dark:text-white outline-none focus:border-paw-orange transition"
                                    >
                                        <option value="Feeding">Feeding Program</option>
                                        <option value="Medical">Medical & Vaccination</option>
                                        <option value="Social">Social & Seminar</option>
                                        <option value="Adoption">Adoption Drive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Capacity / Spots Limit *
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="-1 for unlimited spots"
                                        value={eventSpots}
                                        onChange={(e) => setEventSpots(e.target.value)}
                                        className="w-full p-3.5 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white transition"
                                    />
                                    <span className="text-[11px] text-gray-400 font-semibold block mt-1">
                                        Use <strong className="text-gray-500">-1</strong> for unlimited participant registrations.
                                    </span>
                                </div>
                            </div>

                            {/* Schedule Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <ModernDatePicker
                                        label="Event Date"
                                        required
                                        value={eventDate}
                                        onChange={(date) => setEventDate(date)}
                                        placeholder="Select date..."
                                    />
                                </div>
                                <div>
                                    <ModernTimePicker
                                        label="Event Time"
                                        required
                                        value={eventTime}
                                        onChange={(time) => setEventTime(time)}
                                        placeholder="Select time..."
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Location / Venue *
                                </label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="E.g., Anahaw Amphitheatre, City Hall Grounds, Iligan City"
                                        value={eventLocation}
                                        onChange={(e) => setEventLocation(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white transition"
                                    />
                                </div>
                            </div>

                            {/* Banner Image URL with Live Preview */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Banner Image URL
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                    <div className="sm:col-span-2 relative">
                                        <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="url"
                                            placeholder="Optional image URL (leave empty for default banner)"
                                            value={eventImg}
                                            onChange={(e) => setEventImg(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white transition"
                                        />
                                    </div>
                                    <div className="sm:col-span-1 h-14 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden">
                                        {eventImg ? (
                                            <img
                                                src={eventImg}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                                                <Eye size={14} /> Default Banner
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Event Description & Agenda *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Outline the event objectives, stray targets, volunteer briefing instructions, and what participants should bring..."
                                    value={eventDesc}
                                    onChange={(e) => setEventDesc(e.target.value)}
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-850 rounded-2xl outline-none focus:border-paw-orange border border-transparent font-semibold text-sm dark:text-white transition leading-relaxed"
                                />
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsEventModalOpen(false)}
                                    disabled={isSubmittingEvent}
                                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold uppercase transition cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingEvent}
                                    className="px-6 py-2.5 bg-paw-orange hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingEvent 
                                        ? 'Saving...' 
                                        : editingEvent ? 'Save Changes' : (isSuperAdmin ? 'Publish Event' : 'Submit for Approval')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Feeding Route Modal */}
            {isFeedingModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isSubmittingFeeding) {
                            setIsFeedingModalOpen(false);
                        }
                    }}
                >
                    <div className="bg-white dark:bg-slate-900 max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-2xl">
                        <div className="flex items-center justify-between pb-5 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                    {editingSchedule ? 'Edit Feeding Route' : 'Create Feeding Route'}
                                </h3>
                                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                                    Configure schedule frequency, target zone, and volunteer quotas.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsFeedingModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFeedingSubmit} className="space-y-4 mt-5">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Zone / Area *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="E.g., Zone 1: Saray Proper"
                                    value={feedingZone}
                                    onChange={(e) => setFeedingZone(e.target.value)}
                                    className="w-full p-3.5 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white transition"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Day / Days *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="E.g., Mon & Thurs"
                                        value={feedingDay}
                                        onChange={(e) => setFeedingDay(e.target.value)}
                                        className="w-full p-3.5 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white transition"
                                    />
                                </div>
                                <div>
                                    <ModernTimePicker
                                        label="Time"
                                        required
                                        value={feedingTime}
                                        onChange={(time) => setFeedingTime(time)}
                                        placeholder="Select feeding time..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Volunteers Needed *</label>
                                    <input
                                        required
                                        type="number"
                                        value={feedingVolunteers}
                                        onChange={(e) => setFeedingVolunteers(e.target.value)}
                                        className="w-full p-3.5 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Stray Count *</label>
                                    <input
                                        required
                                        type="number"
                                        value={feedingStrays}
                                        onChange={(e) => setFeedingStrays(e.target.value)}
                                        className="w-full p-3.5 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white transition"
                                    />
                                </div>
                            </div>

                            {editingSchedule && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Status *</label>
                                    <select
                                        value={feedingStatus}
                                        onChange={(e) => setFeedingStatus(e.target.value)}
                                        className="w-full p-3.5 bg-gray-50 dark:bg-slate-850 rounded-2xl border dark:border-gray-800 text-sm font-semibold dark:text-white outline-none focus:border-paw-orange transition"
                                    >
                                        <option value="active">Active</option>
                                        <option value="closed">Closed / Inactive</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsFeedingModalOpen(false)}
                                    disabled={isSubmittingFeeding}
                                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold uppercase transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingFeeding}
                                    className="px-6 py-2.5 bg-paw-orange hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                                >
                                    {isSubmittingFeeding ? 'Saving...' : editingSchedule ? 'Save Changes' : 'Create Route'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Super Admin Rejection Reason Modal */}
            {rejectingEvent && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setRejectingEvent(null);
                        }
                    }}
                >
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-gray-100 dark:border-gray-800 shadow-2xl relative">
                        <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/50">
                                <XCircle size={24} />
                            </div>
                            <div className="flex-1 pr-6">
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                    Reject Event Proposal
                                </h3>
                                <p className="text-xs text-gray-400 font-semibold mt-1">
                                    "{rejectingEvent.title}"
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleConfirmReject} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Reason for Rejection (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Provide feedback for the proposing admin (e.g. date conflict, budget constraints)..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full p-3.5 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-transparent focus:border-rose-500 outline-none text-xs font-semibold dark:text-white leading-relaxed"
                                />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setRejectingEvent(null)}
                                    className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/25 transition cursor-pointer"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Attendees Roster Modal */}
            {viewingAttendeesEvent && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setViewingAttendeesEvent(null);
                        }
                    }}
                >
                    <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center pb-4 border-b dark:border-gray-800">
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                    Attendees Roster
                                </h3>
                                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                                    {viewingAttendeesEvent.title} • {viewingAttendeesEvent.attendees.length} Total
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewingAttendeesEvent(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 space-y-3">
                            {viewingAttendeesEvent.attendees.length === 0 ? (
                                <p className="text-center text-gray-400 font-bold py-12 text-sm">
                                    No attendees registered yet for this activity.
                                </p>
                            ) : (
                                viewingAttendeesEvent.attendees.map((att: any) => {
                                    const isGuest = !att.user_id || Boolean(att.guest_email);
                                    const isParticipant = att.role?.toLowerCase() === 'participant';
                                    const displayName = att.guest_name || att.user?.name || 'Unknown Attendee';
                                    const displayEmail = att.guest_email || att.user?.email || 'No email provided';
                                    const isCompleted = att.status === 'completed';

                                    return (
                                        <div
                                            key={att.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-gray-800 gap-3"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                                    isGuest
                                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                                        : isParticipant
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                                        : 'bg-paw-orange/15 text-paw-orange'
                                                }`}>
                                                    {displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-[#0B2340] dark:text-white truncate">
                                                            {displayName}
                                                        </p>
                                                        <span
                                                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${
                                                                isGuest
                                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
                                                                    : isParticipant
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200'
                                                            }`}
                                                        >
                                                            {isGuest ? 'Public Guest' : att.role}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 truncate mt-0.5">
                                                        {displayEmail}
                                                        {att.guest_phone && ` • ${att.guest_phone}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                                                {isCompleted ? (
                                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-200/50">
                                                        <CheckCircle2 size={13} />
                                                        Completed • Cert Issued
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCompleteAttendee(att.id)}
                                                        disabled={completingTaskId === att.id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paw-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer"
                                                    >
                                                        <Award size={13} />
                                                        {completingTaskId === att.id ? 'Issuing...' : 'Complete & Issue Cert'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="pt-3 border-t dark:border-gray-800 flex items-center justify-between gap-3">
                            <div className="text-xs font-bold text-gray-400">
                                {viewingAttendeesEvent.attendees.filter((a: any) => a.status !== 'completed').length > 0 ? (
                                    <span className="text-amber-600 dark:text-amber-400">
                                        {viewingAttendeesEvent.attendees.filter((a: any) => a.status !== 'completed').length} pending completion
                                    </span>
                                ) : (
                                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 size={14} /> All attendees completed
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setViewingAttendeesEvent(null)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition"
                                >
                                    Close
                                </button>
                                {viewingAttendeesEvent.isEvent &&
                                    viewingAttendeesEvent.attendees.filter((a: any) => a.status !== 'completed').length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleCompleteAll}
                                            disabled={isIssuingAll}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition disabled:opacity-50"
                                        >
                                            <Award size={14} />
                                            {isIssuingAll ? 'Issuing All...' : 'Complete & Issue All'}
                                        </button>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reusable Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                description={confirmModal.description}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                variant={confirmModal.variant}
                isLoading={confirmModal.isLoading}
            />
        </>
    );
}

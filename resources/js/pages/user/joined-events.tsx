import React, { useState } from 'react';
import { Calendar, MapPin, Clock, ExternalLink, Trash2, Heart, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

interface EventTask {
    id: number;
    role: string;
    status: string;
    created_at: string;
    event?: {
        id: number;
        title: string;
        category: string;
        date: string;
        time: string;
        location: string;
        img: string | null;
        desc: string;
        status: string;
    } | null;
}

interface UserJoinedEventsProps {
    tasks: {
        data: EventTask[];
        links: any[];
        total: number;
    };
}

export default function UserJoinedEvents({ tasks }: UserJoinedEventsProps) {
    const joinedTasks = tasks?.data || [];
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const handleLeaveEvent = (eventId: number) => {
        if (!confirm('Are you sure you want to cancel your attendance for this event? Your reserved spot will be released.')) {
            return;
        }

        setCancellingId(eventId);
        router.post(
            `/events/${eventId}/leave`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setCancellingId(null),
            }
        );
    };

    return (
        <DashboardSectionPage
            title="My Joined Events"
            description="Manage and review the community events, workshops, and outreach programs you are participating in."
            badge={
                <DashboardMetricBadge
                    icon={<Calendar className="h-4 w-4" />}
                    label={`${tasks?.total || 0} Registered`}
                />
            }
        >
            {joinedTasks.length === 0 ? (
                <DashboardCard className="p-12 text-center text-gray-500 font-bold">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-paw-orange/10 text-paw-orange">
                        <Calendar size={32} />
                    </div>
                    <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white mb-2">
                        No Joined Events Yet
                    </h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                        You haven't registered for any upcoming events yet. Discover adoption drives, free spay/neuter drives, and social meetups happening near you!
                    </p>
                    <Link
                        href="/events"
                        className="inline-flex items-center gap-2 rounded-xl bg-paw-orange px-6 py-3 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:bg-orange-600 cursor-pointer"
                    >
                        <Sparkles size={16} /> Browse Upcoming Events
                    </Link>
                </DashboardCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {joinedTasks.map((task) => {
                        const event = task.event;
                        if (!event) return null;

                        const isParticipant = task.role?.toLowerCase() === 'participant';

                        return (
                            <DashboardCard key={task.id} className="overflow-hidden p-0 flex flex-col justify-between">
                                <div>
                                    {/* Event Card Header Image */}
                                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        <ImageWithFallback
                                            src={event.img || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800'}
                                            alt={event.title}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span className="rounded-xl border border-white/30 bg-white/95 dark:bg-slate-900/90 px-3 py-1 text-[10px] font-black uppercase text-paw-orange shadow backdrop-blur-md">
                                                {event.category}
                                            </span>
                                        </div>

                                        <div className="absolute top-3 right-3">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-black uppercase shadow backdrop-blur-md ${
                                                    isParticipant
                                                        ? 'bg-emerald-500/95 text-white'
                                                        : 'bg-paw-orange/95 text-white'
                                                }`}
                                            >
                                                <CheckCircle2 size={12} />
                                                {isParticipant ? 'Participant' : `Volunteer: ${task.role}`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Event Body */}
                                    <div className="p-5">
                                        <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white line-clamp-1 mb-2">
                                            {event.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                            {event.desc}
                                        </p>

                                        <div className="space-y-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-paw-orange shrink-0" />
                                                <span>{event.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-paw-orange shrink-0" />
                                                <span>{event.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-paw-green shrink-0" />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/40 flex items-center justify-between gap-3">
                                    <Link
                                        href={`/events?event=${event.id}`}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-paw-navy dark:text-white hover:text-paw-orange transition-colors"
                                    >
                                        Event Details <ExternalLink size={12} />
                                    </Link>

                                    <button
                                        type="button"
                                        disabled={cancellingId === event.id}
                                        onClick={() => handleLeaveEvent(event.id)}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60"
                                    >
                                        <Trash2 size={13} />
                                        {cancellingId === event.id ? 'Cancelling...' : 'Cancel Attendance'}
                                    </button>
                                </div>
                            </DashboardCard>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {tasks.links && tasks.links.length > 3 && (
                <div className="mt-8 flex justify-center gap-1">
                    {tasks.links.map((link, idx) => {
                        if (link.url === null) {
                            return (
                                <span
                                    key={idx}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className="rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-400 dark:border-gray-800"
                                />
                            );
                        }
                        return (
                            <Link
                                key={idx}
                                href={link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                                    link.active
                                        ? 'bg-paw-orange font-black text-white shadow-md'
                                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300'
                                }`}
                            />
                        );
                    })}
                </div>
            )}
        </DashboardSectionPage>
    );
}

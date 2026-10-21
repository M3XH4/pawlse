import { ClipboardList, Calendar, MapPin, Clock, Utensils, Trash2, Heart } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

interface TaskModel {
    id: number;
    role: string;
    status: string;
    event?: {
        id: number;
        title: string;
        date: string;
        time: string;
        location: string;
    } | null;
    feeding_schedule?: {
        id: number;
        zone: string;
        day: string;
        time: string;
    } | null;
    pet_report?: {
        id: number;
        type?: string | null;
        name?: string | null;
        animal_type?: string | null;
        situation_type?: string | null;
        pet_name?: string | null;
        species?: string | null;
        landmark?: string | null;
        location?: string | null;
        created_at?: string | null;
    } | null;
    petReport?: {
        id: number;
        type?: string | null;
        name?: string | null;
        animal_type?: string | null;
        situation_type?: string | null;
        pet_name?: string | null;
        species?: string | null;
        landmark?: string | null;
        location?: string | null;
        created_at?: string | null;
    } | null;
}

interface AssignedTasksProps {
    tasks: {
        data: TaskModel[];
        links: any[];
        total: number;
    };
}

export default function VolunteerAssignedTasks({ tasks }: AssignedTasksProps) {
    const activeTasks = tasks?.data || [];

    const handleCancelTask = (taskId: number) => {
        if (!confirm('Are you sure you want to cancel this task assignment?')) {
            return;
        }

        router.delete(`/account/volunteer/assigned-tasks/${taskId}`, {
            preserveScroll: true,
        });
    };

    return (
        <DashboardSectionPage
            title="Assigned Tasks"
            description="View and manage your active rescue assignments, feeding routes, and outreach tasks."
            badge={<DashboardMetricBadge icon={<ClipboardList className="h-4 w-4" />} label={`${tasks?.total || 0} Tasks`} />}
        >
            {activeTasks.length === 0 ? (
                <DashboardCard className="p-8 text-center text-gray-500 font-bold">
                    <ClipboardList className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-sm">You have no active volunteer task assignments at the moment.</p>
                    <p className="text-xs text-gray-400 mt-1">Visit the Events page to find opportunities and join routes!</p>
                </DashboardCard>
            ) : (
                <div className="flex flex-col gap-4">
                    {activeTasks.map((task) => {
                        const rescueReport = task.pet_report || task.petReport;
                        return (
                            <DashboardCard key={task.id} className="p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paw-orange/15 text-paw-orange mt-0.5">
                                            {task.event ? (
                                                <Calendar size={24} />
                                            ) : rescueReport ? (
                                                <Heart size={24} className="text-rose-500" />
                                            ) : (
                                                <Utensils size={24} />
                                            )}
                                        </span>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                                    {task.event
                                                        ? task.event.title
                                                        : rescueReport
                                                            ? rescueReport.type === 'sos'
                                                                ? `SOS Emergency: ${rescueReport.animal_type || 'Animal'}${rescueReport.situation_type ? ` (${rescueReport.situation_type})` : ''}`
                                                                : rescueReport.type === 'missing'
                                                                    ? `Missing Pet: ${rescueReport.name || rescueReport.pet_name || rescueReport.animal_type || `Case #${rescueReport.id}`}`
                                                                    : `Rescue: ${rescueReport.name || rescueReport.pet_name || rescueReport.animal_type || rescueReport.species || `Case #${rescueReport.id}`}`
                                                            : (task.feeding_schedule?.zone || 'Assigned Task')}
                                                </h3>
                                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                                                    task.event
                                                        ? 'bg-paw-orange/10 text-paw-orange'
                                                        : rescueReport
                                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                }`}>
                                                    {task.event
                                                        ? 'Event'
                                                        : rescueReport
                                                            ? rescueReport.type === 'sos'
                                                                ? 'SOS Alert'
                                                                : rescueReport.type === 'missing'
                                                                    ? 'Missing Search'
                                                                    : 'Emergency Rescue'
                                                            : 'Feeding Route'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-400 mb-3">Role: <span className="text-[#0B2340] dark:text-white">{task.role}</span></p>
                                            
                                            <div className="flex gap-4 flex-wrap text-xs text-gray-500 font-bold">
                                                {rescueReport ? (
                                                    <>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            <span>{rescueReport.created_at ? new Date(rescueReport.created_at).toLocaleDateString() : 'Active Alert'}</span>
                                                        </div>
                                                        {(rescueReport.landmark || rescueReport.location) && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin size={14} />
                                                                <span>{rescueReport.landmark || rescueReport.location}</span>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            <span>{task.event ? task.event.date : task.feeding_schedule?.day}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            <span>{task.event ? task.event.time : task.feeding_schedule?.time}</span>
                                                        </div>
                                                        {task.event && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin size={14} />
                                                                <span>{task.event.location}</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-center">
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 text-xs font-black uppercase px-3 py-1 rounded-full">
                                        {task.status}
                                    </span>
                                    {task.status === 'pending' && (
                                        <button
                                            type="button"
                                            onClick={() => handleCancelTask(task.id)}
                                            className="flex cursor-pointer items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60"
                                            title="Cancel this assignment"
                                        >
                                            <Trash2 size={12} />
                                            <span>Leave</span>
                                        </button>
                                    )}
                                    </div>
                                </div>
                            </DashboardCard>
                        );
                    })}

                    {/* Pagination */}
                    {tasks.links && tasks.links.length > 3 && (
                        <div className="flex justify-center gap-1 mt-6">
                            {tasks.links.map((link, idx) => {
                                if (link.url === null) return (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold" dangerouslySetInnerHTML={{ __html: link.label }} />
                                );
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                            link.active ? 'bg-paw-orange text-white' : 'bg-white text-paw-navy hover:bg-paw-orange/10 border'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </DashboardSectionPage>
    );
}

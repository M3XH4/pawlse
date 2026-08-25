import { ClipboardList, Calendar, MapPin, Clock, Utensils } from 'lucide-react';
import { Link } from '@inertiajs/react';
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

    return (
        <DashboardSectionPage
            title="Assigned Tasks"
            description="See your active volunteer assignments"
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
                    {activeTasks.map((task) => (
                        <DashboardCard key={task.id} className="p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-4">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paw-orange/15 text-paw-orange mt-0.5">
                                        {task.event ? <Calendar size={24} /> : <Utensils size={24} />}
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                                {task.event ? task.event.title : task.feeding_schedule?.zone}
                                            </h3>
                                            <span className="bg-paw-orange/10 text-paw-orange text-[10px] uppercase font-black px-2 py-0.5 rounded">
                                                {task.event ? 'Event' : 'Feeding Route'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-400 mb-3">Role: <span className="text-[#0B2340] dark:text-white">{task.role}</span></p>
                                        
                                        <div className="flex gap-4 flex-wrap text-xs text-gray-500 font-bold">
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
                                        </div>
                                    </div>
                                </div>
                                <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 text-xs font-black uppercase px-3 py-1 rounded-full self-start sm:self-center">
                                    {task.status}
                                </span>
                            </div>
                        </DashboardCard>
                    ))}

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

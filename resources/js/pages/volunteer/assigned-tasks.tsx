import { useState } from 'react';
import { ClipboardList, Calendar, MapPin, Clock, Utensils, Trash2, Heart, PackageCheck, Store, CheckCircle2, Map as MapIcon } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { VolunteerMapModal } from '@/components/volunteer/volunteer-map-modal';

interface PartnerFoodPickupModel {
    id: number;
    pickup_date: string;
    status: 'pending' | 'assigned' | 'fetched' | 'completed' | 'missed';
    food_summary?: string | null;
    volunteer_notes?: string | null;
    fetched_at?: string | null;
    partner?: {
        id: number;
        name: string;
        address?: string | null;
        operating_hours?: string | null;
        daily_food_notes?: string | null;
    } | null;
}

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
    partner_food_pickup?: PartnerFoodPickupModel | null;
    partnerFoodPickup?: PartnerFoodPickupModel | null;
}

interface AssignedTasksProps {
    tasks: {
        data: TaskModel[];
        links: any[];
        total: number;
    };
    volunteerMapEnabled?: boolean;
}

export default function VolunteerAssignedTasks({ tasks, volunteerMapEnabled = true }: AssignedTasksProps) {
    const activeTasks = tasks?.data || [];
    const [confirmingTask, setConfirmingTask] = useState<TaskModel | null>(null);
    const [volunteerNotes, setVolunteerNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    const handleCancelTask = (taskId: number) => {
        if (!confirm('Are you sure you want to cancel this task assignment?')) {
            return;
        }

        router.delete(`/account/volunteer/assigned-tasks/${taskId}`, {
            preserveScroll: true,
        });
    };

    const handleConfirmFetched = (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirmingTask) return;

        setIsSubmitting(true);
        router.post(
            `/account/volunteer/assigned-tasks/${confirmingTask.id}/confirm-fetched`,
            { volunteer_notes: volunteerNotes || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmingTask(null);
                    setVolunteerNotes('');
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <DashboardSectionPage
            title="Assigned Tasks"
            description="View and manage your active rescue assignments, feeding routes, and outreach tasks."
            badge={
                <div className="flex flex-wrap items-center gap-2">
                    {volunteerMapEnabled && (
                        <button
                            type="button"
                            onClick={() => setIsMapOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-paw-orange px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-paw-orange/90 cursor-pointer"
                        >
                            <MapIcon className="h-3.5 w-3.5" />
                            Open Operations Map
                        </button>
                    )}
                    <DashboardMetricBadge icon={<ClipboardList className="h-4 w-4" />} label={`${tasks?.total || 0} Tasks`} />
                </div>
            }
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
                        const foodPickup = task.partner_food_pickup || task.partnerFoodPickup;
                        const isFetched = foodPickup?.status === 'fetched';

                        return (
                            <DashboardCard key={task.id} className="p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paw-orange/15 text-paw-orange mt-0.5">
                                            {task.event ? (
                                                <Calendar size={24} />
                                            ) : rescueReport ? (
                                                <Heart size={24} className="text-rose-500" />
                                            ) : foodPickup ? (
                                                <Store size={24} className="text-emerald-600" />
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
                                                            : foodPickup
                                                                ? `Daily Food Pickup: ${foodPickup.partner?.name || 'Food Partner'}`
                                                                : (task.feeding_schedule?.zone || 'Assigned Task')}
                                                </h3>
                                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                                                    task.event
                                                        ? 'bg-paw-orange/10 text-paw-orange'
                                                        : rescueReport
                                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                            : foodPickup
                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
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
                                                            : foodPickup
                                                                ? 'Daily Food Pickup'
                                                                : 'Feeding Route'}
                                                </span>
                                                {foodPickup && (
                                                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                                        1-Day Shelf Life — Fetch Same Day
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold text-gray-400 mb-3">Role: <span className="text-[#0B2340] dark:text-white">{task.role}</span></p>
                                            {foodPickup?.food_summary && (
                                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                                                    {foodPickup.food_summary}
                                                </p>
                                            )}
                                            
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
                                                ) : foodPickup ? (
                                                    <>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            <span>{foodPickup.pickup_date}</span>
                                                        </div>
                                                        {foodPickup.partner?.operating_hours && (
                                                            <div className="flex items-center gap-1">
                                                                <Clock size={14} />
                                                                <span>{foodPickup.partner.operating_hours}</span>
                                                            </div>
                                                        )}
                                                        {foodPickup.partner?.address && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin size={14} />
                                                                <span>{foodPickup.partner.address}</span>
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
                                    <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                                        {foodPickup ? (
                                            isFetched ? (
                                                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-black uppercase px-3 py-1.5 rounded-full">
                                                    <CheckCircle2 size={14} />
                                                    Fetched — Awaiting Admin Verification
                                                </span>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setConfirmingTask(task);
                                                            setVolunteerNotes('');
                                                        }}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-emerald-700"
                                                    >
                                                        <PackageCheck size={14} />
                                                        Confirm Fetched
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelTask(task.id)}
                                                        className="flex cursor-pointer items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60"
                                                        title="Cancel this assignment"
                                                    >
                                                        <Trash2 size={12} />
                                                        <span>Leave</span>
                                                    </button>
                                                </>
                                            )
                                        ) : (
                                            <>
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
                                            </>
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

            {/* Confirm Food Pickup Fetched Modal */}
            {confirmingTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <h3 className="font-fredoka text-xl font-bold mb-2 text-[#0B2340] dark:text-white flex items-center gap-2">
                            <PackageCheck className="text-emerald-600" /> Confirm Food Fetched
                        </h3>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                            Confirm that you have picked up today's food batch from{' '}
                            <span className="font-bold text-[#0B2340] dark:text-white">
                                {(confirmingTask.partner_food_pickup || confirmingTask.partnerFoodPickup)?.partner?.name || 'the partner'}
                            </span>{' '}
                            and are delivering it to the shelter.
                        </p>
                        <form onSubmit={handleConfirmFetched} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Pickup Notes (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="e.g., Picked up 2 containers of prepared food at 11:30 AM..."
                                    value={volunteerNotes}
                                    onChange={(e) => setVolunteerNotes(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-emerald-500 outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmingTask(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Confirming...' : 'Yes, Confirm Fetched'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {volunteerMapEnabled && (
                <VolunteerMapModal
                    open={isMapOpen}
                    onClose={() => setIsMapOpen(false)}
                />
            )}
        </DashboardSectionPage>
    );
}

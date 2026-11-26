import { Link, router, usePage } from '@inertiajs/react';
import { ClipboardList, Calendar, MapPin, Clock, Utensils, Trash2, Heart, PackageCheck, Store, CheckCircle2, Map as MapIcon, Users, Play, Flag, ClipboardCheck, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { CompleteGroupModal } from '@/components/volunteer/complete-group-modal';
import type { AttendeeSubmission } from '@/components/volunteer/complete-group-modal';
import { GroupChatDrawer } from '@/components/volunteer/group-chat-drawer';
import { TeamAvatarStack } from '@/components/volunteer/team-avatar-stack';
import { VolunteerFilterBar } from '@/components/volunteer/volunteer-filter-bar';
import { VolunteerMapModal } from '@/components/volunteer/volunteer-map-modal';
import { useConfirmationModal } from '@/hooks/use-confirmation-modal';
import { formatPhotoUrl } from '@/lib/utils';
import type { SharedData } from '@/types';

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

interface FeedingRosterMember {
    id: number;
    user_id?: number;
    role: string;
    status: string;
    user?: {
        id: number;
        name: string;
        avatar_path?: string | null;
    } | null;
}

interface FeedingDistributionLogModel {
    id: number;
    street_or_stop: string;
    food_type: string;
    food_packs_distributed: number;
    strays_fed: number;
    notes?: string | null;
    recorded_at: string;
    recorded_by?: { id: number; name: string } | null;
}

interface FeedingScheduleModel {
    id: number;
    zone: string;
    day: string;
    time: string;
    volunteers: number;
    strays: number;
    execution_status?: 'scheduled' | 'in_progress' | 'completed';
    total_food_distributed?: number;
    started_at?: string | null;
    completed_at?: string | null;
    started_by?: { id: number; name: string } | null;
    completed_by?: { id: number; name: string } | null;
    assigned_tasks?: FeedingRosterMember[];
    assignedTasks?: FeedingRosterMember[];
    distribution_logs?: FeedingDistributionLogModel[];
    distributionLogs?: FeedingDistributionLogModel[];
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
        assigned_tasks?: FeedingRosterMember[];
        assignedTasks?: FeedingRosterMember[];
    } | null;
    feeding_schedule?: FeedingScheduleModel | null;
    feedingSchedule?: FeedingScheduleModel | null;
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
    filters?: {
        search?: string;
        type?: string;
        sort?: string;
    };
    volunteerMapEnabled?: boolean;
    foodTypes?: string[];
}

export default function VolunteerAssignedTasks({ tasks, filters, volunteerMapEnabled = true, foodTypes = ['Dry Kibble', 'Wet Food', 'Cooked Meal', 'Water & Treats', 'Mixed Packs'] }: AssignedTasksProps) {
    const { auth } = usePage<SharedData>().props;
    const currentUserId = auth.user?.id;
    const { confirmModalProps, openConfirmModal } = useConfirmationModal();
    const activeTasks = tasks?.data || [];
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [typeFilter, setTypeFilter] = useState(filters?.type || '');
    const [sortOrder, setSortOrder] = useState(filters?.sort || 'latest');

    const applyFilters = (next: Partial<{ search: string; type: string; sort: string }>) => {
        const params = {
            search: next.search ?? searchQuery,
            type: next.type ?? typeFilter,
            sort: next.sort ?? sortOrder,
        };

        router.get(
            '/account/volunteer/assigned-tasks',
            {
                ...(params.search.trim() ? { search: params.search.trim() } : {}),
                ...(params.type ? { type: params.type } : {}),
                ...(params.sort && params.sort !== 'latest' ? { sort: params.sort } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setTypeFilter('');
        setSortOrder('latest');
        router.get('/account/volunteer/assigned-tasks', {}, { preserveState: true, preserveScroll: true });
    };

    const hasActiveFilters = Boolean(
        filters?.search ||
        filters?.type ||
        (filters?.sort && filters.sort !== 'latest'),
    );
    const [confirmingTask, setConfirmingTask] = useState<TaskModel | null>(null);
    const [volunteerNotes, setVolunteerNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Food distribution recording modal state
    const [recordingSchedule, setRecordingSchedule] = useState<FeedingScheduleModel | null>(null);
    const [streetOrStop, setStreetOrStop] = useState('');
    const [foodType, setFoodType] = useState(foodTypes[0] || 'Dry Kibble');
    const [foodPacks, setFoodPacks] = useState('5');
    const [straysFed, setStraysFed] = useState('5');
    const [distributionNotes, setDistributionNotes] = useState('');
    const [isSubmittingDistribution, setIsSubmittingDistribution] = useState(false);

    // Team roster & chat side drawer state
    const [teamDrawer, setTeamDrawer] = useState<{
        type: 'feeding' | 'event';
        id: number;
        title: string;
        subtitle: string;
        members: FeedingRosterMember[];
        initialTab: 'chat' | 'roster';
    } | null>(null);

    // Complete group attendance modal state
    const [completingGroup, setCompletingGroup] = useState<{
        type: 'feeding' | 'event';
        id: number;
        title: string;
        subtitle: string;
        members: FeedingRosterMember[];
    } | null>(null);
    const [isCompletingGroup, setIsCompletingGroup] = useState(false);

    const handleCancelTask = (taskId: number) => {
        openConfirmModal({
            title: 'Cancel Task Assignment',
            description: 'Are you sure you want to cancel this task assignment?',
            confirmText: 'Cancel Assignment',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/account/volunteer/assigned-tasks/${taskId}`, {
                    preserveScroll: true,
                });
            },
        });
    };

    const handleConfirmFetched = (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirmingTask) {
return;
}

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

    const handleStartFeedingRoute = (scheduleId: number) => {
        router.post(`/account/volunteer/feeding-schedules/${scheduleId}/start`, {}, { preserveScroll: true });
    };

    const handleCompleteFeedingRoute = (schedule: FeedingScheduleModel, isLead: boolean, roster: FeedingRosterMember[]) => {
        if (isLead && roster.length > 0) {
            setCompletingGroup({
                type: 'feeding',
                id: schedule.id,
                title: schedule.zone,
                subtitle: `${schedule.day} • ${schedule.time}`,
                members: roster,
            });
            return;
        }

        openConfirmModal({
            title: 'Complete Feeding Route',
            description: `Mark "${schedule.zone}" as completed for this run and disband the active team?`,
            confirmText: 'Complete Route',
            variant: 'info',
            onConfirm: () => {
                router.post(`/account/volunteer/feeding-schedules/${schedule.id}/complete`, {}, { preserveScroll: true });
            },
        });
    };

    const handleSubmitGroupCompletion = (attendees: AttendeeSubmission[]) => {
        if (!completingGroup) {
            return;
        }
        setIsCompletingGroup(true);
        const url =
            completingGroup.type === 'feeding'
                ? `/account/volunteer/feeding-schedules/${completingGroup.id}/complete`
                : `/account/volunteer/events/${completingGroup.id}/complete`;

        router.post(
            url,
            { attendees },
            {
                preserveScroll: true,
                onSuccess: () => setCompletingGroup(null),
                onFinish: () => setIsCompletingGroup(false),
            }
        );
    };

    const handleRecordDistribution = (e: React.FormEvent) => {
        e.preventDefault();

        if (!recordingSchedule) {
return;
}

        setIsSubmittingDistribution(true);
        router.post(
            `/account/volunteer/feeding-schedules/${recordingSchedule.id}/distributions`,
            {
                street_or_stop: streetOrStop,
                food_type: foodType,
                food_packs_distributed: Number(foodPacks),
                strays_fed: Number(straysFed),
                notes: distributionNotes || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRecordingSchedule(null);
                    setStreetOrStop('');
                    setFoodPacks('5');
                    setStraysFed('5');
                    setDistributionNotes('');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] || 'Failed to record food distribution.');
                },
                onFinish: () => setIsSubmittingDistribution(false),
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
                            className="inline-flex min-h-9 sm:min-h-10 items-center gap-1.5 rounded-full bg-paw-orange px-3.5 sm:px-4 py-1 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:bg-paw-orange/90 cursor-pointer whitespace-nowrap shrink-0"
                        >
                            <MapIcon className="h-4 w-4 shrink-0" />
                            <span>Open Operations Map</span>
                        </button>
                    )}
                    <DashboardMetricBadge icon={<ClipboardList className="h-4 w-4" />} label={`${tasks?.total || 0} Tasks`} />
                </div>
            }
        >
            <VolunteerFilterBar
                search={searchQuery}
                searchPlaceholder="Search by task, location, or role..."
                onSearchChange={setSearchQuery}
                onSearchSubmit={() => applyFilters({})}
                selects={[
                    {
                        value: typeFilter,
                        onChange: (val) => {
                            setTypeFilter(val);
                            applyFilters({ type: val });
                        },
                        ariaLabel: 'Filter by task type',
                        defaultLabel: 'All Types',
                        options: [
                            { value: 'event', label: 'Events' },
                            { value: 'feeding', label: 'Feeding Routes' },
                            { value: 'rescue', label: 'Rescue Cases' },
                            { value: 'food_pickup', label: 'Food Pickups' },
                        ],
                    },
                ]}
                sort={sortOrder}
                onSortChange={(val) => {
                    setSortOrder(val);
                    applyFilters({ sort: val });
                }}
                hasActiveFilters={hasActiveFilters || Boolean(searchQuery.trim() || typeFilter || sortOrder === 'oldest')}
                onReset={handleResetFilters}
            />

            {activeTasks.length === 0 ? (
                <DashboardCard className="p-8 text-center text-gray-500 font-bold">
                    <ClipboardList className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-sm">
                        {hasActiveFilters
                            ? 'No assigned tasks matched your filters.'
                            : 'You have no active volunteer task assignments at the moment.'}
                    </p>
                    {hasActiveFilters ? (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-paw-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    ) : (
                        <p className="text-xs text-gray-400 mt-1">Visit the Events page to find opportunities and join routes!</p>
                    )}
                </DashboardCard>
            ) : (
                <div className="flex flex-col gap-4">
                    {activeTasks.map((task) => {
                        const rescueReport = task.pet_report || task.petReport;
                        const foodPickup = task.partner_food_pickup || task.partnerFoodPickup;
                        const feedingSchedule = task.feeding_schedule || task.feedingSchedule;
                        const feedingRoster = feedingSchedule?.assigned_tasks || feedingSchedule?.assignedTasks || [];
                        const eventRoster = task.event?.assigned_tasks || task.event?.assignedTasks || [];
                        const distributionLogs = feedingSchedule?.distribution_logs || feedingSchedule?.distributionLogs || [];
                        const executionStatus = feedingSchedule?.execution_status || 'scheduled';
                        const isRecorder =
                            task.role.toLowerCase().includes('recorder') ||
                            task.role.toLowerCase().includes('route lead');
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
                                                {feedingSchedule && (
                                                    <span
                                                        className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${
                                                            executionStatus === 'in_progress'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                                : executionStatus === 'completed'
                                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        {executionStatus === 'in_progress'
                                                            ? 'In Progress'
                                                            : executionStatus === 'completed'
                                                                ? 'Completed'
                                                                : 'Scheduled'}
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
                                    <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2 self-start sm:self-center flex-wrap border-t border-gray-100/80 pt-3 sm:border-t-0 sm:pt-0 dark:border-gray-800/60">
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
                                                        className="flex cursor-pointer items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60"
                                                        title="Cancel this assignment"
                                                    >
                                                        <Trash2 size={12} />
                                                        <span>Leave</span>
                                                    </button>
                                                </>
                                            )
                                        ) : (
                                            <>
                                                {feedingSchedule && executionStatus === 'scheduled' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStartFeedingRoute(feedingSchedule.id)}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-emerald-700"
                                                    >
                                                        <Play size={13} />
                                                        Start Route
                                                    </button>
                                                )}
                                                {feedingSchedule && executionStatus === 'in_progress' && isRecorder && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setRecordingSchedule(feedingSchedule)}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-paw-orange px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-orange-600"
                                                    >
                                                        <ClipboardCheck size={13} />
                                                        Record Food
                                                    </button>
                                                )}
                                                {feedingSchedule && executionStatus === 'in_progress' && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCompleteFeedingRoute(
                                                                feedingSchedule,
                                                                task.role.toLowerCase().includes('lead'),
                                                                feedingRoster
                                                            )
                                                        }
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-blue-700"
                                                    >
                                                        <Flag size={13} />
                                                        Complete Route
                                                    </button>
                                                )}
                                                {task.event && task.role.toLowerCase().includes('lead') && eventRoster.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setCompletingGroup({
                                                                type: 'event',
                                                                id: task.event!.id,
                                                                title: task.event!.title,
                                                                subtitle: `${task.event!.date ? new Date(task.event!.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''} • ${task.event!.time}`,
                                                                members: eventRoster,
                                                            })
                                                        }
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-blue-700"
                                                    >
                                                        <Flag size={13} />
                                                        Complete Event
                                                    </button>
                                                )}
                                                <span className="inline-flex items-center bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 text-xs font-black uppercase px-3 py-1.5 rounded-full whitespace-nowrap">
                                                    {task.status}
                                                </span>
                                                {task.status === 'pending' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelTask(task.id)}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60 whitespace-nowrap"
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

                                {/* Feeding Route Team Roster & Street Food Distribution Summary */}
                                {feedingSchedule && (
                                    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800 space-y-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-[#0B2340] dark:text-white">
                                                <Users size={14} className="text-paw-blue" />
                                                <span>
                                                    Joined Volunteers: {feedingRoster.length} / {feedingSchedule.volunteers || '∞'}
                                                </span>
                                            </div>
                                            <div className="text-xs font-bold text-paw-orange">
                                                Total Food Distributed: {feedingSchedule.total_food_distributed ?? 0} packs
                                            </div>
                                        </div>

                                        {feedingRoster.length > 0 && (
                                            <div className="flex items-center justify-between gap-3">
                                                <TeamAvatarStack
                                                    members={feedingRoster.map((m) => ({
                                                        id: m.id,
                                                        name: m.user?.name || 'Volunteer',
                                                        role: m.role,
                                                        avatar_path: m.user?.avatar_path,
                                                    }))}
                                                    maxVisible={3}
                                                    onClick={() =>
                                                        setTeamDrawer({
                                                            type: 'feeding',
                                                            id: feedingSchedule.id,
                                                            title: feedingSchedule.zone,
                                                            subtitle: `${feedingSchedule.day} • ${feedingSchedule.time}`,
                                                            members: feedingRoster,
                                                            initialTab: 'roster',
                                                        })
                                                    }
                                                />
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setTeamDrawer({
                                                                type: 'feeding',
                                                                id: feedingSchedule.id,
                                                                title: feedingSchedule.zone,
                                                                subtitle: `${feedingSchedule.day} • ${feedingSchedule.time}`,
                                                                members: feedingRoster,
                                                                initialTab: 'chat',
                                                            })
                                                        }
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-paw-blue px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-blue-700"
                                                    >
                                                        <MessageSquare size={12} />
                                                        Team Chat
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setTeamDrawer({
                                                                type: 'feeding',
                                                                id: feedingSchedule.id,
                                                                title: feedingSchedule.zone,
                                                                subtitle: `${feedingSchedule.day} • ${feedingSchedule.time}`,
                                                                members: feedingRoster,
                                                                initialTab: 'roster',
                                                            })
                                                        }
                                                        className="cursor-pointer rounded-xl bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-[#0B2340] transition hover:bg-paw-orange hover:text-white dark:bg-slate-800 dark:text-white"
                                                    >
                                                        View Team ({feedingRoster.length})
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {distributionLogs.length > 0 && (
                                            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-slate-800/60 space-y-2">
                                                <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                                                    Street Food Distribution Log ({distributionLogs.length})
                                                </p>
                                                <div className="space-y-1.5">
                                                    {distributionLogs.slice(0, 5).map((log) => (
                                                        <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                            <span>
                                                                <strong className="text-[#0B2340] dark:text-white">{log.street_or_stop}</strong> — {log.food_packs_distributed}x {log.food_type} ({log.strays_fed} strays fed)
                                                            </span>
                                                            <span className="text-[11px] text-gray-400">
                                                                by {log.recorded_by?.name || 'Recorder'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Event Team / Group Roster */}
                                {task.event && eventRoster.length > 0 && (
                                    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <TeamAvatarStack
                                                members={eventRoster.map((m) => ({
                                                    id: m.id,
                                                    name: m.user?.name || 'Volunteer',
                                                    role: m.role,
                                                    avatar_path: m.user?.avatar_path,
                                                }))}
                                                maxVisible={3}
                                                onClick={() =>
                                                    setTeamDrawer({
                                                        type: 'event',
                                                        id: task.event!.id,
                                                        title: task.event!.title,
                                                        subtitle: `${task.event!.date ? new Date(task.event!.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''} • ${task.event!.time}`,
                                                        members: eventRoster,
                                                        initialTab: 'roster',
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setTeamDrawer({
                                                        type: 'event',
                                                        id: task.event!.id,
                                                        title: task.event!.title,
                                                        subtitle: `${task.event!.date ? new Date(task.event!.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''} • ${task.event!.time}`,
                                                        members: eventRoster,
                                                        initialTab: 'chat',
                                                    })
                                                }
                                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-paw-blue px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-blue-700"
                                            >
                                                <MessageSquare size={12} />
                                                Team Chat
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setTeamDrawer({
                                                        type: 'event',
                                                        id: task.event!.id,
                                                        title: task.event!.title,
                                                        subtitle: `${task.event!.date ? new Date(task.event!.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''} • ${task.event!.time}`,
                                                        members: eventRoster,
                                                        initialTab: 'roster',
                                                    })
                                                }
                                                className="cursor-pointer rounded-xl bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-[#0B2340] transition hover:bg-paw-orange hover:text-white dark:bg-slate-800 dark:text-white"
                                            >
                                                View Team ({eventRoster.length})
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </DashboardCard>
                        );
                    })}

                    {/* Pagination */}
                    {tasks.links && tasks.links.length > 3 && (
                        <div className="flex justify-center gap-1 mt-6">
                            {tasks.links.map((link, idx) => {
                                if (link.url === null) {
return (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold" dangerouslySetInnerHTML={{ __html: link.label }} />
                                );
}

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

            {/* Record Food Distribution Modal */}
            {recordingSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white flex items-center gap-2">
                                <ClipboardCheck className="text-paw-orange" /> Record Street Food Distribution
                            </h3>
                            <button
                                type="button"
                                onClick={() => setRecordingSchedule(null)}
                                className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                            Route: <span className="font-bold text-[#0B2340] dark:text-white">{recordingSchedule.zone}</span>
                        </p>
                        <form onSubmit={handleRecordDistribution} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                    Street / Stop Name *
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., Public Market Alley"
                                    value={streetOrStop}
                                    onChange={(e) => setStreetOrStop(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                    Food Type *
                                </label>
                                <select
                                    value={foodType}
                                    onChange={(e) => setFoodType(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                >
                                    {foodTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                        Food Packs *
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min={1}
                                        value={foodPacks}
                                        onChange={(e) => setFoodPacks(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                        Strays Fed *
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min={0}
                                        value={straysFed}
                                        onChange={(e) => setStraysFed(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Any observations on the street..."
                                    value={distributionNotes}
                                    onChange={(e) => setDistributionNotes(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRecordingSchedule(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingDistribution}
                                    className="px-4 py-2 bg-paw-orange text-white hover:bg-orange-600 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingDistribution ? 'Saving...' : 'Save Distribution'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {teamDrawer && currentUserId !== undefined && (
                <GroupChatDrawer
                    open={Boolean(teamDrawer)}
                    onClose={() => setTeamDrawer(null)}
                    groupType={teamDrawer.type}
                    groupId={teamDrawer.id}
                    groupName={teamDrawer.title}
                    schedule={teamDrawer.subtitle}
                    members={teamDrawer.members.map((m) => ({
                        id: m.id,
                        task_id: m.id,
                        user_id: m.user?.id ?? m.user_id,
                        name: m.user?.name || 'Volunteer',
                        role: m.role,
                        avatar_path: m.user?.avatar_path,
                        status: m.status,
                    }))}
                    currentUserId={currentUserId}
                    initialTab={teamDrawer.initialTab}
                />
            )}

            {completingGroup && (
                <CompleteGroupModal
                    open={Boolean(completingGroup)}
                    onClose={() => setCompletingGroup(null)}
                    title={completingGroup.title}
                    subtitle={completingGroup.subtitle}
                    groupType={completingGroup.type}
                    members={completingGroup.members.map((m) => ({
                        task_id: m.id,
                        name: m.user?.name || 'Volunteer',
                        role: m.role,
                        status: m.status,
                    }))}
                    submitting={isCompletingGroup}
                    onSubmit={handleSubmitGroupCompletion}
                />
            )}

            <ConfirmationModal {...confirmModalProps} />
        </DashboardSectionPage>
    );
}

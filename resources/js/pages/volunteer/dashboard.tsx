import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Award,
    Calendar,
    CheckCircle2,
    Circle,
    ClipboardList,
    Clock,
    Compass,
    FileText,
    Flame,
    HeartHandshake,
    HeartPulse,
    LifeBuoy,
    Map as MapIcon,
    MapPin,
    MessageSquare,
    PackageCheck,
    PawPrint,
    Radio,
    Sparkles,
    Trophy,
    Users,
    Utensils,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { BlogCarousel } from '@/components/dashboard/blog-carousel';
import type { DashboardBlogPost } from '@/components/dashboard/blog-carousel';
import { GroupChatDrawer } from '@/components/volunteer/group-chat-drawer';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { TeamAvatarStack } from '@/components/volunteer/team-avatar-stack';
import { VolunteerMapModal } from '@/components/volunteer/volunteer-map-modal';
import { formatPillLabel } from '@/lib/utils';
import { cn, formatPhotoUrl } from '@/lib/utils';
import {
    achievements,
    assignedTasks,
    certificates,
    fosterCare,
    helpDesk,
    participationHistory,
    profile,
    rescueReports,
} from '@/routes/account/volunteer';
import { show as applyFosterShow } from '@/routes/account/volunteer/apply-foster';
import type { SharedData } from '@/types';

interface VolunteerSummary {
    role: string;
    reference_number: string | null;
    member_since: string | null;
    is_approved_foster: boolean;
    foster_status: string | null;
}

interface ImpactTier {
    name: string;
    score: number;
    nextTierName: string | null;
    pointsToNext: number;
    progressPercent: number;
}

interface VolunteerStats {
    pendingTasksCount: number;
    completedTasksCount: number;
    totalHours: number;
    activeFosterCount: number;
    assignedRescuesCount: number;
    badgesCount: number;
    certificatesCount: number;
    taskBreakdown: {
        rescueCount: number;
        foodPickupCount: number;
        feedingCount: number;
        eventCount: number;
    };
}

interface ActiveMission {
    id: number;
    kind: 'food_pickup' | 'rescue' | 'feeding' | 'event';
    kindLabel: string;
    title: string;
    subtitle: string;
    schedule: string;
    status: string;
    href: string;
    can_confirm_pickup?: boolean;
    pet_report_id?: number;
    can_update_rescue?: boolean;
}

interface FosterSpotlight {
    id: number;
    pet_name: string;
    pet_type: string;
    breed: string;
    photo_url: string | null;
    days_in_care: number;
    care_instructions: string | null;
    expected_review_date: string | null;
    is_review_near_or_overdue: boolean;
}

interface ReadinessChecklist {
    hasProfile: boolean;
    hasCompletedMission: boolean;
    hasEarnedBadge: boolean;
    hasFosterOrCertificate: boolean;
}

interface RecentBadge {
    id: number;
    name: string;
    description: string;
    tier: string | null;
    is_pinned: boolean;
    image_path: string | null;
    unlocked_at: string | null;
}

interface UpcomingEvent {
    id: number;
    title: string;
    date: string | null;
    time: string | null;
    location: string;
    type: string;
    spots: number | null;
    is_joined: boolean;
}

interface ShelterPulse {
    estDays: number;
    urgencyStatus: string;
    urgencyLabel: string;
    resourceCategory: string;
}

interface RecentMilestone {
    id: string;
    kind: 'task' | 'badge' | 'certificate';
    title: string;
    meta: string;
    date: string;
    href: string;
}

interface CommunityVolunteersPulse {
    activeVolunteersCount: number;
    monthlyHoursLogged: number;
    monthlyMissionsCompleted: number;
}

interface UrgentSosAlert {
    id: number;
    animal_type: string;
    location: string;
    reported_at: string;
}

interface VolunteerDashboardProps {
    volunteerSummary: VolunteerSummary;
    impactTier: ImpactTier;
    stats: VolunteerStats;
    activeMissions: ActiveMission[];
    fosterSpotlight: FosterSpotlight | null;
    readinessChecklist: ReadinessChecklist;
    recentBadges: RecentBadge[];
    upcomingEvents: UpcomingEvent[];
    shelterPulse?: ShelterPulse;
    communityVolunteersPulse?: CommunityVolunteersPulse;
    urgentSosAlerts?: UrgentSosAlert[];
    recentMilestones?: RecentMilestone[];
    latestBlogs: DashboardBlogPost[];
    blogCategories: Record<string, string>;
    volunteerMapEnabled: boolean;
    injuryReportsSummary?: {
        total: number;
        openCount: number;
        recentReports: Array<{
            id: number;
            incident_type: string;
            incident_label: string;
            severity: string;
            status: string;
            medical_aid_type: string | null;
            incident_occurred_at: string | null;
        }>;
    };
    myFieldTeams?: Array<{
        task_id: number;
        group_type: string;
        group_type_key: 'feeding' | 'event';
        group_id: number;
        group_name: string;
        schedule: string;
        execution_status: string | null;
        is_disbanded?: boolean;
        my_role: string;
        members: Array<{
            id: number;
            user_id: number;
            name: string;
            avatar_path?: string | null;
            role: string;
            is_me: boolean;
            is_medic: boolean;
            is_lead: boolean;
            is_recorder: boolean;
        }>;
    }>;
}

const missionKindStyles: Record<
    ActiveMission['kind'],
    { badge: string; icon: typeof ClipboardList }
> = {
    food_pickup: {
        badge: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        icon: PackageCheck,
    },
    rescue: {
        badge: 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
        icon: AlertTriangle,
    },
    feeding: {
        badge: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        icon: Utensils,
    },
    event: {
        badge: 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
        icon: Calendar,
    },
};

export default function VolunteerDashboard({
    volunteerSummary,
    impactTier,
    stats,
    activeMissions = [],
    fosterSpotlight,
    readinessChecklist,
    recentBadges = [],
    upcomingEvents = [],
    shelterPulse,
    communityVolunteersPulse,
    urgentSosAlerts = [],
    recentMilestones = [],
    latestBlogs = [],
    blogCategories = {},
    volunteerMapEnabled = false,
    injuryReportsSummary,
    myFieldTeams = [],
}: VolunteerDashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [mapFilter, setMapFilter] = useState<'all' | 'feeding_route' | 'rescue'>('all');
    const [busyActionId, setBusyActionId] = useState<string | null>(null);
    const [sosDismissed, setSosDismissed] = useState(false);
    const [selectedTeamTaskId, setSelectedTeamTaskId] = useState<number | null>(null);
    const activeTeamDrawer = selectedTeamTaskId !== null
        ? myFieldTeams.find((t) => t.task_id === selectedTeamTaskId) || null
        : null;

    const handleConfirmPickup = (taskId: number) => {
        setBusyActionId(`pickup-${taskId}`);
        router.post(
            `/account/volunteer/assigned-tasks/${taskId}/confirm-fetched`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusyActionId(null),
            },
        );
    };

    const handleMarkRescued = (reportId: number) => {
        setBusyActionId(`rescue-${reportId}`);
        router.post(
            `/account/volunteer/rescue-reports/${reportId}/status`,
            { status: 'resolved' },
            {
                preserveScroll: true,
                onFinish: () => setBusyActionId(null),
            },
        );
    };

    const handleJoinEvent = (eventId: number) => {
        setBusyActionId(`event-${eventId}`);
        router.post(
            `/events/${eventId}/join`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusyActionId(null),
            },
        );
    };

    const openMapWithFilter = (filter: 'all' | 'feeding_route' | 'rescue') => {
        setMapFilter(filter);
        setIsMapOpen(true);
    };

    const pulseTone =
        shelterPulse?.urgencyStatus === 'stable'
            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            : shelterPulse?.urgencyStatus === 'needs_support'
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300';

    const firstName = auth?.user?.name?.split(' ')[0] ?? 'Volunteer';

    const statCards = [
        {
            title: 'Active Missions',
            value: stats.pendingTasksCount,
            helper:
                stats.pendingTasksCount > 0
                    ? `${stats.taskBreakdown.rescueCount} rescues • ${stats.taskBreakdown.foodPickupCount} pickups • ${stats.taskBreakdown.feedingCount} feeding`
                    : 'All caught up on assignments!',
            href: assignedTasks.url(),
            icon: ClipboardList,
            tone: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
        },
        {
            title: 'Hours Contributed',
            value: `${stats.totalHours.toFixed(1)}h`,
            helper:
                stats.completedTasksCount > 0
                    ? `${stats.completedTasksCount} completed mission${stats.completedTasksCount === 1 ? '' : 's'}`
                    : 'Complete a task to log hours',
            href: participationHistory.url(),
            icon: Clock,
            tone: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
        },
        {
            title: 'Rescues & Foster',
            value: stats.assignedRescuesCount + stats.activeFosterCount,
            helper: `${stats.assignedRescuesCount} rescue${stats.assignedRescuesCount === 1 ? '' : 's'} • ${stats.activeFosterCount} foster pet${stats.activeFosterCount === 1 ? '' : 's'}`,
            href: stats.activeFosterCount > 0 ? fosterCare.url() : rescueReports.url(),
            icon: HeartHandshake,
            tone: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
        },
        {
            title: 'Honors & Badges',
            value: stats.badgesCount + stats.certificatesCount,
            helper: `${stats.badgesCount} badge${stats.badgesCount === 1 ? '' : 's'} • ${stats.certificatesCount} certificate${stats.certificatesCount === 1 ? '' : 's'}`,
            href: achievements.url(),
            icon: Trophy,
            tone: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
        },
    ];

    const checklistItems = [
        {
            title: 'Complete your volunteer profile',
            description: 'Keep your contact details and availability up to date.',
            completed: readinessChecklist.hasProfile,
            href: profile.url(),
        },
        {
            title: 'Complete your first mission',
            description: 'Finish an assigned rescue, feeding route, pickup, or event.',
            completed: readinessChecklist.hasCompletedMission,
            href: assignedTasks.url(),
        },
        {
            title: 'Unlock a volunteer badge',
            description: 'Earn recognition as you log hours and help animals.',
            completed: readinessChecklist.hasEarnedBadge,
            href: achievements.url(),
        },
        {
            title: 'Explore foster care or certificates',
            description: 'Host a pet in need or download your service certificates.',
            completed: readinessChecklist.hasFosterOrCertificate,
            href: volunteerSummary.is_approved_foster ? fosterCare.url() : applyFosterShow.url(),
        },
    ];
    const completedChecklistCount = checklistItems.filter((item) => item.completed).length;

    const quickShortcuts = [
        {
            title: 'Assigned Tasks',
            subtitle: 'Manage active shifts & pickups',
            href: assignedTasks.url(),
            icon: ClipboardList,
            color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
            title: 'Rescue Reports',
            subtitle: 'Update field rescue status',
            href: rescueReports.url(),
            icon: FileText,
            color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        },
        {
            title: 'Field Injury Reports',
            subtitle:
                injuryReportsSummary && injuryReportsSummary.openCount > 0
                    ? `${injuryReportsSummary.openCount} active medical aid case(s)`
                    : 'Report field injury & medical aid',
            href: '/account/volunteer/injury-reports',
            icon: HeartPulse,
            color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        },
        {
            title: 'Certificates',
            subtitle: 'Download service recognition',
            href: certificates.url(),
            icon: Award,
            color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
            title: 'Help Desk',
            subtitle: 'Reach coordinators & FAQs',
            href: helpDesk.url(),
            icon: LifeBuoy,
            color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        },
    ];

    return (
        <DashboardSectionPage
            title={`Welcome back, ${firstName}!`}
            description="Your volunteer command center — track active missions, field impact, foster care, and shelter updates."
            badge={
                <DashboardMetricBadge
                    icon={<Sparkles className="size-4" />}
                    label={`${volunteerSummary.role} • ${impactTier.name}`}
                />
            }
        >
            {/* Urgent SOS Rescue Banner */}
            {urgentSosAlerts.length > 0 && !sosDismissed && (
                <DashboardCard className="border-rose-300/80 bg-gradient-to-r from-rose-50 via-red-50/70 to-white p-4 sm:p-5 dark:border-rose-800/60 dark:from-rose-950/50 dark:via-[#1f1218] dark:to-[#111827]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
                                <AlertTriangle className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                                        Urgent SOS ({urgentSosAlerts.length})
                                    </span>
                                    <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                                        {urgentSosAlerts[0].reported_at}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                    {urgentSosAlerts[0].animal_type} in need near {urgentSosAlerts[0].location}
                                    {urgentSosAlerts.length > 1
                                        ? ` (+${urgentSosAlerts.length - 1} more unassigned SOS)`
                                        : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {volunteerMapEnabled && (
                                <button
                                    type="button"
                                    onClick={() => openMapWithFilter('rescue')}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-rose-700"
                                >
                                    <MapIcon className="size-3.5" />
                                    <span>View on Map</span>
                                </button>
                            )}
                            <Link
                                href={rescueReports.url()}
                                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-800 dark:bg-[#111827] dark:text-rose-300 dark:hover:bg-rose-950/30"
                            >
                                <span>Rescue Reports</span>
                                <ArrowRight className="size-3.5" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setSosDismissed(true)}
                                aria-label="Dismiss SOS alert"
                                className="cursor-pointer rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </div>
                </DashboardCard>
            )}

            {/* 1. Hero Impact Banner */}
            <DashboardCard className="relative overflow-hidden border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 p-4 sm:p-6 dark:border-emerald-900/40 dark:from-[#0f241f] dark:via-[#111827] dark:to-[#0f1f24]">
                <div className="flex flex-col gap-5">
                    <div className="min-w-0 space-y-4">
                        <div className="space-y-2 min-w-0">
                            <div className="flex flex-nowrap items-center justify-between gap-1.5 sm:gap-2 min-w-0">
                                <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 sm:gap-1.5 rounded-full bg-emerald-500/15 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                                    <Flame className="size-3 sm:size-3.5 shrink-0" />
                                    <span>{impactTier.name}</span>
                                </span>
                                {shelterPulse && (
                                    <span
                                        className={cn(
                                            'inline-flex min-w-0 max-w-full items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold',
                                            pulseTone,
                                        )}
                                    >
                                        <Radio className="size-3 sm:size-3.5 shrink-0" />
                                        <span className="truncate">
                                            Shelter: {shelterPulse.urgencyLabel} ({shelterPulse.estDays}d)
                                        </span>
                                    </span>
                                )}
                            </div>
                            {(volunteerSummary.member_since || volunteerSummary.reference_number) && (
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    {volunteerSummary.member_since && (
                                        <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                            Serving since {volunteerSummary.member_since}
                                        </span>
                                    )}
                                    {volunteerSummary.reference_number && (
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            {volunteerSummary.reference_number}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-fredoka text-xl font-bold leading-snug text-[#0B2340] sm:text-2xl dark:text-[#F8FAFC]">
                                {stats.pendingTasksCount > 0
                                    ? `You have ${stats.pendingTasksCount} active mission${stats.pendingTasksCount === 1 ? '' : 's'} ready for action.`
                                    : 'Every animal counts — thank you for making a difference.'}
                            </h3>
                            <p className="mt-1 text-sm text-[#475569] dark:text-[#94A3B8]">
                                {impactTier.nextTierName
                                    ? `${impactTier.pointsToNext} impact points away from reaching ${impactTier.nextTierName}.`
                                    : 'You have reached the highest volunteer impact tier — Rescue Hero!'}
                            </p>
                        </div>

                        <div className="w-full space-y-1.5">
                            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#475569] dark:text-[#CBD5E1]">
                                <span>Tier Progress ({impactTier.score} pts)</span>
                                <span>{impactTier.progressPercent}%</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] transition-all duration-500"
                                    style={{ width: `${impactTier.progressPercent}%` }}
                                />
                            </div>
                        </div>

                        {communityVolunteersPulse && (
                            <div className="w-full rounded-2xl border border-emerald-200/70 bg-white/80 p-3 sm:p-4 dark:border-emerald-900/40 dark:bg-slate-900/50">
                                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                    <Users className="size-3.5 sm:size-4 shrink-0" />
                                    <span>Team Pawlse This Month</span>
                                </div>
                                <div className="mt-2.5 grid grid-cols-3 gap-2 sm:gap-4 text-center">
                                    <div className="rounded-xl bg-emerald-500/5 px-2 py-2 sm:px-4 sm:py-3">
                                        <p className="text-sm sm:text-xl font-extrabold text-[#0B2340] dark:text-white">
                                            {communityVolunteersPulse.activeVolunteersCount}
                                        </p>
                                        <p className="mt-0.5 text-[10px] sm:text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                            Active {communityVolunteersPulse.activeVolunteersCount === 1 ? 'Volunteer' : 'Volunteers'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-emerald-500/5 px-2 py-2 sm:px-4 sm:py-3">
                                        <p className="text-sm sm:text-xl font-extrabold text-[#0B2340] dark:text-white">
                                            {communityVolunteersPulse.monthlyHoursLogged.toFixed(1)}h
                                        </p>
                                        <p className="mt-0.5 text-[10px] sm:text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                            Hours Logged
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-emerald-500/5 px-2 py-2 sm:px-4 sm:py-3">
                                        <p className="text-sm sm:text-xl font-extrabold text-[#0B2340] dark:text-white">
                                            {communityVolunteersPulse.monthlyMissionsCompleted}
                                        </p>
                                        <p className="mt-0.5 text-[10px] sm:text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                            {communityVolunteersPulse.monthlyMissionsCompleted === 1 ? 'Mission Done' : 'Missions Done'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-nowrap items-center gap-2 sm:gap-3 w-full shrink-0">
                        <Link
                            href={assignedTasks.url()}
                            className="inline-flex flex-1 min-h-10 sm:min-h-11 items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] px-3.5 sm:px-5 text-xs sm:text-sm font-bold text-white shadow-[0_8px_22px_var(--dashboard-primary-shadow)] transition hover:opacity-95"
                        >
                            <ClipboardList className="size-4 shrink-0" />
                            <span>View Missions</span>
                            <ArrowRight className="size-4 shrink-0" />
                        </Link>
                        {volunteerMapEnabled && (
                            <button
                                type="button"
                                onClick={() => openMapWithFilter('all')}
                                className="inline-flex flex-1 min-h-10 sm:min-h-11 cursor-pointer items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-xl border border-[#E5E7EB] bg-white px-3.5 sm:px-4 text-xs sm:text-sm font-bold text-[#0B2340] shadow-xs transition hover:bg-slate-50 dark:border-[#1E293B] dark:bg-[#1E293B] dark:text-[#F8FAFC] dark:hover:bg-slate-800"
                            >
                                <MapIcon className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Operations Map</span>
                            </button>
                        )}
                    </div>
                </div>
            </DashboardCard>

            {/* 2. 4 Impact Stat Cards */}
            <div className="grid grid-cols-1 min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <Link key={card.title} href={card.href} className="group block min-w-0">
                            <DashboardCard className="h-full p-5 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-emerald-300 dark:group-hover:border-emerald-700/60">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                                            {card.title}
                                        </p>
                                        <p className="font-fredoka mt-2 text-3xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                            {card.value}
                                        </p>
                                    </div>
                                    <div
                                        className={cn(
                                            'flex size-11 shrink-0 items-center justify-center rounded-xl',
                                            card.tone,
                                        )}
                                    >
                                        <Icon className="size-5" />
                                    </div>
                                </div>
                                <p className="mt-3 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                                    {card.helper}
                                </p>
                            </DashboardCard>
                        </Link>
                    );
                })}
            </div>

            {/* 3. Main Two-Column Workspace */}
            <div className="grid grid-cols-1 min-w-0 gap-6 lg:grid-cols-3">
                {/* Left 2/3: Quick Shortcuts + Foster Spotlight + Active Missions */}
                <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
                    {/* Quick Shortcuts */}
                    <DashboardCard>
                        <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            Quick Shortcuts
                        </h3>
                        <div className="mt-4 grid grid-cols-1 min-w-0 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                            {quickShortcuts.map((shortcut) => {
                                const Icon = shortcut.icon;

                                return (
                                    <Link
                                        key={shortcut.title}
                                        href={shortcut.href}
                                        className="flex min-w-0 flex-col gap-2.5 rounded-xl border border-[#E5E7EB]/80 p-3.5 transition hover:border-emerald-300 dark:border-[#1E293B] dark:hover:border-emerald-800"
                                    >
                                        <div
                                            className={cn(
                                                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                                                shortcut.color,
                                            )}
                                        >
                                            <Icon className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                                {shortcut.title}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                                {shortcut.subtitle}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </DashboardCard>

                    {/* My Field Teams & Groups */}
                    <DashboardCard>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                    My Field Teams & Groups
                                </h3>
                                <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                                    Joining or being assigned to a Feeding Route or Event places you in that group so you can coordinate with your Route Lead, Recorder, and Field Medic.
                                </p>
                            </div>
                            <Link
                                href={assignedTasks.url()}
                                className="inline-flex items-center gap-1 text-xs font-bold text-paw-blue hover:underline"
                            >
                                Manage Tasks <ArrowRight className="size-3.5" />
                            </Link>
                        </div>

                        {myFieldTeams.length === 0 ? (
                            <div className="mt-4 rounded-xl border border-dashed border-[#E5E7EB] p-5 text-center dark:border-[#1E293B]">
                                <Users className="mx-auto size-7 text-gray-300 dark:text-gray-600" />
                                <p className="mt-2 text-xs font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                    You are not in an active field group yet.
                                </p>
                                <p className="mt-0.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                    Join a feeding route or event on the Events page to team up with other volunteers.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {myFieldTeams.map((team) => {
                                    const medics = team.members.filter((m) => m.is_medic);

                                    return (
                                        <div
                                            key={team.task_id}
                                            className="rounded-2xl border border-[#E5E7EB]/90 bg-[#F8FAFC]/70 p-4 dark:border-[#1E293B] dark:bg-[#0F172A]/60"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full bg-paw-blue/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-paw-blue">
                                                            {team.group_type}
                                                        </span>
                                                        <span className="rounded-full bg-paw-orange/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-paw-orange">
                                                            Your Role: {team.my_role}
                                                        </span>
                                                        {medics.length > 0 && (
                                                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                                Medic Available ({medics.length})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="mt-1.5 font-fredoka text-base font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                                        {team.group_name}
                                                    </h4>
                                                    <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                                        {team.schedule} • {team.members.length} member(s) in group
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB]/70 pt-3 dark:border-[#1E293B]">
                                                <TeamAvatarStack
                                                    members={team.members}
                                                    maxVisible={3}
                                                    onClick={() => setSelectedTeamTaskId(team.task_id)}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTeamTaskId(team.task_id)}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-paw-blue px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-blue-700"
                                                    >
                                                        <MessageSquare className="size-3.5" />
                                                        Open Chat
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTeamTaskId(team.task_id)}
                                                        className="cursor-pointer rounded-xl bg-white px-3 py-1.5 text-[11px] font-bold text-[#0B2340] border border-[#E5E7EB] transition hover:border-paw-blue hover:text-paw-blue dark:border-[#1E293B] dark:bg-slate-800 dark:text-white"
                                                    >
                                                        View Team ({team.members.length})
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </DashboardCard>

                    {/* Foster Care Spotlight */}
                    {fosterSpotlight ? (
                        <DashboardCard className="border-rose-200/70 bg-gradient-to-r from-rose-50/60 to-white dark:border-rose-900/40 dark:from-[#1f1218] dark:to-[#111827]">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-16 shrink-0 overflow-hidden rounded-2xl border border-rose-200/80 bg-rose-100/60 dark:border-rose-900/50 dark:bg-rose-950/40">
                                        <ImageWithFallback
                                            src={formatPhotoUrl(fosterSpotlight.photo_url)}
                                            alt={fosterSpotlight.pet_name}
                                            className="size-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                                                <HeartHandshake className="size-3" />
                                                Active Foster Spotlight
                                            </span>
                                            {fosterSpotlight.is_review_near_or_overdue && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                                                    <AlertTriangle className="size-3" />
                                                    Review due {fosterSpotlight.expected_review_date ?? 'soon'}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-fredoka mt-1 text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                            {fosterSpotlight.pet_name}
                                        </h4>
                                        <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                                            {fosterSpotlight.breed} • {fosterSpotlight.days_in_care} day{fosterSpotlight.days_in_care === 1 ? '' : 's'} in your care
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={fosterCare.url()}
                                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white transition hover:bg-rose-700"
                                >
                                    <span>Log Care Update</span>
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            </div>
                        </DashboardCard>
                    ) : (
                        <DashboardCard className="border-dashed border-rose-200/80 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-950/10">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3.5">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                        <PawPrint className="size-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-fredoka text-base font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                            {volunteerSummary.is_approved_foster
                                                ? 'Ready for Your Next Foster Pet'
                                                : 'Open Your Home as a Foster Parent'}
                                        </h4>
                                        <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                                            {volunteerSummary.is_approved_foster
                                                ? 'You are an approved foster parent. Coordinators can assign a shelter pet to your care anytime.'
                                                : 'Temporary foster homes help recovering pets thrive while waiting for adoption.'}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={volunteerSummary.is_approved_foster ? fosterCare.url() : applyFosterShow.url()}
                                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/50 dark:bg-[#111827] dark:text-rose-400 dark:hover:bg-rose-950/30"
                                >
                                    <span>{volunteerSummary.is_approved_foster ? 'Foster Portal' : 'Apply to Foster'}</span>
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            </div>
                        </DashboardCard>
                    )}

                    {/* Active Missions Queue */}
                    <DashboardCard className="flex flex-1 flex-col">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                    Active Missions Queue
                                </h3>
                                <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                                    Your highest-priority pending assignments and dispatches.
                                </p>
                            </div>
                            <Link
                                href={assignedTasks.url()}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                            >
                                <span>Manage all tasks</span>
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </div>

                        {activeMissions.length > 0 ? (
                            <div className="mt-5 grid grid-cols-1 min-w-0 gap-3">
                                {activeMissions.map((mission) => {
                                    const style = missionKindStyles[mission.kind];
                                    const Icon = style.icon;

                                    return (
                                        <div
                                            key={mission.id}
                                            className="group flex min-w-0 flex-col gap-3 rounded-xl border border-[#E5E7EB] p-4 transition hover:border-emerald-300 hover:bg-emerald-50/30 sm:flex-row sm:items-center sm:justify-between dark:border-[#1E293B] dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
                                        >
                                            <Link href={mission.href} className="flex min-w-0 flex-1 items-start gap-3.5">
                                                <div
                                                    className={cn(
                                                        'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl',
                                                        style.badge,
                                                    )}
                                                >
                                                    <Icon className="size-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={cn(
                                                                'rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                                                                style.badge,
                                                            )}
                                                        >
                                                            {mission.kindLabel}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                                            {mission.schedule}
                                                        </span>
                                                    </div>
                                                    <h4 className="mt-1 truncate text-sm font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                                        {mission.title}
                                                    </h4>
                                                    <p className="truncate text-xs text-[#64748B] dark:text-[#94A3B8]">
                                                        {mission.subtitle}
                                                    </p>
                                                </div>
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                                                {mission.can_confirm_pickup && (
                                                    <button
                                                        type="button"
                                                        disabled={busyActionId === `pickup-${mission.id}`}
                                                        onClick={() => handleConfirmPickup(mission.id)}
                                                        className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                                    >
                                                        {busyActionId === `pickup-${mission.id}` ? 'Confirming...' : 'Confirm Fetched'}
                                                    </button>
                                                )}
                                                {mission.can_update_rescue && mission.pet_report_id && (
                                                    <button
                                                        type="button"
                                                        disabled={busyActionId === `rescue-${mission.pet_report_id}`}
                                                        onClick={() => handleMarkRescued(mission.pet_report_id!)}
                                                        className="cursor-pointer rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                                                    >
                                                        {busyActionId === `rescue-${mission.pet_report_id}` ? 'Updating...' : 'Mark Rescued'}
                                                    </button>
                                                )}
                                                {mission.kind === 'feeding' && volunteerMapEnabled && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openMapWithFilter('feeding_route')}
                                                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                                    >
                                                        <MapIcon className="size-3.5" />
                                                        <span>View on Map</span>
                                                    </button>
                                                )}
                                                <span className="whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    {formatPillLabel(mission.status)}
                                                </span>
                                                <Link href={mission.href} aria-label={`Open ${mission.title}`}>
                                                    <ArrowRight className="size-4 text-[#94A3B8] transition group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] px-6 py-10 text-center dark:border-[#1E293B]">
                                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Compass className="size-6" />
                                </div>
                                <h4 className="mt-3 text-sm font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                    No pending missions right now
                                </h4>
                                <p className="mt-1 max-w-sm text-xs text-[#64748B] dark:text-[#94A3B8]">
                                    Check active rescue reports or open the operations map to see where the shelter needs hands today.
                                </p>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    <Link
                                        href={rescueReports.url()}
                                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                                    >
                                        View Rescue Reports
                                    </Link>
                                    {volunteerMapEnabled && (
                                        <button
                                            type="button"
                                            onClick={() => setIsMapOpen(true)}
                                            className="cursor-pointer rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-bold text-[#0B2340] transition hover:bg-slate-50 dark:border-[#1E293B] dark:text-[#F8FAFC] dark:hover:bg-slate-800"
                                        >
                                            Open Map
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </DashboardCard>
                </div>

                {/* Right 1/3: Readiness Checklist, Badges */}
                <div className="flex min-w-0 flex-col gap-6">
                    <DashboardCard>
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                Volunteer Readiness
                            </h3>
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                {completedChecklistCount}/{checklistItems.length}
                            </span>
                        </div>
                        <div className="mt-4 space-y-2.5">
                            {checklistItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="flex items-start gap-3 rounded-xl border border-[#E5E7EB]/80 p-3 transition hover:border-emerald-300 dark:border-[#1E293B] dark:hover:border-emerald-800"
                                >
                                    {item.completed ? (
                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <Circle className="mt-0.5 size-4 shrink-0 text-slate-300 dark:text-slate-600" />
                                    )}
                                    <div className="min-w-0">
                                        <p
                                            className={cn(
                                                'text-xs font-bold',
                                                item.completed
                                                    ? 'text-[#64748B] line-through dark:text-[#94A3B8]'
                                                    : 'text-[#0B2340] dark:text-[#F8FAFC]',
                                            )}
                                        >
                                            {item.title}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                            {item.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </DashboardCard>

                    <DashboardCard>
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                Earned Badges
                            </h3>
                            <Link
                                href={achievements.url()}
                                className="text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                            >
                                View all
                            </Link>
                        </div>

                        {recentBadges.length > 0 ? (
                            <div className="mt-4 space-y-2.5">
                                {recentBadges.map((badge) => (
                                    <div
                                        key={badge.id}
                                        className="flex items-center gap-3 rounded-xl border border-[#E5E7EB]/80 p-3 dark:border-[#1E293B]"
                                    >
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                            <Trophy className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                                {badge.name}
                                            </p>
                                            <p className="truncate text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                                {badge.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                                Complete missions and log volunteer hours to unlock your first achievement badge!
                            </p>
                        )}
                    </DashboardCard>

                    <DashboardCard className="flex flex-1 flex-col">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                Recent Milestones
                            </h3>
                            <Link
                                href={participationHistory.url()}
                                className="text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                            >
                                History
                            </Link>
                        </div>

                        {recentMilestones.length > 0 ? (
                            <div className="mt-4 space-y-2.5">
                                {recentMilestones.map((milestone) => (
                                    <Link
                                        key={milestone.id}
                                        href={milestone.href}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB]/80 p-3 transition hover:border-emerald-300 dark:border-[#1E293B] dark:hover:border-emerald-800"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                                {milestone.title}
                                            </p>
                                            <p className="truncate text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                                {milestone.meta} • {milestone.date}
                                            </p>
                                        </div>
                                        <ArrowRight className="size-3.5 shrink-0 text-[#94A3B8]" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                                Your completed shifts, unlocked badges, and certificates will appear here.
                            </p>
                        )}
                    </DashboardCard>
                </div>
            </div>

            {/* 4. Upcoming Shelter Events */}
            {upcomingEvents.length > 0 && (
                <DashboardCard>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                Upcoming Shelter Events
                            </h3>
                            <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                                Community drives and adoption days coming up soon.
                            </p>
                        </div>
                        <Link
                            href="/events"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                        >
                            <span>Browse all events</span>
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                    <div className="mt-4 grid grid-cols-1 min-w-0 gap-4 md:grid-cols-3">
                        {upcomingEvents.map((event) => (
                            <div
                                key={event.id}
                                className="flex min-w-0 flex-col justify-between rounded-xl border border-[#E5E7EB] p-4 transition hover:border-emerald-300 dark:border-[#1E293B] dark:hover:border-emerald-800"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="inline-block whitespace-nowrap rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 dark:text-sky-300">
                                            {formatPillLabel(event.type)}
                                        </span>
                                        {event.spots !== null && (
                                            <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                                {event.spots} spot{event.spots === 1 ? '' : 's'} left
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="mt-2 text-sm font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                        {event.title}
                                    </h4>
                                </div>
                                <div className="mt-3 space-y-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                                    <p className="flex items-center gap-1.5">
                                        <Calendar className="size-3.5 shrink-0" />
                                        <span>
                                            {event.date ?? 'TBA'}
                                            {event.time ? ` • ${event.time}` : ''}
                                        </span>
                                    </p>
                                    <p className="flex items-center gap-1.5 truncate">
                                        <MapPin className="size-3.5 shrink-0" />
                                        <span className="truncate">{event.location}</span>
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#E5E7EB]/70 pt-3 dark:border-[#1E293B]">
                                    <Link
                                        href="/events"
                                        className="text-xs font-bold text-[#64748B] hover:text-[#0B2340] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
                                    >
                                        Details
                                    </Link>
                                    {event.is_joined ? (
                                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                            <CheckCircle2 className="size-3.5" />
                                            Joined
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={busyActionId === `event-${event.id}` || event.spots === 0}
                                            onClick={() => handleJoinEvent(event.id)}
                                            className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            {busyActionId === `event-${event.id}` ? 'Joining...' : 'Join Shift'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </DashboardCard>
            )}

            {/* 5. Community Stories Carousel */}
            {latestBlogs.length > 0 && (
                <BlogCarousel posts={latestBlogs} categories={blogCategories} />
            )}

            {volunteerMapEnabled && (
                <VolunteerMapModal
                    open={isMapOpen}
                    onClose={() => setIsMapOpen(false)}
                    initialFilter={mapFilter}
                />
            )}

            {/* Volunteer Team Side Drawer */}
            {activeTeamDrawer && (
                <GroupChatDrawer
                    open={Boolean(activeTeamDrawer)}
                    onClose={() => setSelectedTeamTaskId(null)}
                    groupType={activeTeamDrawer.group_type_key}
                    groupId={activeTeamDrawer.group_id}
                    groupName={activeTeamDrawer.group_name}
                    schedule={activeTeamDrawer.schedule}
                    members={activeTeamDrawer.members}
                    currentUserId={auth.user.id}
                    isDisbanded={Boolean(activeTeamDrawer.is_disbanded)}
                    initialTab="chat"
                />
            )}
        </DashboardSectionPage>
    );
}

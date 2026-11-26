import { Head, router, Link, usePage } from '@inertiajs/react';
import { User, Users, ClipboardList, CheckCircle2, XCircle, Award, Clock, Search, Filter, Check, X, ShieldAlert, Plus, Store, PackageCheck, AlertTriangle, UserPlus, HeartPulse, Stethoscope, Trash2, Edit3, SlidersHorizontal, Calendar, Utensils, MessageSquare, Archive, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { AdminCard } from '@/components/admin/card';
import { AdminPageShell } from '@/components/admin/page-shell';
import { DashboardPagination } from '@/components/dashboard/pagination';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { ModernDateTimePicker } from '@/components/ui/modern-date-time-picker';
import { ModernSelect } from '@/components/ui/modern-select';
import { FilteredContentSkeleton } from '@/components/ui/skeleton-presets';
import { TeamAvatarStack } from '@/components/volunteer/team-avatar-stack';
import { CompleteGroupModal } from '@/components/volunteer/complete-group-modal';
import type { AttendeeSubmission } from '@/components/volunteer/complete-group-modal';
import { GroupChatDrawer } from '@/components/volunteer/group-chat-drawer';
import { MissionSummaryModal } from '@/components/volunteer/mission-summary-modal';
import { useConfirmationModal } from '@/hooks/use-confirmation-modal';
import { useFilteredSectionLoading } from '@/hooks/use-inertia-loading';
import { usePermissions } from '@/hooks/use-permissions';
import { formatPhotoUrl } from '@/lib/utils';
import type { SharedData } from '@/types';

interface PaginatedData<T> {
    data: T[];
    links: any[];
    total: number;
}

interface VolunteerApplicationModel {
    id: number;
    full_name: string;
    mobile: string;
    email: string;
    address: string;
    role: string;
    why: string;
    experience: string | null;
    foster_capacity?: number | null;
    foster_preference?: string | null;
    foster_needs?: string | null;
    medic_experience?: string | null;
    medic_certifications?: string | null;
    transport_has_license?: boolean;
    status: string;
    reference_number: string;
    rejection_reason: string | null;
    user?: {
        name: string;
    } | null;
}

interface UserModel {
    id: number;
    name: string;
    email: string;
}

interface TaskModel {
    id: number;
    role: string;
    status: string;
    hours_logged: string;
    guest_name?: string | null;
    guest_email?: string | null;
    user?: {
        name: string;
    } | null;
    event?: {
        title: string;
    } | null;
    feeding_schedule?: {
        zone: string;
    } | null;
    pet_report?: {
        id: number;
        name?: string | null;
        animal_type?: string | null;
        species?: string | null;
    } | null;
    partner_food_pickup?: {
        id: number;
        pickup_date: string;
        partner?: {
            name: string;
        } | null;
    } | null;
}

interface DailyFoodPartnerModel {
    id: number;
    name: string;
    address?: string | null;
    operating_hours?: string | null;
    daily_food_notes?: string | null;
}

interface FoodPickupModel {
    id: number;
    partner_id: number;
    pickup_date: string;
    assigned_volunteer_id?: number | null;
    status: 'pending' | 'assigned' | 'fetched' | 'completed' | 'missed';
    food_summary?: string | null;
    volunteer_notes?: string | null;
    admin_notes?: string | null;
    fetched_at?: string | null;
    completed_at?: string | null;
    missed_at?: string | null;
    partner?: DailyFoodPartnerModel | null;
    assigned_volunteer?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface EventDropdownModel {
    id: number;
    title: string;
}

interface ScheduleDropdownModel {
    id: number;
    zone: string;
}

interface VolunteerManagementProps {
    applications: PaginatedData<VolunteerApplicationModel>;
    volunteers: PaginatedData<UserModel>;
    tasks: PaginatedData<TaskModel>;
    foodPickups?: PaginatedData<FoodPickupModel>;
    todayFoodPickups?: FoodPickupModel[];
    dailyFoodPartners?: DailyFoodPartnerModel[];
    foodPickupStats?: {
        today_total: number;
        awaiting_verification: number;
        completed: number;
        missed: number;
    };
    events: EventDropdownModel[];
    feedingSchedules: ScheduleDropdownModel[];
    injuryReports?: PaginatedData<{
        id: number;
        incident_type: string;
        severity: string;
        body_part: string | null;
        location: string | null;
        incident_occurred_at: string;
        description: string;
        first_aid_applied: boolean;
        first_aid_notes: string | null;
        photo_url: string | null;
        status: 'reported' | 'medical_aid_initiated' | 'confirmed';
        medical_aid_type: string | null;
        medical_facility: string | null;
        medical_aid_notes: string | null;
        medical_aid_initiated_at: string | null;
        confirmed_at: string | null;
        confirmation_notes: string | null;
        user?: { id: number; name: string; email: string; phone?: string | null } | null;
        initiated_by?: { id: number; name: string } | null;
        confirmed_by?: { id: number; name: string } | null;
        assigned_medic?: { id: number; name: string; phone?: string | null } | null;
    }>;
    injuryStats?: {
        reported: number;
        medical_aid_initiated: number;
        confirmed: number;
    };
    incidentTypes?: Record<string, string>;
    severities?: Record<string, string>;
    medicalAidTypes?: Record<string, string>;
    fieldMedicsAndLeads?: Array<{
        id: number;
        name: string;
        phone?: string | null;
        role: string;
        assignment: string;
        in_field: boolean;
    }>;
    fieldGroups?: Array<{
        id: number;
        type: 'feeding' | 'event';
        name: string;
        schedule: string;
        quota: number;
        execution_status: string | null;
        is_disbanded?: boolean;
        disbanded_at?: string | null;
        total_food_distributed?: number;
        total_hours_logged?: number;
        completed_count?: number;
        no_show_count?: number;
        members_count: number;
        has_lead: boolean;
        has_recorder: boolean;
        has_medic: boolean;
        members: Array<{
            task_id: number;
            user_id: number;
            name: string;
            email: string;
            phone?: string | null;
            avatar_path?: string | null;
            role: string;
            status: string;
            hours_logged?: number;
            is_lead: boolean;
            is_recorder: boolean;
            is_medic: boolean;
        }>;
    }>;
    allVolunteers?: { id: number; name: string; email: string }[];
    allRecipients?: { id: number; name: string; email: string; role?: string }[];
    issuedEventIdsByUser?: Record<string, number[]>;
    filters: {
        search: string;
        status: string;
    };
    basePath?: string;
}

const GROUP_ROLE_OPTIONS = [
    {
        value: 'Route Lead',
        label: 'Route Lead',
        description: 'Leads the pack on the ground, coordinates stops, and oversees route start & completion.',
    },
    {
        value: 'Recorder',
        label: 'Recorder',
        description: 'Tracks and logs how many food packs are distributed across streets during this route.',
    },
    {
        value: 'Field Medic',
        label: 'Field Medic',
        description: 'Provides immediate first aid and medical support to volunteers or animals if needed.',
    },
    {
        value: 'Food Carrier',
        label: 'Food Carrier',
        description: 'Transports and carries food packs, kibble, and water along the route.',
    },
    {
        value: 'Feeder',
        label: 'Feeder',
        description: 'Distributes food and water directly to stray animals at designated stops.',
    },
    {
        value: 'Volunteer',
        label: 'Volunteer',
        description: 'General team member assisting with event or field operations.',
    },
];

const EVENT_ROLE_PRESETS = [
    {
        value: 'Event Lead',
        label: 'Event Lead',
        description: 'Coordinates the event team on-site, manages volunteer shifts, and handles escalations.',
    },
    {
        value: 'Field Medic',
        label: 'Field Medic',
        description: 'Provides immediate first aid and medical support to volunteers or animals during the event.',
    },
    {
        value: 'Registration Desk',
        label: 'Registration',
        description: 'Checks in attendees, adopters, and volunteers at the event entrance.',
    },
    {
        value: 'Adoption Booth Volunteer',
        label: 'Adoption Booth',
        description: 'Assists visitors with adoptable pets, inquiries, and adoption applications.',
    },
    {
        value: 'Logistics',
        label: 'Logistics',
        description: 'Handles event setup, supplies, crates, equipment, and teardown.',
    },
];

function getRoleBadgeStyle(role: string): string {
    const lower = role.toLowerCase();

    if (lower.includes('lead')) {
        return 'bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
    }

    if (lower.includes('medic')) {
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    }

    if (lower.includes('recorder')) {
        return 'bg-paw-orange/15 text-paw-orange border border-paw-orange/30';
    }

    if (lower.includes('carrier')) {
        return 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    }

    if (lower.includes('feeder')) {
        return 'bg-violet-100 text-violet-800 border border-violet-300 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800';
    }

    return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
}

export default function VolunteerManagement({
    applications,
    volunteers,
    tasks,
    foodPickups = { data: [], links: [], total: 0 },
    todayFoodPickups = [],
    dailyFoodPartners = [],
    foodPickupStats = { today_total: 0, awaiting_verification: 0, completed: 0, missed: 0 },
    events,
    feedingSchedules,
    injuryReports = { data: [], links: [], total: 0 },
    injuryStats = { reported: 0, medical_aid_initiated: 0, confirmed: 0 },
    incidentTypes = {},
    severities = { minor: 'Minor', moderate: 'Moderate', severe: 'Severe', critical: 'Critical' },
    medicalAidTypes = {},
    fieldMedicsAndLeads = [],
    fieldGroups = [],
    allVolunteers = [],
    allRecipients = [],
    issuedEventIdsByUser = {},
    filters,
    basePath = '/account/admin/volunteer-management',
}: VolunteerManagementProps) {
    const { confirmModalProps, openConfirmModal } = useConfirmationModal();
    const { can } = usePermissions();
    const canApproveVolunteers = can('volunteers.approve');
    const canAssignTasks = can('volunteers.assign_tasks');
    const canCertifyVolunteers = can('volunteers.certify');
    const [activeTab, setActiveTab] = useState<'applications' | 'volunteers' | 'tasks' | 'groups' | 'food_pickups' | 'injuries'>(() => {
        if (typeof window !== 'undefined') {
            const tab = new URLSearchParams(window.location.search).get('tab');

            if (tab === 'injuries' || tab === 'tasks' || tab === 'groups' || tab === 'volunteers' || tab === 'food_pickups') {
                return tab;
            }
        }

        return 'applications';
    });
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'All');

    const volunteerList = allVolunteers.length > 0 ? allVolunteers : volunteers.data;
    const recipientList = allRecipients.length > 0 ? allRecipients : volunteerList;

    // Reject application modal state
    const [rejectingApp, setRejectingApp] = useState<VolunteerApplicationModel | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Assign Task modal state
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignTargetUserId, setAssignTargetUserId] = useState(volunteerList[0]?.id?.toString() || '');
    const [assignActivityType, setAssignActivityType] = useState<'event' | 'feeding'>('event');
    const [assignEventId, setAssignEventId] = useState(events[0]?.id?.toString() || '');
    const [assignScheduleId, setAssignScheduleId] = useState(feedingSchedules[0]?.id?.toString() || '');
    const [assignRole, setAssignRole] = useState('Feeding');

    // Injury report medical aid modal state
    const [initiatingInjury, setInitiatingInjury] = useState<NonNullable<VolunteerManagementProps['injuryReports']>['data'][number] | null>(null);
    const [medicalAidType, setMedicalAidType] = useState(Object.keys(medicalAidTypes)[0] || 'anti_rabies_tetanus');
    const [medicalFacility, setMedicalFacility] = useState('');
    const [medicalAidNotes, setMedicalAidNotes] = useState('');
    const [assignedMedicId, setAssignedMedicId] = useState('');
    const [confirmingInjury, setConfirmingInjury] = useState<NonNullable<VolunteerManagementProps['injuryReports']>['data'][number] | null>(null);
    const [confirmationNotes, setConfirmationNotes] = useState('');
    const [isSubmittingInjuryAction, setIsSubmittingInjuryAction] = useState(false);

    // Admin Log Volunteer Injury modal state
    const [isLogInjuryOpen, setIsLogInjuryOpen] = useState(false);
    const [logInjuryUserId, setLogInjuryUserId] = useState(volunteerList[0]?.id?.toString() || '');
    const [logIncidentType, setLogIncidentType] = useState(Object.keys(incidentTypes)[0] || 'animal_bite');
    const [logSeverity, setLogSeverity] = useState('moderate');
    const [logBodyPart, setLogBodyPart] = useState('');
    const [logLocation, setLogLocation] = useState('');
    const [logOccurredAt, setLogOccurredAt] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

        return now.toISOString().slice(0, 16);
    });
    const [logDescription, setLogDescription] = useState('');
    const [logFirstAidApplied, setLogFirstAidApplied] = useState(false);
    const [logFirstAidNotes, setLogFirstAidNotes] = useState('');
    const [logMedicId, setLogMedicId] = useState('');
    const [logInitiateAidNow, setLogInitiateAidNow] = useState(true);
    const [logAidType, setLogAidType] = useState(Object.keys(medicalAidTypes)[0] || 'anti_rabies_tetanus');
    const [logAidFacility, setLogAidFacility] = useState('');
    const [logAidNotes, setLogAidNotes] = useState('');

    // Group Member Role Edit modal state
    const [editingGroupMember, setEditingGroupMember] = useState<{
        task_id: number;
        name: string;
        role: string;
        groupName: string;
        groupType: 'feeding' | 'event';
    } | null>(null);
    const [editingMemberRole, setEditingMemberRole] = useState('');
    const [addingToGroup, setAddingToGroup] = useState<{
        type: 'feeding' | 'event';
        id: number;
        name: string;
        schedule: string;
        members_count: number;
        quota: number;
    } | null>(null);
    const { auth } = usePage<SharedData>().props;
    const currentUserId = auth.user?.id ?? 0;
    const [groupFilter, setGroupFilter] = useState<'active' | 'disbanded'>('active');
    const [chatGroupKey, setChatGroupKey] = useState<{ type: 'feeding' | 'event'; id: number } | null>(null);
    const [summaryGroupKey, setSummaryGroupKey] = useState<{ type: 'feeding' | 'event'; id: number } | null>(null);
    const activeChatGroup = chatGroupKey
        ? fieldGroups.find((g) => g.type === chatGroupKey.type && g.id === chatGroupKey.id) || null
        : null;

    const [selectedGroupKey, setSelectedGroupKey] = useState<{ type: 'feeding' | 'event'; id: number } | null>(null);
    const activeDrawerGroup = selectedGroupKey
        ? fieldGroups.find((g) => g.type === selectedGroupKey.type && g.id === selectedGroupKey.id) || null
        : null;
    const [groupQuotaInput, setGroupQuotaInput] = useState('');
    const [isGroupSettingsModalOpen, setIsGroupSettingsModalOpen] = useState(false);
    const [isSavingGroupSettings, setIsSavingGroupSettings] = useState(false);
    const [disbandingGroup, setDisbandingGroup] = useState<typeof activeDrawerGroup>(null);
    const [isDisbandingGroup, setIsDisbandingGroup] = useState(false);

    React.useEffect(() => {
        if (activeDrawerGroup) {
            setGroupQuotaInput(activeDrawerGroup.quota > 0 ? String(activeDrawerGroup.quota) : '');
        }
    }, [activeDrawerGroup?.type, activeDrawerGroup?.id, activeDrawerGroup?.quota]);

    const handleSaveGroupSettings = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeDrawerGroup) {
            return;
        }
        const parsed = groupQuotaInput.trim() === '' ? null : parseInt(groupQuotaInput, 10);
        if (parsed !== null && parsed < activeDrawerGroup.members_count) {
            toast.error(`Cannot set limit to ${parsed} when ${activeDrawerGroup.members_count} member(s) are already in this group.`);
            return;
        }
        setIsSavingGroupSettings(true);
        router.post(
            `${basePath}/groups/${activeDrawerGroup.type}/${activeDrawerGroup.id}/settings`,
            { quota: parsed },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsGroupSettingsModalOpen(false);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] || 'Failed to update group settings.');
                },
                onFinish: () => setIsSavingGroupSettings(false),
            }
        );
    };

    const handleConfirmDisbandGroup = (attendees: AttendeeSubmission[]) => {
        if (!disbandingGroup) {
            return;
        }
        setIsDisbandingGroup(true);
        router.post(
            `${basePath}/groups/${disbandingGroup.type}/${disbandingGroup.id}/disband`,
            { attendees },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDisbandingGroup(null);
                    setSelectedGroupKey(null);
                },
                onFinish: () => setIsDisbandingGroup(false),
            }
        );
    };

    // Complete Task modal state
    const [completingTask, setCompletingTask] = useState<TaskModel | null>(null);
    const [hoursLogged, setHoursLogged] = useState('2.0');
    const [autoLogHours, setAutoLogHours] = useState(true);

    // Daily Food Pickup modals state
    const todayIso = new Date().toISOString().slice(0, 10);
    const [isCreatePickupOpen, setIsCreatePickupOpen] = useState(false);
    const [pickupPartnerId, setPickupPartnerId] = useState(dailyFoodPartners[0]?.id?.toString() || '');
    const [pickupDate, setPickupDate] = useState(todayIso);
    const [pickupVolunteerId, setPickupVolunteerId] = useState('');
    const [pickupSummary, setPickupSummary] = useState('');

    const [assigningPickup, setAssigningPickup] = useState<FoodPickupModel | null>(null);
    const [assignPickupVolunteerId, setAssignPickupVolunteerId] = useState(volunteerList[0]?.id?.toString() || '');

    const [updatingPickup, setUpdatingPickup] = useState<FoodPickupModel | null>(null);
    const [pickupTargetStatus, setPickupTargetStatus] = useState<'completed' | 'missed'>('completed');
    const [pickupHoursLogged, setPickupHoursLogged] = useState('1.0');
    const [pickupAdminNotes, setPickupAdminNotes] = useState('');

    const handleCreatePickupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`${basePath}/food-pickups`, {
            partner_id: pickupPartnerId,
            pickup_date: pickupDate,
            assigned_volunteer_id: pickupVolunteerId || null,
            food_summary: pickupSummary || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreatePickupOpen(false);
                setPickupVolunteerId('');
                setPickupSummary('');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'Failed to schedule pickup.');
            },
        });
    };

    const handleAssignPickupSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!assigningPickup) {
return;
}

        router.post(`${basePath}/food-pickups/${assigningPickup.id}/assign`, {
            assigned_volunteer_id: assignPickupVolunteerId,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setAssigningPickup(null);
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'Failed to assign volunteer.');
            },
        });
    };

    const handleUpdatePickupStatusSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!updatingPickup) {
return;
}

        router.post(`${basePath}/food-pickups/${updatingPickup.id}/status`, {
            status: pickupTargetStatus,
            hours_logged: pickupTargetStatus === 'completed' ? pickupHoursLogged : undefined,
            admin_notes: pickupAdminNotes || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setUpdatingPickup(null);
                setPickupAdminNotes('');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'Failed to update pickup status.');
            },
        });
    };

    // Issue Certificate modal state
    const [isCertOpen, setIsCertOpen] = useState(false);
    const [certTargetUserId, setCertTargetUserId] = useState(recipientList[0]?.id?.toString() || '');
    const [certTargetEventId, setCertTargetEventId] = useState('');
    const [certTitle, setCertTitle] = useState('Certificate of Appreciation');
    const [certDesc, setCertDesc] = useState('');
    const issuedEventIdsForSelectedUser = new Set(
        certTargetUserId ? (issuedEventIdsByUser[certTargetUserId] ?? []) : [],
    );
    const availableCertEvents = events.filter(
        (eventItem) => !issuedEventIdsForSelectedUser.has(eventItem.id),
    );
    const isFiltering = useFilteredSectionLoading();

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(basePath, {
            search: searchQuery,
            status: statusFilter
        }, { preserveState: true });
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get(basePath, {
            search: searchQuery,
            status: status
        }, { preserveState: true });
    };

    const handleApprove = (appId: number) => {
        router.post(`${basePath}/applications/${appId}/approve`, {});
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!rejectionReason.trim()) {
return;
}

        router.post(`${basePath}/applications/${rejectingApp?.id}/reject`, {
            rejection_reason: rejectionReason
        }, {
            onSuccess: () => {
                setRejectingApp(null);
                setRejectionReason('');
            }
        });
    };

    const handleAssignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`${basePath}/assign`, {
            user_id: assignTargetUserId,
            event_id: assignActivityType === 'event' ? assignEventId : null,
            feeding_schedule_id: assignActivityType === 'feeding' ? assignScheduleId : null,
            role: assignRole
        }, {
            onSuccess: () => {
                setIsAssignOpen(false);
                setAssignTargetUserId('');
                setAssignEventId('');
                setAssignScheduleId('');
            },
            onError: (err) => {
                if (err.task_target) {
                    toast.error(err.task_target);
                } else {
                    toast.error('Failed to assign task.');
                }
            }
        });
    };

    const handleCompleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!completingTask) {
return;
}

        router.post(`${basePath}/tasks/${completingTask.id}/status`, {
            status: 'completed',
            hours_logged: autoLogHours ? null : parseFloat(hoursLogged)
        }, {
            onSuccess: () => {
                setCompletingTask(null);
            }
        });
    };

    const handleCancelTask = (taskId: number) => {
        openConfirmModal({
            title: 'Cancel Task Assignment',
            description: 'Are you sure you want to cancel this assignment?',
            confirmText: 'Cancel Assignment',
            variant: 'danger',
            onConfirm: () => {
                router.post(`${basePath}/tasks/${taskId}/status`, {
                    status: 'cancelled'
                });
            },
        });
    };

    const handleCertSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`${basePath}/issue-certificate`, {
            user_id: certTargetUserId,
            event_id: certTargetEventId || null,
            title: certTitle,
            description: certDesc
        }, {
            onSuccess: (page) => {
                const flashToast = (page as { flash?: { toast?: { type?: string } } }).flash?.toast;

                if (flashToast?.type === 'warning' || flashToast?.type === 'error') {
                    return;
                }

                setIsCertOpen(false);
                setCertTargetUserId('');
                setCertTargetEventId('');
                setCertDesc('');
            }
        });
    };

    // Unified pagination wrapper
    const Pagination = ({ links }: { links: any[] }) => (
        <DashboardPagination links={links} className="mt-4 rounded-xl border border-gray-100 dark:border-slate-800" />
    );

    return (
        <>
            <Head title="Volunteer Management" />
            <AdminPageShell 
                title="Volunteer Management"
                description="Review volunteer applications, monitor active members, assign tasks, and track volunteer contributions."
            >
                
                {/* Search and Filters Bar */}
                <AdminCard className="p-4 mb-6">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search applications, volunteers or tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 rounded-xl text-sm font-semibold outline-none border border-transparent focus:border-paw-orange dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Filter size={16} className="text-gray-400 shrink-0" />
                            <div className="min-w-[175px]">
                                <ModernSelect
                                    value={statusFilter}
                                    onChange={(val) => handleStatusFilterChange(val)}
                                    searchable={false}
                                    options={[
                                        { value: 'All', label: 'All Applications' },
                                        { value: 'pending', label: 'Pending' },
                                        { value: 'approved', label: 'Approved' },
                                        { value: 'rejected', label: 'Rejected' },
                                    ]}
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-paw-orange text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </AdminCard>

                {/* Navigation Tabs */}
                <div className="flex flex-nowrap items-center gap-1 sm:gap-2 border-b-2 border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto hide-scrollbar">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-4 sm:px-6 py-3 sm:py-4 font-black text-xs sm:text-sm whitespace-nowrap shrink-0 border-b-2 -mb-[2px] transition-all cursor-pointer ${
                            activeTab === 'applications' ? 'border-paw-orange text-paw-orange' : 'border-transparent text-gray-400 hover:text-paw-navy dark:hover:text-white'
                        }`}
                    >
                        Applications ({applications.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('volunteers')}
                        className={`px-4 sm:px-6 py-3 sm:py-4 font-black text-xs sm:text-sm whitespace-nowrap shrink-0 border-b-2 -mb-[2px] transition-all cursor-pointer ${
                            activeTab === 'volunteers' ? 'border-paw-orange text-paw-orange' : 'border-transparent text-gray-400 hover:text-paw-navy dark:hover:text-white'
                        }`}
                    >
                        Active Volunteers ({volunteers.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-4 sm:px-6 py-3 sm:py-4 font-black text-xs sm:text-sm whitespace-nowrap shrink-0 border-b-2 -mb-[2px] transition-all cursor-pointer ${
                            activeTab === 'tasks' ? 'border-paw-orange text-paw-orange' : 'border-transparent text-gray-400 hover:text-paw-navy dark:hover:text-white'
                        }`}
                    >
                        Assigned Tasks ({tasks.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`px-4 sm:px-6 py-3 sm:py-4 font-black text-xs sm:text-sm whitespace-nowrap shrink-0 border-b-2 -mb-[2px] transition-all cursor-pointer ${
                            activeTab === 'groups' ? 'border-paw-orange text-paw-orange' : 'border-transparent text-gray-400 hover:text-paw-navy dark:hover:text-white'
                        }`}
                    >
                        Field Groups ({fieldGroups.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('food_pickups')}
                        className={`px-4 sm:px-6 py-3 sm:py-4 font-black text-xs sm:text-sm whitespace-nowrap shrink-0 border-b-2 -mb-[2px] transition-all cursor-pointer ${
                            activeTab === 'food_pickups' ? 'border-paw-orange text-paw-orange' : 'border-transparent text-gray-400 hover:text-paw-navy dark:hover:text-white'
                        }`}
                    >
                        Daily Food Pickups ({foodPickups.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('injuries')}
                        className={`px-4 sm:px-6 py-3 sm:py-4 font-black text-xs sm:text-sm whitespace-nowrap shrink-0 border-b-2 -mb-[2px] transition-all cursor-pointer inline-flex items-center gap-2 ${
                            activeTab === 'injuries' ? 'border-paw-orange text-paw-orange' : 'border-transparent text-gray-400 hover:text-paw-navy dark:hover:text-white'
                        }`}
                    >
                        <span>Injury Reports ({injuryReports.total})</span>
                        {(injuryStats.reported + injuryStats.medical_aid_initiated) > 0 && (
                            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white">
                                {injuryStats.reported + injuryStats.medical_aid_initiated}
                            </span>
                        )}
                    </button>
                </div>

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                    <AdminCard className="p-6">
                        <FilteredContentSkeleton isLoading={isFiltering} variant="table" rows={6} columns={6}>
                        {applications.data.length === 0 ? (
                            <p className="text-center text-gray-500 font-bold py-8">No volunteer applications found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm font-semibold border-collapse">
                                    <thead>
                                        <tr className="border-b dark:border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">Reference ID</th>
                                            <th className="py-3.5 px-4 min-w-[160px]">Name</th>
                                            <th className="py-3.5 px-4 min-w-[150px]">Role</th>
                                            <th className="py-3.5 px-4 min-w-[140px]">Contact</th>
                                            <th className="py-3.5 px-4 min-w-[200px]">Motivation</th>
                                            <th className="py-3.5 px-4 min-w-[100px] whitespace-nowrap">Status</th>
                                            <th className="py-3.5 px-4 text-right min-w-[100px] whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-850">
                                        {applications.data.map((app) => (
                                            <tr key={app.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                                <td className="py-4 px-4 font-bold whitespace-nowrap">{app.reference_number}</td>
                                                <td className="py-4 px-4">
                                                    <p className="font-bold text-[#0B2340] dark:text-white">{app.full_name}</p>
                                                    <p className="text-xs text-gray-400">{app.email}</p>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="font-bold">{app.role}</p>
                                                    {app.role === 'Foster Volunteer' && (
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                                                                Cap: {app.foster_capacity ?? 2}
                                                            </span>
                                                            {app.foster_preference && (
                                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-200">
                                                                    {app.foster_preference}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {app.role === 'Medic Volunteer' && (
                                                        <div className="mt-1">
                                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700 truncate max-w-[160px] inline-block" title={app.medic_certifications || ''}>
                                                                Cert: {app.medic_certifications || 'None'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {app.role === 'Transport' && (
                                                        <div className="mt-1">
                                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-700">
                                                                Licensed Driver ✓
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p>{app.mobile}</p>
                                                    <p className="text-xs text-gray-400 font-bold">{app.address}</p>
                                                </td>
                                                <td className="py-4 px-4 max-w-xs truncate" title={app.why}>{app.why}</td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                                        app.status === 'approved'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                            : app.status === 'rejected'
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right whitespace-nowrap">
                                                    {canApproveVolunteers && app.status === 'pending' && (
                                                        <div className="flex justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleApprove(app.id)}
                                                                className="p-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:bg-emerald-950/30 dark:hover:bg-emerald-600 dark:hover:text-white dark:text-emerald-400 rounded-xl transition-colors cursor-pointer"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle2 size={15} />
                                                            </button>
                                                            <button
                                                                onClick={() => setRejectingApp(app)}
                                                                className="p-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-500 dark:bg-red-950/30 dark:hover:bg-red-600 dark:hover:text-white dark:text-red-400 rounded-xl transition-colors cursor-pointer"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={15} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination links={applications.links} />
                            </div>
                        )}
                        </FilteredContentSkeleton>
                    </AdminCard>
                )}

                {/* Volunteers Tab */}
                {activeTab === 'volunteers' && (
                    <AdminCard className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">Active Volunteers Directory</h3>
                            <div className="flex gap-2">
                                {canAssignTasks && (
                                <button
                                    onClick={() => {
                                        setIsAssignOpen(true);

                                        if (volunteers.data.length > 0) {
setAssignTargetUserId(String(volunteers.data[0].id));
}

                                        if (events.length > 0) {
setAssignEventId(String(events[0].id));
}

                                        if (feedingSchedules.length > 0) {
setAssignScheduleId(String(feedingSchedules[0].id));
}
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-paw-orange text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 cursor-pointer"
                                >
                                    <Plus size={14} /> Assign Task
                                </button>
                                )}
                                {canCertifyVolunteers && (
                                <button
                                    onClick={() => {
                                        const initialUserId = volunteers.data.length > 0
                                            ? String(volunteers.data[0].id)
                                            : (recipientList[0]?.id?.toString() || '');
                                        const initialIssuedIds = new Set(
                                            initialUserId ? (issuedEventIdsByUser[initialUserId] ?? []) : [],
                                        );
                                        const firstAvailableEvent = events.find(
                                            (eventItem) => !initialIssuedIds.has(eventItem.id),
                                        );

                                        setIsCertOpen(true);
                                        setCertTargetUserId(initialUserId);
                                        setCertTargetEventId(firstAvailableEvent ? String(firstAvailableEvent.id) : '');
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-paw-navy text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 cursor-pointer"
                                >
                                    <Award size={14} /> Issue Certificate
                                </button>
                                )}
                            </div>
                        </div>

                        {volunteers.data.length === 0 ? (
                            <p className="text-center text-gray-500 font-bold py-8">No active volunteers found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm font-semibold border-collapse">
                                    <thead>
                                        <tr className="border-b dark:border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Volunteer ID</th>
                                            <th className="py-3.5 px-4 min-w-[180px]">Name</th>
                                            <th className="py-3.5 px-4 min-w-[200px]">Email</th>
                                            <th className="py-3.5 px-4 text-right min-w-[140px] whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-850">
                                        {volunteers.data.map((vol) => (
                                            <tr key={vol.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                                <td className="py-4 px-4 font-bold whitespace-nowrap">#VOL-{vol.id}</td>
                                                <td className="py-4 px-4 font-bold text-[#0B2340] dark:text-white">{vol.name}</td>
                                                <td className="py-4 px-4">{vol.email}</td>
                                                <td className="py-4 px-4 text-right whitespace-nowrap">
                                                    {canAssignTasks && (
                                                    <button
                                                        onClick={() => {
                                                            setAssignTargetUserId(String(vol.id));
                                                            setIsAssignOpen(true);
                                                        }}
                                                        className="text-xs bg-paw-orange/10 text-paw-orange font-black uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-paw-orange hover:text-white cursor-pointer"
                                                    >
                                                        Assign Activity
                                                    </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination links={volunteers.links} />
                            </div>
                        )}
                    </AdminCard>
                )}

                {/* Assigned Tasks Tab */}
                {activeTab === 'tasks' && (
                    <AdminCard className="p-6">
                        {tasks.data.length === 0 ? (
                            <p className="text-center text-gray-500 font-bold py-8">No assigned volunteer tasks found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm font-semibold border-collapse">
                                    <thead>
                                        <tr className="border-b dark:border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="py-3.5 px-4 min-w-[160px]">Volunteer</th>
                                            <th className="py-3.5 px-4 min-w-[200px]">Assigned Activity</th>
                                            <th className="py-3.5 px-4 min-w-[130px]">Role</th>
                                            <th className="py-3.5 px-4 min-w-[100px] whitespace-nowrap">Hours</th>
                                            <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">Status</th>
                                            <th className="py-3.5 px-4 text-right min-w-[130px] whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-850">
                                        {tasks.data.map((task) => (
                                            <tr key={task.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                                <td className="py-4 px-4 font-bold text-[#0B2340] dark:text-white">
                                                    {task.user?.name || (task.guest_name ? `${task.guest_name} (Guest)` : 'Unknown Attendee')}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="font-bold">
                                                        {task.event
                                                            ? task.event.title
                                                            : task.feeding_schedule
                                                                ? task.feeding_schedule.zone
                                                                : task.pet_report
                                                                    ? `Rescue: ${task.pet_report.name || task.pet_report.animal_type || `Report #${task.pet_report.id}`}`
                                                                    : task.partner_food_pickup
                                                                        ? `Food Pickup: ${task.partner_food_pickup.partner?.name || 'Partner'}`
                                                                        : 'General Assignment'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-bold">
                                                        {task.event
                                                            ? 'Event Proper'
                                                            : task.feeding_schedule
                                                                ? 'Feeding Zone Route'
                                                                : task.pet_report
                                                                    ? 'Emergency Rescue'
                                                                    : task.partner_food_pickup
                                                                        ? `Daily Food Pickup (${task.partner_food_pickup.pickup_date})`
                                                                        : 'Task'}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-4">{task.role}</td>
                                                <td className="py-4 px-4 font-bold whitespace-nowrap">{parseFloat(task.hours_logged)} hrs</td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                                        task.status === 'completed'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                            : task.status === 'cancelled'
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                                    }`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right whitespace-nowrap">
                                                    {canAssignTasks && task.status === 'pending' && (
                                                        <div className="flex justify-end gap-1.5">
                                                            <button
                                                                onClick={() => {
                                                                    setCompletingTask(task);
                                                                    setAutoLogHours(true);
                                                                    setHoursLogged('2.0');
                                                                }}
                                                                className="p-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:bg-emerald-950/30 dark:hover:bg-emerald-600 dark:hover:text-white dark:text-emerald-400 rounded-xl transition-colors cursor-pointer"
                                                                title="Verify & Complete"
                                                            >
                                                                <CheckCircle2 size={15} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelTask(task.id)}
                                                                className="p-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-500 dark:bg-red-950/30 dark:hover:bg-red-600 dark:hover:text-white dark:text-red-400 rounded-xl transition-colors cursor-pointer"
                                                                title="Cancel Assignment"
                                                            >
                                                                <XCircle size={15} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination links={tasks.links} />
                            </div>
                        )}
                    </AdminCard>
                )}

                {/* Field Groups Management Tab */}
                {activeTab === 'groups' && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                    Field Groups & Team Rosters
                                </h3>
                                <p className="text-xs font-semibold text-gray-400">
                                    Manage Feeding Route and Event teams — assign members, update roles, coordinate in chat, or inspect disbanded group archives.
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-xl bg-gray-100 p-1 dark:bg-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setGroupFilter('active')}
                                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                        groupFilter === 'active'
                                            ? 'bg-white text-[#0B2340] shadow-xs dark:bg-slate-900 dark:text-white'
                                            : 'text-gray-500 hover:text-[#0B2340] dark:text-gray-400'
                                    }`}
                                >
                                    Active ({fieldGroups.filter((g) => !g.is_disbanded).length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGroupFilter('disbanded')}
                                    className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                        groupFilter === 'disbanded'
                                            ? 'bg-white text-[#0B2340] shadow-xs dark:bg-slate-900 dark:text-white'
                                            : 'text-gray-500 hover:text-[#0B2340] dark:text-gray-400'
                                    }`}
                                >
                                    <Archive size={12} />
                                    Disbanded ({fieldGroups.filter((g) => g.is_disbanded).length})
                                </button>
                            </div>
                        </div>

                        {fieldGroups.filter((g) => (groupFilter === 'disbanded' ? g.is_disbanded : !g.is_disbanded)).length === 0 ? (
                            <AdminCard className="p-8 text-center">
                                <Users className="mx-auto mb-3 text-gray-300" size={40} />
                                <p className="text-sm font-bold text-gray-500">
                                    {groupFilter === 'disbanded'
                                        ? 'No disbanded groups archived yet.'
                                        : 'No active Feeding Routes or upcoming Events found.'}
                                </p>
                            </AdminCard>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {fieldGroups
                                    .filter((g) => (groupFilter === 'disbanded' ? g.is_disbanded : !g.is_disbanded))
                                    .map((group) => (
                                    <AdminCard key={`${group.type}-${group.id}`} className="p-5 flex flex-col justify-between gap-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                                    group.type === 'feeding'
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        : 'bg-paw-orange/15 text-paw-orange'
                                                }`}>
                                                    {group.type === 'feeding' ? 'Feeding Route' : 'Event Team'}
                                                </span>
                                                {group.execution_status && (
                                                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-gray-600 dark:bg-slate-800 dark:text-gray-300">
                                                        {group.execution_status.replace('_', ' ')}
                                                    </span>
                                                )}
                                                {group.is_disbanded && (
                                                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                                        Disbanded
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="mt-2 font-fredoka text-base font-bold text-[#0B2340] dark:text-white">
                                                {group.name}
                                            </h4>
                                            <p className="mt-0.5 text-xs font-semibold text-gray-400">
                                                {group.schedule}
                                            </p>
                                            {group.is_disbanded && (
                                                <p className="mt-2 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                                                    {group.completed_count ?? 0} attended • {group.no_show_count ?? 0} no-show • {group.total_hours_logged ?? 0} hrs
                                                    {group.type === 'feeding' ? ` • ${group.total_food_distributed ?? 0} packs` : ''}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3.5 dark:border-gray-800">
                                            <TeamAvatarStack
                                                members={group.members}
                                                maxVisible={3}
                                                onClick={() => setSelectedGroupKey({ type: group.type, id: group.id })}
                                                emptyText="0 members"
                                            />
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setSummaryGroupKey({ type: group.type, id: group.id })}
                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0B2340] transition hover:border-paw-blue hover:text-paw-blue dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                                                    title="Post-Mission Summary Report"
                                                >
                                                    <FileText size={12} />
                                                    Summary
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setChatGroupKey({ type: group.type, id: group.id })}
                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-paw-blue px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white transition hover:bg-blue-700"
                                                >
                                                    <MessageSquare size={12} />
                                                    Chat
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedGroupKey({ type: group.type, id: group.id })}
                                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#0B2340] transition hover:bg-paw-orange hover:text-white dark:bg-slate-800 dark:text-white"
                                                >
                                                    <SlidersHorizontal size={12} />
                                                    Manage
                                                </button>
                                            </div>
                                        </div>
                                    </AdminCard>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Daily Food Pickups Tab */}
                {activeTab === 'food_pickups' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <AdminCard className="p-4">
                                <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Today&apos;s Pickups</p>
                                <p className="mt-1 font-fredoka text-2xl font-bold text-[#0B2340] dark:text-white">{foodPickupStats.today_total}</p>
                            </AdminCard>
                            <AdminCard className="p-4">
                                <p className="text-[11px] font-black uppercase tracking-wider text-amber-500">Fetched (Verify)</p>
                                <p className="mt-1 font-fredoka text-2xl font-bold text-amber-600">{foodPickupStats.awaiting_verification}</p>
                            </AdminCard>
                            <AdminCard className="p-4">
                                <p className="text-[11px] font-black uppercase tracking-wider text-emerald-500">Completed</p>
                                <p className="mt-1 font-fredoka text-2xl font-bold text-emerald-600">{foodPickupStats.completed}</p>
                            </AdminCard>
                            <AdminCard className="p-4">
                                <p className="text-[11px] font-black uppercase tracking-wider text-red-500">Missed</p>
                                <p className="mt-1 font-fredoka text-2xl font-bold text-red-600">{foodPickupStats.missed}</p>
                            </AdminCard>
                        </div>

                        <AdminCard className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white flex items-center gap-2">
                                        <Store className="text-emerald-600" size={20} /> Daily Partner Food Pickups
                                    </h3>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Assign volunteers to fetch 1-day shelf-life food from daily food partners (e.g., Greenwich) and verify completion or mark missed.
                                    </p>
                                </div>
                                {canAssignTasks && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPickupPartnerId(dailyFoodPartners[0]?.id?.toString() || '');
                                        setPickupDate(todayIso);
                                        setPickupVolunteerId('');
                                        setPickupSummary('');
                                        setIsCreatePickupOpen(true);
                                    }}
                                    disabled={dailyFoodPartners.length === 0}
                                    className="px-4 py-2.5 bg-paw-orange hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                    <Plus size={16} /> Schedule Pickup
                                </button>
                                )}
                            </div>

                            {todayFoodPickups.length > 0 && (
                                <div className="mb-6 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <p className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                            Today&apos;s Daily Pickups ({todayIso})
                                        </p>
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                            Auto-ready for volunteer assignment
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {todayFoodPickups.map((todayItem) => (
                                            <div
                                                key={todayItem.id}
                                                className="flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-emerald-100 dark:border-slate-800 shadow-xs"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm text-[#0B2340] dark:text-white truncate">
                                                        {todayItem.partner?.name || 'Food Partner'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {todayItem.assigned_volunteer
                                                            ? `Assigned to ${todayItem.assigned_volunteer.name}`
                                                            : 'Needs a volunteer to fetch today'}
                                                    </p>
                                                </div>
                                                {canAssignTasks && todayItem.status === 'pending' && !todayItem.assigned_volunteer_id ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAssigningPickup(todayItem);
                                                            setAssignPickupVolunteerId(volunteerList[0]?.id?.toString() || '');
                                                        }}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-wider rounded-lg cursor-pointer inline-flex items-center gap-1 shrink-0"
                                                    >
                                                        <UserPlus size={13} />
                                                        Select Volunteer
                                                    </button>
                                                ) : (
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                                                        todayItem.status === 'completed'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                            : todayItem.status === 'fetched'
                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                                                : todayItem.status === 'missed'
                                                                    ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                                    }`}>
                                                        {todayItem.status === 'fetched' ? 'Fetched (Verify)' : todayItem.status}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {dailyFoodPartners.length === 0 && (
                                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                                    No active food partners are flagged for daily shelter food yet. Enable &ldquo;Provides Daily Shelter Food&rdquo; in SuperAdmin Partner Management.
                                </div>
                            )}

                            {foodPickups.data.length === 0 ? (
                                <p className="text-center text-gray-500 font-bold py-8">No daily food pickups scheduled yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm font-semibold border-collapse">
                                        <thead>
                                            <tr className="border-b dark:border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                                <th className="py-3.5 px-4 min-w-[180px]">Partner</th>
                                                <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Pickup Date</th>
                                                <th className="py-3.5 px-4 min-w-[170px]">Assigned Volunteer</th>
                                                <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Status</th>
                                                <th className="py-3.5 px-4 min-w-[180px]">Notes</th>
                                                <th className="py-3.5 px-4 text-right min-w-[230px] whitespace-nowrap">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-850">
                                            {foodPickups.data.map((pickup) => {
                                                const isFinal = pickup.status === 'completed' || pickup.status === 'missed';

                                                return (
                                                    <tr key={pickup.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                                        <td className="py-4 px-4">
                                                            <p className="font-bold text-[#0B2340] dark:text-white">{pickup.partner?.name || 'Food Partner'}</p>
                                                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-[9px] font-black uppercase">
                                                                1-Day Shelf Life
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 whitespace-nowrap font-bold">{pickup.pickup_date}</td>
                                                        <td className="py-4 px-4">
                                                            {pickup.assigned_volunteer ? (
                                                                <div>
                                                                    <p className="font-bold text-[#0B2340] dark:text-white">{pickup.assigned_volunteer.name}</p>
                                                                    <p className="text-xs text-gray-400">{pickup.assigned_volunteer.email}</p>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-amber-600 font-bold italic">Unassigned</span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                                                pickup.status === 'completed'
                                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                                    : pickup.status === 'fetched'
                                                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                                                        : pickup.status === 'missed'
                                                                            ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                                                                            : pickup.status === 'assigned'
                                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                                                                : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
                                                            }`}>
                                                                {pickup.status === 'fetched' ? 'Fetched (Verify)' : pickup.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-xs text-gray-500 max-w-xs">
                                                            {pickup.volunteer_notes && (
                                                                <p className="text-emerald-700 dark:text-emerald-300 font-semibold">Volunteer: {pickup.volunteer_notes}</p>
                                                            )}
                                                            {pickup.admin_notes && (
                                                                <p className="text-gray-600 dark:text-gray-400">Admin: {pickup.admin_notes}</p>
                                                            )}
                                                            {!pickup.volunteer_notes && !pickup.admin_notes && (
                                                                <span>{pickup.food_summary || '—'}</span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4 text-right whitespace-nowrap">
                                                            {canAssignTasks && !isFinal && (
                                                                <div className="flex justify-end gap-1.5 flex-wrap">
                                                                    {pickup.status !== 'fetched' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setAssigningPickup(pickup);
                                                                                setAssignPickupVolunteerId(
                                                                                    pickup.assigned_volunteer_id?.toString() || volunteerList[0]?.id?.toString() || ''
                                                                                );
                                                                            }}
                                                                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 dark:bg-blue-950/30 dark:hover:bg-blue-600 dark:hover:text-white dark:text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                                                                        >
                                                                            <UserPlus size={12} />
                                                                            {pickup.assigned_volunteer_id ? 'Reassign' : 'Select Volunteer'}
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setUpdatingPickup(pickup);
                                                                            setPickupTargetStatus('completed');
                                                                            setPickupHoursLogged('1.0');
                                                                            setPickupAdminNotes('');
                                                                        }}
                                                                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-600 dark:hover:text-white dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                                                                    >
                                                                        <PackageCheck size={12} />
                                                                        Completed
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setUpdatingPickup(pickup);
                                                                            setPickupTargetStatus('missed');
                                                                            setPickupAdminNotes('');
                                                                        }}
                                                                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 dark:bg-red-950/30 dark:hover:bg-red-600 dark:hover:text-white dark:text-red-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                                                                    >
                                                                        <AlertTriangle size={12} />
                                                                        Missed
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    <Pagination links={foodPickups.links} />
                                </div>
                            )}
                        </AdminCard>
                    </div>
                )}

                {/* Field Injury Reports Tab */}
                {activeTab === 'injuries' && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                    Volunteer Field Injury & Medical Aid
                                </h3>
                                <p className="text-xs font-semibold text-gray-400">
                                    Review volunteer-submitted injuries or log a field injury directly and assign an available Field Medic or Lead.
                                </p>
                            </div>
                            {canAssignTasks && (
                                <button
                                    type="button"
                                    onClick={() => setIsLogInjuryOpen(true)}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:bg-rose-700"
                                >
                                    <Plus size={14} />
                                    Log Volunteer Injury
                                </button>
                            )}
                        </div>

                        {/* Available Field Medics & Team Leads */}
                        <AdminCard className="p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                    <HeartPulse size={14} />
                                    Available Field Medics & Route Leads ({fieldMedicsAndLeads.length})
                                </span>
                            </div>
                            {fieldMedicsAndLeads.length === 0 ? (
                                <p className="text-xs font-semibold text-gray-400">
                                    No active Field Medics or Route Leads assigned right now. You can assign a volunteer with the &quot;Medic&quot; or &quot;Route Lead&quot; role in Assign Task.
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {fieldMedicsAndLeads.map((m) => (
                                        <span
                                            key={m.id}
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                m.in_field
                                                    ? 'border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                    : 'border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300'
                                            }`}
                                        >
                                            <span>{m.name}</span>
                                            <span className="text-[10px] uppercase opacity-75">• {m.role} ({m.assignment})</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </AdminCard>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <AdminCard className="p-4">
                                <p className="text-[11px] font-black uppercase tracking-wider text-amber-600">Reported (Needs Aid)</p>
                                <p className="mt-1 font-fredoka text-2xl font-bold text-amber-600">{injuryStats.reported}</p>
                            </AdminCard>
                            <AdminCard className="p-4">
                                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600">Medical Aid Initiated</p>
                                <p className="mt-1 font-fredoka text-2xl font-bold text-blue-600">{injuryStats.medical_aid_initiated}</p>
                            </AdminCard>
                            <AdminCard className="p-4">
                                <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Confirmed & Closed</p>
                                <p className="mt-1 font-fredoka text-2xl font-bold text-emerald-600">{injuryStats.confirmed}</p>
                            </AdminCard>
                        </div>

                        <AdminCard className="p-6">
                            {injuryReports.data.length === 0 ? (
                                <p className="text-center text-gray-500 font-bold py-8">No volunteer field injury reports found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {injuryReports.data.map((report) => (
                                        <div
                                            key={report.id}
                                            className="rounded-2xl border border-gray-100 p-5 dark:border-gray-800 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
                                        >
                                            <div className="space-y-2 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-fredoka text-base font-bold text-[#0B2340] dark:text-white">
                                                        #{report.id} • {report.user?.name || 'Volunteer'}
                                                    </span>
                                                    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                                        {incidentTypes[report.incident_type] || report.incident_type} ({report.severity})
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                                            report.status === 'confirmed'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                                : report.status === 'medical_aid_initiated'
                                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                        }`}
                                                    >
                                                        {report.status.replace(/_/g, ' ')}
                                                    </span>
                                                </div>

                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{report.description}</p>

                                                <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-500">
                                                    <span>Occurred: {new Date(report.incident_occurred_at).toLocaleString()}</span>
                                                    {report.location && <span>Location: {report.location}</span>}
                                                    {report.body_part && <span>Body Part: {report.body_part}</span>}
                                                    {report.user?.phone && <span>Contact: {report.user.phone}</span>}
                                                </div>

                                                {report.medical_aid_initiated_at && (
                                                    <div className="rounded-xl bg-blue-50/70 p-3 text-xs font-semibold text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                                                        Aid: {medicalAidTypes[report.medical_aid_type || ''] || report.medical_aid_type}
                                                        {report.medical_facility ? ` • ${report.medical_facility}` : ''}
                                                        {report.assigned_medic ? ` • Field Medic: ${report.assigned_medic.name}` : ''}
                                                        {report.medical_aid_notes ? ` — ${report.medical_aid_notes}` : ''}
                                                    </div>
                                                )}

                                                {report.confirmed_at && (
                                                    <div className="rounded-xl bg-emerald-50/70 p-3 text-xs font-semibold text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                                                        Confirmed {new Date(report.confirmed_at).toLocaleString()}
                                                        {report.confirmation_notes ? ` — ${report.confirmation_notes}` : ''}
                                                    </div>
                                                )}
                                            </div>

                                            {canAssignTasks && (
                                                <div className="flex shrink-0 items-center gap-2">
                                                    {report.status === 'reported' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setInitiatingInjury(report);
                                                                setMedicalAidType(Object.keys(medicalAidTypes)[0] || 'anti_rabies_tetanus');
                                                                setMedicalFacility('');
                                                                setMedicalAidNotes('');
                                                                setAssignedMedicId(report.assigned_medic?.id ? String(report.assigned_medic.id) : '');
                                                            }}
                                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-700"
                                                        >
                                                            <Stethoscope size={14} />
                                                            Initiate Medical Aid
                                                        </button>
                                                    )}
                                                    {report.status === 'medical_aid_initiated' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setConfirmingInjury(report);
                                                                setConfirmationNotes('');
                                                            }}
                                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            Confirm Medical Aid
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <Pagination links={injuryReports.links} />
                                </div>
                            )}
                        </AdminCard>
                    </div>
                )}

            </AdminPageShell>

            {/* Reject application Modal */}
            {rejectingApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <h3 className="font-fredoka text-xl font-bold mb-4 text-[#0B2340] dark:text-white flex items-center gap-2">
                            <ShieldAlert className="text-red-500" /> Decline Application
                        </h3>
                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Rejection Reason *</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Explain to the volunteer why their application is declined..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-xl outline-none focus:border-red-500 border border-transparent font-semibold text-sm dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingApp(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                    Decline Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Task / Add Member to Group Modal */}
            {isAssignOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                    {addingToGroup ? 'Add Member to Group' : 'Assign Task manually'}
                                </h3>
                                {addingToGroup && (
                                    <div className="mt-2.5 rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 dark:border-gray-800 dark:bg-slate-800/60">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                                addingToGroup.type === 'feeding'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                    : 'bg-paw-orange/15 text-paw-orange'
                                            }`}>
                                                {addingToGroup.type === 'feeding' ? 'Feeding Route' : 'Event Team'}
                                            </span>
                                            <span className="text-xs font-bold text-[#0B2340] dark:text-white">
                                                {addingToGroup.name}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                            {addingToGroup.schedule} • {addingToGroup.members_count} / {addingToGroup.quota > 0 ? addingToGroup.quota : '∞'} members
                                        </p>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAssignOpen(false);
                                    setAddingToGroup(null);
                                }}
                                className="cursor-pointer rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                handleAssignSubmit(e);
                                setAddingToGroup(null);
                            }}
                            className="space-y-4"
                        >
                            <ModernSelect
                                label="Volunteer"
                                required
                                searchable
                                value={assignTargetUserId}
                                onChange={(val) => setAssignTargetUserId(val)}
                                placeholder="Search volunteer by name or email..."
                                options={volunteerList.map(v => ({
                                    value: String(v.id),
                                    label: v.name,
                                    description: v.email,
                                }))}
                            />

                            {!addingToGroup && (
                                <>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Activity Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setAssignActivityType('event')}
                                                className={`py-3 rounded-xl border text-sm font-bold uppercase ${
                                                    assignActivityType === 'event' ? 'border-paw-orange bg-paw-orange/10 text-paw-orange' : 'border-gray-200 dark:border-gray-800 dark:text-gray-300'
                                                }`}
                                            >
                                                Event Proper
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAssignActivityType('feeding')}
                                                className={`py-3 rounded-xl border text-sm font-bold uppercase ${
                                                    assignActivityType === 'feeding' ? 'border-paw-orange bg-paw-orange/10 text-paw-orange' : 'border-gray-200 dark:border-gray-800 dark:text-gray-300'
                                                }`}
                                            >
                                                Feeding Route
                                            </button>
                                        </div>
                                    </div>

                                    {assignActivityType === 'event' ? (
                                        <ModernSelect
                                            label="Select Event"
                                            required
                                            searchable
                                            value={assignEventId}
                                            onChange={(val) => setAssignEventId(val)}
                                            placeholder="Select event..."
                                            options={events.map(e => ({
                                                value: String(e.id),
                                                label: e.title,
                                            }))}
                                        />
                                    ) : (
                                        <ModernSelect
                                            label="Select Feeding Route"
                                            required
                                            searchable
                                            value={assignScheduleId}
                                            onChange={(val) => setAssignScheduleId(val)}
                                            placeholder="Select feeding route..."
                                            options={feedingSchedules.map(s => ({
                                                value: String(s.id),
                                                label: s.zone,
                                            }))}
                                        />
                                    )}
                                </>
                            )}

                            {assignActivityType === 'feeding' ? (
                                <div className="space-y-2">
                                    <ModernSelect
                                        label="Assigned Role"
                                        required
                                        value={assignRole}
                                        onChange={(val) => setAssignRole(val)}
                                        placeholder="Select role..."
                                        options={GROUP_ROLE_OPTIONS}
                                    />
                                    {(() => {
                                        const selectedRoleInfo = GROUP_ROLE_OPTIONS.find((r) => r.value === assignRole);

                                        if (!selectedRoleInfo) {
return null;
}

                                        return (
                                            <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 px-3.5 py-2.5 text-xs font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                                                <span className="font-black">{selectedRoleInfo.label}:</span> {selectedRoleInfo.description}
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                                        Event Role *
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {EVENT_ROLE_PRESETS.map((preset) => (
                                            <button
                                                key={preset.value}
                                                type="button"
                                                onClick={() => setAssignRole(preset.value)}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition text-center ${
                                                    assignRole === preset.value
                                                        ? 'bg-paw-orange text-white shadow-xs'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300'
                                                }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                    {(() => {
                                        const selectedEventRole = EVENT_ROLE_PRESETS.find((r) => r.value === assignRole);

                                        if (!selectedEventRole) {
return null;
}

                                        return (
                                            <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 px-3.5 py-2.5 text-xs font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                                                <span className="font-black">{selectedEventRole.value}:</span> {selectedEventRole.description}
                                            </div>
                                        );
                                    })()}
                                    <input
                                        required
                                        type="text"
                                        placeholder="Or type a custom event role (e.g., Vet Assistant)..."
                                        value={assignRole}
                                        onChange={(e) => setAssignRole(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAssignOpen(false);
                                        setAddingToGroup(null);
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-paw-orange text-white hover:bg-orange-650 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                    {addingToGroup ? 'Add Member' : 'Assign Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complete Task Modal */}
            {completingTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <h3 className="font-fredoka text-xl font-bold mb-4 text-[#0B2340] dark:text-white">Verify Task Completion</h3>
                        <form onSubmit={handleCompleteSubmit} className="space-y-4">
                            <label className="flex items-start gap-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-slate-800/60 p-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoLogHours}
                                    onChange={(e) => setAutoLogHours(e.target.checked)}
                                    className="mt-0.5 rounded border-gray-300 text-paw-orange focus:ring-paw-orange"
                                />
                                <div className="text-xs">
                                    <span className="font-bold text-[#0B2340] dark:text-white block">
                                        Automatically calculate hours
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Uses task type &amp; elapsed time (4 hrs events, 1.5 hrs feeding, 1 hr pickup, 0.5–8 hrs rescue).
                                    </span>
                                </div>
                            </label>
                            {!autoLogHours && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Hours Logged *</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="999"
                                        value={hoursLogged}
                                        onChange={(e) => setHoursLogged(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCompletingTask(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                    Complete Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Issue Certificate Modal */}
            {isCertOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">Issue Recognition Certificate</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-4">Generates an official certificate using the ISF Certificate of Participation template with a unique ID and verification code.</p>
                        <form onSubmit={handleCertSubmit} className="space-y-4">
                            <ModernSelect
                                label="Recipient (Volunteer or User)"
                                required
                                value={certTargetUserId}
                                onChange={(val) => {
                                    setCertTargetUserId(val);
                                    const nextIssuedIds = new Set(
                                        val ? (issuedEventIdsByUser[val] ?? []) : [],
                                    );

                                    if (certTargetEventId && nextIssuedIds.has(Number(certTargetEventId))) {
                                        setCertTargetEventId('');
                                    }
                                }}
                                placeholder="Select recipient..."
                                options={recipientList.map(v => ({
                                    value: String(v.id),
                                    label: `${v.name}${'role' in v && v.role ? ` (${String(v.role).toUpperCase()})` : ''}`,
                                    description: v.email,
                                }))}
                            />

                            <ModernSelect
                                label="Associated Event (Optional)"
                                value={certTargetEventId}
                                onChange={(val) => setCertTargetEventId(val)}
                                placeholder="None / Manual Issuance"
                                options={[
                                    { value: '', label: 'None / Manual Issuance' },
                                    ...availableCertEvents.map(e => ({ value: String(e.id), label: e.title })),
                                ]}
                            />

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Certificate Title *</label>
                                <input
                                    required
                                    type="text"
                                    value={certTitle}
                                    onChange={(e) => setCertTitle(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Custom Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Add custom text or leave empty for default recognition statement..."
                                    value={certDesc}
                                    onChange={(e) => setCertDesc(e.target.value)}
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-xl outline-none focus:border-paw-orange border border-transparent font-semibold text-sm dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCertOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-paw-navy text-white hover:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                    Issue Certificate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Schedule Pickup Modal */}
            {isCreatePickupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <h3 className="font-fredoka text-xl font-bold mb-4 text-[#0B2340] dark:text-white flex items-center gap-2">
                            <Store className="text-emerald-600" /> Schedule Pickup
                        </h3>
                        <form onSubmit={handleCreatePickupSubmit} className="space-y-4">
                            <ModernSelect
                                label="Daily Food Partner"
                                required
                                value={pickupPartnerId}
                                onChange={(val) => setPickupPartnerId(val)}
                                placeholder="Select daily food partner..."
                                options={dailyFoodPartners.map(p => ({
                                    value: String(p.id),
                                    label: p.name,
                                    description: p.address || undefined,
                                }))}
                            />
                            <ModernDatePicker
                                label="Pickup Date (1-Day Shelf Life)"
                                required
                                allowPast
                                showPresets
                                value={pickupDate}
                                onChange={(date) => setPickupDate(date)}
                                placeholder="Select pickup date..."
                            />
                            <ModernSelect
                                label="Assign Volunteer (Optional)"
                                value={pickupVolunteerId}
                                onChange={(val) => setPickupVolunteerId(val)}
                                placeholder="-- Assign later --"
                                options={[
                                    { value: '', label: '-- Assign later --' },
                                    ...volunteerList.map(v => ({
                                        value: String(v.id),
                                        label: v.name,
                                        description: v.email,
                                    })),
                                ]}
                            />
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Food Batch Notes (Optional)</label>
                                <input
                                    type="text"
                                    value={pickupSummary}
                                    onChange={(e) => setPickupSummary(e.target.value)}
                                    placeholder="e.g., Daily prepared shelter food (use same day)"
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border dark:border-gray-800 text-sm font-semibold dark:text-white outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreatePickupOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-paw-orange text-white hover:bg-orange-600 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                    Schedule Pickup
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Select / Reassign Volunteer for Food Pickup Modal */}
            {assigningPickup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <h3 className="font-fredoka text-xl font-bold mb-2 text-[#0B2340] dark:text-white flex items-center gap-2">
                            <UserPlus className="text-blue-600" /> Select Volunteer
                        </h3>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                            Assign a volunteer to fetch daily food from <span className="font-bold text-[#0B2340] dark:text-white">{assigningPickup.partner?.name}</span> on <span className="font-bold">{assigningPickup.pickup_date}</span>.
                        </p>
                        <form onSubmit={handleAssignPickupSubmit} className="space-y-4">
                            <ModernSelect
                                label="Volunteer"
                                required
                                value={assignPickupVolunteerId}
                                onChange={(val) => setAssignPickupVolunteerId(val)}
                                placeholder="Select volunteer..."
                                options={volunteerList.map(v => ({
                                    value: String(v.id),
                                    label: v.name,
                                    description: v.email,
                                }))}
                            />
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAssigningPickup(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                    Assign Volunteer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Mark Food Pickup Completed / Missed Modal */}
            {updatingPickup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <h3 className="font-fredoka text-xl font-bold mb-2 text-[#0B2340] dark:text-white flex items-center gap-2">
                            {pickupTargetStatus === 'completed' ? (
                                <><PackageCheck className="text-emerald-600" /> Verify Food Pickup Completed</>
                            ) : (
                                <><AlertTriangle className="text-red-600" /> Mark Food Pickup Missed</>
                            )}
                        </h3>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                            {updatingPickup.partner?.name} — {updatingPickup.pickup_date}
                        </p>
                        <form onSubmit={handleUpdatePickupStatusSubmit} className="space-y-4">
                            {pickupTargetStatus === 'completed' && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Volunteer Hours Logged</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="24"
                                        value={pickupHoursLogged}
                                        onChange={(e) => setPickupHoursLogged(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border dark:border-gray-800 text-sm font-semibold dark:text-white outline-none"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    {pickupTargetStatus === 'completed' ? 'Verification Notes (Optional)' : 'Reason / Notes (Optional)'}
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={pickupTargetStatus === 'completed' ? 'Food delivered to shelter kitchen...' : 'Store closed early / no volunteer available...'}
                                    value={pickupAdminNotes}
                                    onChange={(e) => setPickupAdminNotes(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border dark:border-gray-800 text-sm font-semibold dark:text-white outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setUpdatingPickup(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${
                                        pickupTargetStatus === 'completed' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {pickupTargetStatus === 'completed' ? 'Confirm Completed' : 'Mark as Missed'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Initiate Medical Aid Modal */}
            {initiatingInjury && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <h3 className="font-fredoka text-xl font-bold mb-2 text-[#0B2340] dark:text-white flex items-center gap-2">
                            <Stethoscope className="text-blue-600" /> Initiate Medical Aid
                        </h3>
                        <p className="text-xs font-semibold text-gray-500 mb-4">
                            Volunteer: <span className="text-[#0B2340] dark:text-white">{initiatingInjury.user?.name}</span> (Report #{initiatingInjury.id})
                        </p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setIsSubmittingInjuryAction(true);
                                router.post(
                                    `${basePath}/injuries/${initiatingInjury.id}/initiate-aid`,
                                    {
                                        medical_aid_type: medicalAidType,
                                        medical_facility: medicalFacility || null,
                                        medical_aid_notes: medicalAidNotes,
                                        assigned_medic_user_id: assignedMedicId ? Number(assignedMedicId) : null,
                                    },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => setInitiatingInjury(null),
                                        onError: (errors) => toast.error(Object.values(errors)[0] || 'Failed to initiate medical aid.'),
                                        onFinish: () => setIsSubmittingInjuryAction(false),
                                    }
                                );
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Medical Aid Type *</label>
                                <select
                                    value={medicalAidType}
                                    onChange={(e) => setMedicalAidType(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                >
                                    {Object.entries(medicalAidTypes).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            {fieldMedicsAndLeads.length > 0 && (
                                <ModernSelect
                                    label="Assign Field Medic / Lead (Optional)"
                                    value={assignedMedicId}
                                    onChange={(val) => setAssignedMedicId(val)}
                                    placeholder="Select available medic or lead..."
                                    options={[
                                        { value: '', label: 'None / External Clinic Only' },
                                        ...fieldMedicsAndLeads.map((m) => ({
                                            value: String(m.id),
                                            label: `${m.name} (${m.role})`,
                                            description: m.assignment,
                                        })),
                                    ]}
                                />
                            )}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Clinic / Facility / Provider</label>
                                <input
                                    type="text"
                                    placeholder="e.g., City Animal Bite Center"
                                    value={medicalFacility}
                                    onChange={(e) => setMedicalFacility(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Instructions & Notes *</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Describe the medical aid dispatched or instructions for the volunteer..."
                                    value={medicalAidNotes}
                                    onChange={(e) => setMedicalAidNotes(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setInitiatingInjury(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingInjuryAction}
                                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingInjuryAction ? 'Saving...' : 'Initiate Aid'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Medical Aid Modal */}
            {confirmingInjury && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <h3 className="font-fredoka text-xl font-bold mb-2 text-[#0B2340] dark:text-white flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-600" /> Confirm Medical Aid
                        </h3>
                        <p className="text-xs font-semibold text-gray-500 mb-4">
                            Confirm that medical aid for <span className="text-[#0B2340] dark:text-white">{confirmingInjury.user?.name}</span> has been delivered and verified.
                        </p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setIsSubmittingInjuryAction(true);
                                router.post(
                                    `${basePath}/injuries/${confirmingInjury.id}/confirm-aid`,
                                    { confirmation_notes: confirmationNotes || null },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => setConfirmingInjury(null),
                                        onError: (errors) => toast.error(Object.values(errors)[0] || 'Failed to confirm medical aid.'),
                                        onFinish: () => setIsSubmittingInjuryAction(false),
                                    }
                                );
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Confirmation Notes (Optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="e.g., Volunteer received anti-rabies shot and is cleared for rest."
                                    value={confirmationNotes}
                                    onChange={(e) => setConfirmationNotes(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmingInjury(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingInjuryAction}
                                    className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingInjuryAction ? 'Confirming...' : 'Confirm Aid Completed'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Admin Log Volunteer Injury Modal */}
            {isLogInjuryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border bg-white shadow-2xl dark:border-gray-800 dark:bg-slate-900">
                        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                            <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white flex items-center gap-2">
                                <AlertTriangle className="text-rose-600" size={20} /> Log Volunteer Field Injury
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsLogInjuryOpen(false)}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl cursor-pointer dark:hover:bg-slate-800"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            id="admin-log-injury-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                setIsSubmittingInjuryAction(true);
                                router.post(
                                    `${basePath}/injuries`,
                                    {
                                        user_id: Number(logInjuryUserId),
                                        incident_type: logIncidentType,
                                        severity: logSeverity,
                                        body_part: logBodyPart || null,
                                        location: logLocation || null,
                                        incident_occurred_at: logOccurredAt.replace('T', ' '),
                                        description: logDescription,
                                        first_aid_applied: logFirstAidApplied,
                                        first_aid_notes: logFirstAidNotes || null,
                                        assigned_medic_user_id: logMedicId ? Number(logMedicId) : null,
                                        initiate_aid_now: logInitiateAidNow,
                                        medical_aid_type: logInitiateAidNow ? logAidType : null,
                                        medical_facility: logInitiateAidNow ? (logAidFacility || null) : null,
                                        medical_aid_notes: logInitiateAidNow ? logAidNotes : null,
                                    },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setIsLogInjuryOpen(false);
                                            setLogDescription('');
                                            setLogBodyPart('');
                                            setLogLocation('');
                                            setLogFirstAidNotes('');
                                            setLogAidNotes('');
                                        },
                                        onError: (errors) => toast.error(Object.values(errors)[0] || 'Failed to log volunteer injury.'),
                                        onFinish: () => setIsSubmittingInjuryAction(false),
                                    }
                                );
                            }}
                            className="flex-1 space-y-4 overflow-y-auto px-6 py-5"
                        >
                            <ModernSelect
                                label="Injured Volunteer"
                                required
                                value={logInjuryUserId}
                                onChange={(val) => setLogInjuryUserId(val)}
                                placeholder="Select injured volunteer..."
                                options={volunteerList.map((v) => ({
                                    value: String(v.id),
                                    label: v.name,
                                    description: v.email,
                                }))}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ModernSelect
                                    label="Incident Type"
                                    required
                                    value={logIncidentType}
                                    onChange={(val) => setLogIncidentType(val)}
                                    options={Object.entries(incidentTypes).map(([key, label]) => ({
                                        value: key,
                                        label,
                                    }))}
                                />
                                <ModernSelect
                                    label="Severity"
                                    required
                                    value={logSeverity}
                                    onChange={(val) => setLogSeverity(val)}
                                    options={Object.entries(severities).map(([key, label]) => ({
                                        value: key,
                                        label,
                                    }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Affected Body Part</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Left Hand"
                                        value={logBodyPart}
                                        onChange={(e) => setLogBodyPart(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                                <ModernDateTimePicker
                                    label="When Did It Happen?"
                                    required
                                    value={logOccurredAt}
                                    onChange={(val) => setLogOccurredAt(val)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Field Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Downtown Market Circuit"
                                    value={logLocation}
                                    onChange={(e) => setLogLocation(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Incident Details *</label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="Describe what happened..."
                                    value={logDescription}
                                    onChange={(e) => setLogDescription(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>

                            {fieldMedicsAndLeads.length > 0 && (
                                <ModernSelect
                                    label="Available Field Medic / Route Lead"
                                    value={logMedicId}
                                    onChange={(val) => setLogMedicId(val)}
                                    placeholder="Assign available medic or lead (optional)..."
                                    options={[
                                        { value: '', label: 'None selected' },
                                        ...fieldMedicsAndLeads.map((m) => ({
                                            value: String(m.id),
                                            label: `${m.name} (${m.role})`,
                                            description: m.assignment,
                                        })),
                                    ]}
                                />
                            )}

                            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20 space-y-3">
                                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-[#0B2340] dark:text-white">
                                    <input
                                        type="checkbox"
                                        checked={logInitiateAidNow}
                                        onChange={(e) => setLogInitiateAidNow(e.target.checked)}
                                        className="h-4 w-4 rounded accent-blue-600"
                                    />
                                    Initiate Medical Aid immediately
                                </label>
                                {logInitiateAidNow && (
                                    <div className="space-y-3">
                                        <ModernSelect
                                            label="Medical Aid Type"
                                            required
                                            value={logAidType}
                                            onChange={(val) => setLogAidType(val)}
                                            options={Object.entries(medicalAidTypes).map(([key, label]) => ({
                                                value: key,
                                                label,
                                            }))}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Clinic / Facility (optional)"
                                            value={logAidFacility}
                                            onChange={(e) => setLogAidFacility(e.target.value)}
                                            className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-xl outline-none font-semibold text-xs dark:text-white"
                                        />
                                        <textarea
                                            required
                                            rows={2}
                                            placeholder="Medical aid instructions / dispatch notes..."
                                            value={logAidNotes}
                                            onChange={(e) => setLogAidNotes(e.target.value)}
                                            className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-xl outline-none font-semibold text-xs dark:text-white"
                                        />
                                    </div>
                                )}
                            </div>
                        </form>

                        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={() => setIsLogInjuryOpen(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="admin-log-injury-form"
                                disabled={isSubmittingInjuryAction}
                                className="px-5 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                            >
                                {isSubmittingInjuryAction ? 'Saving...' : 'Save Injury Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Field Group Slide-Over Side Drawer */}
            {activeDrawerGroup && (
                <div
                    className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-xs"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedGroupKey(null);
                        }
                    }}
                >
                    <div className="flex h-full w-full max-w-md flex-col border-l border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-slate-900">
                        {/* Branded Header */}
                        <div className="shrink-0 border-b border-gray-100 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-6 dark:border-gray-800 dark:from-slate-800/70 dark:via-slate-900 dark:to-slate-900">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3.5">
                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                                        activeDrawerGroup.type === 'feeding'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                            : 'bg-paw-orange/15 text-paw-orange'
                                    }`}>
                                        {activeDrawerGroup.type === 'feeding' ? <Utensils size={20} /> : <Calendar size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                                activeDrawerGroup.type === 'feeding'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                    : 'bg-paw-orange/15 text-paw-orange'
                                            }`}>
                                                {activeDrawerGroup.type === 'feeding' ? 'Feeding Route' : 'Event Team'}
                                            </span>
                                            {activeDrawerGroup.execution_status && (
                                                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-gray-600 dark:bg-slate-800 dark:text-gray-300">
                                                    {activeDrawerGroup.execution_status.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="mt-1.5 font-fredoka text-xl font-bold leading-snug text-[#0B2340] dark:text-white">
                                            {activeDrawerGroup.name}
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedGroupKey(null)}
                                    className="cursor-pointer rounded-xl p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 shadow-2xs border border-gray-100 dark:border-gray-800 dark:bg-slate-800">
                                    <Clock size={13} className="text-paw-orange" />
                                    {activeDrawerGroup.schedule}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 shadow-2xs border border-gray-100 dark:border-gray-800 dark:bg-slate-800">
                                    <Users size={13} className="text-paw-blue" />
                                    {activeDrawerGroup.members_count} / {activeDrawerGroup.quota > 0 ? activeDrawerGroup.quota : '∞'} members
                                    {canAssignTasks && !activeDrawerGroup.is_disbanded && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setGroupQuotaInput(activeDrawerGroup.quota > 0 ? String(activeDrawerGroup.quota) : '');
                                                setIsGroupSettingsModalOpen(true);
                                            }}
                                            title="Update Member Limit"
                                            aria-label="Update Member Limit"
                                            className="ml-0.5 inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-gray-400 transition hover:bg-blue-50 hover:text-paw-blue dark:hover:bg-slate-700"
                                        >
                                            <SlidersHorizontal size={12} />
                                        </button>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 space-y-6 overflow-y-auto p-6">

                            {/* Key Role Coverage Grid (Feeding Routes only) */}
                            {activeDrawerGroup.type === 'feeding' && (
                                <div className="space-y-2.5">
                                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                                        Key Role Coverage
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: 'Route Lead', filled: activeDrawerGroup.has_lead, activeClass: 'border-sky-200 bg-sky-50/70 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300' },
                                            { label: 'Recorder', filled: activeDrawerGroup.has_recorder, activeClass: 'border-orange-200 bg-orange-50/70 text-paw-orange dark:border-orange-900 dark:bg-orange-950/30' },
                                            { label: 'Field Medic', filled: activeDrawerGroup.has_medic, activeClass: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className={`rounded-2xl border p-2.5 text-center ${
                                                    item.filled
                                                        ? item.activeClass
                                                        : 'border-dashed border-gray-200 bg-gray-50/60 text-gray-400 dark:border-gray-800 dark:bg-slate-800/40'
                                                }`}
                                            >
                                                <p className="text-[10px] font-black uppercase tracking-wider">{item.label}</p>
                                                <p className="mt-1 text-[11px] font-bold">
                                                    {item.filled ? 'Assigned' : 'Unassigned'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Group Roster */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                                        Group Roster ({activeDrawerGroup.members.length})
                                    </p>
                                </div>

                                {activeDrawerGroup.members.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/60 px-6 py-10 text-center dark:border-gray-800 dark:bg-slate-800/40">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-300 shadow-2xs dark:bg-slate-800 dark:text-gray-600">
                                            <Users size={22} />
                                        </span>
                                        <p className="mt-3 text-xs font-bold text-[#0B2340] dark:text-white">
                                            No volunteers assigned yet
                                        </p>
                                        <p className="mt-1 text-[11px] font-medium text-gray-400">
                                            Add members below to build this team and assign roles.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {activeDrawerGroup.members.map((member) => {
                                            const initials = member.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'V';
                                            const avatarSrc = member.avatar_path ? formatPhotoUrl(member.avatar_path) : null;

                                            return (
                                                <div
                                                    key={member.task_id}
                                                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-2xs transition hover:border-gray-200 dark:border-gray-800 dark:bg-slate-800/50"
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-black text-[#0B2340] dark:bg-slate-700 dark:text-white">
                                                            {avatarSrc ? (
                                                                <img src={avatarSrc} alt={member.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <span>{initials}</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs font-bold text-[#0B2340] dark:text-white">
                                                                {member.name}
                                                            </p>
                                                            <p className="truncate text-[11px] font-medium text-gray-400">
                                                                {member.email}{member.phone ? ` • ${member.phone}` : ''}
                                                            </p>
                                                            <span className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${getRoleBadgeStyle(member.role)}`}>
                                                                {member.role}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {canAssignTasks && (
                                                        <div className="flex shrink-0 items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingGroupMember({
                                                                        task_id: member.task_id,
                                                                        name: member.name,
                                                                        role: member.role,
                                                                        groupName: activeDrawerGroup.name,
                                                                        groupType: activeDrawerGroup.type,
                                                                    });
                                                                    setEditingMemberRole(member.role);
                                                                }}
                                                                className="cursor-pointer rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                                title="Change Role"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openConfirmModal({
                                                                    title: 'Remove Group Member',
                                                                    description: `Remove ${member.name} from "${activeDrawerGroup.name}"?`,
                                                                    confirmText: 'Remove',
                                                                    variant: 'danger',
                                                                    onConfirm: () => {
                                                                        router.delete(`${basePath}/groups/members/${member.task_id}`, {
                                                                            preserveScroll: true,
                                                                        });
                                                                    },
                                                                })}
                                                                className="cursor-pointer rounded-xl p-2 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40"
                                                                title="Remove from Group"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4 dark:border-gray-800 dark:bg-slate-900/90">
                            <button
                                type="button"
                                onClick={() => setSelectedGroupKey(null)}
                                className="cursor-pointer rounded-xl bg-white px-4 py-2 text-xs font-bold uppercase text-gray-600 border border-gray-200 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300"
                            >
                                Close
                            </button>
                            {canAssignTasks && !activeDrawerGroup.is_disbanded && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDisbandingGroup(activeDrawerGroup)}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-rose-600 transition hover:bg-rose-600 hover:text-white dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                                    >
                                        <Archive size={13} />
                                        Disband
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAssignActivityType(activeDrawerGroup.type);

                                            if (activeDrawerGroup.type === 'feeding') {
                                                setAssignScheduleId(String(activeDrawerGroup.id));
                                                setAssignRole('Route Lead');
                                            } else {
                                                setAssignEventId(String(activeDrawerGroup.id));
                                                setAssignRole('Event Lead');
                                            }

                                            setAddingToGroup({
                                                type: activeDrawerGroup.type,
                                                id: activeDrawerGroup.id,
                                                name: activeDrawerGroup.name,
                                                schedule: activeDrawerGroup.schedule,
                                                members_count: activeDrawerGroup.members_count,
                                                quota: activeDrawerGroup.quota,
                                            });
                                            setIsAssignOpen(true);
                                        }}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-paw-orange px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-orange-600"
                                    >
                                        <UserPlus size={14} />
                                        Add Member
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Update Group Member Limit Modal */}
            {isGroupSettingsModalOpen && activeDrawerGroup && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsGroupSettingsModalOpen(false);
                        }
                    }}
                >
                    <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-2xl dark:border-gray-800 dark:bg-slate-900">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <h3 className="flex items-center gap-2 font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                <SlidersHorizontal className="text-paw-blue" size={20} /> Update Member Limit
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsGroupSettingsModalOpen(false)}
                                className="cursor-pointer rounded-xl p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800"
                                aria-label="Close modal"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <p className="mb-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {activeDrawerGroup.name} • Minimum allowed: {Math.max(1, activeDrawerGroup.members_count)} (current members: {activeDrawerGroup.members_count})
                        </p>
                        <form onSubmit={handleSaveGroupSettings} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-gray-400">
                                    Member Limit
                                </label>
                                <input
                                    type="number"
                                    min={Math.max(1, activeDrawerGroup.members_count)}
                                    max={500}
                                    placeholder="Unlimited"
                                    value={groupQuotaInput}
                                    onChange={(e) => setGroupQuotaInput(e.target.value)}
                                    autoFocus
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-bold text-[#0B2340] focus:border-paw-blue focus:outline-none dark:border-gray-700 dark:bg-slate-900 dark:text-white"
                                />
                                <p className="mt-1.5 text-[11px] font-medium text-gray-400">
                                    Leave blank for unlimited members.
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsGroupSettingsModalOpen(false)}
                                    className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingGroupSettings}
                                    className="cursor-pointer rounded-xl bg-paw-blue px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSavingGroupSettings ? 'Saving...' : 'Save Limit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Group Member Role Modal */}
            {editingGroupMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <h3 className="font-fredoka text-xl font-bold mb-2 text-[#0B2340] dark:text-white flex items-center gap-2">
                            <Users className="text-paw-orange" size={20} /> Change Member Role
                        </h3>
                        <p className="text-xs font-semibold text-gray-500 mb-4">
                            {editingGroupMember.name} in <span className="text-[#0B2340] dark:text-white">{editingGroupMember.groupName}</span>
                        </p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                router.post(
                                    `${basePath}/groups/members/${editingGroupMember.task_id}/role`,
                                    { role: editingMemberRole },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => setEditingGroupMember(null),
                                        onError: (errors) => toast.error(Object.values(errors)[0] || 'Failed to update role.'),
                                    }
                                );
                            }}
                            className="space-y-4"
                        >
                            {editingGroupMember.groupType === 'feeding' ? (
                                <div className="space-y-2">
                                    <ModernSelect
                                        label="Assigned Role"
                                        required
                                        value={editingMemberRole}
                                        onChange={(val) => setEditingMemberRole(val)}
                                        placeholder="Select role..."
                                        options={GROUP_ROLE_OPTIONS}
                                    />
                                    {(() => {
                                        const selectedRoleInfo = GROUP_ROLE_OPTIONS.find((r) => r.value === editingMemberRole);

                                        if (!selectedRoleInfo) {
return null;
}

                                        return (
                                            <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 px-3.5 py-2.5 text-xs font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                                                <span className="font-black">{selectedRoleInfo.label}:</span> {selectedRoleInfo.description}
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                                        Event Role *
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {EVENT_ROLE_PRESETS.map((preset) => (
                                            <button
                                                key={preset.value}
                                                type="button"
                                                onClick={() => setEditingMemberRole(preset.value)}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition text-center ${
                                                    editingMemberRole === preset.value
                                                        ? 'bg-paw-orange text-white shadow-xs'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300'
                                                }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                    {(() => {
                                        const selectedEventRole = EVENT_ROLE_PRESETS.find((r) => r.value === editingMemberRole);

                                        if (!selectedEventRole) {
return null;
}

                                        return (
                                            <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 px-3.5 py-2.5 text-xs font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                                                <span className="font-black">{selectedEventRole.value}:</span> {selectedEventRole.description}
                                            </div>
                                        );
                                    })()}
                                    <input
                                        required
                                        type="text"
                                        placeholder="Or type a custom event role..."
                                        value={editingMemberRole}
                                        onChange={(e) => setEditingMemberRole(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none font-semibold text-sm dark:text-white"
                                    />
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingGroupMember(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-paw-orange text-white hover:bg-orange-600 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                    Update Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeChatGroup && (
                <GroupChatDrawer
                    open={Boolean(activeChatGroup)}
                    onClose={() => setChatGroupKey(null)}
                    groupType={activeChatGroup.type}
                    groupId={activeChatGroup.id}
                    groupName={activeChatGroup.name}
                    schedule={activeChatGroup.schedule}
                    members={activeChatGroup.members}
                    currentUserId={currentUserId}
                    isDisbanded={Boolean(activeChatGroup.is_disbanded)}
                    initialTab="chat"
                />
            )}

            {summaryGroupKey && (
                <MissionSummaryModal
                    open={Boolean(summaryGroupKey)}
                    onClose={() => setSummaryGroupKey(null)}
                    groupType={summaryGroupKey.type}
                    groupId={summaryGroupKey.id}
                />
            )}

            {disbandingGroup && (
                <CompleteGroupModal
                    open={Boolean(disbandingGroup)}
                    onClose={() => setDisbandingGroup(null)}
                    title={disbandingGroup.name}
                    subtitle={disbandingGroup.schedule}
                    groupType={disbandingGroup.type}
                    members={disbandingGroup.members.map((m) => ({
                        task_id: m.task_id,
                        name: m.name,
                        role: m.role,
                        hours_logged: m.hours_logged,
                        status: m.status,
                    }))}
                    submitting={isDisbandingGroup}
                    onSubmit={handleConfirmDisbandGroup}
                />
            )}

            <ConfirmationModal {...confirmModalProps} />
        </>
    );
}

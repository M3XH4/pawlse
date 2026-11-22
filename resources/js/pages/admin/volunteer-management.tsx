import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminCard } from '@/components/admin/card';
import { DashboardPagination } from '@/components/dashboard/pagination';
import { toast } from 'sonner';
import { User, ClipboardList, CheckCircle2, XCircle, Award, Clock, Search, Filter, Check, X, ShieldAlert, Plus, Store, PackageCheck, AlertTriangle, UserPlus } from 'lucide-react';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { ModernSelect } from '@/components/ui/modern-select';

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
    allVolunteers?: { id: number; name: string; email: string }[];
    allRecipients?: { id: number; name: string; email: string; role?: string }[];
    filters: {
        search: string;
        status: string;
    };
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
    allVolunteers = [],
    allRecipients = [],
    filters
}: VolunteerManagementProps) {
    const [activeTab, setActiveTab] = useState<'applications' | 'volunteers' | 'tasks' | 'food_pickups'>('applications');
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

    // Complete Task modal state
    const [completingTask, setCompletingTask] = useState<TaskModel | null>(null);
    const [hoursLogged, setHoursLogged] = useState('2.0');

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
        router.post('/account/admin/volunteer-management/food-pickups', {
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
        if (!assigningPickup) return;

        router.post(`/account/admin/volunteer-management/food-pickups/${assigningPickup.id}/assign`, {
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
        if (!updatingPickup) return;

        router.post(`/account/admin/volunteer-management/food-pickups/${updatingPickup.id}/status`, {
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

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/account/admin/volunteer-management', {
            search: searchQuery,
            status: statusFilter
        }, { preserveState: true });
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get('/account/admin/volunteer-management', {
            search: searchQuery,
            status: status
        }, { preserveState: true });
    };

    const handleApprove = (appId: number) => {
        router.post(`/account/admin/volunteer-management/applications/${appId}/approve`, {}, {
            onSuccess: () => toast.success('Application approved!')
        });
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectionReason.trim()) return;

        router.post(`/account/admin/volunteer-management/applications/${rejectingApp?.id}/reject`, {
            rejection_reason: rejectionReason
        }, {
            onSuccess: () => {
                toast.success('Application rejected.');
                setRejectingApp(null);
                setRejectionReason('');
            }
        });
    };

    const handleAssignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/account/admin/volunteer-management/assign', {
            user_id: assignTargetUserId,
            event_id: assignActivityType === 'event' ? assignEventId : null,
            feeding_schedule_id: assignActivityType === 'feeding' ? assignScheduleId : null,
            role: assignRole
        }, {
            onSuccess: () => {
                toast.success('Task successfully assigned.');
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
        if (!completingTask) return;

        router.post(`/account/admin/volunteer-management/tasks/${completingTask.id}/status`, {
            status: 'completed',
            hours_logged: parseFloat(hoursLogged)
        }, {
            onSuccess: () => {
                toast.success('Task marked as completed.');
                setCompletingTask(null);
            }
        });
    };

    const handleCancelTask = (taskId: number) => {
        if (!confirm('Are you sure you want to cancel this assignment?')) return;
        router.post(`/account/admin/volunteer-management/tasks/${taskId}/status`, {
            status: 'cancelled'
        }, {
            onSuccess: () => toast.success('Task assignment cancelled.')
        });
    };

    const handleCertSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/account/admin/volunteer-management/issue-certificate', {
            user_id: certTargetUserId,
            event_id: certTargetEventId || null,
            title: certTitle,
            description: certDesc
        }, {
            onSuccess: () => {
                toast.success('Certificate issued successfully!');
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
                <div className="flex gap-2 border-b-2 border-gray-200 dark:border-gray-800 mb-6">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-6 py-4 font-black text-sm transition-all relative cursor-pointer ${
                            activeTab === 'applications' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy dark:hover:text-white'
                        }`}
                    >
                        Applications ({applications.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('volunteers')}
                        className={`px-6 py-4 font-black text-sm transition-all relative cursor-pointer ${
                            activeTab === 'volunteers' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy dark:hover:text-white'
                        }`}
                    >
                        Active Volunteers ({volunteers.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-6 py-4 font-black text-sm transition-all relative cursor-pointer ${
                            activeTab === 'tasks' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy dark:hover:text-white'
                        }`}
                    >
                        Assigned Tasks ({tasks.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('food_pickups')}
                        className={`px-6 py-4 font-black text-sm transition-all relative cursor-pointer ${
                            activeTab === 'food_pickups' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy dark:hover:text-white'
                        }`}
                    >
                        Daily Food Pickups ({foodPickups.total})
                    </button>
                </div>

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                    <AdminCard className="p-6">
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
                                                    {app.status === 'pending' && (
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
                    </AdminCard>
                )}

                {/* Volunteers Tab */}
                {activeTab === 'volunteers' && (
                    <AdminCard className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">Active Volunteers Directory</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsAssignOpen(true);
                                        if (volunteers.data.length > 0) setAssignTargetUserId(String(volunteers.data[0].id));
                                        if (events.length > 0) setAssignEventId(String(events[0].id));
                                        if (feedingSchedules.length > 0) setAssignScheduleId(String(feedingSchedules[0].id));
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-paw-orange text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 cursor-pointer"
                                >
                                    <Plus size={14} /> Assign Task
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCertOpen(true);
                                        if (volunteers.data.length > 0) setCertTargetUserId(String(volunteers.data[0].id));
                                        if (events.length > 0) setCertTargetEventId(String(events[0].id));
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-paw-navy text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 cursor-pointer"
                                >
                                    <Award size={14} /> Issue Certificate
                                </button>
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
                                                    <button
                                                        onClick={() => {
                                                            setAssignTargetUserId(String(vol.id));
                                                            setIsAssignOpen(true);
                                                        }}
                                                        className="text-xs bg-paw-orange/10 text-paw-orange font-black uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-paw-orange hover:text-white cursor-pointer"
                                                    >
                                                        Assign Activity
                                                    </button>
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
                                                    {task.status === 'pending' && (
                                                        <div className="flex justify-end gap-1.5">
                                                            <button
                                                                onClick={() => {
                                                                    setCompletingTask(task);
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
                                                {todayItem.status === 'pending' && !todayItem.assigned_volunteer_id ? (
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
                                                            {!isFinal && (
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

            {/* Assign Task Modal */}
            {isAssignOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-8 border dark:border-gray-800 shadow-2xl">
                        <h3 className="font-fredoka text-xl font-bold mb-4 text-[#0B2340] dark:text-white">Assign Task manually</h3>
                        <form onSubmit={handleAssignSubmit} className="space-y-4">
                            <ModernSelect
                                label="Volunteer"
                                required
                                value={assignTargetUserId}
                                onChange={(val) => setAssignTargetUserId(val)}
                                placeholder="Select volunteer..."
                                options={volunteerList.map(v => ({
                                    value: String(v.id),
                                    label: v.name,
                                    description: v.email,
                                }))}
                            />

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
                                    value={assignScheduleId}
                                    onChange={(val) => setAssignScheduleId(val)}
                                    placeholder="Select feeding route..."
                                    options={feedingSchedules.map(s => ({
                                        value: String(s.id),
                                        label: s.zone,
                                    }))}
                                />
                            )}

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Assigned Role *</label>
                                <input
                                    required
                                    type="text"
                                    value={assignRole}
                                    onChange={(e) => setAssignRole(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-paw-orange text-white hover:bg-orange-650 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                    Assign Task
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
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Hours Logged *</label>
                                <input
                                    required
                                    type="number"
                                    step="0.5"
                                    value={hoursLogged}
                                    onChange={(e) => setHoursLogged(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>
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
                                onChange={(val) => setCertTargetUserId(val)}
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
                                    ...events.map(e => ({ value: String(e.id), label: e.title })),
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
        </>
    );
}

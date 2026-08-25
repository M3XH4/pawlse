import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminCard } from '@/components/admin/card';
import { toast } from 'sonner';
import { User, ClipboardList, CheckCircle2, Award, Clock, Search, Filter, Check, X, ShieldAlert, Plus } from 'lucide-react';

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
    user?: {
        name: string;
    } | null;
    event?: {
        title: string;
    } | null;
    feeding_schedule?: {
        zone: string;
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
    events: EventDropdownModel[];
    feedingSchedules: ScheduleDropdownModel[];
    filters: {
        search: string;
        status: string;
    };
}

export default function VolunteerManagement({
    applications,
    volunteers,
    tasks,
    events,
    feedingSchedules,
    filters
}: VolunteerManagementProps) {
    const [activeTab, setActiveTab] = useState<'applications' | 'volunteers' | 'tasks'>('applications');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'All');

    // Reject application modal state
    const [rejectingApp, setRejectingApp] = useState<VolunteerApplicationModel | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Assign Task modal state
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignTargetUserId, setAssignTargetUserId] = useState('');
    const [assignActivityType, setAssignActivityType] = useState<'event' | 'feeding'>('event');
    const [assignEventId, setAssignEventId] = useState('');
    const [assignScheduleId, setAssignScheduleId] = useState('');
    const [assignRole, setAssignRole] = useState('Food Carrier');

    // Complete Task modal state
    const [completingTask, setCompletingTask] = useState<TaskModel | null>(null);
    const [hoursLogged, setHoursLogged] = useState('2.0');

    // Issue Certificate modal state
    const [isCertOpen, setIsCertOpen] = useState(false);
    const [certTargetUserId, setCertTargetUserId] = useState('');
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
            <Head title="Volunteer Management" />
            <AdminPageShell title="Volunteer Management">
                
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
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-850 rounded-xl text-sm font-semibold outline-none border border-transparent focus:border-paw-orange dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Filter size={16} className="text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilterChange(e.target.value)}
                                className="px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border dark:border-gray-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none"
                            >
                                <option value="All">All Applications</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
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
                            activeTab === 'applications' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy'
                        }`}
                    >
                        Applications ({applications.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('volunteers')}
                        className={`px-6 py-4 font-black text-sm transition-all relative cursor-pointer ${
                            activeTab === 'volunteers' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy'
                        }`}
                    >
                        Active Volunteers ({volunteers.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-6 py-4 font-black text-sm transition-all relative cursor-pointer ${
                            activeTab === 'tasks' ? 'text-paw-orange' : 'text-gray-400 hover:text-paw-navy'
                        }`}
                    >
                        Assigned Tasks ({tasks.total})
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
                                            <th className="pb-3">Reference ID</th>
                                            <th className="pb-3">Name</th>
                                            <th className="pb-3">Role</th>
                                            <th className="pb-3">Contact</th>
                                            <th className="pb-3">Motivation</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-850">
                                        {applications.data.map((app) => (
                                            <tr key={app.id} className="text-gray-700 dark:text-gray-300">
                                                <td className="py-4 font-bold">{app.reference_number}</td>
                                                <td className="py-4">
                                                    <p className="font-bold text-[#0B2340] dark:text-white">{app.full_name}</p>
                                                    <p className="text-xs text-gray-400">{app.email}</p>
                                                </td>
                                                <td className="py-4 font-bold">{app.role}</td>
                                                <td className="py-4">
                                                    <p>{app.mobile}</p>
                                                    <p className="text-xs text-gray-400 font-bold">{app.address}</p>
                                                </td>
                                                <td className="py-4 max-w-xs truncate" title={app.why}>{app.why}</td>
                                                <td className="py-4">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    {app.status === 'pending' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleApprove(app.id)}
                                                                className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg cursor-pointer"
                                                                title="Approve"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setRejectingApp(app)}
                                                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                                                                title="Reject"
                                                            >
                                                                <X size={16} />
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
                                            <th className="pb-3">Volunteer ID</th>
                                            <th className="pb-3">Name</th>
                                            <th className="pb-3">Email</th>
                                            <th className="pb-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-850">
                                        {volunteers.data.map((vol) => (
                                            <tr key={vol.id} className="text-gray-700 dark:text-gray-300">
                                                <td className="py-4 font-bold">#VOL-{vol.id}</td>
                                                <td className="py-4 font-bold text-[#0B2340] dark:text-white">{vol.name}</td>
                                                <td className="py-4">{vol.email}</td>
                                                <td className="py-4 text-right">
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
                                            <th className="pb-3">Volunteer</th>
                                            <th className="pb-3">Assigned Activity</th>
                                            <th className="pb-3">Role</th>
                                            <th className="pb-3">Hours</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-850">
                                        {tasks.data.map((task) => (
                                            <tr key={task.id} className="text-gray-700 dark:text-gray-300">
                                                <td className="py-4 font-bold text-[#0B2340] dark:text-white">{task.user?.name}</td>
                                                <td className="py-4">
                                                    <p className="font-bold">{task.event ? task.event.title : task.feeding_schedule?.zone}</p>
                                                    <p className="text-xs text-gray-400 font-bold">{task.event ? 'Event Proper' : 'Feeding Zone Route'}</p>
                                                </td>
                                                <td className="py-4">{task.role}</td>
                                                <td className="py-4 font-bold">{parseFloat(task.hours_logged)} hrs</td>
                                                <td className="py-4">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        task.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    {task.status === 'pending' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setCompletingTask(task);
                                                                    setHoursLogged('2.0');
                                                                }}
                                                                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 text-xs font-black uppercase tracking-widest rounded-lg cursor-pointer"
                                                            >
                                                                Verify & Complete
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelTask(task.id)}
                                                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                                                            >
                                                                <X size={14} />
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
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-850 rounded-xl outline-none focus:border-red-500 border border-transparent font-semibold text-sm dark:text-white"
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
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Volunteer *</label>
                                <select
                                    required
                                    value={assignTargetUserId}
                                    onChange={(e) => setAssignTargetUserId(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border dark:border-gray-800 text-sm font-semibold dark:text-white outline-none"
                                >
                                    {volunteers.data.map(v => <option key={v.id} value={v.id}>{v.name} (#{v.id})</option>)}
                                </select>
                            </div>

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
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Select Event *</label>
                                    <select
                                        value={assignEventId}
                                        onChange={(e) => setAssignEventId(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border dark:border-gray-800 text-sm font-semibold dark:text-white outline-none"
                                    >
                                        {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Select Feeding route *</label>
                                    <select
                                        value={assignScheduleId}
                                        onChange={(e) => setAssignScheduleId(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border dark:border-gray-800 text-sm font-semibold dark:text-white outline-none"
                                    >
                                        {feedingSchedules.map(s => <option key={s.id} value={s.id}>{s.zone}</option>)}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Assigned Role *</label>
                                <input
                                    required
                                    type="text"
                                    value={assignRole}
                                    onChange={(e) => setAssignRole(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
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
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
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
                        <h3 className="font-fredoka text-xl font-bold mb-4 text-[#0B2340] dark:text-white">Issue Recognition Certificate</h3>
                        <form onSubmit={handleCertSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Recipient Volunteer *</label>
                                <select
                                    required
                                    value={certTargetUserId}
                                    onChange={(e) => setCertTargetUserId(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border dark:border-gray-800 text-sm font-semibold dark:text-white outline-none"
                                >
                                    {volunteers.data.map(v => <option key={v.id} value={v.id}>{v.name} (#{v.id})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Associated Event (Optional)</label>
                                <select
                                    value={certTargetEventId}
                                    onChange={(e) => setCertTargetEventId(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border dark:border-gray-800 text-sm font-semibold dark:text-white outline-none"
                                >
                                    <option value="">None / Manual Issuance</option>
                                    {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Certificate Title *</label>
                                <input
                                    required
                                    type="text"
                                    value={certTitle}
                                    onChange={(e) => setCertTitle(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-transparent focus:border-paw-orange outline-none font-semibold text-sm dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Custom Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Add custom text or leave empty for default recognition statement..."
                                    value={certDesc}
                                    onChange={(e) => setCertDesc(e.target.value)}
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-850 rounded-xl outline-none focus:border-paw-orange border border-transparent font-semibold text-sm dark:text-white"
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
        </>
    );
}

import { Link } from '@inertiajs/react';
import {
    Zap,
    Clock,
    CheckCircle2,
    ClipboardList,
    HeartHandshake,
    MapPin,
    Heart,
    Sparkles,
} from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

interface FosterParentInfo {
    id: number;
    status: string;
    capacity: number;
    location: string | null;
    pet_preference: string | null;
    housing_type: string | null;
    notes: string | null;
    approved_at: string | null;
    created_at: string | null;
}

interface VolunteerStatusProps {
    application: {
        status: string;
        role: string;
        reference_number: string;
        created_at: string;
    } | null;
    fosterParent?: FosterParentInfo | null;
    stats: {
        total_hours: number;
        completed_tasks_count: number;
        pending_tasks_count: number;
    };
}

export default function VolunteerStatus({ application, fosterParent, stats }: VolunteerStatusProps) {
    return (
        <DashboardSectionPage
            title="Volunteer Status"
            description="Monitor your active volunteer standing, logged service hours, and task contributions."
            badge={<DashboardMetricBadge icon={<Zap className="h-4 w-4" />} label="Active Volunteer" />}
        >
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <DashboardCard className="p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-bold text-sm uppercase tracking-wider">Logged Hours</span>
                        <div className="p-2 bg-orange-100 dark:bg-orange-950 text-paw-orange rounded-xl">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-[#0B2340] dark:text-white mb-1">
                            {stats?.total_hours || 0} hrs
                        </h3>
                        <p className="text-xs text-gray-400 font-bold">Total verified service time</p>
                    </div>
                </DashboardCard>

                <DashboardCard className="p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-bold text-sm uppercase tracking-wider">Completed Activities</span>
                        <div className="p-2 bg-green-100 dark:bg-green-950 text-green-600 rounded-xl">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-[#0B2340] dark:text-white mb-1">
                            {stats?.completed_tasks_count || 0}
                        </h3>
                        <p className="text-xs text-gray-400 font-bold">Successful events & routes</p>
                    </div>
                </DashboardCard>

                <DashboardCard className="p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-bold text-sm uppercase tracking-wider">Active Assignments</span>
                        <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl">
                            <ClipboardList size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-[#0B2340] dark:text-white mb-1">
                            {stats?.pending_tasks_count || 0}
                        </h3>
                        <p className="text-xs text-gray-400 font-bold">Upcoming tasks on your list</p>
                    </div>
                </DashboardCard>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
                {/* Volunteer Registration Details */}
                <DashboardCard className="p-6">
                    <h3 className="font-fredoka text-xl font-bold mb-4 text-[#0B2340] dark:text-white">Volunteer Registration Details</h3>
                    <div className="space-y-3 font-bold text-sm">
                        <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Preferred Role</span>
                            <span className="text-[#0B2340] dark:text-white">{application?.role || 'Volunteer'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Reference ID</span>
                            <span className="text-[#0B2340] dark:text-white">{application?.reference_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Registration Date</span>
                            <span className="text-[#0B2340] dark:text-white">{application?.created_at || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Standing Status</span>
                            <span className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs px-2.5 py-0.5 rounded font-black uppercase">Approved</span>
                        </div>
                    </div>
                </DashboardCard>

                {/* Foster Home Caretaker Standing */}
                <DashboardCard className="p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <h3 className="font-fredoka text-base sm:text-xl font-bold text-[#0B2340] dark:text-white flex items-center gap-1.5 sm:gap-2 min-w-0">
                                <HeartHandshake className="text-paw-orange h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                                <span className="truncate">Foster Care Standing</span>
                            </h3>
                            {fosterParent?.status === 'approved' && (
                                <span className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-black uppercase whitespace-nowrap shrink-0">
                                    Approved Foster Home
                                </span>
                            )}
                            {fosterParent?.status === 'pending' && (
                                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-black uppercase animate-pulse whitespace-nowrap shrink-0">
                                    Application Pending
                                </span>
                            )}
                            {(!fosterParent || fosterParent.status === 'inactive') && (
                                <span className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-black uppercase whitespace-nowrap shrink-0">
                                    Not Registered
                                </span>
                            )}
                        </div>

                        {fosterParent?.status === 'approved' ? (
                            <div className="space-y-3 font-bold text-sm">
                                <p className="text-xs text-gray-500 font-medium">
                                    You are an authorized shelter foster home. You can accept animals, view care instructions, and record care updates.
                                </p>
                                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                                    <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                                        <MapPin size={14} className="text-paw-orange" /> Foster Home Location
                                    </span>
                                    <span className="text-[#0B2340] dark:text-white">{fosterParent.location || 'Location on file'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                                    <span className="text-[#64748B] dark:text-[#94A3B8]">Approved Capacity</span>
                                    <span className="text-paw-orange font-black">{fosterParent.capacity} concurrent pet slot(s)</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                                    <span className="text-[#64748B] dark:text-[#94A3B8]">Pet Preference</span>
                                    <span className="text-[#0B2340] dark:text-white capitalize">{fosterParent.pet_preference || 'Any'}</span>
                                </div>
                            </div>
                        ) : fosterParent?.status === 'pending' ? (
                            <div className="space-y-3 font-bold text-sm">
                                <p className="text-xs text-amber-800 dark:text-amber-300/90 font-medium bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
                                    Your application to become a Foster Parent is currently being reviewed by our shelter coordinators. We verify housing setup and availability before assigning animals.
                                </p>
                                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                                    <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                                        <MapPin size={14} className="text-paw-orange" /> Home Location
                                    </span>
                                    <span className="text-[#0B2340] dark:text-white">{fosterParent.location || 'Provided in application'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                                    <span className="text-[#64748B] dark:text-[#94A3B8]">Requested Capacity</span>
                                    <span className="text-[#0B2340] dark:text-white">{fosterParent.capacity} pet slot(s)</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 font-medium">
                                    Open your home to animals needing temporary shelter, healing, or behavioral socialization before permanent adoption. Shelter coordinates food, medical care, and guidance.
                                </p>
                                <div className="bg-orange-50/60 dark:bg-orange-950/20 p-3 rounded-xl border border-orange-100 dark:border-orange-900/40 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold text-[#0B2340] dark:text-white">
                                        <Sparkles size={14} className="text-paw-orange" /> Foster Home Benefits
                                    </div>
                                    <p className="text-[11px] text-gray-500">
                                        • All veterinary costs & food covered by shelter<br />
                                        • Flexible placement durations (1-4 weeks)<br />
                                        • Direct coordinator support & 24/7 hotline
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        {fosterParent?.status === 'approved' ? (
                            <Link
                                href="/account/volunteer/foster-care"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-paw-orange text-white hover:bg-paw-orange/90 shadow-xs transition-colors"
                            >
                                <Heart size={14} /> Open My Foster Pets Dashboard
                            </Link>
                        ) : fosterParent?.status === 'pending' ? (
                            <Link
                                href="/account/volunteer/apply-foster"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 text-[#0B2340] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Edit Application Details
                            </Link>
                        ) : (
                            <Link
                                href="/account/volunteer/apply-foster"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-paw-orange text-white hover:bg-paw-orange/90 shadow-xs transition-colors"
                            >
                                <HeartHandshake size={15} /> Apply to Become a Foster Parent
                            </Link>
                        )}
                    </div>
                </DashboardCard>
            </div>
        </DashboardSectionPage>
    );
}

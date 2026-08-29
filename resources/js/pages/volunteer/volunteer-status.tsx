import { Zap, Clock, CheckCircle2, ClipboardList, Award } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

interface VolunteerStatusProps {
    application: {
        status: string;
        role: string;
        reference_number: string;
        created_at: string;
    } | null;
    stats: {
        total_hours: number;
        completed_tasks_count: number;
        pending_tasks_count: number;
    };
}

export default function VolunteerStatus({ application, stats }: VolunteerStatusProps) {
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

            <DashboardCard className="p-6">
                <h3 className="font-fredoka text-xl font-bold mb-4 text-[#0B2340] dark:text-white">Volunteer Registration Details</h3>
                <div className="grid gap-4 md:grid-cols-2 text-sm">
                    <div className="space-y-3 font-bold">
                        <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Preferred Role</span>
                            <span className="text-[#0B2340] dark:text-white">{application?.role || 'Volunteer'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Reference ID</span>
                            <span className="text-[#0B2340] dark:text-white">{application?.reference_number || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="space-y-3 font-bold">
                        <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Registration Date</span>
                            <span className="text-[#0B2340] dark:text-white">{application?.created_at || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Standing Status</span>
                            <span className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs px-2 py-0.5 rounded font-black uppercase">Approved</span>
                        </div>
                    </div>
                </div>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

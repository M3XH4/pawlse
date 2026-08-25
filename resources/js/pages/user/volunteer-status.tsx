import { Zap, Clock, CheckCircle2, XCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
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
        rejection_reason: string | null;
    } | null;
}

export default function UserVolunteerStatus({ application }: VolunteerStatusProps) {
    return (
        <DashboardSectionPage
            title="Volunteer Onboarding"
            description="Track your application status and onboarding details"
            badge={
                <DashboardMetricBadge
                    icon={<Zap className="h-4 w-4" />}
                    label={
                        application?.status === 'approved' ? 'Approved' :
                        application?.status === 'rejected' ? 'Declined' :
                        application?.status === 'pending' ? 'Pending Review' : 'Not Applied'
                    }
                />
            }
        >
            <div className="max-w-3xl">
                {!application && (
                    <DashboardCard className="p-8 text-center">
                        <HelpCircle className="mx-auto text-gray-300 mb-4" size={56} />
                        <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white mb-2">Become a Volunteer</h3>
                        <p className="text-sm text-gray-500 font-bold max-w-md mx-auto mb-6 leading-relaxed">
                            Join our community of stray feeders and animal rescuers in Iligan City! As a volunteer, you will help coordinate feeding routes, assist in vaccination operations, and make a tangible difference.
                        </p>
                        <Link
                            href="/volunteer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-paw-orange text-white hover:bg-orange-600 font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-paw-orange/25"
                        >
                            Apply Now <ChevronRight size={16} />
                        </Link>
                    </DashboardCard>
                )}

                {application && application.status === 'pending' && (
                    <DashboardCard className="p-8 border-l-8 border-orange-400">
                        <div className="flex items-start gap-4">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-500 shrink-0">
                                <Clock size={24} />
                            </span>
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white mb-2">Application Pending</h3>
                                <p className="text-sm text-gray-500 font-semibold mb-6 leading-relaxed">
                                    Your volunteer application is currently being reviewed by our administrative coordinators. We will check your preferred roles and contact details shortly.
                                </p>
                                
                                <div className="grid gap-3 sm:grid-cols-2 text-xs font-bold text-gray-500 border-t pt-4">
                                    <div>
                                        <p className="uppercase text-[10px] tracking-wider text-gray-400">Reference ID</p>
                                        <p className="text-sm text-[#0B2340] dark:text-white">{application.reference_number}</p>
                                    </div>
                                    <div>
                                        <p className="uppercase text-[10px] tracking-wider text-gray-400">Applied On</p>
                                        <p className="text-sm text-[#0B2340] dark:text-white">{application.created_at}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="uppercase text-[10px] tracking-wider text-gray-400">Preferred Role</p>
                                        <p className="text-sm text-[#0B2340] dark:text-white">{application.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                )}

                {application && application.status === 'approved' && (
                    <DashboardCard className="p-8 border-l-8 border-green-500">
                        <div className="flex items-start gap-4">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600 shrink-0">
                                <CheckCircle2 size={24} />
                            </span>
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white mb-2">Congratulations!</h3>
                                <p className="text-sm text-gray-500 font-semibold mb-6 leading-relaxed">
                                    Your application to join the Iligan Stray Feeders volunteer team has been approved. You can now access volunteer assignments, complete routes, log hours, and obtain recognition certificates.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 items-center">
                                    <Link
                                        href="/volunteer/switch"
                                        className="w-full sm:w-auto px-6 py-3.5 bg-green-600 text-white hover:bg-green-700 font-black text-sm uppercase tracking-widest rounded-2xl text-center shadow-lg shadow-green-600/20"
                                    >
                                        Switch to Volunteer Dashboard
                                    </Link>
                                    <div className="text-xs text-gray-400 font-bold">
                                        Ref ID: {application.reference_number}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                )}

                {application && application.status === 'rejected' && (
                    <DashboardCard className="p-8 border-l-8 border-red-500">
                        <div className="flex items-start gap-4">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 shrink-0">
                                <XCircle size={24} />
                            </span>
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white mb-2">Application Declined</h3>
                                <p className="text-sm text-gray-500 font-semibold mb-4 leading-relaxed">
                                    Thank you for your interest. Unfortunately, our coordinators were unable to approve your application at this time.
                                </p>

                                {application.rejection_reason && (
                                    <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 p-4 rounded-xl text-sm font-bold mb-6">
                                        <p className="text-xs uppercase tracking-wider text-red-500/80 mb-1">Coordinator Feedback</p>
                                        {application.rejection_reason}
                                    </div>
                                )}

                                <Link
                                    href="/volunteer"
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-paw-orange text-white hover:bg-orange-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-paw-orange/20"
                                >
                                    Reapply / Update Form
                                </Link>
                            </div>
                        </div>
                    </DashboardCard>
                )}
            </div>
        </DashboardSectionPage>
    );
}

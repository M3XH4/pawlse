import { Link } from '@inertiajs/react';
import {
    Zap,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    HelpCircle,
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    ShieldCheck,
    LifeBuoy,
} from 'lucide-react';
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
        submitted_human?: string | null;
        full_name?: string | null;
        email?: string | null;
        mobile?: string | null;
        address?: string | null;
        why?: string | null;
        experience?: string | null;
        rejection_reason: string | null;
    } | null;
}

export default function UserVolunteerStatus({ application }: VolunteerStatusProps) {
    return (
        <DashboardSectionPage
            title="Volunteer Onboarding"
            description="Track your volunteer application review progress and onboarding standing."
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
            <div className="w-full space-y-6">
                {!application && (
                    <DashboardCard className="p-8 sm:p-12 text-center">
                        <HelpCircle className="mx-auto text-gray-300 mb-4" size={56} />
                        <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white mb-2">Become a Volunteer</h3>
                        <p className="text-sm text-gray-500 font-bold max-w-xl mx-auto mb-6 leading-relaxed">
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
                    <div className="grid gap-6 lg:grid-cols-3 items-stretch">
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <DashboardCard className="p-6 sm:p-8 border-l-8 border-orange-400">
                                <div className="flex items-start gap-4">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400 shrink-0">
                                        <Clock size={24} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                                Application Pending
                                            </h3>
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                Under Coordinator Review
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-6 leading-relaxed">
                                            Your volunteer application is currently being reviewed by our administrative coordinators. We will check your preferred roles, availability, and contact details shortly.
                                        </p>

                                        <div className="grid gap-4 sm:grid-cols-3 text-xs font-bold text-gray-500 border-t border-gray-100 dark:border-slate-800 pt-5">
                                            <div>
                                                <p className="uppercase text-[10px] tracking-wider text-gray-400 mb-1">Reference ID</p>
                                                <p className="text-sm text-[#0B2340] dark:text-white font-mono">{application.reference_number}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase text-[10px] tracking-wider text-gray-400 mb-1">Applied On</p>
                                                <p className="text-sm text-[#0B2340] dark:text-white">
                                                    {application.created_at}
                                                    {application.submitted_human && (
                                                        <span className="block text-[11px] font-medium text-gray-400">
                                                            {application.submitted_human}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="uppercase text-[10px] tracking-wider text-gray-400 mb-1">Preferred Role</p>
                                                <p className="text-sm text-[#0B2340] dark:text-white">{application.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DashboardCard>

                            <DashboardCard className="p-6 sm:p-8 flex-1">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <FileText className="h-5 w-5 text-orange-500" />
                                    <h4 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                        Submitted Application Details
                                    </h4>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                            <User className="h-3.5 w-3.5" /> Applicant Name
                                        </p>
                                        <p className="font-bold text-[#0B2340] dark:text-white">
                                            {application.full_name || 'Not provided'}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                            <Mail className="h-3.5 w-3.5" /> Email Address
                                        </p>
                                        <p className="font-bold text-[#0B2340] dark:text-white break-all">
                                            {application.email || 'Not provided'}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                            <Phone className="h-3.5 w-3.5" /> Contact Number
                                        </p>
                                        <p className="font-bold text-[#0B2340] dark:text-white">
                                            {application.mobile || 'Not provided'}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                            <MapPin className="h-3.5 w-3.5" /> Address / Barangay
                                        </p>
                                        <p className="font-bold text-[#0B2340] dark:text-white">
                                            {application.address || 'Not provided'}
                                        </p>
                                    </div>

                                    {application.experience && (
                                        <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                                Relevant Experience
                                            </p>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {application.experience}
                                            </p>
                                        </div>
                                    )}

                                    {application.why && (
                                        <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                                Motivation / Why You Want to Volunteer
                                            </p>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {application.why}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </DashboardCard>
                        </div>

                        <div className="flex flex-col gap-6">
                            <DashboardCard className="p-6 flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    <h4 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                        Review Progress
                                    </h4>
                                </div>
                                <ol className="space-y-4 text-sm">
                                    <li className="flex items-start gap-3">
                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        </span>
                                        <div>
                                            <p className="font-bold text-[#0B2340] dark:text-white">Application Submitted</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Received on {application.created_at}
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                                            <Clock className="h-3.5 w-3.5 animate-pulse" />
                                        </span>
                                        <div>
                                            <p className="font-bold text-[#0B2340] dark:text-white">Coordinator Verification</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Reviewing your preferred role ({application.role}) and contact details.
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3 opacity-60">
                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-slate-800">
                                            <Zap className="h-3.5 w-3.5" />
                                        </span>
                                        <div>
                                            <p className="font-bold text-[#0B2340] dark:text-white">Volunteer Onboarding</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Access assigned tasks, feeding routes, and volunteer certificates.
                                            </p>
                                        </div>
                                    </li>
                                </ol>
                            </DashboardCard>

                            <DashboardCard className="p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <LifeBuoy className="h-5 w-5 text-sky-500" />
                                    <h4 className="font-fredoka text-base font-bold text-[#0B2340] dark:text-white">
                                        Need to Update Details?
                                    </h4>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                                    If you entered an incorrect phone number or need to update your availability while your application is pending, reach out to our support team with your Reference ID.
                                </p>
                                <Link
                                    href="/account/user/help-desk"
                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-[#0B2340] hover:bg-gray-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800 transition"
                                >
                                    Contact Help Desk <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </DashboardCard>
                        </div>
                    </div>
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
                                        method="post"
                                        as="button"
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

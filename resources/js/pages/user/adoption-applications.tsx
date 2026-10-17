import React from 'react';
import { Heart, Calendar, Clock, ChevronRight, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

interface Application {
    id: number;
    status: 'pending' | 'scheduled' | 'approved' | 'rejected';
    created_at: string;
    preferred_date: string;
    preferred_time: string;
    can_visit_shelter: boolean;
    rejection_reason?: string | null;
    shelter_animal: {
        id: number;
        name: string;
        type: string;
        breed: string;
        photo_url: string;
    } | null;
}

interface UserAdoptionApplicationsProps {
    applications: Application[];
}

export default function UserAdoptionApplications({ applications = [] }: UserAdoptionApplicationsProps) {
    const activeCount = applications.filter(
        (a) => a.status === 'pending' || a.status === 'scheduled'
    ).length;

    const getStatusBadge = (status: Application['status'], rejectionReason?: string | null) => {
        const isPetMatched = rejectionReason && rejectionReason.toLowerCase().includes('matched for this pet');

        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={12} /> Pending Review
                    </span>
                );
            case 'scheduled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Calendar size={12} /> Interview Scheduled
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 size={12} /> Approved
                    </span>
                );
            case 'rejected':
                if (isPetMatched) {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            <Heart size={12} className="text-amber-500" /> Pet Matched / Closed
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        <XCircle size={12} /> Declined
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
                        {status}
                    </span>
                );
        }
    };

    return (
        <DashboardSectionPage
            title="My Adoption Applications"
            description="Track and manage the status of your shelter pet adoption applications."
            badge={<DashboardMetricBadge icon={<Heart className="h-4 w-4" />} label={`${activeCount} Active`} />}
        >
            {applications.length === 0 ? (
                <DashboardCard className="p-8 text-center max-w-2xl mx-auto">
                    <Heart className="mx-auto text-gray-350 mb-4" size={56} />
                    <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white mb-2">No Applications Yet</h3>
                    <p className="text-sm text-gray-500 font-bold max-w-md mx-auto mb-6 leading-relaxed">
                        Ready to welcome a new family member? Browse available pets looking for forever homes and start your adoption journey today.
                    </p>
                    <Link
                        href="/adopt"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-paw-orange text-white hover:bg-orange-600 font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-paw-orange/25"
                    >
                        Browse Pets <ChevronRight size={16} />
                    </Link>
                </DashboardCard>
            ) : (
                <div className="space-y-6">
                    {/* Informational Banner clarifying Adoption Interview vs Shelter Visit */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs font-medium text-amber-900 flex items-start gap-3">
                        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                            <p className="font-bold text-amber-950">Adoption Interview vs. Shelter Visit</p>
                            <p className="text-amber-800 leading-relaxed">
                                The <strong>interview</strong> is scheduled by shelter admins to review your adoption application and discuss your pet care plan. If you simply want to tour the facility or see the animals, that is handled separately via <strong>Shelter Visits</strong>.
                            </p>
                        </div>
                    </div>

                    {applications.map((app) => (
                        <DashboardCard key={app.id} className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Pet Image */}
                                <div className="h-32 w-32 rounded-2xl bg-gray-150 overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                                    {app.shelter_animal?.photo_url ? (
                                        <ImageWithFallback
                                            src={app.shelter_animal.photo_url}
                                            alt={app.shelter_animal.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-paw-orange/10 text-paw-orange">
                                            <Heart size={36} />
                                        </div>
                                    )}
                                </div>

                                {/* Application Details */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                                Adoption Application for {app.shelter_animal?.name || 'Unnamed Pet'}
                                            </h3>
                                            <p className="text-xs font-bold text-gray-400 mt-1">
                                                Applied on {new Date(app.created_at).toLocaleDateString()} • Ref #{app.id}
                                            </p>
                                        </div>
                                        <div>{getStatusBadge(app.status, app.rejection_reason)}</div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 text-xs font-bold text-gray-500 border-t pt-4">
                                        <div>
                                            <p className="uppercase text-[10px] tracking-wider text-gray-400">Breed / Type</p>
                                            <p className="text-sm text-[#0B2340] dark:text-white mt-0.5">
                                                {app.shelter_animal?.breed || 'Unknown Breed'} ({app.shelter_animal?.type || 'Other'})
                                            </p>
                                        </div>
                                        <div>
                                            <p className="uppercase text-[10px] tracking-wider text-gray-400">Scheduled / Preferred Interview</p>
                                            <p className="text-sm text-[#0B2340] dark:text-white mt-0.5 flex items-center gap-1.5">
                                                <Calendar size={14} className="text-paw-orange" />
                                                {app.preferred_date ? new Date(app.preferred_date).toLocaleDateString() : 'Pending Date'} at {app.preferred_time || 'Pending Time'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Additional guidance context message based on status */}
                                    {app.status === 'pending' && (
                                        <div className="bg-amber-50/50 dark:bg-amber-950/10 p-3.5 rounded-xl border border-amber-100/50 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            <p>Our coordinators are reviewing your questionnaire and uploaded photos of your residence. Once reviewed, an admin will reach out to conduct your adoption interview.</p>
                                        </div>
                                    )}

                                    {app.status === 'scheduled' && (
                                        <div className="bg-blue-50/50 dark:bg-blue-950/10 p-3.5 rounded-xl border border-blue-100/50 text-xs font-bold text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            <p>Your shelter adoption interview with our coordinators is set! Please be prepared on <strong>{new Date(app.preferred_date).toLocaleDateString()}</strong> at <strong>{app.preferred_time}</strong>. If you selected remote/phone or cannot visit in person, coordinators will call you.</p>
                                        </div>
                                    )}

                                    {app.status === 'approved' && (
                                        <div className="bg-green-50/50 dark:bg-green-950/10 p-3.5 rounded-xl border border-green-100/50 text-xs font-bold text-green-800 dark:text-green-300 flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                            <p>Your application is approved! You can now visit the shelter to pick up <strong>{app.shelter_animal?.name}</strong> and sign the final adoption agreement. Congratulations on your new family member!</p>
                                        </div>
                                    )}

                                    {app.status === 'rejected' && (
                                        <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-start gap-2.5 ${
                                            app.rejection_reason && app.rejection_reason.toLowerCase().includes('matched for this pet')
                                                ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 text-slate-700 dark:text-slate-300'
                                                : 'bg-red-50/50 dark:bg-red-950/10 border-red-100/50 text-red-800 dark:text-red-300'
                                        }`}>
                                            {app.rejection_reason && app.rejection_reason.toLowerCase().includes('matched for this pet') ? (
                                                <Heart size={16} className="shrink-0 mt-0.5 text-amber-500" />
                                            ) : (
                                                <XCircle size={16} className="shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                <p>
                                                    {app.rejection_reason && app.rejection_reason.toLowerCase().includes('matched for this pet')
                                                        ? 'This animal has found a home with another applicant.'
                                                        : 'Your application was not approved by the shelter team at this time.'}
                                                </p>
                                                {app.rejection_reason && (
                                                    <p className="mt-1 font-semibold text-slate-600 dark:text-slate-400">
                                                        Note: {app.rejection_reason}
                                                    </p>
                                                )}
                                                {app.rejection_reason && app.rejection_reason.toLowerCase().includes('matched for this pet') && (
                                                    <p className="mt-2 text-xs font-normal text-slate-500">
                                                        Don't be discouraged! There are other rescued animals waiting for a loving home.{' '}
                                                        <Link href="/adopt" className="text-amber-600 hover:underline font-semibold">
                                                            View other adoptable pets →
                                                        </Link>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DashboardCard>
                    ))}
                </div>
            )}
        </DashboardSectionPage>
    );
}

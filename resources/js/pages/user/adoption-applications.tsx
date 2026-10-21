import React, { useState } from 'react';
import { Heart, Calendar, Clock, ChevronRight, AlertCircle, CheckCircle2, XCircle, RefreshCw, Building2, HeartHandshake, Sparkles, Share2, Users, MapPin } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { AnimatePresence } from 'motion/react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { AdoptionWizard, AdoptionWizardInitialData } from '@/components/adoption/adoption-wizard';

interface Application {
    id: number;
    status: 'pending' | 'scheduled' | 'approved' | 'rejected';
    full_name?: string;
    address?: string;
    phone?: string;
    email?: string;
    birth_date?: string;
    occupation?: string | null;
    company?: string | null;
    social_media?: string | null;
    status_marital?: string;
    pronouns?: string;
    adoption_source?: string[];
    adopted_before?: boolean;
    emergency_name?: string;
    emergency_relationship?: string;
    emergency_phone?: string;
    emergency_email?: string;
    adoption_preference?: string;
    residence_type?: string;
    is_renting?: boolean;
    moving_plan?: string;
    lives_with?: string[];
    has_allergies?: boolean;
    daily_care_handler?: string;
    expenses_handler?: string;
    emergency_handler?: string;
    hours_alone?: string;
    introduction_plan?: string;
    family_support?: boolean;
    family_support_explanation?: string | null;
    current_pets?: boolean;
    past_pets?: boolean;
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
        status?: string;
    } | null;
    follow_ups?: {
        id: number;
        follow_up_date: string;
        method: string;
        status: string;
        pet_condition?: string | null;
        notes?: string | null;
    }[];
}

interface UserShelterVisit {
    id: number;
    full_name: string;
    preferred_date: string;
    preferred_time_slot?: string | null;
    confirmed_date?: string | null;
    confirmed_time_slot?: string | null;
    number_of_visitors: number;
    purpose: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    additional_notes?: string | null;
    admin_notes?: string | null;
    created_at: string;
    shelter_animal?: {
        id: number;
        name: string;
        photo_url?: string | null;
    } | null;
}

interface UserRehomingRequest {
    id: number;
    animal_name: string;
    species: string;
    breed?: string | null;
    gender: string;
    age?: string | null;
    current_location: string;
    reason: string;
    status: 'pending' | 'reviewed' | 'posted' | 'shelter_intake' | 'home_found' | 'declined';
    photo_url?: string | null;
    admin_notes?: string | null;
    created_at: string;
}

interface UserAdoptionApplicationsProps {
    applications: Application[];
    shelterVisits?: UserShelterVisit[];
    rehomingRequests?: UserRehomingRequest[];
}

export default function UserAdoptionApplications({
    applications = [],
    shelterVisits = [],
    rehomingRequests = [],
}: UserAdoptionApplicationsProps) {
    const [resubmittingApp, setResubmittingApp] = useState<Application | null>(null);

    const activeCount = applications.filter(
        (a) => a.status === 'pending' || a.status === 'scheduled',
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

    const getInitialDataForApp = (app: Application): AdoptionWizardInitialData => {
        return {
            fullName: app.full_name || '',
            address: app.address || '',
            phone: app.phone || '',
            email: app.email || '',
            birthDate: app.birth_date ? app.birth_date.substring(0, 10) : '',
            occupation: app.occupation || '',
            company: app.company || '',
            socialMedia: app.social_media || '',
            status: app.status_marital || '',
            pronouns: app.pronouns || '',
            adoptionSource: app.adoption_source || [],
            adoptedBefore: app.adopted_before ? 'Yes' : 'No',
            emergencyName: app.emergency_name || '',
            emergencyRelationship: app.emergency_relationship || '',
            emergencyPhone: app.emergency_phone || '',
            emergencyEmail: app.emergency_email || '',
            adoptionPreference: app.adoption_preference || '',
            residenceType: app.residence_type || '',
            isRenting: app.is_renting ? 'Yes' : 'No',
            movingPlan: app.moving_plan || '',
            livesWith: app.lives_with || [],
            hasAllergies: app.has_allergies ? 'Yes' : 'No',
            dailyCareHandler: app.daily_care_handler || '',
            expensesHandler: app.expenses_handler || '',
            emergencyHandler: app.emergency_handler || '',
            hoursAlone: app.hours_alone || '',
            introductionPlan: app.introduction_plan || '',
            familySupport: app.family_support ? 'Yes' : 'No',
            familySupportExplanation: app.family_support_explanation || '',
            currentPets: app.current_pets ? 'Yes' : 'No',
            pastPets: app.past_pets ? 'Yes' : 'No',
            preferredDate: app.preferred_date ? app.preferred_date.substring(0, 10) : '',
            preferredTime: app.preferred_time || '',
            canVisitShelter: app.can_visit_shelter ? 'Yes' : 'No',
        };
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
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/adopt"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-paw-orange text-white hover:bg-orange-600 font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-paw-orange/25"
                        >
                            Browse Pets <ChevronRight size={16} />
                        </Link>
                        <Link
                            href="/account/user/shelter-visits"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all"
                        >
                            <Building2 size={15} className="text-paw-orange" /> My Shelter Visits ({shelterVisits.length})
                        </Link>
                        <Link
                            href="/account/user/rehoming-requests"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all"
                        >
                            <HeartHandshake size={15} className="text-sky-600" /> My Rehoming Requests ({rehomingRequests.length})
                        </Link>
                    </div>
                </DashboardCard>
            ) : (
                <div className="space-y-6">
                    {/* Informational Banner */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs font-medium text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                                <p className="font-bold text-amber-950">Adoption Interview vs. Shelter Visit & Rehoming</p>
                                <p className="text-amber-800 leading-relaxed">
                                    Your adoption <strong>interview</strong> is coordinated below. Looking for your scheduled sanctuary visits or pet rehoming requests? Access them directly in their dedicated tabs.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <Link
                                href="/account/user/shelter-visits"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100/50 transition-colors"
                            >
                                <Building2 size={13} className="text-paw-orange" /> My Shelter Visits ({shelterVisits.length})
                            </Link>
                            <Link
                                href="/account/user/rehoming-requests"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100/50 transition-colors"
                            >
                                <HeartHandshake size={13} className="text-sky-600" /> My Rehoming ({rehomingRequests.length})
                            </Link>
                        </div>
                    </div>

                    {applications.map((app) => {
                        const refCode = `ADP-${String(app.id).padStart(5, '0')}`;
                        return (
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
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                                    Adoption Application for {app.shelter_animal?.name || 'Unnamed Pet'}
                                                </h3>
                                                <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-700">
                                                    {refCode}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 mt-1">
                                                Applied on {new Date(app.created_at).toLocaleDateString()} • Reference: {refCode}
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
                                        <div className="space-y-3">
                                            <div className="bg-green-50/50 dark:bg-green-950/10 p-3.5 rounded-xl border border-green-100/50 text-xs font-bold text-green-800 dark:text-green-300 flex items-start gap-2.5">
                                                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                                <p>Your application is approved! You can now visit the shelter to pick up <strong>{app.shelter_animal?.name}</strong> and sign the final adoption agreement. Congratulations on your new family member!</p>
                                            </div>
                                            {app.follow_ups && app.follow_ups.length > 0 && (
                                                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-3.5 space-y-2">
                                                    <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                                                        <Sparkles size={13} className="text-emerald-600" /> Post-Adoption Wellness Check-Ins
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {app.follow_ups.map((fu) => (
                                                            <div key={fu.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs border border-emerald-100">
                                                                <div>
                                                                    <span className="font-bold text-slate-800">
                                                                        {new Date(fu.follow_up_date).toLocaleDateString()} ({fu.method})
                                                                    </span>
                                                                    {fu.notes && <p className="text-slate-600 mt-0.5">{fu.notes}</p>}
                                                                </div>
                                                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                                                                    {fu.status}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {app.status === 'rejected' && (
                                        <div className={`p-4 rounded-xl border text-xs font-bold space-y-3 ${
                                            app.rejection_reason && app.rejection_reason.toLowerCase().includes('matched for this pet')
                                                ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 text-slate-700 dark:text-slate-300'
                                                : 'bg-red-50/50 dark:bg-red-950/10 border-red-100/50 text-red-800 dark:text-red-300'
                                        }`}>
                                            <div className="flex items-start gap-2.5">
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
                                                            Note from Shelter: {app.rejection_reason}
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

                                            {(!app.rejection_reason || !app.rejection_reason.toLowerCase().includes('matched for this pet')) && app.shelter_animal && app.shelter_animal.status !== 'adopted' && (
                                                <div className="pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setResubmittingApp(app)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                                                    >
                                                        <RefreshCw size={14} /> Edit & Re-submit Application
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DashboardCard>
                        );
                    })}
                </div>
            )}

            <AnimatePresence>
                {resubmittingApp && resubmittingApp.shelter_animal && (
                    <AdoptionWizard
                        pet={resubmittingApp.shelter_animal}
                        initialData={getInitialDataForApp(resubmittingApp)}
                        resubmitApplicationId={resubmittingApp.id}
                        onClose={() => setResubmittingApp(null)}
                    />
                )}
            </AnimatePresence>
        </DashboardSectionPage>
    );
}

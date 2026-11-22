import React, { useEffect, useRef, useState } from 'react';
import { Heart, Calendar, Clock, ChevronRight, AlertCircle, CheckCircle2, XCircle, RefreshCw, Building2, HeartHandshake, Sparkles, Ban, MessageCircle, Paperclip, Send, FileText, X } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { AdoptionWizard, AdoptionWizardInitialData } from '@/components/adoption/adoption-wizard';

interface MessageAttachment {
    path?: string;
    name: string;
    mime?: string;
    size?: number;
    url: string;
}

interface ApplicationMessage {
    id: number;
    sender_type: 'admin' | 'user' | string;
    sender_name: string;
    message: string | null;
    attachments?: MessageAttachment[];
    created_at?: string;
    created_at_formatted?: string;
}

interface Application {
    id: number;
    status: 'pending' | 'needs_info' | 'scheduled' | 'approved' | 'rejected' | 'cancelled';
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
    messages?: ApplicationMessage[];
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
    openApplicationId?: number | null;
}

export default function UserAdoptionApplications({
    applications = [],
    shelterVisits = [],
    rehomingRequests = [],
    openApplicationId = null,
}: UserAdoptionApplicationsProps) {
    const [resubmittingApp, setResubmittingApp] = useState<Application | null>(null);
    const [activeConversationAppId, setActiveConversationAppId] = useState<number | null>(openApplicationId);
    const [replyText, setReplyText] = useState('');
    const [replyFiles, setReplyFiles] = useState<File[]>([]);
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [replyError, setReplyError] = useState<string | null>(null);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const replyFileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    const activeConversationApp = applications.find((a) => a.id === activeConversationAppId) ?? null;

    useEffect(() => {
        if (openApplicationId) {
            setActiveConversationAppId(openApplicationId);
        }
    }, [openApplicationId]);

    useEffect(() => {
        if (activeConversationApp && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [activeConversationApp?.id, activeConversationApp?.messages?.length]);

    useEffect(() => {
        if (!activeConversationAppId && !lightboxUrl) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (lightboxUrl) {
                    setLightboxUrl(null);
                } else {
                    setActiveConversationAppId(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeConversationAppId, lightboxUrl]);

    const openConversation = (appId: number) => {
        setReplyText('');
        setReplyFiles([]);
        setReplyError(null);
        if (replyFileInputRef.current) {
            replyFileInputRef.current.value = '';
        }
        setActiveConversationAppId(appId);
    };

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeConversationApp || isSendingReply) {
            return;
        }

        if (!replyText.trim() && replyFiles.length === 0) {
            setReplyError('Please enter a message or attach at least one file.');
            return;
        }

        setReplyError(null);
        setIsSendingReply(true);

        router.post(
            `/account/user/adoption-applications/${activeConversationApp.id}/messages`,
            {
                message: replyText.trim(),
                attachments: replyFiles,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setReplyText('');
                    setReplyFiles([]);
                    if (replyFileInputRef.current) {
                        replyFileInputRef.current.value = '';
                    }
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    setReplyError(typeof firstError === 'string' ? firstError : 'Failed to send your reply. Please try again.');
                },
                onFinish: () => {
                    setIsSendingReply(false);
                },
            },
        );
    };

    const activeCount = applications.filter(
        (a) => a.status === 'pending' || a.status === 'scheduled',
    ).length;

    const getStatusBadge = (status: Application['status'], rejectionReason?: string | null) => {
        const isPetMatched = rejectionReason && rejectionReason.toLowerCase().includes('matched for this pet');

        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
                        <Clock size={12} /> Pending Review
                    </span>
                );
            case 'scheduled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60">
                        <Calendar size={12} /> Interview Scheduled
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/60">
                        <CheckCircle2 size={12} /> Approved
                    </span>
                );
            case 'rejected':
                if (isPetMatched) {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                            <Heart size={12} className="text-amber-500" /> Pet Matched / Closed
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60">
                        <XCircle size={12} /> Declined
                    </span>
                );
            case 'needs_info':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
                        <MessageCircle size={12} /> Info Requested
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        <Ban size={12} /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
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
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs font-medium text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 dark:bg-amber-950/25 dark:border-amber-900/50 dark:text-amber-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                                <p className="font-bold text-amber-950 dark:text-amber-200">Adoption Interview vs. Shelter Visit & Rehoming</p>
                                <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
                                    Your adoption <strong>interview</strong> is coordinated below. Looking for your scheduled sanctuary visits or pet rehoming requests? Access them directly in their dedicated tabs.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <Link
                                href="/account/user/shelter-visits"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100/50 transition-colors dark:border-amber-800/60 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-amber-950/40"
                            >
                                <Building2 size={13} className="text-paw-orange" /> My Shelter Visits ({shelterVisits.length})
                            </Link>
                            <Link
                                href="/account/user/rehoming-requests"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100/50 transition-colors dark:border-amber-800/60 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-amber-950/40"
                            >
                                <HeartHandshake size={13} className="text-sky-600 dark:text-sky-400" /> My Rehoming ({rehomingRequests.length})
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
                                                <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
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

                                    {app.status === 'needs_info' && (
                                        <div className="bg-amber-50/70 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-900 dark:text-amber-200 space-y-2.5">
                                            <div className="flex items-start gap-2.5">
                                                <MessageCircle size={16} className="shrink-0 mt-0.5 text-paw-orange" />
                                                <p>Our adoption coordinator requested additional information or requirement photos. Please reply in the conversation sidebar so we can continue reviewing your application.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => openConversation(app.id)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-paw-orange text-white hover:bg-orange-600 text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                                            >
                                                Reply &amp; Upload Requirements <ChevronRight size={13} />
                                            </button>
                                        </div>
                                    )}

                                    {app.status === 'cancelled' && (
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                                            <Ban size={16} className="shrink-0 mt-0.5 text-slate-500" />
                                            <p>You cancelled this adoption application. It is now closed.</p>
                                        </div>
                                    )}

                                    {(app.status === 'pending' || app.status === 'needs_info' || app.status === 'scheduled') && (
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => openConversation(app.id)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-xs font-black text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
                                            >
                                                <MessageCircle size={13} className="text-paw-orange" />
                                                <span>Open Conversation</span>
                                                {(app.messages?.length ?? 0) > 0 && (
                                                    <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-paw-orange/15 px-2 py-0.5 text-[10px] font-black text-paw-orange">
                                                        {app.messages?.length}
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm(`Are you sure you want to cancel your adoption application (${refCode})?`)) {
                                                        router.post(`/account/user/adoption-applications/${app.id}/cancel`, {}, { preserveScroll: true });
                                                    }
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-black text-red-700 uppercase tracking-wider transition-all cursor-pointer"
                                            >
                                                <Ban size={13} /> Cancel Application
                                            </button>
                                        </div>
                                    )}

                                    {(app.status === 'approved' || app.status === 'rejected' || app.status === 'cancelled') && (app.messages?.length ?? 0) > 0 && (
                                        <div className="pt-1">
                                            <button
                                                type="button"
                                                onClick={() => openConversation(app.id)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-xs font-black text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
                                            >
                                                <MessageCircle size={13} className="text-paw-orange" />
                                                <span>View Conversation History ({app.messages?.length})</span>
                                            </button>
                                        </div>
                                    )}

                                    {app.status === 'approved' && (
                                        <div className="space-y-3">
                                            <div className="bg-green-50/50 dark:bg-green-950/10 p-3.5 rounded-xl border border-green-100/50 text-xs font-bold text-green-800 dark:text-green-300 flex items-start gap-2.5">
                                                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                                <p>Your application is approved! You can now visit the shelter to pick up <strong>{app.shelter_animal?.name}</strong> and sign the final adoption agreement. Congratulations on your new family member!</p>
                                            </div>
                                            {app.follow_ups && app.follow_ups.length > 0 && (
                                                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-3.5 space-y-2 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                                                    <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                                                        <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" /> Post-Adoption Wellness Check-Ins
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {app.follow_ups.map((fu) => (
                                                            <div key={fu.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs border border-emerald-100 dark:bg-slate-900 dark:border-emerald-900/40">
                                                                <div>
                                                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                                                        {new Date(fu.follow_up_date).toLocaleDateString()} ({fu.method})
                                                                    </span>
                                                                    {fu.notes && <p className="text-slate-600 dark:text-slate-400 mt-0.5">{fu.notes}</p>}
                                                                </div>
                                                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
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

            <AnimatePresence>
                {activeConversationApp && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveConversationAppId(null)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                        />
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                            aria-label="Coordinator conversation sidebar"
                            className="relative z-10 flex h-full w-full sm:max-w-lg flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl"
                        >
                            <div className="p-5 pr-14 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 relative">
                                <button
                                    type="button"
                                    onClick={() => setActiveConversationAppId(null)}
                                    aria-label="Close conversation sidebar"
                                    className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-paw-orange/10 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                                        {activeConversationApp.shelter_animal?.photo_url ? (
                                            <ImageWithFallback
                                                src={activeConversationApp.shelter_animal.photo_url}
                                                alt={activeConversationApp.shelter_animal.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Heart size={20} className="text-paw-orange" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="font-fredoka text-base font-bold text-[#0B2340] dark:text-white truncate">
                                                {activeConversationApp.shelter_animal?.name || 'Adoption Application'}
                                            </h2>
                                            <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                ADP-{String(activeConversationApp.id).padStart(5, '0')}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                            Coordinator Conversation &amp; Requirements
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-2.5">
                                    {getStatusBadge(activeConversationApp.status, activeConversationApp.rejection_reason)}
                                </div>
                            </div>

                            <div
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto p-5 space-y-3"
                            >
                                {(!activeConversationApp.messages || activeConversationApp.messages.length === 0) ? (
                                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                                        No messages yet. You can send additional details or upload requirement photos here for the adoption coordinator.
                                    </div>
                                ) : (
                                    activeConversationApp.messages.map((msg) => {
                                        const isUser = msg.sender_type === 'user';
                                        const timestamp =
                                            msg.created_at_formatted ||
                                            (msg.created_at
                                                ? new Date(msg.created_at).toLocaleString(undefined, {
                                                      month: 'short',
                                                      day: 'numeric',
                                                      year: 'numeric',
                                                      hour: 'numeric',
                                                      minute: '2-digit',
                                                  })
                                                : null);

                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs space-y-2 border ${
                                                        isUser
                                                            ? 'bg-orange-50/80 dark:bg-orange-950/30 border-orange-200/80 dark:border-orange-900 text-slate-900 dark:text-orange-50'
                                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                        <span>
                                                            {isUser
                                                                ? `${msg.sender_name} (You)`
                                                                : `${msg.sender_name} • Shelter Coordinator`}
                                                        </span>
                                                        {timestamp && <span>{timestamp}</span>}
                                                    </div>
                                                    {msg.message && (
                                                        <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">
                                                            {msg.message}
                                                        </p>
                                                    )}
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 pt-1">
                                                            {msg.attachments.map((att, aIdx) => {
                                                                const isImage =
                                                                    att.mime?.startsWith('image/') ||
                                                                    /\.(jpg|jpeg|png|webp|gif)$/i.test(att.name);
                                                                return isImage ? (
                                                                    <button
                                                                        key={aIdx}
                                                                        type="button"
                                                                        onClick={() => setLightboxUrl(att.url)}
                                                                        className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 w-20 h-20 bg-white cursor-pointer"
                                                                        title={att.name}
                                                                    >
                                                                        <img
                                                                            src={att.url}
                                                                            alt={att.name}
                                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                        />
                                                                    </button>
                                                                ) : (
                                                                    <a
                                                                        key={aIdx}
                                                                        href={att.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-paw-orange transition-colors"
                                                                    >
                                                                        <FileText size={13} className="text-paw-orange" />
                                                                        <span className="max-w-[140px] truncate">{att.name}</span>
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {activeConversationApp.status !== 'cancelled' && activeConversationApp.status !== 'rejected' ? (
                                <form
                                    onSubmit={handleReplySubmit}
                                    className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3"
                                >
                                    {replyError && (
                                        <p className="text-xs font-bold text-red-600 dark:text-red-400">{replyError}</p>
                                    )}

                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        rows={3}
                                        placeholder="Write additional details or answer the coordinator's questions..."
                                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-paw-orange rounded-2xl outline-none font-medium text-xs text-slate-900 dark:text-white resize-none transition-all"
                                    />

                                    {replyFiles.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {replyFiles.map((file, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200"
                                                >
                                                    <Paperclip size={12} className="text-paw-orange" />
                                                    <span className="max-w-[160px] truncate">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setReplyFiles((prev) => prev.filter((_, i) => i !== idx))
                                                        }
                                                        className="text-slate-400 hover:text-red-500 cursor-pointer"
                                                        aria-label={`Remove ${file.name}`}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all">
                                            <Paperclip size={14} className="text-paw-orange" />
                                            <span>Attach (max 5)</span>
                                            <input
                                                ref={replyFileInputRef}
                                                type="file"
                                                multiple
                                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                                onChange={(e) => {
                                                    const selected = Array.from(e.target.files || []).slice(0, 5);
                                                    setReplyFiles(selected);
                                                }}
                                                className="hidden"
                                            />
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={isSendingReply}
                                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-paw-orange hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                        >
                                            <Send size={13} />
                                            {isSendingReply ? 'Sending...' : 'Send Reply'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                    This application is {activeConversationApp.status}. Messaging is closed.
                                </div>
                            )}
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setLightboxUrl(null)}
                >
                    <button
                        type="button"
                        onClick={() => setLightboxUrl(null)}
                        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
                        aria-label="Close image preview"
                    >
                        <X size={20} />
                    </button>
                    <img
                        src={lightboxUrl}
                        alt="Attachment preview"
                        className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </DashboardSectionPage>
    );
}

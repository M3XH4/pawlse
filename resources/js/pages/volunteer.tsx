import { usePage, useForm, router, Link } from '@inertiajs/react';
import { Heart, Users, MapPin, Check, Plus, ShieldCheck, Zap, HandHeart, Trophy, Award, ChevronRight, ChevronLeft, Info, CheckCircle2, Calendar, Clock, Utensils, User, Mail, Phone, Home, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { SubmissionReceipt } from '@/components/submission-receipt';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/phone-formatter';

type Event = {
    type: string,
    category: string,
    title: string,
    date: string,
    time: string,
    location: string,
    zone: string,
    day: string,
    volunteers: number,
    strays: number
};

function StethoscopeIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
            <path d="M6 3h-3" />
            <path d="M15 3h-3" />
            <path d="M9 12.5v2.5a4 4 0 0 0 8 0V11" />
            <circle cx="17" cy="10" r="2" />
        </svg>
    );
}

function PawIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <path d="M12 11.5c-2.3 0-4.2 1.9-4.2 4.2 0 2.2 1.7 3.8 4.2 3.8s4.2-1.6 4.2-3.8c0-2.3-1.9-4.2-4.2-4.2zM5.5 10c1.2 0 2.2-1.2 2.2-2.7S6.7 4.6 5.5 4.6s-2.2 1.2-2.2 2.7S4.3 10 5.5 10zm4-4c1.2 0 2.2-1.2 2.2-2.7S10.7.6 9.5.6s-2.2 1.2-2.2 2.7S8.3 6 9.5 6zm5 0c1.2 0 2.2-1.2 2.2-2.7S15.7.6 14.5.6s-2.2 1.2-2.2 2.7S13.3 6 14.5 6zm4 4c1.2 0 2.2-1.2 2.2-2.7S19.7 4.6 18.5 4.6s-2.2 1.2-2.2 2.7S17.3 10 18.5 10z" />
        </svg>
    );
}

function WarningTriangleIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

const HOW_IT_WORKS_STEPS = [
    {
        step: 1,
        title: 'Apply / Contact ISF',
        desc: 'Express your interest through the application form below or reach ISF through social media.',
    },
    {
        step: 2,
        title: 'Attend Orientation',
        desc: "Attend a scheduled orientation session to learn about ISF's mission, safety, and volunteer workflow.",
    },
    {
        step: 3,
        title: 'Complete Volunteer Information',
        desc: 'Fill out your volunteer information form during or after orientation.',
    },
    {
        step: 4,
        title: 'Join an Activity',
        desc: 'Participate in your first feeding run, rescue operation, or event.',
    },
    {
        step: 5,
        title: 'Become Part of the Community',
        desc: 'Join the ISF volunteer group and continue contributing as an Active or Core volunteer.',
    },
];

const VOLUNTEER_ROLES = [
    { id: 1, title: 'Feeding', desc: 'Carry and distribute food along feeding routes and stations.', icon: <Utensils size={24} />, color: 'bg-orange-500' },
    { id: 2, title: 'Rescue', desc: 'Assist in animal rescue operations and emergency response across Iligan.', icon: <Heart size={24} />, color: 'bg-blue-500' },
    { id: 3, title: 'Events', desc: 'Help organize and support ISF community events, adoption fairs, and activities.', icon: <Calendar size={24} />, color: 'bg-emerald-500' },
    { id: 4, title: 'Foster Volunteer', desc: 'Provide temporary care for rescued animals when shelter placement or other temporary care is needed.', icon: <Home size={24} />, color: 'bg-purple-500' },
    { id: 5, title: 'Medic Volunteer', desc: 'Support ISF in appropriate animal-care and rescue support situations.', icon: <StethoscopeIcon size={24} />, color: 'bg-rose-500' },
    { id: 6, title: 'Transport', desc: 'Coordinate vehicles and transportation for rescue and care operations.', icon: <MapPin size={24} />, color: 'bg-teal-500' },
];

interface VolunteerPageProps {
    application?: {
        id: number;
        status: string;
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
        reference_number: string;
        rejection_reason: string | null;
    } | null;
    selectedEvent?: Event | null;
    auth?: {
        user?: any;
    };
}

export default function VolunteerPage({ application, selectedEvent, auth }: VolunteerPageProps) {
    const selectedEventFromState = selectedEvent || null;
    const [currentStep, setCurrentStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [ignoreApplication, setIgnoreApplication] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
    const allowNavigationRef = useRef(false);

    const currentUser = auth?.user;

    const { data, setData, post, processing, errors, reset } = useForm({
        fullName: currentUser?.name || '',
        mobile: currentUser?.phone ? formatPhoneNumber(currentUser.phone) : '',
        email: currentUser?.email || '',
        address: currentUser?.location || '',
        role: '',
        experience: '',
        why: '',
        foster_capacity: 2,
        foster_preference: 'both',
        foster_needs: '',
        medic_experience: '',
        medic_certifications: '',
        transport_has_license: false,
    });

    const isFormDirty = Boolean(!application || ignoreApplication) && (
        (data.fullName.trim() !== '' && data.fullName !== (currentUser?.name || '')) ||
        (data.mobile.trim() !== '' && data.mobile !== (currentUser?.phone ? formatPhoneNumber(currentUser.phone) : '')) ||
        (data.email.trim() !== '' && data.email !== (currentUser?.email || '')) ||
        (data.address.trim() !== '' && data.address !== (currentUser?.location || '')) ||
        data.role !== '' ||
        data.why.trim() !== '' ||
        data.experience.trim() !== '' ||
        data.medic_certifications.trim() !== '' ||
        data.medic_experience.trim() !== '' ||
        data.foster_needs.trim() !== '' ||
        data.transport_has_license ||
        currentStep > 1
    );

    // Intercept Inertia routing and browser navigation when form is dirty
    useEffect(() => {
        const unsubscribe = router.on('before', (event) => {
            if (allowNavigationRef.current || submitted) {
                return;
            }

            if (isFormDirty) {
                event.preventDefault();
                const targetUrl = event.detail.visit.url.href;
                setPendingNavigation(targetUrl);
                setShowLeaveModal(true);
            }
        });

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!allowNavigationRef.current && !submitted && isFormDirty) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        const handlePopState = () => {
            if (!allowNavigationRef.current && !submitted && isFormDirty) {
                window.history.pushState(null, '', window.location.href);
                setPendingNavigation('back');
                setShowLeaveModal(true);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isFormDirty, submitted]);

    const handleLeaveAnyway = () => {
        allowNavigationRef.current = true;
        setShowLeaveModal(false);
        if (pendingNavigation === 'back') {
            window.history.back();
        } else if (pendingNavigation) {
            router.visit(pendingNavigation);
        } else {
            window.history.back();
        }
    };

    const handleContinueEditing = () => {
        setShowLeaveModal(false);
        setPendingNavigation(null);
    };

    const hasRoleSpecificStep = data.role === 'Foster Volunteer' || data.role === 'Medic Volunteer';
    const totalSteps = hasRoleSpecificStep ? 4 : 3;

    // Reset step boundary if role switched
    useEffect(() => {
        if (!hasRoleSpecificStep && currentStep > 3) {
            setCurrentStep(3);
        }
    }, [hasRoleSpecificStep, currentStep]);

    const validateStep1 = () => {
        return data.fullName.trim() !== '' &&
            data.mobile.trim() !== '' &&
            isValidPhoneNumber(data.mobile) &&
            data.email.trim() !== '' &&
            data.address.trim() !== '' &&
            data.role !== '';
    };

    const validateStep2 = () => {
        if (!allTermsAccepted) return false;
        if (data.role === 'Transport' && !data.transport_has_license) {
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (hasRoleSpecificStep) {
            if (data.role === 'Foster Volunteer') {
                return Number(data.foster_capacity) >= 1 &&
                    Boolean(data.foster_preference) &&
                    data.foster_needs.trim() !== '';
            }
            if (data.role === 'Medic Volunteer') {
                return data.medic_certifications.trim() !== '';
            }
        }
        return data.why.trim() !== '';
    };

    const validateStep4 = () => {
        if (hasRoleSpecificStep) {
            return data.why.trim() !== '';
        }
        return true;
    };

    const canProceed = () => {
        if (currentStep === 1) return validateStep1();
        if (currentStep === 2) return validateStep2();
        if (currentStep === 3) return validateStep3();
        if (currentStep === 4) return validateStep4();
        return false;
    };

    const nextStep = () => {
        if (!canProceed()) return;
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (currentStep === totalSteps && canProceed()) {
            allowNavigationRef.current = true;
            post('/volunteer/apply', {
                onSuccess: () => {
                    setSubmitted(true);
                },
                onError: () => {
                    allowNavigationRef.current = false;
                }
            });
        }
    };

    const [termsAccepted, setTermsAccepted] = useState({
        codeOfConduct: false,
        orientation: false,
        backgroundCheck: false,
        availability: false,
        safetyProtocol: false
    });

    const allTermsAccepted = Object.values(termsAccepted).every(val => val);

    // Auto-select role based on event type and scroll to top
    useEffect(() => {
        if (selectedEventFromState) {
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (selectedEventFromState.type === 'feeding') {
                setData(prev => ({ ...prev, role: 'Feeding' }));
            } else if (selectedEventFromState.type === 'event') {
                if (selectedEventFromState.category === 'Medical') {
                    setData(prev => ({ ...prev, role: 'Medic Volunteer' }));
                } else if (selectedEventFromState.category === 'Feeding') {
                    setData(prev => ({ ...prev, role: 'Feeding' }));
                } else {
                    setData(prev => ({ ...prev, role: 'Events' }));
                }
            }
        }
    }, [selectedEventFromState]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'mobile') {
            setData('mobile', formatPhoneNumber(value));
            return;
        }
        setData(name as any, value);
    };

    return (
        <div className="min-h-screen bg-paw-bg font-quicksand">
            <Header />

            <main className="py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-24">
                        <div className="text-center mb-16">
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex items-center gap-2 border border-amber-300 bg-amber-50/70 text-amber-600 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                                    <HandHeart size={14} className="text-amber-500" />
                                    Join the Movement
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-paw-navy tracking-tight leading-tight mb-6">
                                Help Us Feed the Pack
                            </h1>
                            <p className="text-gray-500 font-bold text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                                ISF continues to rescue, feed, and care for Iligan's stray animals through dedicated volunteers. Every helping hand sustains the mission.
                            </p>
                        </div>

                        {/* How It Works Section with Connected Circles */}
                        <div className="max-w-6xl mx-auto mb-20 px-4">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center mb-10">
                                HOW IT WORKS
                            </p>
                            <div className="relative">
                                {/* Connecting Track line */}
                                <div className="absolute top-7 left-12 right-12 h-0.5 bg-amber-200/90 -z-0 hidden md:block" />

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 relative z-10 text-center">
                                    {HOW_IT_WORKS_STEPS.map((s) => (
                                        <div key={s.step} className="flex flex-col items-center group">
                                            <div className="w-14 h-14 bg-paw-orange text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg shadow-paw-orange/40 ring-8 ring-paw-bg transition-transform duration-300 group-hover:scale-110">
                                                {s.step}
                                            </div>
                                            <h3 className="font-black text-paw-navy text-sm md:text-base mt-4 mb-2 leading-snug">
                                                {s.title}
                                            </h3>
                                            <p className="text-xs text-gray-400 font-bold leading-relaxed max-w-[190px]">
                                                {s.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-[60px] shadow-2xl shadow-paw-navy/10 border-2 border-paw-orange/10 relative overflow-hidden p-8 md:p-12">
                                
                                {application && !ignoreApplication ? (
                                    /* Active Application Status Screen */
                                    <div className="py-6">
                                        {application.status === 'pending' && (
                                            <div className="text-center">
                                                <div className="w-20 h-20 bg-paw-orange/10 text-paw-orange rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                                    <Clock size={40} className="text-paw-orange animate-pulse" />
                                                </div>
                                                <h2 className="text-3xl sm:text-4xl font-black text-paw-navy mb-4">Application Under Review</h2>
                                                <p className="text-gray-500 font-bold text-base max-w-xl mx-auto mb-8">
                                                    Thank you for applying! Your application (Ref: <span className="text-paw-orange">{application.reference_number}</span>) is currently pending review. 
                                                    Our volunteer coordinator will update your status soon.
                                                </p>
                                                <div className="bg-paw-bg max-w-md mx-auto rounded-3xl p-6 text-left border-2 border-paw-orange/5">
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Submitted Info</p>
                                                    <div className="space-y-2 font-bold text-sm text-gray-700">
                                                        <p><span className="text-gray-400">Name:</span> {application.full_name}</p>
                                                        <p><span className="text-gray-400">Preferred Role:</span> {application.role}</p>
                                                        <p><span className="text-gray-400">Contact:</span> {application.mobile}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {application.status === 'approved' && (
                                            <div className="text-center">
                                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-600/10">
                                                    <CheckCircle2 size={40} strokeWidth={3} />
                                                </div>
                                                <h2 className="text-3xl sm:text-4xl font-black text-paw-navy mb-4">Application Approved!</h2>
                                                <p className="text-gray-500 font-bold text-base max-w-xl mx-auto mb-8">
                                                    Congratulations! Your application has been approved. You are now officially registered as an ISF volunteer.
                                                </p>
                                                
                                                {auth?.user?.role !== 'volunteer' ? (
                                                    <button
                                                        onClick={() => router.post('/volunteer/switch')}
                                                        className="px-8 py-4 bg-paw-orange text-white rounded-[24px] font-black text-lg hover:bg-orange-600 transition-all shadow-xl shadow-paw-orange/20 cursor-pointer"
                                                    >
                                                        SWITCH TO VOLUNTEER DASHBOARD
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href="/account/volunteer"
                                                        className="inline-block px-8 py-4 bg-paw-navy text-white rounded-[24px] font-black text-lg hover:bg-slate-800 transition-all shadow-xl"
                                                    >
                                                        GO TO VOLUNTEER DASHBOARD
                                                    </Link>
                                                )}
                                            </div>
                                        )}

                                        {application.status === 'rejected' && (
                                            <div className="text-center">
                                                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                                    <X size={40} strokeWidth={3} />
                                                </div>
                                                <h2 className="text-3xl sm:text-4xl font-black text-paw-navy mb-4">Application Declined</h2>
                                                <p className="text-gray-500 font-bold text-base max-w-xl mx-auto mb-6">
                                                    We appreciate your interest, but we are unable to accept your volunteer application at this time.
                                                </p>
                                                {application.rejection_reason && (
                                                    <div className="bg-red-50 max-w-lg mx-auto rounded-3xl p-6 border-2 border-red-200 text-left mb-8">
                                                        <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">Coordinator Feedback</p>
                                                        <p className="font-bold text-sm text-red-800">{application.rejection_reason}</p>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setIgnoreApplication(true);
                                                        reset();
                                                    }}
                                                    className="px-8 py-4 bg-paw-navy text-white rounded-[24px] font-black text-lg hover:bg-slate-800 transition-all cursor-pointer"
                                                >
                                                    RE-APPLY NOW
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Multi-Step Application Form */
                                    <>
                                        <div className="mb-8">
                                            <h2 className="text-4xl font-black text-paw-navy mb-4">Volunteer Application</h2>
                                            <p className="text-gray-500 font-bold mb-6 text-lg">
                                                Start your journey with ISF! Fill out the form below and our
                                                volunteer coordinator will reach out to you within 24 hours.
                                            </p>

                                            {/* Show selected event if coming from Events page */}
                                            {selectedEventFromState && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-gradient-to-br from-paw-orange to-paw-yellow rounded-3xl p-6 mb-6 text-white"
                                                >
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                                            {selectedEventFromState.type === 'feeding' ? <Utensils size={24} /> : <Calendar size={24} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-white/80 uppercase tracking-widest">You're applying for</p>
                                                            <h3 className="text-xl font-black">
                                                                {selectedEventFromState.type === 'feeding' ? selectedEventFromState.zone : selectedEventFromState.title}
                                                            </h3>
                                                            {selectedEventFromState.type === 'event' && (
                                                                <p className="text-sm font-bold text-white/90">{selectedEventFromState.category} Event</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Calendar size={14} />
                                                                <p className="text-xs font-bold text-white/80">
                                                                    {selectedEventFromState.type === 'feeding' ? 'Schedule' : 'Date'}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm font-black">
                                                                {selectedEventFromState.type === 'feeding' ? selectedEventFromState.day : selectedEventFromState.date}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Clock size={14} />
                                                                <p className="text-xs font-bold text-white/80">Time</p>
                                                            </div>
                                                            <p className="text-sm font-black">{selectedEventFromState.time}</p>
                                                        </div>
                                                    </div>
                                                    {selectedEventFromState.type === 'feeding' ? (
                                                        <div className="mt-4 bg-white/20 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Users size={16} />
                                                                <span className="text-sm font-bold">{selectedEventFromState.volunteers} volunteers needed</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Heart size={16} />
                                                                <span className="text-sm font-bold">{selectedEventFromState.strays} strays to feed</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-4 bg-white/20 backdrop-blur-md rounded-2xl p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <MapPin size={14} />
                                                                <p className="text-xs font-bold text-white/80">Location</p>
                                                            </div>
                                                            <p className="text-sm font-black">{selectedEventFromState.location}</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {/* Progress Indicator */}
                                            <div className="max-w-md mx-auto mb-8 px-2">
                                                <div className="relative flex items-center justify-between">
                                                    {/* Background connecting track */}
                                                    <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full z-0">
                                                        <div
                                                            className="h-full bg-paw-orange rounded-full transition-all duration-300"
                                                            style={{
                                                                width: totalSteps === 4
                                                                    ? (currentStep === 1 ? '0%' : currentStep === 2 ? '33.33%' : currentStep === 3 ? '66.66%' : '100%')
                                                                    : (currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%')
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Step circles */}
                                                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                                                        <div key={step} className="relative z-10 flex flex-col items-center">
                                                            <div
                                                                className={`flex items-center justify-center w-10 h-10 rounded-full font-black transition-all duration-300 ring-4 ring-white ${
                                                                    currentStep >= step
                                                                        ? 'bg-paw-orange text-white shadow-lg shadow-paw-orange/30'
                                                                        : 'bg-gray-200 text-gray-400'
                                                                }`}
                                                            >
                                                                {step}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <p className="text-sm font-black text-paw-orange uppercase tracking-widest text-center">
                                                {currentStep === 1 && 'Step 1: Basic Information & Role'}
                                                {currentStep === 2 && 'Step 2: Terms & Requirements'}
                                                {currentStep === 3 && (hasRoleSpecificStep
                                                    ? (data.role === 'Foster Volunteer' ? 'Step 3: Foster Home Capacity & Preferences' : 'Step 3: Medical Credentials & Experience')
                                                    : 'Step 3: Motivation & Submit')}
                                                {currentStep === 4 && 'Step 4: Motivation & Submit'}
                                            </p>
                                        </div>

                                        <form className="space-y-8" onSubmit={handleSubmit}>
                                            <AnimatePresence mode="wait">
                                                {/* Step 1: Basic Info & Role Selection */}
                                                {currentStep === 1 && (
                                                    <motion.div
                                                        key="step1"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="space-y-8"
                                                    >
                                                        <div className="grid md:grid-cols-2 gap-8">
                                                            <div>
                                                                <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Full Name *</label>
                                                                <input required type="text" className="w-full p-6 bg-paw-bg border-2 border-transparent rounded-[24px] outline-none focus:border-paw-orange transition-all font-bold text-gray-800" placeholder="First & Last Name" name="fullName" value={data.fullName} onChange={handleInputChange} />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Mobile Number *</label>
                                                                <input required type="tel" className="w-full p-6 bg-paw-bg border-2 border-transparent rounded-[24px] outline-none focus:border-paw-orange transition-all font-bold text-gray-800" placeholder="+63 9XX XXX XXXX" name="mobile" value={data.mobile} onChange={handleInputChange} />
                                                            </div>
                                                        </div>

                                                        <div className="grid md:grid-cols-2 gap-8">
                                                            <div>
                                                                <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Email Address *</label>
                                                                <input required type="email" className="w-full p-6 bg-paw-bg border-2 border-transparent rounded-[24px] outline-none focus:border-paw-orange transition-all font-bold text-gray-800" placeholder="your@email.com" name="email" value={data.email} onChange={handleInputChange} />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Address *</label>
                                                                <input required type="text" className="w-full p-6 bg-paw-bg border-2 border-transparent rounded-[24px] outline-none focus:border-paw-orange transition-all font-bold text-gray-800" placeholder="City, Barangay" name="address" value={data.address} onChange={handleInputChange} />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-black text-gray-400 mb-4 uppercase tracking-widest">
                                                                Preferred Role * {data.role && <span className="text-paw-orange">({data.role.toUpperCase()} SELECTED)</span>}
                                                            </label>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {VOLUNTEER_ROLES.map((r) => {
                                                                    const isSelected = data.role === r.title;
                                                                    return (
                                                                        <button
                                                                            key={r.id}
                                                                            type="button"
                                                                            className={`p-6 rounded-3xl border-2 font-bold text-left transition-all cursor-pointer relative ${
                                                                                isSelected
                                                                                    ? 'border-paw-orange bg-paw-orange/5 text-paw-orange shadow-lg shadow-paw-orange/10'
                                                                                    : 'border-gray-200/80 bg-white hover:border-paw-orange/40 text-gray-700'
                                                                            }`}
                                                                            onClick={() => setData('role', r.title)}
                                                                        >
                                                                            <div className="flex items-start gap-4">
                                                                                <div className={`w-12 h-12 ${r.color} rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md shadow-black/5`}>
                                                                                    {r.icon}
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className={`font-black text-base mb-1 ${isSelected ? 'text-paw-orange' : 'text-paw-navy'}`}>{r.title}</h4>
                                                                                    <p className={`text-xs font-semibold leading-relaxed ${isSelected ? 'text-paw-orange/80' : 'text-gray-400'}`}>{r.desc}</p>
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {!validateStep1() && (
                                                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                                                                <Info size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                                                                <p className="text-xs font-bold text-yellow-800">
                                                                    Please fill in all required fields and select a role to continue.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {/* Step 2: Terms & Conditions */}
                                                {currentStep === 2 && (
                                                    <motion.div
                                                        key="step2"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="space-y-6"
                                                    >
                                                        <div className="bg-paw-blue/10 p-6 rounded-3xl border-2 border-paw-blue/20 mb-8">
                                                            <h3 className="font-black text-paw-navy text-xl mb-2 flex items-center gap-2">
                                                                <ShieldCheck size={24} className="text-paw-blue" />
                                                                Before You Proceed
                                                            </h3>
                                                            <p className="text-sm font-bold text-gray-600">
                                                                Please review and accept the following requirements to become an ISF volunteer.
                                                            </p>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <label className="flex items-start gap-4 p-5 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-paw-orange transition-all">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={termsAccepted.codeOfConduct}
                                                                    onChange={(e) => setTermsAccepted({ ...termsAccepted, codeOfConduct: e.target.checked })}
                                                                    className="w-5 h-5 accent-paw-orange mt-1 shrink-0"
                                                                />
                                                                <div>
                                                                    <p className="font-black text-paw-navy mb-1">Code of Conduct Agreement</p>
                                                                    <p className="text-xs font-bold text-gray-500">I agree to follow ISF's Code of Conduct which includes treating all animals with compassion, respecting team members, and upholding the organization's values.</p>
                                                                </div>
                                                            </label>

                                                            <label className="flex items-start gap-4 p-5 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-paw-orange transition-all">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={termsAccepted.orientation}
                                                                    onChange={(e) => setTermsAccepted({ ...termsAccepted, orientation: e.target.checked })}
                                                                    className="w-5 h-5 accent-paw-orange mt-1 shrink-0"
                                                                />
                                                                <div>
                                                                    <p className="font-black text-paw-navy mb-1">Mandatory Orientation Attendance</p>
                                                                    <p className="text-xs font-bold text-gray-500">I commit to attending a 1-hour orientation session before my first volunteer activity to learn about safety protocols and procedures.</p>
                                                                </div>
                                                            </label>

                                                            <label className="flex items-start gap-4 p-5 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-paw-orange transition-all">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={termsAccepted.backgroundCheck}
                                                                    onChange={(e) => setTermsAccepted({ ...termsAccepted, backgroundCheck: e.target.checked })}
                                                                    className="w-5 h-5 accent-paw-orange mt-1 shrink-0"
                                                                />
                                                                <div>
                                                                    <p className="font-black text-paw-navy mb-1">Background Verification</p>
                                                                    <p className="text-xs font-bold text-gray-500">I consent to a basic background check and provide valid identification for volunteer registration purposes.</p>
                                                                </div>
                                                            </label>

                                                            <label className="flex items-start gap-4 p-5 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-paw-orange transition-all">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={termsAccepted.availability}
                                                                    onChange={(e) => setTermsAccepted({ ...termsAccepted, availability: e.target.checked })}
                                                                    className="w-5 h-5 accent-paw-orange mt-1 shrink-0"
                                                                />
                                                                <div>
                                                                    <p className="font-black text-paw-navy mb-1">Time Commitment</p>
                                                                    <p className="text-xs font-bold text-gray-500">I understand that I need to commit at least 4 hours per month and will inform my coordinator if I cannot fulfill scheduled activities.</p>
                                                                </div>
                                                            </label>

                                                            <label className="flex items-start gap-4 p-5 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-paw-orange transition-all">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={termsAccepted.safetyProtocol}
                                                                    onChange={(e) => setTermsAccepted({ ...termsAccepted, safetyProtocol: e.target.checked })}
                                                                    className="w-5 h-5 accent-paw-orange mt-1 shrink-0"
                                                                />
                                                                <div>
                                                                    <p className="font-black text-paw-navy mb-1">Animal Safety Protocols</p>
                                                                    <p className="text-xs font-bold text-gray-500">I will follow all animal handling and safety protocols, wear appropriate gear, and immediately report any incidents or injuries.</p>
                                                                </div>
                                                            </label>
                                                        </div>

                                                        {/* Transport-Specific Requirement Declaration Checkbox */}
                                                        {data.role === 'Transport' && (
                                                            <div className="pt-2">
                                                                <div className="bg-teal-50 border-2 border-teal-300 rounded-3xl p-6 shadow-sm">
                                                                    <div className="flex items-center gap-3 mb-4">
                                                                        <div className="w-10 h-10 bg-teal-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
                                                                            <MapPin size={20} />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-black text-teal-950 text-base">Transport Volunteer Requirement</h4>
                                                                            <p className="text-xs font-bold text-teal-700">Driver's License and Vehicle Registration verification</p>
                                                                        </div>
                                                                    </div>

                                                                    <label className="flex items-start gap-4 p-4 bg-white border-2 border-teal-200 rounded-2xl cursor-pointer hover:border-teal-500 transition-all">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={data.transport_has_license}
                                                                            onChange={(e) => setData('transport_has_license', e.target.checked)}
                                                                            className="w-5 h-5 accent-teal-600 mt-1 shrink-0 cursor-pointer"
                                                                        />
                                                                        <div>
                                                                            <p className="font-black text-paw-navy text-sm mb-1">
                                                                                Valid Driver's License & Vehicle Registration Declaration *
                                                                            </p>
                                                                            <p className="text-xs font-bold text-gray-600 leading-relaxed">
                                                                                I hereby declare that I hold an active, valid driver's license and up-to-date vehicle registration for the motor vehicle(s) I will operate during rescue and transport operations.
                                                                            </p>
                                                                        </div>
                                                                    </label>

                                                                    {!data.transport_has_license && (
                                                                        <p className="text-xs font-bold text-teal-800 mt-3 flex items-center gap-1.5">
                                                                            <Info size={14} className="shrink-0" />
                                                                            You must check this declaration to proceed as a Transport volunteer.
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!validateStep2() && (
                                                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                                                                <Info size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                                                                <p className="text-xs font-bold text-yellow-800">
                                                                    {data.role === 'Transport' && !data.transport_has_license
                                                                        ? 'Please accept all volunteer requirements and confirm the driver\'s license declaration to continue.'
                                                                        : 'Please accept all requirements above to proceed to the next step.'}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {/* Step 3: Role Requirements (Foster Volunteer or Medic Volunteer) */}
                                                {currentStep === 3 && hasRoleSpecificStep && (
                                                    <motion.div
                                                        key="step3-role-requirements"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="space-y-8"
                                                    >
                                                        {data.role === 'Foster Volunteer' && (
                                                            <div className="space-y-6">
                                                                <div className="bg-purple-50 p-6 rounded-3xl border-2 border-purple-200">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <div className="w-10 h-10 bg-purple-600 text-white rounded-2xl flex items-center justify-center shrink-0">
                                                                            <Home size={20} />
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="font-black text-purple-950 text-xl">Foster Home Requirements & Capacity</h3>
                                                                            <p className="text-xs font-bold text-purple-700">Tell us about your home setup and care preferences so we can match you with pets in need.</p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Foster Capacity */}
                                                                <div>
                                                                    <label className="block text-sm font-black text-gray-500 mb-2 uppercase tracking-widest">
                                                                        Foster Capacity (Max Concurrent Pets) *
                                                                    </label>
                                                                    <p className="text-xs font-bold text-gray-400 mb-4">How many foster pets can your home comfortably accommodate at the same time?</p>
                                                                    <div className="flex flex-wrap gap-3 mb-4">
                                                                        {[1, 2, 3, 4, 5].map((capacity) => (
                                                                            <button
                                                                                key={capacity}
                                                                                type="button"
                                                                                onClick={() => setData('foster_capacity', capacity)}
                                                                                className={`px-6 py-3.5 rounded-2xl font-black text-sm transition-all cursor-pointer ${
                                                                                    Number(data.foster_capacity) === capacity
                                                                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-600'
                                                                                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                                                                                }`}
                                                                            >
                                                                                {capacity === 5 ? '5+ Pets' : `${capacity} ${capacity === 1 ? 'Pet' : 'Pets'}`}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                    <div className="max-w-xs">
                                                                        <input
                                                                            type="number"
                                                                            min={1}
                                                                            max={20}
                                                                            value={data.foster_capacity}
                                                                            onChange={(e) => setData('foster_capacity', Math.max(1, parseInt(e.target.value) || 1))}
                                                                            className="w-full p-4 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-purple-500 font-bold text-gray-800 text-sm"
                                                                            placeholder="Custom capacity number"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Pet Preference */}
                                                                <div>
                                                                    <label className="block text-sm font-black text-gray-500 mb-2 uppercase tracking-widest">
                                                                        Animal Preference *
                                                                    </label>
                                                                    <p className="text-xs font-bold text-gray-400 mb-4">Which types of animals are you best equipped to care for?</p>
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                        {[
                                                                            { id: 'cats', label: 'Cats Only', desc: 'Kittens, adult cats, nursing mothers' },
                                                                            { id: 'dogs', label: 'Dogs Only', desc: 'Puppies, adult dogs, recovery cases' },
                                                                            { id: 'both', label: 'Both Cats & Dogs', desc: 'Flexible to foster either species' },
                                                                        ].map((pref) => {
                                                                            const isSelected = data.foster_preference === pref.id;
                                                                            return (
                                                                                <button
                                                                                    key={pref.id}
                                                                                    type="button"
                                                                                    onClick={() => setData('foster_preference', pref.id)}
                                                                                    className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                                                                                        isSelected
                                                                                            ? 'border-purple-600 bg-purple-50/70 text-purple-900 shadow-md shadow-purple-600/10'
                                                                                            : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200'
                                                                                    }`}
                                                                                >
                                                                                    <h4 className="font-black text-sm mb-1">{pref.label}</h4>
                                                                                    <p className="text-xs font-semibold text-gray-400">{pref.desc}</p>
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>

                                                                {/* Foster Housing & Overall Needs */}
                                                                <div>
                                                                    <label className="block text-sm font-black text-gray-500 mb-2 uppercase tracking-widest">
                                                                        Housing Environment & Overall Needs *
                                                                    </label>
                                                                    <p className="text-xs font-bold text-gray-400 mb-2">
                                                                        Describe your living space (e.g., apartment, house with yard, indoor only), existing pets, household members, and any supplies you'll need from ISF (crates, food, formula, meds).
                                                                    </p>
                                                                    <textarea
                                                                        required
                                                                        rows={4}
                                                                        value={data.foster_needs}
                                                                        onChange={(e) => setData('foster_needs', e.target.value)}
                                                                        placeholder="e.g., We live in a 2-bedroom house with an enclosed yard. We have 1 friendly vaccinated dog. We will need an initial crate and cat carrier provided by ISF..."
                                                                        className="w-full p-5 bg-paw-bg border-2 border-transparent rounded-[24px] outline-none focus:border-purple-500 transition-all font-bold text-gray-800 text-sm"
                                                                    />
                                                                </div>

                                                                {!validateStep3() && (
                                                                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                                                                        <Info size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                                                                        <p className="text-xs font-bold text-yellow-800">
                                                                            Please complete all foster capacity, animal preference, and housing requirements to continue.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {data.role === 'Medic Volunteer' && (
                                                            <div className="space-y-6">
                                                                <div className="bg-rose-50 p-6 rounded-3xl border-2 border-rose-200">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <div className="w-10 h-10 bg-rose-600 text-white rounded-2xl flex items-center justify-center shrink-0">
                                                                            <StethoscopeIcon size={20} />
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="font-black text-rose-950 text-xl">Medical Qualifications & Certifications</h3>
                                                                            <p className="text-xs font-bold text-rose-700">Strict Requirement: Medic volunteers support critical animal healthcare, medication, and rescue triage.</p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Certifications - MANDATORY */}
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <label className="text-sm font-black text-gray-500 uppercase tracking-widest">
                                                                            Certifications & Professional Credentials *
                                                                        </label>
                                                                        <span className="text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full">
                                                                            Required to proceed
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs font-bold text-gray-400 mb-3">
                                                                        Please provide your veterinary or healthcare license, certification name, issuing body, or student enrollment status (e.g., Licensed DVM #, RVT, Vet Med Student 4th yr, Pet First Aid & CPR certified, Nurse).
                                                                    </p>
                                                                    <textarea
                                                                        required
                                                                        rows={3}
                                                                        value={data.medic_certifications}
                                                                        onChange={(e) => setData('medic_certifications', e.target.value)}
                                                                        placeholder="e.g., Licensed Doctor of Veterinary Medicine (PRC License #123456), Pet First Aid & CPR Certified (Red Cross, 2025)..."
                                                                        className={`w-full p-5 bg-paw-bg border-2 rounded-[24px] outline-none transition-all font-bold text-gray-800 text-sm ${
                                                                            data.medic_certifications.trim() === ''
                                                                                ? 'border-rose-200 focus:border-rose-500'
                                                                                : 'border-green-300 focus:border-green-500'
                                                                        }`}
                                                                    />
                                                                    {data.medic_certifications.trim() === '' && (
                                                                        <p className="text-xs font-black text-rose-600 mt-2 flex items-center gap-1.5">
                                                                            <Info size={14} className="shrink-0" />
                                                                            Certifications are strictly required. You cannot proceed without providing your credentials.
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Clinical Experience */}
                                                                <div>
                                                                    <label className="block text-sm font-black text-gray-500 mb-2 uppercase tracking-widest">
                                                                        Clinical & Animal Healthcare Experience (Optional)
                                                                    </label>
                                                                    <p className="text-xs font-bold text-gray-400 mb-2">
                                                                        Detail your past experience in clinics, surgery prep, stray animal treatment, emergency response, or medication administration.
                                                                    </p>
                                                                    <textarea
                                                                        rows={3}
                                                                        value={data.medic_experience}
                                                                        onChange={(e) => setData('medic_experience', e.target.value)}
                                                                        placeholder="e.g., 2 years assisting in veterinary clinic handling spay/neuter operations, wound debridement, IV fluid administration..."
                                                                        className="w-full p-5 bg-paw-bg border-2 border-transparent rounded-[24px] outline-none focus:border-rose-500 transition-all font-bold text-gray-800 text-sm"
                                                                    />
                                                                </div>

                                                                {!validateStep3() && (
                                                                    <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                                                                        <Info size={20} className="text-rose-600 shrink-0 mt-0.5" />
                                                                        <p className="text-xs font-bold text-rose-800">
                                                                            Please input your certifications or qualifications above to continue.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {/* Final Step: Motivation & Summary (Step 3 for 3-step roles, Step 4 for 4-step roles) */}
                                                {((currentStep === 3 && !hasRoleSpecificStep) || (currentStep === 4 && hasRoleSpecificStep)) && (
                                                    <motion.div
                                                        key="final-step-motivation"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="space-y-6"
                                                    >
                                                        <div>
                                                            <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Why do you want to join ISF? *</label>
                                                            <textarea required className="w-full p-6 bg-paw-bg border-2 border-transparent rounded-[24px] outline-none focus:border-paw-orange transition-all font-bold text-gray-800 min-h-[140px]" placeholder="Tell us about your passion for helping stray animals..." name="why" value={data.why} onChange={handleInputChange} />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Previous Experience (Optional)</label>
                                                            <textarea className="w-full p-6 bg-paw-bg border-2 border-transparent rounded-[24px] outline-none focus:border-paw-orange transition-all font-bold text-gray-800 min-h-[90px]" placeholder="Any general experience with animals or volunteer work?" name="experience" value={data.experience} onChange={handleInputChange} />
                                                        </div>

                                                        <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6 text-green-900">
                                                            <h4 className="font-black mb-3 flex items-center gap-2">
                                                                <CheckCircle2 size={20} />
                                                                Application Summary
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-bold">
                                                                <p><span className="opacity-70">Name:</span> {data.fullName || 'Not provided'}</p>
                                                                <p><span className="opacity-70">Role:</span> {data.role || 'Not selected'}</p>
                                                                <p><span className="opacity-70">Email:</span> {data.email || 'Not provided'}</p>
                                                                <p><span className="opacity-70">Mobile:</span> {data.mobile || 'Not provided'}</p>

                                                                {data.role === 'Foster Volunteer' && (
                                                                    <>
                                                                        <p><span className="opacity-70">Foster Capacity:</span> {data.foster_capacity} pet(s)</p>
                                                                        <p><span className="opacity-70">Preference:</span> {data.foster_preference === 'cats' ? 'Cats Only' : data.foster_preference === 'dogs' ? 'Dogs Only' : 'Both Cats & Dogs'}</p>
                                                                    </>
                                                                )}

                                                                {data.role === 'Medic Volunteer' && (
                                                                    <div className="md:col-span-2">
                                                                        <p><span className="opacity-70">Certifications:</span> {data.medic_certifications || 'None'}</p>
                                                                    </div>
                                                                )}

                                                                {data.role === 'Transport' && (
                                                                    <div className="md:col-span-2">
                                                                        <p><span className="opacity-70">Driver's License:</span> Declared and Confirmed ✓</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {data.why.trim() === '' && (
                                                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                                                                <Info size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                                                                <p className="text-xs font-bold text-yellow-800">
                                                                    Please tell us why you want to join ISF to complete your application.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="flex items-center justify-between gap-4 pt-6 border-t-2 border-gray-100">
                                                <button
                                                    type="button"
                                                    className={`px-8 py-4 rounded-[24px] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer ${currentStep === 1
                                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                                        }`}
                                                    onClick={prevStep}
                                                    disabled={currentStep === 1}
                                                >
                                                    <ChevronLeft size={24} />
                                                    BACK
                                                </button>
                                                <button
                                                    type={currentStep === totalSteps ? 'submit' : 'button'}
                                                    onClick={currentStep !== totalSteps ? nextStep : undefined}
                                                    disabled={processing || !canProceed()}
                                                    className={`px-8 py-4 rounded-[24px] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer ${
                                                        !canProceed() || processing
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'bg-paw-orange text-white hover:bg-orange-600'
                                                    }`}
                                                >
                                                    {currentStep === totalSteps ? (processing ? 'SUBMITTING...' : 'SUBMIT APPLICATION') : 'NEXT'}
                                                    {currentStep === totalSteps ? <Check size={24} /> : <ChevronRight size={24} />}
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* Information Cards Below Form - Matching ISF Volunteer Community UI */}
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-2xl"
                        >
                            <h2 className="text-4xl md:text-5xl font-black text-paw-navy mb-8 leading-tight">Join the ISF Volunteer Community</h2>
                            <p className="text-gray-500 font-bold text-lg leading-relaxed mb-10">
                                Our volunteers are the heartbeat of ISF. From feeding runs and rescue operations to foster care and community events — every act of service makes a difference.
                            </p>
                            <div className="flex flex-wrap gap-8">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-14 h-14 bg-paw-orange rounded-2xl flex items-center justify-center text-white shadow-xl shadow-paw-orange/30">
                                        <Users size={26} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-paw-navy leading-none mb-1.5">~15 Core Members</p>
                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">ORGANIZATIONAL CORE</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5">
                                    <div className="w-14 h-14 bg-paw-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-paw-blue/30">
                                        <Award size={26} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-paw-navy leading-none mb-1.5">300-500 estimated</p>
                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">VOLUNTEERS SINCE FOUNDING</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                                {VOLUNTEER_ROLES.map((role, i) => (
                                    <motion.div
                                        key={role.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="bg-white p-6 rounded-[32px] shadow-xl shadow-paw-navy/5 border-2 border-gray-100/80 hover:border-paw-orange/30 transition-all group"
                                    >
                                        <div className={`w-12 h-12 ${role.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-md shadow-black/5 group-hover:scale-110 transition-transform`}>
                                            {role.icon}
                                        </div>
                                        <h3 className="text-lg font-black text-paw-navy mb-1.5 leading-tight">{role.title}</h3>
                                        <p className="text-gray-400 font-bold text-xs leading-relaxed">{role.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-paw-orange/5 rounded-full blur-[100px] pointer-events-none" />
                        </div>
                    </div>
                </div>
            </main>

            <SubmissionReceipt
                isOpen={submitted}
                onClose={() => {
                    setSubmitted(false);
                    setCurrentStep(1);
                    reset();
                }}
                title="Volunteer Application Submitted!"
                subtitle="Welcome to the Iligan Stray Feeders family"
                referenceNumber={application?.reference_number || 'VOL-PENDING'}
                items={[
                    { label: 'Full Name', value: data.fullName, icon: <User size={20} /> },
                    { label: 'Mobile Number', value: data.mobile, icon: <Phone size={20} /> },
                    { label: 'Email Address', value: data.email, icon: <Mail size={20} /> },
                    { label: 'Address', value: data.address, icon: <Home size={20} /> },
                    { label: 'Preferred Role', value: data.role, icon: <HandHeart size={20} /> },
                    ...(data.role === 'Foster Volunteer' ? [
                        { label: 'Foster Capacity', value: `${data.foster_capacity} pet(s)`, icon: <Home size={20} /> },
                        { label: 'Animal Preference', value: data.foster_preference === 'cats' ? 'Cats only' : data.foster_preference === 'dogs' ? 'Dogs only' : 'Both cats & dogs', icon: <Heart size={20} /> },
                        { label: 'Housing & Needs', value: data.foster_needs, icon: <Info size={20} /> },
                    ] : []),
                    ...(data.role === 'Medic Volunteer' ? [
                        { label: 'Certifications', value: data.medic_certifications, icon: <Award size={20} /> },
                        ...(data.medic_experience ? [{ label: 'Clinical Experience', value: data.medic_experience, icon: <ShieldCheck size={20} /> }] : []),
                    ] : []),
                    ...(data.role === 'Transport' ? [
                        { label: 'Driver\'s License & Reg', value: 'Declared & Confirmed', icon: <MapPin size={20} /> },
                    ] : []),
                    ...(selectedEventFromState ? [{
                        label: selectedEventFromState.type === 'feeding' ? 'Feeding Zone' : 'Event',
                        value: selectedEventFromState.type === 'feeding' ? selectedEventFromState.zone : selectedEventFromState.title,
                        icon: selectedEventFromState.type === 'feeding' ? <Utensils size={20} /> : <Calendar size={20} />
                    }, {
                        label: selectedEventFromState.type === 'feeding' ? 'Schedule' : 'Date',
                        value: selectedEventFromState.type === 'feeding' ? selectedEventFromState.day : selectedEventFromState.date,
                        icon: <Calendar size={20} />
                    }, {
                        label: 'Time',
                        value: selectedEventFromState.time,
                        icon: <Clock size={20} />
                    }] : []),
                    { label: 'Motivation', value: data.why, icon: <Heart size={20} /> }
                ]}
                type="success"
                footerMessage="Our volunteer coordinator will contact you within 24 hours via SMS or email. You'll receive an invitation to attend a mandatory 1-hour orientation session before starting your volunteer journey with ISF."
            />

            {/* Unsaved Changes Confirmation Modal */}
            <AnimatePresence>
                {showLeaveModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        {/* Blurred Background Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
                            onClick={handleContinueEditing}
                        />

                        {/* Modal Dialog Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative z-10 bg-white rounded-[36px] p-8 md:p-10 shadow-2xl max-w-md w-full text-center border border-gray-100"
                        >
                            <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-sm">
                                <WarningTriangleIcon size={32} className="text-amber-500" />
                            </div>

                            <h3 className="text-2xl md:text-3xl font-black text-paw-navy mb-3">
                                Leave this page?
                            </h3>

                            <p className="text-sm md:text-base font-bold text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
                                You have unsaved information. If you leave now, your current changes may be lost.
                            </p>

                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={handleContinueEditing}
                                    className="w-full py-4 bg-paw-orange hover:bg-orange-600 text-white font-black text-base rounded-2xl shadow-lg shadow-paw-orange/20 transition-all cursor-pointer"
                                >
                                    Continue Editing
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLeaveAnyway}
                                    className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-paw-navy font-black text-base rounded-2xl transition-all cursor-pointer"
                                >
                                    Leave Anyway
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
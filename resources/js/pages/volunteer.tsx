import { usePage, useForm, router, Link } from '@inertiajs/react';
import { Heart, Users, MapPin, Check, Plus, ShieldCheck, Zap, HandHeart, Trophy, Award, ChevronRight, ChevronLeft, Info, CheckCircle2, Calendar, Clock, Utensils, User, Mail, Phone, Home, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { SubmissionReceipt } from '@/components/submission-receipt';

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

const VOLUNTEER_ROLES = [
    { id: 1, title: 'Food Carrier', desc: 'Carry and distribute food along feeding routes.', icon: <Zap size={24} />, color: 'bg-orange-500', points: '100 pts/hr' },
    { id: 2, title: 'Recorder', desc: 'Document the health and location of stray pets.', icon: <Plus size={24} />, color: 'bg-blue-500', points: '120 pts/hr' },
    { id: 3, title: 'Transport Coordinator', desc: 'Coordinate vehicles for rescue operations.', icon: <MapPin size={24} />, color: 'bg-green-500', points: '150 pts/hr' },
    { id: 4, title: 'Feeding Lead', desc: 'Lead a team of 3-5 people in a feeding zone.', icon: <Users size={24} />, color: 'bg-purple-500', points: '200 pts/hr' },
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

    const { data, setData, post, processing, errors, reset } = useForm({
        fullName: '',
        mobile: '',
        email: '',
        address: '',
        role: '',
        experience: '',
        why: ''
    });

    const totalSteps = 3;

    const validateStep1 = () => {
        return data.fullName.trim() !== '' &&
            data.mobile.trim() !== '' &&
            data.email.trim() !== '' &&
            data.address.trim() !== '' &&
            data.role !== '';
    };

    const validateStep2 = () => {
        return allTermsAccepted;
    };

    const validateStep3 = () => {
        return data.why.trim() !== '';
    };

    const nextStep = () => {
        if (currentStep === 1 && !validateStep1()) {
            return;
        }

        if (currentStep === 2 && !validateStep2()) {
            return;
        }

        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (currentStep === totalSteps && validateStep3()) {
            post('/volunteer/apply', {
                onSuccess: () => {
                    setSubmitted(true);
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
                setData(prev => ({ ...prev, role: 'Food Carrier' }));
            } else if (selectedEventFromState.type === 'event') {
                if (selectedEventFromState.category === 'Medical') {
                    setData(prev => ({ ...prev, role: 'Recorder' }));
                } else if (selectedEventFromState.category === 'Feeding') {
                    setData(prev => ({ ...prev, role: 'Food Carrier' }));
                }
            }
        }
    }, [selectedEventFromState]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(name as any, value);
    };

    return (
        <div className="min-h-screen bg-paw-bg font-quicksand">
            <Header />

            <main className="py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-24">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 bg-paw-orange/10 text-paw-orange px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border-2 border-paw-orange/20">
                                <HandHeart size={14} />
                                Join the Movement
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-paw-navy mb-6 leading-tight">Help Us Feed the Pack</h1>
                            <p className="text-gray-500 font-bold text-lg leading-relaxed max-w-3xl mx-auto">
                                The organization continues to operate through dedicated volunteers and supporters who sustain its mission and expand its impact.
                            </p>
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
                                            <div className="flex items-center gap-3 mb-8">
                                                {[1, 2, 3].map((step) => (
                                                    <div key={step} className="flex items-center flex-1">
                                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-black transition-all ${currentStep >= step ? 'bg-paw-orange text-white' : 'bg-gray-200 text-gray-400'
                                                            }`}>
                                                            {step}
                                                        </div>
                                                        {step < 3 && (
                                                            <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${currentStep > step ? 'bg-paw-orange' : 'bg-gray-200'
                                                                }`} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="text-sm font-black text-paw-orange uppercase tracking-widest">
                                                {currentStep === 1 && 'Step 1: Basic Information'}
                                                {currentStep === 2 && 'Step 2: Terms & Requirements'}
                                                {currentStep === 3 && 'Step 3: Motivation & Submit'}
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
                                                                <input required type="tel" className="w-full p-6 bg-paw-bg border-2 border-transparent rounded-[24px] outline-none focus:border-paw-orange transition-all font-bold text-gray-800" placeholder="09XX XXX XXXX" name="mobile" value={data.mobile} onChange={handleInputChange} />
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
                                                                Preferred Role * {data.role && <span className="text-paw-orange">({data.role} selected)</span>}
                                                            </label>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {VOLUNTEER_ROLES.map((r) => (
                                                                    <button
                                                                        key={r.id}
                                                                        type="button"
                                                                        className={`p-6 rounded-2xl border-2 font-bold text-left transition-all ${data.role === r.title
                                                                                ? 'border-paw-orange bg-paw-orange/10 text-paw-orange'
                                                                                : 'border-gray-200 hover:border-paw-orange/50 text-gray-600'
                                                                            }`}
                                                                        onClick={() => setData('role', r.title)}
                                                                    >
                                                                        <div className="flex items-start gap-3">
                                                                            <div className={`w-12 h-12 ${r.color} rounded-xl flex items-center justify-center text-white shrink-0`}>
                                                                                {r.icon}
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="font-black mb-1">{r.title}</h4>
                                                                                <p className="text-xs opacity-70">{r.desc}</p>
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                ))}
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

                                                        {!allTermsAccepted && (
                                                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                                                                <Info size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                                                                <p className="text-xs font-bold text-yellow-800">
                                                                    Please accept all requirements above to proceed to the next step.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {/* Step 3: Motivation */}
                                                {currentStep === 3 && (
                                                    <motion.div
                                                        key="step3"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="space-y-6"
                                                    >
                                                        <div>
                                                            <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Why do you want to join ISF? *</label>
                                                            <textarea required className="w-full p-6 bg-paw-bg border-2 border-transparent rounded-[24px] outline-none focus:border-paw-orange transition-all font-bold text-gray-800 min-h-[150px]" placeholder="Tell us about your passion for helping stray animals..." name="why" value={data.why} onChange={handleInputChange} />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Previous Experience (Optional)</label>
                                                            <textarea className="w-full p-6 bg-paw-bg border-2 border-transparent rounded-[24px] outline-none focus:border-paw-orange transition-all font-bold text-gray-800 min-h-[100px]" placeholder="Any experience with animals or volunteer work?" name="experience" value={data.experience} onChange={handleInputChange} />
                                                        </div>

                                                        <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6 text-green-800">
                                                            <h4 className="font-black mb-3 flex items-center gap-2">
                                                                <CheckCircle2 size={20} />
                                                                Application Summary
                                                            </h4>
                                                            <div className="space-y-2 text-sm font-bold">
                                                                <p><span className="opacity-70">Name:</span> {data.fullName || 'Not provided'}</p>
                                                                <p><span className="opacity-70">Role:</span> {data.role || 'Not selected'}</p>
                                                                <p><span className="opacity-70">Email:</span> {data.email || 'Not provided'}</p>
                                                                <p><span className="opacity-70">Mobile:</span> {data.mobile || 'Not provided'}</p>
                                                            </div>
                                                        </div>

                                                        {!validateStep3() && (
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
                                                    className={`px-8 py-4 rounded-[24px] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${currentStep === 1
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
                                                    disabled={
                                                        processing ||
                                                        (currentStep === 1 && !validateStep1()) ||
                                                        (currentStep === 2 && !validateStep2()) ||
                                                        (currentStep === 3 && !validateStep3())
                                                    }
                                                    className={`px-8 py-4 rounded-[24px] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${(currentStep === 1 && !validateStep1()) ||
                                                            (currentStep === 2 && !validateStep2()) ||
                                                            (currentStep === 3 && !validateStep3())
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

                    {/* Information Cards Below Form */}
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-2xl"
                        >
                            <h2 className="text-4xl md:text-5xl font-black text-paw-navy mb-8 leading-tight">Join 500+ Amazing Volunteers</h2>
                            <p className="text-gray-500 font-bold text-lg leading-relaxed mb-10">
                                Our volunteers are the heartbeat of ISF. Together, we've logged thousands of hours feeding, rescuing, and caring for Iligan's stray animals.
                            </p>
                            <div className="flex flex-wrap gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-paw-orange rounded-2xl flex items-center justify-center text-white shadow-xl shadow-paw-orange/30"><Trophy size={24} /></div>
                                    <div>
                                        <p className="text-xl font-black text-paw-navy leading-none mb-1">2,400+</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Hours Logged</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-paw-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-paw-blue/30"><Award size={24} /></div>
                                    <div>
                                        <p className="text-xl font-black text-paw-navy leading-none mb-1">500+</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Active Volunteers</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="relative">
                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                {VOLUNTEER_ROLES.map((role, i) => (
                                    <motion.div
                                        key={role.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white p-8 rounded-[40px] shadow-2xl shadow-paw-navy/5 border-2 border-transparent hover:border-paw-orange/20 transition-all group"
                                    >
                                        <div className={`w-14 h-14 ${role.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-black/5 group-hover:scale-110 transition-transform`}>
                                            {role.icon}
                                        </div>
                                        <h3 className="text-xl font-black text-paw-navy mb-2 leading-tight">{role.title}</h3>
                                        <p className="text-gray-400 font-bold text-xs mb-4 leading-relaxed">{role.desc}</p>
                                        <div className="text-xs font-black text-paw-orange uppercase tracking-widest">{role.points}</div>
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

            <Footer />
        </div>
    );
}
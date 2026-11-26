import { Head, Link } from '@inertiajs/react';
import {
    Stethoscope, ShieldAlert, Phone, MapPin,
    FileText, ArrowRight, Heart, Sparkles,
    Siren, Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ScrollRevealWrapper } from '@/components/scroll-reveal-wrapper';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { PartnerClinicCard } from '@/components/vet/partner-clinic-card';
import type { PartnerClinicItem } from '@/components/vet/partner-clinic-card';
import { PartnerClinicModal } from '@/components/vet/partner-clinic-modal';
import { PetCareResourceCard } from '@/components/vet/pet-care-resource-card';
import { PetCareResourceModal } from '@/components/vet/pet-care-resource-modal';
import type { PetResourceItem } from '@/components/vet/pet-care-resource-theme';

interface VetPageProps {
    featuredClinic?: PartnerClinicItem;
    veterinaryClinics: PartnerClinicItem[];
    emergencyClinics: PartnerClinicItem[];
    petResources: PetResourceItem[];
    vetOnRecord: {
        name: string;
        title: string;
        description: string;
        clinic_hours: string;
        contact: string;
        address: string;
        image: string;
    };
    stats: {
        trusted_clinics: number;
        vet_on_record: number;
        emergency_contacts: number;
        care_resources: number;
    };
}

export default function VetPage({
    featuredClinic,
    veterinaryClinics = [],
    petResources = [],
    vetOnRecord,
    stats
}: VetPageProps) {
    const [selectedClinic, setSelectedClinic] = useState<PartnerClinicItem | null>(null);
    const [selectedResource, setSelectedResource] = useState<PetResourceItem | null>(null);
    const allClinics = [featuredClinic, ...veterinaryClinics].filter(
        (clinic): clinic is PartnerClinicItem => Boolean(clinic),
    );
    const useFeaturedPlusThreeLayout = allClinics.length >= 4;
    const gridClinics = useFeaturedPlusThreeLayout ? allClinics.slice(1) : allClinics;

    const scrollToResources = () => {
        const el = document.getElementById('pet-care-resources');

        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToPartners = () => {
        const el = document.getElementById('clinic-directory');

        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 font-quicksand text-slate-800 dark:text-slate-100 antialiased selection:bg-paw-orange selection:text-white">
            <Head title="Veterinary Care & Partner Clinics | Iligan Stray Feeders" />
            <Header />

            <main>
                {/* 1. Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-b from-[#0F1E28] via-[#122834] to-[#0A161E] text-white pt-16 pb-24 md:py-24">
                    {/* Background Graphic Accents */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <div className="absolute top-1/2 right-12 w-96 h-96 border-[40px] border-emerald-400 rounded-full" />
                        <div className="absolute top-10 left-10 w-72 h-72 border-[20px] border-white rounded-full" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-12 gap-12 items-center">
                            {/* Left Text */}
                            <div className="lg:col-span-7 space-y-6">
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider"
                                >
                                    <Stethoscope size={14} className="text-emerald-400" />
                                    <span>Veterinary Care & Resources</span>
                                </motion.div>

                                <motion.h1 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]"
                                >
                                    Caring for <br />
                                    <span className="text-[#FFAE33] drop-shadow-sm">Every Rescued Animal</span>
                                </motion.h1>

                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-base sm:text-lg text-slate-300 max-w-xl font-medium leading-relaxed"
                                >
                                    Connecting animals rescued by <strong className="text-white font-bold">Iligan Stray Feeders</strong> with trusted veterinary clinics, on-call doctors, and pet care resources in Iligan City.
                                </motion.p>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4 pt-2"
                                >
                                    <button 
                                        onClick={scrollToResources}
                                        className="w-full sm:w-auto px-3.5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap group cursor-pointer"
                                    >
                                        <FileText size={15} className="shrink-0" />
                                        <span>View Vet Resources</span>
                                    </button>

                                    <button 
                                        onClick={scrollToPartners}
                                        className="w-full sm:w-auto px-3.5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer"
                                    >
                                        <span>All ISF Partners</span>
                                        <ArrowRight size={14} className="text-[#FFAE33] shrink-0" />
                                    </button>
                                </motion.div>
                            </div>

                            {/* Right 2x2 Stats Cards */}
                            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-xl"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                                        <Stethoscope size={20} />
                                    </div>
                                    <div>
                                        <span className="text-3xl sm:text-4xl font-black text-white">{stats.trusted_clinics}</span>
                                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-300 mt-1">Trusted Clinics</p>
                                        <p className="text-[10px] text-slate-400">ISF Contacts</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-[#FFAE33]/40 transition-all shadow-xl"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-[#FFAE33] flex items-center justify-center mb-4">
                                        <ShieldAlert size={20} />
                                    </div>
                                    <div>
                                        <span className="text-3xl sm:text-4xl font-black text-white">{stats.vet_on_record}</span>
                                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-300 mt-1">Vet on Record</p>
                                        <p className="text-[10px] text-slate-400">Licensed</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-rose-500/40 transition-all shadow-xl"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <span className="text-xl sm:text-2xl font-black text-white truncate block">Dr. E</span>
                                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-300 mt-1">Emergency</p>
                                        <p className="text-[10px] text-slate-400">Tambo, Iligan</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-xl"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                                        <Heart size={20} />
                                    </div>
                                    <div>
                                        <span className="text-3xl sm:text-4xl font-black text-white">{stats.care_resources}+</span>
                                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-300 mt-1">Care Resources</p>
                                        <p className="text-[10px] text-slate-400">Community listings</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Partner Clinic Directory Section */}
                <section id="clinic-directory" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollRevealWrapper>
                        <div className="mb-10 text-center sm:text-left">
                            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
                                Partner Clinic Directory
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-paw-navy dark:text-white">
                                Trusted Clinics & Resources
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                                The following veterinary resources are used or contacted by ISF for rescued animal care, emergency situations, and ongoing treatment.
                            </p>
                        </div>
                    </ScrollRevealWrapper>

                    {/* Featured Clinic Banner (only when 4+ clinics exist) */}
                    {useFeaturedPlusThreeLayout && allClinics[0] && (
                        <ScrollRevealWrapper>
                            <div className="mb-8">
                                <PartnerClinicCard
                                    clinic={allClinics[0]}
                                    variant="featured"
                                    onSelect={setSelectedClinic}
                                />
                            </div>
                        </ScrollRevealWrapper>
                    )}

                    {/* Equal-Sized 3-Column Clinic Cards Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gridClinics.map((clinic, idx) => (
                            <ScrollRevealWrapper key={clinic.id} delay={idx * 0.08}>
                                <PartnerClinicCard
                                    clinic={clinic}
                                    variant="grid"
                                    onSelect={setSelectedClinic}
                                />
                            </ScrollRevealWrapper>
                        ))}
                    </div>
                </section>

                {/* 3. Pet Care Resources Section */}
                <section id="pet-care-resources" className="py-20 bg-emerald-50/40 dark:bg-slate-900/40 border-y border-emerald-100/60 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ScrollRevealWrapper>
                            <div className="mb-12">
                                <span className="inline-block px-3 py-1 rounded-full bg-[#FFAE33]/20 text-amber-800 dark:text-[#FFAE33] text-xs font-black uppercase tracking-wider mb-2">
                                    Community Directory
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-black text-paw-navy dark:text-white">
                                    Pet Care Resources
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 max-w-2xl font-medium">
                                    Community resources and services mentioned or referenced by ISF. Listings marked <span className="font-bold text-emerald-700 dark:text-emerald-400">&apos;Community Resource&apos;</span> are independent community recommendations.
                                </p>
                            </div>
                        </ScrollRevealWrapper>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {petResources.map((res, idx) => (
                                <ScrollRevealWrapper key={res.id} delay={idx * 0.06}>
                                    <PetCareResourceCard
                                        resource={res}
                                        onSelect={setSelectedResource}
                                    />
                                </ScrollRevealWrapper>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. Emergency Veterinary Support (Dark Section) */}
                <section className="py-16 bg-[#0E1B24] text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ScrollRevealWrapper>
                            <div className="mb-10 text-center sm:text-left">
                                <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-black uppercase tracking-wider mb-2">
                                    Urgent Care Triage
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-black text-white">
                                    Emergency Veterinary Support
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                                    Key primary contacts for urgent animal care and rescue situations in Iligan City
                                </p>
                            </div>
                        </ScrollRevealWrapper>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Emergency Contact 1: Dr. E */}
                            <div className="bg-slate-800/80 border-2 border-red-500/40 rounded-3xl p-6 relative flex flex-col justify-between">
                                <div>
                                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                                        Primary Emergency Contact
                                    </span>
                                    <h4 className="text-xl font-black text-white mt-3">Dr. E</h4>
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                        <MapPin size={12} className="text-[#FFAE33]" />
                                        <span>Tambo, Iligan City</span>
                                    </p>
                                    <p className="text-xs text-slate-300 mt-3">
                                        Frequently contacted by ISF for emergency veterinary rescue and trauma stabilization.
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-400">+63 956 381 9018</span>
                                    <a 
                                        href="tel:+639563819018"
                                        className="px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                                    >
                                        <Phone size={12} />
                                        <span>Call</span>
                                    </a>
                                </div>
                            </div>

                            {/* Emergency Contact 2: Petmate */}
                            <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 flex flex-col justify-between">
                                <div>
                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-wider">
                                        Alternative Emergency Support
                                    </span>
                                    <h4 className="text-xl font-black text-white mt-3">Petmate</h4>
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                        <MapPin size={12} className="text-[#FFAE33]" />
                                        <span>Camague / Tominobo</span>
                                    </p>
                                    <p className="text-xs text-slate-300 mt-3">
                                        Provides severe trauma backup and urgent after-clinic care for rescued pets.
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-300">+63 935 380 1820</span>
                                    <a 
                                        href="tel:+639353801820"
                                        className="px-3 py-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors flex items-center gap-1"
                                    >
                                        <Phone size={12} />
                                        <span>Call</span>
                                    </a>
                                </div>
                            </div>

                            {/* Emergency Contact 3: Furpet / Lugod Branch */}
                            <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 flex flex-col justify-between">
                                <div>
                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-wider">
                                        Additional Emergency
                                    </span>
                                    <h4 className="text-xl font-black text-white mt-3">Furpet / Lugod Branch</h4>
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                        <MapPin size={12} className="text-[#FFAE33]" />
                                        <span>Bagong Silang / Tibanga</span>
                                    </p>
                                    <p className="text-xs text-slate-300 mt-3">
                                        Secondary resource referred to by ISF for emergency triage, confinement, and urgent medical needs.
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-300">+63 917 105 0446</span>
                                    <a 
                                        href="tel:+639171050446"
                                        className="px-3 py-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors flex items-center gap-1"
                                    >
                                        <Phone size={12} />
                                        <span>Call</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-[11px] text-slate-400 mt-8 font-medium">
                            ISF staff use best judgment for each rescue. Contact ISF directly for emergency rescue coordination and shelter intake.
                        </p>
                    </div>
                </section>

                {/* 5. How ISF Works with Veterinary Partners + Vet on Record */}
                <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl space-y-4 mb-8">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                            How It Works
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-paw-navy dark:text-white">
                            How ISF Works with Veterinary Partners
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            When a rescued animal requires veterinary care, we coordinate with our trusted partner clinics to ensure the animal receives immediate and proper medical treatment.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                        {/* Steps */}
                        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
                                <div className="w-9 h-9 rounded-full bg-[#FFAE33]/20 text-[#FFAE33] flex items-center justify-center font-black text-sm shrink-0">
                                    1
                                </div>
                                <div>
                                    <h5 className="font-bold text-sm text-paw-navy dark:text-white">Rescued animal identified and assessed</h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Volunteers or community reports triage injury, severity, and urgency via AI Rescue or SOS.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
                                <div className="w-9 h-9 rounded-full bg-[#FFAE33]/20 text-[#FFAE33] flex items-center justify-center font-black text-sm shrink-0">
                                    2
                                </div>
                                <div>
                                    <h5 className="font-bold text-sm text-paw-navy dark:text-white">Referred to a trusted partner clinic</h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Animal is transported directly to Dr. E, Petmate, or nearest available partner for diagnostics.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
                                <div className="w-9 h-9 rounded-full bg-[#FFAE33]/20 text-[#FFAE33] flex items-center justify-center font-black text-sm shrink-0">
                                    3
                                </div>
                                <div>
                                    <h5 className="font-bold text-sm text-paw-navy dark:text-white">Treatment coordinated and recorded</h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">All medical records, vaccinations, and recovery updates are digitized into the PAWLSE master record.</p>
                                </div>
                            </div>
                        </div>

                        {/* Veterinarian on Record Card */}
                        <div className="lg:col-span-5 flex">
                            <div className="w-full h-full p-7 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-2 border-emerald-400/40 shadow-xl flex flex-col justify-between">
                                <div>
                                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider mb-4">
                                        Veterinarian on Record
                                    </span>

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-400 shrink-0 shadow-md">
                                            <ImageWithFallback
                                                src={vetOnRecord.image || '/images/partners/vet-record.jpg'}
                                                alt={vetOnRecord.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-paw-navy dark:text-white">{vetOnRecord.name}</h4>
                                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{vetOnRecord.title}</p>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-5 font-medium">
                                        {vetOnRecord.description}
                                    </p>
                                </div>

                                <div className="space-y-2 text-xs border-t border-emerald-100 dark:border-slate-800 pt-4 text-gray-600 dark:text-gray-400">
                                    <div className="flex justify-between gap-4">
                                        <span className="font-bold text-gray-400 shrink-0">Clinic Hours:</span>
                                        <span className="text-right">{vetOnRecord.clinic_hours}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="font-bold text-gray-400 shrink-0">Contact:</span>
                                        <span className="text-right">{vetOnRecord.contact}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="font-bold text-gray-400 shrink-0">Address:</span>
                                        <span className="text-right">{vetOnRecord.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. Found an Animal That Needs Help? (CTA) */}
                <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-gradient-to-r from-[#172530] to-[#0D161D] text-white p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
                        <div className="max-w-2xl mx-auto space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-[#FFAE33] flex items-center justify-center mx-auto mb-2">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white">
                                Found an Animal That Needs Help?
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium">
                                Report a rescue or SOS case and ISF will coordinate the appropriate veterinary assistance with our partner clinics.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                                <Link 
                                    href="/sos"
                                    className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all"
                                >
                                    <Siren size={14} className="animate-bounce" />
                                    <span>SOS Report</span>
                                </Link>
                                <Link 
                                    href="/rescue"
                                    className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                                >
                                    <span>AI Rescue Report</span>
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modal for Clinic Details */}
            <PartnerClinicModal
                clinic={selectedClinic}
                onClose={() => setSelectedClinic(null)}
            />

            {/* Modal for Resource Details */}
            <PetCareResourceModal
                resource={selectedResource}
                onClose={() => setSelectedResource(null)}
            />

            <Footer />
        </div>
    );
}

import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Stethoscope, ShieldAlert, Phone, Clock, MapPin, ExternalLink, 
    Download, FileText, ArrowRight, Heart, Sparkles, AlertCircle, 
    ChevronRight, CheckCircle2, Siren, Share2, X, Info, Activity
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ScrollRevealWrapper } from '@/components/scroll-reveal-wrapper';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

interface PartnerClinic {
    id: number;
    name: string;
    slug: string;
    category: string;
    badge_title?: string;
    badges?: string[];
    short_description?: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    website_url?: string;
    operating_hours?: string;
    services?: string[];
    image_url?: string;
    is_emergency: boolean;
    is_featured: boolean;
}

interface PetResource {
    id: number;
    title: string;
    slug: string;
    category: string;
    badge?: string;
    description?: string;
    content?: string;
    file_name?: string;
    file_size?: string;
    file_type?: string;
    image_url?: string;
    download_count: number;
}

interface VetPageProps {
    featuredClinic?: PartnerClinic;
    veterinaryClinics: PartnerClinic[];
    emergencyClinics: PartnerClinic[];
    petResources: PetResource[];
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
    emergencyClinics = [],
    petResources = [],
    vetOnRecord,
    stats
}: VetPageProps) {
    const [selectedClinic, setSelectedClinic] = useState<PartnerClinic | null>(null);
    const [selectedResource, setSelectedResource] = useState<PetResource | null>(null);

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
                                    className="flex flex-wrap items-center gap-4 pt-2"
                                >
                                    <button 
                                        onClick={scrollToResources}
                                        className="px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 group cursor-pointer"
                                    >
                                        <FileText size={16} />
                                        <span>View Vet Resources</span>
                                    </button>

                                    <button 
                                        onClick={scrollToPartners}
                                        className="px-6 py-3.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        <span>All ISF Partners</span>
                                        <ArrowRight size={15} className="text-[#FFAE33]" />
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

                    {/* Featured Clinic (Dr. E Banner) */}
                    {featuredClinic && (
                        <ScrollRevealWrapper>
                            <div className="mb-8 rounded-3xl overflow-hidden border border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all">
                                <div className="grid md:grid-cols-12">
                                    <div className="md:col-span-7 relative min-h-[260px] md:min-h-[340px]">
                                        <ImageWithFallback 
                                            src={featuredClinic.image_url || '/images/partners/dr-e.jpg'} 
                                            alt={featuredClinic.name} 
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                                        
                                        {/* Floating badges on image */}
                                        <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end">
                                            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                                                <AlertCircle size={12} />
                                                Emergency Response
                                            </span>
                                            <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                                                Frequently Contacted by ISF
                                            </span>
                                        </div>

                                        <div className="absolute bottom-4 left-4 text-white/90 text-xs font-bold flex items-center gap-1.5 drop-shadow">
                                            <MapPin size={14} className="text-[#FFAE33]" />
                                            <span>{featuredClinic.city || 'Tambo, Iligan City'}</span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-2xl sm:text-3xl font-black text-paw-navy dark:text-white">
                                                    {featuredClinic.name}
                                                </h3>
                                                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-1">
                                                    Frequently Contacted by ISF
                                                </p>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                                {featuredClinic.short_description || featuredClinic.description}
                                            </p>

                                            <div className="space-y-2 pt-2 text-xs text-gray-500 dark:text-gray-400">
                                                {featuredClinic.address && (
                                                    <div className="flex items-start gap-2">
                                                        <MapPin size={14} className="text-paw-orange shrink-0 mt-0.5" />
                                                        <span>{featuredClinic.address}</span>
                                                    </div>
                                                )}
                                                {featuredClinic.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone size={14} className="text-emerald-500 shrink-0" />
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">{featuredClinic.phone}</span>
                                                    </div>
                                                )}
                                                {featuredClinic.operating_hours && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className="text-amber-500 shrink-0" />
                                                        <span>{featuredClinic.operating_hours}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                            <button
                                                onClick={() => setSelectedClinic(featuredClinic)}
                                                className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group cursor-pointer uppercase tracking-wider"
                                            >
                                                <span>View Details</span>
                                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </button>

                                            {featuredClinic.phone && (
                                                <a 
                                                    href={`tel:${featuredClinic.phone.replace(/[^0-9+]/g, '')}`} 
                                                    className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                                                >
                                                    <Phone size={13} />
                                                    <span>Call Clinic</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollRevealWrapper>
                    )}

                    {/* Clinic Cards Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {veterinaryClinics.map((clinic, idx) => (
                            <ScrollRevealWrapper key={clinic.id} delay={idx * 0.1}>
                                <div className="h-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg shadow-slate-100 dark:shadow-none flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all">
                                    <div>
                                        {/* Card Image */}
                                        <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <ImageWithFallback 
                                                src={clinic.image_url || '/images/partners/petmate.jpg'} 
                                                alt={clinic.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {clinic.is_emergency && (
                                                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                                                    Emergency
                                                </span>
                                            )}
                                            <div className="absolute bottom-2 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                <MapPin size={11} className="text-[#FFAE33]" />
                                                <span>{clinic.city || 'Iligan City'}</span>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6">
                                            {clinic.badge_title && (
                                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider mb-2">
                                                    {clinic.badge_title}
                                                </span>
                                            )}
                                            <h4 className="text-xl font-black text-paw-navy dark:text-white">
                                                {clinic.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                                                {clinic.short_description || clinic.description}
                                            </p>

                                            {clinic.operating_hours && (
                                                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1">
                                                    <Clock size={12} className="text-amber-500 shrink-0" />
                                                    <span className="truncate">{clinic.operating_hours}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="p-6 pt-0 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
                                        <button
                                            onClick={() => setSelectedClinic(clinic)}
                                            className="text-xs font-black text-paw-orange hover:text-orange-600 flex items-center gap-1 group cursor-pointer uppercase tracking-wider"
                                        >
                                            <span>View Details</span>
                                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>

                                        {clinic.phone && (
                                            <a 
                                                href={`tel:${clinic.phone.replace(/[^0-9+]/g, '')}`} 
                                                className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
                                                title={`Call ${clinic.name}`}
                                            >
                                                <Phone size={14} />
                                            </a>
                                        )}
                                    </div>
                                </div>
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
                                <ScrollRevealWrapper key={res.id} delay={idx * 0.08}>
                                    <div className="h-full bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                <ImageWithFallback 
                                                    src={res.image_url || '/images/resources/cat-boarding.jpg'} 
                                                    alt={res.title} 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-3 left-3">
                                                    <span className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider text-paw-navy dark:text-white shadow-xs">
                                                        {res.badge || 'Community Resource'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <h4 className="text-lg font-black text-paw-navy dark:text-white">
                                                    {res.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                                                    {res.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-6 pt-0 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
                                            <button
                                                onClick={() => setSelectedResource(res)}
                                                className="text-xs font-black text-paw-orange hover:text-orange-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                                            >
                                                <span>View Details</span>
                                                <ChevronRight size={14} />
                                            </button>

                                            <a 
                                                href={`/resources/${res.id}/download`} 
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-paw-orange transition-colors"
                                                title="Download Resource Guide"
                                            >
                                                <Download size={13} />
                                                <span>{res.file_size || 'Download'}</span>
                                            </a>
                                        </div>
                                    </div>
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
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        {/* Steps */}
                        <div className="lg:col-span-7 space-y-6">
                            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                                How It Works
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-paw-navy dark:text-white">
                                How ISF Works with Veterinary Partners
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                When a rescued animal requires veterinary care, we coordinate with our trusted partner clinics to ensure the animal receives immediate and proper medical treatment.
                            </p>

                            <div className="space-y-4 pt-2">
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
                        </div>

                        {/* Veterinarian on Record Card */}
                        <div className="lg:col-span-5">
                            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-2 border-emerald-400/40 shadow-xl">
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

                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-medium">
                                    {vetOnRecord.description}
                                </p>

                                <div className="space-y-2 text-xs border-t border-emerald-100 dark:border-slate-800 pt-4 text-gray-600 dark:text-gray-400">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-400">Clinic Hours:</span>
                                        <span>{vetOnRecord.clinic_hours}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-400">Contact:</span>
                                        <span>{vetOnRecord.contact}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-400">Address:</span>
                                        <span>{vetOnRecord.address}</span>
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
            <AnimatePresence>
                {selectedClinic && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedClinic(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[36px] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Clinic Image Banner in Modal */}
                            <div className="relative h-48 sm:h-56 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 overflow-hidden rounded-t-[28px] sm:rounded-t-[36px] bg-slate-100 dark:bg-slate-800">
                                <ImageWithFallback 
                                    src={selectedClinic.image_url || '/images/partners/dr-e.jpg'} 
                                    alt={selectedClinic.name} 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <button 
                                    onClick={() => setSelectedClinic(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer"
                                    aria-label="Close modal"
                                >
                                    <X size={18} />
                                </button>
                                <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-black uppercase tracking-wider shadow">
                                            Veterinary Partner
                                        </span>
                                        {selectedClinic.is_emergency && (
                                            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider shadow">
                                                Emergency Option
                                            </span>
                                        )}
                                    </div>
                                    {selectedClinic.badge_title && (
                                        <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase shadow">
                                            {selectedClinic.badge_title}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-paw-navy dark:text-white">{selectedClinic.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                <MapPin size={13} className="text-[#FFAE33]" />
                                <span>{selectedClinic.address || selectedClinic.city}</span>
                            </p>

                            <div className="mt-4 py-4 border-y border-gray-100 dark:border-slate-800 space-y-3 text-sm">
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {selectedClinic.description || selectedClinic.short_description}
                                </p>

                                {selectedClinic.services && selectedClinic.services.length > 0 && (
                                    <div>
                                        <h5 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Available Services</h5>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedClinic.services.map((svc, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    {svc}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedClinic.operating_hours && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                        <Clock size={14} className="text-amber-500 shrink-0" />
                                        <span><strong>Hours:</strong> {selectedClinic.operating_hours}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3 justify-end">
                                <button
                                    onClick={() => setSelectedClinic(null)}
                                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-white"
                                >
                                    Close
                                </button>
                                {selectedClinic.phone && (
                                    <a
                                        href={`tel:${selectedClinic.phone.replace(/[^0-9+]/g, '')}`}
                                        className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20"
                                    >
                                        <Phone size={14} />
                                        <span>Call {selectedClinic.phone}</span>
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal for Resource Details */}
            <AnimatePresence>
                {selectedResource && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedResource(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
                        >
                            <button 
                                onClick={() => setSelectedResource(null)}
                                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black uppercase mb-3 inline-block">
                                {selectedResource.badge || 'Resource Guide'}
                            </span>

                            <h3 className="text-2xl font-black text-paw-navy dark:text-white">{selectedResource.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Category: {selectedResource.category}</p>

                            <div className="mt-4 py-4 border-y border-gray-100 dark:border-slate-800 space-y-3 text-sm">
                                <p className="text-gray-700 dark:text-gray-300 font-medium">
                                    {selectedResource.description}
                                </p>
                                {selectedResource.content && (
                                    <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {selectedResource.content}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3 justify-end items-center">
                                <button
                                    onClick={() => setSelectedResource(null)}
                                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-white"
                                >
                                    Close
                                </button>
                                <a
                                    href={`/resources/${selectedResource.id}/download`}
                                    className="px-5 py-2.5 rounded-full bg-paw-orange hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-500/20"
                                >
                                    <Download size={14} />
                                    <span>Download Guide ({selectedResource.file_size || 'PDF'})</span>
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}

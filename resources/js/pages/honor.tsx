import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Award, Heart, Users, Star, Gift, Shield, Sparkles, Home, 
    Calendar, CheckCircle2, ArrowRight, ExternalLink, HelpCircle 
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ScrollRevealWrapper } from '@/components/scroll-reveal-wrapper';

interface CommunityHonorItem {
    id: number;
    name: string;
    category: 'donor' | 'volunteer' | 'sponsor' | 'community_supporter';
    tier?: string | null;
    role_title: string;
    description?: string | null;
    badges?: string[] | null;
    initials?: string | null;
    avatar_url?: string | null;
    is_featured: boolean;
}

interface BadgeItem {
    name: string;
    description: string;
    color: string;
    icon: string;
}

interface VolunteerStats {
    core_members_count: number;
    active_volunteers_count?: number | null;
    on_call_volunteers_count?: number | null;
    meals_served_display?: string;
    pets_rescued_display?: string;
    adoptions_display?: string;
    active_zones_display?: string;
}

interface HonorPageProps {
    allHonors: CommunityHonorItem[];
    recognizedSupporters: CommunityHonorItem[];
    communitySupporters: CommunityHonorItem[];
    donors: CommunityHonorItem[];
    volunteers: CommunityHonorItem[];
    sponsors: CommunityHonorItem[];
    volunteerStats: VolunteerStats;
    badgesCatalog: BadgeItem[];
}

export default function HonorPage({
    allHonors = [],
    recognizedSupporters = [],
    communitySupporters = [],
    donors = [],
    volunteers = [],
    sponsors = [],
    volunteerStats,
    badgesCatalog = []
}: HonorPageProps) {
    const [selectedTab, setSelectedTab] = useState<string>('all');

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'donors', label: 'Donors' },
        { id: 'volunteers', label: 'Volunteers' },
        { id: 'sponsors', label: 'Sponsors' },
        { id: 'community_supporters', label: 'Community Supporters' },
    ];

    const getInitials = (item: CommunityHonorItem) => {
        if (item.initials) return item.initials;
        const parts = item.name.trim().split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return item.name.substring(0, 2).toUpperCase();
    };

    // Filter items based on active tab
    const filteredRecognized = selectedTab === 'all'
        ? recognizedSupporters
        : recognizedSupporters.filter(item => {
            if (selectedTab === 'donors') return item.category === 'donor';
            if (selectedTab === 'volunteers') return item.category === 'volunteer';
            if (selectedTab === 'sponsors') return item.category === 'sponsor';
            if (selectedTab === 'community_supporters') return item.category === 'community_supporter';
            return true;
        });

    const filteredCommunity = selectedTab === 'all'
        ? communitySupporters
        : communitySupporters.filter(item => {
            if (selectedTab === 'community_supporters') return true;
            return false;
        });

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 font-quicksand text-slate-800 dark:text-slate-100 antialiased selection:bg-paw-orange selection:text-white">
            <Head title="Community Honor & Recognition | Together for Every Paw | Iligan Stray Feeders" />
            <Header />

            <main>
                {/* 1. Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-b from-[#131627] via-[#161B30] to-[#0D1020] text-white pt-16 pb-20 text-center">
                    {/* Background Subtle Sparkle Accents */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-amber-400 blur-3xl" />
                        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-orange-500 blur-3xl" />
                    </div>

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-[#FFAE33] text-xs font-bold uppercase tracking-wider"
                        >
                            <Award size={14} className="text-[#FFAE33]" />
                            <span>Community Recognition</span>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight"
                        >
                            Together for <br />
                            <span className="text-[#FFAE33]">Every Paw</span>
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium"
                        >
                            A community built by people who give their time, resources, and support to help Iligan Stray Feeders care for animals in need.
                        </motion.p>

                        {/* Filter Tabs */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap items-center justify-center gap-2 pt-6"
                        >
                            {tabs.map((tab) => {
                                const isActive = selectedTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedTab(tab.id)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-[#FFAE33] text-slate-900 shadow-md font-black shadow-amber-500/20'
                                                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
                    {/* 2. Recognized Supporters Section */}
                    {(selectedTab === 'all' || selectedTab === 'donors') && filteredRecognized.length > 0 && (
                        <ScrollRevealWrapper>
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                        <Star size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-black text-paw-navy dark:text-white">
                                            Recognized Supporters
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">ISF-approved public recognition</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {filteredRecognized.map((item) => (
                                        <div 
                                            key={item.id}
                                            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-md shadow-slate-100 dark:shadow-none flex flex-col justify-between relative overflow-hidden"
                                        >
                                            {item.tier && (
                                                <div className="absolute top-4 right-4">
                                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                                                        {item.tier}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#FFAE33] text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                                                        {getInitials(item)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-paw-navy dark:text-white">{item.name}</h4>
                                                        <p className="text-xs font-bold text-amber-600 dark:text-[#FFAE33] flex items-center gap-1">
                                                            <Heart size={12} className="fill-current text-amber-500" />
                                                            <span>{item.role_title}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                                    {item.description}
                                                </p>
                                            </div>

                                            {item.badges && item.badges.length > 0 && (
                                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800/80 flex flex-wrap gap-2">
                                                    {item.badges.map((badge, bIdx) => (
                                                        <span 
                                                            key={bIdx}
                                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200/60 dark:border-blue-900"
                                                        >
                                                            <CheckCircle2 size={12} className="text-blue-500" />
                                                            <span>{badge}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollRevealWrapper>
                    )}

                    {/* 3. Community Supporters Section */}
                    {(selectedTab === 'all' || selectedTab === 'community_supporters') && (
                        <ScrollRevealWrapper>
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                        <Heart size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-black text-paw-navy dark:text-white">
                                            Community Supporters
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Valued members of the ISF community</p>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {filteredCommunity.map((item) => (
                                        <div 
                                            key={item.id}
                                            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm shadow-slate-100 dark:shadow-none flex flex-col justify-between"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                                                        {getInitials(item)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-black text-paw-navy dark:text-white">{item.name}</h4>
                                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                            <Heart size={11} className="text-purple-500" />
                                                            <span>{item.role_title}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                    {item.description || 'Recognized by ISF as a valued supporter of its animal welfare activities.'}
                                                </p>
                                            </div>

                                            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800/80">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-900">
                                                    <CheckCircle2 size={11} className="text-emerald-500" />
                                                    <span>Community Supporter</span>
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollRevealWrapper>
                    )}

                    {/* 4. Volunteer Recognition Section */}
                    {(selectedTab === 'all' || selectedTab === 'volunteers') && (
                        <ScrollRevealWrapper>
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-black text-paw-navy dark:text-white">
                                            Volunteer Recognition
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Core Members · Active Volunteers · On-Call Volunteers</p>
                                    </div>
                                </div>

                                {/* 3 Stats Cards */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 text-center shadow-xs">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center mx-auto mb-2">
                                            <Award size={18} />
                                        </div>
                                        <span className="text-2xl sm:text-3xl font-black text-paw-navy dark:text-white">
                                            {volunteerStats?.core_members_count || 15}
                                        </span>
                                        <p className="text-[11px] font-black uppercase text-gray-400 mt-1">Core Members</p>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 text-center shadow-xs">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">
                                            <Users size={18} />
                                        </div>
                                        <span className="text-2xl sm:text-3xl font-black text-paw-navy dark:text-white">
                                            {volunteerStats?.active_volunteers_count ? volunteerStats.active_volunteers_count : '—'}
                                        </span>
                                        <p className="text-[11px] font-black uppercase text-gray-400 mt-1">Active Volunteers</p>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 text-center shadow-xs">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">
                                            <Heart size={18} />
                                        </div>
                                        <span className="text-2xl sm:text-3xl font-black text-paw-navy dark:text-white">
                                            {volunteerStats?.on_call_volunteers_count ? volunteerStats.on_call_volunteers_count : '—'}
                                        </span>
                                        <p className="text-[11px] font-black uppercase text-gray-400 mt-1">On-Call Volunteers</p>
                                    </div>
                                </div>

                                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                                    Individual volunteer recognition cards will appear here once formal service records are verified and confirmed by ISF admins.
                                </p>

                                {/* Empty state banner */}
                                <div className="p-8 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-center space-y-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 flex items-center justify-center mx-auto mb-1">
                                        <Users size={18} />
                                    </div>
                                    <h5 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                                        No public volunteer recognitions yet
                                    </h5>
                                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                        Individual volunteer recognition cards will appear here once formal service records are confirmed and approved by ISF.
                                    </p>
                                </div>
                            </div>
                        </ScrollRevealWrapper>
                    )}

                    {/* 5. Sponsors & Supporters Section */}
                    {(selectedTab === 'all' || selectedTab === 'sponsors') && (
                        <ScrollRevealWrapper>
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                        <Gift size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-black text-paw-navy dark:text-white">
                                            Sponsors & Supporters
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Organizations and businesses supporting ISF activities</p>
                                    </div>
                                </div>

                                {/* Partner & Sponsor Integration Notice Card */}
                                <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h5 className="font-black text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                            <Award size={16} className="text-[#FFAE33]" />
                                            <span>Partner & Sponsor Integration</span>
                                        </h5>
                                        <p className="text-xs text-amber-800/80 dark:text-amber-300/80 max-w-xl">
                                            ISF&apos;s food, supply, and veterinary partners may also appear here as sponsors when formally recognized. Visit our Partners & Support Network to see current partner organizations.
                                        </p>
                                    </div>

                                    <Link 
                                        href="/about#partners-network"
                                        className="text-xs font-black text-amber-900 dark:text-amber-200 hover:underline flex items-center gap-1 shrink-0"
                                    >
                                        <span>View Partners & Support Network</span>
                                        <ArrowRight size={13} />
                                    </Link>
                                </div>

                                <div className="p-8 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-center space-y-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 flex items-center justify-center mx-auto mb-1">
                                        <Gift size={18} />
                                    </div>
                                    <h5 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                                        No public sponsor recognitions yet
                                    </h5>
                                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                        Formal sponsor recognitions will appear here once approved and published by ISF.
                                    </p>
                                </div>
                            </div>
                        </ScrollRevealWrapper>
                    )}

                    {/* 6. Achievement Badges Catalog Section */}
                    <ScrollRevealWrapper>
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-paw-navy dark:text-white">
                                        Achievement Badges
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Recognizing meaningful participation — awarded by ISF based on verified records
                                    </p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {badgesCatalog.map((b, idx) => (
                                    <div 
                                        key={idx}
                                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs space-y-2 hover:border-gray-300 dark:hover:border-slate-700 transition-all"
                                    >
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${b.color}`}>
                                            {b.name}
                                        </span>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                                            {b.description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
                                Badges are awarded based on verified ISF activity or explicit Admin approval. Badges do not determine voting or operational permissions.
                            </p>
                        </div>
                    </ScrollRevealWrapper>

                    {/* 7. Transparency & Appreciation Banner (Dark Card) */}
                    <ScrollRevealWrapper>
                        <div className="rounded-3xl bg-gradient-to-r from-[#172530] to-[#0D161D] text-white p-8 sm:p-12 text-center shadow-xl space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#FFAE33]/20 text-[#FFAE33] flex items-center justify-center mx-auto mb-2">
                                <Heart size={22} className="fill-current" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white">
                                Transparency & Appreciation
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
                                Every contribution matters. PAWLSE helps ISF recognize the people and organizations supporting its animal welfare activities while respecting each supporter&apos;s preferred level of public recognition.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                                <Link
                                    href="/donate"
                                    className="px-6 py-3 rounded-full bg-[#FFAE33] hover:bg-amber-500 text-slate-900 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all"
                                >
                                    Support ISF
                                </Link>
                                <Link
                                    href="/volunteer"
                                    className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-black text-xs uppercase tracking-wider transition-all"
                                >
                                    Volunteer with ISF
                                </Link>
                            </div>
                        </div>
                    </ScrollRevealWrapper>
                </div>
            </main>

            <Footer />
        </div>
    );
}

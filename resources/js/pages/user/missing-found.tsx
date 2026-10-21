import React, { useState } from 'react';
import { Search, MapPin, Calendar, CheckCircle2, Clock, XCircle, AlertCircle, Plus, ChevronRight, FileText, Share2, Eye, HeartHandshake } from 'lucide-react';
import { router, Link } from '@inertiajs/react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { formatPhotoUrl } from '@/lib/utils';
import {
    MissingPetDetailModal,
    MissingPetShareModal,
    MissingPetItem,
} from '@/components/missing';

interface PetReport {
    id: number;
    type: string;
    status: string;
    animal_type: string;
    breed: string | null;
    age_category: string | null;
    gender: string | null;
    name: string | null;
    color: string | null;
    size?: string | null;
    reward?: string | null;
    medical_conditions?: string | null;
    distinguishing_features?: string | null;
    last_seen_date: string | null;
    urgency: string | null;
    situation_type: string | null;
    description: string | null;
    location: string;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    is_duplicate: boolean;
    created_at: string;
    photos: { id: number; path: string }[];
}

interface UserMissingFoundReportsProps {
    reports: {
        data: PetReport[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters: {
        search: string;
    };
}

export default function UserMissingFoundReports({ reports, filters }: UserMissingFoundReportsProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [selectedPet, setSelectedPet] = useState<MissingPetItem | null>(null);
    const [sharingPet, setSharingPet] = useState<MissingPetItem | null>(null);

    const handleSearch = () => {
        router.get(
            '/account/user/missing-found',
            { search: searchQuery },
            { preserveState: true }
        );
    };

    const toMissingPetItem = (report: PetReport): MissingPetItem => {
        let statusText = 'STILL SEARCHING';
        if (report.status === 'resolved') {
            statusText = 'FOUND';
        } else if (report.status === 'assigned') {
            statusText = 'SEARCHING';
        } else if (report.status === 'pending') {
            statusText = 'PENDING REVIEW';
        }

        const photo = report.photos?.[0];
        const imgUrl = photo ? formatPhotoUrl(photo.path) : 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800';

        const rawDesc = String(report.description || '');
        const [baseDesc, splitFeatures] = rawDesc.includes('Distinguishing Features:')
            ? rawDesc.split('Distinguishing Features:')
            : [rawDesc, ''];
        const cleanDescription = baseDesc?.trim() || 'No description provided.';
        const cleanFeatures = report.distinguishing_features || splitFeatures?.trim() || 'None reported';

        return {
            id: report.id,
            name: report.name || 'Unnamed Pet',
            type: report.animal_type || 'Dog',
            breed: report.breed || 'Mixed Breed',
            color: report.color || 'Mixed',
            gender: report.gender ? (report.gender.charAt(0).toUpperCase() + report.gender.slice(1)) : 'Unknown',
            age: report.age_category ? (report.age_category.charAt(0).toUpperCase() + report.age_category.slice(1)) : 'Young Adult',
            size: report.size ? (report.size.charAt(0).toUpperCase() + report.size.slice(1)) : 'Medium',
            reward: report.reward ? (String(report.reward).startsWith('₱') ? report.reward : `₱${report.reward}`) : null,
            medicalConditions: report.medical_conditions || 'None',
            distinguishingFeatures: cleanFeatures,
            status: statusText,
            rawStatus: report.status || 'pending',
            lastSeen: report.location || 'Iligan City',
            lastSeenDetails: cleanDescription,
            date: report.last_seen_date ? new Date(report.last_seen_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : new Date(report.created_at).toLocaleDateString(),
            exactDate: report.last_seen_date ? new Date(report.last_seen_date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date(report.created_at).toLocaleDateString(),
            description: cleanDescription,
            img: imgUrl,
            owner: {
                name: report.contact_name || 'Pet Guardian',
                facebook: '',
                phone: report.contact_phone || 'Not provided',
                email: report.contact_email || '',
                address: report.location || 'Iligan City',
            },
        };
    };

    const handleMarkReunited = (reportId: number) => {
        if (confirm('Did you find your missing pet and want to mark this report as safely reunited?')) {
            router.post(`/missing/reports/${reportId}/reunited`, {}, {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={12} /> Pending Review
                    </span>
                );
            case 'assigned':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Search size={12} /> Searching Active
                    </span>
                );
            case 'resolved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 size={12} /> Found & Reunited
                    </span>
                );
            case 'duplicate':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
                        <AlertCircle size={12} /> Duplicate Flagged
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        <XCircle size={12} /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
                        {status}
                    </span>
                );
        }
    };

    return (
        <DashboardSectionPage
            title="Missing & Found Reports"
            description="Manage and track missing, found, and reunited animal reports you have filed."
            badge={<DashboardMetricBadge icon={<Search className="h-4 w-4" />} label={`${reports?.total || 0} Reports`} />}
        >
            {/* Search and Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search by pet name, location, breed..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] dark:border-[#334155] rounded-xl outline-none focus:border-paw-orange transition-all font-bold text-sm text-[#0B2340] dark:text-[#F8FAFC] dark:bg-[#1E293B]"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSearch}
                        className="px-5 py-2.5 bg-paw-orange text-white hover:bg-orange-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-paw-orange/20 cursor-pointer"
                    >
                        Search
                    </button>
                    <Link
                        href="/missing"
                        className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 text-[#0B2340] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-805 font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-1.5 transition-all text-center"
                    >
                        File New Report <Plus size={14} />
                    </Link>
                </div>
            </div>

            {/* Reports list */}
            {reports.data.length === 0 ? (
                <DashboardCard className="p-8 text-center max-w-2xl mx-auto">
                    <FileText className="mx-auto text-gray-300 mb-4" size={56} />
                    <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white mb-2">No Reports Found</h3>
                    <p className="text-sm text-gray-500 font-bold max-w-md mx-auto mb-6 leading-relaxed">
                        You have not submitted any missing or found pet reports yet. If your pet has gone missing or you found a lost pet, file a report to alert the community.
                    </p>
                    <Link
                        href="/missing"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-paw-orange text-white hover:bg-orange-600 font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-paw-orange/25"
                    >
                        Report a Pet <ChevronRight size={16} />
                    </Link>
                </DashboardCard>
            ) : (
                <div className="space-y-4">
                    {reports.data.map((report) => {
                        const item = toMissingPetItem(report);
                        return (
                            <DashboardCard key={report.id}>
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Thumbnails */}
                                    {report.photos && report.photos.length > 0 ? (
                                        <div className="flex gap-2 shrink-0 overflow-x-auto max-w-full md:max-w-[200px]">
                                            {report.photos.map((photo) => (
                                                <ImageWithFallback
                                                    key={photo.id}
                                                    src={formatPhotoUrl(photo.path)}
                                                    alt="Pet report attachment"
                                                    className="w-20 h-20 rounded-xl object-cover border border-gray-100 dark:border-slate-800 shrink-0"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-xl bg-paw-orange/10 text-paw-orange flex items-center justify-center shrink-0">
                                            <Search size={28} />
                                        </div>
                                    )}

                                    {/* Report Details */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                                    Missing Pet Alert: {report.name || 'Unnamed Pet'} ({report.animal_type})
                                                </h3>
                                                <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-700">
                                                    {`MIS-${String(report.id).padStart(5, '0')}`}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                    {report.breed || 'Unknown Breed'}
                                                </span>
                                                {getStatusBadge(report.status)}
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed line-clamp-2">
                                            {report.description || 'No description provided.'}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-bold">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={14} className="text-paw-orange shrink-0" />
                                                Last seen: {report.location}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-paw-orange shrink-0" />
                                                Reported on: {new Date(report.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPet(item)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-paw-navy dark:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                            >
                                                <Eye size={13} /> View Details
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setSharingPet(item)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-paw-orange rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                            >
                                                <Share2 size={13} /> Share Alert
                                            </button>

                                            {report.status !== 'resolved' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkReunited(report.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all ml-auto"
                                                >
                                                    <HeartHandshake size={14} /> My Pet is Reunited!
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </DashboardCard>
                        );
                    })}

                    {/* Pagination */}
                    {reports.last_page > 1 && (
                        <div className="flex justify-center gap-1.5 mt-8">
                            {reports.links.map((link, idx) => {
                                let label = link.label;
                                if (label.includes('Previous')) {
                                    label = '←';
                                }
                                if (label.includes('Next')) {
                                    label = '→';
                                }

                                return (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => router.get(link.url!, {}, { preserveScroll: true, preserveState: true })}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                            link.active
                                                ? 'bg-paw-orange text-white shadow-md'
                                                : 'bg-white dark:bg-[#1E293B] text-paw-navy dark:text-[#F8FAFC] hover:bg-gray-50 border border-gray-100 dark:border-gray-800'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Pet Detail Modal */}
            <MissingPetDetailModal
                isOpen={!!selectedPet}
                onClose={() => setSelectedPet(null)}
                pet={selectedPet}
                onShare={(pet) => setSharingPet(pet)}
            />

            {/* Pet Share Modal */}
            <MissingPetShareModal
                isOpen={!!sharingPet}
                onClose={() => setSharingPet(null)}
                pet={sharingPet}
            />
        </DashboardSectionPage>
    );
}

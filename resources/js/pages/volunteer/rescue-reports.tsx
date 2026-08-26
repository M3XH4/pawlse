import React, { useState } from 'react';
import { FileText, MapPin, Calendar, Search, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

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

interface VolunteerRescueReportsProps {
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
        status: string;
    };
}

export default function VolunteerRescueReports({ reports, filters }: VolunteerRescueReportsProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'assigned');

    const handleSearch = () => {
        router.get(
            '/account/volunteer/rescue-reports',
            { search: searchQuery, status: statusFilter },
            { preserveState: true }
        );
    };

    const handleStatusChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        router.get(
            '/account/volunteer/rescue-reports',
            { search: searchQuery, status: newStatus },
            { preserveState: true }
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'assigned':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={12} /> Assigned (Pending Action)
                    </span>
                );
            case 'resolved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 size={12} /> Completed / Resolved
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

    const getReportTitle = (report: PetReport) => {
        const animal = report.animal_type;
        switch (report.type) {
            case 'rescue':
                return `Rescue Stray ${animal} ${report.breed ? `(${report.breed})` : ''}`;
            case 'missing':
                return `Missing Pet Alert: ${report.name || 'Unnamed'} (${animal})`;
            case 'sos':
                return `SOS Emergency: ${report.situation_type || 'Distress'} (${animal})`;
            default:
                return `Pet Report #${report.id}`;
        }
    };

    return (
        <DashboardSectionPage
            title="Assigned Rescue Reports"
            description="Track and handle rescue reports assigned to your volunteer profile"
            badge={<DashboardMetricBadge icon={<FileText className="h-4 w-4" />} label={`${reports?.total || 0} Assignments`} />}
        >
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search by location or details..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] dark:border-[#334155] rounded-xl outline-none focus:border-paw-orange transition-all font-bold text-sm text-[#0B2340] dark:text-[#F8FAFC] dark:bg-[#1E293B]"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
                <div className="flex gap-2">
                    {[
                        { val: 'assigned', label: 'Active' },
                        { val: 'resolved', label: 'Completed' },
                        { val: 'cancelled', label: 'Cancelled' }
                    ].map((s) => (
                        <button
                            key={s.val}
                            onClick={() => handleStatusChange(s.val)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                                statusFilter === s.val
                                    ? 'bg-paw-orange text-white shadow-md'
                                    : 'bg-white border border-[#E2E8F0] dark:border-[#334155] text-paw-navy hover:bg-gray-50 dark:bg-[#1E293B] dark:text-[#F8FAFC]'
                            }`}
                        >
                            {s.label.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports List */}
            {reports.data.length === 0 ? (
                <DashboardCard>
                    <div className="text-center py-8">
                        <FileText className="mx-auto text-gray-300 mb-3" size={36} />
                        <p className="text-sm font-bold text-[#64748B] dark:text-[#94A3B8]">
                            No assigned reports found matching the criteria.
                        </p>
                    </div>
                </DashboardCard>
            ) : (
                <div className="space-y-4">
                    {reports.data.map((report) => (
                        <DashboardCard key={report.id}>
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Thumbnails */}
                                {report.photos && report.photos.length > 0 && (
                                    <div className="flex gap-2 shrink-0 overflow-x-auto max-w-full md:max-w-[200px]">
                                        {report.photos.map((photo) => (
                                            <img
                                                key={photo.id}
                                                src={photo.path}
                                                alt="Report attachment"
                                                className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Report Details */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                            {getReportTitle(report)}
                                        </h3>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600">
                                                {report.type}
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
                                            {report.location}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-paw-orange shrink-0" />
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Reporter Contact Info */}
                                    <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-800 text-xs text-paw-navy dark:text-gray-300 font-bold space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Reporter Contact Info</p>
                                        <p>Name: <span className="text-paw-orange">{report.contact_name || 'N/A'}</span></p>
                                        <p>Phone: <span className="text-paw-orange">{report.contact_phone || 'N/A'}</span></p>
                                        {report.contact_email && <p>Email: <span className="text-paw-orange">{report.contact_email}</span></p>}
                                    </div>

                                    {report.status === 'assigned' && (
                                        <div className="flex gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800/40">
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to mark this rescue report as resolved?')) {
                                                        router.post(`/account/volunteer/rescue-reports/${report.id}/status`, { status: 'resolved' });
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm"
                                            >
                                                <CheckCircle2 size={14} /> Mark as Resolved
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to cancel this rescue assignment?')) {
                                                        router.post(`/account/volunteer/rescue-reports/${report.id}/status`, { status: 'cancelled' });
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer border border-red-200 dark:border-red-900/55"
                                            >
                                                <XCircle size={14} /> Cancel Rescue
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DashboardCard>
                    ))}

                    {/* Pagination */}
                    {reports.last_page > 1 && (
                        <div className="flex justify-center gap-1.5 mt-8">
                            {reports.links.map((link, idx) => {
                                let label = link.label;
                                if (label.includes('Previous')) label = '←';
                                if (label.includes('Next')) label = '→';

                                return (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => router.get(link.url!, {}, { preserveScroll: true, preserveState: true })}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                            link.active
                                                ? 'bg-paw-orange text-white shadow-md'
                                                : 'bg-white dark:bg-[#1E293B] text-paw-navy dark:text-[#F8FAFC] hover:bg-gray-50 border border-gray-100 dark:border-gray-800'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </DashboardSectionPage>
    );
}

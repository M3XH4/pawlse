import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AnimatePresence } from 'motion/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminCard } from '@/components/admin/card';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { formatPhotoUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  User, Search, Filter, CheckCircle2, Clock, XCircle, AlertCircle, 
  MapPin, Calendar, Camera, Info, ShieldAlert, Sparkles, Siren, 
  Eye, Check, Link as LinkIcon, RefreshCw, Phone, Mail, X
} from 'lucide-react';

interface PaginatedData<T> {
  data: T[];
  links: any[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

interface PetReportPhoto {
  id: number;
  path: string;
  original_filename: string;
}

interface UserModel {
  id: number;
  name: string;
  email: string;
}

interface PetReport {
  id: number;
  user_id: number | null;
  type: 'rescue' | 'missing' | 'sos';
  status: 'pending' | 'assigned' | 'resolved' | 'duplicate' | 'cancelled';
  is_duplicate: boolean;
  duplicate_of_id: number | null;
  duplicate_of?: PetReport | null;
  animal_type: string;
  breed: string | null;
  age_category: string | null;
  gender: string | null;
  name: string | null;
  color: string | null;
  size?: string | null;
  reward?: string | null;
  medical_conditions?: string | null;
  last_seen_date: string | null;
  urgency: string | null;
  situation_type: string | null;
  description: string | null;
  location: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  assigned_volunteer_id: number | null;
  assigned_volunteer?: UserModel | null;
  ai_prediction_log_id?: number | null;
  ai_validation_status?: 'pending' | 'approved' | 'rejected' | null;
  ai_prediction_log?: {
    id: number;
    confidence: number | null;
    output_data?: any;
  } | null;
  created_at: string;
  photos?: PetReportPhoto[];
}

interface RescueManagementProps {
  reports: PaginatedData<PetReport>;
  volunteers: UserModel[];
  duplicateCandidates: PetReport[];
  stats: {
    total: number;
    pending: number;
    assigned: number;
    resolved: number;
    duplicate: number;
  };
  filters: {
    search: string;
    status: string;
    type: string;
    duplicate: string;
  };
}

export default function RescueManagement({
  reports,
  volunteers,
  duplicateCandidates,
  stats,
  filters
}: RescueManagementProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'All');
  const [typeFilter, setTypeFilter] = useState(filters.type || 'All');
  const [duplicateFilter, setDuplicateFilter] = useState(filters.duplicate || 'All');

  // Detail Modal State
  const [selectedReport, setSelectedReport] = useState<PetReport | null>(null);
  const [assignVolunteerId, setAssignVolunteerId] = useState('');
  const [updateStatusVal, setUpdateStatusVal] = useState('');
  const [linkDuplicateOfId, setLinkDuplicateOfId] = useState('');

  const handleFilterSearch = () => {
    router.get('/account/admin/rescue-management', {
      search: searchQuery,
      status: statusFilter,
      type: typeFilter,
      duplicate: duplicateFilter
    }, { preserveState: true });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTypeFilter('All');
    setDuplicateFilter('All');
    router.get('/account/admin/rescue-management', {}, { preserveState: true });
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !assignVolunteerId) return;

    router.post(`/account/admin/rescue-management/${selectedReport.id}/assign`, {
      volunteer_id: assignVolunteerId
    }, {
      onSuccess: () => {
        toast.success('Volunteer assigned successfully!');
        // Refresh selected report details in view
        router.reload({
          only: ['reports'],
          onSuccess: (page) => {
            const updated = (page.props.reports as any).data.find((r: any) => r.id === selectedReport.id);
            if (updated) setSelectedReport(updated);
          }
        });
        setAssignVolunteerId('');
      }
    });
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !updateStatusVal) return;

    router.post(`/account/admin/rescue-management/${selectedReport.id}/status`, {
      status: updateStatusVal
    }, {
      onSuccess: () => {
        toast.success('Report status updated successfully!');
        router.reload({
          only: ['reports'],
          onSuccess: (page) => {
            const updated = (page.props.reports as any).data.find((r: any) => r.id === selectedReport.id);
            if (updated) setSelectedReport(updated);
          }
        });
      }
    });
  };

  const handleDuplicateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !linkDuplicateOfId) return;

    router.post(`/account/admin/rescue-management/${selectedReport.id}/duplicate`, {
      is_duplicate: true,
      duplicate_of_id: linkDuplicateOfId
    }, {
      onSuccess: () => {
        toast.success('Report linked as duplicate.');
        router.reload({
          only: ['reports'],
          onSuccess: (page) => {
            const updated = (page.props.reports as any).data.find((r: any) => r.id === selectedReport.id);
            if (updated) setSelectedReport(updated);
          }
        });
        setLinkDuplicateOfId('');
      }
    });
  };

  const handleMarkNotDuplicate = () => {
    if (!selectedReport) return;

    router.post(`/account/admin/rescue-management/${selectedReport.id}/duplicate`, {
      is_duplicate: false,
      duplicate_of_id: null
    }, {
      onSuccess: () => {
        toast.success('Report duplicate flag removed.');
        router.reload({
          only: ['reports'],
          onSuccess: (page) => {
            const updated = (page.props.reports as any).data.find((r: any) => r.id === selectedReport.id);
            if (updated) setSelectedReport(updated);
          }
        });
      }
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300';
      case 'duplicate':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'rescue':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-amber-200">
            <Sparkles size={10} /> STRAY RESCUE
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-sky-200">
            <Calendar size={10} /> MISSING PET
          </span>
        );
      case 'sos':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-red-200">
            <Siren size={10} className="animate-pulse" /> SOS ALERT
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-[10px] uppercase font-black px-2 py-0.5 rounded">
            {type}
          </span>
        );
    }
  };

  return (
    <AdminPageShell 
      title="Rescue & Incident Management"
      description="Manage reports of strays, missing pets, and emergency SOS requests."
    >
      <Head title="Rescue & Incident Management" />
      
      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Reports', val: stats.total, icon: <Info size={20} />, bg: 'bg-[#0B2340] text-white' },
          { label: 'Pending Review', val: stats.pending, icon: <Clock size={20} />, bg: 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' },
          { label: 'Assigned Responder', val: stats.assigned, icon: <User size={20} />, bg: 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' },
          { label: 'Resolved / Safe', val: stats.resolved, icon: <CheckCircle2 size={20} />, bg: 'bg-green-500 text-white shadow-lg shadow-green-500/20' },
          { label: 'Duplicates Flagged', val: stats.duplicate, icon: <ShieldAlert size={20} />, bg: 'bg-gray-500 text-white shadow-lg shadow-gray-500/20' },
        ].map((c, idx) => (
          <div key={idx} className={`${c.bg} rounded-[24px] p-5 flex flex-col justify-between h-28`}>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-90">{c.label}</span>
              <span className="opacity-85">{c.icon}</span>
            </div>
            <span className="text-3xl font-fredoka font-bold leading-none">{c.val}</span>
          </div>
        ))}
      </div>

      {/* Filter and Search Card */}
      <AdminCard className="p-6 mb-6">
        <div className="grid md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilterSearch()}
                placeholder="Search location, name, description..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl outline-none focus:border-paw-orange font-bold text-sm text-[#0B2340] dark:text-white"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Report Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm text-[#0B2340] dark:text-white"
            >
              <option value="All">All Types</option>
              <option value="Rescue">Stray Rescue</option>
              <option value="Missing">Missing Pet</option>
              <option value="SOS">SOS Emergency</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm text-[#0B2340] dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
              <option value="duplicate">Duplicate</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFilterSearch}
              className="flex-1 bg-paw-orange text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-md shadow-paw-orange/20"
            >
              <Filter size={16} /> APPLY
            </button>
            <button
              onClick={handleResetFilters}
              className="bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 p-3 rounded-xl transition-all"
              title="Reset Filters"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </AdminCard>

      {/* Reports Table Card */}
      <AdminCard className="overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-gray-400 font-bold uppercase tracking-wider">
                <th className="p-4">Report ID</th>
                <th className="p-4">Animal Details</th>
                <th className="p-4">Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Date Reported</th>
                <th className="p-4">Status</th>
                <th className="p-4">Responder</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-bold text-paw-navy dark:text-gray-200">
              {reports.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 font-bold">
                    No reports found matching the criteria.
                  </td>
                </tr>
              ) : (
                reports.data.map((report) => (
                  <tr 
                    key={report.id} 
                    className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-all ${
                      report.is_duplicate ? 'opacity-70 bg-gray-50/20' : ''
                    }`}
                  >
                    <td className="p-4 font-fredoka text-sm">
                      #{report.id}
                      {report.is_duplicate && (
                        <span className="ml-1 text-[9px] bg-red-100 text-red-800 px-1 rounded">DUP</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {report.photos && report.photos.length > 0 ? (
                          <ImageWithFallback
                            src={formatPhotoUrl(report.photos[0].path, report.animal_type)}
                            alt={report.name || 'Pet'}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-slate-800 shrink-0"
                          />
                        ) : (
                          <span className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 shrink-0">🐾</span>
                        )}
                        <div>
                          <p className="text-sm font-black">{report.name || 'Unnamed'}</p>
                          <p className="text-[10px] text-gray-400">{report.animal_type} · {report.breed || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">{getTypeBadge(report.type)}</td>
                    <td className="p-4 max-w-[200px] truncate" title={report.location}>
                      {report.location}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {report.assigned_volunteer ? (
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <User size={12} />
                          <span>{report.assigned_volunteer.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-semibold italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setUpdateStatusVal(report.status);
                        }}
                        className="bg-gray-100 hover:bg-paw-orange hover:text-white dark:bg-slate-800 dark:hover:bg-paw-orange dark:text-gray-300 p-2.5 rounded-xl transition-all inline-flex items-center gap-1"
                      >
                        <Eye size={14} /> VIEW
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800">
          {reports.data.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-bold">
              No reports found matching the criteria.
            </div>
          ) : (
            reports.data.map((report) => (
              <div
                key={report.id}
                className={`p-4 space-y-3 ${report.is_duplicate ? 'opacity-75 bg-gray-50/20' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-fredoka text-sm font-bold text-paw-navy dark:text-white">
                      #{report.id}
                    </span>
                    {report.is_duplicate && (
                      <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-black">DUP</span>
                    )}
                    {getTypeBadge(report.type)}
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(report.status)}`}>
                    {report.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {report.photos && report.photos.length > 0 ? (
                    <ImageWithFallback
                      src={formatPhotoUrl(report.photos[0].path, report.animal_type)}
                      alt={report.name || 'Pet'}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-slate-800 shrink-0"
                    />
                  ) : (
                    <span className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 shrink-0 text-lg">🐾</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-paw-navy dark:text-white truncate">{report.name || 'Unnamed Stray'}</p>
                    <p className="text-xs text-gray-400">{report.animal_type} · {report.breed || 'Unknown'}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Reported: {new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-900/60 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <MapPin size={12} className="text-paw-orange shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-slate-800">
                    <span className="text-gray-400">Responder:</span>
                    {report.assigned_volunteer ? (
                      <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <User size={11} /> {report.assigned_volunteer.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedReport(report);
                    setUpdateStatusVal(report.status);
                  }}
                  className="w-full bg-paw-navy hover:bg-paw-orange text-white py-2.5 rounded-xl transition-all font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Eye size={14} /> Review Report
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {reports.last_page > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-1.5 py-4 px-2 border-t border-gray-100 dark:border-slate-800 bg-gray-50/20 dark:bg-slate-900/10">
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
                      : 'bg-white dark:bg-slate-800 text-paw-navy dark:text-gray-300 hover:bg-gray-50 border border-gray-100 dark:border-slate-800'
                  } ${!link.url ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  dangerouslySetInnerHTML={{ __html: label }}
                />
              );
            })}
          </div>
        )}
      </AdminCard>

      {/* Details & Actions Overlay Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
            {/* Backdrop */}
            <div 
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-[#0B2340]/65 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl z-10 relative shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
              {/* Sticky Top Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/50 flex items-start justify-between gap-4 shrink-0">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border tracking-wider ${getStatusStyle(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                    {getTypeBadge(selectedReport.type)}
                    <span className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 font-black text-[10px] uppercase tracking-wider">
                      Ref #{selectedReport.id}
                    </span>
                    {selectedReport.ai_prediction_log_id && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider">
                        <Sparkles size={11} />
                        AI Assisted
                        {selectedReport.ai_prediction_log?.confidence
                          ? ` (${Math.round(selectedReport.ai_prediction_log.confidence * 100)}%)`
                          : ''}
                      </span>
                    )}
                    {selectedReport.is_duplicate && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider">
                        <ShieldAlert size={11} /> Duplicate Flagged
                      </span>
                    )}
                  </div>
                  <h3 className="font-fredoka text-xl sm:text-2xl font-bold text-[#0B2340] dark:text-white truncate">
                    {selectedReport.type === 'sos'
                      ? `SOS Emergency Report #${selectedReport.id}${selectedReport.situation_type ? ` — ${selectedReport.situation_type}` : ''}`
                      : selectedReport.type === 'missing'
                        ? `Missing Pet: ${selectedReport.name || `Report #${selectedReport.id}`}`
                        : selectedReport.name
                          ? `Animal: ${selectedReport.name}`
                          : `Stray Report #${selectedReport.id}`}
                  </h3>
                </div>

                <button 
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="p-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable 2-Column Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1">
                <div className="grid lg:grid-cols-12 gap-5 items-start">
                  {/* Left Column (7 cols): Evidence Photos + Animal & Location Details */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Prominent Evidence Photos Section */}
                    {selectedReport.photos && selectedReport.photos.length > 0 ? (
                      <div className="bg-gray-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800/80">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Camera size={13} className="text-paw-orange" />
                            Submitted Evidence Photos ({selectedReport.photos.length})
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">Click image to enlarge</span>
                        </div>
                        <div className={`grid gap-2.5 ${selectedReport.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
                          {selectedReport.photos.map((photo, idx) => {
                            const photoUrl = formatPhotoUrl(photo.path, selectedReport.animal_type);
                            return (
                              <a
                                key={photo.id}
                                href={photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:opacity-95 transition-all cursor-pointer ${
                                  selectedReport.photos?.length === 1 ? 'h-52' : idx === 0 ? 'h-36 sm:col-span-2' : 'h-36'
                                }`}
                                title="Click to view full size in new tab"
                              >
                                <ImageWithFallback
                                  src={photoUrl}
                                  alt="Incident attachment"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <span className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded-lg text-white text-[10px] font-bold flex items-center gap-1">
                                  <Eye size={11} /> View
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 flex items-center gap-3 text-gray-400">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <Camera size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-paw-navy dark:text-gray-300">No Evidence Photos Attached</p>
                          <p className="text-[11px] font-medium text-gray-400">Reporter submitted this case without photo attachments.</p>
                        </div>
                      </div>
                    )}

                    {/* Animal & Incident Attributes Card */}
                    <div className="bg-gray-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-slate-800/80 space-y-4">
                      <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest leading-none">
                        Animal & Incident Information
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Species</p>
                          <p className="text-xs font-black text-paw-navy dark:text-white mt-0.5">{selectedReport.animal_type}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Breed</p>
                          <p className="text-xs font-black text-paw-navy dark:text-white mt-0.5 truncate" title={selectedReport.breed || 'Unknown'}>
                            {selectedReport.breed || 'Unknown'}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Age / Stage</p>
                          <p className="text-xs font-black text-paw-navy dark:text-white mt-0.5">{selectedReport.age_category || 'N/A'}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Gender</p>
                          <p className="text-xs font-black text-paw-navy dark:text-white mt-0.5">{selectedReport.gender || 'N/A'}</p>
                        </div>
                        {selectedReport.color && (
                          <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Color / Markings</p>
                            <p className="text-xs font-black text-paw-navy dark:text-white mt-0.5 truncate" title={selectedReport.color}>{selectedReport.color}</p>
                          </div>
                        )}
                        {selectedReport.size && (
                          <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Size</p>
                            <p className="text-xs font-black text-paw-navy dark:text-white mt-0.5">{selectedReport.size}</p>
                          </div>
                        )}
                        {selectedReport.situation_type && (
                          <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Situation</p>
                            <p className="text-xs font-black text-red-600 dark:text-red-400 mt-0.5">{selectedReport.situation_type}</p>
                          </div>
                        )}
                        {selectedReport.urgency && (
                          <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Urgency</p>
                            <p className={`text-xs font-black uppercase mt-0.5 ${
                              selectedReport.urgency === 'high' ? 'text-red-500' :
                              selectedReport.urgency === 'medium' ? 'text-amber-500' : 'text-green-500'
                            }`}>{selectedReport.urgency}</p>
                          </div>
                        )}
                        {selectedReport.reward && (
                          <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Reward</p>
                            <p className="text-xs font-black text-emerald-600 mt-0.5">
                              {String(selectedReport.reward).startsWith('₱') ? selectedReport.reward : `₱${selectedReport.reward}`}
                            </p>
                          </div>
                        )}
                        {selectedReport.medical_conditions && (
                          <div className="col-span-2 sm:col-span-3 bg-rose-50/60 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/50">
                            <p className="text-[10px] text-rose-500 font-bold uppercase">Medical / Health Conditions</p>
                            <p className="text-xs font-black text-rose-700 dark:text-rose-300 mt-0.5">{selectedReport.medical_conditions}</p>
                          </div>
                        )}
                      </div>

                      {/* Location & Timestamps */}
                      <div className="pt-3 border-t border-gray-200/70 dark:border-slate-800 grid sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex gap-2.5 items-start sm:col-span-2 bg-white dark:bg-slate-900/70 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                          <MapPin size={16} className="text-paw-orange shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">
                              {selectedReport.type === 'missing' ? 'Last Seen Location' : 'Incident Location'}
                            </p>
                            <p className="text-xs sm:text-sm font-black text-paw-navy dark:text-white leading-snug break-words">
                              {selectedReport.location}
                            </p>
                          </div>
                        </div>

                        {selectedReport.last_seen_date && (
                          <div className="flex gap-2 items-center bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                            <Clock size={14} className="text-paw-orange shrink-0" />
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Last Seen</p>
                              <p className="text-xs font-black text-paw-navy dark:text-white mt-0.5">
                                {new Date(selectedReport.last_seen_date).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 items-center bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                          <Calendar size={14} className="text-paw-orange shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Date Submitted</p>
                            <p className="text-xs font-black text-paw-navy dark:text-white mt-0.5">
                              {new Date(selectedReport.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description / Notes Card */}
                    <div className="bg-gray-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-slate-800/80 space-y-2">
                      <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest leading-none">
                        Description & Field Notes
                      </h4>
                      <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold leading-relaxed whitespace-pre-wrap">
                        {selectedReport.description || 'No additional details provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Right Column (5 cols): Reporter Info + Operational Actions */}
                  <div className="lg:col-span-5 space-y-3.5">
                    {/* 1. Reporter Contact Information */}
                    <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-100 dark:border-slate-800/80 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest leading-none">
                          Reporter Contact
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          selectedReport.user_id
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-gray-200/70 text-gray-600 dark:bg-slate-700 dark:text-gray-300'
                        }`}>
                          {selectedReport.user_id ? 'Registered User' : 'Guest Reporter'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-paw-navy dark:text-gray-200 space-y-1.5">
                        <p className="text-sm font-black text-paw-orange">
                          {selectedReport.contact_name || 'Anonymous Reporter'}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-700 text-xs font-bold">
                            <Phone size={12} className="text-paw-orange" />
                            {selectedReport.contact_phone || 'No Phone'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-700 text-xs font-bold truncate max-w-full">
                            <Mail size={12} className="text-paw-orange shrink-0" />
                            <span className="truncate">{selectedReport.contact_email || 'No Email'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Update Status Form */}
                    <form onSubmit={handleStatusSubmit} className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-100 dark:border-slate-800/80 space-y-2.5">
                      <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest leading-none">
                        1. Update Report Status
                      </h4>
                      <div className="flex items-stretch gap-2 w-full">
                        <select
                          value={updateStatusVal}
                          onChange={(e) => setUpdateStatusVal(e.target.value)}
                          className="min-w-0 flex-1 px-3 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-bold text-xs text-paw-navy dark:text-white focus:border-paw-orange"
                        >
                          <option value="pending">Pending Review</option>
                          <option value="assigned">Assigned</option>
                          <option value="resolved">Resolved</option>
                          <option value="duplicate">Duplicate</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          type="submit"
                          className="shrink-0 bg-paw-navy text-white px-4 py-2.5 rounded-xl font-black text-xs hover:bg-paw-orange transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check size={14} /> UPDATE
                        </button>
                      </div>
                    </form>

                    {/* 3. Volunteer Assignment Form */}
                    <form onSubmit={handleAssignSubmit} className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-100 dark:border-slate-800/80 space-y-2.5">
                      <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest leading-none">
                        2. Dispatch Responder Volunteer
                      </h4>
                      {selectedReport.assigned_volunteer ? (
                        <div className="bg-blue-50/70 dark:bg-blue-950/30 px-3 py-2 rounded-xl border border-blue-100 dark:border-blue-900 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <CheckCircle2 size={14} className="shrink-0" />
                          <span className="truncate">
                            Assigned: <strong>{selectedReport.assigned_volunteer.name}</strong> ({selectedReport.assigned_volunteer.email})
                          </span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                          No volunteer responder assigned yet.
                        </p>
                      )}
                      
                      <div className="flex items-stretch gap-2 w-full">
                        <select
                          required
                          value={assignVolunteerId}
                          onChange={(e) => setAssignVolunteerId(e.target.value)}
                          className="min-w-0 flex-1 px-3 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-bold text-xs text-paw-navy dark:text-white truncate focus:border-paw-orange"
                        >
                          <option value="">Select volunteer...</option>
                          {volunteers.map((vol) => (
                            <option key={vol.id} value={vol.id}>{vol.name} ({vol.email})</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="shrink-0 bg-paw-orange text-white px-4 py-2.5 rounded-xl font-black text-xs hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-paw-orange/20 cursor-pointer"
                        >
                          <User size={14} /> ASSIGN
                        </button>
                      </div>
                    </form>

                    {/* 4. Duplicate Resolution Panel */}
                    <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-100 dark:border-slate-800/80 space-y-2.5">
                      <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest leading-none">
                        3. Duplicate Management
                      </h4>
                      {selectedReport.is_duplicate ? (
                        <div className="space-y-2.5">
                          <div className="bg-red-50/70 dark:bg-red-950/30 px-3 py-2 rounded-xl border border-red-100 dark:border-red-900 text-xs font-bold text-red-700 dark:text-red-300">
                            <p className="flex items-center gap-1.5"><ShieldAlert size={14} /> Flagged as Potential Duplicate</p>
                            {selectedReport.duplicate_of_id && (
                              <p className="mt-0.5 text-[10px] text-red-500 font-black">
                                Linked to Primary Report ID: #{selectedReport.duplicate_of_id}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleMarkNotDuplicate}
                            className="w-full bg-white dark:bg-slate-800 hover:bg-gray-100 border border-gray-200 dark:border-slate-700 text-paw-navy dark:text-gray-300 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <X size={14} className="text-red-500" /> Remove Duplicate Flag
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleDuplicateLink} className="space-y-2">
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                            Link to an existing primary report if this is a duplicate sighting:
                          </p>
                          <div className="flex items-stretch gap-2 w-full">
                            <select
                              required
                              value={linkDuplicateOfId}
                              onChange={(e) => setLinkDuplicateOfId(e.target.value)}
                              className="min-w-0 flex-1 px-3 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-bold text-xs text-paw-navy dark:text-white truncate focus:border-paw-orange"
                            >
                              <option value="">Select primary report...</option>
                              {duplicateCandidates
                                .filter(candidate => candidate.id !== selectedReport.id)
                                .map((candidate) => (
                                  <option key={candidate.id} value={candidate.id}>
                                    ID #{candidate.id} - {candidate.animal_type} at {candidate.location.substring(0, 25)}...
                                  </option>
                                ))}
                            </select>
                            <button
                              type="submit"
                              className="shrink-0 bg-paw-navy text-white px-4 py-2.5 rounded-xl font-black text-xs hover:bg-paw-orange transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <LinkIcon size={14} /> LINK
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </AdminPageShell>
  );
}

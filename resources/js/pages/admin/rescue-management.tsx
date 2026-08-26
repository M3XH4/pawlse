import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AnimatePresence } from 'motion/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminCard } from '@/components/admin/card';
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
        <div className="overflow-x-auto">
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
                          <img
                            src={report.photos[0].path}
                            alt="pet"
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                          />
                        ) : (
                          <span className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400">🐾</span>
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

        {/* Pagination */}
        {reports.last_page > 1 && (
          <div className="flex justify-center items-center gap-1.5 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/20 dark:bg-slate-900/10">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-[#0B2340]/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] z-10 relative shadow-2xl border border-gray-100 dark:border-slate-800">
              <button 
                onClick={() => setSelectedReport(null)}
                className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-slate-800 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="p-8 md:p-10">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border tracking-wider ${getStatusStyle(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                  {getTypeBadge(selectedReport.type)}
                  <span className="text-gray-400 font-bold text-xs">Report Reference ID: #{selectedReport.id}</span>
                </div>

                <h3 className="font-fredoka text-3xl font-bold text-[#0B2340] dark:text-white mb-6">
                  {selectedReport.name ? `Animal: ${selectedReport.name}` : `Stray Report #${selectedReport.id}`}
                </h3>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Left Column: Details */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-slate-800/40 p-6 rounded-2xl space-y-4">
                      <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest leading-none mb-1">Report Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs font-bold text-paw-navy dark:text-gray-300">
                        <div>
                          <p className="text-gray-400 font-semibold mb-0.5">Animal Type</p>
                          <p className="text-sm font-black">{selectedReport.animal_type}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-semibold mb-0.5">Breed</p>
                          <p className="text-sm font-black">{selectedReport.breed || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-semibold mb-0.5">Age Category</p>
                          <p className="text-sm font-black">{selectedReport.age_category || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-semibold mb-0.5">Gender</p>
                          <p className="text-sm font-black">{selectedReport.gender || 'N/A'}</p>
                        </div>
                        {selectedReport.color && (
                          <div>
                            <p className="text-gray-400 font-semibold mb-0.5">Color / Markings</p>
                            <p className="text-sm font-black">{selectedReport.color}</p>
                          </div>
                        )}
                        {selectedReport.urgency && (
                          <div>
                            <p className="text-gray-400 font-semibold mb-0.5">Urgency Level</p>
                            <p className={`text-sm font-black uppercase ${
                              selectedReport.urgency === 'high' ? 'text-red-500' :
                              selectedReport.urgency === 'medium' ? 'text-amber-500' : 'text-green-500'
                            }`}>{selectedReport.urgency}</p>
                          </div>
                        )}
                      </div>

                      <hr className="border-gray-100 dark:border-slate-800" />

                      <div className="space-y-2 text-xs font-bold text-paw-navy dark:text-gray-300">
                        <div className="flex gap-2 items-start">
                          <MapPin size={16} className="text-paw-orange shrink-0 mt-0.5" />
                          <div>
                            <p className="text-gray-400 font-semibold leading-none mb-1">Incident Location</p>
                            <p className="text-sm font-black leading-tight">{selectedReport.location}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-start">
                          <Calendar size={16} className="text-paw-orange shrink-0 mt-0.5" />
                          <div>
                            <p className="text-gray-400 font-semibold leading-none mb-1">Date Submitted</p>
                            <p className="text-sm font-black leading-tight">
                              {new Date(selectedReport.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-800/40 p-6 rounded-2xl space-y-3">
                      <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest leading-none mb-1">Description / Notes</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-bold leading-relaxed whitespace-pre-wrap">
                        {selectedReport.description || 'No additional details provided.'}
                      </p>
                    </div>

                    {/* Photos list */}
                    {selectedReport.photos && selectedReport.photos.length > 0 && (
                      <div>
                        <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-3 block">Attached Photos ({selectedReport.photos.length})</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedReport.photos.map((photo) => (
                            <a
                              key={photo.id}
                              href={photo.path}
                              target="_blank"
                              rel="noreferrer"
                              className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-gray-50 flex items-center justify-center hover:opacity-80 transition-opacity"
                              title="Click to view full size"
                            >
                              <img src={photo.path} alt="Incident attachment" className="w-full h-full object-cover" />
                              <span className="absolute bottom-2 right-2 bg-black/60 p-1 rounded text-white text-[9px]"><Eye size={8} /></span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions / Updates */}
                  <div className="space-y-6">
                    {/* Reporter Info Panel */}
                    <div className="bg-gray-50 dark:bg-slate-800/40 p-6 rounded-2xl space-y-4">
                      <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest leading-none mb-1">Reporter Contact Information</h4>
                      <div className="space-y-3 text-xs font-bold text-paw-navy dark:text-gray-300">
                        <p>Name: <strong className="text-paw-orange">{selectedReport.contact_name || 'Anonymous'}</strong></p>
                        <p className="flex items-center gap-1.5">
                          <Phone size={14} className="text-gray-400" />
                          <span>{selectedReport.contact_phone || 'N/A'}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Mail size={14} className="text-gray-400" />
                          <span>{selectedReport.contact_email || 'N/A'}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-semibold">
                          Reporter Account status: {selectedReport.user_id ? 'Authenticated Account Holder' : 'Unauthenticated Guest'}
                        </p>
                      </div>
                    </div>

                    {/* Status Update Form */}
                    <form onSubmit={handleStatusSubmit} className="bg-gray-50 dark:bg-slate-800/40 p-6 rounded-2xl space-y-4">
                      <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest leading-none mb-1">Update Status</h4>
                      <div className="flex gap-2">
                        <select
                          value={updateStatusVal}
                          onChange={(e) => setUpdateStatusVal(e.target.value)}
                          className="flex-1 p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl outline-none font-bold text-xs text-paw-navy dark:text-white"
                        >
                          <option value="pending">Pending Review</option>
                          <option value="assigned">Assigned</option>
                          <option value="resolved">Resolved</option>
                          <option value="duplicate">Duplicate</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          type="submit"
                          className="bg-paw-navy text-white px-4 rounded-xl font-bold text-xs hover:bg-paw-orange transition-all flex items-center gap-1"
                        >
                          <Check size={14} /> UPDATE
                        </button>
                      </div>
                    </form>

                    {/* Volunteer Assignment Form */}
                    <form onSubmit={handleAssignSubmit} className="bg-gray-50 dark:bg-slate-800/40 p-6 rounded-2xl space-y-4">
                      <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest leading-none mb-1">Assign Responder Volunteer</h4>
                      {selectedReport.assigned_volunteer ? (
                        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900 text-xs font-bold text-blue-700 dark:text-blue-300">
                          <p>Currently assigned: <strong>{selectedReport.assigned_volunteer.name}</strong> ({selectedReport.assigned_volunteer.email})</p>
                        </div>
                      ) : (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-bold italic">No volunteer responder assigned yet.</p>
                      )}
                      
                      <div className="flex gap-2">
                        <select
                          required
                          value={assignVolunteerId}
                          onChange={(e) => setAssignVolunteerId(e.target.value)}
                          className="flex-1 p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl outline-none font-bold text-xs text-paw-navy dark:text-white"
                        >
                          <option value="">Select volunteer...</option>
                          {volunteers.map((vol) => (
                            <option key={vol.id} value={vol.id}>{vol.name} ({vol.email})</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="bg-paw-orange text-white px-4 rounded-xl font-bold text-xs hover:bg-orange-600 transition-all flex items-center gap-1 shadow-md shadow-paw-orange/20"
                        >
                          <User size={14} /> ASSIGN
                        </button>
                      </div>
                    </form>

                    {/* Duplicates Linking Panel */}
                    <div className="bg-gray-50 dark:bg-slate-800/40 p-6 rounded-2xl space-y-4">
                      <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest leading-none mb-1">Duplicate Management</h4>
                      {selectedReport.is_duplicate ? (
                        <div className="space-y-3">
                          <div className="bg-red-50/60 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900 text-xs font-bold text-red-700 dark:text-red-300">
                            <p className="flex items-center gap-1.5"><ShieldAlert size={14} /> Potential Duplicate Report</p>
                            {selectedReport.duplicate_of_id && (
                              <p className="mt-1 text-[10px] text-red-500 font-black">
                                Duplicate of Report ID: #{selectedReport.duplicate_of_id}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={handleMarkNotDuplicate}
                            className="w-full bg-white dark:bg-slate-800 hover:bg-gray-100 border border-gray-200 dark:border-slate-700 text-paw-navy dark:text-gray-300 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <X size={14} className="text-red-500" /> Remove Duplicate Flag
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleDuplicateLink} className="space-y-3">
                          <p className="text-xs text-gray-400 font-bold">Link this report manually to another active report if it is a duplicate:</p>
                          <div className="flex gap-2">
                            <select
                              required
                              value={linkDuplicateOfId}
                              onChange={(e) => setLinkDuplicateOfId(e.target.value)}
                              className="flex-1 p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl outline-none font-bold text-xs text-paw-navy dark:text-white"
                            >
                              <option value="">Select original report...</option>
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
                              className="bg-paw-navy text-white px-4 rounded-xl font-bold text-xs hover:bg-paw-orange transition-all flex items-center gap-1"
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

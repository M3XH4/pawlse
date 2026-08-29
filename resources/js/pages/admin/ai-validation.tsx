import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence } from 'motion/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminCard } from '@/components/admin/card';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { formatPhotoUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  Search, Filter, CheckCircle2, Clock, XCircle, AlertCircle, 
  MapPin, Calendar, Camera, Info, Sparkles, Eye, Check, X,
  ArrowRight, ShieldAlert, Cpu
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

interface AiPredictionLog {
  id: number;
  feature: string;
  input_data: any;
  output_data: any;
  confidence: number | null;
  is_accurate: boolean | null;
  created_at: string;
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
  ai_prediction_log_id: number | null;
  ai_validation_status: 'pending' | 'approved' | 'rejected' | null;
  ai_prediction_log?: AiPredictionLog | null;
  user?: UserModel | null;
  created_at: string;
  photos?: PetReportPhoto[];
}

interface AiValidationProps {
  reports: PaginatedData<PetReport>;
  stats: {
    total_ai_reports: number;
    pending_validation: number;
    accuracy_rate: number;
    average_confidence: number;
  };
  filters: {
    search: string;
    status: string;
    animal_type: string;
    confidence_level: string;
    type: string;
  };
}

export default function AiValidation({
  reports,
  stats,
  filters
}: AiValidationProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'pending');
  const [animalTypeFilter, setAnimalTypeFilter] = useState(filters.animal_type || 'All');
  const [confidenceFilter, setConfidenceFilter] = useState(filters.confidence_level || 'All');
  const [typeFilter, setTypeFilter] = useState(filters.type || 'All');

  // Detail Modal State
  const [selectedReport, setSelectedReport] = useState<PetReport | null>(null);
  
  // Correction Form States
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctAnimalType, setCorrectAnimalType] = useState('Dog');
  const [correctBreed, setCorrectBreed] = useState('');
  const [correctAgeCategory, setCorrectAgeCategory] = useState('');
  const [correctGender, setCorrectGender] = useState('');
  const [correctName, setCorrectName] = useState('');

  const handleFilterSearch = () => {
    router.get('/account/admin/ai-validation', {
      search: searchQuery,
      status: statusFilter,
      animal_type: animalTypeFilter,
      confidence_level: confidenceFilter,
      type: typeFilter
    }, { preserveState: true });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('pending');
    setAnimalTypeFilter('All');
    setConfidenceFilter('All');
    setTypeFilter('All');
    router.get('/account/admin/ai-validation', { status: 'pending' }, { preserveState: true });
  };

  const openValidationModal = (report: PetReport) => {
    setSelectedReport(report);
    setIsCorrecting(false);
    
    // Prefill correction form with current report details
    setCorrectAnimalType(report.animal_type || 'Dog');
    setCorrectBreed(report.breed || '');
    setCorrectAgeCategory(report.age_category || '');
    setCorrectGender(report.gender || '');
    setCorrectName(report.name || '');
  };

  const handleApprove = () => {
    if (!selectedReport) return;

    router.post(`/account/admin/ai-validation/${selectedReport.id}/approve`, {}, {
      onSuccess: () => {
        toast.success('AI prediction approved and validated!');
        setSelectedReport(null);
      },
      onError: () => {
        toast.error('Failed to approve AI details.');
      }
    });
  };

  const handleRejectAndCorrect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    const payload = isCorrecting ? {
      animal_type: correctAnimalType,
      breed: correctBreed,
      age_category: correctAgeCategory,
      gender: correctGender,
      name: correctName
    } : {};

    router.post(`/account/admin/ai-validation/${selectedReport.id}/reject`, payload, {
      onSuccess: () => {
        toast.warning(isCorrecting ? 'AI details rejected and corrected!' : 'AI details flagged as incorrect!');
        setSelectedReport(null);
      },
      onError: () => {
        toast.error('Failed to reject AI details.');
      }
    });
  };

  const getConfidenceLevelBadge = (confidence: number | null) => {
    if (confidence === null) return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-500">N/A</span>;
    
    const pct = Math.round(confidence * 100);
    if (pct >= 80) {
      return (
        <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/50">
          High ({pct}%)
        </span>
      );
    } else if (pct >= 50) {
      return (
        <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50">
          Medium ({pct}%)
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50">
          Low ({pct}%)
        </span>
      );
    }
  };

  const getValidationStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle size={12} /> Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse">
            <Clock size={12} /> Pending Review
          </span>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'rescue':
        return <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Rescue</span>;
      case 'missing':
        return <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Missing</span>;
      case 'sos':
        return <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse">SOS</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-gray-100 text-gray-800">{type}</span>;
    }
  };

  return (
    <AdminPageShell 
      title="AI Validation Panel"
      description="Review and validate AI-assisted stray animal reports, verify pet detail accuracy, and calibrate machine learning logs."
    >
      <Head title="AI Validation Panel" />
      
      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total AI Reports', val: stats.total_ai_reports, icon: <Cpu size={20} />, bg: 'bg-[#0B2340] text-white shadow-lg' },
          { label: 'Awaiting Validation', val: stats.pending_validation, icon: <Clock size={20} />, bg: 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' },
          { label: 'Accuracy Rating', val: `${stats.accuracy_rate}%`, icon: <CheckCircle2 size={20} />, bg: 'bg-green-500 text-white shadow-lg shadow-green-500/20' },
          { label: 'Avg Confidence', val: `${stats.average_confidence}%`, icon: <Sparkles size={20} />, bg: 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' },
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
          <div className="md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilterSearch()}
                placeholder="Search location, name, breed..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl outline-none focus:border-paw-orange font-bold text-sm text-[#0B2340] dark:text-white"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Validation Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm text-[#0B2340] dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending Validation</option>
              <option value="approved">Approved / Verified</option>
              <option value="rejected">Rejected / Incorrect</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Confidence Level</label>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm text-[#0B2340] dark:text-white"
            >
              <option value="All">All Confidences</option>
              <option value="High">High (&ge;80%)</option>
              <option value="Medium">Medium (50%-79%)</option>
              <option value="Low">Low (&lt;50%)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Report Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm text-[#0B2340] dark:text-white"
            >
              <option value="All">All Types</option>
              <option value="rescue">Rescue</option>
              <option value="missing">Missing</option>
              <option value="sos">SOS</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFilterSearch}
              className="flex-1 bg-[#0B2340] hover:bg-[#0f325c] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold text-sm p-3 rounded-xl transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </AdminCard>

      {/* Reports Queue Table */}
      <AdminCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">ID</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Pet Report</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Type</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">AI Confidence</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Location</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Validation</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Submitted At</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 dark:text-gray-500 font-bold">
                    No reports match the current filters.
                  </td>
                </tr>
              ) : (
                reports.data.map((report) => (
                  <tr 
                    key={report.id}
                    className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50/40 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="p-4 font-bold text-xs text-[#0B2340] dark:text-white">#{report.id}</td>
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
                          <p className="text-[10px] text-gray-400">{report.animal_type} &middot; {report.breed || 'Unknown Breed'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">{getTypeBadge(report.type)}</td>
                    <td className="p-4 whitespace-nowrap">
                      {getConfidenceLevelBadge(report.ai_prediction_log?.confidence)}
                    </td>
                    <td className="p-4 max-w-[200px] truncate" title={report.location}>
                      {report.location}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {getValidationStatusBadge(report.ai_validation_status)}
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs text-gray-400 font-bold">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openValidationModal(report)}
                        className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0B2340] dark:text-white font-bold text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye size={12} /> Review
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
                      : 'bg-white dark:bg-slate-800 text-[#0B2340] dark:text-gray-300 hover:bg-gray-50 border border-gray-100 dark:border-slate-800'
                  } ${!link.url ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  dangerouslySetInnerHTML={{ __html: label }}
                />
              );
            })}
          </div>
        )}
      </AdminCard>

      {/* Review & Validation Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111827] rounded-[24px] max-w-4xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase bg-[#0B2340] text-white px-2 py-0.5 rounded-md">AI Verification</span>
                    <span className="text-xs text-gray-400 font-bold">Report #{selectedReport.id}</span>
                  </div>
                  <h3 className="text-xl font-fredoka font-bold text-[#0B2340] dark:text-white">Verify Animal Prediction Details</h3>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="grid md:grid-cols-2 gap-0 division-x divide-gray-100 dark:divide-slate-800">
                
                {/* Left Side: Photo & Information */}
                <div className="p-6 flex flex-col gap-4">
                  <div className="w-full h-64 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-gray-50 flex items-center justify-center relative">
                    {selectedReport.photos && selectedReport.photos.length > 0 ? (
                      <ImageWithFallback 
                        src={formatPhotoUrl(selectedReport.photos[0].path, selectedReport.animal_type)} 
                        alt="Submitted stray animal" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 gap-2">
                        <Camera size={40} />
                        <span className="font-bold text-sm">No photo available</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      {getTypeBadge(selectedReport.type)}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 flex flex-col gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#0B2340] dark:text-blue-400 shrink-0" />
                      <span className="font-bold text-[#0B2340] dark:text-white shrink-0">Location:</span>
                      <span className="truncate">{selectedReport.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#0B2340] dark:text-blue-400 shrink-0" />
                      <span className="font-bold text-[#0B2340] dark:text-white shrink-0">Submitted On:</span>
                      <span>{new Date(selectedReport.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info size={14} className="text-[#0B2340] dark:text-blue-400 shrink-0" />
                      <span className="font-bold text-[#0B2340] dark:text-white shrink-0">Contact Person:</span>
                      <span>{selectedReport.contact_name || 'Anonymous'} ({selectedReport.contact_phone || 'No phone'})</span>
                    </div>
                    {selectedReport.description && (
                      <div className="pt-2 border-t border-gray-100 dark:border-slate-800 mt-1">
                        <span className="font-bold text-[#0B2340] dark:text-white block mb-1">Description:</span>
                        <p className="italic bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-gray-100 dark:border-slate-800 text-gray-500 leading-normal max-h-24 overflow-y-auto">
                          "{selectedReport.description}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Prediction Details & Correction Form */}
                <div className="p-6 flex flex-col gap-5 border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-800 max-h-[500px] overflow-y-auto">
                  
                  {/* Confidence metrics */}
                  {selectedReport.ai_prediction_log && (
                    <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex items-center gap-3">
                      <Sparkles size={24} className="text-blue-500 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-blue-900 dark:text-blue-300">AI Confidence:</span>
                          {getConfidenceLevelBadge(selectedReport.ai_prediction_log.confidence)}
                        </div>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                          {selectedReport.ai_prediction_log.confidence && selectedReport.ai_prediction_log.confidence >= 0.80 
                            ? 'High confidence prediction. AI suggests details are highly likely to be correct.' 
                            : 'Moderate to low confidence. Manual details verification is highly recommended.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Side-by-side details table */}
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Details Comparison</h4>
                    <div className="border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-4 bg-gray-50 dark:bg-slate-900/60 p-2.5 font-black text-gray-400 border-b border-gray-100 dark:border-slate-800">
                        <span>Property</span>
                        <span className="col-span-2">AI Suggestion</span>
                        <span>User Submitted</span>
                      </div>
                      
                      {[
                        { 
                          prop: 'Species', 
                          ai: selectedReport.ai_prediction_log?.output_data?.species 
                            ? (selectedReport.ai_prediction_log.output_data.species === 'dog' ? 'Dog' : 'Cat') 
                            : 'N/A', 
                          usr: selectedReport.animal_type 
                        },
                        { 
                          prop: 'Breed', 
                          ai: selectedReport.ai_prediction_log?.output_data?.breed || 'N/A', 
                          usr: selectedReport.breed || 'Unknown' 
                        },
                        { 
                          prop: 'Age Category', 
                          ai: selectedReport.ai_prediction_log?.output_data?.age_group || 'N/A', 
                          usr: selectedReport.age_category || 'Unknown' 
                        },
                        { 
                          prop: 'Gender', 
                          ai: selectedReport.ai_prediction_log?.output_data?.gender || 'N/A', 
                          usr: selectedReport.gender || 'Unknown' 
                        },
                        { 
                          prop: 'Suggested Name', 
                          ai: (Array.isArray(selectedReport.ai_prediction_log?.output_data?.neutral_names) 
                            ? selectedReport.ai_prediction_log.output_data.neutral_names[0] 
                            : selectedReport.ai_prediction_log?.output_data?.neutral_names || selectedReport.ai_prediction_log?.output_data?.suggested_name) || 'N/A', 
                          usr: selectedReport.name || 'Unnamed' 
                        },
                      ].map((item, idx) => {
                        const isMatch = item.ai.toString().toLowerCase() === item.usr.toString().toLowerCase() 
                          || (item.ai === 'N/A')
                          || (item.prop === 'Suggested Name' && !selectedReport.name);
                        
                        return (
                          <div key={idx} className="grid grid-cols-4 p-2.5 border-b border-gray-100 dark:border-slate-800/80 items-center last:border-b-0">
                            <span className="font-bold text-gray-400">{item.prop}</span>
                            <span className="col-span-2 font-bold text-[#0B2340] dark:text-blue-300 italic">{item.ai}</span>
                            <span className={`font-black ${isMatch ? 'text-green-600' : 'text-amber-600'}`}>{item.usr}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions & Form */}
                  {selectedReport.ai_validation_status === 'pending' ? (
                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-4">
                      
                      {/* Approve Details Action */}
                      {!isCorrecting && (
                        <div className="flex gap-2">
                          <button
                            onClick={handleApprove}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-green-500/10 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 size={16} /> Approve AI Details
                          </button>
                          
                          <button
                            onClick={() => setIsCorrecting(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors cursor-pointer"
                          >
                            <ShieldAlert size={16} /> Flag / Correct Details
                          </button>
                        </div>
                      )}

                      {/* Correct Details Form */}
                      {isCorrecting && (
                        <form onSubmit={handleRejectAndCorrect} className="flex flex-col gap-4">
                          <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200/50 p-4 rounded-2xl">
                            <h5 className="font-fredoka font-bold text-amber-800 dark:text-amber-400 text-sm mb-3 flex items-center gap-1.5">
                              <ShieldAlert size={16} /> Flag AI details as incorrect & apply correction
                            </h5>
                            
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <label className="font-bold text-gray-400 mb-1 block">Species / Animal Type</label>
                                <select
                                  value={correctAnimalType}
                                  onChange={(e) => setCorrectAnimalType(e.target.value)}
                                  className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg outline-none font-bold"
                                >
                                  <option value="Dog">Dog</option>
                                  <option value="Cat">Cat</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="font-bold text-gray-400 mb-1 block">Name</label>
                                <input
                                  type="text"
                                  value={correctName}
                                  onChange={(e) => setCorrectName(e.target.value)}
                                  className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg outline-none font-bold"
                                  placeholder="e.g. Buddy"
                                />
                              </div>

                              <div className="col-span-2">
                                <label className="font-bold text-gray-400 mb-1 block">Breed</label>
                                <input
                                  type="text"
                                  value={correctBreed}
                                  onChange={(e) => setCorrectBreed(e.target.value)}
                                  className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg outline-none font-bold"
                                  placeholder="e.g. Golden Retriever"
                                />
                              </div>

                              <div>
                                <label className="font-bold text-gray-400 mb-1 block">Age Category</label>
                                <input
                                  type="text"
                                  value={correctAgeCategory}
                                  onChange={(e) => setCorrectAgeCategory(e.target.value)}
                                  className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg outline-none font-bold"
                                  placeholder="e.g. Adult"
                                />
                              </div>

                              <div>
                                <label className="font-bold text-gray-400 mb-1 block">Gender</label>
                                <input
                                  type="text"
                                  value={correctGender}
                                  onChange={(e) => setCorrectGender(e.target.value)}
                                  className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg outline-none font-bold"
                                  placeholder="e.g. Male"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              Reject & Save Correction
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectAndCorrect({ preventDefault: () => {} } as any)}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Flag prediction as incorrect without correcting details"
                            >
                              Reject Only
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsCorrecting(false)}
                              className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-300 font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2 justify-center text-xs font-bold text-gray-400">
                      <span>This report has already been validated:</span>
                      {getValidationStatusBadge(selectedReport.ai_validation_status)}
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>
    </AdminPageShell>
  );
}

import React, { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartHandshake,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  FileText,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Eye,
  MapPin,
  Tag,
  Share2,
  Camera,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { AdminCard } from '@/components/admin/card';

export interface RehomingRequestData {
  id: number;
  full_name: string;
  contact_number: string;
  email: string;
  animal_name: string;
  species: string;
  breed?: string | null;
  gender: string;
  age?: string | null;
  current_location: string;
  reason: string;
  health_notes?: string | null;
  description?: string | null;
  photo_url?: string | null;
  status: 'pending' | 'reviewed' | 'posted' | 'shelter_intake' | 'home_found' | 'declined';
  admin_notes?: string | null;
  reviewed_by_name?: string | null;
  created_at: string;
}

interface RehomingTabProps {
  rehomingRequests?: RehomingRequestData[];
}

export function RehomingTab({ rehomingRequests = [] }: RehomingTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState<RehomingRequestData | null>(null);
  const [enlargedPhotoUrl, setEnlargedPhotoUrl] = useState<string | null>(null);

  const { data, setData, post, processing, reset } = useForm({
    status: 'reviewed' as 'pending' | 'reviewed' | 'posted' | 'shelter_intake' | 'home_found' | 'declined',
    admin_notes: '',
  });

  const openReviewModal = (item: RehomingRequestData) => {
    setSelectedRequest(item);
    setData({
      status: item.status,
      admin_notes: item.admin_notes || '',
    });
  };

  const [isIntaking, setIsIntaking] = useState(false);

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    post(`/account/admin/adoption-management/rehoming-requests/${selectedRequest.id}/status`, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedRequest(null);
        reset();
      },
      onError: (errs) => {
        toast.error(Object.values(errs)[0] || 'Failed to update request.');
      },
    });
  };

  const handleIntakeSubmit = () => {
    if (!selectedRequest) return;
    if (!confirm(`Are you sure you want to admit ${selectedRequest.animal_name} into shelter master records as an available adoptable pet?`)) return;

    setIsIntaking(true);
    router.post(
      `/account/admin/adoption-management/rehoming-requests/${selectedRequest.id}/intake`,
      { intake_notes: data.admin_notes },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedRequest(null);
          reset();
        },
        onError: (errs) => {
          toast.error(Object.values(errs)[0] || 'Failed to intake pet to shelter.');
        },
        onFinish: () => {
          setIsIntaking(false);
        },
      }
    );
  };

  const filteredRequests = useMemo(() => {
    return rehomingRequests.filter((item) => {
      const matchesSearch =
        item.animal_name.toLowerCase().includes(search.toLowerCase()) ||
        item.full_name.toLowerCase().includes(search.toLowerCase()) ||
        item.current_location.toLowerCase().includes(search.toLowerCase()) ||
        item.reason.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [rehomingRequests, search, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
            Reviewed
          </span>
        );
      case 'posted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 flex items-center gap-1">
            <Share2 size={11} /> Cross-Posted to Socials
          </span>
        );
      case 'shelter_intake':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 flex items-center gap-1">
            <Sparkles size={11} /> Admitted to Shelter
          </span>
        );
      case 'home_found':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 size={11} /> Home Found
          </span>
        );
      case 'declined':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 flex items-center gap-1">
            <XCircle size={11} /> Declined
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Informational Banner */}
      <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 rounded-3xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <HeartHandshake size={20} />
        </div>
        <div className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed font-medium">
          <p className="font-black text-sm text-blue-900 dark:text-blue-100 mb-0.5">
            Important Notice: Rehoming is Not ISF Shelter Custody
          </p>
          <p>
            These animals are currently cared for by the requester and are not under ISF shelter care. ISF assists by vetting adoption leads, providing social sharing, and coordinating directly with caretakers.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Total Requests</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-paw-navy dark:text-white">{rehomingRequests.length}</h3>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HeartHandshake size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Rehoming cases received</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Pending Review</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {rehomingRequests.filter((r) => r.status === 'pending').length}
            </h3>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Requiring assessment</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Cross-Posted</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {rehomingRequests.filter((r) => r.status === 'posted').length}
            </h3>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Share2 size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Shared to ISF socials</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Shelter Intakes</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
              {rehomingRequests.filter((r) => r.status === 'shelter_intake').length}
            </h3>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Transferred to shelter care</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Homes Found</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {rehomingRequests.filter((r) => r.status === 'home_found').length}
            </h3>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Directly rehomed</p>
        </div>
      </div>

      <AdminCard>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-fredoka text-xl font-bold text-paw-navy dark:text-white">
              Rehoming Assistance Queue
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Review animal submissions, inspect photos, and manage rehoming assistance statuses.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text"
              placeholder="Search by animal name, caretaker, location, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange outline-none rounded-2xl font-bold text-xs text-paw-navy dark:text-white transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange outline-none rounded-2xl font-bold text-xs text-gray-900 dark:text-white"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="posted">Cross-Posted to Socials</option>
            <option value="shelter_intake">Admitted to Shelter</option>
            <option value="home_found">Home Found</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {/* List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <AlertTriangle className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={44} />
            <p className="font-bold text-sm">No rehoming requests found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRequests.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Badge */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-4 group">
                    {item.photo_url ? (
                      <>
                        <img
                          src={item.photo_url}
                          alt={item.animal_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          type="button"
                          onClick={() => setEnlargedPhotoUrl(item.photo_url || null)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-bold"
                        >
                          <Eye size={16} /> Enlarge Photo
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <Camera size={32} />
                        <span className="text-[10px] font-bold mt-1 text-gray-400">No Photo Uploaded</span>
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5">{getStatusBadge(item.status)}</div>
                  </div>

                  {/* Animal Info */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-black text-paw-navy dark:text-white text-lg">
                        {item.animal_name}
                      </h4>
                      <p className="text-xs text-gray-400 font-bold">
                        {item.species} {item.breed ? `• ${item.breed}` : ''} ({item.gender || 'Unknown'})
                      </p>
                    </div>
                    {item.age && (
                      <span className="text-[10px] font-black bg-paw-bg dark:bg-gray-700 px-2.5 py-1 rounded-full text-paw-navy dark:text-white">
                        {item.age}
                      </span>
                    )}
                  </div>

                  {/* Location & Reason */}
                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-4">
                    <p className="flex items-center gap-1.5 font-bold text-gray-500 dark:text-gray-400">
                      <MapPin size={13} className="text-paw-orange shrink-0" />
                      <span>{item.current_location}</span>
                    </p>
                    <p className="font-bold text-paw-navy dark:text-white">
                      Reason: <span className="font-medium text-gray-600 dark:text-gray-300">{item.reason}</span>
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-gray-500 line-clamp-2 italic">
                        &quot;{item.description}&quot;
                      </p>
                    )}
                  </div>

                  {/* Caretaker info */}
                  <div className="bg-paw-bg/60 dark:bg-gray-900/40 p-3 rounded-2xl text-[11px] space-y-0.5 border border-gray-100 dark:border-gray-800">
                    <p className="font-black text-paw-navy dark:text-white">Caretaker: {item.full_name}</p>
                    <p className="text-gray-500">{item.contact_number} • {item.email}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold">
                    Filed: {item.created_at.split(' ')[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() => openReviewModal(item)}
                    className="px-4 py-2 bg-paw-navy hover:bg-[#1a385c] text-white rounded-xl font-black text-xs transition-colors cursor-pointer"
                  >
                    Review Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-gray-900 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[32px] p-6 sm:p-8 z-10 relative shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
                <div>
                  <h3 className="text-xl font-black text-paw-navy dark:text-white">
                    Review Rehoming Request
                  </h3>
                  <p className="text-xs text-gray-400 font-bold">
                    For {selectedRequest.animal_name} ({selectedRequest.species})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 text-gray-400 hover:text-paw-navy rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Photo preview in modal */}
              {selectedRequest.photo_url && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100 max-h-56 bg-black">
                  <img
                    src={selectedRequest.photo_url}
                    alt={selectedRequest.animal_name}
                    className="w-full h-full object-contain mx-auto"
                  />
                </div>
              )}

              {/* Animal & Requester Detail Recap */}
              <div className="bg-paw-bg/60 dark:bg-gray-800/40 p-4 rounded-2xl mb-6 space-y-2 text-xs border border-gray-100 dark:border-gray-700">
                <p><strong>Caretaker:</strong> {selectedRequest.full_name} ({selectedRequest.contact_number} • {selectedRequest.email})</p>
                <p><strong>Location:</strong> {selectedRequest.current_location}</p>
                <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                {selectedRequest.health_notes && (
                  <p><strong>Health & Vaccines:</strong> {selectedRequest.health_notes}</p>
                )}
                {selectedRequest.description && (
                  <p><strong>Description:</strong> {selectedRequest.description}</p>
                )}
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                    Assistance Status <span className="text-paw-orange">*</span>
                  </label>
                  <select
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-paw-navy dark:text-white font-bold text-sm outline-none focus:border-paw-orange"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="reviewed">Reviewed (Awaiting Coordination)</option>
                    <option value="posted">Cross-Posted to Socials</option>
                    <option value="shelter_intake">Admitted to Shelter (Intake)</option>
                    <option value="home_found">Home Found (Successfully Rehomed)</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                    Staff Notes / Coordination Log
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Created Facebook post on 10/16, forwarded 2 potential adopter inquiries to caretaker..."
                    value={data.admin_notes}
                    onChange={(e) => setData('admin_notes', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-paw-navy dark:text-white font-bold text-sm outline-none focus:border-paw-orange resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    {selectedRequest.status === 'shelter_intake' ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-black">
                        <Sparkles size={14} /> Already Admitted to Shelter
                      </span>
                    ) : !['home_found', 'declined'].includes(selectedRequest.status) ? (
                      <button
                        type="button"
                        disabled={isIntaking || processing}
                        onClick={handleIntakeSubmit}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                        title="Directly create an Animal Master Record for this pet and mark intake completed"
                      >
                        {isIntaking ? (
                          <Spinner showProgress label="Admitting..." />
                        ) : (
                          <>
                            <Sparkles size={15} /> Admit to Shelter
                          </>
                        )}
                      </button>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(null)}
                      className="px-5 py-3 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={processing}
                      className="px-6 py-3 bg-[#FF9B00] hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {processing ? (
                        <Spinner showProgress label="Saving..." />
                      ) : (
                        'Save Status Update'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enlarged Photo Modal */}
      <AnimatePresence>
        {enlargedPhotoUrl && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEnlargedPhotoUrl(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl bg-black"
            >
              <button
                onClick={() => setEnlargedPhotoUrl(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:bg-black/80 rounded-full z-20"
              >
                <X size={20} />
              </button>
              <img
                src={enlargedPhotoUrl}
                alt="Enlarged animal preview"
                className="w-full h-auto max-h-[80vh] object-contain mx-auto"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

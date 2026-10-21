import React, { useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Calendar,
  Clock,
  Users,
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
  Heart,
  ChevronRight,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { AdminCard } from '@/components/admin/card';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { formatPhotoUrl } from '@/lib/utils';

export interface ShelterVisitSettings {
  max_visitors_per_slot: number;
  max_visitors_per_booking: number;
  closed_days: string[];
  blackout_dates: string[];
  is_accepting_visits: boolean;
}

export interface ShelterVisitData {
  id: number;
  full_name: string;
  contact_number: string;
  email?: string | null;
  preferred_date: string;
  preferred_time_slot?: string | null;
  number_of_visitors: number;
  purpose: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  confirmed_date?: string | null;
  confirmed_time_slot?: string | null;
  additional_notes?: string | null;
  admin_notes?: string | null;
  confirmed_by_name?: string | null;
  pet?: {
    id: number;
    name: string;
    photo_url?: string | null;
  } | null;
  created_at: string;
}

interface ShelterVisitsTabProps {
  visits?: ShelterVisitData[];
  settings?: ShelterVisitSettings;
}

export function ShelterVisitsTab({ visits = [], settings }: ShelterVisitsTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedVisit, setSelectedVisit] = useState<ShelterVisitData | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [newBlackoutDate, setNewBlackoutDate] = useState('');

  const {
    data: configData,
    setData: setConfigData,
    post: postConfig,
    processing: configProcessing,
  } = useForm({
    max_visitors_per_slot: settings?.max_visitors_per_slot ?? 10,
    max_visitors_per_booking: settings?.max_visitors_per_booking ?? 10,
    closed_days: settings?.closed_days ?? ['Sunday'],
    blackout_dates: settings?.blackout_dates ?? [],
    is_accepting_visits: settings?.is_accepting_visits ?? true,
  });

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    postConfig('/account/admin/adoption-management/shelter-visits/settings', {
      preserveScroll: true,
      onSuccess: () => {
        setIsConfigOpen(false);
      },
      onError: (errs) => {
        toast.error(Object.values(errs)[0] || 'Failed to update visit configuration.');
      },
    });
  };

  const { data, setData, post, processing, reset } = useForm({
    status: 'confirmed' as 'pending' | 'confirmed' | 'completed' | 'cancelled',
    confirmed_date: '',
    confirmed_time_slot: '',
    admin_notes: '',
  });

  const openManageModal = (visit: ShelterVisitData) => {
    setSelectedVisit(visit);
    setData({
      status: visit.status,
      confirmed_date: visit.confirmed_date || visit.preferred_date,
      confirmed_time_slot: visit.confirmed_time_slot || visit.preferred_time_slot || 'Morning (9:00 AM - 12:00 PM)',
      admin_notes: visit.admin_notes || '',
    });
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;

    post(`/account/admin/adoption-management/shelter-visits/${selectedVisit.id}/status`, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedVisit(null);
        reset();
      },
      onError: (errs) => {
        toast.error(Object.values(errs)[0] || 'Failed to update visit status.');
      },
    });
  };

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const matchesSearch =
        v.full_name.toLowerCase().includes(search.toLowerCase()) ||
        v.contact_number.toLowerCase().includes(search.toLowerCase()) ||
        (v.email && v.email.toLowerCase().includes(search.toLowerCase())) ||
        v.purpose.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || v.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [visits, search, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 flex items-center gap-1">
            <CheckCircle2 size={12} /> Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 flex items-center gap-1">
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">
            <Clock size={12} /> Pending ISF Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Total Requests</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-paw-navy dark:text-white">{visits.length}</h3>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-paw-orange flex items-center justify-center">
              <Building2 size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Shelter visits filed</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Pending Review</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {visits.filter((v) => v.status === 'pending').length}
            </h3>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Awaiting confirmation</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Confirmed Visits</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400">
              {visits.filter((v) => v.status === 'confirmed').length}
            </h3>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Confirmed appointments</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Completed Tours</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {visits.filter((v) => v.status === 'completed').length}
            </h3>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Successful visits</p>
        </div>
      </div>

      <AdminCard>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-fredoka text-xl font-bold text-paw-navy dark:text-white">
              Public Shelter Visits
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Review visitor appointment requests and confirm shelter scheduling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[11px] font-bold text-gray-600 dark:text-gray-300">
              <span className={`w-2 h-2 rounded-full ${configData.is_accepting_visits ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{configData.is_accepting_visits ? 'Accepting Visits' : 'Visits Paused'}</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span>Cap: {configData.max_visitors_per_slot}/slot</span>
            </div>

            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-paw-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm hover:shadow cursor-pointer active:scale-95"
            >
              <Settings2 size={15} />
              <span>Configure Capacity & Days</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text"
              placeholder="Search by visitor name, phone, purpose..."
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
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table / List */}
        {filteredVisits.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <AlertTriangle className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={44} />
            <p className="font-bold text-sm">No shelter visit requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] uppercase tracking-wider font-black text-gray-400">
                  <th className="py-3.5 px-4">Visitor</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4">Preferred Date</th>
                  <th className="py-3.5 px-4">Party Size</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((visit) => (
                  <tr
                    key={visit.id}
                    className="border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <p className="font-black text-paw-navy dark:text-white text-sm">
                        {visit.full_name}
                      </p>
                      <p className="text-xs text-gray-400 font-bold">
                        {visit.contact_number} {visit.email ? `• ${visit.email}` : ''}
                      </p>
                      {visit.pet && (
                        <p className="text-[10px] text-paw-orange font-black flex items-center gap-1 mt-1">
                          <Heart size={10} fill="currentColor" /> Interested in {visit.pet.name}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-paw-bg dark:bg-gray-700 text-paw-navy dark:text-white">
                        {visit.purpose}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-paw-orange" />
                        <span>{visit.confirmed_date || visit.preferred_date}</span>
                        {visit.confirmed_date && visit.confirmed_date !== visit.preferred_date && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-black">
                            Rescheduled
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        {visit.confirmed_time_slot || visit.preferred_time_slot || 'Any slot'}
                      </p>
                    </td>

                    <td className="py-4 px-4 text-xs font-bold text-paw-navy dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-paw-blue" />
                        <span>{visit.number_of_visitors} {visit.number_of_visitors === 1 ? 'visitor' : 'visitors'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">{getStatusBadge(visit.status)}</td>

                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openManageModal(visit)}
                        className="px-3.5 py-2 bg-paw-bg hover:bg-paw-orange hover:text-white text-paw-navy dark:bg-gray-700 dark:text-white dark:hover:bg-paw-orange rounded-xl text-xs font-black transition-colors cursor-pointer"
                      >
                        Review / Confirm
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Review & Manage Visit Modal */}
      <AnimatePresence>
        {selectedVisit && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVisit(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-gray-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[32px] p-6 sm:p-8 z-10 relative shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
                <div>
                  <h3 className="text-xl font-black text-paw-navy dark:text-white">
                    Manage Shelter Visit
                  </h3>
                  <p className="text-xs text-gray-400 font-bold">
                    Confirm scheduling & coordinate with visitor
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="p-2 text-gray-400 hover:text-paw-navy rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Visitor Details Recap */}
              <div className="bg-paw-bg/60 dark:bg-gray-800/40 p-4 rounded-2xl mb-6 space-y-2 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-paw-navy dark:text-white text-base">
                    {selectedVisit.full_name}
                  </h4>
                  <span className="text-xs font-bold text-paw-orange">
                    {selectedVisit.number_of_visitors} Visitors
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {selectedVisit.contact_number} • {selectedVisit.email || 'No email provided'}
                </p>
                <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
                  <p><strong>Purpose:</strong> {selectedVisit.purpose}</p>
                  <p><strong>Preferred:</strong> {selectedVisit.preferred_date} ({selectedVisit.preferred_time_slot || 'Any slot'})</p>
                  {selectedVisit.additional_notes && (
                    <p className="mt-1 italic text-gray-500">&quot;{selectedVisit.additional_notes}&quot;</p>
                  )}
                </div>
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-4">
                {/* Status select */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                    Update Visit Status <span className="text-paw-orange">*</span>
                  </label>
                  <select
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-paw-navy dark:text-white font-bold text-sm outline-none focus:border-paw-orange"
                  >
                    <option value="pending">Pending ISF Review</option>
                    <option value="confirmed">Confirmed Schedule</option>
                    <option value="completed">Visit Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Confirmed Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <ModernDatePicker
                      label="Confirmed Date"
                      value={data.confirmed_date}
                      onChange={(date) => setData('confirmed_date', date)}
                      placeholder="Select confirmed date..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                      Confirmed Time Slot
                    </label>
                    <select
                      value={data.confirmed_time_slot}
                      onChange={(e) => setData('confirmed_time_slot', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-paw-navy dark:text-white font-bold text-sm outline-none focus:border-paw-orange"
                    >
                      <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                      <option value="Late Afternoon (4:00 PM - 6:00 PM)">Late Afternoon (4:00 PM - 6:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                    Staff Notes / Communication Log
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Called visitor on 10/16, confirmed 3 visitors arriving at 10 AM, will tour kennel area..."
                    value={data.admin_notes}
                    onChange={(e) => setData('admin_notes', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-paw-navy dark:text-white font-bold text-sm outline-none focus:border-paw-orange resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedVisit(null)}
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
                      <Spinner showProgress label="Updating..." />
                    ) : (
                      'Save Schedule Update'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Configuration Modal */}
      <AnimatePresence>
        {isConfigOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfigOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full z-10 shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
            >
              <div className="flex justify-between items-center pb-4 mb-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-paw-orange flex items-center justify-center">
                    <Settings2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-fredoka text-lg font-bold text-paw-navy dark:text-white">
                      Shelter Visit Configuration
                    </h3>
                    <p className="text-xs text-gray-400">
                      Manage visitor capacity limits and operational schedules.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleConfigSubmit} className="space-y-5">
                {/* Accepting Visits Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <div>
                    <span className="block text-xs font-bold text-paw-navy dark:text-white">
                      Accepting Public Visits
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Turn off temporarily during veterinary emergencies or construction.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configData.is_accepting_visits}
                      onChange={(e) => setConfigData('is_accepting_visits', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Capacity Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                      Max Visitors Per Slot
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      value={configData.max_visitors_per_slot}
                      onChange={(e) => setConfigData('max_visitors_per_slot', parseInt(e.target.value) || 10)}
                      className="w-full px-4 py-2.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-paw-navy dark:text-white font-bold text-sm outline-none focus:border-paw-orange"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Sum of all bookings per slot</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                      Max Group Per Booking
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      required
                      value={configData.max_visitors_per_booking}
                      onChange={(e) => setConfigData('max_visitors_per_booking', parseInt(e.target.value) || 10)}
                      className="w-full px-4 py-2.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-paw-navy dark:text-white font-bold text-sm outline-none focus:border-paw-orange"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Limit for a single submission</span>
                  </div>
                </div>

                {/* Closed Days */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-2">
                    Closed Days to Public
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                      const isClosed = (configData.closed_days || []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const current = configData.closed_days || [];
                            if (isClosed) {
                              setConfigData('closed_days', current.filter((d) => d !== day));
                            } else {
                              setConfigData('closed_days', [...current, day]);
                            }
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                            isClosed
                              ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {day} {isClosed ? '(Closed)' : ''}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1.5 block">
                    Days highlighted in red are marked closed for public visits.
                  </span>
                </div>

                {/* Blackout / Holiday Dates */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-2">
                    Holiday / Event Blackout Dates
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newBlackoutDate}
                      onChange={(e) => setNewBlackoutDate(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-paw-navy dark:text-white font-bold text-xs outline-none focus:border-paw-orange"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newBlackoutDate) return;
                        const current = configData.blackout_dates || [];
                        if (!current.includes(newBlackoutDate)) {
                          setConfigData('blackout_dates', [...current, newBlackoutDate].sort());
                        }
                        setNewBlackoutDate('');
                      }}
                      className="px-4 py-2 rounded-xl bg-paw-orange hover:bg-orange-600 text-white font-black text-xs transition-colors cursor-pointer"
                    >
                      Add Date
                    </button>
                  </div>
                  {(configData.blackout_dates || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {(configData.blackout_dates || []).map((dateStr) => (
                        <span
                          key={dateStr}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold"
                        >
                          {dateStr}
                          <button
                            type="button"
                            onClick={() =>
                              setConfigData(
                                'blackout_dates',
                                (configData.blackout_dates || []).filter((d) => d !== dateStr)
                              )
                            }
                            className="hover:text-rose-900 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConfigOpen(false)}
                    className="px-5 py-2.5 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={configProcessing}
                    className="px-6 py-2.5 bg-paw-navy hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {configProcessing ? <Spinner showProgress label="Saving..." /> : 'Save Settings'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

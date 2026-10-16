import React from 'react';
import { useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building2,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface PetOption {
  id: number;
  name: string;
}

interface ShelterVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets?: PetOption[];
  preselectedPetId?: number | null;
}

export function ShelterVisitModal({
  isOpen,
  onClose,
  pets = [],
  preselectedPetId = null,
}: ShelterVisitModalProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    full_name: '',
    contact_number: '',
    email: '',
    preferred_date: '',
    preferred_time_slot: 'Morning (9:00 AM - 12:00 PM)',
    number_of_visitors: 1,
    purpose: 'Meet Adoptable Animals',
    shelter_animal_id: preselectedPetId ? String(preselectedPetId) : '',
    additional_notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/shelter-visits', {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Your shelter visit request has been submitted! ISF will contact you to coordinate.');
        reset();
        onClose();
      },
      onError: () => {
        toast.error('Please check the form for errors.');
      },
    });
  };

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white w-full max-w-xl max-h-[90vh] rounded-2xl sm:rounded-3xl z-10 relative shadow-2xl flex flex-col my-auto border-0 overflow-hidden"
        >
          {/* Pinned Header */}
          <div className="shrink-0 bg-slate-900 text-white px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                  Schedule a Shelter Visit
                </h3>
                <p className="text-xs text-slate-400 font-normal">
                  ISF Sanctuary • Coordination & confirmation required
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form
            id="shelter-visit-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto modal-scroll-area px-5 sm:px-6 py-5 space-y-4"
          >
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Juan Dela Cruz"
                value={data.full_name}
                onChange={(e) => setData('full_name', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${
                  errors.full_name
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/10'
                }`}
              />
              {errors.full_name && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.full_name}</p>
              )}
            </div>

            {/* Contact & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Number <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="0912 345 6789"
                  value={data.contact_number}
                  onChange={(e) => setData('contact_number', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${
                    errors.contact_number
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/10'
                  }`}
                />
                {errors.contact_number && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.contact_number}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${
                    errors.email
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/10'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Preferred Date & Visitors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Date <span className="text-orange-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={data.preferred_date}
                  onChange={(e) => setData('preferred_date', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 transition-all ${
                    errors.preferred_date
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/10'
                  }`}
                />
                {errors.preferred_date && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.preferred_date}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Number of Visitors <span className="text-orange-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  required
                  value={data.number_of_visitors}
                  onChange={(e) => setData('number_of_visitors', parseInt(e.target.value) || 1)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 transition-all ${
                    errors.number_of_visitors
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/10'
                  }`}
                />
                {errors.number_of_visitors && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.number_of_visitors}</p>
                )}
              </div>
            </div>

            {/* Time Slot & Specific Pet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Time Slot
                </label>
                <select
                  value={data.preferred_time_slot}
                  onChange={(e) => setData('preferred_time_slot', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer"
                >
                  <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM – 12:00 PM)</option>
                  <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM – 4:00 PM)</option>
                  <option value="Late Afternoon (4:00 PM - 6:00 PM)">Late Afternoon (4:00 PM – 6:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Specific Animal of Interest
                </label>
                <select
                  value={data.shelter_animal_id}
                  onChange={(e) => setData('shelter_animal_id', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer"
                >
                  <option value="">General Shelter Visit / Undecided</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Purpose of Visit <span className="text-orange-500">*</span>
              </label>
              <select
                required
                value={data.purpose}
                onChange={(e) => setData('purpose', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 transition-all cursor-pointer ${
                  errors.purpose
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/10'
                }`}
              >
                <option value="Meet Adoptable Animals">Meet Adoptable Animals</option>
                <option value="Adoption Inquiry">Adoption Inquiry</option>
                <option value="Volunteer Interest">Volunteer Interest</option>
                <option value="Donation / In-Kind Support">Donation / In-Kind Support</option>
                <option value="Organization or School Visit">Organization or School Visit</option>
                <option value="General Shelter Tour">General Shelter Tour</option>
              </select>
              {errors.purpose && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.purpose}</p>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Additional Notes or Special Requests
              </label>
              <textarea
                rows={2}
                placeholder="Let us know if you have specific questions or accommodations needed..."
                value={data.additional_notes}
                onChange={(e) => setData('additional_notes', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none"
              />
            </div>

            {/* Notice Callout */}
            <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-3 flex items-start gap-2.5 text-amber-900">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-medium">
                ISF must confirm your preferred schedule before your visit. Our shelter coordination team will reach out via call or email within 24–48 hours.
              </p>
            </div>
          </form>

          {/* Pinned Footer Actions */}
          <div className="shrink-0 bg-slate-50 px-5 sm:px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="shelter-visit-form"
              disabled={processing}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {processing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Submit Visit Request'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

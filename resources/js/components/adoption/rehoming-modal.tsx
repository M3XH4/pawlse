import React, { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RefreshCw,
  Upload,
  AlertCircle,
  Trash2,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

interface RehomingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RehomingModal({ isOpen, onClose }: RehomingModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    full_name: '',
    contact_number: '',
    email: '',
    animal_name: '',
    species: 'Dog',
    breed: '',
    gender: 'Unknown',
    age: '',
    current_location: '',
    reason: 'Relocating / Moving',
    health_notes: '',
    description: '',
    photo: null as File | null,
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('photo', file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removePhoto = () => {
    setData('photo', null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/rehoming-requests', {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Rehoming assistance request submitted! ISF will review and get in touch.');
        reset();
        removePhoto();
        onClose();
      },
      onError: () => {
        toast.error('Please complete all required fields correctly.');
      },
    });
  };

  if (!isOpen) return null;

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
          className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl sm:rounded-3xl z-10 relative shadow-2xl flex flex-col my-auto border-0 overflow-hidden"
        >
          {/* Pinned Header */}
          <div className="shrink-0 bg-slate-900 text-white px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <RefreshCw size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                  Request Rehoming Assistance
                </h3>
                <p className="text-xs text-slate-400 font-normal">
                  Community Pet Support • For privately owned animals needing new homes
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
            id="rehoming-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto modal-scroll-area px-5 sm:px-7 py-5 space-y-6"
          >
            {/* Section 1: Your Information */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Step 1 • Your Contact Information
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
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
                    placeholder="maria@example.com"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Location / City <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brgy. Pala-o, Iligan City"
                  value={data.current_location}
                  onChange={(e) => setData('current_location', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${
                    errors.current_location
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/10'
                  }`}
                />
                {errors.current_location && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.current_location}</p>
                )}
              </div>
            </div>

            {/* Section 2: Animal Details */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Step 2 • Animal Information
                </span>
              </div>

              {/* Photo Upload Card */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Animal Photo
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <img
                      src={previewUrl}
                      alt="Pet preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow-xs border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {data.photo?.name || 'Selected Photo'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {data.photo ? `${(data.photo.size / 1024 / 1024).toFixed(2)} MB` : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                        >
                          Change photo
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-200 hover:border-orange-400 bg-slate-50/50 hover:bg-orange-50/30 rounded-2xl p-5 text-center transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-orange-500 mx-auto mb-2 transition-colors">
                      <Camera size={18} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      Click to upload animal photo
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      JPG, PNG, WebP up to 4MB (Helps adopters meet your pet)
                    </p>
                  </button>
                )}
                {errors.photo && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.photo}</p>
                )}
              </div>

              {/* Name & Species */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Animal's Name <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Milo"
                    value={data.animal_name}
                    onChange={(e) => setData('animal_name', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${
                      errors.animal_name
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/10'
                    }`}
                  />
                  {errors.animal_name && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.animal_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Species <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={data.species}
                    onChange={(e) => setData('species', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Breed & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Breed / Mix
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aspin / Labrador Mix"
                    value={data.breed}
                    onChange={(e) => setData('breed', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={data.gender}
                    onChange={(e) => setData('gender', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              {/* Age & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Estimated Age
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 years old"
                    value={data.age}
                    onChange={(e) => setData('age', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reason for Rehoming <span className="text-orange-500">*</span>
                  </label>
                  <select
                    required
                    value={data.reason}
                    onChange={(e) => setData('reason', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer"
                  >
                    <option value="Relocating / Moving">Relocating / Moving</option>
                    <option value="Financial Hardship">Financial Hardship</option>
                    <option value="Family Allergies / Health">Family Allergies / Health</option>
                    <option value="Unable to Provide Care / Time">Unable to Provide Care / Time</option>
                    <option value="Owner Passed Away">Owner Passed Away</option>
                    <option value="Other">Other Reasons</option>
                  </select>
                </div>
              </div>

              {/* Health Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Health & Vaccination Status
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Spayed/neutered, anti-rabies updated, special dietary needs..."
                  value={data.health_notes}
                  onChange={(e) => setData('health_notes', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Personality & Bio
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us about their temperament, favorite toys, how they behave with kids or other pets..."
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none"
                />
              </div>
            </div>

            {/* Notice Callout */}
            <div className="bg-sky-50/80 border border-sky-200/70 rounded-xl p-3 flex items-start gap-2.5 text-sky-950">
              <AlertCircle size={16} className="text-sky-600 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-medium">
                <span className="font-semibold">Rehoming Assistance:</span> This program is for animals currently cared for by you, not animals residing at the ISF shelter. ISF assists in connecting you with screened, responsible adopters.
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
              form="rehoming-form"
              disabled={processing}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {processing ? (
                <Spinner showTime showProgress label="Submitting Request..." />
              ) : (
                'Submit Rehoming Request'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

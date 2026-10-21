import { useForm, usePage } from '@inertiajs/react';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Sparkles,
  MessageSquareHeart,
  Facebook,
  Instagram,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export function ContactModal({ isOpen, onClose, defaultCategory = 'general' }: ContactModalProps) {
  const page = usePage();
  const auth = page.props.auth as { user?: any } | undefined;
  const user = auth?.user;
  const [submitted, setSubmitted] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    category: defaultCategory,
    subject: '',
    message: '',
  });

  const isFormDirty = Boolean(
    !submitted &&
    ((data.name.trim() && data.name !== (user?.name || '')) ||
      (data.email.trim() && data.email !== (user?.email || '')) ||
      (data.phone.trim() && data.phone !== (user?.phone || '')) ||
      data.subject.trim() ||
      data.message.trim())
  );

  const {
    showDialog: showLeaveModal,
    handleContinueEditing,
    handleLeaveAnyway,
    confirmAction,
  } = useUnsavedChanges({
    isDirty: isFormDirty && isOpen,
    disabled: submitted,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post('/contact', {
      preserveScroll: true,
      onSuccess: () => {
        setSubmitted(true);
        reset('subject', 'message');
        toast.success('Your message has been sent successfully! We will get back to you shortly.');
      },
      onError: () => {
        toast.error('Please check the form for errors.');
      },
    });
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => confirmAction(handleClose)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white w-full max-w-4xl max-h-[92vh] rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden border-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => confirmAction(handleClose)}
              aria-label="Close contact modal"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 z-30 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all hover:scale-105 shadow-sm cursor-pointer"
            >
              <X size={18} />
            </button>

          {/* Left Sidebar (Shelter Info & Emergency Notice) */}
          <div className="md:w-5/12 bg-gradient-to-br from-slate-900 via-paw-navy to-[#18233a] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shrink-0">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-paw-orange/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-paw-orange/20 px-3.5 py-1.5 rounded-full border border-paw-orange/30 text-paw-orange text-[10px] font-black uppercase tracking-widest mb-3">
                  <Mail size={13} />
                  <span>Direct Reach</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white leading-tight">
                  Get in Touch
                </h3>
                <p className="text-xs text-white/70 font-medium mt-1.5 leading-relaxed">
                  Have questions about adoptions, shelter visits, or volunteer shifts? Our team is always happy to connect.
                </p>
              </div>

              {/* Contact Details List */}
              <div className="space-y-3 pt-1">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Zone+5+Barangay+Tambo+Iligan+City+Lanao+del+Norte+9200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                >
                  <div className="p-2 rounded-xl bg-paw-orange/20 text-paw-orange shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Shelter Location</span>
                    <p className="text-xs font-bold text-white truncate">Zone 5, Brgy. Tambo, Iligan City</p>
                    <span className="text-[10px] font-bold text-paw-orange flex items-center gap-1 mt-0.5">
                      Open in Maps <ArrowUpRight size={10} />
                    </span>
                  </div>
                </a>

                <a
                  href="tel:09123456789"
                  className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                >
                  <div className="p-2 rounded-xl bg-paw-green/20 text-paw-green shrink-0 group-hover:scale-110 transition-transform">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Helpline & Emergency</span>
                    <p className="text-xs font-bold text-white">0912 345 6789</p>
                    <span className="text-[10px] font-bold text-paw-green mt-0.5 block">Tap to call</span>
                  </div>
                </a>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="p-2 rounded-xl bg-paw-blue/20 text-paw-blue shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Visiting Hours</span>
                    <p className="text-xs font-bold text-white">Mon – Sat: 9:00 AM – 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency SOS Callout */}
            <div className="relative z-10 pt-4 mt-4 border-t border-white/10">
              <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-2.5">
                <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/80 font-medium leading-relaxed">
                  <span className="font-black text-amber-300 uppercase tracking-wider">Injured Animal?</span> Please don't wait for email. Use our{' '}
                  <a href="/sos" className="underline font-bold text-amber-200 hover:text-white">SOS Report</a> or call our emergency hotline.
                </p>
              </div>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="md:w-7/12 p-6 sm:p-8 md:p-9 flex flex-col overflow-y-auto max-h-[85vh] md:max-h-[92vh]">
            {submitted ? (
              <div className="my-auto py-10 px-4 text-center">
                <div className="w-16 h-16 bg-paw-green/10 text-paw-green rounded-full flex items-center justify-center mx-auto mb-4 border border-paw-green/20">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-2xl font-black text-paw-navy uppercase italic tracking-tight mb-2">
                  Message Sent!
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 font-bold max-w-sm mx-auto mb-6 leading-relaxed">
                  Thank you for reaching out to PAWLSE Iligan Stray Feeders. Our team has received your message and will reply to{' '}
                  <span className="text-paw-navy underline">{data.email}</span> shortly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-full bg-paw-orange hover:bg-[#e08e00] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-md shadow-paw-orange/20 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="mb-6 pr-8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-paw-orange block mb-1">
                    Send Us an Email
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-paw-navy uppercase italic tracking-tight leading-none">
                    Send Us a Message
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Fill out the fields below and we'll receive your inquiry directly.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1: Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy mb-1">
                        Your Name <span className="text-paw-orange">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Juan Dela Cruz"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-paw-orange focus:ring-2 focus:ring-paw-orange/20 transition-all font-medium text-paw-navy text-xs placeholder:text-gray-400"
                      />
                      <InputError message={errors.name} className="mt-1 text-xs" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy mb-1">
                        Email Address <span className="text-paw-orange">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="juan@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-paw-orange focus:ring-2 focus:ring-paw-orange/20 transition-all font-medium text-paw-navy text-xs placeholder:text-gray-400"
                      />
                      <InputError message={errors.email} className="mt-1 text-xs" />
                    </div>
                  </div>

                  {/* Row 2: Category (Full Width) */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy mb-1">
                      Inquiry Category <span className="text-paw-orange">*</span>
                    </label>
                    <select
                      value={data.category}
                      onChange={(e) => setData('category', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-paw-orange focus:ring-2 focus:ring-paw-orange/20 transition-all font-medium text-paw-navy text-xs cursor-pointer"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="adoption">Adoption & Meeting Pets</option>
                      <option value="volunteer">Volunteering & Hours</option>
                      <option value="donation">Donations & Supplies</option>
                      <option value="shelter_visit">Shelter Visit / Tour</option>
                      <option value="partnership">Partnership & Vet Collab</option>
                      <option value="other">Other / Feedback</option>
                    </select>
                    <InputError message={errors.category} className="mt-1 text-xs" />
                  </div>

                  {/* Row 3: Subject */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy mb-1">
                      Subject <span className="text-paw-orange">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={data.subject}
                      onChange={(e) => setData('subject', e.target.value)}
                      placeholder="e.g. Schedule a shelter visit for this Saturday"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-paw-orange focus:ring-2 focus:ring-paw-orange/20 transition-all font-medium text-paw-navy text-xs placeholder:text-gray-400"
                    />
                    <InputError message={errors.subject} className="mt-1 text-xs" />
                  </div>

                  {/* Row 4: Message */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy">
                        Message <span className="text-paw-orange">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-gray-400">
                        {data.message.length}/3000
                      </span>
                    </div>
                    <textarea
                      required
                      rows={4}
                      value={data.message}
                      onChange={(e) => setData('message', e.target.value)}
                      placeholder="Please let us know how we can help you..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-paw-orange focus:ring-2 focus:ring-paw-orange/20 transition-all font-medium text-paw-navy text-xs placeholder:text-gray-400 resize-none"
                    />
                    <InputError message={errors.message} className="mt-1 text-xs" />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full py-3.5 px-6 rounded-xl bg-paw-orange hover:bg-[#e08e00] active:scale-[0.99] text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-paw-orange/25 transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {processing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Sending Email...</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Send Email Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>

    <UnsavedChangesDialog
      isOpen={showLeaveModal}
      onContinueEditing={handleContinueEditing}
      onLeaveAnyway={handleLeaveAnyway}
      zIndex={350}
    />
  </>
  );
}

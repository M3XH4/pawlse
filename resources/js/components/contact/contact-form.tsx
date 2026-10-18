import { useForm, usePage } from '@inertiajs/react';
import { Send, CheckCircle2, AlertCircle, Sparkles, Loader2, HeartHandshake } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';

interface ContactFormProps {
  compact?: boolean;
  onSuccess?: () => void;
  defaultCategory?: string;
}

export function ContactForm({ compact = false, onSuccess, defaultCategory = 'general' }: ContactFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post('/contact', {
      preserveScroll: true,
      onSuccess: () => {
        setSubmitted(true);
        reset('subject', 'message');
        toast.success('Your message has been sent successfully! We will get back to you shortly.');
        onSuccess?.();
      },
    });
  };

  if (submitted && compact) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 bg-paw-green/10 text-paw-green rounded-full flex items-center justify-center mx-auto mb-4 border border-paw-green/20">
          <CheckCircle2 size={36} />
        </div>
        <h4 className="text-2xl font-black text-paw-navy uppercase italic tracking-tight mb-2">Message Delivered!</h4>
        <p className="text-sm text-gray-600 font-bold max-w-md mx-auto mb-6">
          Thank you for reaching out to PAWLSE Iligan Stray Feeders. Our team will review your message and reply to <span className="text-paw-navy underline">{data.email}</span> as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="px-6 py-2.5 rounded-full bg-paw-navy hover:bg-paw-orange text-white text-xs font-black uppercase tracking-wider transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name and Email */}
      <div className={`grid grid-cols-1 ${compact ? 'gap-4' : 'sm:grid-cols-2 gap-5'}`}>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-paw-navy mb-1.5">
            Your Name <span className="text-paw-orange">*</span>
          </label>
          <input
            type="text"
            required
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            placeholder="Juan Dela Cruz"
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-paw-orange focus:ring-2 focus:ring-paw-orange/20 transition-all font-medium text-paw-navy text-sm placeholder:text-gray-400"
          />
          <InputError message={errors.name} className="mt-1" />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-paw-navy mb-1.5">
            Email Address <span className="text-paw-orange">*</span>
          </label>
          <input
            type="email"
            required
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            placeholder="juan@example.com"
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-paw-orange focus:ring-2 focus:ring-paw-orange/20 transition-all font-medium text-paw-navy text-sm placeholder:text-gray-400"
          />
          <InputError message={errors.email} className="mt-1" />
        </div>
      </div>

      {/* Inquiry Category (Full Width) */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-paw-navy mb-1.5">
          Inquiry Category <span className="text-paw-orange">*</span>
        </label>
        <select
          value={data.category}
          onChange={(e) => setData('category', e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-paw-orange focus:ring-2 focus:ring-paw-orange/20 transition-all font-medium text-paw-navy text-sm cursor-pointer"
        >
          <option value="general">General Inquiry</option>
          <option value="adoption">Adoption & Meeting Pets</option>
          <option value="volunteer">Volunteering & Community Service</option>
          <option value="donation">Donations & In-Kind Supplies</option>
          <option value="shelter_visit">Shelter Visit / Tour Request</option>
          <option value="partnership">Partnership & Vet Collaboration</option>
          <option value="other">Other / Feedback</option>
        </select>
        <InputError message={errors.category} className="mt-1" />
      </div>

      {/* Subject */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-paw-navy mb-1.5">
          Subject <span className="text-paw-orange">*</span>
        </label>
        <input
          type="text"
          required
          value={data.subject}
          onChange={(e) => setData('subject', e.target.value)}
          placeholder="e.g. Schedule a shelter visit for this Saturday"
          className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-paw-orange focus:ring-2 focus:ring-paw-orange/20 transition-all font-medium text-paw-navy text-sm placeholder:text-gray-400"
        />
        <InputError message={errors.subject} className="mt-1" />
      </div>

      {/* Message */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-black uppercase tracking-wider text-paw-navy">
            Message <span className="text-paw-orange">*</span>
          </label>
          <span className="text-[11px] font-bold text-gray-400">
            {data.message.length}/3000 chars
          </span>
        </div>
        <textarea
          required
          rows={compact ? 4 : 5}
          value={data.message}
          onChange={(e) => setData('message', e.target.value)}
          placeholder="Write your message here... Please be as detailed as possible so our volunteers can assist you effectively."
          className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-paw-orange focus:ring-2 focus:ring-paw-orange/20 transition-all font-medium text-paw-navy text-sm placeholder:text-gray-400 resize-none"
        />
        <InputError message={errors.message} className="mt-1" />
      </div>

      {/* Emergency Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-3">
        <AlertCircle size={18} className="text-paw-orange shrink-0 mt-0.5" />
        <p className="text-xs text-paw-navy font-bold leading-relaxed">
          <span className="font-black uppercase tracking-wider text-paw-orange">Emergency or Injured Animal?</span> Please do not wait for an email response. Use our{' '}
          <a href="/sos" className="underline font-black hover:text-paw-orange">SOS Report</a> or call our rescue hotline at{' '}
          <a href="tel:09123456789" className="underline font-black hover:text-paw-orange">0912 345 6789</a>.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={processing}
        className="w-full py-4 px-6 rounded-2xl bg-paw-orange hover:bg-[#e08e00] active:scale-[0.99] text-white font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg shadow-paw-orange/20 transition-all disabled:opacity-60 cursor-pointer"
      >
        {processing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Sending Email...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Send Email Message</span>
          </>
        )}
      </button>
    </form>
  );
}

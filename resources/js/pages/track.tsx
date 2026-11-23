import React, { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  Heart,
  HeartHandshake,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ChevronRight,
  RefreshCw,
  Mail,
  User,
  Sparkles,
  Hash,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Building2,
  Copy,
  Check,
  PawPrint,
  Siren,
  Home,
  Lock,
  X,
  MessageCircle,
  Paperclip,
  Send,
  Ban,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { AdoptionWizard, AdoptionWizardInitialData } from '@/components/adoption/adoption-wizard';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useConfirmationModal } from '@/hooks/use-confirmation-modal';

interface TrackedItemDetail {
  label: string;
  value: string;
}

interface TrackedMessageAttachment {
  path: string;
  name: string;
  mime?: string | null;
  size?: number | null;
  url: string;
}

interface TrackedMessage {
  id: number;
  sender_type: 'admin' | 'user';
  sender_name: string;
  message?: string | null;
  attachments: TrackedMessageAttachment[];
  created_at?: string | null;
  created_at_formatted?: string | null;
}

interface TrackedItem {
  category: 'adoption' | 'donation' | 'missing' | 'rescue' | 'sos' | 'rehoming' | 'shelter_visit' | 'volunteer';
  category_label: string;
  reference: string;
  id: number;
  status: string;
  status_label: string;
  status_theme: 'amber' | 'blue' | 'green' | 'red' | 'gray';
  title: string;
  subtitle: string;
  created_at: string;
  photo_url?: string | null;
  rejection_reason?: string | null;
  notes?: string | null;
  can_cancel?: boolean;
  messages?: TrackedMessage[];
  details: TrackedItemDetail[];
  action_url?: string | null;
  action_label?: string | null;
  dashboard_url?: string | null;
  can_mark_reunited?: boolean;
  raw?: any;
}

interface TrackProps {
  searchedReference?: string;
  searchedEmail?: string;
  searched?: boolean;
  item?: TrackedItem | null;
}

const SUBMISSION_TYPES = [
  {
    label: 'Adoption (ADP-XXXXX)',
    prefix: 'ADP-',
    icon: PawPrint,
    classes:
      'bg-orange-50 dark:bg-gray-800 text-paw-orange border-orange-100 dark:border-gray-700 hover:bg-orange-100/80 dark:hover:bg-gray-700',
  },
  {
    label: 'Donations (DON-XXXXX)',
    prefix: 'DON-',
    icon: HeartHandshake,
    classes:
      'bg-emerald-50 dark:bg-gray-800 text-emerald-600 border-emerald-100 dark:border-gray-700 hover:bg-emerald-100/80 dark:hover:bg-gray-700',
  },
  {
    label: 'Missing Pets (MIS-XXXXX)',
    prefix: 'MIS-',
    icon: Search,
    classes:
      'bg-amber-50 dark:bg-gray-800 text-amber-600 border-amber-100 dark:border-gray-700 hover:bg-amber-100/80 dark:hover:bg-gray-700',
  },
  {
    label: 'Rescue & SOS (RES-XXXXX / SOS-XXXXX)',
    prefix: 'RES-',
    icon: Siren,
    classes:
      'bg-red-50 dark:bg-gray-800 text-red-600 border-red-100 dark:border-gray-700 hover:bg-red-100/80 dark:hover:bg-gray-700',
  },
  {
    label: 'Rehoming (REH-XXXXX)',
    prefix: 'REH-',
    icon: Home,
    classes:
      'bg-blue-50 dark:bg-gray-800 text-blue-600 border-blue-100 dark:border-gray-700 hover:bg-blue-100/80 dark:hover:bg-gray-700',
  },
  {
    label: 'Shelter Visits (VIS-XXXXX)',
    prefix: 'VIS-',
    icon: Calendar,
    classes:
      'bg-purple-50 dark:bg-gray-800 text-purple-600 border-purple-100 dark:border-gray-700 hover:bg-purple-100/80 dark:hover:bg-gray-700',
  },
] as const;

export default function UnifiedTrackPage({
  searchedReference = '',
  searchedEmail = '',
  searched = false,
  item = null,
}: TrackProps) {
  const { confirmModalProps, openConfirmModal } = useConfirmationModal();
  const [referenceInput, setReferenceInput] = useState(searchedReference);
  const [emailInput, setEmailInput] = useState(searchedEmail);
  const [resubmittingApp, setResubmittingApp] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  const handlePrefillPrefix = (prefix: string) => {
    setReferenceInput(prefix);
    referenceInputRef.current?.focus();
  };

  const handleClearSearch = () => {
    setReferenceInput('');
    setEmailInput('');
    if (searched) {
      router.get('/track', {}, { preserveState: false });
    } else {
      referenceInputRef.current?.focus();
    }
  };

  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    router.reload({
      only: ['item'],
      onFinish: () => setIsRefreshing(false),
    });
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || (!replyText.trim() && replyFiles.length === 0)) {
      return;
    }

    setIsSendingReply(true);
    router.post(
      `/track/adoption-applications/${item.id}/messages`,
      {
        reference: item.reference,
        email: searchedEmail || emailInput.trim(),
        message: replyText.trim(),
        attachments: replyFiles,
      },
      {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
          setReplyText('');
          setReplyFiles([]);
          if (replyFileInputRef.current) {
            replyFileInputRef.current.value = '';
          }
        },
        onFinish: () => setIsSendingReply(false),
      }
    );
  };

  const handleCancelApplication = () => {
    if (!item) {
      return;
    }

    openConfirmModal({
      title: 'Cancel Adoption Application',
      description: 'Are you sure you want to cancel this adoption application? This action cannot be undone.',
      confirmText: 'Cancel Application',
      variant: 'danger',
      onConfirm: () => {
        setIsCancelling(true);
        router.post(
          `/track/adoption-applications/${item.id}/cancel`,
          {
            reference: item.reference,
            email: searchedEmail || emailInput.trim(),
          },
          {
            preserveScroll: true,
            onFinish: () => setIsCancelling(false),
          }
        );
      },
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (referenceInput.trim() && emailInput.trim()) {
      router.get(
        '/track',
        {
          reference: referenceInput.trim(),
          email: emailInput.trim(),
        },
        { preserveState: true }
      );
    }
  };

  const handleMarkReunited = (reportId: number) => {
    openConfirmModal({
      title: 'Mark Pet as Safely Reunited',
      description: 'Are you sure you want to mark this pet as safely reunited?',
      confirmText: 'Yes, Mark Reunited',
      variant: 'success',
      onConfirm: () => {
        router.post(
          `/missing/reports/${reportId}/reunited`,
          { email: searchedEmail || emailInput.trim() },
          { preserveScroll: true }
        );
      },
    });
  };

  const getStatusBadge = (theme: TrackedItem['status_theme'], label: string) => {
    switch (theme) {
      case 'green':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 size={12} /> {label}
          </span>
        );
      case 'blue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Calendar size={12} /> {label}
          </span>
        );
      case 'red':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle size={12} /> {label}
          </span>
        );
      case 'gray':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Ban size={12} /> {label}
          </span>
        );
      case 'amber':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> {label}
          </span>
        );
    }
  };

  const getInitialDataForApp = (app: any): AdoptionWizardInitialData => {
    return {
      fullName: app.full_name || '',
      address: app.address || '',
      phone: app.phone || '',
      email: app.email || '',
      birthDate: app.birth_date ? app.birth_date.substring(0, 10) : '',
      occupation: app.occupation || '',
      company: app.company || '',
      socialMedia: app.social_media || '',
      status: app.status_marital || '',
      pronouns: app.pronouns || '',
      adoptionSource: app.adoption_source || [],
      adoptedBefore: app.adopted_before ? 'Yes' : 'No',
      emergencyName: app.emergency_name || '',
      emergencyRelationship: app.emergency_relationship || '',
      emergencyPhone: app.emergency_phone || '',
      emergencyEmail: app.emergency_email || '',
      adoptionPreference: app.adoption_preference || '',
      residenceType: app.residence_type || '',
      isRenting: app.is_renting ? 'Yes' : 'No',
      movingPlan: app.moving_plan || '',
      livesWith: app.lives_with || [],
      hasAllergies: app.has_allergies ? 'Yes' : 'No',
      dailyCareHandler: app.daily_care_handler || '',
      expensesHandler: app.expenses_handler || '',
      emergencyHandler: app.emergency_handler || '',
      hoursAlone: app.hours_alone || '',
      introductionPlan: app.introduction_plan || '',
      familySupport: app.family_support ? 'Yes' : 'No',
      familySupportExplanation: app.family_support_explanation || '',
      currentPets: app.current_pets ? 'Yes' : 'No',
      pastPets: app.past_pets ? 'Yes' : 'No',
      preferredDate: app.preferred_date ? app.preferred_date.substring(0, 10) : '',
      preferredTime: app.preferred_time || '',
      canVisitShelter: app.can_visit_shelter ? 'Yes' : 'No',
    };
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 flex flex-col font-sans">
      <Head title="Track Public Submission - Pawlse" />
      <Header />

      <main className="flex-1 pb-20 pt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Page Header Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-paw-navy/5 mb-8">
            <div className="w-full">
              <div className="text-center max-w-2xl mx-auto mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-paw-orange">
                  Public Submission Portal
                </span>
                <h1 className="text-3xl sm:text-4xl font-fredoka font-black text-[#0B2340] dark:text-white mt-1 mb-3">
                  Track Your Submission Status
                </h1>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  Look up any adoption application, donation, missing pet report, stray rescue, emergency SOS, rehoming request, or shelter visit you submitted as a public user.
                </p>
              </div>

              {/* Supported types chips — aligned end-to-end */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-6 text-[11px] font-bold">
                {SUBMISSION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.label}
                      type="button"
                      onClick={() => handlePrefillPrefix(type.prefix)}
                      title={`Click to pre-fill ${type.prefix}`}
                      className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${type.classes}`}
                    >
                      <Icon size={14} className="shrink-0" />
                      <span className="truncate">{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      ref={referenceInputRef}
                      type="text"
                      required
                      value={referenceInput}
                      onChange={(e) => setReferenceInput(e.target.value)}
                      placeholder="Reference Number (e.g. ADP-00001, DON-1234, MIS-00002)"
                      className="w-full pl-11 pr-9 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange rounded-2xl outline-none font-bold text-sm text-gray-900 dark:text-white transition-all uppercase"
                    />
                    {(referenceInput || emailInput) && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                        title="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Email address used on submission..."
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange rounded-2xl outline-none font-bold text-sm text-gray-900 dark:text-white transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-7 py-3.5 bg-paw-orange text-white hover:bg-orange-600 font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-paw-orange/25 inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Search size={16} /> Track Status
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-gray-400 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <Lock size={13} className="text-gray-400 shrink-0" />
                    Direct private tracking requires both matching credentials.
                  </span>
                  <Link
                    href="/account/user"
                    className="text-paw-orange hover:underline font-bold"
                  >
                    Registered user? View your dashboard →
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Results Area */}
          {searched && !item && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-800 shadow-md">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-gray-800 text-paw-orange mx-auto flex items-center justify-center mb-4">
                <Search size={28} />
              </div>
              <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white mb-2">
                No Matching Submission Found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                We couldn't find a submission matching reference <strong className="text-gray-700 dark:text-gray-300">{searchedReference}</strong> and email <strong className="text-gray-700 dark:text-gray-300">{searchedEmail}</strong>. Please double-check your confirmation e-receipt.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-paw-orange text-white hover:bg-orange-600 font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-paw-orange/25"
              >
                Back to Home <ChevronRight size={16} />
              </Link>
            </div>
          )}

          {item && (
            <div className="space-y-6">
              {/* One-Click Quick Info & Share Banner */}
              <div className="flex flex-col items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-5 py-4 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-sm">
                <span className="inline-flex items-center justify-center gap-2 text-center">
                  <Sparkles size={16} className="text-paw-orange shrink-0" />
                  <span>
                    One-Click Access: Bookmark this page or use the direct button in your email to view updates anytime without typing credentials.
                  </span>
                </span>
                <div className="w-full flex flex-wrap items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-xs font-black transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                    {copied ? 'Link Copied!' : 'Copy Direct Link'}
                  </button>
                  {item.dashboard_url && (
                    <Link
                      href={item.dashboard_url}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-paw-orange text-white hover:bg-orange-600 text-xs font-black transition-all shadow-sm shrink-0"
                    >
                      Manage in My Dashboard <ChevronRight size={13} />
                    </Link>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-lg shadow-paw-navy/5 space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Photo / Icon container */}
                  <div className="h-32 w-32 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                    {item.photo_url ? (
                      <ImageWithFallback
                        src={item.photo_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-paw-orange/10 text-paw-orange">
                        {item.category === 'donation' && <DollarSign size={36} />}
                        {item.category === 'shelter_visit' && <Building2 size={36} />}
                        {item.category === 'rehoming' && <Heart size={36} />}
                        {item.category === 'missing' && <Search size={36} />}
                        {item.category === 'rescue' && <ShieldCheck size={36} />}
                        {item.category === 'sos' && <AlertTriangle size={36} />}
                        {item.category === 'adoption' && <Heart size={36} />}
                        {item.category === 'volunteer' && <User size={36} />}
                      </div>
                    )}
                  </div>

                  {/* Summary Header */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-paw-orange">
                          {item.category_label} • Ref #{item.reference}
                        </span>
                        <h2 className="font-fredoka text-2xl font-bold text-[#0B2340] dark:text-white">
                          {item.title}
                        </h2>
                        <p className="text-xs font-bold text-gray-400">
                          {item.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status_theme, item.status_label)}
                        <button
                          type="button"
                          onClick={handleRefreshStatus}
                          disabled={isRefreshing}
                          title="Refresh live status"
                          aria-label="Refresh live status"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-paw-orange hover:border-paw-orange/40 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                      </div>
                    </div>

                    {/* Visual Status Progress Stepper */}
                    <div className="pt-2 pb-1">
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            label: 'Submitted',
                            active: true,
                            done: item.status !== 'cancelled',
                            muted: item.status === 'cancelled',
                          },
                          {
                            label:
                              item.status === 'needs_info'
                                ? 'Info Requested'
                                : item.status === 'cancelled'
                                  ? 'Cancelled'
                                  : item.status === 'scheduled'
                                    ? 'Interview Scheduled'
                                    : 'Under Review',
                            active:
                              item.status_theme === 'amber' ||
                              item.status_theme === 'blue' ||
                              item.status_theme === 'green' ||
                              item.status_theme === 'red' ||
                              item.status === 'cancelled',
                            done:
                              item.status_theme === 'blue' ||
                              item.status_theme === 'green' ||
                              item.status_theme === 'red',
                            muted: item.status === 'cancelled',
                          },
                          {
                            label:
                              item.status_theme === 'red'
                                ? 'Needs Attention'
                                : item.status === 'cancelled'
                                  ? 'Closed'
                                  : 'Completed',
                            active: item.status_theme === 'green' || item.status_theme === 'red',
                            done: item.status_theme === 'green',
                            error: item.status_theme === 'red',
                            muted: item.status === 'cancelled',
                          },
                        ].map((step) => (
                          <div key={step.label} className="space-y-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                step.muted
                                  ? 'bg-slate-300 dark:bg-slate-700'
                                  : step.error
                                    ? 'bg-red-500'
                                    : step.done
                                      ? 'bg-green-500'
                                      : step.active
                                        ? 'bg-paw-orange'
                                        : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            />
                            <span
                              className={`block text-[10px] font-black uppercase tracking-wider ${
                                step.muted
                                  ? 'text-slate-500'
                                  : step.error
                                    ? 'text-red-600'
                                    : step.done
                                      ? 'text-green-600'
                                      : step.active
                                        ? 'text-paw-orange'
                                        : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500">
                      {item.details.map((detail, idx) => (
                        <div key={idx}>
                          <span className="uppercase text-[10px] tracking-wider text-gray-400 block">
                            {detail.label}
                          </span>
                          <span className="text-gray-900 dark:text-white text-sm block mt-0.5 font-semibold">
                            {detail.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Specific Action Callouts */}
                {item.category === 'adoption' && item.status === 'needs_info' && (
                  <div className="bg-amber-50/80 dark:bg-amber-950/20 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-2">
                    <p className="text-xs font-extrabold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                      <MessageCircle size={16} className="text-paw-orange shrink-0" />
                      Additional Details or Requirements Requested
                    </p>
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                      Our adoption coordinator requested more information or requirement photos. Please reply in the conversation below so we can continue reviewing your application.
                    </p>
                  </div>
                )}

                {item.category === 'adoption' && item.status === 'cancelled' && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <Ban size={18} className="text-slate-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        Application Cancelled
                      </p>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        This adoption application was cancelled by the applicant and is now closed.
                      </p>
                    </div>
                  </div>
                )}

                {item.category === 'adoption' && item.status === 'rejected' && (
                  <div className="bg-red-50/70 dark:bg-red-950/20 p-4 sm:p-5 rounded-2xl border border-red-200/80 space-y-3">
                    <div className="flex items-start gap-3">
                      <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-extrabold text-red-950 dark:text-red-100">
                          Application Not Approved
                        </p>
                        {item.rejection_reason && (
                          <p className="text-xs font-medium text-red-800 dark:text-red-300">
                            Reason: <strong className="underline">{item.rejection_reason}</strong>
                          </p>
                        )}
                        <p className="text-xs text-red-700 dark:text-red-300/90 font-medium">
                          You may update your details and resubmit for reconsideration.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResubmittingApp(item.raw)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-600/20 cursor-pointer"
                    >
                      <RefreshCw size={14} /> Edit & Re-submit Application
                    </button>
                  </div>
                )}

                {item.action_url && item.action_label && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <Link
                      href={item.action_url}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-paw-orange text-white hover:bg-orange-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-paw-orange/20 cursor-pointer"
                    >
                      {item.action_label} <ChevronRight size={14} />
                    </Link>
                  </div>
                )}

                {item.category === 'adoption' && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white flex items-center gap-2">
                        <MessageCircle size={18} className="text-paw-orange" />
                        Coordinator Conversation & Requirements
                      </h3>
                      {item.can_cancel && (
                        <button
                          type="button"
                          onClick={handleCancelApplication}
                          disabled={isCancelling}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Ban size={13} /> {isCancelling ? 'Cancelling...' : 'Cancel Application'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {(!item.messages || item.messages.length === 0) ? (
                        <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                          No messages yet. You can send additional details or upload requirement photos here for the adoption coordinator.
                        </div>
                      ) : (
                        item.messages.map((msg) => {
                          const isUser = msg.sender_type === 'user';
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs space-y-2 border ${
                                  isUser
                                    ? 'bg-orange-50/80 dark:bg-orange-950/30 border-orange-200/80 dark:border-orange-900 text-gray-900 dark:text-orange-50'
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  <span>{isUser ? `${msg.sender_name} (You)` : `${msg.sender_name} • Shelter Coordinator`}</span>
                                  {msg.created_at_formatted && <span>{msg.created_at_formatted}</span>}
                                </div>
                                {msg.message && (
                                  <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">
                                    {msg.message}
                                  </p>
                                )}
                                {msg.attachments && msg.attachments.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {msg.attachments.map((att, aIdx) => {
                                      const isImage = att.mime?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(att.name);
                                      return isImage ? (
                                        <button
                                          key={aIdx}
                                          type="button"
                                          onClick={() => setLightboxUrl(att.url)}
                                          className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 w-20 h-20 bg-white cursor-pointer"
                                          title={att.name}
                                        >
                                          <img src={att.url} alt={att.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </button>
                                      ) : (
                                        <a
                                          key={aIdx}
                                          href={att.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[11px] font-bold text-gray-700 dark:text-gray-200 hover:border-paw-orange transition-colors"
                                        >
                                          <FileText size={13} className="text-paw-orange" />
                                          <span className="max-w-[140px] truncate">{att.name}</span>
                                        </a>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {item.status !== 'cancelled' && item.status !== 'rejected' && (
                      <form onSubmit={handleReplySubmit} className="space-y-3 pt-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          placeholder="Write additional details or answer the coordinator's questions..."
                          className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange rounded-2xl outline-none font-medium text-xs text-gray-900 dark:text-white resize-none transition-all"
                        />

                        {replyFiles.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {replyFiles.map((file, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 dark:bg-gray-800 border border-orange-200 dark:border-gray-700 text-[11px] font-bold text-gray-700 dark:text-gray-200"
                              >
                                <Paperclip size={12} className="text-paw-orange" />
                                <span className="max-w-[160px] truncate">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setReplyFiles((prev) => prev.filter((_, i) => i !== idx))}
                                  className="text-gray-400 hover:text-red-500 cursor-pointer"
                                  aria-label={`Remove ${file.name}`}
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer transition-all">
                            <Paperclip size={14} className="text-paw-orange" />
                            <span>Attach Images / PDF (max 5)</span>
                            <input
                              ref={replyFileInputRef}
                              type="file"
                              multiple
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={(e) => {
                                const selected = Array.from(e.target.files || []).slice(0, 5);
                                setReplyFiles(selected);
                              }}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="submit"
                            disabled={isSendingReply || (!replyText.trim() && replyFiles.length === 0)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-paw-orange text-white hover:bg-orange-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-paw-orange/20 cursor-pointer disabled:opacity-50"
                          >
                            <Send size={13} />
                            {isSendingReply ? 'Sending...' : 'Send Reply'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {item.can_mark_reunited && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleMarkReunited(item.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-green-600/20 cursor-pointer"
                    >
                      <CheckCircle2 size={14} /> Mark Pet Safely Reunited
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Resubmission Modal for Adoption */}
      <AnimatePresence>
        {resubmittingApp && resubmittingApp.shelter_animal && (
          <AdoptionWizard
            pet={resubmittingApp.shelter_animal}
            initialData={getInitialDataForApp(resubmittingApp)}
            resubmitApplicationId={resubmittingApp.id}
            onClose={() => setResubmittingApp(null)}
          />
        )}
      </AnimatePresence>

      {/* Image Attachment Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close preview"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <X size={20} />
          </button>
          <img
            src={lightboxUrl}
            alt="Attachment preview"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain cursor-default"
          />
        </div>
      )}

      <ConfirmationModal {...confirmModalProps} />

      <Footer />
    </div>
  );
}

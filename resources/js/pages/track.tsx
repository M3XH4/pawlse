import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  Heart,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ChevronRight,
  RefreshCw,
  Mail,
  User,
  MapPin,
  Phone,
  ArrowLeft,
  Sparkles,
  Hash,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Building2,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { AdoptionWizard, AdoptionWizardInitialData } from '@/components/adoption/adoption-wizard';

interface TrackedItemDetail {
  label: string;
  value: string;
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

export default function UnifiedTrackPage({
  searchedReference = '',
  searchedEmail = '',
  searched = false,
  item = null,
}: TrackProps) {
  const [referenceInput, setReferenceInput] = useState(searchedReference);
  const [emailInput, setEmailInput] = useState(searchedEmail);
  const [resubmittingApp, setResubmittingApp] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

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
    if (confirm('Are you sure you want to mark this pet as safely reunited?')) {
      router.post(
        `/missing/reports/${reportId}/reunited`,
        { email: searchedEmail || emailInput.trim() },
        { preserveScroll: true }
      );
    }
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
          {/* Back link */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-paw-orange transition-colors"
            >
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>

          {/* Page Header Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-paw-navy/5 mb-8">
            <div className="max-w-3xl">
              <span className="text-xs font-black uppercase tracking-widest text-paw-orange">
                Public Submission Portal
              </span>
              <h1 className="text-3xl sm:text-4xl font-fredoka font-black text-[#0B2340] dark:text-white mt-1 mb-3">
                Track Your Submission Status
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                Look up any adoption application, donation, missing pet report, stray rescue, emergency SOS, rehoming request, or shelter visit you submitted as a public user.
              </p>

              {/* Supported types chips */}
              <div className="flex flex-wrap gap-2 mb-6 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                <span className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-gray-800 text-paw-orange border border-orange-100 dark:border-gray-700">
                  🐾 Adoption (ADP-XXXXX)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-gray-800 text-emerald-600 border border-emerald-100 dark:border-gray-700">
                  💝 Donations (DON-XXXXX)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-gray-800 text-amber-600 border border-amber-100 dark:border-gray-700">
                  🔍 Missing Pets (MIS-XXXXX)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-gray-800 text-red-600 border border-red-100 dark:border-gray-700">
                  🚨 Rescue & SOS (RES-XXXXX / SOS-XXXXX)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-gray-800 text-blue-600 border border-blue-100 dark:border-gray-700">
                  🏠 Rehoming (REH-XXXXX)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-gray-800 text-purple-600 border border-purple-100 dark:border-gray-700">
                  📅 Shelter Visits (VIS-XXXXX)
                </span>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      value={referenceInput}
                      onChange={(e) => setReferenceInput(e.target.value)}
                      placeholder="Reference Number (e.g. ADP-00001, DON-1234, MIS-00002)"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange rounded-2xl outline-none font-bold text-sm text-gray-900 dark:text-white transition-all uppercase"
                    />
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
                  <span>🔒 Direct private tracking requires both matching credentials.</span>
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
              <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-5 py-3 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-sm">
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-paw-orange shrink-0" />
                  One-Click Access: Bookmark this page or use the direct button in your email to view updates anytime without typing credentials.
                </span>
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
                      <div>{getStatusBadge(item.status_theme, item.status_label)}</div>
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

      <Footer />
    </div>
  );
}

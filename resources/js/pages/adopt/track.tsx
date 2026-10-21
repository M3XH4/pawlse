import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  Heart,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ChevronRight,
  RefreshCw,
  Mail,
  User,
  ArrowLeft,
  Hash,
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { AdoptionWizard, AdoptionWizardInitialData } from '@/components/adoption/adoption-wizard';

interface ShelterAnimal {
  id: number;
  name: string;
  type?: string;
  breed?: string;
  status?: string;
  photo_url?: string;
  mainImg?: string;
}

interface Application {
  id: number;
  user_id?: number | null;
  status: 'pending' | 'scheduled' | 'approved' | 'rejected';
  full_name: string;
  address: string;
  phone: string;
  email: string;
  birth_date: string;
  occupation?: string | null;
  company?: string | null;
  social_media?: string | null;
  status_marital: string;
  pronouns: string;
  adoption_source: string[];
  adopted_before: boolean;
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
  emergency_email: string;
  adoption_preference: string;
  residence_type: string;
  is_renting: boolean;
  moving_plan: string;
  lives_with: string[];
  has_allergies: boolean;
  dailyCareHandler?: string;
  daily_care_handler?: string;
  expensesHandler?: string;
  expenses_handler?: string;
  emergencyHandler?: string;
  emergency_handler?: string;
  hours_alone: string;
  introduction_plan: string;
  family_support: boolean;
  family_support_explanation?: string | null;
  current_pets: boolean;
  past_pets: boolean;
  preferred_date: string;
  preferred_time: string;
  can_visit_shelter: boolean;
  rejection_reason?: string | null;
  created_at: string;
  shelter_animal?: ShelterAnimal | null;
}

interface TrackProps {
  searchedReference?: string;
  searchedEmail?: string;
  searched?: boolean;
  applications: Application[];
}

export default function AdoptTrack({
  searchedReference = '',
  searchedEmail = '',
  searched = false,
  applications = [],
}: TrackProps) {
  const [referenceInput, setReferenceInput] = useState(searchedReference);
  const [emailInput, setEmailInput] = useState(searchedEmail);
  const [resubmittingApp, setResubmittingApp] = useState<Application | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (referenceInput.trim() && emailInput.trim()) {
      router.get(
        '/adopt/track',
        {
          reference: referenceInput.trim(),
          email: emailInput.trim(),
        },
        { preserveState: true }
      );
    }
  };

  const getStatusBadge = (status: Application['status'], rejectionReason?: string | null) => {
    const isPetMatched = rejectionReason && rejectionReason.toLowerCase().includes('matched for this pet');

    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> Pending Review
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Calendar size={12} /> Interview Scheduled
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'rejected':
        if (isPetMatched) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              <Heart size={12} className="text-amber-500" /> Pet Matched / Closed
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle size={12} /> Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const getInitialDataForApp = (app: Application): AdoptionWizardInitialData => {
    return {
      fullName: app.full_name,
      address: app.address,
      phone: app.phone,
      email: app.email,
      birthDate: app.birth_date ? app.birth_date.substring(0, 10) : '',
      occupation: app.occupation || '',
      company: app.company || '',
      socialMedia: app.social_media || '',
      status: app.status_marital,
      pronouns: app.pronouns,
      adoptionSource: app.adoption_source || [],
      adoptedBefore: app.adopted_before ? 'Yes' : 'No',
      emergencyName: app.emergency_name,
      emergencyRelationship: app.emergency_relationship,
      emergencyPhone: app.emergency_phone,
      emergencyEmail: app.emergency_email,
      adoptionPreference: app.adoption_preference,
      residenceType: app.residence_type,
      isRenting: app.is_renting ? 'Yes' : 'No',
      movingPlan: app.moving_plan,
      livesWith: app.lives_with || [],
      hasAllergies: app.has_allergies ? 'Yes' : 'No',
      dailyCareHandler: app.daily_care_handler || app.dailyCareHandler || '',
      expensesHandler: app.expenses_handler || app.expensesHandler || '',
      emergencyHandler: app.emergency_handler || app.emergencyHandler || '',
      hoursAlone: app.hours_alone,
      introductionPlan: app.introduction_plan,
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
      <Head title="Track Adoption Application - Pawlse" />
      <Header />

      <main className="flex-1 pb-20 pt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb / Back link */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/adopt"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-paw-orange transition-colors"
            >
              <ArrowLeft size={16} /> Back to Adoptable Pets
            </Link>
          </div>

          {/* Page Header Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-paw-navy/5 mb-8">
            <div className="max-w-3xl">
              <span className="text-xs font-black uppercase tracking-widest text-paw-orange">
                Applicant Tracking Portal
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-[#0B2340] dark:text-white mt-1 mb-3">
                Track Your Adoption Application
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Enter your unique <strong>Application Reference Number</strong> (e.g. ADP-00001) and the <strong>Email Address</strong> used on your application. This information can be found in your submission confirmation e-receipt.
              </p>

              {/* Reference + Email Search Form */}
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      value={referenceInput}
                      onChange={(e) => setReferenceInput(e.target.value)}
                      placeholder="Reference # (e.g. ADP-00001 or 1)"
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
                      placeholder="Applicant email address..."
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
                    href="/account/user/adoption-applications"
                    className="text-paw-orange hover:underline font-bold"
                  >
                    Registered user? View your dashboard →
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Results Area */}
          {searched && applications.length === 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-800 shadow-md">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-gray-800 text-paw-orange mx-auto flex items-center justify-center mb-4">
                <Search size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#0B2340] dark:text-white mb-2">
                No Matching Application Found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                We couldn't find an adoption application matching reference <strong className="text-gray-700 dark:text-gray-300">{searchedReference}</strong> and email <strong className="text-gray-700 dark:text-gray-300">{searchedEmail}</strong>. Please verify both details from your confirmation e-receipt.
              </p>
              <Link
                href="/adopt"
                className="inline-flex items-center gap-2 px-6 py-3 bg-paw-orange text-white hover:bg-orange-600 font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-paw-orange/25"
              >
                Browse Pets <ChevronRight size={16} />
              </Link>
            </div>
          )}

          {applications.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0B2340] dark:text-white">
                  Application Status
                </h2>
              </div>

              {applications.map((app) => {
                const isPetMatched = app.rejection_reason && app.rejection_reason.toLowerCase().includes('matched for this pet');
                const isPetAdopted = app.shelter_animal?.status === 'adopted';
                const canResubmit = app.status === 'rejected' && !isPetMatched && !isPetAdopted;

                return (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-lg shadow-paw-navy/5 space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Pet Image */}
                      <div className="h-32 w-32 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                        {app.shelter_animal?.photo_url || app.shelter_animal?.mainImg ? (
                          <ImageWithFallback
                            src={app.shelter_animal.photo_url || app.shelter_animal.mainImg || ''}
                            alt={app.shelter_animal.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-paw-orange/10 text-paw-orange">
                            <Heart size={36} />
                          </div>
                        )}
                      </div>

                      {/* Basic App Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-paw-orange">
                              Application Ref #{app.id}
                            </span>
                            <h3 className="text-2xl font-bold text-[#0B2340] dark:text-white">
                              Adoption Application for {app.shelter_animal?.name || 'Shelter Pet'}
                            </h3>
                            <p className="text-xs font-bold text-gray-400">
                              Submitted on {new Date(app.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>{getStatusBadge(app.status, app.rejection_reason)}</div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500">
                          <div>
                            <span className="uppercase text-[10px] tracking-wider text-gray-400 block">Applicant</span>
                            <span className="text-gray-900 dark:text-white text-sm flex items-center gap-1.5 mt-0.5">
                              <User size={14} className="text-gray-400" /> {app.full_name}
                            </span>
                          </div>
                          <div>
                            <span className="uppercase text-[10px] tracking-wider text-gray-400 block">Preferred Interview</span>
                            <span className="text-gray-900 dark:text-white text-sm flex items-center gap-1.5 mt-0.5">
                              <Calendar size={14} className="text-paw-orange" />
                              {app.preferred_date ? new Date(app.preferred_date).toLocaleDateString() : 'To be coordinated'} at {app.preferred_time || 'Flexible'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Banner */}
                    {app.status === 'pending' && (
                      <div className="bg-amber-50/70 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/80 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-start gap-3">
                        <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-amber-950 dark:text-amber-100 mb-0.5">Screening in Progress</p>
                          <p className="font-medium text-amber-800 dark:text-amber-300">
                            Our adoption screening team is reviewing your questionnaire and residence details. We will contact you at <strong>{app.phone}</strong> or <strong>{app.email}</strong> to confirm your interview.
                          </p>
                        </div>
                      </div>
                    )}

                    {app.status === 'scheduled' && (
                      <div className="bg-blue-50/70 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-200/80 text-xs font-bold text-blue-900 dark:text-blue-200 flex items-start gap-3">
                        <Calendar size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-blue-950 dark:text-blue-100 mb-0.5">Interview Scheduled</p>
                          <p className="font-medium text-blue-800 dark:text-blue-300">
                            Your interview is scheduled for <strong>{new Date(app.preferred_date).toLocaleDateString()}</strong> at <strong>{app.preferred_time}</strong>. {app.can_visit_shelter ? 'Please visit the ISF Shelter on time.' : 'A shelter coordinator will call you.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {app.status === 'approved' && (
                      <div className="bg-green-50/70 dark:bg-green-950/20 p-4 rounded-2xl border border-green-200/80 text-xs font-bold text-green-900 dark:text-green-200 flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-green-950 dark:text-green-100 mb-0.5">Application Approved! 🎉</p>
                          <p className="font-medium text-green-800 dark:text-green-300">
                            Congratulations! Your application has been approved. You may visit the shelter to pick up <strong>{app.shelter_animal?.name}</strong> and finalize adoption handover papers.
                          </p>
                        </div>
                      </div>
                    )}

                    {app.status === 'rejected' && (
                      <div className="bg-red-50/70 dark:bg-red-950/20 p-4 sm:p-5 rounded-2xl border border-red-200/80 space-y-3">
                        <div className="flex items-start gap-3">
                          <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-xs font-extrabold text-red-950 dark:text-red-100">
                              {isPetMatched || isPetAdopted
                                ? 'This Pet Has Been Matched and Adopted'
                                : 'Application Not Approved at This Time'}
                            </p>
                            {app.rejection_reason && (
                              <p className="text-xs font-medium text-red-800 dark:text-red-300">
                                Feedback from Shelter Admin: <strong className="underline">{app.rejection_reason}</strong>
                              </p>
                            )}
                            <p className="text-xs text-red-700 dark:text-red-300/90 font-medium">
                              {isPetMatched || isPetAdopted
                                ? 'Another family was matched with this pet. We encourage you to browse our other adoptable shelter residents.'
                                : 'If there was a misunderstanding or you would like to update your answers or schedule, you can edit your information and resubmit for reconsideration.'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          {canResubmit && (
                            <button
                              type="button"
                              onClick={() => setResubmittingApp(app)}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-600/20 cursor-pointer"
                            >
                              <RefreshCw size={14} /> Edit & Re-submit Application
                            </button>
                          )}
                          <Link
                            href="/adopt"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                          >
                            Browse Other Adoptable Pets <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Resubmission Modal */}
      {resubmittingApp && resubmittingApp.shelter_animal && (
        <AdoptionWizard
          pet={resubmittingApp.shelter_animal}
          initialData={getInitialDataForApp(resubmittingApp)}
          resubmitApplicationId={resubmittingApp.id}
          onClose={() => setResubmittingApp(null)}
        />
      )}

      <Footer />
    </div>
  );
}

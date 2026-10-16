import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  Heart,
  Shield,
  Calendar,
  Share2,
  ArrowLeft,
  MapPin,
  Clock,
  Sparkles,
  Stethoscope,
  Building2,
  Activity,
  Tag,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { AdoptionWizard } from '@/components/adoption-wizard';
import { ShareModal } from '@/components/adoption/share-modal';
import { ShelterVisitModal } from '@/components/adoption/shelter-visit-modal';
import { AdoptPetDetail } from '@/components/adoption/pet-detail-modal';

interface PetShowProps {
  pet: AdoptPetDetail;
}

export default function PetShow({ pet }: PetShowProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isVisitOpen, setIsVisitOpen] = useState(false);

  const vaccinationRecords = (pet.medical_records || []).filter(
    (r) => r.record_type === 'vaccination'
  );
  const otherMedicalRecords = (pet.medical_records || []).filter(
    (r) => r.record_type !== 'vaccination'
  );

  return (
    <div className="min-h-screen bg-paw-bg font-quicksand flex flex-col">
      <Head title={`${pet.name} - Adopt | Pawlse`} />
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <div className="mb-6">
            <Link
              href="/adopt"
              className="inline-flex items-center gap-2 text-paw-navy hover:text-paw-orange font-black text-sm transition-colors bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100"
            >
              <ArrowLeft size={16} />
              Back to All Adoptable Pets
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Photo & Quick Actions (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-[32px] p-4 shadow-xl border border-paw-orange/10 overflow-hidden relative">
                <div className="relative aspect-square rounded-[24px] overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={pet.img || pet.mainImg || ''}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Vaccination Pill */}
                  <div
                    className={`absolute top-4 right-4 ${
                      pet.vaccinated ? 'bg-paw-green text-white' : 'bg-gray-700/80 text-white'
                    } backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-black shadow-md`}
                  >
                    <Shield size={13} />
                    <span>{pet.vaccinated ? 'Vaccinated' : 'Pending Vaccines'}</span>
                  </div>

                  {/* Available Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-paw-orange font-black text-xs flex items-center gap-1.5 shadow-md">
                    <Heart size={13} fill="currentColor" />
                    Available for Adoption
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-black text-paw-navy">{pet.name}</h1>
                      <p className="text-xs font-bold text-gray-500 mt-0.5">
                        {pet.breed} {pet.type ? `• ${pet.type}` : ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsShareOpen(true)}
                      className="p-3 bg-paw-bg hover:bg-paw-orange/10 text-paw-navy hover:text-paw-orange rounded-2xl transition-colors border border-gray-200"
                      title="Share this pet"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>

                  {/* Primary CTA */}
                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(true)}
                    className="w-full bg-paw-orange hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-paw-orange/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Heart size={18} fill="currentColor" />
                    APPLY TO ADOPT {pet.name.toUpperCase()}
                  </button>

                  {/* Secondary CTA: Visit Shelter */}
                  <button
                    type="button"
                    onClick={() => setIsVisitOpen(true)}
                    className="w-full bg-paw-navy hover:bg-[#1a385c] text-white py-3.5 rounded-2xl font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-paw-navy/15 cursor-pointer"
                  >
                    <Building2 size={16} />
                    Request Shelter Visit to Meet {pet.name}
                  </button>
                </div>
              </div>

              {/* Master Facts Card */}
              <div className="bg-white rounded-[28px] p-6 shadow-xl border border-paw-orange/10 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-paw-navy flex items-center gap-1.5">
                  <Tag size={13} className="text-paw-orange" />
                  Quick Details
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-paw-bg/70 p-3 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-gray-400">Gender</p>
                    <p className="text-xs font-black text-paw-navy capitalize">{pet.gender || 'Unknown'}</p>
                  </div>

                  <div className="bg-paw-bg/70 p-3 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-gray-400">Age</p>
                    <p className="text-xs font-black text-paw-navy">{pet.age || 'Unknown'}</p>
                  </div>

                  <div className="bg-paw-bg/70 p-3 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-gray-400">Weight</p>
                    <p className="text-xs font-black text-paw-navy">{pet.weight || 'Evaluated'}</p>
                  </div>

                  <div className="bg-paw-bg/70 p-3 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-gray-400">Microchip</p>
                    <p className="text-xs font-black text-paw-navy font-mono truncate">
                      {pet.microchip_id || 'Not Microchipped'}
                    </p>
                  </div>

                  <div className="bg-paw-bg/70 p-3 rounded-xl col-span-2">
                    <p className="text-[10px] font-black uppercase text-gray-400">Shelter Admission</p>
                    <p className="text-xs font-black text-paw-blue flex items-center gap-1 mt-0.5">
                      <Clock size={12} />
                      {(() => {
                        const days = Math.max(0, pet.shelterDays || 0);
                        if (days === 0) return 'Admitted today';
                        if (days < 30) return `${days} days under care`;
                        return `${Math.floor(days / 30)} months under care`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Information & Health History (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Pet Story */}
              <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-xl border border-paw-orange/10 space-y-4">
                <h2 className="text-xl font-black text-paw-navy flex items-center gap-2">
                  <Sparkles size={20} className="text-paw-orange" />
                  About {pet.name}
                </h2>

                <p className="text-gray-700 leading-relaxed font-medium text-sm md:text-base">
                  {pet.story || 'This sweet rescue is looking for a caring forever home!'}
                </p>

                {pet.behavior && (
                  <div className="bg-paw-bg p-4 rounded-2xl space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-paw-navy">
                      Temperament & Personality
                    </p>
                    <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                      {pet.behavior}
                    </p>
                  </div>
                )}

                {(pet.rescue_story || pet.rescue_location) && (
                  <div className="bg-paw-blue/10 p-4 rounded-2xl space-y-1.5">
                    <p className="text-xs font-black uppercase tracking-wider text-paw-blue flex items-center gap-1.5">
                      <MapPin size={13} />
                      Rescue Story & Background
                    </p>
                    {pet.rescue_location && (
                      <p className="text-xs text-gray-600 font-bold">
                        Rescue Origin: <span className="text-paw-navy">{pet.rescue_location}</span>
                        {pet.rescue_date ? ` • Rescued on ${pet.rescue_date}` : ''}
                      </p>
                    )}
                    {pet.rescue_story && (
                      <p className="text-xs text-gray-700 font-medium leading-relaxed">
                        {pet.rescue_story}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Health & Medical Master Record */}
              <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-xl border border-paw-orange/10 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-black text-paw-navy flex items-center gap-2">
                    <Stethoscope size={20} className="text-paw-blue" />
                    Medical & Health Records
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      pet.vaccinated
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pet.vaccinated ? 'Fully Vaccinated' : 'Vaccination In Progress'}
                  </span>
                </div>

                {pet.special_needs && (
                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
                    <AlertCircle size={18} className="text-paw-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">Special Care Needs</p>
                      <p className="text-xs font-semibold mt-0.5">{pet.special_needs}</p>
                    </div>
                  </div>
                )}

                {/* Vaccinations */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-paw-navy flex items-center gap-1.5">
                    <Shield size={14} className="text-paw-green" />
                    Vaccination History
                  </h4>

                  {vaccinationRecords.length > 0 ? (
                    <div className="space-y-2">
                      {vaccinationRecords.map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-paw-bg/60 border border-gray-100 rounded-2xl p-3.5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-black text-paw-navy text-sm">{rec.title}</p>
                            <p className="text-[11px] text-gray-500 font-medium">
                              {rec.performed_date ? `Date: ${rec.performed_date}` : ''}
                              {rec.veterinarian ? ` • Dr. ${rec.veterinarian}` : ''}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                            {rec.status || 'Completed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 bg-paw-bg/40 p-4 rounded-2xl">
                      Vaccinations verified by ISF shelter veterinarian protocol.
                    </p>
                  )}
                </div>

                {/* Medical Checkups */}
                {otherMedicalRecords.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-black uppercase tracking-wider text-paw-navy flex items-center gap-1.5">
                      <Activity size={14} className="text-paw-blue" />
                      Veterinary Care & Checkups
                    </h4>

                    <div className="space-y-2">
                      {otherMedicalRecords.map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-paw-bg/60 border border-gray-100 rounded-2xl p-3.5 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-black text-paw-navy text-sm">{rec.title}</p>
                            <span className="text-[11px] text-gray-500 font-bold">
                              {rec.performed_date || 'Recent'}
                            </span>
                          </div>
                          {rec.notes && (
                            <p className="text-gray-600 text-xs font-medium">{rec.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Adoption Wizard */}
      {isWizardOpen && (
        <AdoptionWizard
          pet={pet}
          onClose={() => setIsWizardOpen(false)}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        pet={pet}
      />

      {/* Shelter Visit Modal */}
      <ShelterVisitModal
        isOpen={isVisitOpen}
        onClose={() => setIsVisitOpen(false)}
        pets={[{ id: pet.id, name: pet.name }]}
        preselectedPetId={pet.id}
      />

      <Footer />
    </div>
  );
}

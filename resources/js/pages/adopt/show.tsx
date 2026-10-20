import React, { useState, useMemo } from 'react';
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
  Building2,
  AlertCircle,
  CheckCircle2,
  Scale,
  Syringe,
  ChevronRight,
  ExternalLink,
  Star,
  Dog,
  Cat,
  PawPrint,
  Home,
  HeartHandshake,
  UserCheck,
  ChevronLeft,
  ShieldCheck,
  Images,
  Maximize2,
  X,
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { AdoptionWizard } from '@/components/adoption/adoption-wizard';
import { ShareModal } from '@/components/adoption/share-modal';
import { ShelterVisitModal } from '@/components/adoption/shelter-visit-modal';
import { AdoptPetDetail } from '@/components/adoption/pet-detail-modal';

interface PetShowProps {
  pet: AdoptPetDetail;
}

const TABS = [
  'Overview',
  'Rescue Story',
  'Health & Medical',
  'Care History',
  'Adoption',
] as const;

type TabType = typeof TABS[number];

export default function PetShow({ pet }: PetShowProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isVisitOpen, setIsVisitOpen] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const primaryPhoto = pet.img || pet.mainImg || pet.photo_url || '';
  const rawPhotos = Array.isArray(pet.photos) && pet.photos.length > 0
    ? pet.photos
    : [primaryPhoto, ...(Array.isArray(pet.gallery_photos) ? pet.gallery_photos : [])];
  const allPhotos = Array.from(new Set(rawPhotos.filter(Boolean))) as string[];
  const safePhotoIdx = allPhotos.length > 0 ? activePhotoIdx % allPhotos.length : 0;
  const currentMainPhoto = allPhotos[safePhotoIdx] || primaryPhoto;
  const beforePhoto = pet.before_photo_url ?? pet.beforeImg ?? null;
  const afterPhoto = pet.after_photo_url ?? pet.afterImg ?? null;
  const isRescued = pet.is_rescued ?? true;
  const rescuedTagLabel = pet.rescued_tag || 'Rescued • In Shelter Care';

  // Determine if pet is currently available for adoption
  const isAvailable = (pet.status || 'available').toLowerCase() === 'available';

  // Only include Adoption tab when pet is currently available for adoption
  const availableTabs = useMemo(
    () => (isAvailable ? TABS : TABS.filter((tab) => tab !== 'Adoption')),
    [isAvailable]
  );

  // Derived pet properties
  const animalTypeLower = (pet.type || '').toLowerCase();
  const SpeciesIcon = animalTypeLower === 'cat' ? Cat : animalTypeLower === 'dog' ? Dog : PawPrint;
  const speciesName = pet.type ? pet.type.charAt(0).toUpperCase() + pet.type.slice(1) : 'Dog';

  const typeLetter = animalTypeLower === 'dog' ? 'D' : animalTypeLower === 'cat' ? 'C' : 'A';
  const animalCode = pet.code || `PAW-${typeLetter}-${String(pet.id).padStart(4, '0')}`;

  const medicalRecords = pet.medical_records || [];

  const hasDeworming = medicalRecords.some(
    (r) =>
      r.title.toLowerCase().includes('deworm') ||
      (r.notes && r.notes.toLowerCase().includes('deworm'))
  );

  const hasSpayed = medicalRecords.some(
    (r) =>
      r.title.toLowerCase().includes('spay') ||
      r.title.toLowerCase().includes('neuter') ||
      r.title.toLowerCase().includes('castrat') ||
      (r.notes &&
        (r.notes.toLowerCase().includes('spay') || r.notes.toLowerCase().includes('neuter')))
  );

  const latestVetVisit =
    medicalRecords.length > 0
      ? [...medicalRecords].sort((a, b) =>
          (b.performed_date || '').localeCompare(a.performed_date || '')
        )[0]?.performed_date
      : null;

  const latestVeterinarian = medicalRecords.find((r) => r.veterinarian)?.veterinarian || null;
  const latestVetClinic = latestVeterinarian ? 'ISF Veterinary Partner Clinic' : null;

  const getStatusBadge = () => {
    const st = (pet.status || 'available').toLowerCase();
    switch (st) {
      case 'available':
        return {
          label: pet.status_label || 'AVAILABLE FOR ADOPTION',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        };
      case 'treatment':
        return {
          label: pet.status_label || 'UNDER MEDICAL TREATMENT',
          className: 'bg-amber-50 text-amber-700 border-amber-200/80',
        };
      case 'foster':
        return {
          label: pet.status_label || 'IN FOSTER CARE',
          className: 'bg-blue-50 text-blue-700 border-blue-200/80',
        };
      case 'quarantine':
        return {
          label: pet.status_label || 'IN HEALTH QUARANTINE',
          className: 'bg-purple-50 text-purple-700 border-purple-200/80',
        };
      case 'adopted':
        return {
          label: pet.status_label || 'ADOPTED (FOREVER HOME)',
          className: 'bg-teal-50 text-teal-700 border-teal-200/80',
        };
      case 'deceased':
        return {
          label: pet.status_label || 'DECEASED / IN MEMORIAM',
          className: 'bg-slate-100 text-slate-700 border-slate-300',
        };
      default:
        return {
          label: pet.status_label || 'IN SHELTER CARE',
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="min-h-screen bg-[#faf8f5] font-quicksand flex flex-col text-slate-800">
      <Head title={`${pet.name} - Profile | Pawlse`} />
      <Header />

      <main className="flex-1 py-6 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Back links / navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Link
                href="/adopt"
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-amber-600 transition-colors group cursor-pointer"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                All Adoptable Pets
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                href="/animals"
                className="text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
              >
                Master Registry Overview
              </Link>
            </div>

            {!isAvailable && (
              <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                Animal Master Record View
              </span>
            )}
          </div>

          {/* Top Hero Card */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-100/90 mb-8 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-10 items-stretch">
              {/* Photo & Gallery Container */}
              <div className="w-full md:w-[350px] lg:w-[380px] shrink-0 flex flex-col gap-3">
                <div className="relative aspect-square sm:aspect-[4/3] md:aspect-square rounded-[2rem] overflow-hidden bg-slate-100 shadow-xs group">
                  <ImageWithFallback
                    src={currentMainPhoto}
                    alt={pet.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                  />

                  {/* Rescued & Sheltered Pill Overlay */}
                  {isRescued && (
                    <div className="absolute top-3.5 left-3.5 bg-emerald-600/95 text-white backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-md border border-emerald-400/40 z-10">
                      <ShieldCheck size={13} className="shrink-0" />
                      <span>{rescuedTagLabel}</span>
                    </div>
                  )}

                  {/* Fullscreen Lightbox Trigger */}
                  {currentMainPhoto && (
                    <button
                      type="button"
                      onClick={() => setLightboxPhoto(currentMainPhoto)}
                      className="absolute bottom-3.5 right-3.5 bg-slate-900/70 hover:bg-slate-900 text-white p-2.5 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                      title="View full image"
                    >
                      <Maximize2 size={15} />
                    </button>
                  )}

                  {/* Multi-image Prev / Next navigation */}
                  {allPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActivePhotoIdx((safePhotoIdx - 1 + allPhotos.length) % allPhotos.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-900/65 hover:bg-slate-900/90 text-white p-2 rounded-full backdrop-blur-xs transition-all z-20 cursor-pointer"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePhotoIdx((safePhotoIdx + 1) % allPhotos.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900/65 hover:bg-slate-900/90 text-white p-2 rounded-full backdrop-blur-xs transition-all z-20 cursor-pointer"
                        aria-label="Next photo"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <div className="absolute bottom-3.5 left-3.5 bg-slate-900/75 text-white backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 z-20">
                        <Images size={12} />
                        <span>{safePhotoIdx + 1} / {allPhotos.length}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Clickable Thumbnail Strip when multiple photos exist */}
                {allPhotos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {allPhotos.map((photoUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          idx === safePhotoIdx
                            ? 'border-amber-500 ring-2 ring-amber-500/25 scale-105'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <ImageWithFallback src={photoUrl} alt={`${pet.name} photo ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Content */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`font-bold text-[11px] uppercase px-3 py-1 rounded-full tracking-wide border shadow-2xs ${statusBadge.className}`}
                      >
                        {statusBadge.label}
                      </span>
                      {isRescued && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold text-[11px] uppercase px-3 py-1 rounded-full tracking-wide">
                          <ShieldCheck size={12} />
                          {rescuedTagLabel}
                        </span>
                      )}
                      <span className="bg-slate-100 text-slate-500 font-mono text-[11px] font-semibold px-3 py-1 rounded-full">
                        {animalCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsShareOpen(true)}
                        className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors border border-slate-200/60 cursor-pointer"
                        title="Share animal profile"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Animal Name */}
                  <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight my-1">
                    {pet.name}
                  </h1>

                  {/* Species & Gender */}
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-sm mb-5">
                    <SpeciesIcon size={18} className="text-amber-500 shrink-0" />
                    <span>{speciesName}</span>
                    <span className="text-slate-300">·</span>
                    <span>{pet.gender || 'Unknown'}</span>
                    {pet.breed && pet.breed !== 'Mixed Breed' && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 font-medium">{pet.breed}</span>
                      </>
                    )}
                  </div>

                  {/* 3 Mini Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    <div className="bg-[#f8fafc] border border-slate-100/80 rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">
                        <Calendar size={13} className="text-slate-400" />
                        ESTIMATED AGE
                      </div>
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {pet.age || 'Not Recorded'}
                      </div>
                    </div>

                    <div className="bg-[#f8fafc] border border-slate-100/80 rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">
                        <Scale size={13} className="text-slate-400" />
                        APPROX. WEIGHT
                      </div>
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {pet.weight || 'Not Recorded'}
                      </div>
                    </div>

                    <div className="bg-[#f8fafc] border border-slate-100/80 rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">
                        <MapPin size={13} className="text-slate-400" />
                        CURRENT CARE
                      </div>
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {pet.current_location || 'ISF Shelter'}
                      </div>
                    </div>
                  </div>

                  {/* Badges Row (Vaccination, Deworming, Spay/Neuter) */}
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200/90 text-slate-600">
                      {pet.vaccinated ? (
                        <CheckCircle2 size={13} className="text-emerald-500" />
                      ) : (
                        <AlertCircle size={13} className="text-slate-400" />
                      )}
                      {pet.vaccinated ? 'VACCINATED' : 'UNKNOWN'}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200/90 text-slate-600">
                      {hasDeworming ? (
                        <CheckCircle2 size={13} className="text-emerald-500" />
                      ) : (
                        <AlertCircle size={13} className="text-slate-400" />
                      )}
                      {hasDeworming ? 'DEWORMED' : 'UNKNOWN'}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200/90 text-slate-600">
                      {hasSpayed ? (
                        <CheckCircle2 size={13} className="text-emerald-500" />
                      ) : (
                        <AlertCircle size={13} className="text-slate-400" />
                      )}
                      {hasSpayed ? 'SPAYED / NEUTERED' : 'UNKNOWN'}
                    </span>
                  </div>
                </div>

                {/* Primary CTA Area */}
                <div>
                  {isAvailable ? (
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsWizardOpen(true)}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all text-sm group"
                        >
                          <Heart size={16} fill="currentColor" />
                          Apply to Adopt
                          <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsVisitOpen(true)}
                          className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-5 py-3.5 rounded-2xl border border-slate-200/90 transition-all text-sm flex items-center gap-2 cursor-pointer"
                        >
                          <Building2 size={15} className="text-slate-500" />
                          Schedule Visit
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-2">
                        Adoption is free. No fees.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200/80 text-slate-700 font-bold px-4 py-3 rounded-2xl text-xs sm:text-sm">
                          <AlertCircle size={16} className="text-amber-500 shrink-0" />
                          <span>Not Open for Adoption</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsVisitOpen(true)}
                          className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-5 py-3 rounded-2xl border border-slate-200/90 transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                        >
                          <Building2 size={15} className="text-slate-500" />
                          Inquire / Shelter Visit
                        </button>

                        <Link
                          href="/donate"
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-3 rounded-2xl transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                        >
                          <Heart size={15} fill="currentColor" />
                          Sponsor Care
                        </Link>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-2">
                        Currently undergoing rehabilitation, specialized shelter care, or foster placement.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2 no-scrollbar mb-8">
            {availableTabs.map((tab: TabType) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 sm:px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                      : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Animal Information */}
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-amber-500" />
                    <h3 className="text-base font-black text-slate-900">Animal Information</h3>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ANIMAL ID</span>
                      <span className="font-bold text-slate-900">{animalCode}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">NAME</span>
                      <span className="font-bold text-slate-900">{pet.name}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SPECIES</span>
                      <span className="font-bold text-slate-900">{speciesName}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">GENDER</span>
                      <span className="font-bold text-slate-900">{pet.gender || 'Not Recorded'}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ESTIMATED AGE</span>
                      <span className="font-bold text-slate-900">{pet.age || 'Not Recorded'}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">APPROX. WEIGHT</span>
                      <span className="font-bold text-slate-900">{pet.weight || 'Not Recorded'}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">COLOR / COAT</span>
                      <span className="font-bold text-slate-900">{pet.color || 'Not Recorded'}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">BREED</span>
                      <span className="font-bold text-slate-900">{pet.breed || 'Not Recorded'}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Care */}
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={18} className="text-amber-500" />
                    <h3 className="text-base font-black text-slate-900">Status & Care</h3>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CURRENT STATUS</span>
                      <span className="font-bold text-slate-900">{pet.status_label || 'Available for Adoption'}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CARE LOCATION</span>
                      <span className="font-bold text-slate-900">{pet.current_location || 'ISF Shelter'}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">RESCUE DATE</span>
                      <span className="font-bold text-slate-900">{pet.rescue_date || 'Not Recorded'}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">RESCUE LOCATION</span>
                      <span className="font-bold text-slate-900">{pet.rescue_location || 'Not Recorded'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Behavior & Compatibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
                  <h3 className="text-base font-black text-slate-900 mb-3">Behavior & Temperament</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    {pet.behavior || 'Not yet observed / recorded.'}
                  </p>
                </div>

                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
                  <h3 className="text-base font-black text-slate-900 mb-3">Compatibility</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    {pet.special_needs || 'Not yet assessed / recorded.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Rescue Story */}
          {activeTab === 'Rescue Story' && (
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-orange-600 text-xs font-bold uppercase tracking-wider mb-4">
                <Heart size={12} fill="currentColor" />
                Rescue Story
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                How {pet.name} Came to ISF
              </h2>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-6">
                <Calendar size={13} className="text-slate-400" />
                Rescue Date: {pet.rescue_date || 'Not Recorded'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    WHERE FOUND
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {pet.rescue_location || 'Not Recorded'}
                  </div>
                </div>

                <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    INITIAL CONDITION
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {pet.intake_type || 'Not Recorded'}
                  </div>
                </div>
              </div>

              <div className="bg-[#f8fafc] border border-slate-100/90 rounded-2xl p-5 text-sm font-medium text-slate-600 leading-relaxed mb-6">
                {pet.rescue_story || pet.story || 'Information to be updated by ISF.'}
              </div>

              {/* Conditional Before & After Transformation Section */}
              {(beforePhoto || afterPhoto) && (
                <div className="bg-amber-50/40 border border-amber-200/70 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-amber-700 font-black text-sm uppercase tracking-wider">
                      <Sparkles size={16} className="text-amber-500" />
                      <span>Before & After Shelter Transformation</span>
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Rescued & Rehabilitated by ISF
                    </span>
                  </div>

                  <div className={`grid grid-cols-1 ${beforePhoto && afterPhoto ? 'sm:grid-cols-2' : ''} gap-5`}>
                    {beforePhoto && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                          When Rescued (Before)
                        </span>
                        <button
                          type="button"
                          onClick={() => setLightboxPhoto(beforePhoto)}
                          className="w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-200 bg-white block shadow-xs cursor-pointer group"
                        >
                          <ImageWithFallback
                            src={beforePhoto}
                            alt={`${pet.name} before rescue`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </button>
                      </div>
                    )}
                    {afterPhoto && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                          In Shelter Care (After)
                        </span>
                        <button
                          type="button"
                          onClick={() => setLightboxPhoto(afterPhoto)}
                          className="w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-emerald-300 bg-white block shadow-xs cursor-pointer group"
                        >
                          <ImageWithFallback
                            src={afterPhoto}
                            alt={`${pet.name} after rescue`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Full Photo Gallery Section inside Rescue Story if multiple photos exist */}
              {allPhotos.length > 1 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Images size={17} className="text-amber-500" />
                    <h3 className="text-base font-black text-slate-900">
                      {pet.name}'s Photo Gallery ({allPhotos.length} Photos)
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {allPhotos.map((photoUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLightboxPhoto(photoUrl)}
                        className="aspect-square rounded-2xl overflow-hidden border border-slate-200 hover:border-amber-500 transition-all group cursor-pointer bg-slate-100"
                      >
                        <ImageWithFallback
                          src={photoUrl}
                          alt={`${pet.name} gallery ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Health & Medical */}
          {activeTab === 'Health & Medical' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Health Snapshot */}
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Syringe size={18} className="text-amber-500" />
                    <h3 className="text-base font-black text-slate-900">Health Snapshot</h3>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">VACCINATION</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-600">
                        {pet.vaccinated ? <CheckCircle2 size={11} className="text-emerald-500" /> : <AlertCircle size={11} className="text-slate-400" />}
                        {pet.vaccinated ? 'VACCINATED' : 'UNKNOWN'}
                      </span>
                    </div>

                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">DEWORMING</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-600">
                        {hasDeworming ? <CheckCircle2 size={11} className="text-emerald-500" /> : <AlertCircle size={11} className="text-slate-400" />}
                        {hasDeworming ? 'COMPLETED' : 'UNKNOWN'}
                      </span>
                    </div>

                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SPAY / NEUTER</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-600">
                        {hasSpayed ? <CheckCircle2 size={11} className="text-emerald-500" /> : <AlertCircle size={11} className="text-slate-400" />}
                        {hasSpayed ? 'COMPLETED' : 'UNKNOWN'}
                      </span>
                    </div>

                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">APPROX. WEIGHT</span>
                      <span className="font-bold text-slate-900">{pet.weight || 'Not Recorded'}</span>
                    </div>

                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">LATEST VET VISIT</span>
                      <span className="font-bold text-slate-900">{latestVetVisit || 'Not Recorded'}</span>
                    </div>

                    <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CURRENT CONDITION</span>
                      <span className="font-bold text-slate-900">{pet.special_needs ? 'Special Care Needed' : 'Not Recorded'}</span>
                    </div>
                  </div>
                </div>

                {/* Veterinary Care */}
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 size={18} className="text-amber-500" />
                      <h3 className="text-base font-black text-slate-900">Veterinary Care</h3>
                    </div>

                    <div className="divide-y divide-slate-100">
                      <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CLINIC</span>
                        <span className="font-bold text-slate-900">{latestVetClinic || 'Not Recorded'}</span>
                      </div>

                      <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">VETERINARIAN</span>
                        <span className="font-bold text-slate-900">{latestVeterinarian || 'Not Recorded'}</span>
                      </div>

                      <div className="py-3 flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">LATEST VISIT</span>
                        <span className="font-bold text-slate-900">{latestVetVisit || 'Not Recorded'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      href="/vet"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors"
                    >
                      View Veterinary Partners <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Detailed Medical Records History if available */}
              {medicalRecords.length > 0 && (
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
                  <h3 className="text-base font-black text-slate-900 mb-4">Medical Record History</h3>
                  <div className="space-y-2.5">
                    {medicalRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{rec.title}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {rec.performed_date ? `Performed: ${rec.performed_date}` : ''}
                            {rec.veterinarian ? ` • Dr. ${rec.veterinarian}` : ''}
                            {rec.batch_number ? ` • Batch: ${rec.batch_number}` : ''}
                          </p>
                          {rec.notes && <p className="text-slate-600 text-xs mt-1">{rec.notes}</p>}
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase self-start sm:self-center">
                          {rec.status || 'Completed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Care History */}
          {activeTab === 'Care History' && (
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-8">
                <Clock size={18} className="text-amber-500" />
                <h3 className="text-base font-black text-slate-900">Lifecycle & Care Timeline</h3>
              </div>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {/* 1. Rescue Milestone */}
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">Rescued</h4>
                    {pet.rescue_date && (
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        {pet.rescue_date}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {pet.rescue_date
                      ? `Rescued${pet.rescue_location ? ` at ${pet.rescue_location}` : ''}. ${pet.rescue_story || ''}`
                      : 'Rescue details recorded by ISF Shelter & Rescue Team.'}
                  </p>
                </div>

                {/* 2. Shelter Admission Milestone */}
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-xs" />
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">In Shelter Protective Care</h4>
                    {pet.admitted_at && (
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                        Admitted {pet.admitted_at}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {pet.admitted_at
                      ? `Admitted to ISF Shelter (${pet.shelterDays || 0} days in shelter care). Location: ${pet.current_location || 'Main Shelter'}.`
                      : 'Currently residing in shelter care.'}
                  </p>
                </div>

                {/* 3. Medical Milestones */}
                {medicalRecords.length > 0 && (
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">Medical Treatments & Vaccinations</h4>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        {medicalRecords.length} Record{medicalRecords.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="mt-2.5 space-y-1.5">
                      {medicalRecords.slice(0, 3).map((rec) => (
                        <div key={rec.id} className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                          <span className="font-semibold">{rec.title}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{rec.performed_date || 'Completed'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Foster Care Placements */}
                {pet.foster_placements && pet.foster_placements.length > 0 ? (
                  pet.foster_placements.map((fp) => (
                    <div key={fp.id} className="relative">
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-xs" />
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">Foster Care Home</h4>
                        <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60 uppercase">
                          {fp.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Placed with {fp.foster_parent_name} {fp.start_date ? `starting ${fp.start_date}` : ''} {fp.end_date ? `until ${fp.end_date}` : '(Current Caretaker)'}.
                      </p>
                    </div>
                  ))
                ) : pet.status === 'foster' ? (
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-xs" />
                    <h4 className="font-bold text-slate-900 text-sm">In Foster Care</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Currently placed in approved foster home ({pet.current_location}).
                    </p>
                  </div>
                ) : null}

                {/* 5. Adoption Stage */}
                {pet.status === 'adopted' ? (
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs ring-4 ring-amber-100" />
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">Adopted into Forever Home</h4>
                      {pet.adoption_date && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          {pet.adoption_date}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Successfully matched and adopted{pet.adopter_name ? ` by ${pet.adopter_name}` : ''}. Now living happily in their forever home!
                    </p>
                  </div>
                ) : pet.status === 'pending' ? (
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-xs" />
                    <h4 className="font-bold text-slate-900 text-sm">Adoption Interview Scheduled</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      An adoption application has been pre-approved and the screening interview is in progress.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow-xs" />
                    <h4 className="font-bold text-slate-600 text-sm">Awaiting Forever Family</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Available for adoption through Iligan Stray Feeders.
                    </p>
                  </div>
                )}

                {/* 6. Post-Adoption Follow-Ups */}
                {pet.follow_ups && pet.follow_ups.length > 0 && (
                  pet.follow_ups.map((fu) => (
                    <div key={fu.id} className="relative">
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-teal-500 border-2 border-white shadow-xs" />
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">Post-Adoption Follow-Up</h4>
                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                          {fu.follow_up_date || 'Check-in'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Condition: <strong className="text-slate-700">{fu.pet_condition}</strong> via {fu.method}. {fu.notes}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Adoption */}
          {activeTab === 'Adoption' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                {/* Left Card: 7 cols */}
                <div className="md:col-span-7 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-lg shadow-orange-500/20 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-black uppercase tracking-wider mb-4">
                      <Star size={13} fill="currentColor" />
                      FREE ADOPTION
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black mb-2">
                      Give {pet.name} a Forever Home
                    </h2>

                    <p className="text-white/90 text-sm font-medium mb-8 leading-relaxed">
                      Adoption through Iligan Stray Feeders is completely free. No fees, no charges.
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setIsWizardOpen(true)}
                      className="bg-white hover:bg-slate-50 text-amber-600 font-bold px-6 py-3.5 rounded-2xl shadow-md inline-flex items-center gap-2 cursor-pointer transition-all text-sm"
                    >
                      <Heart size={16} fill="currentColor" />
                      Apply to Adopt
                    </button>
                  </div>
                </div>

                {/* Right Card: 5 cols */}
                <div className="md:col-span-5 bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 mb-4">Health Summary</h3>

                    <div className="divide-y divide-slate-100">
                      <div className="py-2.5 flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">VACCINATION</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-600">
                          {pet.vaccinated ? <CheckCircle2 size={11} className="text-emerald-500" /> : <AlertCircle size={11} className="text-slate-400" />}
                          {pet.vaccinated ? 'VACCINATED' : 'UNKNOWN'}
                        </span>
                      </div>

                      <div className="py-2.5 flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">DEWORMING</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-600">
                          {hasDeworming ? <CheckCircle2 size={11} className="text-emerald-500" /> : <AlertCircle size={11} className="text-slate-400" />}
                          {hasDeworming ? 'COMPLETED' : 'UNKNOWN'}
                        </span>
                      </div>

                      <div className="py-2.5 flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SPAY / NEUTER</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-600">
                          {hasSpayed ? <CheckCircle2 size={11} className="text-emerald-500" /> : <AlertCircle size={11} className="text-slate-400" />}
                          {hasSpayed ? 'COMPLETED' : 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      SHELTER STAY
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {pet.shelterDays && pet.shelterDays > 0 ? `${pet.shelterDays} days` : 'Not Recorded'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Behavior & Compatibility */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
                <h3 className="text-base font-black text-slate-900 mb-2">Behavior & Compatibility</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {pet.behavior || 'Behavior assessment not yet recorded. ISF volunteers can provide more details.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Adoption Wizard Modal */}
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

      {/* Fullscreen Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-6 right-6 bg-white/15 hover:bg-white/30 text-white p-3 rounded-full transition-colors cursor-pointer"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>
          <img
            src={lightboxPhoto}
            alt={pet.name}
            className="max-w-full max-h-[88vh] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

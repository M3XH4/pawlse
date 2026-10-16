import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  Shield,
  Calendar,
  Info,
  MapPin,
  Activity,
  FileText,
  Share2,
  ExternalLink,
  Tag,
  Clock,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

export interface MedicalRecordItem {
  id: number;
  record_type?: string;
  title: string;
  performed_date?: string | null;
  next_due_date?: string | null;
  veterinarian?: string | null;
  batch_number?: string | null;
  status?: string;
  notes?: string | null;
}

export interface AdoptPetDetail {
  id: number;
  name: string;
  type?: string | null;
  breed: string;
  age: string;
  ageCategory?: string | null;
  gender: string;
  color?: string | null;
  weight?: string | null;
  microchip_id?: string | null;
  intake_type?: string | null;
  current_location?: string | null;
  rescue_date?: string | null;
  rescue_location?: string | null;
  rescue_story?: string | null;
  special_needs?: string | null;
  behavior?: string | null;
  story?: string | null;
  img?: string | null;
  mainImg?: string | null;
  vaccinated: boolean;
  shelterDays: number;
  medical_records?: MedicalRecordItem[];
}

interface PetDetailModalProps {
  pet: AdoptPetDetail | null;
  onClose: () => void;
  onApply: (pet: AdoptPetDetail) => void;
  onShare: (pet: AdoptPetDetail) => void;
}

export function PetDetailModal({
  pet,
  onClose,
  onApply,
  onShare,
}: PetDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'story' | 'health'>('overview');

  if (!pet) return null;

  const vaccinationRecords = (pet.medical_records || []).filter(
    (r) => r.record_type === 'vaccination'
  );
  const otherMedicalRecords = (pet.medical_records || []).filter(
    (r) => r.record_type !== 'vaccination'
  );

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
          layoutId={`pet-${pet.id}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl sm:rounded-3xl z-10 relative shadow-2xl my-auto flex flex-col border-0 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 bg-slate-900/60 hover:bg-slate-900/85 text-white rounded-full backdrop-blur-md shadow-sm transition-all z-30 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="grid md:grid-cols-12 flex-1 overflow-y-auto modal-scroll-area">
            {/* Left Photo & Badges Column (5 cols) */}
            <div className="md:col-span-5 bg-slate-50/70 p-5 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
              <div>
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xs mb-4 bg-slate-100 group">
                  <ImageWithFallback
                    src={pet.img || pet.mainImg || ''}
                    alt={pet.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-orange-600 font-bold text-xs flex items-center gap-1.5 shadow-xs border border-orange-100">
                    <Heart size={12} fill="currentColor" />
                    Available for Adoption
                  </div>

                  {/* Vaccination Pill */}
                  <div
                    className={`absolute top-3 right-3 ${
                      pet.vaccinated ? 'bg-emerald-600 text-white' : 'bg-slate-800/80 text-white'
                    } backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] font-semibold shadow-xs`}
                  >
                    <Shield size={11} />
                    <span>{pet.vaccinated ? 'Vaccinated' : 'Pending Vaccines'}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                    {pet.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Tag size={13} className="text-orange-500" />
                    {pet.breed} {pet.type ? `• ${pet.type}` : ''}
                  </p>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-200/70">
                <div className="bg-white p-3 rounded-xl shadow-2xs border border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Gender</p>
                  <p className="text-sm font-bold text-slate-800 capitalize mt-0.5">{pet.gender || 'Unknown'}</p>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-2xs border border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Age</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{pet.age || 'Unknown'}</p>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-2xs border border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Time in Care</p>
                  <p className="text-sm font-bold text-sky-700 flex items-center gap-1 mt-0.5">
                    <Clock size={13} />
                    {(() => {
                      const days = Math.max(0, pet.shelterDays || 0);
                      if (days === 0) return 'Today';
                      if (days < 30) return `${days}d`;
                      return `${Math.floor(days / 30)}mo`;
                    })()}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-2xs border border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Location</p>
                  <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                    {pet.current_location || 'Main Shelter'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content & Tabs Column (7 cols) */}
            <div className="md:col-span-7 p-5 sm:p-6 md:p-7 flex flex-col justify-between">
              <div>
                {/* 3 Tabs: Overview, Story, Health */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-5">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'overview'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Info size={14} />
                    Overview
                  </button>

                  <button
                    onClick={() => setActiveTab('story')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'story'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText size={14} />
                    Story
                  </button>

                  <button
                    onClick={() => setActiveTab('health')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'health'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Stethoscope size={14} />
                    Health
                  </button>
                </div>

                {/* Tab 1: Overview */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3.5"
                  >
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Color / Coat</p>
                        <p className="font-semibold text-slate-800 text-sm mt-0.5">{pet.color || 'Standard'}</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Weight</p>
                        <p className="font-semibold text-slate-800 text-sm mt-0.5">{pet.weight || 'Recorded on site'}</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Microchip ID</p>
                        <p className="font-semibold text-slate-800 text-sm font-mono mt-0.5 truncate">
                          {pet.microchip_id || 'Not Microchipped'}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Intake Type</p>
                        <p className="font-semibold text-slate-800 text-sm capitalize mt-0.5">
                          {pet.intake_type || 'Rescue / Stray'}
                        </p>
                      </div>
                    </div>

                    {pet.behavior && (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-orange-500" />
                          Behavior & Personality
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                          {pet.behavior}
                        </p>
                      </div>
                    )}

                    {pet.special_needs && (
                      <div className="bg-amber-50/70 border border-amber-200/70 p-3.5 rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1.5">
                          <AlertTriangle size={13} className="text-orange-500" />
                          Special Care Notes
                        </p>
                        <p className="text-xs font-medium text-amber-950 leading-relaxed">
                          {pet.special_needs}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Tab 2: Story */}
                {activeTab === 'story' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3.5"
                  >
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        My Story
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {pet.story || 'This friendly shelter resident is patiently waiting for their forever family!'}
                      </p>
                    </div>

                    {(pet.rescue_story || pet.rescue_location) && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <MapPin size={13} className="text-orange-500" />
                          Rescue Journey
                        </h4>
                        {pet.rescue_location && (
                          <p className="text-xs text-slate-600 font-medium">
                            Rescued from: <span className="text-slate-900 font-semibold">{pet.rescue_location}</span>
                            {pet.rescue_date ? ` on ${pet.rescue_date}` : ''}
                          </p>
                        )}
                        {pet.rescue_story && (
                          <p className="text-xs text-slate-600 leading-relaxed font-normal mt-1">
                            {pet.rescue_story}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Tab 3: Health */}
                {activeTab === 'health' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3.5 max-h-[300px] overflow-y-auto modal-scroll-area pr-1"
                  >
                    {/* Master Health Summary Bar */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className={pet.vaccinated ? 'text-emerald-600' : 'text-slate-400'} />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Vaccine Status</p>
                          <p className="text-xs font-bold text-slate-800">
                            {pet.vaccinated ? 'Fully Vaccinated' : 'In Progress'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-orange-500" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Weight</p>
                          <p className="text-xs font-bold text-slate-800">
                            {pet.weight || 'Evaluated on intake'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vaccination Records */}
                    <div>
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                        <Shield size={13} className="text-emerald-600" />
                        Vaccination History
                      </h5>
                      {vaccinationRecords.length > 0 ? (
                        <div className="space-y-1.5">
                          {vaccinationRecords.map((rec) => (
                            <div
                              key={rec.id}
                              className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-2xs flex items-center justify-between text-xs"
                            >
                              <div>
                                <p className="font-semibold text-slate-900">{rec.title}</p>
                                <p className="text-[11px] text-slate-500">
                                  {rec.performed_date ? `Administered: ${rec.performed_date}` : ''}
                                  {rec.veterinarian ? ` • Dr. ${rec.veterinarian}` : ''}
                                </p>
                              </div>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase">
                                {rec.status || 'Completed'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {pet.vaccinated
                            ? 'Vaccinations verified and current per ISF shelter protocol.'
                            : 'Vaccination updates are scheduled with shelter veterinary partners.'}
                        </div>
                      )}
                    </div>

                    {/* Medical Checkups & Treatments */}
                    {otherMedicalRecords.length > 0 && (
                      <div>
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                          <Stethoscope size={13} className="text-sky-600" />
                          Veterinary Records & Treatments
                        </h5>
                        <div className="space-y-1.5">
                          {otherMedicalRecords.map((rec) => (
                            <div
                              key={rec.id}
                              className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-2xs text-xs space-y-0.5"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-slate-900">{rec.title}</p>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {rec.performed_date || 'Recent'}
                                </span>
                              </div>
                              {rec.notes && <p className="text-slate-600 text-[11px]">{rec.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Action Buttons Section */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                {/* 1. Main Button: Apply to Adopt */}
                <button
                  type="button"
                  onClick={() => onApply(pet)}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-3 px-6 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart size={16} fill="currentColor" />
                  Apply to Adopt {pet.name}
                </button>

                {/* 2. Side-by-side buttons: Share & View Full Profile */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onShare(pet)}
                    className="w-full bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200/60 cursor-pointer"
                  >
                    <Share2 size={14} className="text-slate-600" />
                    Share
                  </button>

                  <a
                    href={`/adopt/${pet.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <ExternalLink size={14} />
                    View Full Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

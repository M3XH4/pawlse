import {
  Heart,
  Filter,
  Search,
  X,
  Info,
  Shield,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Eye,
  Share2,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  FileText,
  PhoneCall,
  Home,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { AdoptionWizard } from '@/components/adoption/adoption-wizard';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { PetDetailModal, AdoptPetDetail } from '@/components/adoption/pet-detail-modal';
import { ShelterVisitModal } from '@/components/adoption/shelter-visit-modal';
import { RehomingModal } from '@/components/adoption/rehoming-modal';
import { ShareModal } from '@/components/adoption/share-modal';

interface AdoptProps {
  pets: AdoptPetDetail[];
}

export default function Adopt({ pets = [] }: AdoptProps) {
  const [selectedPet, setSelectedPet] = useState<AdoptPetDetail | null>(null);
  const [applyingPet, setApplyingPet] = useState<AdoptPetDetail | null>(null);
  const [sharingPet, setSharingPet] = useState<AdoptPetDetail | null>(null);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isRehomingModalOpen, setIsRehomingModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const animalsCatalogRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    color: 'All',
    breed: 'All',
    gender: 'All',
    ageCategory: 'All',
    sortBy: 'newest', // 'newest', 'longest', 'name'
  });

  const safePets = useMemo(() => (Array.isArray(pets) ? pets : []), [pets]);

  // Dynamic Search Suggestions
  const searchSuggestions = useMemo(() => {
    const suggestions = new Set<string>();
    safePets.forEach((pet) => {
      if (pet?.name) suggestions.add(pet.name);
      if (pet?.breed) suggestions.add(pet.breed);
      if (pet?.color) suggestions.add(pet.color);
      if (pet?.gender) suggestions.add(pet.gender);
      if (pet?.ageCategory) suggestions.add(pet.ageCategory);
    });
    return Array.from(suggestions);
  }, [safePets]);

  // Search suggestions
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return searchSuggestions.filter((s) => s.toLowerCase().includes(query)).slice(0, 6);
  }, [searchQuery, searchSuggestions]);

  // Filter and sort pets
  const filteredPets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = safePets.filter((pet) => {
      const name = (pet?.name || '').toLowerCase();
      const breed = (pet?.breed || '').toLowerCase();
      const color = (pet?.color || '').toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        breed.includes(query) ||
        color.includes(query);

      const matchesColor = filters.color === 'All' || pet?.color === filters.color;
      const matchesBreed = filters.breed === 'All' || pet?.breed === filters.breed;
      const matchesGender = filters.gender === 'All' || pet?.gender === filters.gender;
      const matchesAge = filters.ageCategory === 'All' || pet?.ageCategory === filters.ageCategory;

      return matchesSearch && matchesColor && matchesBreed && matchesGender && matchesAge;
    });

    if (filters.sortBy === 'longest') {
      result.sort((a, b) => (b.shelterDays || 0) - (a.shelterDays || 0));
    } else if (filters.sortBy === 'newest') {
      result.sort((a, b) => (a.shelterDays || 0) - (b.shelterDays || 0));
    } else if (filters.sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [safePets, searchQuery, filters]);

  // Unique values for filters
  const uniqueColors = useMemo(
    () => ['All', ...Array.from(new Set(safePets.map((p) => p.color).filter(Boolean)))],
    [safePets]
  );
  const uniqueBreeds = useMemo(
    () => ['All', ...Array.from(new Set(safePets.map((p) => p.breed).filter(Boolean)))],
    [safePets]
  );
  const uniqueAgeCategories = ['All', 'Puppy', 'Kitten', 'Young', 'Adult', 'Senior'];

  const scrollToAnimals = () => {
    animalsCatalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-quicksand">
      <Head title="Find Your New Best Friend - Adopt | Pawlse" />
      <Header />

      {/* 1. HERO SECTION (Image 1 reference) */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-[#FDFBF7] to-[#FAF7F2] border-b border-orange-100/40">
        {/* Subtle Decorative Paw prints in the background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] select-none overflow-hidden">
          <div className="absolute top-10 left-12 text-7xl font-black">🐾</div>
          <div className="absolute top-24 right-20 text-8xl font-black rotate-12">🐾</div>
          <div className="absolute bottom-8 left-1/4 text-6xl font-black -rotate-12">🐾</div>
          <div className="absolute bottom-16 right-1/3 text-7xl font-black rotate-45">🐾</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            {/* Free Adoption Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-[#FF9B00] text-white px-4 py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-wider shadow-lg shadow-orange-500/20 mb-6"
            >
              <Heart size={14} fill="currentColor" />
              <span>FREE ADOPTION — NO FEES, NO PRICE TAGS</span>
            </motion.div>

            {/* Hero Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#0B2340] leading-[1.08] tracking-tight mb-6"
            >
              Give Them a Home, <br />
              <span className="text-[#FF9B00]">Not a Price Tag.</span>
            </motion.h1>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3 text-gray-600 text-base md:text-lg font-medium leading-relaxed max-w-2xl mb-8"
            >
              <p>
                ISF does not charge an adoption fee. Every application is assessed to help each animal find a suitable and responsible home.
              </p>
              <p className="text-sm md:text-base text-gray-500">
                Adoption outside Iligan City is also welcome — ISF has placed animals in Cagayan de Oro, Marawi, and beyond.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                type="button"
                onClick={scrollToAnimals}
                className="bg-[#FF9B00] hover:bg-[#e68a00] text-white px-7 py-4 rounded-2xl font-black text-base shadow-xl shadow-orange-500/25 hover:shadow-orange-500/35 transition-all flex items-center gap-2.5 cursor-pointer active:scale-95"
              >
                <Heart size={18} fill="currentColor" />
                Meet Our Animals
              </button>

              <button
                type="button"
                onClick={() => setIsVisitModalOpen(true)}
                className="bg-white hover:bg-gray-50 text-[#0B2340] px-7 py-4 rounded-2xl font-black text-base border-2 border-gray-200/80 shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer active:scale-95"
              >
                <Building2 size={18} className="text-[#0B2340]" />
                Visit the Shelter
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW ISF ADOPTION WORKS SECTION (Matching Image Reference with Lucide Icons) */}
      <section className="bg-[#0B1E36] text-white py-7 md:py-9 border-y border-white/5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[180px] bg-paw-orange/5 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Section Heading */}
          <div className="text-center mb-6 md:mb-7">
            <h2 className="text-[11px] sm:text-xs font-black tracking-widest text-[#FF9B00] uppercase">
              How ISF Adoption Works
            </h2>
          </div>

          {/* Steps Grid / Horizontal Flow */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 lg:gap-2 items-start">
            {[
              {
                icon: FileText,
                iconColor: 'text-amber-400',
                title: 'Apply',
                description: 'Submit your adoption application online or in person.',
              },
              {
                icon: Search,
                iconColor: 'text-sky-400',
                title: 'Assessment',
                description: 'ISF reviews your application and suitability.',
              },
              {
                icon: PhoneCall,
                iconColor: 'text-rose-400',
                title: 'Interview',
                description: 'A call or visit to get to know you better.',
              },
              {
                icon: CheckCircle2,
                iconColor: 'text-emerald-400',
                title: 'Approval',
                description: 'ISF makes the final decision — no auto-approval.',
              },
              {
                icon: Home,
                iconColor: 'text-orange-400',
                title: 'Handover',
                description: 'House-to-house delivery or shelter pick-up.',
              },
              {
                icon: Heart,
                iconColor: 'text-pink-400',
                title: 'Follow-Up',
                description: 'ISF stays in touch after adoption.',
              },
            ].map((step, idx, arr) => {
              const IconComp = step.icon;
              return (
                <div key={idx} className="relative flex flex-col items-center text-center group px-1">
                  {/* Icon Card & Chevron */}
                  <div className="relative mb-2.5 flex items-center justify-center w-full">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center shadow-md group-hover:scale-105 group-hover:bg-white/[0.14] group-hover:border-paw-orange/40 transition-all duration-200">
                      <IconComp size={18} className={`${step.iconColor} transition-transform group-hover:scale-110`} />
                    </div>

                    {/* Connector Chevron for desktop */}
                    {idx < arr.length - 1 && (
                      <div className="hidden lg:flex absolute right-0 translate-x-1/2 text-white/20 pointer-events-none">
                        <ChevronRight size={13} />
                      </div>
                    )}
                  </div>

                  {/* Step Title */}
                  <h3 className="font-black text-[11px] sm:text-xs text-[#FF9B00] uppercase tracking-wider mb-1">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium leading-relaxed max-w-[145px]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Disclaimer without separation line */}
          <div className="text-center mt-6 md:mt-7">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              ISF makes the final adoption decision. No automatic approval. Same-day approval possible at adoption fairs when appropriate.
            </p>
          </div>
        </div>
      </section>

      {/* 3. ADOPTABLE ANIMALS CATALOG SECTION */}
      <section ref={animalsCatalogRef} className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <div className="flex items-center gap-2 text-paw-orange font-black text-xs uppercase tracking-widest mb-2">
                <Sparkles size={14} />
                <span>Our Shelter Residents</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-paw-navy">Find Your Forever Companion</h2>
              <p className="text-gray-500 font-medium mt-1">
                Every pet in our care has a story. By adopting, you give them a second chance at a happy life.
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {/* Search Box */}
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, breed, or color..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-paw-orange/15 rounded-2xl outline-none focus:border-paw-orange transition-colors shadow-md shadow-paw-navy/5 font-bold text-sm text-paw-navy placeholder:font-medium placeholder:text-gray-400"
                />

                {/* Search Suggestions */}
                <AnimatePresence>
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-30"
                    >
                      <div className="p-2.5 bg-paw-bg border-b border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suggestions</p>
                      </div>
                      {filteredSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-paw-bg transition-all text-xs font-bold text-paw-navy"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3.5 rounded-2xl text-white transition-all shadow-md cursor-pointer ${
                  showFilters ? 'bg-paw-navy' : 'bg-[#FF9B00] hover:bg-orange-600'
                }`}
                title="Toggle Filters"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-[32px] p-6 md:p-8 shadow-xl border border-gray-100 mb-8"
              >
                <h3 className="font-black text-paw-navy text-lg mb-5">Filter Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Color */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Color</label>
                    <select
                      value={filters.color}
                      onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold text-xs transition-colors bg-white"
                    >
                      {uniqueColors.map((color) => (
                        <option key={color}>{color}</option>
                      ))}
                    </select>
                  </div>

                  {/* Breed */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Breed</label>
                    <select
                      value={filters.breed}
                      onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold text-xs transition-colors bg-white"
                    >
                      {uniqueBreeds.map((breed) => (
                        <option key={breed}>{breed}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Gender</label>
                    <select
                      value={filters.gender}
                      onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold text-xs transition-colors bg-white"
                    >
                      <option>All</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Age</label>
                    <select
                      value={filters.ageCategory}
                      onChange={(e) => setFilters({ ...filters, ageCategory: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold text-xs transition-colors bg-white"
                    >
                      {uniqueAgeCategories.map((age) => (
                        <option key={age}>{age}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold text-xs transition-colors bg-white"
                    >
                      <option value="newest">Newest in Shelter</option>
                      <option value="longest">Longest in Shelter</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500">
                    Showing <span className="text-paw-orange font-black">{filteredPets.length}</span> of <span className="font-black text-paw-navy">{pets.length}</span> pets
                  </p>
                  <button
                    onClick={() => {
                      setFilters({ color: 'All', breed: 'All', gender: 'All', ageCategory: 'All', sortBy: 'newest' });
                      setSearchQuery('');
                    }}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-black text-xs text-paw-navy transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animals Grid */}
          {filteredPets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl mb-4 border border-gray-100">
                <Search size={64} className="text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-paw-navy mb-2">No adoptable animals found</h3>
              <p className="text-gray-500 font-bold max-w-md mb-6 text-sm">
                Try adjusting your search criteria or clear your filters to see all shelter residents.
              </p>
              <button
                onClick={() => {
                  setFilters({ color: 'All', breed: 'All', gender: 'All', ageCategory: 'All', sortBy: 'newest' });
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-[#FF9B00] text-white rounded-2xl font-black hover:bg-paw-navy transition-colors text-sm shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredPets.map((pet) => (
                <motion.div
                  key={pet.id}
                  layoutId={`pet-${pet.id}`}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedPet(pet)}
                  className="bg-white rounded-[24px] overflow-hidden shadow-lg shadow-paw-navy/5 cursor-pointer group border border-gray-100 transition-all hover:shadow-xl"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={pet.img || pet.mainImg || ''}
                      alt={pet.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />

                    {/* Vaccination Badge */}
                    <div
                      className={`absolute top-2.5 right-2.5 ${
                        pet.vaccinated ? 'bg-paw-green' : 'bg-gray-500/90'
                      } backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md`}
                    >
                      <Shield size={10} className="text-white" />
                      <span className="text-white font-black text-[8px] uppercase">
                        {pet.vaccinated ? 'Vaccinated' : 'Pending'}
                      </span>
                    </div>

                    {/* Available Badge */}
                    <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[#FF9B00] font-black text-[9px] flex items-center gap-1 shadow-md">
                      <Heart size={9} fill="currentColor" />
                      Available
                    </div>
                  </div>

                  <div className="p-3.5">
                    <h3 className="text-base md:text-lg font-black text-paw-navy mb-1 truncate">
                      {pet.name}
                    </h3>

                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase truncate max-w-[110px]">
                        {pet.breed}
                      </span>
                      {pet.color && (
                        <span className="bg-sky-100 text-sky-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase truncate max-w-[90px]">
                          {pet.color}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mb-3 text-[10px] font-bold text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Info size={11} className="text-paw-orange shrink-0" />
                        <span>{pet.age} • {pet.gender}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-paw-blue shrink-0" />
                        <span>
                          {(() => {
                            const days = Math.max(0, pet.shelterDays || 0);
                            if (days === 0) return 'Admitted today';
                            if (days < 30) return `${days}d in care`;
                            return `${Math.floor(days / 30)}mo in care`;
                          })()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full bg-[#0B2340] text-white py-2 rounded-xl font-black text-[10px] hover:bg-paw-orange transition-colors uppercase tracking-wider shadow-sm"
                    >
                      Meet {pet.name}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Redirect to Animal Master Record Overview */}
          <div className="mt-12 bg-white rounded-[2.5rem] p-6 sm:p-10 border border-amber-200/70 shadow-xl shadow-amber-500/5 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-paw-orange text-xs font-black uppercase tracking-wider">
                  <Sparkles size={13} />
                  <span>ANIMAL MASTER RECORDS</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-paw-navy">
                  Looking for other animals in our care?
                </h3>
                <p className="text-gray-600 font-medium text-sm sm:text-base leading-relaxed">
                  Not all rescued animals are ready for adoption. Explore our complete Animal Master Record Overview to see all shelter residents, animals in veterinary rehabilitation, and those in foster care.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/animals"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-paw-orange hover:bg-orange-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-paw-orange/20 transition-all group cursor-pointer"
                >
                  <span>View Animal Master Overview</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHELTER VISIT SECTION (Image 3 reference) */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-[#1A2638] text-white rounded-[32px] md:rounded-[44px] overflow-hidden shadow-2xl border border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Left Info Column (7 cols) */}
              <div className="lg:col-span-7 p-8 sm:p-10 md:p-14 flex flex-col justify-between">
                <div>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-[#FF9B00]/20 text-[#FFB033] border border-[#FF9B00]/40 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6">
                    <Building2 size={13} />
                    <span>VISIT THE SHELTER</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                    Come Meet Them in Person
                  </h2>

                  <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium mb-8 max-w-xl">
                    You're welcome to visit the ISF shelter to meet our animals, inquire about adoption, or explore volunteering. Visits are by appointment — ISF will coordinate your schedule.
                  </p>

                  {/* Checklist with Lucide check icons */}
                  <div className="space-y-3 mb-10">
                    {[
                      'Meet Adoptable Animals',
                      'Adoption Inquiry',
                      'Volunteer Interest',
                      'Donation / In-Kind Support',
                      'Organization or School Visit',
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-[#FF9B00] shrink-0" />
                        <span className="text-white font-bold text-sm sm:text-base">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setIsVisitModalOpen(true)}
                    className="bg-[#FF9B00] hover:bg-[#e68a00] text-white font-black text-sm md:text-base px-8 py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/35 transition-all inline-flex items-center gap-2.5 cursor-pointer active:scale-95"
                  >
                    <Calendar size={18} />
                    Request a Shelter Visit
                  </button>
                </div>
              </div>

              {/* Right Image Column (5 cols) */}
              <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full">
                <img
                  src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1000&auto=format&fit=crop&q=80"
                  alt="Shelter animals"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#1A2638] via-transparent to-transparent opacity-80 lg:opacity-60 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REHOMING ASSISTANCE SECTION (Image 4 reference) */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-[32px] md:rounded-[44px] p-8 sm:p-10 md:p-14 shadow-xl border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column (6 cols): Header + Alert + Button */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4">
                    <HeartHandshake size={14} />
                    <span>REHOMING ASSISTANCE</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B2340] leading-tight">
                    Need Help Rehoming an Animal?
                  </h2>
                </div>

                {/* Info Card */}
                <div className="bg-[#F0F7FF] border border-[#D0E6FD] rounded-3xl p-5 md:p-6 space-y-3">
                  <div className="flex items-start gap-2.5 text-[#0B2340]">
                    <AlertCircle size={20} className="text-[#FF9B00] shrink-0 mt-0.5" />
                    <p className="font-black text-sm md:text-base text-[#0B2340]">
                      Rehoming is not the same as ISF Adoption.
                    </p>
                  </div>
                  <div className="text-xs md:text-sm text-slate-700 space-y-2 leading-relaxed font-semibold pl-7">
                    <p>
                      <strong className="text-[#0B2340]">Adoption</strong> — an animal under ISF care is placed with an adopter.
                    </p>
                    <p>
                      <strong className="text-[#0B2340]">Rehoming</strong> — an existing owner or caretaker needs help finding a new home for an animal they currently care for.
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm md:text-base leading-relaxed font-medium">
                  ISF can review your rehoming request and assist with coordination, posting, or connecting you with a potential home. ISF does not guarantee placement.
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() => setIsRehomingModalOpen(true)}
                    className="bg-[#0B2340] hover:bg-[#1a385c] text-white font-black text-sm md:text-base px-8 py-4 rounded-2xl shadow-xl shadow-paw-navy/20 hover:shadow-paw-navy/30 transition-all inline-flex items-center gap-2.5 cursor-pointer active:scale-95"
                  >
                    <ArrowRight size={18} />
                    Request Rehoming Assistance
                  </button>
                </div>
              </div>

              {/* Right Column (6 cols): 4 Process Steps with Lucide Icons */}
              <div className="lg:col-span-6 space-y-3.5">
                {[
                  {
                    icon: ClipboardList,
                    iconBg: 'bg-amber-100 text-[#FF9B00]',
                    title: 'Submit Request',
                    description: 'Share your animal’s information, photo, and your rehoming reason.',
                  },
                  {
                    icon: Eye,
                    iconBg: 'bg-sky-100 text-sky-600',
                    title: 'ISF Reviews',
                    description: 'ISF coordinates and determines how to assist.',
                  },
                  {
                    icon: Share2,
                    iconBg: 'bg-rose-100 text-rose-600',
                    title: 'Posted / Shared',
                    description: 'ISF may post or share on appropriate channels.',
                  },
                  {
                    icon: HeartHandshake,
                    iconBg: 'bg-emerald-100 text-emerald-600',
                    title: 'Home Found',
                    description: 'Outcome is recorded once a suitable home is identified.',
                  },
                ].map((step, idx) => {
                  const IconComponent = step.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-[#FAF7F2] hover:bg-white border border-gray-100 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${step.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                        <IconComponent size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-[#0B2340] text-sm md:text-base">
                          {step.title}
                        </h4>
                        <p className="text-gray-500 text-xs md:text-sm font-medium leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODALS */}

      {/* 1. Pet Detail Modal (3 tabs: Overview, Story, Health) */}
      <PetDetailModal
        pet={selectedPet}
        onClose={() => setSelectedPet(null)}
        onApply={(pet) => {
          setSelectedPet(null);
          setApplyingPet(pet);
        }}
        onShare={(pet) => {
          setSharingPet(pet);
        }}
      />

      {/* 2. Adoption Wizard Modal */}
      <AnimatePresence>
        {applyingPet && (
          <AdoptionWizard
            pet={applyingPet}
            onClose={() => setApplyingPet(null)}
          />
        )}
      </AnimatePresence>

      {/* 3. Shelter Visit Modal */}
      <ShelterVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        pets={safePets.map((p) => ({ id: p.id, name: p.name }))}
      />

      {/* 4. Rehoming Assistance Modal */}
      <RehomingModal
        isOpen={isRehomingModalOpen}
        onClose={() => setIsRehomingModalOpen(false)}
      />

      {/* 5. Social Share Modal */}
      <ShareModal
        isOpen={Boolean(sharingPet)}
        onClose={() => setSharingPet(null)}
        pet={sharingPet}
      />

      <Footer />
    </div>
  );
}

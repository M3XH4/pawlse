import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  X, Search, BookOpen, Sparkles, Filter, Check, 
  HelpCircle, ArrowRight, Dog, Cat, Eye, Layers, ChevronRight, CheckCircle2
} from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { 
  PetBreed, 
  PET_BREEDS_CATALOG, 
  findClosestBreeds, 
  filterBreeds 
} from '@/data/pet-breeds';

interface ContextReportInfo {
  id: number;
  name?: string | null;
  animal_type?: string;
  breed?: string | null;
  photo_url?: string | null;
  ai_predicted_breed?: string | null;
  ai_predicted_species?: string | null;
  ai_confidence?: number | null;
  similar_ai_breeds?: Array<{ name: string; confidence: number }>;
}

interface BreedGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextReport?: ContextReportInfo | null;
  onSelectBreedForCorrection?: (breed: PetBreed) => void;
}

export function BreedGuideModal({
  isOpen,
  onClose,
  contextReport,
  onSelectBreedForCorrection,
}: BreedGuideModalProps) {
  // Determine initial species filter based on context report if provided
  const initialSpecies = contextReport?.animal_type 
    ? (contextReport.animal_type.toLowerCase() === 'cat' ? 'Cat' : 'Dog')
    : 'All';

  const [selectedSpecies, setSelectedSpecies] = useState<string>(initialSpecies);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedCoat, setSelectedCoat] = useState('All');
  const [activeBreedDetail, setActiveBreedDetail] = useState<PetBreed | null>(null);

  // When context report changes, update default species
  React.useEffect(() => {
    if (contextReport?.animal_type) {
      const sp = contextReport.animal_type.toLowerCase() === 'cat' ? 'Cat' : 'Dog';
      setSelectedSpecies(sp);
    }
  }, [contextReport]);

  // Compute closest breeds for context report (if any)
  const closestBreeds = useMemo(() => {
    if (!contextReport) return [];

    const target = contextReport.ai_predicted_breed || contextReport.breed;
    const species = contextReport.ai_predicted_species || contextReport.animal_type;
    return findClosestBreeds(target, species, 4);
  }, [contextReport]);

  // Filtered breed catalog
  const filteredCatalog = useMemo(() => {
    return filterBreeds(PET_BREEDS_CATALOG, {
      species: selectedSpecies,
      search: searchQuery,
      size: selectedSize,
      coat: selectedCoat,
    });
  }, [selectedSpecies, searchQuery, selectedSize, selectedCoat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white dark:bg-[#0f172a] rounded-[24px] max-w-5xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 flex flex-col max-h-[92vh] animate-in fade-in-0 zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="breed-guide-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/70 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-paw-orange flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-paw-orange text-white px-2 py-0.5 rounded-md">
                  Field Guide
                </span>
                <span className="text-xs text-gray-400 font-bold">Dog & Cat Reference Handbook</span>
              </div>
              <h2 id="breed-guide-title" className="text-xl sm:text-2xl font-fredoka font-bold text-[#0B2340] dark:text-white mt-0.5">
                Species & Breed Identification Guide
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Verify AI classifications, inspect distinctive physical traits, and cross-reference common breed confusions.
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-700 dark:hover:text-white"
            aria-label="Close breed guide"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">

          {/* Contextual Section: Specific Report AI Closest Matches */}
          {contextReport && (
            <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-blue-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-blue-950/20 border border-amber-200/80 dark:border-amber-900/30 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-200/50 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-paw-orange shrink-0" />
                  <div>
                    <h3 className="text-sm font-fredoka font-bold text-[#0B2340] dark:text-white">
                      AI Prediction Comparison for Report #{contextReport.id}
                      {contextReport.name && <span className="font-normal text-gray-500 ml-1">({contextReport.name})</span>}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      AI identified: <strong className="text-paw-orange font-bold">{contextReport.ai_predicted_breed || contextReport.breed || 'Unknown'}</strong> ({contextReport.ai_predicted_species || contextReport.animal_type || 'Unknown'}) 
                      {contextReport.ai_confidence && (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-white dark:bg-slate-800 border font-bold">
                          {Math.round(contextReport.ai_confidence * 100)}% Confidence
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 self-start sm:self-auto">
                  <Layers size={14} className="text-paw-orange" />
                  <span>Showing closest matching reference breeds below</span>
                </div>
              </div>

              {/* Side-by-side: Report Photo vs Closest Breeds */}
              <div className="grid md:grid-cols-4 gap-4 items-stretch">
                {/* Target Report Photo Card */}
                <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1.5">
                      Submitted Report Photo
                    </span>
                    <div className="w-full h-36 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 relative border border-gray-100 dark:border-slate-700">
                      {contextReport.photo_url ? (
                        <ImageWithFallback
                          src={contextReport.photo_url}
                          alt="Reported Pet"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs font-bold gap-1">
                          <span>🐾</span>
                          <span>No photo</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-black text-[#0B2340] dark:text-white truncate">
                      {contextReport.breed || 'Breed not specified'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {contextReport.animal_type || 'Pet'}
                    </p>
                  </div>
                </div>

                {/* Closest Matches Cards */}
                <div className="md:col-span-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {closestBreeds.map((breed, idx) => (
                    <div 
                      key={breed.id}
                      className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-paw-orange/50 transition-all shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            idx === 0 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' 
                              : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-300'
                          }`}>
                            {idx === 0 ? '★ Closest Match' : `Candidate #${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">{breed.size}</span>
                        </div>

                        <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 mb-2 border border-gray-100 dark:border-slate-800">
                          <ImageWithFallback
                            src={breed.image_url}
                            alt={breed.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <h4 className="text-xs font-black text-[#0B2340] dark:text-white leading-tight">
                          {breed.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          {breed.build}
                        </p>

                        <div className="mt-2 text-[10px] text-slate-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-850 p-2 rounded-lg border border-gray-100 dark:border-slate-800/80 line-clamp-2">
                          <span className="font-bold text-[#0B2340] dark:text-white">Tips: </span>
                          {breed.identification_tips}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setActiveBreedDetail(breed)}
                          className="flex-1 text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:text-paw-orange dark:hover:text-paw-orange py-1 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                        
                        {onSelectBreedForCorrection && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectBreedForCorrection(breed);
                              onClose();
                            }}
                            className="flex-1 text-[11px] font-bold bg-paw-orange hover:bg-orange-600 text-white py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                            title="Apply this breed to validation correction form"
                          >
                            <Check size={12} /> Apply
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Generalized Search & Filter Toolbar */}
          <div className="bg-gray-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Species Tabs */}
              <div className="flex bg-white dark:bg-slate-950 p-1 rounded-xl border border-gray-200 dark:border-slate-800 w-full sm:w-auto">
                {[
                  { id: 'All', label: 'All Breeds' },
                  { id: 'Dog', label: '🐶 Dogs Only' },
                  { id: 'Cat', label: '🐱 Cats Only' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedSpecies(tab.id)}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedSpecies === tab.id
                        ? 'bg-paw-orange text-white shadow-xs'
                        : 'text-gray-500 dark:text-gray-400 hover:text-[#0B2340] dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search breed, coat, trait, alias..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:border-paw-orange font-bold text-[#0B2340] dark:text-white placeholder:text-gray-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Badges (Size & Coat) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-200/50 dark:border-slate-800 text-[11px]">
              <span className="font-black text-gray-400 uppercase tracking-widest text-[9px] mr-1">Size:</span>
              {['All', 'Toy', 'Small', 'Medium', 'Large', 'Giant'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                    selectedSize === size
                      ? 'bg-[#0B2340] text-white dark:bg-blue-600'
                      : 'bg-white dark:bg-slate-950 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-800 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}

              <span className="font-black text-gray-400 uppercase tracking-widest text-[9px] ml-3 mr-1">Coat:</span>
              {['All', 'Short', 'Medium', 'Long', 'Double', 'Curly', 'Hairless'].map((coat) => (
                <button
                  key={coat}
                  type="button"
                  onClick={() => setSelectedCoat(coat)}
                  className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                    selectedCoat === coat
                      ? 'bg-[#0B2340] text-white dark:bg-blue-600'
                      : 'bg-white dark:bg-slate-950 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-800 hover:border-gray-300'
                  }`}
                >
                  {coat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Results Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Breed Reference Library ({filteredCatalog.length} Breeds Available)
              </h3>
              {(selectedSpecies !== 'All' || searchQuery || selectedSize !== 'All' || selectedCoat !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecies('All');
                    setSearchQuery('');
                    setSelectedSize('All');
                    setSelectedCoat('All');
                  }}
                  className="text-[11px] font-bold text-paw-orange hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {filteredCatalog.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-800">
                <HelpCircle size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-black text-[#0B2340] dark:text-white">No Breeds Match Your Search</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your keyword, species, or coat filter criteria.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCatalog.map((breed) => (
                  <div
                    key={breed.id}
                    className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md hover:border-paw-orange/40 transition-all group"
                  >
                    <div>
                      {/* Photo + Badges */}
                      <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 relative mb-3 border border-gray-100 dark:border-slate-800">
                        <ImageWithFallback
                          src={breed.image_url}
                          alt={breed.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            breed.species === 'Dog' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-purple-600 text-white'
                          }`}>
                            {breed.species === 'Dog' ? '🐶 Dog' : '🐱 Cat'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                            {breed.size}
                          </span>
                        </div>
                      </div>

                      {/* Title & Origin */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-black text-[#0B2340] dark:text-white leading-snug">
                          {breed.name}
                        </h4>
                        {breed.origin && (
                          <span className="text-[10px] font-bold text-gray-400 shrink-0">
                            {breed.origin}
                          </span>
                        )}
                      </div>

                      {breed.aliases.length > 0 && (
                        <p className="text-[10px] text-gray-400 mb-2 truncate">
                          Also known as: <span className="italic">{breed.aliases.join(', ')}</span>
                        </p>
                      )}

                      {/* Physical Characteristics */}
                      <div className="space-y-1 mb-3">
                        {breed.characteristics.slice(0, 3).map((trait, tIdx) => (
                          <div key={tIdx} className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                            <span className="text-paw-orange mt-0.5">•</span>
                            <span className="leading-tight">{trait}</span>
                          </div>
                        ))}
                      </div>

                      {/* AI Identification Note Box */}
                      <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-2.5 rounded-xl text-[11px] text-blue-900 dark:text-blue-300 leading-relaxed mb-3">
                        <strong className="font-bold flex items-center gap-1 text-[10px] uppercase text-blue-800 dark:text-blue-400 mb-0.5">
                          <Sparkles size={11} className="text-blue-500" /> AI Identification Tip
                        </strong>
                        <p className="line-clamp-2">{breed.identification_tips}</p>
                      </div>

                      {breed.confused_with.length > 0 && (
                        <div className="text-[10px] text-gray-400 mb-2">
                          <span className="font-bold">Common AI confusions: </span>
                          <span className="text-gray-500 dark:text-gray-400 font-semibold">{breed.confused_with.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveBreedDetail(breed)}
                        className="flex-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0B2340] dark:text-white py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye size={13} /> Full Details
                      </button>

                      {onSelectBreedForCorrection && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectBreedForCorrection(breed);
                            onClose();
                          }}
                          className="flex-1 text-xs font-bold bg-paw-orange hover:bg-orange-600 text-white py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Check size={13} /> Select Breed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-bold">
            Showing verified breed standards & Philippine native references
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0B2340] dark:text-white transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>

      {/* Expanded Full Breed Detail Sub-Modal */}
      <AnimatePresence>
        {activeBreedDetail && (
          <div className="fixed inset-0 z-60 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111827] rounded-[24px] max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in-0 zoom-in-95 duration-150">
              <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-paw-orange text-white">
                    {activeBreedDetail.species}
                  </span>
                  <h3 className="text-lg font-fredoka font-bold text-[#0B2340] dark:text-white">
                    {activeBreedDetail.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveBreedDetail(null)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="w-full h-56 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-100 dark:border-slate-800">
                  <ImageWithFallback
                    src={activeBreedDetail.image_url}
                    alt={activeBreedDetail.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Size</span>
                    <span className="font-bold text-[#0B2340] dark:text-white">{activeBreedDetail.size}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Coat Type</span>
                    <span className="font-bold text-[#0B2340] dark:text-white">{activeBreedDetail.coat}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Ears</span>
                    <span className="font-bold text-[#0B2340] dark:text-white">{activeBreedDetail.ears}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Origin</span>
                    <span className="font-bold text-[#0B2340] dark:text-white">{activeBreedDetail.origin || 'Unknown'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1.5">Build & Physique</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                    {activeBreedDetail.build}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1.5">Distinctive Characteristics</h4>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {activeBreedDetail.characteristics.map((c, i) => (
                      <div key={i} className="flex items-start gap-1.5 p-2 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800">
                        <CheckCircle2 size={13} className="text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1.5">Common Coat Colors</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeBreedDetail.colors.map((col, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3.5 rounded-xl text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                  <h4 className="font-black uppercase tracking-wider text-[10px] text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                    <Sparkles size={12} className="text-amber-600" /> AI Classification Guidelines
                  </h4>
                  <p>{activeBreedDetail.identification_tips}</p>
                </div>

                {activeBreedDetail.confused_with.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <span className="font-bold text-[#0B2340] dark:text-white">Watch out for lookalikes: </span>
                    {activeBreedDetail.confused_with.join(', ')}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBreedDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Back
                </button>
                {onSelectBreedForCorrection && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBreedForCorrection(activeBreedDetail);
                      setActiveBreedDetail(null);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-paw-orange hover:bg-orange-600 text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={14} /> Use This Breed in Correction
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

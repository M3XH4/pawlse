import { Heart, Filter, Search, X, Info, Shield, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo } from 'react';
import { AdoptionWizard } from '@/components/adoption-wizard';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

const PETS = [
  { id: 1, name: 'Luna', breed: 'Aspin', age: '2 yrs', ageCategory: 'Adult', gender: 'Female', color: 'Brown', behavior: 'Friendly, calm', story: 'Rescued near a market in 2023.', img: 'https://cdn.britannica.com/70/234870-050-D4D024BB/Orange-colored-cat-yawns-displaying-teeth.jpg?w=300', mainImg: 'https://cdn.britannica.com/70/234870-050-D4D024BB/Orange-colored-cat-yawns-displaying-teeth.jpg?w=300', vaccinated: true, shelterDays: 245 },
  { id: 2, name: 'Milo', breed: 'Aspin-Mix', age: '8 mos', ageCategory: 'Puppy', gender: 'Male', color: 'Black & White', behavior: 'Playful, energetic', story: 'Found in a box during a storm.', img: 'https://cdn.manilastandard.net/wp-content/uploads/2023/01/campus_cats3-750x525.jpg', mainImg: 'https://cdn.manilastandard.net/wp-content/uploads/2023/01/campus_cats3-750x525.jpg', vaccinated: true, shelterDays: 89 },
  { id: 3, name: 'Bella', breed: 'Aspin', age: '1 yr', ageCategory: 'Young', gender: 'Female', color: 'White', behavior: 'Shy but sweet', story: 'Lost pet that was never claimed.', img: 'https://news.orvis.com/wp-content/uploads/2019/08/stray.jpg', mainImg: 'https://news.orvis.com/wp-content/uploads/2019/08/stray.jpg', vaccinated: true, shelterDays: 156 },
  { id: 4, name: 'Cooper', breed: 'Labrador-Mix', age: '3 yrs', ageCategory: 'Adult', gender: 'Male', color: 'Golden', behavior: 'Protective, loyal', story: 'Former guard dog needing love.', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCPacSaJWfPdtLtxmEeD2ZbNxtn2n12DMziQ&s', mainImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCPacSaJWfPdtLtxmEeD2ZbNxtn2n12DMziQ&s', vaccinated: true, shelterDays: 432 },
  { id: 5, name: 'Coco', breed: 'Puspin', age: '1 yr', ageCategory: 'Young', gender: 'Female', color: 'Orange', behavior: 'Vocal, cuddly', story: 'Rescued from a drainage pipe.', img: 'https://images.ctfassets.net/mrbo2ykgx5lt/32670/23cb097f16b30963b5be00e22c848d36/frontiers-psychology-stray-dogs-human-cues-behavior.jpg', mainImg: 'https://images.ctfassets.net/mrbo2ykgx5lt/32670/23cb097f16b30963b5be00e22c848d36/frontiers-psychology-stray-dogs-human-cues-behavior.jpg', vaccinated: true, shelterDays: 178 },
  { id: 6, name: 'Simba', breed: 'Puspin', age: '6 mos', ageCategory: 'Kitten', gender: 'Male', color: 'Gray', behavior: 'Adventurous', story: 'Found wandering in a subdivision.', img: 'https://tnrireland.ie/wp-content/uploads/ngg_featured/tc01.jpg', mainImg: 'https://tnrireland.ie/wp-content/uploads/ngg_featured/tc01.jpg', vaccinated: false, shelterDays: 45 },
  { id: 7, name: 'Max', breed: 'Shih Tzu Mix', age: '5 yrs', ageCategory: 'Senior', gender: 'Male', color: 'White & Brown', behavior: 'Gentle, quiet', story: 'Owner passed away, needs a loving home.', img: 'https://th-thumbnailer.cdn-si-edu.com/nSG89vchaPYMu-swpgA0RmIJZA4=/1280x720/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/Surprising-Science-Feral-Cats-631.jpg', mainImg: 'https://th-thumbnailer.cdn-si-edu.com/nSG89vchaPYMu-swpgA0RmIJZA4=/1280x720/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/Surprising-Science-Feral-Cats-631.jpg', vaccinated: true, shelterDays: 567 },
  { id: 8, name: 'Daisy', breed: 'Aspin', age: '4 mos', ageCategory: 'Puppy', gender: 'Female', color: 'Brown & White', behavior: 'Curious, loving', story: 'Abandoned puppy found near the highway.', img: 'https://www.thespruce.com/thmb/PrfluQWFB8RhXABxIUeN5nNHrIo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/discourage-feral-cats-386479-hero-50eeb16535844e75853d52720baeaec5.jpg', mainImg: 'https://www.thespruce.com/thmb/PrfluQWFB8RhXABxIUeN5nNHrIo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/discourage-feral-cats-386479-hero-50eeb16535844e75853d52720baeaec5.jpg', vaccinated: true, shelterDays: 34 },
  { id: 9, name: 'Charlie', breed: 'Beagle Mix', age: '2 yrs', ageCategory: 'Adult', gender: 'Male', color: 'Tricolor', behavior: 'Friendly, vocal', story: 'Rescued from animal hoarder situation.', img: 'https://www.funpawcare.com/wp-content/uploads/2013/03/IMAG2691.jpg', mainImg: 'https://www.funpawcare.com/wp-content/uploads/2013/03/IMAG2691.jpg', vaccinated: true, shelterDays: 298 },
  { id: 10, name: 'Whiskers', breed: 'Puspin', age: '3 yrs', ageCategory: 'Adult', gender: 'Male', color: 'Black', behavior: 'Independent, affectionate', story: 'Street cat that sought shelter during typhoon.', img: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202508/order-to-remove-all-delhi-street-dogs-sparks-outcry-from-animal-welfare-groups-113703314-16x9_0.jpg?VersionId=ed0u.hul0.ib0yhgCKasG_hK2zBwCHLS&size=690:388', mainImg: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202508/order-to-remove-all-delhi-street-dogs-sparks-outcry-from-animal-welfare-groups-113703314-16x9_0.jpg?VersionId=ed0u.hul0.ib0yhgCKasG_hK2zBwCHLS&size=690:388', vaccinated: false, shelterDays: 123 },
];

const SEARCH_SUGGESTIONS = [
  'Luna', 'Milo', 'Bella', 'Cooper', 'Coco', 'Simba', 'Max', 'Daisy', 'Charlie', 'Whiskers',
  'Aspin', 'Puspin', 'Labrador', 'Shih Tzu', 'Beagle',
  'Brown', 'Black', 'White', 'Golden', 'Orange', 'Gray', 'Tricolor',
  'Male', 'Female', 'Puppy', 'Kitten', 'Adult', 'Senior'
];

export default function Adopt() {
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [applyingPet, setApplyingPet] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    color: 'All',
    breed: 'All',
    gender: 'All',
    ageCategory: 'All',
    sortBy: 'newest' // 'newest', 'longest', 'name'
  });

  // Search suggestions
  const filteredSuggestions = useMemo(() => {
    // eslint-disable-next-line curly
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();

    return SEARCH_SUGGESTIONS.filter(
      s => s.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [searchQuery]);

  // Filter and sort pets
  const filteredPets = useMemo(() => {
    const result = PETS.filter(pet => {
      const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pet.color.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesColor = filters.color === 'All' || pet.color === filters.color;
      const matchesBreed = filters.breed === 'All' || pet.breed === filters.breed;
      const matchesGender = filters.gender === 'All' || pet.gender === filters.gender;
      const matchesAge = filters.ageCategory === 'All' || pet.ageCategory === filters.ageCategory;

      return matchesSearch && matchesColor && matchesBreed && matchesGender && matchesAge;
    });

    // Sort
    if (filters.sortBy === 'longest') {
      result.sort((a, b) => b.shelterDays - a.shelterDays);
    } else if (filters.sortBy === 'newest') {
      result.sort((a, b) => a.shelterDays - b.shelterDays);
    } else if (filters.sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchQuery, filters]);

  // Get unique values for filters
  const uniqueColors = ['All', ...Array.from(new Set(PETS.map(p => p.color)))];
  const uniqueBreeds = ['All', ...Array.from(new Set(PETS.map(p => p.breed)))];
  const uniqueAgeCategories = ['All', 'Puppy', 'Kitten', 'Young', 'Adult', 'Senior'];

  return (
    <div className="min-h-screen bg-paw-bg font-quicksand">
      <Header />
      
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-paw-navy mb-4">Find Your New Best Friend</h1>
              <p className="text-gray-500 max-w-xl">Every pet in our care has a story. By adopting, you give them a second chance at a happy life.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-paw-orange/10 rounded-2xl outline-none focus:border-paw-orange transition-colors shadow-lg shadow-paw-navy/5"
                />

                {/* Search Suggestions */}
                <AnimatePresence>
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20"
                    >
                      <div className="p-3 bg-paw-bg border-b border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suggestions</p>
                      </div>
                      {filteredSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-paw-bg transition-all text-sm font-bold text-paw-navy"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-2xl text-white transition-colors shadow-lg ${showFilters ? 'bg-paw-navy' : 'bg-paw-orange hover:bg-orange-600'}`}
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
                className="bg-white rounded-[32px] p-8 shadow-xl mb-8"
              >
                <h3 className="font-black text-paw-navy text-xl mb-6">Filter Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Color Filter */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">Color</label>
                    <select
                      value={filters.color}
                      onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                    >
                      {uniqueColors.map(color => (
                        <option key={color}>{color}</option>
                      ))}
                    </select>
                  </div>

                  {/* Breed Filter */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">Breed</label>
                    <select
                      value={filters.breed}
                      onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                    >
                      {uniqueBreeds.map(breed => (
                        <option key={breed}>{breed}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gender Filter */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">Gender</label>
                    <select
                      value={filters.gender}
                      onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                    >
                      <option>All</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>

                  {/* Age Category Filter */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">Age</label>
                    <select
                      value={filters.ageCategory}
                      onChange={(e) => setFilters({ ...filters, ageCategory: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                    >
                      {uniqueAgeCategories.map(age => (
                        <option key={age}>{age}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                    >
                      <option value="newest">Newest in Shelter</option>
                      <option value="longest">Longest in Shelter</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-600">
                    Showing <span className="text-paw-orange font-black">{filteredPets.length}</span> of <span className="font-black">{PETS.length}</span> pets
                  </p>
                  <button
                    onClick={() => {
                      setFilters({ color: 'All', breed: 'All', gender: 'All', ageCategory: 'All', sortBy: 'newest' });
                      setSearchQuery('');
                    }}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm text-paw-navy transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {filteredPets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl mb-6">
                <Search size={80} className="text-gray-200" />
              </div>
              <h3 className="text-2xl font-black text-paw-navy mb-2">No pets found</h3>
              <p className="text-gray-500 font-bold max-w-md mb-6">Try adjusting your filters or search query to find more pets.</p>
              <button
                onClick={() => {
                  setFilters({ color: 'All', breed: 'All', gender: 'All', ageCategory: 'All', sortBy: 'newest' });
                  setSearchQuery('');
                }}
                className="px-8 py-4 bg-paw-orange text-white rounded-2xl font-black hover:bg-paw-navy transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredPets.map((pet) => (
              <motion.div
                key={pet.id}
                layoutId={`pet-${pet.id}`}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedPet(pet.id)}
                className="bg-white rounded-[24px] overflow-hidden shadow-xl shadow-paw-navy/5 cursor-pointer group"
              >
                <div className="relative aspect-square">
                  <ImageWithFallback src={pet.img} alt={pet.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                  {/* Vaccination Badge */}
                  <div className={`absolute top-2 right-2 ${pet.vaccinated ? 'bg-paw-green' : 'bg-gray-400'} backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-lg`}>
                    <Shield size={10} className="text-white" />
                    <span className="text-white font-black text-[8px] uppercase">{pet.vaccinated ? 'Vaccinated' : 'Not Yet'}</span>
                  </div>

                  {/* Available Badge */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-paw-orange font-bold text-[8px] flex items-center gap-1 shadow-lg">
                    <Heart size={10} fill="currentColor" />
                    Available
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-lg font-black text-paw-navy mb-1 truncate">{pet.name}</h3>

                  <div className="flex items-center gap-1 mb-2">
                    <span className="bg-paw-yellow/20 text-paw-navy text-[8px] font-black px-2 py-0.5 rounded-full uppercase">{pet.breed}</span>
                    <span className="bg-paw-blue/20 text-paw-blue text-[8px] font-black px-2 py-0.5 rounded-full uppercase">{pet.color}</span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                      <Info size={10} className="text-paw-orange shrink-0" />
                      <span>{pet.age} • {pet.gender}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                      <Calendar size={10} className="text-paw-blue shrink-0" />
                      <span>
                        {pet.shelterDays < 30
                          ? `${pet.shelterDays} days in shelter`
                          : `${Math.floor(pet.shelterDays / 30)} ${Math.floor(pet.shelterDays / 30) === 1 ? 'month' : 'months'} in shelter`}
                      </span>
                    </div>
                  </div>

                  <button className="w-full bg-paw-navy text-white py-2 rounded-xl font-black text-[10px] hover:bg-paw-orange transition-colors uppercase tracking-wider">
                    Meet {pet.name}
                  </button>
                </div>
              </motion.div>
            ))}
            </div>
          )}
        </div>
      </main>

      {/* Pet Detail Modal (Flip simulation with Expand) */}
      <AnimatePresence>
        {selectedPet && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPet(null)}
              className="absolute inset-0 bg-paw-navy/60 backdrop-blur-md"
            />
            <motion.div
              layoutId={`pet-${selectedPet}`}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[20px] md:rounded-[40px] z-10 relative shadow-2xl"
            >
              <button
                onClick={() => setSelectedPet(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
              >
                <X size={20} className="md:hidden" />
                <X size={24} className="hidden md:block" />
              </button>

              <div className="grid md:grid-cols-2">
                <div className="h-64 sm:h-80 md:h-full">
                  <ImageWithFallback
                    src={PETS.find(p => p.id === selectedPet)?.img || ''}
                    alt="Pet"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 sm:p-6 md:p-8 lg:p-12">
                  <span className="text-paw-orange font-bold uppercase tracking-widest text-xs md:text-sm mb-2 block">Available for Adoption</span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-paw-navy mb-4 md:mb-6">{PETS.find(p => p.id === selectedPet)?.name}</h2>

                  <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="bg-paw-bg p-4 rounded-2xl">
                      <p className="text-xs text-gray-500 font-bold uppercase">Gender</p>
                      <p className="font-black text-paw-navy">{PETS.find(p => p.id === selectedPet)?.gender}</p>
                    </div>
                    <div className="bg-paw-bg p-4 rounded-2xl">
                      <p className="text-xs text-gray-500 font-bold uppercase">Age</p>
                      <p className="font-black text-paw-navy">{PETS.find(p => p.id === selectedPet)?.age}</p>
                    </div>
                    <div className="bg-paw-bg p-4 rounded-2xl">
                      <p className="text-xs text-gray-500 font-bold uppercase">Color</p>
                      <p className="font-black text-paw-navy">{PETS.find(p => p.id === selectedPet)?.color}</p>
                    </div>
                    <div className="bg-paw-bg p-4 rounded-2xl">
                      <p className="text-xs text-gray-500 font-bold uppercase">Breed</p>
                      <p className="font-black text-paw-navy">{PETS.find(p => p.id === selectedPet)?.breed}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${PETS.find(p => p.id === selectedPet)?.vaccinated ? 'bg-paw-green/10' : 'bg-gray-100'}`}>
                      <p className="text-xs text-gray-500 font-bold uppercase">Vaccination</p>
                      <p className={`font-black flex items-center gap-2 ${PETS.find(p => p.id === selectedPet)?.vaccinated ? 'text-paw-green' : 'text-gray-500'}`}>
                        <Shield size={16} />
                        {PETS.find(p => p.id === selectedPet)?.vaccinated ? 'Vaccinated' : 'Not Vaccinated'}
                      </p>
                    </div>
                    <div className="bg-paw-blue/10 p-4 rounded-2xl">
                      <p className="text-xs text-gray-500 font-bold uppercase">Time in Shelter</p>
                      <p className="font-black text-paw-blue flex items-center gap-2">
                        <Calendar size={16} />
                        {(() => {
                          const days = PETS.find(p => p.id === selectedPet)?.shelterDays || 0;

                          if (days < 30) {
                            return `${days} days`;
                          } else {
                            const months = Math.floor(days / 30);

                            return `${months} ${months === 1 ? 'month' : 'months'}`;
                          }
                        })()}
                      </p>
                    </div>
                    <div className="bg-paw-bg p-4 rounded-2xl col-span-2">
                      <p className="text-xs text-gray-500 font-bold uppercase">Behavior</p>
                      <p className="font-black text-paw-navy">{PETS.find(p => p.id === selectedPet)?.behavior}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-black text-paw-navy mb-2">My Story</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {PETS.find(p => p.id === selectedPet)?.story} Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const pet = PETS.find(p => p.id === selectedPet);

                      if (pet) {
                        setApplyingPet(pet);
                      }
                    }}
                    className="w-full bg-paw-orange text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all shadow-xl shadow-paw-orange/20"
                  >
                    APPLY TO ADOPT
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Adoption Wizard */}
      <AnimatePresence>
        {applyingPet && (
          <AdoptionWizard
            pet={applyingPet}
            onClose={() => {
              setApplyingPet(null);
              setSelectedPet(null);
            }}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

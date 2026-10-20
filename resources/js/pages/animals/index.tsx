import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  Search,
  Heart,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  Syringe,
  AlertCircle,
  Building2,
  HeartHandshake,
  CheckCircle2,
  ShieldAlert,
  PawPrint,
  Dog,
  Cat,
  X,
  ArrowUpDown,
  ShieldCheck,
  Images,
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { AdoptPetDetail } from '@/components/adoption/pet-detail-modal';

interface AnimalCounts {
  all: number;
  rescued_shelter?: number;
  available: number;
  treatment: number;
  foster: number;
  quarantine: number;
  adopted: number;
}

interface AnimalOverviewProps {
  animals: AdoptPetDetail[];
  counts: AnimalCounts;
  filters: {
    status: string;
    species: string;
    search: string;
  };
}

export default function AnimalOverview({
  animals = [],
  counts = { all: 0, rescued_shelter: 0, available: 0, treatment: 0, foster: 0, quarantine: 0, adopted: 0 },
  filters: initialFilters,
}: AnimalOverviewProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.search || '');
  const [statusFilter, setStatusFilter] = useState(initialFilters?.status || 'all');
  const [speciesFilter, setSpeciesFilter] = useState(initialFilters?.species || 'all');
  const [sortBy, setSortBy] = useState('newest');

  const computedRescuedShelterCount = useMemo(() => {
    if (typeof counts.rescued_shelter === 'number') {
      return counts.rescued_shelter;
    }
    return animals.filter(
      (a) => a.is_rescued !== false && !['adopted', 'deceased'].includes((a.status || 'available').toLowerCase())
    ).length;
  }, [animals, counts.rescued_shelter]);

  // Filter and sort animals
  const filteredAnimals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = animals.filter((animal) => {
      // Search query
      const name = (animal.name || '').toLowerCase();
      const code = (animal.code || '').toLowerCase();
      const breed = (animal.breed || '').toLowerCase();
      const color = (animal.color || '').toLowerCase();
      const loc = (animal.current_location || '').toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        code.includes(q) ||
        breed.includes(q) ||
        color.includes(q) ||
        loc.includes(q);

      // Status filter
      const status = (animal.status || 'available').toLowerCase();
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'rescued_shelter'
          ? animal.is_rescued !== false && !['adopted', 'deceased'].includes(status)
          : status === statusFilter;

      // Species filter
      const species = (animal.type || '').toLowerCase();
      const matchesSpecies = speciesFilter === 'all' || species === speciesFilter;

      return matchesSearch && matchesStatus && matchesSpecies;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'longest') {
        return (b.shelterDays || 0) - (a.shelterDays || 0);
      }
      // default: newest
      return b.id - a.id;
    });
  }, [animals, searchQuery, statusFilter, speciesFilter, sortBy]);

  const getStatusBadge = (status?: string | null) => {
    const st = (status || 'available').toLowerCase();
    switch (st) {
      case 'available':
        return {
          label: 'Available for Adoption',
          icon: Heart,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
        };
      case 'treatment':
        return {
          label: 'Under Treatment',
          icon: Syringe,
          className: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500',
        };
      case 'foster':
        return {
          label: 'In Foster Care',
          icon: HeartHandshake,
          className: 'bg-blue-50 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-500',
        };
      case 'quarantine':
        return {
          label: 'In Quarantine',
          icon: ShieldAlert,
          className: 'bg-purple-50 text-purple-700 border-purple-200/80',
          dot: 'bg-purple-500',
        };
      case 'adopted':
        return {
          label: 'Adopted (Forever Home)',
          icon: CheckCircle2,
          className: 'bg-teal-50 text-teal-700 border-teal-200/80',
          dot: 'bg-teal-500',
        };
      default:
        return {
          label: 'In Shelter Care',
          icon: PawPrint,
          className: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const statusBoxes = [
    {
      label: 'All Animals',
      count: counts.all,
      status: 'all',
      icon: PawPrint,
      color: 'text-slate-900',
      watermarkColor: 'text-slate-400/15 group-hover:text-slate-400/25',
      bg: 'bg-white',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
    },
    {
      label: 'Rescued',
      count: computedRescuedShelterCount,
      status: 'rescued_shelter',
      icon: ShieldCheck,
      color: 'text-emerald-700',
      watermarkColor: 'text-emerald-500/15 group-hover:text-emerald-500/25',
      bg: 'bg-emerald-50/60',
      activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/25',
    },
    {
      label: 'Available',
      count: counts.available,
      status: 'available',
      icon: Heart,
      color: 'text-emerald-700',
      watermarkColor: 'text-emerald-500/15 group-hover:text-emerald-500/25',
      bg: 'bg-emerald-50/40',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20',
    },
    {
      label: 'Treatment',
      count: counts.treatment,
      status: 'treatment',
      icon: Syringe,
      color: 'text-amber-700',
      watermarkColor: 'text-amber-500/15 group-hover:text-amber-500/25',
      bg: 'bg-amber-50/40',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
    },
    {
      label: 'In Foster',
      count: counts.foster,
      status: 'foster',
      icon: HeartHandshake,
      color: 'text-blue-700',
      watermarkColor: 'text-blue-500/15 group-hover:text-blue-500/25',
      bg: 'bg-blue-50/40',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20',
    },
    {
      label: 'Quarantine',
      count: counts.quarantine,
      status: 'quarantine',
      icon: ShieldAlert,
      color: 'text-purple-700',
      watermarkColor: 'text-purple-500/15 group-hover:text-purple-500/25',
      bg: 'bg-purple-50/40',
      activeBorder: 'border-purple-500 ring-2 ring-purple-500/20',
    },
    {
      label: 'Adopted',
      count: counts.adopted,
      status: 'adopted',
      icon: CheckCircle2,
      color: 'text-teal-700',
      watermarkColor: 'text-teal-500/15 group-hover:text-teal-500/25',
      bg: 'bg-teal-50/40',
      activeBorder: 'border-teal-500 ring-2 ring-teal-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] font-quicksand flex flex-col text-slate-800">
      <Head title="Animal Master Record Overview | Pawlse" />
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Banner Header */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-100/90 mb-8 relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-600 text-xs font-black uppercase tracking-wider mb-4">
                <Sparkles size={13} />
                ANIMAL MASTER REGISTRY
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                Overview of Animals in Master Records
              </h1>

              <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed mb-6">
                A public registry of all animals currently under ISF care. Here you can follow their recovery journeys, check health records, view foster placements, and explore adoptable pets.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/adopt"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Heart size={14} fill="currentColor" />
                  View Adoptable Pets Page
                </Link>

                <Link
                  href="/donate"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
                >
                  <Building2 size={14} className="text-slate-500" />
                  Sponsor Shelter Care
                </Link>
              </div>
            </div>
          </div>

          {/* Metric Summary Status Boxes with Big Background Lucide Icons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-8">
            {statusBoxes.map((stat) => {
              const isSelected = statusFilter === stat.status;
              const IconComponent = stat.icon;
              return (
                <button
                  key={stat.status}
                  type="button"
                  onClick={() => setStatusFilter(stat.status)}
                  className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border transition-all text-left cursor-pointer group flex flex-col justify-end min-h-[105px] ${
                    isSelected
                      ? `${stat.activeBorder} bg-white shadow-md scale-[1.02]`
                      : `border-slate-100/90 hover:border-slate-300 shadow-2xs hover:shadow-xs ${stat.bg}`
                  }`}
                >
                  {/* Big background icon in bottom-right */}
                  <div
                    className={`absolute -bottom-3 -right-3 pointer-events-none transition-transform duration-300 ease-out group-hover:scale-110 ${stat.watermarkColor}`}
                  >
                    <IconComponent size={72} strokeWidth={1.5} />
                  </div>

                  {/* Top-right active indicator dot */}
                  {isSelected && (
                    <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-amber-500 shadow-xs" />
                  )}

                  {/* Content (Z-10 relative) */}
                  <div className="relative z-10">
                    <div className={`text-2xl sm:text-3xl font-black ${stat.color} tracking-tight leading-none mb-1.5`}>
                      {stat.count}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      {stat.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-slate-100 mb-8 space-y-4">
            {/* Row 1: Search Bar + Species Selector + Sort */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by animal name, code (e.g. PAW-D-0001), breed, color, or location..."
                  className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#f8fafc] border border-slate-200 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Species Filter Pills with Lucide Icons */}
              <div className="flex items-center gap-1 bg-[#f8fafc] p-1 rounded-2xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSpeciesFilter('all')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    speciesFilter === 'all'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <PawPrint size={14} />
                  <span>All Species</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpeciesFilter('dog')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    speciesFilter === 'dog'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Dog size={14} />
                  <span>Dogs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpeciesFilter('cat')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    speciesFilter === 'cat'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Cat size={14} />
                  <span>Cats</span>
                </button>
              </div>

              {/* Sort By Dropdown */}
              <div className="relative shrink-0 flex items-center">
                <ArrowUpDown size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="longest">Longest in Care</option>
                </select>
              </div>
            </div>

            {/* Row 2: Status Filter Tabs with Lucide Icons & Counts */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {[
                  { key: 'all', label: 'All Statuses', icon: PawPrint, count: counts.all },
                  { key: 'rescued_shelter', label: 'Rescued', icon: ShieldCheck, count: computedRescuedShelterCount },
                  { key: 'available', label: 'Available', icon: Heart, count: counts.available },
                  { key: 'treatment', label: 'Medical Treatment', icon: Syringe, count: counts.treatment },
                  { key: 'foster', label: 'Foster Care', icon: HeartHandshake, count: counts.foster },
                  { key: 'quarantine', label: 'Quarantine', icon: ShieldAlert, count: counts.quarantine },
                  { key: 'adopted', label: 'Adopted', icon: CheckCircle2, count: counts.adopted },
                ].map((tab) => {
                  const isActive = statusFilter === tab.key;
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <TabIcon size={12} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-500'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Counter & Reset Action */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs font-bold">
                <span className="text-slate-500">
                  Showing <span className="text-amber-600 font-black">{filteredAnimals.length}</span> of {animals.length} animals
                </span>

                {(searchQuery || statusFilter !== 'all' || speciesFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setSpeciesFilter('all');
                    }}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <X size={13} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Animals Grid */}
          {filteredAnimals.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">No Animal Records Found</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">
                No shelter animals match your current filters. Try resetting your search or changing the status filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSpeciesFilter('all');
                }}
                className="px-6 py-2.5 rounded-full bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAnimals.map((animal) => {
                const badge = getStatusBadge(animal.status);
                const isAvail = (animal.status || '').toLowerCase() === 'available';
                const isCat = (animal.type || '').toLowerCase() === 'cat';
                const isDog = (animal.type || '').toLowerCase() === 'dog';
                const AnimalTypeIcon = isCat ? Cat : isDog ? Dog : PawPrint;

                return (
                  <div
                    key={animal.id}
                    className="bg-white rounded-[2rem] overflow-hidden border border-slate-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Photo & Badges */}
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <ImageWithFallback
                          src={animal.img || animal.mainImg || ''}
                          alt={animal.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Top Left Status Badge */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs border backdrop-blur-xs ${badge.className}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        </div>

                        {/* Top Right Code Badge */}
                        <div className="absolute top-3 right-3 bg-slate-900/75 backdrop-blur-xs text-white font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                          {animal.code || `PAW-${animal.id}`}
                        </div>

                        {/* Bottom Left Rescued Tag + Bottom Right Photo Count */}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-1 pointer-events-none">
                          {animal.is_rescued !== false && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-600/95 text-white shadow-sm">
                              <ShieldCheck size={10} />
                              <span>{animal.rescued_tag || 'Rescued • In Shelter'}</span>
                            </span>
                          )}
                          {animal.photos && animal.photos.length > 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-900/75 text-white shadow-sm ml-auto">
                              <Images size={10} />
                              <span>{animal.photos.length}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                            {animal.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-0.5">
                            <AnimalTypeIcon size={14} className="text-amber-500 shrink-0" />
                            <span>{animal.type ? animal.type.toUpperCase() : 'ANIMAL'}</span>
                            <span className="text-slate-300">·</span>
                            <span>{animal.gender || 'Unknown'}</span>
                            {animal.breed && (
                              <>
                                <span className="text-slate-300">·</span>
                                <span className="truncate max-w-[120px]">{animal.breed}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-[#f8fafc] px-3 py-2 rounded-xl border border-slate-100">
                          <MapPin size={13} className="text-amber-500 shrink-0" />
                          <span className="truncate">{animal.current_location || 'ISF Shelter'}</span>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                          <div className="bg-[#f8fafc] p-2 rounded-xl border border-slate-100/70">
                            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Age</span>
                            <span className="text-slate-800">{animal.age || 'Not Recorded'}</span>
                          </div>
                          <div className="bg-[#f8fafc] p-2 rounded-xl border border-slate-100/70">
                            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Weight</span>
                            <span className="text-slate-800">{animal.weight || 'Not Recorded'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="p-5 pt-0">
                      <Link
                        href={`/adopt/${animal.id}`}
                        className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isAvail
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {isAvail ? (
                          <>
                            <Heart size={14} fill="currentColor" />
                            <span>View Profile & Adopt</span>
                          </>
                        ) : (
                          <>
                            <span>View Full Profile</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Redirect Back to Adopt Banner */}
          <div className="mt-12 bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                Looking to adopt a companion today?
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                Browse our curated adoptable pets catalog with instant adoption applications.
              </p>
            </div>
            <Link
              href="/adopt"
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-amber-500/25 shrink-0 transition-all cursor-pointer"
            >
              Go to Adoptable Pets Page →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

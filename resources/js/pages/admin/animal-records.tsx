import React, { useState, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminCard } from '@/components/admin/card';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { formatPhotoUrl } from '@/lib/utils';
import { toast } from 'sonner';
import {
    PawPrint,
    Search,
    Filter,
    Plus,
    X,
    Eye,
    Edit3,
    Trash2,
    Calendar,
    MapPin,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    Syringe,
    Heart,
    HeartHandshake,
    Sparkles,
    User,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Download,
    RefreshCw,
    Activity,
    Stethoscope,
    Ribbon,
    Copy,
    Tag,
    Share2,
    Info,
    Home,
    AlertTriangle,
    Check,
    Images,
    Maximize2,
} from 'lucide-react';

interface MedicalRecordItem {
    id: number;
    record_type: string;
    title: string;
    performed_date: string | null;
    next_due_date: string | null;
    veterinarian: string | null;
    batch_number: string | null;
    dosage: string | null;
    severity?: string | null;
    treatment_plan?: string | null;
    status: string;
    notes: string | null;
    created_at?: string;
}

interface AdoptionAppItem {
    id: number;
    status: string;
    applicant_name: string;
    applicant_email?: string;
    applicant_phone?: string;
    created_at?: string;
}

interface AnimalRecord {
    id: number;
    code: string;
    name: string;
    type: string;
    species: string;
    breed: string;
    age: string;
    age_category: string;
    gender: string;
    color: string | null;
    weight: string | null;
    status: string;
    status_label: string;
    current_location: string;
    raw_location: string | null;
    photo_url: string | null;
    gallery_photos?: string[];
    photos?: string[];
    before_photo_url?: string | null;
    after_photo_url?: string | null;
    is_rescued?: boolean;
    rescued_tag?: string | null;
    vaccinated: boolean;
    has_active_condition?: boolean;
    active_condition_title?: string | null;
    active_condition_type?: string | null;
    active_condition_severity?: string | null;
    behavior: string | null;
    special_needs: string | null;
    story: string | null;
    intake_type: string;
    admitted_at: string | null;
    admitted_at_human: string | null;
    shelter_days: number;
    foster: {
        is_active: boolean;
        parent_name?: string | null;
        parent_email?: string | null;
        location?: string | null;
        start_date?: string | null;
        care_instructions?: string | null;
    };
    medical_history: {
        is_vaccinated: boolean;
        total_records_count: number;
        vaccines_count: number;
        conditions_count?: number;
        active_conditions_count?: number;
        other_records_count: number;
        vaccinations: MedicalRecordItem[];
        conditions?: MedicalRecordItem[];
        active_conditions?: MedicalRecordItem[];
        treatments: MedicalRecordItem[];
        all_records: MedicalRecordItem[];
        next_due?: MedicalRecordItem | null;
    };
    adoption: {
        is_adopted: boolean;
        adoption_date: string | null;
        adoption_date_human: string | null;
        adopter_name: string | null;
        adopter_phone: string | null;
        adopter_email: string | null;
        adoption_notes: string | null;
        applications: AdoptionAppItem[];
        applications_count: number;
    };
    rescue: {
        rescue_date: string | null;
        rescue_date_human: string | null;
        rescue_location: string | null;
        rescue_story: string | null;
        before_photo_url?: string | null;
        after_photo_url?: string | null;
        pet_report: {
            id: number;
            tracking_code?: string;
            incident_type?: string;
            status?: string;
            location?: string;
            description?: string;
            created_at?: string;
        } | null;
    };
    deceased: {
        is_deceased: boolean;
        deceased_at: string | null;
        deceased_at_human: string | null;
        deceased_notes: string | null;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AnimalsPagination {
    data: AnimalRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface StatusBarData {
    total: number;
    available: number;
    foster: number;
    pending: number;
    adopted: number;
    treatment: number;
    quarantine: number;
    deceased: number;
    vaccinated_count: number;
    vaccination_rate: number;
    dogs: number;
    cats: number;
    others: number;
}

interface Props {
    animals: AnimalsPagination;
    statusBar: StatusBarData;
    filters: {
        search: string;
        species: string;
        status: string;
        gender: string;
        location: string;
        vaccinated: string;
        sort: string;
        per_page: number;
    };
    locationsList: string[];
}

export default function AnimalMasterRecords({ animals, statusBar, filters, locationsList }: Props) {
    // Search and filter state
    const [search, setSearch] = useState(filters.search || '');
    const [speciesFilter, setSpeciesFilter] = useState(filters.species || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [genderFilter, setGenderFilter] = useState(filters.gender || 'all');
    const [locationFilter, setLocationFilter] = useState(filters.location || 'all');
    const [vaccinatedFilter, setVaccinatedFilter] = useState(filters.vaccinated || 'all');
    const [sortBy, setSortBy] = useState(filters.sort || 'latest');

    // Selected Animal for Side Panel
    const [selectedAnimal, setSelectedAnimal] = useState<AnimalRecord | null>(null);
    const [sidePanelTab, setSidePanelTab] = useState<'details' | 'medical' | 'adoption' | 'rescue' | 'deceased'>('details');
    const [activeGalleryIdx, setActiveGalleryIdx] = useState<number>(0);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    // Modals
    const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
    const [isEditAnimalOpen, setIsEditAnimalOpen] = useState(false);
    const [animalToEdit, setAnimalToEdit] = useState<AnimalRecord | null>(null);
    const [isAddMedicalOpen, setIsAddMedicalOpen] = useState(false);
    const [medicalTargetAnimal, setMedicalTargetAnimal] = useState<AnimalRecord | null>(null);
    const [medicalPresetType, setMedicalPresetType] = useState<string>('vaccination');
    const [animalToDelete, setAnimalToDelete] = useState<AnimalRecord | null>(null);

    // Keep side panel in sync when data refreshes
    React.useEffect(() => {
        if (selectedAnimal) {
            const fresh = animals.data.find((a) => a.id === selectedAnimal.id);
            if (fresh) {
                setSelectedAnimal(fresh);
            }
        }
    }, [animals.data]);

    // Handle filter application
    const applyFilters = (overrides?: Partial<typeof filters>) => {
        const queryParams = {
            search: search.trim() || undefined,
            species: speciesFilter !== 'all' ? speciesFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            gender: genderFilter !== 'all' ? genderFilter : undefined,
            location: locationFilter !== 'all' ? locationFilter : undefined,
            vaccinated: vaccinatedFilter !== 'all' ? vaccinatedFilter : undefined,
            sort: sortBy !== 'latest' ? sortBy : undefined,
            ...overrides,
        };

        router.get('/account/admin/animal-records', queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: search.trim() || undefined });
    };

    const resetFilters = () => {
        setSearch('');
        setSpeciesFilter('all');
        setStatusFilter('all');
        setGenderFilter('all');
        setLocationFilter('all');
        setVaccinatedFilter('all');
        setSortBy('latest');
        router.get('/account/admin/animal-records', {}, {
            preserveState: true,
            replace: true,
        });
    };

    // Quick status bar click filter
    const handleStatusCardClick = (statusValue: string) => {
        const newStatus = statusFilter === statusValue ? 'all' : statusValue;
        setStatusFilter(newStatus);
        applyFilters({ status: newStatus !== 'all' ? newStatus : undefined });
    };

    // Helper badge styles
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
            case 'foster':
                return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
            case 'pending':
                return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
            case 'adopted':
                return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
            case 'treatment':
                return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
            case 'quarantine':
                return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
            case 'deceased':
                return 'bg-gray-200 text-gray-800 border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    // Open side panel with specific tab
    const handleOpenSidePanel = (animal: AnimalRecord, tab: 'details' | 'medical' | 'adoption' | 'rescue' | 'deceased' = 'details') => {
        setSelectedAnimal(animal);
        setSidePanelTab(tab);
        setActiveGalleryIdx(0);
    };

    // Open edit animal modal
    const handleStartEdit = (animal: AnimalRecord) => {
        setAnimalToEdit(animal);
        setIsEditAnimalOpen(true);
    };

    // Open log medical modal
    const handleStartMedical = (animal: AnimalRecord, presetType: string = 'vaccination') => {
        setMedicalPresetType(presetType);
        setMedicalTargetAnimal(animal);
        setIsAddMedicalOpen(true);
    };

    // Copy to clipboard helper
    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    // Handle delete animal
    const confirmDelete = () => {
        if (!animalToDelete) return;
        router.delete(`/account/admin/animal-records/${animalToDelete.id}`, {
            onSuccess: () => {
                toast.success(`Animal #${animalToDelete.code} archived successfully.`);
                setAnimalToDelete(null);
                if (selectedAnimal?.id === animalToDelete.id) {
                    setSelectedAnimal(null);
                }
            },
            onError: () => toast.error('Failed to archive animal record.'),
        });
    };

    return (
        <AdminPageShell
            title="Animal Master Records"
            description="Centralized master registry for every pet and rescued animal with comprehensive medical, foster, adoption, rescue, and memorial tracking."
        >
            <Head title="Animal Master Records - Admin" />

            {/* TOP ACTIONS & HEADER BAR */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-paw-orange/10 text-paw-orange dark:bg-paw-orange/20">
                            <PawPrint className="h-5 w-5" />
                        </span>
                        <h2 className="text-xl font-bold font-fredoka text-[#0B2340] dark:text-[#F8FAFC]">
                            All Registered Animals ({animals.total})
                        </h2>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Viewing page {animals.current_page} of {animals.last_page} • Updated live with real-time status & placement updates
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={resetFilters}
                        title="Refresh & Reset Filters"
                        className="p-2.5 text-gray-500 hover:text-paw-orange bg-white dark:bg-[#0B1527] border border-gray-200 dark:border-gray-800 rounded-xl transition-colors hover:border-paw-orange/40"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => setIsAddAnimalOpen(true)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-paw-orange hover:bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-paw-orange/25 active:scale-95"
                    >
                        <Plus className="h-4 w-4 stroke-[3]" /> Register New Animal
                    </button>
                </div>
            </div>

            {/* STATUS BAR / KPI METRICS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Total */}
                <button
                    onClick={() => handleStatusCardClick('all')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                        statusFilter === 'all'
                            ? 'border-paw-orange bg-orange-50/50 shadow-sm dark:bg-orange-950/20 dark:border-paw-orange/60'
                            : 'bg-white dark:bg-[#0B1527] border-gray-200/80 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                >
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                        <span>Total Records</span>
                        <PawPrint className="h-4 w-4 text-paw-orange" />
                    </div>
                    <div className="mt-2 text-2xl font-black font-fredoka text-[#0B2340] dark:text-[#F8FAFC]">
                        {statusBar.total}
                    </div>
                    <div className="mt-1 text-[11px] text-gray-400 flex items-center gap-1.5">
                        <span>Dogs: {statusBar.dogs}</span> • <span>Cats: {statusBar.cats}</span>
                    </div>
                </button>

                {/* Available */}
                <button
                    onClick={() => handleStatusCardClick('available')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                        statusFilter === 'available'
                            ? 'border-emerald-500 bg-emerald-50/60 shadow-sm dark:bg-emerald-950/30 dark:border-emerald-500'
                            : 'bg-white dark:bg-[#0B1527] border-gray-200/80 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-900'
                    }`}
                >
                    <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                        <span>Available</span>
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-2 text-2xl font-black font-fredoka text-emerald-700 dark:text-emerald-300">
                        {statusBar.available}
                    </div>
                    <div className="mt-1 text-[11px] text-emerald-600/80 dark:text-emerald-400">
                        Ready for adoption
                    </div>
                </button>

                {/* Foster Care */}
                <button
                    onClick={() => handleStatusCardClick('foster')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                        statusFilter === 'foster'
                            ? 'border-amber-500 bg-amber-50/60 shadow-sm dark:bg-amber-950/30 dark:border-amber-500'
                            : 'bg-white dark:bg-[#0B1527] border-gray-200/80 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-900'
                    }`}
                >
                    <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
                        <span>In Foster</span>
                        <Home className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="mt-2 text-2xl font-black font-fredoka text-amber-700 dark:text-amber-300">
                        {statusBar.foster}
                    </div>
                    <div className="mt-1 text-[11px] text-amber-600/80 dark:text-amber-400">
                        In foster homes
                    </div>
                </button>

                {/* Adopted */}
                <button
                    onClick={() => handleStatusCardClick('adopted')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                        statusFilter === 'adopted'
                            ? 'border-purple-500 bg-purple-50/60 shadow-sm dark:bg-purple-950/30 dark:border-purple-500'
                            : 'bg-white dark:bg-[#0B1527] border-gray-200/80 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-900'
                    }`}
                >
                    <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-400 font-bold uppercase tracking-wider">
                        <span>Adopted</span>
                        <HeartHandshake className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="mt-2 text-2xl font-black font-fredoka text-purple-700 dark:text-purple-300">
                        {statusBar.adopted}
                    </div>
                    <div className="mt-1 text-[11px] text-purple-600/80 dark:text-purple-400">
                        Loving forever homes
                    </div>
                </button>

                {/* Medical / Treatment */}
                <button
                    onClick={() => handleStatusCardClick('treatment')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                        statusFilter === 'treatment'
                            ? 'border-rose-500 bg-rose-50/60 shadow-sm dark:bg-rose-950/30 dark:border-rose-500'
                            : 'bg-white dark:bg-[#0B1527] border-gray-200/80 dark:border-gray-800 hover:border-rose-300 dark:hover:border-rose-900'
                    }`}
                >
                    <div className="flex items-center justify-between text-xs text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider">
                        <span>Treatment</span>
                        <Stethoscope className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="mt-2 text-2xl font-black font-fredoka text-rose-700 dark:text-rose-300">
                        {statusBar.treatment + statusBar.quarantine}
                    </div>
                    <div className="mt-1 text-[11px] text-rose-600/80 dark:text-rose-400">
                        Medical & quarantine
                    </div>
                </button>

                {/* Vaccination Status & Deceased */}
                <button
                    onClick={() => handleStatusCardClick('deceased')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                        statusFilter === 'deceased'
                            ? 'border-gray-500 bg-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-400'
                            : 'bg-white dark:bg-[#0B1527] border-gray-200/80 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700'
                    }`}
                >
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider">
                        <span>Deceased</span>
                        <Ribbon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="mt-2 text-2xl font-black font-fredoka text-gray-700 dark:text-gray-300">
                        {statusBar.deceased}
                    </div>
                    <div className="mt-1 text-[11px] text-gray-500">
                        Vaccinated: {statusBar.vaccination_rate}% ({statusBar.vaccinated_count})
                    </div>
                </button>
            </div>

            {/* SEARCH AND FILTERS TOOLBAR */}
            <div className="bg-white dark:bg-[#0B1527] p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-3">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by ID (#ANM-001), name, breed, color, or location..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-[#070e1c] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-paw-orange dark:text-white"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    applyFilters({ search: undefined });
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="px-5 py-2 bg-paw-orange text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        Search
                    </button>
                </form>

                {/* Filter selects row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
                    {/* Species */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Species</label>
                        <select
                            value={speciesFilter}
                            onChange={(e) => {
                                setSpeciesFilter(e.target.value);
                                applyFilters({ species: e.target.value !== 'all' ? e.target.value : undefined });
                            }}
                            className="w-full py-1.5 px-3 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-200 dark:border-gray-800 rounded-xl focus:border-paw-orange dark:text-white"
                        >
                            <option value="all">All Species</option>
                            <option value="dog">Dogs (Canine)</option>
                            <option value="cat">Cats (Feline)</option>
                            <option value="other">Other Species</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                applyFilters({ status: e.target.value !== 'all' ? e.target.value : undefined });
                            }}
                            className="w-full py-1.5 px-3 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-200 dark:border-gray-800 rounded-xl focus:border-paw-orange dark:text-white"
                        >
                            <option value="all">All Statuses</option>
                            <option value="available">Available</option>
                            <option value="foster">In Foster Care</option>
                            <option value="pending">Pending Adoption</option>
                            <option value="adopted">Adopted</option>
                            <option value="treatment">Under Treatment</option>
                            <option value="quarantine">Quarantine</option>
                            <option value="deceased">Deceased</option>
                        </select>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Gender</label>
                        <select
                            value={genderFilter}
                            onChange={(e) => {
                                setGenderFilter(e.target.value);
                                applyFilters({ gender: e.target.value !== 'all' ? e.target.value : undefined });
                            }}
                            className="w-full py-1.5 px-3 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-200 dark:border-gray-800 rounded-xl focus:border-paw-orange dark:text-white"
                        >
                            <option value="all">All Genders</option>
                            <option value="male">Male (♂)</option>
                            <option value="female">Female (♀)</option>
                        </select>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Current Location</label>
                        <select
                            value={locationFilter}
                            onChange={(e) => {
                                setLocationFilter(e.target.value);
                                applyFilters({ location: e.target.value !== 'all' ? e.target.value : undefined });
                            }}
                            className="w-full py-1.5 px-3 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-200 dark:border-gray-800 rounded-xl focus:border-paw-orange dark:text-white"
                        >
                            <option value="all">All Locations</option>
                            <option value="shelter">Shelter Units Only</option>
                            <option value="foster">Foster Homes Only</option>
                            {locationsList.map((loc) => (
                                <option key={loc} value={loc}>
                                    {loc}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Vaccination */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Vaccinated</label>
                        <select
                            value={vaccinatedFilter}
                            onChange={(e) => {
                                setVaccinatedFilter(e.target.value);
                                applyFilters({ vaccinated: e.target.value !== 'all' ? e.target.value : undefined });
                            }}
                            className="w-full py-1.5 px-3 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-200 dark:border-gray-800 rounded-xl focus:border-paw-orange dark:text-white"
                        >
                            <option value="all">All Vaccination</option>
                            <option value="yes">Vaccinated Only</option>
                            <option value="no">Not Vaccinated</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* MASTER RECORDS TABLE */}
            <div className="bg-white dark:bg-[#0B1527] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/75 dark:bg-[#070e1c]/60 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <th className="py-3.5 px-4">ID</th>
                                <th className="py-3.5 px-3">Image</th>
                                <th className="py-3.5 px-4">Name & Bio</th>
                                <th className="py-3.5 px-3">Species</th>
                                <th className="py-3.5 px-3">Breed</th>
                                <th className="py-3.5 px-3">Gender</th>
                                <th className="py-3.5 px-3">Status</th>
                                <th className="py-3.5 px-4">Current Location</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                            {animals.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400">
                                                <Search className="h-6 w-6" />
                                            </div>
                                            <span className="font-semibold text-sm">No animal records match your search or filter</span>
                                            <p className="text-xs text-gray-400 max-w-sm">Try clearing your filters or adding a new animal to the master registry.</p>
                                            <button
                                                onClick={resetFilters}
                                                className="mt-2 text-xs font-bold text-paw-orange hover:underline"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                animals.data.map((animal) => {
                                    const isVaccinated = animal.vaccinated;
                                    const isDeceased = animal.status === 'deceased';

                                    return (
                                        <tr
                                            key={animal.id}
                                            className="hover:bg-gray-50/80 dark:hover:bg-[#0e1b30] transition-colors group cursor-pointer"
                                            onClick={() => handleOpenSidePanel(animal, 'details')}
                                        >
                                            {/* ID */}
                                            <td className="py-3 px-4 font-mono font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[11px] border border-gray-200 dark:border-gray-700">
                                                        {animal.code}
                                                    </span>
                                                    {animal.has_active_condition && (
                                                        <span
                                                            title={`Active Condition: ${animal.active_condition_title || 'Needs Care'}`}
                                                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 flex items-center gap-1 border border-rose-200 dark:border-rose-900"
                                                        >
                                                            <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                                                            <span className="truncate max-w-[80px]">{animal.active_condition_title || 'Injured/Ill'}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* IMAGE */}
                                            <td className="py-3 px-3">
                                                <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shrink-0 shadow-sm">
                                                    <ImageWithFallback
                                                        src={formatPhotoUrl(animal.photo_url, animal.type)}
                                                        alt={animal.name}
                                                        className={`h-full w-full object-cover transition-transform group-hover:scale-105 ${isDeceased ? 'grayscale' : ''}`}
                                                    />
                                                    {isVaccinated && (
                                                        <span
                                                            title="Vaccinated"
                                                            className="absolute bottom-0 right-0 bg-emerald-500 text-white p-0.5 rounded-tl-md shadow"
                                                        >
                                                            <ShieldCheck className="h-2.5 w-2.5" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* NAME */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-sm text-[#0B2340] dark:text-[#F8FAFC] group-hover:text-paw-orange transition-colors">
                                                        {animal.name}
                                                    </span>
                                                    {animal.is_rescued !== false && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                                            <ShieldCheck className="h-2.5 w-2.5" />
                                                            <span>{animal.rescued_tag || 'Rescued • In Shelter'}</span>
                                                        </span>
                                                    )}
                                                    {animal.photos && animal.photos.length > 1 && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                            <Images className="h-2.5 w-2.5" />
                                                            <span>{animal.photos.length}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                    <span>{animal.age}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{animal.age_category}</span>
                                                    {animal.weight && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{animal.weight}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>

                                            {/* SPECIES */}
                                            <td className="py-3 px-3 whitespace-nowrap">
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                    {animal.species}
                                                </span>
                                            </td>

                                            {/* BREED */}
                                            <td className="py-3 px-3 text-gray-600 dark:text-gray-300 max-w-[130px] truncate" title={animal.breed}>
                                                {animal.breed}
                                            </td>

                                            {/* GENDER */}
                                            <td className="py-3 px-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 font-bold ${
                                                    animal.gender.toLowerCase() === 'male'
                                                        ? 'text-blue-600 dark:text-blue-400'
                                                        : 'text-pink-600 dark:text-pink-400'
                                                }`}>
                                                    {animal.gender.toLowerCase() === 'male' ? '♂ Male' : '♀ Female'}
                                                </span>
                                            </td>

                                            {/* STATUS */}
                                            <td className="py-3 px-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${getStatusBadge(animal.status)}`}>
                                                    {animal.status_label}
                                                </span>
                                            </td>

                                            {/* CURRENT LOCATION */}
                                            <td className="py-3 px-4 max-w-[200px]">
                                                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium truncate" title={animal.current_location}>
                                                    <MapPin className="h-3.5 w-3.5 text-paw-orange shrink-0" />
                                                    <span className="truncate">{animal.current_location}</span>
                                                </div>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleOpenSidePanel(animal, 'details')}
                                                        title="View Complete Animal Record"
                                                        className="px-2.5 py-1.5 bg-paw-orange/10 hover:bg-paw-orange text-paw-orange hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" /> Full Record
                                                    </button>

                                                    <button
                                                        onClick={() => handleStartEdit(animal)}
                                                        title="Quick Edit Record"
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleStartMedical(animal, 'injury')}
                                                        title="Log Injury or Disease"
                                                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                                    >
                                                        <AlertTriangle className="h-3.5 w-3.5" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleStartMedical(animal, 'vaccination')}
                                                        title="Add Vaccine or Medical Checkup"
                                                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                                                    >
                                                        <Syringe className="h-3.5 w-3.5" />
                                                    </button>

                                                    <button
                                                        onClick={() => setAnimalToDelete(animal)}
                                                        title="Archive Record"
                                                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Touch Cards View */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                    {animals.data.length === 0 ? (
                        <div className="py-12 px-4 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400">
                                <Search className="h-6 w-6" />
                            </div>
                            <span className="font-semibold text-sm">No animal records match your search or filter</span>
                            <p className="text-xs text-gray-400 max-w-sm">Try clearing your filters or adding a new animal to the master registry.</p>
                            <button
                                onClick={resetFilters}
                                className="mt-2 text-xs font-bold text-paw-orange hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        animals.data.map((animal) => {
                            const isVaccinated = animal.vaccinated;
                            const isDeceased = animal.status === 'deceased';

                            return (
                                <div
                                    key={animal.id}
                                    className="p-4 space-y-3 hover:bg-gray-50/80 dark:hover:bg-[#0e1b30] transition-colors cursor-pointer"
                                    onClick={() => handleOpenSidePanel(animal, 'details')}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shrink-0 shadow-sm">
                                            <ImageWithFallback
                                                src={formatPhotoUrl(animal.photo_url, animal.type)}
                                                alt={animal.name}
                                                className={`h-full w-full object-cover ${isDeceased ? 'grayscale' : ''}`}
                                            />
                                            {isVaccinated && (
                                                <span
                                                    title="Vaccinated"
                                                    className="absolute bottom-0 right-0 bg-emerald-500 text-white p-0.5 rounded-tl-md shadow"
                                                >
                                                    <ShieldCheck className="h-3 w-3" />
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-bold text-base text-[#0B2340] dark:text-[#F8FAFC] truncate">
                                                    {animal.name}
                                                </h3>
                                                <span className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusBadge(animal.status)}`}>
                                                    {animal.status_label}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                                <span className="font-mono font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">
                                                    {animal.code}
                                                </span>
                                                {animal.is_rescued !== false && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                        <ShieldCheck className="h-2.5 w-2.5" />
                                                        {animal.rescued_tag || 'Rescued • In Shelter'}
                                                    </span>
                                                )}
                                                <span>•</span>
                                                <span>{animal.species}</span>
                                                <span>•</span>
                                                <span className="truncate max-w-[120px]">{animal.breed}</span>
                                            </div>

                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span className={`font-bold ${
                                                    animal.gender.toLowerCase() === 'male'
                                                        ? 'text-blue-600 dark:text-blue-400'
                                                        : 'text-pink-600 dark:text-pink-400'
                                                }`}>
                                                    {animal.gender.toLowerCase() === 'male' ? '♂ Male' : '♀ Female'}
                                                </span>
                                                <span>•</span>
                                                <span>{animal.age} ({animal.age_category})</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 px-2.5 py-1.5 rounded-lg truncate">
                                        <MapPin className="h-3.5 w-3.5 text-paw-orange shrink-0" />
                                        <span className="truncate">{animal.current_location}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleOpenSidePanel(animal, 'details')}
                                            className="flex-1 py-1.5 px-3 bg-paw-orange/10 hover:bg-paw-orange text-paw-orange hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                                        >
                                            <Eye className="h-3.5 w-3.5" /> Full Record
                                        </button>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => handleStartEdit(animal)}
                                                title="Quick Edit Record"
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors"
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleStartMedical(animal, 'injury')}
                                                title="Log Injury or Disease"
                                                className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors"
                                            >
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleStartMedical(animal, 'vaccination')}
                                                title="Add Vaccine or Medical Checkup"
                                                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors"
                                            >
                                                <Syringe className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setAnimalToDelete(animal)}
                                                title="Archive Record"
                                                className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* PAGINATION BAR */}
                {animals.total > 0 && (
                    <div className="py-3.5 px-4 bg-gray-50/75 dark:bg-[#070e1c]/60 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <div>
                            Showing <span className="font-bold text-gray-700 dark:text-gray-200">{animals.from || 0}</span> to{' '}
                            <span className="font-bold text-gray-700 dark:text-gray-200">{animals.to || 0}</span> of{' '}
                            <span className="font-bold text-gray-700 dark:text-gray-200">{animals.total}</span> animals
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1">
                            {animals.links.map((link, idx) => {
                                const isLabelNumber = !link.label.includes('Previous') && !link.label.includes('Next');

                                return (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
                                            link.active
                                                ? 'bg-paw-orange text-white shadow-sm'
                                                : link.url
                                                ? 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* FULL RECORD SIDE PANEL (SLIDE-OVER SHEET) */}
            {selectedAnimal && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                        onClick={() => setSelectedAnimal(null)}
                    />

                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        <div className="w-screen max-w-2xl lg:max-w-3xl bg-white dark:bg-[#0B1527] shadow-2xl flex flex-col h-full border-l border-gray-200 dark:border-gray-800 animate-in slide-in-from-right duration-300">
                            {/* Panel Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#070e1c]/50">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-paw-orange/40 bg-gray-100 dark:bg-gray-800 shrink-0 shadow-md">
                                            <ImageWithFallback
                                                src={formatPhotoUrl(selectedAnimal.photo_url, selectedAnimal.type)}
                                                alt={selectedAnimal.name}
                                                className={`h-full w-full object-cover ${selectedAnimal.status === 'deceased' ? 'grayscale' : ''}`}
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-paw-orange/15 text-paw-orange dark:bg-paw-orange/20">
                                                    {selectedAnimal.code}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getStatusBadge(selectedAnimal.status)}`}>
                                                    {selectedAnimal.status_label}
                                                </span>
                                                {selectedAnimal.is_rescued !== false && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                                        <ShieldCheck className="h-3.5 w-3.5" />
                                                        <span>{selectedAnimal.rescued_tag || 'Rescued • In Shelter Care'}</span>
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-2xl font-black font-fredoka text-[#0B2340] dark:text-[#F8FAFC] mt-1">
                                                {selectedAnimal.name}
                                            </h3>

                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {selectedAnimal.species} • {selectedAnimal.breed} • {selectedAnimal.age} • {selectedAnimal.gender}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleStartEdit(selectedAnimal)}
                                            className="p-2 text-gray-500 hover:text-paw-orange bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-paw-orange transition-colors"
                                            title="Edit Animal Record"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedAnimal(null)}
                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Location banner */}
                                <div className="mt-4 flex items-center justify-between p-2.5 bg-white dark:bg-[#070e1c] rounded-xl border border-gray-200/80 dark:border-gray-800 text-xs">
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                        <MapPin className="h-4 w-4 text-paw-orange shrink-0" />
                                        <span>Current Location: <strong className="text-[#0B2340] dark:text-white">{selectedAnimal.current_location}</strong></span>
                                    </div>
                                    {selectedAnimal.has_active_condition && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1 border border-rose-200 dark:border-rose-900">
                                            <AlertTriangle className="h-3 w-3" /> Medical Attention
                                        </span>
                                    )}
                                </div>

                                {/* SECTION TABS */}
                                <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1 scrollbar-none border-b border-gray-200 dark:border-gray-800">
                                    {[
                                        { id: 'details', label: 'Details', icon: Info },
                                        { id: 'medical', label: `Medical & Vaccines (${selectedAnimal.medical_history.total_records_count})`, icon: Syringe },
                                        { id: 'adoption', label: selectedAnimal.adoption.is_adopted ? 'Adoption (Finalized)' : 'Adoption Readiness', icon: Heart },
                                        { id: 'rescue', label: 'Rescue Story', icon: FileText },
                                        { id: 'deceased', label: selectedAnimal.deceased.is_deceased ? 'Deceased Notes' : 'Memorial Notes', icon: Ribbon },
                                    ].map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = sidePanelTab === tab.id;

                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setSidePanelTab(tab.id as any)}
                                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                                    isActive
                                                        ? 'bg-paw-orange text-white shadow-sm shadow-paw-orange/20'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-[#0B2340] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                                <span>{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Panel Body Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* TAB 1: DETAILS */}
                                {sidePanelTab === 'details' && (
                                    <div className="space-y-6">
                                        {/* Interactive Photo Gallery Showcase */}
                                        {(() => {
                                            const rawPhotos = Array.isArray(selectedAnimal.photos) && selectedAnimal.photos.length > 0
                                                ? selectedAnimal.photos
                                                : [
                                                      selectedAnimal.photo_url,
                                                      ...(Array.isArray(selectedAnimal.gallery_photos) ? selectedAnimal.gallery_photos : []),
                                                  ];
                                            const allPhotos = Array.from(new Set(rawPhotos.filter(Boolean))) as string[];
                                            const safeIdx = allPhotos.length > 0 ? activeGalleryIdx % allPhotos.length : 0;
                                            const currentPhoto = allPhotos[safeIdx]
                                                ? formatPhotoUrl(allPhotos[safeIdx], selectedAnimal.type)
                                                : formatPhotoUrl(selectedAnimal.photo_url, selectedAnimal.type);

                                            return (
                                                <div className="bg-gray-50/75 dark:bg-[#070e1c]/60 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                                            <Images className="h-4 w-4 text-paw-orange" />
                                                            <span>Animal Photo Gallery ({allPhotos.length || 1})</span>
                                                        </h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStartEdit(selectedAnimal)}
                                                            className="text-[11px] font-bold text-paw-orange hover:underline flex items-center gap-1"
                                                        >
                                                            <Plus className="h-3 w-3" /> Manage Photos
                                                        </button>
                                                    </div>

                                                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group">
                                                        <ImageWithFallback
                                                            src={currentPhoto}
                                                            alt={selectedAnimal.name}
                                                            className="w-full h-full object-cover cursor-pointer"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setLightboxUrl(currentPhoto)}
                                                            className="absolute bottom-3 right-3 bg-black/65 hover:bg-black/85 text-white p-2 rounded-full backdrop-blur-xs transition-all"
                                                            title="Expand photo"
                                                        >
                                                            <Maximize2 className="h-4 w-4" />
                                                        </button>

                                                        {allPhotos.length > 1 && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setActiveGalleryIdx((safeIdx - 1 + allPhotos.length) % allPhotos.length)}
                                                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/85 text-white p-1.5 rounded-full backdrop-blur-xs transition-all"
                                                                >
                                                                    <ChevronLeft className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setActiveGalleryIdx((safeIdx + 1) % allPhotos.length)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/85 text-white p-1.5 rounded-full backdrop-blur-xs transition-all"
                                                                >
                                                                    <ChevronRight className="h-4 w-4" />
                                                                </button>
                                                                <div className="absolute bottom-3 left-3 bg-black/65 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                                                                    {safeIdx + 1} / {allPhotos.length}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    {allPhotos.length > 1 && (
                                                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                                            {allPhotos.map((url, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    type="button"
                                                                    onClick={() => setActiveGalleryIdx(idx)}
                                                                    className={`relative h-14 w-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                                                                        idx === safeIdx
                                                                            ? 'border-paw-orange ring-2 ring-paw-orange/25 scale-105'
                                                                            : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'
                                                                    }`}
                                                                >
                                                                    <ImageWithFallback
                                                                        src={formatPhotoUrl(url, selectedAnimal.type)}
                                                                        alt={`${selectedAnimal.name} thumbnail ${idx + 1}`}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {/* Core Profile Card */}
                                        <div className="bg-gray-50/75 dark:bg-[#070e1c]/60 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Identification & Physical Attributes</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                                <div>
                                                    <span className="text-gray-400 block">Species / Type</span>
                                                    <strong className="text-gray-800 dark:text-gray-200 capitalize text-sm">{selectedAnimal.species}</strong>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Breed</span>
                                                    <strong className="text-gray-800 dark:text-gray-200 text-sm">{selectedAnimal.breed}</strong>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Gender</span>
                                                    <strong className="text-gray-800 dark:text-gray-200 capitalize text-sm">{selectedAnimal.gender}</strong>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Age & Life Stage</span>
                                                    <strong className="text-gray-800 dark:text-gray-200 text-sm">{selectedAnimal.age} ({selectedAnimal.age_category})</strong>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Weight</span>
                                                    <strong className="text-gray-800 dark:text-gray-200 text-sm">{selectedAnimal.weight || 'Not recorded'}</strong>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Coat Color</span>
                                                    <strong className="text-gray-800 dark:text-gray-200 text-sm">{selectedAnimal.color || 'Standard'}</strong>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Medical Status</span>
                                                    <strong className="text-gray-800 dark:text-gray-200 text-sm">
                                                        {selectedAnimal.has_active_condition ? (
                                                            <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                                                                <AlertTriangle className="h-3.5 w-3.5" /> {selectedAnimal.active_condition_title}
                                                            </span>
                                                        ) : (
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                                                <Check className="h-3.5 w-3.5" /> Healthy / Clear
                                                            </span>
                                                        )}
                                                    </strong>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Admission Date</span>
                                                    <strong className="text-gray-800 dark:text-gray-200 text-sm">{selectedAnimal.admitted_at_human || 'Unknown'}</strong>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Time in Shelter Care</span>
                                                    <strong className="text-gray-800 dark:text-gray-200 text-sm">{selectedAnimal.shelter_days} days</strong>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Behavior and Special Needs */}
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-[#0B1527]">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                    <Activity className="h-4 w-4 text-paw-orange" />
                                                    <span>Temperament & Behavioral Notes</span>
                                                </div>
                                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {selectedAnimal.behavior || 'No specific behavioral challenges noted. Generally friendly, socialized, and adaptable to normal shelter routines.'}
                                                </p>
                                            </div>

                                            {selectedAnimal.special_needs && (
                                                <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-2">
                                                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                        <span>Special Care & Dietary Requirements</span>
                                                    </div>
                                                    <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                                                        {selectedAnimal.special_needs}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Foster Parent Information if currently fostered */}
                                            {selectedAnimal.foster.is_active && (
                                                <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                                                            <Home className="h-4 w-4 text-amber-600" />
                                                            <span>Active Foster Parent Placement</span>
                                                        </div>
                                                        <span className="text-[11px] font-bold text-amber-700 bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
                                                            Since {selectedAnimal.foster.start_date}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300 mt-2">
                                                        <div>
                                                            <span className="text-gray-400 block text-[11px]">Foster Parent Name</span>
                                                            <strong>{selectedAnimal.foster.parent_name || 'Authorized Foster Parent'}</strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 block text-[11px]">Foster Home Location</span>
                                                            <strong>{selectedAnimal.foster.location || 'Home Address'}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: VACCINATED & MEDICAL HISTORY */}
                                {sidePanelTab === 'medical' && (
                                    <div className="space-y-6">
                                        {/* Vaccination Status Summary Banner */}
                                        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                                            selectedAnimal.vaccinated
                                                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
                                                : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-xl ${selectedAnimal.vaccinated ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                    <ShieldCheck className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-sm text-[#0B2340] dark:text-white">
                                                        {selectedAnimal.vaccinated ? 'Vaccination Current' : 'Vaccination Incomplete'}
                                                    </h5>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {selectedAnimal.medical_history.vaccines_count} vaccine dose(s) recorded in registry.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleStartMedical(selectedAnimal, 'injury')}
                                                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                                                >
                                                    <AlertTriangle className="h-3.5 w-3.5 stroke-[2.5]" /> Log Injury / Disease
                                                </button>
                                                <button
                                                    onClick={() => handleStartMedical(selectedAnimal, 'vaccination')}
                                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5 stroke-[3]" /> Log Vaccine / Exam
                                                </button>
                                            </div>
                                        </div>

                                        {/* Next Due Alert if any */}
                                        {selectedAnimal.medical_history.next_due && selectedAnimal.medical_history.next_due.next_due_date && (
                                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                                                <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                                                <span>Upcoming Booster/Checkup: <strong>{selectedAnimal.medical_history.next_due.title}</strong> scheduled for <strong>{selectedAnimal.medical_history.next_due.next_due_date}</strong></span>
                                            </div>
                                        )}

                                        {/* Injuries & Diseases Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                                                    <span>Injuries & Disease History ({selectedAnimal.medical_history.conditions_count || 0})</span>
                                                </h4>
                                                {(selectedAnimal.medical_history.active_conditions_count || 0) > 0 && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                                        {selectedAnimal.medical_history.active_conditions_count} Active Issue{(selectedAnimal.medical_history.active_conditions_count || 0) > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>

                                            {selectedAnimal.medical_history.conditions && selectedAnimal.medical_history.conditions.length > 0 ? (
                                                <div className="space-y-3">
                                                    {selectedAnimal.medical_history.conditions.map((cond) => {
                                                        const isActive = ['active', 'under_treatment', 'scheduled', 'overdue', 'chronic'].includes(cond.status);
                                                        const isInjury = cond.record_type === 'injury';

                                                        return (
                                                            <div
                                                                key={cond.id}
                                                                className={`p-4 rounded-2xl border transition-all ${
                                                                    isActive
                                                                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-xs'
                                                                        : 'bg-white dark:bg-[#070e1c] border-gray-200 dark:border-gray-800'
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="space-y-1.5 flex-1">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <strong className="text-gray-900 dark:text-white font-bold text-sm">
                                                                                {cond.title}
                                                                            </strong>
                                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                                                isInjury
                                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                                                            }`}>
                                                                                {isInjury ? 'Injury / Trauma' : 'Disease / Infection'}
                                                                            </span>
                                                                            {cond.severity && (
                                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                                                    cond.severity === 'critical' || cond.severity === 'severe'
                                                                                        ? 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200'
                                                                                        : cond.severity === 'moderate'
                                                                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                                                }`}>
                                                                                    {cond.severity}
                                                                                </span>
                                                                            )}
                                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                                                                cond.status === 'resolved' || cond.status === 'completed'
                                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                                                            }`}>
                                                                                {cond.status.replace('_', ' ')}
                                                                            </span>
                                                                        </div>

                                                                        <div className="text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-3 text-xs">
                                                                            <span>Diagnosed: <strong>{cond.performed_date}</strong></span>
                                                                            {cond.veterinarian && <span>Vet: <strong>{cond.veterinarian}</strong></span>}
                                                                            {cond.next_due_date && <span>Follow-up: <strong>{cond.next_due_date}</strong></span>}
                                                                        </div>

                                                                        {cond.treatment_plan && (
                                                                            <div className="mt-2 p-2.5 rounded-xl bg-white/80 dark:bg-[#0b1527] border border-gray-200/60 dark:border-gray-800 text-xs">
                                                                                <span className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">Treatment Plan:</span>
                                                                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{cond.treatment_plan}</p>
                                                                            </div>
                                                                        )}

                                                                        {cond.notes && (
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                                                                                Notes: {cond.notes}
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                                        {isActive && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (confirm(`Mark "${cond.title}" as resolved?`)) {
                                                                                        router.put(`/account/admin/animal-records/medical/${cond.id}`, {
                                                                                            status: 'resolved',
                                                                                            update_animal_status: selectedAnimal.status === 'treatment' ? 'available' : undefined,
                                                                                        }, {
                                                                                            onSuccess: () => toast.success(`"${cond.title}" marked as resolved!`),
                                                                                            onError: () => toast.error('Failed to update status.'),
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                                                                                title="Mark condition as resolved / cured"
                                                                            >
                                                                                <Check className="h-3 w-3" /> Resolve
                                                                            </button>
                                                                        )}

                                                                        <button
                                                                            onClick={() => {
                                                                                if (confirm(`Remove this record "${cond.title}"?`)) {
                                                                                    router.delete(`/account/admin/animal-records/medical/${cond.id}`, {
                                                                                        onSuccess: () => toast.success('Record removed'),
                                                                                    });
                                                                                }
                                                                            }}
                                                                            className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                                            title="Delete record"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs text-gray-400 flex flex-col items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500/70" />
                                                    <span>No injuries or diseases logged for this pet. Clean bill of health!</span>
                                                    <button
                                                        onClick={() => handleStartMedical(selectedAnimal, 'injury')}
                                                        className="text-paw-orange font-bold hover:underline"
                                                    >
                                                        + Report Injury or Disease
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Vaccination Records Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Syringe className="h-4 w-4 text-emerald-500" />
                                                    <span>Immunization & Vaccine History ({selectedAnimal.medical_history.vaccines_count})</span>
                                                </h4>
                                            </div>

                                            {selectedAnimal.medical_history.vaccinations.length === 0 ? (
                                                <div className="p-6 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs text-gray-400">
                                                    No immunization records logged yet for this pet.
                                                </div>
                                            ) : (
                                                <div className="space-y-2.5">
                                                    {selectedAnimal.medical_history.vaccinations.map((vac) => (
                                                        <div key={vac.id} className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#070e1c] flex items-start justify-between gap-3 text-xs">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <strong className="text-gray-900 dark:text-white font-bold">{vac.title}</strong>
                                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                                                                        {vac.status}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-1 text-gray-500 flex flex-wrap items-center gap-3 text-[11px]">
                                                                    <span>Administered: <strong>{vac.performed_date}</strong></span>
                                                                    {vac.next_due_date && <span>Next Due: <strong>{vac.next_due_date}</strong></span>}
                                                                    {vac.veterinarian && <span>Vet: <strong>{vac.veterinarian}</strong></span>}
                                                                    {vac.batch_number && <span>Batch: {vac.batch_number}</span>}
                                                                </div>
                                                                {vac.notes && <p className="mt-1.5 text-gray-600 dark:text-gray-400 italic text-[11px]">{vac.notes}</p>}
                                                            </div>

                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Remove vaccine record "${vac.title}"?`)) {
                                                                        router.delete(`/account/admin/animal-records/medical/${vac.id}`, {
                                                                            onSuccess: () => toast.success('Medical record removed'),
                                                                        });
                                                                    }
                                                                }}
                                                                className="text-gray-400 hover:text-rose-600 p-1"
                                                                title="Delete record"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Other Medical Treatments & Physical Exams */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Stethoscope className="h-4 w-4 text-blue-500" />
                                                    <span>Clinical Treatments & Medical Checkups ({selectedAnimal.medical_history.other_records_count})</span>
                                                </h4>
                                            </div>

                                            {selectedAnimal.medical_history.treatments.length === 0 ? (
                                                <div className="p-6 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs text-gray-400">
                                                    No surgeries, injuries, or clinical checkups recorded yet.
                                                </div>
                                            ) : (
                                                <div className="space-y-2.5">
                                                    {selectedAnimal.medical_history.treatments.map((med) => (
                                                        <div key={med.id} className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#070e1c] flex items-start justify-between gap-3 text-xs">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <strong className="text-gray-900 dark:text-white font-bold">{med.title}</strong>
                                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 capitalize">
                                                                        {med.record_type.replace('_', ' ')}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-1 text-gray-500 flex flex-wrap items-center gap-3 text-[11px]">
                                                                    <span>Date: <strong>{med.performed_date}</strong></span>
                                                                    {med.veterinarian && <span>Attending Vet: <strong>{med.veterinarian}</strong></span>}
                                                                    {med.dosage && <span>Dosage: {med.dosage}</span>}
                                                                </div>
                                                                {med.notes && <p className="mt-1.5 text-gray-600 dark:text-gray-400 text-[11px]">{med.notes}</p>}
                                                            </div>

                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Remove medical record "${med.title}"?`)) {
                                                                        router.delete(`/account/admin/animal-records/medical/${med.id}`, {
                                                                            onSuccess: () => toast.success('Medical record removed'),
                                                                        });
                                                                    }
                                                                }}
                                                                className="text-gray-400 hover:text-rose-600 p-1"
                                                                title="Delete record"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: ADOPTION HISTORY */}
                                {sidePanelTab === 'adoption' && (
                                    <div className="space-y-6">
                                        {selectedAnimal.adoption.is_adopted ? (
                                            /* Adopted Confirmation Card */
                                            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 p-6 rounded-2xl space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-md">
                                                        <HeartHandshake className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                                                            Finalized Adoption
                                                        </span>
                                                        <h4 className="text-xl font-black font-fredoka text-purple-950 dark:text-purple-100">
                                                            Adopted into Forever Home!
                                                        </h4>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-purple-200 dark:border-purple-900/50">
                                                    <div>
                                                        <span className="text-gray-400 block text-[11px]">Final Adoption Date</span>
                                                        <strong className="text-gray-800 dark:text-gray-200 text-sm">
                                                            {selectedAnimal.adoption.adoption_date_human || selectedAnimal.adoption.adoption_date || 'Date not set'}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block text-[11px]">Adopter Full Name</span>
                                                        <strong className="text-gray-800 dark:text-gray-200 text-sm">
                                                            {selectedAnimal.adoption.adopter_name || 'Anonymous Adopter'}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block text-[11px]">Contact Phone</span>
                                                        <strong className="text-gray-800 dark:text-gray-200 text-sm">
                                                            {selectedAnimal.adoption.adopter_phone || 'None provided'}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block text-[11px]">Contact Email</span>
                                                        <strong className="text-gray-800 dark:text-gray-200 text-sm">
                                                            {selectedAnimal.adoption.adopter_email || 'None provided'}
                                                        </strong>
                                                    </div>
                                                </div>

                                                {selectedAnimal.adoption.adoption_notes && (
                                                    <div className="pt-2 border-t border-purple-200 dark:border-purple-900/50 text-xs">
                                                        <span className="text-gray-400 block text-[11px] mb-1">Adoption & Post-Placement Notes</span>
                                                        <p className="text-gray-700 dark:text-gray-300 italic">
                                                            "{selectedAnimal.adoption.adoption_notes}"
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Not Adopted - Show Readiness & Applications */
                                            <div className="space-y-4">
                                                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                                                    <div>
                                                        <h5 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                                                            Status: {selectedAnimal.status_label}
                                                        </h5>
                                                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                                            This animal is currently awaiting an approved adoption placement.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleStartEdit(selectedAnimal)}
                                                        className="px-3.5 py-1.5 bg-paw-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
                                                    >
                                                        Mark as Adopted
                                                    </button>
                                                </div>

                                                {/* Applications Received for this Animal */}
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                                        Adoption Applications ({selectedAnimal.adoption.applications_count})
                                                    </h4>

                                                    {selectedAnimal.adoption.applications.length === 0 ? (
                                                        <div className="p-6 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs text-gray-400">
                                                            No public adoption applications submitted yet for this pet.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {selectedAnimal.adoption.applications.map((app) => (
                                                                <div key={app.id} className="p-3 bg-white dark:bg-[#070e1c] border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-between text-xs">
                                                                    <div>
                                                                        <span className="font-bold text-gray-800 dark:text-gray-200">{app.applicant_name}</span>
                                                                        <div className="text-[11px] text-gray-400 mt-0.5">
                                                                            Submitted on {app.created_at} • {app.applicant_email}
                                                                        </div>
                                                                    </div>
                                                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 capitalize">
                                                                        {app.status}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TAB 4: RESCUE STORIES */}
                                {sidePanelTab === 'rescue' && (
                                    <div className="space-y-6">
                                        {/* Before & After Transformation Journey */}
                                        {(() => {
                                            const beforeUrl = selectedAnimal.before_photo_url || selectedAnimal.rescue.before_photo_url || null;
                                            const afterUrl = selectedAnimal.after_photo_url || selectedAnimal.rescue.after_photo_url || null;

                                            return (
                                                <div className="p-5 rounded-2xl border border-paw-orange/30 bg-orange-50/50 dark:bg-orange-950/20 space-y-4">
                                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-paw-orange uppercase tracking-wider">
                                                            <Sparkles className="h-4 w-4 text-paw-orange" />
                                                            <span>Before & After Transformation</span>
                                                        </div>
                                                        {beforeUrl || afterUrl ? (
                                                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-paw-orange/20 text-paw-orange dark:text-paw-yellow">
                                                                Featured on Homepage
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStartEdit(selectedAnimal)}
                                                                className="text-[11px] font-bold text-paw-orange hover:underline flex items-center gap-1"
                                                            >
                                                                <Plus className="h-3 w-3" /> Upload Before & After
                                                            </button>
                                                        )}
                                                    </div>

                                                    {beforeUrl || afterUrl ? (
                                                        <div className={`grid ${beforeUrl && afterUrl ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                                                            {beforeUrl && (
                                                                <div className="space-y-1.5">
                                                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                                                                        When Rescued (Before)
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setLightboxUrl(formatPhotoUrl(beforeUrl, selectedAnimal.type))}
                                                                        className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 block"
                                                                    >
                                                                        <ImageWithFallback
                                                                            src={formatPhotoUrl(beforeUrl, selectedAnimal.type)}
                                                                            alt="Before Transformation"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {afterUrl && (
                                                                <div className="space-y-1.5">
                                                                    <span className="text-[11px] font-bold text-paw-orange uppercase tracking-wider block">
                                                                        Healed / Today (After)
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setLightboxUrl(formatPhotoUrl(afterUrl, selectedAnimal.type))}
                                                                        className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-paw-orange/40 bg-orange-100/30 dark:bg-gray-800 block"
                                                                    >
                                                                        <ImageWithFallback
                                                                            src={formatPhotoUrl(afterUrl, selectedAnimal.type)}
                                                                            alt="After Transformation"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 text-center rounded-xl border border-dashed border-paw-orange/30 bg-white/60 dark:bg-[#070e1c]/50 text-xs text-gray-500">
                                                            No Before & After transformation photos uploaded yet. When unset, the homepage adoption gallery automatically hides the transformation block for this animal.
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {/* Rescue narrative */}
                                        <div className="p-5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 space-y-3">
                                            <div className="flex items-center gap-2 text-xs font-bold text-paw-orange uppercase tracking-wider">
                                                <Heart className="h-4 w-4" />
                                                <span>Rescue & Journey Narrative</span>
                                            </div>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                                {selectedAnimal.rescue.rescue_story || selectedAnimal.story || 'Rescued from difficult circumstances and brought into our sanctuary care.'}
                                            </p>
                                        </div>

                                        {/* Rescue details grid */}
                                        <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#070e1c]">
                                            <div>
                                                <span className="text-gray-400 block text-[11px]">Rescue Date</span>
                                                <strong className="text-gray-800 dark:text-gray-200">{selectedAnimal.rescue.rescue_date_human || 'Recorded at intake'}</strong>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block text-[11px]">Rescue Location</span>
                                                <strong className="text-gray-800 dark:text-gray-200">{selectedAnimal.rescue.rescue_location || 'Local community rescue'}</strong>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block text-[11px]">Intake Type</span>
                                                <strong className="text-gray-800 dark:text-gray-200 capitalize">{selectedAnimal.intake_type}</strong>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block text-[11px]">Shelter Admission</span>
                                                <strong className="text-gray-800 dark:text-gray-200">{selectedAnimal.admitted_at_human}</strong>
                                            </div>
                                        </div>

                                        {/* Linked Community Pet Report if exists */}
                                        {selectedAnimal.rescue.pet_report && (
                                            <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-2 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider text-[11px]">
                                                        Linked Community Incident Report #{selectedAnimal.rescue.pet_report.id}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                        {selectedAnimal.rescue.pet_report.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300">{selectedAnimal.rescue.pet_report.description}</p>
                                                <div className="text-[11px] text-gray-400 pt-1">
                                                    Location: {selectedAnimal.rescue.pet_report.location} • Reported: {selectedAnimal.rescue.pet_report.created_at}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TAB 5: DECEASED NOTES */}
                                {sidePanelTab === 'deceased' && (
                                    <div className="space-y-6">
                                        {selectedAnimal.deceased.is_deceased ? (
                                            <div className="bg-gray-100 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 p-6 rounded-2xl space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-gray-700 text-white rounded-2xl">
                                                        <Ribbon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                            Memorial Registry
                                                        </span>
                                                        <h4 className="text-xl font-black font-fredoka text-gray-900 dark:text-white">
                                                            Forever Remembered • Rest in Peace
                                                        </h4>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-white dark:bg-[#070e1c] rounded-xl border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-400 text-[11px]">Date of Passing</span>
                                                        <strong className="text-gray-800 dark:text-gray-200">
                                                            {selectedAnimal.deceased.deceased_at_human || selectedAnimal.deceased.deceased_at || 'Recorded in archive'}
                                                        </strong>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5 text-xs">
                                                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[11px]">Memorial Tribute & Medical Notes</span>
                                                    <p className="p-4 bg-white dark:bg-[#070e1c] rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 leading-relaxed italic whitespace-pre-line">
                                                        "{selectedAnimal.deceased.deceased_notes || 'Crossed the rainbow bridge peacefully under gentle veterinary supervision.'}"
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center border border-gray-200 dark:border-gray-800 rounded-2xl space-y-3 bg-gray-50/50 dark:bg-[#070e1c]/40 text-xs">
                                                <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full">
                                                    <Heart className="h-6 w-6 fill-current" />
                                                </div>
                                                <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
                                                    {selectedAnimal.name} is Active & Alive
                                                </h4>
                                                <p className="text-gray-500 max-w-md mx-auto">
                                                    This pet is currently active under sanctuary care or adopted into a loving home. If unfortunate circumstances occur, you can record memorial notes and date of passing.
                                                </p>
                                                <button
                                                    onClick={() => handleStartEdit(selectedAnimal)}
                                                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs"
                                                >
                                                    Record Deceased Status
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Panel Footer */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#070e1c]/80 flex items-center justify-between">
                                <div className="text-xs text-gray-400">
                                    Animal ID: #{selectedAnimal.id} • Registered on {selectedAnimal.admitted_at_human}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleStartMedical(selectedAnimal, 'injury')}
                                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                                    >
                                        <AlertTriangle className="h-3 w-3" /> Log Injury / Disease
                                    </button>
                                    <button
                                        onClick={() => handleStartMedical(selectedAnimal, 'vaccination')}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                                    >
                                        <Plus className="h-3 w-3 stroke-[3]" /> Add Medical
                                    </button>
                                    <button
                                        onClick={() => handleStartEdit(selectedAnimal)}
                                        className="px-3.5 py-1.5 bg-paw-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
                                    >
                                        Edit Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 1: REGISTER NEW ANIMAL MODAL */}
            {isAddAnimalOpen && (
                <AddAnimalModal
                    onClose={() => setIsAddAnimalOpen(false)}
                    locationsList={locationsList}
                />
            )}

            {/* MODAL 2: EDIT ANIMAL MODAL */}
            {isEditAnimalOpen && animalToEdit && (
                <EditAnimalModal
                    animal={animalToEdit}
                    onClose={() => {
                        setIsEditAnimalOpen(false);
                        setAnimalToEdit(null);
                    }}
                    locationsList={locationsList}
                />
            )}

            {/* MODAL 3: LOG MEDICAL / VACCINE RECORD MODAL */}
            {isAddMedicalOpen && medicalTargetAnimal && (
                <AddMedicalModal
                    animal={medicalTargetAnimal}
                    initialType={medicalPresetType}
                    onClose={() => {
                        setIsAddMedicalOpen(false);
                        setMedicalTargetAnimal(null);
                    }}
                />
            )}

            {/* MODAL 4: CONFIRM DELETE MODAL */}
            {animalToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-[#0B1527] rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800 shadow-xl space-y-4">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 rounded-xl">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h4 className="text-lg font-bold font-fredoka text-[#0B2340] dark:text-white">
                                Archive Animal Record?
                            </h4>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            Are you sure you want to archive the master record for <strong>{animalToDelete.name}</strong> ({animalToDelete.code})? The animal will be removed from active listings but can be restored from system archives if needed.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                onClick={() => setAnimalToDelete(null)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                                Yes, Archive Animal
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* FULLSCREEN LIGHTBOX MODAL */}
            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setLightboxUrl(null)}
                >
                    <button
                        type="button"
                        onClick={() => setLightboxUrl(null)}
                        className="absolute top-6 right-6 bg-white/15 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <img
                        src={lightboxUrl}
                        alt="Full view"
                        className="max-w-full max-h-[88vh] rounded-2xl object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </AdminPageShell>
    );
}

/* SUBCOMPONENT: REGISTER NEW ANIMAL MODAL */
function AddAnimalModal({ onClose, locationsList }: { onClose: () => void; locationsList: string[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'dog',
        breed: '',
        age: '',
        ageCategory: 'adult',
        gender: 'male',
        color: '',
        weight: '',
        current_location: 'Main Shelter - Kennel Area',
        status: 'available',
        behavior: '',
        special_needs: '',
        story: '',
        vaccinated: false,
        admittedAt: new Date().toISOString().split('T')[0],
        intake_type: 'rescue',
        rescue_date: '',
        rescue_location: '',
        rescue_story: '',
        adoption_date: '',
        adopter_name: '',
        adopter_phone: '',
        adopter_email: '',
        adoption_notes: '',
        deceased_at: '',
        deceased_notes: '',
        photo: null as File | null,
        gallery_photos: [] as File[],
        before_photo: null as File | null,
        after_photo: null as File | null,
    });

    const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        setData('gallery_photos', [...data.gallery_photos, ...selectedFiles]);
    };

    const removeStagedGalleryPhoto = (indexToRemove: number) => {
        setData(
            'gallery_photos',
            data.gallery_photos.filter((_, idx) => idx !== indexToRemove)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/account/admin/animal-records', {
            onSuccess: () => {
                toast.success('Animal master record registered successfully!');
                onClose();
            },
            onError: () => toast.error('Please resolve the form errors.'),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-[#0B1527] rounded-3xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 shadow-2xl my-8 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold font-fredoka text-[#0B2340] dark:text-white">Register New Animal</h3>
                        <p className="text-xs text-gray-500">Create a comprehensive master record with full identification and location.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    {/* Basic info row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Pet Name *</label>
                            <input
                                type="text"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                placeholder="e.g. Luna"
                            />
                            {errors.name && <p className="text-rose-500 text-[10px] mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Species *</label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            >
                                <option value="dog">Dog (Canine)</option>
                                <option value="cat">Cat (Feline)</option>
                                <option value="other">Other Species</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Breed *</label>
                            <input
                                type="text"
                                required
                                value={data.breed}
                                onChange={(e) => setData('breed', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                placeholder="e.g. Aspin, Golden Mix"
                            />
                        </div>
                    </div>

                    {/* Age, Gender, Life Stage */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Age String *</label>
                            <input
                                type="text"
                                required
                                value={data.age}
                                onChange={(e) => setData('age', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                placeholder="e.g. 2 yrs, 6 mos"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Life Stage *</label>
                            <select
                                value={data.ageCategory}
                                onChange={(e) => setData('ageCategory', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            >
                                <option value="puppy">Puppy</option>
                                <option value="kitten">Kitten</option>
                                <option value="young">Young</option>
                                <option value="adult">Adult</option>
                                <option value="senior">Senior</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Gender *</label>
                            <select
                                value={data.gender}
                                onChange={(e) => setData('gender', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            >
                                <option value="male">Male (♂)</option>
                                <option value="female">Female (♀)</option>
                            </select>
                        </div>
                    </div>

                    {/* Location, Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Current Location *</label>
                            <input
                                type="text"
                                value={data.current_location}
                                onChange={(e) => setData('current_location', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                placeholder="e.g. Main Shelter - Kennel A"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            >
                                <option value="available">Available for Adoption</option>
                                <option value="foster">In Foster Care</option>
                                <option value="pending">Pending Adoption</option>
                                <option value="treatment">Under Treatment</option>
                                <option value="quarantine">Quarantine</option>
                                <option value="adopted">Adopted</option>
                                <option value="deceased">Deceased</option>
                            </select>
                        </div>
                    </div>

                    {/* Weight, Color, Admitted Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Weight</label>
                            <input
                                type="text"
                                value={data.weight}
                                onChange={(e) => setData('weight', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                placeholder="e.g. 14.5 kg"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Color / Markings</label>
                            <input
                                type="text"
                                value={data.color}
                                onChange={(e) => setData('color', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                placeholder="e.g. Golden brown with white chest"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Admitted Date *</label>
                            <input
                                type="date"
                                required
                                value={data.admittedAt}
                                onChange={(e) => setData('admittedAt', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Photo upload */}
                    <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-[#070e1c] rounded-2xl border border-gray-200 dark:border-gray-800">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Primary Animal Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-paw-orange/10 file:text-paw-orange hover:file:bg-paw-orange/20 cursor-pointer"
                            />
                        </div>

                        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                                <Images className="h-3.5 w-3.5 text-paw-orange" />
                                <span>Additional Gallery Photos (Multiple Images)</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleGallerySelect}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-600 hover:file:bg-blue-500/20 cursor-pointer"
                            />
                            {data.gallery_photos.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-2">
                                    {data.gallery_photos.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="relative group flex items-center gap-1.5 bg-white dark:bg-[#0B1527] border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-lg text-[11px] font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            <span className="truncate max-w-[120px]">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeStagedGalleryPhoto(idx)}
                                                className="text-rose-500 hover:text-rose-700"
                                                title="Remove photo"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transformation Before & After Photos */}
                    <div className="p-3 bg-paw-orange/5 dark:bg-paw-orange/10 rounded-2xl border border-paw-orange/20 space-y-2">
                        <span className="text-xs font-bold text-paw-orange dark:text-paw-yellow block">
                            Before & After Photos (Homepage Showcase & Transformation)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Before Photo (When Rescued)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('before_photo', e.target.files?.[0] || null)}
                                    className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-gray-200 dark:file:bg-gray-700 cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">After Photo (Today / Healed)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('after_photo', e.target.files?.[0] || null)}
                                    className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-paw-orange/20 file:text-paw-orange cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rescue Details */}
                    <div className="p-3 bg-gray-50 dark:bg-[#070e1c] rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Rescue Information</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={data.rescue_date}
                                onChange={(e) => setData('rescue_date', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0B1527] border border-gray-300 dark:border-gray-700 rounded-lg"
                                placeholder="Rescue Date"
                            />
                            <input
                                type="text"
                                value={data.rescue_location}
                                onChange={(e) => setData('rescue_location', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0B1527] border border-gray-300 dark:border-gray-700 rounded-lg"
                                placeholder="Rescued From (e.g. Barangay Central)"
                            />
                        </div>
                        <textarea
                            rows={2}
                            value={data.rescue_story}
                            onChange={(e) => setData('rescue_story', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0B1527] border border-gray-300 dark:border-gray-700 rounded-lg"
                            placeholder="Rescue story or background circumstances..."
                        />
                    </div>

                    {/* Behavior and Special needs */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Behavior & Special Care Notes</label>
                        <textarea
                            rows={2}
                            value={data.behavior}
                            onChange={(e) => setData('behavior', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            placeholder="e.g. Good with dogs, playful, requires gentle handling."
                        />
                    </div>

                    {/* Checkbox Vaccinated */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="new_vaccinated"
                            checked={data.vaccinated}
                            onChange={(e) => setData('vaccinated', e.target.checked)}
                            className="rounded text-paw-orange focus:ring-paw-orange h-4 w-4"
                        />
                        <label htmlFor="new_vaccinated" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            Already Vaccinated at intake
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-paw-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-paw-orange/20"
                        >
                            {processing ? 'Registering...' : 'Register Animal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* SUBCOMPONENT: EDIT ANIMAL MODAL */
function EditAnimalModal({ animal, onClose, locationsList }: { animal: AnimalRecord; onClose: () => void; locationsList: string[] }) {
    const { data, setData, post, processing } = useForm({
        _method: 'PUT',
        name: animal.name,
        type: animal.type,
        breed: animal.breed,
        age: animal.age,
        ageCategory: animal.age_category,
        gender: animal.gender,
        color: animal.color || '',
        weight: animal.weight || '',
        current_location: animal.raw_location || animal.current_location,
        status: animal.status,
        behavior: animal.behavior || '',
        special_needs: animal.special_needs || '',
        story: animal.story || '',
        vaccinated: animal.vaccinated,
        admittedAt: animal.admitted_at || new Date().toISOString().split('T')[0],
        intake_type: animal.intake_type || 'rescue',
        rescue_date: animal.rescue.rescue_date || '',
        rescue_location: animal.rescue.rescue_location || '',
        rescue_story: animal.rescue.rescue_story || '',
        adoption_date: animal.adoption.adoption_date || '',
        adopter_name: animal.adoption.adopter_name || '',
        adopter_phone: animal.adoption.adopter_phone || '',
        adopter_email: animal.adoption.adopter_email || '',
        adoption_notes: animal.adoption.adoption_notes || '',
        deceased_at: animal.deceased.deceased_at || '',
        deceased_notes: animal.deceased.deceased_notes || '',
        photo: null as File | null,
        gallery_photos: [] as File[],
        retained_gallery_photos: (animal.gallery_photos || []) as string[],
        before_photo: null as File | null,
        after_photo: null as File | null,
        remove_before_photo: false,
        remove_after_photo: false,
    });

    const handleEditGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        setData('gallery_photos', [...data.gallery_photos, ...selectedFiles]);
    };

    const removeRetainedGalleryPhoto = (urlToRemove: string) => {
        setData(
            'retained_gallery_photos',
            data.retained_gallery_photos.filter((u) => u !== urlToRemove)
        );
    };

    const removeNewGalleryPhoto = (indexToRemove: number) => {
        setData(
            'gallery_photos',
            data.gallery_photos.filter((_, idx) => idx !== indexToRemove)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/account/admin/animal-records/${animal.id}`, {
            onSuccess: () => {
                toast.success('Animal master record updated!');
                onClose();
            },
            onError: () => toast.error('Failed to update animal record.'),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-[#0B1527] rounded-3xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 shadow-2xl my-8 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold font-fredoka text-[#0B2340] dark:text-white">
                            Edit Master Record • {animal.name} ({animal.code})
                        </h3>
                        <p className="text-xs text-gray-500">Update status, location, medical notes, adoption, or memorial details.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    {/* Status & Location Section */}
                    <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl border border-orange-200 dark:border-orange-900/40 space-y-3">
                        <span className="text-xs font-bold text-paw-orange uppercase tracking-wider block">Status & Placement</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl font-bold"
                                >
                                    <option value="available">Available for Adoption</option>
                                    <option value="foster">In Foster Care</option>
                                    <option value="pending">Pending Adoption</option>
                                    <option value="treatment">Under Treatment</option>
                                    <option value="quarantine">Quarantine</option>
                                    <option value="adopted">Adopted</option>
                                    <option value="deceased">Deceased</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Where Currently Located</label>
                                <input
                                    type="text"
                                    value={data.current_location}
                                    onChange={(e) => setData('current_location', e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                    placeholder="e.g. Main Shelter - Kennel A, Foster Home"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Basic details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Breed</label>
                            <input
                                type="text"
                                required
                                value={data.breed}
                                onChange={(e) => setData('breed', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Age</label>
                            <input
                                type="text"
                                required
                                value={data.age}
                                onChange={(e) => setData('age', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                            <select
                                value={data.gender}
                                onChange={(e) => setData('gender', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Weight</label>
                            <input
                                type="text"
                                value={data.weight}
                                onChange={(e) => setData('weight', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Adoption fields if marked adopted */}
                    {data.status === 'adopted' && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-3">
                            <span className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider block">
                                Adoption Record Details
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Adoption Date</label>
                                    <input
                                        type="date"
                                        value={data.adoption_date}
                                        onChange={(e) => setData('adoption_date', e.target.value)}
                                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Adopter Name</label>
                                    <input
                                        type="text"
                                        value={data.adopter_name}
                                        onChange={(e) => setData('adopter_name', e.target.value)}
                                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                        placeholder="Full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Adopter Phone</label>
                                    <input
                                        type="text"
                                        value={data.adopter_phone}
                                        onChange={(e) => setData('adopter_phone', e.target.value)}
                                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Adopter Email</label>
                                    <input
                                        type="email"
                                        value={data.adopter_email}
                                        onChange={(e) => setData('adopter_email', e.target.value)}
                                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                    />
                                </div>
                            </div>
                            <textarea
                                rows={2}
                                value={data.adoption_notes}
                                onChange={(e) => setData('adoption_notes', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                placeholder="Adoption follow-up notes..."
                            />
                        </div>
                    )}

                    {/* Deceased fields if marked deceased */}
                    {data.status === 'deceased' && (
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-300 dark:border-gray-700 space-y-3">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                                Deceased & Memorial Details
                            </span>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Date of Passing</label>
                                <input
                                    type="date"
                                    value={data.deceased_at}
                                    onChange={(e) => setData('deceased_at', e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Deceased Notes & Memorial Tribute</label>
                                <textarea
                                    rows={2}
                                    value={data.deceased_notes}
                                    onChange={(e) => setData('deceased_notes', e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                    placeholder="Circumstances of passing, memorial notes, resting place..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Rescue Details */}
                    <div className="p-3 bg-gray-50 dark:bg-[#070e1c] rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Rescue Details</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={data.rescue_date}
                                onChange={(e) => setData('rescue_date', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0B1527] border border-gray-300 dark:border-gray-700 rounded-lg"
                            />
                            <input
                                type="text"
                                value={data.rescue_location}
                                onChange={(e) => setData('rescue_location', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0B1527] border border-gray-300 dark:border-gray-700 rounded-lg"
                                placeholder="Rescued from..."
                            />
                        </div>
                        <textarea
                            rows={2}
                            value={data.rescue_story}
                            onChange={(e) => setData('rescue_story', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0B1527] border border-gray-300 dark:border-gray-700 rounded-lg"
                            placeholder="Rescue story narrative..."
                        />
                    </div>

                    {/* Photo & Gallery update */}
                    <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-[#070e1c] rounded-2xl border border-gray-200 dark:border-gray-800">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Update Primary Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-paw-orange/10 file:text-paw-orange cursor-pointer"
                            />
                        </div>

                        <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-2">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                <Images className="h-3.5 w-3.5 text-paw-orange" />
                                <span>Manage Gallery Photos (Multiple Images)</span>
                            </label>

                            {data.retained_gallery_photos.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                                        Current Gallery Photos ({data.retained_gallery_photos.length})
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {data.retained_gallery_photos.map((url, idx) => (
                                            <div key={idx} className="relative h-14 w-14 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                                                <ImageWithFallback
                                                    src={formatPhotoUrl(url, animal.type)}
                                                    alt={`Gallery ${idx + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeRetainedGalleryPhoto(url)}
                                                    className="absolute top-1 right-1 bg-rose-600 text-white p-0.5 rounded-full shadow-sm hover:bg-rose-700"
                                                    title="Remove from gallery"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Add More Gallery Images</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleEditGallerySelect}
                                    className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-600 hover:file:bg-blue-500/20 cursor-pointer"
                                />
                            </div>

                            {data.gallery_photos.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {data.gallery_photos.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-1.5 bg-white dark:bg-[#0B1527] border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-lg text-[11px] font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            <span className="truncate max-w-[120px]">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeNewGalleryPhoto(idx)}
                                                className="text-rose-500 hover:text-rose-700"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transformation Before & After Photos */}
                    <div className="p-3 bg-paw-orange/5 dark:bg-paw-orange/10 rounded-2xl border border-paw-orange/20 space-y-2">
                        <span className="text-xs font-bold text-paw-orange dark:text-paw-yellow block">
                            Update Before & After Transformation Photos
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">Before Photo (When Rescued)</label>
                                    {(animal.before_photo_url || animal.rescue.before_photo_url) && (
                                        <label className="flex items-center gap-1 text-[10px] font-bold text-rose-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.remove_before_photo}
                                                onChange={(e) => setData('remove_before_photo', e.target.checked)}
                                                className="rounded text-rose-600 h-3 w-3"
                                            />
                                            Clear
                                        </label>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('before_photo', e.target.files?.[0] || null)}
                                    className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-gray-200 dark:file:bg-gray-700 cursor-pointer"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">After Photo (Today / Healed)</label>
                                    {(animal.after_photo_url || animal.rescue.after_photo_url) && (
                                        <label className="flex items-center gap-1 text-[10px] font-bold text-rose-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.remove_after_photo}
                                                onChange={(e) => setData('remove_after_photo', e.target.checked)}
                                                className="rounded text-rose-600 h-3 w-3"
                                            />
                                            Clear
                                        </label>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('after_photo', e.target.files?.[0] || null)}
                                    className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-paw-orange/20 file:text-paw-orange cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-paw-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* SUBCOMPONENT: ADD MEDICAL / INJURY / DISEASE MODAL */
function AddMedicalModal({
    animal,
    initialType = 'vaccination',
    onClose,
}: {
    animal: AnimalRecord;
    initialType?: string;
    onClose: () => void;
}) {
    const isInitialCondition = initialType === 'injury' || initialType === 'disease';
    const { data, setData, post, processing } = useForm({
        record_type: initialType,
        title: '',
        performed_date: new Date().toISOString().split('T')[0],
        next_due_date: '',
        veterinarian: '',
        batch_number: '',
        dosage: '',
        severity: isInitialCondition ? 'moderate' : '',
        treatment_plan: '',
        status: isInitialCondition ? 'under_treatment' : 'completed',
        notes: '',
        update_animal_status: isInitialCondition && animal.status === 'available' ? 'treatment' : '',
    });

    const isCurrentCondition = data.record_type === 'injury' || data.record_type === 'disease';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/account/admin/animal-records/${animal.id}/medical`, {
            onSuccess: () => {
                toast.success(
                    isCurrentCondition
                        ? `${data.record_type === 'injury' ? 'Injury' : 'Disease'} record logged successfully!`
                        : 'Medical record added successfully!'
                );
                onClose();
            },
            onError: () => toast.error('Failed to log medical record.'),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-[#0B1527] rounded-3xl max-w-lg w-full border border-gray-200 dark:border-gray-800 shadow-2xl my-8 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold font-fredoka text-[#0B2340] dark:text-white flex items-center gap-2">
                            {isCurrentCondition ? (
                                <>
                                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                                    <span>Log {data.record_type === 'injury' ? 'Injury' : 'Disease / Illness'}</span>
                                </>
                            ) : (
                                <>
                                    <Syringe className="h-5 w-5 text-emerald-500" />
                                    <span>Log Medical / Vaccine Entry</span>
                                </>
                            )}
                        </h3>
                        <p className="text-xs text-gray-500">For {animal.name} ({animal.code})</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Record Type *</label>
                            <select
                                value={data.record_type}
                                onChange={(e) => {
                                    const nextType = e.target.value;
                                    setData((prev) => ({
                                        ...prev,
                                        record_type: nextType,
                                        status: (nextType === 'injury' || nextType === 'disease') ? 'under_treatment' : 'completed',
                                        severity: (nextType === 'injury' || nextType === 'disease') ? (prev.severity || 'moderate') : '',
                                    }));
                                }}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl font-medium"
                            >
                                <optgroup label="Health Conditions & Issues">
                                    <option value="injury">Injury / Trauma / Wound</option>
                                    <option value="disease">Disease / Illness / Infection</option>
                                </optgroup>
                                <optgroup label="Clinical Care & Preventive">
                                    <option value="vaccination">Vaccination / Immunization</option>
                                    <option value="medical_checkup">Routine Checkup / Exam</option>
                                    <option value="surgery">Surgery / Spay-Neuter</option>
                                    <option value="treatment">Treatment / Wound Care</option>
                                    <option value="medication">Medication / Prescription</option>
                                    <option value="dental">Dental Cleaning</option>
                                    <option value="lab_test">Lab Test / Bloodwork</option>
                                    <option value="other">Other Clinical Care</option>
                                </optgroup>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            >
                                {isCurrentCondition ? (
                                    <>
                                        <option value="under_treatment">Under Treatment / Active Care</option>
                                        <option value="active">Active / Needs Attention</option>
                                        <option value="scheduled">Scheduled for Vet Exam</option>
                                        <option value="resolved">Resolved / Cured</option>
                                        <option value="chronic">Chronic / Ongoing Management</option>
                                        <option value="completed">Completed Assessment</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="completed">Completed / Administered</option>
                                        <option value="scheduled">Scheduled / Pending</option>
                                        <option value="overdue">Overdue</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {data.record_type === 'injury'
                                ? 'Injury Description / Diagnosis *'
                                : data.record_type === 'disease'
                                ? 'Disease / Condition Name *'
                                : 'Procedure or Vaccine Name *'}
                        </label>
                        <input
                            type="text"
                            required
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            placeholder={
                                data.record_type === 'injury'
                                    ? 'e.g. Fractured Left Hindleg, Deep Bite Wound, Corneal Scratch'
                                    : data.record_type === 'disease'
                                    ? 'e.g. Canine Parvovirus, Sarcoptic Mange, Tick Fever, Feline Flu'
                                    : 'e.g. Anti-Rabies Vaccine, DHPP Booster, Spay Surgery'
                            }
                        />
                    </div>

                    {/* Condition specific: Severity & Animal Status Update */}
                    {isCurrentCondition && (
                        <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Condition Severity
                                    </label>
                                    <select
                                        value={data.severity}
                                        onChange={(e) => setData('severity', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-white dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                    >
                                        <option value="mild">Mild (Minor superficial issue)</option>
                                        <option value="moderate">Moderate (Requires medication/monitoring)</option>
                                        <option value="severe">Severe (Urgent vet care & restriction)</option>
                                        <option value="critical">Critical (Life-threatening emergency)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Update Pet Master Status
                                    </label>
                                    <select
                                        value={data.update_animal_status}
                                        onChange={(e) => setData('update_animal_status', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-white dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                    >
                                        <option value="">Keep current status ({animal.status})</option>
                                        <option value="treatment">Change to "Under Treatment"</option>
                                        <option value="quarantine">Change to "Quarantine" (Infectious)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Treatment Protocol & Care Plan
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.treatment_plan}
                                    onChange={(e) => setData('treatment_plan', e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                    placeholder="e.g. Wound cleaning twice daily, Amoxicillin 250mg BID x 7 days, splint check on Friday..."
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                {isCurrentCondition ? 'Incident / Diagnosis Date *' : 'Date Performed *'}
                            </label>
                            <input
                                type="date"
                                required
                                value={data.performed_date}
                                onChange={(e) => setData('performed_date', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                {isCurrentCondition ? 'Follow-up / Re-check Date' : 'Next Booster / Due Date'}
                            </label>
                            <input
                                type="date"
                                value={data.next_due_date}
                                onChange={(e) => setData('next_due_date', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Attending Veterinarian</label>
                            <input
                                type="text"
                                value={data.veterinarian}
                                onChange={(e) => setData('veterinarian', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                placeholder="Dr. Santos, DVM"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                {isCurrentCondition ? 'Dosage / Rx' : 'Batch / Serial No.'}
                            </label>
                            <input
                                type="text"
                                value={isCurrentCondition ? data.dosage : data.batch_number}
                                onChange={(e) => {
                                    if (isCurrentCondition) {
                                        setData('dosage', e.target.value);
                                    } else {
                                        setData('batch_number', e.target.value);
                                    }
                                }}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                                placeholder={isCurrentCondition ? 'e.g. 5ml syrup, 1 tab BID' : 'e.g. VAC-99482'}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Clinical Notes & Observations</label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#070e1c] border border-gray-300 dark:border-gray-700 rounded-xl"
                            placeholder="Observations, behavioral reactions, wound progress, recovery status..."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-xs ${
                                isCurrentCondition
                                    ? 'bg-rose-600 hover:bg-rose-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                        >
                            {processing
                                ? 'Logging...'
                                : isCurrentCondition
                                ? `Save ${data.record_type === 'injury' ? 'Injury' : 'Disease'} Log`
                                : 'Save Medical Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

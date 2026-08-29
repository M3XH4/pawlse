import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Filter, Search, X, Info, Shield, Calendar, User, FileText, Upload, Plus, Check, AlertTriangle, Eye, CheckCircle, Ban, MessageSquare, Gift, Trash2, Edit3, Sparkles } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { AdminCard } from '@/components/admin/card';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { formatPhotoUrl } from '@/lib/utils';

interface ApplicationFile {
  id: number;
  kind: string;
  name: string;
  url: string;
  size: number;
}

interface Application {
  id: number;
  status: string;
  full_name: string;
  address: string;
  phone: string;
  email: string;
  birth_date: string;
  occupation: string;
  company: string;
  social_media: string;
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
  daily_care_handler: string;
  expenses_handler: string;
  emergency_handler: string;
  hours_alone: string;
  introduction_plan: string;
  family_support: boolean;
  family_support_explanation: string | null;
  current_pets: boolean;
  past_pets: boolean;
  preferred_date: string;
  preferred_time: string;
  can_visit_shelter: boolean;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  pet: {
    id: number;
    name: string;
    type: string;
    breed: string;
    age: string;
    photo_url: string | null;
  } | null;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  files: ApplicationFile[];
}

interface PetNeed {
  id: number;
  item: string;
  quantity: string;
  priority: string;
  status: string;
}

interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: string;
  ageCategory: string;
  gender: string;
  color: string;
  behavior: string;
  story: string;
  img: string | null;
  mainImg: string | null;
  vaccinated: boolean;
  shelterDays: number;
  status: string;
  needs?: PetNeed[];
}

interface AdoptionManagementProps {
  applications: Application[];
  pets: Pet[];
}

export default function AdoptionManagement({ applications = [], pets = [] }: AdoptionManagementProps) {
  const [activeTab, setActiveTab] = useState<'applications' | 'pets'>('applications');
  
  // Modals & drawers state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedPetForNeeds, setSelectedPetForNeeds] = useState<Pet | null>(null);
  const [editingNeed, setEditingNeed] = useState<PetNeed | null>(null);

  // Need Form State
  const [needForm, setNeedForm] = useState({
    item: '',
    quantity: '1 unit',
    priority: 'Medium',
    status: 'open',
  });

  // Application Filters & Search
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('All');

  // Pet Filters & Search
  const [petSearch, setPetSearch] = useState('');
  const [petTypeFilter, setPetTypeFilter] = useState('All');
  const [petStatusFilter, setPetStatusFilter] = useState('All');

  // Inertia Form for status update
  const { data: statusData, setData: setStatusData, post: postStatus, processing: statusProcessing, reset: resetStatus } = useForm({
    status: '',
    rejection_reason: '',
    notes: '',
  });

  // Inertia Form for adding a pet
  const { data: petData, setData: setPetData, post: postPet, processing: petProcessing, reset: resetPet, errors: petErrors } = useForm({
    name: '',
    type: '',
    breed: '',
    age: '',
    ageCategory: '',
    gender: '',
    color: '',
    behavior: '',
    story: '',
    vaccinated: false,
    admittedAt: '',
    photo: null as File | null,
    initial_needs: [] as Array<{ item: string; quantity: string; priority: string }>,
  });

  // Filtered Applications
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.full_name.toLowerCase().includes(appSearch.toLowerCase()) ||
                            (app.pet && app.pet.name.toLowerCase().includes(appSearch.toLowerCase()));
      const matchesStatus = appStatusFilter === 'All' || app.status === appStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [applications, appSearch, appStatusFilter]);

  // Filtered Pets
  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      const matchesSearch = pet.name.toLowerCase().includes(petSearch.toLowerCase()) ||
                            pet.breed.toLowerCase().includes(petSearch.toLowerCase()) ||
                            (pet.color && pet.color.toLowerCase().includes(petSearch.toLowerCase()));
      const matchesType = petTypeFilter === 'All' || pet.type === petTypeFilter.toLowerCase();
      const matchesStatus = petStatusFilter === 'All' || pet.status === petStatusFilter.toLowerCase();
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [pets, petSearch, petTypeFilter, petStatusFilter]);

  // Handle application status update submission
  const handleStatusUpdate = (status: 'approved' | 'rejected' | 'scheduled') => {
    if (!selectedApp) return;

    statusData.status = status;

    postStatus(`/account/admin/adoption-management/applications/${selectedApp.id}/status`, {
      onSuccess: () => {
        toast.success(`Application status updated to ${status}.`);
        setIsRejectOpen(false);
        // Refresh local selectedApp info
        const updated = applications.find(a => a.id === selectedApp.id);
        setSelectedApp(updated || null);
        resetStatus();
      },
      onError: () => {
        toast.error('Failed to update application status.');
      }
    });
  };

  // Handle adding new pet
  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    postPet('/account/admin/adoption-management/pets', {
      onSuccess: () => {
        toast.success('New shelter pet added successfully!');
        setIsAddPetOpen(false);
        resetPet();
      },
      onError: () => {
        toast.error('Please fix errors on the form.');
      }
    });
  };

  return (
    <>
      <Head title="Adoption Management" />

      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-fredoka text-3xl font-bold tracking-tight text-[#0B2340] dark:text-[#F8FAFC]">Adoption Management</h1>
            <p className="mt-2 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">Review adoption applications and manage shelter pets.</p>
          </div>
          {activeTab === 'pets' && (
            <button
              onClick={() => setIsAddPetOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-paw-orange hover:bg-orange-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-paw-orange/20 uppercase tracking-wider"
            >
              <Plus size={16} /> Add Shelter Pet
            </button>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-4 font-black text-sm tracking-wider uppercase border-b-4 transition-all ${
              activeTab === 'applications'
                ? 'border-paw-orange text-paw-orange'
                : 'border-transparent text-gray-500 hover:text-paw-navy dark:hover:text-white'
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('pets')}
            className={`px-6 py-4 font-black text-sm tracking-wider uppercase border-b-4 transition-all ${
              activeTab === 'pets'
                ? 'border-paw-orange text-paw-orange'
                : 'border-transparent text-gray-500 hover:text-paw-navy dark:hover:text-white'
            }`}
          >
            Shelter Pets ({pets.length})
          </button>
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <AdminCard>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by applicant or pet name..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange outline-none rounded-2xl transition-colors font-bold text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange outline-none rounded-2xl font-bold text-sm text-gray-900 dark:text-white"
                >
                  <option>All Statuses</option>
                  <option>Pending</option>
                  <option>Scheduled</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>
            </div>

            {/* List */}
            {filteredApps.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <AlertTriangle className="mx-auto mb-3 text-gray-400" size={48} />
                <p className="font-bold">No applications found matching the filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] uppercase tracking-wider font-black text-gray-400">
                      <th className="py-4 px-4">Applicant</th>
                      <th className="py-4 px-4">Pet Details</th>
                      <th className="py-4 px-4">Submitted Date</th>
                      <th className="py-4 px-4">Interview Schedule</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map(app => (
                      <tr key={app.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-black text-paw-navy dark:text-white text-sm">{app.full_name}</p>
                          <p className="text-xs text-gray-400 font-bold">{app.email} • {app.phone}</p>
                        </td>
                        <td className="py-4 px-4">
                          {app.pet ? (
                            <div className="flex items-center gap-2">
                              {app.pet.photo_url && (
                                <ImageWithFallback src={formatPhotoUrl(app.pet.photo_url)} alt={app.pet.name} className="w-8 h-8 rounded-lg object-cover" />
                              )}
                              <div>
                                <p className="font-bold text-sm text-gray-700 dark:text-gray-300">{app.pet.name}</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase">{app.pet.breed}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Unknown</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                          {app.preferred_date} @ {app.preferred_time}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            app.status === 'approved' ? 'bg-paw-green/10 text-paw-green' :
                            app.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                            app.status === 'scheduled' ? 'bg-paw-blue/10 text-paw-blue' :
                            'bg-paw-yellow/10 text-paw-navy'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setStatusData('notes', app.notes || '');
                            }}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-paw-navy text-white rounded-xl text-xs font-black hover:bg-paw-orange transition-colors uppercase tracking-wider"
                          >
                            <Eye size={12} /> Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        )}

        {/* Pets Tab */}
        {activeTab === 'pets' && (
          <AdminCard>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, breed, or color..."
                  value={petSearch}
                  onChange={(e) => setPetSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange outline-none rounded-2xl transition-colors font-bold text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={petTypeFilter}
                  onChange={(e) => setPetTypeFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange outline-none rounded-2xl font-bold text-sm text-gray-900 dark:text-white"
                >
                  <option>All Types</option>
                  <option value="Cat">Cat</option>
                  <option value="Dog">Dog</option>
                  <option value="Other">Other</option>
                </select>
                <select
                  value={petStatusFilter}
                  onChange={(e) => setPetStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange outline-none rounded-2xl font-bold text-sm text-gray-900 dark:text-white"
                >
                  <option>All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Pending">Pending</option>
                  <option value="Adopted">Adopted</option>
                </select>
              </div>
            </div>

            {/* List */}
            {filteredPets.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <AlertTriangle className="mx-auto mb-3 text-gray-400" size={48} />
                <p className="font-bold">No shelter pets found matching criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {filteredPets.map(pet => (
                  <div key={pet.id} className="bg-paw-bg dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      {pet.img ? (
                        <ImageWithFallback src={formatPhotoUrl(pet.img)} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Heart size={32} /></div>
                      )}
                      <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[8px] font-black uppercase ${
                        pet.status === 'available' ? 'bg-paw-green text-white' :
                        pet.status === 'pending' ? 'bg-paw-yellow text-paw-navy' :
                        'bg-gray-500 text-white'
                      }`}>
                        {pet.status}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-black text-paw-navy dark:text-white text-base truncate">{pet.name}</h4>
                      <p className="text-xs text-gray-400 font-bold mb-2 uppercase">{pet.breed}</p>
                      <div className="flex gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3">
                        <span>{pet.gender}</span>
                        <span>•</span>
                        <span>{pet.age}</span>
                      </div>

                      {/* Wishlist / Needs Button */}
                      <button
                        onClick={() => {
                          setSelectedPetForNeeds(pet);
                          setEditingNeed(null);
                          setNeedForm({ item: '', quantity: '1 unit', priority: 'Medium', status: 'open' });
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          pet.needs && pet.needs.length > 0
                            ? 'bg-paw-orange/10 text-paw-orange hover:bg-paw-orange hover:text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-paw-orange hover:text-white'
                        }`}
                      >
                        <Gift size={13} />
                        <span>{pet.needs?.length ? `${pet.needs.length} Needs` : '+ Add Needs'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        )}
      </div>

      {/* Application Review Drawer / Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[120] flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-3xl h-full bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto flex flex-col z-10"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/40">
                <div>
                  <span className="text-[10px] font-black text-paw-orange uppercase tracking-widest block mb-1">Adoption Application Review</span>
                  <h3 className="text-2xl font-black text-paw-navy dark:text-white">{selectedApp.full_name}</h3>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                {/* Pet summary */}
                <div className="bg-paw-bg dark:bg-gray-800/20 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                  {selectedApp.pet?.photo_url && (
                    <ImageWithFallback src={formatPhotoUrl(selectedApp.pet.photo_url)} alt={selectedApp.pet.name} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md" />
                  )}
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Application for</span>
                    <h4 className="text-lg font-black text-paw-navy dark:text-white">{selectedApp.pet?.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">{selectedApp.pet?.breed} • {selectedApp.pet?.age}</p>
                  </div>
                </div>

                {/* Personal Info Grid */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><User size={14} /> Applicant Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl">
                      <p className="text-[10px] text-gray-400 uppercase">Contact Details</p>
                      <p className="text-paw-navy dark:text-white">{selectedApp.phone}</p>
                      <p className="text-xs font-semibold text-gray-400 truncate">{selectedApp.email}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl">
                      <p className="text-[10px] text-gray-400 uppercase">Address</p>
                      <p className="text-paw-navy dark:text-white truncate">{selectedApp.address}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl">
                      <p className="text-[10px] text-gray-400 uppercase">Identity & Marital Status</p>
                      <p className="text-paw-navy dark:text-white">{selectedApp.pronouns} • {selectedApp.status_marital}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl">
                      <p className="text-[10px] text-gray-400 uppercase">Workplace / Company</p>
                      <p className="text-paw-navy dark:text-white truncate">{selectedApp.occupation || 'N/A'} at {selectedApp.company}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl col-span-2">
                      <p className="text-[10px] text-gray-400 uppercase">Emergency Contact</p>
                      <p className="text-paw-navy dark:text-white">{selectedApp.emergency_name} ({selectedApp.emergency_relationship})</p>
                      <p className="text-xs font-semibold text-gray-400">{selectedApp.emergency_phone} • {selectedApp.emergency_email}</p>
                    </div>
                  </div>
                </div>

                {/* Questionnaire Grid */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><FileText size={14} /> Questionnaire & Living Situation</h4>
                  <div className="space-y-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl">
                        <p className="text-[10px] text-gray-400 uppercase">Residence Details</p>
                        <p className="text-paw-navy dark:text-white">{selectedApp.residence_type} ({selectedApp.is_renting ? 'Renting' : 'Owns House'})</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl">
                        <p className="text-[10px] text-gray-400 uppercase">Has Allergies?</p>
                        <p className="text-paw-navy dark:text-white">{selectedApp.has_allergies ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl">
                      <p className="text-[10px] text-gray-400 uppercase">Plan If Moving</p>
                      <p className="text-paw-navy dark:text-white text-xs leading-relaxed">{selectedApp.moving_plan}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl">
                      <p className="text-[10px] text-gray-400 uppercase">Household Members</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedApp.lives_with.map((val, idx) => (
                          <span key={idx} className="bg-paw-orange/10 text-paw-orange text-[10px] font-black px-2 py-0.5 rounded-full uppercase">{val}</span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl">
                        <p className="text-[8px] text-gray-400 uppercase">Daily Care</p>
                        <p className="text-xs text-paw-navy dark:text-white truncate">{selectedApp.daily_care_handler}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl">
                        <p className="text-[8px] text-gray-400 uppercase">Expenses</p>
                        <p className="text-xs text-paw-navy dark:text-white truncate">{selectedApp.expenses_handler}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl">
                        <p className="text-[8px] text-gray-400 uppercase">Emergencies</p>
                        <p className="text-xs text-paw-navy dark:text-white truncate">{selectedApp.emergency_handler}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl">
                        <p className="text-[10px] text-gray-400 uppercase">Family Supportive?</p>
                        <p className="text-paw-navy dark:text-white">{selectedApp.family_support ? 'Yes' : 'No'}</p>
                        {selectedApp.family_support_explanation && (
                          <p className="text-[10px] text-red-500 font-semibold mt-1">{selectedApp.family_support_explanation}</p>
                        )}
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl">
                        <p className="text-[10px] text-gray-400 uppercase">Hours Alone</p>
                        <p className="text-paw-navy dark:text-white">{selectedApp.hours_alone}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl">
                      <p className="text-[10px] text-gray-400 uppercase">Introduction Plan</p>
                      <p className="text-paw-navy dark:text-white text-xs leading-relaxed">{selectedApp.introduction_plan}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl text-center">
                        <p className="text-[8px] text-gray-400 uppercase">Adopted Before?</p>
                        <p className="text-xs text-paw-navy dark:text-white">{selectedApp.adopted_before ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl text-center">
                        <p className="text-[8px] text-gray-400 uppercase">Has Pets Now?</p>
                        <p className="text-xs text-paw-navy dark:text-white">{selectedApp.current_pets ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl text-center">
                        <p className="text-[8px] text-gray-400 uppercase">Had Pets Past?</p>
                        <p className="text-xs text-paw-navy dark:text-white">{selectedApp.past_pets ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Upload size={14} /> Uploaded Documents</h4>
                  {selectedApp.files.length === 0 ? (
                    <p className="text-xs text-gray-400 italic font-bold">No documents attached.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedApp.files.map(file => (
                        <div key={file.id} className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 relative group flex flex-col justify-between">
                          <div>
                            <span className="text-[8px] font-black text-paw-orange uppercase tracking-wider block mb-1">{file.kind.replace('_', ' ')}</span>
                            <p className="text-xs text-paw-navy dark:text-white font-bold truncate mb-3">{file.name}</p>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-white dark:bg-gray-800 text-paw-navy dark:text-white border border-gray-200 dark:border-gray-700 py-1.5 rounded-lg font-black text-[10px] hover:bg-paw-orange hover:text-white hover:border-transparent transition-colors flex items-center justify-center gap-1 uppercase tracking-wider"
                          >
                            <Eye size={10} /> View Document
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Notes & Status Forms */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><MessageSquare size={14} /> Admin Comments & Notes</h4>
                  <textarea
                    value={statusData.notes}
                    onChange={(e) => setStatusData('notes', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-sm text-gray-900 dark:text-white h-24 resize-none"
                    placeholder="Enter internal volunteer notes here..."
                  />
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex justify-between gap-4">
                {selectedApp.status === 'pending' && (
                  <>
                    <button
                      onClick={() => setIsRejectOpen(true)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs transition-colors flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      <Ban size={14} /> Reject Application
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('scheduled')}
                      disabled={statusProcessing}
                      className="px-6 py-3 bg-paw-blue hover:bg-blue-600 text-white rounded-xl font-black text-xs transition-colors flex items-center gap-1.5 uppercase tracking-wider ml-auto"
                    >
                      <Calendar size={14} /> Schedule Interview
                    </button>
                  </>
                )}

                {selectedApp.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => setIsRejectOpen(true)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs transition-colors flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      <Ban size={14} /> Reject Application
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('approved')}
                      disabled={statusProcessing}
                      className="px-6 py-3 bg-paw-green hover:bg-green-600 text-white rounded-xl font-black text-xs transition-colors flex items-center gap-1.5 uppercase tracking-wider ml-auto"
                    >
                      <CheckCircle size={14} /> Approve Adoption
                    </button>
                  </>
                )}

                {(selectedApp.status === 'approved' || selectedApp.status === 'rejected') && (
                  <div className="w-full flex items-center justify-between text-xs font-bold text-gray-500">
                    <span>Final Application Status: <span className="uppercase font-black text-paw-navy dark:text-white">{selectedApp.status}</span></span>
                    <button
                      onClick={() => handleStatusUpdate(selectedApp.status as any)}
                      disabled={statusProcessing}
                      className="px-5 py-2 bg-paw-navy text-white rounded-lg font-bold hover:bg-paw-orange transition-all uppercase tracking-wider"
                    >
                      Save Comments
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {isRejectOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRejectOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full relative z-10 shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-xl font-black text-paw-navy dark:text-white mb-2 flex items-center gap-1.5"><Ban className="text-red-500" /> Reject Application</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-4">Please provide a reason for rejecting this adoption application. The adopter will be notified.</p>
              
              <textarea
                required
                value={statusData.rejection_reason}
                onChange={(e) => setStatusData('rejection_reason', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border-2 border-transparent focus:border-red-500 outline-none transition-all font-bold text-sm text-gray-900 dark:text-white h-32 resize-none"
                placeholder="Reason for rejection..."
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsRejectOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={!statusData.rejection_reason || statusProcessing}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Shelter Pet Modal */}
      <AnimatePresence>
        {isAddPetOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddPetOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] p-6 relative z-10 shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-paw-navy dark:text-white">Add New Shelter Pet</h3>
                <button
                  onClick={() => setIsAddPetOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddPet} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Name *</label>
                    <input
                      required
                      type="text"
                      value={petData.name}
                      onChange={(e) => setPetData('name', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-850 p-4 rounded-xl outline-none border-2 border-transparent focus:border-paw-orange font-bold text-sm"
                      placeholder="e.g. Luna"
                    />
                    {petErrors.name && <p className="text-xs text-red-500 font-semibold">{petErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Animal Type *</label>
                    <select
                      required
                      value={petData.type}
                      onChange={(e) => setPetData('type', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-850 p-4 rounded-xl outline-none border-2 border-transparent focus:border-paw-orange font-bold text-sm"
                    >
                      <option value="">Select type</option>
                      <option value="cat">Cat</option>
                      <option value="dog">Dog</option>
                      <option value="other">Other</option>
                    </select>
                    {petErrors.type && <p className="text-xs text-red-500 font-semibold">{petErrors.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Breed *</label>
                    <input
                      required
                      type="text"
                      value={petData.breed}
                      onChange={(e) => setPetData('breed', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-855 p-4 rounded-xl outline-none border-2 border-transparent focus:border-paw-orange font-bold text-sm"
                      placeholder="e.g. Aspin / Mixed"
                    />
                    {petErrors.breed && <p className="text-xs text-red-500 font-semibold">{petErrors.breed}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Age * (e.g. '2 yrs' / '8 mos')</label>
                    <input
                      required
                      type="text"
                      value={petData.age}
                      onChange={(e) => setPetData('age', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-855 p-4 rounded-xl outline-none border-2 border-transparent focus:border-paw-orange font-bold text-sm"
                      placeholder="e.g. 2 yrs / 6 mos"
                    />
                    {petErrors.age && <p className="text-xs text-red-500 font-semibold">{petErrors.age}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Age Category *</label>
                    <select
                      required
                      value={petData.ageCategory}
                      onChange={(e) => setPetData('ageCategory', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-855 p-4 rounded-xl outline-none border-2 border-transparent focus:border-paw-orange font-bold text-sm"
                    >
                      <option value="">Select category</option>
                      <option value="puppy">Puppy</option>
                      <option value="kitten">Kitten</option>
                      <option value="young">Young</option>
                      <option value="adult">Adult</option>
                      <option value="senior">Senior</option>
                    </select>
                    {petErrors.ageCategory && <p className="text-xs text-red-500 font-semibold">{petErrors.ageCategory}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Gender *</label>
                    <select
                      required
                      value={petData.gender}
                      onChange={(e) => setPetData('gender', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-855 p-4 rounded-xl outline-none border-2 border-transparent focus:border-paw-orange font-bold text-sm"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {petErrors.gender && <p className="text-xs text-red-500 font-semibold">{petErrors.gender}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Color *</label>
                    <input
                      required
                      type="text"
                      value={petData.color}
                      onChange={(e) => setPetData('color', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-855 p-4 rounded-xl outline-none border-2 border-transparent focus:border-paw-orange font-bold text-sm"
                      placeholder="e.g. Brown / Black & White"
                    />
                    {petErrors.color && <p className="text-xs text-red-500 font-semibold">{petErrors.color}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Vaccinated? *</label>
                    <select
                      value={petData.vaccinated ? 'true' : 'false'}
                      onChange={(e) => setPetData('vaccinated', e.target.value === 'true')}
                      className="w-full bg-gray-50 dark:bg-gray-855 p-4 rounded-xl outline-none border-2 border-transparent focus:border-paw-orange font-bold text-sm"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                    {petErrors.vaccinated && <p className="text-xs text-red-500 font-semibold">{petErrors.vaccinated}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">Behavior / Temperament *</label>
                  <input
                    required
                    type="text"
                    value={petData.behavior}
                    onChange={(e) => setPetData('behavior', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-855 p-4 rounded-xl outline-none border-2 border-transparent focus:border-paw-orange font-bold text-sm"
                    placeholder="e.g. Friendly, playful, calm"
                  />
                  {petErrors.behavior && <p className="text-xs text-red-500 font-semibold">{petErrors.behavior}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">My Story / Description *</label>
                  <textarea
                    required
                    value={petData.story}
                    onChange={(e) => setPetData('story', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-855 p-4 rounded-xl outline-none border-2 border-transparent focus:border-paw-orange font-bold text-sm h-28 resize-none"
                    placeholder="Describe how the pet was rescued and its personality..."
                  />
                  {petErrors.story && <p className="text-xs text-red-500 font-semibold">{petErrors.story}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Admitted At Date *</label>
                    <input
                      required
                      type="date"
                      value={petData.admittedAt}
                      onChange={(e) => setPetData('admittedAt', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-855 p-4 rounded-xl outline-none border-2 border-transparent focus:border-paw-orange font-bold text-sm"
                    />
                    {petErrors.admittedAt && <p className="text-xs text-red-500 font-semibold">{petErrors.admittedAt}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Photo File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPetData('photo', e.target.files?.[0] || null)}
                      className="w-full bg-gray-50 dark:bg-gray-855 p-3 rounded-xl outline-none border-2 border-transparent font-bold text-xs"
                    />
                    {petErrors.photo && <p className="text-xs text-red-500 font-semibold">{petErrors.photo}</p>}
                  </div>
                </div>

                {/* Initial Wishlist Needs */}
                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500">Initial Wishlist Needs (Optional)</label>
                      <p className="text-[11px] text-gray-400">Add items this pet urgently or specifically needs from donors.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPetData('initial_needs', [
                          ...petData.initial_needs,
                          { item: '', quantity: '1 unit', priority: 'Medium' }
                        ]);
                      }}
                      className="px-3 py-1.5 bg-paw-orange/10 text-paw-orange hover:bg-paw-orange hover:text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {petData.initial_needs.map((need, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl">
                      <input
                        type="text"
                        placeholder="Item (e.g. Puppy Kibble)"
                        value={need.item}
                        onChange={(e) => {
                          const updated = [...petData.initial_needs];
                          updated[idx].item = e.target.value;
                          setPetData('initial_needs', updated);
                        }}
                        className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 outline-none focus:border-paw-orange"
                      />
                      <input
                        type="text"
                        placeholder="Qty (e.g. 2 bags)"
                        value={need.quantity}
                        onChange={(e) => {
                          const updated = [...petData.initial_needs];
                          updated[idx].quantity = e.target.value;
                          setPetData('initial_needs', updated);
                        }}
                        className="w-28 bg-white dark:bg-gray-900 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 outline-none focus:border-paw-orange"
                      />
                      <select
                        value={need.priority}
                        onChange={(e) => {
                          const updated = [...petData.initial_needs];
                          updated[idx].priority = e.target.value;
                          setPetData('initial_needs', updated);
                        }}
                        className="w-28 bg-white dark:bg-gray-900 px-2 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 outline-none focus:border-paw-orange"
                      >
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = petData.initial_needs.filter((_, i) => i !== idx);
                          setPetData('initial_needs', updated);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddPetOpen(false)}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl text-xs font-bold hover:bg-gray-200 transition-colors uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={petProcessing}
                    className="px-6 py-3 bg-paw-orange text-white rounded-2xl text-xs font-black hover:bg-orange-600 transition-colors uppercase tracking-wider"
                  >
                    {petProcessing ? 'Saving...' : 'Save Shelter Pet'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wishlist / Needs Management Drawer */}
      <AnimatePresence>
        {selectedPetForNeeds && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPetForNeeds(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[36px] max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 relative shadow-2xl p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow bg-gray-100 shrink-0">
                    {selectedPetForNeeds.img ? (
                      <ImageWithFallback src={formatPhotoUrl(selectedPetForNeeds.img)} alt={selectedPetForNeeds.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Heart size={24} /></div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-paw-orange uppercase tracking-widest block">In-Kind Donation Wishlist</span>
                    <h3 className="text-2xl font-black text-paw-navy dark:text-white">{selectedPetForNeeds.name}'s Needs</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase">{selectedPetForNeeds.breed} • {selectedPetForNeeds.age}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPetForNeeds(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={22} className="text-gray-400" />
                </button>
              </div>

              {/* Existing Needs List */}
              <div className="py-6 space-y-4">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Active & Listed Needs</h4>
                {(!selectedPetForNeeds.needs || selectedPetForNeeds.needs.length === 0) ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Gift className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-xs font-bold text-gray-400">No wishlist needs listed for this animal yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedPetForNeeds.needs.map((need) => (
                      <div
                        key={need.id}
                        className="bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              router.put(route('account.admin.adoption-management.needs.update', need.id), {
                                item: need.item,
                                quantity: need.quantity,
                                priority: need.priority,
                                status: need.status === 'open' ? 'fulfilled' : 'open',
                              }, {
                                preserveScroll: true,
                                onSuccess: () => {
                                  if (selectedPetForNeeds.needs) {
                                    const updated = selectedPetForNeeds.needs.map(n => n.id === need.id ? { ...n, status: n.status === 'open' ? 'fulfilled' : 'open' } : n);
                                    setSelectedPetForNeeds({ ...selectedPetForNeeds, needs: updated });
                                  }
                                }
                              });
                            }}
                            title="Click to toggle Open / Fulfilled"
                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                              need.status === 'fulfilled'
                                ? 'bg-paw-green text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 hover:text-paw-navy hover:bg-gray-300'
                            }`}
                          >
                            <Check size={14} />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className={`font-black text-sm ${need.status === 'fulfilled' ? 'line-through text-gray-400' : 'text-paw-navy dark:text-white'}`}>
                                {need.item}
                              </h5>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                need.priority === 'Urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                                need.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                              }`}>
                                {need.priority}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                need.status === 'fulfilled' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {need.status}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-gray-400 mt-0.5">Quantity needed: {need.quantity}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => {
                              setEditingNeed(need);
                              setNeedForm({
                                item: need.item,
                                quantity: need.quantity,
                                priority: need.priority,
                                status: need.status,
                              });
                            }}
                            className="p-2 text-gray-400 hover:text-paw-orange hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                            title="Edit need"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${need.item}" from wishlist?`)) {
                                router.delete(route('account.admin.adoption-management.needs.destroy', need.id), {
                                  preserveScroll: true,
                                  onSuccess: () => {
                                    if (selectedPetForNeeds.needs) {
                                      const updated = selectedPetForNeeds.needs.filter(n => n.id !== need.id);
                                      setSelectedPetForNeeds({ ...selectedPetForNeeds, needs: updated });
                                    }
                                  }
                                });
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                            title="Delete need"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add or Edit Need Form */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                    {editingNeed ? `Edit Wishlist Item: ${editingNeed.item}` : 'Add New Wishlist Need'}
                  </h4>
                  {editingNeed && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNeed(null);
                        setNeedForm({ item: '', quantity: '1 unit', priority: 'Medium', status: 'open' });
                      }}
                      className="text-xs font-bold text-gray-400 hover:text-gray-600 underline cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editingNeed) {
                      router.put(route('account.admin.adoption-management.needs.update', editingNeed.id), needForm, {
                        preserveScroll: true,
                        onSuccess: () => {
                          setEditingNeed(null);
                          setNeedForm({ item: '', quantity: '1 unit', priority: 'Medium', status: 'open' });
                          if (selectedPetForNeeds.needs) {
                            const updated = selectedPetForNeeds.needs.map(n => n.id === editingNeed.id ? { ...n, ...needForm } : n);
                            setSelectedPetForNeeds({ ...selectedPetForNeeds, needs: updated });
                          }
                        }
                      });
                    } else {
                      router.post(route('account.admin.adoption-management.pets.needs.store', selectedPetForNeeds.id), needForm, {
                        preserveScroll: true,
                        onSuccess: () => {
                          setNeedForm({ item: '', quantity: '1 unit', priority: 'Medium', status: 'open' });
                        }
                      });
                    }
                  }}
                  className="space-y-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-3xl border border-gray-100 dark:border-gray-800"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Item Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kitten Milk Replacer, 5kg Kibble"
                        value={needForm.item}
                        onChange={(e) => setNeedForm({ ...needForm, item: e.target.value })}
                        className="w-full bg-white dark:bg-gray-900 px-3 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 outline-none focus:border-paw-orange"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Quantity Needed *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2 cans / 5 kg / 1 vial"
                        value={needForm.quantity}
                        onChange={(e) => setNeedForm({ ...needForm, quantity: e.target.value })}
                        className="w-full bg-white dark:bg-gray-900 px-3 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 outline-none focus:border-paw-orange"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Priority Level</label>
                      <select
                        value={needForm.priority}
                        onChange={(e) => setNeedForm({ ...needForm, priority: e.target.value })}
                        className="w-full bg-white dark:bg-gray-900 px-3 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 outline-none focus:border-paw-orange"
                      >
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Status</label>
                      <select
                        value={needForm.status}
                        onChange={(e) => setNeedForm({ ...needForm, status: e.target.value })}
                        className="w-full bg-white dark:bg-gray-900 px-3 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 outline-none focus:border-paw-orange"
                      >
                        <option value="open">Open (Accepting Donations)</option>
                        <option value="fulfilled">Fulfilled</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-paw-orange text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>{editingNeed ? 'Save Changes' : 'Add Item to Wishlist'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

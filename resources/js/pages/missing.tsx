
import { Search, MapPin, Camera, Info, X, Phone, AlertTriangle, CheckCircle2, Upload, User, Mail, PawPrint, Activity, Plus, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useMemo } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { formatPhotoUrl } from '@/lib/utils';
import { LoadingTimeUI } from '@/components/ui/loading-time-ui';
import { formatPhoneNumber } from '@/lib/phone-formatter';
import { ModernDateTimePicker } from '@/components/ui/modern-date-time-picker';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import {
  MissingPetCard,
  MissingPetDetailModal,
  MissingPetShareModal,
  MissingPetItem,
} from '@/components/missing';

interface PetReport {
    id: number;
    type: string;
    status: string;
    animal_type: string;
    breed: string | null;
    age_category: string | null;
    gender: string | null;
    name: string | null;
    color: string | null;
    last_seen_date: string | null;
    urgency: string | null;
    situation_type: string | null;
    description: string | null;
    location: string;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    is_duplicate: boolean;
    created_at: string;
    photos: { id: number; path: string }[];
}

interface MissingPetsPageProps {
    reports: {
        data: PetReport[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters: {
        search: string;
        status: string;
    };
}

export default function MissingPetsPage({ reports, filters }: MissingPetsPageProps) {
  const { auth, flash } = usePage<{
    auth?: {
      user?: {
        name?: string;
        email?: string;
        phone?: string;
      } | null;
    };
    flash?: {
      error?: string | null;
      submitted_report?: {
        reference: string;
        email?: string | null;
        type?: string;
        is_duplicate?: boolean;
      } | null;
    };
  }>().props;
  const authUser = auth?.user;

  const [searchQuery, setSearchQuery] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'All');
  const [selectedPet, setSelectedPet] = useState<MissingPetItem | null>(null);
  const [sharingPet, setSharingPet] = useState<MissingPetItem | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [submittedPetName, setSubmittedPetName] = useState('');
  const [submittedReportInfo, setSubmittedReportInfo] = useState<{
    reference: string;
    email?: string | null;
    is_duplicate?: boolean;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    petName: '',
    petType: 'Dog',
    breed: '',
    color: '',
    gender: 'Male',
    ageCategory: 'Adult',
    size: 'Medium',
    reward: '',
    medicalConditions: '',
    lastSeenLocation: '',
    lastSeenDate: '',
    description: '',
    contactName: authUser?.name || '',
    contactPhone: authUser?.phone ? formatPhoneNumber(authUser.phone) : '',
    contactEmail: authUser?.email || '',
    distinguishingFeatures: ''
  });

  const isFormDirty = Boolean(
    reportModalOpen &&
    !reportSubmitted &&
    (formData.petName.trim() ||
      formData.breed.trim() ||
      formData.color.trim() ||
      formData.lastSeenLocation.trim() ||
      formData.description.trim() ||
      formData.contactName.trim() !== (authUser?.name || '') ||
      formData.contactPhone.trim() !== (authUser?.phone ? formatPhoneNumber(authUser.phone) : '') ||
      formData.contactEmail.trim() !== (authUser?.email || '') ||
      uploadedFiles.length > 0)
  );

  const {
    showDialog: showLeaveModal,
    handleContinueEditing,
    handleLeaveAnyway,
    confirmAction,
  } = useUnsavedChanges({
    isDirty: isFormDirty,
    disabled: reportSubmitted || submitting,
  });

  const mappedReports: MissingPetItem[] = useMemo(() => {
    const rawData = reports?.data && reports.data.length > 0 ? reports.data : [];

    return rawData
      .filter((report: any) => report.status !== 'duplicate' && report.status !== 'cancelled')
      .map((report: any) => {
        let statusText = 'STILL SEARCHING';
        if (report.status === 'resolved') {
          statusText = 'FOUND';
        } else if (report.status === 'assigned') {
          statusText = 'SEARCHING';
        } else if (report.status === 'pending') {
          statusText = 'PENDING REVIEW';
        }

        const photosArray = report.photos || [];
        const imgUrl = photosArray.length > 0
          ? formatPhotoUrl(photosArray[0].path)
          : 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800';

        const rawDesc = String(report.description || '');
        const hasFeaturesSplit = rawDesc.includes('Distinguishing Features:');
        const [baseDesc, splitFeatures] = hasFeaturesSplit
          ? rawDesc.split('Distinguishing Features:')
          : [rawDesc, ''];
        const cleanDescription = baseDesc?.trim() || 'No additional description provided.';
        const cleanFeatures = report.distinguishing_features || splitFeatures?.trim() || 'None reported';

        return {
          id: report.id,
          name: report.name || 'Unnamed Pet',
          type: report.animal_type || 'Dog',
          breed: report.breed || 'Mixed Breed',
          color: report.color || 'Mixed',
          gender: report.gender ? (report.gender.charAt(0).toUpperCase() + report.gender.slice(1)) : 'Unknown',
          age: report.age_category ? (report.age_category.charAt(0).toUpperCase() + report.age_category.slice(1)) : 'Young Adult',
          size: report.size ? (report.size.charAt(0).toUpperCase() + report.size.slice(1)) : 'Medium',
          reward: report.reward ? (String(report.reward).startsWith('₱') ? report.reward : `₱${report.reward}`) : null,
          medicalConditions: report.medical_conditions || 'None',
          distinguishingFeatures: cleanFeatures,
          status: statusText,
          rawStatus: report.status || 'pending',
          lastSeen: report.location || 'Iligan City',
          lastSeenDetails: cleanDescription,
          date: report.last_seen_date ? new Date(report.last_seen_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : (report.created_at ? new Date(report.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently'),
          exactDate: report.last_seen_date ? new Date(report.last_seen_date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Recently'),
          description: cleanDescription,
          img: imgUrl,
          owner: {
            name: report.contact_name || 'Community Member',
            facebook: '',
            phone: report.contact_phone || 'Not provided',
            email: report.contact_email || '',
            address: report.location || 'Iligan City',
          },
        };
      });
  }, [reports]);

  // Deep-link to pet if `?pet=id` exists in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const petIdParam = urlParams.get('pet');
      if (petIdParam) {
        const found = mappedReports.find(p => String(p.id) === String(petIdParam));
        if (found) {
          setSelectedPet(found);
        }
      }
    }
  }, [mappedReports]);

  // Lock background scroll when any modal is open
  useEffect(() => {
    const isModalOpen = reportModalOpen || selectedPet !== null || sharingPet !== null;
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [reportModalOpen, selectedPet, sharingPet]);

  // Keyboard navigation (Escape to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (sharingPet) {
          setSharingPet(null);
        } else if (reportModalOpen) {
          setReportModalOpen(false);
        } else if (selectedPet !== null) {
          setSelectedPet(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reportModalOpen, selectedPet, sharingPet]);

  const handleRemoveFile = (indexToRemove: number) => {
    const previewToRevoke = filePreviews[indexToRemove];
    if (previewToRevoke && previewToRevoke.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRevoke);
    }
    setUploadedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setFilePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'contactPhone') {
      setFormData({ ...formData, [name]: formatPhoneNumber(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const processFiles = (filesToAdd: File[]) => {
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of filesToAdd) {
      const isImage =
        file.type.startsWith('image/') ||
        /\.(jpe?g|png|webp|gif|bmp|heic|heif|svg)$/i.test(file.name);

      if (!isImage) {
        toast.error(`"${file.name}" is not a supported image file.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the 10MB file size limit.`);
        continue;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      setFilePreviews(prev => [...prev, ...validPreviews]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    processFiles(files);
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const resetReportForm = () => {
    filePreviews.forEach((preview) => {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    setUploadedFiles([]);
    setFilePreviews([]);
    setFormData({
      petName: '',
      petType: 'Dog',
      breed: '',
      color: '',
      gender: 'Male',
      ageCategory: 'Adult',
      size: 'Medium',
      reward: '',
      medicalConditions: '',
      lastSeenLocation: '',
      lastSeenDate: '',
      description: '',
      contactName: authUser?.name || '',
      contactPhone: authUser?.phone ? formatPhoneNumber(authUser.phone) : '',
      contactEmail: authUser?.email || '',
      distinguishingFeatures: ''
    });
  };

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    router.get('/missing', {
      search: searchQuery,
      status: newStatus
    }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  const handleSearch = () => {
    router.get('/missing', {
      search: searchQuery,
      status: statusFilter
    }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lastSeenLocation) {
        toast.error('Location is required.');
        return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append('petName', formData.petName);
    data.append('petType', formData.petType);
    data.append('breed', formData.breed || '');
    data.append('color', formData.color || '');
    data.append('gender', formData.gender || '');
    data.append('ageCategory', formData.ageCategory || '');
    data.append('size', formData.size || '');
    data.append('reward', formData.reward || '');
    data.append('medicalConditions', formData.medicalConditions || '');
    data.append('lastSeenLocation', formData.lastSeenLocation);
    data.append('lastSeenDate', formData.lastSeenDate);
    data.append('description', formData.description || '');
    data.append('contactName', formData.contactName);
    data.append('contactPhone', formData.contactPhone);
    data.append('contactEmail', formData.contactEmail || '');
    data.append('distinguishingFeatures', formData.distinguishingFeatures || '');

    uploadedFiles.forEach((file) => {
        data.append('images[]', file);
    });

    const targetPetName = formData.petName;
    const targetEmail = formData.contactEmail || authUser?.email || '';

    router.post('/pet-reports/missing', data, {
        preserveState: true,
        preserveScroll: true,
        onSuccess: (page) => {
            const pageFlash = page.props.flash as {
                error?: string | null;
                submitted_report?: {
                    reference: string;
                    email?: string | null;
                    is_duplicate?: boolean;
                } | null;
            } | undefined;
            if (pageFlash?.error) {
                toast.error(pageFlash.error);
                setSubmitting(false);
                return;
            }
            if (pageFlash?.submitted_report) {
                setSubmittedReportInfo(pageFlash.submitted_report);
            } else {
                setSubmittedReportInfo({
                    reference: '',
                    email: targetEmail || null,
                    is_duplicate: false,
                });
            }
            setSubmittedPetName(targetPetName);
            setReportSubmitted(true);
            setSubmitting(false);
            resetReportForm();
        },
        onError: (errors) => {
            const message = Object.values(errors).flat().join(' ');
            toast.error(message || 'Failed to submit report.');
            setSubmitting(false);
        }
    });
  };

  return (
    <div className="min-h-screen bg-paw-bg font-quicksand">
      <Header />
      
      <main className="py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <AlertTriangle size={14} />
                Critical Alert System
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-paw-navy mb-4 leading-tight">Missing & Found Pets</h1>
              <p className="text-gray-500 font-bold text-lg leading-relaxed">
                If you've lost a pet or found one wandering, report it here. 
                Our community network helps reunite families across Iligan.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <div className="relative w-full sm:w-80 lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search breed, location, description..."
                  className="w-full pl-11 pr-10 py-3.5 bg-white border-2 border-transparent hover:border-gray-100 focus:border-paw-orange rounded-2xl outline-none transition-all font-bold text-paw-navy text-sm shadow-xl shadow-paw-navy/5 placeholder:text-gray-400 placeholder:font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      router.get('/missing', { search: '', status: statusFilter }, { preserveState: true, preserveScroll: true });
                    }}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-paw-navy transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="px-6 py-3.5 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-red-700 active:scale-[0.98] transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-2.5 shrink-0 whitespace-nowrap cursor-pointer"
              >
                <Camera size={18} className="shrink-0" />
                <span>REPORT MISSING</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-12">
            {['All', 'Missing', 'Searching', 'Found'].map((f) => (
              <button 
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-8 py-3 rounded-2xl font-black transition-all ${statusFilter === f ? 'bg-paw-orange text-white shadow-xl shadow-paw-orange/20 scale-105' : 'bg-white text-paw-navy hover:bg-paw-orange/10'}`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Grid of pets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {mappedReports.length === 0 ? (
              <div className="col-span-full bg-white rounded-[40px] p-16 text-center border-2 border-gray-100 shadow-xl">
                <PawPrint className="mx-auto text-gray-300 mb-4 animate-bounce" size={48} />
                <h3 className="text-2xl font-black text-paw-navy mb-2">No Reports Found</h3>
                <p className="text-gray-500 font-bold">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              mappedReports.map((pet, idx) => (
                <MissingPetCard
                  key={pet.id}
                  pet={pet}
                  index={idx}
                  onViewDetails={setSelectedPet}
                  onShare={setSharingPet}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {reports?.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {reports.links.map((link: any, idx: number) => {
                let label = link.label;
                if (label.includes('Previous')) {
                  label = '←';
                }
                if (label.includes('Next')) {
                  label = '→';
                }

                return (
                  <button
                    key={idx}
                    disabled={!link.url}
                    onClick={() => router.get(link.url!, {}, { preserveScroll: true, preserveState: true })}
                    className={`px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                      link.active
                        ? 'bg-paw-orange text-white shadow-lg'
                        : 'bg-white text-paw-navy hover:bg-gray-100'
                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    dangerouslySetInnerHTML={{ __html: label }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Pet Detail Modal */}
      <MissingPetDetailModal
        isOpen={!!selectedPet}
        onClose={() => setSelectedPet(null)}
        pet={selectedPet}
        onShare={(pet) => setSharingPet(pet)}
      />

      {/* Pet Share Modal */}
      <MissingPetShareModal
        isOpen={!!sharingPet}
        onClose={() => setSharingPet(null)}
        pet={sharingPet}
      />




      {/* Report Missing Pet Modal */}
      <AnimatePresence>
        {reportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-paw-navy/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-hidden"
            onClick={() => confirmAction(() => setReportModalOpen(false))}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-[28px] sm:rounded-[36px] max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-red-500/20 dark:border-gray-800 overflow-hidden relative"
              role="dialog"
              aria-modal="true"
              aria-label="Report a Missing Pet"
            >
              {!reportSubmitted ? (
                <>
                  {/* Sticky Header Bar */}
                  <div className="shrink-0 px-6 sm:px-8 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex items-center justify-between gap-4 z-10">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider mb-1.5">
                        <AlertTriangle size={13} />
                        Missing Pet Report
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-paw-navy dark:text-white tracking-tight">
                        Report a Missing Pet
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">
                        Fill in the details below. Our community network will broadcast and help spread the word immediately.
                      </p>
                    </div>

                    <button
                      onClick={() => confirmAction(() => setReportModalOpen(false))}
                      className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 shrink-0"
                      title="Close modal (Esc)"
                      aria-label="Close modal"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Scrollable Form Body */}
                  <div className="flex-1 overflow-y-auto modal-scroll-area p-6 sm:p-8 md:p-10 space-y-8 overscroll-contain">
                    <form id="missing-pet-form" onSubmit={handleSubmit} className="space-y-8">
                      {/* Section 1: Pet Information */}
                      <div className="bg-gray-50/70 dark:bg-gray-800/40 p-5 sm:p-7 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-5">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 font-black text-xs flex items-center justify-center">
                            01
                          </span>
                          <div>
                            <h3 className="text-lg font-black text-paw-navy dark:text-white tracking-tight">
                              Pet Details & Appearance
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                              Basic information to help responders identify your pet
                            </p>
                          </div>
                        </div>

                        {/* Pet Name & Pet Type */}
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Pet Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <PawPrint size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                required
                                type="text"
                                name="petName"
                                value={formData.petName}
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                                placeholder="e.g. Bantay"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Pet Type <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                              {['Dog', 'Cat', 'Other'].map(type => (
                                <button
                                  type="button"
                                  key={type}
                                  onClick={() => setFormData({ ...formData, petType: type })}
                                  className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer border ${
                                    formData.petType === type
                                      ? 'bg-red-600 text-white border-red-600 shadow-sm shadow-red-600/25'
                                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/80 dark:border-gray-700 hover:border-red-400'
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Breed & Color */}
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Breed (Optional)
                            </label>
                            <input
                              type="text"
                              name="breed"
                              value={formData.breed}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                              placeholder="e.g. Aspin, Puspin, Golden Retriever mix"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Color / Markings (Optional)
                            </label>
                            <input
                              type="text"
                              name="color"
                              value={formData.color}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                              placeholder="e.g. Brown with white patches, dark muzzle"
                            />
                          </div>
                        </div>

                        {/* Inlined Traits: Gender, Age Category, Size */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Gender
                            </label>
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 cursor-pointer"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Unknown">Unknown</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Age Category
                            </label>
                            <select
                              name="ageCategory"
                              value={formData.ageCategory}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 cursor-pointer"
                            >
                              <option value="Puppy/Kitten">Puppy / Kitten</option>
                              <option value="Young">Young</option>
                              <option value="Adult">Adult</option>
                              <option value="Senior">Senior</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Size
                            </label>
                            <select
                              name="size"
                              value={formData.size}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 cursor-pointer"
                            >
                              <option value="Small">Small (&lt; 10 kg)</option>
                              <option value="Medium">Medium (10 - 25 kg)</option>
                              <option value="Large">Large (25 - 40 kg)</option>
                              <option value="Extra Large">Extra Large (&gt; 40 kg)</option>
                            </select>
                          </div>
                        </div>

                        {/* Inlined Reward & Medical Needs */}
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Reward Offered (Optional)
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">₱</span>
                              <input
                                type="text"
                                name="reward"
                                value={formData.reward}
                                onChange={handleInputChange}
                                className="w-full pl-9 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                                placeholder="e.g. 2,000"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Medical Conditions (Optional)
                            </label>
                            <div className="relative">
                              <Activity size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                name="medicalConditions"
                                value={formData.medicalConditions}
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                                placeholder="e.g. Needs daily arthritis medication"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Distinguishing Features */}
                        <div>
                          <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                            Distinguishing Features
                          </label>
                          <input
                            type="text"
                            name="distinguishingFeatures"
                            value={formData.distinguishingFeatures}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                            placeholder="e.g. Blue collar with bell, notched left ear, scar above right eye"
                          />
                        </div>

                        {/* Upload Photos */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Upload Photos
                            </label>
                            {uploadedFiles.length > 0 && (
                              <span className="text-xs font-bold text-red-600 dark:text-red-400">
                                {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} attached
                              </span>
                            )}
                          </div>

                          <input
                            type="file"
                            id="missing-pet-upload"
                            accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.heic,.heif"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          {uploadedFiles.length === 0 ? (
                            <label
                              htmlFor="missing-pet-upload"
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer block bg-white dark:bg-gray-800 group ${
                                isDragging
                                  ? 'border-red-500 bg-red-50/40 dark:bg-red-950/30 scale-[1.01]'
                                  : 'border-gray-300 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500'
                              }`}
                            >
                              <div className="w-12 h-12 mx-auto rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                                <Upload size={22} />
                              </div>
                              <p className="font-black text-sm text-paw-navy dark:text-white mb-0.5">
                                Click to upload photos or drag and drop
                              </p>
                              <p className="text-xs text-gray-400 font-bold">
                                PNG, JPG, WEBP up to 10MB (Multiple allowed)
                              </p>
                            </label>
                          ) : (
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className="space-y-3"
                            >
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {filePreviews.map((preview, idx) => (
                                  <div
                                    key={idx}
                                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 group shadow-2xs"
                                  >
                                    <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile(idx)}
                                      className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-md"
                                      title="Remove photo"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                                <label
                                  htmlFor="missing-pet-upload"
                                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-red-500 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors bg-white dark:bg-gray-800"
                                  title="Add more photos"
                                >
                                  <Plus size={22} />
                                  <span className="text-[11px] font-bold">Add More</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section 2: Last Seen Information */}
                      <div className="bg-gray-50/70 dark:bg-gray-800/40 p-5 sm:p-7 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-5">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 font-black text-xs flex items-center justify-center">
                            02
                          </span>
                          <div>
                            <h3 className="text-lg font-black text-paw-navy dark:text-white tracking-tight">
                              Last Seen Location & Timeline
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                              Pinpoint where and when your pet went missing
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Last Seen Location <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                required
                                type="text"
                                name="lastSeenLocation"
                                value={formData.lastSeenLocation}
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                                placeholder="e.g. Pala-o Market, near main entrance, Iligan City"
                              />
                            </div>
                          </div>

                          <div>
                            <ModernDateTimePicker
                              label="Date & Time Lost"
                              required
                              value={formData.lastSeenDate}
                              onChange={(val) => setFormData({ ...formData, lastSeenDate: val })}
                              placeholder="Select date and time lost..."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                            Additional Notes & Context (Optional)
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 min-h-[110px] placeholder-gray-400"
                            placeholder="Provide any additional details: direction they ran, whether they are skittish or friendly, dietary needs, medical issues, or response to treats..."
                          />
                        </div>
                      </div>

                      {/* Section 3: Contact Information */}
                      <div className="bg-gray-50/70 dark:bg-gray-800/40 p-5 sm:p-7 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-5">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 font-black text-xs flex items-center justify-center">
                            03
                          </span>
                          <div>
                            <h3 className="text-lg font-black text-paw-navy dark:text-white tracking-tight">
                              Owner & Contact Details
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                              How rescuers and citizens can quickly contact you
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Your Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                required
                                type="text"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                                placeholder="Full Name"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                required
                                type="tel"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                                placeholder="+63 912 124 1241"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                            Email Address (Recommended for Tracking & Alerts)
                          </label>
                          <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="email"
                              name="contactEmail"
                              value={formData.contactEmail}
                              onChange={handleInputChange}
                              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Community Alert Banner */}
                      <div className="flex items-start gap-3.5 p-4 sm:p-5 bg-red-500/5 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/40">
                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                          By submitting, your missing pet notice will be published to the ISF community and broadcast to volunteers in your area. We also recommend notifying your nearest barangay outpost and local veterinary clinics.
                        </p>
                      </div>
                    </form>
                  </div>

                  {/* Sticky Action Footer */}
                  <div className="shrink-0 px-6 sm:px-10 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/95 dark:bg-gray-850/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      <span>Broadcasted immediately to active rescuers</span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => confirmAction(() => setReportModalOpen(false))}
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="missing-pet-form"
                        disabled={submitting}
                        className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white font-black px-6 py-2.5 rounded-2xl shadow-md shadow-red-600/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
                      >
                        {submitting ? (
                          <LoadingTimeUI
                            isLoading={submitting}
                            variant="inline"
                            size="sm"
                            label="SUBMITTING REPORT..."
                            showProgress
                            showTime={false}
                            className="text-white"
                          />
                        ) : (
                          <>
                            <Camera size={16} />
                            <span>Submit Missing Report</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Report Submitted Success State */
                <div className="p-8 sm:p-12 text-center my-auto">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-950/80 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                    <CheckCircle2 size={42} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-paw-navy dark:text-white mb-3">
                    Report Broadcasted!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-6">
                    Your missing pet report for <strong className="text-red-600">{submittedPetName || 'your pet'}</strong> has been posted. Our community network and volunteers will be on alert.
                  </p>

                  {(submittedReportInfo?.reference || flash?.submitted_report?.reference) && (
                    <div className="max-w-sm mx-auto mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                        Reference Number
                      </p>
                      <p className="text-2xl font-black text-paw-navy dark:text-white tracking-wider mt-0.5">
                        {submittedReportInfo?.reference || flash?.submitted_report?.reference}
                      </p>
                      {(submittedReportInfo?.email || flash?.submitted_report?.email) && (
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                          E-Receipt sent to {submittedReportInfo?.email || flash?.submitted_report?.email}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {(submittedReportInfo?.reference || flash?.submitted_report?.reference) &&
                      (submittedReportInfo?.email || flash?.submitted_report?.email) && (
                        <Link
                          href={`/track?reference=${encodeURIComponent(
                            submittedReportInfo?.reference || flash?.submitted_report?.reference || ''
                          )}&email=${encodeURIComponent(
                            submittedReportInfo?.email || flash?.submitted_report?.email || ''
                          )}`}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md transition"
                        >
                          <span>Track Missing Pet Alert</span>
                          <ExternalLink size={16} />
                        </Link>
                      )}
                    <button
                      onClick={() => {
                        setReportModalOpen(false);
                        setReportSubmitted(false);
                        setSubmittedReportInfo(null);
                      }}
                      className="px-8 py-3 rounded-2xl bg-paw-navy hover:bg-paw-orange text-white font-black text-sm shadow-md transition cursor-pointer"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UnsavedChangesDialog
        isOpen={showLeaveModal}
        onContinueEditing={handleContinueEditing}
        onLeaveAnyway={handleLeaveAnyway}
        zIndex={350}
      />

      <Footer />
    </div>
  );
}

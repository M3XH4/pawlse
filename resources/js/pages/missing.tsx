
import { Search, MapPin, Calendar, Camera, Info, X, Phone, Share2, AlertTriangle, CheckCircle2, Upload, User, Mail, MessageCircle, Facebook, PawPrint, Activity, FileText, Zap, Twitter, Copy, Clock, Sparkles, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { formatPhotoUrl } from '@/lib/utils';
import { LoadingTimeUI } from '@/components/ui/loading-time-ui';

const MISSING_PETS = [
  {
    id: 1,
    name: 'Bantay',
    type: 'Dog',
    breed: 'Aspin (Mixed Breed)',
    age: '3 Years Old',
    gender: 'Male',
    color: 'Brown with white patches',
    size: 'Medium',
    status: 'Missing',
    lastSeen: 'Pala-o Market',
    lastSeenDetails: 'Near the vegetable section, close to the main entrance. Was seen wandering around food stalls.',
    date: 'Feb 15, 2026',
    exactDate: 'February 15, 2026 - 2:30 PM',
    reward: '₱2,000',
    desc: 'Very friendly and responds to his name. Wearing a blue collar with a bell.',
    description: 'Very friendly and responds to his name. Wearing a blue collar with a bell. Has a small scar above his right eye.',
    distinguishingFeatures: 'Blue collar with bell, scar above right eye, white patch on chest',
    medicalConditions: 'None',
    img: 'https://plus.unsplash.com/premium_photo-1666777247416-ee7a95235559?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9nfGVufDB8fDB8fHww',
    owner: {
      name: 'Maria Santos',
      facebook: 'Maria Santos - Iligan',
      phone: '+63 912 345 6789',
      address: 'Pala-o, Iligan City',
      email: 'maria.santos@email.com'
    }
  },
  {
    id: 2,
    name: 'Lucky',
    type: 'Dog',
    breed: 'Poodle Mix',
    age: '2 Years Old',
    gender: 'Male',
    color: 'White',
    size: 'Small',
    status: 'Found',
    lastSeen: 'Tibanga Highway',
    lastSeenDetails: 'Found shivering near a gas station. Was looking scared and cold.',
    date: 'Feb 18, 2026',
    exactDate: 'February 18, 2026 - 6:00 PM',
    reward: null,
    desc: 'White poodle mix, found shivering near a gas station.',
    description: 'White poodle mix, found shivering near a gas station. Very friendly once warmed up. No collar.',
    distinguishingFeatures: 'Curly white fur, black nose, no collar',
    medicalConditions: 'None',
    img: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nfGVufDB8fDB8fHww',
    owner: {
      name: 'John Cruz',
      facebook: 'John Cruz',
      phone: '+63 917 123 4567',
      address: 'Tibanga, Iligan City',
      email: 'john.cruz@email.com'
    }
  },
  {
    id: 3,
    name: 'Siomai',
    type: 'Cat',
    breed: 'Tabby Mix',
    age: '1 Year Old',
    gender: 'Female',
    color: 'Ginger/Orange',
    size: 'Small',
    status: 'Missing',
    lastSeen: 'Villa Verde',
    lastSeenDetails: 'Last seen near residential area. May be hiding in bushes or under cars.',
    date: 'Feb 10, 2026',
    exactDate: 'February 10, 2026 - 8:00 AM',
    reward: '₱1,000',
    desc: 'Ginger tabby cat, small size. Has a notched ear.',
    description: 'Ginger tabby cat, small size. Has a notched ear. Very shy but responds to treats.',
    distinguishingFeatures: 'Notched left ear, ginger stripes, green eyes',
    medicalConditions: 'None',
    img: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2F0fGVufDB8fDB8fHww',
    owner: {
      name: 'Sarah Lopez',
      facebook: 'Sarah Lopez - Iligan City',
      phone: '+63 920 456 7890',
      address: 'Villa Verde, Iligan City',
      email: 'sarah.lopez@email.com'
    }
  },
  {
    id: 4,
    name: 'Brownie',
    type: 'Dog',
    breed: 'Golden Retriever Mix',
    age: '8 Years Old (Senior)',
    gender: 'Male',
    color: 'Golden brown',
    size: 'Large',
    status: 'Missing',
    lastSeen: 'Saray Proper',
    lastSeenDetails: 'Last seen walking slowly near residential homes. May be disoriented.',
    date: 'Feb 20, 2026',
    exactDate: 'February 20, 2026 - 4:00 PM',
    reward: '₱3,000',
    desc: 'Golden retriever mix, senior dog. Needs medication.',
    description: 'Golden retriever mix, senior dog. Needs daily medication for arthritis. Very gentle and calm.',
    distinguishingFeatures: 'Gray muzzle, gentle eyes, wears red collar with medical tag',
    medicalConditions: 'Takes daily medication for arthritis - URGENT',
    img: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2F0fGVufDB8fDB8fHww',
    owner: {
      name: 'Robert Tan',
      facebook: 'Robert Tan',
      phone: '+63 918 765 4321',
      address: 'Saray Proper, Iligan City',
      email: 'robert.tan@email.com'
    }
  },
  {
    id: 5,
    name: 'Ricardo',
    type: 'Cat',
    breed: 'Tuxedo Cat',
    age: '3 Years Old',
    gender: 'Male',
    color: 'Black and white',
    size: 'Medium',
    status: 'Searching',
    lastSeen: 'MSU-IIT Area',
    lastSeenDetails: 'Spotted near campus buildings. Very vocal and may meow loudly.',
    date: 'Feb 19, 2026',
    exactDate: 'February 19, 2026 - 11:00 AM',
    reward: '₱1,500',
    desc: 'Black and white tuxedo cat, very vocal.',
    description: 'Black and white tuxedo cat, very vocal. Likes to meow loudly. Friendly with people.',
    distinguishingFeatures: 'Black and white pattern, loud meow, white paws',
    medicalConditions: 'None',
    img: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGNhdHxlbnwwfHwwfHx8MA%3D%3D',
    owner: {
      name: 'Anna Reyes',
      facebook: 'Anna Reyes - ISF Volunteer',
      phone: '+63 915 234 5678',
      address: 'Poblacion, Iligan City',
      email: 'anna.reyes@email.com'
    }
  },
  {
    id: 6,
    name: 'Whiskers',
    type: 'Cat',
    breed: 'Tabby Mix',
    age: '4 Years Old',
    gender: 'Male',
    color: 'Gray with white markings',
    size: 'Medium',
    status: 'Found',
    lastSeen: 'Tambo Market',
    lastSeenDetails: 'Found near fish vendors. Was looking for food.',
    date: 'Feb 21, 2026',
    exactDate: 'February 21, 2026 - 7:00 AM',
    reward: null,
    desc: 'Gray tabby cat with white paws. Very friendly.',
    description: 'Gray tabby cat with white paws. Very friendly and calm. No collar.',
    distinguishingFeatures: 'Gray fur with white paws, long whiskers, green eyes',
    medicalConditions: 'None',
    img: 'https://images.unsplash.com/photo-1503777119540-ce54b422baff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNhdHxlbnwwfHwwfHx8MA%3D%3D',
    owner: {
      name: 'Mark Dela Cruz',
      facebook: 'Mark Dela Cruz',
      phone: '+63 922 678 9012',
      address: 'Tambo, Iligan City',
      email: 'mark.delacruz@email.com'
    }
  },
];

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
  const [searchQuery, setSearchQuery] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'All');
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [formData, setFormData] = useState({
    petName: '',
    petType: 'Dog',
    breed: '',
    color: '',
    lastSeenLocation: '',
    lastSeenDate: '',
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    distinguishingFeatures: ''
  });

  // Lock background scroll when any modal is open
  useEffect(() => {
    const isModalOpen = reportModalOpen || selectedPet !== null || showContactModal;
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [reportModalOpen, selectedPet, showContactModal]);

  // Keyboard navigation (Escape to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showContactModal) {
          setShowContactModal(false);
        } else if (reportModalOpen) {
          setReportModalOpen(false);
        } else if (selectedPet !== null) {
          setSelectedPet(null);
          setShowShareMenu(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reportModalOpen, selectedPet, showContactModal]);

  const handleRemoveFile = (indexToRemove: number) => {
    setUploadedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setFilePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setUploadedFiles(files);

    const newPreviews: string[] = [];
    for (const file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            const preview = await new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
            newPreviews.push(preview);
        } else if (file.type.startsWith('video/')) {
            newPreviews.push(URL.createObjectURL(file));
        }
    }
    setFilePreviews(newPreviews);
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

    router.post('/pet-reports/missing', data, {
        onSuccess: () => {
            setReportSubmitted(true);
            toast.success('Missing pet report submitted successfully!');
            setTimeout(() => {
                setReportModalOpen(false);
                setReportSubmitted(false);
                setFormData({
                    petName: '',
                    petType: 'Dog',
                    breed: '',
                    color: '',
                    lastSeenLocation: '',
                    lastSeenDate: '',
                    description: '',
                    contactName: '',
                    contactPhone: '',
                    contactEmail: '',
                    distinguishingFeatures: ''
                });
                setUploadedFiles([]);
                setFilePreviews([]);
                setSubmitting(false);
            }, 2000);
        },
        onError: (errors) => {
            const message = Object.values(errors).flat().join(' ');
            toast.error(message || 'Failed to submit report.');
            setSubmitting(false);
        }
    });
  };

  const handleShare = async (pet: any) => {
    const shareData = {
      title: `Help Find ${pet.name} - ${pet.status}`,
      text: `${pet.status === 'Missing' ? 'MISSING PET ALERT' : pet.status === 'Found' ? 'FOUND PET' : 'SEARCHING FOR OWNER'}: ${pet.name}, a ${pet.breed} (${pet.type}). Last seen at ${pet.lastSeen} on ${pet.date}. ${pet.reward ? `Reward: ${pet.reward}` : ''} Contact: ${pet.owner.phone}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const shareToFacebook = (pet: any) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Help Find ${pet.name} - ${pet.status}: ${pet.description}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
    toast.success('Opening Facebook...');
    setShowShareMenu(false);
  };

  const shareToTwitter = (pet: any) => {
    const text = encodeURIComponent(`🚨 ${pet.status === 'Missing' ? 'MISSING PET' : pet.status === 'Found' ? 'FOUND PET' : 'SEARCHING'}: ${pet.name} (${pet.breed})\nLast seen: ${pet.lastSeen}\n${pet.reward ? `Reward: ${pet.reward}\n` : ''}Help reunite! #MissingPet #IliganCity`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    toast.success('Opening Twitter...');
    setShowShareMenu(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
    setShowShareMenu(false);
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
            {(() => {
              const mappedReports = (reports?.data || []).map((report: any) => {
                let statusText = 'Missing';
                if (report.status === 'resolved') {
                  statusText = 'Found';
                } else if (report.status === 'assigned') {
                  statusText = 'Searching';
                }

                const photosArray = report.photos || [];
                const imgUrl = photosArray.length > 0
                  ? formatPhotoUrl(photosArray[0].path)
                  : 'https://plus.unsplash.com/premium_photo-1666777247416-ee7a95235559?w=500&auto=format&fit=crop&q=60';

                return {
                  id: report.id,
                  name: report.name || 'Unnamed Pet',
                  type: report.animal_type,
                  breed: report.breed || 'Unknown Breed',
                  color: report.color || 'N/A',
                  status: statusText,
                  lastSeen: report.location,
                  date: new Date(report.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
                  desc: report.description,
                  img: imgUrl,
                  owner: {
                    name: report.contact_name || 'Anonymous',
                    phone: report.contact_phone || 'N/A',
                    email: report.contact_email || 'N/A'
                  }
                };
              });

              if (mappedReports.length === 0) {
                return (
                  <div className="col-span-full bg-white rounded-[40px] p-16 text-center border-2 border-gray-100 shadow-xl">
                    <PawPrint className="mx-auto text-gray-300 mb-4 animate-bounce" size={48} />
                    <h3 className="text-2xl font-black text-paw-navy mb-2">No Reports Found</h3>
                    <p className="text-gray-500 font-bold">Try adjusting your filters or search keywords.</p>
                  </div>
                );
              }

              return mappedReports.map((pet) => (
                <motion.div 
                  key={pet.id}
                  layoutId={`missing-${pet.id}`}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedPet(pet)}
                  className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-paw-navy/5 border-2 border-transparent hover:border-paw-orange/20 transition-all cursor-pointer group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <ImageWithFallback src={pet.img} alt={pet.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl ${
                      pet.status === 'Missing' ? 'bg-red-600 text-white' :
                      pet.status === 'Found' ? 'bg-green-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {pet.status}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-black text-paw-navy mb-4">{pet.name}</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                        <MapPin size={16} className="text-paw-orange" /> {pet.lastSeen}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                        <Calendar size={16} className="text-paw-orange" /> {pet.date}
                      </div>
                    </div>
                    <button className="w-full bg-paw-bg text-paw-navy py-4 rounded-2xl font-black hover:bg-paw-navy hover:text-white transition-all">
                      VIEW DETAILS
                    </button>
                  </div>
                </motion.div>
              ));
            })()}
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

      {/* Pet Detail Overlay */}
      <AnimatePresence>
        {selectedPet && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedPet(null);
                setShowShareMenu(false);
              }}
              className="absolute inset-0 bg-paw-navy/80 backdrop-blur-md"
            />
            <motion.div 
              layoutId={`missing-${selectedPet.id}`}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-scroll-area rounded-[28px] sm:rounded-[36px] z-10 relative shadow-2xl"
            >
              <button 
                onClick={() => setSelectedPet(null)}
                className="absolute top-6 right-6 p-2.5 bg-gray-100/90 hover:bg-paw-orange hover:text-white rounded-full transition-all z-20 cursor-pointer shadow-sm hover:scale-105"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
              
              <div className="grid md:grid-cols-2">
                <div className="h-96 md:h-full">
                  <ImageWithFallback src={selectedPet.img} alt={selectedPet.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-8 md:p-12">
                   <div className="flex items-center gap-3 mb-6">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white ${
                        selectedPet.status === 'Missing' ? 'bg-red-600' :
                        selectedPet.status === 'Found' ? 'bg-green-500' :
                        'bg-yellow-500'
                      }`}>
                        {selectedPet.status}
                      </span>
                      <span className="text-gray-400 font-bold text-sm">ID: #M-022{selectedPet.id}</span>
                   </div>

                   <h2 className="text-5xl font-black text-paw-navy mb-8 leading-none">{selectedPet.name}</h2>

                   <div className="space-y-6 mb-10">
                      <div className="flex gap-4">
                         <div className="w-12 h-12 bg-paw-orange/10 rounded-2xl flex items-center justify-center text-paw-orange shrink-0"><MapPin size={24} /></div>
                         <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Last Seen At</p>
                            <p className="font-black text-paw-navy text-lg leading-tight">{selectedPet.lastSeen}</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <div className="w-12 h-12 bg-paw-orange/10 rounded-2xl flex items-center justify-center text-paw-orange shrink-0"><Calendar size={24} /></div>
                         <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Date Reported</p>
                            <p className="font-black text-paw-navy text-lg leading-tight">{selectedPet.date}</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <div className="w-12 h-12 bg-paw-orange/10 rounded-2xl flex items-center justify-center text-paw-orange shrink-0"><Info size={24} /></div>
                         <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Description</p>
                            <p className="font-bold text-gray-600 leading-relaxed">{selectedPet.desc}</p>
                         </div>
                      </div>
                   </div>

                   {/* Only show contact buttons if pet is still missing or searching */}
                   {selectedPet.status !== 'Found' && (
                     <div className="flex gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowContactModal(true);
                          }}
                          className="flex-1 bg-paw-navy text-white py-5 rounded-[24px] font-black text-xl hover:bg-paw-orange transition-all shadow-xl shadow-paw-navy/20 flex items-center justify-center gap-3"
                        >
                           <Phone size={24} /> CONTACT OWNER
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowContactModal(true);
                          }}
                          className="p-5 bg-paw-orange text-white rounded-[24px] hover:bg-paw-orange/80 transition-all shadow-xl shadow-paw-orange/20"
                        >
                           <MessageCircle size={24} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(selectedPet);
                            }}
                            className="p-5 bg-paw-bg text-paw-navy rounded-[24px] hover:bg-gray-200 transition-all"
                          >
                             <Share2 size={24} />
                          </button>

                          {/* Share Menu Dropdown */}
                          <AnimatePresence>
                            {showShareMenu && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-full mb-2 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 min-w-[200px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => shareToFacebook(selectedPet)}
                                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                                >
                                  <Facebook size={18} className="text-blue-600" />
                                  <span className="font-bold text-paw-navy text-sm">Facebook</span>
                                </button>
                                <button
                                  onClick={() => shareToTwitter(selectedPet)}
                                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left border-t border-gray-100"
                                >
                                  <Twitter size={18} className="text-sky-500" />
                                  <span className="font-bold text-paw-navy text-sm">Twitter</span>
                                </button>
                                <button
                                  onClick={copyLink}
                                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left border-t border-gray-100"
                                >
                                  <Copy size={18} className="text-gray-600" />
                                  <span className="font-bold text-paw-navy text-sm">Copy Link</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                     </div>
                   )}

                   {/* Show "Found" status message instead */}
                   {selectedPet.status === 'Found' && (
                     <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-200">
                        <div className="flex items-center gap-3 mb-2">
                           <CheckCircle2 size={24} className="text-green-600" />
                           <h3 className="text-xl font-black text-green-700 uppercase tracking-widest">Pet Found!</h3>
                        </div>
                        <p className="text-sm font-bold text-green-600">
                           Great news! {selectedPet.name} has been found and reunited with their owner.
                        </p>
                     </div>
                   )}

                   {selectedPet.status !== 'Found' && (
                     <div className="mt-8 p-4 bg-paw-bg rounded-2xl flex items-center gap-3 border-2 border-dashed border-gray-200">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Help us find {selectedPet.name}. Share this post!</p>
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Details Modal */}
      <AnimatePresence>
        {showContactModal && selectedPet && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] relative z-10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 md:p-10 border-b border-gray-100 shrink-0">
                <div className="flex justify-between items-start">
                  <div className="flex gap-6 items-center">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-paw-orange/20 shrink-0">
                      <ImageWithFallback
                        src={selectedPet.img}
                        alt={selectedPet.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2 border ${
                        selectedPet.status === 'Missing' ? 'bg-red-100 text-red-600 border-red-200' :
                        selectedPet.status === 'Found' ? 'bg-green-100 text-green-600 border-green-200' :
                        'bg-yellow-100 text-yellow-600 border-yellow-200'
                      }`}>
                        <Search size={14} />
                        <span className="text-[10px] font-black tracking-widest uppercase">{selectedPet.status}</span>
                      </div>
                      <h3 className="text-4xl font-black uppercase tracking-tighter text-paw-navy">{selectedPet.name}</h3>
                      <p className="text-sm font-bold text-gray-500 mt-2">{selectedPet.type} • {selectedPet.breed}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-paw-navy transition-colors shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 md:p-10 overflow-y-auto contact-modal-scroll flex-1 relative">
                <div className="space-y-8">
                  {/* Reward Banner */}
                  {selectedPet.reward && (
                    <div className="bg-gradient-to-r from-paw-yellow via-orange-400 to-paw-orange rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <Zap size={24} className="text-white" fill="currentColor" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white/80 uppercase tracking-widest">Reward Offered</p>
                          <p className="text-3xl font-black text-white">{selectedPet.reward}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pet Details */}
                  <div>
                    <h4 className="text-lg font-black text-paw-navy uppercase tracking-tight mb-4 flex items-center gap-2">
                      <PawPrint size={20} className="text-paw-orange" />
                      Pet Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-paw-orange/10 to-paw-orange/5 rounded-2xl p-4 border border-paw-orange/20">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Breed</p>
                        <p className="text-sm font-black text-paw-navy">{selectedPet.breed}</p>
                      </div>
                      <div className="bg-gradient-to-br from-paw-blue/10 to-paw-blue/5 rounded-2xl p-4 border border-paw-blue/20">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Age</p>
                        <p className="text-sm font-black text-paw-navy">{selectedPet.age}</p>
                      </div>
                      <div className="bg-gradient-to-br from-paw-green/10 to-paw-green/5 rounded-2xl p-4 border border-paw-green/20">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gender</p>
                        <p className="text-sm font-black text-paw-navy">{selectedPet.gender}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-4 border border-purple-500/20">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Color</p>
                        <p className="text-sm font-black text-paw-navy">{selectedPet.color}</p>
                      </div>
                      <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-2xl p-4 border border-pink-500/20">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Size</p>
                        <p className="text-sm font-black text-paw-navy">{selectedPet.size}</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-2xl p-4 border border-red-500/20">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
                        <p className="text-sm font-black text-paw-navy">{selectedPet.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Last Seen Information */}
                  <div>
                    <h4 className="text-lg font-black text-paw-navy uppercase tracking-tight mb-4 flex items-center gap-2">
                      <MapPin size={20} className="text-paw-orange" />
                      Last Seen Information
                    </h4>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-paw-orange/10 text-paw-orange flex items-center justify-center shrink-0">
                          <MapPin size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                          <p className="text-lg font-black text-paw-navy mb-1">{selectedPet.lastSeen}</p>
                          <p className="text-sm font-bold text-gray-500 leading-relaxed">{selectedPet.lastSeenDetails}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-paw-blue/10 text-paw-blue flex items-center justify-center shrink-0">
                          <Calendar size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Date & Time</p>
                          <p className="text-lg font-black text-paw-navy">{selectedPet.exactDate}</p>
                          <p className="text-sm font-bold text-gray-500">({selectedPet.date})</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description & Features */}
                  <div>
                    <h4 className="text-lg font-black text-paw-navy uppercase tracking-tight mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-paw-orange" />
                      Description & Features
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">General Description</p>
                        <p className="text-sm font-bold text-paw-navy leading-relaxed">{selectedPet.description}</p>
                      </div>
                      <div className="bg-gradient-to-br from-paw-yellow/10 to-paw-yellow/5 rounded-2xl p-6 border-2 border-paw-yellow/20">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Distinguishing Features</p>
                        <p className="text-sm font-bold text-paw-navy leading-relaxed">{selectedPet.distinguishingFeatures}</p>
                      </div>
                      {selectedPet.medicalConditions && (
                        <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 border-2 border-red-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity size={16} className="text-red-500" />
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Medical Conditions</p>
                          </div>
                          <p className="text-sm font-bold text-paw-navy leading-relaxed">{selectedPet.medicalConditions}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Owner Contact Information */}
                  <div>
                    <h4 className="text-lg font-black text-paw-navy uppercase tracking-tight mb-4 flex items-center gap-2">
                      <User size={20} className="text-paw-orange" />
                      Owner Contact Information
                    </h4>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100">
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                        <div className="w-14 h-14 rounded-xl bg-paw-navy text-white flex items-center justify-center shrink-0">
                          <User size={28} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Owner Name</p>
                          <p className="text-xl font-black text-paw-navy">{selectedPet.owner.name}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                            <Facebook size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Facebook</p>
                            <p className="text-sm font-bold text-paw-navy truncate">{selectedPet.owner.facebook}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                          <div className="w-10 h-10 rounded-lg bg-paw-green/10 text-paw-green flex items-center justify-center shrink-0">
                            <Phone size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                            <p className="text-sm font-bold text-paw-navy">{selectedPet.owner.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                          <div className="w-10 h-10 rounded-lg bg-paw-orange/10 text-paw-orange flex items-center justify-center shrink-0">
                            <Mail size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Email</p>
                            <p className="text-sm font-bold text-paw-navy truncate">{selectedPet.owner.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                          <div className="w-10 h-10 rounded-lg bg-paw-blue/10 text-paw-blue flex items-center justify-center shrink-0">
                            <MapPin size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Address</p>
                            <p className="text-sm font-bold text-paw-navy">{selectedPet.owner.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Safety Warning */}
                  <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-2">Safety Reminder</p>
                        <p className="text-xs font-bold text-amber-700 leading-relaxed">
                          Please verify the pet's details before claiming. For safety, meet in public locations if arranging a handover. Contact local authorities if you suspect any fraudulent activity.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 md:p-10 border-t border-gray-100 bg-gray-50 shrink-0">
                <div className="flex gap-3">
                  <a
                    href={`tel:${selectedPet.owner.phone}`}
                    className="flex-1 bg-paw-green text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <Phone size={20} />
                    CALL NOW
                  </a>
                  <a
                    href={`mailto:${selectedPet.owner.email}`}
                    className="flex-1 bg-paw-orange text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <Mail size={20} />
                    SEND EMAIL
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Missing Pet Modal */}
      <AnimatePresence>
        {reportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-paw-navy/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-hidden"
            onClick={() => setReportModalOpen(false)}
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
                      onClick={() => setReportModalOpen(false)}
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
                              Breed <span className="text-red-500">*</span>
                            </label>
                            <input
                              required
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
                              Color / Markings <span className="text-red-500">*</span>
                            </label>
                            <input
                              required
                              type="text"
                              name="color"
                              value={formData.color}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                              placeholder="e.g. Brown with white patches, dark muzzle"
                            />
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
                              Upload Photos / Media
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
                            accept="image/*,video/*"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          {uploadedFiles.length === 0 ? (
                            <label
                              htmlFor="missing-pet-upload"
                              className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-7 text-center transition-all cursor-pointer block bg-white dark:bg-gray-800 group"
                            >
                              <div className="w-12 h-12 mx-auto rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                                <Upload size={22} />
                              </div>
                              <p className="font-black text-sm text-paw-navy dark:text-white mb-0.5">
                                Click to upload photos or drag and drop
                              </p>
                              <p className="text-xs text-gray-400 font-bold">
                                PNG, JPG, MP4 up to 10MB (Multiple allowed)
                              </p>
                            </label>
                          ) : (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {filePreviews.map((preview, idx) => (
                                  <div
                                    key={idx}
                                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 group shadow-2xs"
                                  >
                                    {uploadedFiles[idx]?.type.startsWith('image/') ? (
                                      <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                                    ) : (
                                      <video src={preview} className="w-full h-full object-cover" />
                                    )}
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
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Date & Time Lost <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                required
                                type="datetime-local"
                                name="lastSeenDate"
                                value={formData.lastSeenDate}
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200/80 dark:border-gray-700 rounded-2xl outline-hidden focus:border-red-500 dark:focus:border-red-500 transition-all font-bold text-sm text-gray-800 dark:text-gray-100"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                            Additional Notes & Context <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
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

                        <div className="grid md:grid-cols-2 gap-5">
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
                                placeholder="09XX XXX XXXX"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Email Address
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
                        onClick={() => setReportModalOpen(false)}
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
                    Your missing pet report for <strong className="text-red-600">{formData.petName}</strong> has been posted. Our community network and volunteers will be on alert.
                  </p>
                  <button
                    onClick={() => {
                      setReportModalOpen(false);
                      setReportSubmitted(false);
                    }}
                    className="px-8 py-3 rounded-2xl bg-paw-navy hover:bg-paw-orange text-white font-black text-sm shadow-md transition cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

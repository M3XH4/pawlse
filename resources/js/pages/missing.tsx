
import { Search, MapPin, Calendar, Camera, Info, X, Phone, Share2, AlertTriangle, CheckCircle2, Upload, User, Mail, MessageCircle, Facebook, PawPrint, Activity, FileText, Zap, Twitter, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

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

export default function MissingPetsPage() {
  const [filter, setFilter] = useState<'All' | 'Missing' | 'Found' | 'Searching'>('All');
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
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

  const filteredPets = MISSING_PETS.filter(pet => filter === 'All' || pet.status === filter);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setUploadedFile(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReportSubmitted(false);
      setFormData({
        petName: '',
        petType: '',
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
    }, 2000);
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
            <div className="flex gap-4 w-full md:w-auto">
               <button
                 onClick={() => setReportModalOpen(true)}
                 className="flex-1 md:flex-none bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3"
               >
                  <Camera size={20} />
                  REPORT MISSING
               </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-12">
            {['All', 'Missing', 'Found', 'Searching'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-8 py-3 rounded-2xl font-black transition-all ${filter === f ? 'bg-paw-orange text-white shadow-xl shadow-paw-orange/20 scale-105' : 'bg-white text-paw-navy hover:bg-paw-orange/10'}`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPets.map((pet) => (
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
            ))}
          </div>
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
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] z-10 relative shadow-2xl"
            >
              <button 
                onClick={() => setSelectedPet(null)}
                className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={24} />
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReportModalOpen(false)}
              className="absolute inset-0 bg-paw-navy/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] z-10 relative shadow-2xl"
            >
              <button
                onClick={() => setReportModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
              >
                <X size={24} />
              </button>

              <div className="p-8 md:p-12">
                {!reportSubmitted ? (
                  <>
                    <div className="mb-8">
                      <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                        <AlertTriangle size={14} />
                        Missing Pet Report
                      </div>
                      <h2 className="text-4xl font-black text-paw-navy mb-3">Report a Missing Pet</h2>
                      <p className="text-gray-500 font-bold text-lg">
                        Fill in the details below. Our community network will help spread the word.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Pet Information */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-black text-paw-navy uppercase tracking-widest">Pet Information</h3>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Pet Name</label>
                            <input
                              required
                              type="text"
                              name="petName"
                              value={formData.petName}
                              onChange={handleInputChange}
                              className="w-full p-4 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                              placeholder="e.g. Bantay"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Pet Type</label>
                            <select
                              required
                              name="petType"
                              value={formData.petType}
                              onChange={handleInputChange}
                              className="w-full p-4 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                            >
                              <option value="">Select type</option>
                              <option value="Dog">Dog</option>
                              <option value="Cat">Cat</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Breed</label>
                            <input
                              required
                              type="text"
                              name="breed"
                              value={formData.breed}
                              onChange={handleInputChange}
                              className="w-full p-4 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                              placeholder="e.g. Aspin, Puspin, Mixed"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Color / Markings</label>
                            <input
                              required
                              type="text"
                              name="color"
                              value={formData.color}
                              onChange={handleInputChange}
                              className="w-full p-4 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                              placeholder="e.g. Brown, White patches"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Distinguishing Features</label>
                          <input
                            type="text"
                            name="distinguishingFeatures"
                            value={formData.distinguishingFeatures}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                            placeholder="e.g. Collar color, scars, unique markings"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Upload Photo</label>
                          <input
                            type="file"
                            id="missing-pet-upload"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="missing-pet-upload"
                            className="border-4 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-paw-orange transition-all cursor-pointer block"
                          >
                            {!uploadedFile ? (
                              <>
                                <Upload size={40} className="mx-auto text-gray-400 mb-3" />
                                <p className="font-black text-paw-navy mb-1">Click to upload or drag and drop</p>
                                <p className="text-sm text-gray-400 font-bold">PNG, JPG up to 10MB</p>
                              </>
                            ) : (
                              <div className="space-y-4">
                                {filePreview && uploadedFile.type.startsWith('image/') && (
                                  <img src={filePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-cover" />
                                )}
                                {filePreview && uploadedFile.type.startsWith('video/') && (
                                  <video src={filePreview} controls className="max-h-48 mx-auto rounded-xl" />
                                )}
                                <div className="flex items-center justify-center gap-2">
                                  <CheckCircle2 size={20} className="text-green-600" />
                                  <p className="font-black text-green-600">{uploadedFile.name}</p>
                                </div>
                                <p className="text-sm text-gray-500 font-bold">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <p className="text-xs text-gray-400 font-bold">Click to change file</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Last Seen Information */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-black text-paw-navy uppercase tracking-widest">Last Seen</h3>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Location</label>
                            <input
                              required
                              type="text"
                              name="lastSeenLocation"
                              value={formData.lastSeenLocation}
                              onChange={handleInputChange}
                              className="w-full p-4 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                              placeholder="e.g. Pala-o Market, Iligan City"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Date & Time</label>
                            <input
                              required
                              type="datetime-local"
                              name="lastSeenDate"
                              value={formData.lastSeenDate}
                              onChange={handleInputChange}
                              className="w-full p-4 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Additional Description</label>
                          <textarea
                            required
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold min-h-[120px]"
                            placeholder="Any additional information that might help find your pet..."
                          />
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-black text-paw-navy uppercase tracking-widest">Contact Information</h3>

                        <div>
                          <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Your Name</label>
                          <input
                            required
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                            placeholder="Full Name"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Phone Number</label>
                            <input
                              required
                              type="tel"
                              name="contactPhone"
                              value={formData.contactPhone}
                              onChange={handleInputChange}
                              className="w-full p-4 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                              placeholder="09XX XXX XXXX"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Email Address</label>
                            <input
                              required
                              type="email"
                              name="contactEmail"
                              value={formData.contactEmail}
                              onChange={handleInputChange}
                              className="w-full p-4 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-6 bg-paw-orange/5 rounded-[32px] border-2 border-dashed border-paw-orange/20">
                        <AlertTriangle className="text-paw-orange shrink-0 mt-1" size={24} />
                        <p className="text-xs text-gray-600 font-bold leading-relaxed">
                          By submitting, you agree to share this information with the ISF community to help locate your pet.
                          We recommend contacting local barangays and animal shelters as well.
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-red-600 text-white py-6 rounded-[24px] font-black text-xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3"
                      >
                        <Camera size={24} />
                        SUBMIT REPORT
                      </button>
                    </form>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle2 size={48} strokeWidth={3} />
                    </div>
                    <h2 className="text-5xl font-black text-paw-navy mb-4">Report Submitted!</h2>
                    <p className="text-gray-500 font-bold text-xl leading-relaxed max-w-md mx-auto">
                      Your missing pet report has been posted. Our community will help spread the word and look for {formData.petName}.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

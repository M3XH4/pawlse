import React, { useState, useMemo, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Plus,
  Search,
  MessageSquare,
  PhoneCall,
  Video,
  Camera,
  Home,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  X,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
  Eye,
  Trash2,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { AdminCard } from '@/components/admin/card';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { formatPhotoUrl } from '@/lib/utils';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';

export interface PostAdoptionFollowUpData {
  id: number;
  shelter_animal_id: number;
  follow_up_date: string;
  method: 'chat' | 'call' | 'photo_update' | 'video' | 'home_visit';
  status: string;
  pet_condition: string;
  notes: string;
  photo_url?: string | null;
  next_follow_up_date?: string | null;
  conducted_by_name: string;
  pet?: {
    id: number;
    name: string;
    type?: string | null;
    breed: string;
    photo_url?: string | null;
    adopter_name?: string | null;
    adopter_phone?: string | null;
    adoption_date?: string | null;
  } | null;
}

export interface AdoptedPetData {
  id: number;
  name: string;
  type?: string | null;
  breed: string;
  photo_url?: string | null;
  adopter_name?: string | null;
  adopter_phone?: string | null;
  adopter_email?: string | null;
  adoption_date?: string | null;
  follow_ups_count: number;
}

interface PostAdoptionTabProps {
  followUps?: PostAdoptionFollowUpData[];
  adoptedPets?: AdoptedPetData[];
}

export function PostAdoptionTab({
  followUps = [],
  adoptedPets = [],
}: PostAdoptionTabProps) {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [enlargedPhotoUrl, setEnlargedPhotoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    shelter_animal_id: adoptedPets[0]?.id ? String(adoptedPets[0].id) : '',
    follow_up_date: new Date().toISOString().split('T')[0],
    method: 'chat' as 'chat' | 'call' | 'photo_update' | 'video' | 'home_visit',
    status: 'completed',
    pet_condition: 'Good',
    notes: '',
    next_follow_up_date: '',
    photo: null as File | null,
  });

  const methodIcons: Record<string, React.ReactNode> = {
    chat: <MessageSquare size={14} className="text-sky-500" />,
    call: <PhoneCall size={14} className="text-emerald-500" />,
    photo_update: <Camera size={14} className="text-purple-500" />,
    video: <Video size={14} className="text-rose-500" />,
    home_visit: <Home size={14} className="text-amber-500" />,
  };

  const methodLabels: Record<string, string> = {
    chat: 'Chat / SMS',
    call: 'Phone Call',
    photo_update: 'Photo Update',
    video: 'Video Call',
    home_visit: 'Home Visit',
  };

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((item) => {
      const petName = item.pet?.name || '';
      const adopterName = item.pet?.adopter_name || '';
      const matchesSearch =
        petName.toLowerCase().includes(search.toLowerCase()) ||
        adopterName.toLowerCase().includes(search.toLowerCase()) ||
        item.notes.toLowerCase().includes(search.toLowerCase());

      const matchesMethod =
        methodFilter === 'All' || item.method.toLowerCase() === methodFilter.toLowerCase();
      const matchesCondition =
        conditionFilter === 'All' || item.pet_condition.toLowerCase() === conditionFilter.toLowerCase();

      return matchesSearch && matchesMethod && matchesCondition;
    });
  }, [followUps, search, methodFilter, conditionFilter]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('photo', file);
      setPreviewPhotoUrl(URL.createObjectURL(file));
    }
  };

  const clearPhoto = () => {
    setData('photo', null);
    if (previewPhotoUrl) URL.revokeObjectURL(previewPhotoUrl);
    setPreviewPhotoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/account/admin/adoption-management/post-adoption-follow-ups', {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Post-adoption follow-up check-in recorded successfully!');
        reset();
        clearPhoto();
        setIsRecordModalOpen(false);
      },
      onError: () => {
        toast.error('Please verify all form fields.');
      },
    });
  };

  const openLogForPet = (petId: number) => {
    setData('shelter_animal_id', String(petId));
    setIsRecordModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Total Adopted</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-paw-navy dark:text-white">{adoptedPets.length}</h3>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-paw-orange flex items-center justify-center">
              <Heart size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Animals placed in homes</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Check-ins Conducted</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {followUps.filter((f) => f.status === 'completed').length}
            </h3>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Recorded follow-ups</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Scheduled / Upcoming</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400">
              {followUps.filter((f) => f.status === 'scheduled').length}
            </h3>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Scheduled check-ins</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Needs Attention</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {followUps.filter((f) => f.pet_condition === 'Needs Attention').length}
            </h3>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-bold mt-1">Requiring additional care</p>
        </div>
      </div>

      {/* Main Container */}
      <AdminCard>
        {/* Header & New Follow-up Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-fredoka text-xl font-bold text-paw-navy dark:text-white">
              Post-Adoption Follow-ups
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Record and monitor welfare check-ins with adopters via chat, call, photo update, video, or home visit.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (adoptedPets.length === 0) {
                toast.error('No adopted pets available yet to log a follow-up for.');
                return;
              }
              setIsRecordModalOpen(true);
            }}
            className="px-5 py-3 bg-[#FF9B00] hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Record Follow-up
          </button>
        </div>

        {/* Adopted Pets Quick Strip */}
        {adoptedPets.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                Adopted Pets Portfolio ({adoptedPets.length})
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {adoptedPets.slice(0, 4).map((pet) => (
                <div
                  key={pet.id}
                  className="bg-paw-bg/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <ImageWithFallback
                        src={formatPhotoUrl(pet.photo_url)}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-paw-navy dark:text-white text-xs truncate">
                        {pet.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        Adopter: {pet.adopter_name || 'Recorded'}
                      </p>
                      <p className="text-[9px] font-bold text-paw-orange">
                        {pet.follow_ups_count} check-in(s) logged
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openLogForPet(pet.id)}
                    className="p-2 bg-white dark:bg-gray-800 hover:bg-paw-orange hover:text-white text-paw-navy dark:text-white rounded-xl shadow-xs transition-colors shrink-0"
                    title={`Log follow-up for ${pet.name}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text"
              placeholder="Search by pet name, adopter, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange outline-none rounded-2xl font-bold text-xs text-paw-navy dark:text-white transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange outline-none rounded-2xl font-bold text-xs text-gray-900 dark:text-white"
            >
              <option value="All">All Methods</option>
              <option value="chat">Chat / SMS</option>
              <option value="call">Phone Call</option>
              <option value="photo_update">Photo Update</option>
              <option value="video">Video Call</option>
              <option value="home_visit">Home Visit</option>
            </select>

            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-paw-orange outline-none rounded-2xl font-bold text-xs text-gray-900 dark:text-white"
            >
              <option value="All">All Conditions</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Needs Attention">Needs Attention</option>
            </select>
          </div>
        </div>

        {/* Follow-up Feed / Records */}
        {filteredFollowUps.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <AlertTriangle className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={44} />
            <p className="font-bold text-sm">No post-adoption follow-up records found.</p>
            <p className="text-xs text-gray-400 mt-1">
              Click &quot;Record Follow-up&quot; above to log an adopter check-in.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFollowUps.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Pet & Adopter Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="w-13 h-13 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    <ImageWithFallback
                      src={formatPhotoUrl(item.pet?.photo_url)}
                      alt={item.pet?.name || 'Adopted Pet'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-paw-navy dark:text-white text-base">
                        {item.pet?.name || 'Adopted Animal'}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {item.pet?.breed}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Adopter: <strong className="text-paw-navy dark:text-white">{item.pet?.adopter_name || 'N/A'}</strong>
                      {item.pet?.adopter_phone ? ` • ${item.pet.adopter_phone}` : ''}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {/* Method badge */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gray-100 dark:bg-gray-700 text-paw-navy dark:text-white">
                        {methodIcons[item.method] || <MessageSquare size={12} />}
                        {methodLabels[item.method] || item.method}
                      </span>

                      {/* Condition badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          item.pet_condition === 'Excellent' || item.pet_condition === 'Good'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {item.pet_condition}
                      </span>

                      {/* Status */}
                      <span className="text-[10px] text-gray-400 font-semibold">
                        Status: <strong className="uppercase">{item.status}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Notes & Photos */}
                <div className="flex-1 max-w-xl text-xs text-gray-600 dark:text-gray-300 font-medium bg-paw-bg/50 dark:bg-gray-900/40 p-3 rounded-xl">
                  <p className="line-clamp-2">{item.notes}</p>
                  {item.next_follow_up_date && (
                    <p className="text-[10px] text-paw-blue font-bold mt-1 flex items-center gap-1">
                      <Clock size={11} /> Next scheduled: {item.next_follow_up_date}
                    </p>
                  )}
                </div>

                {/* Right: Date, Staff, and Thumbnail */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                  {item.photo_url && (
                    <button
                      type="button"
                      onClick={() => setEnlargedPhotoUrl(item.photo_url || null)}
                      className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 relative group cursor-pointer shrink-0"
                      title="View follow-up photo"
                    >
                      <img
                        src={item.photo_url}
                        alt="Follow-up update"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye size={14} />
                      </div>
                    </button>
                  )}

                  <div className="text-right">
                    <p className="font-black text-xs text-paw-navy dark:text-white">
                      {item.follow_up_date}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold">
                      By {item.conducted_by_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Record Follow-up Modal */}
      <AnimatePresence>
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecordModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-gray-900 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[32px] p-6 sm:p-8 z-10 relative shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
                <div>
                  <h3 className="text-xl font-black text-paw-navy dark:text-white">
                    Record Post-Adoption Follow-up
                  </h3>
                  <p className="text-xs text-gray-400 font-bold">
                    Log an adopter interaction and assess pet welfare
                  </p>
                </div>
                <button
                  onClick={() => setIsRecordModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-paw-navy rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Select Pet */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                    Select Adopted Pet <span className="text-paw-orange">*</span>
                  </label>
                  <select
                    required
                    value={data.shelter_animal_id}
                    onChange={(e) => setData('shelter_animal_id', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-paw-navy dark:text-white font-bold text-sm outline-none focus:border-paw-orange"
                  >
                    {adoptedPets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.breed}) — Adopter: {pet.adopter_name || 'Recorded'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Follow-up Date & Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <ModernDatePicker
                      label="Check-in Date"
                      required
                      value={data.follow_up_date}
                      onChange={(date) => setData('follow_up_date', date)}
                      placeholder="Select check-in date..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                      Follow-up Channel / Method <span className="text-paw-orange">*</span>
                    </label>
                    <select
                      value={data.method}
                      onChange={(e) => setData('method', e.target.value as any)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-paw-navy dark:text-white font-bold text-sm outline-none focus:border-paw-orange"
                    >
                      <option value="chat">Chat / Messenger / SMS</option>
                      <option value="call">Phone Call</option>
                      <option value="photo_update">Photo Update</option>
                      <option value="video">Video Call</option>
                      <option value="home_visit">In-Person Home Visit</option>
                    </select>
                  </div>
                </div>

                {/* Pet Condition & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                      Pet Condition & Welfare <span className="text-paw-orange">*</span>
                    </label>
                    <select
                      value={data.pet_condition}
                      onChange={(e) => setData('pet_condition', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-paw-navy dark:text-white font-bold text-sm outline-none focus:border-paw-orange"
                    >
                      <option value="Excellent">Excellent (Thriving & Healthy)</option>
                      <option value="Good">Good (Well Adjusted)</option>
                      <option value="Fair">Fair (Needs Minor Monitoring)</option>
                      <option value="Needs Attention">Needs Attention / Follow-up Required</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                      Interaction Status <span className="text-paw-orange">*</span>
                    </label>
                    <select
                      value={data.status}
                      onChange={(e) => setData('status', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-paw-navy dark:text-white font-bold text-sm outline-none focus:border-paw-orange"
                    >
                      <option value="completed">Completed</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Next follow-up date */}
                <div>
                  <ModernDatePicker
                    label="Next Scheduled Follow-up (Optional)"
                    value={data.next_follow_up_date}
                    onChange={(date) => setData('next_follow_up_date', date)}
                    placeholder="Select next follow-up date..."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                    Notes & Adopter Feedback <span className="text-paw-orange">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe how the pet is doing, behavior updates, diet, medical notes..."
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-paw-navy dark:text-white font-bold text-sm outline-none focus:border-paw-orange resize-none"
                  />
                  {errors.notes && (
                    <p className="text-xs text-red-500 font-bold mt-1">{errors.notes}</p>
                  )}
                </div>

                {/* Photo Update */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-paw-navy dark:text-white mb-1.5">
                    Photo Update / Home Proof (Optional)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />

                  {previewPhotoUrl ? (
                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <img
                        src={previewPhotoUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-paw-navy dark:text-white truncate">
                          {data.photo?.name}
                        </p>
                        <button
                          type="button"
                          onClick={clearPhoto}
                          className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                        >
                          <Trash2 size={12} /> Remove photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-paw-orange rounded-2xl text-xs font-bold text-gray-500 hover:text-paw-orange flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Camera size={16} />
                      Attach Adopter Photo / Home Visit Photo
                    </button>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="px-5 py-3 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-3 bg-[#FF9B00] hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {processing ? (
                      <Spinner showProgress label="Saving..." />
                    ) : (
                      'Save Follow-up Check-in'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Enlarge Modal */}
      <AnimatePresence>
        {enlargedPhotoUrl && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEnlargedPhotoUrl(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl bg-black"
            >
              <button
                onClick={() => setEnlargedPhotoUrl(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:bg-black/80 rounded-full z-20"
              >
                <X size={20} />
              </button>
              <img
                src={enlargedPhotoUrl}
                alt="Enlarged follow-up"
                className="w-full h-auto max-h-[80vh] object-contain mx-auto"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

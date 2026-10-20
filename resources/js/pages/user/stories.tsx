import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Sparkles, Plus, Search, Heart, Star, Calendar, Clock,
    CheckCircle2, AlertCircle, XCircle, Edit3, Trash2,
    ExternalLink, Eye, PawPrint, Image as ImageIcon,
    UploadCloud, X, FileText, Check, MessageSquareQuote,
    HelpCircle, Filter, HeartHandshake
} from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { toast } from 'sonner';

interface PetOption {
    id: number;
    name: string;
    type: string;
    breed: string | null;
    photo_url: string | null;
}

interface StoryItem {
    id: number;
    title: string;
    slug: string;
    category: string;
    summary: string | null;
    content: string;
    featured_image: string | null;
    tags: string[] | null;
    reading_time_minutes: number;
    status: 'published' | 'pending' | 'rejected' | 'draft' | 'archived';
    rating: number | null;
    rejection_reason: string | null;
    views_count: number;
    shares_count: number;
    reactions_count?: number;
    published_at: string | null;
    created_at: string;
    shelter_animal?: PetOption | null;
    reviewer?: { id: number; name: string } | null;
}

interface PaginatedStories {
    data: StoryItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface UserStoriesProps {
    stories: PaginatedStories;
    adoptedPets: PetOption[];
    allAdoptedAnimals: PetOption[];
    metrics: {
        total: number;
        published: number;
        pending: number;
        rejected: number;
        total_views: number;
        total_reactions: number;
    };
    categories: Record<string, string>;
    filters: {
        status: string;
        category?: string;
        search: string;
    };
}

export default function UserStories({
    stories,
    adoptedPets = [],
    allAdoptedAnimals = [],
    metrics,
    categories,
    filters,
}: UserStoriesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStory, setEditingStory] = useState<StoryItem | null>(null);

    // Form inputs
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('testimonial');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [rating, setRating] = useState<number>(5);
    const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
    const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
    const [featuredImageUrl, setFeaturedImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [tagsInput, setTagsInput] = useState('Testimonial, Animal Welfare, Review');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete confirmation
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Combine adopted pets for selection
    const availablePets = adoptedPets.length > 0 ? adoptedPets : allAdoptedAnimals;

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/account/user/stories', {
            search: search.trim() || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
        }, { preserveState: true });
    };

    const handleStatusTab = (status: string) => {
        setStatusFilter(status);
        router.get('/account/user/stories', {
            search: search.trim() || undefined,
            status: status !== 'all' ? status : undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
        }, { preserveState: true });
    };

    const handleCategoryPill = (cat: string) => {
        setCategoryFilter(cat);
        router.get('/account/user/stories', {
            search: search.trim() || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            category: cat !== 'all' ? cat : undefined,
        }, { preserveState: true });
    };

    const openCreateModal = (defaultCategory: string = 'testimonial') => {
        setEditingStory(null);
        setTitle('');
        setCategory(defaultCategory);
        setSummary('');
        setContent('');
        setRating(5);
        if (defaultCategory === 'adoption_success' && adoptedPets.length > 0) {
            setSelectedAnimalId(String(adoptedPets[0].id));
            setImagePreview(adoptedPets[0].photo_url || null);
            setFeaturedImageUrl(adoptedPets[0].photo_url || '');
        } else {
            setSelectedAnimalId('');
            setImagePreview(null);
            setFeaturedImageUrl('');
        }
        setFeaturedImageFile(null);
        setTagsInput(defaultCategory === 'testimonial' ? 'Testimonial, Review, Pawlse Family' : 'Adoption Story, Happy Ending');
        setIsModalOpen(true);
    };

    const openEditModal = (story: StoryItem) => {
        setEditingStory(story);
        setTitle(story.title);
        setCategory(story.category);
        setSummary(story.summary || '');
        setContent(story.content);
        setRating(story.rating || 5);
        setSelectedAnimalId(story.shelter_animal ? String(story.shelter_animal.id) : '');
        setFeaturedImageFile(null);
        setFeaturedImageUrl(story.featured_image || '');
        setImagePreview(story.featured_image);
        setTagsInput(story.tags ? story.tags.join(', ') : 'Adoption Story');
        setIsModalOpen(true);
    };

    const handlePetSelect = (animalId: string) => {
        setSelectedAnimalId(animalId);
        if (animalId && !featuredImageFile) {
            const pet = availablePets.find((p) => String(p.id) === animalId);
            if (pet?.photo_url) {
                setImagePreview(pet.photo_url);
                setFeaturedImageUrl(pet.photo_url);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFeaturedImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error('Please fill in both a title and the story content.');
            return;
        }

        setIsSubmitting(true);
        const tagsArray = tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('category', category);
        formData.append('summary', summary.trim());
        formData.append('content', content.trim());
        formData.append('rating', String(rating));
        formData.append('shelter_animal_id', selectedAnimalId || '');

        if (featuredImageFile) {
            formData.append('featured_image', featuredImageFile);
        } else if (featuredImageUrl) {
            formData.append('featured_image', featuredImageUrl);
        }

        tagsArray.forEach((tag, idx) => {
            formData.append(`tags[${idx}]`, tag);
        });

        if (editingStory) {
            formData.append('_method', 'PUT');
            router.post(`/account/user/stories/${editingStory.id}`, formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setIsSubmitting(false);
                    toast.success(
                        category === 'testimonial'
                            ? 'Your testimonial has been updated and resubmitted for admin review!'
                            : 'Your story has been updated and resubmitted for admin review!'
                    );
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    const firstErr = Object.values(errors)[0] as string;
                    toast.error(firstErr || 'Failed to update story.');
                },
            });
        } else {
            router.post('/account/user/stories', formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setIsSubmitting(false);
                    toast.success(
                        category === 'testimonial'
                            ? 'Your testimonial was submitted! Admin will review it before publishing.'
                            : 'Your adoption story was submitted! Admin will review it before publishing.'
                    );
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    const firstErr = Object.values(errors)[0] as string;
                    toast.error(firstErr || 'Failed to submit story.');
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this story? This cannot be undone.')) {
            return;
        }
        setDeletingId(id);
        router.delete(`/account/user/stories/${id}`, {
            onSuccess: () => {
                setDeletingId(null);
                toast.success('Story deleted successfully.');
            },
            onError: () => {
                setDeletingId(null);
                toast.error('Failed to delete story.');
            },
        });
    };

    const getStatusBadge = (status: StoryItem['status']) => {
        switch (status) {
            case 'published':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 size={13} /> Published on Blog
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse">
                        <Clock size={13} /> Pending Admin Review
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                        <XCircle size={13} /> Needs Revision
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300">
                        <FileText size={13} /> Draft
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                        {status}
                    </span>
                );
        }
    };

    return (
        <DashboardSectionPage
            title="Adoption Stories & Testimonials"
            description="Share your heartwarming journey or community testimonial to inspire others. Submissions are reviewed by our team before publishing to the blog."
            badge={
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => openCreateModal('testimonial')}
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:bg-teal-700 active:scale-95 cursor-pointer"
                    >
                        <MessageSquareQuote size={16} /> Write Testimonial
                    </button>
                    <button
                        onClick={() => openCreateModal('adoption_success')}
                        className="inline-flex items-center gap-2 rounded-xl bg-paw-orange px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-paw-orange/20 transition-all hover:bg-paw-orange/90 active:scale-95 cursor-pointer"
                    >
                        <Plus size={16} /> Adoption Story
                    </button>
                </div>
            }
        >
            {/* Metric Overview Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <DashboardCard className="p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Stories</span>
                        <Sparkles size={16} className="text-paw-orange" />
                    </div>
                    <div className="mt-2 text-2xl font-bold font-fredoka text-[#0B2340] dark:text-[#F8FAFC]">
                        {metrics.total}
                    </div>
                </DashboardCard>

                <DashboardCard className="p-4 flex flex-col justify-between border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10">
                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Live on Blog</span>
                        <CheckCircle2 size={16} />
                    </div>
                    <div className="mt-2 text-2xl font-bold font-fredoka text-emerald-700 dark:text-emerald-300">
                        {metrics.published}
                    </div>
                </DashboardCard>

                <DashboardCard className="p-4 flex flex-col justify-between border-amber-100 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10">
                    <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Pending Approval</span>
                        <Clock size={16} />
                    </div>
                    <div className="mt-2 text-2xl font-bold font-fredoka text-amber-700 dark:text-amber-300">
                        {metrics.pending}
                    </div>
                </DashboardCard>

                <DashboardCard className="p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                        <span className="text-xs font-bold uppercase tracking-wider">Community Hearts</span>
                        <Heart size={16} className="text-rose-500 fill-rose-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold font-fredoka text-[#0B2340] dark:text-[#F8FAFC]">
                        {metrics.total_reactions}
                    </div>
                </DashboardCard>
            </div>

            {/* Admin Approval Guidance Banner */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        <HelpCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-amber-950 dark:text-amber-200">
                            How story publishing works
                        </p>
                        <p className="text-xs text-amber-800 dark:text-amber-300/80">
                            When you submit an adoption testimonial, our shelter admins review it to verify details and keep stories safe. Once approved, your story goes live on the public blog!
                        </p>
                    </div>
                </div>
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-paw-orange hover:underline shrink-0"
                >
                    Visit Public Blog <ExternalLink size={12} />
                </Link>
            </div>

            {/* Filter Tabs & Search */}
            <DashboardCard className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {[
                            { key: 'all', label: 'All Stories', count: metrics.total },
                            { key: 'pending', label: 'Pending Review', count: metrics.pending },
                            { key: 'published', label: 'Published', count: metrics.published },
                            { key: 'rejected', label: 'Needs Revision', count: metrics.rejected },
                        ].map((tab) => {
                            const active = statusFilter === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleStatusTab(tab.key)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        active
                                            ? 'bg-paw-orange text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            active
                                                ? 'bg-white/25 text-white'
                                                : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search your stories..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-paw-orange focus:outline-none focus:ring-1 focus:ring-paw-orange dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </form>
                </div>

                {/* Category / Content Type Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                        <Filter size={12} /> Type:
                    </span>
                    {[
                        { key: 'all', label: 'All Content' },
                        { key: 'testimonial', label: 'Testimonials', icon: MessageSquareQuote },
                        { key: 'adoption_success', label: 'Adoption Stories', icon: HeartHandshake },
                        { key: 'rescue_story', label: 'Rescue Stories', icon: PawPrint },
                    ].map((pill) => {
                        const active = categoryFilter === pill.key;
                        return (
                            <button
                                key={pill.key}
                                onClick={() => handleCategoryPill(pill.key)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                    active
                                        ? 'bg-paw-navy text-white border-paw-navy dark:bg-paw-orange dark:border-paw-orange shadow-xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {pill.icon && <pill.icon size={12} />}
                                <span>{pill.label}</span>
                            </button>
                        );
                    })}
                </div>
            </DashboardCard>

            {/* Stories Grid / List */}
            {stories.data.length === 0 ? (
                <DashboardCard className="p-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-paw-orange mb-4">
                        <MessageSquareQuote size={32} />
                    </div>
                    <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                        {categoryFilter === 'testimonial'
                            ? 'No testimonials submitted yet'
                            : statusFilter !== 'all' || categoryFilter !== 'all' || search
                            ? 'No stories or testimonials match your filter'
                            : 'No stories or testimonials submitted yet'}
                    </h3>
                    <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto">
                        {categoryFilter === 'testimonial'
                            ? 'Share your experience with the shelter, our rescue team, or volunteers. Inspire others to support animal welfare!'
                            : statusFilter !== 'all' || categoryFilter !== 'all' || search
                            ? 'Try switching to "All Content" or clearing your search term.'
                            : 'Share your heartwarming adoption story or leave a shelter testimonial. Submissions are reviewed by our team and featured on the community blog!'}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => openCreateModal('testimonial')}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 cursor-pointer"
                        >
                            <MessageSquareQuote size={14} /> Write Testimonial
                        </button>
                        <button
                            onClick={() => openCreateModal('adoption_success')}
                            className="inline-flex items-center gap-2 rounded-xl bg-paw-orange px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-paw-orange/20 hover:bg-paw-orange/90 cursor-pointer"
                        >
                            <Plus size={14} /> Write Adoption Story
                        </button>
                    </div>
                </DashboardCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {stories.data.map((story) => (
                        <DashboardCard
                            key={story.id}
                            className="overflow-hidden p-0 flex flex-col justify-between border border-slate-200 dark:border-slate-800"
                        >
                            {/* Card Header & Image */}
                            <div>
                                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <ImageWithFallback
                                        src={story.featured_image || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80'}
                                        alt={story.title}
                                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                                        {getStatusBadge(story.status)}
                                    </div>

                                    {story.rating && (
                                        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-amber-300">
                                            <Star size={13} className="fill-amber-300 text-amber-300" />
                                            <span>{story.rating}.0 / 5</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    {/* Category Pill & Linked Pet badge */}
                                    <div className="mb-2.5 flex flex-wrap items-center gap-2">
                                        {story.category === 'testimonial' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800">
                                                <MessageSquareQuote size={12} /> Testimonial
                                            </span>
                                        ) : story.category === 'adoption_success' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                                                <HeartHandshake size={12} /> Adoption Story
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                                                <PawPrint size={12} /> Rescue Story
                                            </span>
                                        )}

                                        {story.shelter_animal && (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-paw-orange/10 text-[10px] font-bold text-paw-orange">
                                                <PawPrint size={11} />
                                                <span>Pet: {story.shelter_animal.name}</span>
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white line-clamp-2">
                                        {story.title}
                                    </h3>

                                    {story.summary && (
                                        <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                                            "{story.summary}"
                                        </p>
                                    )}

                                    {/* Rejection / Feedback Banner */}
                                    {story.status === 'rejected' && story.rejection_reason && (
                                        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs dark:border-rose-900/40 dark:bg-rose-950/20">
                                            <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                                                <AlertCircle size={14} /> Admin Feedback:
                                            </div>
                                            <p className="mt-1 text-rose-900 dark:text-rose-200">
                                                {story.rejection_reason}
                                            </p>
                                            <p className="mt-1.5 text-[11px] text-rose-600 dark:text-rose-400">
                                                Click "Edit Story" below to address this feedback and resubmit for approval.
                                            </p>
                                        </div>
                                    )}

                                    {/* Under review helper note */}
                                    {story.status === 'pending' && (
                                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 text-[11px] text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300 flex items-center gap-2">
                                            <Clock size={13} className="shrink-0" />
                                            <span>Awaiting admin review. You'll receive a notification once approved!</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Footer with stats and actions */}
                            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/40 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Eye size={13} /> {story.views_count} reads
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart size={13} className="text-rose-500" /> {story.reactions_count ?? 0}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {story.status === 'published' ? (
                                        <Link
                                            href={`/blog/${story.slug}`}
                                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                                        >
                                            <ExternalLink size={12} /> View Live
                                        </Link>
                                    ) : (
                                        <Link
                                            href={`/blog/${story.slug}`}
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            title="Preview Article Layout"
                                        >
                                            <Eye size={12} /> Preview
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => openEditModal(story)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                    >
                                        <Edit3 size={12} /> Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(story.id)}
                                        disabled={deletingId === story.id}
                                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                                        title="Delete Story"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </DashboardCard>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {stories.last_page > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                    {stories.links.map((link, idx) => {
                        const label = link.label.replace('&laquo;', '‹').replace('&raquo;', '›');
                        return (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => router.get(link.url!, {}, { preserveScroll: true, preserveState: true })}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                    link.active
                                        ? 'bg-paw-orange text-white shadow-md'
                                        : 'bg-white dark:bg-[#1E293B] text-[#0B2340] dark:text-[#F8FAFC] hover:bg-gray-50 border border-gray-100 dark:border-gray-800'
                                } ${!link.url ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                dangerouslySetInnerHTML={{ __html: label }}
                            />
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-[#111827] border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-paw-orange dark:bg-orange-950/40">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                        {editingStory
                                            ? category === 'testimonial'
                                                ? 'Edit Community Testimonial'
                                                : 'Edit Adoption Story'
                                            : category === 'testimonial'
                                            ? 'Share Your Experience & Testimonial'
                                            : 'Share Your Adoption Story'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {editingStory
                                            ? `Updating will resubmit your ${category === 'testimonial' ? 'testimonial' : 'story'} for admin review.`
                                            : category === 'testimonial'
                                            ? 'Share your thoughts, review, and feedback about the PAWLSE community, shelter care, or team.'
                                            : 'Tell the world how your adopted friend brightened your life.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Adopted Pet Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Select Adopted Companion (Optional)
                                </label>
                                <select
                                    value={selectedAnimalId}
                                    onChange={(e) => handlePetSelect(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-paw-orange focus:outline-none focus:ring-1 focus:ring-paw-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="">
                                        {category === 'testimonial'
                                            ? 'No Companion Linked (General Testimonial)'
                                            : 'Other / General Adoption Story'}
                                    </option>
                                    {availablePets.map((pet) => (
                                        <option key={pet.id} value={pet.id}>
                                            🐾 {pet.name} ({pet.type} {pet.breed ? `- ${pet.breed}` : ''})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Story Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    {category === 'testimonial' ? 'Testimonial Title' : 'Story Title'} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={
                                        category === 'testimonial'
                                            ? 'e.g. Why PAWLSE Sets The Gold Standard for Animal Welfare in Our Community'
                                            : 'e.g. How Bella Found Her Forever Home and Filled Ours With Love'
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-paw-orange focus:outline-none focus:ring-1 focus:ring-paw-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Category & Experience Rating */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Content Type
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-paw-orange focus:outline-none focus:ring-1 focus:ring-paw-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="testimonial">★ Community & Shelter Testimonial</option>
                                        <option value="adoption_success">🐾 Adoption Success Story</option>
                                        <option value="rescue_story">🩹 Rescue & Rehabilitation Story</option>
                                    </select>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        {category === 'testimonial'
                                            ? 'Share your experience, review, and feedback about the PAWLSE team, shelter care, or adoption service.'
                                            : category === 'adoption_success'
                                            ? 'Share the journey and joyful milestones of your adopted companion.'
                                            : 'Share stories of rescuing, fostering, or aiding animals in need.'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Experience Rating
                                    </label>
                                    <div className="flex items-center gap-1.5 py-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className="p-1 hover:scale-110 transition-transform cursor-pointer"
                                            >
                                                <Star
                                                    size={22}
                                                    className={`${
                                                        star <= rating
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-slate-300 dark:text-slate-600'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                                            {rating} / 5 Stars
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial Quote / Summary */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Testimonial Quote / Summary
                                </label>
                                <textarea
                                    rows={2}
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="A key highlight or quote: 'Adopting from Pawlse was the best decision our family made...'"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-paw-orange focus:outline-none focus:ring-1 focus:ring-paw-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Full Story Content */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    {category === 'testimonial' ? 'Your Testimonial & Review' : 'Your Adoption Story'}{' '}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={6}
                                    required
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={
                                        category === 'testimonial'
                                            ? 'Share your experience with our shelter care, adoption counselors, rescue volunteers, and how PAWLSE impacted you...'
                                            : 'Write about the day you met them, how they adjusted to your home, their funny habits, and how they enrich your daily life...'
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-paw-orange focus:outline-none focus:ring-1 focus:ring-paw-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Min 20 characters. Express your authentic experience!
                                </p>
                            </div>

                            {/* Photo / Featured Image */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Photo / Featured Image
                                </label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <label className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-paw-orange cursor-pointer">
                                        <UploadCloud size={16} className="text-paw-orange" />
                                        <span>Upload Photo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="text-xs text-slate-400">or enter an image URL:</span>
                                    <input
                                        type="url"
                                        value={featuredImageUrl}
                                        onChange={(e) => {
                                            setFeaturedImageUrl(e.target.value);
                                            setImagePreview(e.target.value || null);
                                        }}
                                        placeholder="https://..."
                                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-paw-orange focus:outline-none focus:ring-1 focus:ring-paw-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                {imagePreview && (
                                    <div className="mt-3 relative aspect-video w-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setFeaturedImageFile(null);
                                                setFeaturedImageUrl('');
                                            }}
                                            className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 cursor-pointer"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Tags Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    placeholder="Adoption, Happy Ending, Dog, Family"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-paw-orange focus:outline-none focus:ring-1 focus:ring-paw-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Approval notice */}
                            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                                ℹ️ <strong>Note:</strong> Submissions are sent to Pawlse administrators for verification and approval. Once approved, your {category === 'testimonial' ? 'testimonial' : 'story'} will appear publicly in the Blog & Community Stories section.
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 rounded-xl bg-paw-orange px-5 py-2 text-xs font-bold text-white shadow-md shadow-paw-orange/20 hover:bg-paw-orange/90 disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting ? 'Submitting...' : editingStory ? 'Update & Resubmit' : 'Submit for Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardSectionPage>
    );
}

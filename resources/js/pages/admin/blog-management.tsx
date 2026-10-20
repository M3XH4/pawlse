import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import { AdminCard } from '@/components/admin/card';
import { toast } from 'sonner';
import {
    Newspaper, Plus, Search, Filter, Edit, Trash2, Eye,
    ToggleLeft, ToggleRight, X, Heart, Share2, Sparkles,
    Calendar, Clock, Check, ExternalLink, Image as ImageIcon,
    FileText, HelpCircle, Megaphone, PawPrint, HeartHandshake,
    GraduationCap, Scale, Layers, Tag, Star, MessageSquareQuote
} from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

interface BlogPostModel {
    id: number;
    title: string;
    slug: string;
    category: string;
    summary: string | null;
    content: string;
    featured_image: string | null;
    tags: string[] | null;
    reading_time_minutes: number;
    status: 'published' | 'draft' | 'archived' | 'pending' | 'rejected';
    is_featured: boolean;
    rating?: number | null;
    rejection_reason?: string | null;
    views_count: number;
    shares_count: number;
    reactions_count?: number;
    published_at: string | null;
    created_at: string;
    author?: {
        id: number;
        name: string;
        role: string;
    } | null;
    shelter_animal?: {
        id: number;
        name: string;
        type: string;
        breed: string;
        photo_url: string;
    } | null;
    reviewer?: { id: number; name: string } | null;
}

interface PaginatedData<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    total: number;
}

interface BlogManagementProps {
    posts: PaginatedData<BlogPostModel>;
    metrics: {
        total_posts: number;
        published_posts: number;
        pending_posts?: number;
        draft_posts: number;
        rejected_posts?: number;
        total_views: number;
        total_reactions: number;
        total_shares: number;
        rescue_stories_count: number;
        awareness_campaigns_count: number;
    };
    categories: Record<string, string>;
    filters: {
        search: string;
        category: string;
        status: string;
    };
}

const CATEGORY_STYLES: Record<string, {
    label: string;
    badge: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}> = {
    testimonial: {
        label: 'Testimonials',
        badge: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
        icon: MessageSquareQuote,
    },
    rescue_story: {
        label: 'Rescue Stories',
        badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        icon: PawPrint,
    },
    adoption_success: {
        label: 'Adoption Success',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        icon: HeartHandshake,
    },
    announcement: {
        label: 'Announcements',
        badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        icon: Megaphone,
    },
    community_awareness: {
        label: 'Community Awareness',
        badge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
        icon: GraduationCap,
    },
    advocacy_campaign: {
        label: 'Advocacy Campaigns',
        badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        icon: Scale,
    },
    news_update: {
        label: 'News & Updates',
        badge: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
        icon: Newspaper,
    },
};

const PRESET_IMAGES = [
    { label: 'Rescue Puppy', url: 'https://images.unsplash.com/photo-1594004844613-19d4db632e0f?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Adoption Love', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Animal Welfare Law', url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Vet Care Clinic', url: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Spay & Neuter', url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Feeding Convoy', url: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=1200&auto=format&fit=crop&q=80' },
];

export default function BlogManagement({
    posts,
    metrics,
    categories,
    filters,
}: BlogManagementProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPostModel | null>(null);

    // Form inputs
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('news_update');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [featuredImage, setFeaturedImage] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [readingTime, setReadingTime] = useState(3);
    const [status, setStatus] = useState<'published' | 'draft' | 'archived' | 'pending' | 'rejected'>('published');
    const [isFeatured, setIsFeatured] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reject Modal state
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [postToReject, setPostToReject] = useState<BlogPostModel | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    const handleApprove = (post: BlogPostModel) => {
        if (!confirm(`Are you sure you want to approve "${post.title}" and publish it to the blog?`)) return;
        router.post(`/account/admin/blog-management/${post.id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(`"${post.title}" approved and published to the blog!`),
            onError: () => toast.error('Failed to approve story.'),
        });
    };

    const openRejectModal = (post: BlogPostModel) => {
        setPostToReject(post);
        setRejectionReason('');
        setIsRejectModalOpen(true);
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!postToReject) return;
        setIsRejecting(true);
        router.post(`/account/admin/blog-management/${postToReject.id}/reject`, {
            rejection_reason: rejectionReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsRejecting(false);
                setIsRejectModalOpen(false);
                setPostToReject(null);
                toast.success('Story has been rejected and author notified.');
            },
            onError: () => {
                setIsRejecting(false);
                toast.error('Failed to reject story.');
            },
        });
    };

    const addTagSuggestion = (tag: string) => {
        const existing = tagsInput ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [];
        if (!existing.includes(tag)) {
            setTagsInput(existing.length ? `${existing.join(', ')}, ${tag}` : tag);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/account/admin/blog-management', {
            search: search.trim() || undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, { preserveState: true });
    };

    const handleFilterChange = (newCategory: string, newStatus: string) => {
        setCategoryFilter(newCategory);
        setStatusFilter(newStatus);
        router.get('/account/admin/blog-management', {
            search: search.trim() || undefined,
            category: newCategory !== 'all' ? newCategory : undefined,
            status: newStatus !== 'all' ? newStatus : undefined,
        }, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingPost(null);
        setTitle('');
        setCategory('rescue_story');
        setSummary('');
        setContent('');
        setFeaturedImage(PRESET_IMAGES[0].url);
        setTagsInput('Animal Welfare, Rescue, Iligan City');
        setReadingTime(3);
        setStatus('published');
        setIsFeatured(false);
        setIsModalOpen(true);
    };

    const openEditModal = (post: BlogPostModel) => {
        setEditingPost(post);
        setTitle(post.title);
        setCategory(post.category);
        setSummary(post.summary || '');
        setContent(post.content);
        setFeaturedImage(post.featured_image || '');
        setTagsInput(post.tags ? post.tags.join(', ') : '');
        setReadingTime(post.reading_time_minutes || 3);
        setStatus(post.status);
        setIsFeatured(post.is_featured);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const tagsArray = tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        const payload = {
            title,
            category,
            summary: summary.trim() || null,
            content,
            featured_image: featuredImage.trim() || null,
            tags: tagsArray,
            reading_time_minutes: readingTime,
            status,
            is_featured: isFeatured,
        };

        if (editingPost) {
            router.put(`/account/admin/blog-management/${editingPost.id}`, payload, {
                onSuccess: () => {
                    toast.success('Article updated successfully.');
                    setIsModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => {
                    toast.error('Failed to update article. Please check input errors.');
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post('/account/admin/blog-management', payload, {
                onSuccess: () => {
                    toast.success('Article created and published successfully!');
                    setIsModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => {
                    toast.error('Failed to create article. Please check input errors.');
                    setIsSubmitting(false);
                },
            });
        }
    };

    const handleToggleStatus = (post: BlogPostModel) => {
        router.patch(`/account/admin/blog-management/${post.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Article status updated.`);
            },
        });
    };

    const handleDeletePost = (post: BlogPostModel) => {
        if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;

        router.delete(`/account/admin/blog-management/${post.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Article deleted successfully.');
            },
        });
    };

    return (
        <>
            <Head title="Blog Management - Admin" />

            <AdminPageShell
                title="Blog Management"
                description="Publish and manage rescue stories, adoption success stories, educational animal welfare campaigns, and organization updates."
            >
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <AdminCard>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Posts</span>
                            <Newspaper size={16} className="text-paw-orange" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-paw-navy dark:text-white">
                            {metrics.total_posts}
                        </p>
                    </AdminCard>

                    <AdminCard>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Published</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-emerald-600">
                            {metrics.published_posts}
                        </p>
                    </AdminCard>

                    <AdminCard className={metrics.pending_posts && metrics.pending_posts > 0 ? 'border-amber-300 bg-amber-50/40 dark:border-amber-700/60 dark:bg-amber-950/20' : ''}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Review</span>
                            <Clock size={16} className={`text-amber-500 ${metrics.pending_posts && metrics.pending_posts > 0 ? 'animate-spin' : ''}`} />
                        </div>
                        <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
                            {metrics.pending_posts ?? 0}
                        </p>
                    </AdminCard>

                    <AdminCard>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Drafts</span>
                            <FileText size={16} className="text-slate-400" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-slate-600 dark:text-slate-300">
                            {metrics.draft_posts}
                        </p>
                    </AdminCard>

                    <AdminCard>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Reactions</span>
                            <Heart size={16} className="text-rose-500" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-rose-500">
                            {metrics.total_reactions}
                        </p>
                    </AdminCard>

                    <AdminCard>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Views</span>
                            <Eye size={16} className="text-blue-500" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-blue-500">
                            {metrics.total_views}
                        </p>
                    </AdminCard>
                </div>

                {/* Filters, Search & Action Bar */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search articles by title or content..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-paw-orange"
                            />
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(e) => handleFilterChange(e.target.value, statusFilter)}
                            className="py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200"
                        >
                            <option value="all">All Categories</option>
                            {Object.entries(categories).map(([k, l]) => (
                                <option key={k} value={k}>{l}</option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => handleFilterChange(categoryFilter, e.target.value)}
                            className="py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending Review</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="rejected">Rejected</option>
                            <option value="archived">Archived</option>
                        </select>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-paw-navy dark:bg-gray-700 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition"
                        >
                            Filter
                        </button>
                    </form>

                    <button
                        onClick={openCreateModal}
                        className="w-full lg:w-auto px-5 py-2.5 bg-paw-orange hover:bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-paw-orange/20 transition cursor-pointer"
                    >
                        <Plus size={16} /> New Article
                    </button>
                </div>

                {/* Articles Table */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 text-gray-500 font-black uppercase tracking-wider">
                                    <th className="py-4 px-6">Article</th>
                                    <th className="py-4 px-4">Category</th>
                                    <th className="py-4 px-4">Author</th>
                                    <th className="py-4 px-4 text-center">Engagement</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 px-4">Published Date</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                                {posts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400">
                                            No articles found. Click "New Article" to publish your first post.
                                        </td>
                                    </tr>
                                ) : (
                                    posts.data.map((post) => (
                                        <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                            {/* Article Title & Thumb */}
                                            <td className="py-4 px-6 max-w-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-700">
                                                        <ImageWithFallback
                                                            src={post.featured_image || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=120&auto=format&fit=crop&q=80'}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-bold text-sm text-paw-navy dark:text-white truncate">
                                                                {post.title}
                                                            </p>
                                                            {post.is_featured && (
                                                                <span title="Featured Story" className="inline-flex shrink-0">
                                                                    <Star size={15} className="fill-amber-400 text-amber-500 shrink-0" />
                                                                </span>
                                                            )}
                                                        </div>
                                                        {post.shelter_animal && (
                                                            <p className="text-[11px] font-bold text-paw-orange truncate mt-0.5">
                                                                🐾 Adopted: {post.shelter_animal.name} ({post.shelter_animal.type})
                                                            </p>
                                                        )}
                                                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                                            {post.summary || post.content.substring(0, 70)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                {(() => {
                                                    const style = CATEGORY_STYLES[post.category] || {
                                                        label: categories[post.category] || post.category.replace(/_/g, ' '),
                                                        badge: 'bg-gray-100 text-gray-800 border-gray-200',
                                                        icon: FileText,
                                                    };
                                                    const BadgeIcon = style.icon;
                                                    return (
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${style.badge}`}>
                                                            <BadgeIcon size={12} className="shrink-0" />
                                                            <span>{style.label}</span>
                                                        </span>
                                                    );
                                                })()}
                                            </td>

                                            {/* Author */}
                                            <td className="py-4 px-4 font-bold text-gray-700 dark:text-gray-300">
                                                {post.author?.name || 'Admin'}
                                            </td>

                                            {/* Engagement Stats */}
                                            <td className="py-4 px-4 text-center">
                                                <div className="inline-flex items-center gap-3 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                                    <span className="flex items-center gap-1 text-rose-500 font-bold" title="Reactions">
                                                        <Heart size={12} className="fill-rose-500" />
                                                        {post.reactions_count ?? 0}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-blue-500 font-bold" title="Views">
                                                        <Eye size={12} />
                                                        {post.views_count}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-purple-500 font-bold" title="Shares">
                                                        <Share2 size={12} />
                                                        {post.shares_count}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                {post.status === 'pending' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        <span>Pending Review</span>
                                                    </span>
                                                ) : post.status === 'rejected' ? (
                                                    <span
                                                        title={post.rejection_reason || 'Rejected'}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                        <span>Rejected</span>
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleToggleStatus(post)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer border shadow-xs ${
                                                            post.status === 'published'
                                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                                                : post.status === 'archived'
                                                                ? 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                                                                : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                        }`}
                                                        title="Click to toggle status"
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            post.status === 'published' ? 'bg-emerald-500' : post.status === 'archived' ? 'bg-gray-400' : 'bg-slate-400'
                                                        }`} />
                                                        <span className="capitalize">{post.status}</span>
                                                    </button>
                                                )}
                                            </td>

                                            {/* Published Date */}
                                            <td className="py-4 px-4 text-gray-500">
                                                {post.published_at ? new Date(post.published_at).toLocaleDateString() : post.status === 'pending' ? 'Pending Review' : 'Draft'}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {post.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(post)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                                                                title="Approve & Publish Story"
                                                            >
                                                                <Check size={12} /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => openRejectModal(post)}
                                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[11px] transition cursor-pointer"
                                                                title="Reject Story"
                                                            >
                                                                <X size={12} /> Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    <a
                                                        href={`/blog/${post.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`p-1.5 rounded-lg transition ${
                                                            post.status === 'published'
                                                                ? 'text-gray-400 hover:text-paw-orange hover:bg-gray-100 dark:hover:bg-gray-800'
                                                                : 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                                        }`}
                                                        title={post.status === 'published' ? 'View Public Page' : 'Preview Article Layout'}
                                                    >
                                                        {post.status === 'published' ? <ExternalLink size={15} /> : <Eye size={15} />}
                                                    </a>

                                                    <button
                                                        onClick={() => openEditModal(post)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                                        title="Edit Article"
                                                    >
                                                        <Edit size={15} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeletePost(post)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                                        title="Delete Article"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {posts.links && posts.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-center items-center gap-1.5">
                            {posts.links.map((link, idx) => {
                                if (link.url === null) {
                                    return (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                                            link.active
                                                ? 'bg-paw-orange text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Create / Edit Article Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
                        <div
                            className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Sticky Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-paw-orange/10 text-paw-orange flex items-center justify-center shrink-0">
                                        <Newspaper size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black text-paw-navy dark:text-white uppercase tracking-tight">
                                                {editingPost ? 'Edit Article' : 'Create New Article'}
                                            </h3>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                                editingPost
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                            }`}>
                                                {editingPost ? `Post #${editingPost.id}` : 'New Article'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">
                                            Publish rescue stories, educational welfare campaigns, and organization updates.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center transition cursor-pointer"
                                    aria-label="Close dialog"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Scrollable Form Body */}
                            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                        {/* Main Content Area (7 cols on lg) */}
                                        <div className="lg:col-span-7 space-y-5">
                                            {/* Title */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Article Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="e.g. From Tambo Drainage to Shelter Hero: The Survival Journey of Milo"
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-paw-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-paw-orange"
                                                />
                                            </div>

                                            {/* Summary / Excerpt */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                                                    <span>Short Summary / Excerpt (Optional)</span>
                                                    <span className="text-[10px] text-gray-400 font-normal">Shown on cards and previews</span>
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={summary}
                                                    onChange={(e) => setSummary(e.target.value)}
                                                    placeholder="Brief 1-2 sentence teaser introducing the story or awareness campaign..."
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-paw-orange leading-relaxed"
                                                />
                                            </div>

                                            {/* Article Content */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                                                    <span>Article Content *</span>
                                                    <span className="text-[10px] text-paw-orange font-bold">Supports Markdown (###, **, -)</span>
                                                </label>
                                                <textarea
                                                    rows={10}
                                                    required
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                    placeholder="Write the full narrative or awareness content here..."
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-mono leading-relaxed text-paw-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-paw-orange"
                                                />
                                            </div>
                                        </div>

                                        {/* Meta & Media Sidebar (5 cols on lg) */}
                                        <div className="lg:col-span-5 space-y-5">
                                            {/* Category */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Category *
                                                </label>
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200"
                                                >
                                                    {Object.entries(categories).map(([k, l]) => (
                                                        <option key={k} value={k}>{l}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Status & Reading Time */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                                                        Status *
                                                    </label>
                                                    <select
                                                        value={status}
                                                        onChange={(e) => setStatus(e.target.value as any)}
                                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200"
                                                    >
                                                        <option value="published">Published</option>
                                                        <option value="pending">Pending Review</option>
                                                        <option value="draft">Draft</option>
                                                        <option value="rejected">Rejected</option>
                                                        <option value="archived">Archived</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                                                        Read Time (Min)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={60}
                                                        value={readingTime}
                                                        onChange={(e) => setReadingTime(parseInt(e.target.value) || 1)}
                                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold"
                                                    />
                                                </div>
                                            </div>

                                            {/* Featured Story Toggle Card */}
                                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="isFeatured"
                                                    checked={isFeatured}
                                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                                    className="w-4 h-4 text-paw-orange rounded border-amber-300 focus:ring-paw-orange cursor-pointer"
                                                />
                                                <label htmlFor="isFeatured" className="text-xs font-bold text-amber-900 dark:text-amber-200 cursor-pointer select-none">
                                                    ★ Pin as Featured Story on Blog Header
                                                </label>
                                            </div>

                                            {/* Featured Image with Live Preview */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Featured Image URL
                                                </label>
                                                <input
                                                    type="url"
                                                    value={featuredImage}
                                                    onChange={(e) => setFeaturedImage(e.target.value)}
                                                    placeholder="https://images.unsplash.com/..."
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-paw-navy dark:text-white"
                                                />

                                                {/* Live Image Preview Box */}
                                                <div className="mt-2.5 relative h-32 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    {featuredImage ? (
                                                        <ImageWithFallback
                                                            src={featuredImage}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center text-gray-400 gap-1">
                                                            <ImageIcon size={24} />
                                                            <span className="text-[11px] font-medium">No image URL specified</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Preset image picker */}
                                                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Presets:</span>
                                                    {PRESET_IMAGES.map((preset, pIdx) => (
                                                        <button
                                                            key={pIdx}
                                                            type="button"
                                                            onClick={() => setFeaturedImage(preset.url)}
                                                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-gray-800 hover:bg-paw-orange/15 hover:text-paw-orange text-gray-600 dark:text-gray-300 transition cursor-pointer border border-transparent hover:border-paw-orange/30"
                                                        >
                                                            {preset.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tags & Quick Tag Chips */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Tags (Comma Separated)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={tagsInput}
                                                    onChange={(e) => setTagsInput(e.target.value)}
                                                    placeholder="e.g. Animal Welfare, Kapon, Rescue, RA 8485"
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium"
                                                />
                                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Add:</span>
                                                    {['Animal Welfare', 'Rescue', 'Kapon', 'RA 8485', 'Forever Home', 'Feeding Route'].map((tg, tgIdx) => (
                                                        <button
                                                            key={tgIdx}
                                                            type="button"
                                                            onClick={() => addTagSuggestion(tg)}
                                                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-paw-orange/10 text-paw-orange hover:bg-paw-orange hover:text-white transition cursor-pointer"
                                                        >
                                                            +{tg}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky Modal Footer Actions */}
                                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 backdrop-blur-sm flex items-center justify-between shrink-0">
                                    <div className="text-xs text-gray-400 font-medium hidden sm:flex items-center gap-1.5">
                                        <Sparkles size={14} className="text-paw-orange" />
                                        <span>Reactions and social share only • No comments allowed</span>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-5 py-2.5 rounded-xl bg-gray-200/80 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-6 py-2.5 rounded-xl bg-paw-orange hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-paw-orange/25 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                'Saving...'
                                            ) : editingPost ? (
                                                'Update Article'
                                            ) : (
                                                <>
                                                    <Plus size={15} /> Publish Article
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Reject Story Modal */}
                {isRejectModalOpen && postToReject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
                                <h4 className="font-fredoka text-lg font-bold text-gray-900 dark:text-white">
                                    Reject Story Submission
                                </h4>
                                <button
                                    onClick={() => setIsRejectModalOpen(false)}
                                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                                Provide feedback to <strong>{postToReject.author?.name || 'the author'}</strong> on why &quot;{postToReject.title}&quot; was not approved. They will be notified and can revise and resubmit.
                            </p>
                            <form onSubmit={handleRejectSubmit}>
                                <textarea
                                    rows={4}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="e.g. Please upload higher resolution photos of your pet and expand on their rescue/adjustment journey..."
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsRejectModalOpen(false)}
                                        className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isRejecting}
                                        className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50 cursor-pointer"
                                    >
                                        {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </AdminPageShell>
        </>
    );
}

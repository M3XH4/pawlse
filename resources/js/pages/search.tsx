import { Head, Link, router } from '@inertiajs/react';
import { Search as SearchIcon, Dog, Calendar, FileText, AlertTriangle, ArrowRight, Sparkles, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

interface SearchResultPet {
    id: number;
    name: string;
    type: string;
    breed: string;
    age: string;
    photo: string;
    story: string;
    url: string;
}

interface SearchResultEvent {
    id: number;
    title: string;
    category: string;
    date: string;
    time: string;
    location: string;
    img: string;
    url: string;
}

interface SearchResultArticle {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    date: string;
    featured_image: string;
    url: string;
}

interface SearchResultReport {
    id: number;
    pet_name: string;
    type: string;
    breed: string;
    location: string;
    photo_url: string;
    status: string;
    url: string;
}

interface SearchProps {
    query: string;
    results: {
        pets: SearchResultPet[];
        events: SearchResultEvent[];
        articles: SearchResultArticle[];
        reports: SearchResultReport[];
    };
    counts: {
        total: number;
        pets: number;
        events: number;
        articles: number;
        reports: number;
    };
}

export default function SearchPage({ query: initialQuery = '', results, counts }: SearchProps) {
    const [query, setQuery] = useState(initialQuery);
    const [activeTab, setActiveTab] = useState<'all' | 'pets' | 'events' | 'articles' | 'reports'>('all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.get('/search', { q: query.trim() }, { preserveState: true });
        }
    };

    return (
        <div className="relative font-quicksand min-h-screen bg-paw-bg/50">
            <Head title={`Search Results for "${initialQuery}" - PAWLSE`} />
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-12 md:py-16">
                {/* Search Bar Header */}
                <div className="max-w-3xl mx-auto text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-paw-orange/10 px-4 py-2 rounded-full mb-4 border border-paw-orange/20">
                        <SearchIcon size={16} className="text-paw-orange" />
                        <span className="text-xs font-black tracking-widest uppercase text-paw-orange">Global Search</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-paw-navy mb-4 tracking-tight">
                        Find What You're Looking For
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 font-bold mb-8">
                        Search across available rescues, shelter events, community news, and lost pet notices.
                    </p>

                    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                        <SearchIcon size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, breed, location, or topic..."
                            className="w-full pl-14 pr-24 py-4 rounded-2xl bg-white border-2 border-gray-200 focus:border-paw-orange outline-none shadow-lg font-bold text-paw-navy placeholder:text-gray-400 text-sm md:text-base transition-colors"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X size={18} />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-paw-orange hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-colors shadow-md"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Filter Tabs */}
                {initialQuery && (
                    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10">
                        {[
                            { id: 'all', label: 'All Results', count: counts.total, icon: Sparkles },
                            { id: 'pets', label: 'Pets', count: counts.pets, icon: Dog },
                            { id: 'events', label: 'Events', count: counts.events, icon: Calendar },
                            { id: 'articles', label: 'Stories & Blog', count: counts.articles, icon: FileText },
                            { id: 'reports', label: 'Reports', count: counts.reports, icon: AlertTriangle },
                        ].map((tab) => {
                            const IconComponent = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all shadow-sm ${
                                        isActive
                                            ? 'bg-paw-navy text-white shadow-md scale-105'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-paw-navy'
                                    }`}
                                >
                                    <IconComponent size={14} className={isActive ? 'text-paw-yellow' : 'text-gray-400'} />
                                    <span>{tab.label}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Search Results Display */}
                {counts.total === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-xl mx-auto">
                        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SearchIcon size={32} />
                        </div>
                        <h3 className="text-xl font-black text-paw-navy mb-2">No Results Found</h3>
                        <p className="text-sm font-bold text-gray-500 mb-6">
                            {initialQuery
                                ? `We couldn't find any matches for "${initialQuery}". Try different keywords or browse our main sections below.`
                                : 'Enter a keyword above to find pets, articles, and community updates.'}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link href="/adopt" className="px-5 py-2.5 rounded-xl bg-paw-orange text-white text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition-colors">
                                Browse Pets
                            </Link>
                            <Link href="/events" className="px-5 py-2.5 rounded-xl bg-paw-navy text-white text-xs font-black uppercase tracking-wider hover:bg-black transition-colors">
                                View Events
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Pets Section */}
                        {(activeTab === 'all' || activeTab === 'pets') && results.pets.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-black text-paw-navy flex items-center gap-2">
                                        <Dog className="text-paw-orange" size={24} />
                                        Adoptable Pets ({results.pets.length})
                                    </h2>
                                    <Link href="/adopt" className="text-xs font-black text-paw-orange hover:underline uppercase tracking-wider flex items-center gap-1">
                                        View All Pets <ArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {results.pets.map((pet) => (
                                        <Link
                                            key={pet.id}
                                            href={pet.url}
                                            className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 group flex flex-col"
                                        >
                                            <div className="aspect-[4/3] overflow-hidden relative">
                                                <ImageWithFallback src={pet.photo} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                <div className="absolute top-3 right-3 bg-paw-orange text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                                                    {pet.type}
                                                </div>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-lg font-black text-paw-navy group-hover:text-paw-orange transition-colors">{pet.name}</h3>
                                                    <p className="text-xs text-gray-500 font-bold mb-2">{pet.breed} • {pet.age}</p>
                                                    <p className="text-xs text-gray-600 line-clamp-2">{pet.story}</p>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-black text-paw-orange">
                                                    <span>Meet {pet.name}</span>
                                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Events Section */}
                        {(activeTab === 'all' || activeTab === 'events') && results.events.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-black text-paw-navy flex items-center gap-2">
                                        <Calendar className="text-paw-yellow" size={24} />
                                        Events & Activities ({results.events.length})
                                    </h2>
                                    <Link href="/events" className="text-xs font-black text-paw-orange hover:underline uppercase tracking-wider flex items-center gap-1">
                                        View Calendar <ArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.events.map((ev) => (
                                        <Link
                                            key={ev.id}
                                            href={ev.url}
                                            className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 group flex flex-col"
                                        >
                                            <div className="aspect-[16/9] overflow-hidden relative">
                                                <ImageWithFallback src={ev.img} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                <div className="absolute top-3 left-3 bg-paw-navy text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                                    {ev.category}
                                                </div>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-base font-black text-paw-navy group-hover:text-paw-orange transition-colors mb-1">{ev.title}</h3>
                                                    <p className="text-xs text-paw-orange font-bold mb-1">{ev.date} • {ev.time}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{ev.location}</p>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-black text-paw-navy group-hover:text-paw-orange">
                                                    <span>View Event Details</span>
                                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Articles & Blog */}
                        {(activeTab === 'all' || activeTab === 'articles') && results.articles.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-black text-paw-navy flex items-center gap-2">
                                        <FileText className="text-paw-green" size={24} />
                                        Stories & Articles ({results.articles.length})
                                    </h2>
                                    <Link href="/blog" className="text-xs font-black text-paw-orange hover:underline uppercase tracking-wider flex items-center gap-1">
                                        View Blog <ArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.articles.map((art) => (
                                        <Link
                                            key={art.id}
                                            href={art.url}
                                            className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 group flex flex-col"
                                        >
                                            <div className="aspect-[16/9] overflow-hidden relative">
                                                <ImageWithFallback src={art.featured_image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                <div className="absolute top-3 left-3 bg-paw-green text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                                    {art.category}
                                                </div>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">{art.date}</span>
                                                    <h3 className="text-base font-black text-paw-navy group-hover:text-paw-orange transition-colors mb-2 line-clamp-2">{art.title}</h3>
                                                    <p className="text-xs text-gray-600 line-clamp-2">{art.excerpt}</p>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-black text-paw-navy group-hover:text-paw-orange">
                                                    <span>Read Article</span>
                                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pet Reports */}
                        {(activeTab === 'all' || activeTab === 'reports') && results.reports.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-black text-paw-navy flex items-center gap-2">
                                        <AlertTriangle className="text-red-500" size={24} />
                                        Pet Alerts & Reports ({results.reports.length})
                                    </h2>
                                    <Link href="/missing" className="text-xs font-black text-paw-orange hover:underline uppercase tracking-wider flex items-center gap-1">
                                        Missing Pets Board <ArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.reports.map((rep) => (
                                        <Link
                                            key={rep.id}
                                            href={rep.url}
                                            className="bg-white rounded-3xl p-5 shadow-md hover:shadow-xl transition-all border border-gray-100 flex items-center gap-4 group"
                                        >
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                                                <ImageWithFallback src={rep.photo_url} alt={rep.pet_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                                                        {rep.type}
                                                    </span>
                                                    <span className="text-xs text-gray-400 capitalize">{rep.status}</span>
                                                </div>
                                                <h4 className="text-sm font-black text-paw-navy truncate group-hover:text-paw-orange transition-colors">{rep.pet_name}</h4>
                                                <p className="text-xs text-gray-500 truncate">{rep.location}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

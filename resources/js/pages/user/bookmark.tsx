import React, { useState } from 'react';
import { Bookmark, Trash2, Calendar, MapPin, Heart, ExternalLink } from 'lucide-react';
import { useBookmarks } from '@/context/BookmarkContext';
import { Link } from '@inertiajs/react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

export default function UserBookmarks() {
    const { bookmarks, removeBookmark } = useBookmarks();
    const [activeTab, setActiveTab] = useState<'all' | 'pet' | 'event' | 'missingPet'>('all');

    const filteredBookmarks = bookmarks.filter((item) => {
        if (activeTab === 'all') {
            return true;
        }
        return item.type === activeTab;
    });

    const getTabCount = (type: 'all' | 'pet' | 'event' | 'missingPet') => {
        if (type === 'all') {
            return bookmarks.length;
        }
        return bookmarks.filter((item) => item.type === type).length;
    };

    return (
        <DashboardSectionPage
            title="My Bookmarks"
            description="Access your saved adoptable pets, community events, and missing pet alerts."
            badge={<DashboardMetricBadge icon={<Bookmark className="h-4 w-4" />} label={`${bookmarks.length} Saved`} />}
        >
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-px">
                {(['all', 'pet', 'event', 'missingPet'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all capitalize -mb-px flex items-center gap-1.5 cursor-pointer ${
                            activeTab === tab
                                ? 'border-paw-orange text-paw-orange font-extrabold'
                                : 'border-transparent text-gray-500 hover:text-paw-navy dark:hover:text-white'
                        }`}
                    >
                        {tab === 'all' ? 'All' : tab === 'missingPet' ? 'Missing Alerts' : tab + 's'}
                        <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                activeTab === tab
                                    ? 'bg-paw-orange/10 text-paw-orange'
                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                            }`}
                        >
                            {getTabCount(tab)}
                        </span>
                    </button>
                ))}
            </div>

            {filteredBookmarks.length === 0 ? (
                <DashboardCard className="flex min-h-[18rem] items-center justify-center text-center">
                    <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#94A3B8] dark:bg-[#1E293B]">
                            <Bookmark className="h-9 w-9" strokeWidth={1.75} />
                        </div>
                        <h3 className="mt-5 font-fredoka text-xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            No bookmarks found
                        </h3>
                        <p className="mt-2 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                            {activeTab === 'all'
                                ? 'Start bookmarking pets, events, and more to access them later.'
                                : `You don't have any bookmarked ${activeTab === 'missingPet' ? 'missing alerts' : activeTab + 's'} yet.`}
                        </p>
                    </div>
                </DashboardCard>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredBookmarks.map((item) => (
                        <DashboardCard key={`${item.type}-${item.id}`} className="overflow-hidden flex flex-col h-full p-0">
                            {/* Image Header */}
                            <div className="relative h-44 w-full bg-gray-100 dark:bg-gray-800 shrink-0">
                                {item.image ? (
                                    <ImageWithFallback
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-paw-orange/10 text-paw-orange">
                                        <Bookmark size={40} />
                                    </div>
                                )}
                                <span
                                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white shadow-sm ${
                                        item.type === 'pet'
                                            ? 'bg-paw-coral'
                                            : item.type === 'event'
                                              ? 'bg-paw-blue'
                                              : 'bg-red-500'
                                    }`}
                                >
                                    {item.type === 'pet' ? 'Pet' : item.type === 'event' ? 'Event' : 'Missing Alert'}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white line-clamp-1">
                                        {item.title}
                                    </h3>

                                    {item.type === 'pet' && (
                                        <div className="text-xs font-bold text-gray-500 space-y-1">
                                            <p>
                                                <span className="text-gray-400">Breed:</span> {item.data?.breed || 'Aspin'}
                                            </p>
                                            <p>
                                                <span className="text-gray-400">Age:</span> {item.data?.age || 'Unknown'}
                                            </p>
                                            <p>
                                                <span className="text-gray-400">Gender:</span> {item.data?.gender || 'Unknown'}
                                            </p>
                                        </div>
                                    )}

                                    {item.type === 'event' && (
                                        <div className="text-xs font-bold text-gray-500 space-y-1">
                                            <p className="flex items-center gap-1.5">
                                                <Calendar size={13} className="text-paw-orange shrink-0" />
                                                {item.data?.date} ({item.data?.time})
                                            </p>
                                            <p className="flex items-center gap-1.5 line-clamp-1">
                                                <MapPin size={13} className="text-paw-orange shrink-0" />
                                                {item.data?.location}
                                            </p>
                                        </div>
                                    )}

                                    {item.type === 'missingPet' && (
                                        <div className="text-xs font-bold text-gray-500 space-y-1">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-gray-400">Status:</span>
                                                <span
                                                    className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white ${
                                                        item.data?.status === 'FOUND' ? 'bg-paw-green' : 'bg-red-500'
                                                    }`}
                                                >
                                                    {item.data?.status || 'STILL SEARCHING'}
                                                </span>
                                            </div>
                                            <p className="flex items-center gap-1.5 line-clamp-1">
                                                <MapPin size={13} className="text-paw-orange shrink-0" />
                                                Last seen: {item.data?.lastSeen}
                                            </p>
                                            {item.data?.reward && (
                                                <p>
                                                    <span className="text-paw-orange">Reward:</span> {item.data.reward}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2.5 pt-2">
                                    <Link
                                        href={
                                            item.type === 'pet'
                                                ? '/adopt'
                                                : item.type === 'event'
                                                  ? '/events'
                                                  : '/missing'
                                        }
                                        className="flex-1 py-2 rounded-xl border border-gray-250 dark:border-gray-800 text-[#0B2340] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        View Page <ExternalLink size={12} />
                                    </Link>
                                    <button
                                        onClick={() => removeBookmark(item.id, item.type)}
                                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 dark:bg-red-955 dark:hover:bg-red-950/40 transition-colors shrink-0 cursor-pointer"
                                        title="Remove Bookmark"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </DashboardCard>
                    ))}
                </div>
            )}
        </DashboardSectionPage>
    );
}

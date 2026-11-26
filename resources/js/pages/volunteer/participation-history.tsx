import { Link, router } from '@inertiajs/react';
import { CheckCircle2, Clock, Utensils, Heart, Store } from 'lucide-react';
import { useState } from 'react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { VolunteerFilterBar } from '@/components/volunteer/volunteer-filter-bar';

interface HistoryItem {
    id: number;
    role: string;
    status?: string;
    hours_logged: string | number;
    created_at: string;
    event?: {
        title: string;
        date: string;
    } | null;
    feeding_schedule?: {
        zone: string;
        day: string;
    } | null;
    pet_report?: {
        id: number;
        type?: string | null;
        pet_name?: string | null;
        species?: string | null;
        landmark?: string | null;
    } | null;
    petReport?: {
        id: number;
        type?: string | null;
        pet_name?: string | null;
        species?: string | null;
        landmark?: string | null;
    } | null;
    partner_food_pickup?: {
        id: number;
        pickup_date: string;
        partner?: {
            name: string;
        } | null;
    } | null;
    partnerFoodPickup?: {
        id: number;
        pickup_date: string;
        partner?: {
            name: string;
        } | null;
    } | null;
}

interface ParticipationHistoryProps {
    history: {
        data: HistoryItem[];
        links: any[];
        total: number;
    };
    filters?: {
        search?: string;
        type?: string;
        status?: string;
        sort?: string;
    };
}

export default function VolunteerParticipationHistory({ history, filters }: ParticipationHistoryProps) {
    const historyData = history?.data || [];
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [typeFilter, setTypeFilter] = useState(filters?.type || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [sortOrder, setSortOrder] = useState(filters?.sort || 'latest');

    const applyFilters = (next: Partial<{ search: string; type: string; status: string; sort: string }>) => {
        const params = {
            search: next.search ?? searchQuery,
            type: next.type ?? typeFilter,
            status: next.status ?? statusFilter,
            sort: next.sort ?? sortOrder,
        };

        router.get(
            '/account/volunteer/participation-history',
            {
                ...(params.search.trim() ? { search: params.search.trim() } : {}),
                ...(params.type ? { type: params.type } : {}),
                ...(params.status ? { status: params.status } : {}),
                ...(params.sort && params.sort !== 'latest' ? { sort: params.sort } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setTypeFilter('');
        setStatusFilter('');
        setSortOrder('latest');
        router.get('/account/volunteer/participation-history', {}, { preserveState: true, preserveScroll: true });
    };

    const hasActiveFilters = Boolean(
        filters?.search ||
        filters?.type ||
        filters?.status ||
        (filters?.sort && filters.sort !== 'latest'),
    );

    return (
        <DashboardSectionPage
            title="Participation History"
            description="Review your timeline of completed volunteer tasks, events, and service hours."
            badge={<DashboardMetricBadge icon={<Clock className="h-4 w-4" />} label={`${history?.total || 0} Events`} />}
        >
            <VolunteerFilterBar
                search={searchQuery}
                searchPlaceholder="Search by event, zone, rescue, or role..."
                onSearchChange={setSearchQuery}
                onSearchSubmit={() => applyFilters({})}
                selects={[
                    {
                        value: typeFilter,
                        onChange: (val) => {
                            setTypeFilter(val);
                            applyFilters({ type: val });
                        },
                        ariaLabel: 'Filter by task type',
                        defaultLabel: 'All Types',
                        options: [
                            { value: 'event', label: 'Events' },
                            { value: 'feeding', label: 'Feeding Routes' },
                            { value: 'rescue', label: 'Rescue Cases' },
                            { value: 'food_pickup', label: 'Food Pickups' },
                        ],
                    },
                    {
                        value: statusFilter,
                        onChange: (val) => {
                            setStatusFilter(val);
                            applyFilters({ status: val });
                        },
                        ariaLabel: 'Filter by attendance status',
                        defaultLabel: 'All Statuses',
                        options: [
                            { value: 'completed', label: 'Completed' },
                            { value: 'no_show', label: 'No Show' },
                        ],
                    },
                ]}
                sort={sortOrder}
                onSortChange={(val) => {
                    setSortOrder(val);
                    applyFilters({ sort: val });
                }}
                hasActiveFilters={hasActiveFilters || Boolean(searchQuery.trim() || typeFilter || statusFilter || sortOrder === 'oldest')}
                onReset={handleResetFilters}
            />

            {historyData.length === 0 ? (
                <DashboardCard className="p-8 text-center text-gray-500 font-bold">
                    <CheckCircle2 className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-sm">
                        {hasActiveFilters
                            ? 'No participation records matched your filters.'
                            : "You haven't completed any volunteer tasks yet."}
                    </p>
                    {hasActiveFilters ? (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-paw-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    ) : (
                        <p className="text-xs text-gray-400 mt-1">Once admins verify your participation, they will show up here.</p>
                    )}
                </DashboardCard>
            ) : (
                <div className="flex flex-col gap-3">
                    {historyData.map((item) => {
                        const rescueReport = item.pet_report || item.petReport;
                        const foodPickup = item.partner_food_pickup || item.partnerFoodPickup;
                        const hours = parseFloat(String(item.hours_logged || '0'));

                        const iconWrapperClass = item.event
                            ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-800/50'
                            : rescueReport
                                ? 'bg-rose-50 text-rose-500 ring-1 ring-rose-200/80 dark:bg-rose-950/50 dark:text-rose-400 dark:ring-rose-800/50'
                                : foodPickup
                                    ? 'bg-teal-50 text-teal-600 ring-1 ring-teal-200/80 dark:bg-teal-950/50 dark:text-teal-400 dark:ring-teal-800/50'
                                    : 'bg-amber-50 text-paw-orange ring-1 ring-amber-200/80 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-800/50';

                        return (
                            <DashboardCard key={item.id} className="p-4 sm:p-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
                                        <span className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl ${iconWrapperClass}`}>
                                            {item.event ? (
                                                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                                            ) : rescueReport ? (
                                                <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                                            ) : foodPickup ? (
                                                <Store className="h-5 w-5 sm:h-6 sm:w-6" />
                                            ) : (
                                                <Utensils className="h-5 w-5 sm:h-6 sm:w-6" />
                                            )}
                                        </span>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <h3 className="font-fredoka text-base sm:text-lg font-bold text-[#0B2340] dark:text-white leading-snug">
                                                {item.event
                                                    ? item.event.title
                                                    : rescueReport
                                                        ? `Rescue: ${rescueReport.pet_name || rescueReport.species || `Case #${rescueReport.id}`}`
                                                        : foodPickup
                                                            ? `Daily Food Pickup: ${foodPickup.partner?.name || 'Partner'}`
                                                            : (item.feeding_schedule?.zone || 'Volunteer Mission')}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                                                <span>Role: {item.role}</span>
                                                <span aria-hidden="true">•</span>
                                                {item.status === 'no_show' ? (
                                                    <span className="whitespace-nowrap rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                                        No Show (0.0 hrs)
                                                    </span>
                                                ) : (
                                                    <span className="whitespace-nowrap text-paw-orange font-bold">
                                                        {(isNaN(hours) ? 0 : hours).toFixed(1)} hrs logged
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end pt-2.5 sm:pt-0 border-t border-gray-100 dark:border-gray-800 sm:border-t-0 shrink-0">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 sm:hidden">Date</span>
                                        <time className="text-xs sm:text-sm font-bold text-[#94A3B8] whitespace-nowrap" dateTime={item.created_at}>
                                            {item.event
                                                ? item.event.date
                                                : item.feeding_schedule
                                                    ? item.feeding_schedule.day
                                                    : (item.created_at ? new Date(item.created_at).toLocaleDateString() : '')}
                                        </time>
                                    </div>
                                </div>
                            </DashboardCard>
                        );
                    })}

                    {/* Pagination */}
                    {history.links && history.links.length > 3 && (
                        <div className="flex justify-center gap-1 mt-6">
                            {history.links.map((link, idx) => {
                                if (link.url === null) {
return (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold" dangerouslySetInnerHTML={{ __html: link.label }} />
                                );
}

                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        preserveState
                                        preserveScroll
                                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                            link.active ? 'bg-paw-orange text-white' : 'bg-white text-paw-navy hover:bg-paw-orange/10 border'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </DashboardSectionPage>
    );
}

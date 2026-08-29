import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    BellOff,
    CheckCheck,
    Gift,
    Heart,
    Search,
    Shield,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { NotificationItem } from '@/components/dashboard/notification-item';
import { DashboardCard } from '@/components/dashboard/section-page';
import { useDashboardNotifications } from '@/hooks/use-dashboard-notifications';
import { cn } from '@/lib/utils';

type FilterType =
    | 'all'
    | 'unread'
    | 'adoption'
    | 'rescue'
    | 'donation'
    | 'volunteer'
    | 'system';

export function DashboardNotificationsPage() {
    const {
        notifications,
        unreadCount,
        isRead,
        openNotification,
        markRead,
        markAllRead,
        deleteNotification,
        clearAllRead,
    } = useDashboardNotifications();

    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const categoryCounts = useMemo(() => {
        return {
            all: notifications.length,
            unread: notifications.filter((n) => !isRead(n)).length,
            adoption: notifications.filter(
                (n) => n.icon === 'adoption' || n.category === 'adoption',
            ).length,
            rescue: notifications.filter(
                (n) => n.icon === 'rescue' || n.category === 'rescue',
            ).length,
            donation: notifications.filter(
                (n) => n.icon === 'donation' || n.category === 'donation',
            ).length,
            volunteer: notifications.filter(
                (n) =>
                    n.icon === 'volunteer' ||
                    n.icon === 'task' ||
                    n.icon === 'certificate' ||
                    n.category === 'volunteer',
            ).length,
            system: notifications.filter(
                (n) => n.icon === 'system' || n.icon === 'ai' || n.category === 'system',
            ).length,
        };
    }, [notifications, isRead]);

    const filtered = useMemo(() => {
        return notifications.filter((notification) => {
            const read = isRead(notification);

            if (filter === 'unread' && read) {
                return false;
            }
            if (
                filter === 'adoption' &&
                notification.icon !== 'adoption' &&
                notification.category !== 'adoption'
            ) {
                return false;
            }
            if (
                filter === 'rescue' &&
                notification.icon !== 'rescue' &&
                notification.category !== 'rescue'
            ) {
                return false;
            }
            if (
                filter === 'donation' &&
                notification.icon !== 'donation' &&
                notification.category !== 'donation'
            ) {
                return false;
            }
            if (
                filter === 'volunteer' &&
                notification.icon !== 'volunteer' &&
                notification.icon !== 'task' &&
                notification.icon !== 'certificate' &&
                notification.category !== 'volunteer'
            ) {
                return false;
            }
            if (
                filter === 'system' &&
                notification.icon !== 'system' &&
                notification.icon !== 'ai' &&
                notification.category !== 'system'
            ) {
                return false;
            }

            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                const titleMatch = notification.title.toLowerCase().includes(query);
                const descMatch = notification.description.toLowerCase().includes(query);

                return titleMatch || descMatch;
            }

            return true;
        });
    }, [filter, isRead, notifications, searchQuery]);

    const readCount = notifications.filter((n) => isRead(n)).length;

    const filterTabs: Array<{
        id: FilterType;
        label: string;
        icon?: typeof Heart;
        spanClass?: string;
    }> = [
        { id: 'all', label: 'All' },
        { id: 'unread', label: 'Unread' },
        { id: 'adoption', label: 'Adoptions', icon: Heart },
        { id: 'rescue', label: 'Rescues', icon: AlertCircle },
        { id: 'donation', label: 'Donations', icon: Gift },
        { id: 'volunteer', label: 'Volunteers', icon: Users },
        {
            id: 'system',
            label: 'System',
            icon: Shield,
            spanClass: 'col-span-2 sm:col-span-2 lg:col-span-1',
        },
    ];

    return (
        <>
            <Head title="Notifications" />

            <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="font-fredoka text-3xl font-bold tracking-tight text-[#0B2340] dark:text-[#F8FAFC]">
                                Notifications
                            </h2>
                            {unreadCount > 0 && (
                                <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                            Stay informed on pet adoptions, rescue missions, donations, and updates.
                        </p>
                    </div>

                    {/* Header Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllRead}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-bold text-[#0B2340] shadow-xs transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 dark:border-[#1E293B] dark:bg-[#111827] dark:text-[#F8FAFC] dark:hover:bg-[#1E293B]"
                            >
                                <CheckCheck className="h-4 w-4 text-[var(--dashboard-primary)]" />
                                Mark all as read
                            </button>
                        )}
                        {readCount > 0 && (
                            <button
                                type="button"
                                onClick={clearAllRead}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 shadow-xs transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Clear read
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter and Search Bar Section */}
                <div className="flex flex-col gap-3">
                    {/* Search Bar */}
                    <div className="relative w-full">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notifications by title or description..."
                            className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-10 pr-10 py-2.5 text-sm font-semibold text-[#0B2340] placeholder:text-[#94A3B8] placeholder:font-normal focus:border-[var(--dashboard-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--dashboard-ring)]/30 dark:border-[#1E293B] dark:bg-[#111827] dark:text-[#F8FAFC]"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Category Filter Tabs spanning full maximum width */}
                    <div
                        className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7"
                        role="group"
                        aria-label="Filter notifications by category"
                    >
                        {filterTabs.map((tab) => {
                            const active = filter === tab.id;
                            const count = categoryCounts[tab.id] ?? 0;
                            const IconComponent = tab.icon;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => setFilter(tab.id)}
                                    className={cn(
                                        'flex w-full min-w-0 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50',
                                        tab.spanClass,
                                        active
                                            ? 'bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] text-white shadow-[0_4px_16px_var(--dashboard-primary-shadow)]'
                                            : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0B2340] dark:border-[#1E293B] dark:bg-[#111827] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]',
                                    )}
                                >
                                    {IconComponent && (
                                        <IconComponent className="h-3.5 w-3.5 shrink-0" />
                                    )}
                                    <span className="truncate">{tab.label}</span>
                                    {count > 0 && (
                                        <span
                                            className={cn(
                                                'ml-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none',
                                                active
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8]',
                                            )}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Notifications List Container */}
                <DashboardCard className="overflow-hidden !p-0 shadow-sm border border-[#E5E7EB] dark:border-[#1E293B]">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#94A3B8] dark:bg-[#1E293B] dark:text-[#64748B]">
                                <BellOff className="h-8 w-8" />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                {searchQuery
                                    ? 'No matching notifications'
                                    : 'No notifications to display'}
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-[#64748B] dark:text-[#94A3B8]">
                                {searchQuery
                                    ? `No results found for "${searchQuery}". Try adjusting your keywords or clearing the filter.`
                                    : "You're all caught up! When updates or alerts arrive, they'll appear here."}
                            </p>
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-xs font-bold text-[#0B2340] hover:bg-[#F8FAFC] dark:border-[#1E293B] dark:bg-[#111827] dark:text-[#F8FAFC]"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]/60">
                            {filtered.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    read={isRead(notification)}
                                    onSelect={openNotification}
                                    onMarkRead={markRead}
                                    onDelete={deleteNotification}
                                />
                            ))}
                        </div>
                    )}
                </DashboardCard>
            </div>
        </>
    );
}

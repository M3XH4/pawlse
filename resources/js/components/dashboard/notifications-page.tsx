import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { NotificationItem } from '@/components/dashboard/notification-item';
import { DashboardCard } from '@/components/dashboard/section-page';
import { useDashboardNotifications } from '@/hooks/use-dashboard-notifications';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'unread' | 'read';

export function DashboardNotificationsPage() {
    const { notifications, isRead, openNotification, markAllRead } = useDashboardNotifications();
    const [filter, setFilter] = useState<Filter>('all');

    const filtered = useMemo(() => {
        return notifications.filter((notification) => {
            const read = isRead(notification);

            if (filter === 'unread') {
                return !read;
            }

            if (filter === 'read') {
                return read;
            }

            return true;
        });
    }, [filter, isRead, notifications]);

    return (
        <>
            <Head title="Notifications" />

            <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-6">
                <div>
                    <h2 className="font-fredoka text-3xl font-bold tracking-tight text-[#0B2340] dark:text-[#F8FAFC]">
                        Notifications
                    </h2>
                    <p className="mt-2 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                        Stay up to date with dashboard alerts and activity.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div
                        className="flex flex-wrap gap-2"
                        role="group"
                        aria-label="Filter notifications"
                    >
                        {(['all', 'unread', 'read'] as const).map((value) => {
                            const active = filter === value;

                            return (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => setFilter(value)}
                                    className={cn(
                                        'min-h-11 rounded-xl px-4 py-2 text-sm font-semibold capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50',
                                        active
                                            ? 'bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] text-white shadow-[0_4px_16px_var(--dashboard-primary-shadow)]'
                                            : 'bg-[#F1F5F9] text-[#64748B] transition-colors hover:bg-[#E5E7EB] dark:bg-[#1E293B] dark:text-[#94A3B8] dark:hover:bg-[#334155]',
                                    )}
                                >
                                    {value}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={markAllRead}
                        className="min-h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#0B2340] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 dark:border-[#1E293B] dark:bg-[#111827] dark:text-[#F8FAFC] dark:hover:bg-[#1E293B]"
                    >
                        Mark all as read
                    </button>
                </div>

                <DashboardCard className="overflow-hidden !p-0">
                    {filtered.length === 0 ? (
                        <div className="px-5 py-10 text-center text-sm text-[#64748B] dark:text-[#94A3B8]">
                            No notifications to show.
                        </div>
                    ) : (
                        filtered.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                read={isRead(notification)}
                                onSelect={openNotification}
                            />
                        ))
                    )}
                </DashboardCard>
            </div>
        </>
    );
}

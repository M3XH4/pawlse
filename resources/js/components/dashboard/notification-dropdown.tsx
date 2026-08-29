import { Link } from '@inertiajs/react';
import { BellOff, X } from 'lucide-react';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { NotificationItem } from '@/components/dashboard/notification-item';
import { useDashboardNotifications } from '@/hooks/use-dashboard-notifications';

export function NotificationDropdown({
    id,
    open,
    onClose,
}: {
    id: string;
    open: boolean;
    onClose: () => void;
}) {
    const { notificationsHref } = useDashboard();
    const {
        notifications,
        unreadCount,
        isRead,
        openNotification,
        markRead,
        markAllRead,
        deleteNotification,
    } = useDashboardNotifications();

    const preview = notifications.slice(0, 5);

    if (!open) {
        return null;
    }

    return (
        <div
            id={id}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,24rem)] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:border-[#1E293B] dark:bg-[#111827] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:w-[24rem]"
            role="dialog"
            aria-label="Notifications"
        >
            <div className="flex items-start justify-between border-b border-[#F1F5F9] px-5 pt-4 pb-3 dark:border-[#1E293B]">
                <div>
                    <h2 className="text-base font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                        Notifications
                    </h2>
                    <p className="mt-0.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                        {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC] sm:hidden"
                    aria-label="Close notifications"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="max-h-[min(26rem,65vh)] overflow-y-auto">
                {preview.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                            <BellOff className="h-6 w-6" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-[#0B2340] dark:text-[#F8FAFC]">
                            No notifications yet
                        </p>
                        <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                            We'll notify you when important updates happen.
                        </p>
                    </div>
                ) : (
                    preview.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            read={isRead(notification)}
                            onSelect={(n) => {
                                openNotification(n);
                                onClose();
                            }}
                            onMarkRead={markRead}
                            onDelete={deleteNotification}
                        />
                    ))
                )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#F1F5F9] bg-[#F8FAFC]/60 px-5 py-3 dark:border-[#1E293B] dark:bg-[#0B132B]/40">
                <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-semibold text-[var(--dashboard-primary)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50"
                >
                    Mark all as read
                </button>
                <Link
                    href={notificationsHref}
                    onClick={onClose}
                    className="text-xs font-semibold text-[#64748B] transition-colors hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
                >
                    View all notifications →
                </Link>
            </div>
        </div>
    );
}

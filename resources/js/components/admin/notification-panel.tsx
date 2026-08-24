import { Link } from '@inertiajs/react';
import { AdminNotificationItem } from '@/components/admin/notification-item';
import { useAdminNotifications } from '@/hooks/use-admin-notifications';
import { notifications as notificationsRoute } from '@/routes/account/admin';
import { X } from 'lucide-react';

export function AdminNotificationPanel({
    id,
    open,
    onClose,
}: {
    id: string;
    open: boolean;
    onClose: () => void;
}) {
    const { notifications, unreadCount, isRead, markRead, markAllRead } =
        useAdminNotifications();
    const preview = notifications.slice(0, 4);

    if (!open) {
        return null;
    }

    return (
        <div
            id={id}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,22.5rem)] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:border-[#1E293B] dark:bg-[#111827] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:w-[22.5rem]"
            role="dialog"
            aria-label="Notifications"
        >
            <div className="flex items-start justify-between px-5 pt-4 pb-3">
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
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]/50 dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC] sm:hidden"
                    aria-label="Close notifications"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
                {preview.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-[#64748B] dark:text-[#94A3B8]">
                        No notifications to show.
                    </div>
                ) : (
                    preview.map((notification) => (
                        <AdminNotificationItem
                            key={notification.id}
                            notification={notification}
                            read={isRead(notification)}
                            onSelect={markRead}
                        />
                    ))
                )}
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-3">
                <button
                    type="button"
                    onClick={markAllRead}
                    className="text-sm font-semibold text-[#FF8A00] transition-colors hover:text-[#EA580C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]/50"
                >
                    Mark all as read
                </button>
                <Link
                    href={notificationsRoute.url()}
                    onClick={onClose}
                    className="text-sm font-medium text-[#64748B] transition-colors hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]/50 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
                >
                    View all
                </Link>
            </div>
        </div>
    );
}

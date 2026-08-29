import {
    AlertCircle,
    Award,
    Calendar,
    Check,
    ClipboardList,
    Gift,
    Heart,
    Shield,
    Sparkles,
    Trash2,
    User,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { DashboardNotification, DashboardNotificationIcon } from '@/types/dashboard';

const iconStyles: Record<DashboardNotificationIcon, { badge: string; text: string }> = {
    rescue: {
        badge: 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40',
        text: 'text-rose-600 dark:text-rose-400',
    },
    adoption: {
        badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40',
        text: 'text-emerald-600 dark:text-emerald-400',
    },
    ai: {
        badge: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40',
        text: 'text-indigo-600 dark:text-indigo-400',
    },
    donation: {
        badge: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40',
        text: 'text-amber-600 dark:text-amber-400',
    },
    volunteer: {
        badge: 'bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40',
        text: 'text-teal-600 dark:text-teal-400',
    },
    event: {
        badge: 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40',
        text: 'text-purple-600 dark:text-purple-400',
    },
    task: {
        badge: 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40',
        text: 'text-blue-600 dark:text-blue-400',
    },
    certificate: {
        badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400 border border-yellow-200/60 dark:border-yellow-800/40',
        text: 'text-yellow-700 dark:text-yellow-400',
    },
    system: {
        badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50',
        text: 'text-slate-600 dark:text-slate-300',
    },
};

const icons: Record<DashboardNotificationIcon, ReactNode> = {
    rescue: <AlertCircle className="h-4 w-4" />,
    adoption: <Heart className="h-4 w-4" />,
    ai: <Sparkles className="h-4 w-4" />,
    donation: <Gift className="h-4 w-4" />,
    volunteer: <User className="h-4 w-4" />,
    event: <Calendar className="h-4 w-4" />,
    task: <ClipboardList className="h-4 w-4" />,
    certificate: <Award className="h-4 w-4" />,
    system: <Shield className="h-4 w-4" />,
};

export function NotificationItem({
    notification,
    read,
    onSelect,
    onMarkRead,
    onDelete,
    compact = false,
}: {
    notification: DashboardNotification;
    read: boolean;
    onSelect: (notification: DashboardNotification) => void;
    onMarkRead?: (notification: DashboardNotification) => void;
    onDelete?: (notification: DashboardNotification) => void;
    compact?: boolean;
}) {
    const iconConfig = iconStyles[notification.icon] ?? iconStyles.system;
    const iconEl = icons[notification.icon] ?? icons.system;

    return (
        <div
            className={cn(
                'group relative flex items-start justify-between gap-3 border-b border-[#F1F5F9] px-5 py-4 transition-colors hover:bg-[#F8FAFC] dark:border-[#1E293B]/60 dark:hover:bg-[#1E293B]/40',
                !read && 'bg-orange-50/20 dark:bg-orange-950/10',
                read && 'opacity-75 hover:opacity-100',
            )}
        >
            <button
                type="button"
                onClick={() => onSelect(notification)}
                className="flex flex-1 items-start gap-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 rounded-xl"
            >
                <span
                    className={cn(
                        'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs',
                        iconConfig.badge,
                    )}
                >
                    {iconEl}
                </span>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p
                            className={cn(
                                'text-sm font-semibold text-[#0B2340] dark:text-[#F8FAFC]',
                                !read && 'font-bold',
                            )}
                        >
                            {notification.title}
                        </p>
                        {!read && (
                            <span
                                className="h-2 w-2 shrink-0 rounded-full bg-[var(--dashboard-primary)] shadow-xs animate-pulse"
                                aria-label="Unread notification"
                            />
                        )}
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                        {notification.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-[#94A3B8]">
                        <span className="font-medium">{notification.time}</span>
                        {notification.category && (
                            <>
                                <span>•</span>
                                <span className={cn('font-semibold capitalize', iconConfig.text)}>
                                    {notification.category}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </button>

            {/* Actions */}
            {!compact && (
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    {!read && onMarkRead && (
                        <button
                            type="button"
                            title="Mark as read"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkRead(notification);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-white hover:text-[#0B2340] hover:shadow-xs dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]"
                        >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Mark as read</span>
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            title="Delete notification"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(notification);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-rose-50 hover:text-rose-600 dark:text-[#94A3B8] dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

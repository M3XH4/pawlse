import {
    Award,
    Calendar,
    ClipboardList,
    FileText,
    Gift,
    Heart,
    Shield,
    Sparkles,
    User,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { DashboardNotification, DashboardNotificationIcon } from '@/types/dashboard';

const iconStyles: Record<DashboardNotificationIcon, string> = {
    rescue: 'bg-[#FDE8EC] text-[#E11D48] dark:bg-[#4C0519] dark:text-[#FB7185]',
    adoption: 'bg-[#DCFCE7] text-[#16A34A] dark:bg-[#052E16] dark:text-[#4ADE80]',
    ai: 'bg-[#DBEAFE] text-[#2563EB] dark:bg-[#172554] dark:text-[#60A5FA]',
    donation: 'bg-[#FFEDD5] text-[#EA580C] dark:bg-[#431407] dark:text-[#FB923C]',
    volunteer: 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8]',
    event: 'bg-[#F3E8FF] text-[#7C3AED] dark:bg-[#2E1065] dark:text-[#C4B5FD]',
    task: 'bg-[#DBEAFE] text-[#2563EB] dark:bg-[#172554] dark:text-[#60A5FA]',
    certificate: 'bg-[#FEF3C7] text-[#D97706] dark:bg-[#451A03] dark:text-[#FBBF24]',
    system: 'bg-[#F3E8FF] text-[#7C3AED] dark:bg-[#2E1065] dark:text-[#C4B5FD]',
};

const icons: Record<DashboardNotificationIcon, ReactNode> = {
    rescue: <FileText className="h-4 w-4" />,
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
}: {
    notification: DashboardNotification;
    read: boolean;
    onSelect: (notification: DashboardNotification) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(notification)}
            className={cn(
                'notification-item block w-full px-5 py-3.5 text-left transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--dashboard-ring)]/50 dark:hover:bg-[#1E293B]',
                read && 'opacity-70',
            )}
        >
            <div className="flex items-start gap-3">
                <span
                    className={cn(
                        'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        iconStyles[notification.icon],
                    )}
                >
                    {icons[notification.icon]}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0B2340] dark:text-[#F8FAFC]">
                        {notification.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug text-[#64748B] dark:text-[#94A3B8]">
                        {notification.description}
                    </p>
                    <p className="mt-1 text-xs text-[#94A3B8]">{notification.time}</p>
                </div>
                {!read ? (
                    <span
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--dashboard-primary)]"
                        aria-label="Unread"
                    />
                ) : (
                    <span className="sr-only">Read</span>
                )}
            </div>
        </button>
    );
}

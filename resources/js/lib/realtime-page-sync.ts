import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { playNotificationChime } from '@/lib/notification-chime';

export interface RealtimeAppEvent {
    id: string;
    domain: 'adoption' | 'rescue' | 'donation' | 'volunteer' | 'foster' | 'general';
    action: string;
    title: string;
    message: string;
    payload?: Record<string, unknown>;
    timestamp?: number;
}

let reloadTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedReload(): void {
    if (reloadTimer) {
        clearTimeout(reloadTimer);
    }

    reloadTimer = setTimeout(() => {
        router.reload();
    }, 250);
}

/**
 * Evaluates incoming real-time application domain events (e.g. adoptions, rescues,
 * donations, volunteer applications/tasks) and automatically triggers background
 * Inertia page reloads for affected active views.
 */
export function handleRealtimeAppEvent(event: RealtimeAppEvent): void {
    if (typeof window === 'undefined') {
        return;
    }

    const pathname = window.location.pathname;

    const shouldReload =
        // 1. Overview dashboards reload on all system activity to update live stats and recent activity timelines
        pathname === '/account/admin/dashboard' ||
        pathname === '/account/super-admin/dashboard' ||
        // 2. Adoption domain matching
        (event.domain === 'adoption' &&
            (pathname.includes('/admin/adoption-management') ||
                pathname.includes('/user/adoption-applications'))) ||
        // 3. Rescue & Incident domain matching
        (event.domain === 'rescue' &&
            (pathname.includes('/admin/rescue-management') ||
                pathname.includes('/admin/animal-records') ||
                pathname.includes('/user/rescue-reports') ||
                pathname.includes('/volunteer/rescue-reports'))) ||
        // 4. Donation domain matching
        (event.domain === 'donation' &&
            (pathname.includes('/admin/donation-monitoring') ||
                pathname.includes('/user/donations'))) ||
        // 5. Volunteer domain matching
        (event.domain === 'volunteer' &&
            (pathname.includes('/admin/volunteer-management') ||
                pathname.includes('/user/volunteer-status') ||
                pathname.includes('/volunteer/assigned-tasks') ||
                pathname.includes('/volunteer/status') ||
                pathname.includes('/volunteer/profile'))) ||
        // 6. Foster care domain matching
        (event.domain === 'foster' &&
            (pathname.includes('/admin/foster-management') ||
                pathname.includes('/volunteer/foster-care') ||
                pathname.includes('/admin/my-foster-pets')));

    if (shouldReload) {
        debouncedReload();
        playNotificationChime();
        toast.info(event.title, {
            description: event.message,
            duration: 4500,
        });
    }
}

import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BookmarkProvider } from '@/context/BookmarkContext';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import UserLayout from '@/layouts/user-layout';
import VolunteerLayout from '@/layouts/volunteer-layout';
import AuthSplitLayout from './layouts/auth/auth-split-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const NULL_PAGES = new Set([
    'welcome',
    'about',
    'adopt',
    'rescue',
    'donate',
    'volunteer',
    'events',
    'missing',
    'sos',
    'not-found',
    'login',
    'checkout',
]);

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case NULL_PAGES.has(name):
                return null;
            case name.startsWith('user/'):
                return UserLayout;
            case name.startsWith('volunteer/'):
                return VolunteerLayout;
            case name.startsWith('super-admin/'):
                return SuperAdminLayout;
            case name.startsWith('admin/'):
                return AdminLayout;
            case name.startsWith('auth/'):
                return AuthSplitLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <BookmarkProvider>
                <TooltipProvider delayDuration={0}>
                    {app}
                    <Toaster />
                </TooltipProvider>
            </BookmarkProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

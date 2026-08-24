import type { DashboardTheme } from '@/types/dashboard';

export const dashboardThemes: Record<
    DashboardTheme,
    {
        primary: 'green' | 'blue' | 'teal' | 'purple';
        brandLabel: string;
        roleLabel: string;
        fallbackName: string;
    }
> = {
    user: {
        primary: 'green',
        brandLabel: 'User',
        roleLabel: 'User',
        fallbackName: 'User',
    },
    volunteer: {
        primary: 'blue',
        brandLabel: 'Volunteer',
        roleLabel: 'Volunteer',
        fallbackName: 'Volunteer',
    },
    admin: {
        primary: 'teal',
        brandLabel: 'Admin',
        roleLabel: 'Administrator',
        fallbackName: 'Admin',
    },
    'super-admin': {
        primary: 'purple',
        brandLabel: 'Super Admin',
        roleLabel: 'Super Admin',
        fallbackName: 'Admin',
    },
};

import { createContext, useContext } from 'react';
import type { DashboardNavItem, DashboardTheme } from '@/types/dashboard';

export type DashboardContextValue = {
    theme: DashboardTheme;
    brandLabel: string;
    roleLabel: string;
    navItems: DashboardNavItem[];
    notificationsHref: string;
};

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard(): DashboardContextValue {
    const context = useContext(DashboardContext);

    if (!context) {
        throw new Error('useDashboard must be used within a dashboard layout.');
    }

    return context;
}

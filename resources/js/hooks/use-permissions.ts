import { usePage } from '@inertiajs/react';
import type { Auth, User } from '@/types/auth';

interface SharedProps {
    auth: Auth;
    [key: string]: unknown;
}

export function usePermissions() {
    const page = usePage<SharedProps>();
    const user: User | null = page.props?.auth?.user ?? null;

    const isSuperAdmin = user?.role === 'super-admin' || (user?.roles && user.roles.includes('super-admin'));

    const can = (permission: string): boolean => {
        if (!user) return false;
        if (isSuperAdmin) return true;
        if (!user.permissions || !Array.isArray(user.permissions)) return false;
        return user.permissions.includes(permission);
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        if (!user) return false;
        if (isSuperAdmin) return true;
        return permissions.some((perm) => can(perm));
    };

    const hasRole = (role: string): boolean => {
        if (!user) return false;
        if (user.role === role) return true;
        return Boolean(user.roles && user.roles.includes(role));
    };

    return {
        user,
        isSuperAdmin,
        can,
        hasAnyPermission,
        hasRole,
    };
}

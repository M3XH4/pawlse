import { ReactNode } from 'react';
import { AdminCard } from '@/components/admin/card';

export function AdminPageShell({
    title,
    description = 'This section is ready for admin content.',
    children,
}: {
    title: string;
    description?: string;
    children?: ReactNode;
}) {
    if (!children) {
        return (
            <AdminCard title={title}>
                <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">{description}</p>
            </AdminCard>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-paw-navy dark:text-white">{title}</h1>
                {description && <p className="text-gray-500 dark:text-gray-450">{description}</p>}
            </div>
            {children}
        </div>
    );
}

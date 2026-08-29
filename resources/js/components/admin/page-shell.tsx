import { ReactNode } from 'react';
import { AdminCard } from '@/components/admin/card';

export function AdminPageShell({
    title,
    description = 'Manage and monitor administrative operations across the platform.',
    children,
}: {
    title: string;
    description?: string;
    children?: ReactNode;
}) {
    if (!children) {
        return (
            <AdminCard title={title}>
                <p className="mt-2 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">{description}</p>
            </AdminCard>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-fredoka text-3xl font-bold tracking-tight text-[#0B2340] dark:text-[#F8FAFC]">{title}</h1>
                {description && <p className="mt-2 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">{description}</p>}
            </div>
            {children}
        </div>
    );
}

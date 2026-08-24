import { AdminCard } from '@/components/admin/card';

export function AdminPageShell({
    title,
    description = 'This section is ready for admin content.',
}: {
    title: string;
    description?: string;
}) {
    return (
        <AdminCard title={title}>
            <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">{description}</p>
        </AdminCard>
    );
}

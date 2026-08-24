import { Head } from '@inertiajs/react';
import { AdminCard } from '@/components/admin/card';

export default function AdminDashboard() {
    return (
        <>
            <Head title="Dashboard Overview" />
            <AdminCard title="Dashboard Overview">
                <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Welcome to the Pawlse admin dashboard.
                </p>
            </AdminCard>
        </>
    );
}

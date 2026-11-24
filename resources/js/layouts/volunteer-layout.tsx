import { lazy, Suspense } from 'react';

const DashboardLayout = lazy(() => import('@/layouts/dashboard-layout'));

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <DashboardLayout theme="volunteer">{children}</DashboardLayout>
        </Suspense>
    );
}

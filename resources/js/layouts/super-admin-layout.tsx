import { lazy, Suspense } from 'react';

const DashboardLayout = lazy(() => import('@/layouts/dashboard-layout'));

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <DashboardLayout theme="super-admin">{children}</DashboardLayout>
        </Suspense>
    );
}

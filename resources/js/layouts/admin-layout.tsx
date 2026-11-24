import { lazy, Suspense } from 'react';

const DashboardLayout = lazy(() => import('@/layouts/dashboard-layout'));

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <DashboardLayout theme="admin">{children}</DashboardLayout>
        </Suspense>
    );
}

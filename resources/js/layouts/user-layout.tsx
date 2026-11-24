import { lazy, Suspense } from 'react';

const DashboardLayout = lazy(() => import('@/layouts/dashboard-layout'));

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <DashboardLayout theme="user">{children}</DashboardLayout>
        </Suspense>
    );
}

import DashboardLayout from '@/layouts/dashboard-layout';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout theme="super-admin">{children}</DashboardLayout>;
}

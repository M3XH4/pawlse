import DashboardLayout from '@/layouts/dashboard-layout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout theme="admin">{children}</DashboardLayout>;
}

import DashboardLayout from '@/layouts/dashboard-layout';

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout theme="user">{children}</DashboardLayout>;
}

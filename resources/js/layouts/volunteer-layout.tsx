import DashboardLayout from '@/layouts/dashboard-layout';

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout theme="volunteer">{children}</DashboardLayout>;
}

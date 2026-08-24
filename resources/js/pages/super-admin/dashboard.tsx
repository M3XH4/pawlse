import { Head } from '@inertiajs/react';
import { Activity, FileText, Shield, Users } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/section-page';

const metrics = [
    {
        label: 'Total Users',
        value: '1,247',
        trend: '+12%',
        icon: Users,
        color: 'bg-[#3B82F6]',
    },
    {
        label: 'Total Admins',
        value: '3',
        trend: '+2',
        icon: Shield,
        color: 'bg-[var(--dashboard-primary)]',
    },
    {
        label: 'Active Rescues',
        value: '45',
        trend: '+8%',
        icon: FileText,
        color: 'bg-[#FF6B00]',
    },
    {
        label: 'System Uptime',
        value: '99.9%',
        trend: 'Stable',
        icon: Activity,
        color: 'bg-[#22C55E]',
    },
];

export default function SuperAdminDashboard() {
    return (
        <>
            <Head title="Super Admin Dashboard" />

            <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-6">
                <div>
                    <h2 className="font-fredoka text-3xl font-bold tracking-tight text-[#0B2340] dark:text-[#F8FAFC] sm:text-4xl">
                        Super Admin Dashboard
                    </h2>
                    <p className="mt-2 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                        System-wide control and monitoring
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => {
                        const Icon = metric.icon;

                        return (
                            <DashboardCard key={metric.label}>
                                <div className="flex items-start justify-between gap-4">
                                    <span
                                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white ${metric.color}`}
                                    >
                                        <Icon className="h-7 w-7" strokeWidth={1.9} />
                                    </span>
                                    <span className="text-sm font-bold text-[#16A34A]">
                                        {metric.trend}
                                    </span>
                                </div>
                                <p className="mt-6 font-fredoka text-3xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                    {metric.value}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                    {metric.label}
                                </p>
                            </DashboardCard>
                        );
                    })}
                </div>

                <DashboardCard>
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <h3 className="font-fredoka text-2xl font-bold uppercase text-[#0B2340] dark:text-[#F8FAFC]">
                            System Activity Overview
                        </h3>
                    </div>
                    <div className="relative h-72 overflow-hidden rounded-xl border border-[#E5E7EB] bg-gradient-to-b from-[#EFF6FF] to-white dark:border-[#1E293B] dark:from-[#172554] dark:to-[#111827]">
                        <div className="absolute inset-x-8 bottom-8 top-8 grid grid-rows-4 border-l border-b border-[#CBD5E1] text-xs text-[#64748B] dark:border-[#334155]">
                            {[1400, 1050, 700, 350].map((tick) => (
                                <div key={tick} className="relative border-t border-dashed border-[#E5E7EB] dark:border-[#334155]">
                                    <span className="absolute -left-12 -top-2">{tick}</span>
                                </div>
                            ))}
                        </div>
                        <div className="absolute inset-x-12 bottom-12 h-32 rounded-t-[50%] bg-gradient-to-t from-[var(--dashboard-primary)]/20 to-[#3B82F6]/30" />
                        <div className="absolute inset-x-12 bottom-32 h-0.5 rotate-[-3deg] rounded-full bg-[#3B82F6]" />
                        <div className="absolute inset-x-12 bottom-16 h-0.5 rotate-[-1deg] rounded-full bg-[var(--dashboard-primary)]" />
                        <div className="absolute inset-x-12 bottom-3 flex justify-between text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month) => (
                                <span key={month}>{month}</span>
                            ))}
                        </div>
                    </div>
                </DashboardCard>
            </div>
        </>
    );
}

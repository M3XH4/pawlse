import { ShieldCheck } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function SuperAdminSecurityAccess() {
    return (
        <DashboardSectionPage
            title="Security & Access"
            description="Review role access, account security, and privileged operations"
            badge={<DashboardMetricBadge icon={<ShieldCheck className="h-4 w-4" />} label="Secure" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Security checks and access controls will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

import { Users } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function SuperAdminManagement() {
    return (
        <DashboardSectionPage
            title="Admin Management"
            description="Manage administrator accounts, roles, access permissions, and operational assignments."
            badge={<DashboardMetricBadge icon={<Users className="h-4 w-4" />} label="3 Admins" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Admin account controls and permission summaries will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

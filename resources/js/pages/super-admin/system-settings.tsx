import { Settings } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function SuperAdminSystemSettings() {
    return (
        <DashboardSectionPage
            title="System Settings"
            description="Configure global PAWLSE dashboard behavior"
            badge={<DashboardMetricBadge icon={<Settings className="h-4 w-4" />} label="Settings" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Global system settings and dashboard preferences will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

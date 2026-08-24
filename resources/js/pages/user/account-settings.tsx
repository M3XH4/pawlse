import { Settings } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function UserAccountSettings() {
    return (
        <DashboardSectionPage
            title="Account Settings"
            description="Manage your PAWLSE account preferences"
            badge={<DashboardMetricBadge icon={<Settings className="h-4 w-4" />} label="Profile" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Account profile, security, and notification preferences can be managed here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

import { Archive } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function SuperAdminArchives() {
    return (
        <DashboardSectionPage
            title="Archives"
            description="Access archived operational and administrative records"
            badge={<DashboardMetricBadge icon={<Archive className="h-4 w-4" />} label="Archive" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Archived dashboard records and restore workflows will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

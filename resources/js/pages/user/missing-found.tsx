import { Search } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function UserMissingFoundReports() {
    return (
        <DashboardSectionPage
            title="Missing/Found Reports"
            description="Keep track of missing and found pet reports"
            badge={<DashboardMetricBadge icon={<Search className="h-4 w-4" />} label="0 Reports" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Missing and found reports tied to your account will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

import { FileText } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function UserRescueReports() {
    return (
        <DashboardSectionPage
            title="My Rescue Reports"
            description="Track the rescue reports you have submitted"
            badge={<DashboardMetricBadge icon={<FileText className="h-4 w-4" />} label="0 Reports" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Submitted rescue reports will appear here with their latest review status.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

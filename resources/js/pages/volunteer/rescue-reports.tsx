import { FileText } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function VolunteerRescueReports() {
    return (
        <DashboardSectionPage
            title="My Rescue Reports"
            description="Track rescue reports connected to your volunteer work"
            badge={<DashboardMetricBadge icon={<FileText className="h-4 w-4" />} label="0 Reports" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Rescue reports assigned to or submitted by you will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

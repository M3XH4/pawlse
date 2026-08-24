import { ClipboardList } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function VolunteerAssignedTasks() {
    return (
        <DashboardSectionPage
            title="Assigned Tasks"
            description="See your active volunteer assignments"
            badge={<DashboardMetricBadge icon={<ClipboardList className="h-4 w-4" />} label="0 Tasks" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Assigned rescue, feeding, and event tasks will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

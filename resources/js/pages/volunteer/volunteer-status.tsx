import { Zap } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function VolunteerStatus() {
    return (
        <DashboardSectionPage
            title="Volunteer Status"
            description="Track your onboarding and activity standing"
            badge={<DashboardMetricBadge icon={<Zap className="h-4 w-4" />} label="Active" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Your volunteer status, approvals, and next steps will be shown here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

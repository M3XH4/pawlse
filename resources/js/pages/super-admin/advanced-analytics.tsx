import { BarChart3 } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function SuperAdminAdvancedAnalytics() {
    return (
        <DashboardSectionPage
            title="Advanced Analytics"
            description="Review system-wide performance, adoption, rescue, and engagement trends"
            badge={<DashboardMetricBadge icon={<BarChart3 className="h-4 w-4" />} label="Analytics" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Cross-dashboard analytics and operational trends will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

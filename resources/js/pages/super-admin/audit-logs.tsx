import { FileSearch } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function SuperAdminAuditLogs() {
    return (
        <DashboardSectionPage
            title="Audit Logs"
            description="Monitor sensitive system actions and administrative changes"
            badge={<DashboardMetricBadge icon={<FileSearch className="h-4 w-4" />} label="Logs" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Audit entries, filters, and event history will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

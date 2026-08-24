import { Sparkles } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function SuperAdminAiConfiguration() {
    return (
        <DashboardSectionPage
            title="AI Configuration"
            description="Manage AI-assisted validation and rescue intelligence settings"
            badge={<DashboardMetricBadge icon={<Sparkles className="h-4 w-4" />} label="AI" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    AI model settings, validation thresholds, and review queues will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

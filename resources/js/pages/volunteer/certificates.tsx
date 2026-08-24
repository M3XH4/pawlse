import { Award } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function VolunteerCertificates() {
    return (
        <DashboardSectionPage
            title="Certificates & Recognition"
            description="Access your PAWLSE volunteer certificates"
            badge={<DashboardMetricBadge icon={<Award className="h-4 w-4" />} label="0 Certificates" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Certificates and recognition records will appear here when issued.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

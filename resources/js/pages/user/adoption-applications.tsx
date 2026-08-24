import { Heart } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function UserAdoptionApplications() {
    return (
        <DashboardSectionPage
            title="My Adoption Applications"
            description="Review the adoption applications connected to your account"
            badge={<DashboardMetricBadge icon={<Heart className="h-4 w-4" />} label="0 Active" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Adoption application status updates will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

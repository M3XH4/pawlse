import { User } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function VolunteerProfileInformation() {
    return (
        <DashboardSectionPage
            title="Profile Information"
            description="Review your volunteer profile details"
            badge={<DashboardMetricBadge icon={<User className="h-4 w-4" />} label="Volunteer" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Volunteer contact details, skills, and availability will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}

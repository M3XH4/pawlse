import {
    AchievementsView
    
} from '@/components/dashboard/achievements-view';
import type {AchievementsPageProps} from '@/components/dashboard/achievements-view';

export default function VolunteerAchievements(props: AchievementsPageProps) {
    return <AchievementsView audience="volunteer" {...props} />;
}

import {
    AchievementsView
    
} from '@/components/dashboard/achievements-view';
import type {AchievementsPageProps} from '@/components/dashboard/achievements-view';

export default function UserAchievements(props: AchievementsPageProps) {
    return <AchievementsView audience="user" {...props} />;
}

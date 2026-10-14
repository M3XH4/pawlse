import React from 'react';
import { FosterCareView } from '@/components/foster/foster-care-view';

interface FosterCarePageProps {
    fosterParent: any;
    activePlacements: any[];
    historyPlacements: any[];
    theme: 'volunteer';
    isAdmin?: boolean;
}

export default function VolunteerFosterCare(props: FosterCarePageProps) {
    return <FosterCareView {...props} theme="volunteer" isAdmin={false} />;
}

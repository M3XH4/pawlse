import React from 'react';
import { FosterCareView } from '@/components/foster/foster-care-view';

interface MyFosterPetsPageProps {
    fosterParent: any;
    activePlacements: any[];
    historyPlacements: any[];
    theme: 'admin';
    isAdmin?: boolean;
}

export default function AdminMyFosterPets(props: MyFosterPetsPageProps) {
    return <FosterCareView {...props} theme="admin" isAdmin={true} />;
}

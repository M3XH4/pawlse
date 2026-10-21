export interface MissingPetOwner {
    name: string;
    facebook?: string;
    phone: string;
    email: string;
    address: string;
}

export interface MissingPetItem {
    id: number | string;
    name: string;
    type: string;
    breed: string;
    age: string;
    gender: string;
    color: string;
    size: string;
    status: string; // Display text: 'STILL SEARCHING', 'FOUND', 'SEARCHING', 'PENDING REVIEW'
    rawStatus?: string; // Database status: 'pending', 'assigned', 'resolved', 'cancelled', 'duplicate'
    lastSeen: string;
    lastSeenDetails: string;
    date: string;
    exactDate: string;
    reward: string | null;
    description: string;
    distinguishingFeatures: string;
    medicalConditions: string;
    img: string;
    statusColor?: string;
    owner: MissingPetOwner;
}

export function buildMissingPetShareContent(pet: MissingPetItem, shareUrl: string) {
    const title = `🚨 MISSING PET ALERT: ${pet.name}`;
    const rewardText = pet.reward ? `💰 REWARD: ${pet.reward}\n` : '';
    const fullPost = `🚨 MISSING PET ALERT: PLEASE HELP REUNITE ${pet.name.toUpperCase()}! 🐾\n\n` +
        `• Name: ${pet.name}\n` +
        `• Species & Breed: ${pet.type} (${pet.breed})\n` +
        `• Traits: ${pet.gender} • ${pet.age} • ${pet.size} • ${pet.color}\n` +
        `• Last Seen: ${pet.lastSeen} (${pet.date})\n` +
        rewardText +
        (pet.distinguishingFeatures && pet.distinguishingFeatures !== 'N/A' && pet.distinguishingFeatures !== 'None reported'
            ? `• Distinguishing Features: ${pet.distinguishingFeatures}\n`
            : '') +
        (pet.description ? `• Details: ${pet.description}\n` : '') +
        `• Contact: ${pet.owner.name} (${pet.owner.phone})\n\n` +
        `Every second counts! View full details and report sightings here:\n${shareUrl}\n\n` +
        `#MissingPet #IliganCity #PAWLSE #HelpFind${pet.name.replace(/\s+/g, '')}`;

    return {
        title,
        fullPost,
    };
}

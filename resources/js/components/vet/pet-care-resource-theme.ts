import {
    Activity,
    Award,
    BookOpen,
    Cat,
    HeartHandshake,
    Home,
    Palette,
    ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface PetResourceItem {
    id: number;
    title: string;
    slug: string;
    category: string;
    badge?: string | null;
    description?: string | null;
    content?: string | null;
    file_name?: string | null;
    file_size?: string | null;
    file_type?: string | null;
    image_url?: string | null;
    download_count: number;
}

export interface ParsedResourceSection {
    heading: string;
    paragraphs: string[];
    bullets: string[];
    kv: Array<{ label: string; value: string }>;
}

export interface ResourceVisualTheme {
    key: string;
    subtitle: string;
    sourceLabel: string;
    categoryLabel: string;
    icon: LucideIcon;
    bannerTintClass: string;
    bannerGradientClass: string;
    iconBgClass: string;
    iconTextClass: string;
    badgeClass: string;
    accentDotClass: string;
    checkIconClass: string;
    fallbackImage: string;
}

export function resolveResourceTheme(resource: Pick<PetResourceItem, 'slug' | 'title' | 'category'>): ResourceVisualTheme {
    const slug = (resource.slug || '').toLowerCase();
    const title = (resource.title || '').toLowerCase();
    const category = (resource.category || '').toLowerCase();

    if (category === 'boarding' && (slug.includes('cat') || title.includes('cat'))) {
        return {
            key: 'boarding-cats',
            subtitle: 'Cat Boarding Resource',
            sourceLabel: 'Iligan Stray Feeders Community Network',
            categoryLabel: 'Feline Boarding Directory',
            icon: Cat,
            bannerTintClass: 'bg-amber-600/45 mix-blend-multiply',
            bannerGradientClass: 'from-amber-900/55 via-amber-600/35 to-yellow-500/30',
            iconBgClass: 'bg-amber-100 dark:bg-amber-950/90',
            iconTextClass: 'text-amber-700 dark:text-amber-300',
            badgeClass: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
            accentDotClass: 'bg-amber-500',
            checkIconClass: 'text-amber-600 dark:text-amber-400',
            fallbackImage: '/images/resources/cat-boarding.jpg',
        };
    }

    if (category === 'boarding') {
        return {
            key: 'boarding-dogs',
            subtitle: 'Dog Boarding Resource',
            sourceLabel: 'Iligan Stray Feeders Community Network',
            categoryLabel: 'Canine Boarding Directory',
            icon: Home,
            bannerTintClass: 'bg-sky-700/45 mix-blend-multiply',
            bannerGradientClass: 'from-sky-900/60 via-sky-600/35 to-blue-400/25',
            iconBgClass: 'bg-sky-100 dark:bg-sky-950/90',
            iconTextClass: 'text-sky-600 dark:text-sky-400',
            badgeClass: 'bg-sky-100/90 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300',
            accentDotClass: 'bg-sky-500',
            checkIconClass: 'text-sky-600 dark:text-sky-400',
            fallbackImage: '/images/resources/dog-boarding.jpg',
        };
    }

    switch (category) {
        case 'insurance':
            return {
                key: 'insurance',
                subtitle: 'Philippine Pet Coverage Guide',
                sourceLabel: 'Iligan Stray Feeders Adopter Advisory',
                categoryLabel: 'Pet Insurance Guide',
                icon: ShieldCheck,
                bannerTintClass: 'bg-indigo-700/55 mix-blend-multiply',
                bannerGradientClass: 'from-indigo-950/65 via-indigo-700/40 to-blue-500/30',
                iconBgClass: 'bg-indigo-100 dark:bg-indigo-950/90',
                iconTextClass: 'text-indigo-600 dark:text-indigo-400',
                badgeClass: 'bg-indigo-100/90 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300',
                accentDotClass: 'bg-indigo-500',
                checkIconClass: 'text-indigo-600 dark:text-indigo-400',
                fallbackImage: '/images/resources/pet-insurance.jpg',
            };
        case 'training':
            return {
                key: 'training',
                subtitle: 'Adopter Behavior & Obedience Guide',
                sourceLabel: 'Iligan Stray Feeders Care Program',
                categoryLabel: 'Pet Training Handbook',
                icon: Award,
                bannerTintClass: 'bg-emerald-700/50 mix-blend-multiply',
                bannerGradientClass: 'from-emerald-950/60 via-emerald-700/35 to-green-500/25',
                iconBgClass: 'bg-emerald-100 dark:bg-emerald-950/90',
                iconTextClass: 'text-emerald-600 dark:text-emerald-400',
                badgeClass: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
                accentDotClass: 'bg-emerald-500',
                checkIconClass: 'text-emerald-600 dark:text-emerald-400',
                fallbackImage: '/images/resources/pet-training.jpg',
            };
        case 'memorial':
            return {
                key: 'memorial',
                subtitle: 'Pet Remembrance & Grief Support',
                sourceLabel: 'Iligan Stray Feeders Community Care',
                categoryLabel: 'Memorial & Remembrance',
                icon: HeartHandshake,
                bannerTintClass: 'bg-purple-700/50 mix-blend-multiply',
                bannerGradientClass: 'from-purple-950/55 via-violet-600/40 to-fuchsia-400/25',
                iconBgClass: 'bg-purple-100 dark:bg-purple-950/90',
                iconTextClass: 'text-purple-600 dark:text-purple-400',
                badgeClass: 'bg-purple-100/90 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300',
                accentDotClass: 'bg-purple-500',
                checkIconClass: 'text-purple-600 dark:text-purple-400',
                fallbackImage: '/images/resources/pet-memorial.jpg',
            };
        case 'portrait':
            return {
                key: 'portrait',
                subtitle: 'Community Pet Art & Commissions',
                sourceLabel: 'Iligan Local Artists • 20% to ISF',
                categoryLabel: 'Community Pet Portraits',
                icon: Palette,
                bannerTintClass: 'bg-rose-700/55 mix-blend-multiply',
                bannerGradientClass: 'from-rose-950/60 via-rose-600/40 to-pink-500/30',
                iconBgClass: 'bg-rose-100 dark:bg-rose-950/90',
                iconTextClass: 'text-rose-600 dark:text-rose-400',
                badgeClass: 'bg-rose-100/90 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300',
                accentDotClass: 'bg-rose-500',
                checkIconClass: 'text-rose-600 dark:text-rose-400',
                fallbackImage: '/images/resources/pet-portraits.jpg',
            };
        case 'emergency_protocol':
            return {
                key: 'emergency_protocol',
                subtitle: 'Field First Aid & Stabilization Protocol',
                sourceLabel: 'Iligan Stray Feeders (ISF Official)',
                categoryLabel: 'Emergency Field Protocol',
                icon: Activity,
                bannerTintClass: 'bg-red-800/55 mix-blend-multiply',
                bannerGradientClass: 'from-red-950/65 via-red-700/45 to-orange-500/25',
                iconBgClass: 'bg-red-100 dark:bg-red-950/90',
                iconTextClass: 'text-red-600 dark:text-red-400',
                badgeClass: 'bg-red-100/90 text-red-800 dark:bg-red-950/70 dark:text-red-300',
                accentDotClass: 'bg-red-500',
                checkIconClass: 'text-red-600 dark:text-red-400',
                fallbackImage: '/images/partners/dr-e.jpg',
            };
        default:
            return {
                key: 'care_guide',
                subtitle: 'Pet Care & Welfare Resource',
                sourceLabel: 'Iligan Stray Feeders (ISF)',
                categoryLabel: (category || 'care guide').replace(/_/g, ' '),
                icon: BookOpen,
                bannerTintClass: 'bg-teal-700/50 mix-blend-multiply',
                bannerGradientClass: 'from-teal-950/60 via-teal-700/35 to-cyan-500/25',
                iconBgClass: 'bg-teal-100 dark:bg-teal-950/90',
                iconTextClass: 'text-teal-600 dark:text-teal-400',
                badgeClass: 'bg-teal-100/90 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300',
                accentDotClass: 'bg-teal-500',
                checkIconClass: 'text-teal-600 dark:text-teal-400',
                fallbackImage: '/images/resources/cat-boarding.jpg',
            };
    }
}

export function parseResourceContent(content?: string | null): ParsedResourceSection[] {
    const raw = (content || '').trim();

    if (!raw) {
        return [];
    }

    const lines = raw.split(/\r?\n/);
    const sections: ParsedResourceSection[] = [];
    let current: ParsedResourceSection = {
        heading: 'Resource Details & Guidelines',
        paragraphs: [],
        bullets: [],
        kv: [],
    };
    let hasExplicitHeading = false;

    const hasContent = (section: ParsedResourceSection) =>
        section.paragraphs.length > 0 || section.bullets.length > 0 || section.kv.length > 0;

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            continue;
        }

        const headingMatch = line.match(/^#{1,3}\s+(.+)$/);

        if (headingMatch) {
            if (hasExplicitHeading || hasContent(current)) {
                sections.push(current);
            }

            current = {
                heading: headingMatch[1].trim(),
                paragraphs: [],
                bullets: [],
                kv: [],
            };
            hasExplicitHeading = true;
            continue;
        }

        const bulletMatch = line.match(/^(?:[-*•]|\d+\.)\s+(.+)$/);

        if (bulletMatch) {
            current.bullets.push(bulletMatch[1].trim());
            continue;
        }

        if (!line.includes('http://') && !line.includes('https://') && line.length <= 180) {
            const kvMatch = line.match(/^([A-Za-z0-9 &/\-()]{2,36}):\s+(.+)$/);

            if (kvMatch) {
                current.kv.push({
                    label: kvMatch[1].trim(),
                    value: kvMatch[2].trim(),
                });
                continue;
            }
        }

        current.paragraphs.push(line);
    }

    if (hasContent(current)) {
        sections.push(current);
    }

    return sections;
}

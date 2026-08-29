import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function formatPhotoUrl(path?: string | null, animalType?: string | null): string {
    if (!path) {
        const type = (animalType || '').toLowerCase();
        if (type.includes('cat') || type.includes('puspin')) {
            return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80';
        }
        if (type.includes('other')) {
            return 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=800&auto=format&fit=crop&q=80';
        }
        return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80';
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    if (path === 'reports/stray_dog_1.jpg') {
        return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80';
    }
    if (path === 'reports/stray_cat_1.jpg') {
        return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80';
    }
    if (path === 'reports/trash_1.jpg') {
        return 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80';
    }

    if (path.startsWith('/')) {
        return path;
    }

    return `/storage/${path}`;
}

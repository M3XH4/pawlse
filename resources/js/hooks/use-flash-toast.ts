import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { formatToastPayload } from '@/lib/toast-utils';
import type { FlashToast } from '@/types/ui';

export function useFlashToast(): void {
    useEffect(() => {
        return router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (!data) {
                return;
            }

            const rawContent = data.title || data.message || '';
            const rawDescription = data.title
                ? data.description || data.message
                : data.description;

            const { title, description } = formatToastPayload(
                data.type,
                rawContent,
                rawDescription,
            );

            toast[data.type](title, {
                description,
            });
        });
    }, []);
}

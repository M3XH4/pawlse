import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { formatToastPayload } from '@/lib/toast-utils';
import type { FlashToast } from '@/types/ui';

function dispatchFlashToast(data: FlashToast): void {
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
}

export function useFlashToast(): void {
    useEffect(() => {
        const removeFlashListener = router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (!data) {
                return;
            }

            dispatchFlashToast(data);
        });

        const removeNetworkErrorListener = router.on('networkError', () => {
            toast.error('Connection Interrupted — Request Not Sent', {
                description:
                    'Your action could not reach the PAWLSE server because your internet connection dropped or timed out. Please check your connection and try again.',
            });
        });

        return () => {
            removeFlashListener();
            removeNetworkErrorListener();
        };
    }, []);
}

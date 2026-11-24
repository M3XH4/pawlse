import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type UseInertiaNavigatingOptions = {
    /**
     * Delay in milliseconds before showing the skeleton, preventing flashes on instant responses.
     */
    delayMs?: number;
    /**
     * Ignore partial reloads (`only` / `except` visits such as polling or deferred prop fetches).
     */
    ignorePartial?: boolean;
};

export type InertiaNavigationState = {
    isNavigating: boolean;
    targetPath: string | null;
};

/**
 * Tracks active Inertia navigation visits and the destination pathname so layouts
 * can render a route-matched skeleton loader while waiting for the next response.
 */
export function useInertiaNavigationState({
    delayMs = 120,
    ignorePartial = true,
}: UseInertiaNavigatingOptions = {}): InertiaNavigationState {
    const [state, setState] = useState<InertiaNavigationState>({
        isNavigating: false,
        targetPath: null,
    });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const clearPendingTimer = () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };

        const removeStartListener = router.on('start', (event) => {
            const visit = event.detail.visit;
            if (ignorePartial && visit.only.length > 0) {
                return;
            }
            if (visit.method !== 'get') {
                return;
            }

            const targetPath = visit.url.pathname;
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : null;
            if (currentPath !== null && targetPath === currentPath) {
                return;
            }

            clearPendingTimer();
            if (delayMs <= 0) {
                setState({ isNavigating: true, targetPath });
                return;
            }

            timerRef.current = setTimeout(() => {
                setState({ isNavigating: true, targetPath });
            }, delayMs);
        });

        const removeFinishListener = router.on('finish', () => {
            clearPendingTimer();
            setState({ isNavigating: false, targetPath: null });
        });

        return () => {
            clearPendingTimer();
            removeStartListener();
            removeFinishListener();
        };
    }, [delayMs, ignorePartial]);

    return state;
}

/**
 * Tracks active Inertia navigation visits so layouts or pages can display a skeleton loader
 * while waiting for the next response.
 */
export function useInertiaNavigating(options: UseInertiaNavigatingOptions = {}): boolean {
    return useInertiaNavigationState(options).isNavigating;
}

/**
 * Tracks same-page Inertia GET requests (filtering, searching, sorting, pagination)
 * so only the targeted results section shows a skeleton loader while headers and filters stay mounted.
 */
export function useFilteredSectionLoading({ delayMs = 60 }: { delayMs?: number } = {}): boolean {
    const [isFiltering, setIsFiltering] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const clearPendingTimer = () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };

        const removeStartListener = router.on('start', (event) => {
            const visit = event.detail.visit;
            if (visit.method !== 'get') {
                return;
            }

            if (visit.headers?.['X-Realtime-Sync'] === '1') {
                return;
            }

            if (visit.only.length === 1 && visit.only[0] === 'webPush') {
                return;
            }

            const targetPath = visit.url.pathname;
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : null;
            if (currentPath === null || targetPath !== currentPath) {
                return;
            }

            clearPendingTimer();
            if (delayMs <= 0) {
                setIsFiltering(true);
                return;
            }

            timerRef.current = setTimeout(() => {
                setIsFiltering(true);
            }, delayMs);
        });

        const removeFinishListener = router.on('finish', () => {
            clearPendingTimer();
            setIsFiltering(false);
        });

        return () => {
            clearPendingTimer();
            removeStartListener();
            removeFinishListener();
        };
    }, [delayMs]);

    return isFiltering;
}

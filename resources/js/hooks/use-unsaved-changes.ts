import { useEffect, useRef, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';

type PendingAction =
    | {
          type: 'visit';
          url: string;
          method: 'get' | 'post' | 'put' | 'patch' | 'delete';
          data?: any;
          replace?: boolean;
          preserveScroll?: any;
          preserveState?: any;
          headers?: Record<string, string>;
      }
    | {
          type: 'back';
      }
    | {
          type: 'custom';
          onProceed: () => void;
      };

export interface UseUnsavedChangesOptions {
    isDirty: boolean;
    disabled?: boolean;
}

export function useUnsavedChanges({ isDirty, disabled = false }: UseUnsavedChangesOptions) {
    const [showDialog, setShowDialog] = useState(false);
    const pendingActionRef = useRef<PendingAction | null>(null);
    const allowNavigationRef = useRef(false);

    // Inertia visit interception
    useEffect(() => {
        const unsubscribe = router.on('before', (event) => {
            if (allowNavigationRef.current || disabled || !isDirty) {
                return;
            }

            const visit = event.detail.visit;
            const method = (visit.method?.toLowerCase() as any) || 'get';

            // Only intercept GET page navigation away. Never intercept form submissions or mutations (POST/PUT/PATCH/DELETE).
            if (method !== 'get') {
                return;
            }

            event.preventDefault();

            const targetUrl =
                typeof visit.url === 'string'
                    ? visit.url
                    : (visit.url?.href || String(visit.url));

            pendingActionRef.current = {
                type: 'visit',
                url: targetUrl,
                method,
                data: visit.data,
                replace: visit.replace,
                preserveScroll: visit.preserveScroll,
                preserveState: visit.preserveState,
                headers: visit.headers,
            };

            setShowDialog(true);
        });

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!allowNavigationRef.current && !disabled && isDirty) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        const handlePopState = () => {
            if (!allowNavigationRef.current && !disabled && isDirty) {
                window.history.pushState(null, '', window.location.href);
                pendingActionRef.current = { type: 'back' };
                setShowDialog(true);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isDirty, disabled]);

    const handleContinueEditing = useCallback(() => {
        setShowDialog(false);
        pendingActionRef.current = null;
    }, []);

    const handleLeaveAnyway = useCallback(() => {
        allowNavigationRef.current = true;
        setShowDialog(false);

        const action = pendingActionRef.current;
        pendingActionRef.current = null;

        if (!action) {
            window.history.back();
            return;
        }

        if (action.type === 'back') {
            window.history.back();
        } else if (action.type === 'custom') {
            action.onProceed();
            // Reset flag after custom action runs (e.g. closing an in-page modal)
            setTimeout(() => {
                allowNavigationRef.current = false;
            }, 100);
        } else if (action.type === 'visit') {
            router.visit(action.url, {
                method: action.method,
                data: action.data,
                replace: action.replace,
                preserveScroll: action.preserveScroll,
                preserveState: action.preserveState,
                headers: action.headers,
                onFinish: () => {
                    allowNavigationRef.current = false;
                },
            });
        }
    }, []);

    const confirmAction = useCallback(
        (onProceed: () => void) => {
            if (disabled || !isDirty) {
                onProceed();
                return;
            }

            pendingActionRef.current = {
                type: 'custom',
                onProceed,
            };
            setShowDialog(true);
        },
        [disabled, isDirty]
    );

    return {
        showDialog,
        handleContinueEditing,
        handleLeaveAnyway,
        confirmAction,
    };
}

import type { ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';

export type ToastType =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'default'
    | 'loading';

export interface FormattedToastContent {
    title: string | ReactNode;
    description?: string | ReactNode;
}

/**
 * Normalizes toast messages into a short, impactful headline and concise supporting detail.
 */
export function formatToastPayload(
    type: ToastType,
    rawMessage: string | ReactNode,
    existingDescription?: string | ReactNode,
): FormattedToastContent {
    if (existingDescription !== undefined) {
        return {
            title: rawMessage,
            description: existingDescription,
        };
    }

    if (typeof rawMessage !== 'string') {
        return {
            title: rawMessage,
        };
    }

    const trimmed = rawMessage.trim();
    if (!trimmed) {
        const fallbacks: Record<ToastType, string> = {
            success: 'Success',
            error: 'Action Failed',
            warning: 'Attention Needed',
            info: 'Notice',
            loading: 'Processing...',
            default: 'Notification',
        };
        return { title: fallbacks[type] || 'Notice' };
    }

    // 1. Very short status phrases (<= 15 characters without punctuation)
    if (trimmed.length <= 15 && !/[.!?]/.test(trimmed)) {
        return { title: trimmed };
    }

    // 2. Explicit two-part messages (e.g. "Action completed! We will email you the receipt.")
    const splitMatch = trimmed.match(/^([^.!?]+)[.!?]+\s+(.+)$/);
    if (splitMatch && splitMatch[2]) {
        let titleCandidate = splitMatch[1].trim();
        const descCandidate = splitMatch[2].trim();

        titleCandidate = titleCandidate.replace(/^(new|the|your|a|an)\s+/i, '');
        titleCandidate = titleCandidate.replace(/\s+successfully$/i, '');
        const title =
            titleCandidate.charAt(0).toUpperCase() + titleCandidate.slice(1);

        return {
            title,
            description: descCandidate,
        };
    }

    // 3. Smart extraction for single sentences
    const clean = trimmed.replace(/[.!?]+$/, '').trim();
    const lower = clean.toLowerCase();

    // Errors & failures
    if (lower.startsWith('failed to ') || lower.startsWith('unable to ')) {
        const action = clean.replace(/^(failed to|unable to)\s+/i, '').trim();
        const shortAction = action.replace(/^(the|a|an|your)\s+/i, '');
        const titleWords = shortAction.split(' ').slice(0, 3);
        const title =
            titleWords
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ') + ' Failed';

        return {
            title,
            description: trimmed,
        };
    }

    // Warnings & Duplicates
    if (lower.includes('duplicate')) {
        return {
            title: 'Potential Duplicate Flagged',
            description: trimmed,
        };
    }

    if (lower.includes('only ') && lower.includes(' can be ')) {
        return {
            title: 'Action Restricted',
            description: trimmed,
        };
    }

    // Action verbs matching
    const actions: Array<{ verb: string; suffix: string }> = [
        { verb: 'permanently deleted', suffix: 'Deleted' },
        { verb: 'deleted', suffix: 'Deleted' },
        { verb: 'removed', suffix: 'Removed' },
        { verb: 'restored', suffix: 'Restored' },
        { verb: 'saved', suffix: 'Saved' },
        { verb: 'updated', suffix: 'Updated' },
        { verb: 'created', suffix: 'Created' },
        { verb: 'added', suffix: 'Added' },
        { verb: 'submitted', suffix: 'Submitted' },
        { verb: 'pinned', suffix: 'Pinned' },
        { verb: 'archived', suffix: 'Archived' },
        { verb: 'downloaded', suffix: 'Downloaded' },
        { verb: 'copied', suffix: 'Copied' },
    ];

    for (const { verb, suffix } of actions) {
        if (lower.includes(verb)) {
            const idx = lower.indexOf(verb);
            let subject = clean.slice(0, idx).trim();
            subject = subject.replace(/^(new|the|your|a|an)\s+/i, '');
            subject = subject.replace(/\s+(was|has been|is)\s*$/i, '');
            subject = subject.replace(/\s+successfully\s*$/i, '');
            subject = subject.trim();

            if (subject.length > 0 && subject.length <= 32) {
                const title =
                    subject
                        .split(' ')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ') +
                    ' ' +
                    suffix;
                return {
                    title,
                    description: trimmed,
                };
            }

            return {
                title: suffix,
                description: trimmed,
            };
        }
    }

    // Database / background jobs
    if (lower.startsWith('starting ') || lower.startsWith('restoring ')) {
        const words = clean.split(' ').slice(0, 3);
        const title = words
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
        return {
            title,
            description: trimmed,
        };
    }

    // If long sentence without specific keyword, provide impactful header based on toast type
    if (clean.length > 25) {
        const fallbackTitles: Record<ToastType, string> = {
            success: 'Action Completed',
            error: 'Action Failed',
            warning: 'Attention Needed',
            info: 'Notice',
            loading: 'In Progress',
            default: 'Notification',
        };
        return {
            title: fallbackTitles[type] || 'Notice',
            description: trimmed,
        };
    }

    return { title: trimmed };
}

let isIntercepted = false;

/**
 * Enhances the Sonner toast singleton so every toast across the app automatically
 * receives impactful headlines and detailed descriptions.
 */
export function setupSonnerInterception(): void {
    if (isIntercepted || typeof window === 'undefined') {
        return;
    }
    isIntercepted = true;

    const original = {
        success: sonnerToast.success.bind(sonnerToast),
        error: sonnerToast.error.bind(sonnerToast),
        warning: sonnerToast.warning.bind(sonnerToast),
        info: sonnerToast.info.bind(sonnerToast),
        message: sonnerToast.message.bind(sonnerToast),
    };

    const types: Array<'success' | 'error' | 'warning' | 'info' | 'message'> = [
        'success',
        'error',
        'warning',
        'info',
        'message',
    ];

    types.forEach((type) => {
        const orig = original[type];
        const toastType: ToastType = type === 'message' ? 'default' : type;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sonnerToast as any)[type] = (message: any, options?: any) => {
            if (typeof message === 'string') {
                const { title, description } = formatToastPayload(
                    toastType,
                    message,
                    options?.description,
                );

                return orig(title, {
                    ...options,
                    ...(description !== undefined ? { description } : {}),
                });
            }

            return orig(message, options);
        };
    });
}

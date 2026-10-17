import type { ReactNode } from 'react';
import React from 'react';
import { toast as sonnerToast } from 'sonner';
import { LoadingTimeUI } from '@/components/ui/loading-time-ui';

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
 * Checks whether a proposed description is essentially identical or redundant
 * compared to the title, avoiding silly duplicated text like:
 * "Location Address Pinned" / "Location address pinned!"
 */
export function isRedundant(title: string, description?: string): boolean {
    if (!description) {
        return true;
    }
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanDesc = description.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (cleanTitle === cleanDesc) {
        return true;
    }

    if (
        cleanDesc.includes(cleanTitle) &&
        cleanDesc.length - cleanTitle.length <= 14
    ) {
        return true;
    }

    if (
        cleanTitle.includes(cleanDesc) &&
        cleanTitle.length - cleanDesc.length <= 14
    ) {
        return true;
    }

    return false;
}

/**
 * Converts a string into title case for impactful, clean headlines.
 */
function toTitleCase(str: string): string {
    return str
        .split(' ')
        .filter(Boolean)
        .map((word) => {
            if (/^(and|or|for|of|the|in|to|with|a|an)$/i.test(word)) {
                return word.toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

/**
 * Normalizes toast messages into a short, impactful headline and concise supporting detail,
 * ensuring no repetitive text or awkward line duplication.
 */
export function formatToastPayload(
    type: ToastType,
    rawMessage: string | ReactNode,
    existingDescription?: string | ReactNode,
): FormattedToastContent {
    if (existingDescription !== undefined) {
        const titleStr = typeof rawMessage === 'string' ? rawMessage : '';
        const descStr =
            typeof existingDescription === 'string' ? existingDescription : '';

        if (titleStr && descStr && isRedundant(titleStr, descStr)) {
            return { title: rawMessage };
        }

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

    // 1. Two-part messages separated by ! or . or : followed by a capital letter / secondary sentence
    // e.g. "Rehoming assistance request submitted successfully! ISF will review your submission and coordinate."
    // e.g. "Unable to detect location. Please enter manually."
    const splitMatch = trimmed.match(/^([^!.:]+)[!.:]+\s+([A-Z0-9].+)$/);

    if (splitMatch && splitMatch[2]) {
        let titleCandidate = splitMatch[1].trim();
        const descCandidate = splitMatch[2].trim();

        titleCandidate = titleCandidate.replace(/^(new|the|your|a|an)\s+/i, '');
        titleCandidate = titleCandidate.replace(/\s+successfully$/i, '');
        const title = toTitleCase(titleCandidate);

        if (!isRedundant(title, descCandidate)) {
            return {
                title,
                description: descCandidate,
            };
        }
    }

    const lower = trimmed.toLowerCase();

    // 2. Specific domain alerts that have a distinct high-impact category headline
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

    // 3. Failures & errors
    if (lower.startsWith('failed to ') || lower.startsWith('unable to ')) {
        const sentences = trimmed.split(/\.\s+/);
        if (sentences.length > 1) {
            const first = sentences[0].trim();
            const rest = sentences.slice(1).join('. ').trim();
            return {
                title: first.charAt(0).toUpperCase() + first.slice(1),
                description: rest,
            };
        }

        // Single error sentence
        return {
            title: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
        };
    }

    // 4. Single-sentence confirmations (e.g. "Location address pinned!", "AI configurations saved.")
    // Keep it clean, impactful, and single-line so there is zero duplication!
    const clean = trimmed.replace(/[!.]+$/, '').trim();
    const hasEllipsis = trimmed.endsWith('...');

    let subject = clean.replace(/^(new|the|your|a|an)\s+/i, '');
    subject = subject.replace(/\s+successfully$/i, '');
    subject = subject.replace(/\s+permanently$/i, '');

    const title =
        toTitleCase(subject).charAt(0).toUpperCase() +
        toTitleCase(subject).slice(1) +
        (hasEllipsis ? '...' : '');

    return {
        title,
        description: undefined,
    };
}

let isIntercepted = false;
const recentToasts = new Map<string, number>();

/**
 * Enhances the Sonner toast singleton so every toast across the app automatically
 * receives impactful headlines, no redundant descriptions, and prevents rapid-fire duplicate spamming.
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
        loading: sonnerToast.loading.bind(sonnerToast),
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

                // Deduplicate rapid identical toasts within 1.5s
                const dedupeKey = `${toastType}:${message.trim().toLowerCase()}`;
                const now = Date.now();
                const lastTime = recentToasts.get(dedupeKey) || 0;
                recentToasts.set(dedupeKey, now);

                let id = options?.id;
                if (!id && now - lastTime < 1500) {
                    id = dedupeKey;
                }

                return orig(title, {
                    ...options,
                    ...(id ? { id } : {}),
                    ...(description !== undefined ? { description } : {}),
                });
            }

            return orig(message, options);
        };
    });

    // Custom loading toast with progress animation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sonnerToast as any).loading = (message: any, options?: any) => {
        const { title, description } = formatToastPayload(
            'loading',
            message,
            options?.description,
        );

        const customDescription = React.createElement(
            'div',
            { className: 'w-full flex flex-col gap-1.5 mt-1' },
            description
                ? React.createElement(
                      'div',
                      { className: 'text-xs opacity-90' },
                      description,
                  )
                : null,
            React.createElement(LoadingTimeUI, {
                variant: 'bar',
                size: 'sm',
                showProgress: true,
                showTime: true,
                label: '',
                showStatusHint: true,
            }),
        );

        return original.loading(title, {
            ...options,
            description: customDescription,
        });
    };
}

import { router } from '@inertiajs/react';

export type WebPushSharedState = {
    enabled: boolean;
    publicKey: string | null;
    hasSubscription: boolean;
    devicesCount: number;
    testAlertEnabled?: boolean;
};

export type PushCapabilityStatus =
    | 'loading'
    | 'unsupported'
    | 'ios-install-required'
    | 'unconfigured'
    | 'unauthenticated'
    | 'denied'
    | 'prompt'
    | 'subscribed';

const MANUAL_DISABLE_KEY = 'pawlse_push_manually_disabled';

let lastSyncedUserId: string | number | null = null;
let listenersBound = false;

function getCsrfToken(): string {
    if (typeof document === 'undefined') {
        return '';
    }

    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export function isStandalonePwa(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    const nav = window.navigator as Navigator & { standalone?: boolean };

    return window.matchMedia?.('(display-mode: standalone)')?.matches === true || nav.standalone === true;
}

export function isIosDevice(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    const ua = window.navigator.userAgent || '';
    const isStandardIos = /iPhone|iPad|iPod/i.test(ua);
    const isIpadOsDesktopUa =
        /Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;

    return isStandardIos || isIpadOsDesktopUa;
}

export function isPushApiSupported(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return (
        window.isSecureContext &&
        'serviceWorker' in window.navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

export function needsIosHomeScreenInstall(): boolean {
    return isIosDevice() && !isStandalonePwa() && !isPushApiSupported();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const buffer = new ArrayBuffer(rawData.length);
    const outputArray = new Uint8Array(buffer);

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

function setManualDisableFlag(disabled: boolean): void {
    try {
        if (disabled) {
            window.localStorage.setItem(MANUAL_DISABLE_KEY, '1');
        } else {
            window.localStorage.removeItem(MANUAL_DISABLE_KEY);
        }
    } catch {
        // Ignore storage errors
    }
}

function hasManualDisableFlag(): boolean {
    try {
        return window.localStorage.getItem(MANUAL_DISABLE_KEY) === '1';
    } catch {
        return false;
    }
}

async function getReadyRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in window.navigator)) {
        return null;
    }

    try {
        const existing = await window.navigator.serviceWorker.getRegistration('/');

        if (!existing) {
            await window.navigator.serviceWorker.register('/sw.js', { scope: '/' });
        }

        return await window.navigator.serviceWorker.ready;
    } catch {
        return null;
    }
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
    if (!isPushApiSupported()) {
        return null;
    }

    const registration = await getReadyRegistration();

    if (!registration?.pushManager) {
        return null;
    }

    try {
        return await registration.pushManager.getSubscription();
    } catch {
        return null;
    }
}

export async function getPushCapabilityStatus(
    isAuthenticated: boolean,
    webPush?: WebPushSharedState | null,
): Promise<PushCapabilityStatus> {
    if (!isAuthenticated) {
        return 'unauthenticated';
    }

    if (needsIosHomeScreenInstall()) {
        return 'ios-install-required';
    }

    if (!isPushApiSupported()) {
        return 'unsupported';
    }

    if (!webPush?.enabled || !webPush.publicKey) {
        return 'unconfigured';
    }

    if (Notification.permission === 'denied') {
        return 'denied';
    }

    const subscription = await getCurrentPushSubscription();

    if (subscription && Notification.permission === 'granted') {
        return 'subscribed';
    }

    return 'prompt';
}

async function postSubscriptionToServer(subscription: PushSubscription | PushSubscriptionJSON): Promise<boolean> {
    const json: PushSubscriptionJSON =
        'toJSON' in subscription && typeof subscription.toJSON === 'function'
            ? subscription.toJSON()
            : (subscription as PushSubscriptionJSON);

    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        return false;
    }

    const response = await fetch('/account/push-subscriptions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': getCsrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
            endpoint: json.endpoint,
            keys: {
                p256dh: json.keys.p256dh,
                auth: json.keys.auth,
            },
            contentEncoding: 'aes128gcm',
            isStandalone: isStandalonePwa(),
        }),
    });

    return response.ok;
}

async function deleteSubscriptionFromServer(endpoint?: string | null, keepalive = false): Promise<void> {
    try {
        await fetch('/account/push-subscriptions', {
            method: 'DELETE',
            keepalive,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(endpoint ? { endpoint } : {}),
        });
    } catch {
        // Ignore network errors during unlink
    }
}

export async function enablePushNotifications(publicKey: string): Promise<{
    ok: boolean;
    status: PushCapabilityStatus;
    error?: string;
}> {
    if (needsIosHomeScreenInstall()) {
        return {
            ok: false,
            status: 'ios-install-required',
            error: 'On iPhone/iPad, tap Share → Add to Home Screen first, then open the installed PAWLSE app to enable notifications.',
        };
    }

    if (!isPushApiSupported()) {
        return {
            ok: false,
            status: 'unsupported',
            error: 'Push notifications are not supported on this browser or insecure connection.',
        };
    }

    if (!publicKey) {
        return {
            ok: false,
            status: 'unconfigured',
            error: 'Push notification keys are not configured on the server yet.',
        };
    }

    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();

    if (permission !== 'granted') {
        return {
            ok: false,
            status: permission === 'denied' ? 'denied' : 'prompt',
            error:
                permission === 'denied'
                    ? 'Notification permission is blocked. Allow notifications for PAWLSE in your browser or phone settings.'
                    : 'Notification permission was not granted.',
        };
    }

    const registration = await getReadyRegistration();

    if (!registration?.pushManager) {
        return {
            ok: false,
            status: 'unsupported',
            error: 'Service worker is not ready yet. Please refresh and try again.',
        };
    }

    try {
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
        }

        const saved = await postSubscriptionToServer(subscription);

        if (!saved) {
            return {
                ok: false,
                status: 'prompt',
                error: 'Could not save this device subscription. Ensure your account is signed in and email verified.',
            };
        }

        setManualDisableFlag(false);
        window.dispatchEvent(new CustomEvent('pawlse:push-status-changed'));

        return { ok: true, status: 'subscribed' };
    } catch {
        return {
            ok: false,
            status: 'prompt',
            error: 'Unable to subscribe this device to push notifications.',
        };
    }
}

export async function disablePushNotifications(): Promise<void> {
    setManualDisableFlag(true);
    const subscription = await getCurrentPushSubscription();

    await deleteSubscriptionFromServer(subscription?.endpoint ?? null);

    if (subscription) {
        try {
            await subscription.unsubscribe();
        } catch {
            // Ignore unsubscribe failures
        }
    }

    window.dispatchEvent(new CustomEvent('pawlse:push-status-changed'));
}

export async function preparePushLogout(): Promise<void> {
    lastSyncedUserId = null;
    const subscription = await getCurrentPushSubscription();

    if (subscription) {
        await deleteSubscriptionFromServer(subscription.endpoint, true);

        try {
            await subscription.unsubscribe();
        } catch {
            // Ignore unsubscribe failures
        }
    }

    const nav = typeof window !== 'undefined' ? (window.navigator as Navigator & { clearAppBadge?: () => Promise<void> }) : null;

    if (nav && typeof nav.clearAppBadge === 'function') {
        nav.clearAppBadge().catch(() => {});
    }

    window.dispatchEvent(new CustomEvent('pawlse:push-status-changed'));
}

export async function sendTestPushNotification(): Promise<{ ok: boolean; message: string }> {
    try {
        const response = await fetch('/account/push-subscriptions/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };

        if (!response.ok || !data.ok) {
            return {
                ok: false,
                message: data.message || 'Unable to deliver a test notification right now.',
            };
        }

        return {
            ok: true,
            message: 'Test notification sent! Check your phone or desktop notification tray.',
        };
    } catch {
        return {
            ok: false,
            message: 'Network error while sending test notification.',
        };
    }
}

async function cleanupGuestPushSubscription(): Promise<void> {
    const subscription = await getCurrentPushSubscription();

    if (subscription) {
        try {
            await subscription.unsubscribe();
        } catch {
            // Ignore unsubscribe failures
        }
    }

    const nav = typeof window !== 'undefined' ? (window.navigator as Navigator & { clearAppBadge?: () => Promise<void> }) : null;

    if (nav && typeof nav.clearAppBadge === 'function') {
        nav.clearAppBadge().catch(() => {});
    }
}

export async function syncPushWithAuthProps(props: Record<string, unknown> | undefined): Promise<void> {
    if (typeof window === 'undefined' || !props) {
        return;
    }

    const auth = props.auth as { user?: { id?: string | number; email_verified_at?: string | null } | null } | undefined;
    const webPush = props.webPush as WebPushSharedState | undefined;
    const user = auth?.user ?? null;

    if (!user?.id) {
        lastSyncedUserId = null;
        await cleanupGuestPushSubscription();
        window.dispatchEvent(new CustomEvent('pawlse:push-status-changed'));

        return;
    }

    if (!user.email_verified_at || !webPush?.enabled || !webPush.publicKey || !isPushApiSupported()) {
        return;
    }

    if (Notification.permission !== 'granted' || hasManualDisableFlag()) {
        return;
    }

    if (lastSyncedUserId === user.id) {
        return;
    }

    lastSyncedUserId = user.id;

    try {
        const registration = await getReadyRegistration();

        if (!registration?.pushManager) {
            return;
        }

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(webPush.publicKey),
            });
        }

        await postSubscriptionToServer(subscription);
        window.dispatchEvent(new CustomEvent('pawlse:push-status-changed'));
    } catch {
        lastSyncedUserId = null;
    }
}

let latestSharedProps: Record<string, unknown> | undefined;

export function getLatestPushSharedProps(): Record<string, unknown> | undefined {
    if (latestSharedProps) {
        return latestSharedProps;
    }

    if (typeof document === 'undefined') {
        return undefined;
    }

    try {
        const raw = document.getElementById('app')?.getAttribute('data-page');

        if (raw) {
            const parsed = JSON.parse(raw) as { props?: Record<string, unknown> };
            latestSharedProps = parsed?.props;
        }
    } catch {
        // Ignore initial data-page parse failure
    }

    return latestSharedProps;
}

export function initializePushLifecycle(): void {
    if (typeof window === 'undefined' || listenersBound) {
        return;
    }

    listenersBound = true;

    void syncPushWithAuthProps(getLatestPushSharedProps());

    router.on('navigate', (event) => {
        const props = (event.detail?.page as { props?: Record<string, unknown> } | undefined)?.props;

        if (props) {
            latestSharedProps = props;
        }

        void syncPushWithAuthProps(props);
    });

    router.on('success', (event) => {
        const props = (event.detail?.page as { props?: Record<string, unknown> } | undefined)?.props;

        if (props) {
            latestSharedProps = props;
        }

        void syncPushWithAuthProps(props);
    });

    if ('serviceWorker' in window.navigator) {
        window.navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
            const data = event.data as { type?: string; subscription?: PushSubscriptionJSON } | undefined;

            if (!data?.type) {
                return;
            }

            if (data.type === 'PAWLSE_PUSH_SUBSCRIPTION_CHANGED' && data.subscription) {
                const currentProps = getLatestPushSharedProps();
                const auth = currentProps?.auth as { user?: { id?: string | number } | null } | undefined;

                if (auth?.user?.id && !hasManualDisableFlag()) {
                    void postSubscriptionToServer(data.subscription);
                }
            }
        });
    }
}

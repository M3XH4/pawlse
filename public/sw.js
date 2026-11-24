const PWA_CACHE_NAME = 'pawlse-pwa-v2';
const PWA_ICON_ASSETS = [
    '/images/pwa/icon-192x192.png',
    '/images/pwa/icon-512x512.png',
    '/images/pwa/icon-maskable-192x192.png',
    '/images/pwa/icon-maskable-512x512.png',
    '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(PWA_CACHE_NAME)
            .then((cache) => cache.addAll(PWA_ICON_ASSETS))
            .catch(() => Promise.resolve())
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== PWA_CACHE_NAME)
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    if (!url.pathname.startsWith('/images/pwa/')) {
        return;
    }

    event.respondWith(
        caches.match(request).then(
            (cached) =>
                cached ||
                fetch(request).then((response) => {
                    if (response && response.ok) {
                        const copy = response.clone();
                        caches
                            .open(PWA_CACHE_NAME)
                            .then((cache) => cache.put(request, copy));
                    }

                    return response;
                }),
        ),
    );
});

self.addEventListener('push', (event) => {
    event.waitUntil(
        (async () => {
            let payload = {
                id: `pawlse-${Date.now()}`,
                title: 'PAWLSE Notification',
                body: 'You have a new update.',
                url: '/account/user',
                icon: '/images/pwa/icon-192x192.png',
                badge: '/images/pwa/icon-192x192.png',
                suppressWhenVisible: true,
                forceShow: false,
                unreadCount: null,
            };

            if (event.data) {
                try {
                    const parsed = event.data.json();
                    if (parsed && typeof parsed === 'object') {
                        payload = { ...payload, ...parsed };
                    }
                } catch {
                    const text = event.data.text();
                    if (text) {
                        payload.body = text;
                    }
                }
            }

            const windowClients = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true,
            });

            let hasVisibleClient = false;
            for (const client of windowClients) {
                if (client.visibilityState === 'visible' || client.focused) {
                    hasVisibleClient = true;
                }

                try {
                    client.postMessage({
                        type: 'PAWLSE_PUSH_RECEIVED',
                        payload,
                    });
                } catch {
                    // Ignore postMessage failure for closed client frames
                }
            }

            if (
                typeof payload.unreadCount === 'number' &&
                self.navigator &&
                typeof self.navigator.setAppBadge === 'function'
            ) {
                try {
                    if (payload.unreadCount > 0) {
                        await self.navigator.setAppBadge(payload.unreadCount);
                    } else if (typeof self.navigator.clearAppBadge === 'function') {
                        await self.navigator.clearAppBadge();
                    }
                } catch {
                    // Ignore unsupported app badge updates
                }
            }

            if (!payload.forceShow && payload.suppressWhenVisible !== false && hasVisibleClient) {
                return;
            }

            await self.registration.showNotification(payload.title || 'PAWLSE Notification', {
                body: payload.body || 'You have a new update.',
                icon: payload.icon || '/images/pwa/icon-192x192.png',
                badge: payload.badge || '/images/pwa/icon-192x192.png',
                tag: payload.id || 'pawlse-notification',
                renotify: false,
                data: {
                    url: payload.url || '/account/user',
                },
            });
        })(),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const rawUrl =
        event.notification.data && typeof event.notification.data.url === 'string'
            ? event.notification.data.url
            : '/account/user';
    const targetUrl = new URL(rawUrl, self.location.origin).href;

    event.waitUntil(
        (async () => {
            const windowClients = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true,
            });

            for (const client of windowClients) {
                if (!client.url.startsWith(self.location.origin)) {
                    continue;
                }

                if ('focus' in client) {
                    await client.focus();
                }

                if ('navigate' in client) {
                    try {
                        await client.navigate(targetUrl);
                        return;
                    } catch {
                        // Fall through to openWindow
                    }
                }

                return;
            }

            if (self.clients.openWindow) {
                await self.clients.openWindow(targetUrl);
            }
        })(),
    );
});

self.addEventListener('pushsubscriptionchange', (event) => {
    event.waitUntil(
        (async () => {
            const appServerKey = event.oldSubscription?.options?.applicationServerKey;
            if (!appServerKey) {
                return;
            }

            try {
                const renewed = await self.registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: appServerKey,
                });

                const windowClients = await self.clients.matchAll({
                    type: 'window',
                    includeUncontrolled: true,
                });

                for (const client of windowClients) {
                    client.postMessage({
                        type: 'PAWLSE_PUSH_SUBSCRIPTION_CHANGED',
                        subscription: renewed.toJSON(),
                    });
                }
            } catch {
                // Will resync on next authenticated app visit
            }
        })(),
    );
});

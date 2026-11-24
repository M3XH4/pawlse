import { router } from '@inertiajs/react';
import { BellRing, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    enablePushNotifications,
    getLatestPushSharedProps,
    getPushCapabilityStatus,
    isStandalonePwa,
    type PushCapabilityStatus,
    type WebPushSharedState,
} from '@/lib/push-notifications';

const BANNER_DISMISS_PREFIX = 'pawlse_push_banner_dismissed_';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type BannerPageState = {
    userId: string | number | null;
    emailVerified: boolean;
    webPush: WebPushSharedState | null;
};

function extractState(props: Record<string, unknown> | undefined): BannerPageState {
    const auth = props?.auth as { user?: { id?: string | number; email_verified_at?: string | null } | null } | undefined;
    const webPush = (props?.webPush as WebPushSharedState | undefined) ?? null;

    return {
        userId: auth?.user?.id ?? null,
        emailVerified: Boolean(auth?.user?.email_verified_at),
        webPush,
    };
}

function isDismissedForUser(userId: string | number): boolean {
    try {
        const raw = window.localStorage.getItem(`${BANNER_DISMISS_PREFIX}${userId}`);
        if (!raw) {
            return false;
        }
        const timestamp = Number(raw);

        return Number.isFinite(timestamp) && Date.now() - timestamp < SEVEN_DAYS_MS;
    } catch {
        return false;
    }
}

export function PushPermissionBanner() {
    const [pageState, setPageState] = useState<BannerPageState>(() =>
        extractState(getLatestPushSharedProps()),
    );
    const [status, setStatus] = useState<PushCapabilityStatus>('loading');
    const [dismissed, setDismissed] = useState(false);
    const [enabling, setEnabling] = useState(false);

    useEffect(() => {
        const refreshFromRouter = (props?: Record<string, unknown>) => {
            setPageState(extractState(props ?? getLatestPushSharedProps()));
        };

        refreshFromRouter();

        const unbindNavigate = router.on('navigate', (event) => {
            refreshFromRouter((event.detail?.page as { props?: Record<string, unknown> } | undefined)?.props);
        });
        const unbindSuccess = router.on('success', (event) => {
            refreshFromRouter((event.detail?.page as { props?: Record<string, unknown> } | undefined)?.props);
        });
        const handleStatusChanged = () => {
            refreshFromRouter();
        };

        window.addEventListener('pawlse:push-status-changed', handleStatusChanged);

        return () => {
            unbindNavigate();
            unbindSuccess();
            window.removeEventListener('pawlse:push-status-changed', handleStatusChanged);
        };
    }, []);

    useEffect(() => {
        let active = true;

        const evaluate = async () => {
            if (!pageState.userId || !pageState.emailVerified) {
                if (active) {
                    setStatus('unauthenticated');
                }
                return;
            }

            if (isDismissedForUser(pageState.userId)) {
                if (active) {
                    setDismissed(true);
                }
                return;
            }

            setDismissed(false);
            const resolved = await getPushCapabilityStatus(true, pageState.webPush);
            if (active) {
                setStatus(resolved);
            }
        };

        void evaluate();

        return () => {
            active = false;
        };
    }, [pageState]);

    if (
        !pageState.userId ||
        !pageState.emailVerified ||
        dismissed ||
        status !== 'prompt' ||
        !pageState.webPush?.publicKey
    ) {
        return null;
    }

    const standaloneOrMobile =
        typeof window !== 'undefined' && (isStandalonePwa() || window.innerWidth < 768);

    if (!standaloneOrMobile) {
        return null;
    }

    const handleDismiss = () => {
        try {
            window.localStorage.setItem(`${BANNER_DISMISS_PREFIX}${pageState.userId}`, String(Date.now()));
        } catch {
            // Ignore storage errors
        }
        setDismissed(true);
    };

    const handleEnable = async () => {
        if (!pageState.webPush?.publicKey || enabling) {
            return;
        }

        setEnabling(true);
        const result = await enablePushNotifications(pageState.webPush.publicKey);
        setEnabling(false);
        setStatus(result.status);

        if (result.ok) {
            toast.success('Phone notifications enabled for your account!');
        } else if (result.error) {
            toast.error(result.error);
        }
    };

    return (
        <div
            className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-md rounded-2xl border border-orange-200/80 bg-white/95 p-3.5 shadow-[0_18px_40px_rgba(11,35,64,0.18)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95"
            role="region"
            aria-label="Enable phone notifications"
        >
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-paw-orange dark:bg-orange-950/50">
                    {isStandalonePwa() ? <BellRing className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#0B2340] dark:text-white">
                        Turn on phone notifications?
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        Get instant updates for your PAWLSE account even when the app is closed. Stops automatically if you sign out.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleEnable}
                            disabled={enabling}
                            className="inline-flex min-h-[36px] items-center justify-center rounded-xl bg-paw-orange px-3.5 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                            {enabling ? 'Enabling...' : 'Enable Alerts'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="inline-flex min-h-[36px] items-center justify-center rounded-xl px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Not now
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleDismiss}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    aria-label="Dismiss notification prompt"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

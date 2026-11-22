import { usePage } from '@inertiajs/react';
import { FlaskConical, PartyPopper } from 'lucide-react';

/**
 * Isolated Demo / Sandbox Mode controls.
 *
 * Renders nothing unless `isSandboxMode` is enabled in Super Admin System Settings
 * (and automatically disabled in production via App\Support\SandboxMode).
 *
 * Safe to delete this file + its single import in achievements-view.tsx when removing demo mode.
 */
export function SandboxDemoControls({
    onTriggerConfetti,
}: {
    onTriggerConfetti: () => void;
}) {
    const page = usePage<{ isSandboxMode?: boolean }>();
    const isSandboxMode = Boolean(page.props?.isSandboxMode);

    if (!isSandboxMode) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-violet-300 bg-violet-50/70 px-4 py-3 dark:border-violet-800/70 dark:bg-violet-950/30">
            <div className="flex items-center gap-2.5 text-xs">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                    <FlaskConical className="h-4 w-4" />
                </span>
                <div>
                    <p className="font-bold text-violet-950 dark:text-violet-200">
                        Sandbox Demo Mode Active
                    </p>
                    <p className="text-[11px] text-violet-700/80 dark:text-violet-300/80">
                        Presentation-only controls enabled by Super Admin (auto-disabled in production).
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={onTriggerConfetti}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-violet-700"
            >
                <PartyPopper className="h-3.5 w-3.5" />
                Trigger Level-Up Confetti
            </button>
        </div>
    );
}

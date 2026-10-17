import { useEffect } from 'react';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { Toaster as Sonner, toast, type ToasterProps } from 'sonner';
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    Loader2,
    X,
} from 'lucide-react';
import { setupSonnerInterception } from '@/lib/toast-utils';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();

    useFlashToast();

    useEffect(() => {
        setupSonnerInterception();
    }, []);

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position="bottom-right"
            closeButton
            duration={4200}
            icons={{
                success: (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-4 ring-emerald-500/15 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-500/20">
                        <CheckCircle2 className="size-4.5 stroke-[2.25]" />
                    </span>
                ),
                error: (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 ring-4 ring-rose-500/15 dark:bg-rose-950 dark:text-rose-400 dark:ring-rose-500/20">
                        <AlertCircle className="size-4.5 stroke-[2.25]" />
                    </span>
                ),
                warning: (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 ring-4 ring-amber-500/15 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-500/20">
                        <AlertTriangle className="size-4.5 stroke-[2.25]" />
                    </span>
                ),
                info: (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 ring-4 ring-sky-500/15 dark:bg-sky-950 dark:text-sky-400 dark:ring-sky-500/20">
                        <Info className="size-4.5 stroke-[2.25]" />
                    </span>
                ),
                loading: (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 ring-4 ring-amber-500/15 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-500/20">
                        <Loader2 className="size-4.5 animate-spin stroke-[2.25]" />
                    </span>
                ),
                close: <X className="size-3.5 stroke-[2]" />,
            }}
            toastOptions={{
                classNames: {
                    toast: 'group pawlse-toast !w-[380px] !max-w-[calc(100vw-2rem)] !rounded-2xl !p-4 !shadow-xl !backdrop-blur-md transition-all duration-300 font-sans border flex items-start gap-3.5',
                    title: '!font-semibold !text-[13.5px] !leading-snug tracking-tight',
                    description: '!text-xs !leading-relaxed !mt-0.5 opacity-90',
                    actionButton:
                        '!text-xs !font-medium !rounded-xl !px-3 !py-1.5 !shadow-sm transition-colors',
                    cancelButton:
                        '!text-xs !font-medium !rounded-xl !px-3 !py-1.5 transition-colors',
                    closeButton:
                        '!border !rounded-full !size-5 !top-3 !right-3 !transition-transform hover:!scale-110',
                    icon: '!h-auto !w-auto !mr-0 self-start mt-0.5',
                    content: '!gap-1 flex-1 min-w-0',
                    success: 'pawlse-toast-success',
                    error: 'pawlse-toast-error',
                    warning: 'pawlse-toast-warning',
                    info: 'pawlse-toast-info',
                    default: 'pawlse-toast-default',
                },
            }}
            {...props}
        />
    );
}

export { Toaster, toast };

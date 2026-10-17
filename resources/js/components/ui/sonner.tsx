import { useEffect } from 'react';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { Toaster as Sonner, toast, type ToasterProps } from 'sonner';
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    X,
} from 'lucide-react';
import { setupSonnerInterception } from '@/lib/toast-utils';
import { CircularProgressSpinner } from '@/components/ui/spinner';

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
            visibleToasts={4}
            gap={12}
            icons={{
                success: (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100/90 text-emerald-700 ring-2 ring-emerald-500/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-500/30">
                        <CheckCircle2 className="size-4 stroke-[2.25]" />
                    </span>
                ),
                error: (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-rose-100/90 text-rose-700 ring-2 ring-rose-500/20 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-500/30">
                        <AlertCircle className="size-4 stroke-[2.25]" />
                    </span>
                ),
                warning: (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100/90 text-amber-700 ring-2 ring-amber-500/20 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-500/30">
                        <AlertTriangle className="size-4 stroke-[2.25]" />
                    </span>
                ),
                info: (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-100/90 text-sky-700 ring-2 ring-sky-500/20 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-500/30">
                        <Info className="size-4 stroke-[2.25]" />
                    </span>
                ),
                loading: (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100/90 text-amber-700 ring-2 ring-amber-500/20 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-500/30">
                        <CircularProgressSpinner
                            size="sm"
                            className="size-4 stroke-[2.25]"
                        />
                    </span>
                ),
                close: <X className="size-3.5 stroke-[2.25]" />,
            }}
            toastOptions={{
                classNames: {
                    toast: 'group pawlse-toast !w-[360px] !max-w-[calc(100vw-2rem)] !rounded-xl font-sans border flex gap-3',
                    title: '!font-semibold !text-[13.5px] !leading-snug tracking-tight text-inherit',
                    description:
                        '!text-xs !leading-relaxed !mt-0.5 opacity-85 text-inherit',
                    actionButton:
                        '!text-xs !font-medium !rounded-lg !px-2.5 !py-1 !shadow-xs transition-colors',
                    cancelButton:
                        '!text-xs !font-medium !rounded-lg !px-2.5 !py-1 transition-colors',
                    closeButton:
                        '!border-none !rounded-full !size-5 !top-2 !right-2 !transition-transform hover:!scale-110 !opacity-40 hover:!opacity-100',
                    icon: '!h-auto !w-auto !mr-0 shrink-0 flex items-center justify-center',
                    content: '!gap-0.5 flex-1 min-w-0',
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

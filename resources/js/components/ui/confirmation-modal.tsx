import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Info, X, CheckCircle2, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    isLoading?: boolean;
    hideCancel?: boolean;
    children?: React.ReactNode;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    description = 'Are you sure you want to proceed with this action? This cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    icon,
    isLoading = false,
    hideCancel = false,
    children,
}: ConfirmationModalProps) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isLoading, onClose]);

    const variantStyles = {
        danger: {
            iconBg: 'bg-red-50 text-red-600 ring-4 ring-red-500/10 border border-red-200/70 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50 dark:ring-red-500/15',
            icon: Trash2,
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20',
        },
        warning: {
            iconBg: 'bg-amber-50 text-amber-600 ring-4 ring-amber-500/10 border border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50 dark:ring-amber-500/15',
            icon: AlertTriangle,
            confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20',
        },
        info: {
            iconBg: 'bg-paw-orange/10 text-paw-orange ring-4 ring-paw-orange/10 border border-paw-orange/25 dark:bg-paw-orange/15',
            icon: Info,
            confirmButton: 'bg-paw-orange hover:bg-orange-600 text-white shadow-md shadow-paw-orange/25',
        },
        success: {
            iconBg: 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-500/10 border border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50 dark:ring-emerald-500/15',
            icon: CheckCircle2,
            confirmButton: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20',
        },
    }[variant];

    const IconComponent = icon || variantStyles.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Blurred Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm"
                        onClick={() => {
                            if (!isLoading) {
                                onClose();
                            }
                        }}
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 12 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                        className="relative z-10 w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl sm:p-7 dark:border-slate-800 dark:bg-slate-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="absolute top-4 right-4 rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-gray-200 cursor-pointer"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>

                        {/* Centered Header */}
                        <div className="flex flex-col items-center text-center pt-1">
                            <div
                                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${variantStyles.iconBg}`}
                            >
                                <IconComponent size={26} />
                            </div>

                            <h3 className="font-fredoka text-xl font-bold leading-snug text-[#0B2340] sm:text-2xl dark:text-white">
                                {title}
                            </h3>

                            <div className="mt-2 max-w-sm text-xs leading-relaxed font-semibold text-gray-500 sm:text-sm dark:text-gray-400">
                                {description}
                            </div>
                        </div>

                        {/* Optional Extra Content (e.g. notes textarea) */}
                        {children && (
                            <div className="mt-5 text-left">
                                {children}
                            </div>
                        )}

                        {/* Action Footer */}
                        <div
                            className={`mt-6 grid gap-2.5 ${
                                hideCancel ? 'grid-cols-1' : 'grid-cols-2'
                            }`}
                        >
                            {!hideCancel && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-gray-700 transition hover:bg-gray-100 active:scale-[0.99] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700 cursor-pointer"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold uppercase tracking-wider transition active:scale-[0.99] disabled:opacity-50 cursor-pointer ${variantStyles.confirmButton}`}
                            >
                                {isLoading && <Loader2 size={14} className="animate-spin" />}
                                <span>{isLoading ? 'Processing...' : confirmText}</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

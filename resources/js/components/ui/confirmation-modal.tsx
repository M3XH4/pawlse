import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Info, X, CheckCircle2 } from 'lucide-react';

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
    children,
}: ConfirmationModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            iconBg: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200/60 dark:border-red-900/50',
            icon: Trash2,
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25',
        },
        warning: {
            iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50',
            icon: AlertTriangle,
            confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25',
        },
        info: {
            iconBg: 'bg-paw-orange/15 text-paw-orange border border-paw-orange/30',
            icon: Info,
            confirmButton: 'bg-paw-orange hover:bg-orange-600 text-white shadow-orange-500/25',
        },
        success: {
            iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50',
            icon: CheckCircle2,
            confirmButton: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25',
        },
    }[variant];

    const IconComponent = icon || variantStyles.icon;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isLoading) {
                    onClose();
                }
            }}
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-gray-100 dark:border-gray-800 shadow-2xl relative transition-all">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${variantStyles.iconBg}`}>
                        <IconComponent size={22} />
                    </div>

                    <div className="flex-1 pr-6">
                        <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white leading-tight">
                            {title}
                        </h3>
                        <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-semibold mt-2 leading-relaxed">
                            {description}
                        </div>
                    </div>
                </div>

                {children && (
                    <div className="mt-4">
                        {children}
                    </div>
                )}

                <div className="flex justify-end items-center gap-2.5 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition cursor-pointer disabled:opacity-50 ${variantStyles.confirmButton}`}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

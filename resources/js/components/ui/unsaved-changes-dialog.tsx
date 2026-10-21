import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function WarningTriangleIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

export interface UnsavedChangesDialogProps {
    isOpen: boolean;
    onContinueEditing: () => void;
    onLeaveAnyway: () => void;
    title?: string;
    description?: string;
    continueText?: string;
    leaveText?: string;
    zIndex?: number;
}

export function UnsavedChangesDialog({
    isOpen,
    onContinueEditing,
    onLeaveAnyway,
    title = 'Leave this page?',
    description = 'You have unsaved information. If you leave now, your current changes may be lost.',
    continueText = 'Continue Editing',
    leaveText = 'Leave Anyway',
    zIndex = 300,
}: UnsavedChangesDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{ zIndex }}
                >
                    {/* Blurred Background Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-md"
                        onClick={onContinueEditing}
                    />

                    {/* Modal Dialog Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative z-10 bg-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 md:p-10 shadow-2xl max-w-md w-full text-center border border-gray-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 text-amber-500 shadow-sm">
                            <WarningTriangleIcon size={30} className="text-amber-500" />
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-black text-paw-navy mb-2.5">
                            {title}
                        </h3>

                        <p className="text-xs sm:text-sm md:text-base font-bold text-gray-400 mb-6 sm:mb-8 max-w-sm mx-auto leading-relaxed">
                            {description}
                        </p>

                        <div className="space-y-2.5 sm:space-y-3">
                            <button
                                type="button"
                                onClick={onContinueEditing}
                                className="w-full py-3.5 sm:py-4 bg-paw-orange hover:bg-orange-600 active:scale-[0.99] text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-paw-orange/20 transition-all cursor-pointer"
                            >
                                {continueText}
                            </button>
                            <button
                                type="button"
                                onClick={onLeaveAnyway}
                                className="w-full py-3.5 sm:py-4 bg-gray-100 hover:bg-gray-200 active:scale-[0.99] text-paw-navy font-black text-sm sm:text-base rounded-2xl transition-all cursor-pointer"
                            >
                                {leaveText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

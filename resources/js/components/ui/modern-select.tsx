import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFloatingPopover } from '@/hooks/use-floating-popover';

export interface ModernSelectOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface ModernSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: ModernSelectOption[];
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    searchable?: boolean;
    helperText?: string;
    error?: string;
    className?: string;
    id?: string;
}

export function ModernSelect({
    value,
    onChange,
    options,
    label,
    placeholder = 'Select an option...',
    required = false,
    disabled = false,
    searchable,
    helperText,
    error,
    className = '',
    id,
}: ModernSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleClose = () => {
        setIsOpen(false);
        setSearchQuery('');
    };

    const {
        triggerRef: containerRef,
        popoverRef,
        coords,
    } = useFloatingPopover({
        isOpen,
        onClose: handleClose,
        estimatedHeight: 280,
        estimatedWidth: 280,
    });

    const selectedOption = useMemo(
        () => options.find((opt) => opt.value === value) || null,
        [options, value]
    );

    const showSearch = searchable ?? options.length > 6;

    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const q = searchQuery.toLowerCase();
        return options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(q) ||
                (opt.description && opt.description.toLowerCase().includes(q))
        );
    }, [options, searchQuery]);

    const handleSelect = (optValue: string) => {
        onChange(optValue);
        handleClose();
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
                >
                    {label} {required && <span className="text-paw-orange">*</span>}
                </label>
            )}

            <button
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-left text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    error
                        ? 'border-red-400 bg-red-50/40 dark:bg-red-950/20 text-red-700 dark:text-red-300'
                        : isOpen
                          ? 'border-paw-orange bg-white dark:bg-slate-800 ring-2 ring-paw-orange/20 text-[#0B2340] dark:text-white'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-850 hover:border-paw-orange/60 text-[#0B2340] dark:text-white'
                }`}
            >
                <span className={`truncate ${selectedOption ? '' : 'text-gray-400 dark:text-gray-500 font-medium'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-paw-orange' : ''
                    }`}
                />
            </button>

            {helperText && !error && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
            {error && <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>}

            {typeof document !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {isOpen && coords && (
                            <motion.div
                                ref={popoverRef}
                                initial={{ opacity: 0, y: coords.placement === 'top' ? 6 : -6, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: coords.placement === 'top' ? 6 : -6, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: 'fixed',
                                    top: coords.top,
                                    left: coords.left,
                                    minWidth: Math.max(coords.width, 220),
                                    maxWidth: Math.max(coords.width, 340),
                                    zIndex: 9999,
                                }}
                                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
                            >
                                {showSearch && (
                                    <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                                        <div className="relative">
                                            <Search
                                                size={14}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search..."
                                                autoFocus
                                                className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-slate-800 rounded-lg border border-transparent focus:border-paw-orange outline-none text-[#0B2340] dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                                    {filteredOptions.length === 0 ? (
                                        <div className="px-3 py-4 text-center text-xs font-semibold text-gray-400">
                                            No matching options
                                        </div>
                                    ) : (
                                        filteredOptions.map((opt) => {
                                            const isSelected = opt.value === value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    disabled={opt.disabled}
                                                    onClick={() => !opt.disabled && handleSelect(opt.value)}
                                                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                                        isSelected
                                                            ? 'bg-paw-orange/10 text-paw-orange font-bold'
                                                            : 'text-[#0B2340] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold'
                                                    }`}
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate">{opt.label}</p>
                                                        {opt.description && (
                                                            <p className="truncate text-[11px] font-medium text-gray-400 dark:text-gray-500">
                                                                {opt.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isSelected && <Check size={15} className="shrink-0 text-paw-orange" />}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </div>
    );
}

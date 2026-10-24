import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Clock, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFloatingPopover } from '@/hooks/use-floating-popover';

export interface ModernDatePickerPreset {
    label: string;
    value: string; // YYYY-MM-DD
}

export interface ModernDatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    minDate?: string; // YYYY-MM-DD
    maxDate?: string; // YYYY-MM-DD
    label?: string;
    placeholder?: string;
    required?: boolean;
    helperText?: string;
    error?: string;
    variant?: 'card' | 'input';
    showPresets?: boolean;
    presets?: ModernDatePickerPreset[];
    allowPast?: boolean;
    className?: string;
    id?: string;
}

export function ModernDatePicker({
    value,
    onChange,
    minDate,
    maxDate,
    label,
    placeholder = 'Select date...',
    required = false,
    helperText,
    error,
    variant = 'input',
    showPresets = false,
    presets: customPresets,
    allowPast = false,
    className = '',
    id
}: ModernDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

    const handleClose = () => {
        setIsOpen(false);
        setIsYearPickerOpen(false);
    };

    const {
        triggerRef: containerRef,
        popoverRef,
        coords,
    } = useFloatingPopover({
        isOpen,
        onClose: handleClose,
        estimatedHeight: 360,
        estimatedWidth: 300,
    });

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Compute effective min/max date
    const effectiveMinDate = minDate ?? (allowPast ? undefined : todayStr);
    const minDateObj = effectiveMinDate ? new Date(effectiveMinDate + 'T00:00:00') : null;
    const maxDateObj = maxDate ? new Date(maxDate + 'T23:59:59') : null;

    // Initial month view based on selected value or today
    const initialDate = value ? new Date(value + 'T00:00:00') : today;
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11

    // Sync month view when value changes externally
    useEffect(() => {
        if (value) {
            const parts = value.split('-').map(Number);
            if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                setViewYear(parts[0]);
                setViewMonth(parts[1] - 1);
            }
        }
    }, [value]);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Month calculations
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const canNavigatePrev = () => {
        if (!minDateObj) return true;
        const firstOfViewMonth = new Date(viewYear, viewMonth, 1);
        const firstOfMinMonth = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);
        return firstOfViewMonth > firstOfMinMonth;
    };

    const canNavigateNext = () => {
        if (!maxDateObj) return true;
        const lastOfViewMonth = new Date(viewYear, viewMonth + 1, 0);
        return lastOfViewMonth < maxDateObj;
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canNavigatePrev()) return;
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(v => v - 1);
        } else {
            setViewMonth(v => v - 1);
        }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canNavigateNext()) return;
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(v => v + 1);
        } else {
            setViewMonth(v => v + 1);
        }
    };

    const handleSelectDay = (day: number) => {
        const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(formatted);
        setIsOpen(false);
    };

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return null;
        const [y, m, d] = dateStr.split('-').map(Number);
        if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getRelativeBadge = (dateStr: string) => {
        if (!dateStr) return null;
        const [y, m, d] = dateStr.split('-').map(Number);
        if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
        const target = new Date(y, m - 1, d);
        const baseToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diffDays = Math.round((target.getTime() - baseToday.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
        if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
        return null;
    };

    // Default quick presets
    const getPresetDate = (daysFromToday: number) => {
        const d = new Date();
        d.setDate(d.getDate() + daysFromToday);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const getNextDayOfWeek = (targetDay: number) => {
        const d = new Date();
        const currentDay = d.getDay();
        const diff = (targetDay - currentDay + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const defaultFuturePresets: ModernDatePickerPreset[] = [
        { label: 'Today', value: getPresetDate(0) },
        { label: 'Tomorrow', value: getPresetDate(1) },
        { label: 'This Sat', value: getNextDayOfWeek(6) },
        { label: 'This Sun', value: getNextDayOfWeek(0) }
    ];

    const defaultPastPresets: ModernDatePickerPreset[] = [
        { label: 'Today', value: getPresetDate(0) },
        { label: 'Yesterday', value: getPresetDate(-1) },
        { label: '1 Wk Ago', value: getPresetDate(-7) },
        { label: '1 Mo Ago', value: getPresetDate(-30) }
    ];

    const activePresets = customPresets || (allowPast ? defaultPastPresets : defaultFuturePresets);
    const displayDate = formatDisplayDate(value);
    const relativeBadge = getRelativeBadge(value);

    // Year options for fast navigation (current year down to 1940 or up to 2035)
    const currentYear = today.getFullYear();
    const yearOptions = allowPast
        ? Array.from({ length: 80 }, (_, i) => currentYear - i)
        : Array.from({ length: 15 }, (_, i) => currentYear - 2 + i);

    return (
        <div className={`relative w-full ${className}`} ref={containerRef} id={id}>
            {/* Input Trigger */}
            {variant === 'card' ? (
                /* Card Hero Variant (e.g. Sponsor a Feeding Day hero view) */
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
                    className={`w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-800/80 border-2 rounded-2xl transition-all cursor-pointer select-none group ${
                        isOpen 
                            ? 'border-paw-orange bg-white dark:bg-slate-800 shadow-md shadow-paw-orange/10' 
                            : error 
                                ? 'border-red-400 bg-red-50/20' 
                                : 'border-transparent hover:border-paw-orange/40 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform shrink-0 ${
                            isOpen || value 
                                ? 'bg-paw-orange text-white shadow-sm shadow-paw-orange/30 scale-105' 
                                : 'bg-paw-orange/10 text-paw-orange dark:bg-paw-orange/20 group-hover:scale-105'
                        }`}>
                            <CalendarIcon size={18} />
                        </div>
                        <div className="text-left min-w-0">
                            {label && (
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        {label} {required && <span className="text-red-500">*</span>}
                                    </span>
                                    {relativeBadge && (
                                        <span className="bg-paw-orange/10 dark:bg-paw-orange/25 text-paw-orange text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                            {relativeBadge}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="truncate">
                                {displayDate ? (
                                    <span className="font-black text-paw-navy dark:text-white text-sm sm:text-base">{displayDate}</span>
                                ) : (
                                    <span className="font-bold text-gray-400 text-xs sm:text-sm">{placeholder}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-400 shrink-0 ml-2">
                        <span className="text-[11px] font-black text-paw-orange opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                            {isOpen ? 'Close' : 'Choose'}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 ${isOpen ? 'rotate-180 bg-gray-100 dark:bg-slate-700 text-paw-navy dark:text-white' : 'text-gray-400'}`}>
                            <ChevronDown size={15} />
                        </div>
                    </div>
                </div>
            ) : (
                /* Compact Input Variant (Ideal for modals, dialogs, 2-column forms) */
                <div>
                    {label && (
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                {label} {required && <span className="text-red-500">*</span>}
                            </label>
                            {relativeBadge && (
                                <span className="bg-paw-orange/10 dark:bg-paw-orange/20 text-paw-orange text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                    {relativeBadge}
                                </span>
                            )}
                        </div>
                    )}
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsOpen(!isOpen)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 sm:py-3 rounded-xl border-2 transition-all cursor-pointer select-none bg-gray-50 dark:bg-slate-800 text-left ${
                            isOpen 
                                ? 'border-paw-orange bg-white dark:bg-slate-800 shadow-sm shadow-paw-orange/10' 
                                : error 
                                    ? 'border-red-400 bg-red-50/20' 
                                    : 'border-transparent hover:border-paw-orange/40 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                isOpen || value ? 'bg-paw-orange text-white' : 'bg-paw-orange/10 text-paw-orange dark:bg-paw-orange/20'
                            }`}>
                                <CalendarIcon size={14} />
                            </div>
                            <span className={`text-xs sm:text-sm font-bold truncate ${displayDate ? 'text-paw-navy dark:text-white' : 'text-gray-400'}`}>
                                {displayDate || placeholder}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 shrink-0 ml-2">
                            {value && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange('');
                                    }}
                                    className="p-1 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    title="Clear date"
                                >
                                    <X size={12} />
                                </button>
                            )}
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-paw-orange' : ''}`} />
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}

            {/* Quick Pills Bar Directly Beneath Field (if enabled) */}
            {showPresets && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Quick:</span>
                    {activePresets.map((preset) => {
                        const isSelected = value === preset.value;
                        return (
                            <button
                                type="button"
                                key={preset.label}
                                onClick={() => onChange(preset.value)}
                                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                                    isSelected
                                        ? 'bg-paw-orange text-white shadow-sm shadow-paw-orange/20 scale-105'
                                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                {preset.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Interactive Modern Compact Calendar Popover */}
            {typeof document !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {isOpen && coords && (
                            <motion.div
                                ref={popoverRef}
                                initial={{ opacity: 0, y: coords.placement === 'top' ? 6 : -6, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: coords.placement === 'top' ? 6 : -6, scale: 0.98 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                style={{
                                    position: 'fixed',
                                    top: coords.top !== undefined ? `${coords.top}px` : undefined,
                                    bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
                                    left: `${coords.left}px`,
                                    zIndex: 300,
                                }}
                                className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-2xl border border-gray-100 dark:border-slate-800 ring-1 ring-black/10 w-[290px] max-w-[320px]"
                            >
                                {/* Header: Month / Year / Fast Year Toggle */}
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
                                className="flex items-center gap-1 font-black text-sm text-paw-navy dark:text-white hover:text-paw-orange transition-colors cursor-pointer"
                                title="Click to quickly pick month or year"
                            >
                                <span>{monthNames[viewMonth]} {viewYear}</span>
                                <ChevronDown size={14} className={`transition-transform ${isYearPickerOpen ? 'rotate-180 text-paw-orange' : 'text-gray-400'}`} />
                            </button>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    disabled={!canNavigatePrev()}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                        canNavigatePrev() 
                                            ? 'text-paw-navy dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer' 
                                            : 'text-gray-300 dark:text-slate-600 cursor-not-allowed'
                                    }`}
                                    title="Previous Month"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    disabled={!canNavigateNext()}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                        canNavigateNext() 
                                            ? 'text-paw-navy dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer' 
                                            : 'text-gray-300 dark:text-slate-600 cursor-not-allowed'
                                    }`}
                                    title="Next Month"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Fast Year/Month Picker Drawer */}
                        {isYearPickerOpen ? (
                            <div className="py-2 space-y-3">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Month</span>
                                    <div className="grid grid-cols-3 gap-1">
                                        {monthNames.map((name, idx) => (
                                            <button
                                                type="button"
                                                key={name}
                                                onClick={() => {
                                                    setViewMonth(idx);
                                                    setIsYearPickerOpen(false);
                                                }}
                                                className={`text-[11px] py-1.5 rounded-lg font-bold transition-all ${
                                                    viewMonth === idx 
                                                        ? 'bg-paw-orange text-white' 
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                {name.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Year</span>
                                    <div className="grid grid-cols-4 gap-1 max-h-36 overflow-y-auto pr-1">
                                        {yearOptions.map((year) => (
                                            <button
                                                type="button"
                                                key={year}
                                                onClick={() => {
                                                    setViewYear(year);
                                                    setIsYearPickerOpen(false);
                                                }}
                                                className={`text-[11px] py-1 rounded-lg font-bold transition-all ${
                                                    viewYear === year 
                                                        ? 'bg-paw-orange text-white' 
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Weekday Labels */}
                                <div className="grid grid-cols-7 gap-1 mb-1">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
                                        <div key={day} className={`text-center text-[10px] font-bold uppercase py-0.5 ${idx === 0 || idx === 6 ? 'text-paw-orange/80' : 'text-gray-400 dark:text-slate-500'}`}>
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Day Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {/* Empty offset days */}
                                    {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                                        <div key={`empty-${idx}`} className="w-8 h-8" />
                                    ))}

                                    {/* Month Days */}
                                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                                        const dayNum = idx + 1;
                                        const cellDateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                        const cellDateObj = new Date(viewYear, viewMonth, dayNum);
                                        const isPast = minDateObj ? cellDateObj < minDateObj : false;
                                        const isFuture = maxDateObj ? cellDateObj > maxDateObj : false;
                                        const isDisabled = isPast || isFuture;
                                        const isSelected = value === cellDateStr;
                                        const isToday = cellDateStr === todayStr;

                                        return (
                                            <button
                                                type="button"
                                                key={dayNum}
                                                disabled={isDisabled}
                                                onClick={() => handleSelectDay(dayNum)}
                                                className={`w-8 h-8 mx-auto rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all relative ${
                                                    isDisabled
                                                        ? 'text-gray-300 dark:text-slate-700 cursor-not-allowed opacity-40'
                                                        : isSelected
                                                            ? 'bg-paw-orange text-white shadow-sm shadow-paw-orange/30 scale-105 z-10'
                                                            : 'text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-paw-orange cursor-pointer'
                                                }`}
                                            >
                                                <span>{dayNum}</span>
                                                {isToday && !isSelected && (
                                                    <span className="w-1 h-1 rounded-full bg-paw-orange absolute bottom-0.5" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Footer Info / Done button */}
                        <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5 text-gray-400 min-w-0">
                                {helperText ? (
                                    <>
                                        <Clock size={12} className="text-paw-orange shrink-0" />
                                        <span className="truncate text-[10px]">{helperText}</span>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleSelectDay(today.getDate())}
                                        className="text-[10px] text-paw-orange hover:underline font-bold"
                                    >
                                        Today: {monthNames[today.getMonth()].slice(0, 3)} {today.getDate()}
                                    </button>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-paw-orange hover:underline font-bold text-[11px] cursor-pointer shrink-0 ml-2"
                            >
                                Done
                            </button>
                        </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </div>
    );
}

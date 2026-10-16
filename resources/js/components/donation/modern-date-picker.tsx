import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Clock, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModernDatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    minDate?: string; // YYYY-MM-DD
    label?: string;
    required?: boolean;
    helperText?: string;
}

export function ModernDatePicker({
    value,
    onChange,
    minDate = new Date().toISOString().split('T')[0],
    label = 'Drop-Off Date',
    required = false,
    helperText = 'Shelter drop-off hours: 9:00 AM – 5:00 PM'
}: ModernDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial month view based on selected value or today
    const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync month view when value changes externally
    useEffect(() => {
        if (value) {
            const parts = value.split('-').map(Number);
            if (parts.length === 3) {
                setViewYear(parts[0]);
                setViewMonth(parts[1] - 1);
            }
        }
    }, [value]);

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const minDateObj = minDate ? new Date(minDate + 'T00:00:00') : new Date(todayStr + 'T00:00:00');

    // Month calculations
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const canNavigatePrev = () => {
        const firstOfViewMonth = new Date(viewYear, viewMonth, 1);
        const firstOfMinMonth = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);
        return firstOfViewMonth > firstOfMinMonth;
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
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getRelativeBadge = (dateStr: string) => {
        if (!dateStr) return null;
        const [y, m, d] = dateStr.split('-').map(Number);
        const target = new Date(y, m - 1, d);
        const now = new Date();
        const baseToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffDays = Math.round((target.getTime() - baseToday.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
        return null;
    };

    // Quick presets
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

    const presets = [
        { label: 'Today', value: getPresetDate(0) },
        { label: 'Tomorrow', value: getPresetDate(1) },
        { label: 'This Sat', value: getNextDayOfWeek(6) },
        { label: 'This Sun', value: getNextDayOfWeek(0) }
    ];

    const displayDate = formatDisplayDate(value);
    const relativeBadge = getRelativeBadge(value);

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Input Trigger Field */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
                className={`w-full flex items-center justify-between p-3 bg-gray-50 border-2 rounded-2xl transition-all cursor-pointer select-none group ${
                    isOpen 
                        ? 'border-paw-orange bg-white shadow-md shadow-paw-orange/10' 
                        : 'border-transparent hover:border-paw-orange/40 hover:bg-white'
                }`}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform shrink-0 ${
                        isOpen || value 
                            ? 'bg-paw-orange text-white shadow-sm shadow-paw-orange/30 scale-105' 
                            : 'bg-paw-orange/10 text-paw-orange group-hover:scale-105'
                    }`}>
                        <CalendarIcon size={18} />
                    </div>
                    <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                                {label} {required && <span className="text-red-500">*</span>}
                            </span>
                            {relativeBadge && (
                                <span className="bg-paw-orange/10 text-paw-orange text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                    {relativeBadge}
                                </span>
                            )}
                        </div>
                        <div className="truncate">
                            {displayDate ? (
                                <span className="font-black text-paw-navy text-sm sm:text-base">{displayDate}</span>
                            ) : (
                                <span className="font-bold text-gray-400 text-xs sm:text-sm">Select preferred drop-off date...</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-gray-400 shrink-0 ml-2">
                    <span className="text-[11px] font-black text-paw-orange opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                        {isOpen ? 'Close' : 'Choose'}
                    </span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 ${isOpen ? 'rotate-180 bg-gray-100 text-paw-navy' : 'text-gray-400'}`}>
                        <ChevronDown size={15} />
                    </div>
                </div>
            </div>

            {/* Quick Pills Bar Directly Beneath Field */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] font-bold text-gray-400">Quick:</span>
                {presets.map((preset) => {
                    const isSelected = value === preset.value;
                    return (
                        <button
                            type="button"
                            key={preset.label}
                            onClick={() => {
                                onChange(preset.value);
                            }}
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                                isSelected
                                    ? 'bg-paw-orange text-white shadow-sm shadow-paw-orange/20 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-paw-navy'
                            }`}
                        >
                            {preset.label}
                        </button>
                    );
                })}
            </div>

            {/* Interactive Modern Compact Calendar Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-0 z-40 mt-2 bg-white rounded-2xl p-3.5 shadow-xl border border-gray-100 ring-1 ring-black/5 w-full sm:w-[290px] max-w-[300px]"
                    >
                        {/* Header: Month / Year / Navigation */}
                        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-gray-100">
                            <h4 className="text-sm font-black text-paw-navy">
                                {monthNames[viewMonth]} {viewYear}
                            </h4>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    disabled={!canNavigatePrev()}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                        canNavigatePrev() 
                                            ? 'text-paw-navy hover:bg-gray-100 active:scale-95 cursor-pointer' 
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                    title="Previous Month"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="w-7 h-7 rounded-lg text-paw-navy hover:bg-gray-100 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                                    title="Next Month"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Weekday Labels */}
                        <div className="grid grid-cols-7 gap-1 mb-1">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
                                <div key={day} className={`text-center text-[10px] font-bold uppercase py-0.5 ${idx === 0 || idx === 6 ? 'text-paw-orange/80' : 'text-gray-400'}`}>
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
                                const isPast = cellDateObj < minDateObj;
                                const isSelected = value === cellDateStr;
                                const isToday = cellDateStr === todayStr;

                                return (
                                    <button
                                        type="button"
                                        key={dayNum}
                                        disabled={isPast}
                                        onClick={() => handleSelectDay(dayNum)}
                                        className={`w-8 h-8 mx-auto rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all relative ${
                                            isPast
                                                ? 'text-gray-300 cursor-not-allowed opacity-40'
                                                : isSelected
                                                    ? 'bg-paw-orange text-white shadow-sm shadow-paw-orange/30 scale-105 z-10'
                                                    : 'text-gray-700 hover:bg-orange-50 hover:text-paw-orange cursor-pointer'
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

                        {/* Footer Info */}
                        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                            <div className="flex items-center gap-1.5 text-gray-400 min-w-0">
                                <Clock size={12} className="text-paw-orange shrink-0" />
                                <span className="truncate text-[10px]">{helperText}</span>
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
            </AnimatePresence>
        </div>
    );
}

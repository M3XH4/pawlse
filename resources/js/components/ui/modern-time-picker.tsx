import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ModernTimePickerProps {
    value: string; // "09:00", "09:00 AM", or "14:30"
    onChange: (time: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    helperText?: string;
    error?: string;
    variant?: 'input' | 'card';
    className?: string;
    id?: string;
}

export function ModernTimePicker({
    value,
    onChange,
    label,
    placeholder = 'Select time...',
    required = false,
    helperText,
    error,
    variant = 'input',
    className = '',
    id
}: ModernTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse value into 12-hour components: hour (1-12), minute ("00"-"59"), ampm ("AM"|"PM")
    const parseTime = (val: string) => {
        if (!val) return { hour: 9, minute: '00', ampm: 'AM' as const };
        const clean = val.trim().toUpperCase();
        const isPM = clean.includes('PM');
        const isAM = clean.includes('AM');
        const rawTime = clean.replace(/[^\d:]/g, '');
        const [hStr, mStr] = rawTime.split(':');
        let h = parseInt(hStr, 10);
        let m = mStr ? parseInt(mStr, 10) : 0;
        if (isNaN(h)) h = 9;
        if (isNaN(m)) m = 0;

        let ampm: 'AM' | 'PM' = 'AM';
        if (isPM) {
            ampm = 'PM';
            if (h > 12) h -= 12;
        } else if (isAM) {
            ampm = 'AM';
            if (h === 0) h = 12;
        } else {
            // 24-hour heuristic
            if (h >= 12) {
                ampm = 'PM';
                if (h > 12) h -= 12;
            } else {
                ampm = 'AM';
                if (h === 0) h = 12;
            }
        }
        if (h === 0) h = 12;
        if (h > 12) h = 12;
        const minFormatted = String(Math.min(59, Math.max(0, m))).padStart(2, '0');
        return { hour: h, minute: minFormatted, ampm };
    };

    const initial = parseTime(value);
    const [selectedHour, setSelectedHour] = useState(initial.hour);
    const [selectedMinute, setSelectedMinute] = useState(initial.minute);
    const [selectedAmPm, setSelectedAmPm] = useState<'AM' | 'PM'>(initial.ampm);

    // Keep internal state in sync with external value
    useEffect(() => {
        if (value) {
            const parsed = parseTime(value);
            setSelectedHour(parsed.hour);
            setSelectedMinute(parsed.minute);
            setSelectedAmPm(parsed.ampm);
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent | TouchEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const emitChange = (h: number, m: string, period: 'AM' | 'PM') => {
        const formatted = `${String(h).padStart(2, '0')}:${m} ${period}`;
        onChange(formatted);
    };

    const handleHourSelect = (h: number) => {
        setSelectedHour(h);
        emitChange(h, selectedMinute, selectedAmPm);
    };

    const handleMinuteSelect = (m: string) => {
        setSelectedMinute(m);
        emitChange(selectedHour, m, selectedAmPm);
    };

    const handleAmPmToggle = (period: 'AM' | 'PM') => {
        setSelectedAmPm(period);
        emitChange(selectedHour, selectedMinute, period);
    };

    const quickPresets = [
        '09:00 AM',
        '10:30 AM',
        '01:00 PM',
        '03:00 PM',
        '05:00 PM'
    ];

    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const minuteOptions = ['00', '15', '30', '45'];

    return (
        <div className={`relative w-full ${className}`} ref={containerRef} id={id}>
            {variant === 'card' ? (
                /* Card Hero Variant */
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
                            <Clock size={18} />
                        </div>
                        <div className="text-left min-w-0">
                            {label && (
                                <span className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">
                                    {label} {required && <span className="text-red-500">*</span>}
                                </span>
                            )}
                            <div className="truncate">
                                {value ? (
                                    <span className="font-black text-paw-navy dark:text-white text-sm sm:text-base">{value}</span>
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
                /* Compact Input Variant */
                <div>
                    {label && (
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
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
                                <Clock size={14} />
                            </div>
                            <span className={`text-xs sm:text-sm font-bold truncate ${value ? 'text-paw-navy dark:text-white' : 'text-gray-400'}`}>
                                {value || placeholder}
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
                                    title="Clear time"
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

            {/* Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-0 z-50 mt-2 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-gray-100 dark:border-slate-800 ring-1 ring-black/10 w-full sm:w-[280px]"
                    >
                        {/* Current Selection Header & AM/PM Switcher */}
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-3">
                            <div className="flex items-baseline gap-1 font-black text-xl text-paw-navy dark:text-white tracking-tight">
                                <span>{String(selectedHour).padStart(2, '0')}</span>
                                <span className="text-paw-orange animate-pulse">:</span>
                                <span>{selectedMinute}</span>
                                <span className="text-xs font-bold text-gray-400 ml-1">{selectedAmPm}</span>
                            </div>

                            <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => handleAmPmToggle('AM')}
                                    className={`px-2.5 py-1 rounded-md text-xs font-black transition-all ${
                                        selectedAmPm === 'AM'
                                            ? 'bg-paw-orange text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-paw-navy'
                                    }`}
                                >
                                    AM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAmPmToggle('PM')}
                                    className={`px-2.5 py-1 rounded-md text-xs font-black transition-all ${
                                        selectedAmPm === 'PM'
                                            ? 'bg-paw-orange text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-paw-navy'
                                    }`}
                                >
                                    PM
                                </button>
                            </div>
                        </div>

                        {/* Hours Grid */}
                        <div className="mb-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">Hour</span>
                            <div className="grid grid-cols-6 gap-1">
                                {hours.map((h) => {
                                    const isSelected = selectedHour === h;
                                    return (
                                        <button
                                            type="button"
                                            key={h}
                                            onClick={() => handleHourSelect(h)}
                                            className={`h-8 rounded-lg text-xs font-bold transition-all ${
                                                isSelected
                                                    ? 'bg-paw-orange text-white shadow-sm shadow-paw-orange/20 scale-105'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {h}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Minutes Grid */}
                        <div className="mb-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">Minute</span>
                            <div className="grid grid-cols-4 gap-1.5">
                                {minuteOptions.map((m) => {
                                    const isSelected = selectedMinute === m;
                                    return (
                                        <button
                                            type="button"
                                            key={m}
                                            onClick={() => handleMinuteSelect(m)}
                                            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                isSelected
                                                    ? 'bg-paw-orange text-white shadow-sm shadow-paw-orange/20 scale-105'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            :{m}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="mb-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">Presets</span>
                            <div className="flex flex-wrap gap-1">
                                {quickPresets.map((preset) => (
                                    <button
                                        type="button"
                                        key={preset}
                                        onClick={() => {
                                            onChange(preset);
                                            setIsOpen(false);
                                        }}
                                        className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-paw-orange/15 hover:text-paw-orange transition-all cursor-pointer"
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-[10px] text-gray-400 truncate">
                                {helperText || '12-Hour Format'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-paw-orange hover:underline font-bold text-xs cursor-pointer ml-2 shrink-0"
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

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ModernDateTimePickerProps {
    value: string; // "YYYY-MM-DDTHH:MM" or "YYYY-MM-DD HH:MM"
    onChange: (val: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    maxDate?: string;
    className?: string;
    id?: string;
}

export function ModernDateTimePicker({
    value,
    onChange,
    label,
    placeholder = 'Select date and time...',
    required = false,
    error,
    maxDate,
    className = '',
    id
}: ModernDateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');
    const containerRef = useRef<HTMLDivElement>(null);

    // Split value into date and time
    const [datePart, setDatePart] = useState('');
    const [timePart, setTimePart] = useState('09:00');

    useEffect(() => {
        if (value) {
            const separator = value.includes('T') ? 'T' : ' ';
            const [d, t] = value.split(separator);
            if (d) setDatePart(d);
            if (t) setTimePart(t.slice(0, 5));
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

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const initialDate = datePart ? new Date(datePart + 'T00:00:00') : today;

    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const handleSelectDay = (day: number) => {
        const newDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setDatePart(newDate);
        onChange(`${newDate}T${timePart || '09:00'}`);
        setActiveTab('time'); // guide user to time next
    };

    const handleTimeChange = (newTime: string) => {
        setTimePart(newTime);
        const effectiveDate = datePart || todayStr;
        setDatePart(effectiveDate);
        onChange(`${effectiveDate}T${newTime}`);
    };

    // Formatted display
    const formatDisplay = () => {
        if (!datePart) return null;
        const [y, m, d] = datePart.split('-').map(Number);
        if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
        const dateObj = new Date(y, m - 1, d);
        const dateStr = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        if (!timePart) return dateStr;
        const [hStr, mStr] = timePart.split(':');
        let h = parseInt(hStr, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        if (h === 0) h = 12;
        else if (h > 12) h -= 12;
        return `${dateStr} at ${String(h).padStart(2, '0')}:${mStr || '00'} ${ampm}`;
    };

    const displayString = formatDisplay();

    // Time presets (24h internal values)
    const timePresets = [
        { label: '8:00 AM', value: '08:00' },
        { label: '10:00 AM', value: '10:00' },
        { label: '12:00 PM', value: '12:00' },
        { label: '2:00 PM', value: '14:00' },
        { label: '4:00 PM', value: '16:00' },
        { label: '6:00 PM', value: '18:00' },
        { label: '8:00 PM', value: '20:00' }
    ];

    return (
        <div className={`relative w-full ${className}`} ref={containerRef} id={id}>
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
                        <CalendarIcon size={14} />
                    </div>
                    <span className={`text-xs sm:text-sm font-bold truncate ${displayString ? 'text-paw-navy dark:text-white' : 'text-gray-400'}`}>
                        {displayString || placeholder}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 shrink-0 ml-2">
                    {value && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDatePart('');
                                setTimePart('09:00');
                                onChange('');
                            }}
                            className="p-1 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            title="Clear"
                        >
                            <X size={12} />
                        </button>
                    )}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-paw-orange' : ''}`} />
                </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}

            {/* Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-0 z-50 mt-2 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-gray-100 dark:border-slate-800 ring-1 ring-black/10 w-full sm:w-[310px]"
                    >
                        {/* Tab Switcher: Date / Time */}
                        <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl mb-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab('date')}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                                    activeTab === 'date'
                                        ? 'bg-white dark:bg-slate-900 text-paw-navy dark:text-white shadow-xs'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-paw-navy'
                                }`}
                            >
                                <CalendarIcon size={13} className={activeTab === 'date' ? 'text-paw-orange' : ''} />
                                <span>{datePart ? datePart : 'Date'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('time')}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                                    activeTab === 'time'
                                        ? 'bg-white dark:bg-slate-900 text-paw-navy dark:text-white shadow-xs'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-paw-navy'
                                }`}
                            >
                                <Clock size={13} className={activeTab === 'time' ? 'text-paw-orange' : ''} />
                                <span>{timePart || 'Time'}</span>
                            </button>
                        </div>

                        {/* Date Tab */}
                        {activeTab === 'date' && (
                            <div>
                                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-100 dark:border-slate-800">
                                    <span className="font-black text-sm text-paw-navy dark:text-white">
                                        {monthNames[viewMonth]} {viewYear}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (viewMonth === 0) {
                                                    setViewMonth(11);
                                                    setViewYear(v => v - 1);
                                                } else {
                                                    setViewMonth(v => v - 1);
                                                }
                                            }}
                                            className="w-7 h-7 rounded-lg text-paw-navy dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (viewMonth === 11) {
                                                    setViewMonth(0);
                                                    setViewYear(v => v + 1);
                                                } else {
                                                    setViewMonth(v => v + 1);
                                                }
                                            }}
                                            className="w-7 h-7 rounded-lg text-paw-navy dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-1 mb-1">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                                        <div key={d} className={`text-center text-[10px] font-bold uppercase py-0.5 ${i === 0 || i === 6 ? 'text-paw-orange' : 'text-gray-400'}`}>
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                        <div key={`empty-${i}`} className="w-8 h-8" />
                                    ))}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const dayNum = i + 1;
                                        const cellStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                        const isSelected = datePart === cellStr;
                                        const isToday = cellStr === todayStr;
                                        return (
                                            <button
                                                type="button"
                                                key={dayNum}
                                                onClick={() => handleSelectDay(dayNum)}
                                                className={`w-8 h-8 mx-auto rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all relative ${
                                                    isSelected
                                                        ? 'bg-paw-orange text-white shadow-sm'
                                                        : 'text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-slate-800'
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
                            </div>
                        )}

                        {/* Time Tab */}
                        {activeTab === 'time' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-xs font-black uppercase tracking-wider text-paw-navy dark:text-white">
                                        Selected: {formatDisplay()?.split(' at ')[1] || '09:00 AM'}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                                        Common Times
                                    </label>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {timePresets.map((preset) => (
                                            <button
                                                type="button"
                                                key={preset.value}
                                                onClick={() => handleTimeChange(preset.value)}
                                                className={`p-2 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                                                    timePart === preset.value
                                                        ? 'bg-paw-orange text-white shadow-sm'
                                                        : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                <span>{preset.label}</span>
                                                {timePart === preset.value && <span className="text-[10px]">✓</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                                        Manual Hour (1-12)
                                    </label>
                                    <div className="grid grid-cols-6 gap-1">
                                        {[8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7].map((h) => {
                                            const h24 = h < 8 ? h + 12 : h;
                                            const val24 = `${String(h24).padStart(2, '0')}:00`;
                                            const isSelected = timePart.startsWith(String(h24).padStart(2, '0'));
                                            return (
                                                <button
                                                    type="button"
                                                    key={h}
                                                    onClick={() => handleTimeChange(val24)}
                                                    className={`py-1 rounded-lg text-xs font-bold transition-all ${
                                                        isSelected
                                                            ? 'bg-paw-orange text-white'
                                                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {h}{h < 8 ? 'p' : 'a'}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                            <button
                                type="button"
                                onClick={() => {
                                    const now = new Date();
                                    const nowD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                                    const nowT = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                                    setDatePart(nowD);
                                    setTimePart(nowT);
                                    onChange(`${nowD}T${nowT}`);
                                }}
                                className="text-[10px] font-bold text-paw-orange hover:underline"
                            >
                                Set to Now
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-paw-orange hover:underline font-bold text-xs"
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

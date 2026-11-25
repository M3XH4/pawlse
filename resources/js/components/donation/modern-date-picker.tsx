import React from 'react';
import type {
    ModernDatePickerProps as BaseProps} from '@/components/ui/modern-date-picker';
import {
    ModernDatePicker as BaseModernDatePicker
} from '@/components/ui/modern-date-picker';

export interface ModernDatePickerProps extends Partial<BaseProps> {
    value: string;
    onChange: (date: string) => void;
}

export function ModernDatePicker({
    value,
    onChange,
    minDate = new Date().toISOString().split('T')[0],
    label = 'Drop-Off Date',
    required = false,
    helperText = 'Shelter drop-off hours: 9:00 AM – 5:00 PM',
    ...props
}: ModernDatePickerProps) {
    return (
        <BaseModernDatePicker
            value={value}
            onChange={onChange}
            minDate={minDate}
            label={label}
            required={required}
            helperText={helperText}
            variant="card"
            showPresets={true}
            {...props}
        />
    );
}

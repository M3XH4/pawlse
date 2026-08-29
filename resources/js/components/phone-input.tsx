import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { formatPhoneNumber } from '@/lib/phone-formatter';
import { cn } from '@/lib/utils';

export interface PhoneInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value?: string;
    onChange?: (value: string) => void;
    onRawChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ value = '', onChange, onRawChange, className, onFocus, onBlur, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawVal = e.target.value;
            // If user cleared everything, let it be empty
            if (rawVal === '' || rawVal === '+') {
                onChange?.('');
                onRawChange?.(e);
                return;
            }

            const formatted = formatPhoneNumber(rawVal);
            onChange?.(formatted);
            onRawChange?.(e);
        };

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            if (!value || value.trim() === '') {
                onChange?.('+63 ');
            }
            onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            if (value.trim() === '+63' || value.trim() === '+63 ') {
                onChange?.('');
            }
            onBlur?.(e);
        };

        return (
            <Input
                {...props}
                ref={ref}
                type="tel"
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="+63 9XX XXX XXXX"
                className={cn('font-medium', className)}
            />
        );
    }
);

PhoneInput.displayName = 'PhoneInput';

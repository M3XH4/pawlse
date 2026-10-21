import { Check, X } from 'lucide-react';
import { useMemo } from 'react';

type PasswordStrengthIndicatorProps = {
    password: string;
};

type Rule = {
    label: string;
    valid: boolean;
};

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const { score, label, colorClass, textColorClass, rules } = useMemo(() => {
        const hasLength = password.length >= 8;
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        const activeRules: Rule[] = [
            { label: 'At least 8 characters', valid: hasLength },
            { label: 'Uppercase & lowercase letters', valid: hasLower && hasUpper },
            { label: 'At least 1 number', valid: hasNumber },
            { label: 'At least 1 special character', valid: hasSpecial },
        ];

        if (!password) {
            return {
                score: 0,
                label: 'Enter password',
                colorClass: 'bg-gray-200 dark:bg-gray-700',
                textColorClass: 'text-gray-400',
                rules: activeRules,
            };
        }

        const validCount = [
            hasLength,
            hasLower,
            hasUpper,
            hasNumber,
            hasSpecial,
        ].filter(Boolean).length;

        let calculatedScore = 1;

        if (password.length >= 8) {
            if (validCount <= 2) {
                calculatedScore = 2; // Fair
            } else if (validCount <= 4) {
                calculatedScore = 3; // Good
            } else {
                calculatedScore = 4; // Strong
            }
        } else {
            calculatedScore = 1; // Weak if less than 8 chars
        }

        const levels: Record<number, { label: string; color: string; text: string }> = {
            1: { label: 'Weak', color: 'bg-red-500', text: 'text-red-500' },
            2: { label: 'Fair', color: 'bg-paw-orange', text: 'text-paw-orange' },
            3: { label: 'Good', color: 'bg-amber-500', text: 'text-amber-500' },
            4: { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' },
        };

        const currentLevel = levels[calculatedScore];

        return {
            score: calculatedScore,
            label: currentLevel.label,
            colorClass: currentLevel.color,
            textColorClass: currentLevel.text,
            rules: activeRules,
        };
    }, [password]);

    return (
        <div className="mt-2 space-y-2">
            {/* Visual Segments */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-1 items-center gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                score >= step
                                    ? colorClass
                                    : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        />
                    ))}
                </div>
                {password && (
                    <span
                        className={`text-[10px] font-black uppercase tracking-wider ${textColorClass} shrink-0`}
                    >
                        {label}
                    </span>
                )}
            </div>

            {/* Criteria checklist */}
            {password && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                    {rules.map((rule, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                                rule.valid
                                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                    : 'text-gray-400 dark:text-gray-500'
                            }`}
                        >
                            {rule.valid ? (
                                <Check size={12} className="stroke-[3] text-emerald-500 shrink-0" />
                            ) : (
                                <X size={12} className="stroke-[2] text-gray-300 dark:text-gray-600 shrink-0" />
                            )}
                            <span>{rule.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

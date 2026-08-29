/**
 * Utility for formatting and validating Philippine phone numbers.
 * 
 * Standard Philippine mobile format: +63 9XX XXX XXXX (10 digits after +63, or 11 digits starting with 09)
 */

export function formatPhoneNumber(value: string): string {
    if (!value) return '';

    // Extract all digits
    let digits = value.replace(/\D/g, '');

    // Normalize country code / leading zero
    if (digits.startsWith('63')) {
        digits = digits.slice(2);
    } else if (digits.startsWith('0')) {
        digits = digits.slice(1);
    }

    // Limit to 10 digits max (e.g., 9XX XXX XXXX)
    digits = digits.slice(0, 10);

    if (digits.length === 0) {
        return value.startsWith('+') ? '+63 ' : '';
    }

    // Format as +63 9XX XXX XXXX
    let formatted = '+63';
    if (digits.length > 0) {
        formatted += ' ' + digits.slice(0, 3);
    }
    if (digits.length > 3) {
        formatted += ' ' + digits.slice(3, 6);
    }
    if (digits.length > 6) {
        formatted += ' ' + digits.slice(6, 10);
    }

    return formatted;
}

/**
 * Validates that the input is a valid 10/11 digit Philippine mobile number.
 */
export function isValidPhoneNumber(value: string): boolean {
    if (!value || value.trim() === '' || value.trim() === '+63') return true;
    
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('63')) {
        digits = digits.slice(2);
    } else if (digits.startsWith('0')) {
        digits = digits.slice(1);
    }

    return digits.length === 10 && digits.startsWith('9');
}

/**
 * Formats value into standard database / API payload string.
 */
export function cleanPhoneNumber(value: string): string {
    if (!value) return '';
    return formatPhoneNumber(value);
}

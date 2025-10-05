/**
 * Shared formatting utilities for consistent data display
 * Used across manage pages for dates, file sizes, numbers etc.
 */

/**
 * Format date and time in a consistent locale-aware format
 * @param value - ISO date string, null, or undefined
 * @param locale - Locale string (e.g., 'zh-TW', 'en')
 * @returns Formatted date string or empty string if invalid
 *
 * @example
 * formatDateTime('2024-03-15T10:30:00Z', 'zh-TW') // "2024/03/15 10:30"
 * formatDateTime(null, 'en') // ""
 */
export function formatDateTime(value: string | null | undefined, locale: string): string {
    if (!value) {
        return '';
    }

    try {
        return new Date(value).toLocaleString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '';
    }
}

/**
 * Format file size in human-readable format with appropriate units
 * @param bytes - File size in bytes
 * @param locale - Locale string for number formatting
 * @returns Formatted file size string (e.g., "1.5 MB")
 *
 * @example
 * formatBytes(1536000, 'zh-TW') // "1.5 MB"
 * formatBytes(0, 'en') // "0 B"
 */
export function formatBytes(bytes: number, locale: string): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** exponent;

    return `${new Intl.NumberFormat(locale, {
        maximumFractionDigits: value >= 100 ? 0 : 1
    }).format(value)} ${units[exponent]}`;
}

/**
 * Format number with locale-aware thousand separators
 * @param value - Number to format
 * @param locale - Locale string
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567, 'zh-TW') // "1,234,567"
 * formatNumber(1234.56, 'en') // "1,234.56"
 */
export function formatNumber(value: number, locale: string): string {
    return new Intl.NumberFormat(locale).format(value);
}

import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types/shared';

type LocaleKey = 'zh-TW' | 'en';

type ReplacementValues = Record<string, string | number>;

const resolve = (source: Record<string, any>, path: string) =>
    path.split('.').reduce<any>((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source);

const applyReplacements = (value: string, replacements?: ReplacementValues): string => {
    if (!replacements) {
        return value;
    }

    return value.replace(/:([A-Za-z0-9_]+)/g, (match, key) =>
        Object.prototype.hasOwnProperty.call(replacements, key) ? String(replacements[key]) : match,
    );
};

export function useTranslator(namespace: string = 'common') {
    const page = usePage<SharedData & { i18n?: Record<string, any> }>();
    const { locale, i18n } = page.props;
    const localeKey: LocaleKey = locale?.toLowerCase() === 'zh-tw' ? 'zh-TW' : 'en';

    const messages = (i18n?.[namespace] ?? {}) as Record<LocaleKey, Record<string, any>>;
    const current = messages[localeKey] ?? {};
    const fallback = messages['zh-TW'] ?? {};

    const t = (key: string, fallbackText?: string, replacements?: ReplacementValues): string => {
        const localized = resolve(current, key);
        if (typeof localized === 'string') {
            return applyReplacements(localized, replacements);
        }

        const fallbackValue = resolve(fallback, key);
        if (typeof fallbackValue === 'string') {
            return applyReplacements(fallbackValue, replacements);
        }

        if (fallbackText) {
            return applyReplacements(fallbackText, replacements);
        }

        return key;
    };

    return { t, localeKey, isZh: localeKey === 'zh-TW', messages: current };
}

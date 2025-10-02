import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types/shared';

type LocaleKey = 'zh-TW' | 'en';

type ReplacementValues = Record<string, string | number>;

interface NestedMessages {
    [key: string]: string | NestedMessages;
}

type NamespacedMessages = Record<LocaleKey, NestedMessages>;

const applyReplacements = (value: string, replacements?: ReplacementValues): string => {
    if (!replacements) {
        return value;
    }

    return value.replace(/:([A-Za-z0-9_]+)/g, (match, key) =>
        Object.prototype.hasOwnProperty.call(replacements, key) ? String(replacements[key]) : match,
    );
};

const resolveMessage = (source: NestedMessages, path: string): string | NestedMessages | undefined => {
    return path.split('.').reduce<string | NestedMessages | undefined>((accumulator, segment) => {
        if (accumulator === undefined) {
            return undefined;
        }

        if (typeof accumulator === 'string') {
            return accumulator;
        }

        return accumulator[segment];
    }, source);
};

export function useTranslator(namespace: string = 'common') {
    const page = usePage<SharedData>();
    const { locale, i18n } = page.props;
    const localeKey: LocaleKey = locale?.toLowerCase() === 'zh-tw' ? 'zh-TW' : 'en';

    const namespaceMessages: NamespacedMessages =
        typeof i18n === 'object' && i18n !== null && namespace in i18n && typeof i18n[namespace] === 'object'
            ? (i18n[namespace] as NamespacedMessages)
            : ({
                  'zh-TW': {},
                  en: {},
              } satisfies NamespacedMessages);

    const current = namespaceMessages[localeKey] ?? {};
    const fallback = namespaceMessages['zh-TW'] ?? {};

    const t = (key: string, fallbackText?: string, replacements?: ReplacementValues): string => {
        const localized = resolveMessage(current, key);
        if (typeof localized === 'string') {
            return applyReplacements(localized, replacements);
        }

        const fallbackValue = resolveMessage(fallback, key);
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

import { useTranslator } from './use-translator';

/**
 * 提供符合舊版程式使用方式的翻譯 Hook，統一返回 t 與 locale 兩個欄位。
 * 由於部分頁面（例如教職員管理）仍引用 useTranslation，此處包裝 useTranslator 以維持相容性。
 */
export function useTranslation(namespace: string = 'manage') {
    const { t, localeKey } = useTranslator(namespace);

    return {
        t,
        locale: localeKey,
    };
}

export type UseTranslationReturn = ReturnType<typeof useTranslation>;

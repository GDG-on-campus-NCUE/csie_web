export type TranslatorFn = (
    key: string,
    fallback?: string | null,
    replacements?: Record<string, unknown>
) => string;

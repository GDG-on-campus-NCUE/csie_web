import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { useTranslator } from '@/hooks/use-translator';
import type { SharedData } from '@/types';


interface LanguageSwitcherProps {
    className?: string;
}
export default function LanguageSwitcher({
    className = '',
}: LanguageSwitcherProps) {
    const { locale } = usePage<SharedData>().props as SharedData & { locale: string };
    const { t } = useTranslator('common');
    const isZh = locale === 'zh-TW';
    const zhUrl = `/lang/zh-TW`;
    const enUrl = `/lang/en`;
    const zhBtnText = '繁中';
    const enBtnText = 'EN';

    return (
        <button
            type="button"
            className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 bg-white/30 text-white shadow-inner shadow-black/20 hover:bg-white/40 hover:shadow hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0',
                className,
            )}
            aria-label={t('layout.language_label', '語言')}
            onClick={() => {
                window.location.href = isZh ? enUrl : zhUrl;
            }}
        >
            {isZh ? zhBtnText : enBtnText}
        </button>
    );
}

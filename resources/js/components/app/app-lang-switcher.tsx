import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { AppInlineActionButton, AppInlineActionLabel } from '@/components/app/app-inline-action';

interface LanguageSwitcherProps {
    className?: string;
}
export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
    const { locale } = usePage<SharedData>().props as SharedData & { locale: string };
    const { t } = useTranslator('common');
    const isZh = locale === 'zh-TW';
    const zhUrl = `/lang/zh-TW`;
    const enUrl = `/lang/en`;
    const zhBtnText = '繁中';
    const enBtnText = 'EN';

    const handleLanguageSwitch = () => {
        const targetUrl = isZh ? enUrl : zhUrl;
        router.visit(targetUrl, {
            method: 'get',
            preserveState: false,
            preserveScroll: false,
        });
    };

    return (
        <AppInlineActionButton
            onClick={handleLanguageSwitch}
            aria-label={t('layout.language_label', '語言')}
            className={cn('text-neutral-900', className)}
        >
            <Languages
                aria-hidden
                className="h-3.5 w-3.5 text-current transition-transform duration-200 group-hover:-translate-y-0.5"
                strokeWidth={1.6}
            />
            <AppInlineActionLabel className="uppercase tracking-[0.18em]">
                {isZh ? zhBtnText : enBtnText}
            </AppInlineActionLabel>
        </AppInlineActionButton>
    );
}

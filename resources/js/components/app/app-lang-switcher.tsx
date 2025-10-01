import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/shared/utils';
import type { SharedData } from '@/types/shared';
import { usePage, router } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { AppInlineActionButton, AppInlineActionLabel } from '@/components/app/app-header-inline-action';

type LanguageSwitcherVariant = 'default' | 'light';

interface LanguageSwitcherProps {
    className?: string;
    variant?: LanguageSwitcherVariant;
}

export default function LanguageSwitcher({ className = '', variant = 'default' }: LanguageSwitcherProps) {
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

    const variantClassName =
        variant === 'light'
            ? 'text-slate-600 hover:text-slate-700 focus-visible:ring-slate-300'
            : 'text-neutral-900';

    return (
        <AppInlineActionButton
            onClick={handleLanguageSwitch}
            aria-label={t('layout.language_label', '語言')}
            className={cn(variantClassName, className)}
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

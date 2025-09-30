import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { Languages } from 'lucide-react';

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
        <button
            type="button"
            className={cn(
                'group inline-flex items-center gap-1 rounded-md bg-transparent px-2.5 py-1 text-sm font-bold leading-none text-neutral-900 transition-colors duration-200 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-0',
                className,
            )}
            aria-label={t('layout.language_label', '語言')}
            onClick={handleLanguageSwitch}
        >
            <span className="flex items-center gap-1">
                <Languages
                    aria-hidden
                    className="h-3.5 w-3.5 text-current transition-transform duration-200 group-hover:-translate-y-0.5"
                    strokeWidth={1.6}
                />
                <span className="relative uppercase tracking-[0.18em]">
                    <span className="relative z-10">{isZh ? zhBtnText : enBtnText}</span>
                    <span className="absolute left-0 top-full mt-0.5 h-[1px] w-full origin-left scale-x-0 bg-neutral-900 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </span>
            </span>
        </button>
    );
}

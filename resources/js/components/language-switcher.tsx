import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useTranslator } from '@/hooks/use-translator';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher({
    className = '',
    variant = 'dark',
}: {
    className?: string;
    variant?: 'dark' | 'light';
}) {
    const { locale } = usePage<SharedData>().props as SharedData & { locale: string };
    const { t } = useTranslator('auth');

    const isZh = locale?.toLowerCase() === 'zh-tw';
    const basePath = '/lang';
    const zhUrl = `${basePath}/zh-TW`;
    const enUrl = `${basePath}/en`;

    const isLight = variant === 'light';
    const [isCompact, setIsCompact] = useState(false);

    useEffect(() => {
        // 針對寬度進行監聽，當畫面過窄時改為精簡版的語言切換按鈕
        if (typeof window === 'undefined') {
            return;
        }

        const mediaQuery = window.matchMedia('(max-width: 420px)');

        const updateCompactMode = (event: MediaQueryList | MediaQueryListEvent) => {
            setIsCompact(event.matches);
        };

        updateCompactMode(mediaQuery);

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', updateCompactMode);
        } else {
            mediaQuery.addListener(updateCompactMode);
        }

        return () => {
            if (typeof mediaQuery.removeEventListener === 'function') {
                mediaQuery.removeEventListener('change', updateCompactMode);
            } else {
                mediaQuery.removeListener(updateCompactMode);
            }
        };
    }, []);

    const triggerClass = (active: boolean) =>
        cn(
            'inline-flex items-center rounded-full px-2.5 py-1 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
            isLight
                ? active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow shadow-blue-500/30 hover:shadow-md hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0'
                    : 'text-slate-500 hover:bg-white/80 hover:text-slate-700 hover:-translate-y-0.5 active:translate-y-0'
                : active
                    ? 'bg-white/30 text-white shadow-inner shadow-black/20 hover:bg-white/40 hover:shadow hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0'
                    : 'text-white/75 hover:bg-white/20 hover:text-white hover:-translate-y-0.5 active:translate-y-0',
        );

    if (isCompact) {
        return (
            <button
                type="button"
                className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
                    isLight
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow shadow-blue-500/30 hover:shadow-md hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0'
                        : 'bg-white/30 text-white shadow-inner shadow-black/20 hover:bg-white/40 hover:shadow hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0',
                    className,
                )}
                aria-label={t('layout.language_label', '語言')}
                onClick={() => {
                    window.location.href = isZh ? enUrl : zhUrl;
                }}
            >
                {isZh ? '繁中' : 'EN'}
            </button>
        );
    }

    const wrapperClass = cn(
        'inline-flex items-center gap-1 rounded-full border px-5 py-1 text-[13px] font-semibold backdrop-blur transition',
        isLight
            ? 'border-slate-200 bg-white/80 text-slate-600 shadow-sm hover:shadow-md'
            : 'border-white/20 bg-white/10 text-white/70 shadow-sm shadow-black/10 hover:shadow-lg hover:shadow-black/20',
        className,
    );

    return (
        <div
            className={wrapperClass}
            role="group"
            aria-label={t('layout.language_label', '語言')}
        >
            {isLight && (
                <span className="hidden pr-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:inline">
                    {t('layout.language_label', '語言')}
                </span>
            )}
            <a href={zhUrl} className={triggerClass(isZh)} aria-current={isZh ? 'true' : undefined}>
                繁中
            </a>
            <span className={cn('px-0.5 text-xs', isLight ? 'text-slate-300' : 'text-white/40')}>/</span>
            <a href={enUrl} className={triggerClass(!isZh)} aria-current={!isZh ? 'true' : undefined}>
                EN
            </a>
        </div>
    );
}

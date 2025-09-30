import LanguageSwitcher from '@/components/app-lang-switcher';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';
import { home } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
    noDecor?: boolean;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
    noDecor = false,
}: PropsWithChildren<AuthLayoutProps>) {
    const page = usePage<SharedData>();
    const { quote } = page.props;
    const { t } = useTranslator('common');
    const { t: authT } = useTranslator('auth');

    const showAccent = !noDecor;
    const quoteMessage = quote?.message ?? '';
    const quoteAuthor = quote?.author ? `— ${quote.author}` : '';

    return (
        <div
            className={cn(
                'relative min-h-svh overflow-hidden',
                showAccent ? 'bg-slate-950' : 'bg-slate-100',
            )}
        >
            {showAccent && (
                <div className="pointer-events-none absolute inset-x-0 top-[-32%] z-0 flex justify-center blur-3xl">
                    <div className="h-72 w-[680px] rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 opacity-40"></div>
                </div>
            )}

            <div className="relative z-10 flex min-h-svh items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div
                    className={cn(
                        'w-full overflow-hidden rounded-[32px] border bg-white/95 backdrop-blur-xl',
                        showAccent
                            ? 'max-w-5xl border-white/20 shadow-[0_30px_90px_rgba(15,23,42,0.45)]'
                            : 'max-w-2xl border-slate-200 shadow-2xl',
                    )}
                >
                    <div
                        className={cn(
                            'grid grid-cols-1',
                            showAccent ? 'md:grid-cols-[1.05fr_minmax(0,1fr)]' : '',
                        )}
                    >
                        {showAccent && (
                            <div className="relative hidden flex-col justify-between bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-12 text-slate-100 md:flex">
                                <div className="space-y-6">
                                    <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                                        {authT('layout.headline', '資工系資訊系統入口')}
                                    </span>
                                    <p className="text-3xl font-semibold leading-snug text-white">
                                        {authT('layout.subheadline', '整合公告、課程與研究資訊的一站式平台。')}
                                    </p>

                                    {quoteMessage ? (
                                        <div className="space-y-3 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                                            <p className="text-base font-medium leading-relaxed text-white/95">{quoteMessage}</p>
                                            {quoteAuthor && (
                                                <p className="text-xs uppercase tracking-[0.32em] text-white/60">{quoteAuthor}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                                            {authT('layout.quote_label', '今日金句')}
                                        </div>
                                    )}
                                </div>

                                <div className="text-xs text-white/60">
                                    {authT('layout.footer', '國立彰化師範大學 · 資訊工程學系')}
                                </div>
                            </div>
                        )}

                        <div className={cn('relative px-8 py-10 sm:px-12 sm:py-12', showAccent ? 'bg-white/95' : 'bg-white')}>
                            <div className="flex flex-col gap-8">
                                <div className="flex items-start justify-between gap-6">
                                    <Link href={home()} className="flex items-center gap-4 text-left" aria-label={t('site.title_short', '資工系')}>
                                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                                            <img
                                                src="https://www.csie.ncue.edu.tw/csie/resources/images/ncue-csie-logo.png"
                                                alt="NCUE CSIE Logo"
                                                className="h-14 w-14 object-contain"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold text-slate-900">{t('site.title_short', '資工系')}</p>
                                            <p className="text-sm text-slate-500">{t('site.university', '國立彰化師範大學')}</p>
                                        </div>
                                    </Link>

                                    <LanguageSwitcher variant="light" />
                                </div>

                                <div className="space-y-3 text-left">
                                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
                                    <p className="text-base leading-7 text-slate-600">{description}</p>
                                </div>

                                <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-6 shadow-sm shadow-slate-200/60">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

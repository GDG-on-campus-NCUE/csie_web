import { AuthCard } from '@/components/auth/auth-card';
import { AuthFooter } from '@/components/auth/auth-footer';
import LanguageSwitcher from '@/components/app/app-lang-switcher';
import { useTranslator } from '@/hooks/use-translator';
import type { SharedData } from '@/types/shared';
import { home } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title: string;
    description?: string;
    heroTitle?: string;
    heroDescription?: string;
    showFooter?: boolean;
}

export default function AuthLayout({
    children,
    title,
    description,
    heroTitle,
    heroDescription,
    showFooter = true,
}: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;
    const { t } = useTranslator('auth');
    const { t: tCommon } = useTranslator('common');

    const resolvedHeroTitle = heroTitle ?? t('layout.headline', '資工系資訊系統入口');
    const resolvedHeroDescription = heroDescription ?? t('layout.subheadline', '整合公告、課程與研究資訊的一站式平台。');
    const quoteMessage = quote?.message?.trim() ?? '';
    const quoteAuthor = quote?.author ? `— ${quote.author}` : '';

    const siteTitle = tCommon('site.title_short', name ?? '資工系');
    const siteUniversity = tCommon('site.university', '國立彰化師範大學');

    return (
        <div className="relative min-h-svh overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
            <div className="pointer-events-none absolute inset-x-0 top-[-28%] h-[480px] bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.2),transparent_60%)] blur-3xl" />

            <div className="relative mx-auto flex min-h-svh w-full max-w-6xl flex-col lg:grid lg:grid-cols-[1fr_minmax(0,420px)] lg:gap-16">
                <aside className="relative hidden flex-col justify-between overflow-hidden rounded-br-[48px] bg-white/90 px-12 py-16 shadow-[0_32px_120px_rgba(15,23,42,0.12)] lg:flex">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),transparent_55%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.14),transparent_60%)]" />

                    <div className="relative space-y-10 text-left">
                        <Link
                            href={home()}
                            className="group flex items-center gap-4 text-slate-900 transition-colors hover:translate-y-0 hover:filter-none hover:shadow-none hover:text-slate-900"
                            aria-label={siteTitle}
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <img
                                    src="https://www.csie.ncue.edu.tw/csie/resources/images/ncue-csie-logo.png"
                                    alt={siteTitle}
                                    className="h-12 w-12 object-contain"
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-semibold text-slate-900 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 group-hover:text-blue-700">
                                    {siteTitle}
                                </p>
                                <p className="text-sm text-slate-500 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 group-hover:text-blue-600/80">
                                    {siteUniversity}
                                </p>
                            </div>
                        </Link>

                        <div className="space-y-6">
                            <h2 className="font-serif text-4xl font-semibold text-slate-900 xl:text-5xl">{resolvedHeroTitle}</h2>
                            <p className="text-lg leading-8 text-slate-600">{resolvedHeroDescription}</p>
                        </div>
                    </div>

                    <div className="relative space-y-3 rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur">
                        <p className="text-base font-medium leading-7 text-slate-700">
                            {quoteMessage || t('layout.quote_label', '今日金句')}
                        </p>
                        {quoteMessage && (
                            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{quoteAuthor}</p>
                        )}
                        <div className="pt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                            {t('layout.footer', '國立彰化師範大學 · 資訊工程學系')}
                        </div>
                    </div>
                </aside>

                <section className="relative flex min-h-svh items-center justify-center px-6 py-12 sm:px-10 lg:px-0 lg:py-20">
                    <div className="w-full max-w-md space-y-10">
                        <div className="flex items-center justify-between gap-4 lg:justify-end">
                            <Link
                                href={home()}
                                className="group flex items-center gap-3 text-slate-900 transition-colors hover:translate-y-0 hover:filter-none hover:shadow-none hover:text-slate-900 lg:hidden"
                                aria-label={siteTitle}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <img
                                        src="https://www.csie.ncue.edu.tw/csie/resources/images/ncue-csie-logo.png"
                                        alt={siteTitle}
                                        className="h-10 w-10 object-contain"
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-lg font-semibold text-slate-900 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 group-hover:text-blue-700">
                                        {siteTitle}
                                    </p>
                                    <p className="text-xs text-slate-500 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 group-hover:text-blue-600/80">
                                        {siteUniversity}
                                    </p>
                                </div>
                            </Link>

                            <LanguageSwitcher variant="light" />
                        </div>

                        <AuthCard title={title} description={description}>
                            <div className="space-y-8">{children}</div>
                        </AuthCard>

                        {showFooter && <AuthFooter className="text-center" />}
                    </div>
                </section>
            </div>
        </div>
    );
}

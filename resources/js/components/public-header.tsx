import { Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import LanguageSwitcher from './app/app-lang-switcher';
import FloatingNav from '@/components/floating-nav';
import MobileFloatingSettings from '@/components/mobile-floating-settings';
import { Mail, MapPin, Phone, Search, ArrowRight, GraduationCap, Users } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { useTranslator } from '@/hooks/use-translator';

interface NavChild {
    key: string;
    label: string;
    description?: string;
    href: string;
}

interface NavGroup {
    key: string;
    label: string;
    href: string;
    description?: string;
    children?: NavChild[];
}

export default function PublicHeader() {
    const page = usePage<SharedData & { i18n: any; auth: any }>();
    const { auth } = page.props;
    const { t } = useTranslator('common');

    const navGroups: NavGroup[] = [
        {
            key: 'about',
            label: t('nav.about', '關於系所'),
            href: '#about',
            description: t('nav.about_description', '了解系所願景與學習環境'),
            children: [
                {
                    key: 'about-overview',
                    label: t('nav.about_overview', '系所簡介'),
                    description: t('nav.about_overview_desc', '我們的願景、使命與發展重點'),
                    href: '#about',
                },
                {
                    key: 'about-highlights',
                    label: t('nav.about_highlights', '特色亮點'),
                    description: t('nav.about_highlights_desc', '卓越教學成果與跨域合作'),
                    href: '#highlights',
                },
                {
                    key: 'about-partnership',
                    label: t('nav.about_partnership', '產學合作'),
                    description: t('nav.about_partnership_desc', '與業界攜手培育人才'),
                    href: '#partners',
                },
            ],
        },
        {
            key: 'people',
            label: t('nav.people', '師資團隊'),
            href: '/people',
            description: t('nav.people_description', '探索師資與行政團隊的背景'),
            children: [
                {
                    key: 'people-faculty',
                    label: t('people.faculty', '專任師資'),
                    description: t('nav.people_faculty_desc', '查看教授、教師陣容'),
                    href: '/people?role=faculty',
                },
                {
                    key: 'people-staff',
                    label: t('people.staff', '行政團隊'),
                    description: t('nav.people_staff_desc', '了解系所行政與專業助理'),
                    href: '/people?role=staff',
                },
            ],
        },
        {
            key: 'research',
            label: t('nav.research', '研究實驗室'),
            href: '/labs',
            description: t('nav.research_description', '掌握實驗室研究主題與成果'),
            children: [
                {
                    key: 'research-labs',
                    label: t('nav.labs', '全部實驗室'),
                    description: t('nav.research_labs_desc', '探索資訊工程各領域的研究團隊'),
                    href: '/labs',
                },
            ],
        },
        {
            key: 'bulletins',
            label: t('nav.bulletin', '公告訊息'),
            href: '/bulletins',
            description: t('nav.bulletin_description', '掌握最新公告、活動與招生資訊'),
        },
        {
            key: 'contact',
            label: t('nav.contact', '聯絡我們'),
            href: '#contact',
            description: t('nav.contact_description', '招生、合作與校友服務窗口'),
        },
    ];

    const mobileNav = navGroups.flatMap((group) => [
        { key: group.key, href: group.href, label: group.label },
        ...(group.children?.map((child) => ({ key: child.key, href: child.href, label: `- ${child.label}` })) ?? []),
    ]);

    const isAuthenticated = Boolean(auth?.user);

    return (
        <header className="relative z-50 text-white">
            <div className="bg-[#050f2e]/95 supports-[backdrop-filter]:bg-[#050f2e]/80 border-b border-white/10 backdrop-blur">
                <div className="content-container flex flex-col gap-3 py-3 text-xs md:flex-row md:items-center md:justify-between md:text-sm">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/70">
                        <span className="flex items-center gap-2">
                            <MapPin className="size-4 text-white/50" />
                            <span>Changhua, Taiwan</span>
                        </span>
                        <a className="flex items-center gap-2 transition hover:text-white" href="tel:+886-4-7232105">
                            <Phone className="size-4 text-white/50" />
                            <span>+886-4-723-2105</span>
                        </a>
                        <a className="flex items-center gap-2 transition hover:text-white" href="mailto:csie@ncue.edu.tw">
                            <Mail className="size-4 text-white/50" />
                            <span>csie@ncue.edu.tw</span>
                        </a>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur md:flex">
                            <Search className="size-4 text-white/60" />
                            <input
                                type="search"
                                placeholder={t('search', '搜尋')}
                                className="w-40 bg-transparent text-white placeholder:text-white/60 focus:outline-none"
                                aria-label={t('search', '搜尋')}
                            />
                        </div>
                        {/* 保留桌面版語言切換器 */}
                        <div className="hidden md:block">
                            <LanguageSwitcher className="text-white/75" />
                        </div>
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium transition hover:border-white hover:bg-white/15"
                            >
                                {t('auth.dashboard', 'Dashboard')}
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium transition hover:border-white hover:bg-white/15"
                            >
                                {t('auth.login', 'Login')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="sticky top-0 z-40">
                <div className="border-b border-white/5 bg-[#060d29]/95 supports-[backdrop-filter]:bg-[#060d29]/80 shadow-[0_18px_48px_-30px_rgba(8,12,36,0.9)] backdrop-blur">
                    <div className="content-container flex items-center gap-6 py-4">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-white/95 shadow-lg ring-1 ring-primary/25">
                                    <img
                                        src="/images/ncue-csie-logo.png"
                                        alt={t('site.title_short', 'CSIE')}
                                        className="h-11 w-11 object-contain"
                                    />
                                </div>
                                <div className="flex flex-col leading-tight text-white">
                                    <span className="text-sm font-semibold uppercase tracking-[0.32em] text-white/55">
                                        {t('site.university', 'National Changhua University of Education')}
                                    </span>
                                    <span className="text-xl font-bold text-white md:text-2xl">
                                        {t('site.title_full', 'Department of CSIE')}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <nav className="hidden flex-1 items-center justify-end lg:flex">
                            <NavigationMenu className="justify-end" viewport>
                                <NavigationMenuList className="gap-1.5 text-sm">
                                    {navGroups.map((group) => (
                                        <NavigationMenuItem key={group.key}>
                                            {group.children && group.children.length > 0 ? (
                                                <>
                                                    <NavigationMenuTrigger className="rounded-full border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-white/80 transition data-[state=open]:border-white/15 data-[state=open]:bg-white/10 hover:bg-white/10 hover:text-white focus-visible:ring-white/40">
                                                        {group.label}
                                                    </NavigationMenuTrigger>
                                                    <NavigationMenuContent className="bg-transparent backdrop-blur">
                                                        <div className="grid min-w-[28rem] gap-3 rounded-3xl border border-white/10 bg-[#0a163a]/95 p-6 text-white shadow-[0_28px_72px_-42px_rgba(4,11,34,0.75)] md:min-w-[32rem]">
                                                            {group.description && (
                                                                <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 text-sm text-white/80">
                                                                    <ArrowRight className="mt-0.5 size-4 text-secondary" />
                                                                    <p>{group.description}</p>
                                                                </div>
                                                            )}
                                                            <div className="grid gap-2">
                                                                {group.children.map((child) => (
                                                                    <NavigationMenuLink asChild key={child.key}>
                                                                        <Link
                                                                            href={child.href}
                                                                            className="group flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3 text-white/85 transition hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                                                                        >
                                                                            <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white">
                                                                                {child.key.includes('faculty') ? (
                                                                                    <Users className="size-4" />
                                                                                ) : child.key.includes('labs') ? (
                                                                                    <GraduationCap className="size-4" />
                                                                                ) : (
                                                                                    <ArrowRight className="size-4" />
                                                                                )}
                                                                            </div>
                                                                            <div className="flex flex-col gap-1 text-sm">
                                                                                <span className="font-semibold text-white">{child.label}</span>
                                                                                {child.description && (
                                                                                    <span className="text-white/70">{child.description}</span>
                                                                                )}
                                                                            </div>
                                                                        </Link>
                                                                    </NavigationMenuLink>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </NavigationMenuContent>
                                                </>
                                            ) : (
                                                <NavigationMenuLink asChild>
                                                    <Link
                                                        href={group.href}
                                                        className="rounded-full border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                                                    >
                                                        {group.label}
                                                    </Link>
                                                </NavigationMenuLink>
                                            )}
                                        </NavigationMenuItem>
                                    ))}
                                    <NavigationMenuIndicator className="bg-white/40" />
                                </NavigationMenuList>
                                <NavigationMenuViewport className="border border-white/10 bg-[#060f2c]/95 text-white" />
                            </NavigationMenu>
                        </nav>

                        <div className="ml-auto flex items-center gap-3 lg:hidden">
                            <button
                                type="button"
                                className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg transition hover:border-white/40 hover:bg-white/20"
                                onClick={() => {
                                    const searchInput = document.querySelector<HTMLInputElement>('header input[type="search"]');
                                    searchInput?.focus();
                                }}
                                aria-label={t('search', '搜尋')}
                            >
                                <Search className="size-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:hidden">
                <FloatingNav nav={mobileNav} />
            </div>

            {/* 手機版浮動語言設置按鈕 */}
            <MobileFloatingSettings />
        </header>
    );
}

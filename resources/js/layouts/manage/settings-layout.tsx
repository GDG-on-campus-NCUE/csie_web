import { cn } from '@/lib/utils';
import { useTranslator } from '@/hooks/use-translator';
import { type PropsWithChildren, useMemo } from 'react';
import { Link } from '@inertiajs/react';

interface ManageSettingsLayoutProps extends PropsWithChildren {
    active: 'profile' | 'password';
}

interface SettingsNavItem {
    key: ManageSettingsLayoutProps['active'];
    href: string;
}

const navItems: SettingsNavItem[] = [
    { key: 'profile', href: '/manage/settings/profile' },
    { key: 'password', href: '/manage/settings/password' },
];

export default function ManageSettingsLayout({ children, active }: ManageSettingsLayoutProps) {
    const { t } = useTranslator('manage');

    const items = useMemo(
        () =>
            navItems.map((item) => ({
                ...item,
                label: t(`settings.nav.${item.key}`),
            })),
        [t]
    );

    return (
        <section className="space-y-6">
            <div className="rounded-3xl bg-white px-6 py-8 shadow-sm ring-1 ring-black/5">
                <div className="space-y-2">
                    <span className="inline-flex items-center rounded-full bg-[#151f54]/10 px-3 py-1 text-xs font-medium text-[#151f54]">
                        {t('settings.badge')}
                    </span>
                    <h1 className="text-3xl font-semibold text-[#151f54]">{t('settings.title')}</h1>
                    <p className="max-w-2xl text-sm text-neutral-600">{t('settings.description')}</p>
                </div>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <aside className="w-full max-w-full lg:w-60">
                    <div className="overflow-hidden rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-black/5">
                        <nav className="flex flex-col gap-1">
                            {items.map((item) => (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    prefetch
                                    className={cn(
                                        'flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors',
                                        active === item.key
                                            ? 'bg-[#151f54] text-white shadow-sm'
                                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                <div className="flex-1">
                    <div className="space-y-10">{children}</div>
                </div>
            </div>
        </section>
    );
}

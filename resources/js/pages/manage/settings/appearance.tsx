import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import ManageLayout from '@/layouts/manage/manage-layout';
import ManageSettingsLayout from '@/layouts/manage/settings-layout';
import { useTranslator } from '@/hooks/use-translator';

export default function Appearance() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.settings'), href: '/manage/settings/appearance' },
        { title: t('layout.breadcrumbs.settings_appearance'), href: '/manage/settings/appearance' },
    ];

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.appearance.head_title')} />

            <ManageSettingsLayout active="appearance">
                <section className="space-y-6">
                    <HeadingSmall
                        title={t('settings.appearance.title')}
                        description={t('settings.appearance.description')}
                    />
                    <AppearanceTabs />
                </section>
            </ManageSettingsLayout>
        </ManageLayout>
    );
}

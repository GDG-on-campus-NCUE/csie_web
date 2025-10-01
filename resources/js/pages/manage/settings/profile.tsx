import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { Save } from 'lucide-react';

export default function ManageSettingsProfile() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('settings.title', '帳號設定'),
            href: '/manage/settings/profile',
        },
        {
            title: t('settings.profile', '個人資料'),
            href: '/manage/settings/profile',
        },
    ];

    const pageTitle = t('settings.profile', '個人資料');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('settings.profile_description', '更新顯示名稱與聯絡資訊。')}
                breadcrumbs={breadcrumbs}
            >
                <section className="space-y-6 rounded-xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('settings.form.name', '顯示名稱')}</Label>
                            <Input id="name" defaultValue="王小明" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('settings.form.email', '電子郵件')}</Label>
                            <Input id="email" type="email" defaultValue="admin@example.com" />
                        </div>
                    </div>
                    <Button className="gap-2">
                        <Save className="h-4 w-4" />
                        {t('settings.save', '儲存設定')}
                    </Button>
                </section>
            </ManagePage>
        </>
    );
}

ManageSettingsProfile.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;

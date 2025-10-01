import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ManageSettingsPassword() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('settings.title', '帳號設定'),
            href: '/manage/settings/password',
        },
        {
            title: t('settings.security', '安全性'),
            href: '/manage/settings/password',
        },
    ];

    const pageTitle = t('settings.security', '安全性');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('settings.password_description', '更新登入密碼並檢視最近的安全事件。')}
                breadcrumbs={breadcrumbs}
            >
                <section className="space-y-6 rounded-xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="current_password">{t('settings.form.current_password', '目前密碼')}</Label>
                            <Input id="current_password" type="password" placeholder="********" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new_password">{t('settings.form.new_password', '新密碼')}</Label>
                            <Input id="new_password" type="password" placeholder="********" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="confirm_password">{t('settings.form.confirm_password', '確認新密碼')}</Label>
                            <Input id="confirm_password" type="password" placeholder="********" />
                        </div>
                    </div>
                    <Button className="gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        {t('settings.update_password', '更新密碼')}
                    </Button>
                </section>
            </ManagePage>
        </>
    );
}

ManageSettingsPassword.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;

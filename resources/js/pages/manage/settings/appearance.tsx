import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { Palette } from 'lucide-react';

const themes = [
    { id: 'light', label: '亮色模式', description: '適合明亮環境的預設配色。' },
    { id: 'dark', label: '暗色模式', description: '柔和對比，降低夜間用眼負擔。' },
    { id: 'system', label: '跟隨系統', description: '自動依照系統偏好切換。' },
];

export default function ManageSettingsAppearance() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/user/dashboard',
        },
        {
            title: t('settings.title', '帳號設定'),
            href: '/manage/settings/appearance',
        },
        {
            title: t('settings.appearance', '外觀'),
            href: '/manage/settings/appearance',
        },
    ];

    const pageTitle = t('settings.appearance', '外觀');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('settings.appearance_description', '選擇喜好的主題顏色與顯示樣式。')}
                breadcrumbs={breadcrumbs}
            >
                <section className="space-y-6 rounded-xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                    <RadioGroup defaultValue="system" className="space-y-4">
                        {themes.map((theme) => (
                            <div key={theme.id} className="flex items-start gap-3 rounded-lg border border-transparent bg-neutral-50 p-4">
                                <RadioGroupItem value={theme.id} id={theme.id} className="mt-1" />
                                <div className="space-y-1">
                                    <Label htmlFor={theme.id} className="text-sm font-semibold text-neutral-800">
                                        {t(`settings.appearance.themes.${theme.id}.label`, theme.label)}
                                    </Label>
                                    <p className="text-sm text-neutral-500">
                                        {t(`settings.appearance.themes.${theme.id}.description`, theme.description)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </RadioGroup>
                    <Button className="gap-2">
                        <Palette className="h-4 w-4" />
                        {t('settings.apply_theme', '套用主題')}
                    </Button>
                </section>
            </ManagePage>
        </>
    );
}

ManageSettingsAppearance.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;

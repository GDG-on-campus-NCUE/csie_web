import type { ReactElement } from 'react';
import { Head } from '@inertiajs/react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useTranslator } from '@/hooks/use-translator';

import type { BreadcrumbItem } from '@/types';
import type { StaffShowProps } from '@/types/staff';

const formatLocalized = (value?: { 'zh-TW'?: string; en?: string }) => {
    const zh = value?.['zh-TW']?.trim();
    const en = value?.en?.trim();

    if (zh && en) {
        return `${zh} / ${en}`;
    }

    return zh ?? en ?? '-';
};

export default function StaffShow({ staff }: StaffShowProps) {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
        { title: t('sidebar.admin.staff', '師資與職員'), href: '/manage/staff' },
        { title: formatLocalized(staff.name), href: `/manage/staff/${staff.id}` },
    ];

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={formatLocalized(staff.name)} />

            <ManagePageHeader
                title={formatLocalized(staff.name)}
                description={t('staff.index.description', '管理系所教師與職員資料，維護個人檔案與聯絡資訊。')}
                badge={{ label: t('staff.index.tabs.staff', '職員管理') }}
            />

            <Card className="mt-6 border border-slate-200 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle>{t('staff.staff.title', '職員管理')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-700">
                    <div>
                        <h3 className="text-xs font-semibold uppercase text-slate-500">
                            {t('staff.staff.table.position', '職位')}
                        </h3>
                        <p>{formatLocalized(staff.position)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge>{staff.employment_status}</Badge>
                        <Badge variant="outline">
                            {staff.visible
                                ? t('staff.visibility.visible', '前台顯示')
                                : t('staff.visibility.hidden', '已隱藏')}
                        </Badge>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold uppercase text-slate-500">
                            {t('staff.staff.employment_period', '任職期間')}
                        </h3>
                        <p>
                            {staff.employment_started_at ?? '?'} ~{' '}
                            {staff.employment_ended_at ?? t('staff.index.employment.present', '至今')}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xs font-semibold uppercase text-slate-500">
                            {t('staff.staff.table.email', '聯絡資訊')}
                        </h3>
                        {staff.email && (
                            <p>
                                <a href={`mailto:${staff.email}`} className="text-primary hover:underline">
                                    {staff.email}
                                </a>
                            </p>
                        )}
                        {staff.phone && <p>{staff.phone}</p>}
                        {staff.office && (
                            <p className="text-xs text-slate-500">
                                {t('staff.staff.office', '辦公室')}：{staff.office}
                            </p>
                        )}
                    </div>

                    {staff.user && (
                        <div>
                            <h3 className="text-xs font-semibold uppercase text-slate-500">
                                {t('staff.staff.user', '帳號對應')}
                            </h3>
                            <p className="font-medium text-slate-900">{staff.user.name}</p>
                            <p className="text-xs text-slate-500">{staff.user.email}</p>
                        </div>
                    )}

                    {staff.bio && (
                        <div className="space-y-1">
                            <h3 className="text-xs font-semibold uppercase text-slate-500">
                                {t('staff.form.staff.fields.bio_zh', '中文簡介')}
                            </h3>
                            <p>{staff.bio['zh-TW'] ?? '-'}</p>
                            <h3 className="text-xs font-semibold uppercase text-slate-500">
                                {t('staff.form.staff.fields.bio_en', '英文簡介')}
                            </h3>
                            <p>{staff.bio.en ?? '-'}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </ManageLayout>
    );
}

StaffShow.layout = (page: ReactElement) => page;

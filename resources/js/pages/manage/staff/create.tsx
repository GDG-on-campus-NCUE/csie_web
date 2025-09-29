import type { ReactElement } from 'react';
import { Head, router } from '@inertiajs/react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { StaffForm } from '@/components/manage/staff/StaffForm';

import { useTranslator } from '@/hooks/use-translator';

import type { BreadcrumbItem } from '@/types';
import type { StaffCreateProps, StaffFormData } from '@/types/staff';

export default function StaffCreate(_: StaffCreateProps) {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
        { title: t('sidebar.admin.staff', '師資與職員'), href: '/manage/staff' },
        { title: t('staff.form.staff.title_create', '新增職員'), href: '/manage/staff/create' },
    ];

    const handleSubmit = (data: StaffFormData) => {
        router.post('/manage/staff', data, {
            preserveScroll: true,
        });
    };

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={t('staff.form.staff.title_create', '新增職員')} />

            <ManagePageHeader
                title={t('staff.form.staff.title_create', '新增職員')}
                description={t('staff.index.description', '管理系所教師與職員資料，維護個人檔案與聯絡資訊。')}
                badge={{ label: t('staff.index.tabs.staff', '職員管理') }}
            />

            <div className="mt-6">
                <StaffForm onSubmit={handleSubmit} submitLabel={t('staff.form.actions.save', '儲存')} />
            </div>
        </ManageLayout>
    );
}

StaffCreate.layout = (page: ReactElement) => page;

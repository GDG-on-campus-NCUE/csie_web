import type { ReactElement } from 'react';
import { Head, router } from '@inertiajs/react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { StaffForm } from '@/components/manage/staff/StaffForm';

import { useTranslator } from '@/hooks/use-translator';

import type { BreadcrumbItem } from '@/types';
import type { StaffEditProps, StaffFormData } from '@/types/staff';

const resolveStaffDisplayName = (name: StaffEditProps['staff']['name']): string => {
    const zh = name?.['zh-TW']?.trim();
    const en = name?.en?.trim();

    if (zh && en) {
        return `${zh} / ${en}`;
    }

    return zh ?? en ?? '';
};

export default function StaffEdit({ staff }: StaffEditProps) {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
        { title: t('sidebar.admin.staff', '師資與職員'), href: '/manage/staff' },
        { title: resolveStaffDisplayName(staff.name) || t('staff.form.staff.title_edit', '編輯職員'), href: `/manage/staff/${staff.id}/edit` },
    ];

    const handleSubmit = (data: StaffFormData) => {
        router.post(`/manage/staff/${staff.id}`, {
            ...data,
            _method: 'put',
        }, {
            preserveScroll: true,
        });
    };

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={t('staff.form.staff.title_edit', '編輯職員資料')} />

            <ManagePageHeader
                title={t('staff.form.staff.title_edit', '編輯職員資料')}
                description={t('staff.index.description', '管理系所教師與職員資料，維護個人檔案與聯絡資訊。')}
                badge={{ label: t('staff.index.tabs.staff', '職員管理') }}
            />

            <div className="mt-6">
                <StaffForm
                    staff={staff}
                    onSubmit={handleSubmit}
                    submitLabel={t('staff.form.actions.save', '儲存')}
                />
            </div>
        </ManageLayout>
    );
}

StaffEdit.layout = (page: ReactElement) => page;

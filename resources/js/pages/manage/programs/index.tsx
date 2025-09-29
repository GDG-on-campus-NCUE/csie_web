import { Head } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';

/**
 * 學程管理頁面
 * 提供學程資料的檢視、建立、編輯和刪除功能
 */
export default function ProgramsIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard'), href: '/manage/dashboard' },
        { title: '學程管理', href: '/manage/programs' },
    ];

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title="學程管理" />

            <ManagePageHeader
                title="學程管理"
                description="管理系所學程與修業規劃"
                badge={{ label: "學程中心" }}
            />

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">學程管理功能開發中</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        此功能正在開發中，敬請期待
                    </p>
                </div>
            </div>
        </ManageLayout>
    );
}

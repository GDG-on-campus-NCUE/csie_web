import { Head } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';

/**
 * 教師管理頁面
 * 提供教師資料的檢視、建立、編輯和刪除功能
 */
export default function TeachersIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard'), href: '/manage/dashboard' },
        { title: '教師管理', href: '/manage/teachers' },
    ];

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title="教師管理" />

            <ManagePageHeader
                title="教師管理"
                description="管理系所教師資料與專業資訊"
                badge={{ label: "教師中心" }}
            />

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">教師管理功能開發中</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        此功能正在開發中，敬請期待
                    </p>
                </div>
            </div>
        </ManageLayout>
    );
}

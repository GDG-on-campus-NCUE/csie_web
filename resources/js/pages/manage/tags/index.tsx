import { Head } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';

/**
 * 標籤管理頁面
 * 提供標籤的檢視、建立、編輯和刪除功能
 */
export default function TagsIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.tags'), href: '/manage/tags' },
    ];

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={t('layout.breadcrumbs.tags')} />

            <ManagePageHeader
                title={t('layout.breadcrumbs.tags')}
                description="管理系統標籤，用於分類和標記內容"
                badge={{ label: "標籤中心" }}
            />

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">標籤管理功能開發中</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        此功能正在開發中，敬請期待
                    </p>
                </div>
            </div>
        </ManageLayout>
    );
}

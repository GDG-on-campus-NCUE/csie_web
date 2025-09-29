import { Head } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';

/**
 * 公告分類管理頁面
 * 提供公告分類的檢視、建立、編輯和刪除功能
 */
export default function PostCategoriesIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard'), href: '/manage/dashboard' },
        { title: '公告分類管理', href: '/manage/post-categories' },
    ];

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title="公告分類管理" />

            <ManagePageHeader
                title="公告分類管理"
                description="管理公告分類與標籤系統"
                badge={{ label: "分類中心" }}
            />

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">公告分類管理功能開發中</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        此功能正在開發中，敬請期待
                    </p>
                </div>
            </div>
        </ManageLayout>
    );
}

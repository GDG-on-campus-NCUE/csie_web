import { Head } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';

/**
 * 學術課程與學程管理頁面
 * 提供課程與學程資料的檢視和管理功能
 */
export default function AcademicsIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard'), href: '/manage/dashboard' },
        { title: t('sidebar.admin.academics'), href: '/manage/academics' },
    ];

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.admin.academics')} />

            <ManagePageHeader
                title={t('sidebar.admin.academics')}
                description="管理系所課程與學程資訊"
                badge={{ label: "學術管理" }}
            />

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">學術管理功能開發中</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        此功能正在開發中，敬請期待
                    </p>
                </div>
            </div>
        </ManageLayout>
    );
}

import ManageMainHeaderBreadcrumb from '@/components/manage/manage-main-header-breadcumb';
import ManageMainHeaderNavbar from '@/components/manage/manage-main-header-navbar';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import type { ReactNode } from 'react';

interface ManageMainHeaderProps {
    title?: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
}

export default function ManageMainHeader({ title, description, breadcrumbs, actions }: ManageMainHeaderProps) {
    const { t } = useTranslator('manage');
    const resolvedTitle = title ?? t('layout.breadcrumbs.admin_dashboard', '系統概覽');
    const resolvedDescription = description ?? t('settings.description', '快速檢視系統狀態與最新活動。');

    return (
        <div className="flex flex-col gap-4">
            <ManageMainHeaderBreadcrumb breadcrumbs={breadcrumbs} />
            <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-1 flex-col gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">{resolvedTitle}</h1>
                    <p className="max-w-3xl text-sm text-neutral-600 sm:text-base">{resolvedDescription}</p>
                </div>
                <div className="flex flex-col justify-end gap-3 sm:flex-row sm:items-center">
                    {actions ?? <ManageMainHeaderNavbar />}
                </div>
            </div>
        </div>
    );
}

import ManageMainContent from '@/components/manage/manage-main-content';
import ManageMainFooter from '@/components/manage/manage-main-footer';
import ManageMainHeader from '@/components/manage/manage-main-header';
import type { BreadcrumbItem } from '@/types/shared';
import type { ReactNode } from 'react';

export interface ManageMainProps {
    title?: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
    toolbar?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
}

export default function ManageMain({ title, description, breadcrumbs, actions, toolbar, footer, children }: ManageMainProps) {
    return (
        <div className="flex min-h-full w-full flex-1 flex-col gap-6">
            <ManageMainHeader title={title} description={description} breadcrumbs={breadcrumbs} actions={actions} toolbar={toolbar} />
            <ManageMainContent>{children}</ManageMainContent>
            <ManageMainFooter>{footer}</ManageMainFooter>
        </div>
    );
}

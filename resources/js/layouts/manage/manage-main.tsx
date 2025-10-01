import ManageMainContent from '@/components/manage/manage-main-content';
import ManageMainFooter from '@/components/manage/manage-main-footer';
import ManageMainHeader from '@/components/manage/manage-main-header';
import type { BreadcrumbItem } from '@/types';
import type { ReactNode } from 'react';

export interface ManageMainProps {
    title?: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
}

export default function ManageMain({ title, description, breadcrumbs, actions, footer, children }: ManageMainProps) {
    return (
        <div className="flex min-h-full flex-1 flex-col gap-6">
            <ManageMainHeader title={title} description={description} breadcrumbs={breadcrumbs} actions={actions} />
            <ManageMainContent>{children}</ManageMainContent>
            <ManageMainFooter>{footer}</ManageMainFooter>
        </div>
    );
}

import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import ManageLayout from '@/layouts/manage/manage-layout';
import { type BreadcrumbItem } from '@/types/shared';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const page = usePage();
    const isManage = page.url.startsWith('/manage');



    if (isManage) {
        return <ManageLayout>{children}</ManageLayout>;
    }

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
}

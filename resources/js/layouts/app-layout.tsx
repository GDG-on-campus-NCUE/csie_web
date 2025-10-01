import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import ManageLayout from '@/layouts/manage/manage-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const [isManage, setIsManage] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsManage(window.location.pathname.startsWith('/manage'));
        }
    }, []);

    if (isManage) {
        return <ManageLayout breadcrumbs={breadcrumbs}>{children}</ManageLayout>;
    }

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
}

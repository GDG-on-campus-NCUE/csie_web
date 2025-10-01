import { Breadcrumbs } from '@/components/breadcrumbs';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import AdminFooter from '@/components/admin-footer';
import { type BreadcrumbItem } from '@/types';
import AppHeader from './app-header';
import { type PropsWithChildren } from 'react';

/**
 * 前台一般頁面的預設版面配置，提供頂部導覽與內容容器
 */
type AppSidebarLayoutProps = PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>;

export default function AppSidebarLayout({ children, breadcrumbs = [] }: AppSidebarLayoutProps) {
    return (
        <AppShell variant="header">
            <AppHeader />
            <AppContent className="flex-1 bg-neutral-50 text-neutral-900">
                <div className="flex min-h-svh flex-col gap-6 pb-10">
                    {breadcrumbs.length > 0 && (
                        <div className="border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 md:px-8">
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>
                    )}
                    <section className="flex flex-1 flex-col gap-8 px-4 pb-6 pt-4 sm:px-6 md:px-8">
                        {children}
                    </section>
                    <footer className="px-4 pb-4 text-xs text-neutral-600 sm:px-6 md:px-8">
                        <AdminFooter />
                    </footer>
                </div>
            </AppContent>
        </AppShell>
    );
}

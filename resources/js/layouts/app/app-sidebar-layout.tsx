import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/manage/app-sidebar';
import { AppSidebarHeader } from '@/components/manage/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import AdminFooter from '@/components/admin-footer';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="relative overflow-x-hidden bg-white text-black"
            >
                <div className="relative flex min-h-svh flex-col gap-6 pb-10">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />

                    <main className="flex flex-1 flex-col gap-8 px-4 pb-6 sm:px-6 md:px-8">
                        {children}
                    </main>

                    <footer className="mx-4 flex items-center justify-center gap-3 rounded-2xl bg-white/90 px-4 py-4 text-xs text-neutral-600 shadow-sm ring-1 ring-black/5 sm:mx-6 md:mx-8">
                        <AdminFooter />
                    </footer>
                </div>
            </AppContent>
        </AppShell>
    );
}

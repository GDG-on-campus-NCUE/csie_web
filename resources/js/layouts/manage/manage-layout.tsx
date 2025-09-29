import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import ManageSidebar from '@/components/manage/sidebar/manage-sidebar';
import AdminFooter from '@/components/admin-footer';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import ManageHeader from '@/components/manage/manage-header';
import { type ManageRole } from '@/components/manage/manage-brand';

interface ManageLayoutProps {
    role?: ManageRole;
    breadcrumbs?: BreadcrumbItem[];
}

/**
 * 統一的管理後台佈局組件
 * 支援三種角色（admin、teacher、user）的權限控制
 * 自動根據使用者角色調整側邊欄內容和頁面權限
 */
export default function ManageLayout({
    children,
    breadcrumbs = [],
    role: roleOverride,
}: PropsWithChildren<ManageLayoutProps>) {
    const { auth } = usePage<SharedData>().props;
    // 優先使用傳入的角色參數，否則使用認證資訊中的角色，預設為 user
    const role = (roleOverride ?? auth?.user?.role ?? 'user') as ManageRole;

    return (
        <AppShell variant="sidebar">
            {/* 使用統一的管理側邊欄組件，根據角色自動調整內容 */}
            <ManageSidebar role={role} />

            <AppContent
                variant="sidebar"
                className="relative overflow-x-hidden bg-[#f5f7fb] text-neutral-900"
            >
                <div className="flex min-h-svh flex-col">
                    {/* 管理頁面標題欄 */}
                    <ManageHeader role={role} />

                    {/* 主要內容區域 */}
                    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                            {/* 麵包屑導航 */}
                            {breadcrumbs.length > 0 && (
                                <div className="-mb-2">
                                    <div className="text-neutral-600">
                                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                                    </div>
                                </div>
                            )}
                            {children}
                        </div>
                    </main>

                    {/* 頁腳 */}
                    <footer className="mx-4 mb-6 mt-auto flex items-center justify-center gap-3 rounded-2xl bg-white px-4 py-4 text-xs text-neutral-600 shadow-sm ring-1 ring-black/5 sm:mx-6 md:mx-8">
                        <AdminFooter />
                    </footer>
                </div>
            </AppContent>
        </AppShell>
    );
}

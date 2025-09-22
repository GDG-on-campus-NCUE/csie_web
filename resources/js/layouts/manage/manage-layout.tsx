import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import AdminManageSidebar from '@/components/manage/admin/sidebar';
import TeacherManageSidebar from '@/components/manage/teacher/sidebar';
import UserManageSidebar from '@/components/manage/user/sidebar';
import AdminFooter from '@/components/admin-footer';
import { type PropsWithChildren, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import ManageHeader from '@/components/manage/manage-header';

interface ManageLayoutProps {
    role?: 'admin' | 'teacher' | 'user';
    breadcrumbs?: BreadcrumbItem[];
}

export default function ManageLayout({
    children,
    breadcrumbs = [],
    role: roleOverride,
}: PropsWithChildren<ManageLayoutProps>) {
    const { auth } = usePage<SharedData>().props;
    // 依據認證資訊判斷目前角色，若有外部覆寫則以參數優先
    const role = (roleOverride ?? auth?.user?.role ?? 'user') as 'admin' | 'teacher' | 'user';

    const Sidebar = useMemo(() => {
        if (role === 'admin') {
            return AdminManageSidebar;
        }

        if (role === 'teacher') {
            return TeacherManageSidebar;
        }

        return UserManageSidebar;
    }, [role]);

    return (
        <AppShell variant="sidebar">
            <Sidebar />

            <AppContent
                variant="sidebar"
                className="relative overflow-x-hidden bg-[#f5f7fb] text-neutral-900"
            >
                <div className="flex min-h-svh flex-col">
                    <ManageHeader breadcrumbs={breadcrumbs} role={role} />

                    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">{children}</div>
                    </main>

                    <footer className="mx-4 mb-6 mt-auto flex items-center justify-center gap-3 rounded-2xl bg-white px-4 py-4 text-xs text-neutral-600 shadow-sm ring-1 ring-black/5 sm:mx-6 md:mx-8">
                        <AdminFooter />
                    </footer>
                </div>
            </AppContent>
        </AppShell>
    );
}

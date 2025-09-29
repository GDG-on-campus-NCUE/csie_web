import ManageBrand, { type ManageRole } from '@/components/manage/manage-brand';
import { Breadcrumbs } from '@/components/breadcrumbs';
import LanguageSwitcher from '@/components/language-switcher';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface ManageHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
    role?: ManageRole;
}

export default function ManageHeader({ breadcrumbs = [], role: roleOverride }: ManageHeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const role = (roleOverride ?? auth?.user?.role ?? 'user') as ManageRole;

    return (
        <header className="flex h-auto min-h-16 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 text-neutral-700 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:min-h-12 md:h-16 md:flex-row md:items-center md:justify-between md:py-0 md:pr-6 md:px-6">
            {/* 第一行：側邊欄觸發器和品牌標誌 */}
            <div className="flex w-full items-center justify-between gap-3 md:min-w-0 md:flex-1">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="-ml-1 h-8 w-8 flex-shrink-0 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50" />
                    <div className="flex flex-shrink-0 items-center gap-2 md:hidden">
                        <ManageBrand role={role} />
                    </div>
                </div>
            </div>

            {/* 第二行：麵包屑 */}
            <div className="w-full min-w-0 overflow-hidden md:min-w-0 md:flex-1">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* 第三行（手機版）：語言切換器 */}
            <div className="w-full md:hidden flex justify-end">
                <LanguageSwitcher variant="light" className="flex-shrink-0" />
            </div>

            {/* 桌面版語言切換器 */}
            <div className="hidden md:block">
                <LanguageSwitcher variant="light" className="flex-shrink-0" />
            </div>
        </header>
    );
}

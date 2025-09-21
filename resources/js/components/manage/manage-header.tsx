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
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 pr-6 text-neutral-700 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 h-8 w-8 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50" />
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 md:hidden">
                        <ManageBrand role={role} />
                    </div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <LanguageSwitcher variant="light" />
        </header>
    );
}

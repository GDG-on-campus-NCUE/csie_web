import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import LanguageSwitcher from '@/components/app/app-lang-switcher';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 pr-6 text-neutral-700 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 h-8 w-8 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <LanguageSwitcher variant="light" />
        </header>
    );
}

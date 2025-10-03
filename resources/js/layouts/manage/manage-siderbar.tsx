import ManageSidebarFooter from '@/components/manage/manage-sidebar-footer';
import ManageSidebarHeader from '@/components/manage/manage-sidebar-header';
import ManageSidebarMain from '@/components/manage/manage-sidebar-main';
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarSeparator } from '@/components/ui/sidebar';
import type { SidebarNavGroup } from '@/lib/manage/sidebar-nav-groups';

export interface ManageSidebarProps {
    brand: {
        primary: string;
        secondary?: string;
    };
    groups: SidebarNavGroup[];
    currentPath: string;
}

export default function ManageSidebar({ brand, groups, currentPath }: ManageSidebarProps) {
    return (
        <>
            <SidebarHeader>
                <ManageSidebarHeader brand={brand} />
            </SidebarHeader>
            <SidebarContent>
                <ManageSidebarMain groups={groups} currentPath={currentPath} />
            </SidebarContent>
            <SidebarSeparator className="bg-white/10" />
            <SidebarFooter>
                <ManageSidebarFooter />
            </SidebarFooter>
        </>
    );
}

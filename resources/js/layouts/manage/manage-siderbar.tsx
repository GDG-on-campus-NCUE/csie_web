import ManageSidebarFooter from '@/components/manage/manage-sidebar-footer';
import ManageSidebarHeader from '@/components/manage/manage-sidebar-header';
import ManageSidebarMain from '@/components/manage/manage-sidebar-main';
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarSeparator } from '@/components/ui/sidebar';

export interface ManageSidebarProps {
    brand: {
        primary: string;
        secondary?: string;
    };
    role: 'admin' | 'teacher' | 'user';
}

export default function ManageSidebar({ brand, role }: ManageSidebarProps) {
    return (
        <>
            <SidebarHeader>
                <ManageSidebarHeader brand={brand} />
            </SidebarHeader>
            <SidebarContent>
                <ManageSidebarMain role={role} />
            </SidebarContent>
            <SidebarSeparator className="bg-white/10" />
            <SidebarFooter>
                <ManageSidebarFooter />
            </SidebarFooter>
        </>
    );
}

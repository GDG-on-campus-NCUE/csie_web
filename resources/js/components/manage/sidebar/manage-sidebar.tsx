import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import ManageBrand, { type ManageRole } from '@/components/manage/manage-brand';
import { deriveManageRole } from '@/components/manage/utils/role-helpers';
import { useManageNavigation } from '@/components/manage/routes/use-manage-navigation';

interface ManageSidebarProps {
    role?: ManageRole;
}

export default function ManageSidebar({ role: roleOverride }: ManageSidebarProps) {
    const { auth } = usePage<SharedData>().props;
    const role = deriveManageRole(auth?.user ?? null, roleOverride ?? null);
    const { mainNavItems, footerNavItems, navLabel } = useManageNavigation(role);

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-slate-200">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/manage/dashboard" className="flex items-center gap-3">
                                <ManageBrand role={role} />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={mainNavItems} label={navLabel} />
            </SidebarContent>
            <SidebarFooter className="border-t border-slate-200">
                <NavFooter items={footerNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

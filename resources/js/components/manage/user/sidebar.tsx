import ManageBrand from '@/components/manage/manage-brand';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, User, ShieldCheck, LifeBuoy } from 'lucide-react';
import { useTranslator } from '@/hooks/use-translator';

export default function UserSidebar() {
    const { t } = useTranslator('manage');

    const mainNavItems: NavItem[] = [
        { title: t('sidebar.user.dashboard'), href: '/manage/dashboard', icon: LayoutGrid },
        { title: t('sidebar.user.profile'), href: '/manage/settings/profile', icon: User },
        { title: t('sidebar.user.security'), href: '/manage/settings/password', icon: ShieldCheck },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: t('sidebar.user.support'),
            href: 'mailto:csie@cc.ncue.edu.tw',
            icon: LifeBuoy,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/manage/dashboard" prefetch>
                                <ManageBrand role="user" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label={t('sidebar.user.nav_label')} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

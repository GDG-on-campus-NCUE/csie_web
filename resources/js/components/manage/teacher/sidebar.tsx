import ManageBrand from '@/components/manage/manage-brand';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Megaphone, Beaker, NotebookPen, Settings, HelpCircle } from 'lucide-react';
import { useTranslator } from '@/hooks/use-translator';

export default function TeacherSidebar() {
    const { t } = useTranslator('manage');

    const mainNavItems: NavItem[] = [
        { title: t('sidebar.teacher.dashboard', 'Teaching Home'), href: '/manage/dashboard', icon: LayoutGrid },
        { title: t('sidebar.teacher.posts', 'Announcements'), href: '/manage/teacher/posts', icon: Megaphone },
        { title: t('sidebar.teacher.labs', 'Research'), href: '/manage/teacher/labs', icon: Beaker },
        { title: t('sidebar.teacher.courses', 'Courses & Activities'), href: '/manage/teacher/courses', icon: NotebookPen },
        { title: t('sidebar.teacher.profile', 'Profile Settings'), href: '/settings/profile', icon: Settings },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: t('sidebar.teacher.guide', 'Teaching Guide'),
            href: 'https://github.com/Grasonyang/csie_web',
            icon: HelpCircle,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/manage/dashboard" prefetch>
                                <ManageBrand role="teacher" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label={t('sidebar.teacher.nav_label', 'Teaching')} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

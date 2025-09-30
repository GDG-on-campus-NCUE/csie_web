import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    UserCheck,
    Beaker,
    School,
    GraduationCap,
    Megaphone,
    FileText,
    Mail,
    Settings,
    Folder,
    HelpCircle,
    NotebookPen,
    User,
    ShieldCheck,
    LifeBuoy,
} from 'lucide-react';
import ManageBrand, { type ManageRole } from '@/components/manage/manage-brand';
import { useTranslator } from '@/hooks/use-translator';
import { useMemo } from 'react';
import { deriveManageRole } from '@/components/manage/utils/role-helpers';

interface ManageSidebarProps {
    role?: ManageRole;
}

/**
 * 統一的管理後台側邊欄組件
 * 支援 admin、teacher、user 三種角色，根據角色動態調整導航項目
 * 使用語言檔案進行國際化支援
 */
export default function ManageSidebar({ role: roleOverride }: ManageSidebarProps) {
    const { auth } = usePage<SharedData>().props;
    const role = deriveManageRole(auth?.user ?? null, roleOverride ?? null);
    const { t } = useTranslator('manage');

    // 管理員導航項目
    const adminNavItems: NavItem[] = useMemo(() => [
        {
            title: t('sidebar.admin.dashboard'),
            href: '/manage/dashboard',
            icon: LayoutGrid,
        },
        {
            title: t('sidebar.admin.posts'),
            href: '/manage/posts',
            icon: Megaphone,
        },
        {
            title: t('sidebar.admin.tags'),
            href: '/manage/tags',
            icon: NotebookPen,
        },
        {
            title: t('sidebar.admin.staff'),
            href: '/manage/staff',
            icon: UserCheck,
        },
        {
            title: t('sidebar.admin.labs'),
            href: '/manage/labs',
            icon: Beaker,
        },
        {
            title: t('sidebar.admin.classrooms'),
            href: '/manage/classrooms',
            icon: School,
        },
        {
            title: t('sidebar.admin.academics'),
            href: '/manage/academics',
            icon: GraduationCap,
        },
        {
            title: t('sidebar.admin.users'),
            href: '/manage/users',
            icon: Users,
        },
        {
            title: t('sidebar.admin.messages'),
            href: '/manage/contact-messages',
            icon: Mail,
        },
        {
            title: t('sidebar.admin.attachments'),
            href: '/manage/attachments',
            icon: FileText,
        },
    ], [t]);

    // 教師導航項目
    const teacherNavItems: NavItem[] = useMemo(() => [
        {
            title: t('sidebar.teacher.dashboard'),
            href: '/manage/dashboard',
            icon: LayoutGrid,
        },
        {
            title: t('sidebar.teacher.posts'),
            href: '/manage/teacher/posts',
            icon: Megaphone,
        },
        {
            title: t('sidebar.teacher.labs'),
            href: '/manage/teacher/labs',
            icon: Beaker,
        },
        {
            title: t('sidebar.teacher.projects'),
            href: '/manage/projects',
            icon: NotebookPen,
        },
        {
            title: t('sidebar.teacher.profile'),
            href: '/manage/settings/profile',
            icon: Settings,
        },
    ], [t]);

    // 一般使用者導航項目
    const userNavItems: NavItem[] = useMemo(() => [
        {
            title: t('sidebar.user.dashboard'),
            href: '/manage/dashboard',
            icon: LayoutGrid
        },
        {
            title: t('sidebar.user.profile'),
            href: '/manage/settings/profile',
            icon: User
        },
        {
            title: t('sidebar.user.security'),
            href: '/manage/settings/password',
            icon: ShieldCheck
        },
    ], [t]);

    // 根據角色選擇導航項目
    const mainNavItemsByRole: Record<ManageRole, NavItem[]> = useMemo(() => ({
        admin: adminNavItems,
        teacher: teacherNavItems,
        user: userNavItems,
    }), [adminNavItems, teacherNavItems, userNavItems]);

    // 管理員底部導航項目
    const adminFooterItems: NavItem[] = useMemo(() => [
        {
            title: t('sidebar.footer.settings'),
            href: '/manage/settings/profile',
            icon: Settings,
        },
        {
            title: t('sidebar.footer.docs'),
            href: 'https://laravel.com/docs',
            icon: HelpCircle,
        },
        {
            title: t('sidebar.footer.repo'),
            href: 'https://github.com/Grasonyang/csie_web',
            icon: Folder,
        },
    ], [t]);

    // 教師底部導航項目
    const teacherFooterItems: NavItem[] = useMemo(() => [
        {
            title: t('sidebar.teacher.guide'),
            href: 'https://github.com/Grasonyang/csie_web',
            icon: HelpCircle,
        },
    ], [t]);

    // 一般使用者底部導航項目
    const userFooterItems: NavItem[] = useMemo(() => [
        {
            title: t('sidebar.user.support'),
            href: 'mailto:csie@cc.ncue.edu.tw',
            icon: LifeBuoy,
        },
    ], [t]);

    // 根據角色選擇底部導航項目
    const footerNavItemsByRole: Record<ManageRole, NavItem[]> = useMemo(() => ({
        admin: adminFooterItems,
        teacher: teacherFooterItems,
        user: userFooterItems,
    }), [adminFooterItems, teacherFooterItems, userFooterItems]);

    // 根據角色選擇導航標籤
    const navLabelsByRole: Partial<Record<ManageRole, string>> = useMemo(() => ({
        teacher: t('sidebar.teacher.nav_label'),
        user: t('sidebar.user.nav_label'),
    }), [t]);

    const mainNavItems = mainNavItemsByRole[role];
    const footerNavItems = footerNavItemsByRole[role];
    const navLabel = navLabelsByRole[role];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/manage/dashboard" prefetch>
                                <ManageBrand role={role} />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label={navLabel} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

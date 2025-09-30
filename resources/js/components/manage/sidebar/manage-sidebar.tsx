import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
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

export default function ManageSidebar({ role: roleOverride }: ManageSidebarProps) {
    const { auth } = usePage<SharedData>().props;
    const role = deriveManageRole(auth?.user ?? null, roleOverride ?? null);
    const { t } = useTranslator('manage');

    const adminNavItems: NavItem[] = useMemo(
        () => [
            { title: t('sidebar.admin.dashboard'), href: '/manage/dashboard', icon: LayoutGrid },
            { title: t('sidebar.admin.posts'), href: '/manage/posts', icon: Megaphone },
            { title: t('sidebar.admin.tags'), href: '/manage/tags', icon: NotebookPen },
            { title: t('sidebar.admin.labs'), href: '/manage/labs', icon: Beaker },
            { title: t('sidebar.admin.classrooms'), href: '/manage/classrooms', icon: School },
            { title: t('sidebar.admin.academics'), href: '/manage/academics', icon: GraduationCap },
            { title: t('sidebar.admin.users'), href: '/manage/users', icon: Users },
            { title: t('sidebar.admin.messages'), href: '/manage/contact-messages', icon: Mail },
            { title: t('sidebar.admin.attachments'), href: '/manage/attachments', icon: FileText },
        ],
        [t],
    );

    const teacherNavItems: NavItem[] = useMemo(
        () => [
            { title: t('sidebar.teacher.dashboard'), href: '/manage/dashboard', icon: LayoutGrid },
            { title: t('sidebar.teacher.posts'), href: '/manage/posts', icon: Megaphone },
            { title: t('sidebar.teacher.labs'), href: '/manage/labs', icon: Beaker },
            { title: t('sidebar.teacher.projects'), href: '/manage/projects', icon: NotebookPen },
            { title: t('sidebar.teacher.profile'), href: '/manage/settings/profile', icon: Settings },
        ],
        [t],
    );

    const userNavItems: NavItem[] = useMemo(
        () => [
            { title: t('sidebar.user.dashboard'), href: '/manage/dashboard', icon: LayoutGrid },
            { title: t('sidebar.user.profile'), href: '/manage/settings/profile', icon: User },
            { title: t('sidebar.user.security'), href: '/manage/settings/password', icon: ShieldCheck },
        ],
        [t],
    );

    const mainNavItemsByRole: Record<ManageRole, NavItem[]> = useMemo(
        () => ({
            admin: adminNavItems,
            teacher: teacherNavItems,
            user: userNavItems,
        }),
        [adminNavItems, teacherNavItems, userNavItems],
    );

    const adminFooterItems: NavItem[] = useMemo(
        () => [
            { title: t('sidebar.footer.settings'), href: '/manage/settings/profile', icon: Settings },
            { title: t('sidebar.footer.docs'), href: 'https://laravel.com/docs', icon: HelpCircle },
            { title: t('sidebar.footer.repo'), href: 'https://github.com/Grasonyang/csie_web', icon: Folder },
        ],
        [t],
    );

    const teacherFooterItems: NavItem[] = useMemo(
        () => [{ title: t('sidebar.teacher.guide'), href: 'https://github.com/Grasonyang/csie_web', icon: HelpCircle }],
        [t],
    );

    const userFooterItems: NavItem[] = useMemo(
        () => [{ title: t('sidebar.user.support'), href: 'mailto:csie@cc.ncue.edu.tw', icon: LifeBuoy }],
        [t],
    );

    const footerNavItemsByRole: Record<ManageRole, NavItem[]> = useMemo(
        () => ({
            admin: adminFooterItems,
            teacher: teacherFooterItems,
            user: userFooterItems,
        }),
        [adminFooterItems, teacherFooterItems, userFooterItems],
    );

    const navLabelsByRole: Partial<Record<ManageRole, string>> = useMemo(
        () => ({
            teacher: t('sidebar.teacher.nav_label'),
            user: t('sidebar.user.nav_label'),
        }),
        [t],
    );

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
                <NavMain
                    items={mainNavItemsByRole[role] ?? []}
                    label={navLabelsByRole[role] ?? t('sidebar.admin.nav_label')}
                />
            </SidebarContent>
            <SidebarFooter className="border-t border-slate-200">
                <NavFooter items={footerNavItemsByRole[role] ?? []} />
                <NavUser user={auth?.user} />
            </SidebarFooter>
        </Sidebar>
    );
}

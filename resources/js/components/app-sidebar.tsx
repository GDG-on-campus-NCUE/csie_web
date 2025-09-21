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
import ManageBrand from '@/components/manage/manage-brand';
import { useTranslator } from '@/hooks/use-translator';

export function AppSidebar() {
    const { auth, locale } = usePage<SharedData>().props;
    const role = auth.user.role;
    const { t } = useTranslator('manage');

    const mainNavItemsByRole: Record<SharedData['auth']['user']['role'], NavItem[]> = {
        admin: [
            {
                title: t('sidebar.admin.dashboard', 'Dashboard'),
                href: '/manage/admin/dashboard',
                icon: LayoutGrid,
            },
            {
                title: t('sidebar.admin.posts', 'Announcements'),
                href: '/manage/admin/posts',
                icon: Megaphone,
            },
            {
                title: t('sidebar.admin.staff', 'Faculty & Staff'),
                href: '/manage/admin/staff',
                icon: UserCheck,
            },
            {
                title: t('sidebar.admin.labs', 'Laboratories'),
                href: '/manage/admin/labs',
                icon: Beaker,
            },
            {
                title: t('sidebar.admin.academics', 'Courses & Programs'),
                href: '/manage/admin/academics',
                icon: GraduationCap,
            },
            {
                title: t('sidebar.admin.users', 'Users'),
                href: '/manage/admin/users',
                icon: Users,
            },
            {
                title: t('sidebar.admin.messages', 'Messages'),
                href: '/manage/admin/contact-messages',
                icon: Mail,
            },
            {
                title: t('sidebar.admin.attachments', 'Attachments'),
                href: '/manage/admin/attachments',
                icon: FileText,
            },
        ],
        teacher: [
            { title: t('sidebar.teacher.dashboard', 'Teaching Home'), href: '/manage/dashboard', icon: LayoutGrid },
            { title: t('sidebar.teacher.posts', 'Announcements'), href: '/manage/teacher/posts', icon: Megaphone },
            { title: t('sidebar.teacher.labs', 'Research'), href: '/manage/teacher/labs', icon: Beaker },
            { title: t('sidebar.teacher.courses', 'Courses & Activities'), href: '/manage/teacher/courses', icon: NotebookPen },
            { title: t('sidebar.teacher.profile', 'Profile Settings'), href: '/settings/profile', icon: Settings },
        ],
        user: [
            { title: t('sidebar.user.dashboard', 'Member Home'), href: '/manage/dashboard', icon: LayoutGrid },
            { title: t('sidebar.user.profile', 'Profile'), href: '/settings/profile', icon: User },
            { title: t('sidebar.user.security', 'Security'), href: '/settings/password', icon: ShieldCheck },
        ],
    };

    const footerNavItemsByRole: Record<SharedData['auth']['user']['role'], NavItem[]> = {
        admin: [
            {
                title: t('sidebar.footer.settings', 'Settings'),
                href: '/settings/profile',
                icon: Settings,
            },
            {
                title: t('sidebar.footer.docs', 'Documentation'),
                href: 'https://laravel.com/docs',
                icon: HelpCircle,
            },
            {
                title: t('sidebar.footer.repo', 'Repository'),
                href: 'https://github.com/Grasonyang/csie_web',
                icon: Folder,
            },
        ],
        teacher: [
            {
                title: t('sidebar.teacher.guide', 'Teaching Guide'),
                href: 'https://github.com/Grasonyang/csie_web',
                icon: HelpCircle,
            },
        ],
        user: [
            {
                title: t('sidebar.user.support', 'Support'),
                href: 'mailto:csie@cc.ncue.edu.tw',
                icon: LifeBuoy,
            },
        ],
    };

    const navLabelsByRole: Partial<Record<SharedData['auth']['user']['role'], string>> = {
        teacher: t('sidebar.teacher.nav_label', 'Teaching'),
        user: t('sidebar.user.nav_label', 'Member area'),
    };

    const mainNavItems = mainNavItemsByRole[role] ?? mainNavItemsByRole.user;
    const footerNavItems = footerNavItemsByRole[role] ?? footerNavItemsByRole.user;
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

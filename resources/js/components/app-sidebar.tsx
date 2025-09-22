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

    const adminNavItems: NavItem[] = [
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
    ];

    const mainNavItemsByRole: Record<SharedData['auth']['user']['role'], NavItem[]> = {
        admin: adminNavItems,
        manager: adminNavItems,
        teacher: [
            { title: t('sidebar.teacher.dashboard'), href: '/manage/dashboard', icon: LayoutGrid },
            { title: t('sidebar.teacher.posts'), href: '/manage/posts', icon: Megaphone },
            { title: t('sidebar.teacher.labs'), href: '/manage/teacher/labs', icon: Beaker },
            { title: t('sidebar.teacher.courses'), href: '/manage/teacher/courses', icon: NotebookPen },
            { title: t('sidebar.teacher.profile'), href: '/manage/settings/profile', icon: Settings },
        ],
        user: [
            { title: t('sidebar.user.dashboard'), href: '/manage/dashboard', icon: LayoutGrid },
            { title: t('sidebar.user.profile'), href: '/manage/settings/profile', icon: User },
            { title: t('sidebar.user.security'), href: '/manage/settings/password', icon: ShieldCheck },
        ],
    };

    const adminFooterItems: NavItem[] = [
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
    ];

    const footerNavItemsByRole: Record<SharedData['auth']['user']['role'], NavItem[]> = {
        admin: adminFooterItems,
        manager: adminFooterItems,
        teacher: [
            {
                title: t('sidebar.teacher.guide'),
                href: 'https://github.com/Grasonyang/csie_web',
                icon: HelpCircle,
            },
        ],
        user: [
            {
                title: t('sidebar.user.support'),
                href: 'mailto:csie@cc.ncue.edu.tw',
                icon: LifeBuoy,
            },
        ],
    };

    const navLabelsByRole: Partial<Record<SharedData['auth']['user']['role'], string>> = {
        teacher: t('sidebar.teacher.nav_label'),
        user: t('sidebar.user.nav_label'),
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

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
} from 'lucide-react';
import ManageBrand from '@/components/manage/manage-brand';
import { useTranslator } from '@/hooks/use-translator';

export function AppSidebar() {
    const { auth, locale } = usePage<SharedData>().props;
    const role = auth.user.role;
    const { t } = useTranslator('manage');

    type UserRole = SharedData['auth']['user']['role'];
    type RoleAwareNavItem = NavItem & { roles?: UserRole[] };

    const localizedMainNavItems: RoleAwareNavItem[] = [
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
            roles: ['admin', 'teacher'],
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
    ];

    const localizedFooterNavItems: NavItem[] = [
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
    ];

    const mainNavItems = localizedMainNavItems.filter((item) => !item.roles || item.roles.includes(role));

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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={localizedFooterNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslator } from '@/hooks/use-translator';
import { buildSidebarNavGroups } from '@/lib/manage/sidebar-nav-groups';
import type { SharedData } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';

interface ManageSidebarMainProps {
    role: 'admin' | 'teacher' | 'user';
}

export default function ManageSidebarMain({ role }: ManageSidebarMainProps) {
    const { t } = useTranslator('manage');
    const page = usePage<SharedData>();
    const currentPath = page.url ?? '';
    const abilities = page.props.abilities;

    const groups = buildSidebarNavGroups(role, t, abilities);

    return (
        <SidebarMenu>
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="space-y-2">
                    <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                        {group.title}
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="space-y-1">
                        {group.items.map((item) => {
                            const hrefString = typeof item.href === 'string' ? item.href : item.href.url || '';
                            return (
                                <SidebarMenuItem key={hrefString}>
                                    <SidebarMenuButton asChild isActive={currentPath.startsWith(hrefString)}>
                                        <Link href={item.href} className="flex items-center gap-3">
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </SidebarMenu>
    );
}



import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { SidebarNavGroup } from '@/lib/manage/sidebar-nav-groups';
import { Link } from '@inertiajs/react';

interface ManageSidebarMainProps {
    groups: SidebarNavGroup[];
    currentPath: string;
}

export default function ManageSidebarMain({ groups, currentPath }: ManageSidebarMainProps) {
    return (
        <SidebarMenu>
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="space-y-2">
                    <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-white/80">
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

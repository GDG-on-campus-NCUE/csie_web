import ManageLogo from '@/components/manage/manage-logo';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';

interface ManageSidebarHeaderProps {
    brand: {
        primary: string;
        secondary?: string;
    };
}

export default function ManageSidebarHeader({ brand }: ManageSidebarHeaderProps) {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex items-center gap-3 px-2 py-3">
                    <ManageLogo />
                    <div className="flex min-w-0 flex-col">
                        <p className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">{brand.primary}</p>
                        {brand.secondary && (
                            <p className="truncate text-xs leading-tight text-sidebar-foreground/70">{brand.secondary}</p>
                        )}
                    </div>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

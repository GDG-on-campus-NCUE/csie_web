import { Button } from '@/components/ui/button';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { useTranslator } from '@/hooks/use-translator';
import { Link } from '@inertiajs/react';
import { Settings, LifeBuoy } from 'lucide-react';

export default function ManageSidebarFooter() {
    const { t } = useTranslator('manage');

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex flex-col gap-1 px-2 py-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        asChild
                    >
                        <Link href="/manage/settings/profile">
                            <Settings className="h-4 w-4" />
                            {t('sidebar.footer.settings', '帳號設定')}
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        asChild
                    >
                        <a href="https://csie.ncku.edu.tw" target="_blank" rel="noreferrer">
                            <LifeBuoy className="h-4 w-4" />
                            {t('sidebar.footer.docs', '使用說明')}
                        </a>
                    </Button>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

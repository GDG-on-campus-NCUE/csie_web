import ManageSidebarFooter from '@/components/manage/manage-sidebar-footer';
import ManageSidebarHeader from '@/components/manage/manage-sidebar-header';
import ManageSidebarMain from '@/components/manage/manage-sidebar-main';
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarSeparator } from '@/components/ui/sidebar';
import { router } from '@inertiajs/react';

export interface ManageSidebarProps {
    brand: {
        primary: string;
        secondary?: string;
    };
    role: 'admin' | 'teacher' | 'user';
    locales: string[];
    currentLocale: string;
}

export default function ManageSidebar({ brand, role, locales, currentLocale }: ManageSidebarProps) {
    const handleLocaleChange = (locale: string) => {
        // 使用 GET 進行語系切換，保留捲動位置讓體驗更順暢
        router.visit(`/lang/${locale}`, {
            method: 'get',
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <SidebarHeader>
                <ManageSidebarHeader
                    brand={brand}
                    locales={locales}
                    currentLocale={currentLocale}
                    onLocaleChange={handleLocaleChange}
                />
            </SidebarHeader>
            <SidebarContent>
                <ManageSidebarMain role={role} />
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter>
                <ManageSidebarFooter />
            </SidebarFooter>
        </>
    );
}

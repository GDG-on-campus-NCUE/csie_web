import ManageBrand, { type ManageRole } from '@/components/manage/manage-brand';
import LanguageSwitcher from '@/components/language-switcher';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface ManageHeaderProps {
    role?: ManageRole;
}

export default function ManageHeader({ role: roleOverride }: ManageHeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const role = (roleOverride ?? auth?.user?.role ?? 'user') as ManageRole;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-0 text-neutral-700 md:px-6">
            {/* 側邊欄觸發器和品牌標誌 */}
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 h-8 w-8 flex-shrink-0 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50" />
                <div className="flex flex-shrink-0 items-center gap-2 md:hidden">
                    <ManageBrand role={role} />
                </div>
            </div>

            {/* 語言切換器 */}
            <div className="flex-shrink-0">
                <LanguageSwitcher variant="light" />
            </div>
        </header>
    );
}

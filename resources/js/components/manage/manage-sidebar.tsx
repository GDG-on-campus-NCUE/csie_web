import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';

/**
 * 前台側邊欄的預設佈局
 * 若未設計導覽內容，先提供友善的佔位提示
 */
export function ManageSidebar() {
    return (
        <Sidebar className="bg-white text-slate-900">
            <SidebarHeader className="border-b border-slate-200 px-4 py-4">
                <div className="text-lg font-semibold">CSIE Portal</div>
                <p className="text-xs text-slate-500">尚未設定導覽項目</p>
            </SidebarHeader>
            <SidebarContent className="flex flex-1 items-center justify-center p-4 text-sm text-slate-400">
                <span>請於 ManageSidebar 組件中配置導覽內容</span>
            </SidebarContent>
        </Sidebar>
    );
}


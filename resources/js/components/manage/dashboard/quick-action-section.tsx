import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PermissionGuard, type PermissionKey } from '@/components/manage/utils/permission-utils';
import type { ManageRole } from '@/components/manage/manage-brand';
import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

/**
 * 快速操作項目設定
 * 以資料結構方式描述按鈕與權限需求
 */
export interface QuickActionItem {
    /** 按鈕標籤文字 */
    label: string;
    /** 對應的圖示元件 */
    icon: LucideIcon;
    /** 導向連結，可根據角色動態決定 */
    href: string | ((role: ManageRole) => string);
    /**
     * 權限鍵值，若未提供則不做權限檢查
     * 僅當使用者擁有權限時才會顯示按鈕
     */
    permission?: PermissionKey;
}

interface QuickActionSectionProps {
    /** 卡片標題 */
    title: string;
    /** 卡片描述 */
    description: string;
    /** 當前登入角色，用於判斷連結 */
    role: ManageRole;
    /** 快速操作項目列表 */
    actions: QuickActionItem[];
}

/**
 * 快速操作按鈕
 * 依照權限與角色動態顯示
 */
function QuickActionButton({ role, action }: { role: ManageRole; action: QuickActionItem }) {
    const { icon: Icon, label, permission } = action;
    const href = typeof action.href === 'function' ? action.href(role) : action.href;

    const button = (
        <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
            <Link href={href}>
                <Icon className="h-6 w-6" />
                <span>{label}</span>
            </Link>
        </Button>
    );

    if (!permission) {
        return button;
    }

    return <PermissionGuard permission={permission}>{button}</PermissionGuard>;
}

/**
 * 快速操作卡片
 * 接受一組操作項目並統一渲染版型
 */
export function QuickActionSection({ title, description, role, actions }: QuickActionSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {actions.map((action) => (
                        <QuickActionButton key={action.label} role={role} action={action} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

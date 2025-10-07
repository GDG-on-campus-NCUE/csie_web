import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/shared/utils';
import type { LucideIcon } from 'lucide-react';
import { Filter } from 'lucide-react';

export type BulkActionType = 'publish' | 'unpublish' | 'archive' | 'delete';

export interface BulkActionConfig {
    type: BulkActionType;
    label: string;
    icon: LucideIcon;
    buttonClass: string;
    iconClass: string;
}

export interface BulkActionsBarProps {
    /**
     * 可用的批次操作清單。
     */
    actions: BulkActionConfig[];
    /**
     * 目前選取的資料數量，用於顯示徽章。
     */
    selectedCount: number;
    /**
     * 是否停用操作元件。
     */
    disabled?: boolean;
    /**
     * 操作選項被觸發時的回呼。
     */
    onAction: (action: BulkActionType) => void;
    /**
     * 呈現模式: 下拉選單或垂直按鈕列。
     */
    variant?: 'dropdown' | 'list';
}

export default function BulkActionsBar({
    actions,
    selectedCount,
    disabled,
    onAction,
    variant = 'dropdown',
}: BulkActionsBarProps) {
    const { t: tPosts } = useTranslator('manage.posts');

    if (variant === 'list') {
        return (
            <div className="flex flex-col gap-2">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Button
                            key={action.type}
                            type="button"
                            className={cn('w-full justify-center gap-2', action.buttonClass)}
                            onClick={() => onAction(action.type)}
                            disabled={disabled}
                        >
                            <Icon className="h-4 w-4" />
                            {action.label}
                        </Button>
                    );
                })}
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className={cn(
                        'h-10 gap-2 border-neutral-300 bg-white text-neutral-700 shadow-sm hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700',
                        selectedCount > 0 && 'border-primary-300 bg-primary-50 text-primary-700'
                    )}
                >
                    <Filter className="h-4 w-4" />
                    {tPosts('bulk.menu', '批次操作')}
                    {selectedCount > 0 ? (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                            {selectedCount}
                        </Badge>
                    ) : null}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <DropdownMenuItem key={action.type} onSelect={() => onAction(action.type)} className="gap-2">
                            <Icon className={cn('h-4 w-4', action.iconClass)} />
                            {action.label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

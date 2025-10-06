import type { ReactNode } from 'react';
import { cn } from '@/lib/shared/utils';

export interface ManageFilterGridProps {
    /**
     * 篩選器內容，應包含使用網格布局的子元件
     */
    children: ReactNode;
    /**
     * 額外的 CSS 類別
     */
    className?: string;
}

/**
 * 管理頁面標準篩選器容器
 *
 * 提供 12 欄網格系統，確保各頁面篩選器布局一致。
 *
 * @example
 * ```tsx
 * <ManageFilterGrid>
 *   <div className="col-span-12 md:col-span-6 lg:col-span-4">
 *     <Input placeholder="搜尋..." />
 *   </div>
 *   <div className="col-span-12 md:col-span-3 lg:col-span-2">
 *     <Select>{// 狀態選項}</Select>
 *   </div>
 * </ManageFilterGrid>
 * ```
 */
export function ManageFilterGrid({ children, className }: ManageFilterGridProps) {
    return (
        <div
            className={cn(
                'grid grid-cols-12 gap-3 rounded-xl border border-neutral-200/80 bg-white/95 p-4 shadow-sm',
                className
            )}
        >
            {children}
        </div>
    );
}

export type FilterFieldSize = 'full' | 'half' | 'third' | 'quarter' | 'two-thirds';

const FIELD_SIZE_CLASSES: Record<FilterFieldSize, string> = {
    full: 'col-span-12 md:col-span-12 lg:col-span-12',
    half: 'col-span-12 md:col-span-6 lg:col-span-6',
    third: 'col-span-12 md:col-span-4 lg:col-span-4',
    quarter: 'col-span-12 md:col-span-3 lg:col-span-3',
    'two-thirds': 'col-span-12 md:col-span-8 lg:col-span-8',
};

export interface ManageFilterFieldProps {
    /**
     * 預設欄位大小
     * - full: 12 欄（100%）
     * - half: 6 欄（50%）
     * - third: 4 欄（33.33%）
     * - quarter: 3 欄（25%）
     * - two-thirds: 8 欄（66.67%）
     */
    size?: FilterFieldSize;
    /**
     * 欄位內容
     */
    children: ReactNode;
    /**
     * 額外的 CSS 類別
     */
    className?: string;
}

/**
 * 篩選器欄位包裝器
 *
 * 提供響應式欄位寬度配置。
 *
 * @example
 * ```tsx
 * <ManageFilterField size="third">
 *   <Input placeholder="搜尋關鍵字" />
 * </ManageFilterField>
 * ```
 */
export function ManageFilterField({
    size = 'third',
    children,
    className,
}: ManageFilterFieldProps) {
    return (
        <div className={cn(FIELD_SIZE_CLASSES[size], className)}>
            {children}
        </div>
    );
}

export interface ManageFilterActionsProps {
    /**
     * 主要動作按鈕（左側或上方）
     */
    primary?: ReactNode;
    /**
     * 次要動作按鈕（右側或下方）
     */
    secondary?: ReactNode;
    /**
     * 額外的 CSS 類別
     */
    className?: string;
    /**
     * 是否在桌面版佔滿整行
     */
    fullWidth?: boolean;
}

/**
 * 篩選器動作按鈕群組
 *
 * 提供主要與次要按鈕的標準布局。
 *
 * @example
 * ```tsx
 * <ManageFilterActions
 *   primary={<Button>套用篩選</Button>}
 *   secondary={<Button variant="outline">重設</Button>}
 * />
 * ```
 */
export function ManageFilterActions({
    primary,
    secondary,
    className,
    fullWidth = false,
}: ManageFilterActionsProps) {
    return (
        <div
            className={cn(
                'col-span-12 flex flex-col gap-2',
                fullWidth ? 'lg:col-span-12' : 'lg:col-span-4',
                'lg:flex-row lg:items-center lg:justify-end',
                className
            )}
        >
            {primary && (
                <div className="flex-1 lg:flex-initial">
                    {primary}
                </div>
            )}
            {secondary && (
                <div className="flex-1 lg:flex-initial">
                    {secondary}
                </div>
            )}
        </div>
    );
}

export default ManageFilterGrid;

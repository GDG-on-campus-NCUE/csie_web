import type { HTMLAttributes, ReactNode } from 'react';

import TableEmpty from './table-empty';
import TableLoading from './table-loading';
import { cn } from '@/lib/shared/utils';

const BREAKPOINT_PREFIX: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
};

type Renderable = ReactNode | (() => ReactNode);

function resolveRenderable(node: Renderable): ReactNode {
    return typeof node === 'function' ? (node as () => ReactNode)() : node;
}

export interface ResponsiveDataViewProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * 呈現模式: 自動依斷點切換、固定表格或固定卡片。
     */
    mode?: 'auto' | 'table' | 'card';
    /**
     * 切換為桌機表格的斷點,預設為 md。
     */
    breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
    /**
     * 表格視圖,可傳入 ReactNode 或 Render Prop。
     */
    table: Renderable;
    /**
     * 卡片視圖,可傳入 ReactNode 或 Render Prop。
     */
    card: Renderable;
    /**
     * 是否進入載入狀態。
     */
    isLoading?: boolean;
    /**
     * 自訂載入時的骨架畫面。
     */
    loadingFallback?: ReactNode;
    /**
     * 是否為空資料,會改顯示 emptyState。
     */
    isEmpty?: boolean;
    /**
     * 空狀態呈現內容,預設使用 TableEmpty。
     */
    emptyState?: ReactNode;
    /**
     * 行動版固定於底部的操作列,可放置批次操作按鈕。
     */
    stickyActions?: ReactNode;
}

const MODE_CLASS_MAP: Record<'auto' | 'table' | 'card', (prefix: string) => { table: string; card: string }> = {
    auto: (prefix) => ({
        table: `hidden ${prefix}:block`,
        card: `block ${prefix}:hidden`,
    }),
    table: () => ({
        table: 'block',
        card: 'hidden',
    }),
    card: () => ({
        table: 'hidden',
        card: 'block',
    }),
};

export function ResponsiveDataView({
    mode = 'auto',
    breakpoint = 'md',
    table,
    card,
    isLoading,
    loadingFallback,
    isEmpty,
    emptyState,
    stickyActions,
    className,
    ...props
}: ResponsiveDataViewProps) {
    const prefix = BREAKPOINT_PREFIX[breakpoint];
    const visibility = MODE_CLASS_MAP[mode](prefix);

    if (isLoading) {
        return (
            <div className={cn('space-y-4', className)} {...props}>
                {loadingFallback ?? <TableLoading rows={4} columns={4} className="p-6" />}
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className={cn('space-y-4', className)} {...props}>
                {emptyState ?? <TableEmpty />}
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)} data-mode={mode} {...props}>
            <div className={cn('w-full', visibility.card)}>{resolveRenderable(card)}</div>
            <div className={cn('w-full', visibility.table)}>{resolveRenderable(table)}</div>

            {stickyActions ? (
                <div className="pointer-events-none md:hidden">
                    <div className="sticky bottom-4 left-0 right-0 mx-auto flex w-full max-w-md gap-2 rounded-2xl border border-neutral-200/80 bg-white/95 p-4 shadow-lg shadow-neutral-900/10">
                        <div className="pointer-events-auto flex w-full flex-col gap-2">{stickyActions}</div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default ResponsiveDataView;

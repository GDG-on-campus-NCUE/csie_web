import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/shared/utils';

const BREAKPOINT_PREFIX: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
};

export type ManageToolbarOrientation = 'horizontal' | 'vertical';

export interface ManageToolbarProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * 控制工具列在桌機時的排列方向,行動版會自動改為直向堆疊。
     */
    orientation?: ManageToolbarOrientation;
    /**
     * 主要操作群組,預設排列在左側或上方。
     */
    primary?: ReactNode;
    /**
     * 次要操作群組,預設排列在右側或下方。
     */
    secondary?: ReactNode;
    /**
     * 自動換行的斷點,預設在 md 以上恢復桌機排列。
     */
    breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
    /**
     * 是否允許桌機狀態下的內容自動換行。
     */
    wrap?: boolean;
}

const PRIMARY_BASE = 'flex flex-col gap-2';
const SECONDARY_BASE = 'flex flex-col gap-2';

function getHorizontalClasses(prefix: string, wrap?: boolean) {
    return cn(
        `${prefix}:flex-row ${prefix}:items-center ${prefix}:gap-3`,
        wrap && `${prefix}:flex-wrap`
    );
}

function getVerticalClasses(prefix: string, wrap?: boolean) {
    return cn(
        `${prefix}:flex-col ${prefix}:items-start ${prefix}:gap-2`,
        wrap && `${prefix}:flex-wrap`
    );
}

export const ManageToolbar = forwardRef<HTMLDivElement, ManageToolbarProps>(
    (
        {
            orientation = 'horizontal',
            primary,
            secondary,
            breakpoint = 'md',
            wrap,
            className,
            children,
            ...props
        },
        ref
    ) => {
        const prefix = BREAKPOINT_PREFIX[breakpoint];
        const isVertical = orientation === 'vertical';

        const containerClass = cn(
            'flex w-full flex-col gap-3 rounded-xl border border-neutral-200/80 bg-white/95 p-4 shadow-sm',
            isVertical
                ? `${prefix}:flex-col ${prefix}:items-stretch`
                : `${prefix}:flex-row ${prefix}:items-center ${prefix}:justify-between`,
            className
        );

        const primaryClasses = cn(
            PRIMARY_BASE,
            isVertical ? getVerticalClasses(prefix, wrap) : getHorizontalClasses(prefix, wrap)
        );

        const secondaryClasses = cn(
            SECONDARY_BASE,
            isVertical
                ? cn(getVerticalClasses(prefix, wrap), `${prefix}:items-end`)
                : cn(getHorizontalClasses(prefix, wrap), `${prefix}:justify-end`)
        );

        return (
            <div ref={ref} className={containerClass} data-orientation={orientation} {...props}>
                {primary ? <div className={primaryClasses}>{primary}</div> : null}
                {children ? (
                    <div
                        className={cn(
                            'flex flex-col gap-2',
                            isVertical
                                ? `${prefix}:flex-col ${prefix}:gap-2`
                                : `${prefix}:flex-row ${prefix}:items-center ${prefix}:gap-3`,
                            wrap && `${prefix}:flex-wrap`
                        )}
                    >
                        {children}
                    </div>
                ) : null}
                {secondary ? <div className={secondaryClasses}>{secondary}</div> : null}
            </div>
        );
    }
);

ManageToolbar.displayName = 'ManageToolbar';

export default ManageToolbar;

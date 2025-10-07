import type { ReactNode } from 'react';

import { cn } from '@/lib/shared/utils';

export interface ManageResourceLayoutProps {
    /**
     * 篩選區域的內容。
     */
    filter?: ReactNode;
    /**
     * 工具列內容 (例如狀態篩選、操作按鈕)。
     */
    toolbar?: ReactNode;
    /**
     * 主要資料內容。
     */
    children: ReactNode;
    /**
     * 行動版固定於底部的行動列內容。
     */
    stickyActions?: ReactNode;
    /**
     * 佈局容器的額外 className。
     */
    className?: string;
    /**
     * 主要內容區塊的額外 className。
     */
    contentClassName?: string;
}

export default function ManageResourceLayout({
    filter,
    toolbar,
    children,
    stickyActions,
    className,
    contentClassName,
}: ManageResourceLayoutProps) {
    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {filter ? <div className="w-full">{filter}</div> : null}
            {toolbar ? <div className="w-full">{toolbar}</div> : null}
            <div
                className={cn(
                    'w-full rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm',
                    contentClassName
                )}
            >
                {children}
            </div>
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

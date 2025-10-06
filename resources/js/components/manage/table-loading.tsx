import type { ReactNode } from 'react';

import { Loader2 } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/shared/utils';

interface TableLoadingProps {
    rows?: number;
    columns?: number;
    icon?: ReactNode;
    message?: string;
    description?: string;
    className?: string;
}

export default function TableLoading({
    rows = 5,
    columns = 5,
    icon,
    message = '資料載入中',
    description = '請稍候,系統正在處理您的請求。',
    className,
}: TableLoadingProps) {
    return (
        <div
            className={cn(
                'space-y-4 rounded-xl border border-neutral-200 bg-white/95 p-6 shadow-sm',
                className
            )}
        >
            <div className="flex flex-col items-center gap-2 text-center text-neutral-600">
                <span className="flex size-12 items-center justify-center rounded-full bg-neutral-50">
                    {icon ?? <Loader2 className="size-6 animate-spin text-neutral-400" aria-hidden="true" />}
                </span>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-neutral-800">{message}</p>
                    {description ? <p className="text-xs text-neutral-500">{description}</p> : null}
                </div>
            </div>

            <div className="space-y-2">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div
                        key={`table-loading-row-${rowIndex}`}
                        className="grid w-full items-center gap-3"
                        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                    >
                        {Array.from({ length: columns }).map((__, columnIndex) => (
                            <Skeleton key={`table-loading-cell-${rowIndex}-${columnIndex}`} className="h-10 w-full" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

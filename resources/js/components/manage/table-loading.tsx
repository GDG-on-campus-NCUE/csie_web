import { Fragment } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/shared/utils';

interface TableLoadingProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export default function TableLoading({ rows = 5, columns = 5, className }: TableLoadingProps) {
    return (
        <div className={cn('space-y-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm', className)}>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={`table-loading-row-${rowIndex}`} className="grid w-full items-center gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                    {Array.from({ length: columns }).map((__, columnIndex) => (
                        <Fragment key={`table-loading-cell-${rowIndex}-${columnIndex}`}>
                            <Skeleton className="h-10 w-full" />
                        </Fragment>
                    ))}
                </div>
            ))}
        </div>
    );
}

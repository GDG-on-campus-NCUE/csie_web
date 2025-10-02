import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/shared/utils';

interface TableEmptyProps {
    title?: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export default function TableEmpty({
    title = '目前沒有資料',
    description = '試著調整篩選條件或新增一筆資料。',
    action,
    className,
}: TableEmptyProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 p-10 text-center shadow-inner', className)}>
            <span className="flex size-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <Inbox className="size-7" aria-hidden="true" />
            </span>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
                {description ? <p className="max-w-md text-sm text-neutral-500">{description}</p> : null}
            </div>
            {action ? <div className="flex items-center justify-center gap-2">{action}</div> : null}
        </div>
    );
}

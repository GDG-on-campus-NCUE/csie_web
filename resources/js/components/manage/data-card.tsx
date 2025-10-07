import type { ReactNode } from 'react';

import { Link } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/shared/utils';

export type DataCardStatusTone = 'neutral' | 'success' | 'info' | 'warning' | 'danger';

interface DataCardStatus {
    label: string;
    tone?: DataCardStatusTone;
    badgeColor?: string;
    color?: string;
    icon?: ReactNode;
}

interface DataCardMetadata {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
}

export interface DataCardProps {
    title: string;
    description?: string;
    status?: DataCardStatus;
    metadata?: DataCardMetadata[];
    actions?: ReactNode;
    mobileActions?: ReactNode;
    href?: string;
    image?: string;
    footer?: ReactNode;
    children?: ReactNode;
    className?: string;
}

const STATUS_TONE_CLASS: Record<DataCardStatusTone, string> = {
    neutral: 'border-neutral-200 bg-neutral-50 text-neutral-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-rose-200 bg-rose-50 text-rose-700',
};

function renderStatus(status: DataCardStatus | undefined) {
    if (!status) {
        return null;
    }

    const toneClass = status.badgeColor ?? (status.tone ? STATUS_TONE_CLASS[status.tone] : STATUS_TONE_CLASS.neutral);

    return (
        <Badge
            variant="outline"
            className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', toneClass, status.color)}
        >
            {status.icon ? <span className="text-sm leading-none text-inherit">{status.icon}</span> : null}
            {status.label}
        </Badge>
    );
}

/**
 * DataCard - 資料列表在行動版的標準呈現,支援標題、狀態徽章、主內容插槽與行動版操作列。
 */
export function DataCard({
    title,
    description,
    status,
    metadata,
    actions,
    mobileActions,
    href,
    image,
    footer,
    children,
    className,
}: DataCardProps) {
    const content = (
        <Card
            className={cn(
                'group relative overflow-hidden border border-neutral-200/70 bg-white/95 shadow-sm transition-all hover:border-blue-300 hover:shadow-md',
                className
            )}
        >
            {image ? (
                <div className="aspect-video w-full overflow-hidden bg-neutral-100">
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            ) : null}

            <CardContent className={cn('space-y-4', image ? 'pt-4' : 'py-4')}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                        <h3 className="text-base font-semibold text-neutral-900 group-hover:text-blue-600">{title}</h3>
                        {description ? <p className="text-sm text-neutral-600">{description}</p> : null}
                        {children ? <div className="space-y-3 text-sm text-neutral-700">{children}</div> : null}
                    </div>
                    {renderStatus(status)}
                </div>

                {metadata && metadata.length > 0 ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-neutral-100 pt-3 text-xs text-neutral-600">
                        {metadata.map((item, index) => (
                            <div key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                                {item.icon ? <span className="text-neutral-400">{item.icon}</span> : null}
                                <span className="font-medium text-neutral-500">{item.label}:</span>
                                <span className="text-neutral-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                ) : null}

                {actions ? (
                    <div className="hidden flex-wrap gap-2 border-t border-neutral-100 pt-3 md:flex">{actions}</div>
                ) : null}

                {footer ? <div className="border-t border-neutral-100 pt-3 text-sm text-neutral-600">{footer}</div> : null}
            </CardContent>

            {actions ? (
                <div className="border-t border-neutral-100 px-4 py-3 md:hidden">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">{actions}</div>
                </div>
            ) : null}

            {mobileActions ? (
                <div className="border-t border-neutral-100 px-4 py-3 md:hidden">
                    <div className="flex flex-col gap-2">{mobileActions}</div>
                </div>
            ) : null}
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2">
                {content}
            </Link>
        );
    }

    return content;
}

export default DataCard;

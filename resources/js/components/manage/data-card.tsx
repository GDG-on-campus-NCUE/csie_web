import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/shared/utils';
import { Link } from '@inertiajs/react';

interface DataCardProps {
    title: string;
    description?: string;
    status?: {
        label: string;
        variant?: 'default' | 'secondary' | 'destructive' | 'outline';
        color?: string;
    };
    metadata?: Array<{
        label: string;
        value: string | number;
        icon?: ReactNode;
    }>;
    actions?: ReactNode;
    href?: string;
    image?: string;
    footer?: ReactNode;
    className?: string;
}

/**
 * DataCard - 資料卡片元件
 *
 * 用於列表項目的卡片化呈現,支援標題、狀態、後設資料與操作區
 * 符合 plan.md 第 7.1 節的共用元件規範與第 2.2 節的內容區塊設計
 */
export function DataCard({
    title,
    description,
    status,
    metadata,
    actions,
    href,
    image,
    footer,
    className,
}: DataCardProps) {
    const content = (
        <Card className={cn(
            'group relative overflow-hidden border border-neutral-200/60 bg-white shadow-sm transition-all',
            href && 'cursor-pointer hover:border-blue-300 hover:shadow-md',
            className
        )}
        >
            {image ? (
                <div className="aspect-video w-full overflow-hidden bg-neutral-100">
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                </div>
            ) : null}
            <CardContent className={cn('space-y-3', image ? 'pt-4' : '')}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                        <h3 className="text-base font-semibold text-neutral-900 group-hover:text-blue-600">
                            {title}
                        </h3>
                        {description ? (
                            <p className="line-clamp-2 text-sm text-neutral-600">{description}</p>
                        ) : null}
                    </div>
                    {status ? (
                        <Badge
                            variant={status.variant ?? 'outline'}
                            className={cn(
                                'shrink-0 text-xs',
                                status.color
                            )}
                        >
                            {status.label}
                        </Badge>
                    ) : null}
                </div>

                {metadata && metadata.length > 0 ? (
                    <div className="flex flex-wrap gap-4 border-t border-neutral-100 pt-3 text-xs text-neutral-600">
                        {metadata.map((item, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                                {item.icon ? (
                                    <span className="text-neutral-400">{item.icon}</span>
                                ) : null}
                                <span className="font-medium text-neutral-500">{item.label}:</span>
                                <span className="text-neutral-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                ) : null}

                {actions ? (
                    <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
                        {actions}
                    </div>
                ) : null}

                {footer ? (
                    <div className="border-t border-neutral-100 pt-3">
                        {footer}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link href={href}>
                {content}
            </Link>
        );
    }

    return content;
}

export default DataCard;

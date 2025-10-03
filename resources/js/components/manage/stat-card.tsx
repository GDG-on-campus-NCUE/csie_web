import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/shared/utils';
import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: LucideIcon;
    trend?: 'up' | 'down' | 'flat';
    delta?: number;
    deltaLabel?: string;
    href?: string;
    suffix?: string;
    className?: string;
    children?: ReactNode;
}

/**
 * StatCard - 統計卡片元件
 *
 * 用於顯示儀表板統計資料,支援圖示、趨勢指標與連結
 * 符合 plan.md 第 7.1 節的共用元件規範
 */
export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend = 'flat',
    delta,
    deltaLabel,
    href,
    suffix,
    className,
    children,
}: StatCardProps) {
    const isPositive = trend === 'up' && (delta ?? 0) > 0;
    const isNegative = trend === 'down' && (delta ?? 0) < 0;

    const content = (
        <Card className={cn('border border-neutral-200/60 bg-white shadow-sm transition-all hover:shadow-md', className)}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                <div className="flex flex-1 flex-col gap-1">
                    <CardTitle className="text-sm font-medium text-neutral-600">
                        {title}
                    </CardTitle>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-neutral-900">{value}</span>
                        {suffix ? <span className="text-sm text-neutral-500">{suffix}</span> : null}
                    </div>
                </div>
                {Icon ? (
                    <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <Icon className="h-4 w-4" />
                    </span>
                ) : null}
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-neutral-500">
                {description ? (
                    <p className="text-neutral-600">{description}</p>
                ) : null}
                {children}
                {delta !== undefined && delta !== null && deltaLabel ? (
                    <div className="flex items-center gap-1 text-[11px]">
                        {isPositive ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : null}
                        {isNegative ? <ArrowDownRight className="h-3 w-3 text-rose-500" /> : null}
                        {!isPositive && !isNegative ? <Minus className="h-3 w-3 text-neutral-400" /> : null}
                        <span className={cn('font-medium', {
                            'text-emerald-600': isPositive,
                            'text-rose-600': isNegative,
                        })}
                        >
                            {delta > 0 ? `+${delta}` : delta}
                        </span>
                        <span className="text-neutral-500">{deltaLabel}</span>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block">
                {content}
            </Link>
        );
    }

    return content;
}

export default StatCard;

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ManagePageHeaderProps {
    title: string;
    description?: string;
    badge?: { label: string; icon?: ReactNode } | null;
    actions?: ReactNode;
    className?: string;
}

export function ManagePageHeader({
    title,
    description,
    badge = null,
    actions,
    className,
}: ManagePageHeaderProps) {
    return (
        <Card className={cn('border border-slate-200 bg-white shadow-sm', className)}>
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    {badge && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {badge.icon}
                            {badge.label}
                        </span>
                    )}
                    <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
                    {description && <p className="text-sm text-slate-600">{description}</p>}
                </div>
                {actions && (
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">{actions}</div>
                )}
            </CardContent>
        </Card>
    );
}

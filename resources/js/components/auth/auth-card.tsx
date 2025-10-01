import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/shared/utils';
import { type PropsWithChildren } from 'react';

interface AuthCardProps {
    /**
     * 使用說明：提供主要標題
     */
    title: string;
    /**
     * 使用說明：提供副標描述
     */
    description?: string;
    className?: string;
    contentClassName?: string;
}

export function AuthCard({
    title,
    description,
    className = '',
    contentClassName = '',
    children,
}: PropsWithChildren<AuthCardProps>) {
    return (
        <Card
            className={cn(
                'relative w-full rounded-[28px] border border-slate-200/70 bg-white/90 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm',
                className,
            )}
        >
            <CardHeader className="px-8 pt-10 pb-0 text-left">
                <CardTitle className="font-serif text-4xl font-semibold text-slate-900 sm:text-5xl">{title}</CardTitle>
                {description && (
                    <CardDescription className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
                        {description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className={cn('px-8 py-8 sm:px-10 sm:py-10', contentClassName)}>{children}</CardContent>
        </Card>
    );
}

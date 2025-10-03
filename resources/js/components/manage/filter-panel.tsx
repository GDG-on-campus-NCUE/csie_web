import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/shared/utils';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

interface FilterPanelProps {
    title?: string;
    children: ReactNode;
    onApply?: () => void;
    onReset?: () => void;
    applyLabel?: string;
    resetLabel?: string;
    defaultOpen?: boolean;
    className?: string;
    collapsible?: boolean;
}

/**
 * FilterPanel - 篩選面板元件
 *
 * 提供統一的篩選介面,支援展開/收合、套用與重設功能
 * 符合 plan.md 第 7.1 節的共用元件規範
 */
export function FilterPanel({
    title = '篩選條件',
    children,
    onApply,
    onReset,
    applyLabel = '套用',
    resetLabel = '重設',
    defaultOpen = true,
    className,
    collapsible = true,
}: FilterPanelProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    if (!collapsible) {
        return (
            <Card className={cn('border border-neutral-200/60 bg-white shadow-sm', className)}>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-neutral-500" />
                        <CardTitle className="text-base font-semibold text-neutral-900">{title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {children}
                    {(onApply || onReset) ? (
                        <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
                            {onApply ? (
                                <Button onClick={onApply} size="sm" className="flex-1 sm:flex-initial">
                                    {applyLabel}
                                </Button>
                            ) : null}
                            {onReset ? (
                                <Button onClick={onReset} variant="outline" size="sm" className="flex-1 sm:flex-initial">
                                    <X className="mr-1.5 h-3.5 w-3.5" />
                                    {resetLabel}
                                </Button>
                            ) : null}
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        );
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn('space-y-2', className)}>
            <Card className="border border-neutral-200/60 bg-white shadow-sm">
                <CollapsibleTrigger asChild>
                    <CardHeader className="flex cursor-pointer flex-row items-center justify-between pb-4 hover:bg-neutral-50/50">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-neutral-500" />
                            <CardTitle className="text-base font-semibold text-neutral-900">{title}</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {isOpen ? (
                                <ChevronUp className="h-4 w-4 text-neutral-500" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-neutral-500" />
                            )}
                            <span className="sr-only">{isOpen ? '收合篩選' : '展開篩選'}</span>
                        </Button>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="space-y-4">
                        {children}
                        {(onApply || onReset) ? (
                            <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
                                {onApply ? (
                                    <Button onClick={onApply} size="sm" className="flex-1 sm:flex-initial">
                                        {applyLabel}
                                    </Button>
                                ) : null}
                                {onReset ? (
                                    <Button onClick={onReset} variant="outline" size="sm" className="flex-1 sm:flex-initial">
                                        <X className="mr-1.5 h-3.5 w-3.5" />
                                        {resetLabel}
                                    </Button>
                                ) : null}
                            </div>
                        ) : null}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}

export default FilterPanel;

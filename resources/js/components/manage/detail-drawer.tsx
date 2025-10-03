import { type ReactNode, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

interface DetailDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    side?: 'left' | 'right' | 'top' | 'bottom';
    className?: string;
    size?: 'default' | 'sm' | 'lg' | 'xl' | 'full';
}

/**
 * DetailDrawer - 詳細資訊抽屜元件
 *
 * 滑出式側邊欄,用於檢視與編輯詳細資訊,避免跳離列表頁
 * 符合 plan.md 第 3.4 節的細節檢視設計與第 7.1 節的共用元件規範
 */
export function DetailDrawer({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    side = 'right',
    className,
    size = 'lg',
}: DetailDrawerProps) {
    // 處理 ESC 鍵關閉
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open, onOpenChange]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={side}
                className={cn(
                    'flex flex-col gap-0 overflow-hidden p-0',
                    size === 'sm' && 'max-w-sm',
                    size === 'default' && 'max-w-md',
                    size === 'lg' && 'max-w-2xl',
                    size === 'xl' && 'max-w-4xl',
                    size === 'full' && 'max-w-full',
                    className
                )}
            >
                {/* Header */}
                <SheetHeader className="shrink-0 space-y-2 border-b border-neutral-200 bg-neutral-50/50 px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                            <SheetTitle className="text-lg font-semibold text-neutral-900">
                                {title}
                            </SheetTitle>
                            {description ? (
                                <SheetDescription className="text-sm text-neutral-600">
                                    {description}
                                </SheetDescription>
                            ) : null}
                        </div>
                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-900"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">關閉</span>
                            </Button>
                        </SheetClose>
                    </div>
                </SheetHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {children}
                </div>

                {/* Footer */}
                {footer ? (
                    <>
                        <Separator />
                        <div className="shrink-0 border-t border-neutral-200 bg-neutral-50/50 px-6 py-4">
                            {footer}
                        </div>
                    </>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}

export default DetailDrawer;

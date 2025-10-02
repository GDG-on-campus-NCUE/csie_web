import type { ReactNode } from 'react';

import { cn } from '@/lib/shared/utils';

interface FormActionsProps {
    children: ReactNode;
    align?: 'start' | 'center' | 'end' | 'between';
    className?: string;
    sticky?: boolean;
}

export default function FormActions({ children, align = 'end', className, sticky }: FormActionsProps) {
    const alignment =
        align === 'between'
            ? 'justify-between'
            : align === 'center'
              ? 'justify-center'
              : align === 'start'
                ? 'justify-start'
                : 'justify-end';

    return (
        <div
            className={cn(
                'flex flex-wrap gap-3 border-t border-neutral-200 bg-white/90 px-6 py-4 shadow-inner lg:px-8',
                alignment,
                sticky ? 'sticky bottom-0 z-10 backdrop-blur' : '',
                className
            )}
        >
            {children}
        </div>
    );
}

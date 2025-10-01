import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ManageMainContentProps {
    children: ReactNode;
    className?: string;
}

export default function ManageMainContent({ children, className }: ManageMainContentProps) {
    return (
        <section className={cn('flex flex-col gap-6', className)}>
            {children}
        </section>
    );
}

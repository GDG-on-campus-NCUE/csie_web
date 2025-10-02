import type { ReactNode } from 'react';

import { cn } from '@/lib/shared/utils';

interface FormSectionProps {
    title?: string;
    description?: string;
    aside?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

export default function FormSection({ title, description, aside, children, className, contentClassName }: FormSectionProps) {
    return (
        <section className={cn('rounded-2xl border border-neutral-200/80 bg-white/90 shadow-sm backdrop-blur-sm', className)}>
            <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:gap-10">
                <div className="flex w-full flex-col gap-4 lg:max-w-xs">
                    {title ? <h2 className="text-lg font-semibold text-neutral-900">{title}</h2> : null}
                    {description ? <p className="text-sm text-neutral-500">{description}</p> : null}
                    {aside ? <div className="mt-2 space-y-2 text-sm text-neutral-500">{aside}</div> : null}
                </div>
                <div className={cn('flex-1 space-y-4', contentClassName)}>{children}</div>
            </div>
        </section>
    );
}

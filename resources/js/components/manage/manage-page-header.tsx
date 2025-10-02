import type { ReactNode } from 'react';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/shared/utils';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types/shared';

interface ManagePageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItemType[];
    actions?: ReactNode;
    toolbar?: ReactNode;
    className?: string;
}

export default function ManagePageHeader({ title, description, breadcrumbs, actions, toolbar, className }: ManagePageHeaderProps) {
    return (
        <header className={cn('flex flex-col gap-4 pb-4', className)}>
            {breadcrumbs && breadcrumbs.length > 0 ? (
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((breadcrumb, index) => (
                            <BreadcrumbItem key={`${breadcrumb.href}-${index}`}>
                                {index < breadcrumbs.length - 1 ? (
                                    <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.title}</BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                                )}
                                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                            </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            ) : null}

            <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-1 flex-col gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">{title}</h1>
                        {description ? <p className="max-w-3xl text-sm text-neutral-600 sm:text-base">{description}</p> : null}
                    </div>
                    {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">{actions}</div> : null}
                </div>
                {toolbar ? <div className="-mx-2 flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4 sm:gap-4">{toolbar}</div> : null}
            </div>
        </header>
    );
}

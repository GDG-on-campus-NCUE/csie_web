import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: BreadcrumbItemType[] }) {
    return (
        <>
            {breadcrumbs.length > 0 && (
                <Breadcrumb className="min-w-0 overflow-hidden">
                    <BreadcrumbList className="flex-col items-start gap-x-1.5 gap-y-2 sm:flex-row sm:items-center sm:gap-y-1 md:flex-nowrap text-neutral-600">
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            const isFirst = index === 0;

                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem className={cn(
                                        "min-w-0 flex items-center",
                                        // 手機版每個項目佔滿寬度，桌面版限制寬度
                                        "w-full sm:w-auto",
                                        // 最後一個項目允許更多空間，其他項目限制寬度
                                        isLast ? "flex-shrink sm:flex-shrink" : "sm:max-w-32 md:max-w-48 lg:max-w-64",
                                        // 第一個項目（通常是首頁）保持較小寬度
                                        isFirst && "sm:flex-shrink-0 sm:max-w-24"
                                    )}>
                                        {isLast ? (
                                            <BreadcrumbPage className="truncate text-left text-neutral-700 font-medium">{item.title}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild className="truncate text-left text-neutral-500 hover:text-neutral-700">
                                                <Link href={item.href} title={item.title}>{item.title}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && (
                                        <BreadcrumbSeparator className="flex-shrink-0 hidden sm:flex text-neutral-400" />
                                    )}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </>
    );
}

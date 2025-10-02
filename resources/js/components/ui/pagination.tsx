import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface PaginationProps {
    meta: PaginationMeta;
    onPerPageChange?: (perPage: number) => void;
    perPageOptions?: number[];
    className?: string;
}

export default function Pagination({
    meta,
    onPerPageChange,
    perPageOptions = [10, 15, 25, 50],
    className = ''
}: PaginationProps) {
    const { current_page, last_page, per_page, total, from, to, links } = meta;

    if (!links || last_page <= 1) {
        return null;
    }

    const previousLink = links.find(link => link.label === '&laquo; Previous');
    const nextLink = links.find(link => link.label === 'Next &raquo;');
    const numberLinks = links.filter(link =>
        link.label !== '&laquo; Previous' &&
        link.label !== 'Next &raquo;'
    );

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            {/* Results info */}
            <div className="text-sm text-gray-700">
                顯示第 <span className="font-medium">{from}</span> 到 <span className="font-medium">{to}</span> 項，
                共 <span className="font-medium">{total}</span> 項結果
            </div>

            {/* Per page selector */}
            {onPerPageChange && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">每頁顯示：</span>
                    <Select
                        value={per_page.toString()}
                        onChange={(e) => onPerPageChange(parseInt(e.target.value))}
                        className="w-20"
                    >
                        {perPageOptions.map(option => (
                            <option key={option} value={option.toString()}>
                                {option}
                            </option>
                        ))}
                    </Select>
                </div>
            )}

            {/* Pagination controls */}
            <div className="flex items-center gap-1">
                {/* First page */}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={current_page === 1}
                    asChild={current_page !== 1}
                >
                    {current_page === 1 ? (
                        <span><ChevronsLeft className="h-4 w-4" /></span>
                    ) : (
                        <Link href={links[0]?.url || '#'}>
                            <ChevronsLeft className="h-4 w-4" />
                        </Link>
                    )}
                </Button>

                {/* Previous page */}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={!previousLink?.url}
                    asChild={!!previousLink?.url}
                >
                    {previousLink?.url ? (
                        <Link href={previousLink.url}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    ) : (
                        <span><ChevronLeft className="h-4 w-4" /></span>
                    )}
                </Button>

                {/* Page numbers */}
                {numberLinks.map((link, index) => {
                    const isEllipsis = link.label === '...';

                    if (isEllipsis) {
                        return (
                            <span key={index} className="px-2 text-gray-500">
                                ...
                            </span>
                        );
                    }

                    return (
                        <Button
                            key={index}
                            variant={link.active ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={link.active || !link.url}
                            asChild={!link.active && !!link.url}
                        >
                            {!link.active && link.url ? (
                                <Link href={link.url}>
                                    {link.label}
                                </Link>
                            ) : (
                                <span>{link.label}</span>
                            )}
                        </Button>
                    );
                })}

                {/* Next page */}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={!nextLink?.url}
                    asChild={!!nextLink?.url}
                >
                    {nextLink?.url ? (
                        <Link href={nextLink.url}>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <span><ChevronRight className="h-4 w-4" /></span>
                    )}
                </Button>

                {/* Last page */}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={current_page === last_page}
                    asChild={current_page !== last_page}
                >
                    {current_page === last_page ? (
                        <span><ChevronsRight className="h-4 w-4" /></span>
                    ) : (
                        <Link href={`${links[0]?.url?.split('?')[0]}?page=${last_page}`}>
                            <ChevronsRight className="h-4 w-4" />
                        </Link>
                    )}
                </Button>
            </div>
        </div>
    );
}

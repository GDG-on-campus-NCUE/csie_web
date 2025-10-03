import { cn } from '@/lib/shared/utils';
import type { NavItem } from '@/types/shared';
import { Link } from '@inertiajs/react';

interface ManageQuickNavProps {
    items: NavItem[];
    currentPath: string;
    label?: string;
}

export default function ManageQuickNav({ items, currentPath, label = '管理快速路徑' }: ManageQuickNavProps) {
    if (!items.length) {
        return null;
    }

    return (
        <nav aria-label={label} className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
                {items.map((item) => {
                    const hrefString = typeof item.href === 'string'
                        ? item.href
                        : 'url' in item.href
                          ? (item.href.url ?? '')
                          : '';
                    const isActive = currentPath.startsWith(hrefString);

                    return (
                        <Link
                            key={hrefString}
                            href={item.href}
                            className={cn(
                                'group inline-flex min-h-[2.5rem] min-w-[6.5rem] items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/70 focus-visible:ring-offset-2',
                                isActive
                                    ? 'border-primary-500 bg-primary-100/70 text-primary-700 shadow-sm'
                                    : 'border-neutral-200 bg-white text-neutral-600 shadow-sm hover:border-primary-200 hover:bg-primary-50/60 hover:text-primary-700'
                            )}
                        >
                            {item.icon ? <item.icon className="h-4 w-4" /> : null}
                            <span className="truncate">{item.title}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

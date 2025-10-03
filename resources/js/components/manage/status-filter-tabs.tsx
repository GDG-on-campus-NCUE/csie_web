import { cn } from '@/lib/shared/utils';
import { Badge } from '@/components/ui/badge';

export interface StatusFilterOption {
    value: string;
    label: string;
    count?: number;
    icon?: React.ComponentType<{ className?: string }>;
}

export interface StatusFilterTabsProps {
    options: StatusFilterOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

/**
 * 通用的狀態篩選標籤組件
 * 可用於各種管理頁面的狀態篩選，提供統一的視覺風格
 */
export default function StatusFilterTabs({ options, value, onChange, className }: StatusFilterTabsProps) {
    return (
        <div className={cn('flex flex-wrap gap-2 sm:gap-3', className)}>
            {options.map((option) => {
                const isActive = value === option.value;
                const Icon = option.icon;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        data-state={isActive ? 'active' : 'inactive'}
                        className={cn(
                            'group inline-flex min-w-[5.5rem] items-center justify-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/70 focus-visible:ring-offset-2',
                            isActive
                                ? 'border-primary-500 bg-primary-100/80 text-primary-700 shadow-sm'
                                : 'border-neutral-200 bg-white text-neutral-600 shadow-sm hover:border-primary-200 hover:bg-primary-50/60 hover:text-primary-700'
                        )}
                    >
                        {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                        <span className="truncate">{option.label}</span>
                        {typeof option.count === 'number' && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    'ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors duration-150',
                                    isActive
                                        ? 'border-primary-500/10 bg-primary-200/60 text-primary-700'
                                        : 'border-neutral-300 bg-neutral-100 text-neutral-600 group-hover:border-primary-200 group-hover:bg-primary-50/80 group-hover:text-primary-700'
                                )}
                            >
                                {option.count}
                            </Badge>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

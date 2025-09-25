import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChangeEvent, useMemo } from 'react';

export interface TagSelectorOption {
    value: string;
    label: string;
    description?: string | null;
}

interface TagSelectorProps {
    id?: string;
    value: string[];
    options: TagSelectorOption[];
    onChange: (value: string[]) => void;
    helperText?: string;
    emptyMessage?: string;
    emptyOptionLabel?: string;
    disabled?: boolean;
    className?: string;
}

export default function TagSelector({
    id,
    value,
    options,
    onChange,
    helperText,
    emptyMessage,
    emptyOptionLabel,
    disabled = false,
    className,
}: TagSelectorProps) {
    const resolvedSize = useMemo(() => {
        if (options.length === 0) {
            return 3;
        }

        return Math.min(Math.max(options.length, 3), 8);
    }, [options.length]);

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const selectedValues = Array.from(event.target.selectedOptions).map((option) => option.value);
        onChange(selectedValues);
    };

    return (
        <div className={cn('space-y-2', className)}>
            <Select
                id={id}
                multiple
                value={value}
                onChange={handleChange}
                size={resolvedSize}
                disabled={disabled || options.length === 0}
            >
                {options.length === 0 ? (
                    <option value="" disabled>
                        {emptyOptionLabel ?? emptyMessage ?? '目前沒有可用的標籤。'}
                    </option>
                ) : (
                    options.map((option) => (
                        <option key={option.value} value={option.value} title={option.description ?? undefined}>
                            #{option.label}
                        </option>
                    ))
                )}
            </Select>

            {helperText && <p className="text-xs text-slate-500">{helperText}</p>}

            {options.length === 0 && (
                <p className="text-xs text-slate-500">{emptyMessage ?? '請先到標籤管理頁面新增標籤。'}</p>
            )}

            {value.length > 0 && options.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

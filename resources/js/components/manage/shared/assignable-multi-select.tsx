import { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface AssignableOption {
    id: number;
    label: string;
    labelEn?: string | null;
    description?: string | null;
    meta?: string | null;
}

interface AssignableMultiSelectProps {
    /** 可選項目清單 */
    options: AssignableOption[];
    /** 已勾選的項目 ID 陣列 */
    selectedIds: number[];
    /** 勾選變更時的回呼 */
    onChange: (ids: number[]) => void;
    /** 搜尋輸入框提示文字 */
    searchPlaceholder?: string;
    /** 當沒有符合項目時的提示 */
    emptyLabel?: string;
    /** 額外說明文字 */
    helperText?: string;
    /** 當驗證失敗時顯示的錯誤訊息 */
    errorMessage?: string;
    className?: string;
}

/**
 * 簡易多選清單組件：提供搜尋與即時篩選，專為後台指派多對多關聯使用。
 */
export function AssignableMultiSelect({
    options,
    selectedIds,
    onChange,
    searchPlaceholder = '搜尋名稱或關鍵字',
    emptyLabel = '目前沒有符合條件的項目。',
    helperText,
    errorMessage,
    className,
}: AssignableMultiSelectProps) {
    const [keyword, setKeyword] = useState('');

    // 依照輸入文字篩選候選清單，支援中英混合比對。
    const filteredOptions = useMemo(() => {
        const value = keyword.trim().toLowerCase();
        if (value.length === 0) {
            return options;
        }

        return options.filter((option) => {
            const tokens = [option.label, option.labelEn, option.description, option.meta]
                .filter(Boolean)
                .map((text) => String(text).toLowerCase());

            return tokens.some((token) => token.includes(value));
        });
    }, [keyword, options]);

    // 針對顯示摘要使用，保留原始排序
    const selectedOptions = useMemo(
        () => options.filter((option) => selectedIds.includes(option.id)),
        [options, selectedIds]
    );

    const toggleOption = (id: number) => {
        const exists = selectedIds.includes(id);
        const next = exists ? selectedIds.filter((value) => value !== id) : [...selectedIds, id];
        onChange(next);
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-800">
                    已選擇 <Badge variant="secondary">{selectedOptions.length}</Badge>
                </span>
                {helperText && <span className="text-xs text-neutral-500">{helperText}</span>}
            </div>

            <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full"
            />

            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
                {filteredOptions.length === 0 ? (
                    <p className="text-sm text-neutral-500">{emptyLabel}</p>
                ) : (
                    filteredOptions.map((option) => {
                        const checked = selectedIds.includes(option.id);
                        return (
                            <label
                                key={option.id}
                                className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-neutral-50"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => toggleOption(option.id)}
                                    className="mt-0.5"
                                />
                                <div className="flex flex-col text-sm text-neutral-800">
                                    <span className="font-semibold">
                                        {option.label}
                                        {option.labelEn && (
                                            <span className="ml-2 text-xs text-neutral-500">{option.labelEn}</span>
                                        )}
                                    </span>
                                    {option.description && (
                                        <span className="text-xs text-neutral-500">{option.description}</span>
                                    )}
                                    {option.meta && (
                                        <span className="text-xs text-neutral-400">{option.meta}</span>
                                    )}
                                </div>
                            </label>
                        );
                    })
                )}
            </div>

            {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
        </div>
    );
}

export default AssignableMultiSelect;

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useMemo, useRef, useState } from 'react';

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
    placeholder?: string;
    createHint?: string;
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
    placeholder,
    createHint,
}: TagSelectorProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const resolvedEmptyLabel = emptyOptionLabel ?? emptyMessage ?? '目前沒有可用的標籤。';

    // 依選中的標籤過濾出尚未使用的選項，避免重複加入
    const availableOptions = useMemo(() => {
        return options.filter((option) => !value.includes(option.value));
    }, [options, value]);

    // 依輸入文字篩選建議清單，提供快速搜尋
    const filteredOptions = useMemo(() => {
        const keyword = inputValue.trim().toLowerCase();

        if (keyword.length === 0) {
            return availableOptions;
        }

        return availableOptions.filter((option) => {
            return option.label.toLowerCase().includes(keyword);
        });
    }, [availableOptions, inputValue]);

    const updateTags = (next: string[]) => {
        onChange(Array.from(new Set(next.map((tag) => tag.trim()).filter((tag) => tag.length > 0))));
    };

    const handleAddTag = (tag: string) => {
        const trimmed = tag.trim();

        if (!trimmed) {
            return;
        }

        updateTags([...value, trimmed]);
        setInputValue('');
        // 重新聚焦於輸入框，持續讓使用者快速操作
        inputRef.current?.focus();
    };

    const handleRemoveTag = (tag: string) => {
        updateTags(value.filter((selected) => selected !== tag));
        inputRef.current?.focus();
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        setIsDropdownOpen(true);
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            handleAddTag(inputValue);
            return;
        }

        if (event.key === 'Backspace' && inputValue.length === 0 && value.length > 0) {
            // 空字串下按退格，移除最後一個標籤以符合常見的標籤輸入體驗
            event.preventDefault();
            handleRemoveTag(value[value.length - 1]);
        }
    };

    const handleInputFocus = () => {
        setIsDropdownOpen(true);
    };

    const handleInputBlur = () => {
        // 延遲收合，確保點擊選項時不會被輸入框先行觸發 blur
        setTimeout(() => setIsDropdownOpen(false), 120);
    };

    const handleSelectOption = (optionValue: string) => {
        handleAddTag(optionValue);
    };

    return (
        <div className={cn('space-y-2', className)}>
            <div className={cn(
                'relative w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-all duration-200',
                'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20',
                disabled && 'pointer-events-none opacity-60'
            )}>
                <div className="flex flex-wrap items-center gap-2">
                    {value.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                        >
                            #{tag}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                                    aria-label={`移除標籤 ${tag}`}
                                >
                                    <X className="h-3 w-3" aria-hidden />
                                </button>
                            )}
                        </span>
                    ))}

                    <Input
                        id={id}
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder={placeholder ?? (options.length === 0 ? resolvedEmptyLabel : undefined)}
                        disabled={disabled}
                        className={cn(
                            'flex-1 border-none px-0 py-0 text-sm shadow-none focus-visible:ring-0',
                            'min-w-[120px] bg-transparent'
                        )}
                    />
                </div>

                {isDropdownOpen && filteredOptions.length > 0 && (
                    <div className="absolute left-0 top-full z-10 mt-2 w-full rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-lg">
                        <ul className="max-h-48 overflow-auto">
                            {filteredOptions.map((option) => (
                                <li key={option.value}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex w-full items-start justify-between gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => handleSelectOption(option.value)}
                                    >
                                        <span className="font-medium text-slate-700">#{option.label}</span>
                                        {option.description && (
                                            <span className="text-xs text-slate-500">{option.description}</span>
                                        )}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {isDropdownOpen && filteredOptions.length === 0 && inputValue.trim().length > 0 && (
                    <div className="absolute left-0 top-full z-10 mt-2 w-full rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-lg">
                        {(createHint ?? '按 Enter 可新增「:keyword」。').replace(':keyword', inputValue.trim())}
                    </div>
                )}
            </div>

            {helperText && <p className="text-xs text-slate-500">{helperText}</p>}

            {options.length === 0 && (
                <p className="text-xs text-slate-500">{emptyMessage ?? '請先到標籤管理頁面新增標籤。'}</p>
            )}
        </div>
    );
}

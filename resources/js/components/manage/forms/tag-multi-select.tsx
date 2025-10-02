import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/shared/utils';
import { apiClient, isManageApiError } from '@/lib/manage/api-client';
import type { TagOption } from '@/types/manage';

interface TagMultiSelectProps {
    value: TagOption[];
    onChange: (value: TagOption[]) => void;
    placeholder?: string;
    emptyText?: string;
    fetchRoute?: string | null;
    createRoute?: string | null;
    disabled?: boolean;
    maxSelections?: number;
    initialOptions?: TagOption[];
}

interface TagOptionResponse {
    data: TagOption[];
}

export default function TagMultiSelect({
    value,
    onChange,
    placeholder = '搜尋或新增標籤…',
    emptyText = '找不到符合的標籤，輸入文字後可新增。',
    fetchRoute = '/tags/options',
    createRoute = '/tags',
    disabled,
    maxSelections,
    initialOptions,
}: TagMultiSelectProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [options, setOptions] = useState<TagOption[]>(initialOptions ?? []);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [localCounter, setLocalCounter] = useState(0);

    useEffect(() => {
        if (!initialOptions) {
            return;
        }

        setOptions((prev) => {
            if (prev.length === 0) {
                return initialOptions;
            }

            const merged = [...prev];
            initialOptions.forEach((option) => {
                if (!merged.some((item) => item.id === option.id)) {
                    merged.push(option);
                }
            });
            return merged;
        });
    }, [initialOptions]);

    const normalizedSearch = search.trim();

    const filteredOptions = useMemo(() => {
        if (!normalizedSearch) {
            return options;
        }

        const keyword = normalizedSearch.toLowerCase();
        return options.filter((option) => option.label.toLowerCase().includes(keyword));
    }, [options, normalizedSearch]);

    useEffect(() => {
        if (!isOpen || !fetchRoute) {
            return;
        }

        const route = fetchRoute;
        let cancelled = false;
        const controller = new AbortController();

        async function loadOptions() {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const response = await apiClient.get<TagOptionResponse>(route, {
                    params: { keyword: normalizedSearch || undefined },
                    signal: controller.signal,
                });
                if (cancelled) {
                    return;
                }
                const payload = response.data as TagOptionResponse;
                setOptions(payload.data ?? []);
            } catch (error) {
                if ((error as Error).name === 'CanceledError' || error instanceof DOMException) {
                    return;
                }
                const message = isManageApiError(error) ? error.message : '無法載入標籤選項，請稍後再試。';
                setErrorMessage(message);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadOptions();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [fetchRoute, normalizedSearch, isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!containerRef.current) {
                return;
            }
            if (!containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const canAddMore = typeof maxSelections === 'number' ? value.length < maxSelections : true;

    async function handleCreateTag() {
        if (!normalizedSearch || !canAddMore) {
            return;
        }

        try {
            setIsCreating(true);
            if (!createRoute) {
                const localId = -(Date.now() + localCounter + 1);
                setLocalCounter((prev) => prev + 1);
                const createdTag: TagOption = {
                    id: localId,
                    value: localId,
                    label: normalizedSearch,
                };
                setOptions((prev) => [createdTag, ...prev.filter((option) => option.label !== createdTag.label)]);
                onChange([...value, createdTag]);
                setSearch('');
                inputRef.current?.focus();
                setIsCreating(false);
                return;
            }

            const response = await apiClient.post<TagOption | { data: TagOption }>(createRoute, {
                name: normalizedSearch,
            });
            const payload = response.data as TagOption | { data: TagOption };
            const createdTag = 'data' in payload ? payload.data : payload;
            setOptions((prev) => [createdTag, ...prev.filter((option) => option.id !== createdTag.id)]);
            onChange([...value, createdTag]);
            setSearch('');
            inputRef.current?.focus();
        } catch (error) {
            const message = isManageApiError(error) ? error.message : '新增標籤失敗，請稍後再試。';
            setErrorMessage(message);
        } finally {
            setIsCreating(false);
        }
    }

    function toggleTag(option: TagOption) {
        if (value.some((item) => item.id === option.id)) {
            onChange(value.filter((item) => item.id !== option.id));
            return;
        }

        if (!canAddMore) {
            return;
        }

        onChange([...value, option]);
    }

    function removeTag(option: TagOption, event?: React.MouseEvent) {
        event?.stopPropagation();
        onChange(value.filter((item) => item.id !== option.id));
    }

    return (
        <div ref={containerRef} className={cn('relative w-full')}>
            <div
                className={cn(
                    'flex min-h-[3rem] w-full cursor-text flex-wrap items-center gap-2 rounded-lg border border-neutral-300 bg-white p-2 transition-colors focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-200',
                    disabled && 'pointer-events-none opacity-60'
                )}
                onClick={() => {
                    if (disabled) return;
                    setIsOpen(true);
                    inputRef.current?.focus();
                }}
            >
                {value.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="group flex items-center gap-1">
                        <span>{tag.label}</span>
                        <button
                            type="button"
                            className="rounded-full bg-neutral-200/70 p-1 text-[10px] text-neutral-600 transition-colors hover:bg-neutral-300"
                            onClick={(event) => removeTag(tag, event)}
                            aria-label={`移除標籤 ${tag.label}`}
                        >
                            ×
                        </button>
                    </Badge>
                ))}
                {canAddMore ? (
                    <Input
                        ref={inputRef}
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            if (!isOpen) {
                                setIsOpen(true);
                            }
                        }}
                        placeholder={value.length === 0 ? placeholder : ''}
                        className="flex-1 border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                        disabled={disabled}
                        onFocus={() => setIsOpen(true)}
                    />
                ) : null}
            </div>

            {isOpen ? (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2 text-xs text-neutral-500">
                        <span>可選擇的標籤</span>
                        {maxSelections ? <span>{value.length}/{maxSelections}</span> : null}
                    </div>

                    <div className="max-h-60 overflow-y-auto p-2">
                        {isLoading ? (
                            <p className="px-2 py-4 text-center text-sm text-neutral-500">載入中…</p>
                        ) : filteredOptions.length > 0 ? (
                            <ul className="space-y-1">
                                {filteredOptions.map((option) => {
                                    const isSelected = value.some((item) => item.id === option.id);
                                    return (
                                        <li key={option.id}>
                                            <button
                                                type="button"
                                                className={cn(
                                                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                                    isSelected ? 'bg-primary/10 text-primary-700' : 'hover:bg-neutral-100'
                                                )}
                                                onClick={() => toggleTag(option)}
                                            >
                                                <span className="flex flex-col gap-0.5">
                                                    <span className="font-medium">{option.label}</span>
                                                    {option.usage_count !== undefined ? (
                                                        <span className="text-xs text-neutral-500">已使用 {option.usage_count} 次</span>
                                                    ) : null}
                                                </span>
                                                {isSelected ? <span className="text-xs text-primary-600">已選</span> : null}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="px-2 py-4 text-center text-sm text-neutral-500">{emptyText}</p>
                        )}
                    </div>

                    {normalizedSearch && !filteredOptions.some((option) => option.label === normalizedSearch) && canAddMore ? (
                        <div className="border-t border-neutral-200 bg-neutral-50 p-3">
                            <Button type="button" size="sm" className="w-full" onClick={handleCreateTag} disabled={isCreating}>
                                {isCreating ? '建立中…' : `新增「${normalizedSearch}」標籤`}
                            </Button>
                        </div>
                    ) : null}

                    {errorMessage ? <p className="border-t border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{errorMessage}</p> : null}
                </div>
            ) : null}
        </div>
    );
}

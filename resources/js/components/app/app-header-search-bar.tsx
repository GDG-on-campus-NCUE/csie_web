import { useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/shared/utils';

interface AppSearchBarProps {
    isOpen: boolean;
    query: string;
    onQueryChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onOpen: () => void;
    onClose: () => void;
    className?: string;
}

export default function AppSearchBar({
    isOpen,
    query,
    onQueryChange,
    onSubmit,
    onOpen,
    onClose,
    className
}: AppSearchBarProps) {
    const { t } = useTranslator('common');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const input = inputRef.current;
        if (!input) {
            return;
        }

        const frame = requestAnimationFrame(() => {
            input.focus();
        });

        return () => cancelAnimationFrame(frame);
    }, [isOpen]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Escape') {
            return;
        }

        event.preventDefault();
        onClose();
    };

    return (
        <div className={cn('hidden lg:flex items-center', className)}>
            <button
                type="button"
                onClick={onOpen}
                className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-all duration-200 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                    isOpen && 'pointer-events-none opacity-0 translate-x-2 scale-90'
                )}
                aria-label={t('search', '搜尋')}
                aria-expanded={isOpen}
            >
                <Search className="h-5 w-5" />
            </button>

            <form
                onSubmit={onSubmit}
                className={cn(
                    'relative flex h-9 items-center gap-2 overflow-hidden transition-all duration-300 ease-out',
                    'ml-0 w-0 opacity-0 pointer-events-none',
                    isOpen && 'ml-3 w-[clamp(8rem,18vw,13rem)] max-w-full opacity-100 pointer-events-auto xl:w-64'
                )}
                aria-hidden={!isOpen}
            >
                <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <div className="relative flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('search_placeholder', '輸入關鍵字搜尋...')}
                        className="peer w-full bg-transparent px-0 py-1 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                    />
                    <span
                        className="pointer-events-none absolute left-0 bottom-0 h-px w-full bg-gray-200"
                        aria-hidden="true"
                    />
                    <span
                        className={cn(
                            'pointer-events-none absolute left-0 bottom-0 h-0.5 w-full origin-left scale-x-0 bg-blue-500 transition-transform duration-300 ease-out',
                            (isOpen || query.length > 0) && 'scale-x-100',
                            'peer-focus:scale-x-100'
                        )}
                        aria-hidden="true"
                    />
                </div>
                <button
                    type="submit"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-blue-600"
                    aria-label={t('search', '搜尋')}
                >
                    <ArrowRight className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={t('close', '關閉')}
                >
                    <X className="h-4 w-4" />
                </button>
            </form>
        </div>
    );
}

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslator } from '@/hooks/use-translator';
import type { SharedData } from '@/types';
import LanguageSwitcher from '@/components/app/app-lang-switcher';
import { ArrowRight, ChevronDown, LogIn, Search, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    AppInlineActionButton,
    AppInlineActionLabel,
    AppInlineActionLink,
} from '@/components/app/app-header-inline-action';

interface NavItem {
    key: string;
    label: string;
    href: string;
    children?: Array<{
        key: string;
        label: string;
        href: string;
        description?: string;
    }>;
}

interface AppMobileNavbarProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: NavItem[];
    isSearchOpen: boolean;
    searchQuery: string;
    onSearchToggle?: () => void;
    onSearchClose?: () => void;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function AppMobileNavbar({
    isOpen,
    onClose,
    navItems,
    isSearchOpen,
    searchQuery,
    onSearchToggle,
    onSearchClose,
    onSearchChange,
    onSearchSubmit
}: AppMobileNavbarProps) {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const page = usePage<SharedData & { auth: any }>();
    const { auth } = page.props;
    const { t } = useTranslator('common');

    const isAuthenticated = Boolean(auth?.user);

    const toggleDropdown = (key: string) => {
        setActiveDropdown(activeDropdown === key ? null : key);
    };

    const handleSearchToggle = () => {
        setActiveDropdown(null);
        onSearchToggle?.();
    };

    const handleSearchClose = () => {
        onSearchChange('');
        onSearchClose?.();
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        onSearchSubmit(event);
        if (searchQuery.trim()) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="lg:hidden border-t bg-white">
            <nav className="py-4 space-y-2">
                {/* 導航項目 */}
                {navItems.map((item) => (
                    <div key={item.key}>
                        {item.children ? (
                            <>
                                <button
                                    onClick={() => toggleDropdown(item.key)}
                                    className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    {item.label}
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 transition-transform",
                                            activeDropdown === item.key && "rotate-180"
                                        )}
                                    />
                                </button>
                                {activeDropdown === item.key && (
                                    <div className="pl-6 py-2 space-y-1">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.key}
                                                href={child.href}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                onClick={onClose}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link
                                href={item.href}
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={onClose}
                            >
                                {item.label}
                            </Link>
                        )}
                    </div>
                ))}

                {/* 快速操作：搜尋 / 登入 / 語言切換 */}
                <div className="border-t px-4 py-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <AppInlineActionButton
                            onClick={isSearchOpen ? handleSearchClose : handleSearchToggle}
                            aria-expanded={isSearchOpen}
                            aria-controls="mobile-search-panel"
                            isActive={isSearchOpen}
                        >
                            <Search
                                className={cn(
                                    'h-3.5 w-3.5 text-current transition-transform duration-200 group-hover:-translate-y-0.5',
                                    isSearchOpen && '-translate-y-0.5'
                                )}
                            />
                            <AppInlineActionLabel className="text-sm" isActive={isSearchOpen}>
                                {t('search', '搜尋')}
                            </AppInlineActionLabel>
                        </AppInlineActionButton>

                        {isAuthenticated ? (
                            <AppInlineActionLink href="/dashboard" onClick={onClose} className="text-neutral-900">
                                <User className="h-3.5 w-3.5 text-current transition-transform duration-200 group-hover:-translate-y-0.5" />
                                <AppInlineActionLabel className="text-sm">
                                    {t('auth.dashboard', 'Dashboard')}
                                </AppInlineActionLabel>
                            </AppInlineActionLink>
                        ) : (
                            <AppInlineActionLink
                                href="/login"
                                onClick={onClose}
                                className="text-blue-600 hover:text-blue-500"
                            >
                                <LogIn className="h-3.5 w-3.5 text-current transition-transform duration-200 group-hover:-translate-y-0.5" />
                                <AppInlineActionLabel className="text-sm">
                                    {t('auth.login', 'Login')}
                                </AppInlineActionLabel>
                            </AppInlineActionLink>
                        )}

                        <LanguageSwitcher className="text-neutral-900" />
                    </div>

                    <div
                        id="mobile-search-panel"
                        className={cn(
                            'overflow-hidden transition-all duration-300 ease-out',
                            isSearchOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        )}
                        aria-hidden={!isSearchOpen}
                    >
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex items-center gap-3 px-1"
                        >
                            <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => onSearchChange(event.target.value)}
                                    placeholder={t('search_placeholder', '輸入關鍵字搜尋...')}
                                    className="peer w-full bg-transparent px-0 py-2 text-base text-gray-700 placeholder:text-gray-400 focus:outline-none"
                                />
                                <span
                                    className="pointer-events-none absolute left-0 bottom-0 h-px w-full bg-gray-200"
                                    aria-hidden="true"
                                />
                                <span
                                    className={cn(
                                        'pointer-events-none absolute left-0 bottom-0 h-0.5 w-full origin-left scale-x-0 bg-blue-500 transition-transform duration-300 ease-out',
                                        (isSearchOpen || searchQuery.trim().length > 0) && 'scale-x-100',
                                        'peer-focus:scale-x-100'
                                    )}
                                    aria-hidden="true"
                                />
                            </div>
                            <button
                                type="submit"
                                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-blue-600"
                                aria-label={t('search', '搜尋')}
                            >
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleSearchClose}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-gray-600"
                                aria-label={t('close', '關閉')}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </nav>
        </div>
    );
}

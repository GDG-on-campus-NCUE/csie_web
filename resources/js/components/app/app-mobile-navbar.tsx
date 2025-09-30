import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslator } from '@/hooks/use-translator';
import type { SharedData } from '@/types';
import LanguageSwitcher from './app-lang-switcher';
import { ArrowRight, ChevronDown, LogIn, Search, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

                {/* 搜尋欄位 */}
                <div className="px-4">
                    <button
                        type="button"
                        onClick={isSearchOpen ? handleSearchClose : handleSearchToggle}
                        className={cn(
                            'flex w-full items-center px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 rounded-lg',
                            isSearchOpen && 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        )}
                        aria-expanded={isSearchOpen}
                    >
                        <Search className="h-4 w-4 mr-3" />
                        {t('search', '搜尋')}
                    </button>
                    <div
                        className={cn(
                            'overflow-hidden transition-all duration-300 ease-out',
                            isSearchOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                        )}
                        aria-hidden={!isSearchOpen}
                    >
                        <form
                            onSubmit={handleSearchSubmit}
                            className="mt-3 flex items-center gap-3 px-1"
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

                {/* 分隔線 */}
                <div className="border-t my-2"></div>

                {/* 登入/使用者 */}
                {isAuthenticated ? (
                    <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={onClose}
                    >
                        <User className="h-4 w-4 mr-3" />
                        {t('auth.dashboard', 'Dashboard')}
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={onClose}
                    >
                        <LogIn className="h-4 w-4 mr-3" />
                        {t('auth.login', 'Login')}
                    </Link>
                )}

                {/* 語言切換器 */}
                <div className="px-4 py-2 border-t">
                    <LanguageSwitcher />
                </div>
            </nav>
        </div>
    );
}

import { Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import { useTranslator } from '@/hooks/use-translator';
import LanguageSwitcher from './app-lang-switcher';
import {
    Menu,
    X,
    User,
    LogIn
} from 'lucide-react';
import type { FormEvent } from 'react';
import AppSearchBar from './app-search-bar';

interface AppHeaderActionsProps {
    isMobileMenuOpen: boolean;
    onToggleMobileMenu: () => void;
    isSearchOpen: boolean;
    searchQuery: string;
    onSearchOpen: () => void;
    onSearchClose: () => void;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function AppHeaderActions({
    isMobileMenuOpen,
    onToggleMobileMenu,
    isSearchOpen,
    searchQuery,
    onSearchOpen,
    onSearchClose,
    onSearchChange,
    onSearchSubmit
}: AppHeaderActionsProps) {
    const page = usePage<SharedData & { auth: any }>();
    const { auth } = page.props;
    const { t } = useTranslator('common');

    const isAuthenticated = Boolean(auth?.user);

    return (
        <div className="flex items-center space-x-3 flex-shrink-0">
            <AppSearchBar
                isOpen={isSearchOpen}
                query={searchQuery}
                onOpen={onSearchOpen}
                onClose={onSearchClose}
                onQueryChange={onSearchChange}
                onSubmit={onSearchSubmit}
                className="flex-shrink-0"
            />

            {/* 桌面版：語言切換器 */}
            <div className="hidden lg:block">
                <LanguageSwitcher />
            </div>

            {/* 桌面版：登入/使用者 */}
            <div className="hidden lg:block">
                {isAuthenticated ? (
                    <Link
                        href="/dashboard"
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    >
                        <User className="h-4 w-4 mr-1" />
                        {t('auth.dashboard', 'Dashboard')}
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <LogIn className="h-4 w-4 mr-1" />
                        {t('auth.login', 'Login')}
                    </Link>
                )}
            </div>

            {/* 手機版選單按鈕 */}
            <button
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
                {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <Menu className="h-6 w-6" />
                )}
            </button>
        </div>
    );
}

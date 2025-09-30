import { Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import { useTranslator } from '@/hooks/use-translator';
import LanguageSwitcher from './app-lang-switcher';
import {
    Menu,
    X,
    Search,
    User,
    LogIn
} from 'lucide-react';

interface AppHeaderActionsProps {
    isMobileMenuOpen: boolean;
    onToggleMobileMenu: () => void;
}

export default function AppHeaderActions({ isMobileMenuOpen, onToggleMobileMenu }: AppHeaderActionsProps) {
    const page = usePage<SharedData & { auth: any }>();
    const { auth } = page.props;
    const { t } = useTranslator('common');

    const isAuthenticated = Boolean(auth?.user);

    return (
        <div className="flex items-center space-x-3">
            {/* 搜尋按鈕 */}
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Search className="h-5 w-5" />
            </button>

            {/* 語言切換器 */}
            <div className="hidden md:block">
                <LanguageSwitcher />
            </div>

            {/* 登入/使用者 */}
            {isAuthenticated ? (
                <Link
                    href="/dashboard"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                    <User className="h-4 w-4 mr-1" />
                    {t('nav.dashboard', 'Dashboard')}
                </Link>
            ) : (
                <Link
                    href="/login"
                    className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <LogIn className="h-4 w-4 mr-1" />
                    {t('nav.login', 'Login')}
                </Link>
            )}

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

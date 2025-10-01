import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from '@inertiajs/react';
import { useNavItems } from '@/lib/nav-items';
import AppLogo from '@/components/app/app-logo';
import AppNavbar from '@/components/app/app-header-navbar';
import AppMobileNavbar from '@/components/app/app-header-mobile-navbar';
import AppHeaderActions from '@/components/app/app-header-actions';

export default function AppHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navItems = useNavItems();
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((prev) => {
            const next = !prev;
            if (!next) {
                setIsSearchOpen(false);
                setSearchQuery('');
            }
            return next;
        });
    };

    const openSearch = () => {
        setIsSearchOpen(true);
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    const toggleSearch = () => {
        setIsSearchOpen((prev) => {
            const next = !prev;
            if (!next) {
                setSearchQuery('');
            }
            return next;
        });
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (searchQuery.trim()) {
            // 這裡可以實作搜尋邏輯
            console.log('Searching for:', searchQuery);
            // 例如: router.visit(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="container mx-auto px-4">
                {/* 主要導航欄 */}
                <div className="flex h-16 items-center justify-between gap-2 lg:gap-6">
                    {/* Logo 區域 */}
                    <Link href="/" className="flex items-center flex-shrink-0 gap-2">
                        <AppLogo />
                    </Link>
                    {/* 右側工具列 */}
                    <AppHeaderActions
                        isMobileMenuOpen={isMobileMenuOpen}
                        onToggleMobileMenu={toggleMobileMenu}
                        isSearchOpen={isSearchOpen}
                        searchQuery={searchQuery}
                        onSearchOpen={openSearch}
                        onSearchClose={closeSearch}
                        onSearchChange={setSearchQuery}
                        onSearchSubmit={handleSearchSubmit}
                    />
                </div>
                {/* 桌面版導航選單 */}
                    <AppNavbar className="flex-1 justify-center min-w-0" />

                {/* 手機版選單 */}
                <AppMobileNavbar
                    isOpen={isMobileMenuOpen}
                    onClose={() => {
                        setIsMobileMenuOpen(false);
                        closeSearch();
                    }}
                    navItems={navItems}
                    isSearchOpen={isSearchOpen}
                    searchQuery={searchQuery}
                    onSearchToggle={toggleSearch}
                    onSearchClose={closeSearch}
                    onSearchChange={setSearchQuery}
                    onSearchSubmit={handleSearchSubmit}
                />
            </div>
        </header>
    );
}

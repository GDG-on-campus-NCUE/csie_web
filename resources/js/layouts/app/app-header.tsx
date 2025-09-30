import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useNavItems } from '@/lib/nav-items';
import AppLogo from '@/components/app/app-logo';
import AppNavbar from '@/components/app/app-navbar';
import AppMobileNavbar from '@/components/app/app-mobile-navbar';
import AppHeaderActions from '@/components/app/app-header-actions';

export default function AppHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navItems = useNavItems();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="container mx-auto px-4">
                {/* 主要導航欄 */}
                <div className="flex h-16 items-center justify-between">
                    {/* Logo 區域 */}
                    <Link href="/" className="flex items-center">
                        <AppLogo />
                    </Link>

                    {/* 桌面版導航選單 */}
                    <AppNavbar />

                    {/* 右側工具列 */}
                    <AppHeaderActions
                        isMobileMenuOpen={isMobileMenuOpen}
                        onToggleMobileMenu={toggleMobileMenu}
                    />
                </div>

                {/* 手機版選單 */}
                <AppMobileNavbar
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                    navItems={navItems}
                />
            </div>
        </header>
    );
}

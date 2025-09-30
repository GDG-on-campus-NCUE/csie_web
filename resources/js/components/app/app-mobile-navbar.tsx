import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useTranslator } from '@/hooks/use-translator';
import LanguageSwitcher from './app-lang-switcher';
import { ChevronDown } from 'lucide-react';
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
}

export default function AppMobileNavbar({ isOpen, onClose, navItems }: AppMobileNavbarProps) {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const { t } = useTranslator('common');

    const toggleDropdown = (key: string) => {
        setActiveDropdown(activeDropdown === key ? null : key);
    };

    if (!isOpen) return null;

    return (
        <div className="lg:hidden border-t bg-white">
            <nav className="py-4 space-y-2">
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

                {/* 手機版語言切換器 */}
                <div className="px-4 py-2 border-t">
                    <LanguageSwitcher />
                </div>
            </nav>
        </div>
    );
}

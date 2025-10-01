import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useNavItems } from '@/lib/app/header-nav-items';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

interface AppNavbarProps {
    className?: string;
}

export default function AppNavbar({ className }: AppNavbarProps = {}) {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const navItems = useNavItems();

    return (
        <nav className={cn('hidden lg:flex items-center space-x-1', className)}>
            {navItems.map((item) => (
                <div key={item.key} className="relative group">
                    {item.children ? (
                        <>
                            <button
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                onMouseEnter={() => setActiveDropdown(item.key)}
                            >
                                {item.label}
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </button>

                            {/* 下拉選單 */}
                            <div
                                className={cn(
                                    "absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible",
                                    activeDropdown === item.key && "opacity-100 visible"
                                )}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <div className="py-2">
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.key}
                                            href={child.href}
                                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                        >
                                            <div className="font-medium">{child.label}</div>
                                            {child.description && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {child.description}
                                                </div>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <Link
                            href={item.href}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-blue-600 hover:bg-gray-50 transition-colors"
                        >
                            {item.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}

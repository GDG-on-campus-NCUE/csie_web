import { Link } from '@inertiajs/react';
import { useNavItems } from '@/lib/app/header-nav-items';

export default function PublicHeader() {
    const navItems = useNavItems();

    return (
        <header className="relative z-40 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-neutral-900" aria-label="返回首頁">
                    <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
                        CSIE
                    </span>
                    <span className="hidden sm:inline">資訊工程學系</span>
                </Link>

                <nav className="hidden gap-6 text-sm font-medium text-neutral-700 lg:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className="transition-colors duration-200 hover:text-blue-600"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <Link
                    href="/login"
                    className="hidden rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500 lg:inline-flex"
                >
                    後台登入
                </Link>
            </div>
        </header>
    );
}

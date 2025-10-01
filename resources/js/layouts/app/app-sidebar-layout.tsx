import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppSidebarLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppSidebarLayout({ children, breadcrumbs }: AppSidebarLayoutProps) {
    return (
        <div className="min-h-screen bg-neutral-50">
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}

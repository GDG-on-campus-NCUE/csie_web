import { createContext, useContext, type ReactNode } from 'react';
import type { BreadcrumbItem, NavItem } from '@/types/shared';

export interface ManageLayoutContextValue {
    quickNavItems?: NavItem[];
    quickNavLabel?: string;
    currentPath?: string;
    defaultTitle?: string;
    defaultDescription?: string;
    defaultBreadcrumbs?: BreadcrumbItem[];
}

const ManageLayoutContext = createContext<ManageLayoutContextValue | null>(null);

interface ManageLayoutProviderProps {
    value: ManageLayoutContextValue;
    children: ReactNode;
}

export function ManageLayoutProvider({ value, children }: ManageLayoutProviderProps) {
    return <ManageLayoutContext.Provider value={value}>{children}</ManageLayoutContext.Provider>;
}

export function useManageLayoutContext() {
    return useContext(ManageLayoutContext);
}

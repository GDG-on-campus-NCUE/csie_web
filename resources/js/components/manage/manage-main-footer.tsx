import type { ReactNode } from 'react';

interface ManageMainFooterProps {
    children?: ReactNode;
}

export default function ManageMainFooter({ children }: ManageMainFooterProps) {
    if (!children) {
        return null;
    }

    return <footer className="mt-6 flex flex-col gap-2 text-sm text-neutral-500">{children}</footer>;
}

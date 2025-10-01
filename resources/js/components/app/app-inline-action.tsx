import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { ComponentProps } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

const baseClasses =
    'group inline-flex items-center gap-2 rounded-md bg-transparent px-2.5 py-1 text-sm font-semibold leading-none text-neutral-900 transition-colors duration-200 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-0';

interface AppInlineActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
    children: ReactNode;
    className?: string;
    isActive?: boolean;
}

export function AppInlineActionButton({
    children,
    className,
    isActive,
    type = 'button',
    ...props
}: AppInlineActionButtonProps) {
    return (
        <button
            {...props}
            data-active={isActive ? 'true' : undefined}
            className={cn(baseClasses, isActive && 'text-blue-600', className)}
            type={type}
        >
            {children}
        </button>
    );
}

interface AppInlineActionLinkProps extends Omit<ComponentProps<typeof Link>, 'className' | 'children'> {
    children: ReactNode;
    className?: string;
    isActive?: boolean;
}

export function AppInlineActionLink({
    children,
    className,
    isActive,
    ...props
}: AppInlineActionLinkProps) {
    return (
        <Link
            {...props}
            data-active={isActive ? 'true' : undefined}
            className={cn(baseClasses, isActive && 'text-blue-600', className)}
        >
            {children}
        </Link>
    );
}

interface AppInlineActionLabelProps {
    children: ReactNode;
    className?: string;
    isActive?: boolean;
}

export function AppInlineActionLabel({ children, className, isActive }: AppInlineActionLabelProps) {
    return (
        <span className={cn('relative inline-flex items-center gap-1 leading-none text-current', className)}>
            <span className="relative z-10">{children}</span>
            <span
                aria-hidden="true"
                className={cn(
                    'pointer-events-none absolute left-0 top-full mt-0.5 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100',
                    isActive && 'scale-x-100'
                )}
            />
        </span>
    );
}

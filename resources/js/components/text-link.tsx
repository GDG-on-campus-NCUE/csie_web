import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof Link>;

export default function TextLink({ className = '', children, ...props }: LinkProps) {
    return (
        <Link
            className={cn(
                'text-foreground underline decoration-neutral-300 underline-offset-4 transition-all duration-300 ease-out cursor-pointer hover:decoration-current! hover:drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 hover:text-blue-600 dark:decoration-neutral-500 dark:hover:text-blue-400',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}

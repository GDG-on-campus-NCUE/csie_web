import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/shared/utils';
import type { ReactNode } from 'react';

interface FormFieldProps {
    label?: string;
    htmlFor?: string;
    description?: string;
    error?: string | string[];
    required?: boolean;
    children: ReactNode;
    className?: string;
    direction?: 'vertical' | 'horizontal';
    labelClassName?: string;
    controlClassName?: string;
}

export default function FormField({
    label,
    htmlFor,
    description,
    error,
    required,
    children,
    className,
    direction = 'vertical',
    labelClassName,
    controlClassName,
}: FormFieldProps) {
    const controlId = htmlFor ?? (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorMessage = Array.isArray(error) ? error.join('\n') : error;

    return (
        <div
            className={cn(
                'flex gap-4 rounded-xl border border-transparent p-3 transition-colors duration-200 hover:border-neutral-200 focus-within:border-primary-300 focus-within:border-opacity-60 focus-within:bg-primary-50/40',
                direction === 'horizontal' ? 'flex-col md:flex-row md:items-center' : 'flex-col',
                className
            )}
        >
            {label ? (
                <div className={cn('flex w-full flex-col gap-1 md:w-64', direction === 'horizontal' ? 'md:flex-shrink-0' : '', labelClassName)}>
                    <Label htmlFor={controlId} className="text-sm font-medium text-neutral-800">
                        {label}
                        {required ? <span className="ml-1 text-xs font-semibold text-red-500">*</span> : null}
                    </Label>
                    {description ? <p className="text-xs text-neutral-500">{description}</p> : null}
                </div>
            ) : null}
            <div className={cn('flex flex-1 flex-col gap-2', controlClassName)}>
                {children}
                <InputError message={errorMessage} />
            </div>
        </div>
    );
}

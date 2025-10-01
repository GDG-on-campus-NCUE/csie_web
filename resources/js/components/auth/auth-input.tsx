import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/shared/utils';
import { type ReactNode } from 'react';
import { PasswordInput, type PasswordInputProps } from './password-input';

type BaseInputProps = React.ComponentProps<typeof Input>;

interface SharedFieldProps {
    label: string;
    hint?: string;
    error?: string;
    containerClassName?: string;
    labelSecondary?: ReactNode;
}

export interface AuthInputProps extends Omit<BaseInputProps, 'id'>, SharedFieldProps {
    id: string;
}

export interface AuthPasswordInputProps extends Omit<PasswordInputProps, 'id'>, SharedFieldProps {
    id: string;
}

export function AuthInput({
    id,
    label,
    hint,
    error,
    containerClassName = '',
    className = '',
    labelSecondary,
    readOnly,
    disabled,
    ...props
}: AuthInputProps) {
    const errorId = error ? `${id}-error` : undefined;

    return (
        <div className={cn('space-y-2', containerClassName)}>
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor={id} className="text-sm font-semibold text-slate-600 cursor-pointer transition-colors duration-200 hover:text-slate-900">
                    {label}
                </Label>
                {labelSecondary}
            </div>
            <Input
                id={id}
                aria-describedby={errorId}
                aria-invalid={Boolean(error)}
                readOnly={readOnly}
                disabled={disabled}
                className={cn(
                    'h-12 rounded-2xl border border-slate-200/70 bg-gradient-to-r from-white via-white to-sky-50/60 px-4 text-base text-slate-900 shadow-sm transition-all duration-300 ease-out cursor-text hover:border-slate-300 hover:shadow-lg hover:shadow-sky-100/60 hover:from-white hover:via-sky-50/80 hover:to-sky-50/60 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/80 focus-visible:outline-none placeholder:text-slate-400/80 backdrop-blur-[2px]',
                    disabled || readOnly
                        ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500 hover:transform-none hover:shadow-sm'
                        : '',
                    className,
                )}
                {...props}
            />
            {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
            <InputError id={errorId} message={error} className="text-sm font-semibold text-red-600" />
        </div>
    );
}

export function AuthPasswordInput({
    id,
    label,
    hint,
    error,
    containerClassName = '',
    className = '',
    labelSecondary,
    ...props
}: AuthPasswordInputProps) {
    const errorId = error ? `${id}-error` : undefined;

    return (
        <div className={cn('space-y-2', containerClassName)}>
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor={id} className="text-sm font-semibold text-slate-600 cursor-pointer transition-colors duration-200 hover:text-slate-900">
                    {label}
                </Label>
                {labelSecondary}
            </div>
            <PasswordInput
                id={id}
                aria-describedby={errorId}
                aria-invalid={Boolean(error)}
                className={cn(
                    'rounded-2xl border border-slate-200/70 bg-gradient-to-r from-white via-white to-sky-50/60 px-4 text-base text-slate-900 shadow-sm transition-all duration-300 ease-out cursor-text hover:border-slate-300 hover:shadow-lg hover:shadow-sky-100/60 hover:from-white hover:via-sky-50/80 hover:to-sky-50/60 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/80 focus-visible:outline-none placeholder:text-slate-400/80 backdrop-blur-[2px]',
                    className,
                )}
                {...props}
            />
            {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
            <InputError id={errorId} message={error} className="text-sm font-semibold text-red-600" />
        </div>
    );
}

import { Input } from '@/components/ui/input';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState, forwardRef } from 'react';

type BaseInputProps = React.ComponentProps<typeof Input>;

export interface PasswordInputProps extends Omit<BaseInputProps, 'type'> {
    /**
     * 使用說明：可自訂顯示/隱藏提示文字
     */
    toggleLabels?: { show: string; hide: string };
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className = '', toggleLabels, ...props }, ref) => {
        const { t } = useTranslator('auth');
        const [visible, setVisible] = useState(false);

        const labels = toggleLabels ?? {
            show: t('fields.password.toggle_show', '顯示密碼'),
            hide: t('fields.password.toggle_hide', '隱藏密碼'),
        };

        const toggle = () => {
            setVisible((prev) => !prev);
        };

        return (
            <div className="relative">
                <Input
                    ref={ref}
                    type={visible ? 'text' : 'password'}
                    className={cn('h-12 pr-12', className)}
                    {...props}
                />
                <button
                    type="button"
                    onClick={toggle}
                    className="absolute inset-y-0 right-3 flex items-center rounded-full px-2 text-slate-500 transition hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                    aria-pressed={visible}
                >
                    {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    <span className="sr-only">{visible ? labels.hide : labels.show}</span>
                </button>
            </div>
        );
    },
);

PasswordInput.displayName = 'PasswordInput';

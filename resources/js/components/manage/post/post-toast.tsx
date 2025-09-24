import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// 採用簡易的 Toast 管理器，讓頁面在操作後能即時提示成功或失敗狀態。
export type PostToastType = 'success' | 'error' | 'info';

export interface PostToastMessage {
    id: string;
    type: PostToastType;
    title: string;
    description?: string;
}

const createToastId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export function usePostToast(initialToasts: PostToastMessage[] = []) {
    const [toasts, setToasts] = useState<PostToastMessage[]>(initialToasts);

    // 顯示 Toast 時，直接將訊息併入佇列中。
    const showToast = useCallback(
        (toast: Omit<PostToastMessage, 'id'> & { id?: string }) => {
            const id = toast.id ?? createToastId();
            setToasts((previous) => [...previous, { ...toast, id }]);
            return id;
        },
        [],
    );

    // 提供關閉單一 Toast 的方法，避免殘留訊息。
    const dismissToast = useCallback((id: string) => {
        setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, []);

    // 方便在必要時一次清除所有提示。
    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return { toasts, showToast, dismissToast, clearToasts };
}

interface PostToastContainerProps {
    toasts: PostToastMessage[];
    onDismiss: (id: string) => void;
    duration?: number;
}

export function PostToastContainer({ toasts, onDismiss, duration = 5000 }: PostToastContainerProps) {
    useEffect(() => {
        if (toasts.length === 0) {
            return;
        }

        const timers = toasts.map((toast) =>
            window.setTimeout(() => {
                onDismiss(toast.id);
            }, duration),
        );

        return () => {
            timers.forEach((timer) => window.clearTimeout(timer));
        };
    }, [toasts, onDismiss, duration]);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-xs flex-col gap-3 sm:max-w-sm">
            {toasts.map((toast) => {
                const variantStyles = {
                    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
                    error: 'border-red-200 bg-red-50 text-red-800',
                    info: 'border-blue-200 bg-blue-50 text-blue-800',
                } as const;

                const iconMap = {
                    success: <CheckCircle2 className="h-5 w-5" />, 
                    error: <AlertCircle className="h-5 w-5" />, 
                    info: <Info className="h-5 w-5" />, 
                } as const;

                return (
                    <div
                        key={toast.id}
                        className={cn(
                            'flex flex-col gap-3 rounded-2xl border p-4 shadow-lg shadow-black/5',
                            variantStyles[toast.type],
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5">{iconMap[toast.type]}</span>
                            <div className="flex-1 space-y-1 text-sm">
                                <p className="font-semibold leading-none">{toast.title}</p>
                                {toast.description && <p className="text-sm leading-snug text-current/80">{toast.description}</p>}
                            </div>
                            <button
                                type="button"
                                onClick={() => onDismiss(toast.id)}
                                className="rounded-full p-1 text-current/70 transition-colors hover:bg-white/50 hover:text-current"
                                aria-label="關閉提示"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

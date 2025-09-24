import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// 儀表板 Toast 管理器，統一管理成功、錯誤與資訊提示，並提供自動關閉機制。
export type DashboardToastType = 'success' | 'error' | 'info';

export interface DashboardToastMessage {
    id: string;
    type: DashboardToastType;
    title: string;
    description?: string;
}

const createToastId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

export function useDashboardToast(initialToasts: DashboardToastMessage[] = []) {
    const [toasts, setToasts] = useState<DashboardToastMessage[]>(initialToasts);

    // 顯示 Toast 時建立唯一識別碼，避免同時存在多筆訊息時產生衝突。
    const showToast = useCallback(
        (toast: Omit<DashboardToastMessage, 'id'> & { id?: string }) => {
            const id = toast.id ?? createToastId();
            setToasts((previous) => [...previous, { ...toast, id }]);
            return id;
        },
        [],
    );

    // 提供主動關閉 Toast 的方法，讓使用者可快速清除提示。
    const dismissToast = useCallback((id: string) => {
        setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, []);

    // 在特定情境需一次移除所有提示時使用，例如切換頁面或重新載入資料。
    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return { toasts, showToast, dismissToast, clearToasts };
}

interface DashboardToastContainerProps {
    toasts: DashboardToastMessage[];
    onDismiss: (id: string) => void;
    duration?: number;
}

export function DashboardToastContainer({ toasts, onDismiss, duration = 5000 }: DashboardToastContainerProps) {
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
                                {toast.description && (
                                    <p className="text-sm leading-snug text-current/80">{toast.description}</p>
                                )}
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

export default DashboardToastContainer;

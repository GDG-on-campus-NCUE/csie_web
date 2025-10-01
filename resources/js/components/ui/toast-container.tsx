import React, { useEffect } from 'react';
import { cn } from '@/lib/shared/utils';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import type { ToastMessage } from '@/hooks/use-toast';

/**
 * Toast 容器組件
 * 負責渲染和管理所有的 Toast 消息
 * 提供自動關閉和手動關閉功能
 */

interface ToastContainerProps {
    /** Toast 消息列表 */
    toasts: ToastMessage[];
    /** 關閉 Toast 的回調函數 */
    onDismiss: (id: string) => void;
    /** Toast 容器位置 */
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    /** 自訂容器類名 */
    className?: string;
}

// Toast 類型對應的樣式
const toastVariants = {
    success: {
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        icon: CheckCircle2,
    },
    error: {
        className: 'border-red-200 bg-red-50 text-red-800',
        icon: AlertCircle,
    },
    warning: {
        className: 'border-amber-200 bg-amber-50 text-amber-800',
        icon: AlertTriangle,
    },
    info: {
        className: 'border-blue-200 bg-blue-50 text-blue-800',
        icon: Info,
    },
} as const;

// 容器位置樣式
const positionClasses = {
    'top-right': 'top-4 right-4 sm:top-6 sm:right-6',
    'top-left': 'top-4 left-4 sm:top-6 sm:left-6',
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2 sm:top-6',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-6',
};

/**
 * 單個 Toast 項目組件
 */
interface ToastItemProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const variant = toastVariants[toast.type];
    const IconComponent = variant.icon;

    // 自動關閉邏輯
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(() => {
                onDismiss(toast.id);
            }, toast.duration);

            return () => clearTimeout(timer);
        }
    }, [toast.id, toast.duration, onDismiss]);

    return (
        <div
            className={cn(
                'flex flex-col gap-2 rounded-2xl border p-4 shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 ease-in-out',
                'animate-in slide-in-from-right-full',
                variant.className
            )}
            role="alert"
            aria-live="polite"
        >
            <div className="flex items-start gap-3">
                {/* 圖示 */}
                <div className="mt-0.5 shrink-0">
                    <IconComponent className="h-5 w-5" />
                </div>

                {/* 內容 */}
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold leading-none">
                        {toast.title}
                    </p>
                    {toast.description && (
                        <p className="text-sm leading-snug text-current/80 whitespace-pre-line">
                            {toast.description}
                        </p>
                    )}
                </div>

                {/* 關閉按鈕 */}
                <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    className="shrink-0 rounded-full p-1 text-current/70 transition-colors hover:bg-white/50 hover:text-current focus:outline-none focus:ring-2 focus:ring-current/50"
                    aria-label="關閉通知"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* 進度條（可選） */}
            {toast.duration && toast.duration > 0 && (
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
                    <div
                        className="h-full bg-current/40 rounded-full transition-all duration-1000 ease-linear"
                        style={{
                            width: '0%',
                        }}
                    />
                </div>
            )}
        </div>
    );
}

/**
 * Toast 容器主組件
 */
export default function ToastContainer({
    toasts,
    onDismiss,
    position = 'bottom-right',
    className
}: ToastContainerProps) {
    // 如果沒有 Toast，不渲染容器
    if (toasts.length === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                'fixed z-50 flex w-full max-w-sm flex-col gap-3 pointer-events-none',
                positionClasses[position],
                className
            )}
        >
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem
                        toast={toast}
                        onDismiss={onDismiss}
                    />
                </div>
            ))}
        </div>
    );
}

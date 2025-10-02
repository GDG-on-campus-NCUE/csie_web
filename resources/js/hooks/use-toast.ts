import { useState, useCallback } from 'react';

/**
 * 通用 Toast 消息管理 Hook
 * 提供統一的 Toast 消息管理介面，支援自動關閉和手動控制
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number; // 自訂顯示時間，0 表示不自動關閉
}

export interface ToastOptions {
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
}

/**
 * 生成唯一的 Toast ID
 */
const generateToastId = (): string => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Toast 管理 Hook
 * @param maxToasts 最大 Toast 數量
 * @param defaultDuration 預設顯示時間（毫秒）
 */
export function useToast(maxToasts = 5, defaultDuration = 5000) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    /**
     * 顯示新的 Toast 消息
     */
    const showToast = useCallback((options: ToastOptions): string => {
        const id = generateToastId();
        const duration = options.duration ?? defaultDuration;

        const newToast: ToastMessage = {
            id,
            type: options.type,
            title: options.title,
            description: options.description,
            duration,
        };

        setToasts(prev => {
            // 限制最大 Toast 數量，移除最舊的
            const updatedToasts = prev.length >= maxToasts
                ? prev.slice(1)
                : prev;

            return [...updatedToasts, newToast];
        });

        return id;
    }, [maxToasts, defaultDuration]);

    /**
     * 關閉指定的 Toast
     */
    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    /**
     * 關閉所有 Toast
     */
    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    /**
     * 顯示成功消息
     */
    const showSuccess = useCallback((title: string, description?: string) => {
        return showToast({ type: 'success', title, description });
    }, [showToast]);

    /**
     * 顯示錯誤消息
     */
    const showError = useCallback((title: string, description?: string) => {
        return showToast({ type: 'error', title, description });
    }, [showToast]);

    /**
     * 顯示資訊消息
     */
    const showInfo = useCallback((title: string, description?: string) => {
        return showToast({ type: 'info', title, description });
    }, [showToast]);

    /**
     * 顯示警告消息
     */
    const showWarning = useCallback((title: string, description?: string) => {
        return showToast({ type: 'warning', title, description });
    }, [showToast]);

    /**
     * 處理批次錯誤消息
     */
    const showBatchErrors = useCallback((errors: string[], title?: string) => {
        if (errors.length === 0) return;

        if (errors.length === 1) {
            showError(title || 'Error', errors[0]);
        } else {
            const description = errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
            showError(title || 'Multiple Errors', description);
        }
    }, [showError]);

    return {
        toasts,
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        showBatchErrors,
        dismissToast,
        clearToasts,
    };
}

export default useToast;

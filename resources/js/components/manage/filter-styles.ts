import { cn } from '@/lib/shared/utils';

/**
 * 管理頁面共用的篩選控制項樣式。
 * 確保所有 Input / Select 在外觀與互動上保持一致。
 */
export function manageFilterControlClass(...classNames: Array<string | false | null | undefined>) {
    return cn(
        'h-11 rounded-lg border border-neutral-200/80 bg-white/95 px-4 text-sm text-neutral-700 shadow-xs transition-all duration-150 placeholder:text-neutral-400',
        'hover:border-primary-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-200/60 focus:ring-offset-0 focus:outline-none',
        'disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-50 disabled:text-neutral-400',
        classNames
    );
}

/**
 * 管理工具列中的主要按鈕建議樣式。
 */
export function manageToolbarPrimaryButtonClass(...classNames: Array<string | false | null | undefined>) {
    return cn('h-11 gap-2 px-5 shadow-xs bg-white text-neutral-900', classNames);
}

/**
 * 管理工具列中的次要 / 重設類按鈕樣式。
 */
export function manageToolbarSecondaryButtonClass(...classNames: Array<string | false | null | undefined>) {
    return cn('h-11 px-4 text-neutral-600', classNames);
}

import { useForm } from '@inertiajs/react';
import { ChangeEvent, ReactElement, cloneElement, useMemo, useRef, useState, MouseEvent } from 'react';
import type { TranslatorFunction } from './post-types';

// 將批次匯入流程抽象為單一按鈕與隱藏的檔案輸入框，避免出現干擾視覺的對話框。
interface PostImportUploaderProps {
    trigger: ReactElement<{ onClick?: (event: MouseEvent<any>) => void; disabled?: boolean }>;
    t: TranslatorFunction;
    fallbackLanguage: 'zh' | 'en';
    onStart?: (message: string) => void;
    onSuccess?: (message?: string) => void;
    onError?: (messages: string[]) => void;
    onClientError?: (message: string) => void;
}

type ImportFormState = {
    action: 'import';
    files: File[];
};

export function PostImportUploader({
    trigger,
    t,
    fallbackLanguage,
    onStart,
    onSuccess,
    onError,
    onClientError,
}: PostImportUploaderProps) {
    // 提供語系相依的預設文案，確保英文介面不會顯示中文提示。
    const fallbackText = (zh: string, en: string) => (fallbackLanguage === 'zh' ? zh : en);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [inputKey, setInputKey] = useState(0);

    const importForm = useForm<ImportFormState>({
        action: 'import',
        files: [],
    });

    const resetInput = () => {
        setInputKey((previous) => previous + 1);
        importForm.reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submitFiles = (files: File[]) => {
        if (!files || files.length === 0) {
            const message = t(
                'posts.index.import.file_required',
                fallbackText('請選擇要上傳的 CSV 檔案', 'Please choose at least one CSV file to upload'),
            );
            onClientError?.(message);
            return;
        }

        importForm.setData({ action: 'import', files });

        const startMessage = t(
            'posts.index.import.start_toast',
            fallbackText('開始匯入公告，請稍候…', 'Import started, please wait…'),
        );
        onStart?.(startMessage);

        importForm.post('/manage/posts/bulk', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                const message = t(
                    'posts.index.import.success_toast',
                    fallbackText('公告匯入已送出', 'Import request submitted'),
                );
                onSuccess?.(message);
            },
            onError: (errors) => {
                const messages = Object.values(errors)
                    .flat()
                    .map((value) => String(value))
                    .filter((value) => value.length > 0);

                if (messages.length === 0) {
                    messages.push(
                        t(
                            'posts.index.import.error_fallback',
                            fallbackText('匯入失敗，請確認檔案內容或稍後再試。', 'Import failed. Please check the CSV content and try again.'),
                        ),
                    );
                }

                onError?.(messages);
            },
            onFinish: () => {
                resetInput();
            },
        });
    };

    const handleTriggerClick = (event: MouseEvent<any>) => {
        trigger.props.onClick?.(event);
        if (event.defaultPrevented) {
            return;
        }

        event.preventDefault();
        if (!importForm.processing) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) {
            return;
        }

        submitFiles(files);
    };

    const enhancedTrigger = useMemo(() => {
        const disabled = trigger.props.disabled ?? false;
        return cloneElement(trigger, {
            onClick: handleTriggerClick,
            disabled: importForm.processing || disabled,
            'data-import-processing': importForm.processing ? 'true' : undefined,
        });
    }, [trigger, importForm.processing]);

    return (
        <>
            {enhancedTrigger}
            <input
                key={inputKey}
                ref={fileInputRef}
                type="file"
                accept=".csv"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />
            {importForm.processing && (
                <span className="sr-only" aria-live="polite">
                    {t(
                        'posts.index.import.processing_aria',
                        fallbackText('匯入處理中', 'Import in progress'),
                    )}
                </span>
            )}
        </>
    );
}

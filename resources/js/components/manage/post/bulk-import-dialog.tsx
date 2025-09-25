import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Upload, FileText, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { TranslatorFunction } from './post-types';

/**
 * 批次匯入對話框元件
 * 負責處理 CSV 檔案上傳和批次匯入功能
 * 提供完整的錯誤處理和使用者回饋
 */

interface BulkImportDialogProps {
    /** 觸發按鈕元素 */
    trigger: React.ReactNode;
    /** 翻譯函式 */
    t: TranslatorFunction;
    /** 回退語言 */
    fallbackLanguage: 'zh' | 'en';
    /** 匯入開始回調 */
    onStart?: (message: string) => void;
    /** 匯入成功回調 */
    onSuccess?: (message: string) => void;
    /** 匯入錯誤回調 */
    onError?: (messages: string[]) => void;
    /** 客戶端錯誤回調 */
    onClientError?: (message: string) => void;
}

interface ImportFormData {
    action: 'import';
    files: File[];
}

// CSV 格式說明模板
const CSV_FORMAT_TEMPLATE = {
    zh: {
        title: 'CSV 檔案格式說明',
        description: '請確保您的 CSV 檔案包含以下必要欄位：',
        requiredFields: [
            { field: 'title', description: '公告標題（必填）' },
            { field: 'content', description: '公告內容（必填）' },
            { field: 'category_slug', description: '分類代碼（必填，或使用 category_id）' },
        ],
        optionalFields: [
            { field: 'title_en', description: '英文標題' },
            { field: 'content_en', description: '英文內容' },
            { field: 'summary', description: '摘要' },
            { field: 'summary_en', description: '英文摘要' },
            { field: 'status', description: '狀態（draft/published/scheduled）' },
            { field: 'publish_at', description: '發布時間' },
            { field: 'tags', description: '標籤（以逗號分隔）' },
            { field: 'source_url', description: '來源連結' },
        ],
        notes: [
            '檔案格式必須是 CSV (.csv) 或純文字 (.txt)',
            '檔案大小不得超過 5MB',
            '可一次上傳多個檔案',
            '第一列必須是欄位標題',
            '如無指定狀態，預設為「已發布」',
        ],
    },
    en: {
        title: 'CSV File Format Instructions',
        description: 'Please ensure your CSV file contains the following required fields:',
        requiredFields: [
            { field: 'title', description: 'Post title (required)' },
            { field: 'content', description: 'Post content (required)' },
            { field: 'category_slug', description: 'Category slug (required, or use category_id)' },
        ],
        optionalFields: [
            { field: 'title_en', description: 'English title' },
            { field: 'content_en', description: 'English content' },
            { field: 'summary', description: 'Summary' },
            { field: 'summary_en', description: 'English summary' },
            { field: 'status', description: 'Status (draft/published/scheduled)' },
            { field: 'publish_at', description: 'Publish date' },
            { field: 'tags', description: 'Tags (comma-separated)' },
            { field: 'source_url', description: 'Source URL' },
        ],
        notes: [
            'File format must be CSV (.csv) or text (.txt)',
            'File size must not exceed 5MB',
            'Multiple files can be uploaded at once',
            'First row must contain field headers',
            'Default status is "published" if not specified',
        ],
    },
};

export default function BulkImportDialog({
    trigger,
    t,
    fallbackLanguage,
    onStart,
    onSuccess,
    onError,
    onClientError,
}: BulkImportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 使用 Inertia 表單處理
    const form = useForm<ImportFormData>({
        action: 'import',
        files: [],
    });

    // 語言相關的文字內容
    const getText = (zhText: string, enText: string) =>
        fallbackLanguage === 'zh' ? zhText : enText;

    const formatInfo = CSV_FORMAT_TEMPLATE[fallbackLanguage];

    /**
     * 驗證選取的檔案
     * 檢查檔案類型、大小等限制
     */
    const validateFiles = (files: File[]): string[] => {
        const errors: string[] = [];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['text/csv', 'text/plain', 'application/csv'];

        if (files.length === 0) {
            errors.push(
                t('posts.bulk_import.validation.no_files',
                  getText('請選擇至少一個檔案', 'Please select at least one file'))
            );
        }

        files.forEach((file, index) => {
            // 檢查檔案類型
            if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
                errors.push(
                    t('posts.bulk_import.validation.invalid_type',
                      getText(`檔案 "${file.name}" 格式不正確`, `File "${file.name}" has invalid format`))
                );
            }

            // 檢查檔案大小
            if (file.size > maxSize) {
                errors.push(
                    t('posts.bulk_import.validation.size_too_large',
                      getText(`檔案 "${file.name}" 大小超過 5MB`, `File "${file.name}" exceeds 5MB limit`))
                );
            }
        });

        return errors;
    };

    /**
     * 處理檔案選擇
     */
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(files);

        // 清除之前的驗證錯誤
        setValidationErrors([]);

        // 驗證新選擇的檔案
        if (files.length > 0) {
            const errors = validateFiles(files);
            setValidationErrors(errors);
        }
    };

    /**
     * 觸發檔案選擇視窗
     */
    const openFilePicker = () => {
        if (!form.processing) {
            fileInputRef.current?.click();
        }
    };

    /**
     * 移除已選擇的檔案
     */
    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);

        // 重新驗證剩餘檔案
        if (newFiles.length > 0) {
            const errors = validateFiles(newFiles);
            setValidationErrors(errors);
        } else {
            setValidationErrors([]);
        }
    };

    /**
     * 重置表單狀態
     */
    const resetForm = () => {
        setSelectedFiles([]);
        setValidationErrors([]);
        form.reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /**
     * 處理表單提交
     */
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        // 最終驗證
        const errors = validateFiles(selectedFiles);
        if (errors.length > 0) {
            setValidationErrors(errors);
            onClientError?.(
                t('posts.bulk_import.validation.failed',
                  getText('請修正檔案問題後重試', 'Please fix file issues and try again'))
            );
            return;
        }

        // 準備表單資料
        form.setData({
            action: 'import',
            files: selectedFiles,
        });

        // 轉換為 FormData
        form.transform(() => {
            const formData = new FormData();
            formData.append('action', 'import');
            selectedFiles.forEach(file => {
                formData.append('files[]', file, file.name);
            });
            return formData;
        });

        // 通知開始匯入
        const startMessage = t(
            'posts.bulk_import.start_message',
            getText('開始處理批次匯入...', 'Starting bulk import...')
        );
        onStart?.(startMessage);

        // 提交表單
        form.post('/manage/posts/bulk', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                const successMessage = t(
                    'posts.bulk_import.success_message',
                    getText('批次匯入處理完成', 'Bulk import completed successfully')
                );
                onSuccess?.(successMessage);

                // 關閉對話框並重置表單
                setIsOpen(false);
                resetForm();
            },
            onError: (errors) => {
                // 收集所有錯誤訊息
                const errorMessages = Object.values(errors)
                    .flat()
                    .map(error => String(error))
                    .filter(Boolean);

                if (errorMessages.length === 0) {
                    errorMessages.push(
                        t('posts.bulk_import.error.unknown',
                          getText('匯入失敗，請檢查檔案內容', 'Import failed, please check file content'))
                    );
                }

                onError?.(errorMessages);

                // 重置表單狀態但不關閉對話框，讓使用者可以重新嘗試
                resetForm();
            },
        });
    };

    /**
     * 格式化檔案大小
     */
    const formatFileSize = (bytes: number): string => {
        const kb = bytes / 1024;
        const mb = kb / 1024;

        if (mb >= 1) {
            return `${mb.toFixed(1)} MB`;
        } else {
            return `${kb.toFixed(1)} KB`;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        {t('posts.bulk_import.dialog.title', getText('批次匯入公告', 'Bulk Import Posts'))}
                    </DialogTitle>
                    <DialogDescription>
                        {t('posts.bulk_import.dialog.description',
                          getText('透過 CSV 檔案批次新增多筆公告資料', 'Add multiple posts at once using CSV files'))}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* 檔案格式說明 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{formatInfo.title}</CardTitle>
                            <CardDescription>{formatInfo.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* 必填欄位 */}
                            <div>
                                <h4 className="font-medium text-sm mb-2">
                                    {getText('必填欄位', 'Required Fields')}
                                </h4>
                                <div className="space-y-1 text-sm">
                                    {formatInfo.requiredFields.map(({ field, description }) => (
                                        <div key={field} className="flex gap-2">
                                            <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                                                {field}
                                            </code>
                                            <span className="text-gray-600">{description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 選填欄位 */}
                            <div>
                                <h4 className="font-medium text-sm mb-2">
                                    {getText('選填欄位', 'Optional Fields')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                                    {formatInfo.optionalFields.map(({ field, description }) => (
                                        <div key={field} className="flex gap-2">
                                            <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                                                {field}
                                            </code>
                                            <span className="text-gray-600">{description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 注意事項 */}
                            <div>
                                <h4 className="font-medium text-sm mb-2">
                                    {getText('注意事項', 'Important Notes')}
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    {formatInfo.notes.map((note, index) => (
                                        <li key={index} className="flex gap-2">
                                            <span className="text-gray-400">•</span>
                                            <span>{note}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 檔案上傳區域 */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="bulk-import-files">
                                {getText('選擇 CSV 檔案', 'Select CSV Files')}
                            </label>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-center gap-2 sm:w-auto"
                                    onClick={openFilePicker}
                                    disabled={form.processing}
                                >
                                    <Upload className="h-4 w-4" />
                                    {getText('選擇檔案', 'Choose files')}
                                </Button>
                                <span className="text-xs text-gray-500">
                                    {getText('可一次選擇多個 CSV 檔案（單檔 5MB 以內）', 'Select multiple CSV files (up to 5MB each)')}
                                </span>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.txt"
                                multiple
                                onChange={handleFileChange}
                                className="sr-only"
                                id="bulk-import-files"
                                disabled={form.processing}
                            />
                        </div>

                        {/* 已選擇的檔案列表 */}
                        {selectedFiles.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">
                                    {getText('已選擇檔案', 'Selected Files')} ({selectedFiles.length})
                                </h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {selectedFiles.map((file, index) => (
                                        <div key={`${file.name}-${index}`}
                                             className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                            <FileText className="h-4 w-4 text-gray-400" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                                disabled={form.processing}
                                                aria-label={getText('移除檔案', 'Remove file')}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 驗證錯誤顯示 */}
                        {validationErrors.length > 0 && (
                            <Alert className="border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription>
                                    <div className="space-y-1">
                                        {validationErrors.map((error, index) => (
                                            <div key={index} className="text-red-800">{error}</div>
                                        ))}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* 提交按鈕 */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsOpen(false);
                                    resetForm();
                                }}
                                disabled={form.processing}
                            >
                                {getText('取消', 'Cancel')}
                            </Button>

                            <Button
                                type="submit"
                                disabled={selectedFiles.length === 0 || validationErrors.length > 0 || form.processing}
                                className="min-w-[120px]"
                            >
                                {form.processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {getText('處理中...', 'Processing...')}
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        {getText('開始匯入', 'Start Import')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

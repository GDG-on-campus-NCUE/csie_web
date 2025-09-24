import { useForm } from '@inertiajs/react';
import type { FormEvent, ChangeEvent, DragEvent, ReactNode } from 'react';
import { useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranslatorFunction } from './post-types';

// 將批次匯入的流程封裝成組件，方便未來其他管理頁面重複利用。
interface PostImportDialogProps {
    trigger: ReactNode;
    t: TranslatorFunction;
    onSuccess?: (message?: string) => void;
    onError?: (messages: string[]) => void;
    onClientError?: (message: string) => void;
}

type ImportFormState = {
    action: 'import';
    files: File[];
};

export function PostImportDialog({ trigger, t, onSuccess, onError, onClientError }: PostImportDialogProps) {
    const [open, setOpen] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const importForm = useForm<ImportFormState>({
        action: 'import',
        files: [],
    });

    const resetForm = () => {
        importForm.reset();
        importForm.clearErrors();
        setFileInputKey((previous) => previous + 1);
        setIsDragging(false);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            resetForm();
        }
    };

    const updateSelectedFiles = (files: FileList | File[] | null) => {
        const normalized = files ? Array.from(files) : [];
        importForm.setData('files', normalized);
        if (normalized.length > 0) {
            importForm.clearErrors('files');
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        updateSelectedFiles(event.target.files);
    };

    const handleDropZoneDragEnter = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDropZoneDragOver = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const handleDropZoneDragLeave = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const relatedTarget = event.relatedTarget as Node | null;
        if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
            setIsDragging(false);
        }
    };

    const handleDropZoneDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        updateSelectedFiles(event.dataTransfer?.files ?? null);
    };

    const selectedFiles = importForm.data.files ?? [];

    const fileErrorMessage = useMemo(() => {
        if (importForm.errors.files) {
            return importForm.errors.files;
        }

        const entries = Object.entries(importForm.errors) as Array<[string, string]>;
        const nested = entries.find(([key]) => key.startsWith('files.'));
        return nested ? nested[1] : undefined;
    }, [importForm.errors]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedFiles || selectedFiles.length === 0) {
            const message = t('posts.index.import.file_required', '請選擇要上傳的 CSV 檔案');
            importForm.setError('files', message);
            onClientError?.(message);
            return;
        }

        importForm.post('/manage/posts/bulk', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                const message = t('posts.index.import.success_toast', '公告匯入已送出');
                onSuccess?.(message);
                handleOpenChange(false);
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors)
                    .flat()
                    .map((value) => String(value))
                    .filter((value) => value.length > 0);

                if (errorMessages.length === 0) {
                    errorMessages.push(t('posts.index.import.error_fallback', '匯入失敗，請確認檔案內容或稍後再試。'));
                }

                onError?.(errorMessages);
            },
            onFinish: () => {
                setIsDragging(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('posts.index.import.title', '上傳公告 CSV')}</DialogTitle>
                    <DialogDescription>
                        {t('posts.index.import.description', '一次匯入多筆公告，支援自訂發布時間與狀態。')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="posts-import-file">{t('posts.index.import.file_label', '選擇 CSV 檔案')}</Label>
                        <label
                            htmlFor="posts-import-file"
                            onDragEnter={handleDropZoneDragEnter}
                            onDragOver={handleDropZoneDragOver}
                            onDragLeave={handleDropZoneDragLeave}
                            onDrop={handleDropZoneDrop}
                            className={cn(
                                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition-colors',
                                isDragging ? 'border-primary bg-primary/5' : 'hover:border-slate-400',
                            )}
                        >
                            <input
                                key={fileInputKey}
                                ref={fileInputRef}
                                id="posts-import-file"
                                type="file"
                                accept=".csv"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <Upload className="h-10 w-10 text-slate-400" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-700">
                                    {t('posts.index.import.drop_label', '拖曳或點擊上傳 CSV 檔案')}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {t('posts.index.import.drop_hint', '支援一次匯入多個檔案')}
                                </p>
                            </div>
                        </label>

                        {selectedFiles.length > 0 && (
                            <ul className="space-y-1 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                                {selectedFiles.map((file, index) => (
                                    <li key={`${file.name}-${index}`} className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-400" />
                                        <span className="truncate" title={file.name}>
                                            {file.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {fileErrorMessage && <p className="text-sm text-red-600">{fileErrorMessage}</p>}
                    </div>

                    <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                        <p>{t('posts.index.import.hint_required', '必要欄位：title、content、category_slug 或 category_id。')}</p>
                        <p>
                            {t(
                                'posts.index.import.hint_optional',
                                '可選欄位：slug、status、publish_at、summary、summary_en、title_en、content_en、tags、source_url。',
                            )}
                        </p>
                        <p>
                            {t(
                                'posts.index.import.hint_datetime',
                                '建議使用 YYYY-MM-DD HH:MM 格式，若狀態為 scheduled 需搭配 publish_at。',
                            )}
                        </p>
                        <p>{t('posts.index.import.hint_sample', '專案內的 .test_file/post.csv 可作為測試檔案。')}</p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                            {t('posts.index.import.cancel', '取消')}
                        </Button>
                        <Button type="submit" className="gap-2" disabled={importForm.processing}>
                            {importForm.processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            {t('posts.index.import.submit', '開始匯入')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

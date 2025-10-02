import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';
import { apiClient } from '@/lib/manage/api-client';
import type { TagOption } from '@/types/manage';
import { AlertCircle, ArrowDown, ArrowUp, Check, ExternalLink, FileText, Image as ImageIcon, Loader, Trash2, UploadCloud } from 'lucide-react';

type AttachmentTag = TagOption;

export interface AttachmentItem {
    id: number;
    title: string;
    url?: string | null;
    preview_url?: string | null;
    type?: 'image' | 'document' | 'link' | string;
    size?: number | null;
    mime_type?: string | null;
    tags?: AttachmentTag[];
    sort_order?: number | null;
    description?: string | null;
}

interface AttachmentUploaderProps {
    value: AttachmentItem[];
    onChange: (attachments: AttachmentItem[]) => void;
    uploadRoute?: string;
    uploadFieldName?: string;
    onUpload?: (file: File, helpers: { onProgress: (progress: number) => void }) => Promise<AttachmentItem>;
    onRemove?: (attachment: AttachmentItem) => Promise<void> | void;
    onReorder?: (attachments: AttachmentItem[]) => Promise<void> | void;
    maxFiles?: number;
    accepts?: string;
    buttonLabel?: string;
    description?: string;
    disabled?: boolean;
}

interface UploadTask {
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
}

interface UploadResponse {
    data: AttachmentItem;
}

function generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `upload-${Math.random().toString(36).slice(2, 11)}`;
}

export default function AttachmentUploader({
    value,
    onChange,
    uploadRoute = '/attachments',
    uploadFieldName = 'file',
    onUpload,
    onRemove,
    onReorder,
    maxFiles,
    accepts = '*/*',
    buttonLabel = '選擇檔案',
    description = '支援多檔上傳，可拖曳排序與快速預覽。',
    disabled,
}: AttachmentUploaderProps) {
    const uploaderId = useId();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const latestValueRef = useRef<AttachmentItem[]>(value);
    const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        latestValueRef.current = value;
    }, [value]);

    const canAddMore = useMemo(() => {
        if (typeof maxFiles !== 'number') {
            return true;
        }
        return value.length + uploadTasks.length < maxFiles;
    }, [maxFiles, uploadTasks.length, value.length]);

    function handleFileButtonClick() {
        if (disabled) {
            return;
        }
        fileInputRef.current?.click();
    }

    async function performUpload(file: File, taskId: string) {
        const onProgress = (progress: number) => {
            setUploadTasks((prev) =>
                prev.map((task) => (task.id === taskId ? { ...task, progress: Math.round(progress) } : task))
            );
        };

        setErrorMessage(null);

        try {
            let uploadedAttachment: AttachmentItem;

            if (onUpload) {
                uploadedAttachment = await onUpload(file, { onProgress });
            } else {
                const formData = new FormData();
                formData.append(uploadFieldName, file);

                const response = await apiClient.post<UploadResponse | AttachmentItem>(uploadRoute, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (event) => {
                        if (!event.total) {
                            return;
                        }
                        onProgress((event.loaded / event.total) * 100);
                    },
                });

                const payload = response.data as UploadResponse | AttachmentItem;
                uploadedAttachment = 'data' in payload ? payload.data : payload;
            }

            setUploadTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: 'success', progress: 100 } : task)));
            setTimeout(() => {
                setUploadTasks((prev) => prev.filter((task) => task.id !== taskId));
            }, 800);
            const next = [...latestValueRef.current, uploadedAttachment];
            onChange(next);
            void onReorder?.(next);
        } catch (error) {
            setUploadTasks((prev) =>
                prev.map((task) =>
                    task.id === taskId
                        ? {
                              ...task,
                              status: 'error',
                              error: error instanceof Error ? error.message : '上傳失敗，請稍後再試。',
                          }
                        : task
                )
            );
            setErrorMessage(error instanceof Error ? error.message : '上傳失敗，請稍後再試。');
        }
    }

    function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || files.length === 0) {
            return;
        }

        const selected = Array.from(files).slice(0, maxFiles ? Math.max(0, maxFiles - value.length) : files.length);
        const tasks: UploadTask[] = selected.map((file) => ({
            id: generateId(),
            file,
            progress: 0,
            status: 'uploading',
        }));

        setUploadTasks((prev) => [...prev, ...tasks]);
        tasks.forEach((task) => {
            void performUpload(task.file, task.id);
        });

        event.target.value = '';
    }

    function moveAttachment(index: number, direction: 'up' | 'down') {
        const current = latestValueRef.current;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= current.length) {
            return;
        }

        const next = [...current];
        const [moved] = next.splice(index, 1);
        next.splice(newIndex, 0, moved);
        onChange(next);
        void onReorder?.(next);
    }

    async function removeAttachment(attachment: AttachmentItem) {
        try {
            await onRemove?.(attachment);
            const next = latestValueRef.current.filter((item) => item.id !== attachment.id);
            onChange(next);
            void onReorder?.(next);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : '刪除附件失敗，請稍後再試。');
        }
    }

    return (
        <div className="space-y-4">
            <input
                ref={fileInputRef}
                id={uploaderId}
                type="file"
                className="hidden"
                multiple
                accept={accepts}
                onChange={handleFilesSelected}
                disabled={disabled || !canAddMore}
            />

            <div
                className={cn(
                    'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/60 p-8 text-center transition-colors hover:border-primary/50',
                    disabled && 'cursor-not-allowed opacity-60'
                )}
            >
                <UploadCloud className="h-10 w-10 text-primary-500" aria-hidden />
                <div className="space-y-1">
                    <p className="text-base font-semibold text-neutral-800">拖曳檔案至此或點擊上傳</p>
                    <p className="text-sm text-neutral-500">{description}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleFileButtonClick} disabled={disabled || !canAddMore}>
                    {buttonLabel}
                </Button>
                {maxFiles ? <p className="text-xs text-neutral-400">已選擇 {value.length} / {maxFiles} 個附件</p> : null}
            </div>

            {uploadTasks.length > 0 ? (
                <div className="space-y-2">
                    {uploadTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
                            <div className="flex flex-1 flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                    <Loader className="h-4 w-4 animate-spin text-primary-500" />
                                    {task.file.name}
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                    <div
                                        className={cn(
                                            'h-full rounded-full bg-primary-500 transition-all',
                                            task.status === 'error' && 'bg-red-500'
                                        )}
                                        style={{ width: `${task.progress}%` }}
                                    />
                                </div>
                                {task.status === 'error' && task.error ? (
                                    <p className="text-xs text-red-600">{task.error}</p>
                                ) : null}
                            </div>
                            {task.status === 'success' ? <Check className="h-5 w-5 text-green-500" /> : null}
                        </div>
                    ))}
                </div>
            ) : null}

            {value.length > 0 ? (
                <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {value.map((attachment, index) => {
                        const isImage = attachment.type === 'image' || attachment.mime_type?.startsWith('image/');
                        const previewUrl = attachment.preview_url ?? (isImage ? attachment.url ?? undefined : undefined);
                        return (
                            <li key={attachment.id} className="group relative flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-sm">
                                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt={attachment.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-neutral-500">
                                            {attachment.type === 'link' ? (
                                                <ExternalLink className="h-10 w-10" />
                                            ) : isImage ? (
                                                <ImageIcon className="h-10 w-10" />
                                            ) : (
                                                <FileText className="h-10 w-10" />
                                            )}
                                            <span className="text-xs">{attachment.mime_type ?? attachment.type ?? '檔案'}</span>
                                        </div>
                                    )}
                                    {attachment.url ? (
                                        <Button
                                            asChild
                                            variant="secondary"
                                            size="sm"
                                            className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                                <ExternalLink className="h-3 w-3" /> 預覽
                                            </a>
                                        </Button>
                                    ) : null}
                                </div>

                                <div className="flex flex-1 flex-col gap-2">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-semibold text-neutral-900">{attachment.title}</p>
                                        {attachment.size ? <p className="text-xs text-neutral-500">{formatSize(attachment.size)}</p> : null}
                                    </div>
                                    {attachment.tags && attachment.tags.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {attachment.tags.map((tag) => (
                                                <Badge key={tag.id} variant="outline" className="text-xs">
                                                    {tag.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => moveAttachment(index, 'up')}
                                            disabled={index === 0 || disabled}
                                            className="size-9"
                                            title="上移"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => moveAttachment(index, 'down')}
                                            disabled={index === value.length - 1 || disabled}
                                            className="size-9"
                                            title="下移"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => void removeAttachment(attachment)}
                                        disabled={disabled}
                                        className="size-9"
                                        title="刪除附件"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : null}

            {errorMessage ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errorMessage}</span>
                </div>
            ) : null}
        </div>
    );
}

function formatSize(size: number) {
    if (size < 1024) {
        return `${size} bytes`;
    }
    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }
    if (size < 1024 * 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(1)} MB`;
    }
    return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

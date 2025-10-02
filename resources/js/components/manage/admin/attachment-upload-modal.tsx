import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AttachmentUploader, { type AttachmentItem } from '@/components/manage/forms/attachment-uploader';
import { apiClient, isManageApiError } from '@/lib/manage/api-client';
import { cn } from '@/lib/shared/utils';
import type { ManageAttachmentFilterOptions } from '@/types/manage';
import { RefreshCcw } from 'lucide-react';

interface AttachmentUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUploadComplete: () => void;
    filterOptions: ManageAttachmentFilterOptions;
    onError: (message: string) => void;
    onSuccess: (message: string) => void;
}

interface UploadedFile {
    id: number;
    title: string;
    filename: string;
    description?: string;
    visibility: string;
    space_id?: number;
    tags?: string[];
}

/**
 * 附件上傳對話框元件。
 * 提供檔案上傳、基本資訊編輯（標題、描述、可見性、Space 綁定）功能。
 * 支援多檔上傳與即時進度顯示。
 */
export default function AttachmentUploadModal({
    open,
    onOpenChange,
    onUploadComplete,
    filterOptions,
    onError,
    onSuccess,
}: AttachmentUploadModalProps) {
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [editingFile, setEditingFile] = useState<UploadedFile | null>(null);
    const [saving, setSaving] = useState(false);

    // 重置狀態當對話框關閉
    useEffect(() => {
        if (!open) {
            setAttachments([]);
            setUploadedFiles([]);
            setEditingFile(null);
        }
    }, [open]);

    /**
     * 處理檔案上傳：將檔案上傳到伺服器並取得附件 ID。
     */
    const handleUpload = async (
        file: File,
        helpers: { onProgress: (progress: number) => void }
    ): Promise<AttachmentItem> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('visibility', 'public');
        formData.append('title', file.name);

        try {
            const response = await apiClient.post<{ data: AttachmentItem }>('/manage/admin/attachments/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (event) => {
                    if (event.total) {
                        helpers.onProgress((event.loaded / event.total) * 100);
                    }
                },
            });

            const uploadedItem = response.data.data;

            // 記錄上傳的檔案以便後續編輯
            setUploadedFiles(prev => [...prev, {
                id: uploadedItem.id,
                title: uploadedItem.title,
                filename: file.name,
                description: uploadedItem.description ?? '',
                visibility: 'public',
                space_id: undefined,
                tags: [],
            }]);

            return uploadedItem;
        } catch (error) {
            if (isManageApiError(error)) {
                throw new Error(error.message);
            }
            throw new Error('上傳失敗，請稍後再試。');
        }
    };

    /**
     * 處理檔案移除：從伺服器刪除附件。
     */
    const handleRemove = async (attachment: AttachmentItem) => {
        try {
            await apiClient.delete(`/manage/admin/attachments/${attachment.id}`);
            setUploadedFiles(prev => prev.filter(f => f.id !== attachment.id));
        } catch (error) {
            if (isManageApiError(error)) {
                throw new Error(error.message);
            }
            throw new Error('刪除失敗，請稍後再試。');
        }
    };

    /**
     * 處理編輯檔案：開啟編輯表單。
     */
    const handleEdit = (attachmentId: number) => {
        const file = uploadedFiles.find(f => f.id === attachmentId);
        if (file) {
            setEditingFile({ ...file });
        }
    };

    /**
     * 儲存編輯的檔案資訊。
     */
    const handleSaveEdit = async () => {
        if (!editingFile) {
            return;
        }

        setSaving(true);
        try {
            await apiClient.put(`/manage/admin/attachments/${editingFile.id}`, {
                title: editingFile.title,
                description: editingFile.description,
                visibility: editingFile.visibility,
                space_id: editingFile.space_id,
                tags: editingFile.tags,
            });

            // 更新本地狀態
            setUploadedFiles(prev =>
                prev.map(f => (f.id === editingFile.id ? editingFile : f))
            );

            // 更新 attachments 狀態中的標題
            setAttachments(prev =>
                prev.map(att => (att.id === editingFile.id ? { ...att, title: editingFile.title } : att))
            );

            setEditingFile(null);
            onSuccess('附件資訊已更新。');
        } catch (error) {
            if (isManageApiError(error)) {
                onError(error.message);
            } else {
                onError('儲存失敗，請稍後再試。');
            }
        } finally {
            setSaving(false);
        }
    };

    /**
     * 完成上傳並關閉對話框。
     */
    const handleComplete = () => {
        if (uploadedFiles.length > 0) {
            onSuccess(`成功上傳 ${uploadedFiles.length} 個附件。`);
            onUploadComplete();
        }
        onOpenChange(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>上傳附件</DialogTitle>
                        <DialogDescription>
                            選擇檔案上傳，上傳完成後可編輯名稱與其他資訊。
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <AttachmentUploader
                            value={attachments}
                            onChange={setAttachments}
                            onUpload={handleUpload}
                            onRemove={handleRemove}
                            maxFiles={10}
                            buttonLabel="選擇檔案"
                            description="支援多檔上傳，最多 10 個檔案。"
                        />

                        {/* 已上傳檔案列表：可快速編輯基本資訊 */}
                        {uploadedFiles.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-neutral-700">已上傳檔案</h3>
                                <div className="space-y-2">
                                    {uploadedFiles.map(file => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white/95 p-3"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-neutral-800">{file.title}</p>
                                                <p className="text-xs text-neutral-500">{file.filename}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(file.id)}
                                            >
                                                編輯資訊
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            取消
                        </Button>
                        <Button
                            type="button"
                            onClick={handleComplete}
                            disabled={uploadedFiles.length === 0}
                        >
                            完成
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 編輯附件資訊對話框 */}
            <Dialog open={!!editingFile} onOpenChange={(open) => !open && setEditingFile(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>編輯附件資訊</DialogTitle>
                        <DialogDescription>
                            修改附件的標題、描述、可見性等資訊。
                        </DialogDescription>
                    </DialogHeader>

                    {editingFile && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">標題</Label>
                                <Input
                                    id="edit-title"
                                    value={editingFile.title}
                                    onChange={(e) => setEditingFile({ ...editingFile, title: e.target.value })}
                                    placeholder="輸入附件標題"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">描述</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editingFile.description}
                                    onChange={(e) => setEditingFile({ ...editingFile, description: e.target.value })}
                                    placeholder="輸入附件描述（選填）"
                                    rows={3}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-visibility">可見性</Label>
                                <Select
                                    id="edit-visibility"
                                    value={editingFile.visibility}
                                    onChange={(e) => setEditingFile({ ...editingFile, visibility: e.target.value })}
                                >
                                    {filterOptions.visibilities.map(option => (
                                        <option key={String(option.value)} value={String(option.value)}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-space">綁定 Space（選填）</Label>
                                <Select
                                    id="edit-space"
                                    value={editingFile.space_id ? String(editingFile.space_id) : ''}
                                    onChange={(e) => setEditingFile({
                                        ...editingFile,
                                        space_id: e.target.value ? Number(e.target.value) : undefined,
                                    })}
                                >
                                    <option value="">不綁定 Space</option>
                                    {filterOptions.spaces.map(option => (
                                        <option key={String(option.value)} value={String(option.value)}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingFile(null)}
                            disabled={saving}
                        >
                            取消
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="gap-2"
                        >
                            {saving && <RefreshCcw className="h-4 w-4 animate-spin" />}
                            儲存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Link, useForm } from '@inertiajs/react';
import { Calendar, Loader2, Link as LinkIcon, Paperclip, Plus, Trash2 } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useTranslator } from '@/hooks/use-translator';

export interface PostCategory {
    id: number;
    name: string;
    name_en: string;
    slug: string;
}

export interface AttachmentLinkInput {
    id: string;
    title: string;
    url: string;
}

export interface ExistingAttachment {
    id: number;
    type: 'image' | 'document' | 'link';
    title: string | null;
    file_url: string | null;
    external_url: string | null;
    mime_type: string | null;
}

export interface PostFormValues {
    title: {
        'zh-TW': string;
        en: string;
    };

    content: {
        'zh-TW': string;
        en: string;
    };
    category_id: string;
    status: 'draft' | 'published' | 'archived';
    pinned: boolean;
    publish_at: string;
    source_type: 'manual' | 'link';
    source_url: string;
    attachments_files: File[];
    attachments_links: AttachmentLinkInput[];
    attachments_remove: number[];
}

interface PostFormProps {
    categories: PostCategory[];
    cancelUrl: string;
    mode: 'create' | 'edit';
    initialValues: PostFormValues;
    initialPreviewHtml?: string;
    existingAttachments?: ExistingAttachment[];
    onSubmit: (form: any) => void;
}

const emptyContent = {
    'zh-TW': '',
    en: '',
};

const getSubmitLabels = (mode: 'create' | 'edit', t: (key: string, fallback?: string) => string, isZh: boolean) => {
    if (mode === 'create') {
        return {
            idle: t('posts.form.actions.submit_create', isZh ? '建立公告' : 'Create bulletin'),
            processing: t('posts.form.actions.submit_create_processing', isZh ? '建立中…' : 'Creating…'),
        };
    }

    return {
        idle: t('posts.form.actions.submit_update', isZh ? '更新公告' : 'Update bulletin'),
        processing: t('posts.form.actions.submit_update_processing', isZh ? '更新中…' : 'Updating…'),
    };
};

export default function PostForm({
    categories,
    cancelUrl,
    mode,
    initialValues,
    initialPreviewHtml = '',
    existingAttachments = [],
    onSubmit,
}: PostFormProps) {
    const { t, isZh } = useTranslator('manage');

    const statusValues: Array<PostFormValues['status']> = ['draft', 'published', 'archived'];
    const statusLabelFallbacks = {
        draft: isZh ? '草稿' : 'Draft',
        published: isZh ? '發布' : 'Published',
        archived: isZh ? '封存' : 'Archived',
    } as const;

    const form = useForm<PostFormValues>({
        title: {
            'zh-TW': initialValues.title['zh-TW'],
            en: initialValues.title.en,
        },
        content: {
            'zh-TW': initialValues.content['zh-TW'],
            en: initialValues.content.en,
        },
        category_id: initialValues.category_id,
        status: initialValues.status,
        pinned: initialValues.pinned,
        publish_at: initialValues.publish_at,
        source_type: initialValues.source_type,
        source_url: initialValues.source_url,
        attachments_files: initialValues.attachments_files ?? [],
        attachments_links: initialValues.attachments_links ?? [],
        attachments_remove: initialValues.attachments_remove ?? [],
    });

    const { data, setData, errors, processing, setError, clearErrors } = form;

    const [pendingFiles, setPendingFiles] = useState<File[]>(data.attachments_files ?? []);
    const [linkInputs, setLinkInputs] = useState<AttachmentLinkInput[]>(data.attachments_links ?? []);
    const [attachmentsToRemove, setAttachmentsToRemove] = useState<number[]>(data.attachments_remove ?? []);

    const [autoSyncTitleEn, setAutoSyncTitleEn] = useState(
        () => initialValues.title.en.trim() === '' || initialValues.title.en === initialValues.title['zh-TW']
    );
    const [autoSyncContentEn, setAutoSyncContentEn] = useState(
        () =>
            initialValues.source_type === 'manual' &&
            (initialValues.content.en.trim() === '' || initialValues.content.en === initialValues.content['zh-TW'])
    );

    const [previewHtml, setPreviewHtml] = useState<string>(initialPreviewHtml);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState<boolean>(false);
    const [previewEmbeddable, setPreviewEmbeddable] = useState<boolean>(true);
    const [previewSource, setPreviewSource] = useState<string>('');
    const publishRef = useRef<HTMLInputElement | null>(null);
    const [publishEl, setPublishEl] = useState<HTMLInputElement | null>(null);
    const publishCallbackRef = useCallback((el: HTMLInputElement | null) => {
        publishRef.current = el;
        setPublishEl(el);
    }, []);

    useEffect(() => {
        if (data.source_type === 'manual') {
            setPreviewHtml('');
            setPreviewError(null);
        }
    }, [data.source_type]);

    useEffect(() => {
        if (!data.source_url.trim()) {
            setPreviewHtml('');
        }
    }, [data.source_url]);

    useEffect(() => {
        setData('attachments_files', pendingFiles);
    }, [pendingFiles, setData]);

    useEffect(() => {
        setData('attachments_links', linkInputs);
    }, [linkInputs, setData]);

    useEffect(() => {
        setData('attachments_remove', attachmentsToRemove);
    }, [attachmentsToRemove, setData]);

    const handleTitleZhChange = (value: string) => {
        const shouldSync = autoSyncTitleEn || data.title.en.trim() === '';
        setData('title', {
            'zh-TW': value,
            en: shouldSync ? value : data.title.en,
        });
        if (autoSyncTitleEn !== shouldSync) {
            setAutoSyncTitleEn(shouldSync);
        }
        if (errors['title.zh-TW']) {
            clearErrors('title.zh-TW');
        }
    };

    const handleTitleEnChange = (value: string) => {
        setData('title', {
            ...data.title,
            en: value,
        });
        const shouldSync = value.trim() === '' || value === data.title['zh-TW'];
        setAutoSyncTitleEn(shouldSync);
    };

    const handleContentZhChange = (value: string) => {
        if (data.source_type !== 'manual') {
            setData('content', {
                ...data.content,
                'zh-TW': value,
            });
            return;
        }

        const shouldSync = autoSyncContentEn || data.content.en.trim() === '';
        setData('content', {
            'zh-TW': value,
            en: shouldSync ? value : data.content.en,
        });
        if (autoSyncContentEn !== shouldSync) {
            setAutoSyncContentEn(shouldSync);
        }
    };

    const handleContentEnChange = (value: string) => {
        setData('content', {
            ...data.content,
            en: value,
        });
        const shouldSync = value.trim() === '' || value === data.content['zh-TW'];
        setAutoSyncContentEn(shouldSync);
    };

    const makeLinkInput = (): AttachmentLinkInput => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: '',
        url: '',
    });

    const handleFilesSelected = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) {
            return;
        }
        const newFiles = Array.from(fileList);
        setPendingFiles((prev) => [...prev, ...newFiles]);
    };

    const handleRemovePendingFile = (index: number) => {
        setPendingFiles((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleLinkInputChange = (id: string, key: 'title' | 'url', value: string) => {
        setLinkInputs((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
        );
    };

    const handleAddLinkInput = () => {
        setLinkInputs((prev) => [...prev, makeLinkInput()]);
    };

    const handleRemoveLinkInput = (id: string) => {
        setLinkInputs((prev) => prev.filter((item) => item.id !== id));
    };

    const toggleRemoveExistingAttachment = (attachmentId: number) => {
        setAttachmentsToRemove((prev) => {
            if (prev.includes(attachmentId)) {
                return prev.filter((id) => id !== attachmentId);
            }
            return [...prev, attachmentId];
        });
    };

    const handleSourceTypeChange = (value: string) => {
        const newValue = value === 'link' ? 'link' : 'manual';

        setData('source_type', newValue);

        if (newValue === 'manual') {
            setData('source_url', '');
            setPreviewHtml('');
            setPreviewError(null);
            setAutoSyncContentEn(true);
        } else {
            setData('content', { ...emptyContent });
            setAutoSyncContentEn(false);
        }
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        const titleZh = data.title['zh-TW'].trim();
        if (titleZh === '') {
            setError('title.zh-TW', t('posts.form.validation.title_zh_required', isZh ? '請輸入中文標題。' : 'Please enter the Chinese title.'));
            return;
        }

        clearErrors('title.zh-TW');

        form.transform((payload) => {
            const payloadTitleZh = payload.title['zh-TW'].trim();
            const payloadTitleEn = payload.title.en.trim() === '' ? payloadTitleZh : payload.title.en.trim();
            const isManual = payload.source_type === 'manual';
            const contentZh = isManual ? payload.content['zh-TW'] : '';
            const contentEn = isManual
                ? (payload.content.en.trim() === '' ? payload.content['zh-TW'] : payload.content.en)
                : '';

            const formData = new FormData();
            formData.append('category_id', payload.category_id ?? '');
            formData.append('status', payload.status);
            formData.append('pinned', payload.pinned ? '1' : '0');
            formData.append('title[zh-TW]', payloadTitleZh);
            formData.append('title[en]', payloadTitleEn);
            formData.append('content[zh-TW]', contentZh);
            formData.append('content[en]', contentEn);
            formData.append('source_type', payload.source_type);
            if (payload.source_type === 'link') {
                formData.append('source_url', payload.source_url ?? '');
            }
            formData.append('publish_at', payload.publish_at ?? '');

            (payload.attachments_files ?? []).forEach((file, index) => {
                if (file) {
                    formData.append(`attachments[files][${index}]`, file);
                }
            });

            (payload.attachments_links ?? []).forEach((link, index) => {
                const url = link.url.trim();
                if (url === '') {
                    return;
                }
                formData.append(`attachments[links][${index}][url]`, url);
                formData.append(`attachments[links][${index}][title]`, link.title?.trim() ?? '');
            });

            (payload.attachments_remove ?? []).forEach((id, index) => {
                formData.append(`attachments[remove][${index}]`, String(id));
            });

            return formData;
        });

        onSubmit(form);
    };

    const handleFetchPreview = () => {
        if (data.source_type !== 'link') return;

        if (!data.source_url.trim()) {
            setPreviewError(t('posts.form.preview.source_required', isZh ? '請先輸入來源網址。' : 'Please provide the source URL first.'));
            return;
        }

        // Reset preview state and open original in new tab
        setPreviewHtml('');
        setPreviewEmbeddable(false);
        setPreviewSource(data.source_url);
        setPreviewError(t('posts.form.preview.opened_new_tab', isZh ? '已在新分頁開啟來源頁面。' : 'Opened the source in a new tab.'));
        window.open(data.source_url, '_blank');
    };

    // Bind showPicker on publishEl using useEffect and cleanup when element changes
    useEffect(() => {
        const el = publishEl;
        if (!el) return;

        const tryShow = () => {
            // @ts-ignore
            if (typeof el.showPicker === 'function') {
                try {
                    // @ts-ignore
                    el.showPicker();
                } catch (e) {
                    // ignore
                }
            }
        };

        el.addEventListener('focus', tryShow);
        el.addEventListener('click', tryShow);

        return () => {
            el.removeEventListener('focus', tryShow);
            el.removeEventListener('click', tryShow);
        };
    }, [publishEl]);

    const submitLabels = useMemo(() => getSubmitLabels(mode, t, isZh), [mode, t, isZh]);

    return (
        <form onSubmit={submit}>
            <div className="space-y-8">
                <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            {t('posts.form.sections.metadata.title', isZh ? '基本資訊' : 'Metadata')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                        <div className="space-y-4">
                            <Label htmlFor="title-zh" className="text-sm font-medium text-gray-900">
                                {t('posts.form.fields.title_zh.label', isZh ? '中文標題' : 'Chinese title')}
                            </Label>
                            <Input
                                id="title-zh"
                                value={data.title['zh-TW']}
                                onChange={(event) => handleTitleZhChange(event.target.value)}
                                placeholder={t('posts.form.fields.title_zh.placeholder', isZh ? '請輸入中文標題' : 'Enter Chinese title')}
                            />
                            <InputError message={errors['title.zh-TW']} />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="title-en" className="text-sm font-medium text-gray-900">
                                {t('posts.form.fields.title_en.label', isZh ? '英文標題' : 'English title')}
                            </Label>
                            <Input
                                id="title-en"
                                value={data.title.en}
                                onChange={(event) => handleTitleEnChange(event.target.value)}
                                placeholder={t('posts.form.fields.title_en.placeholder', isZh ? '請輸入英文標題' : 'Enter English title')}
                            />
                            <InputError message={errors['title.en']} />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="category" className="text-sm font-medium text-gray-900">
                                {t('posts.form.fields.category.label', isZh ? '公告分類' : 'Category')}
                            </Label>
                            <Select
                                id="category"
                                value={data.category_id}
                                onChange={(event) => setData('category_id', event.target.value)}
                            >
                                <option value="">{t('posts.form.fields.category.placeholder', isZh ? '選擇分類' : 'Select category')}</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {isZh ? category.name : category.name_en}
                                    </option>
                                ))}
                            </Select>
                            <InputError message={errors.category_id} />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <Label htmlFor="status" className="text-sm font-medium text-gray-900">
                                    {t('posts.form.fields.status.label', isZh ? '發布狀態' : 'Status')}
                                </Label>
                                <Select
                                    id="status"
                                    value={data.status}
                                    onChange={(event) => setData('status', event.target.value as PostFormValues['status'])}
                                >
                                    <option value="">{t('posts.form.fields.status.placeholder', isZh ? '選擇狀態' : 'Select status')}</option>
                                    {statusValues.map((value) => (
                                        <option key={value} value={value}>
                                            {t(`posts.status.${value}`, statusLabelFallbacks[value])}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="publish_at" className="text-sm font-medium text-gray-900">
                                    {t('posts.form.fields.publish_at.label', isZh ? '預定發布時間' : 'Publish at')}
                                </Label>
                                <Input
                                    id="publish_at"
                                    type="datetime-local"
                                    value={data.publish_at}
                                    onChange={(event) => setData('publish_at', event.target.value)}
                                    ref={publishCallbackRef}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <Checkbox
                                    id="pinned"
                                    checked={data.pinned}
                                    onCheckedChange={(checked) => setData('pinned', Boolean(checked))}
                                />
                                <Label htmlFor="pinned" className="text-sm font-medium text-gray-900">
                                    {t('posts.form.fields.pinned.label', isZh ? '是否置頂' : 'Pin announcement')}
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                        <CardTitle className="text-gray-900">
                            {t('posts.form.sections.content.title', isZh ? '公告內容' : 'Announcement content')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <Label htmlFor="source_type" className="text-sm font-medium text-gray-900">
                                    {t('posts.form.fields.source_type.label', isZh ? '內容來源' : 'Content source')}
                                </Label>
                                <Select
                                    id="source_type"
                                    value={data.source_type}
                                    onChange={(event) => handleSourceTypeChange(event.target.value)}
                                >
                                    <option value="manual">
                                        {t('posts.form.fields.source_type.manual', isZh ? '手動輸入' : 'Manual input')}
                                    </option>
                                    <option value="link">
                                        {t('posts.form.fields.source_type.link', isZh ? '外部連結' : 'External link')}
                                    </option>
                                </Select>
                                <InputError message={errors.source_type} />
                            </div>

                            {data.source_type === 'link' && (
                                <div className="space-y-4">
                                    <Label htmlFor="source_url" className="text-sm font-medium text-gray-900">
                                        {t('posts.form.fields.source_url.label', isZh ? '來源網址' : 'Source URL')}
                                    </Label>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Input
                                            id="source_url"
                                            value={data.source_url}
                                            onChange={(event) => setData('source_url', event.target.value)}
                                            placeholder={t('posts.form.fields.source_url.placeholder', isZh ? '請輸入外部連結' : 'https://example.com/post')}
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleFetchPreview}
                                            disabled={previewLoading}
                                        >
                                            {previewLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    {t('posts.form.preview.reload', isZh ? '重新載入' : 'Reload preview')}
                                                </span>
                                            ) : (
                                                t('posts.show.open_source', isZh ? '前往來源' : 'Open source link')
                                            )}
                                        </Button>
                                    </div>
                                    <InputError message={errors.source_url} />
                                    {previewError && <p className="text-sm text-red-600">{previewError}</p>}
                                </div>
                            )}
                        </div>

                        {data.source_type === 'manual' ? (
                            <>
                                <div className="space-y-4">
                                    <Label htmlFor="content-zh" className="text-sm font-medium text-gray-900">
                                        {t('posts.form.fields.content_zh.label', isZh ? '中文內容' : 'Chinese content')}
                                    </Label>
                                    <Textarea
                                        id="content-zh"
                                        className="min-h-[200px]"
                                        value={data.content['zh-TW']}
                                        onChange={(event) => handleContentZhChange(event.target.value)}
                                        placeholder={t('posts.form.fields.content_zh.placeholder', isZh ? '請輸入中文內容' : 'Enter Chinese content')}
                                    />
                                    <InputError message={errors['content.zh-TW']} />
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="content-en" className="text-sm font-medium text-gray-900">
                                        {t('posts.form.fields.content_en.label', isZh ? '英文內容' : 'English content')}
                                    </Label>
                                    <Textarea
                                        id="content-en"
                                        className="min-h-[200px]"
                                        value={data.content.en}
                                        onChange={(event) => handleContentEnChange(event.target.value)}
                                        placeholder={t('posts.form.fields.content_en.placeholder', isZh ? '請輸入英文內容' : 'Enter English content')}
                                    />
                                    <InputError message={errors['content.en']} />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <Label className="text-sm font-medium text-gray-900">
                                    {t('posts.form.preview.title', isZh ? '來源內容預覽' : 'Source preview')}
                                </Label>
                                <p className="text-sm text-gray-500">
                                    {t(
                                        'posts.form.preview.not_embeddable',
                                        isZh
                                            ? '系統不再儲存外部 HTML，請透過來源連結檢視完整內容。'
                                            : 'Preview cannot be embedded. Open the source in a new tab instead.'
                                    )}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <Paperclip className="h-5 w-5 text-blue-600" />
                            {t('posts.form.sections.attachments.title', isZh ? '附件管理' : 'Attachment management')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-900" htmlFor="attachment-files">
                                {t('posts.form.attachments.upload_button', isZh ? '上傳附件' : 'Upload files')}
                            </Label>
                            <Input
                                id="attachment-files"
                                type="file"
                                multiple
                                onChange={(event) => {
                                    handleFilesSelected(event.target.files);
                                    if (event.target) {
                                        event.target.value = '';
                                    }
                                }}
                            />
                            {pendingFiles.length > 0 && (
                                <ul className="space-y-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm">
                                    {pendingFiles.map((file, index) => (
                                        <li key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between gap-3">
                                            <span className="truncate">
                                                {file.name}{' '}
                                                <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-800"
                                                onClick={() => handleRemovePendingFile(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-900">
                                {t('posts.form.attachments.links_title', isZh ? '外部連結' : 'External links')}
                            </Label>
                            <div className="space-y-4">
                                {linkInputs.length === 0 && (
                                    <p className="text-sm text-gray-500">
                                        {t('posts.form.attachments.links_empty', isZh ? '暫無外部連結。' : 'No external links added yet.')}
                                    </p>
                                )}
                                {linkInputs.map((link) => (
                                    <div key={link.id} className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium text-gray-600">
                                                {t('posts.form.attachments.link_title_label', isZh ? '顯示名稱' : 'Display name')}
                                            </Label>
                                            <Input
                                                value={link.title}
                                                onChange={(event) => handleLinkInputChange(link.id, 'title', event.target.value)}
                                                placeholder={t('posts.form.attachments.link_title_sample', isZh ? '例如：申請表下載' : 'e.g. Application form')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium text-gray-600">
                                                {t('posts.form.attachments.link_url_label', 'URL')}
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={link.url}
                                                    onChange={(event) => handleLinkInputChange(link.id, 'url', event.target.value)}
                                                    placeholder={t('posts.form.attachments.link_url_placeholder', 'https://example.com/file.pdf')}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={() => handleRemoveLinkInput(link.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={handleAddLinkInput}
                                >
                                    <Plus className="h-4 w-4" />
                                    {t('posts.form.attachments.add_link', isZh ? '新增外部連結' : 'Add external link')}
                                </Button>
                            </div>
                        </div>

                        {existingAttachments.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-900">
                                    {t('posts.form.attachments.existing_title', isZh ? '既有附件' : 'Existing attachments')}
                                </Label>
                                <ul className="space-y-2">
                                    {existingAttachments.map((attachment) => {
                                        const markedForRemoval = attachmentsToRemove.includes(attachment.id);
                                        return (
                                            <li
                                                key={attachment.id}
                                                className={cn(
                                                    'flex flex-col gap-2 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between',
                                                    markedForRemoval && 'border-red-200 bg-red-50'
                                                )}
                                            >
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {attachment.title ?? attachment.file_url ?? attachment.external_url ?? `#${attachment.id}`}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                        <span className="inline-flex items-center gap-1">
                                                            <LinkIcon className="h-4 w-4" />
                                                            {attachment.type}
                                                        </span>
                                                        {attachment.file_url && (
                                                            <a
                                                                href={attachment.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                {t('posts.form.attachments.actions.preview', isZh ? '預覽檔案' : 'View file')}
                                                            </a>
                                                        )}
                                                        {attachment.external_url && (
                                                            <a
                                                                href={attachment.external_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                {attachment.external_url}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant={markedForRemoval ? 'default' : 'outline'}
                                                    size="sm"
                                                    className={cn(
                                                        'flex items-center gap-2',
                                                        markedForRemoval ? 'bg-red-600 text-white hover:bg-red-700' : 'text-red-600 hover:text-red-800'
                                                    )}
                                                    onClick={() => toggleRemoveExistingAttachment(attachment.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {markedForRemoval
                                                        ? t('posts.form.attachments.actions.undo_remove', isZh ? '取消刪除' : 'Undo remove')
                                                        : t('posts.form.attachments.actions.remove', isZh ? '移除' : 'Remove')}
                                                </Button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end space-x-4 rounded-lg border border-gray-200 bg-white p-6">
                    <Link href={cancelUrl}>
                        <Button type="button" variant="secondary" className="rounded-full border border-[#151f54]/20">
                            {t('posts.form.actions.cancel', isZh ? '取消' : 'Cancel')}
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="rounded-full bg-[#151f54] px-6 text-white shadow-sm transition duration-200 hover:bg-[#1f2a6d] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? submitLabels.processing : submitLabels.idle}
                    </Button>
                </div>
            </div>
        </form>
    );
}

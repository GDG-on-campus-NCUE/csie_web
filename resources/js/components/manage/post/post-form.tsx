import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { InertiaFormProps, Link, useForm } from '@inertiajs/react';
import { Calendar, FileText, Image as ImageIcon, Link2, Loader2, Paperclip, Plus, Trash2 } from 'lucide-react';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useTranslator } from '@/hooks/use-translator';

interface CategoryOption {
    id: number;
    name: string;
    name_en: string;
    slug: string;
}

interface AttachmentSummary {
    id: number;
    type: 'image' | 'document' | 'link';
    title: string | null;
    file_url: string | null;
    external_url: string | null;
    mime_type: string | null;
}

interface TagOption {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
}

type RawTagOption = TagOption | TagOption[];

export interface PostResource {
    id?: number;
    title?: string;
    title_en?: string | null;
    slug?: string | null;
    category_id?: number | null;
    excerpt?: string | null;
    excerpt_en?: string | null;
    content?: string | null;
    content_en?: string | null;
    status?: 'draft' | 'published' | 'scheduled';
    publish_at?: string | null;
    tags?: string[] | null;
    featured_image_url?: string | null;
    attachments?: AttachmentSummary[];
}

export type PostFormSubmitHandler = (form: InertiaFormProps<PostFormForm>) => void;

interface PostFormProps {
    mode: 'create' | 'edit';
    cancelUrl: string;
    categories: CategoryOption[];
    statusOptions: Array<'draft' | 'published' | 'scheduled'>;
    post?: PostResource;
    onSubmit: PostFormSubmitHandler;
    availableTags?: RawTagOption[];
}

interface AttachmentLinkInput {
    id: string;
    title: string;
    url: string;
}

interface PostFormForm {
    title: string;
    title_en: string;
    slug: string;
    category_id: string;
    excerpt: string;
    excerpt_en: string;
    content: string;
    content_en: string;
    status: 'draft' | 'published' | 'scheduled';
    publish_at: string;
    tags: string;
    featured_image: File | null;
    remove_featured_image: boolean;
    attachments: {
        files: File[];
        links: AttachmentLinkInput[];
        remove: number[];
    };
}

const statusFallbackLabels: Record<'draft' | 'published' | 'scheduled', { zh: string; en: string }> = {
    draft: { zh: '草稿', en: 'Draft' },
    published: { zh: '已發布', en: 'Published' },
    scheduled: { zh: '排程中', en: 'Scheduled' },
};

const statusDescriptionFallback: Record<'draft' | 'published' | 'scheduled', { zh: string; en: string }> = {
    draft: { zh: '儲存為草稿，僅供後台檢視。', en: 'Save as draft. Only visible to you.' },
    published: { zh: '立即公開並顯示於公告列表。', en: 'Publish immediately and show in the announcement list.' },
    scheduled: { zh: '設定時間後自動發布。', en: 'Automatically publish at the scheduled time.' },
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

const formatDateTime = (value: string | null | undefined) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const createLinkId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export default function PostForm({
    mode,
    cancelUrl,
    categories,
    statusOptions,
    post,
    onSubmit,
    availableTags = [],
}: PostFormProps) {
    const { t, localeKey } = useTranslator('manage');
    const fallbackLanguage: 'zh' | 'en' = localeKey === 'zh-TW' ? 'zh' : 'en';
    // 依照當前語系提供對應的預設文字，避免英文介面出現中文字串。
    const fallbackText = (zh: string, en: string) => (fallbackLanguage === 'zh' ? zh : en);
    const initialStatus = useMemo(() => {
        if (post?.status && statusOptions.includes(post.status)) {
            return post.status;
        }
        return statusOptions[0] ?? 'draft';
    }, [post?.status, statusOptions]);

    const form = useForm<PostFormForm>({
        title: post?.title ?? '',
        title_en: post?.title_en ?? '',
        slug: post?.slug ?? '',
        category_id: post?.category_id ? String(post.category_id) : '',
        excerpt: post?.excerpt ?? '',
        excerpt_en: post?.excerpt_en ?? '',
        content: post?.content ?? '',
        content_en: post?.content_en ?? '',
        status: initialStatus,
        publish_at: formatDateTime(post?.publish_at),
        tags: Array.isArray(post?.tags) ? post?.tags.join(', ') : '',
        featured_image: null,
        remove_featured_image: false,
        attachments: {
            files: [],
            links: [],
            remove: [],
        },
    });

    const { data, setData, processing, errors } = form;

    const [linkInputs, setLinkInputs] = useState<AttachmentLinkInput[]>([]);

    const existingAttachments = post?.attachments ?? [];

    const normalizedAvailableTags = useMemo(() => {
        return (availableTags ?? [])
            .map((tag) => Array.isArray(tag) ? tag[0] : tag)
            .filter((tag): tag is TagOption => Boolean(tag));
    }, [availableTags]);

    const selectedTags = useMemo(() => {
        const items = (data.tags ?? '')
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value.length > 0);

        return Array.from(new Set(items));
    }, [data.tags]);

    const toggleTag = (tagName: string) => {
        const value = tagName.trim();
        if (value === '') {
            return;
        }

        if (selectedTags.includes(value)) {
            const next = selectedTags.filter((item) => item !== value);
            setData('tags', next.join(', '));
            return;
        }

        setData('tags', [...selectedTags, value].join(', '));
    };

    const isTagSelected = (tagName: string) => selectedTags.includes(tagName.trim());

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.transform((formData) => ({
            ...formData,
            attachments: {
                ...formData.attachments,
                links: linkInputs,
            },
        }));
        onSubmit(form);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        setData('attachments', {
            ...data.attachments,
            files,
        });
    };

    const handleFeaturedChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setData('featured_image', file);
        if (file) {
            setData('remove_featured_image', false);
        }
    };

    const handleLinkInputChange = (id: string, key: 'title' | 'url', value: string) => {
        setLinkInputs((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
        );
    };

    const addLinkInput = () => {
        setLinkInputs((prev) => [
            ...prev,
            { id: createLinkId(), title: '', url: '' },
        ]);
    };

    const removeLinkInput = (id: string) => {
        setLinkInputs((prev) => prev.filter((item) => item.id !== id));
    };

    const toggleRemoveAttachment = (attachmentId: number) => {
        const shouldRemove = data.attachments.remove.includes(attachmentId);
        setData('attachments', {
            ...data.attachments,
            remove: shouldRemove
                ? data.attachments.remove.filter((id) => id !== attachmentId)
                : [...data.attachments.remove, attachmentId],
        });
    };

    const statusDescription = (status: 'draft' | 'published' | 'scheduled') =>
        t(
            `posts.form.status_description.${status}`,
            statusDescriptionFallback[status][fallbackLanguage]
        );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border border-slate-200 bg-white shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900">
                        {t(
                            'posts.form.sections.metadata.title',
                            fallbackText('公告基本資料', 'Announcement details')
                        )}
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                        {t(
                            'posts.form.sections.metadata.description',
                            fallbackText('設定公告分類、狀態與排程時間。', 'Configure category, status, and schedule.')
                        )}
                    </p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="post-title">
                            {t(
                                'posts.form.fields.title_zh.label',
                                fallbackText('公告標題', 'Announcement title')
                            )}
                            <span className="text-rose-500"> *</span>
                        </Label>
                        <Input
                            id="post-title"
                            value={data.title}
                            onChange={(event) => setData('title', event.target.value)}
                            placeholder={t(
                                'posts.form.fields.title_zh.placeholder',
                                fallbackText('請輸入中文標題', 'Enter announcement title')
                            )}
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="post-title-en">
                            {t(
                                'posts.form.fields.title_en.label',
                                fallbackText('公告標題（英文）', 'Announcement title (English)')
                            )}
                        </Label>
                        <Input
                            id="post-title-en"
                            value={data.title_en}
                            onChange={(event) => setData('title_en', event.target.value)}
                            placeholder={t(
                                'posts.form.fields.title_en.placeholder',
                                fallbackText('請輸入英文標題', 'Enter announcement title in English')
                            )}
                        />
                        <InputError message={errors.title_en as string | undefined} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="post-slug">
                                {t(
                                    'posts.form.fields.slug.label',
                                    fallbackText('網址 Slug', 'URL slug')
                                )}
                            </Label>
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-sm text-slate-600 hover:text-slate-900"
                                onClick={() => setData('slug', slugify(data.title))}
                            >
                                {t(
                                    'posts.form.fields.slug.generate',
                                    fallbackText('以標題產生', 'Generate from title')
                                )}
                            </Button>
                        </div>
                        <Input
                            id="post-slug"
                            value={data.slug}
                            onChange={(event) => setData('slug', event.target.value)}
                            placeholder={t('posts.form.fields.slug.placeholder', 'custom-slug')}
                        />
                        <InputError message={errors.slug} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="post-category">
                            {t(
                                'posts.form.fields.category.label',
                                fallbackText('公告分類', 'Announcement category')
                            )}
                            <span className="text-rose-500"> *</span>
                        </Label>
                        <Select
                            id="post-category"
                            value={data.category_id}
                            onChange={(event) => setData('category_id', event.target.value)}
                        >
                            <option value="">
                                {t(
                                    'posts.form.fields.category.placeholder',
                                    fallbackText('選擇分類', 'Select category')
                                )}
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {localeKey === 'zh-TW'
                                        ? category.name
                                        : category.name_en || category.name}
                                </option>
                            ))}
                        </Select>
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="post-tags">
                            {t('posts.form.fields.tags.label', fallbackText('標籤', 'Tags'))}
                        </Label>
                        <Input
                            id="post-tags"
                            value={data.tags}
                            onChange={(event) => setData('tags', event.target.value)}
                            placeholder={t(
                                'posts.form.fields.tags.placeholder',
                                fallbackText('以逗號分隔，如：系所公告, 活動', 'Separate with commas, e.g. Department, Event')
                            )}
                        />
                        <p className="text-xs text-slate-500">
                            {t(
                                'posts.form.fields.tags.helper',
                                fallbackText('使用逗號分隔多個標籤。', 'Use commas to separate multiple tags.')
                            )}
                        </p>
                        {normalizedAvailableTags.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-500">
                                    {t(
                                        'posts.form.fields.tags.suggestions_title',
                                        fallbackText('常用標籤', 'Suggested tags')
                                    )}{' '}
                                    <span className="font-normal text-slate-400">
                                        {t(
                                            'posts.form.fields.tags.suggestions_hint',
                                            fallbackText('點擊即可加入或移除。', 'Click to add or remove.')
                                        )}
                                    </span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {normalizedAvailableTags.map((tag) => {
                                        const selected = isTagSelected(tag.name);
                                        return (
                                            <Button
                                                key={tag.id}
                                                type="button"
                                                size="sm"
                                                variant={selected ? 'default' : 'outline'}
                                                className={selected ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}
                                                aria-pressed={selected}
                                                title={tag.description ?? undefined}
                                                onClick={() => toggleTag(tag.name)}
                                            >
                                                #{tag.name}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <InputError message={errors.tags as string | undefined} />
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="post-excerpt">
                                    {t('posts.form.fields.excerpt.label', fallbackText('摘要', 'Summary'))}
                                </Label>
                                <Textarea
                                    id="post-excerpt"
                                    value={data.excerpt}
                                    onChange={(event) => setData('excerpt', event.target.value)}
                                    rows={3}
                                    placeholder={t(
                                        'posts.form.fields.excerpt.placeholder',
                                        fallbackText('簡短摘要，方便在列表顯示', 'Short summary for list display')
                                    )}
                                />
                                <InputError message={errors.excerpt} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="post-excerpt-en">
                                    {t(
                                        'posts.form.fields.excerpt_en.label',
                                        fallbackText('摘要（英文）', 'Summary (English)')
                                    )}
                                </Label>
                                <Textarea
                                    id="post-excerpt-en"
                                    value={data.excerpt_en}
                                    onChange={(event) => setData('excerpt_en', event.target.value)}
                                    rows={3}
                                    placeholder={t(
                                        'posts.form.fields.excerpt_en.placeholder',
                                        fallbackText('請輸入英文摘要', 'Enter summary in English')
                                    )}
                                />
                                <InputError message={errors.excerpt_en as string | undefined} />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="post-content">
                                    {t(
                                        'posts.form.fields.content_zh.label',
                                        fallbackText('公告內容', 'Announcement content')
                                    )}
                                    <span className="text-rose-500"> *</span>
                                </Label>
                                <Textarea
                                    id="post-content"
                                    value={data.content}
                                    onChange={(event) => setData('content', event.target.value)}
                                    rows={12}
                                    placeholder={t(
                                        'posts.form.fields.content_zh.placeholder',
                                        fallbackText('支援 HTML 片段，將自動進行安全清理', 'HTML snippets are supported and will be sanitized automatically')
                                    )}
                                />
                                <InputError message={errors.content} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="post-content-en">
                                    {t(
                                        'posts.form.fields.content_en.label',
                                        fallbackText('公告內容（英文）', 'Announcement content (English)')
                                    )}
                                </Label>
                                <Textarea
                                    id="post-content-en"
                                    value={data.content_en}
                                    onChange={(event) => setData('content_en', event.target.value)}
                                    rows={12}
                                    placeholder={t(
                                        'posts.form.fields.content_en.placeholder',
                                        fallbackText('請輸入英文內容，將同樣進行安全清理', 'Enter the English content; HTML snippets will also be sanitized')
                                    )}
                                />
                                <InputError message={errors.content_en as string | undefined} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900">
                        {t(
                            'posts.form.sections.schedule.title',
                            fallbackText('發布設定', 'Publishing settings')
                        )}
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                        {t(
                            'posts.form.sections.schedule.description',
                            fallbackText('調整公告狀態與排程時間，掌握發佈節奏。', 'Adjust status and schedule to control publication.')
                        )}
                    </p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="post-status">
                            {t(
                                'posts.form.fields.status.label',
                                fallbackText('發布狀態', 'Publication status')
                            )}
                            <span className="text-rose-500"> *</span>
                        </Label>
                        <Select
                            id="post-status"
                            value={data.status}
                            onChange={(event) => setData('status', event.target.value as PostFormForm['status'])}
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {t(
                                        `posts.status.${status}`,
                                        statusFallbackLabels[status][fallbackLanguage]
                                    )}
                                </option>
                            ))}
                        </Select>
                        <p className="flex items-center gap-2 text-xs text-slate-500">
                            <FileText className="h-3.5 w-3.5" />
                            {statusDescription(data.status)}
                        </p>
                        <InputError message={errors.status} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="post-publish-at">
                            {t(
                                'posts.form.fields.publish_at.label',
                                fallbackText('預定發布時間', 'Scheduled publish time')
                            )}
                        </Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                type="datetime-local"
                                id="post-publish-at"
                                className="pl-9"
                                value={data.publish_at}
                                onChange={(event) => setData('publish_at', event.target.value)}
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            {t(
                                'posts.form.fields.publish_at.helper',
                                fallbackText('可選擇排程時間（系統時區）。', 'Optional schedule time (system timezone).')
                            )}
                        </p>
                        <InputError message={errors.publish_at} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900">
                        {t(
                            'posts.form.sections.attachments.title',
                            fallbackText('主圖與附件', 'Featured image and attachments')
                        )}
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                        {t(
                            'posts.form.sections.attachments.description',
                            fallbackText('上傳檔案或新增外部連結，供公告使用。', 'Upload files or add external links for the announcement.')
                        )}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="post-featured-image">
                                {t(
                                    'posts.form.attachments.featured.label',
                                    fallbackText('主視覺', 'Featured image')
                                )}
                            </Label>
                            <Input
                                id="post-featured-image"
                                type="file"
                                accept="image/*"
                                onChange={handleFeaturedChange}
                            />
                            <p className="text-xs text-slate-500">
                                {t(
                                    'posts.form.attachments.featured.helper',
                                    fallbackText('建議使用 16:9 圖片作為公告主圖。', 'Use a 16:9 image as the cover.')
                                )}
                            </p>
                            <InputError message={errors.featured_image} />
                            {post?.featured_image_url && (
                                <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4 text-slate-600" />
                                        <a
                                            className="text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
                                            href={post.featured_image_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {t(
                                                'posts.form.attachments.featured.current',
                                                fallbackText('目前主圖', 'Current featured image')
                                            )}
                                        </a>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-xs text-rose-600 hover:text-rose-700"
                                        onClick={() => setData('remove_featured_image', !data.remove_featured_image)}
                                    >
                                        {data.remove_featured_image
                                            ? t(
                                                  'posts.form.attachments.featured.restore',
                                                  fallbackText('保留主圖', 'Keep image')
                                              )
                                            : t(
                                                  'posts.form.attachments.featured.remove',
                                                  fallbackText('移除主圖', 'Remove image')
                                              )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="post-attachments">
                                {t(
                                    'posts.form.attachments.upload_button',
                                    fallbackText('上傳附件', 'Upload attachments')
                                )}
                            </Label>
                            <Input
                                id="post-attachments"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-slate-500">
                                {t(
                                    'posts.form.attachments.upload_helper',
                                    fallbackText('支援多檔案（單檔 20MB 以內）。', 'Multiple files supported (up to 20MB each).')
                                )}
                            </p>
                            <InputError message={errors['attachments.files'] as string | undefined} />
                        </div>
                    </div>

                    {data.attachments.files.length > 0 && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="mb-2 flex items-center gap-2 font-medium text-slate-800">
                                <Paperclip className="h-4 w-4" />
                                {t(
                                    'posts.form.attachments.pending_files',
                                    fallbackText('即將上傳的檔案（:count）', 'Files to upload (:count)'),
                                    { count: data.attachments.files.length }
                                )}
                            </p>
                            <ul className="space-y-1">
                                {data.attachments.files.map((file) => (
                                    <li key={file.name}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                <Link2 className="h-4 w-4" />
                                {t(
                                    'posts.form.attachments.links_title',
                                    fallbackText('外部連結', 'External links')
                                )}
                            </h3>
                            <Button type="button" variant="outline" size="sm" onClick={addLinkInput}>
                                <Plus className="mr-1 h-4 w-4" />
                                {t('posts.form.attachments.add_link', fallbackText('新增連結', 'Add link'))}
                            </Button>
                        </div>

                        {linkInputs.length === 0 && (
                            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                {t(
                                    'posts.form.attachments.links_empty',
                                    fallbackText('尚未新增連結附件。', 'No link attachments added yet.')
                                )}
                            </p>
                        )}

                        <div className="space-y-3">
                            {linkInputs.map((link) => (
                                <div
                                    key={link.id}
                                    className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr,1fr,auto]"
                                >
                                    <Input
                                        placeholder={t(
                                            'posts.form.attachments.link_title_placeholder',
                                            fallbackText('連結標題', 'Link title')
                                        )}
                                        value={link.title}
                                        onChange={(event) => handleLinkInputChange(link.id, 'title', event.target.value)}
                                    />
                                    <Input
                                        placeholder={t('posts.form.attachments.link_url_placeholder', 'https://example.com')}
                                        value={link.url}
                                        onChange={(event) => handleLinkInputChange(link.id, 'url', event.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-rose-600 hover:bg-rose-50"
                                        onClick={() => removeLinkInput(link.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <InputError message={errors['attachments.links'] as string | undefined} />
                    </div>

                    {existingAttachments.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                <Paperclip className="h-4 w-4" />
                                {t(
                                    'posts.form.attachments.existing_title',
                                    fallbackText('既有附件', 'Existing attachments')
                                )}
                            </h3>
                            <div className="space-y-2">
                                {existingAttachments.map((attachment) => {
                                    const removeChecked = data.attachments.remove.includes(attachment.id);
                                    return (
                                        <label
                                            key={attachment.id}
                                            className={cn(
                                                'flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition',
                                                removeChecked
                                                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                                                    : 'border-slate-200 bg-white text-slate-700'
                                            )}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium">
                                                    {attachment.title ??
                                                        t(
                                                            'posts.form.attachments.unnamed',
                                                            fallbackText('未命名附件', 'Untitled attachment')
                                                        )}
                                                </span>
                                                {attachment.file_url && (
                                                    <a
                                                        className="text-xs text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
                                                        href={attachment.file_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        {t(
                                                            'posts.form.attachments.actions.preview',
                                                            fallbackText('預覽檔案', 'Preview file')
                                                        )}
                                                    </a>
                                                )}
                                                {attachment.external_url && (
                                                    <a
                                                        className="text-xs text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
                                                        href={attachment.external_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        {attachment.external_url}
                                                    </a>
                                                )}
                                            </div>
                                            <Checkbox
                                                checked={removeChecked}
                                                aria-label={t(
                                                    'posts.form.attachments.actions.remove',
                                                    fallbackText('移除', 'Remove')
                                                )}
                                                onCheckedChange={() => toggleRemoveAttachment(attachment.id)}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button asChild variant="ghost" className="text-slate-500 hover:text-slate-700">
                    <Link href={cancelUrl}>
                        {t('posts.form.actions.cancel', fallbackText('取消', 'Cancel'))}
                    </Link>
                </Button>
                <Button
                    type="submit"
                    className="rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800"
                    disabled={processing}
                >
                    {processing ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t(
                                `posts.form.actions.${mode === 'create' ? 'submit_create_processing' : 'submit_update_processing'}`,
                                mode === 'create'
                                    ? fallbackText('建立中…', 'Creating…')
                                    : fallbackText('更新中…', 'Updating…')
                            )}
                        </span>
                    ) : (
                        t(
                            `posts.form.actions.${mode === 'create' ? 'submit_create' : 'submit_update'}`,
                            mode === 'create'
                                ? fallbackText('建立公告', 'Create announcement')
                                : fallbackText('更新公告', 'Update announcement')
                        )
                    )}
                </Button>
            </div>
        </form>
    );
}

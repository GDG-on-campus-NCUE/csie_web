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

export interface PostResource {
    id?: number;
    title?: string;
    slug?: string | null;
    category_id?: number | null;
    excerpt?: string | null;
    content?: string | null;
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
}

interface AttachmentLinkInput {
    id: string;
    title: string;
    url: string;
}

interface PostFormForm {
    title: string;
    slug: string;
    category_id: string;
    excerpt: string;
    content: string;
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

const statusLabels: Record<'draft' | 'published' | 'scheduled', { zh: string; en: string }> = {
    draft: { zh: '草稿', en: 'Draft' },
    published: { zh: '已發布', en: 'Published' },
    scheduled: { zh: '排程中', en: 'Scheduled' },
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

export default function PostForm({ mode, cancelUrl, categories, statusOptions, post, onSubmit }: PostFormProps) {
    const initialStatus = useMemo(() => {
        if (post?.status && statusOptions.includes(post.status)) {
            return post.status;
        }
        return statusOptions[0] ?? 'draft';
    }, [post?.status, statusOptions]);

    const form = useForm<PostFormForm>({
        title: post?.title ?? '',
        slug: post?.slug ?? '',
        category_id: post?.category_id ? String(post.category_id) : '',
        excerpt: post?.excerpt ?? '',
        content: post?.content ?? '',
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

    const statusDescription = (status: 'draft' | 'published' | 'scheduled') => {
        switch (status) {
            case 'published':
                return '立即公開並顯示於公告列表。';
            case 'scheduled':
                return '設定時間後自動發布。';
            default:
                return '保存為草稿，僅供後台檢視。';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-0 shadow-sm ring-1 ring-black/5">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-semibold text-[#151f54]">公告基本資料</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="post-title">公告標題 *</Label>
                        <Input
                            id="post-title"
                            value={data.title}
                            onChange={(event) => setData('title', event.target.value)}
                            placeholder="輸入公告標題"
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="post-slug">網址 Slug</Label>
                            <button
                                type="button"
                                className="text-sm text-[#151f54] underline-offset-4 hover:underline"
                                onClick={() => setData('slug', slugify(data.title))}
                            >
                                以標題產生
                            </button>
                        </div>
                        <Input
                            id="post-slug"
                            value={data.slug}
                            onChange={(event) => setData('slug', event.target.value)}
                            placeholder="custom-slug"
                        />
                        <InputError message={errors.slug} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="post-category">公告分類 *</Label>
                        <Select
                            id="post-category"
                            value={data.category_id}
                            onChange={(event) => setData('category_id', event.target.value)}
                        >
                            <option value="">請選擇分類</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </Select>
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="post-tags">標籤</Label>
                        <Input
                            id="post-tags"
                            value={data.tags}
                            onChange={(event) => setData('tags', event.target.value)}
                            placeholder="以逗號分隔，如：系所公告, 活動"
                        />
                        <p className="text-xs text-slate-500">使用逗號分隔多個標籤。</p>
                        <InputError message={errors.tags as string | undefined} />
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                        <Label htmlFor="post-excerpt">摘要</Label>
                        <Textarea
                            id="post-excerpt"
                            value={data.excerpt}
                            onChange={(event) => setData('excerpt', event.target.value)}
                            rows={3}
                            placeholder="簡短摘要，方便在列表顯示"
                        />
                        <InputError message={errors.excerpt} />
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                        <Label htmlFor="post-content">公告內容 *</Label>
                        <Textarea
                            id="post-content"
                            value={data.content}
                            onChange={(event) => setData('content', event.target.value)}
                            rows={12}
                            placeholder="支援 HTML 片段，將自動進行安全清理"
                        />
                        <InputError message={errors.content} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm ring-1 ring-black/5">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-semibold text-[#151f54]">發布設定</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="post-status">發布狀態 *</Label>
                        <Select
                            id="post-status"
                            value={data.status}
                            onChange={(event) => setData('status', event.target.value as PostFormForm['status'])}
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {statusLabels[status].zh}
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
                        <Label htmlFor="post-publish-at">排程時間</Label>
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
                            排程狀態需設定未來時間，未填則以立即發布時間為準。
                        </p>
                        <InputError message={errors.publish_at} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm ring-1 ring-black/5">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-semibold text-[#151f54]">主圖與附件</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="post-featured-image">主視覺</Label>
                            <Input
                                id="post-featured-image"
                                type="file"
                                accept="image/*"
                                onChange={handleFeaturedChange}
                            />
                            <InputError message={errors.featured_image} />
                            {post?.featured_image_url && (
                                <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4 text-[#151f54]" />
                                        <a
                                            className="text-[#151f54] underline-offset-4 hover:underline"
                                            href={post.featured_image_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            目前主圖
                                        </a>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-xs text-rose-600 hover:underline"
                                        onClick={() => setData('remove_featured_image', !data.remove_featured_image)}
                                    >
                                        {data.remove_featured_image ? '保留主圖' : '移除主圖'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="post-attachments">上傳附件</Label>
                            <Input
                                id="post-attachments"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-slate-500">支援多檔案（單檔 20MB 以內）。</p>
                            <InputError message={errors['attachments.files'] as string | undefined} />
                        </div>
                    </div>

                    {data.attachments.files.length > 0 && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="mb-2 flex items-center gap-2 font-medium text-[#151f54]">
                                <Paperclip className="h-4 w-4" />
                                即將上傳的檔案
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
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#151f54]">
                                <Link2 className="h-4 w-4" /> 連結附件
                            </h3>
                            <Button type="button" variant="outline" size="sm" onClick={addLinkInput}>
                                <Plus className="mr-1 h-4 w-4" /> 新增連結
                            </Button>
                        </div>

                        {linkInputs.length === 0 && (
                            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                尚未新增連結附件。
                            </p>
                        )}

                        <div className="space-y-3">
                            {linkInputs.map((link) => (
                                <div
                                    key={link.id}
                                    className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr,1fr,auto]"
                                >
                                    <Input
                                        placeholder="顯示文字"
                                        value={link.title}
                                        onChange={(event) => handleLinkInputChange(link.id, 'title', event.target.value)}
                                    />
                                    <Input
                                        placeholder="https://example.com"
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
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#151f54]">
                                <Paperclip className="h-4 w-4" /> 既有附件
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
                                                <span className="font-medium">{attachment.title ?? '未命名附件'}</span>
                                                {attachment.file_url && (
                                                    <a
                                                        className="text-xs text-[#151f54] underline-offset-4 hover:underline"
                                                        href={attachment.file_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        檢視檔案
                                                    </a>
                                                )}
                                                {attachment.external_url && (
                                                    <a
                                                        className="text-xs text-[#151f54] underline-offset-4 hover:underline"
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
                    <Link href={cancelUrl}>取消</Link>
                </Button>
                <Button
                    type="submit"
                    className="bg-[#151f54] px-6 text-white hover:bg-[#1f2a6d]"
                    disabled={processing}
                >
                    {processing ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            處理中…
                        </span>
                    ) : mode === 'create' ? (
                        '建立公告'
                    ) : (
                        '更新公告'
                    )}
                </Button>
            </div>
        </form>
    );
}

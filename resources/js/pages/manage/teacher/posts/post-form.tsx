import { useMemo, useRef, useState } from 'react';

import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import { Head, Link, useForm } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { ArrowLeft, CalendarRange, Paperclip, Plus, Trash2 } from 'lucide-react';

type OptionItem<T extends string | number = string> = {
    value: T;
    label: string;
};

type FormOptions = {
    statuses: OptionItem<string>[];
    categories: OptionItem<number>[];
    spaces: OptionItem<number>[];
};

type AvailableTag = {
    id: number;
    name: string;
    slug: string | null;
};

type ExistingAttachment = {
    id: number;
    title: string | null;
    filename?: string | null;
    file_url?: string | null;
    mime_type?: string | null;
    size?: number | null;
};

type TeacherPostPayload = {
    id?: number;
    title: string;
    slug: string;
    status: string;
    category_id: number | null;
    space_id: number | null;
    summary: string | null;
    content: string;
    target_audience: string | null;
    course_start_at: string | null;
    course_end_at: string | null;
    published_at: string | null;
    tags: Array<{
        id: number;
        name: string;
        slug?: string | null;
    }>;
    attachments: ExistingAttachment[];
};

type TeacherPostFormData = {
    title: string;
    slug: string;
    status: string;
    category_id: string;
    space_id: string;
    target_audience: string;
    course_start_at: string;
    course_end_at: string;
    published_at: string;
    summary: string;
    content: string;
    tags: string;
    attachments: File[];
    keep_attachment_ids: number[];
};

type TeacherPostFormProps = {
    mode: 'create' | 'edit';
    post?: TeacherPostPayload | null;
    availableTags: AvailableTag[];
    formOptions: FormOptions;
    breadcrumbs: BreadcrumbItem[];
    pageTitle: string;
    description: string;
};

const toInputDateTime = (value?: string | null): string => {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

    return offsetDate.toISOString().slice(0, 16);
};

const mergeTagNames = (tags: Array<{ name: string }> = []): string => {
    return tags.map((tag) => tag.name).join(', ');
};

export default function TeacherPostForm({
    mode,
    post = null,
    availableTags,
    formOptions,
    breadcrumbs,
    pageTitle,
    description,
}: TeacherPostFormProps) {
    const isEditMode = mode === 'edit' && post !== null;
    const { t: tTeacher } = useTranslator('manage.teacher.posts');
    const { t } = useTranslator('manage');

    const defaultFormData: TeacherPostFormData = useMemo(() => ({
        title: post?.title ?? '',
        slug: post?.slug ?? '',
        status: post?.status ?? (formOptions.statuses[0]?.value ?? 'draft'),
        category_id: post?.category_id ? String(post.category_id) : '',
        space_id: post?.space_id ? String(post.space_id) : '',
        target_audience: post?.target_audience ?? '',
        course_start_at: toInputDateTime(post?.course_start_at ?? null),
        course_end_at: toInputDateTime(post?.course_end_at ?? null),
        published_at: toInputDateTime(post?.published_at ?? null),
        summary: post?.summary ?? '',
        content: post?.content ?? '',
        tags: mergeTagNames(post?.tags ?? []),
        attachments: [],
        keep_attachment_ids: (post?.attachments ?? []).map((attachment) => attachment.id),
    }), [post, formOptions.statuses]);

    const form = useForm<TeacherPostFormData>(defaultFormData);
    const { data, setData, processing, errors, reset, clearErrors } = form;

    const [newFiles, setNewFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const existingAttachments = useMemo<ExistingAttachment[]>(() => post?.attachments ?? [], [post]);

    const toggleKeepAttachment = (attachmentId: number, keep: boolean) => {
        setData('keep_attachment_ids', keep
            ? Array.from(new Set([...data.keep_attachment_ids, attachmentId]))
            : data.keep_attachment_ids.filter((id) => id !== attachmentId));
    };

    const handleInputChange = (field: keyof TeacherPostFormData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setData(field, event.target.value);
    };

    const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files ? Array.from(event.target.files) : [];
        if (files.length === 0) {
            return;
        }

        const nextFiles = [...newFiles, ...files];
        setNewFiles(nextFiles);
        setData('attachments', nextFiles);
        clearErrors('attachments');
        event.target.value = '';
    };

    const removeNewFile = (index: number) => {
        const next = newFiles.filter((_, idx) => idx !== index);
        setNewFiles(next);
        setData('attachments', next);
    };

    const appendTag = (tagName: string) => {
        const current = data.tags ? data.tags.split(',') : [];
        if (current.map((tag) => tag.trim()).includes(tagName)) {
            return;
        }

        const next = [...current, tagName].filter(Boolean).map((tag) => tag.trim()).join(', ');
        setData('tags', next);
    };

    const normalizePayload = (overrideStatus?: string) => {
        const {
            title,
            slug,
            status,
            category_id,
            space_id,
            target_audience,
            course_start_at,
            course_end_at,
            published_at,
            summary,
            content,
            tags,
            attachments,
            keep_attachment_ids,
        } = data;

        const payload: Record<string, unknown> = {
            title: title.trim(),
            slug: slug.trim(),
            status: overrideStatus ?? status,
            category_id: category_id ? Number(category_id) : null,
            space_id: space_id ? Number(space_id) : null,
            target_audience: target_audience.trim() || null,
            course_start_at: course_start_at || null,
            course_end_at: course_end_at || null,
            published_at: published_at || null,
            summary: summary,
            content,
            tags,
            attachments,
            keep_attachment_ids,
        };

        return payload;
    };

    const submit = (overrideStatus?: string) => {
        form.transform((payload) => normalizePayload(overrideStatus));

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewFiles([]);
                reset();
            },
            onFinish: () => {
                form.transform((original) => original);
            },
        } as const;

        if (isEditMode && post) {
            form.put(`/manage/teacher/posts/${post.id}`, options);
        } else {
            form.post('/manage/teacher/posts', options);
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submit();
    };

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={description}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <Button size="sm" variant="ghost" asChild className="gap-2">
                        <Link href="/manage/teacher/posts">
                            <ArrowLeft className="h-4 w-4" />
                            {t('layout.back', '返回列表')}
                        </Link>
                    </Button>
                }
            >
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <section className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">{tTeacher('form.title', '公告標題')}</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={handleInputChange('title')}
                                    placeholder={tTeacher('form.title_placeholder', '例如：演算法課程期中考公告')}
                                    required
                                />
                                {errors.title ? <p className="text-xs text-red-600">{errors.title}</p> : null}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">{tTeacher('form.slug', '自訂識別 (Slug)')}</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={handleInputChange('slug')}
                                    placeholder="course-announcement"
                                />
                                {errors.slug ? <p className="text-xs text-red-600">{errors.slug}</p> : null}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">{tTeacher('form.status', '公告狀態')}</Label>
                                <Select id="status" value={data.status} onChange={handleInputChange('status')}>
                                    {formOptions.statuses.map((option) => (
                                        <option key={option.value} value={String(option.value)}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                                {errors.status ? <p className="text-xs text-red-600">{errors.status}</p> : null}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">{tTeacher('form.category', '課程分類')}</Label>
                                <Select id="category" value={data.category_id} onChange={handleInputChange('category_id')} required>
                                    <option value="">{tTeacher('form.category_placeholder', '請選擇分類')}</option>
                                    {formOptions.categories.map((option) => (
                                        <option key={option.value} value={String(option.value)}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                                {errors.category_id ? <p className="text-xs text-red-600">{errors.category_id}</p> : null}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target">{tTeacher('form.target_audience', '預期受眾')}</Label>
                                <Input
                                    id="target"
                                    value={data.target_audience}
                                    onChange={handleInputChange('target_audience')}
                                    placeholder={tTeacher('form.target_audience_placeholder', '大三學生、資工系全體教師…')}
                                />
                                {errors.target_audience ? <p className="text-xs text-red-600">{errors.target_audience}</p> : null}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="space">{tTeacher('form.space', '綁定 Space')}</Label>
                                <Select id="space" value={data.space_id} onChange={handleInputChange('space_id')}>
                                    <option value="">{tTeacher('form.space_placeholder', '不綁定任何空間')}</option>
                                    {formOptions.spaces.map((option) => (
                                        <option key={option.value} value={String(option.value)}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                                {errors.space_id ? <p className="text-xs text-red-600">{errors.space_id}</p> : null}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="course-start">{tTeacher('form.course_start_at', '課程開始時間')}</Label>
                                <Input
                                    id="course-start"
                                    type="datetime-local"
                                    value={data.course_start_at}
                                    onChange={handleInputChange('course_start_at')}
                                />
                                {errors.course_start_at ? <p className="text-xs text-red-600">{errors.course_start_at}</p> : null}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course-end">{tTeacher('form.course_end_at', '課程結束時間')}</Label>
                                <Input
                                    id="course-end"
                                    type="datetime-local"
                                    value={data.course_end_at}
                                    onChange={handleInputChange('course_end_at')}
                                />
                                {errors.course_end_at ? <p className="text-xs text-red-600">{errors.course_end_at}</p> : null}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="published-at">{tTeacher('form.published_at', '預定發佈時間')}</Label>
                                <Input
                                    id="published-at"
                                    type="datetime-local"
                                    value={data.published_at}
                                    onChange={handleInputChange('published_at')}
                                />
                                {errors.published_at ? <p className="text-xs text-red-600">{errors.published_at}</p> : null}
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <Label htmlFor="summary">{tTeacher('form.summary', '摘要')}</Label>
                            <Textarea
                                id="summary"
                                value={data.summary}
                                onChange={handleInputChange('summary')}
                                rows={4}
                                placeholder={tTeacher('form.summary_placeholder', '輸入公告的重點摘要，方便在列表快速理解內容。')}
                            />
                            {errors.summary ? <p className="text-xs text-red-600">{errors.summary}</p> : null}
                        </div>
                        <div className="mt-4 space-y-2">
                            <Label htmlFor="content">{tTeacher('form.content', '公告內容')}</Label>
                            <Textarea
                                id="content"
                                value={data.content}
                                onChange={handleInputChange('content')}
                                rows={10}
                                placeholder={tTeacher('form.content_placeholder', '請輸入完整公告內容，包括上課地點、注意事項等資訊。')}
                                required
                            />
                            {errors.content ? <p className="text-xs text-red-600">{errors.content}</p> : null}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                        <div className="space-y-3">
                            <Label htmlFor="tags">{tTeacher('form.tags', '公告標籤')}</Label>
                            <Input
                                id="tags"
                                value={data.tags}
                                onChange={handleInputChange('tags')}
                                placeholder={tTeacher('form.tags_placeholder', '以逗號分隔，例如：作業, 考試, 線上課程')}
                            />
                            {errors.tags ? <p className="text-xs text-red-600">{errors.tags}</p> : null}
                            {availableTags.length > 0 ? (
                                <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                                    <span className="font-medium text-neutral-600">{tTeacher('form.available_tags', '常用標籤')}：</span>
                                    {availableTags.map((tag) => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => appendTag(tag.name)}
                                            className="rounded-full border border-neutral-200 px-3 py-1 transition-colors hover:border-blue-300 hover:text-blue-600"
                                        >
                                            #{tag.name}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>{tTeacher('form.attachments_existing', '已上傳附件')}</Label>
                                    <p className="text-xs text-neutral-500">{tTeacher('form.attachments_existing_hint', '取消勾選即可在儲存時刪除。')}</p>
                                </div>
                                <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => fileInputRef.current?.click()}>
                                    <Plus className="h-4 w-4" />
                                    {tTeacher('form.attachments_add', '新增附件')}
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleAttachmentChange}
                                />
                            </div>

                            {existingAttachments.length === 0 ? (
                                <p className="text-sm text-neutral-400">{tTeacher('form.attachments_none', '目前沒有附件。')}</p>
                            ) : (
                                <ul className="space-y-3">
                                    {existingAttachments.map((attachment) => {
                                        const keep = data.keep_attachment_ids.includes(attachment.id);
                                        return (
                                            <li key={attachment.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200/70 bg-neutral-50/60 px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={keep}
                                                        onCheckedChange={(checked) => toggleKeepAttachment(attachment.id, checked === true)}
                                                        aria-label={tTeacher('form.attachments_keep', '保留附件')}
                                                    />
                                                    <div className="flex flex-col text-sm text-neutral-700">
                                                        <span className="font-medium">{attachment.title ?? attachment.filename ?? tTeacher('form.attachments_untitled', '未命名附件')}</span>
                                                        {attachment.filename ? (
                                                            <span className="text-xs text-neutral-500">{attachment.filename}</span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                {attachment.file_url ? (
                                                    <a href={attachment.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700">
                                                        {tTeacher('form.attachments_preview', '預覽')}
                                                    </a>
                                                ) : null}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}

                            {newFiles.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-neutral-700">{tTeacher('form.attachments_new', '待上傳附件')}</p>
                                    <ul className="space-y-2 text-sm text-neutral-600">
                                        {newFiles.map((file, index) => (
                                            <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <Paperclip className="h-4 w-4 text-neutral-400" />
                                                    <span>{file.name}</span>
                                                </div>
                                                <button type="button" onClick={() => removeNewFile(index)} className="text-neutral-500 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                            {errors.attachments ? <p className="text-xs text-red-600">{errors.attachments}</p> : null}
                        </div>
                    </section>

                    <section className="sticky bottom-4 z-10 rounded-2xl border border-neutral-200/80 bg-white/95 p-4 shadow-lg">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <Button variant="ghost" type="button" className="gap-2" asChild>
                                <Link href="/manage/teacher/posts">
                                    <ArrowLeft className="h-4 w-4" />
                                    {t('layout.back', '返回列表')}
                                </Link>
                            </Button>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button type="button" variant="outline" disabled={processing} onClick={() => submit('draft')}>
                                    {tTeacher('actions.save_draft', '儲存草稿')}
                                </Button>
                                <Button type="button" variant="secondary" disabled={processing} onClick={() => submit('published')}>
                                    {tTeacher('actions.publish_now', '直接發佈')}
                                </Button>
                                <Button type="submit" disabled={processing} className="gap-1">
                                    <CalendarRange className="h-4 w-4" />
                                    {isEditMode ? tTeacher('actions.update_post', '更新公告') : tTeacher('actions.create_post', '建立公告')}
                                </Button>
                            </div>
                        </div>
                    </section>
                </form>
            </ManagePage>
        </>
    );
}

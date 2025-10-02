import { useEffect, useMemo, useRef, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { FormActions, FormField, FormSection } from '@/components/manage/forms';
import TagMultiSelect from '@/components/manage/forms/tag-multi-select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslator } from '@/hooks/use-translator';
import { richTextToPlainText, sanitizeRichText } from '@/lib/shared/rich-text';
import { cn } from '@/lib/shared/utils';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import type { TagOption } from '@/types/manage';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { ArrowLeft, ExternalLink, Link as LinkIcon, Paperclip, PlusCircle, Trash2, UploadCloud } from 'lucide-react';

type OptionItem<T extends string | number = string> = {
    value: T;
    label: string;
    description?: string | null;
};

type PostFormOptions = {
    statuses: OptionItem<string>[];
    visibilities: OptionItem<string>[];
    categories: OptionItem<number>[];
    spaces: OptionItem<number>[];
};

type AttachmentLink = {
    title: string;
    url: string;
};

type ExistingAttachment = {
    id: number;
    title: string;
    filename?: string | null;
    file_url?: string | null;
    external_url?: string | null;
    type?: string | null;
};

type PagePost = {
    id: number;
    title: string;
    title_en?: string | null;
    slug: string;
    status: string;
    visibility: string;
    published_at?: string | null;
    expire_at?: string | null;
    category_id?: number | null;
    space_id?: number | null;
    excerpt?: string | null;
    excerpt_en?: string | null;
    summary?: string | null;
    summary_en?: string | null;
    content?: string | null;
    content_en?: string | null;
    pinned?: boolean;
    cover_image_url?: string | null;
    tags?: Array<{
        id: number;
        name: string;
        slug?: string | null;
    }>;
    attachments?: ExistingAttachment[];
};

interface PageProps extends SharedData {
    availableTags: Array<{
        id: number;
        name: string;
        slug: string | null;
    }>;
    formOptions: PostFormOptions;
    post?: PagePost | null;
}

type PostFormData = {
    title: string;
    title_en: string;
    slug: string;
    status: string;
    visibility: string;
    category_id: string;
    space_id: string;
    published_at: string;
    expire_at: string;
    pinned: boolean;
    excerpt: string;
    excerpt_en: string;
    summary: string;
    summary_en: string;
    content: string;
    content_en: string;
    tags_text: string;
    attachments_keep: number[];
    attachments_links: AttachmentLink[];
    attachments_files: File[];
    featured_image: File | null;
};

const MAX_ATTACHMENTS = 10;

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

function normalizeTagNames(tags: string[]): string[] {
    const seen = new Set<string>();
    const normalized: string[] = [];

    tags.forEach((tag) => {
        const trimmed = tag.trim();
        if (!trimmed) {
            return;
        }
        const key = trimmed.toLowerCase();
        if (seen.has(key)) {
            return;
        }
        seen.add(key);
        normalized.push(trimmed);
    });

    return normalized;
}

function tokenizeTagsInput(value: string): string[] {
    return normalizeTagNames(value.split(','));
}

function formatTagsInput(tags: string[]): string {
    return tags.join(', ');
}

export default function ManagePostsCreate() {
    const { t } = useTranslator('manage');
    const { t: tPosts } = useTranslator('manage.posts');
    const page = usePage<PageProps>();
    const { availableTags = [], formOptions, post = null } = page.props;
    const existingAttachments = useMemo<ExistingAttachment[]>(() => post?.attachments ?? [], [post]);
    const tagOptions = useMemo<TagOption[]>(
        () =>
            availableTags.map((tag) => ({
                id: tag.id,
                value: tag.id,
                label: tag.name,
                slug: tag.slug ?? undefined,
            })),
        [availableTags]
    );
    const defaultSelectedTags = useMemo<TagOption[]>(
        () =>
            (post?.tags ?? []).map((tag) => ({
                id: tag.id,
                value: tag.id,
                label: tag.name,
                slug: tag.slug ?? undefined,
            })),
        [post]
    );
    const initialTagOptions = useMemo(() => {
        if (defaultSelectedTags.length === 0) {
            return tagOptions;
        }

        const merged = [...tagOptions];
        defaultSelectedTags.forEach((option) => {
            if (!merged.some((item) => item.id === option.id)) {
                merged.push(option);
            }
        });
        return merged;
    }, [tagOptions, defaultSelectedTags]);

    // 建立表單初始狀態，確保編輯與新增共用同一套欄位。
    const defaultFormData = useMemo<PostFormData>(() => ({
        title: post?.title ?? '',
        title_en: post?.title_en ?? '',
        slug: post?.slug ?? '',
        status: post?.status ?? 'draft',
        visibility: post?.visibility ?? 'public',
        category_id: post?.category_id ? String(post.category_id) : '',
        space_id: post?.space_id ? String(post?.space_id) : '',
        published_at: toInputDateTime(post?.published_at ?? null),
        expire_at: toInputDateTime(post?.expire_at ?? null),
        pinned: Boolean(post?.pinned ?? false),
        excerpt: post?.excerpt ?? '',
        excerpt_en: post?.excerpt_en ?? '',
        summary: post?.summary ?? '',
        summary_en: post?.summary_en ?? '',
        content: post?.content ?? '',
        content_en: post?.content_en ?? '',
    tags_text: formatTagsInput(normalizeTagNames(post?.tags?.map((tag) => tag.name) ?? [])),
        attachments_keep: (post?.attachments ?? []).map((attachment) => attachment.id),
        attachments_links: [],
        attachments_files: [],
        featured_image: null,
    }), [post]);

    const form = useForm<PostFormData>(defaultFormData);
    const { data, setData, errors, processing } = form;

    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [linkDraft, setLinkDraft] = useState<AttachmentLink>({ title: '', url: '' });
    const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<TagOption[]>(defaultSelectedTags);

    const attachmentsKeptCount = data.attachments_keep.length;
    const totalAttachmentCount = attachmentsKeptCount + newFiles.length + data.attachments_links.length;
    const attachmentsRemaining = Math.max(0, MAX_ATTACHMENTS - totalAttachmentCount);
    const attachmentsLimitReached = attachmentsRemaining <= 0;
    const attachmentsUsageMessage = tPosts(
        'form.attachments_limit_usage',
        '已使用 :count / :max 個附件，尚可新增 :remaining 個。',
        {
            count: totalAttachmentCount,
            max: MAX_ATTACHMENTS,
            remaining: attachmentsRemaining,
        },
    );
    const attachmentsLimitReachedMessage = tPosts(
        'form.validation.attachments_limit',
        '附件最多僅能保留 :max 個（包含新增與外部連結）。',
        { max: MAX_ATTACHMENTS },
    );
    const contentLength = useMemo(() => richTextToPlainText(data.content).length, [data.content]);
    const contentEnLength = useMemo(() => richTextToPlainText(data.content_en).length, [data.content_en]);

    const clearAttachmentErrors = () => {
        form.clearErrors('attachments_files', 'attachments_links');
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const featuredImageInputRef = useRef<HTMLInputElement | null>(null);

    // 當後端回傳的資料變動時（例如重新載入或切換公告），同步更新表單預設值。
    useEffect(() => {
        form.setDefaults(defaultFormData);
        form.reset();
        setNewFiles([]);
        setLinkDraft({ title: '', url: '' });
        setFeaturedPreview((prev) => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }
            return null;
        });
        setSelectedTags(defaultSelectedTags);
    }, [defaultFormData, defaultSelectedTags, form]);


    useEffect(() => {
        setData('attachments_files', newFiles);
    }, [newFiles, setData]);

    useEffect(() => {
        return () => {
            if (featuredPreview) {
                URL.revokeObjectURL(featuredPreview);
            }
        };
    }, [featuredPreview]);

    const isEditMode = Boolean(post);
    const pageTitle = isEditMode ? t('posts.edit', '編輯公告') : t('posts.create', '新增公告');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.admin.posts', '公告訊息'),
            href: '/manage/admin/posts',
        },
        {
            title: pageTitle,
            href: isEditMode && post ? `/manage/admin/posts/${post.id}/edit` : '/manage/admin/posts/create',
        },
    ];

    const attachmentFileErrors = useMemo(() => {
        const collected = Object.entries(errors)
            .filter(([key]) => key.startsWith('attachments.files'))
            .map(([, message]) => message);
        const direct = (errors as Record<string, string | undefined>).attachments_files;
        if (direct) {
            collected.push(direct);
        }
        return collected;
    }, [errors]);

    const attachmentLinkErrors = useMemo(() => {
        const collected = Object.entries(errors)
            .filter(([key]) => key.startsWith('attachments.links'))
            .map(([, message]) => message);
        const direct = (errors as Record<string, string | undefined>).attachments_links;
        if (direct) {
            collected.push(direct);
        }
        return collected;
    }, [errors]);

    const manualTagsError = errors.tags_text;
    const tagSelectionError = useMemo(() => {
        const rawError = (errors as Record<string, string | string[] | undefined>).tags;
        if (Array.isArray(rawError)) {
            return rawError.join('；');
        }
        if (typeof rawError === 'string') {
            return rawError;
        }
        const nestedError = Object.entries(errors).find(([key]) => key.startsWith('tags.'));
        if (!nestedError) {
            return undefined;
        }
        const [, message] = nestedError;
        if (Array.isArray(message)) {
            return message.join('；');
        }
        return message as string | undefined;
    }, [errors]);

    const handleInputChange = (field: keyof Pick<PostFormData, 'title' | 'title_en' | 'slug' | 'excerpt' | 'excerpt_en' | 'summary' | 'summary_en' | 'content' | 'content_en'>) =>
        (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setData(field, event.target.value);
        };

    const handleTagsTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        setData('tags_text', event.target.value);
    form.clearErrors('tags_text');
    };

    const handleTagsTextBlur = () => {
        setData('tags_text', formatTagsInput(tokenizeTagsInput(data.tags_text)));
    };

    const handleSelectChange = (field: keyof Pick<PostFormData, 'status' | 'visibility' | 'category_id' | 'space_id'>) =>
        (event: ChangeEvent<HTMLSelectElement>) => {
            setData(field, event.target.value);
        };

    const handleDateChange = (field: keyof Pick<PostFormData, 'published_at' | 'expire_at'>) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            setData(field, event.target.value);
        };

    const handlePinnedChange = (event: ChangeEvent<HTMLInputElement>) => {
        setData('pinned', event.target.checked);
    };

    const handleAddLink = () => {
        const title = linkDraft.title.trim();
        const url = linkDraft.url.trim();
        if (!title || !url) {
            return;
        }
        if (attachmentsRemaining <= 0) {
            form.setError('attachments_links', attachmentsLimitReachedMessage);
            return;
        }
        clearAttachmentErrors();
        setData('attachments_links', [...data.attachments_links, { title, url }]);
        setLinkDraft({ title: '', url: '' });
    };

    const removeLink = (index: number) => {
        const next = [...data.attachments_links];
        next.splice(index, 1);
        setData('attachments_links', next);
        clearAttachmentErrors();
    };

    const handleAttachmentFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files ? Array.from(event.target.files) : [];
        if (files.length === 0) {
            return;
        }
        const availableSlots = Math.max(0, MAX_ATTACHMENTS - (data.attachments_keep.length + newFiles.length + data.attachments_links.length));
        if (availableSlots <= 0) {
            form.setError('attachments_files', attachmentsLimitReachedMessage);
            event.target.value = '';
            return;
        }

        const filesToAdd = files.slice(0, availableSlots);

        if (filesToAdd.length < files.length) {
            form.setError('attachments_files', attachmentsLimitReachedMessage);
        } else {
            clearAttachmentErrors();
        }

        if (filesToAdd.length > 0) {
            setNewFiles((prev) => [...prev, ...filesToAdd]);
        }
        event.target.value = '';
    };

    const removeNewFile = (index: number) => {
        setNewFiles((prev) => prev.filter((_, idx) => idx !== index));
        clearAttachmentErrors();
    };

    const handleToggleKeepAttachment = (attachmentId: number, keep: boolean) => {
        setData('attachments_keep', keep
            ? Array.from(new Set([...data.attachments_keep, attachmentId]))
            : data.attachments_keep.filter((id) => id !== attachmentId));
        clearAttachmentErrors();
    };

    const handleFeaturedImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        if (featuredPreview) {
            URL.revokeObjectURL(featuredPreview);
        }
        setData('featured_image', file);
        setFeaturedPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSelectedTagsChange = (next: TagOption[]) => {
        setSelectedTags(next);
    form.clearErrors('tags_text');
    };

    const handleAppendTag = (tagName: string) => {
        const option = initialTagOptions.find((item) => item.label === tagName);
        if (option) {
            setSelectedTags((prev) => {
                if (prev.some((item) => item.id === option.id)) {
                    return prev;
                }
                return [...prev, option];
            });
            form.clearErrors('tags_text');
            return;
        }

        const nextManualTags = normalizeTagNames([...tokenizeTagsInput(data.tags_text), tagName]);
        setData('tags_text', formatTagsInput(nextManualTags));
        form.clearErrors('tags_text');
    };

    const submit = (overrideStatus?: string) => {
        form.transform((payload) => {
            const {
                status,
                attachments_keep,
                attachments_files,
                attachments_links,
                featured_image,
                tags_text,
                category_id,
                space_id,
                content,
                content_en,
                summary,
                summary_en,
                excerpt,
                excerpt_en,
                title,
                title_en,
                slug,
                ...rest
            } = payload;

            const sanitizedLinks = attachments_links
                .map((link) => ({
                    title: link.title.trim(),
                    url: link.url.trim(),
                }))
                .filter((link) => link.title.length > 0 && link.url.length > 0);

            const manualTagNames = tokenizeTagsInput(tags_text);
            const selectedTagNames = normalizeTagNames(selectedTags.map((tag) => tag.label));
            const combinedTagNames = normalizeTagNames([...selectedTagNames, ...manualTagNames]);
            const finalTags = combinedTagNames.join(',');
            const sanitizedContent = sanitizeRichText(content);
            const sanitizedContentEn = sanitizeRichText(content_en);
            const trimmedSummary = summary.trim();
            const trimmedSummaryEn = summary_en.trim();
            const trimmedExcerpt = excerpt.trim();
            const trimmedExcerptEn = excerpt_en.trim();
            const trimmedTitle = title.trim();
            const trimmedTitleEn = title_en.trim();
            const normalizedSlug = slug.trim();

            const finalData: Record<string, unknown> = {
                ...rest,
                title: trimmedTitle,
                title_en: trimmedTitleEn,
                slug: normalizedSlug,
                excerpt: trimmedExcerpt,
                excerpt_en: trimmedExcerptEn,
                summary: trimmedSummary,
                summary_en: trimmedSummaryEn,
                content: sanitizedContent,
                content_en: sanitizedContentEn,
                status: overrideStatus ?? status,
                category_id: category_id ? Number(category_id) : null,
                space_id: space_id ? Number(space_id) : null,
                tags: finalTags,
                attachments: {
                    keep: isEditMode ? attachments_keep : [],
                    files: attachments_files,
                    links: sanitizedLinks,
                },
            };

            if (featured_image) {
                finalData.featured_image = featured_image;
            }

            return finalData;
        });

        const requestOptions = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewFiles([]);
                setLinkDraft({ title: '', url: '' });
            },
            onFinish: () => {
                form.transform((payload) => payload);
            },
        } as const;

        if (isEditMode && post) {
            form.put(`/manage/admin/posts/${post.id}`, requestOptions);
        } else {
            form.post('/manage/admin/posts', requestOptions);
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submit();
    };

    const toolbar = (
        <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link href="/manage/admin/posts">
                <ArrowLeft className="h-4 w-4" />
                {t('layout.back', '返回列表')}
            </Link>
        </Button>
    );

    const coverPreview = featuredPreview ?? post?.cover_image_url ?? null;

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('posts.create_description', '建立公告內容、設定狀態並管理附件與標籤。')}
                breadcrumbs={breadcrumbs}
                toolbar={toolbar}
            >
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <FormSection
                        title={tPosts('form.sections.basic', '基本資訊')}
                        description={tPosts('form.sections.basic_hint', '填寫公告標題、識別資訊與呈現狀態。')}
                        aside={
                            formOptions.statuses.length > 0 ? (
                                <div className="space-y-2 text-sm text-neutral-500">
                                    <p className="font-medium text-neutral-700">{tPosts('form.status_hint', '狀態對照說明')}</p>
                                    <ul className="space-y-2">
                                        {formOptions.statuses.map((status) => (
                                            <li key={status.value}>
                                                <span className="text-neutral-700">{status.label}</span>
                                                {status.description ? (
                                                    <p className="text-xs text-neutral-500">{status.description}</p>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null
                        }
                    >
                        <FormField
                            label={tPosts('form.title', '公告標題')}
                            required
                            error={errors.title}
                        >
                            <Input
                                value={data.title}
                                onChange={handleInputChange('title')}
                                placeholder={tPosts('form.title_placeholder', '輸入公告標題')}
                                aria-required
                            />
                        </FormField>

                        <FormField
                            label={tPosts('form.title_en', '英文標題')}
                            description={tPosts('form.title_en_hint', '若無需英文標題可留空。')}
                            error={errors.title_en}
                        >
                            <Input
                                value={data.title_en}
                                onChange={handleInputChange('title_en')}
                                placeholder={tPosts('form.title_en_placeholder', '輸入英文標題')}
                            />
                        </FormField>

                        <FormField
                            label={tPosts('form.slug', '自訂網址識別 (Slug)')}
                            description={tPosts('form.slug_hint', '留空將自動依標題產生。')}
                            error={errors.slug}
                        >
                            <Input
                                value={data.slug}
                                onChange={handleInputChange('slug')}
                                placeholder="announcement-slug"
                            />
                        </FormField>

                        <FormField
                            label={tPosts('form.status', '公告狀態')}
                            required
                            error={errors.status}
                        >
                            <Select value={data.status} onChange={handleSelectChange('status')}>
                                {formOptions.statuses.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField
                            label={tPosts('form.visibility', '可見範圍')}
                            error={errors.visibility}
                        >
                            <Select value={data.visibility} onChange={handleSelectChange('visibility')}>
                                {formOptions.visibilities.map((visibility) => (
                                    <option key={visibility.value} value={visibility.value}>
                                        {visibility.label}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField
                            label={tPosts('form.publish_at', '發佈時間')}
                            description={tPosts('form.publish_at_hint', '若選擇排程請填寫，否則可留空。')}
                            error={errors.published_at}
                            direction="horizontal"
                        >
                            <Input
                                type="datetime-local"
                                value={data.published_at}
                                onChange={handleDateChange('published_at')}
                            />
                        </FormField>

                        <FormField
                            label={tPosts('form.expire_at', '下架時間')}
                            description={tPosts('form.expire_at_hint', '設定後到期會自動隱藏公告。')}
                            error={errors.expire_at}
                            direction="horizontal"
                        >
                            <Input
                                type="datetime-local"
                                value={data.expire_at}
                                onChange={handleDateChange('expire_at')}
                            />
                        </FormField>

                        <div className="flex items-center gap-2 rounded-xl border border-neutral-200/70 bg-neutral-50/80 px-4 py-3">
                            <input
                                id="post-pinned"
                                type="checkbox"
                                checked={data.pinned}
                                onChange={handlePinnedChange}
                                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-400"
                            />
                            <Label htmlFor="post-pinned" className="text-sm font-medium text-neutral-700">
                                {tPosts('form.pinned', '置頂顯示於列表前方')}
                            </Label>
                        </div>

                        <FormField
                            label={tPosts('form.category', '公告分類')}
                            required
                            error={errors.category_id}
                        >
                            <Select value={data.category_id} onChange={handleSelectChange('category_id')}>
                                <option value="">{tPosts('form.category_placeholder', '請選擇分類')}</option>
                                {formOptions.categories.map((category) => (
                                    <option key={category.value} value={String(category.value)}>
                                        {category.label}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField
                            label={tPosts('form.space', '綁定 Space')}
                            description={tPosts('form.space_hint', '選擇相關 Space 以便同步顯示。')}
                            error={errors.space_id}
                        >
                            <Select value={data.space_id} onChange={handleSelectChange('space_id')}>
                                <option value="">{tPosts('form.space_placeholder', '不綁定任何 Space')}</option>
                                {formOptions.spaces.map((space) => (
                                    <option key={space.value} value={String(space.value)}>
                                        {space.label}
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                    </FormSection>

                    <FormSection
                        title={tPosts('form.sections.content', '摘要與內容')}
                        description={tPosts('form.sections.content_hint', '摘要有助於搜尋與列表展示，全文則支援 HTML 內容。')}
                    >
                        <FormField
                            label={tPosts('form.excerpt', '摘要')}
                            description={tPosts('form.excerpt_hint', '簡短說明將顯示於列表。')}
                            error={errors.excerpt}
                        >
                            <Textarea
                                value={data.excerpt}
                                onChange={handleInputChange('excerpt')}
                                rows={3}
                            />
                        </FormField>

                        <FormField
                            label={tPosts('form.excerpt_en', '英文摘要')}
                            error={errors.excerpt_en}
                        >
                            <Textarea
                                value={data.excerpt_en}
                                onChange={handleInputChange('excerpt_en')}
                                rows={3}
                            />
                        </FormField>

                        <FormField
                            label={tPosts('form.summary', '重點摘要')}
                            description={tPosts('form.summary_hint', '可用於 SEO 或社群分享的描述文字。')}
                            error={errors.summary}
                        >
                            <Textarea
                                value={data.summary}
                                onChange={handleInputChange('summary')}
                                rows={4}
                            />
                        </FormField>

                        <FormField
                            label={tPosts('form.summary_en', '英文重點摘要')}
                            error={errors.summary_en}
                        >
                            <Textarea
                                value={data.summary_en}
                                onChange={handleInputChange('summary_en')}
                                rows={4}
                            />
                        </FormField>

                        <FormField
                            label={tPosts('form.content', '公告內容 (HTML)')}
                            required
                            description={tPosts('form.content_hint', '目前先使用文字區塊，後續可整合富文字編輯器。')}
                            error={errors.content}
                        >
                            <Textarea
                                value={data.content}
                                onChange={handleInputChange('content')}
                                rows={10}
                                aria-required
                            />
                            <p className="text-xs text-neutral-400 text-right">
                                {tPosts('form.content_length_counter', '目前字數：約 :count 字', { count: contentLength })}
                            </p>
                        </FormField>

                        <FormField
                            label={tPosts('form.content_en', '英文內容 (HTML)')}
                            error={errors.content_en}
                        >
                            <Textarea
                                value={data.content_en}
                                onChange={handleInputChange('content_en')}
                                rows={10}
                            />
                            <p className="text-xs text-neutral-400 text-right">
                                {tPosts('form.content_length_counter_en', '目前英文內容字數：約 :count 字', { count: contentEnLength })}
                            </p>
                        </FormField>
                    </FormSection>

                    <FormSection
                        title={tPosts('form.sections.tags', '標籤與分類輔助')}
                        description={tPosts('form.sections.tags_hint', '可先選擇常用標籤，或另行輸入新標籤（以逗號分隔）。')}
                        aside={
                            availableTags.length > 0 ? (
                                <div className="space-y-2 text-sm text-neutral-500">
                                    <p className="font-medium text-neutral-700">{tPosts('form.available_tags', '常用標籤')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition-colors hover:border-primary-400 hover:text-primary-600"
                                                onClick={() => handleAppendTag(tag.name)}
                                            >
                                                #{tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null
                        }
                    >
                        <FormField
                            label={tPosts('form.tags_select_label', '選擇既有標籤')}
                            description={tPosts('form.tags_select_hint', '開始輸入即可搜尋，支援一次選擇多個標籤。')}
                            error={tagSelectionError ?? manualTagsError}
                        >
                            <TagMultiSelect
                                value={selectedTags}
                                onChange={handleSelectedTagsChange}
                                initialOptions={initialTagOptions}
                                fetchRoute={null}
                                createRoute={null}
                                placeholder={tPosts('form.tags_select_placeholder', '搜尋或輸入標籤…')}
                            />
                        </FormField>

                        <FormField
                            label={tPosts('form.tags', '公告標籤文字補充')}
                            description={tPosts('form.tags_hint', '若需新增尚未建立的標籤，請以逗號分隔輸入。')}
                            error={manualTagsError}
                        >
                            <Input
                                value={data.tags_text}
                                onChange={handleTagsTextChange}
                                onBlur={handleTagsTextBlur}
                                placeholder={tPosts('form.tags_placeholder', '輸入或點選右側常用標籤')}
                            />
                            <p className="text-xs text-neutral-500">
                                {tPosts('form.tags_hint_long', '輸入多個請使用半形逗號分隔，例如：公告,系務,競賽。')}
                            </p>
                        </FormField>
                    </FormSection>

                    <FormSection
                        title={tPosts('form.sections.media', '主圖與附件')}
                        description={tPosts('form.sections.media_hint', '管理公告主視覺與相關附檔，取消勾選即可於儲存時刪除。')}
                    >
                        <div
                            className={cn(
                                'rounded-xl border px-4 py-3 text-xs transition-colors',
                                attachmentsLimitReached
                                    ? 'border-red-200 bg-red-50/80 text-red-700'
                                    : 'border-neutral-200 bg-neutral-50/70 text-neutral-600'
                            )}
                        >
                            {attachmentsLimitReached ? attachmentsLimitReachedMessage : attachmentsUsageMessage}
                        </div>

                        <FormField
                            label={tPosts('form.featured_image', '公告主圖')}
                            description={tPosts('form.featured_image_hint', '建議尺寸 1200x800，更新主圖將會覆蓋舊檔案。')}
                            error={errors.featured_image}
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => featuredImageInputRef.current?.click()}
                                    >
                                        <UploadCloud className="h-4 w-4" />
                                        {tPosts('form.featured_image_select', '選擇圖片')}
                                    </Button>
                                    {data.featured_image ? (
                                        <span className="text-xs text-neutral-500">{data.featured_image.name}</span>
                                    ) : null}
                                    {featuredPreview ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (featuredPreview) {
                                                    URL.revokeObjectURL(featuredPreview);
                                                }
                                                setData('featured_image', null);
                                                setFeaturedPreview(null);
                                            }}
                                        >
                                            {tPosts('form.featured_image_clear', '清除選取')}
                                        </Button>
                                    ) : null}
                                </div>
                                <input
                                    ref={featuredImageInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFeaturedImageChange}
                                />
                                {coverPreview ? (
                                    <div className="overflow-hidden rounded-2xl border border-neutral-200">
                                        <img src={coverPreview} alt={tPosts('form.featured_image_preview', '主圖預覽')} className="max-h-64 w-full object-cover" />
                                    </div>
                                ) : (
                                    <p className="text-xs text-neutral-400">{tPosts('form.featured_image_empty', '尚未設定主圖。')}</p>
                                )}
                            </div>
                        </FormField>

                        <FormField
                            label={tPosts('form.attachments_existing', '已存在的附件')}
                            description={tPosts('form.attachments_existing_hint', '取消勾選將於送出後刪除該附件。')}
                        >
                            {existingAttachments.length > 0 ? (
                                <ul className="space-y-2">
                                    {existingAttachments.map((attachment) => {
                                        const keep = data.attachments_keep.includes(attachment.id);
                                        return (
                                            <li
                                                key={attachment.id}
                                                className={cn(
                                                    'flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors duration-200',
                                                    keep ? 'border-neutral-200 bg-white' : 'border-red-200 bg-red-50/70'
                                                )}
                                            >
                                                <Checkbox
                                                    checked={keep}
                                                    onCheckedChange={(checked) => handleToggleKeepAttachment(attachment.id, checked === true)}
                                                    className="mt-1"
                                                    aria-label={tPosts('form.attachments_keep', '保留附件')}
                                                />
                                                <div className="flex flex-1 flex-col gap-1 text-sm">
                                                    <span className="font-medium text-neutral-800">{attachment.title ?? attachment.filename ?? tPosts('form.attachments_default_name', '附件')}</span>
                                                    {attachment.filename ? (
                                                        <span className="text-xs text-neutral-500">{attachment.filename}</span>
                                                    ) : null}
                                                    {!keep ? (
                                                        <span className="text-xs text-red-600">{tPosts('form.attachments_remove_notice', '送出後將刪除此附件')}</span>
                                                    ) : null}
                                                </div>
                                                {attachment.file_url || attachment.external_url ? (
                                                    <a
                                                        href={attachment.file_url ?? attachment.external_url ?? '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                                    >
                                                        <LinkIcon className="h-3.5 w-3.5" />
                                                        {tPosts('form.attachments_preview', '預覽')}
                                                    </a>
                                                ) : null}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-xs text-neutral-400">{tPosts('form.attachments_none', '目前沒有既有附件。')}</p>
                            )}
                        </FormField>

                        <FormField
                            label={tPosts('form.attachments_add_files', '新增附件檔案')}
                            description={tPosts('form.attachments_add_files_hint', '支援多檔上傳，限制 20MB。')}
                            error={attachmentFileErrors}
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={attachmentsLimitReached}
                                    >
                                        <UploadCloud className="h-4 w-4" />
                                        {tPosts('form.attachments_select_files', '選擇檔案')}
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        multiple
                                        onChange={handleAttachmentFilesSelected}
                                    />
                                </div>
                                {newFiles.length > 0 ? (
                                    <ul className="flex flex-wrap gap-2">
                                        {newFiles.map((file, index) => (
                                            <li key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 shadow-sm">
                                                <Paperclip className="h-3.5 w-3.5 text-neutral-400" />
                                                <span className="max-w-[12rem] truncate">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewFile(index)}
                                                    className="inline-flex items-center justify-center rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                                                    aria-label={tPosts('form.attachments_remove_file', '移除檔案')}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-neutral-400">{tPosts('form.attachments_no_new_files', '尚未選擇新增附件。')}</p>
                                )}
                            </div>
                        </FormField>

                        <FormField
                            label={tPosts('form.attachments_links', '連結附件')}
                            description={tPosts('form.attachments_links_hint', '可加上外部下載或參考連結。')}
                            error={attachmentLinkErrors}
                        >
                            <div className="space-y-3">
                                <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                                    <Input
                                        value={linkDraft.title}
                                        onChange={(event) => setLinkDraft((prev) => ({ ...prev, title: event.target.value }))}
                                        placeholder={tPosts('form.attachments_link_title', '連結標題')}
                                    />
                                    <Input
                                        value={linkDraft.url}
                                        onChange={(event) => setLinkDraft((prev) => ({ ...prev, url: event.target.value }))}
                                        placeholder="https://example.com/resource.pdf"
                                    />
                                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleAddLink} disabled={attachmentsLimitReached}>
                                        <PlusCircle className="h-4 w-4" />
                                        {tPosts('form.attachments_link_add', '加入連結')}
                                    </Button>
                                </div>
                                {data.attachments_links.length > 0 ? (
                                    <ul className="space-y-2">
                                        {data.attachments_links.map((link, index) => (
                                            <li key={`${link.url}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm">
                                                <div className="flex flex-col gap-1 text-neutral-700">
                                                    <span className="font-medium">{link.title}</span>
                                                    <span className="text-xs text-neutral-500">{link.url}</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeLink(index)}
                                                    aria-label={tPosts('form.attachments_link_remove', '移除連結')}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-neutral-400">{tPosts('form.attachments_links_empty', '尚未新增任何連結。')}</p>
                                )}
                            </div>
                        </FormField>
                    </FormSection>

                    <FormActions align="between" sticky>
                        <Button variant="ghost" type="button" className="gap-2" asChild>
                            <Link href="/manage/admin/posts">
                                <ArrowLeft className="h-4 w-4" />
                                {t('layout.back', '返回列表')}
                            </Link>
                        </Button>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
                                onClick={() => submit('draft')}
                            >
                                {tPosts('actions.save_draft', '儲存草稿')}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={!isEditMode}
                                className="gap-2"
                                onClick={() => {
                                    if (!post) {
                                        return;
                                    }
                                    window.open(`/posts/${post.slug}?preview=1`, '_blank', 'noopener,noreferrer');
                                }}
                            >
                                <ExternalLink className="h-4 w-4" />
                                {tPosts('actions.preview_post', '預覽')}
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {isEditMode ? tPosts('actions.update_post', '儲存變更') : tPosts('actions.publish_post', '發佈公告')}
                            </Button>
                        </div>
                    </FormActions>
                </form>
            </ManagePage>
        </>
    );
}

ManagePostsCreate.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;

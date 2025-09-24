import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/utils';
import { InertiaFormProps, Link, useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

export interface TagResource {
    id?: number;
    context: string;
    name: string;
    slug: string;
    description?: string | null;
    sort_order?: number | null;
}

export interface TagFormValues {
    context: string;
    name: string;
    slug: string;
    description: string;
    sort_order: string;
}

export interface TagContextOption {
    value: string;
    label: string;
}

export type TagFormSubmitHandler = (form: InertiaFormProps<TagFormValues>) => void;

interface TagFormProps {
    tag?: TagResource;
    contextOptions: TagContextOption[];
    submitLabel: string;
    cancelUrl: string;
    onSubmit: TagFormSubmitHandler;
}

export default function TagForm({ tag, contextOptions, submitLabel, cancelUrl, onSubmit }: TagFormProps) {
    const { t } = useTranslator('manage');

    const form = useForm<TagFormValues>({
        context: tag?.context ?? contextOptions[0]?.value ?? '',
        name: tag?.name ?? '',
        slug: tag?.slug ?? '',
        description: tag?.description ?? '',
        sort_order: tag?.sort_order !== undefined && tag?.sort_order !== null
            ? String(tag.sort_order)
            : '0',
    });

    const { data, setData, processing, errors } = form;

    useEffect(() => {
        if (!data.context && contextOptions.length > 0) {
            setData('context', contextOptions[0].value);
        }
    }, [contextOptions, data.context, setData]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(form);
    };

    const handleNameBlur = () => {
        if (data.name && data.slug.trim() === '') {
            setData('slug', slugify(data.name));
        }
    };

    const helperText = t('tags.form.actions.slug_helper', '留空時會依名稱自動產生。');

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border border-slate-200 bg-white shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900">
                        {t('tags.form.sections.basic.title', '標籤基本設定')}
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                        {t('tags.form.sections.basic.description', '設定標籤名稱、分類與排序。')}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="tag-context">
                                {t('tags.form.fields.context.label', '管理頁面')}
                            </Label>
                            <Select
                                id="tag-context"
                                value={data.context}
                                onChange={(event) => setData('context', event.target.value)}
                                aria-invalid={Boolean(errors.context) || undefined}
                            >
                                {contextOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                            <InputError message={errors.context} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tag-sort-order">
                                {t('tags.form.fields.sort_order.label', '排序優先度')}
                            </Label>
                            <Input
                                id="tag-sort-order"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                value={data.sort_order}
                                onChange={(event) => setData('sort_order', event.target.value)}
                                placeholder={t('tags.form.fields.sort_order.placeholder', '數字越小越優先顯示')}
                                aria-invalid={Boolean(errors.sort_order) || undefined}
                            />
                            <InputError message={errors.sort_order as string | undefined} />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="tag-name">
                                {t('tags.form.fields.name.label', '標籤名稱')}
                            </Label>
                            <Input
                                id="tag-name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                onBlur={handleNameBlur}
                                placeholder={t('tags.form.fields.name.placeholder', '例如：系務公告')}
                                aria-invalid={Boolean(errors.name) || undefined}
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tag-slug">
                                {t('tags.form.fields.slug.label', '網址代稱')}
                            </Label>
                            <Input
                                id="tag-slug"
                                value={data.slug}
                                onChange={(event) => setData('slug', event.target.value)}
                                placeholder={t('tags.form.fields.slug.placeholder', '例如：department-news')}
                                aria-invalid={Boolean(errors.slug) || undefined}
                            />
                            <p className={cn('text-xs text-slate-500')}>{helperText}</p>
                            <InputError message={errors.slug} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tag-description">
                            {t('tags.form.fields.description.label', '說明（選填）')}
                        </Label>
                        <Textarea
                            id="tag-description"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            placeholder={t('tags.form.fields.description.placeholder', '描述標籤的用途，便於團隊維護。')}
                            rows={4}
                            aria-invalid={Boolean(errors.description) || undefined}
                        />
                        <InputError message={errors.description as string | undefined} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    className="sm:w-auto"
                    asChild
                >
                    <Link href={cancelUrl}>
                        {t('tags.form.actions.cancel', '取消')}
                    </Link>
                </Button>
                <Button type="submit" disabled={processing} className="sm:w-auto">
                    {processing ? t('tags.form.actions.submitting', '處理中...') : submitLabel}
                </Button>
            </div>
        </form>
    );
}

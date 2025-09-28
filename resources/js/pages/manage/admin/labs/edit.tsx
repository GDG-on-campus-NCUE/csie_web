import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useMemo } from 'react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import ToastContainer from '@/components/ui/toast-container';
import LabForm, { LabFormData } from '@/components/manage/admin/labs/lab-form';
import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import type { AssignableOption } from '@/components/manage/admin/shared/assignable-multi-select';
import type { TagSelectorOption } from '@/components/manage/tag-selector';

interface TeacherOption {
    id: number;
    name: { 'zh-TW'?: string; en?: string } | string;
    title?: { 'zh-TW'?: string; en?: string } | string | null;
}

interface LabDetail {
    id: number;
    code?: string | null;
    website_url?: string | null;
    email?: string | null;
    phone?: string | null;
    name: string;
    name_en?: string | null;
    description?: string | null;
    description_en?: string | null;
    tags?: string[] | null;
    sort_order?: number | null;
    visible?: boolean;
    cover_image_url?: string | null;
    teacher_ids: number[];
}

interface LabEditPageProps {
    lab: LabDetail;
    teachers: TeacherOption[];
    tagSuggestions: TagSelectorOption[];
}

const resolveLocalizedText = (
    value: TeacherOption['name'] | TeacherOption['title'],
    fallback = ''
): string => {
    if (!value) {
        return fallback;
    }

    if (typeof value === 'string') {
        return value;
    }

    return value['zh-TW'] ?? value.en ?? fallback;
};

export default function LabEdit({ lab, teachers, tagSuggestions }: LabEditPageProps) {
    const { t } = useTranslator('manage');
    const { toasts, showError, dismissToast } = useToast();

    const teacherOptions: AssignableOption[] = useMemo(
        () =>
            teachers.map((teacher) => ({
                id: teacher.id,
                label: resolveLocalizedText(teacher.name, `教師 #${teacher.id}`),
                labelEn: typeof teacher.name === 'string' ? teacher.name : teacher.name.en ?? '',
                description: teacher.title
                    ? resolveLocalizedText(teacher.title, '')
                    : undefined,
            })),
        [teachers],
    );

    const form = useForm<LabFormData>({
        code: lab.code ?? '',
        website_url: lab.website_url ?? '',
        email: lab.email ?? '',
        phone: lab.phone ?? '',
        name: lab.name ?? '',
        name_en: lab.name_en ?? '',
        description: lab.description ?? '',
        description_en: lab.description_en ?? '',
        tags: Array.isArray(lab.tags) ? lab.tags : [],
        sort_order: lab.sort_order ?? null,
        visible: lab.visible ?? true,
        cover_image: null,
        teacher_ids: lab.teacher_ids ?? [],
    });

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('lab.index.title', '實驗室管理'), href: '/manage/labs' },
            { title: lab.name, href: `/manage/labs/${lab.id}/edit` },
        ],
        [t, lab.id, lab.name],
    );

    const pageTitle = `${t('lab.index.title', '實驗室管理')} - ${lab.name}`;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form
            .transform((data) => ({ ...data, _method: 'put' }))
            .post(`/manage/labs/${lab.id}`, {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    showError(
                        pageTitle,
                        Object.keys(errors).length > 0
                            ? Object.values(errors)
                                  .flat()
                                  .map((value) => String(value))
                                  .join('\n')
                            : '更新失敗，請稍後再試。',
                    );
                },
                onFinish: () => {
                    form.transform((data) => ({ ...data, _method: undefined }));
                    form.setData('cover_image', null);
                },
            });
    };

    return (
        <ManageLayout breadcrumbs={breadcrumbs} role="admin">
            <Head title={pageTitle} />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-right" />

            <section className="space-y-6">
                <ManagePageHeader
                    title={lab.name}
                    description={t('lab.form.basic', '填寫實驗室基本資訊並指派教師。')}
                />

                <LabForm
                    form={form}
                    onSubmit={handleSubmit}
                    submitLabel={t('lab.form.update', '儲存變更')}
                    existingCoverUrl={lab.cover_image_url ?? undefined}
                    teacherOptions={teacherOptions}
                    tagOptions={tagSuggestions}
                />
            </section>
        </ManageLayout>
    );
}

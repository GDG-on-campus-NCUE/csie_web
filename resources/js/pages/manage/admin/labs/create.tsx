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

interface LabCreatePageProps {
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

export default function LabCreate({ teachers, tagSuggestions }: LabCreatePageProps) {
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
        code: '',
        website_url: '',
        email: '',
        phone: '',
        name: '',
        name_en: '',
        description: '',
        description_en: '',
        tags: [],
        sort_order: null,
        visible: true,
        cover_image: null,
        teacher_ids: [],
    });

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('lab.index.title', '實驗室管理'), href: '/manage/labs' },
            { title: t('lab.index.create', '新增實驗室'), href: '/manage/labs/create' },
        ],
        [t],
    );

    const pageTitle = t('lab.index.create', '新增實驗室');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/manage/labs', {
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
                        : '儲存失敗，請稍後再試。',
                );
            },
        });
    };

    return (
        <ManageLayout breadcrumbs={breadcrumbs} role="admin">
            <Head title={pageTitle} />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-right" />

            <section className="space-y-6">
                <ManagePageHeader title={pageTitle} description={t('lab.form.basic', '填寫實驗室基本資訊並指派教師。')} />

                <LabForm
                    form={form}
                    onSubmit={handleSubmit}
                    submitLabel={t('lab.index.create', '新增實驗室')}
                    existingCoverUrl={null}
                    teacherOptions={teacherOptions}
                    tagOptions={tagSuggestions}
                />
            </section>
        </ManageLayout>
    );
}

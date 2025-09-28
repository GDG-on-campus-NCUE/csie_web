import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useMemo } from 'react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import ToastContainer from '@/components/ui/toast-container';
import ClassroomForm, { ClassroomFormData } from '@/components/manage/admin/classrooms/classroom-form';
import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import type { AssignableOption } from '@/components/manage/admin/shared/assignable-multi-select';
import type { TagSelectorOption } from '@/components/manage/tag-selector';

interface StaffOption {
    id: number;
    name: { 'zh-TW'?: string; en?: string } | string;
    name_en?: string | null;
    position?: { 'zh-TW'?: string; en?: string } | string | null;
    position_en?: string | null;
}

interface ClassroomDetail {
    id: number;
    code?: string | null;
    name: string;
    name_en?: string | null;
    location?: string | null;
    capacity?: number | null;
    equipment_summary?: string | null;
    description?: string | null;
    description_en?: string | null;
    tags?: string[] | null;
    sort_order?: number | null;
    visible?: boolean;
    staff_ids: number[];
}

interface ClassroomEditPageProps {
    classroom: ClassroomDetail;
    staff: StaffOption[];
    tagSuggestions: TagSelectorOption[];
}

const resolveLocalizedText = (
    value: StaffOption['name'] | StaffOption['position'],
    fallback = '',
): string => {
    if (!value) {
        return fallback;
    }

    if (typeof value === 'string') {
        return value;
    }

    return value['zh-TW'] ?? value.en ?? fallback;
};

export default function ClassroomEdit({ classroom, staff, tagSuggestions }: ClassroomEditPageProps) {
    // 透過翻譯 Hook 取得多語字串，保持與其他頁面一致。
    const { t } = useTranslator('manage');
    const { toasts, showError, dismissToast } = useToast();

    const staffOptions: AssignableOption[] = useMemo(
        () =>
            staff.map((member) => ({
                id: member.id,
                label: resolveLocalizedText(member.name, `職員 #${member.id}`),
                labelEn: member.name_en ?? (typeof member.name === 'string' ? member.name : member.name.en ?? ''),
                description: member.position
                    ? resolveLocalizedText(member.position)
                    : undefined,
            })),
        [staff],
    );

    const form = useForm<ClassroomFormData>({
        code: classroom.code ?? '',
        name: classroom.name ?? '',
        name_en: classroom.name_en ?? '',
        location: classroom.location ?? '',
        capacity: classroom.capacity ?? null,
        equipment_summary: classroom.equipment_summary ?? '',
        description: classroom.description ?? '',
        description_en: classroom.description_en ?? '',
        tags: Array.isArray(classroom.tags) ? classroom.tags : [],
        sort_order: classroom.sort_order ?? null,
        visible: classroom.visible ?? true,
        staff_ids: classroom.staff_ids ?? [],
    });

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('classroom.index.title', '教室管理'), href: '/manage/classrooms' },
            { title: classroom.name, href: `/manage/classrooms/${classroom.id}/edit` },
        ],
        [t, classroom.id, classroom.name],
    );

    const pageTitle = `${t('classroom.index.title', '教室管理')} - ${classroom.name}`;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form
            .transform((data) => ({ ...data, _method: 'put' }))
            .post(`/manage/classrooms/${classroom.id}`, {
                preserveScroll: true,
                onError: (errors) => {
                    // 轉換錯誤為換行文字，方便在 Toast 中閱讀。
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
                },
            });
    };

    return (
        <ManageLayout breadcrumbs={breadcrumbs} role="admin">
            <Head title={pageTitle} />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-right" />

            <section className="space-y-6">
                <ManagePageHeader
                    title={classroom.name}
                    description={t('classroom.form.basic', '填寫教室基本資訊並指派職員。')}
                />

                <ClassroomForm
                    form={form}
                    onSubmit={handleSubmit}
                    submitLabel={t('classroom.form.update', '儲存變更')}
                    staffOptions={staffOptions}
                    tagOptions={tagSuggestions}
                />
            </section>
        </ManageLayout>
    );
}

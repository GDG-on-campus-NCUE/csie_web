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

interface ClassroomCreatePageProps {
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

export default function ClassroomCreate({ staff, tagSuggestions }: ClassroomCreatePageProps) {
    // 使用共用翻譯 Hook，確保所有標題與按鈕文字可多語化。
    const { t } = useTranslator('manage');
    const { toasts, showError, dismissToast } = useToast();

    // 將後端傳入的職員清單轉成多選元件可識別的格式。
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
        code: '',
        name: '',
        name_en: '',
        location: '',
        capacity: null,
        equipment_summary: '',
        description: '',
        description_en: '',
        tags: [],
        sort_order: null,
        visible: true,
        staff_ids: [],
    });

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('classroom.index.title', '教室管理'), href: '/manage/classrooms' },
            { title: t('classroom.index.create', '新增教室'), href: '/manage/classrooms/create' },
        ],
        [t],
    );

    const pageTitle = t('classroom.index.create', '新增教室');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/manage/classrooms', {
            preserveScroll: true,
            onError: (errors) => {
                // 將驗證錯誤彙整成單一訊息，提供使用者清楚的錯誤回饋。
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
                <ManagePageHeader
                    title={pageTitle}
                    description={t('classroom.form.basic', '填寫教室基本資訊並指派職員。')}
                />

                <ClassroomForm
                    form={form}
                    onSubmit={handleSubmit}
                    submitLabel={t('classroom.index.create', '新增教室')}
                    staffOptions={staffOptions}
                    tagOptions={tagSuggestions}
                />
            </section>
        </ManageLayout>
    );
}

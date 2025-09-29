import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useMemo } from 'react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import ToastContainer from '@/components/ui/toast-container';
import { LabForm, type LabFormData } from '@/components/manage/labs';
import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import type { AssignableOption } from '@/components/manage/shared/assignable-multi-select';
import type { TagSelectorOption } from '@/components/manage/tag-selector';

interface TeacherOption {
    id: number;
    name: { 'zh-TW'?: string; en?: string } | string;
    name_en?: string | null;
    title?: { 'zh-TW'?: string; en?: string } | string | null;
    title_en?: string | null;
}

interface LabCreatePageProps {
    teachers: TeacherOption[];
    tagSuggestions: TagSelectorOption[];
    canManage?: boolean;
}

const resolveLocalizedText = (
    value: TeacherOption['name'] | TeacherOption['title'],
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

export default function LabCreate({
    teachers,
    tagSuggestions,
    canManage = false
}: LabCreatePageProps) {
    const { t } = useTranslator('manage');
    const { toasts, showError, dismissToast } = useToast();

    // 權限檢查
    if (!canManage) {
        return (
            <ManageLayout>
                <Head title="權限不足" />
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-lg font-medium text-slate-700">您沒有權限訪問此頁面</p>
                    <p className="text-sm text-slate-500">請聯繫管理員獲取相應權限。</p>
                </div>
            </ManageLayout>
        );
    }

    const teacherOptions: AssignableOption[] = useMemo(
        () =>
            teachers.map((teacher) => ({
                id: teacher.id,
                label: resolveLocalizedText(teacher.name, `教師 #${teacher.id}`),
                labelEn: teacher.name_en ?? (typeof teacher.name === 'string' ? teacher.name : teacher.name.en ?? ''),
                description: teacher.title
                    ? resolveLocalizedText(teacher.title)
                    : undefined,
            })),
        [teachers],
    );

    const form = useForm<LabFormData>({
        code: '',
        name: '',
        name_en: '',
        email: '',
        phone: '',
        website_url: '',
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
            { title: '管理首頁', label: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard', isActive: false },
            { title: '實驗室管理', label: t('lab.index.title', '實驗室管理'), href: '/manage/labs', isActive: false },
            { title: '新增實驗室', label: t('lab.index.create', '新增實驗室'), href: '/manage/labs/create', isActive: true },
        ],
        [t],
    );

    const pageTitle = t('lab.index.create', '新增實驗室');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/manage/labs', {
            preserveScroll: true,
            onError: (errors: any) => {
                showError(
                    Object.keys(errors).length > 0
                        ? Object.values(errors)
                            .flat()
                            .map((value: any) => String(value))
                            .join('\n')
                        : '儲存失敗，請稍後再試。',
                );
            },
        });
    };

    return (
        <ManageLayout>
            <Head title={pageTitle} />

            <div className="space-y-6">
                <ManagePageHeader
                    title={pageTitle}
                    description="建立新的實驗室資源，設定基本資訊、聯絡方式與負責教師。"
                />

                <LabForm
                    form={form}
                    onSubmit={handleSubmit}
                    submitLabel="建立實驗室"
                    teacherOptions={teacherOptions}
                    tagOptions={tagSuggestions}
                />

                <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            </div>
        </ManageLayout>
    );
}

LabCreate.layout = (page: React.ReactElement) => page;

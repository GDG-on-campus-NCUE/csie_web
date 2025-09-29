import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useMemo } from 'react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import ToastContainer from '@/components/ui/toast-container';
import { ClassroomForm, type ClassroomFormData } from '@/components/manage/classrooms';
import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import type { AssignableOption } from '@/components/manage/shared/assignable-multi-select';
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
    canManage?: boolean;
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

export default function ClassroomCreate({
    staff,
    tagSuggestions,
    canManage = false
}: ClassroomCreatePageProps) {
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
            { title: '管理首頁', label: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard', isActive: false },
            { title: '教室管理', label: t('classroom.index.title', '教室管理'), href: '/manage/classrooms', isActive: false },
            { title: '新增教室', label: t('classroom.index.create', '新增教室'), href: '/manage/classrooms/create', isActive: true },
        ],
        [t],
    );

    const pageTitle = t('classroom.index.create', '新增教室');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/manage/classrooms', {
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
                    description="建立新的教室資源，設定基本資訊、聯絡方式與負責職員。"
                />

                <ClassroomForm
                    form={form}
                    onSubmit={handleSubmit}
                    submitLabel="建立教室"
                    staffOptions={staffOptions}
                    tagOptions={tagSuggestions}
                />

                <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            </div>
        </ManageLayout>
    );
}

ClassroomCreate.layout = (page: React.ReactElement) => page;

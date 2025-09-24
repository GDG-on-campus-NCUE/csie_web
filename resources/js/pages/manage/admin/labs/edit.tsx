import { useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import type { BreadcrumbItem } from '@/types';
import LabForm, { type LabFormData } from '@/components/manage/admin/labs/lab-form';

interface LabDetail {
    id: number;
    code: string | null;
    website_url: string | null;
    email: string | null;
    phone: string | null;
    name: string;
    name_en: string | null;
    description: string | null;
    description_en: string | null;
    sort_order: number | null;
    visible: boolean;
    cover_image_url?: string | null;
}

interface EditLabProps {
    lab: LabDetail;
}

export default function EditLab({ lab }: EditLabProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: '管理首頁', href: '/manage/dashboard' },
            { title: '實驗室管理', href: '/manage/labs' },
            { title: lab.name, href: `/manage/labs/${lab.id}/edit` },
        ],
        [lab.id, lab.name]
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
        sort_order: lab.sort_order ?? null,
        visible: lab.visible ?? true,
        cover_image: null,
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(`/manage/labs/${lab.id}`, {
            forceFormData: true,
        });
    };

    return (
        <ManageLayout breadcrumbs={breadcrumbs} role="admin">
            <Head title={`編輯實驗室：${lab.name}`} />

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">編輯實驗室</h1>
                    <p className="mt-2 text-sm text-gray-600">更新實驗室內容與顯示設定</p>
                </div>

                <LabForm
                    form={form}
                    onSubmit={handleSubmit}
                    submitLabel="儲存變更"
                    existingCoverUrl={lab.cover_image_url}
                />
            </div>
        </ManageLayout>
    );
}

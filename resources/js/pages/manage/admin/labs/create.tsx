import { useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import type { BreadcrumbItem } from '@/types';
import LabForm, { type LabFormData } from '@/components/manage/admin/labs/lab-form';

export default function CreateLab() {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: '管理首頁', href: '/manage/dashboard' },
            { title: '實驗室管理', href: '/manage/labs' },
            { title: '新增實驗室', href: '/manage/labs/create' },
        ],
        []
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
        sort_order: null,
        visible: true,
        cover_image: null,
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/manage/labs', {
            forceFormData: true,
        });
    };

    return (
        <ManageLayout breadcrumbs={breadcrumbs} role="admin">
            <Head title="新增實驗室" />

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">新增實驗室</h1>
                    <p className="mt-2 text-sm text-gray-600">建立實驗室資料並設定顯示狀態</p>
                </div>

                <LabForm form={form} onSubmit={handleSubmit} submitLabel="建立實驗室" />
            </div>
        </ManageLayout>
    );
}

import { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import type { BreadcrumbItem } from '@/types';
import UserForm from '@/components/manage/users/UserForm';

interface OptionItem {
    value: string;
    label: string;
}

interface UserPayload {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'user';
    status: 'active' | 'suspended';
    email_verified_at?: string | null;
}

interface UserEditPageProps {
    mode: 'create' | 'edit';
    user: UserPayload | null;
    roleOptions: OptionItem[];
    statusOptions: OptionItem[];
}

export default function UserEditPage({ mode, user, roleOptions, statusOptions }: UserEditPageProps) {
    const title = mode === 'create' ? '新增使用者' : `編輯使用者：${user?.name ?? ''}`;

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
        const items: BreadcrumbItem[] = [
            { title: '管理首頁', href: '/manage/dashboard' },
            { title: '使用者管理', href: '/manage/users' },
        ];

        items.push({
            title: mode === 'create' ? '新增使用者' : '編輯使用者',
            href: mode === 'create' ? '/manage/users/create' : `/manage/users/${user?.id ?? ''}/edit`,
        });

        return items;
    }, [mode, user?.id]);

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <section className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
                <p className="text-sm text-neutral-500">
                    {mode === 'create'
                        ? '請填寫基本資料與角色資訊，建立完成後即可登入使用後台。'
                        : '更新帳號資訊、角色與狀態設定，變更將立即生效。'}
                </p>
            </section>

            <UserForm mode={mode} user={user} roleOptions={roleOptions} statusOptions={statusOptions} />
        </ManageLayout>
    );
}

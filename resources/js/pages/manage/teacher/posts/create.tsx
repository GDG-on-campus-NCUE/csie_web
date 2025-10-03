import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { useTranslator } from '@/hooks/use-translator';
import TeacherPostForm from './post-form';
import { usePage } from '@inertiajs/react';
import type { ReactElement } from 'react';

type AvailableTag = {
    id: number;
    name: string;
    slug: string | null;
};

type OptionItem<T extends string | number = string> = {
    value: T;
    label: string;
};

type FormOptions = {
    statuses: OptionItem<string>[];
    categories: OptionItem<number>[];
    spaces: OptionItem<number>[];
};

type PageProps = SharedData & {
    availableTags: AvailableTag[];
    formOptions: FormOptions;
};

function ManageTeacherPostsCreate() {
    const page = usePage<PageProps>();
    const { availableTags, formOptions } = page.props;
    const { t } = useTranslator('manage');
    const { t: tTeacher } = useTranslator('manage.teacher.posts');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.teacher.posts', '公告管理'),
            href: '/manage/teacher/posts',
        },
        {
            title: tTeacher('breadcrumbs.create', '新增公告'),
            href: '/manage/teacher/posts/create',
        },
    ];

    return (
        <TeacherPostForm
            mode="create"
            availableTags={availableTags}
            formOptions={formOptions}
            breadcrumbs={breadcrumbs}
            pageTitle={tTeacher('page.create_title', '新增教師公告')}
            description={tTeacher('page.create_description', '撰寫課程公告、指定受眾並設定附件與課程期間。')}
        />
    );
}

ManageTeacherPostsCreate.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;

export default ManageTeacherPostsCreate;

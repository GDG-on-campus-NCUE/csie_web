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

type AttachmentItem = {
    id: number;
    title: string | null;
    filename?: string | null;
    file_url?: string | null;
    mime_type?: string | null;
    size?: number | null;
};

type TagItem = {
    id: number;
    name: string;
    slug?: string | null;
};

type PagePost = {
    id: number;
    title: string;
    slug: string;
    status: string;
    category_id: number | null;
    space_id: number | null;
    summary: string | null;
    content: string;
    target_audience: string | null;
    course_start_at: string | null;
    course_end_at: string | null;
    published_at: string | null;
    tags: TagItem[];
    attachments: AttachmentItem[];
};

type PageProps = SharedData & {
    availableTags: AvailableTag[];
    formOptions: FormOptions;
    post: PagePost;
};

function ManageTeacherPostsEdit() {
    const page = usePage<PageProps>();
    const { availableTags, formOptions, post } = page.props;
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
            title: tTeacher('breadcrumbs.edit', '編輯公告'),
            href: `/manage/teacher/posts/${post.id}/edit`,
        },
    ];

    return (
        <TeacherPostForm
            mode="edit"
            post={post}
            availableTags={availableTags}
            formOptions={formOptions}
            breadcrumbs={breadcrumbs}
            pageTitle={tTeacher('page.edit_title', '編輯教師公告')}
            description={tTeacher('page.edit_description', '更新公告內容、附件與排程設定，維持資訊最新。')}
        />
    );
}

ManageTeacherPostsEdit.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;

export default ManageTeacherPostsEdit;

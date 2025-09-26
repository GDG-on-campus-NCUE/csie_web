import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { StaffTable } from '@/components/manage/staff/StaffTable';
import { TeacherTable } from '@/components/manage/staff/TeacherTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ToastContainer from '@/components/ui/toast-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManageLayout from '@/layouts/manage/manage-layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import type { BreadcrumbItem, SharedData } from '@/types';
import type { Staff, Teacher } from '@/types/staff';

/**
 * 分頁資訊定義，僅保留頁面所需欄位，避免額外的 props 汙染。
 */
type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

interface StaffCollection {
    active: Staff[];
    trashed: Staff[];
    meta?: PaginationMeta;
}

interface TeacherCollection {
    data: Teacher[];
    meta?: PaginationMeta;
}

interface StaffIndexPageProps {
    initialTab?: 'staff' | 'teachers';
    staff: StaffCollection;
    teachers: TeacherCollection;
    perPage?: number;
    perPageOptions?: number[];
}

type StaffFlashMessages = {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
};

/**
 * 後台教職員首頁，整合職員與教師兩個分頁，並提供建立、編輯與刪除操作。
 */
export default function StaffIndex({
    initialTab = 'staff',
    staff,
    teachers,
}: StaffIndexPageProps) {
    const { t, locale } = useTranslation('staff');
    const page = usePage<SharedData & { flash?: StaffFlashMessages }>();
    const flashMessages = page.props.flash ?? {};

    // 通用 toast 管理，確保成功與失敗都有即時提示
    const { toasts, showSuccess, showError, dismissToast } = useToast();
    const skipFlashToastRef = useRef(false);
    const previousFlashRef = useRef<StaffFlashMessages>({});

    // 以 state 紀錄使用者目前所在的分頁，確保 UI 與按鈕顯示一致。
    const [activeTab, setActiveTab] = useState<'staff' | 'teachers'>(initialTab);

    const staffActive = staff?.active ?? [];
    const staffTrashed = staff?.trashed ?? [];
    const teacherList = teachers?.data ?? [];
    const teacherMeta: PaginationMeta = teachers?.meta ?? {
        current_page: 1,
        last_page: 1,
        per_page: teacherList.length,
        total: teacherList.length,
    };

    const pageTitle = t?.('staff.index.title', '師資與職員管理') ?? '師資與職員管理';
    const pageDescription =
        t?.(
            'staff.index.description',
            '管理系所教師與職員資料，維護個人檔案與聯絡資訊。',
        ) ?? '管理系所教師與職員資料，維護個人檔案與聯絡資訊。';

    const breadcrumbs = useMemo<BreadcrumbItem[]>(
        () => [
            {
                title: t?.('layout.breadcrumbs.dashboard', '管理首頁') ?? '管理首頁',
                href: '/manage/dashboard',
            },
            {
                title: t?.('layout.breadcrumbs.staff', '教職員管理') ?? '教職員管理',
                href: '/manage/staff',
            },
        ],
        [t],
    );

    const createStaffLabel = t?.('staff.actions.create_staff', '新增職員') ?? '新增職員';
    const createTeacherLabel = t?.('staff.actions.create_teacher', '新增教師') ?? '新增教師';

    const handleCreateStaff = () => {
        router.visit('/manage/staff/create');
    };

    const handleCreateTeacher = () => {
        router.visit('/manage/teachers/create');
    };

    const handleStaffEdit = (staffMember: Staff) => {
        router.visit(`/manage/staff/${staffMember.id}/edit`);
    };

    const handleStaffDelete = (staffMember: Staff) => {
        const successMessage =
            t?.('staff.toast.staff_deleted', '職員資料已刪除') ?? '職員資料已刪除';
        const errorMessage =
            t?.('staff.toast.delete_error', '刪除失敗，請稍後再試。') ?? '刪除失敗，請稍後再試。';

        router.delete(`/manage/staff/${staffMember.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                skipFlashToastRef.current = true;
                showSuccess(pageTitle, successMessage);
            },
            onError: (errors) => {
                skipFlashToastRef.current = true;
                const flattened = Object.values(errors)
                    .flat()
                    .map((value) => String(value))
                    .filter((value) => value.length > 0);

                showError(
                    pageTitle,
                    flattened.length > 0 ? flattened.join('\n') : errorMessage,
                );
            },
        });
    };

    const handleTeacherEdit = (teacher: Teacher) => {
        router.visit(`/manage/teachers/${teacher.id}/edit`);
    };

    const handleTeacherDelete = (teacher: Teacher) => {
        const successMessage =
            t?.('staff.toast.teacher_deleted', '教師資料已刪除') ?? '教師資料已刪除';
        const errorMessage =
            t?.('staff.toast.delete_error', '刪除失敗，請稍後再試。') ?? '刪除失敗，請稍後再試。';

        router.delete(`/manage/teachers/${teacher.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                skipFlashToastRef.current = true;
                showSuccess(pageTitle, successMessage);
            },
            onError: (errors) => {
                skipFlashToastRef.current = true;
                const flattened = Object.values(errors)
                    .flat()
                    .map((value) => String(value))
                    .filter((value) => value.length > 0);

                showError(
                    pageTitle,
                    flattened.length > 0 ? flattened.join('\n') : errorMessage,
                );
            },
        });
    };

    const handleTabChange = (value: string) => {
        setActiveTab((value as 'staff' | 'teachers') ?? 'staff');
    };

    useEffect(() => {
        if (skipFlashToastRef.current) {
            previousFlashRef.current = flashMessages;
            skipFlashToastRef.current = false;
            return;
        }

        if (flashMessages.success && flashMessages.success !== previousFlashRef.current.success) {
            showSuccess(pageTitle, flashMessages.success);
        }

        if (flashMessages.error && flashMessages.error !== previousFlashRef.current.error) {
            showError(pageTitle, flashMessages.error);
        }

        previousFlashRef.current = flashMessages;
    }, [flashMessages, pageTitle, showSuccess, showError]);

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-right" />

            <section className="container mx-auto flex flex-col gap-6">
                <ManagePageHeader
                    title={pageTitle}
                    description={pageDescription}
                    actions={
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                role="button"
                                variant={activeTab === 'staff' ? 'default' : 'outline'}
                                onClick={handleCreateStaff}
                            >
                                {createStaffLabel}
                            </Button>
                            <Button
                                role="button"
                                variant={activeTab === 'teachers' ? 'default' : 'outline'}
                                onClick={handleCreateTeacher}
                            >
                                {createTeacherLabel}
                            </Button>
                        </div>
                    }
                />

                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    data-testid="tabs"
                    className="space-y-4"
                >
                    <TabsList className="w-full sm:w-auto">
                        <TabsTrigger value="teachers" data-testid="tab-teachers">
                            {t?.('staff.tabs.teachers', '教師管理') ?? '教師管理'}
                        </TabsTrigger>
                        <TabsTrigger value="staff" data-testid="tab-staff">
                            {t?.('staff.tabs.staff', '職員管理') ?? '職員管理'}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="teachers" data-testid="tab-content-teachers">
                        <Card className="border border-slate-200">
                            <CardHeader>
                                <CardTitle>{t?.('staff.teachers.title', '教師管理') ?? '教師管理'}</CardTitle>
                                <CardDescription>
                                    {t?.(
                                        'staff.teachers.description',
                                        '檢視教師聯絡資訊、所屬實驗室與帳號連結。',
                                    ) ?? '檢視教師聯絡資訊、所屬實驗室與帳號連結。'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <TeacherTable
                                    teachers={teacherList}
                                    onEdit={handleTeacherEdit}
                                    onDelete={handleTeacherDelete}
                                    locale={(locale as 'zh-TW' | 'en') ?? 'zh-TW'}
                                />

                                <div className="text-sm text-slate-600">
                                    {`第 ${teacherMeta.current_page} 頁 / 共 ${teacherMeta.last_page} 頁，`}
                                    {`每頁 ${teacherMeta.per_page} 筆，共 ${teacherMeta.total} 位教師`}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="staff" data-testid="tab-content-staff">
                        <Card className="border border-slate-200">
                            <CardHeader>
                                <CardTitle>{t?.('staff.staff.title', '職員管理') ?? '職員管理'}</CardTitle>
                                <CardDescription>
                                    {t?.(
                                        'staff.staff.description',
                                        '整理系辦職員的聯絡方式、職稱與排序設定。',
                                    ) ?? '整理系辦職員的聯絡方式、職稱與排序設定。'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {staffActive.length > 0 ? (
                                    <>
                                        <StaffTable
                                            staff={staffActive}
                                            onEdit={handleStaffEdit}
                                            onDelete={handleStaffDelete}
                                            locale={(locale as 'zh-TW' | 'en') ?? 'zh-TW'}
                                        />

                                        <div className="grid gap-2 text-sm text-slate-600">
                                            {staffActive.map((member) => (
                                                <div
                                                    key={`staff-summary-${member.id}`}
                                                    className="flex flex-wrap items-center gap-2"
                                                >
                                                    <span className="font-medium">{member.name_en}</span>
                                                    {member.position_en && (
                                                        <span className="text-slate-500">{member.position_en}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                                        {t?.('staff.staff.empty', '目前沒有職員資料，請先新增職員。') ?? '目前沒有職員資料，請先新增職員。'}
                                    </div>
                                )}

                                {staffTrashed.length > 0 && (
                                    <Card className="border border-slate-200 bg-slate-50">
                                        <CardHeader>
                                            <CardTitle className="text-base font-medium text-slate-700">
                                                {t?.('staff.staff.trashed', '已刪除職員') ?? '已刪除職員'}
                                            </CardTitle>
                                            <CardDescription>
                                                {t?.(
                                                    'staff.staff.trashed_description',
                                                    '以下職員已被移除，可在後端還原或永久刪除。',
                                                ) ?? '以下職員已被移除，可在後端還原或永久刪除。'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {staffTrashed.map((member) => (
                                                <div
                                                    key={`trashed-${member.id}`}
                                                    className="flex flex-col gap-1 rounded-lg bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="font-medium text-slate-700">{member.name}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {member.deleted_at
                                                            ? `${t?.('staff.staff.deleted_at', '刪除於') ?? '刪除於'} ${new Date(
                                                                  member.deleted_at,
                                                              ).toLocaleString('zh-TW')}`
                                                            : t?.('staff.staff.deleted', '刪除紀錄') ?? '刪除紀錄'}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </section>
        </ManageLayout>
    );
}

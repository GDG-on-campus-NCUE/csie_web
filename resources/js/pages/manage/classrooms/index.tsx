import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import ToastContainer from '@/components/ui/toast-container';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import { ClassroomTable, ClassroomFilterBar } from '@/components/manage/classrooms';
import type { ClassroomListItem, ClassroomFilterState } from '@/components/manage/classrooms';
import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem, SharedData } from '@/types';

interface StaffOption {
    id: number;
    name: { 'zh-TW'?: string; en?: string } | string;
    position?: { 'zh-TW'?: string; en?: string } | string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ClassroomsPaginator {
    data: ClassroomListItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    links: PaginationLink[];
}

interface ClassroomFlashMessages {
    success?: string;
    error?: string;
}

interface ClassroomsIndexPageProps {
    classrooms: ClassroomsPaginator;
    staff: StaffOption[];
    filters: {
        search?: string;
        staff?: string;
        visible?: string;
        per_page?: string;
    };
    perPageOptions: number[];
    canManage?: boolean; // 新增權限檢查
}

const buildInitialFilterState = (
    filters: ClassroomsIndexPageProps['filters'],
    perPageOptions: number[],
): ClassroomFilterState => ({
    search: filters.search ?? '',
    staff: filters.staff ?? '',
    visible: filters.visible ?? '',
    per_page: filters.per_page ?? String(perPageOptions[0] ?? 15),
});

const flattenErrors = (errors: Record<string, string | string[]>): string => {
    const items = Object.values(errors)
        .flat()
        .map((value) => String(value))
        .filter((value) => value.length > 0);

    return items.length > 0 ? items.join('\n') : '操作失敗，請稍後再試。';
};

export default function ClassroomsIndex({
    classrooms,
    staff,
    filters,
    perPageOptions,
    canManage = false
}: ClassroomsIndexPageProps) {
    const page = usePage<SharedData & { flash?: ClassroomFlashMessages }>();
    const flashMessages = page.props.flash ?? {};

    const { t } = useTranslator('manage');
    const { toasts, showSuccess, showError, dismissToast } = useToast();

    const [filterState, setFilterState] = useState<ClassroomFilterState>(
        buildInitialFilterState(filters, perPageOptions),
    );

    const skipFlashToastRef = useRef(false);
    const previousFlashRef = useRef<ClassroomFlashMessages>({});

    const classroomData = classrooms?.data ?? [];
    const paginationMeta = useMemo(() => {
        const meta = classrooms?.meta ?? {
            current_page: 1,
            last_page: 1,
            per_page: Number(filterState.per_page) || (perPageOptions[0] ?? 15),
            total: classroomData.length,
            from: classroomData.length > 0 ? 1 : 0,
            to: classroomData.length,
        };
        return meta;
    }, [classrooms?.meta, filterState.per_page, perPageOptions, classroomData.length]);

    const paginationLinks = classrooms?.links ?? [];

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: '管理', label: t('navigation.manage'), href: '/manage', isActive: false },
            { title: '教室管理', label: '教室管理', href: '/manage/classrooms', isActive: true },
        ],
        [t],
    );

    // Flash 訊息處理
    useEffect(() => {
        if (skipFlashToastRef.current) {
            skipFlashToastRef.current = false;
            return;
        }

        const hasNewSuccess =
            flashMessages.success &&
            flashMessages.success !== previousFlashRef.current.success;
        const hasNewError =
            flashMessages.error &&
            flashMessages.error !== previousFlashRef.current.error;

        if (hasNewSuccess && flashMessages.success) {
            showSuccess(flashMessages.success);
        }

        if (hasNewError && flashMessages.error) {
            showError(flashMessages.error);
        }

        previousFlashRef.current = flashMessages;
    }, [flashMessages, showSuccess, showError]);

    // 篩選處理
    const handleFilterChange = useCallback(
        (key: keyof ClassroomFilterState, value: string) => {
            setFilterState((prevState) => ({
                ...prevState,
                [key]: value,
            }));
        },
        [],
    );

    const handleFilterSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            skipFlashToastRef.current = true;

            router.get('/manage/classrooms', filterState as any, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [filterState],
    );

    const handleFilterReset = useCallback(() => {
        const resetState = buildInitialFilterState({}, perPageOptions);
        setFilterState(resetState);
        skipFlashToastRef.current = true;

        router.get('/manage/classrooms', resetState as any, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [perPageOptions]);

    // CRUD 處理
    const handleEditClassroom = useCallback((classroom: ClassroomListItem) => {
        if (!canManage) {
            showError('您沒有權限編輯教室');
            return;
        }
        router.visit(`/manage/classrooms/${classroom.id}/edit`);
    }, [canManage, showError]);

    const handleDeleteClassroom = useCallback((classroom: ClassroomListItem) => {
        if (!canManage) {
            showError('您沒有權限刪除教室');
            return;
        }

        if (!window.confirm(`確定要刪除教室「${classroom.name}」嗎？此操作無法復原。`)) {
            return;
        }

        router.delete(`/manage/classrooms/${classroom.id}`, {
            onError: (errors) => {
                const message = flattenErrors(errors);
                showError(message);
            },
        });
    }, [canManage, showError]);

    return (
        <ManageLayout>
            <Head title="教室管理" />

            <div className="space-y-6">
                <ManagePageHeader
                    title="教室管理"
                    description="管理學院的教室資源，包含空間資訊、設備配置和職員指派。"
                    actions={
                        canManage ? (
                            <Button
                                onClick={() => router.visit('/manage/classrooms/create')}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                新增教室
                            </Button>
                        ) : null
                    }
                />

                <ClassroomFilterBar
                    filterState={filterState}
                    staff={staff}
                    perPageOptions={perPageOptions}
                    onChange={handleFilterChange}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                />

                <ClassroomTable
                    classrooms={classroomData}
                    onEdit={handleEditClassroom}
                    onDelete={handleDeleteClassroom}
                />

                {paginationMeta.last_page > 1 && (
                    <Pagination
                        meta={{
                            ...paginationMeta,
                            links: paginationLinks,
                            from: paginationMeta.from ?? 0,
                            to: paginationMeta.to ?? 0
                        }}
                        onPerPageChange={(perPage: number) => {
                            skipFlashToastRef.current = true;
                            const newFilterState = { ...filterState, per_page: String(perPage) };
                            router.get('/manage/classrooms', newFilterState as any, {
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }}
                        perPageOptions={perPageOptions}
                    />
                )}

                <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            </div>
        </ManageLayout>
    );
}

ClassroomsIndex.layout = (page: React.ReactElement) => page;

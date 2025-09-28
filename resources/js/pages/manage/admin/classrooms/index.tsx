import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import ToastContainer from '@/components/ui/toast-container';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import ClassroomFilterBar, { ClassroomFilterState } from '@/components/manage/admin/classrooms/classroom-filter-bar';
import ClassroomTable, { ClassroomListItem } from '@/components/manage/admin/classrooms/classroom-table';
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

export default function ClassroomsIndex({ classrooms, staff, filters, perPageOptions }: ClassroomsIndexPageProps) {
    // 透過 Inertia 取得共用資料與 flash 訊息，便於在頁面內觸發 Toast。
    const page = usePage<SharedData & { flash?: ClassroomFlashMessages }>();
    const flashMessages = page.props.flash ?? {};

    const { t } = useTranslator('manage');
    const { toasts, showSuccess, showError, dismissToast } = useToast();

    // 將網址參數轉換成可控狀態，方便表單元件連動。
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

        return {
            current_page: meta.current_page,
            last_page: meta.last_page,
            per_page: meta.per_page,
            total: meta.total,
            from: meta.from ?? (classroomData.length > 0 ? 1 : 0),
            to: meta.to ?? classroomData.length,
            links: classrooms?.links ?? [],
        };
    }, [classrooms, classroomData.length, filterState.per_page, perPageOptions]);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('classroom.index.title', '教室管理'), href: '/manage/classrooms' },
        ],
        [t],
    );

    const applyFilters = useCallback(
        (event?: FormEvent<HTMLFormElement>, override?: Partial<ClassroomFilterState>) => {
            event?.preventDefault();
            const payload = { ...filterState, ...override };
            const query = Object.fromEntries(
                Object.entries(payload).filter(([, value]) => value !== ''),
            );

            router.get('/manage/classrooms', query, {
                preserveScroll: true,
                preserveState: true,
            });
        },
        [filterState],
    );

    const resetFilters = useCallback(() => {
        const initial = buildInitialFilterState({}, perPageOptions);
        setFilterState(initial);
        applyFilters(undefined, initial);
    }, [applyFilters, perPageOptions]);

    // 當伺服器回傳新的篩選條件時（例如換頁），同步更新本地狀態。
    useEffect(() => {
        setFilterState(buildInitialFilterState(filters, perPageOptions));
    }, [filters, perPageOptions]);

    // 根據 flash 訊息顯示成功／失敗 Toast，並避免重複顯示。
    useEffect(() => {
        if (skipFlashToastRef.current) {
            previousFlashRef.current = flashMessages;
            skipFlashToastRef.current = false;
            return;
        }

        if (flashMessages.success && flashMessages.success !== previousFlashRef.current.success) {
            showSuccess(t('classroom.index.title', '教室管理'), flashMessages.success);
        }

        if (flashMessages.error && flashMessages.error !== previousFlashRef.current.error) {
            showError(t('classroom.index.title', '教室管理'), flashMessages.error);
        }

        previousFlashRef.current = flashMessages;
    }, [flashMessages, showSuccess, showError, t]);

    const pageTitle = t('classroom.index.title', '教室管理');
    const pageDescription = t(
        'classroom.index.description',
        '維護教室設備、容量與負責職員，支援多對多綁定。',
    );
    const createLabel = t('classroom.index.create', '新增教室');

    const handleFilterChange = (key: keyof ClassroomFilterState, value: string) => {
        setFilterState((previous) => ({ ...previous, [key]: value }));
    };

    const handlePerPageChange = (perPage: number) => {
        const nextValue = String(perPage);
        setFilterState((previous) => ({ ...previous, per_page: nextValue }));
        applyFilters(undefined, { per_page: nextValue });
    };

    const handleCreate = () => {
        router.visit('/manage/classrooms/create');
    };

    const handleEdit = (classroom: ClassroomListItem) => {
        router.visit(`/manage/classrooms/${classroom.id}/edit`);
    };

    const handleDelete = (classroom: ClassroomListItem) => {
        const confirmMessage = `確定要刪除「${classroom.name}」嗎？此操作無法復原。`;
        if (!window.confirm(confirmMessage)) {
            return;
        }

        router.delete(`/manage/classrooms/${classroom.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                skipFlashToastRef.current = true;
                showSuccess(pageTitle, t('success.deleted', ':item 已刪除', { item: classroom.name }));
            },
            onError: (errors) => {
                skipFlashToastRef.current = true;
                showError(pageTitle, flattenErrors(errors));
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
                    description={pageDescription}
                    actions={
                        <Button onClick={handleCreate} className="rounded-full px-6">
                            {createLabel}
                        </Button>
                    }
                />

                <ClassroomFilterBar
                    filterState={filterState}
                    staff={staff}
                    perPageOptions={perPageOptions}
                    onChange={handleFilterChange}
                    onSubmit={(event) => applyFilters(event)}
                    onReset={resetFilters}
                />

                <ClassroomTable classrooms={classroomData} onEdit={handleEdit} onDelete={handleDelete} />

                <Pagination
                    meta={paginationMeta}
                    perPageOptions={perPageOptions}
                    onPerPageChange={handlePerPageChange}
                />
            </section>
        </ManageLayout>
    );
}

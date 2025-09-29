import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import ToastContainer from '@/components/ui/toast-container';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import { LabTable, LabFilterBar } from '@/components/manage/labs';
import type { LabListItem, LabFilterState } from '@/components/manage/labs';
import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem, SharedData } from '@/types';

interface TeacherOption {
    id: number;
    name: { 'zh-TW'?: string; en?: string } | string;
    title?: { 'zh-TW'?: string; en?: string } | string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface LabsPaginator {
    data: LabListItem[];
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

interface LabFlashMessages {
    success?: string;
    error?: string;
}

interface LabsIndexPageProps {
    labs: LabsPaginator;
    teachers: TeacherOption[];
    filters: {
        search?: string;
        teacher?: string;
        visible?: string;
        per_page?: string;
    };
    perPageOptions: number[];
    canManage?: boolean;
}

const buildInitialFilterState = (
    filters: LabsIndexPageProps['filters'],
    perPageOptions: number[],
): LabFilterState => ({
    search: filters.search ?? '',
    teacher: filters.teacher ?? '',
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

export default function LabsIndex({
    labs,
    teachers,
    filters,
    perPageOptions,
    canManage = false
}: LabsIndexPageProps) {
    const page = usePage<SharedData & { flash?: LabFlashMessages }>();
    const flashMessages = page.props.flash ?? {};

    const { t } = useTranslator('manage');
    const { toasts, showSuccess, showError, dismissToast } = useToast();

    const [filterState, setFilterState] = useState<LabFilterState>(
        buildInitialFilterState(filters, perPageOptions),
    );

    const skipFlashToastRef = useRef(false);
    const previousFlashRef = useRef<LabFlashMessages>({});

    const labData = labs?.data ?? [];
    const paginationMeta = useMemo(() => {
        const meta = labs?.meta ?? {
            current_page: 1,
            last_page: 1,
            per_page: Number(filterState.per_page) || (perPageOptions[0] ?? 15),
            total: labData.length,
            from: labData.length > 0 ? 1 : 0,
            to: labData.length,
        };
        return meta;
    }, [labs?.meta, filterState.per_page, perPageOptions, labData.length]);

    const paginationLinks = labs?.links ?? [];

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
        (key: keyof LabFilterState, value: string) => {
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

            router.get('/manage/labs', filterState as any, {
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

        router.get('/manage/labs', resetState as any, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [perPageOptions]);

    // CRUD 處理
    const handleEditLab = useCallback((lab: LabListItem) => {
        if (!canManage) {
            showError('您沒有權限編輯實驗室');
            return;
        }
        router.visit(`/manage/labs/${lab.id}/edit`);
    }, [canManage, showError]);

    const handleDeleteLab = useCallback((lab: LabListItem) => {
        if (!canManage) {
            showError('您沒有權限刪除實驗室');
            return;
        }

        if (!window.confirm(`確定要刪除實驗室「${lab.name}」嗎？此操作無法復原。`)) {
            return;
        }

        router.delete(`/manage/labs/${lab.id}`, {
            onError: (errors) => {
                const message = flattenErrors(errors);
                showError(message);
            },
        });
    }, [canManage, showError]);

    return (
        <ManageLayout>
            <Head title="實驗室管理" />

            <div className="space-y-6">
                <ManagePageHeader
                    title="實驗室管理"
                    description="管理學院的實驗室資源，包含研究領域、聯絡方式和教師指派。"
                    actions={
                        canManage ? (
                            <Button
                                onClick={() => router.visit('/manage/labs/create')}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                新增實驗室
                            </Button>
                        ) : null
                    }
                />

                <LabFilterBar
                    filterState={filterState}
                    teachers={teachers}
                    perPageOptions={perPageOptions}
                    onChange={handleFilterChange}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                />

                <LabTable
                    labs={labData}
                    onEdit={handleEditLab}
                    onDelete={handleDeleteLab}
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
                            router.get('/manage/labs', newFilterState as any, {
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

LabsIndex.layout = (page: React.ReactElement) => page;

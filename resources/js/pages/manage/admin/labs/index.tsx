import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import ToastContainer from '@/components/ui/toast-container';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import LabFilterBar, { LabFilterState } from '@/components/manage/admin/labs/lab-filter-bar';
import LabTable, { LabListItem } from '@/components/manage/admin/labs/lab-table';
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

export default function LabsIndex({ labs, teachers, filters, perPageOptions }: LabsIndexPageProps) {
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

        return {
            current_page: meta.current_page,
            last_page: meta.last_page,
            per_page: meta.per_page,
            total: meta.total,
            from: meta.from ?? (labData.length > 0 ? 1 : 0),
            to: meta.to ?? labData.length,
            links: labs?.links ?? [],
        };
    }, [labs, labData.length, filterState.per_page, perPageOptions]);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('lab.index.title', '實驗室管理'), href: '/manage/labs' },
        ],
        [t],
    );

    const applyFilters = useCallback(
        (event?: FormEvent<HTMLFormElement>, override?: Partial<LabFilterState>) => {
            event?.preventDefault();
            const payload = { ...filterState, ...override };
            const query = Object.fromEntries(
                Object.entries(payload).filter(([, value]) => value !== ''),
            );

            router.get('/manage/labs', query, {
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

    useEffect(() => {
        setFilterState(buildInitialFilterState(filters, perPageOptions));
    }, [filters, perPageOptions]);

    useEffect(() => {
        if (skipFlashToastRef.current) {
            previousFlashRef.current = flashMessages;
            skipFlashToastRef.current = false;
            return;
        }

        if (flashMessages.success && flashMessages.success !== previousFlashRef.current.success) {
            showSuccess(t('lab.index.title', '實驗室管理'), flashMessages.success);
        }

        if (flashMessages.error && flashMessages.error !== previousFlashRef.current.error) {
            showError(t('lab.index.title', '實驗室管理'), flashMessages.error);
        }

        previousFlashRef.current = flashMessages;
    }, [flashMessages, showSuccess, showError, t]);

    const pageTitle = t('lab.index.title', '實驗室管理');
    const pageDescription = t(
        'lab.index.description',
        '維護系所研究實驗室資訊，包含成員、聯絡資訊與顯示排序。',
    );
    const createLabel = t('lab.index.create', '新增實驗室');

    const handleFilterChange = (key: keyof LabFilterState, value: string) => {
        setFilterState((previous) => ({ ...previous, [key]: value }));
    };

    const handlePerPageChange = (perPage: number) => {
        const nextValue = String(perPage);
        setFilterState((previous) => ({ ...previous, per_page: nextValue }));
        applyFilters(undefined, { per_page: nextValue });
    };

    const handleCreate = () => {
        router.visit('/manage/labs/create');
    };

    const handleEdit = (lab: LabListItem) => {
        router.visit(`/manage/labs/${lab.id}/edit`);
    };

    const handleDelete = (lab: LabListItem) => {
        const confirmMessage = `確定要刪除「${lab.name}」嗎？此操作無法復原。`;
        if (!window.confirm(confirmMessage)) {
            return;
        }

        router.delete(`/manage/labs/${lab.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                skipFlashToastRef.current = true;
                showSuccess(pageTitle, t('success.deleted', ':item 已刪除', { item: lab.name }));
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

                <LabFilterBar
                    filterState={filterState}
                    teachers={teachers}
                    perPageOptions={perPageOptions}
                    onChange={handleFilterChange}
                    onSubmit={(event) => applyFilters(event)}
                    onReset={resetFilters}
                />

                <LabTable labs={labData} onEdit={handleEdit} onDelete={handleDelete} />

                <Pagination
                    meta={paginationMeta}
                    perPageOptions={perPageOptions}
                    onPerPageChange={handlePerPageChange}
                />
            </section>
        </ManageLayout>
    );
}

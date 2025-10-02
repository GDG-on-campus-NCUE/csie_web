import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TableEmpty from '@/components/manage/table-empty';
import { useTranslator } from '@/hooks/use-translator';
import type {
    ManageMessageFilterOptions,
    ManageMessageFilterState,
    ManageMessageListItem,
    ManageMessageListResponse,
} from '@/types/manage';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { Download, Filter, Mail, MailPlus, User as UserIcon } from 'lucide-react';

interface ManageAdminMessagesPageProps extends SharedData {
    messages: ManageMessageListResponse;
    filters: ManageMessageFilterState;
    filterOptions: ManageMessageFilterOptions;
    statusSummary: Record<string, number>;
}

interface FilterFormState {
    keyword: string;
    status: string;
    from: string;
    to: string;
    per_page: string;
}

const statusVariantMap: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    new: 'default',
    processing: 'secondary',
    resolved: 'outline',
    spam: 'destructive',
};

function buildPayload(state: FilterFormState) {
    return {
        keyword: state.keyword || null,
        status: state.status || null,
        from: state.from || null,
        to: state.to || null,
        per_page: state.per_page ? Number(state.per_page) : null,
    };
}

export default function ManageAdminMessagesIndex() {
    const page = usePage<ManageAdminMessagesPageProps>();
    const { messages, filters, filterOptions, statusSummary } = page.props;
    const { t } = useTranslator('manage');
    const { t: tMessages } = useTranslator('manage.messages');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.admin.messages', '聯絡表單'),
            href: '/manage/admin/messages',
        },
    ];

    const pageTitle = t('sidebar.admin.messages', '聯絡表單');

    const defaultFilterForm = useMemo<FilterFormState>(() => ({
        keyword: filters.keyword ?? '',
        status: filters.status ?? '',
        from: filters.from ?? '',
        to: filters.to ?? '',
        per_page: String(filters.per_page ?? messages.meta.per_page ?? 15),
    }), [filters.keyword, filters.status, filters.from, filters.to, filters.per_page, messages.meta.per_page]);

    const [filterForm, setFilterForm] = useState<FilterFormState>(defaultFilterForm);
    const [selectedMessage, setSelectedMessage] = useState<ManageMessageListItem | null>(null);
    const keywordTimer = useRef<number | null>(null);

    useEffect(() => {
        setFilterForm(defaultFilterForm);
    }, [defaultFilterForm]);

    const applyFilters = useCallback(
        (overrides: Partial<FilterFormState> = {}, options: { replace?: boolean } = {}) => {
            const nextState: FilterFormState = { ...filterForm, ...overrides } as FilterFormState;

            router.get('/manage/admin/messages', buildPayload(nextState), {
                preserveScroll: true,
                preserveState: true,
                replace: options.replace ?? false,
            });
        },
        [filterForm]
    );

    useEffect(() => {
        if (filterForm.keyword === (filters.keyword ?? '')) {
            return;
        }

        if (keywordTimer.current) {
            window.clearTimeout(keywordTimer.current);
        }

        keywordTimer.current = window.setTimeout(() => {
            applyFilters({ keyword: filterForm.keyword }, { replace: true });
        }, 400);

        return () => {
            if (keywordTimer.current) {
                window.clearTimeout(keywordTimer.current);
            }
        };
    }, [filterForm.keyword, filters.keyword, applyFilters]);

    const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFilterForm((prev) => ({ ...prev, keyword: event.target.value }));
    };

    const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters();
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setFilterForm((prev) => ({ ...prev, status: value }));
        applyFilters({ status: value });
    };

    const handleDateChange = (field: 'from' | 'to') => (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setFilterForm((prev) => ({ ...prev, [field]: value }));
        applyFilters({ [field]: value } as Partial<FilterFormState>);
    };

    const handlePerPageChange = (value: string) => {
        setFilterForm((prev) => ({ ...prev, per_page: value }));
        applyFilters({ per_page: value }, { replace: true });
    };

    const handleResetFilters = () => {
        setFilterForm(defaultFilterForm);
        applyFilters(defaultFilterForm, { replace: true });
    };

    const handleRowClick = (message: ManageMessageListItem) => {
        setSelectedMessage(message);
    };

    const closeDetail = () => setSelectedMessage(null);

    const toolbar = (
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form className="flex flex-wrap items-center gap-2" onSubmit={handleFilterSubmit}>
                <div className="flex items-center gap-2">
                    <Input
                        type="search"
                        value={filterForm.keyword}
                        onChange={handleKeywordChange}
                        placeholder={tMessages('filters.keyword_placeholder', '搜尋主旨或聯絡人')}
                        className="w-60"
                        aria-label={tMessages('filters.keyword_label', '搜尋訊息')}
                    />
                    <Button type="submit" size="sm" className="gap-1">
                        <Filter className="h-4 w-4" />
                        {tMessages('filters.apply', '套用')}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="text-neutral-500" onClick={handleResetFilters}>
                        {tMessages('filters.reset', '重設')}
                    </Button>
                </div>
                <Select
                    value={filterForm.status}
                    onChange={handleStatusChange}
                    className="w-40"
                    aria-label={tMessages('filters.status_label', '狀態篩選')}
                >
                    <option value="">{tMessages('filters.status_all', '全部狀態')}</option>
                    {filterOptions.statuses.map((option) => (
                        <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                            {option.count !== undefined ? ` (${option.count})` : ''}
                        </option>
                    ))}
                </Select>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <label htmlFor="filter-from">{tMessages('filters.from', '起始日期')}</label>
                    <Input
                        id="filter-from"
                        type="date"
                        value={filterForm.from}
                        onChange={handleDateChange('from')}
                        className="h-9 w-36"
                    />
                    <span className="text-neutral-400">~</span>
                    <Input
                        type="date"
                        value={filterForm.to}
                        onChange={handleDateChange('to')}
                        className="h-9 w-36"
                    />
                </div>
            </form>

            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-1" asChild>
                    <Link href="#">
                        <Download className="h-4 w-4" />
                        {tMessages('actions.export', '匯出紀錄')}
                    </Link>
                </Button>
                <Button size="sm" className="gap-2">
                    <MailPlus className="h-4 w-4" />
                    {tMessages('actions.new', '建立新訊息')}
                </Button>
            </div>
        </div>
    );

    const renderTableRows = (items: ManageMessageListItem[]) => {
        if (items.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={4} className="py-12">
                        <TableEmpty
                            title={tMessages('empty.title', '尚無訊息')}
                            description={tMessages('empty.description', '目前沒有符合條件的聯絡表單紀錄。')}
                        />
                    </TableCell>
                </TableRow>
            );
        }

        return items.map((message) => (
            <TableRow
                key={message.id}
                className="cursor-pointer border-neutral-200/60 transition hover:bg-blue-50/40"
                onClick={() => handleRowClick(message)}
            >
                <TableCell className="space-y-1">
                    <div className="font-medium text-neutral-800">{message.subject ?? tMessages('table.no_subject', '未填寫主旨')}</div>
                    <div className="text-xs text-neutral-500">{message.name} · {message.email}</div>
                </TableCell>
                <TableCell>
                    <Badge variant={statusVariantMap[message.status] ?? 'outline'} className="capitalize">
                        {tMessages(`status.${message.status}`, message.status)}
                    </Badge>
                </TableCell>
                <TableCell className="text-sm text-neutral-600">
                    {message.created_at
                        ? new Date(message.created_at).toLocaleString(page.props.locale ?? 'zh-TW')
                        : '—'}
                </TableCell>
                <TableCell className="text-sm text-neutral-500">
                    {message.processed_at
                        ? new Date(message.processed_at).toLocaleString(page.props.locale ?? 'zh-TW')
                        : tMessages('table.unprocessed', '尚未處理')}
                </TableCell>
            </TableRow>
        ));
    };

    const statusCards = (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {filterOptions.statuses.map((status) => (
                <div key={String(status.value)} className="rounded-xl border border-neutral-200/70 bg-white/80 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        {tMessages(`status.${status.value}`, status.label)}
                    </div>
                    <div className="text-2xl font-semibold text-neutral-900">
                        {statusSummary[String(status.value)] ?? status.count ?? 0}
                    </div>
                </div>
            ))}
        </div>
    );

    const meta = messages.meta;

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('messages.description', '追蹤與回覆訪客的聯絡資訊。')}
                breadcrumbs={breadcrumbs}
                toolbar={toolbar}
            >
                {statusCards}

                <section className="mt-4 rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-200/80">
                                <TableHead className="w-2/5 text-neutral-500">{tMessages('table.subject', '主旨')}</TableHead>
                                <TableHead className="w-1/5 text-neutral-500">{tMessages('table.status', '狀態')}</TableHead>
                                <TableHead className="w-1/5 text-neutral-500">{tMessages('table.created', '建立時間')}</TableHead>
                                <TableHead className="w-1/5 text-neutral-500">{tMessages('table.processed', '處理時間')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>{renderTableRows(messages.data)}</TableBody>
                    </Table>
                    <div className="px-4 py-3">
                        <Pagination meta={meta} onPerPageChange={(value) => handlePerPageChange(String(value))} />
                    </div>
                </section>
            </ManagePage>

            <Sheet open={!!selectedMessage} onOpenChange={(open) => (open ? null : closeDetail())}>
                <SheetContent className="w-full sm:max-w-xl">
                    {selectedMessage ? (
                        <div className="flex h-full flex-col gap-4">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-800">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                    {selectedMessage.subject ?? tMessages('detail.no_subject', '未填寫主旨')}
                                </SheetTitle>
                                <SheetDescription className="text-sm text-neutral-500">
                                    {tMessages('detail.subheading', '檢視訪客傳送的聯絡資訊與內容。')}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={statusVariantMap[selectedMessage.status] ?? 'outline'} className="capitalize">
                                    {tMessages(`status.${selectedMessage.status}`, selectedMessage.status)}
                                </Badge>
                                <span className="text-xs text-neutral-400">
                                    {selectedMessage.created_at
                                        ? new Date(selectedMessage.created_at).toLocaleString(page.props.locale ?? 'zh-TW')
                                        : '—'}
                                </span>
                            </div>

                            <div className="space-y-2 rounded-lg border border-neutral-200/80 bg-neutral-50/80 p-3 text-sm text-neutral-600">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-neutral-400" />
                                    <span>{selectedMessage.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-neutral-400" />
                                    <Link href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:text-blue-700">
                                        {selectedMessage.email}
                                    </Link>
                                </div>
                                {selectedMessage.locale ? (
                                    <div className="text-xs text-neutral-400">
                                        {tMessages('detail.locale', '語系：:locale', { locale: selectedMessage.locale })}
                                    </div>
                                ) : null}
                            </div>

                            <div className="grow overflow-y-auto rounded-lg border border-neutral-200/70 bg-white p-3 text-sm leading-relaxed text-neutral-700 shadow-inner">
                                {selectedMessage.message.split('\n').map((line, index) => (
                                    <p key={`${selectedMessage.id}-line-${index}`} className="whitespace-pre-wrap">
                                        {line}
                                    </p>
                                ))}
                            </div>

                            <div className="flex flex-col gap-2 text-xs text-neutral-500">
                                <div>
                                    {selectedMessage.processed_at
                                        ? tMessages('detail.processed_at', '處理時間：:time', {
                                              time: new Date(selectedMessage.processed_at).toLocaleString(page.props.locale ?? 'zh-TW'),
                                          })
                                        : tMessages('detail.not_processed', '尚未紀錄處理時間')}
                                </div>
                                {selectedMessage.processor ? (
                                    <div>
                                        {tMessages('detail.processor', '處理人員：:name', { name: selectedMessage.processor.name })}
                                    </div>
                                ) : null}
                                {selectedMessage.file_url ? (
                                    <div className="flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        <Link href={selectedMessage.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                                            {tMessages('detail.attachment', '下載附件')}
                                        </Link>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex justify-end">
                                <Button variant="outline" onClick={closeDetail}>
                                    {tMessages('detail.close', '關閉')}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>
        </>
    );
}

ManageAdminMessagesIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;

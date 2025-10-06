import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent, MouseEvent, ReactElement } from 'react';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarClock, Download, Filter, Mail, MailOpen, MailPlus, Phone, User } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import ManageToolbar from '@/components/manage/manage-toolbar';
import FilterPanel from '@/components/manage/filter-panel';
import StatusFilterTabs from '@/components/manage/status-filter-tabs';
import {
    manageFilterControlClass,
    manageToolbarPrimaryButtonClass,
    manageToolbarSecondaryButtonClass,
} from '@/components/manage/filter-styles';
import ResponsiveDataView from '@/components/manage/responsive-data-view';
import DataCard from '@/components/manage/data-card';
import TableEmpty from '@/components/manage/table-empty';
import { StatCard } from '@/components/manage/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import { formatDateTime } from '@/lib/shared/format';
import { cn } from '@/lib/shared/utils';
import type {
    ManageMessageFilterOptions,
    ManageMessageFilterState,
    ManageMessageListItem,
    ManageMessageListResponse,
} from '@/types/manage';
import type { BreadcrumbItem, SharedData } from '@/types/shared';

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

const STATUS_BADGE_CLASS: Record<string, string> = {
    new: 'border-blue-200 bg-blue-50 text-blue-700',
    processing: 'border-amber-200 bg-amber-50 text-amber-700',
    resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    spam: 'border-rose-200 bg-rose-50 text-rose-700',
};

const STATUS_ICON: Record<string, typeof MailOpen> = {
    new: MailOpen,
    processing: CalendarClock,
    resolved: Mail,
    spam: Mail,
};

const STATUS_TONE: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'neutral'> = {
    new: 'info',
    processing: 'warning',
    resolved: 'success',
    spam: 'danger',
};

const PER_PAGE_OPTIONS = ['10', '15', '25', '50'] as const;

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
    { value: '', label: '全部狀態' },
    { value: 'new', label: '新訊息' },
    { value: 'processing', label: '處理中' },
    { value: 'resolved', label: '已解決' },
    { value: 'spam', label: '垃圾訊息' },
];

function buildPayload(state: FilterFormState) {
    return {
        keyword: state.keyword || null,
        status: state.status || null,
        from: state.from || null,
        to: state.to || null,
        per_page: state.per_page ? Number(state.per_page) : null,
    };
}

function renderStatusBadge(status: string, label: string) {
    const badgeClass = STATUS_BADGE_CLASS[status] ?? 'border-neutral-200 bg-neutral-100 text-neutral-700';

    return (
        <Badge variant="outline" className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', badgeClass)}>
            {label}
        </Badge>
    );
}

function MessageMobileCard({ message, locale, onOpen }: { message: ManageMessageListItem; locale: string; onOpen: () => void }) {
    const { t: tMessages } = useTranslator('manage.messages');
    const statusLabel = tMessages(`status.${message.status}`, message.status);
    const IconComponent = STATUS_ICON[message.status] ?? MailOpen;

    const metadata = [
        {
            label: tMessages('table.created', '建立時間'),
            value: formatDateTime(message.created_at, locale) || '—',
            icon: <CalendarClock className="h-3.5 w-3.5 text-neutral-400" />,
        },
        {
            label: tMessages('detail.contact', '聯絡人'),
            value: (
                <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{message.name || tMessages('detail.unknown_name', '訪客')}</span>
                </span>
            ),
        },
    ];

    return (
        <DataCard
            title={message.subject ?? tMessages('table.no_subject', '未填寫主旨')}
            description={message.message.slice(0, 120)}
            status={{
                label: statusLabel,
                tone: STATUS_TONE[message.status] ?? 'neutral',
                icon: <IconComponent className="h-3.5 w-3.5" aria-hidden="true" />,
            }}
            metadata={metadata}
            actions={[
                <Button key="open" type="button" variant="tonal" className="w-full justify-center gap-2" onClick={onOpen}>
                    <Mail className="h-4 w-4" />
                    {tMessages('detail.open', '檢視內容')}
                </Button>,
            ]}
            mobileActions={[
                <Button key="open-mobile" type="button" variant="outline" className="w-full justify-center gap-2" onClick={onOpen}>
                    <Mail className="h-4 w-4" />
                    {tMessages('detail.open', '檢視內容')}
                </Button>,
            ]}
        >
            <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="break-all">{message.email}</span>
                </div>
                {message.phone ? (
                    <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="break-all">{message.phone}</span>
                    </div>
                ) : null}
            </div>
        </DataCard>
    );
}

export default function ManageAdminMessagesIndex() {
    const page = usePage<ManageAdminMessagesPageProps>();
    const { messages, filters, filterOptions, statusSummary } = page.props;
    const locale = page.props.locale ?? 'zh-TW';

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
        per_page: String(filters.per_page ?? messages.meta.per_page ?? Number(PER_PAGE_OPTIONS[1])),
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

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setFilterForm((prev) => ({ ...prev, status: value }));
        applyFilters({ status: value });
    };

    const handleStatusChangeForTabs = (value: string) => {
        setFilterForm((prev) => ({ ...prev, status: value }));
        applyFilters({ status: value });
    };

    const handleDateChange = (field: 'from' | 'to') => (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setFilterForm((prev) => ({ ...prev, [field]: value }));
        applyFilters({ [field]: value } as Partial<FilterFormState>);
    };

    const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters();
    };

    const handleResetFilters = () => {
        setFilterForm(defaultFilterForm);
        applyFilters(defaultFilterForm, { replace: true });
    };

    const openDatePicker = useCallback((event: FocusEvent<HTMLInputElement> | MouseEvent<HTMLInputElement>) => {
        const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void };
        input.showPicker?.();
    }, []);

    const handlePerPageChange = (value: number) => {
        const next = String(value);
        setFilterForm((prev) => ({ ...prev, per_page: next }));
        applyFilters({ per_page: next }, { replace: true });
    };

    const toolbar = (
        <ManageToolbar
            wrap
            primary={[
                <StatusFilterTabs
                    key="status"
                    value={filterForm.status}
                    onChange={handleStatusChangeForTabs}
                    options={STATUS_OPTIONS}
                />,
            ]}
            secondary={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className={manageToolbarPrimaryButtonClass('gap-2')}
                        asChild
                    >
                        <Link href="#">
                            <Download className="h-4 w-4" />
                            {tMessages('actions.export', '匯出紀錄')}
                        </Link>
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className={manageToolbarPrimaryButtonClass('gap-2')}
                    >
                        <MailPlus className="h-4 w-4" />
                        {tMessages('actions.new', '建立新訊息')}
                    </Button>
                </div>
            }
        >
            <FilterPanel>
                <div className="grid grid-cols-12 gap-3">
                    {/* 搜尋框 */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                        <label className="text-sm font-medium text-neutral-700">
                            {tMessages('filters.keyword_label', '搜尋訊息')}
                        </label>
                        <Input
                            type="search"
                            value={filterForm.keyword}
                            onChange={handleKeywordChange}
                            placeholder={tMessages('filters.keyword_placeholder', '搜尋主旨或聯絡人')}
                            className={manageFilterControlClass()}
                        />
                    </div>

                    {/* 起始日期 */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                        <label className="text-sm font-medium text-neutral-700">
                            {tMessages('filters.from', '起始日期')}
                        </label>
                        <Input
                            type="date"
                            value={filterForm.from}
                            onChange={handleDateChange('from')}
                            onClick={openDatePicker}
                            onFocus={openDatePicker}
                            className={manageFilterControlClass('w-full px-3')}
                        />
                    </div>

                    {/* 結束日期 */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                        <label className="text-sm font-medium text-neutral-700">
                            {tMessages('filters.to', '結束日期')}
                        </label>
                        <Input
                            type="date"
                            value={filterForm.to}
                            onChange={handleDateChange('to')}
                            onClick={openDatePicker}
                            onFocus={openDatePicker}
                            className={manageFilterControlClass('w-full px-3')}
                        />
                    </div>

                    {/* 套用條件按鈕 */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                        <label className="text-sm font-medium text-neutral-700 opacity-0">
                            {tMessages('filters.apply_label', '操作')}
                        </label>
                        <Button
                            type="button"
                            size="sm"
                            variant="tonal"
                            className={manageToolbarPrimaryButtonClass('w-full gap-2')}
                            onClick={() => applyFilters()}
                        >
                            <Filter className="h-4 w-4" />
                            {tMessages('filters.apply', '套用條件')}
                        </Button>
                    </div>

                    {/* 重設按鈕 */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                        <label className="text-sm font-medium text-neutral-700 opacity-0">
                            {tMessages('filters.reset_label', '重設')}
                        </label>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className={manageToolbarSecondaryButtonClass('w-full hover:text-neutral-800')}
                            onClick={handleResetFilters}
                        >
                            {tMessages('filters.reset', '重設')}
                        </Button>
                    </div>
                </div>
            </FilterPanel>
        </ManageToolbar>
    );

    const hasMessages = messages.data.length > 0;
    const paginationMeta = {
        current_page: messages.meta.current_page ?? 1,
        last_page: messages.meta.last_page ?? 1,
        per_page: messages.meta.per_page ?? Number(filterForm.per_page),
        total: messages.meta.total ?? 0,
        from: messages.meta.from ?? 0,
        to: messages.meta.to ?? 0,
        links: messages.meta.links,
    };

    const renderTableRows = (items: ManageMessageListItem[]) => {
        if (items.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="py-12">
                        <TableEmpty
                            title={tMessages('empty.title', '尚無訊息')}
                            description={tMessages('empty.description', '目前沒有符合條件的聯絡表單紀錄。')}
                        />
                    </TableCell>
                </TableRow>
            );
        }

        return items.map((message) => {
            const statusLabel = tMessages(`status.${message.status}`, message.status);
            const createdAt = formatDateTime(message.created_at, locale) || '—';
            const processedAt = formatDateTime(message.processed_at, locale) || tMessages('table.unprocessed', '尚未處理');

            return (
                <TableRow
                    key={message.id}
                    className="cursor-pointer border-b border-neutral-200/70 transition hover:bg-blue-50/40"
                    onClick={() => setSelectedMessage(message)}
                >
                    <TableCell className="max-w-[280px]">
                        <div className="flex flex-col gap-1">
                            <span className="font-medium text-neutral-900">
                                {message.subject ?? tMessages('table.no_subject', '未填寫主旨')}
                            </span>
                            <span className="text-xs text-neutral-500">
                                {message.name} · {message.email}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell>{renderStatusBadge(message.status, statusLabel)}</TableCell>
                    <TableCell className="text-sm text-neutral-600">{createdAt}</TableCell>
                    <TableCell className="text-sm text-neutral-600">{processedAt}</TableCell>
                    <TableCell className="w-20 text-right">
                        <Button type="button" variant="ghost" size="sm" className="h-8 px-3 text-blue-600 hover:text-blue-700">
                            {tMessages('detail.open', '檢視內容')}
                        </Button>
                    </TableCell>
                </TableRow>
            );
        });
    };

    const statusOverview = (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {filterOptions.statuses.map((status) => {
                const valueKey = String(status.value);
                const count = statusSummary[valueKey] ?? status.count ?? 0;
                const Icon = STATUS_ICON[valueKey] ?? MailOpen;

                return (
                    <StatCard
                        key={valueKey}
                        title={tMessages(`status.${valueKey}`, status.label)}
                        value={String(count)}
                        icon={Icon}
                        trend="flat"
                    />
                );
            })}
        </section>
    );

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={tMessages('description', '集中檢視訪客透過聯絡表單傳送的訊息，並追蹤處理狀態。')}
                breadcrumbs={breadcrumbs}
                toolbar={toolbar}
            >
                {statusOverview}

                <section className="mt-4 rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <ResponsiveDataView
                        table={() => (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-neutral-200/70 bg-neutral-50/70">
                                            <TableHead className="min-w-[280px] text-neutral-500">
                                                {tMessages('table.subject', '主旨')}
                                            </TableHead>
                                            <TableHead className="min-w-[140px] text-neutral-500">
                                                {tMessages('table.status', '狀態')}
                                            </TableHead>
                                            <TableHead className="min-w-[160px] text-neutral-500">
                                                {tMessages('table.created', '建立時間')}
                                            </TableHead>
                                            <TableHead className="min-w-[160px] text-neutral-500">
                                                {tMessages('table.processed', '處理時間')}
                                            </TableHead>
                                            <TableHead className="w-20" aria-label={tMessages('table.actions', '操作')} />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>{renderTableRows(messages.data)}</TableBody>
                                </Table>
                            </div>
                        )}
                        card={() => (
                            <div className="space-y-3">
                                {hasMessages
                                    ? messages.data.map((message) => (
                                          <MessageMobileCard
                                              key={message.id}
                                              message={message}
                                              locale={locale}
                                              onOpen={() => setSelectedMessage(message)}
                                          />
                                      ))
                                    : (
                                          <div className="rounded-xl border border-dashed border-neutral-200 bg-white/70 p-6 text-center">
                                              <TableEmpty
                                                  title={tMessages('empty.title', '尚無訊息')}
                                                  description={tMessages('empty.description', '目前沒有符合條件的聯絡表單紀錄。')}
                                              />
                                          </div>
                                      )}
                            </div>
                        )}
                    />

                    <div className="border-t border-neutral-200/80 px-4 py-3">
                        <Pagination
                            meta={paginationMeta}
                            onPerPageChange={handlePerPageChange}
                            perPageOptions={PER_PAGE_OPTIONS.map((item) => Number(item))}
                        />
                    </div>
                </section>
            </ManagePage>

            <Sheet open={!!selectedMessage} onOpenChange={(open) => (open ? null : setSelectedMessage(null))}>
                <SheetContent className="w-full max-w-2xl">
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
                                {renderStatusBadge(
                                    selectedMessage.status,
                                    tMessages(`status.${selectedMessage.status}`, selectedMessage.status)
                                )}
                                <span className="text-xs text-neutral-400">
                                    {formatDateTime(selectedMessage.created_at, locale)}
                                </span>
                            </div>

                            <div className="space-y-2 rounded-lg border border-neutral-200/80 bg-neutral-50/80 p-3 text-sm text-neutral-600">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-neutral-400" />
                                    <span>{selectedMessage.name || tMessages('detail.unknown_name', '訪客')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-neutral-400" />
                                    <Link href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:text-blue-700">
                                        {selectedMessage.email}
                                    </Link>
                                </div>
                                {selectedMessage.phone ? (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-neutral-400" />
                                        <span className="break-all">{selectedMessage.phone}</span>
                                    </div>
                                ) : null}
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
                                              time: formatDateTime(selectedMessage.processed_at, locale),
                                          })
                                        : tMessages('detail.not_processed', '尚未紀錄處理時間')}
                                </div>
                                {selectedMessage.processor ? (
                                    <div>{tMessages('detail.processor', '處理人員：:name', { name: selectedMessage.processor.name })}</div>
                                ) : null}
                                {selectedMessage.file_url ? (
                                    <div className="flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        <Link
                                            href={selectedMessage.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            {tMessages('detail.attachment', '下載附件')}
                                        </Link>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex justify-end">
                                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
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


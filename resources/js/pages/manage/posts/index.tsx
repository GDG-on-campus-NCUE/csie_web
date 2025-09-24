import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Head, Link, router, useForm, usePage } from '@inertiajs/react';import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

import ManageLayout from '@/layouts/manage/manage-layout';import ManageLayout from '@/layouts/manage/manage-layout';

import { Button } from '@/components/ui/button';import { Button } from '@/components/ui/button';

import { ManagePageHeader } from '@/components/manage/manage-page-header';import { ManagePageHeader } from '@/components/manage/manage-page-header';

import { Filter, Upload } from 'lucide-react';import { Filter, Upload } from 'lucide-react';

import type { BreadcrumbItem, SharedData } from '@/types';import type { BreadcrumbItem, SharedData } from '@/types';

import { useTranslator } from '@/hooks/use-translator';import { useTranslator } from '@/hooks/use-translator';

import {import {

    type AuthorOption,    type AuthorOption,

    type CategoryOption,    type CategoryOption,

    type FilterState,    type FilterState,

    type PaginationLink,    type PaginationLink,

    type PaginationMeta,    type PaginationMeta,

    type PostFlashMessages,    type PostFlashMessages,

    type PostItem,    type PostItem,

    type PostStatus,    type PostStatus,

} from '@/components/manage/post/post-types';} from '@/components/manage/post/post-types';

import { PostFilterForm } from '@/components/manage/post/post-filter-form';import { PostFilterForm } from '@/components/manage/post/post-filter-form';

import { PostTable } from '@/components/manage/post/post-table';import { PostTable } from '@/components/manage/post/post-table';

import BulkImportDialog from '@/components/manage/post/bulk-import-dialog';import BulkImportDialog from '@/components/manage/post/bulk-import-dialog';

import { PostFlashAlerts } from '@/components/manage/post/post-flash-alerts';import { PostFlashAlerts } from '@/components/manage/post/post-flash-alerts';

import { useToast } from '@/hooks/use-toast';import { useToast } from '@/hooks/use-toast';

import ToastContainer from '@/components/ui/toast-container';import ToastContainer from '@/components/ui/toast-container';



/**/**

 * 公告管理主頁面 * 公告管理主頁面

 * *

 * 功能特色： * 功能特色：

 * - 公告列表展示與篩選 * - 公告列表展示與篩選

 * - 批次操作（發布、取消發布、刪除） * - 批次操作（發布、取消發布、刪除）

 * - CSV 批次匯入功能 * - CSV 批次匯入功能

 * - 完整的錯誤處理和使用者回饋 * - 完整的錯誤處理和使用者回饋

 * - 響應式設計 * - 響應式設計

 */ */



interface PostsIndexProps {interface PostsIndexProps {

    posts: {    posts: {

        data: PostItem[];        data: PostItem[];

        current_page: number;        current_page: number;

        last_page: number;        last_page: number;

        per_page: number;        per_page: number;

        total: number;        total: number;

        from: number | null;        from: number | null;

        to: number | null;        to: number | null;

        links: PaginationLink[];        links: PaginationLink[];

    };    };

    categories: CategoryOption[];    categories: CategoryOption[];

    authors: AuthorOption[];    authors: AuthorOption[];

    filters: Partial<FilterState>;    filters: Partial<FilterState>;

    statusOptions: PostStatus[];    statusOptions: PostStatus[];

    perPageOptions: number[];    perPageOptions: number[];

    can: {    can: {

        create: boolean;        create: boolean;

        bulk: boolean;        bulk: boolean;

        import: boolean;        import: boolean;

    };    };

}}



/**/**

 * 建立初始篩選狀態 * 建立初始篩選狀態

 */ */

const createInitialFilterState = (const createInitialFilterState = (

    filters: PostsIndexProps['filters'],    filters: PostsIndexProps['filters'],

    defaultPerPage: number,    defaultPerPage: number,

): FilterState => ({): FilterState => ({

    search: filters.search ?? '',    search: filters.search ?? '',

    category: filters.category ?? '',    category: filters.category ?? '',

    status: filters.status ?? '',    status: filters.status ?? '',

    author: filters.author ?? '',    author: filters.author ?? '',

    date_from: filters.date_from ?? '',    date_from: filters.date_from ?? '',

    date_to: filters.date_to ?? '',    date_to: filters.date_to ?? '',

    per_page: filters.per_page ?? String(defaultPerPage),    per_page: filters.per_page ?? String(defaultPerPage),

});});



export default function PostsIndex({ posts, categories, authors, filters, statusOptions, perPageOptions, can }: PostsIndexProps) {export default function PostsIndex({ posts, categories, authors, filters, statusOptions, perPageOptions, can }: PostsIndexProps) {

    // 基本設定    // 基本設定

    const page = usePage<SharedData & { flash?: PostFlashMessages }>();    const page = usePage<SharedData & { flash?: PostFlashMessages }>();

    const { locale } = page.props;    const { locale } = page.props;

    const flashMessages: PostFlashMessages = page.props.flash ?? {};    const flashMessages: PostFlashMessages = page.props.flash ?? {};

    const { t } = useTranslator('manage');    const { t } = useTranslator('manage');



    // 語言設定    // 語言設定

    const fallbackLanguage = locale?.toLowerCase() === 'zh-tw' ? 'zh' : 'en';    const fallbackLanguage = locale?.toLowerCase() === 'zh-tw' ? 'zh' : 'en';

    const localeForDate = locale?.toLowerCase() === 'zh-tw' ? 'zh-TW' : 'en';    const localeForDate = locale?.toLowerCase() === 'zh-tw' ? 'zh-TW' : 'en';



    // 分頁與篩選狀態    // 分頁與篩選狀態

    const pagination: PaginationMeta = {    const pagination: PaginationMeta = {

        current_page: posts.current_page,        current_page: posts.current_page,

        last_page: posts.last_page,        last_page: posts.last_page,

        per_page: posts.per_page,        per_page: posts.per_page,

        total: posts.total,        total: posts.total,

        from: posts.from,        from: posts.from,

        to: posts.to,        to: posts.to,

    };    };

    const paginationLinks = posts.links;    const paginationLinks = posts.links;

    const defaultPerPage = perPageOptions[0] || 15;    const defaultPerPage = perPageOptions[0] || 15;



    // 狀態管理    // 狀態管理

    const [filterState, setFilterState] = useState<FilterState>(    const [filterState, setFilterState] = useState<FilterState>(

        createInitialFilterState(filters, defaultPerPage)        createInitialFilterState(filters, defaultPerPage)

    );    );

    const [selected, setSelected] = useState<number[]>([]);    const [selected, setSelected] = useState<number[]>([]);



    // Toast 管理    // Toast 管理

    const {    const {

        toasts,        toasts,

        showSuccess,        showSuccess,

        showError,        showError,

        showInfo,        showInfo,

        showBatchErrors,        showWarning,

        dismissToast        showBatchErrors,

    } = useToast();        dismissToast

    } = useToast();

    // 批次操作表單

    const bulkForm = useForm<{    // 批次操作表單

        action: 'publish' | 'unpublish' | 'delete';    const bulkForm = useForm<{

        ids: number[];        action: 'publish' | 'unpublish' | 'delete';

    }>({        ids: number[];

        action: 'publish',    }>({

        ids: [],        action: 'publish',

    });        ids: [],

    });

    // 參考和快取

    const skipFlashToastRef = useRef(false);    // 參考和快取

    const previousFlashRef = useRef<PostFlashMessages>({});    const skipFlashToastRef = useRef(false);

    const previousFlashRef = useRef<PostFlashMessages>({});

    // 計算屬性

    const iconActionClass = useMemo(() => 'h-4 w-4', []);    // 計算屬性

    const hasFlashAlerts = useMemo(() =>    const iconActionClass = useMemo(() => 'h-4 w-4', []);

        Boolean(flashMessages.success || flashMessages.error ||    const hasFlashAlerts = useMemo(() =>

               (flashMessages.importErrors && flashMessages.importErrors.length > 0)),        Boolean(flashMessages.success || flashMessages.error || flashMessages.warning ||

        [flashMessages]               (flashMessages.importErrors && flashMessages.importErrors.length > 0)),

    );        [flashMessages]

    const hasActiveFilters = useMemo(() =>    );

        filterState.search !== '' ||    const hasActiveFilters = useMemo(() =>

        filterState.category !== '' ||        filterState.search !== '' ||

        filterState.status !== '' ||        filterState.category !== '' ||

        filterState.author !== '' ||        filterState.status !== '' ||

        filterState.date_from !== '' ||        filterState.author !== '' ||

        filterState.date_to !== '',        filterState.date_from !== '' ||

        [filterState],        filterState.date_to !== '',

    );        [filterState],

    );

    // 麵包屑導航

    const breadcrumbs: BreadcrumbItem[] = [    // 麵包屑導航

        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },    const breadcrumbs: BreadcrumbItem[] = [

        { title: t('layout.breadcrumbs.posts', '公告管理'), href: '/manage/posts' },        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },

    ];        { title: t('layout.breadcrumbs.posts', '公告管理'), href: '/manage/posts' },

    ];

    /**

     * 處理篩選條件變更    /**

     */     * 處理篩選條件變更

    const handleFilterChange = useCallback(     */

        (key: keyof FilterState, value: string) => {    const handleFilterChange = useCallback(

            setFilterState((previous) => ({ ...previous, [key]: value }));        (key: keyof FilterState, value: string) => {

        },            setFilterState((previous) => ({ ...previous, [key]: value }));

        [],        },

    );        [],

    );

    /**

     * 套用篩選條件    /**

     */     * 套用篩選條件

    const applyFilters = useCallback((event?: FormEvent<HTMLFormElement>) => {     */

        event?.preventDefault();    const applyFilters = useCallback((event?: FormEvent<HTMLFormElement>) => {

        router.get(        event?.preventDefault();

            '/manage/posts',        router.get(

            {            '/manage/posts',

                ...Object.fromEntries(            {

                    Object.entries(filterState).filter(([, value]) => value !== ''),                ...Object.fromEntries(

                ),                    Object.entries(filterState).filter(([, value]) => value !== ''),

            },                ),

            { preserveState: true, preserveScroll: true }            },

        );            { preserveState: true, preserveScroll: true }

    }, [filterState]);        );

    }, [filterState]);

    /**

     * 重置篩選條件    /**

     */     * 重置篩選條件

    const resetFilters = useCallback(() => {     */

        const initialState = createInitialFilterState({}, defaultPerPage);    const resetFilters = useCallback(() => {

        setFilterState(initialState);        const initialState = createInitialFilterState({}, defaultPerPage);

        router.get('/manage/posts', {}, { preserveState: true, preserveScroll: true });        setFilterState(initialState);

    }, [defaultPerPage]);        router.get('/manage/posts', {}, { preserveState: true, preserveScroll: true });

    }, [defaultPerPage]);

    /**

     * 切換頁面    /**

     */     * 切換頁面

    const changePage = useCallback((page: number) => {     */

        if (page === pagination.current_page || page < 1 || page > pagination.last_page) {    const changePage = useCallback((page: number) => {

            return;        if (page === pagination.current_page || page < 1 || page > pagination.last_page) {

        }            return;

        }

        const params = {

            ...Object.fromEntries(        const params = {

                Object.entries(filterState).filter(([, value]) => value !== '')            ...Object.fromEntries(

            ),                Object.entries(filterState).filter(([, value]) => value !== '')

            page: page.toString(),            ),

        };            page: page.toString(),

        };

        router.get('/manage/posts', params, {

            preserveState: true,        router.get('/manage/posts', params, {

            preserveScroll: true,            preserveState: true,

        });            preserveScroll: true,

    }, [pagination, filterState]);        });

    }, [pagination, filterState]);

    /**

     * 選擇/取消選擇所有項目    /**

     */     * 選擇/取消選擇所有項目

    const handleToggleSelectAll = useCallback((checked: boolean) => {     */

        setSelected(checked ? posts.data.map(post => post.id) : []);    const handleToggleSelectAll = useCallback((checked: boolean) => {

    }, [posts.data]);        setSelected(checked ? posts.data.map(post => post.id) : []);

    }, [posts.data]);

    /**

     * 選擇/取消選擇單一項目    /**

     */     * 選擇/取消選擇單一項目

    const handleToggleSelection = useCallback((postId: number) => {     */

        setSelected(prev => {    const handleToggleSelection = useCallback((postId: number) => {

            if (prev.includes(postId)) {        setSelected(prev => {

                return prev.filter(id => id !== postId);            if (prev.includes(postId)) {

            } else {                return prev.filter(id => id !== postId);

                return [...prev, postId];            } else {

            }                return [...prev, postId];

        });            }

    }, []);        });

    }, []);

    /**

     * 執行批次操作    /**

     */     * 執行批次操作

    const performBulkAction = useCallback((action: 'publish' | 'unpublish' | 'delete') => {     */

        if (selected.length === 0 || bulkForm.processing) return;    const performBulkAction = useCallback((action: 'publish' | 'unpublish' | 'delete') => {

        if (selected.length === 0 || bulkForm.processing) return;

        // 確認刪除操作

        if (action === 'delete') {        // 確認刪除操作

            const confirmed = window.confirm(        if (action === 'delete') {

                t('posts.index.bulk.delete_confirm',            const confirmed = window.confirm(

                  `確定要刪除選取的 ${selected.length} 筆公告嗎？此操作無法復原。`)                t('posts.index.bulk.delete_confirm',

            );                  `確定要刪除選取的 ${selected.length} 筆公告嗎？此操作無法復原。`)

            if (!confirmed) return;            );

        }            if (!confirmed) return;

        }

        bulkForm.transform(() => ({

            action,        bulkForm.transform(() => ({

            ids: selected,            action,

        }));            ids: selected,

        }));

        bulkForm.post('/manage/posts/bulk', {

            preserveScroll: true,        bulkForm.post('/manage/posts/bulk', {

            onSuccess: () => {            preserveScroll: true,

                setSelected([]);            onSuccess: () => {

                bulkForm.reset();                setSelected([]);

                skipFlashToastRef.current = true;                bulkForm.reset();

                skipFlashToastRef.current = true;

                const messages = {

                    publish: t('posts.index.bulk.publish_success', '已發布選取的公告'),                const messages = {

                    unpublish: t('posts.index.bulk.unpublish_success', '已取消發布選取的公告'),                    publish: t('posts.index.bulk.publish_success', '已發布選取的公告'),

                    delete: t('posts.index.bulk.delete_success', '已刪除選取的公告'),                    unpublish: t('posts.index.bulk.unpublish_success', '已取消發布選取的公告'),

                };                    delete: t('posts.index.bulk.delete_success', '已刪除選取的公告'),

                };

                showSuccess(

                    t('posts.index.flash.success_title', '操作成功'),                showSuccess(

                    messages[action]                    t('posts.index.flash.success_title', '操作成功'),

                );                    messages[action]

            },                );

            onError: (errors) => {            },

                skipFlashToastRef.current = true;            onError: (errors) => {

                const errorMessages = Object.values(errors)                skipFlashToastRef.current = true;

                    .flat()                const errorMessages = Object.values(errors)

                    .map((value) => String(value))                    .flat()

                    .filter((value) => value.length > 0);                    .map((value) => String(value))

                    .filter((value) => value.length > 0);

                showBatchErrors(

                    errorMessages.length > 0 ? errorMessages : [                showBatchErrors(

                        t('posts.index.bulk.error_fallback', '批次操作失敗，請重新嘗試')                    errorMessages.length > 0 ? errorMessages : [

                    ],                        t('posts.index.bulk.error_fallback', '批次操作失敗，請重新嘗試')

                    t('posts.index.flash.error_title', '操作失敗')                    ],

                );                    t('posts.index.flash.error_title', '操作失敗')

            },                );

        });            },

    }, [selected, bulkForm, t, showSuccess, showBatchErrors]);        });

    }, [selected, bulkForm, t, showSuccess, showBatchErrors]);

    // 批次匯入處理函數

    const handleImportStart = useCallback((message: string) => {    // 批次匯入處理函數

        showInfo(    const handleImportStart = useCallback((message: string) => {

            t('posts.index.import.start_title', fallbackLanguage === 'zh' ? '開始匯入' : 'Import started'),        showInfo(

            message            t('posts.index.import.start_title', fallbackLanguage === 'zh' ? '開始匯入' : 'Import started'),

        );            message

    }, [showInfo, t, fallbackLanguage]);        );

    }, [showInfo, t, fallbackLanguage]);

    const handleImportSuccess = useCallback((message: string) => {

        skipFlashToastRef.current = true;    const handleImportSuccess = useCallback((message: string) => {

        showSuccess(        skipFlashToastRef.current = true;

            t('posts.index.flash.success_title', '操作成功'),        showSuccess(

            message            t('posts.index.flash.success_title', '操作成功'),

        );            message

        );

        // 重新載入頁面資料

        router.reload({ only: ['posts'] });        // 重新載入頁面資料

    }, [showSuccess, t]);        router.reload({ only: ['posts'] });

    }, [showSuccess, t]);

    const handleImportError = useCallback((messages: string[]) => {

        skipFlashToastRef.current = true;    const handleImportError = useCallback((messages: string[]) => {

        showBatchErrors(        skipFlashToastRef.current = true;

            messages,        showBatchErrors(

            t('posts.index.import.error_title', fallbackLanguage === 'zh' ? '匯入失敗' : 'Import failed')            messages,

        );            t('posts.index.import.error_title', fallbackLanguage === 'zh' ? '匯入失敗' : 'Import failed')

    }, [showBatchErrors, t, fallbackLanguage]);        );

    }, [showBatchErrors, t, fallbackLanguage]);

    const handleImportClientError = useCallback((message: string) => {

        showError(    const handleImportClientError = useCallback((message: string) => {

            t('posts.index.import.error_title', fallbackLanguage === 'zh' ? '匯入失敗' : 'Import failed'),        showError(

            message            t('posts.index.import.error_title', fallbackLanguage === 'zh' ? '匯入失敗' : 'Import failed'),

        );            message

    }, [showError, t, fallbackLanguage]);        );

    }, [showError, t, fallbackLanguage]);

    // 副作用處理

    useEffect(() => {    // 副作用處理

        setFilterState(createInitialFilterState(filters, defaultPerPage));    useEffect(() => {

    }, [filters, defaultPerPage]);        setFilterState(createInitialFilterState(filters, defaultPerPage));

    }, [filters, defaultPerPage]);

    useEffect(() => {

        setSelected([]);    useEffect(() => {

    }, [pagination.current_page, pagination.total]);        setSelected([]);

    }, [pagination.current_page, pagination.total]);

    /**

     * 處理後端 flash 訊息    /**

     */     * 處理後端 flash 訊息

    useEffect(() => {     */

        if (skipFlashToastRef.current) {    useEffect(() => {

            previousFlashRef.current = flashMessages;        if (skipFlashToastRef.current) {

            skipFlashToastRef.current = false;            previousFlashRef.current = flashMessages;

            return;            skipFlashToastRef.current = false;

        }            return;

        }

        // 成功訊息

        if (flashMessages.success && flashMessages.success !== previousFlashRef.current.success) {        // 成功訊息

            showSuccess(        if (flashMessages.success && flashMessages.success !== previousFlashRef.current.success) {

                t('posts.index.flash.success_title', '操作成功'),            showSuccess(

                flashMessages.success                t('posts.index.flash.success_title', '操作成功'),

            );                flashMessages.success

        }            );

        }

        // 錯誤訊息

        if (flashMessages.error && flashMessages.error !== previousFlashRef.current.error) {        // 錯誤訊息

            showError(        if (flashMessages.error && flashMessages.error !== previousFlashRef.current.error) {

                t('posts.index.flash.error_title', '操作失敗'),            showError(

                flashMessages.error                t('posts.index.flash.error_title', '操作失敗'),

            );                flashMessages.error

        }            );

        }

        // 匯入錯誤訊息

        const importErrors = flashMessages.importErrors || [];        // 警告訊息

        const previousImportErrors = previousFlashRef.current.importErrors || [];        if (flashMessages.warning && flashMessages.warning !== previousFlashRef.current.warning) {

            showWarning(

        const newImportErrors = importErrors.filter(error =>                t('posts.index.flash.warning_title', '注意'),

            !previousImportErrors.includes(error)                flashMessages.warning

        );            );

        }

        if (newImportErrors.length > 0) {

            showBatchErrors(        // 匯入錯誤訊息

                newImportErrors,        const importErrors = flashMessages.importErrors || [];

                t('posts.index.import.error_title', fallbackLanguage === 'zh' ? '匯入錯誤' : 'Import errors')        const previousImportErrors = previousFlashRef.current.importErrors || [];

            );

        }        const newImportErrors = importErrors.filter(error =>

            !previousImportErrors.includes(error)

        previousFlashRef.current = flashMessages;        );

    }, [flashMessages, showSuccess, showError, showBatchErrors, t, fallbackLanguage]);

        if (newImportErrors.length > 0) {

    return (            showBatchErrors(

        <ManageLayout breadcrumbs={breadcrumbs}>                newImportErrors,

            <Head title={t('posts.index.title', '公告管理')} />                t('posts.index.import.error_title', fallbackLanguage === 'zh' ? '匯入錯誤' : 'Import errors')

            );

            {/* Toast 容器 */}        }

            <ToastContainer

                toasts={toasts}        previousFlashRef.current = flashMessages;

                onDismiss={dismissToast}    }, [flashMessages, showSuccess, showError, showWarning, showBatchErrors, t, fallbackLanguage]);

                position="bottom-right"

            />    return (

        <ManageLayout breadcrumbs={breadcrumbs}>

            <section className="space-y-6">            <Head title={t('posts.index.title', '公告管理')} />

                {/* Flash 提示訊息 */}

                {hasFlashAlerts && <PostFlashAlerts messages={flashMessages} t={t} />}            {/* Toast 容器 */}

            <ToastContainer

                {/* 頁面標頭 */}                toasts={toasts}

                <ManagePageHeader                onDismiss={dismissToast}

                    badge={{                position="bottom-right"

                        icon: <Filter className="h-4 w-4" />,            />

                        label: t('posts.index.badge', '公告總覽')

                    }}            <section className="space-y-6">

                    title={t('posts.index.title', '公告管理')}                {/* Flash 提示訊息 */}

                    description={t(                {hasFlashAlerts && <PostFlashAlerts messages={flashMessages} t={t} />}

                        'posts.index.description',

                        '管理公告分類、排程發布及附件檔案，確保資訊即時且一致。',                {/* 頁面標頭 */}

                    )}                <ManagePageHeader

                    actions={                    badge={{

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">                        icon: <Filter className="h-4 w-4" />,

                            {/* 批次匯入按鈕 */}                        label: t('posts.index.badge', '公告總覽')

                            {(can.bulk && can.import) && (                    }}

                                <BulkImportDialog                    title={t('posts.index.title', '公告管理')}

                                    t={t}                    description={t(

                                    fallbackLanguage={fallbackLanguage}                        'posts.index.description',

                                    trigger={                        '管理公告分類、排程發布及附件檔案，確保資訊即時且一致。',

                                        <Button variant="outline" className="rounded-full px-6">                    )}

                                            <Upload className="mr-2 h-4 w-4" />                    actions={

                                            {t('posts.index.actions.import_csv',                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                                              fallbackLanguage === 'zh' ? '批次匯入' : 'Bulk Import')}                            {/* 批次匯入按鈕 */}

                                        </Button>                            {(can.bulk && can.import) && (

                                    }                                <BulkImportDialog

                                    onStart={handleImportStart}                                    t={t}

                                    onSuccess={handleImportSuccess}                                    fallbackLanguage={fallbackLanguage}

                                    onError={handleImportError}                                    trigger={

                                    onClientError={handleImportClientError}                                        <Button variant="outline" className="rounded-full px-6">

                                />                                            <Upload className="mr-2 h-4 w-4" />

                            )}                                            {t('posts.index.actions.import_csv',

                                              fallbackLanguage === 'zh' ? '批次匯入' : 'Bulk Import')}

                            {/* 新增公告按鈕 */}                                        </Button>

                            {can.create && (                                    }

                                <Button asChild className="rounded-full px-6">                                    onStart={handleImportStart}

                                    <Link href="/manage/posts/create">                                    onSuccess={handleImportSuccess}

                                        {t('posts.index.create', '新增公告')}                                    onError={handleImportError}

                                    </Link>                                    onClientError={handleImportClientError}

                                </Button>                                />

                            )}                            )}

                        </div>

                    }                            {/* 新增公告按鈕 */}

                />                            {can.create && (

                                <Button asChild className="rounded-full px-6">

                {/* 篩選表單 */}                                    <Link href="/manage/posts/create">

                <PostFilterForm                                        {t('posts.index.create', '新增公告')}

                    filterState={filterState}                                    </Link>

                    categories={categories}                                </Button>

                    authors={authors}                            )}

                    statusOptions={statusOptions}                        </div>

                    perPageOptions={perPageOptions}                    }

                    hasActiveFilters={hasActiveFilters}                />

                    onChange={handleFilterChange}

                    onSubmit={applyFilters}                {/* 篩選表單 */}

                    onReset={resetFilters}                <PostFilterForm

                    t={t}                    filterState={filterState}

                    fallbackLanguage={fallbackLanguage}                    categories={categories}

                />                    authors={authors}

                    statusOptions={statusOptions}

                {/* 公告列表 */}                    perPageOptions={perPageOptions}

                <PostTable                    hasActiveFilters={hasActiveFilters}

                    posts={posts.data}                    onChange={handleFilterChange}

                    selectedIds={selected}                    onSubmit={applyFilters}

                    canBulk={can.bulk}                    onReset={resetFilters}

                    onToggleSelectAll={handleToggleSelectAll}                    t={t}

                    onToggleSelection={handleToggleSelection}                    fallbackLanguage={fallbackLanguage}

                    onBulkAction={performBulkAction}                />

                    bulkFormProcessing={bulkForm.processing}

                    pagination={pagination}                {/* 公告列表 */}

                    paginationLinks={paginationLinks}                <PostTable

                    changePage={changePage}                    posts={posts.data}

                    iconActionClass={iconActionClass}                    selectedIds={selected}

                    t={t}                    canBulk={can.bulk}

                    fallbackLanguage={fallbackLanguage}                    onToggleSelectAll={handleToggleSelectAll}

                    localeForDate={localeForDate}                    onToggleSelection={handleToggleSelection}

                />                    onBulkAction={performBulkAction}

            </section>                    bulkFormProcessing={bulkForm.processing}

        </ManageLayout>                    pagination={pagination}

    );                    paginationLinks={paginationLinks}

}                    changePage={changePage}
                    iconActionClass={iconActionClass}
                    t={t}
                    fallbackLanguage={fallbackLanguage}
                    localeForDate={localeForDate}
                />
            </section>
        </ManageLayout>
    );
}

interface PostsIndexProps {
    posts: {
        data: PostItem[];
        links: PaginationLink[];
        meta: PaginationMeta;
    };
    categories: CategoryOption[];
    authors: AuthorOption[];
    filters: Partial<Record<'search' | 'category' | 'status' | 'author' | 'date_from' | 'date_to' | 'per_page', string>>;
    statusOptions: Array<PostStatus>;
    perPageOptions: number[];
    can: {
        create: boolean;
        bulk: boolean;
    };
}

const createInitialFilterState = (
    filters: PostsIndexProps['filters'],
    defaultPerPage: number,
): FilterState => ({
    search: filters.search ?? '',
    category: filters.category ?? '',
    status: filters.status ?? '',
    author: filters.author ?? '',
    date_from: filters.date_from ?? '',
    date_to: filters.date_to ?? '',
    per_page: filters.per_page ?? String(defaultPerPage),
});

export default function PostsIndex({ posts, categories, authors, filters, statusOptions, perPageOptions, can }: PostsIndexProps) {
    const { auth, flash } = usePage<SharedData & { flash?: PostFlashMessages }>().props;
    const userRole = auth?.user?.role ?? 'user';
    const layoutRole: 'admin' | 'teacher' | 'user' =
        userRole === 'admin' ? 'admin' : userRole === 'teacher' ? 'teacher' : 'user';
    const { t, localeKey } = useTranslator('manage');
    const fallbackLanguage: 'zh' | 'en' = localeKey === 'zh-TW' ? 'zh' : 'en';
    const localeForDate: 'zh-TW' | 'en' = localeKey === 'zh-TW' ? 'zh-TW' : 'en';
    const iconActionClass = cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'h-9 w-9 p-0');
    const defaultPerPage = perPageOptions[0] ?? 20;

    const flashMessages: PostFlashMessages = flash ?? {};
    const hasFlashAlerts = Boolean(
        flashMessages.success ||
            flashMessages.error ||
            (flashMessages.importErrors && flashMessages.importErrors.length > 0),
    );

    const [selected, setSelected] = useState<number[]>([]);
    const [filterState, setFilterState] = useState<FilterState>(
        createInitialFilterState(filters, defaultPerPage),
    );
    const resolvedPerPage = Number(filterState.per_page || defaultPerPage);

    const postData = posts?.data ?? [];
    const pagination: PaginationMeta = posts?.meta ?? {
        current_page: 1,
        last_page: 1,
        per_page: resolvedPerPage,
        total: postData.length,
    };
    const paginationLinks = posts?.links ?? [];

    const bulkForm = useForm({
        action: '',
        ids: [] as number[],
    });

    const { toasts, showToast, dismissToast } = usePostToast();
    const skipFlashToastRef = useRef(false);
    const previousFlashRef = useRef<PostFlashMessages>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.posts', '公告管理'), href: '/manage/posts' },
    ];

    const handleFilterChange = useCallback(
        (key: keyof FilterState, value: string) => {
            setFilterState((previous) => ({ ...previous, [key]: value }));
        },
        [],
    );

    const applyFilters = (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        router.get(
            '/manage/posts',
            {
                ...Object.fromEntries(
                    Object.entries(filterState).filter(([, value]) => value !== ''),
                ),
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const resetFilters = () => {
        const resetState = createInitialFilterState({}, defaultPerPage);
        setFilterState(resetState);
        router.get(
            '/manage/posts',
            { per_page: defaultPerPage },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(postData.map((post) => post.id));
        } else {
            setSelected([]);
        }
    };

    const toggleSelection = (postId: number) => {
        setSelected((prev) =>
            prev.includes(postId)
                ? prev.filter((id) => id !== postId)
                : [...prev, postId],
        );
    };

    const performBulkAction = (action: 'publish' | 'unpublish' | 'delete') => {
        if (selected.length === 0 || bulkForm.processing) return;

        bulkForm.transform(() => ({
            action,
            ids: selected,
        }));

        bulkForm.post('/manage/posts/bulk', {
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                bulkForm.reset();
                skipFlashToastRef.current = true;
                showToast({
                    type: 'success',
                    title: t('posts.index.flash.success_title', '操作成功'),
                    description: t('posts.index.bulk.success', '批次操作已完成。'),
                });
            },
            onError: (errors) => {
                skipFlashToastRef.current = true;
                const messages = Object.values(errors)
                    .flat()
                    .map((value) => String(value))
                    .filter((value) => value.length > 0);
                showToast({
                    type: 'error',
                    title: t('posts.index.flash.error_title', '操作失敗'),
                    description:
                        messages[0] ?? t('posts.index.bulk.error', '批次操作失敗，請稍後再試。'),
                });
            },
            onFinish: () => {
                bulkForm.setData('action', '');
            },
        });
    };

    const changePage = (page: number) => {
        if (page <= 0 || page > pagination.last_page || page === pagination.current_page) {
            return;
        }

        router.get(
            '/manage/posts',
            {
                ...Object.fromEntries(
                    Object.entries(filterState).filter(([, value]) => value !== ''),
                ),
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const hasActiveFilters = useMemo(
        () =>
            filterState.search !== '' ||
            filterState.category !== '' ||
            filterState.status !== '' ||
            filterState.author !== '' ||
            filterState.date_from !== '' ||
            filterState.date_to !== '',
        [filterState],
    );

    const handleImportStart = useCallback(
        (message: string) => {
            showToast({
                type: 'info',
                title: t('posts.index.import.start_title', fallbackLanguage === 'zh' ? '開始匯入' : 'Import started'),
                description: message,
            });
        },
        [showToast, t, fallbackLanguage],
    );

    const handleImportSuccess = useCallback(
        (message?: string) => {
            skipFlashToastRef.current = true;
            showToast({
                type: 'success',
                title: t('posts.index.flash.success_title', '操作成功'),
                description: message ?? t('posts.index.import.success_toast', '公告匯入已送出'),
            });
        },
        [showToast, t],
    );

    const handleImportError = useCallback(
        (messages: string[]) => {
            skipFlashToastRef.current = true;
            showToast({
                type: 'error',
                title: t('posts.index.flash.error_title', '操作失敗'),
                description:
                    messages[0] ?? t('posts.index.import.error_fallback', '匯入失敗，請確認檔案內容或稍後再試。'),
            });
        },
        [showToast, t],
    );

    const handleImportClientError = useCallback(
        (message: string) => {
            showToast({
                type: 'error',
                title: t('posts.index.flash.error_title', '操作失敗'),
                description: message,
            });
        },
        [showToast, t],
    );

    useEffect(() => {
        setFilterState(createInitialFilterState(filters, defaultPerPage));
    }, [filters, defaultPerPage]);

    useEffect(() => {
        setSelected([]);
    }, [pagination.current_page, pagination.total]);

    // 根據後端 flash 訊息補上 toast 提示，確保使用者能即時掌握狀態。
    useEffect(() => {
        if (skipFlashToastRef.current) {
            previousFlashRef.current = flashMessages;
            skipFlashToastRef.current = false;
            return;
        }

        if (flashMessages.success && flashMessages.success !== previousFlashRef.current.success) {
            showToast({
                type: 'success',
                title: t('posts.index.flash.success_title', '操作成功'),
                description: flashMessages.success,
            });
        }

        if (flashMessages.error && flashMessages.error !== previousFlashRef.current.error) {
            showToast({
                type: 'error',
                title: t('posts.index.flash.error_title', '操作失敗'),
                description: flashMessages.error,
            });
        }

        const previousImportErrors = previousFlashRef.current.importErrors ?? [];
        const currentImportErrors = flashMessages.importErrors ?? [];

        currentImportErrors
            .filter((message) => !previousImportErrors.includes(message))
            .forEach((message) => {
                showToast({
                    type: 'error',
                    title: t('posts.index.import.error_title', '部分資料未匯入'),
                    description: message,
                });
            });

        previousFlashRef.current = flashMessages;
    }, [flashMessages, showToast, t]);

    return (
        <ManageLayout role={layoutRole} breadcrumbs={breadcrumbs}>
            <Head title={t('posts.index.title', '公告管理')} />
            <PostToastContainer toasts={toasts} onDismiss={dismissToast} />

            <section className="space-y-6">
                {hasFlashAlerts && <PostFlashAlerts messages={flashMessages} t={t} />}

                <ManagePageHeader
                    badge={{ icon: <Filter className="h-4 w-4" />, label: t('posts.index.badge', '公告總覽') }}
                    title={t('posts.index.title', '公告管理')}
                    description={t(
                        'posts.index.description',
                        '管理公告分類、排程發布及附件檔案，確保資訊即時且一致。',
                    )}
                    actions={
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            {can.bulk && (
                                <PostImportUploader
                                    t={t}
                                    fallbackLanguage={fallbackLanguage}
                                    trigger={
                                        <Button variant="outline" className="rounded-full px-6">
                                            <Upload className="mr-2 h-4 w-4" />
                                            {t('posts.index.actions.import_csv', fallbackLanguage === 'zh' ? '批次發布' : 'Bulk import')}
                                        </Button>
                                    }
                                    onStart={handleImportStart}
                                    onSuccess={handleImportSuccess}
                                    onError={handleImportError}
                                    onClientError={handleImportClientError}
                                />
                            )}
                            {can.create && (
                                <Button asChild className="rounded-full px-6">
                                    <Link href="/manage/posts/create">{t('posts.index.create', '新增公告')}</Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                <PostFilterForm
                    filterState={filterState}
                    categories={categories}
                    statusOptions={statusOptions}
                    authors={authors}
                    perPageOptions={perPageOptions}
                    hasActiveFilters={hasActiveFilters}
                    onChange={handleFilterChange}
                    onSubmit={applyFilters}
                    onReset={resetFilters}
                    t={t}
                    fallbackLanguage={fallbackLanguage}
                />

                <PostTable
                    posts={postData}
                    selectedIds={selected}
                    canBulk={can.bulk}
                    onToggleSelectAll={toggleSelectAll}
                    onToggleSelection={toggleSelection}
                    onBulkAction={performBulkAction}
                    bulkFormProcessing={bulkForm.processing}
                    pagination={pagination}
                    paginationLinks={paginationLinks}
                    changePage={changePage}
                    iconActionClass={iconActionClass}
                    t={t}
                    fallbackLanguage={fallbackLanguage}
                    localeForDate={localeForDate}
                />
            </section>
        </ManageLayout>
    );
}

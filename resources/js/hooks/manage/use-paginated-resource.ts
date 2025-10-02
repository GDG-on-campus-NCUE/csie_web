import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchPaginatedResource, type ManageApiError } from '@/lib/manage/api-client';
import type { PaginatedResponse, PaginationMeta } from '@/types/manage';

export interface UsePaginatedResourceOptions<
    TData,
    TFilters extends Record<string, unknown>,
> {
    route: string;
    initialParams?: Partial<TFilters & { page: number; perPage: number }>;
    initialData?: TData[];
    initialMeta?: PaginationMeta;
    autoFetch?: boolean;
    keepPreviousData?: boolean;
    transformResponse?: (response: PaginatedResponse<TData>) => PaginatedResponse<TData>;
}

export interface PaginatedResourceState<TData> {
    data: TData[];
    meta: PaginationMeta;
    isLoading: boolean;
    isRefetching: boolean;
    error: ManageApiError | null;
}

export interface PaginatedResourceHandlers<TFilters extends Record<string, unknown>> {
    params: TFilters & { page: number; perPage: number };
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onFilterChange: (nextFilters: Partial<TFilters>, options?: { keepPage?: boolean }) => void;
    refresh: () => Promise<void>;
}

const DEFAULT_META: PaginationMeta = {
    current_page: 1,
    from: null,
    last_page: 1,
    path: '',
    per_page: 10,
    to: null,
    total: 0,
};

export function usePaginatedResource<
    TData = unknown,
    TFilters extends Record<string, unknown> = Record<string, unknown>,
>({
    route,
    initialParams,
    initialData,
    initialMeta,
    autoFetch = true,
    keepPreviousData = true,
    transformResponse,
}: UsePaginatedResourceOptions<TData, TFilters>) {
    const mergedInitialParams = useMemo(() => {
        const basePage = initialParams?.page ?? 1;
        const basePerPage = initialParams?.perPage ?? 10;
        const rest = { ...initialParams } as Partial<TFilters & { page: number; perPage: number }>;
        delete rest.page;
        delete rest.perPage;
        return {
            ...(rest as unknown as TFilters),
            page: basePage,
            perPage: basePerPage,
        } as TFilters & { page: number; perPage: number };
    }, [initialParams]);

    const [params, setParams] = useState<TFilters & { page: number; perPage: number }>(mergedInitialParams);
    const [state, setState] = useState<PaginatedResourceState<TData>>({
        data: (initialData as TData[]) ?? [],
        meta: initialMeta ?? DEFAULT_META,
        isLoading: autoFetch,
        isRefetching: false,
        error: null,
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    const setLoadingState = useCallback(() => {
        setState((prev) => ({
            data: keepPreviousData ? prev.data : [],
            meta: keepPreviousData ? prev.meta : DEFAULT_META,
            isLoading: prev.data.length === 0 || !keepPreviousData,
            isRefetching: keepPreviousData && prev.data.length > 0,
            error: null,
        }));
    }, [keepPreviousData]);

    const performFetch = useCallback(
        async (overrideParams?: Partial<TFilters & { page: number; perPage: number }>) => {
            const controller = new AbortController();
            abortControllerRef.current?.abort();
            abortControllerRef.current = controller;

            setLoadingState();

            try {
                const mergedParams = {
                    ...params,
                    ...overrideParams,
                };

                const rawResponse = await fetchPaginatedResource<PaginatedResponse<TData>>(route, {
                    params: mergedParams,
                    signal: controller.signal,
                });
                const response = transformResponse ? transformResponse(rawResponse) : rawResponse;

                setState({
                    data: (response.data ?? []) as TData[],
                    meta: response.meta ?? DEFAULT_META,
                    isLoading: false,
                    isRefetching: false,
                    error: null,
                });
            } catch (error) {
                if ((error as Error)?.name === 'CanceledError' || error instanceof DOMException) {
                    return;
                }

                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isRefetching: false,
                    error: (error as ManageApiError) ?? null,
                }));
            }
        },
        [params, route, setLoadingState, transformResponse]
    );

    useEffect(() => {
        if (!autoFetch) {
            return;
        }

        performFetch();

        return () => {
            abortControllerRef.current?.abort();
        };
    }, [autoFetch, performFetch, params]);

    const handlers = useMemo<PaginatedResourceHandlers<TFilters>>(
        () => ({
            params,
            onPageChange: (page: number) => {
                setParams((prev) => ({
                    ...prev,
                    page,
                }));
            },
            onPerPageChange: (perPage: number) => {
                setParams((prev) => ({
                    ...prev,
                    perPage,
                    page: 1,
                }));
            },
            onFilterChange: (nextFilters: Partial<TFilters>, options) => {
                setParams((prev) => ({
                    ...prev,
                    ...(nextFilters as unknown as TFilters),
                    page: options?.keepPage ? prev.page : 1,
                }));
            },
            refresh: () => performFetch(),
        }),
        [params, performFetch]
    );

    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    return {
        state: {
            data: state.data,
            meta: state.meta,
            isLoading: state.isLoading,
            isRefetching: state.isRefetching,
            error: state.error,
        },
        ...handlers,
    };
}

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

export interface ManageApiError extends Error {
    status?: number;
    errors?: Record<string, string[]>;
    data?: unknown;
}

type RetryableAxiosRequestConfig = AxiosRequestConfig & {
    __isRetryRequest?: boolean;
};

const BASE_HEADERS = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
};

let cachedCsrfToken: string | null = null;
let csrfPromise: Promise<void> | null = null;

function resolveCsrfTokenFromDom(): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const meta = document.head?.querySelector('meta[name="csrf-token"]');
    return meta?.getAttribute('content') ?? null;
}

function resolveCsrfTokenFromCookie(): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/i);
    return match ? decodeURIComponent(match[1]) : null;
}

async function refreshCsrfToken(): Promise<void> {
    if (!csrfPromise) {
        csrfPromise = axios
            .get('/sanctum/csrf-cookie', {
            withCredentials: true,
            headers: BASE_HEADERS,
        })
            .then(() => {
                cachedCsrfToken = resolveCsrfTokenFromDom() ?? resolveCsrfTokenFromCookie();
            })
            .finally(() => {
                csrfPromise = null;
            });
    }

    await csrfPromise;
}

function ensureCsrfHeader(config: AxiosRequestConfig): AxiosRequestConfig {
    if (!config.headers) {
        config.headers = {};
    }

    if (!cachedCsrfToken) {
        cachedCsrfToken = resolveCsrfTokenFromDom() ?? resolveCsrfTokenFromCookie();
    }

    if (cachedCsrfToken) {
        config.headers['X-CSRF-TOKEN'] = cachedCsrfToken;
    }

    return config;
}

export const apiClient: AxiosInstance = axios.create({
    baseURL: '/manage',
    withCredentials: true,
    headers: BASE_HEADERS,
});

apiClient.interceptors.request.use(async (config) => {
    ensureCsrfHeader(config);
    return config;
});

type ErrorResponse = {
    message?: string;
    errors?: Record<string, string[]>;
    [key: string]: unknown;
};

function extractMessage(error: AxiosError | Error): string {
    if ('response' in error && error.response?.data) {
        const data = error.response.data as unknown;
        if (typeof data === 'string') {
            return data;
        }

        if (typeof data === 'object' && data && 'message' in data && typeof (data as ErrorResponse).message === 'string') {
            return (data as ErrorResponse).message ?? error.message;
        }
    }

    return error.message;
}

function normalizeAxiosError(error: AxiosError): ManageApiError {
    const normalized: ManageApiError = new Error(extractMessage(error));
    normalized.status = error.response?.status;
    normalized.data = error.response?.data;

    if (error.response?.status === 422) {
        const data = error.response.data as unknown;
        if (typeof data === 'object' && data && 'errors' in data) {
            normalized.errors = (data as ErrorResponse).errors ?? {};
        }
    }

    return normalized;
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const { response, config } = error;

        if (response?.status === 419 && config && !(config as RetryableAxiosRequestConfig).__isRetryRequest) {
            try {
                await refreshCsrfToken();
                const retryConfig: RetryableAxiosRequestConfig = {
                    ...config,
                    __isRetryRequest: true,
                };
                ensureCsrfHeader(retryConfig);
                return apiClient.request(retryConfig);
            } catch {
                return Promise.reject(normalizeAxiosError(error));
            }
        }

        return Promise.reject(normalizeAxiosError(error));
    }
);

export function isManageApiError(error: unknown): error is ManageApiError {
    return error instanceof Error && 'status' in error;
}

export interface FetchPaginatedOptions {
    params?: Record<string, unknown>;
    signal?: AbortSignal;
}

export async function fetchPaginatedResource<T>(route: string, { params, signal }: FetchPaginatedOptions = {}) {
    const response = await apiClient.get<T>(route, { params, signal });
    return response.data;
}

export async function postFormData<T>(route: string, data: FormData, config?: AxiosRequestConfig) {
    const response = await apiClient.post<T>(route, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        ...config,
    });
    return response.data;
}

export async function requestJson<T>(config: AxiosRequestConfig) {
    ensureCsrfHeader(config);
    const response = await apiClient.request<T>({
        ...config,
        headers: {
            ...BASE_HEADERS,
            ...config.headers,
        },
    });
    return response.data;
}

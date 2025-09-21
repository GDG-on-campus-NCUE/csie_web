// 臨時版本：在測試環境中補齊 Wayfinder 產生的查詢字串工具
export type QueryValue = string | number | boolean | null | undefined;
export type QueryRecord = Record<string, QueryValue>;

export interface RouteQueryOptions {
    query?: QueryRecord;
    mergeQuery?: QueryRecord;
}

export type RouteDefinition<Method extends string | readonly string[] = string> = Method extends readonly string[]
    ? { url: string; methods: Method }
    : { url: string; method: Method };

export type RouteFormDefinition<Method extends string | readonly string[] = string> = Method extends readonly string[]
    ? { action: string; method: Method[number] }
    : { action: string; method: Method };

function appendParams(params: URLSearchParams, source?: QueryRecord) {
    if (!source) {
        return;
    }

    Object.entries(source).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        params.append(key, String(value));
    });
}

export function queryParams(options?: RouteQueryOptions): string {
    if (!options) {
        return '';
    }

    const params = new URLSearchParams();
    appendParams(params, options.query);
    appendParams(params, options.mergeQuery);

    const query = params.toString();
    return query ? `?${query}` : '';
}

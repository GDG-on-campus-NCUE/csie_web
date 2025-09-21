// 這份宣告檔用來補齊由 Laravel Wayfinder 與 Action 生成器動態產出的模組
// 於測試環境中並不會實際存在，因此在此以 any 型別提供最小化的型別定義。

declare module '@/actions/*' {
    const controller: any;
    export default controller;
}

declare module '@/routes/*' {
    export type RouteQueryOptions = Record<string, unknown>;
    export type RouteDefinition<Method extends string | readonly string[] = string> = Method extends readonly string[]
        ? { url: string; methods: Method }
        : { url: string; method: Method };
    export type RouteFormDefinition<Method extends string | readonly string[] = string> = Method extends readonly string[]
        ? { action: string; method: Method[number] }
        : { action: string; method: Method };
    export function url(options?: RouteQueryOptions): string;
    export const form: any;
    export const get: any;
    export const post: any;
    export const put: any;
    export const patch: any;
    export const head: any;
    export const destroy: any;
    export const edit: any;
    export const request: any;
    export const send: any;
    const route: any;
    export default route;
}

declare module '../wayfinder' {
    export type RouteQueryOptions = Record<string, unknown>;
    export type RouteDefinition<Method extends string | readonly string[] = string> = Method extends readonly string[]
        ? { url: string; methods: Method }
        : { url: string; method: Method };
    export type RouteFormDefinition<Method extends string | readonly string[] = string> = Method extends readonly string[]
        ? { action: string; method: Method[number] }
        : { action: string; method: Method };
    export function queryParams(options?: RouteQueryOptions): string;
}

declare module './../wayfinder' {
    export * from '../wayfinder';
}

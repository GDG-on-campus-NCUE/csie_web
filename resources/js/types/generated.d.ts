// 這份宣告檔用來補齊由 Laravel Wayfinder 與 Action 生成器動態產出的模組
// 於測試環境中並不會實際存在，因此在此以 any 型別提供最小化的型別定義。

declare module '@/actions/*' {
    const controller: (...args: unknown[]) => unknown;
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
    export type RouteInvoker = {
        (...args: unknown[]): string;
        url: (options?: RouteQueryOptions) => string;
        form: (...args: unknown[]) => RouteFormDefinition;
    };
    export function url(options?: RouteQueryOptions): string;
    export const form: (...args: unknown[]) => RouteFormDefinition;
    export const get: (...args: unknown[]) => RouteDefinition;
    export const post: (...args: unknown[]) => RouteDefinition;
    export const put: (...args: unknown[]) => RouteDefinition;
    export const patch: (...args: unknown[]) => RouteDefinition;
    export const head: (...args: unknown[]) => RouteDefinition;
    export const destroy: (...args: unknown[]) => RouteDefinition;
    export const edit: (...args: unknown[]) => RouteDefinition;
    export const request: (...args: unknown[]) => RouteDefinition;
    export const send: (...args: unknown[]) => RouteDefinition;
    const route: RouteInvoker;
    export default route;
}

declare module '@/routes' {
    import type { RouteInvoker } from '@/routes/*';

    export const home: RouteInvoker;
    export const login: RouteInvoker;
    export const logout: RouteInvoker;
    export const register: RouteInvoker;
    export const dashboard: RouteInvoker;
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

declare module '*wayfinder/index' {
    export * from '../wayfinder';
}

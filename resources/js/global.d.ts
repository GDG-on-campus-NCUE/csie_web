export {};

declare global {
    type RouteParams = Record<string, string | number | boolean | null | undefined>;
    function route(name: string, params?: RouteParams): string;
}

import { type Method, type UrlMethodPair } from '@inertiajs/core';

export type RouteMethod = Method;

export type RouteHelper = UrlMethodPair & string;

export interface ControllerFormConfig {
    action: string;
    method: RouteMethod;
}

export interface ControllerAction {
    method: RouteMethod;
    route: RouteHelper;
    form(): ControllerFormConfig;
}

export function createRoute(url: string, method: RouteMethod = 'get'): RouteHelper {
    return Object.assign(url, {
        url,
        method,
    }) as RouteHelper;
}

export function createControllerAction(route: RouteHelper, overrideMethod?: RouteMethod): ControllerAction {
    const method = overrideMethod ?? route.method;

    return {
        method,
        route,
        form(): ControllerFormConfig {
            return {
                action: route.url,
                method,
            };
        },
    };
}

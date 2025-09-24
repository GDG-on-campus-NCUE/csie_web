declare module 'vitest' {
    export const vi: typeof jest & {
        importActual<TModule = any>(moduleName: string): Promise<TModule>;
    };
    export const describe: typeof describe;
    export const it: typeof it;
    export const expect: typeof expect;
    export const beforeEach: typeof beforeEach;
    export const afterEach: typeof afterEach;
    export const beforeAll: typeof beforeAll;
    export const afterAll: typeof afterAll;
    export type Mock<TArgs extends any[] = any[], TReturn = any> = jest.Mock<TReturn, TArgs>;
}

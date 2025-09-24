import '@testing-library/jest-dom';

declare module '@jest/globals' {
    interface Matchers<R = unknown> extends jest.Matchers<R> {}
}

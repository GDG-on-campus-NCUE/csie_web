import '@testing-library/jest-dom/jest-globals';

// Mock Inertia.js route helper
(global as any).route = jest.fn((name: string, params?: any) =>
    `/${name}${params ? '?' + new URLSearchParams(params).toString() : ''}`
);

// Mock window.Laravel
Object.defineProperty(window, 'Laravel', {
    writable: true,
    value: {
        locale: 'zh-TW',
        fallbackLocale: 'en',
    },
});

// Setup fetch mock
(global as any).fetch = jest.fn();

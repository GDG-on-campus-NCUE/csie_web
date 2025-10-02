import '@testing-library/jest-dom/jest-globals';

type RouteParams = Record<string, string | number | boolean | null | undefined>;

const routeMock = jest.fn<string, [string, RouteParams?]>((name, params) => {
    const query = params
        ? new URLSearchParams(
              Object.entries(params).reduce<Record<string, string>>((accumulator, [key, value]) => {
                  if (value === undefined || value === null) {
                      return accumulator;
                  }
                  accumulator[key] = String(value);
                  return accumulator;
              }, {}),
          ).toString()
        : '';

    return `/${name}${query ? `?${query}` : ''}`;
});

Object.defineProperty(globalThis, 'route', {
    value: routeMock,
    writable: true,
});

// Mock window.Laravel
Object.defineProperty(window, 'Laravel', {
    writable: true,
    value: {
        locale: 'zh-TW',
        fallbackLocale: 'en',
    },
});

// Setup fetch mock
Object.defineProperty(globalThis, 'fetch', {
    value: jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>(),
    writable: true,
});

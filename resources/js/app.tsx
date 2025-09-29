import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

// 過濾 Radix UI Dialog inert 屬性的警告
const originalWarn = console.warn;
console.warn = (...args) => {
    const message = args.join(' ');
    // 忽略 Radix UI Dialog inert 屬性的警告
    if (message.includes("inert") && message.includes("'true'") && message.includes("boolean")) {
        return;
    }
    originalWarn(...args);
};

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

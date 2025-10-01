import PublicHeader from '@/components/public/header';
import PublicFooter from '@/components/public/footer';
import type { PropsWithChildren } from 'react';

export default function PublicHeaderLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col bg-[var(--surface-base)]">
            <PublicHeader />
            <main className="flex-1">
                <div className="relative isolate flex flex-col gap-0">
                    <span className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#ffb401]/20 blur-3xl" aria-hidden />
                    {children}
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}

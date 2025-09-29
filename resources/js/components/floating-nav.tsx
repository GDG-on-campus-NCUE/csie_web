import { useEffect, useRef, useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useTranslator } from '@/hooks/use-translator';

type NavItem = { key: string; href: string; label?: string };

export default function FloatingNav({ nav }: { nav: NavItem[] }) {
    const { t } = useTranslator('common');
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState<{ x: number; y: number }>(() => ({ x: 16, y: 200 }));
    const moved = useRef(false);
    const start = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            if (!start.current) return;
            e.preventDefault();
            const dx = e.clientX - (start.current?.x ?? 0);
            const dy = e.clientY - (start.current?.y ?? 0);
            if (Math.abs(dx) + Math.abs(dy) > 6) moved.current = true; // mark moved
            setPos((p) => {
                const x = Math.min(window.innerWidth - 56, Math.max(8, p.x + dx));
                const y = Math.min(window.innerHeight - 56, Math.max(60, p.y + dy));
                start.current = { x: e.clientX, y: e.clientY };
                return { x, y };
            });
        };
        const onUp = () => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            start.current = null;
        };
        const el = document.getElementById('floating-nav-button');
        if (!el) return;
        const onDown = (e: PointerEvent) => {
            e.preventDefault();
            start.current = { x: e.clientX, y: e.clientY };
            moved.current = false;
            document.addEventListener('pointermove', onMove, { passive: false } as any);
            document.addEventListener('pointerup', onUp);
        };
        el.addEventListener('pointerdown', onDown);
        return () => el.removeEventListener('pointerdown', onDown);
    }, []);

    const onClick = () => {
        if (moved.current) return; // treat as drag
        setOpen(true);
    };

    return (
        <>
            <button
                id="floating-nav-button"
                onClick={onClick}
                className={cn(
                    'lg:hidden fixed z-50 size-12 rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-primary/15 transition-all duration-200 active:scale-95 cursor-grab hover:shadow-2xl',
                )}
                style={{
                    left: pos.x,
                    top: pos.y,
                    touchAction: 'none',
                    transition: start.current ? 'none' : 'left 200ms ease-out, top 200ms ease-out',
                    willChange: 'left, top',
                } as any}
                aria-label={t('floating_nav.open_navigation', 'Open navigation')}
            >
                <MenuIcon className="size-6 mx-auto" />
            </button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="bottom" className="max-h-[75vh] w-full rounded-t-3xl border-none bg-white/95 p-0 shadow-2xl backdrop-blur">
                    <SheetHeader className="border-b border-neutral-200 px-6 pb-3 pt-4">
                        <SheetTitle className="text-lg font-semibold text-neutral-900">
                            {t('floating_nav.sheet_title', '選單')}
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="grid grid-cols-2 gap-3 px-6 py-6 text-base">
                        {nav.map((item) => (
                            <a
                                key={item.key}
                                href={item.href}
                                className="group rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-center text-sm font-medium text-neutral-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                                onClick={() => setOpen(false)}
                            >
                                {item.label ?? item.key}
                            </a>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </>
    );
}

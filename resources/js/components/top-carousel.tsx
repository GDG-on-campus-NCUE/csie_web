import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/shared/utils';

type Item = {
    // Text-only ticker style
    text?: string;
    href?: string;
    cta?: string;

    // Card/Banner style
    image?: string; // public path, e.g. '/images/banner1.jpg'
    title?: string;
    subtitle?: string;
};

export default function TopCarousel({
    items = [] as Item[],
    interval = 6000,
    className,
}: {
    items: Item[];
    interval?: number;
    className?: string;
}) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    // autoplay with pause on hover/focus
    useEffect(() => {
        if (items.length <= 1 || paused) return;
        const id = setInterval(() => setIndex((i) => (i + 1) % items.length), interval);
        return () => clearInterval(id);
    }, [items.length, interval, paused]);

    // swipe/drag support
    const startX = useRef<number | null>(null);
    const deltaX = useRef(0);
    const onPointerDown = (event: React.PointerEvent) => {
        startX.current = event.clientX;
        deltaX.current = 0;
        event.currentTarget.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: React.PointerEvent) => {
        if (startX.current == null) return;
        deltaX.current = event.clientX - startX.current;
    };
    const onPointerUp = () => {
        if (startX.current == null) return;
        const dx = deltaX.current;
        startX.current = null;
        deltaX.current = 0;
        const threshold = 40;
        if (dx > threshold) setIndex((i) => (i - 1 + items.length) % items.length);
        else if (dx < -threshold) setIndex((i) => (i + 1) % items.length);
    };

    const item = items[index] ?? { text: '' };

    return (
        <div
            className={cn('relative isolate w-full h-full text-white overflow-hidden', className)}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
        >
            {/* teal gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1f3b70] to-[#0b1633]" />

            <div className="relative z-10 mx-auto flex h-full max-w-[100rem] items-center justify-center px-4">
                <div
                    className="relative w-[95%] max-w-screen-xl cursor-pointer select-none overflow-hidden rounded-[1.5rem] bg-white/5 p-2 shadow-[0_10px_30px_rgba(0,0,0,.35)] ring-1 ring-white/15 backdrop-blur-sm md:w-[92%] lg:w-[88%]"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    style={{ touchAction: 'pan-y' }}
                >
                    {/* fade cross-fade stack */}
                    <div className="relative mx-auto w-full" style={{ height: 'min(100%, 560px)' }}>
                        {items.map((it, i) => (
                            <img
                                key={i}
                                src={it.image || ''}
                                alt="banner"
                                className={cn(
                                    'absolute left-1/2 top-1/2 block h-auto max-h-full w-auto max-w-[calc(100%-1rem)] -translate-x-1/2 -translate-y-1/2 object-contain opacity-0 transition-opacity duration-700 ease-[cubic-bezier(.22,1,.36,1)]',
                                    i === index && 'opacity-100'
                                )}
                                draggable={false}
                            />
                        ))}
                        {item.title && (
                            <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-6 text-left text-white md:p-10">
                                <div className="pointer-events-auto flex max-w-2xl flex-col gap-4">
                                    <h3 className="text-2xl font-semibold md:text-4xl">{item.title}</h3>
                                    {item.subtitle && <p className="text-sm text-white/80 md:text-base">{item.subtitle}</p>}
                                    {item.href && (
                                        <Link
                                            href={item.href}
                                            className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/30"
                                        >
                                            {item.cta ?? 'View more'}
                                            <span aria-hidden>→</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* arrows */}
                    {items.length > 1 && (
                        <>
                            <button
                                aria-label="Previous"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIndex((i) => (i - 1 + items.length) % items.length);
                                }}
                                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#1f3b70]/80 p-2 text-white shadow ring-1 ring-[#f5b400]/40 backdrop-blur hover:bg-[#1f3b70]"
                            >
                                ‹
                            </button>
                            <button
                                aria-label="Next"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIndex((i) => (i + 1) % items.length);
                                }}
                                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#1f3b70]/80 p-2 text-white shadow ring-1 ring-[#f5b400]/40 backdrop-blur hover:bg-[#1f3b70]"
                            >
                                ›
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* basic dots when more than one banner */}
            {items.length > 1 && (
                <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 transform">
                    <div className="flex items-center gap-2">
                        {items.map((_, i) => (
                            <button
                                key={i}
                                aria-label={`Go to slide ${i + 1}`}
                                onClick={() => setIndex(i)}
                                className={cn(
                                    'h-1.5 w-1.5 rounded-full bg-white/40 transition-all hover:bg-white/70',
                                    i === index && 'w-3 bg-[#f5b400]'
                                )}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

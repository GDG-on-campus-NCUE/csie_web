import { cn } from '@/lib/shared/utils';
import type { ComponentPropsWithoutRef, ElementType } from 'react';

type FloatVariant = 'slow' | 'medium' | 'horizontal' | false;

interface GlassEnhancements {
    shimmer?: boolean;
    spotlight?: boolean;
    interactive?: boolean;
    float?: FloatVariant;
    bleedShadow?: boolean;
}

type GlassProps<T extends ElementType> = GlassEnhancements & {
    as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'as'>;

interface GlassDefaults {
    interactive?: boolean;
}

function resolveFloatClass(float: FloatVariant) {
    switch (float) {
        case 'slow':
            return 'animate-float-slow';
        case 'medium':
            return 'animate-float-medium';
        case 'horizontal':
            return 'animate-float-horizontal';
        default:
            return null;
    }
}

function createGlassComponent<TDefault extends ElementType>(
    defaultElement: TDefault,
    baseClass: string,
    defaults: GlassDefaults = {},
) {
    function GlassComponent<T extends ElementType = TDefault>({
        as,
        shimmer,
        spotlight,
        interactive,
        float = false,
        bleedShadow,
        className,
        ...rest
    }: GlassProps<T>) {
        const Component = (as ?? defaultElement) as ElementType;
        const resolvedInteractive = interactive ?? defaults.interactive ?? false;

        return (
            <Component
                className={cn(
                    baseClass,
                    shimmer && 'glimmer-border',
                    spotlight && 'glass-spotlight',
                    resolvedInteractive && 'hover-lift interactive-glow',
                    bleedShadow && 'shadow-[0_52px_140px_-70px_rgba(15,23,42,0.65)]',
                    resolveFloatClass(float),
                    'animate-fade-slide',
                    className,
                )}
                {...(rest as ComponentPropsWithoutRef<any>)}
            />
        );
    }

    return GlassComponent;
}

export const GlassPanel = createGlassComponent('div', 'glass-panel', { interactive: true });
export const GlassSurface = createGlassComponent('div', 'glass-surface');
export const GlassTile = createGlassComponent('div', 'glass-tile', { interactive: true });
export const GlassChip = createGlassComponent('span', 'glass-chip');

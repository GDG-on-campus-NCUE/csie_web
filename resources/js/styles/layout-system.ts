import { cn } from '@/lib/shared/utils';

export const brandTokens = {
    primary: {
        hex: '#151f54',
        text: 'text-[#151f54]',
        bg: 'bg-[#151f54]',
        gradient: 'bg-gradient-to-br from-[#151f54] via-[#1f2a6d] to-[#27337d]',
        aura: 'bg-[rgba(21,31,84,0.2)]',
        shadow: 'shadow-[0_40px_120px_-70px_rgba(21,31,84,0.6)]',
    },
    secondary: {
        hex: '#ffb401',
        text: 'text-[#ffb401]',
        bg: 'bg-[#ffb401]',
        gradient: 'bg-gradient-to-br from-[#402400] via-[#8a6300] to-[#ffb401]',
        aura: 'bg-[rgba(255,180,1,0.24)]',
        shadow: 'shadow-[0_40px_120px_-70px_rgba(255,180,1,0.5)]',
    },
    accent: {
        hex: '#fff809',
        text: 'text-[#fff809]',
        bg: 'bg-[#fff809]',
        gradient: 'bg-gradient-to-br from-[#7a6b00] via-[#c0a900] to-[#fff809]',
        aura: 'bg-[rgba(255,248,9,0.26)]',
        shadow: 'shadow-[0_40px_120px_-70px_rgba(255,248,9,0.45)]',
    },
} as const;

export interface PaletteTokens {
    background: string;
    backgroundMuted: string;
    surface: string;
    surfaceAlt: string;
    surfaceInverted: string;
    textPrimary: string;
    textMuted: string;
    textAccent: string;
    surfaceAccent: string;
    surfaceAccentContrast: string;
    border: string;
    focusRing: string;
}

export interface DashboardStatPalette {
    icon: string;
    surface: string;
    chip: string;
    trend: string;
    aura: string;
    hover: string;
}

export interface DashboardActionPalette {
    surface: string;
    icon: string;
    body: string;
    arrow: string;
    hover: string;
}

export const palettes: Record<string, PaletteTokens> = {
    brand: {
        background: 'bg-[#f4f6ff]',
        backgroundMuted: 'bg-[#eef1ff]',
        surface: 'bg-white',
        surfaceAlt: 'bg-[#f8f9ff]',
        surfaceInverted: 'bg-[#151f54] text-white',
        textPrimary: 'text-[#151f54]',
        textMuted: 'text-slate-600',
        textAccent: 'text-[#ffb401]',
        surfaceAccent: 'bg-[#ffb401] text-[#151f54]',
        surfaceAccentContrast: 'bg-[#ffb401]/10 text-[#151f54]',
        border: 'border border-[#d5dcf8]',
        focusRing: 'focus-visible:ring-[#ffb401]/45 focus-visible:outline-none focus-visible:ring-2',
    },
    dashboard: {
        background: 'bg-[#0f153f]',
        backgroundMuted: 'bg-[#111b4f]',
        surface: 'bg-white/12 text-white',
        surfaceAlt: 'bg-[#151f54]/70 text-white',
        surfaceInverted: 'bg-white text-[#151f54]',
        textPrimary: 'text-white',
        textMuted: 'text-white/70',
        textAccent: 'text-[#ffb401]',
        surfaceAccent: 'bg-[#ffb401] text-[#151f54]',
        surfaceAccentContrast: 'bg-[#ffb401]/12 text-[#ffb401]',
        border: 'border border-white/18',
        focusRing: 'focus-visible:ring-[#ffb401]/40 focus-visible:outline-none focus-visible:ring-2',
    },
    midnight: {
        background: 'bg-[#050b2a]',
        backgroundMuted: 'bg-[#0a1440]',
        surface: 'bg-[#0f1c4d] text-white',
        surfaceAlt: 'bg-white/10 text-white',
        surfaceInverted: 'bg-white text-[#050b2a]',
        textPrimary: 'text-white',
        textMuted: 'text-white/70',
        textAccent: 'text-[#90a2ff]',
        surfaceAccent: 'bg-[#90a2ff] text-[#050b2a]',
        surfaceAccentContrast: 'bg-white/10 text-white',
        border: 'border border-white/15',
        focusRing: 'focus-visible:ring-[#90a2ff]/50 focus-visible:outline-none focus-visible:ring-2',
    },
    warm: {
        background: 'bg-white',
        backgroundMuted: 'bg-[#fff8ed]',
        surface: 'bg-white',
        surfaceAlt: 'bg-[#fff4d6]',
        surfaceInverted: 'bg-[#101736] text-white',
        textPrimary: 'text-[#111827]',
        textMuted: 'text-neutral-600',
        textAccent: 'text-[#fca311]',
        surfaceAccent: 'bg-[#fca311] text-[#1a1a1a]',
        surfaceAccentContrast: 'bg-[#fca311]/10 text-[#a35a02]',
        border: 'border border-amber-200/70',
        focusRing: 'focus-visible:ring-[#fca311]/40 focus-visible:outline-none focus-visible:ring-2',
    },
    slate: {
        background: 'bg-gray-50',
        backgroundMuted: 'bg-white',
        surface: 'bg-white',
        surfaceAlt: 'bg-slate-50',
        surfaceInverted: 'bg-slate-900 text-white',
        textPrimary: 'text-slate-900',
        textMuted: 'text-slate-500',
        textAccent: 'text-slate-900',
        surfaceAccent: 'bg-slate-900 text-white',
        surfaceAccentContrast: 'bg-slate-100 text-slate-700',
        border: 'border border-slate-200',
        focusRing: 'focus-visible:ring-slate-400/70 focus-visible:outline-none focus-visible:ring-2',
    },
};

export const dashboardTones: Record<string, { stat: DashboardStatPalette; action: DashboardActionPalette }> = {
    primary: {
        stat: {
            icon: 'bg-gradient-to-br from-[#151f54] via-[#1f2a6d] to-[#27337d] text-white shadow-[0_22px_60px_-28px_rgba(21,31,84,0.65)]',
            surface: 'bg-gradient-to-br from-white/96 via-white/76 to-[#151f54]/14 text-[#151f54]',
            chip: 'border-[#151f54]/30 bg-[#151f54]/12',
            trend: 'text-[#ffb401]',
            aura: 'bg-[rgba(21,31,84,0.18)]',
            hover: 'hover:shadow-[0_36px_110px_-62px_rgba(21,31,84,0.62)]',
        },
        action: {
            surface:
                'bg-gradient-to-br from-[#151f54]/96 via-[#1f2a6d]/92 to-[#0f153f]/88 text-white shadow-[0_48px_140px_-70px_rgba(13,19,63,0.78)]',
            icon: 'bg-white/12 text-white shadow-lg',
            body: 'text-white/75',
            arrow: 'text-[#ffb401]/75',
            hover: 'hover:shadow-[0_52px_150px_-70px_rgba(13,19,63,0.85)]',
        },
    },
    secondary: {
        stat: {
            icon: 'bg-gradient-to-br from-[#8a6300] via-[#c68900] to-[#ffb401] text-white shadow-[0_22px_60px_-28px_rgba(255,180,1,0.55)]',
            surface: 'bg-gradient-to-br from-white/95 via-white/74 to-[#ffb401]/18 text-[#3d2a00]',
            chip: 'border-[#ffb401]/30 bg-[#ffb401]/18',
            trend: 'text-[#8a6300]',
            aura: 'bg-[rgba(255,180,1,0.24)]',
            hover: 'hover:shadow-[0_36px_110px_-62px_rgba(255,180,1,0.48)]',
        },
        action: {
            surface:
                'bg-gradient-to-br from-[#402400]/94 via-[#8a6300]/88 to-[#ffb401]/78 text-white shadow-[0_48px_140px_-70px_rgba(82,48,0,0.7)]',
            icon: 'bg-white/12 text-white shadow-lg',
            body: 'text-[#fff4cc]',
            arrow: 'text-white/80',
            hover: 'hover:shadow-[0_52px_150px_-70px_rgba(64,36,0,0.82)]',
        },
    },
    accent: {
        stat: {
            icon: 'bg-gradient-to-br from-[#7a6b00] via-[#c0a900] to-[#fff809] text-white shadow-[0_22px_60px_-28px_rgba(255,248,9,0.45)]',
            surface: 'bg-gradient-to-br from-white/95 via-white/74 to-[#fff809]/18 text-[#3d3100]',
            chip: 'border-[#fff809]/25 bg-[#fff809]/20',
            trend: 'text-[#151f54]',
            aura: 'bg-[rgba(255,248,9,0.26)]',
            hover: 'hover:shadow-[0_36px_110px_-62px_rgba(255,248,9,0.45)]',
        },
        action: {
            surface:
                'bg-gradient-to-br from-[#151f54]/92 via-[#3d3600]/86 to-[#fff809]/76 text-white shadow-[0_48px_140px_-70px_rgba(21,31,84,0.72)]',
            icon: 'bg-white/14 text-white shadow-lg',
            body: 'text-white/80',
            arrow: 'text-white/75',
            hover: 'hover:shadow-[0_52px_150px_-70px_rgba(21,31,84,0.8)]',
        },
    },
};

export type DashboardTone = keyof typeof dashboardTones;

export interface SectionStyle {
    section: string;
    container: string;
    wrapper?: string;
    description?: string;
}

export interface HeroStyle extends SectionStyle {
    variant: 'split' | 'immersive' | 'centered' | 'banner' | 'auth';
    primary?: string;
    secondary?: string;
    surfaces?: Record<string, string>;
}

export const layoutTokens = {
    page: 'relative flex min-h-screen flex-col bg-[var(--surface-base)] text-foreground antialiased',
    appPage: 'relative flex min-h-screen flex-col bg-white text-neutral-900',
    container: 'content-container',
    containerWide: 'content-container content-container--wide',
    section: 'section-padding',
    sectionTight: 'section-padding-sm',
    sectionMuted: 'section-padding bg-[var(--surface-muted)]',
    sectionGradient: 'section-padding bg-gradient-to-b from-white via-white/80 to-[var(--surface-muted)]',
    sectionDark: 'section-padding bg-[#060d29] text-white',
};

export const surfaceTokens = {
    glass: 'glass-panel',
    panel: 'glass-surface border border-white/14 px-0 py-0',
    panelDense: 'glass-surface border border-white/16 px-0 py-0',
    soft: 'glass-tile border-white/18 bg-white/65 px-0 py-0 backdrop-blur-sm dark:bg-white/5',
    softDense: 'glass-tile border-white/15 bg-white/70 px-0 py-0 dark:bg-white/10',
    card:
        'glass-tile border-white/20 bg-white/70 px-0 py-0 transition-all duration-200 hover:border-white/40 hover:shadow-[0_36px_90px_-60px_rgba(15,23,42,0.45)] dark:bg-white/10',
    cardMuted: 'glass-tile border-white/12 bg-white/55 px-0 py-0 backdrop-blur-sm dark:bg-white/12',
    accentDark:
        'glass-surface glass-spotlight border border-white/10 px-0 py-0 text-white shadow-[0_36px_110px_-60px_rgba(8,13,36,0.85)] dark:border-white/20',
    accentGradient:
        'glass-surface glass-spotlight overflow-hidden border border-white/15 px-0 py-0 text-white shadow-[0_50px_140px_-70px_rgba(6,12,39,0.8)]',
    timeline: 'relative border-l border-primary/20 pl-8',
    timelineItem:
        'relative flex flex-col gap-2 pb-6 last:border-none before:absolute before:-left-[37px] before:top-2 before:size-2.5 before:-translate-x-1/2 before:rounded-full before:bg-primary after:absolute after:-left-[37px] after:top-2 after:h-full after:w-px after:bg-primary/15 last:after:hidden',
};

export const heroVariants: Record<string, HeroStyle> = {
    split: {
        variant: 'split',
        section: layoutTokens.sectionMuted,
        container: layoutTokens.containerWide,
        wrapper:
            'glass-surface glass-spotlight grid gap-8 rounded-[2.75rem] border border-white/15 px-6 py-6 shadow-[0_45px_120px_-60px_rgba(6,12,39,0.55)] backdrop-blur-xl xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:px-12 xl:py-12',
        primary: 'space-y-5 text-neutral-900',
        secondary:
            'glass-tile border-white/20 bg-white/55 p-6 text-neutral-900 shadow-lg backdrop-blur-lg transition duration-200 hover:-translate-y-1 hover:shadow-[0_42px_120px_-60px_rgba(6,12,39,0.5)] dark:bg-white/10',
        surfaces: {
            base: '',
            secondary: '',
        },
    },
    immersive: {
        variant: 'immersive',
        section: layoutTokens.section,
        container: layoutTokens.containerWide,
        wrapper:
            'glass-surface glass-spotlight relative isolate overflow-hidden rounded-[3rem] border border-white/12 px-0 py-0 shadow-[0_55px_140px_-70px_rgba(6,12,39,0.75)]',
        primary:
            'relative flex flex-col gap-6 px-10 py-14 text-white md:px-14 lg:px-18',
        surfaces: {
            base: 'bg-gradient-to-br from-[#050f2e]/95 via-[#1d3bb8] to-[#4dd5c8]/80',
        },
    },
    centered: {
        variant: 'centered',
        section: layoutTokens.section,
        container: layoutTokens.container,
        wrapper:
            'glass-surface mx-auto max-w-3xl space-y-6 border border-white/15 px-8 py-8 text-center shadow-[0_36px_110px_-60px_rgba(6,12,39,0.4)]',
        primary: 'space-y-5 text-neutral-900',
    },
    banner: {
        variant: 'banner',
        section: layoutTokens.section,
        container: layoutTokens.containerWide,
        wrapper:
            'glass-surface glass-spotlight relative isolate overflow-hidden rounded-[2.75rem] border border-white/12 px-0 py-0',
        primary:
            'relative z-10 flex flex-col gap-4 px-8 py-12 text-white md:px-14 md:py-16 lg:px-18 shadow-[0_45px_120px_-60px_rgba(6,12,39,0.75)]',
        surfaces: {
            base: 'bg-gradient-to-r from-[#060d29]/92 via-[#0f1f5a]/80 to-[#2948d3]/70',
        },
    },
    auth: {
        variant: 'auth',
        section: layoutTokens.section,
        container: layoutTokens.containerWide,
        wrapper:
            'glass-surface glass-spotlight grid gap-8 rounded-[2.75rem] border border-white/14 px-6 py-6 shadow-xl backdrop-blur md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:px-10 md:py-10 lg:px-12 lg:py-12',
        primary: 'flex flex-col justify-center gap-6 text-neutral-900',
        secondary:
            'glass-surface glass-spotlight rounded-[2.25rem] border border-white/20 bg-gradient-to-br from-[#050f2e]/95 via-[#0f1c4d]/88 to-[#2746c7]/65 p-8 text-white shadow-[0_32px_90px_-60px_rgba(6,12,39,0.85)]',
    },
};

export const sectionVariants: Record<string, SectionStyle> = {
    standard: {
        section: layoutTokens.section,
        container: layoutTokens.container,
    },
    standardWide: {
        section: layoutTokens.section,
        container: layoutTokens.containerWide,
    },
    muted: {
        section: layoutTokens.sectionMuted,
        container: layoutTokens.container,
    },
    mutedWide: {
        section: layoutTokens.sectionMuted,
        container: layoutTokens.containerWide,
    },
    gradient: {
        section: layoutTokens.sectionGradient,
        container: layoutTokens.containerWide,
    },
    gradientTight: {
        section: cn(layoutTokens.sectionTight, 'bg-gradient-to-br from-[#0f1c4d]/92 via-[#1d3bb8]/72 to-[#4dd5c8]/30 text-white'),
        container: layoutTokens.containerWide,
    },
    withAside: {
        section: layoutTokens.section,
        container: layoutTokens.container,
        wrapper: 'grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]',
    },
    split: {
        section: layoutTokens.section,
        container: layoutTokens.container,
        wrapper: 'grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]',
    },
    mosaic: {
        section: layoutTokens.section,
        container: layoutTokens.containerWide,
        wrapper: 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4',
    },
    metrics: {
        section: layoutTokens.section,
        container: layoutTokens.containerWide,
        wrapper: 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4',
    },
    quickLinks: {
        section: layoutTokens.section,
        container: layoutTokens.containerWide,
        wrapper: 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4',
    },
    timeline: {
        section: layoutTokens.section,
        container: layoutTokens.container,
        wrapper: 'space-y-6',
    },
    denseList: {
        section: layoutTokens.section,
        container: layoutTokens.container,
        wrapper: 'grid gap-6 lg:grid-cols-2',
    },
    fullBleed: {
        section: layoutTokens.section,
        container: 'content-container--wide',
    },
};

export const typographyTokens = {
    eyebrow: 'inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary',
    heroHeading: 'text-3xl font-semibold text-neutral-900 md:text-4xl',
    heroHeadingInverted: 'text-3xl font-semibold text-white md:text-4xl',
    heroDescription: 'max-w-2xl text-base text-neutral-600 md:text-lg',
    heroDescriptionInverted: 'max-w-2xl text-base text-white/80 md:text-lg',
    sectionHeading: 'text-2xl font-semibold text-neutral-900 md:text-3xl',
    sectionDescription: 'max-w-2xl text-neutral-600',
};

export type PaletteName = keyof typeof palettes;

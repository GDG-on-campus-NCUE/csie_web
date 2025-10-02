import { cn } from '@/lib/shared/utils';
import {
    heroVariants,
    layoutTokens,
    palettes,
    type PaletteTokens,
    sectionVariants,
    surfaceTokens,
    type HeroStyle,
    type SectionStyle,
    typographyTokens,
} from './layout-system';

export type PageKey =
    | 'welcome'
    | 'dashboard'
    | 'bulletinsIndex'
    | 'bulletinsShow'
    | 'peopleIndex'
    | 'peopleShow'
    | 'labsIndex'
    | 'labsShow'
    | 'settingsProfile'
    | 'settingsAppearance'
    | 'settingsPassword'
    | 'authLogin'
    | 'authRegister'
    | 'authForgotPassword'
    | 'authResetPassword'
    | 'authVerifyEmail'
    | 'authConfirmPassword';

export interface SectionConfig {
    title: string;
    description: string;
    section: string;
    container: string;
    wrapper?: string;
    primary?: string;
    secondary?: string;
    surfaces?: Record<string, string>;
    palette?: Partial<PaletteTokens>;
    notes?: string[];
}

export interface HeroConfig extends SectionConfig {
    variant: HeroStyle['variant'];
}

export interface PageLayoutPreset {
    key: PageKey;
    name: string;
    description: string;
    palette: PaletteTokens;
    hero?: HeroConfig;
    sections: Record<string, SectionConfig>;
    typography?: Partial<typeof typographyTokens>;
}

function makeSection(
    base: SectionStyle,
    overrides: Omit<SectionConfig, 'section' | 'container'> & {
        section?: string;
        container?: string;
    },
): SectionConfig {
    return {
        section: overrides.section ?? base.section,
        container: overrides.container ?? base.container,
        wrapper: overrides.wrapper ?? base.wrapper,
        title: overrides.title,
        description: overrides.description,
        primary: overrides.primary,
        secondary: overrides.secondary,
        surfaces: overrides.surfaces,
        palette: overrides.palette,
        notes: overrides.notes,
    };
}

function makeHero(
    base: HeroStyle,
    overrides: Omit<HeroConfig, 'variant' | 'section' | 'container'> & {
        section?: string;
        container?: string;
    },
): HeroConfig {
    return {
        variant: base.variant,
        section: overrides.section ?? base.section,
        container: overrides.container ?? base.container,
        wrapper: overrides.wrapper ?? base.wrapper,
        title: overrides.title,
        description: overrides.description,
        primary: overrides.primary ?? base.primary,
        secondary: overrides.secondary ?? base.secondary,
        surfaces: overrides.surfaces ?? base.surfaces,
        palette: overrides.palette,
        notes: overrides.notes,
    };
}

const brandPalette = palettes.brand;
const dashboardPalette = palettes.brand;
const warmPalette = palettes.warm;
const slatePalette = palettes.slate;

export const pageLayouts: Record<PageKey, PageLayoutPreset> = {
    welcome: {
        key: 'welcome',
        name: 'Welcome / Landing',
        description:
            'Public landing page highlighting departmental hero, announcements, quick links, featured labs, faculty spotlight, industry projects, and contact section.',
        palette: brandPalette,
        typography: {
            heroHeading: typographyTokens.heroHeading,
            heroDescription: typographyTokens.heroDescription,
        },
        hero: makeHero(heroVariants.split, {
            title: 'Hero - Split banner with carousel and metrics',
            description:
                'Split hero with brand surface, left column for messaging + stats, right column for carousel or stacked quick metrics. Designed to feel immersive yet structured.',
            wrapper: cn(heroVariants.split.wrapper, 'items-stretch'),
            primary: cn(heroVariants.split.primary, 'space-y-5'),
            secondary: cn(
                'flex h-full flex-col justify-center gap-5 rounded-[2rem] border border-white/50 bg-white/70 p-6 shadow-lg backdrop-blur',
            ),
            surfaces: {
                primary: cn(surfaceTokens.panel, 'h-full px-8 py-8 text-neutral-900 md:px-10 md:py-10'),
                secondary: cn(surfaceTokens.soft, 'h-full space-y-5 px-6 py-6 text-neutral-900 backdrop-blur-lg'),
            },
        }),
        sections: {
            highlights: makeSection(sectionVariants.standardWide, {
                title: 'Highlights & timeline',
                description:
                    'Two-column grid: primary column for featured bulletin with stacked cards, secondary column for timeline list of posts. Ensures variety beyond cards.',
                wrapper: 'grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]',
                primary: 'space-y-6',
                secondary: cn(surfaceTokens.soft, 'h-full space-y-4 px-6 py-6'),
                surfaces: {
                    feature: cn(surfaceTokens.card, 'overflow-hidden px-6 py-6 backdrop-blur-lg'),
                    timeline: cn(surfaceTokens.timeline),
                    timelineItem: surfaceTokens.timelineItem,
                },
            }),
            quickLinks: makeSection(sectionVariants.quickLinks, {
                title: 'Quick access links',
                description:
                    'Four responsive link tiles with gradient highlight accents. Layout uses equal height tiles with subtle hover transitions.',
                wrapper: cn(sectionVariants.quickLinks.wrapper, 'items-stretch'),
                surfaces: {
                    tile: cn(
                        'glass-tile glass-spotlight glimmer-border group relative flex h-full flex-col justify-between gap-5 px-6 py-6 text-left transition duration-300 hover:-translate-y-1.5',
                    ),
                },
                notes: ['Ensure CTA sits at baseline, icons optional, keep copy concise.'],
                section: cn(sectionVariants.quickLinks.section, brandPalette.backgroundMuted),
            }),
            labs: makeSection(sectionVariants.standardWide, {
                title: 'Featured labs',
                description:
                    'Asymmetric layout: hero lab spotlight on left using dark accent surface, supporting labs in masonry grid on right.',
                wrapper: 'grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]',
                primary: cn(surfaceTokens.accentDark, 'relative overflow-hidden px-8 py-8'),
                secondary: 'grid grid-cols-1 gap-6 md:grid-cols-2',
                surfaces: {
                    secondaryCard: cn(surfaceTokens.card, 'px-6 py-6'),
                },
                palette: {
                    surfaceAccent: brandPalette.surfaceAccent,
                    surfaceAccentContrast: brandPalette.surfaceAccentContrast,
                },
            }),
            faculty: makeSection(sectionVariants.standardWide, {
                title: 'Faculty roster',
                description:
                    'Uniform faculty cards presented in a horizontal slider with responsive fallbacks, ensuring equal prominence for every member.',
                wrapper: 'space-y-6',
                primary: 'space-y-4',
                surfaces: {
                    track: 'no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scroll-smooth',
                    card: cn(
                        surfaceTokens.card,
                        'snap-center shrink-0 basis-[260px] px-6 py-6 md:basis-[300px] lg:basis-[320px] border-primary/20 text-neutral-900 dark:border-white/10',
                    ),
                    navButton:
                        'glass-chip inline-flex items-center justify-center border border-white/30 bg-white/10 p-2 text-primary shadow-sm transition hover:bg-white/20',
                },
                section: cn(sectionVariants.standardWide.section, brandPalette.backgroundMuted),
            }),
            projects: makeSection(sectionVariants.standardWide, {
                title: 'Industry collaborations',
                description:
                    'Single-column project digest with rich row styling for readability, adaptable to responsive layouts.',
                wrapper: 'space-y-8',
                primary: cn(
                    surfaceTokens.panel,
                    'overflow-hidden rounded-[2.5rem] border border-primary/20 px-6 py-6 shadow-[0_30px_90px_-58px_rgba(18,35,90,0.35)]',
                ),
                surfaces: {
                    tableRow:
                        'group flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/40 p-6 transition hover:bg-primary/5 hover:shadow-lg md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.7fr)_auto] md:items-center md:gap-6',
                },
            }),
            contact: makeSection(sectionVariants.standard, {
                title: 'Contact CTA',
                description:
                    'Centered CTA bar with address, email, phone and action buttons. Uses pill buttons to differentiate from cards.',
                wrapper: 'grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]',
                primary: cn(surfaceTokens.card, 'flex flex-col gap-5 px-6 py-6'),
                secondary: cn(surfaceTokens.soft, 'flex flex-col justify-between gap-4 px-6 py-6'),
                section: cn(
                    sectionVariants.standard.section,
                    'bg-gradient-to-r from-primary/10 via-transparent to-secondary/20',
                ),
            }),
        },
    },
    dashboard: {
        key: 'dashboard',
        name: 'Admin dashboard',
        description:
            'Admin control center with immersive hero, metric summary grid, quick actions matrix, and timeline-based updates replacing repetitive cards.',
        palette: dashboardPalette,
        hero: makeHero(heroVariants.immersive, {
            title: 'Operations hero',
            description:
                'Full-width hero with summary metrics chips and administrative CTA buttons, kept bright and minimal to complement the app shell.',
            primary: cn(heroVariants.immersive.primary ?? '', 'gap-5 text-neutral-900 md:gap-6'),
            surfaces: {
                base: cn(
                    'relative overflow-hidden bg-white',
                    'after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_top_right,rgba(255,180,1,0.08),transparent_60%)] after:content-[""]',
                ),
            },
            notes: ['Hero includes breadcrumbs via App layout header, keep text concise and use accent chips for KPIs.'],
        }),
        sections: {
            metrics: makeSection(sectionVariants.metrics, {
                title: 'KPI metric grid',
                description:
                    'Adaptive four-column metric grid with accent chips and minimal borders. Uses negative top margin to overlap hero for depth.',
                section: cn(sectionVariants.metrics.section, 'relative isolate bg-gray-50 text-neutral-900'),
                container: cn(sectionVariants.metrics.container, 'relative'),
                wrapper: cn(sectionVariants.metrics.wrapper, '-mt-16 md:-mt-20'),
                surfaces: {
                    card: cn(
                        'rounded-3xl border border-slate-200 bg-white px-6 py-6 text-[#151f54] shadow-sm transition-shadow duration-200 hover:shadow-md',
                    ),
                },
            }),
            quickActions: makeSection(sectionVariants.standardWide, {
                title: 'Administrative quick actions',
                description:
                    'Responsive matrix of navigation tiles with icon badges and directional affordance. Uses equal height tiles for consistency.',
                section: cn(sectionVariants.standardWide.section, 'bg-white text-neutral-900'),
                container: cn(sectionVariants.standardWide.container, 'space-y-8'),
                wrapper: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
                surfaces: {
                    action: cn(
                        'group relative flex h-full flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-white px-6 py-6 text-neutral-900 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-lg',
                    ),
                    badge:
                        'inline-flex items-center justify-center rounded-full border border-slate-200 bg-gray-50 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-600',
                },
            }),
            activity: makeSection(sectionVariants.denseList, {
                title: 'Recent activity & workflows',
                description:
                    'Two-column layout: left uses timeline list for bulletins, right employs checklist-style panels for tasks. Replaces identical card rows.',
                section: cn(sectionVariants.denseList.section, 'bg-gray-50 text-neutral-800'),
                container: cn(sectionVariants.denseList.container, 'space-y-10'),
                wrapper: 'grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]',
                primary: 'rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm',
                secondary: 'rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm',
                surfaces: {
                    timeline: cn(surfaceTokens.timeline),
                    timelineItem: cn(surfaceTokens.timelineItem, 'before:bg-[#ffb401] after:bg-slate-200'),
                    taskRow:
                        'flex items-center justify-between rounded-2xl border border-slate-200 bg-gray-50 px-5 py-3 text-neutral-700 shadow-sm transition-colors duration-200 hover:bg-white',
                },
                notes: ['Keep timeline entries short; ensure icons align with the refreshed brand palette.'],
            }),
        },
    },
    bulletinsIndex: {
        key: 'bulletinsIndex',
        name: 'Bulletin index',
        description:
            'Public bulletin listing with split hero, horizontal category filters, editorial list, and sidebar digest to avoid repetitive cards.',
        palette: brandPalette,
        hero: makeHero(heroVariants.split, {
            title: 'Bulletin hero',
            description: 'Editorial hero with search pill and highlight chips. Secondary column hosts search/filter card.',
            wrapper: cn(heroVariants.split.wrapper, 'items-stretch'),
            primary: cn(heroVariants.split.primary, 'space-y-5'),
            secondary: cn(heroVariants.split.secondary ?? '', 'gap-5'),
            surfaces: {
                primary: cn(surfaceTokens.panel, 'bg-white/90 px-8 py-8 text-neutral-900'),
                search: cn(surfaceTokens.soft, 'h-full justify-center gap-4 bg-white/85 px-6 py-6'),
            },
        }),
        sections: {
            categories: makeSection(sectionVariants.standard, {
                title: 'Category filter bar',
                description: 'Sticky-aware horizontal scroll pill filters styled as chips for responsive usage.',
                wrapper: 'space-y-4',
                primary: 'no-scrollbar flex gap-3 overflow-x-auto pb-1',
                surfaces: {
                    pillActive: 'glass-chip bg-primary text-white shadow-lg px-4 py-2 text-sm',
                    pill: 'glass-chip bg-white/60 text-neutral-600 shadow px-4 py-2 text-sm transition hover:bg-primary/15 hover:text-primary',
                },
            }),
            listing: makeSection(sectionVariants.withAside, {
                title: 'Bulletin list with sidebar',
                description:
                    'Main column uses editorial cards with stacked layout; sidebar hosts spotlight and key dates for contrast.',
                wrapper: cn(sectionVariants.withAside.wrapper ?? '', 'items-start'),
                primary: 'space-y-6',
                secondary: 'space-y-6',
                surfaces: {
                    card: cn(surfaceTokens.card, 'flex flex-col gap-4 px-6 py-6'),
                    sidebarCard: cn(surfaceTokens.soft, 'px-6 py-6'),
                },
            }),
        },
    },
    bulletinsShow: {
        key: 'bulletinsShow',
        name: 'Bulletin detail',
        description:
            'Immersive hero with cover image gradient, editorial body with prose styling, and sidebar attachments to avoid repetitive cards.',
        palette: brandPalette,
        hero: makeHero(heroVariants.banner, {
            title: 'Detail hero banner',
            description: 'Full-width banner overlay on cover image with back CTA and metadata chips.',
            section: layoutTokens.section,
            container: layoutTokens.containerWide,
            wrapper: 'relative isolate overflow-hidden rounded-[3rem]',
            surfaces: {
                base: 'relative',
            },
            notes: ['Use gradient overlays to keep text legible regardless of cover image.'],
        }),
        sections: {
            content: makeSection(sectionVariants.withAside, {
                title: 'Article layout',
                description: 'Two-column layout with prose body and sidebar attachments/follow-up links.',
                wrapper: cn(sectionVariants.withAside.wrapper ?? '', 'items-start'),
                primary: cn(surfaceTokens.soft, 'prose prose-neutral max-w-none px-8 py-8 shadow-xl lg:px-10 lg:py-10'),
                secondary: 'space-y-6',
                surfaces: {
                    attachment: cn(surfaceTokens.soft, 'px-6 py-6'),
                    meta: cn(surfaceTokens.soft, 'px-6 py-6'),
                },
            }),
        },
    },
    peopleIndex: {
        key: 'peopleIndex',
        name: 'People directory',
        description:
            'Directory with statistics hero, filter form, featured profile mosaic, and list layout mixing wide hero cards with compact list.',
        palette: brandPalette,
        hero: makeHero(heroVariants.split, {
            title: 'Directory hero',
            description: 'Split hero with stats chips and role filter form in rounded surface.',
            wrapper: cn(heroVariants.split.wrapper, 'items-stretch'),
            secondary: cn(heroVariants.split.secondary ?? '', 'gap-5'),
            surfaces: {
                primary: cn(surfaceTokens.panel, 'bg-white/90 px-8 py-8'),
                filter: cn(surfaceTokens.soft, 'h-full justify-center gap-4 bg-white/85 px-6 py-6'),
            },
        }),
        sections: {
            directory: makeSection(sectionVariants.standardWide, {
                title: 'Directory mosaic',
                description:
                    'Primary feature card for leading person, secondary grid of profiles with alternating orientation to avoid monotonous cards.',
                wrapper: 'space-y-8',
                primary: 'grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]',
                surfaces: {
                    feature: cn(surfaceTokens.accentDark, 'overflow-hidden px-8 py-8'),
                    grid: 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3',
                    card: cn(surfaceTokens.card, 'h-full px-6 py-6'),
                },
            }),
        },
    },
    peopleShow: {
        key: 'peopleShow',
        name: 'Person profile',
        description:
            'Profile page with gradient hero card, timeline sections, tag chips, and sticky sidebar contact card.',
        palette: brandPalette,
        hero: makeHero(heroVariants.banner, {
            title: 'Profile hero',
            description: 'Hero card with portrait, name, title, and key actions using gradient background.',
            wrapper: 'relative isolate overflow-hidden rounded-[3rem]',
            primary: 'relative flex flex-col gap-6 px-10 py-12 text-white md:px-14 lg:px-20',
            surfaces: {
                base: 'bg-gradient-to-br from-[#050f2e]/95 via-[#1d3bb8]/80 to-[#4dd5c8]/60',
            },
        }),
        sections: {
            overview: makeSection(sectionVariants.withAside, {
                title: 'Profile overview',
                description: 'Main column uses stacked cards for bio, research, education. Sidebar hosts contact card and quick links.',
                wrapper: cn(sectionVariants.withAside.wrapper ?? '', 'items-start'),
                primary: 'space-y-6',
                secondary: 'space-y-6',
                surfaces: {
                    panel: cn(surfaceTokens.card, 'px-6 py-6'),
                    sticky: 'lg:sticky lg:top-28',
                },
            }),
        },
    },
    labsIndex: {
        key: 'labsIndex',
        name: 'Labs directory',
        description:
            'Research lab listing with stat hero, spotlight feature card, supporting grid, and search filters.',
        palette: brandPalette,
        hero: makeHero(heroVariants.split, {
            title: 'Labs hero',
            description: 'Hero with metrics chips and search/filter stack in secondary column.',
            wrapper: cn(heroVariants.split.wrapper, 'items-stretch'),
            primary: cn(heroVariants.split.primary, 'space-y-5'),
            secondary: cn(heroVariants.split.secondary ?? '', 'gap-5'),
            surfaces: {
                primary: cn(surfaceTokens.panel, 'bg-white/90 px-8 py-8'),
                filter: cn(surfaceTokens.soft, 'h-full justify-center gap-4 bg-white/85 px-6 py-6'),
            },
        }),
        sections: {
            listing: makeSection(sectionVariants.standardWide, {
                title: 'Lab spotlight + grid',
                description:
                    'Primary large dark card for featured lab, secondary grid for remaining labs with responsive columns.',
                wrapper: 'space-y-8',
                primary: 'grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]',
                surfaces: {
                    feature: cn(surfaceTokens.accentDark, 'relative overflow-hidden px-8 py-8'),
                    grid: 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3',
                    card: cn(surfaceTokens.card, 'h-full px-6 py-6'),
                },
            }),
        },
    },
    labsShow: {
        key: 'labsShow',
        name: 'Lab detail',
        description:
            'Lab detail with immersive hero, sectioned content, sticky aside for contact, and gallery/timeline mix.',
        palette: brandPalette,
        hero: makeHero(heroVariants.banner, {
            title: 'Lab hero',
            description: 'Hero overlay on lab cover with gradient and metadata chips.',
            wrapper: 'relative isolate overflow-hidden rounded-[3rem]',
            primary: 'relative flex flex-col gap-6 px-10 py-12 text-white md:px-14 lg:px-20',
            surfaces: {
                base: 'bg-gradient-to-br from-[#050f2e]/92 via-[#1d3bb8]/78 to-[#4dd5c8]/65',
            },
        }),
        sections: {
            overview: makeSection(sectionVariants.withAside, {
                title: 'Lab overview with sidebar',
                description:
                    'Main column segmented into intro, research themes, members, achievements, gallery. Sidebar contains contact and CTAs.',
                wrapper: cn(sectionVariants.withAside.wrapper ?? '', 'items-start'),
                primary: 'space-y-6',
                secondary: 'space-y-6',
                surfaces: {
                    panel: cn(surfaceTokens.card, 'px-6 py-6'),
                    gallery:
                        'glass-tile grid grid-cols-2 gap-3 border-white/30 bg-white/60 px-4 py-4 backdrop-blur-sm dark:bg-white/10',
                },
            }),
        },
    },
    settingsProfile: {
        key: 'settingsProfile',
        name: 'Settings – profile',
        description:
            'Application settings page with sidebar navigation layout, hero card header, and form sections in soft surfaces.',
        palette: slatePalette,
        hero: makeHero(heroVariants.banner, {
            title: 'Settings hero',
            description: 'Compact hero for settings forms using slate palette.',
            wrapper: 'relative isolate overflow-hidden rounded-[2.5rem]',
            primary: 'relative flex flex-col gap-4 px-8 py-10 text-white md:px-12',
            surfaces: {
                base: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700',
            },
        }),
        sections: {
            layout: makeSection(sectionVariants.split, {
                title: 'Settings content layout',
                description: 'Sidebar navigation with sticky behavior and main form area using stacked cards.',
                wrapper: cn(sectionVariants.split.wrapper ?? '', 'items-start'),
                primary: 'space-y-6',
                secondary: 'space-y-3 lg:sticky lg:top-24',
                surfaces: {
                    form: cn(surfaceTokens.soft, 'px-6 py-6'),
                    sidebarLink:
                        'glass-chip flex items-center justify-between gap-3 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/60',
                },
            }),
        },
    },
    settingsAppearance: {
        key: 'settingsAppearance',
        name: 'Settings – appearance',
        description: 'Shares settings layout but emphasises theme preview panels.',
        palette: slatePalette,
        hero: makeHero(heroVariants.banner, {
            title: 'Appearance hero',
            description: 'Hero referencing theme previews with gradient background.',
            wrapper: 'relative isolate overflow-hidden rounded-[2.5rem]',
            primary: 'relative flex flex-col gap-4 px-8 py-10 text-white md:px-12',
            surfaces: {
                base: 'bg-gradient-to-r from-slate-900 via-indigo-800 to-indigo-600',
            },
        }),
        sections: {
            layout: makeSection(sectionVariants.split, {
                title: 'Theme configuration',
                description: 'Sidebar nav with preview tiles and controls stacking in main column.',
                wrapper: cn(sectionVariants.split.wrapper ?? '', 'items-start'),
                primary: 'space-y-6',
                secondary: 'space-y-3 lg:sticky lg:top-24',
                surfaces: {
                    panel: cn(surfaceTokens.soft, 'px-6 py-6'),
                    preview: cn(surfaceTokens.card, 'overflow-hidden px-6 py-6'),
                },
            }),
        },
    },
    settingsPassword: {
        key: 'settingsPassword',
        name: 'Settings – password',
        description: 'Security-focused settings layout with alert panel and form stack.',
        palette: slatePalette,
        hero: makeHero(heroVariants.banner, {
            title: 'Security hero',
            description: 'Reinforces security tone with slate gradient.',
            wrapper: 'relative isolate overflow-hidden rounded-[2.5rem]',
            primary: 'relative flex flex-col gap-4 px-8 py-10 text-white md:px-12',
            surfaces: {
                base: 'bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600/80',
            },
        }),
        sections: {
            layout: makeSection(sectionVariants.split, {
                title: 'Password + MFA forms',
                description: 'Sidebar quick links with security tips, main column for form and logs.',
                wrapper: cn(sectionVariants.split.wrapper ?? '', 'items-start'),
                primary: 'space-y-6',
                secondary: 'space-y-3 lg:sticky lg:top-24',
                surfaces: {
                    panel: cn(surfaceTokens.soft, 'px-6 py-6'),
                    alert: 'glass-tile border-amber-200 bg-amber-50/90 px-4 py-4 text-amber-900 shadow-[0_25px_70px_-50px_rgba(217,119,6,0.45)]',
                },
            }),
        },
    },
    authLogin: {
        key: 'authLogin',
        name: 'Auth – login',
        description: 'Authentication page using split hero variant with illustration & form.',
        palette: warmPalette,
        hero: makeHero(heroVariants.auth, {
            title: 'Login layout',
            description: 'Left column hosts messaging; right column displays illustration or ambient gradient.',
            primary: 'flex flex-col gap-5 text-neutral-900',
            secondary: cn(heroVariants.auth.secondary ?? '', 'items-end justify-between bg-gradient-to-br from-[#151f54] via-[#1d3bb8] to-[#4dd5c8]'),
            surfaces: {
                form: cn(surfaceTokens.soft, 'flex flex-col gap-6 px-6 py-6'),
            },
        }),
        sections: {
            form: makeSection(sectionVariants.standard, {
                title: 'Form stack',
                description: 'Compact form area with social login row and subtle footer links.',
                wrapper: 'mx-auto max-w-md space-y-6',
                primary: 'space-y-5',
                surfaces: {
                    card: cn(surfaceTokens.soft, 'px-6 py-6 shadow-lg'),
                },
            }),
        },
    },
    authRegister: {
        key: 'authRegister',
        name: 'Auth – register',
        description: 'Registration page sharing auth hero with additional multi-step hints.',
        palette: warmPalette,
        hero: makeHero(heroVariants.auth, {
            title: 'Register layout',
            description: 'Adds progress indicator to hero messaging zone.',
            primary: 'flex flex-col gap-5 text-neutral-900',
            secondary: cn(heroVariants.auth.secondary ?? '', 'items-end justify-between bg-gradient-to-br from-[#1d3bb8] via-[#4dd5c8] to-[#fca311]'),
            surfaces: {
                form: cn(surfaceTokens.soft, 'grid gap-6 px-6 py-6 shadow-lg md:grid-cols-2'),
            },
        }),
        sections: {
            form: makeSection(sectionVariants.standard, {
                title: 'Registration form',
                description: 'Two-column responsive form with contextual tips below.',
                wrapper: 'mx-auto max-w-3xl space-y-6',
                primary: 'space-y-6',
                surfaces: {
                    panel: cn(surfaceTokens.soft, 'px-6 py-6 shadow-lg'),
                },
            }),
        },
    },
    authForgotPassword: {
        key: 'authForgotPassword',
        name: 'Auth – forgot password',
        description: 'Simple centered form within auth hero palette.',
        palette: warmPalette,
        hero: makeHero(heroVariants.auth, {
            title: 'Forgot password hero',
            description: 'Emphasis on instructions and reassurance text.',
            primary: 'flex flex-col gap-5 text-neutral-900',
            secondary: cn(heroVariants.auth.secondary ?? '', 'items-end justify-between bg-gradient-to-br from-[#151f54] via-[#4dd5c8] to-[#fca311]'),
        }),
        sections: {
            form: makeSection(sectionVariants.standard, {
                title: 'Email recovery form',
                description: 'Centered single-input form with helper text below.',
                wrapper: 'mx-auto max-w-md space-y-6',
                primary: 'space-y-5',
                surfaces: {
                    card: cn(surfaceTokens.soft, 'px-6 py-6 shadow-lg'),
                },
            }),
        },
    },
    authResetPassword: {
        key: 'authResetPassword',
        name: 'Auth – reset password',
        description: 'Reset form with hero progress indicator.',
        palette: warmPalette,
        hero: makeHero(heroVariants.auth, {
            title: 'Reset password hero',
            description: 'Highlights step indicator and secure tone.',
            primary: 'flex flex-col gap-5 text-neutral-900',
            secondary: cn(heroVariants.auth.secondary ?? '', 'items-end justify-between bg-gradient-to-br from-[#151f54] via-[#1d3bb8] to-[#4dd5c8]'),
        }),
        sections: {
            form: makeSection(sectionVariants.standard, {
                title: 'Reset form',
                description: 'Two input fields with password strength hints and submit CTA.',
                wrapper: 'mx-auto max-w-md space-y-6',
                primary: 'space-y-6',
                surfaces: {
                    card: cn(surfaceTokens.soft, 'px-6 py-6 shadow-lg'),
                },
            }),
        },
    },
    authVerifyEmail: {
        key: 'authVerifyEmail',
        name: 'Auth – verify email',
        description: 'Verification instructions with resend CTA inside auth shell.',
        palette: warmPalette,
        hero: makeHero(heroVariants.auth, {
            title: 'Verify email hero',
            description: 'Encouraging copy with status graphic on secondary panel.',
            primary: 'flex flex-col gap-5 text-neutral-900',
            secondary: cn(heroVariants.auth.secondary ?? '', 'items-end justify-between bg-gradient-to-br from-[#1d3bb8] via-[#4dd5c8] to-[#fca311]'),
        }),
        sections: {
            form: makeSection(sectionVariants.standard, {
                title: 'Verification instructions',
                description: 'Centered informative card with resend button and support link.',
                wrapper: 'mx-auto max-w-lg space-y-6 text-center',
                primary: 'space-y-5',
                surfaces: {
                    card: cn(surfaceTokens.soft, 'px-6 py-6 shadow-lg'),
                },
            }),
        },
    },
    authConfirmPassword: {
        key: 'authConfirmPassword',
        name: 'Auth – confirm password',
        description: 'Interlock step before sensitive actions.',
        palette: warmPalette,
        hero: makeHero(heroVariants.auth, {
            title: 'Confirm password hero',
            description: 'Concise messaging with lock icon accent.',
            primary: 'flex flex-col gap-5 text-neutral-900',
            secondary: cn(heroVariants.auth.secondary ?? '', 'items-end justify-between bg-gradient-to-br from-[#151f54] via-[#1d3bb8] to-[#fca311]'),
        }),
        sections: {
            form: makeSection(sectionVariants.standard, {
                title: 'Confirmation form',
                description: 'Single password field with security note and submit CTA.',
                wrapper: 'mx-auto max-w-md space-y-6',
                primary: 'space-y-5',
                surfaces: {
                    card: cn(surfaceTokens.soft, 'px-6 py-6 shadow-lg'),
                },
            }),
        },
    },
};

export function getPageLayout(key: PageKey): PageLayoutPreset {
    return pageLayouts[key];
}

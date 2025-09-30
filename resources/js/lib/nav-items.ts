import { useTranslator } from '@/hooks/use-translator';

export interface NavItem {
    key: string;
    label: string;
    href: string;
    children?: Array<{
        key: string;
        label: string;
        href: string;
        description?: string;
    }>;
}

export function useNavItems(): NavItem[] {
    const { t } = useTranslator('common');

    return [
        {
            key: 'about',
            label: t('nav.about', '簡介'),
            href: '/about',
            children: [
                {
                    key: 'introduction',
                    label: t('nav.introduction', '系所簡介'),
                    href: '/about/introduction',
                    description: t('nav.introduction_desc', '了解系所發展歷程與特色')
                },
                {
                    key: 'objectives',
                    label: t('nav.objectives', '教育目標'),
                    href: '/about/objectives',
                    description: t('nav.objectives_desc', '培育目標與核心能力')
                },
                {
                    key: 'regulations',
                    label: t('nav.regulations', '法規彙編'),
                    href: '/about/regulations',
                    description: t('nav.regulations_desc', '系所相關法規與辦法')
                },
                {
                    key: 'traffic',
                    label: t('nav.traffic', '交通資訊'),
                    href: '/about/traffic',
                    description: t('nav.traffic_desc', '校園位置與交通指引')
                },
                {
                    key: 'facilities',
                    label: t('nav.facilities', '設備介紹'),
                    href: '/about/facilities',
                    description: t('nav.facilities_desc', '教學與研究設備')
                },
                {
                    key: 'logo',
                    label: t('nav.logo', '系所 LOGO'),
                    href: '/about/logo',
                    description: t('nav.logo_desc', '系所標誌與識別系統')
                }
            ]
        },
        {
            key: 'members',
            label: t('nav.members', '系所成員'),
            href: '/members',
            children: [
                {
                    key: 'faculty',
                    label: t('nav.faculty', '師資陣容'),
                    href: '/members/faculty',
                    description: t('nav.faculty_desc', '專任與兼任教師介紹')
                },
                {
                    key: 'staff',
                    label: t('nav.staff', '行政人員'),
                    href: '/members/staff',
                    description: t('nav.staff_desc', '行政團隊與助理介紹')
                }
            ]
        },
        {
            key: 'research',
            label: t('nav.research', '學術研究'),
            href: '/research',
            children: [
                {
                    key: 'labs',
                    label: t('nav.labs', '實驗室'),
                    href: '/research/labs',
                    description: t('nav.labs_desc', '各研究領域實驗室')
                },
                {
                    key: 'projects',
                    label: t('nav.projects', '研究計畫'),
                    href: '/research/projects',
                    description: t('nav.projects_desc', '執行中的研究計畫')
                },
                {
                    key: 'publications',
                    label: t('nav.publications', '研究論文'),
                    href: '/research/publications',
                    description: t('nav.publications_desc', '期刊與會議論文發表')
                }
            ]
        },
        {
            key: 'courses',
            label: t('nav.courses', '課程修業'),
            href: '/courses',
            children: [
                {
                    key: 'undergraduate',
                    label: t('nav.undergraduate', '學士班'),
                    href: '/courses/undergraduate',
                    description: t('nav.undergraduate_desc', '大學部課程規劃與修業規定')
                },
                {
                    key: 'graduate',
                    label: t('nav.graduate', '碩士班'),
                    href: '/courses/graduate',
                    description: t('nav.graduate_desc', '研究所課程規劃與修業規定')
                },
                {
                    key: 'ai-master',
                    label: t('nav.ai_master', '人工智慧應用服務碩士在職專班'),
                    href: '/courses/ai-master',
                    description: t('nav.ai_master_desc', '在職專班課程與修業規定')
                },
                {
                    key: 'dual-degree',
                    label: t('nav.dual_degree', '雙聯學制'),
                    href: '/courses/dual-degree',
                    description: t('nav.dual_degree_desc', '雙聯學位課程與申請')
                }
            ]
        },
        {
            key: 'admission',
            label: t('nav.admission', '招生專區'),
            href: '/admission',
            children: [
                {
                    key: 'undergraduate-admission',
                    label: t('nav.undergraduate_admission', '學士班'),
                    href: '/admission/undergraduate',
                    description: t('nav.undergraduate_admission_desc', '大學部招生資訊')
                },
                {
                    key: 'graduate-admission',
                    label: t('nav.graduate_admission', '碩士班'),
                    href: '/admission/graduate',
                    description: t('nav.graduate_admission_desc', '研究所招生資訊')
                },
                {
                    key: 'ai-master-admission',
                    label: t('nav.ai_master_admission', '人工智慧應用服務在職碩士班'),
                    href: '/admission/ai-master',
                    description: t('nav.ai_master_admission_desc', '在職專班招生資訊')
                },
                {
                    key: 'pre-graduate',
                    label: t('nav.pre_graduate', '碩士先修生'),
                    href: '/admission/pre-graduate',
                    description: t('nav.pre_graduate_desc', '先修生申請資訊')
                }
            ]
        },
        {
            key: 'announcements',
            label: t('nav.announcements', '公告'),
            href: '/announcements',
            children: [
                {
                    key: 'all',
                    label: t('nav.all_announcements', '全部資訊'),
                    href: '/announcements',
                    description: t('nav.all_announcements_desc', '查看所有公告訊息')
                },
                {
                    key: 'general',
                    label: t('nav.general', '一般資訊'),
                    href: '/announcements?category=general',
                    description: t('nav.general_desc', '一般性公告與通知')
                },
                {
                    key: 'undergraduate-recruitment',
                    label: t('nav.undergraduate_recruitment', '大學部招生'),
                    href: '/announcements?category=undergraduate-recruitment',
                    description: t('nav.undergraduate_recruitment_desc', '大學部招生相關公告')
                },
                {
                    key: 'graduate-recruitment',
                    label: t('nav.graduate_recruitment', '研究所招生'),
                    href: '/announcements?category=graduate-recruitment',
                    description: t('nav.graduate_recruitment_desc', '研究所招生相關公告')
                },
                {
                    key: 'events',
                    label: t('nav.events', '演講及活動資訊'),
                    href: '/announcements?category=events',
                    description: t('nav.events_desc', '學術演講與活動資訊')
                },
                {
                    key: 'awards',
                    label: t('nav.awards', '獲獎資訊'),
                    href: '/announcements?category=awards',
                    description: t('nav.awards_desc', '師生獲獎與榮譽消息')
                },
                {
                    key: 'scholarships',
                    label: t('nav.scholarships', '獎助學金'),
                    href: '/announcements?category=scholarships',
                    description: t('nav.scholarships_desc', '獎學金與助學金資訊')
                },
                {
                    key: 'jobs',
                    label: t('nav.jobs', '徵人資訊'),
                    href: '/announcements?category=jobs',
                    description: t('nav.jobs_desc', '教職與工作機會')
                }
            ]
        },
        {
            key: 'contact',
            label: t('nav.contact', '聯絡我們'),
            href: '/contact',
        }
    ];
}

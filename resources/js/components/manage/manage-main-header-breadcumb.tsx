import { Breadcrumbs } from '@/components/breadcrumbs';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';

interface ManageMainHeaderBreadcrumbProps {
    breadcrumbs?: BreadcrumbItem[];
}

export default function ManageMainHeaderBreadcrumb({ breadcrumbs }: ManageMainHeaderBreadcrumbProps) {
    const { t } = useTranslator('manage');
    const resolvedBreadcrumbs = breadcrumbs?.length
        ? breadcrumbs
        : [
              {
                  title: t('layout.breadcrumbs.dashboard', '管理後台'),
                  href: '/manage/dashboard',
              },
          ];

    return (
        <div className="flex w-full flex-col gap-2">
            <Breadcrumbs breadcrumbs={resolvedBreadcrumbs} />
        </div>
    );
}

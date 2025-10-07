import ManageToolbar from '@/components/manage/manage-toolbar';
import StatusFilterTabs from '@/components/manage/status-filter-tabs';
import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/use-translator';
import { Link } from '@inertiajs/react';
import { FilePlus2 } from 'lucide-react';

import BulkActionsBar, { type BulkActionConfig, type BulkActionType } from './bulk-actions-bar';

export interface StatusToolbarOption {
    value: string;
    label: string;
    count?: number;
    icon?: React.ComponentType<{ className?: string }>;
}

export interface ManagePostsStatusToolbarProps {
    options: StatusToolbarOption[];
    value: string;
    onChange: (value: string) => void;
    canBulkUpdate: boolean;
    canCreate: boolean;
    selectedCount: number;
    bulkActions: BulkActionConfig[];
    onBulkAction: (action: BulkActionType) => void;
}

export default function ManagePostsStatusToolbar({
    options,
    value,
    onChange,
    canBulkUpdate,
    canCreate,
    selectedCount,
    bulkActions,
    onBulkAction,
}: ManagePostsStatusToolbarProps) {
    const { t } = useTranslator('manage');

    return (
        <ManageToolbar
            primary={<StatusFilterTabs options={options} value={value} onChange={onChange} />}
            secondary={
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    {canBulkUpdate ? (
                        <BulkActionsBar
                            actions={bulkActions}
                            selectedCount={selectedCount}
                            disabled={selectedCount === 0}
                            onAction={onBulkAction}
                        />
                    ) : null}
                    {canCreate ? (
                        <Button
                            size="sm"
                            variant="default"
                            className="h-10 gap-2 bg-primary-600 px-4 shadow-sm hover:bg-primary-700"
                            asChild
                        >
                            <Link href="/manage/admin/posts/create">
                                <FilePlus2 className="h-4 w-4" />
                                {t('sidebar.admin.posts_create', '新增公告')}
                            </Link>
                        </Button>
                    ) : null}
                </div>
            }
        />
    );
}

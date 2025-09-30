import type { ManageRole } from '@/components/manage/manage-brand';
import type { User } from '@/types';

const MANAGE_ROLE_PRIORITY: ManageRole[] = ['admin', 'teacher', 'user'];

const isManageRole = (role: unknown): role is ManageRole =>
    role === 'admin' || role === 'teacher' || role === 'user';

export function deriveManageRole(user?: User | null, override?: ManageRole | null): ManageRole {
    if (override && isManageRole(override)) {
        return override;
    }

    if (!user) {
        return 'user';
    }

    if (isManageRole(user.primary_role)) {
        return user.primary_role;
    }

    if (Array.isArray(user.roles)) {
        for (const candidate of MANAGE_ROLE_PRIORITY) {
            if (user.roles.includes(candidate)) {
                return candidate;
            }
        }
    }

    return 'user';
}

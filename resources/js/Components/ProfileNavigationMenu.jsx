import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

export default function ProfileNavigationMenu() {
    const { auth } = usePage().props;
    const user = auth.user;

    // 取得使用者的所有角色
    const userRoles = user.roles || [];
    const hasTeacherRole = userRoles.includes('teacher');
    const hasStaffRole = userRoles.includes('staff');
    const isAdmin = userRoles.includes('admin');

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex space-x-8">
                            {/* 個人檔案總覽 */}
                            <Link
                                href={route('profile.index')}
                                className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium text-gray-900 border-indigo-500"
                            >
                                個人檔案總覽
                            </Link>

                            {/* 教師檔案入口 */}
                            {hasTeacherRole && (
                                <Link
                                    href={route('profile.teacher')}
                                    className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent"
                                >
                                    教師檔案
                                </Link>
                            )}

                            {/* 職員檔案入口 */}
                            {hasStaffRole && (
                                <Link
                                    href={route('profile.staff')}
                                    className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent"
                                >
                                    職員檔案
                                </Link>
                            )}

                            {/* 管理員專用 */}
                            {isAdmin && (
                                <>
                                    <Link
                                        href={route('manage.people.index')}
                                        className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent"
                                    >
                                        師資管理
                                    </Link>
                                    <Link
                                        href={route('manage.dashboard')}
                                        className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent"
                                    >
                                        管理後台
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="text-sm text-gray-500">
                            角色：{userRoles.map(role => {
                                const roleNames = {
                                    'admin': '管理員',
                                    'teacher': '教師',
                                    'staff': '職員',
                                    'user': '一般會員'
                                };
                                return roleNames[role] || role;
                            }).join('、')}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { TeacherShowProps } from '@/types/staff';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, ExternalLink } from 'lucide-react';

export default function Show({ teacher, translations }: TeacherShowProps) {
    const locale = 'zh-TW'; // TODO: Get from app context

    const handleEdit = () => {
        router.visit(`/manage/teachers/${teacher.id}/edit`);
    };

    const handleDelete = () => {
        const displayName = teacher.name[locale] || teacher.name['zh-TW'] || '此教師';
        if (confirm(`確定要刪除教師 ${displayName} 嗎？`)) {
            router.delete(`/manage/teachers/${teacher.id}`);
        }
    };

    const getDisplayName = () => {
        return teacher.name[locale] || teacher.name['zh-TW'];
    };

    const getDisplayTitle = () => {
        return teacher.title[locale] || teacher.title['zh-TW'];
    };

    const getDisplayBio = () => {
        return teacher.bio?.[locale] || teacher.bio?.['zh-TW'] || '';
    };

    const getDisplaySpecialties = () => {
        return teacher.specialties?.map(specialty =>
            specialty[locale] || specialty['zh-TW']
        ).filter(Boolean) || [];
    };

    const getDisplayEducation = () => {
        return teacher.education?.map(edu =>
            edu[locale] || edu['zh-TW']
        ).filter(Boolean) || [];
    };

    return (
        <ManageLayout>
            <Head title={`教師資料 - ${getDisplayName()}`} />

            <div className="bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/manage/staff"
                                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    返回列表
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">
                                        教師資料
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        檢視教師詳細資訊
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <Button onClick={handleEdit} variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    編輯
                                </Button>
                                <Button onClick={handleDelete} variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    刪除
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* 左側：基本資訊 */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>基本資訊</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* 頭像 */}
                                    {teacher.avatar && (
                                        <div className="flex justify-center">
                                            <img
                                                src={teacher.avatar}
                                                alt={getDisplayName()}
                                                className="h-32 w-32 rounded-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* 姓名和職稱 */}
                                    <div className="text-center">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {getDisplayName()}
                                        </h2>
                                        <p className="text-lg text-gray-600">
                                            {getDisplayTitle()}
                                        </p>
                                    </div>

                                    {/* 聯絡資訊 */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-500">電子郵件</span>
                                            <span className="text-sm text-gray-900">{teacher.email}</span>
                                        </div>
                                        {teacher.phone && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">電話</span>
                                                <span className="text-sm text-gray-900">{teacher.phone}</span>
                                            </div>
                                        )}
                                        {teacher.office && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">辦公室</span>
                                                <span className="text-sm text-gray-900">{teacher.office}</span>
                                            </div>
                                        )}
                                        {teacher.website && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">個人網站</span>
                                                <a
                                                    href={teacher.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    網站連結
                                                    <ExternalLink className="ml-1 h-3 w-3" />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* 狀態資訊 */}
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <span className="text-sm font-medium text-gray-500">顯示狀態</span>
                                        <Badge variant={teacher.visible ? "default" : "secondary"}>
                                            {teacher.visible ? '顯示' : '隱藏'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">排序</span>
                                        <Badge variant="outline">{teacher.sort_order}</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 關聯資訊 */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>關聯資訊</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {teacher.user && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">使用者帳號</span>
                                            <div className="mt-1">
                                                <Badge variant="outline">
                                                    {teacher.user.name} ({teacher.user.email})
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    {teacher.lab && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">實驗室</span>
                                            <div className="mt-1">
                                                <Badge variant="outline">
                                                    {teacher.lab.name?.[locale] || teacher.lab.name?.['zh-TW'] || '未命名實驗室'}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* 右側：詳細資訊 */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 個人簡介 */}
                            {getDisplayBio() && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>個人簡介</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {getDisplayBio()}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* 專長領域 */}
                            {getDisplaySpecialties().length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>專長領域</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {getDisplaySpecialties().map((specialty, index) => (
                                                <Badge key={index} variant="outline" className="mr-2 mb-2">
                                                    {specialty}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* 學歷背景 */}
                            {getDisplayEducation().length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>學歷背景</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {getDisplayEducation().map((edu, index) => (
                                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-gray-700">{edu}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* 研究成果 */}
                            {(teacher.publications && teacher.publications.length > 0) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>發表論文</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {teacher.publications.map((publication, index) => (
                                                <div key={index} className="p-3 border rounded-lg">
                                                    <h4 className="font-medium text-gray-900">
                                                        {(publication as any).title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {(publication as any).journal} • {(publication as any).year}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* 研究計畫 */}
                            {(teacher.projects && teacher.projects.length > 0) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>研究計畫</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {teacher.projects.map((project, index) => (
                                                <div key={index} className="p-3 border rounded-lg">
                                                    <h4 className="font-medium text-gray-900">
                                                        {(project as any).title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {(project as any).period}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ManageLayout>
    );
}

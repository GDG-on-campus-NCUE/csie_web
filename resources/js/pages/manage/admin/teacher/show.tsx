import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Teacher } from '@/types/staff';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building2, Globe, User } from 'lucide-react';

interface Props {
    teacher: Teacher;
}

export default function Show({ teacher: teacherData }: Props) {
    const getDisplayName = (locale: 'zh-TW' | 'en' = 'zh-TW') => {
        return teacherData.name[locale] || teacherData.name['zh-TW'] || teacherData.name['en'];
    };

    const getDisplayTitle = (locale: 'zh-TW' | 'en' = 'zh-TW') => {
        return teacherData.title[locale] || teacherData.title['zh-TW'] || teacherData.title['en'];
    };

    const getDisplayBio = (locale: 'zh-TW' | 'en' = 'zh-TW') => {
        return teacherData.bio?.[locale] || '';
    };

    const getDisplaySpecialties = (locale: 'zh-TW' | 'en' = 'zh-TW') => {
        return teacherData.specialties?.map(s => s[locale]).filter(Boolean) || [];
    };

    const getDisplayEducation = (locale: 'zh-TW' | 'en' = 'zh-TW') => {
        return teacherData.education?.map(e => e[locale]).filter(Boolean) || [];
    };

    return (
        <ManageLayout>
            <Head title={`教師詳情 - ${getDisplayName()}`} />

            <div className="bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="sm:flex-auto">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/manage/staff"
                                    className="flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    返回列表
                                </Link>
                            </div>
                            <h1 className="mt-2 text-2xl font-semibold leading-6 text-gray-900">
                                教師詳情
                            </h1>
                            <p className="mt-2 text-sm text-gray-700">
                                查看 {getDisplayName()} 的詳細資料
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
                            <Link href={`/manage/teachers/${teacherData.id}/edit`}>
                                <Button variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    編輯
                                </Button>
                            </Link>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                刪除
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 主要資訊 */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>基本資訊</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center space-x-6">
                                        <div className="flex-shrink-0">
                                            {teacherData.avatar ? (
                                                <img
                                                    className="h-20 w-20 rounded-full object-cover"
                                                    src={teacherData.avatar}
                                                    alt={getDisplayName()}
                                                />
                                            ) : (
                                                <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-2xl font-medium text-gray-700">
                                                        {(getDisplayName() || 'T').charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {getDisplayName()}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {getDisplayName('en')}
                                            </p>
                                            <p className="text-lg text-gray-700 mt-2">
                                                {getDisplayTitle()}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {getDisplayTitle('en')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-6">
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">排序</dt>
                                                <dd className="mt-1">
                                                    <Badge variant="outline">{teacherData.sort_order}</Badge>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">狀態</dt>
                                                <dd className="mt-1">
                                                    <Badge variant={teacherData.visible ? "default" : "secondary"}>
                                                        {teacherData.visible ? '顯示' : '隱藏'}
                                                    </Badge>
                                                </dd>
                                            </div>
                                            {teacherData.user && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">關聯用戶</dt>
                                                    <dd className="mt-1 flex items-center text-sm text-gray-900">
                                                        <User className="h-4 w-4 mr-1 text-gray-400" />
                                                        {teacherData.user.name}
                                                    </dd>
                                                </div>
                                            )}
                                            {teacherData.lab && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">實驗室</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {teacherData.lab.name?.['zh-TW'] || teacherData.lab.name?.['en'] || '未命名實驗室'}
                                                    </dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 專長領域 */}
                            {getDisplaySpecialties().length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>專長領域</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">中文</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {getDisplaySpecialties('zh-TW').map((specialty, index) => (
                                                        <Badge key={index} variant="outline">
                                                            {specialty}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            {getDisplaySpecialties('en').length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2">English</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {getDisplaySpecialties('en').map((specialty, index) => (
                                                            <Badge key={index} variant="outline">
                                                                {specialty}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* 學歷 */}
                            {getDisplayEducation().length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>學歷背景</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">中文</h4>
                                                <ul className="space-y-1">
                                                    {getDisplayEducation('zh-TW').map((edu, index) => (
                                                        <li key={index} className="text-gray-900">
                                                            • {edu}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            {getDisplayEducation('en').length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2">English</h4>
                                                    <ul className="space-y-1">
                                                        {getDisplayEducation('en').map((edu, index) => (
                                                            <li key={index} className="text-gray-900">
                                                                • {edu}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* 個人簡介 */}
                            {(getDisplayBio() || getDisplayBio('en')) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>個人簡介</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {getDisplayBio() && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2">中文</h4>
                                                    <p className="text-gray-900 whitespace-pre-wrap">
                                                        {getDisplayBio()}
                                                    </p>
                                                </div>
                                            )}
                                            {getDisplayBio('en') && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2">English</h4>
                                                    <p className="text-gray-900 whitespace-pre-wrap">
                                                        {getDisplayBio('en')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* 側邊欄資訊 */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* 聯絡資訊 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>聯絡資訊</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">電子信箱</p>
                                            <a
                                                href={`mailto:${teacherData.email}`}
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                {teacherData.email}
                                            </a>
                                        </div>
                                    </div>

                                    {teacherData.phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">電話</p>
                                                <a
                                                    href={`tel:${teacherData.phone}`}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    {teacherData.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {teacherData.office && (
                                        <div className="flex items-center space-x-3">
                                            <Building2 className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">辦公室</p>
                                                <p className="text-gray-900">{teacherData.office}</p>
                                            </div>
                                        </div>
                                    )}

                                    {teacherData.website && (
                                        <div className="flex items-center space-x-3">
                                            <Globe className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">個人網站</p>
                                                <a
                                                    href={teacherData.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 break-all"
                                                >
                                                    {teacherData.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* 系統資訊 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>系統資訊</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">創建時間</p>
                                        <p className="text-sm text-gray-900">
                                            {teacherData.created_at ?
                                                new Date(teacherData.created_at).toLocaleDateString('zh-TW', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">更新時間</p>
                                        <p className="text-sm text-gray-900">
                                            {teacherData.updated_at ?
                                                new Date(teacherData.updated_at).toLocaleDateString('zh-TW', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ManageLayout>
    );
}

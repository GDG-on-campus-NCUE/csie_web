import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Staff } from '@/types/staff';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Mail, Phone } from 'lucide-react';

interface Props {
    staff: Staff;
}

export default function Show({ staff: staffData }: Props) {
    const getDisplayName = (locale: 'zh-TW' | 'en' = 'zh-TW') => {
        return locale === 'zh-TW' ? staffData.name : staffData.name_en;
    };

    const getDisplayPosition = (locale: 'zh-TW' | 'en' = 'zh-TW') => {
        return locale === 'zh-TW' ? staffData.position : staffData.position_en;
    };

    const getDisplayBio = (locale: 'zh-TW' | 'en' = 'zh-TW') => {
        return locale === 'zh-TW' ? staffData.bio : staffData.bio_en;
    };

    return (
        <ManageLayout>
            <Head title={`職員詳情 - ${getDisplayName()}`} />

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
                                職員詳情
                            </h1>
                            <p className="mt-2 text-sm text-gray-700">
                                查看 {getDisplayName()} 的詳細資料
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
                            <Link href={`/manage/staff/${staffData.id}/edit`}>
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
                                            {staffData.photo_url ? (
                                                <img
                                                    className="h-20 w-20 rounded-full object-cover"
                                                    src={`/storage/${staffData.photo_url}`}
                                                    alt={getDisplayName()}
                                                />
                                            ) : (
                                                <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-2xl font-medium text-gray-700">
                                                        {getDisplayName().charAt(0)}
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
                                                {getDisplayPosition()}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {getDisplayPosition('en')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-6">
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">排序</dt>
                                                <dd className="mt-1">
                                                    <Badge variant="outline">{staffData.sort_order}</Badge>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">狀態</dt>
                                                <dd className="mt-1">
                                                    <Badge variant={staffData.visible ? "default" : "secondary"}>
                                                        {staffData.visible ? '顯示' : '隱藏'}
                                                    </Badge>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">創建時間</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {staffData.created_at ?
                                                        new Date(staffData.created_at).toLocaleDateString('zh-TW', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })
                                                        : '-'
                                                    }
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">更新時間</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {staffData.updated_at ?
                                                        new Date(staffData.updated_at).toLocaleDateString('zh-TW', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })
                                                        : '-'
                                                    }
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </CardContent>
                            </Card>

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

                        {/* 聯絡資訊 */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>聯絡資訊</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {staffData.email && (
                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">電子信箱</p>
                                                <a
                                                    href={`mailto:${staffData.email}`}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    {staffData.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {staffData.phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">電話</p>
                                                <a
                                                    href={`tel:${staffData.phone}`}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    {staffData.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {!staffData.email && !staffData.phone && (
                                        <p className="text-sm text-gray-500">暫無聯絡資訊</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ManageLayout>
    );
}

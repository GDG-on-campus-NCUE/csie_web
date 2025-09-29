import { useState } from 'react';
import { Settings, Languages, Globe, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslator } from '@/hooks/use-translator';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

interface MobileFloatingSettingsProps {
    className?: string;
}

export default function MobileFloatingSettings({ 
    className = '' 
}: MobileFloatingSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    const { locale } = usePage<SharedData>().props as SharedData & { locale: string };
    const { t } = useTranslator('common');

    const isZh = locale?.toLowerCase() === 'zh-tw';
    const basePath = '/lang';
    const zhUrl = `${basePath}/zh-TW`;
    const enUrl = `${basePath}/en`;

    const handleLanguageChange = (newLocale: string) => {
        const url = newLocale === 'zh-TW' ? zhUrl : enUrl;
        window.location.href = url;
    };

    return (
        <>
            {/* 浮動按鈕 - 只在手機版顯示 */}
            <div className={cn("fixed bottom-6 right-6 z-50 md:hidden", className)}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30",
                        isOpen && "scale-105 shadow-xl"
                    )}
                    aria-label={t('settings.floating_button', '語言設置')}
                >
                    {isOpen ? (
                        <X className="h-6 w-6 transition-transform duration-300" />
                    ) : (
                        <Settings className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
                    )}
                    
                    {/* 語言指示器 */}
                    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600 ring-2 ring-blue-600">
                        {isZh ? '中' : 'EN'}
                    </div>
                </button>

                {/* 展開的設置面板 */}
                {isOpen && (
                    <>
                        {/* 背景遮罩 */}
                        <div 
                            className="fixed inset-0 -z-10 bg-black/20 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />
                        
                        {/* 設置面板 */}
                        <div className="absolute bottom-16 right-0 w-72 rounded-2xl border border-white/10 bg-white/95 p-4 shadow-2xl backdrop-blur-xl">
                            {/* 小三角形指示器 */}
                            <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 bg-white/95 border-r border-b border-white/10" />
                            
                            {/* 標題 */}
                            <div className="mb-4 flex items-center gap-2 border-b border-neutral-200 pb-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                    <Languages className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 text-sm">
                                        {t('settings.language.title', '語言設置')}
                                    </h3>
                                    <p className="text-xs text-neutral-600">
                                        {t('settings.language.description', '選擇您偏好的語言')}
                                    </p>
                                </div>
                            </div>
                            
                            {/* 語言選項 */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleLanguageChange('zh-TW')}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm font-medium transition-all',
                                        isZh 
                                            ? 'border-blue-200 bg-blue-50 text-blue-700' 
                                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                                    )}
                                >
                                    <Globe className="h-4 w-4 text-blue-600" />
                                    <div className="flex-1">
                                        <div className="font-semibold">繁體中文</div>
                                        <div className="text-xs text-neutral-500">Traditional Chinese</div>
                                    </div>
                                    {isZh && (
                                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => handleLanguageChange('en')}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm font-medium transition-all',
                                        !isZh 
                                            ? 'border-blue-200 bg-blue-50 text-blue-700' 
                                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                                    )}
                                >
                                    <Globe className="h-4 w-4 text-blue-600" />
                                    <div className="flex-1">
                                        <div className="font-semibold">English</div>
                                        <div className="text-xs text-neutral-500">English (US)</div>
                                    </div>
                                    {!isZh && (
                                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                                    )}
                                </button>
                            </div>

                            {/* 快速連結 */}
                            <div className="mt-4 border-t border-neutral-200 pt-3">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <a 
                                        href="#contact"
                                        className="flex items-center justify-center gap-1 rounded-lg bg-neutral-100 px-2 py-2 text-neutral-600 transition hover:bg-neutral-200"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        📧 {t('nav.contact', '聯絡')}
                                    </a>
                                    
                                    <a 
                                        href="/bulletins"
                                        className="flex items-center justify-center gap-1 rounded-lg bg-neutral-100 px-2 py-2 text-neutral-600 transition hover:bg-neutral-200"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        📢 {t('nav.bulletin', '公告')}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
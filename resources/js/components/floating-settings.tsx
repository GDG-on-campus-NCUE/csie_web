import { useEffect, useRef, useState } from 'react';
import { Settings, Languages, Moon, Sun, Monitor, Globe, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useTranslator } from '@/hooks/use-translator';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import AppearanceToggleTab from '@/components/appearance-tabs';

interface FloatingSettingsProps {
    className?: string;
    variant?: 'fixed' | 'draggable';
}

export default function FloatingSettings({ 
    className = '', 
    variant = 'draggable' 
}: FloatingSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 100 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dragStart = useRef({ x: 0, y: 0 });
    
    const { locale } = usePage<SharedData>().props as SharedData & { locale: string };
    const { t } = useTranslator('common');

    const isZh = locale?.toLowerCase() === 'zh-tw';
    const basePath = '/lang';
    const zhUrl = `${basePath}/zh-TW`;
    const enUrl = `${basePath}/en`;

    const handleMouseDown = (e: React.MouseEvent) => {
        if (variant !== 'draggable') return;
        
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        
        const newX = e.clientX - dragStart.current.x;
        const newY = e.clientY - dragStart.current.y;
        
        // 限制在視窗範圍內
        const maxX = window.innerWidth - 56; // 按鈕寬度
        const maxY = window.innerHeight - 56; // 按鈕高度
        
        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleClick = (e: React.MouseEvent) => {
        // 避免在拖動時觸發點擊事件
        if (isDragging) {
            e.preventDefault();
            return;
        }
        setIsOpen(true);
    };

    const handleLanguageChange = (newLocale: string) => {
        const url = newLocale === 'zh-TW' ? zhUrl : enUrl;
        window.location.href = url;
    };

    // 清理事件監聽器
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const buttonStyle = variant === 'draggable' ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
    } : {};

    return (
        <>
            {/* 浮動設置按鈕 */}
            <button
                ref={buttonRef}
                onMouseDown={handleMouseDown}
                onClick={handleClick}
                style={buttonStyle}
                className={cn(
                    'group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/30',
                    variant === 'draggable' && 'fixed z-50 cursor-grab active:cursor-grabbing',
                    variant === 'fixed' && 'relative',
                    isDragging && 'scale-110 shadow-2xl',
                    className
                )}
                aria-label={t('settings.floating_button', '設置')}
            >
                <Settings 
                    className={cn(
                        'h-6 w-6 transition-transform duration-300',
                        isDragging ? 'rotate-45' : 'group-hover:rotate-90'
                    )} 
                />
                
                {/* 小指示點 */}
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-orange-400 ring-2 ring-white" />
            </button>

            {/* 設置面板 */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent 
                    side="bottom" 
                    className="mx-auto max-w-md rounded-t-3xl border-none bg-white/95 p-0 shadow-2xl backdrop-blur-xl"
                >
                    <SheetHeader className="border-b border-neutral-200 px-6 pb-4 pt-6">
                        <div className="mx-auto h-1 w-12 rounded-full bg-neutral-300" />
                        <SheetTitle className="text-center text-xl font-semibold text-neutral-900">
                            <div className="flex items-center justify-center gap-2">
                                <Settings className="h-5 w-5" />
                                {t('settings.title', '網站設置')}
                            </div>
                        </SheetTitle>
                    </SheetHeader>
                    
                    <div className="p-6 space-y-8">
                        {/* 語言設置 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                    <Languages className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900">
                                        {t('settings.language.title', '語言設置')}
                                    </h3>
                                    <p className="text-sm text-neutral-600">
                                        {t('settings.language.description', '選擇您偏好的語言')}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleLanguageChange('zh-TW')}
                                    className={cn(
                                        'flex items-center justify-center gap-2 rounded-xl border-2 bg-white px-4 py-3 text-sm font-semibold transition-all',
                                        isZh 
                                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                                    )}
                                >
                                    <Globe className="h-4 w-4" />
                                    繁體中文
                                </button>
                                
                                <button
                                    onClick={() => handleLanguageChange('en')}
                                    className={cn(
                                        'flex items-center justify-center gap-2 rounded-xl border-2 bg-white px-4 py-3 text-sm font-semibold transition-all',
                                        !isZh 
                                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                                    )}
                                >
                                    <Globe className="h-4 w-4" />
                                    English
                                </button>
                            </div>
                        </div>

                        {/* 外觀設置 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                                    <Palette className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900">
                                        {t('settings.appearance.title', '外觀主題')}
                                    </h3>
                                    <p className="text-sm text-neutral-600">
                                        {t('settings.appearance.description', '選擇明亮或暗色主題')}
                                    </p>
                                </div>
                            </div>
                            
                            <AppearanceToggleTab className="mx-auto" />
                        </div>

                        {/* 其他設置選項 */}
                        <div className="space-y-3 border-t border-neutral-200 pt-6">
                            <h4 className="text-sm font-semibold text-neutral-700">
                                {t('settings.quick_actions', '快速操作')}
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <a 
                                    href="#contact"
                                    className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-neutral-700 transition hover:bg-neutral-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    📧 {t('nav.contact', '聯絡我們')}
                                </a>
                                
                                <a 
                                    href="/bulletins"
                                    className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-neutral-700 transition hover:bg-neutral-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    📢 {t('nav.bulletin', '最新公告')}
                                </a>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
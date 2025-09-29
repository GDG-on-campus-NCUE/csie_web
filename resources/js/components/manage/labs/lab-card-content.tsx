import { CardContent } from '@/components/ui/card';
import { ExternalLink, Globe2, Mail, Phone } from 'lucide-react';
import { LabListItem } from './types';

interface LabCardContentProps {
    lab: LabListItem;
}

export function LabCardContent({ lab }: LabCardContentProps) {
    return (
        <CardContent className="flex-1 space-y-4 text-sm text-slate-700">
            {lab.description && (
                <p className="line-clamp-3 text-xs text-slate-500">{lab.description}</p>
            )}

            <div className="space-y-2 text-xs text-slate-500">
                {lab.website_url && (
                    <a
                        href={lab.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                        <Globe2 className="h-4 w-4" /> 官方網站
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )}
                {lab.email && (
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{lab.email}</span>
                    </div>
                )}
                {lab.phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{lab.phone}</span>
                    </div>
                )}
                {!lab.email && !lab.phone && !lab.website_url && (
                    <span className="text-slate-400">尚未提供聯絡資訊</span>
                )}
            </div>
        </CardContent>
    );
}

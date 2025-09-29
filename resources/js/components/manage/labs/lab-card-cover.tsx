import { Badge } from '@/components/ui/badge';
import { LabListItem } from './types';
import { fallbackInitials } from './utils';

interface LabCardCoverProps {
    lab: LabListItem;
}

export function LabCardCover({ lab }: LabCardCoverProps) {
    return (
        <div className="relative h-36 w-full overflow-hidden rounded-t-xl bg-slate-100">
            {lab.cover_image_url ? (
                <img
                    src={lab.cover_image_url}
                    alt={lab.name}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-400">
                    {fallbackInitials(lab.name)}
                </div>
            )}
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {lab.tags.map((tag) => (
                    <Badge
                        key={tag}
                        variant="outline"
                        className="rounded-full bg-white/90 px-3 py-1 text-xs"
                    >
                        #{tag}
                    </Badge>
                ))}
            </div>
        </div>
    );
}

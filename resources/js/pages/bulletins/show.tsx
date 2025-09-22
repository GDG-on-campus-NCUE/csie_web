import PublicLayout from '@/layouts/public-layout';
import useScrollReveal from '@/hooks/use-scroll-reveal';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, FileText, Image as ImageIcon, LinkIcon, Share2 } from 'lucide-react';

interface BulletinAttachment {
    id: number;
    type: 'image' | 'document' | 'link';
    title?: string | null;
    filename?: string | null;
    download_url?: string | null;
    external_url?: string | null;
    mime_type?: string | null;
    size?: number | null;
}

interface BulletinPost {
    id: number;
    slug: string;
    title: string;
    title_en?: string;
    summary?: string | null;
    summary_en?: string | null;
    content?: string | null;
    content_en?: string | null;
    publish_at?: string | null;
    cover_image_url?: string | null;
    source_type?: string | null;
    source_url?: string | null;
    category?: {
        name: string;
        name_en: string;
        slug: string;
    } | null;
    attachments?: BulletinAttachment[];
}

interface BulletinShowProps {
    post: BulletinPost;
}

function formatFileSize(size?: number | null): string {
    if (!size || size <= 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
        value /= 1024;
        index += 1;
    }
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

export default function BulletinShow({ post }: BulletinShowProps) {
    const page = usePage<SharedData>();
    const locale = page.props.locale ?? 'zh-TW';
    const isZh = locale.toLowerCase() === 'zh-tw';

    const title = isZh ? post.title : post.title_en ?? post.title;
    const summary = isZh ? post.summary ?? '' : post.summary_en ?? post.summary ?? '';
    const content = isZh ? post.content ?? '' : post.content_en ?? post.content ?? '';
    const publishDate = post.publish_at ? new Date(post.publish_at) : null;
    const categoryLabel = post.category ? (isZh ? post.category.name : post.category.name_en) : undefined;

    const attachments = post.attachments ?? [];
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const heroRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
    const contentRef = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
    const sidebarRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title, text: summary, url: shareUrl });
            } catch (error) {
                console.debug('Share cancelled', error);
            }
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(shareUrl);
            alert(isZh ? '連結已複製到剪貼簿。' : 'Link copied to clipboard.');
        }
    };

    return (
        <PublicLayout>
            <Head title={title} />

            <section className="relative isolate overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={post.cover_image_url ?? '/images/banner/banner3.png'}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/60" />
                </div>
                <div className="relative z-10 section-padding" ref={heroRef}>
                    <div className="content-container flex flex-col gap-6 text-white">
                        <Link
                            href="/bulletins"
                            className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.35em] text-white transition hover:bg-white/20"
                        >
                            <ArrowLeft className="size-4" />
                            {isZh ? '返回公告列表' : 'Back to bulletins'}
                        </Link>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70">
                                {categoryLabel && (
                                    <span className="inline-flex items-center rounded-full bg-secondary/20 px-3 py-1 text-[11px] font-semibold text-white">
                                        {categoryLabel}
                                    </span>
                                )}
                                {publishDate && (
                                    <time dateTime={publishDate.toISOString()}>
                                        {new Intl.DateTimeFormat(isZh ? 'zh-TW' : 'en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        }).format(publishDate)}
                                    </time>
                                )}
                            </div>
                            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{title}</h1>
                            {summary && <p className="max-w-3xl text-sm text-white/80 md:text-base">{summary}</p>}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 transition hover:bg-white/20"
                                >
                                    <Share2 className="size-4" />
                                    {isZh ? '分享' : 'Share'}
                                </button>
                                {post.source_type === 'link' && post.source_url && (
                                    <a
                                        href={post.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 transition hover:bg-white/20"
                                    >
                                        <LinkIcon className="size-4" />
                                        {isZh ? '原始連結' : 'Original link'}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-padding">
                <div className="content-container grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
                    <article
                        ref={contentRef}
                        className="prose prose-neutral max-w-none rounded-3xl bg-surface-soft p-8 shadow-xl lg:p-10"
                    >
                        {content ? (
                            <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
                        ) : (
                            <p className="text-neutral-500">
                                {isZh ? '此公告目前尚無詳細內容。' : 'This bulletin currently has no additional content.'}
                            </p>
                        )}
                    </article>

                    <aside ref={sidebarRef} className="space-y-6">
                        {attachments.length > 0 && (
                            <div className="rounded-3xl border border-neutral-200 bg-surface-soft p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-neutral-900">{isZh ? '附件下載' : 'Attachments'}</h2>
                                <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                                    {attachments.map((attachment) => {
                                        const isLink = attachment.type === 'link';
                                        const href = attachment.download_url ?? attachment.external_url ?? '#';
                                        const icon =
                                            attachment.type === 'image'
                                                ? <ImageIcon className="size-4" />
                                                : attachment.type === 'document'
                                                ? <FileText className="size-4" />
                                                : <LinkIcon className="size-4" />;
                                        const displayName = attachment.title ?? attachment.filename ?? (isZh ? '下載檔案' : 'Download attachment');
                                        return (
                                            <li key={attachment.id}>
                                                <a
                                                    href={href}
                                                    target={isLink ? '_blank' : '_self'}
                                                    rel={isLink ? 'noopener noreferrer' : undefined}
                                                    className="group flex items-center justify-between gap-3 rounded-2xl px-3 py-2 transition hover:bg-primary/5 hover:text-primary"
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <span className="rounded-full bg-primary/10 p-2 text-primary">{icon}</span>
                                                        <span className="font-medium">{displayName}</span>
                                                    </span>
                                                    <span className="text-xs text-neutral-400">
                                                        {formatFileSize(attachment.size)}
                                                    </span>
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        <div className="rounded-3xl border border-neutral-200 bg-surface-soft p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-neutral-900">{isZh ? '相關公告' : 'More announcements'}</h2>
                            <p className="mt-2 text-sm text-neutral-500">
                                {isZh
                                    ? '返回公告列表或繼續瀏覽更多系所最新消息。'
                                    : 'Go back to the bulletin list or continue exploring recent updates.'}
                            </p>
                            <Link
                                href="/bulletins"
                                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                            >
                                {isZh ? '返回公告列表' : 'Back to bulletins'}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>
        </PublicLayout>
    );
}

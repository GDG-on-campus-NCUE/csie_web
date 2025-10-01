import { Link } from '@inertiajs/react';

export default function PublicFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-neutral-200 bg-white/90">
            <div className="container mx-auto grid gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold tracking-wide text-neutral-900">國立彰化師範大學 資訊工程學系</h3>
                    <p className="text-sm text-neutral-600">
                        500 台中市進德路 1 號 · +886-4-7232105
                    </p>
                    <p className="text-xs text-neutral-500">&copy; {currentYear} CSIE NCUE. All rights reserved.</p>
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-neutral-900">快速連結</h4>
                    <ul className="space-y-1 text-sm text-neutral-600">
                        <li>
                            <Link className="transition-colors hover:text-blue-600" href="/about">
                                系所簡介
                            </Link>
                        </li>
                        <li>
                            <Link className="transition-colors hover:text-blue-600" href="/news">
                                最新公告
                            </Link>
                        </li>
                        <li>
                            <Link className="transition-colors hover:text-blue-600" href="/admission">
                                招生資訊
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-neutral-900">聯絡我們</h4>
                    <ul className="space-y-1 text-sm text-neutral-600">
                        <li>
                            <Link className="transition-colors hover:text-blue-600" href="mailto:csie@ncue.edu.tw">
                                csie@ncue.edu.tw
                            </Link>
                        </li>
                        <li>
                            <Link className="transition-colors hover:text-blue-600" href="/contact">
                                連絡表單
                            </Link>
                        </li>
                        <li>
                            <Link className="transition-colors hover:text-blue-600" href="/support">
                                技術支援
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-neutral-900">社群媒體</h4>
                    <ul className="space-y-1 text-sm text-neutral-600">
                        <li>
                            <Link className="transition-colors hover:text-blue-600" href="https://www.facebook.com/ncuecsie">
                                Facebook
                            </Link>
                        </li>
                        <li>
                            <Link className="transition-colors hover:text-blue-600" href="https://www.instagram.com/ncuecsie">
                                Instagram
                            </Link>
                        </li>
                        <li>
                            <Link className="transition-colors hover:text-blue-600" href="/subscribe">
                                訂閱電子報
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}

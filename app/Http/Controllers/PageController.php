<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\App;

class PageController extends Controller
{
    public function home(Request $request)
    {
        return Inertia::render('Welcome',[
            'lang' => App::currentLocale(),
        ]);
    }
    public function setLang(Request $request, $locale)
    {
        $supportedLocales = ['en', 'zh-TW'];

        if (! in_array($locale, $supportedLocales, true)) {
            return redirect()->back(fallback: route('home'));
        }

        // 儲存語言設定到 session
        $request->session()->put('locale', $locale);
        App::setLocale($locale);

        // 確保 session 立即寫入
        $request->session()->save();

        if ($request->expectsJson()) {
            return response()->json(['locale' => $locale]);
        }

        // 獲取來源 URL，如果沒有則重定向到首頁
        $fallbackUrl = $request->header('referer') ?: route('home');

        return redirect($fallbackUrl);
    }
}

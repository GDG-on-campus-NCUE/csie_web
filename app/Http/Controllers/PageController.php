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
        if (in_array($locale, ['en', 'zh-TW'])) {
            App::setLocale($locale);
        }
        return redirect()->back();
    }
}

<?php

namespace App\Support;

use App\Models\Tag;
use Illuminate\Support\Str;

class TagRegistrar
{
    /**
     * 將輸入標籤同步到指定情境的 tags 資料表，避免重複建立。
     */
    public static function register(array $tags, array $contexts): void
    {
        if (empty($tags) || empty($contexts) || ! Tag::tableExists()) {
            return;
        }

        $normalized = collect($tags)
            ->map(fn ($value) => trim((string) $value))
            ->filter(fn ($value) => $value !== '')
            ->unique()
            ->values();

        if ($normalized->isEmpty()) {
            return;
        }

        foreach ($contexts as $context) {
            static::registerForContext($normalized, $context);
        }
    }

    /**
     * 針對單一情境處理標籤建立邏輯。
     */
    protected static function registerForContext($normalized, string $context): void
    {
        $existing = Tag::query()
            ->where('context', $context)
            ->get(['name', 'slug']);

        $existingByName = [];
        $existingSlugs = [];

        foreach ($existing as $tag) {
            $existingByName[mb_strtolower($tag->name)] = $tag->slug;
            $existingSlugs[strtolower($tag->slug)] = $tag->slug;
        }

        foreach ($normalized as $name) {
            $lower = mb_strtolower($name);
            if (isset($existingByName[$lower])) {
                continue;
            }

            $slug = static::generateUniqueSlug($name, $context, $existingSlugs);

            Tag::create([
                'context' => $context,
                'name' => $name,
                'slug' => $slug,
                'description' => null,
                'sort_order' => 0,
            ]);

            $existingByName[$lower] = $slug;
        }
    }

    /**
     * 依據名稱產生在該情境下唯一的 slug。
     */
    protected static function generateUniqueSlug(string $name, string $context, array &$existingSlugs): string
    {
        $base = Str::slug($name);
        if ($base === '') {
            $base = Str::slug(Str::random(8));
        }

        $candidate = $base;
        $suffix = 1;

        while (isset($existingSlugs[strtolower($candidate)])) {
            $candidate = $base . '-' . $suffix;
            $suffix++;
        }

        $existingSlugs[strtolower($candidate)] = $candidate;

        return $candidate;
    }
}
